import { useEffect, useRef, useState } from 'react';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const MiniChart = ({ data, width = 240, height = 90 }: MiniChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [pulse, setPulse] = useState(0);

  // Animate pulse for the end dot
  useEffect(() => {
    let frame: number;
    const tick = () => {
      setPulse(p => (p + 0.03) % (Math.PI * 2));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 4;
    const chartH = height - padding * 2;
    const chartW = width - padding * 2;
    const stepX = chartW / (data.length - 1);

    const isUp = data[data.length - 1] >= data[data.length - 2];
    const trendUp = data[data.length - 1] >= data[0];
    
    // Use primary green (hsl 160 100% 51% → #00ff84) vs danger red
    const colorMain = trendUp ? '#00ff84' : '#ff4466';
    const colorDim = trendUp ? '#00cc6a' : '#cc3355';

    // Points with cubic bezier
    const points = data.map((val, i) => ({
      x: padding + i * stepX,
      y: padding + chartH - ((val - min) / range) * chartH,
    }));

    // Catmull-Rom to cubic bezier for ultra smooth curves
    const drawSmoothCurve = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return;
      ctx.moveTo(pts[0].x, pts[0].y);
      
      if (pts.length === 2) {
        ctx.lineTo(pts[1].x, pts[1].y);
        return;
      }

      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];

        const tension = 0.3;
        const cp1x = p1.x + (p2.x - p0.x) * tension;
        const cp1y = p1.y + (p2.y - p0.y) * tension;
        const cp2x = p2.x - (p3.x - p1.x) * tension;
        const cp2y = p2.y - (p3.y - p1.y) * tension;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
      }
    };

    // Multi-stop gradient fill — fills to bottom
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (trendUp) {
      gradient.addColorStop(0, 'rgba(0,255,132,0.35)');
      gradient.addColorStop(0.4, 'rgba(0,255,132,0.12)');
      gradient.addColorStop(0.8, 'rgba(0,255,132,0.03)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
    } else {
      gradient.addColorStop(0, 'rgba(255,68,102,0.35)');
      gradient.addColorStop(0.4, 'rgba(255,68,102,0.12)');
      gradient.addColorStop(0.8, 'rgba(255,68,102,0.03)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
    }

    // Fill area under curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    ctx.lineTo(points[0].x, points[0].y);
    drawSmoothCurve(points);
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Outer glow lines (3 layers for depth)
    const glowLayers: [number, number, number][] = [
      [30, 0.08, 12],
      [18, 0.15, 6],
      [10, 0.3, 3.5],
    ];
    for (const [blur, alpha, w] of glowLayers) {
      ctx.beginPath();
      drawSmoothCurve(points);
      ctx.strokeStyle = colorMain;
      ctx.lineWidth = w;
      ctx.shadowColor = colorMain;
      ctx.shadowBlur = blur;
      ctx.globalAlpha = alpha;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Main crisp line with horizontal gradient
    ctx.beginPath();
    drawSmoothCurve(points);
    const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
    lineGrad.addColorStop(0, colorDim);
    lineGrad.addColorStop(0.7, colorMain);
    lineGrad.addColorStop(1, colorMain);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.shadowColor = colorMain;
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Pulsing end dot
    const last = points[points.length - 1];
    const pulseRadius = 4 + Math.sin(pulse) * 2;
    
    // Outer pulse ring
    ctx.beginPath();
    ctx.arc(last.x, last.y, pulseRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = trendUp ? 'rgba(0,255,132,0.1)' : 'rgba(255,68,102,0.1)';
    ctx.fill();

    // Middle ring
    ctx.beginPath();
    ctx.arc(last.x, last.y, pulseRadius + 1, 0, Math.PI * 2);
    ctx.fillStyle = trendUp ? 'rgba(0,255,132,0.2)' : 'rgba(255,68,102,0.2)';
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = colorMain;
    ctx.shadowColor = colorMain;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Subtle horizontal grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 4; i++) {
      const y = padding + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

  }, [data, width, height, pulse]);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <span className="text-[9px] text-muted-foreground font-display animate-pulse-glow">Collecting data...</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height }}
      className="block"
    />
  );
};

export default MiniChart;
