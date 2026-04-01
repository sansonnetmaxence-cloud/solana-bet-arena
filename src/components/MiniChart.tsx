import { useEffect, useRef } from 'react';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const MiniChart = ({ data, width = 240, height = 90 }: MiniChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const pulseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padL = 0;
    const padR = 12;
    const padT = 8;
    const padB = 2;
    const chartH = height - padT - padB;
    const chartW = width - padL - padR;
    const stepX = chartW / (data.length - 1);

    const trendUp = data[data.length - 1] >= data[0];
    const green = { main: '#00ff84', dim: '#00cc6a', r: 0, g: 255, b: 132 };
    const red = { main: '#ff4444', dim: '#cc3333', r: 255, g: 68, b: 68 };
    const c = trendUp ? green : red;

    const points = data.map((val, i) => ({
      x: padL + i * stepX,
      y: padT + chartH - ((val - min) / range) * chartH,
    }));

    const drawCurve = (pts: { x: number; y: number }[]) => {
      if (pts.length < 2) return;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];
        const t = 0.35;
        ctx.bezierCurveTo(
          p1.x + (p2.x - p0.x) * t, p1.y + (p2.y - p0.y) * t,
          p2.x - (p3.x - p1.x) * t, p2.y - (p3.y - p1.y) * t,
          p2.x, p2.y
        );
      }
    };

    const render = () => {
      pulseRef.current += 0.04;
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Area fill
      const grad = ctx.createLinearGradient(0, padT, 0, height);
      grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},0.18)`);
      grad.addColorStop(0.6, `rgba(${c.r},${c.g},${c.b},0.04)`);
      grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);

      ctx.beginPath();
      ctx.moveTo(points[0].x, height);
      ctx.lineTo(points[0].x, points[0].y);
      drawCurve(points);
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Glow line
      ctx.beginPath();
      drawCurve(points);
      ctx.strokeStyle = c.main;
      ctx.lineWidth = 3;
      ctx.shadowColor = c.main;
      ctx.shadowBlur = 12;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // Main line
      ctx.beginPath();
      drawCurve(points);
      const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
      lineGrad.addColorStop(0, c.dim + '80');
      lineGrad.addColorStop(0.5, c.main);
      lineGrad.addColorStop(1, c.main);
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // End dot with pulse
      const last = points[points.length - 1];
      const pr = 3 + Math.sin(pulseRef.current) * 1.5;

      // Pulse ring
      ctx.beginPath();
      ctx.arc(last.x, last.y, pr + 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},0.08)`;
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(last.x, last.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = c.main;
      ctx.shadowColor = c.main;
      ctx.shadowBlur = 8;
      ctx.fill();

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center opacity-40" style={{ width: '100%', height }}>
        <span className="text-[10px] text-muted-foreground font-display tracking-widest uppercase">Loading chart...</span>
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
