import { useEffect, useRef } from 'react';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const MiniChart = ({ data, width = 240, height = 90 }: MiniChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const padding = 6;
    const chartH = height - padding * 2;
    const chartW = width - padding * 2;
    const stepX = chartW / (data.length - 1);

    const isUp = data[data.length - 1] >= data[0];
    const colorA = isUp ? '#00FF88' : '#FF4444';
    const colorB = isUp ? '#00CC66' : '#CC3333';

    // Multi-stop gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isUp ? 'rgba(0,255,136,0.4)' : 'rgba(255,68,68,0.4)');
    gradient.addColorStop(0.5, isUp ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    // Points
    const points = data.map((val, i) => ({
      x: padding + i * stepX,
      y: padding + chartH - ((val - min) / range) * chartH,
    }));

    // Smooth curve helper
    const drawSmoothLine = (pts: { x: number; y: number }[]) => {
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, cpx, (prev.y + curr.y) / 2);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
    };

    // Fill area
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    ctx.lineTo(points[0].x, points[0].y);
    drawSmoothLine(points);
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Glow line (thick, blurred)
    ctx.beginPath();
    drawSmoothLine(points);
    ctx.strokeStyle = colorA;
    ctx.lineWidth = 4;
    ctx.shadowColor = colorA;
    ctx.shadowBlur = 16;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Sharp line on top
    ctx.beginPath();
    drawSmoothLine(points);
    const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
    lineGrad.addColorStop(0, colorB);
    lineGrad.addColorStop(1, colorA);
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colorA;
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Pulsing dot at end
    const last = points[points.length - 1];
    // Outer glow
    ctx.beginPath();
    ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = isUp ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)';
    ctx.shadowBlur = 20;
    ctx.fill();
    // Inner dot
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = colorA;
    ctx.shadowBlur = 12;
    ctx.fill();

    // Grid lines (subtle)
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = padding + (chartH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

  }, [data, width, height]);

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
      style={{ width, height }}
      className="opacity-95"
    />
  );
};

export default MiniChart;
