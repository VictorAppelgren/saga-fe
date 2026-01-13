<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { PageData, ActionData } from './$types';
  import { onMount } from 'svelte';
  import { RAISE_INFO, CASHFLOW, MILESTONES, formatSEK } from '$lib/components/pitch/FinancialData';

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

  // Chart drawing
  let mainCanvas: HTMLCanvasElement;
  let teamCanvas: HTMLCanvasElement;

  onMount(() => {
    if (unlocked) {
      drawMainChart();
      drawTeamChart();
    }
  });

  $: if (unlocked && mainCanvas) {
    drawMainChart();
    drawTeamChart();
  }

  function drawMainChart() {
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    const width = mainCanvas.width;
    const height = mainCanvas.height;
    const padding = { top: 50, right: 80, bottom: 50, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const months = CASHFLOW.months;
    const cashBalance = CASHFLOW.cashBalance;
    const revenue = CASHFLOW.monthlyRevenue;
    const expenses = CASHFLOW.totalExpenses;

    // Scale for cash (left axis) - from 0 to max cash
    const cashMax = Math.max(...cashBalance) * 1.05;
    const cashMin = 0;

    // Scale for revenue/expenses (right axis) - from 0 to max
    const reMax = Math.max(...revenue, ...expenses) * 1.1;

    const scaleX = (i: number) => padding.left + (i / (months.length - 1)) * chartWidth;
    const scaleCash = (val: number) => padding.top + ((cashMax - val) / (cashMax - cashMin)) * chartHeight;
    const scaleRE = (val: number) => padding.top + ((reMax - val) / reMax) * chartHeight;

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw Cash Balance area (light blue fill)
    ctx.fillStyle = 'rgba(37, 99, 235, 0.1)';
    ctx.beginPath();
    ctx.moveTo(scaleX(0), scaleCash(0));
    for (let i = 0; i < months.length; i++) {
      ctx.lineTo(scaleX(i), scaleCash(cashBalance[i]));
    }
    ctx.lineTo(scaleX(months.length - 1), scaleCash(0));
    ctx.closePath();
    ctx.fill();

    // Draw Cash Balance line (blue, thick)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = scaleX(i);
      const y = scaleCash(cashBalance[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Revenue line (green)
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = scaleX(i);
      const y = scaleRE(revenue[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw Expenses line (red, dashed)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = scaleX(i);
      const y = scaleRE(expenses[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw breakeven marker (M21)
    const breakevenIdx = MILESTONES.breakeven - 1;
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(scaleX(breakevenIdx), scaleCash(cashBalance[breakevenIdx]), 6, 0, Math.PI * 2);
    ctx.fill();

    // Breakeven vertical line
    ctx.strokeStyle = 'rgba(22, 163, 74, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(scaleX(breakevenIdx), padding.top);
    ctx.lineTo(scaleX(breakevenIdx), height - padding.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let i = 0; i < months.length; i += 3) {
      ctx.fillText(`M${months[i]}`, scaleX(i), height - padding.bottom + 18);
    }
    ctx.fillText(`M${months[months.length - 1]}`, scaleX(months.length - 1), height - padding.bottom + 18);

    // Left Y-axis labels (Cash - blue)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#2563eb';
    ctx.font = '10px system-ui, sans-serif';
    for (let i = 0; i <= 5; i++) {
      const val = cashMax - ((cashMax - cashMin) * i) / 5;
      ctx.fillText(formatSEK(val, true), padding.left - 8, padding.top + (i / 5) * chartHeight + 3);
    }

    // Right Y-axis labels (Revenue/Expenses)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    for (let i = 0; i <= 5; i++) {
      const val = reMax - (reMax * i) / 5;
      ctx.fillText(formatSEK(val, true), width - padding.right + 8, padding.top + (i / 5) * chartHeight + 3);
    }

    // Legend at top
    ctx.font = '12px system-ui, sans-serif';
    const legendY = 20;
    let legendX = padding.left;

    // Cash Balance
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(legendX, legendY - 8, 20, 3);
    ctx.fillText('Cash Balance', legendX + 25, legendY);
    legendX += 110;

    // Revenue
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(legendX, legendY - 8, 20, 3);
    ctx.fillText('Revenue', legendX + 25, legendY);
    legendX += 85;

    // Expenses
    ctx.fillStyle = '#dc2626';
    ctx.setLineDash([4, 2]);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY - 6);
    ctx.lineTo(legendX + 20, legendY - 6);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('Expenses', legendX + 25, legendY);
    legendX += 90;

    // Breakeven marker
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(legendX + 5, legendY - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Breakeven (M21)', legendX + 15, legendY);

    // Axis titles
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Cash Balance (SEK)', 0, 0);
    ctx.restore();

    ctx.fillStyle = '#6b7280';
    ctx.save();
    ctx.translate(width - 10, height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Revenue / Expenses (SEK)', 0, 0);
    ctx.restore();
  }

  function drawTeamChart() {
    if (!teamCanvas) return;
    const ctx = teamCanvas.getContext('2d');
    if (!ctx) return;

    const width = teamCanvas.width;
    const height = teamCanvas.height;
    const padding = { top: 30, right: 80, bottom: 35, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const months = CASHFLOW.months;
    const team = CASHFLOW.teamSize;

    const teamMax = Math.max(...team) * 1.15;
    const scaleX = (i: number) => padding.left + (i / (months.length - 1)) * chartWidth;
    const scaleTeam = (val: number) => padding.top + ((teamMax - val) / teamMax) * chartHeight;

    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding.top + (i / 3) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw area fill
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.beginPath();
    ctx.moveTo(scaleX(0), scaleTeam(0));
    for (let i = 0; i < months.length; i++) {
      ctx.lineTo(scaleX(i), scaleTeam(team[i]));
    }
    ctx.lineTo(scaleX(months.length - 1), scaleTeam(0));
    ctx.closePath();
    ctx.fill();

    // Draw Team line (orange)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < months.length; i++) {
      const x = scaleX(i);
      const y = scaleTeam(team[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // X-axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < months.length; i += 6) {
      ctx.fillText(`M${months[i]}`, scaleX(i), height - padding.bottom + 15);
    }
    ctx.fillText(`M${months[months.length - 1]}`, scaleX(months.length - 1), height - padding.bottom + 15);

    // Y-axis labels (Team)
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f59e0b';
    for (let i = 0; i <= 3; i++) {
      const val = teamMax - (teamMax * i) / 3;
      ctx.fillText(Math.round(val).toString(), padding.left - 8, padding.top + (i / 3) * chartHeight + 3);
    }

    // Legend
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'left';
    ctx.fillRect(padding.left, 12, 20, 3);
    ctx.fillText('Team Size (employees)', padding.left + 25, 18);
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

      <!-- The Raise -->
      <section class="raise-section">
        <h2>The Raise</h2>
        <div class="raise-card">
          <div class="raise-amount">{formatSEK(RAISE_INFO.amount, true)} SEK</div>
          <div class="raise-details">
            <div class="detail">
              <span class="label">Pre-Money</span>
              <span class="value">{formatSEK(RAISE_INFO.preMoney, true)} SEK</span>
            </div>
            <div class="detail">
              <span class="label">Dilution</span>
              <span class="value">{(RAISE_INFO.dilution * 100).toFixed(0)}%</span>
            </div>
            <div class="detail">
              <span class="label">Runway</span>
              <span class="value">{RAISE_INFO.runway} months</span>
            </div>
          </div>
          <div class="raise-targets">
            <div class="target">
              <span class="target-value">{MILESTONES.y2Customers}</span>
              <span class="target-label">Customers Y2</span>
            </div>
            <div class="target">
              <span class="target-value">{formatSEK(MILESTONES.y2ARR, true)}</span>
              <span class="target-label">ARR Y2</span>
            </div>
            <div class="target">
              <span class="target-value">{MILESTONES.y2Team}</span>
              <span class="target-label">Team Y2</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Charts Section -->
      <section class="charts-section">
        <h2>24-Month Financial Projection</h2>

        <div class="chart-container main-chart">
          <canvas bind:this={mainCanvas} width="900" height="400"></canvas>
        </div>

        <div class="chart-container team-chart">
          <canvas bind:this={teamCanvas} width="900" height="140"></canvas>
        </div>
      </section>

      <!-- Cashflow Table -->
      <section class="table-section">
        <h2>Quarterly Summary</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Revenue</th>
                <th>Expenses</th>
                <th>Cash Balance</th>
                <th>Team</th>
                <th>Customers</th>
              </tr>
            </thead>
            <tbody>
              {#each [2, 5, 8, 11, 14, 17, 20, 23] as idx}
                <tr>
                  <td>M{CASHFLOW.months[idx]}</td>
                  <td class="revenue">{formatSEK(CASHFLOW.monthlyRevenue[idx], true)}</td>
                  <td class="expense">{formatSEK(CASHFLOW.totalExpenses[idx], true)}</td>
                  <td class="cash">{formatSEK(CASHFLOW.cashBalance[idx], true)}</td>
                  <td>{CASHFLOW.teamSize[idx]}</td>
                  <td>{CASHFLOW.totalCustomers[idx]}</td>
                </tr>
              {/each}
            </tbody>
          </table>
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

  .dark .header { border-color: #333; }

  .logo-link { display: flex; }
  .logo { height: 36px; }
  .dark .logo { filter: invert(1); }

  .header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  /* Materials */
  .materials-section { margin-bottom: 2rem; }

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

  .dark .material-card { border-color: #333; }
  .material-card:hover {
    border-color: #2563eb;
    background: #f8fafc;
  }
  .dark .material-card:hover { background: #1a1a1a; }

  .material-icon {
    width: 40px;
    height: 40px;
    color: #2563eb;
  }
  .material-icon svg { width: 100%; height: 100%; }

  .material-info h3 { margin: 0; font-size: 1rem; font-weight: 600; }
  .material-info p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #6b7280; }
  .dark .material-info p { color: #9ca3af; }

  /* PDF */
  .pdf-section { margin-bottom: 2rem; }
  .pdf-section h2 { font-size: 1.125rem; font-weight: 600; margin: 0 0 1rem; }

  .pdf-viewer {
    width: 100%;
    height: 80vh;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  .dark .pdf-viewer { border-color: #333; }
  .pdf-viewer iframe { width: 100%; height: 100%; border: none; }

  /* Raise Section */
  .raise-section { margin-bottom: 2rem; }
  .raise-section h2 { font-size: 1.125rem; font-weight: 600; margin: 0 0 1rem; }

  .raise-card {
    border: 2px solid #2563eb;
    border-radius: 12px;
    padding: 1.5rem;
    background: #eff6ff;
  }
  .dark .raise-card { background: #1e3a5f; }

  .raise-amount {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2563eb;
    margin-bottom: 1rem;
  }

  .raise-details {
    display: flex;
    gap: 2rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .detail {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .detail .label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
  .detail .value { font-size: 1.125rem; font-weight: 600; }
  .dark .detail .label { color: #9ca3af; }

  .raise-targets {
    display: flex;
    gap: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(37, 99, 235, 0.2);
    flex-wrap: wrap;
  }

  .target { text-align: center; }
  .target-value { display: block; font-size: 1.5rem; font-weight: 700; color: #16a34a; }
  .target-label { font-size: 0.75rem; color: #6b7280; }
  .dark .target-label { color: #9ca3af; }

  /* Charts */
  .charts-section { margin-bottom: 2rem; }
  .charts-section h2 { font-size: 1.125rem; font-weight: 600; margin: 0 0 1rem; }

  .chart-container {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    overflow-x: auto;
  }
  .dark .chart-container { border-color: #333; }
  .chart-container canvas { display: block; max-width: 100%; height: auto; }

  /* Table */
  .table-section { margin-bottom: 2rem; }
  .table-section h2 { font-size: 1.125rem; font-weight: 600; margin: 0 0 1rem; }

  .table-wrapper {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow-x: auto;
  }
  .dark .table-wrapper { border-color: #333; }

  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th, td { padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb; }
  .dark th, .dark td { border-color: #333; }
  th { background: #f9fafb; font-weight: 600; }
  .dark th { background: #1a1a1a; }
  th:first-child, td:first-child { text-align: left; }
  tr:last-child td { border-bottom: none; }

  .revenue { color: #16a34a; }
  .expense { color: #6b7280; }
  .cash { color: #2563eb; font-weight: 600; }

  /* Footer */
  .footer { padding-top: 1rem; border-top: 1px solid #e5e7eb; text-align: center; }
  .dark .footer { border-color: #333; }
  .footer p { margin: 0; font-size: 0.875rem; color: #6b7280; }
  .footer a { color: #2563eb; text-decoration: none; }
  .footer a:hover { text-decoration: underline; }

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

  .gate-content .logo { height: 48px; margin-bottom: 1.5rem; }
  .gate-content h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.5rem; }
  .gate-content .subtitle { color: #6b7280; margin-bottom: 2rem; }
  .dark .gate-content .subtitle { color: #9ca3af; }
  .gate-content form { width: 100%; }

  .input-group { display: flex; gap: 0.5rem; width: 100%; margin-bottom: 1rem; }
  .input-group input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 1rem;
    background: white;
    color: #111;
  }
  .dark .input-group input { border-color: #333; background: #1a1a1a; color: white; }
  .input-group input:focus { outline: none; border-color: #2563eb; }
  .input-group input.error { border-color: #dc2626; }

  .input-group button {
    padding: 0.75rem 1.5rem;
    background: #111;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
  }
  .dark .input-group button { background: white; color: #111; }
  .input-group button:hover { background: #333; }
  .dark .input-group button:hover { background: #e5e7eb; }

  .error-message { color: #dc2626; font-size: 0.875rem; margin-bottom: 1rem; }
  .contact { font-size: 0.875rem; color: #6b7280; }
  .dark .contact { color: #9ca3af; }
  .contact a { color: #2563eb; text-decoration: none; }

  @media (max-width: 640px) {
    .container { padding: 1rem; }
    .header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
    .pdf-viewer { height: 60vh; }
    .raise-details, .raise-targets { gap: 1rem; }
    .raise-amount { font-size: 2rem; }
  }
</style>
