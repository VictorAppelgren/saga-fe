<script lang="ts">
  import { onMount } from 'svelte';
  import { CASHFLOW_24M, formatCurrency } from './FinancialData';

  let canvas: HTMLCanvasElement;
  let hoveredIndex: number | null = null;

  // Calculate ARR from MRR (MRR × 12)
  const arrData = CASHFLOW_24M.mrr.map(mrr => mrr * 12);
  const maxARR = Math.max(...arrData);

  function getY(value: number, height: number): number {
    const padding = 60;
    const graphHeight = height - padding * 2;
    return padding + graphHeight * (1 - value / (maxARR * 1.1));
  }

  function getX(index: number, width: number): number {
    const padding = 60;
    const graphWidth = width - padding * 2;
    return padding + (index / (arrData.length - 1)) * graphWidth;
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    // Clear
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - padding * 2) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (maxARR * 1.1 / 5) * (5 - i);
      const y = padding + ((height - padding * 2) / 5) * i;
      ctx.fillText(formatCurrency(value, true), padding - 10, y + 4);
    }

    // Draw X-axis labels (every 3 months)
    ctx.textAlign = 'center';
    for (let i = 0; i < arrData.length; i += 3) {
      const x = getX(i, width);
      ctx.fillText(CASHFLOW_24M.months[i], x, height - padding + 20);
    }
    ctx.fillText('M24', getX(23, width), height - padding + 20);

    // Draw gradient fill under line
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.02)');

    ctx.beginPath();
    ctx.moveTo(getX(0, width), height - padding);
    arrData.forEach((value, i) => {
      ctx.lineTo(getX(i, width), getY(value, height));
    });
    ctx.lineTo(getX(arrData.length - 1, width), height - padding);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw the main line
    ctx.beginPath();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    arrData.forEach((value, i) => {
      if (i === 0) ctx.moveTo(getX(i, width), getY(value, height));
      else ctx.lineTo(getX(i, width), getY(value, height));
    });
    ctx.stroke();

    // Draw milestone markers (Q1, Q2, Q3, Q4)
    const milestoneMonths = [2, 5, 8, 11, 14, 17, 20, 23];
    ctx.fillStyle = '#6366f1';
    milestoneMonths.forEach(i => {
      const x = getX(i, width);
      const y = getY(arrData[i], height);
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f0f1a';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6366f1';
    });

    // Draw endpoint with glow
    const endX = getX(arrData.length - 1, width);
    const endY = getY(arrData[arrData.length - 1], height);

    // Glow effect
    const glowGradient = ctx.createRadialGradient(endX, endY, 0, endX, endY, 20);
    glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
    glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(endX, endY, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(endX, endY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(endX, endY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Final ARR label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(formatCurrency(arrData[arrData.length - 1], true), endX + 15, endY + 5);
  });
</script>

<div class="chart-container">
  <div class="chart-header">
    <h3>ARR Growth Trajectory</h3>
    <div class="chart-legend">
      <span class="legend-item"><span class="dot"></span> Annual Run Rate</span>
    </div>
  </div>
  <canvas bind:this={canvas} width="800" height="400"></canvas>
  <div class="chart-footer">
    <span class="target">Target: <strong>$8.6M ARR</strong> by Month 24</span>
    <span class="growth">59 customers @ $144K ACV</span>
  </div>
</div>

<style>
  .chart-container {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .chart-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .chart-legend {
    display: flex;
    gap: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #6366f1;
  }

  canvas {
    width: 100%;
    height: auto;
    border-radius: 12px;
  }

  .chart-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .target, .growth {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .target strong, .growth {
    color: rgba(255, 255, 255, 0.9);
  }
</style>
