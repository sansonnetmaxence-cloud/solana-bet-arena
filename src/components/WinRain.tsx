import { useEffect, useRef } from 'react';

interface WinRainProps {
  active: boolean;
}

const PARTICLE_COUNT = 60;

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  drift: number;
  phase: number;
}

const WinRain = ({ active }: WinRainProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const fadeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Init particles
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * -window.innerHeight,
        speed: 1.5 + Math.random() * 3,
        size: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    const render = (time: number) => {
      const targetFade = active ? 1 : 0;
      fadeRef.current += (targetFade - fadeRef.current) * 0.04;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (fadeRef.current < 0.01) {
        animRef.current = requestAnimationFrame(render);
        return;
      }

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speed;
        p.x += p.drift + Math.sin(time * 0.001 + p.phase) * 0.3;

        if (p.y > canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }

        const alpha = p.opacity * fadeRef.current;

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(160, 100%, 51%, ${alpha * 0.08})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(160, 100%, 51%, ${alpha})`;
        ctx.fill();

        // Trail
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.drift * 2, p.y - p.speed * 6);
        ctx.strokeStyle = `hsla(160, 100%, 51%, ${alpha * 0.2})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ opacity: 1 }}
    />
  );
};

export default WinRain;
