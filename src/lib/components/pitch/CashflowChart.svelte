<script lang="ts">
  import { onMount } from 'svelte';
  import { CASHFLOW_24M, formatCurrency } from './FinancialData';

  let canvas: HTMLCanvasElement;

  const revenueData = CASHFLOW_24M.mrr;
  const expenseData = CASHFLOW_24M.totalExpenses;
  const cashBalance = CASHFLOW_24M.cumulativeCash;

  const maxValue = Math.max(...revenueData, ...expenseData) * 1.2;
  const maxCash = Math.max(...cashBalance) * 1.1;

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    // Clear
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, width, height);

    // Helper functions
    function getY(value: number, maxVal: number): number {
      const graphHeight = height - padding * 2;
      return padding + graphHeight * (1 - value / maxVal);
    }

    function getX(index: number): number {
      const graphWidth = width - padding * 2;
      return padding + (index / (revenueData.length - 1)) * graphWidth;
    }

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + ((height - padding * 2) / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Y-axis labels (left - Revenue/Expenses)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue / 5) * (5 - i);
      const y = padding + ((height - padding * 2) / 5) * i;
      ctx.fillText(formatCurrency(value, true), padding - 10, y + 4);
    }

    // Y-axis labels (right - Cash Balance)
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
    for (let i = 0; i <= 5; i++) {
      const value = (maxCash / 5) * (5 - i);
      const y = padding + ((height - padding * 2) / 5) * i;
      ctx.fillText(formatCurrency(value, true), width - padding + 10, y + 4);
    }

    // X-axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    for (let i = 0; i < revenueData.length; i += 3) {
      ctx.fillText(CASHFLOW_24M.months[i], getX(i), height - padding + 20);
    }
    ctx.fillText('M24', getX(23), height - padding + 20);

    // Draw Cash Balance line (background, subtle)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    cashBalance.forEach((value, i) => {
      const y = getY(value, maxCash);
      if (i === 0) ctx.moveTo(getX(i), y);
      else ctx.lineTo(getX(i), y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Expenses area (red)
    const expenseGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    expenseGradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
    expenseGradient.addColorStop(1, 'rgba(239, 68, 68, 0.02)');

    ctx.beginPath();
    ctx.moveTo(getX(0), height - padding);
    expenseData.forEach((value, i) => {
      ctx.lineTo(getX(i), getY(value, maxValue));
    });
    ctx.lineTo(getX(expenseData.length - 1), height - padding);
    ctx.closePath();
    ctx.fillStyle = expenseGradient;
    ctx.fill();

    // Draw Expenses line
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    expenseData.forEach((value, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(value, maxValue));
      else ctx.lineTo(getX(i), getY(value, maxValue));
    });
    ctx.stroke();

    // Draw Revenue area (green)
    const revenueGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    revenueGradient.addColorStop(0, 'rgba(34, 197, 94, 0.4)');
    revenueGradient.addColorStop(1, 'rgba(34, 197, 94, 0.02)');

    ctx.beginPath();
    ctx.moveTo(getX(0), height - padding);
    revenueData.forEach((value, i) => {
      ctx.lineTo(getX(i), getY(value, maxValue));
    });
    ctx.lineTo(getX(revenueData.length - 1), height - padding);
    ctx.closePath();
    ctx.fillStyle = revenueGradient;
    ctx.fill();

    // Draw Revenue line
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    revenueData.forEach((value, i) => {
      if (i === 0) ctx.moveTo(getX(i), getY(value, maxValue));
      else ctx.lineTo(getX(i), getY(value, maxValue));
    });
    ctx.stroke();

    // Find and mark breakeven point (where revenue > expenses)
    const breakevenMonth = revenueData.findIndex((rev, i) => rev >= expenseData[i]);
    if (breakevenMonth > 0) {
      const x = getX(breakevenMonth);
      const y = getY(revenueData[breakevenMonth], maxValue);

      // Vertical line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BREAK-EVEN', x, padding - 20);
      ctx.fillText(`Month ${breakevenMonth + 1}`, x, padding - 5);

      // Circle
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e';
      ctx.fill();
    }
  });
</script>

<div class="chart-container">
  <div class="chart-header">
    <h3>Revenue vs. Expenses</h3>
    <div class="chart-legend">
      <span class="legend-item"><span class="dot revenue"></span> MRR</span>
      <span class="legend-item"><span class="dot expense"></span> Expenses</span>
      <span class="legend-item"><span class="line cash"></span> Cash Balance</span>
    </div>
  </div>
  <canvas bind:this={canvas} width="800" height="400"></canvas>
  <div class="chart-footer">
    <div class="stat">
      <span class="label">Break-even:</span>
      <span class="value green">Month 6-8</span>
    </div>
    <div class="stat">
      <span class="label">Cash at M24:</span>
      <span class="value">{formatCurrency(cashBalance[23], true)}</span>
    </div>
    <div class="stat">
      <span class="label">Total Revenue:</span>
      <span class="value green">{formatCurrency(revenueData.reduce((a, b) => a + b, 0), true)}</span>
    </div>
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
    flex-wrap: wrap;
    gap: 1rem;
  }

  .chart-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .chart-legend {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
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
  }

  .dot.revenue { background: #22c55e; }
  .dot.expense { background: #ef4444; }

  .line.cash {
    width: 20px;
    height: 2px;
    background: #8b5cf6;
    border-radius: 1px;
  }

  canvas {
    width: 100%;
    height: auto;
    border-radius: 12px;
  }

  .chart-footer {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
    gap: 1rem;
  }

  .stat {
    text-align: center;
  }

  .label {
    display: block;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .value.green {
    color: #22c55e;
  }
</style>
