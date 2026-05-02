import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{6,14}$/u, "invalid phone")
    .optional(),
  walletAddress: z.string().trim().min(20).max(80).optional(),
  source: z
    .enum(["auth_dialog", "wallet_connect", "newsletter", "footer"])
    .default("auth_dialog"),
  marketingConsent: z.boolean().default(true),
});

// Naive in-memory IP rate limiter (best-effort; resets on cold start)
const rateMap = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

const limited = (ip: string) => {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now - e.ts > WINDOW_MS) {
    rateMap.set(ip, { count: 1, ts: now });
    return false;
  }
  e.count += 1;
  return e.count > MAX_PER_WINDOW;
};

const hashIp = async (ip: string) => {
  const buf = new TextEncoder().encode(ip + "::lovable_salt");
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (limited(ip)) {
      return new Response(JSON.stringify({ error: "rate_limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "invalid_input", details: parsed.error.flatten() }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    const data = parsed.data;
    if (!data.email && !data.phone && !data.walletAddress) {
      return new Response(
        JSON.stringify({ error: "at_least_one_identifier_required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const ipHash = await hashIp(ip);
    const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 255);

    const { error } = await supabase.from("marketing_contacts").insert({
      email: data.email ?? null,
      phone: data.phone ?? null,
      wallet_address: data.walletAddress ?? null,
      source: data.source,
      marketing_consent: data.marketingConsent,
      ip_hash: ipHash,
      user_agent: userAgent,
    });

    // 23505 = unique violation: silently treat as already subscribed
    if (error && error.code !== "23505") {
      console.error("insert error", error.message);
      return new Response(JSON.stringify({ error: "db_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("unexpected", e instanceof Error ? e.message : "unknown");
    return new Response(JSON.stringify({ error: "unexpected" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
