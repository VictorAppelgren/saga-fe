<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { PageData, ActionData } from './$types';
  import { onMount } from 'svelte';
  import { CASHFLOW_DATA, RAISE_SCENARIOS, formatCurrency, formatPercent } from '$lib/components/pitch/FinancialData';

  export let data: PageData;
  export let form: ActionData;

  $: unlocked = data.unlocked;

  function handleSubmit() {
    return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
      if (result.type === 'success') {
        await invalidateAll();
      } else {
        await update();
      }
    };
  }

  // Simple SVG chart drawing
  let chartCanvas: HTMLCanvasElement;

  onMount(() => {
    if (chartCanvas && unlocked) {
      drawChart();
    }
  });

  function drawChart() {
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    const width = chartCanvas.width;
    const height = chartCanvas.height;
    const padding = 50;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Get data points
    const months = CASHFLOW_DATA.map(d => d.month);
    const revenues = CASHFLOW_DATA.map(d => d.revenue);
    const expenses = CASHFLOW_DATA.map(d => d.totalCosts);
    const cashPosition = CASHFLOW_DATA.map(d => d.cashPosition);

    // Find max values for scaling
    const maxVal = Math.max(...revenues, ...expenses, ...cashPosition);
    const minVal = Math.min(...cashPosition, 0);
    const range = maxVal - minVal;

    // Scale functions
    const scaleX = (i: number) => padding + (i / (months.length - 1)) * chartWidth;
    const scaleY = (val: number) => height - padding - ((val - minVal) / range) * chartHeight;

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw Cash Position line (blue)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = scaleX(i);
      const y = scaleY(cashPosition[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Revenue line (green)
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = scaleX(i);
      const y = scaleY(revenues[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Expenses line (red/orange)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = scaleX(i);
      const y = scaleY(expenses[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (every 6 months)
    for (let i = 0; i < months.length; i += 6) {
      ctx.fillText(`M${months[i]}`, scaleX(i), height - padding + 20);
    }
    ctx.fillText(`M${months[months.length - 1]}`, scaleX(months.length - 1), height - padding + 20);

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const val = minVal + (range * (5 - i)) / 5;
      ctx.fillText(formatCurrency(val, true), padding - 10, padding + (i / 5) * chartHeight + 4);
    }

    // Legend
    ctx.textAlign = 'left';
    const legendY = 20;

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(padding, legendY - 8, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Cash Position', padding + 25, legendY);

    ctx.fillStyle = '#16a34a';
    ctx.fillRect(padding + 130, legendY - 8, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Revenue', padding + 155, legendY);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(padding + 230, legendY - 8, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Expenses', padding + 255, legendY);
  }

  $: if (unlocked && chartCanvas) {
    drawChart();
  }
</script>

<svelte:head>
  <title>Saga - Investor Materials</title>
</svelte:head>

<div class="pitch-page" class:dark={$theme === 'dark'}>
  {#if unlocked}
    <div class="container">
      <!-- Header -->
      <header class="header">
        <a href="/" class="logo-link">
          <img src="/saga-logo.svg" alt="Saga" class="logo" />
        </a>
        <h1>Investor Materials</h1>
      </header>

      <!-- Download Section -->
      <section class="materials-section">
        <div class="materials-grid">
          <a href="/investor/saga_pitch_deck.pdf" target="_blank" class="material-card">
            <div class="material-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <div class="material-info">
              <h3>Pitch Deck</h3>
              <p>View PDF</p>
            </div>
          </a>

          <a href="/investor/saga_budget.xlsx" download class="material-card">
            <div class="material-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="3" y1="15" x2="21" y2="15"/>
                <line x1="9" y1="3" x2="9" y2="21"/>
                <line x1="15" y1="3" x2="15" y2="21"/>
              </svg>
            </div>
            <div class="material-info">
              <h3>Financial Model</h3>
              <p>Download Excel</p>
            </div>
          </a>
        </div>
      </section>

      <!-- PDF Preview -->
      <section class="pdf-section">
        <h2>Pitch Deck Preview</h2>
        <div class="pdf-viewer">
          <iframe
            src="/investor/saga_pitch_deck.pdf"
            title="Saga Pitch Deck"
          ></iframe>
        </div>
      </section>

      <!-- Financial Charts -->
      <section class="charts-section">
        <h2>24-Month Financial Projection</h2>
        <div class="chart-container">
          <canvas bind:this={chartCanvas} width="800" height="400"></canvas>
        </div>
      </section>

      <!-- Cashflow Table -->
      <section class="table-section">
        <h2>Monthly Cashflow Summary</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Costs</th>
                <th>Net</th>
                <th>Cash Position</th>
              </tr>
            </thead>
            <tbody>
              {#each CASHFLOW_DATA.filter((_, i) => i % 3 === 0) as row}
                <tr>
                  <td>M{row.month}</td>
                  <td class="revenue">{formatCurrency(row.revenue, true)}</td>
                  <td class="expense">{formatCurrency(row.totalCosts, true)}</td>
                  <td class:positive={row.revenue - row.totalCosts >= 0} class:negative={row.revenue - row.totalCosts < 0}>
                    {formatCurrency(row.revenue - row.totalCosts, true)}
                  </td>
                  <td class="cash">{formatCurrency(row.cashPosition, true)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>

      <!-- Key Metrics -->
      <section class="metrics-section">
        <h2>Raise Scenarios</h2>
        <div class="metrics-grid">
          {#each RAISE_SCENARIOS as scenario}
            <div class="metric-card" class:recommended={scenario.recommended}>
              <div class="metric-header">
                <span class="metric-label">{scenario.name}</span>
                {#if scenario.recommended}
                  <span class="badge">Recommended</span>
                {/if}
              </div>
              <div class="metric-value">{formatCurrency(scenario.amount, true)}</div>
              <div class="metric-details">
                <div class="detail-row">
                  <span>Pre-money:</span>
                  <span>{formatCurrency(scenario.preMoneyVal, true)}</span>
                </div>
                <div class="detail-row">
                  <span>Runway:</span>
                  <span>{scenario.runway} months</span>
                </div>
                <div class="detail-row">
                  <span>Target ARR Y2:</span>
                  <span>{formatCurrency(scenario.arrY2, true)}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <p>Questions? <a href="mailto:investors@saga-labs.com">investors@saga-labs.com</a></p>
      </footer>
    </div>

  {:else}
    <!-- Password Gate -->
    <div class="password-gate">
      <div class="gate-content">
        <img src="/saga-logo.svg" alt="Saga" class="logo" />
        <h1>Investor Materials</h1>
        <p class="subtitle">Enter the access code to view our pitch deck and financials</p>

        <form method="POST" action="?/verify" use:enhance={handleSubmit}>
          <div class="input-group">
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              class:error={form?.error}
            />
            <button type="submit">Access</button>
          </div>
        </form>

        {#if form?.error}
          <p class="error-message">Incorrect password. Please try again.</p>
        {/if}

        <p class="contact">
          Need access? Contact <a href="mailto:investors@saga-labs.com">investors@saga-labs.com</a>
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .pitch-page {
    min-height: 100vh;
    background: white;
    color: #111;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .pitch-page.dark {
    background: #111;
    color: white;
  }

  /* Container */
  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* Header */
  .header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .dark .header {
    border-color: #333;
  }

  .logo-link {
    display: flex;
  }

  .logo {
    height: 36px;
  }

  .dark .logo {
    filter: invert(1);
  }

  .header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  /* Materials Section */
  .materials-section {
    margin-bottom: 2rem;
  }

  .materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .material-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
  }

  .dark .material-card {
    border-color: #333;
  }

  .material-card:hover {
    border-color: #2563eb;
    background: #f8fafc;
  }

  .dark .material-card:hover {
    background: #1a1a1a;
  }

  .material-icon {
    width: 40px;
    height: 40px;
    color: #2563eb;
  }

  .material-icon svg {
    width: 100%;
    height: 100%;
  }

  .material-info h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .material-info p {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .dark .material-info p {
    color: #9ca3af;
  }

  /* PDF Section */
  .pdf-section {
    margin-bottom: 2rem;
  }

  .pdf-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }

  .pdf-viewer {
    width: 100%;
    height: 80vh;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  .dark .pdf-viewer {
    border-color: #333;
  }

  .pdf-viewer iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  /* Charts Section */
  .charts-section {
    margin-bottom: 2rem;
  }

  .charts-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }

  .chart-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    overflow-x: auto;
  }

  .dark .chart-container {
    border-color: #333;
  }

  .chart-container canvas {
    display: block;
    max-width: 100%;
    height: auto;
  }

  /* Table Section */
  .table-section {
    margin-bottom: 2rem;
  }

  .table-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }

  .table-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow-x: auto;
  }

  .dark .table-wrapper {
    border-color: #333;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.75rem 1rem;
    text-align: right;
    border-bottom: 1px solid #e5e7eb;
  }

  .dark th, .dark td {
    border-color: #333;
  }

  th {
    background: #f9fafb;
    font-weight: 600;
    text-align: right;
  }

  .dark th {
    background: #1a1a1a;
  }

  th:first-child, td:first-child {
    text-align: left;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .revenue { color: #16a34a; }
  .expense { color: #6b7280; }
  .cash { color: #2563eb; font-weight: 600; }
  .positive { color: #16a34a; }
  .negative { color: #dc2626; }

  /* Metrics Section */
  .metrics-section {
    margin-bottom: 2rem;
  }

  .metrics-section h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }

  .metric-card {
    padding: 1.25rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .dark .metric-card {
    border-color: #333;
  }

  .metric-card.recommended {
    border-color: #2563eb;
    background: #eff6ff;
  }

  .dark .metric-card.recommended {
    background: #1e3a5f;
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .metric-label {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .dark .metric-label {
    color: #9ca3af;
  }

  .badge {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    padding: 0.25rem 0.5rem;
    background: #2563eb;
    color: white;
    border-radius: 4px;
  }

  .metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  .metric-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .dark .detail-row {
    color: #9ca3af;
  }

  /* Footer */
  .footer {
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    text-align: center;
  }

  .dark .footer {
    border-color: #333;
  }

  .footer p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .footer a {
    color: #2563eb;
    text-decoration: none;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  /* Password Gate */
  .password-gate {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .gate-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 400px;
    width: 100%;
  }

  .gate-content .logo {
    height: 48px;
    margin-bottom: 1.5rem;
  }

  .gate-content h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .gate-content .subtitle {
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .dark .gate-content .subtitle {
    color: #9ca3af;
  }

  .gate-content form {
    width: 100%;
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .input-group input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    color: #111;
  }

  .dark .input-group input {
    border-color: #333;
    background: #1a1a1a;
    color: white;
  }

  .input-group input:focus {
    outline: none;
    border-color: #2563eb;
  }

  .input-group input.error {
    border-color: #dc2626;
  }

  .input-group button {
    padding: 0.75rem 1.5rem;
    background: #111;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .dark .input-group button {
    background: white;
    color: #111;
  }

  .input-group button:hover {
    background: #333;
  }

  .dark .input-group button:hover {
    background: #e5e7eb;
  }

  .error-message {
    color: #dc2626;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .contact {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .dark .contact {
    color: #9ca3af;
  }

  .contact a {
    color: #2563eb;
    text-decoration: none;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .container {
      padding: 1rem;
    }

    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .pdf-viewer {
      height: 60vh;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
