import { useEffect, useRef } from 'react';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
}

const MiniChart = ({ data, width = 200, height = 60 }: MiniChartProps) => {
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
    const padding = 4;
    const chartH = height - padding * 2;
    const chartW = width - padding * 2;
    const stepX = chartW / (data.length - 1);

    const isUp = data[data.length - 1] >= data[0];
    const color = isUp ? '#00FF88' : '#FF4444';

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, isUp ? 'rgba(0,255,136,0.25)' : 'rgba(255,68,68,0.25)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    // Draw fill
    ctx.beginPath();
    ctx.moveTo(padding, height);
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = padding + chartH - ((val - min) / range) * chartH;
      if (i === 0) ctx.lineTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding + (data.length - 1) * stepX, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = padding + chartH - ((val - min) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.stroke();

    // Draw last point dot
    const lastX = padding + (data.length - 1) * stepX;
    const lastY = padding + chartH - ((data[data.length - 1] - min) / range) * chartH;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.shadowBlur = 12;
    ctx.fill();

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
      className="opacity-90"
    />
  );
};

export default MiniChart;
