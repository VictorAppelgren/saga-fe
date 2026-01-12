<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  // Components
  import MetricCard from '$lib/components/pitch/MetricCard.svelte';
  import ARRChart from '$lib/components/pitch/ARRChart.svelte';
  import CashflowChart from '$lib/components/pitch/CashflowChart.svelte';
  import ScenarioTable from '$lib/components/pitch/ScenarioTable.svelte';
  import MilestoneTimeline from '$lib/components/pitch/MilestoneTimeline.svelte';
  import UnitEconomics from '$lib/components/pitch/UnitEconomics.svelte';
  import { RAISE_SCENARIOS, MARKET_SIZE, formatCurrency } from '$lib/components/pitch/FinancialData';

  export let data: PageData;
  export let form: ActionData;

  $: unlocked = data.unlocked;

  let activeTab: 'overview' | 'financials' | 'materials' = 'overview';

  function handleSubmit() {
    return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
      if (result.type === 'success') {
        await invalidateAll();
      } else {
        await update();
      }
    };
  }

  const recommendedScenario = RAISE_SCENARIOS.find(s => s.recommended)!;
</script>

<svelte:head>
  <title>Saga - Investor Materials</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="pitch-page" class:dark={$theme === 'dark'}>
  {#if unlocked}
    <div class="dashboard">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <a href="/dashboard" class="logo-link">
            <img src="/saga-logo.svg" alt="Saga" class="logo" />
          </a>
          <div class="header-title">
            <h1>Investor Materials</h1>
            <span class="badge">Seed Round</span>
          </div>
        </div>
        <nav class="tabs">
          <button class:active={activeTab === 'overview'} on:click={() => activeTab = 'overview'}>
            Overview
          </button>
          <button class:active={activeTab === 'financials'} on:click={() => activeTab = 'financials'}>
            Financials
          </button>
          <button class:active={activeTab === 'materials'} on:click={() => activeTab = 'materials'}>
            Documents
          </button>
        </nav>
      </header>

      <!-- Content -->
      <main class="content">
        {#if activeTab === 'overview'}
          <!-- Hero Section -->
          <section class="hero">
            <div class="hero-content">
              <h2>Intelligence Infrastructure for Asset Managers</h2>
              <p class="tagline">AI-powered research that thinks like a macro PM, executes like a quant</p>
              <div class="hero-stats">
                <div class="hero-stat">
                  <span class="stat-value">{formatCurrency(MARKET_SIZE.tam, true)}</span>
                  <span class="stat-label">TAM</span>
                </div>
                <div class="hero-stat">
                  <span class="stat-value">{formatCurrency(recommendedScenario.arrY2, true)}</span>
                  <span class="stat-label">Target ARR Y2</span>
                </div>
                <div class="hero-stat">
                  <span class="stat-value">43x</span>
                  <span class="stat-label">LTV:CAC</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Key Metrics -->
          <section class="section">
            <h3 class="section-title">The Ask</h3>
            <div class="metrics-grid">
              <MetricCard
                title="Raise"
                value={formatCurrency(recommendedScenario.amount, true)}
                subtitle="Seed round"
                highlight
              />
              <MetricCard
                title="Pre-Money"
                value={formatCurrency(recommendedScenario.preMoneyVal, true)}
                subtitle="Valuation"
              />
              <MetricCard
                title="Dilution"
                value="20%"
                subtitle="Founder-friendly"
              />
              <MetricCard
                title="Runway"
                value="{recommendedScenario.runway} mo"
                subtitle="To Series A"
              />
            </div>
          </section>

          <!-- ARR Chart -->
          <section class="section">
            <ARRChart />
          </section>

          <!-- Why $2M -->
          <section class="section why-section">
            <div class="why-card">
              <h3>Why $2M is the Right Amount</h3>
              <ul class="why-list">
                <li>
                  <span class="check"></span>
                  <span><strong>24-month runway</strong> to Series A without pressure</span>
                </li>
                <li>
                  <span class="check"></span>
                  <span><strong>8-person team</strong> balances velocity with capital efficiency</span>
                </li>
                <li>
                  <span class="check"></span>
                  <span><strong>Not over-dilutive</strong> - 20% is founder-friendly</span>
                </li>
                <li>
                  <span class="check"></span>
                  <span><strong>$3.6M ARR target</strong> - strong Series A position at 10-15x</span>
                </li>
                <li>
                  <span class="check"></span>
                  <span><strong>Matches ambition</strong> - category-defining, not lifestyle business</span>
                </li>
              </ul>
            </div>
          </section>

          <!-- Milestones -->
          <section class="section">
            <MilestoneTimeline />
          </section>

        {:else if activeTab === 'financials'}
          <!-- Scenario Comparison -->
          <section class="section">
            <ScenarioTable />
          </section>

          <!-- Cashflow -->
          <section class="section">
            <CashflowChart />
          </section>

          <!-- Unit Economics -->
          <section class="section">
            <UnitEconomics />
          </section>

        {:else if activeTab === 'materials'}
          <!-- Download Section -->
          <section class="section">
            <div class="materials-grid">
              <div class="material-card">
                <div class="material-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                  </svg>
                </div>
                <h3>Pitch Deck</h3>
                <p>Our seed round investor presentation</p>
                <div class="material-actions">
                  <a href="/investor/saga_pitch_deck.pdf" target="_blank" class="btn primary">
                    View PDF
                  </a>
                  <a href="/investor/saga_pitch_deck.pdf" download class="btn secondary">
                    Download
                  </a>
                </div>
              </div>

              <div class="material-card">
                <div class="material-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
                  </svg>
                </div>
                <h3>Financial Model</h3>
                <p>24-month budget and projections (Excel)</p>
                <div class="material-actions">
                  <a href="/investor/saga_budget.xlsx" download class="btn primary">
                    Download Excel
                  </a>
                </div>
              </div>

              <div class="material-card">
                <div class="material-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                </div>
                <h3>Data Room</h3>
                <p>Additional due diligence materials</p>
                <div class="material-actions">
                  <a href="mailto:investors@saga-labs.com" class="btn primary">
                    Request Access
                  </a>
                </div>
              </div>
            </div>
          </section>

          <!-- PDF Viewer -->
          <section class="section">
            <div class="pdf-viewer-container">
              <h3>Pitch Deck Preview</h3>
              <div class="pdf-viewer">
                <iframe
                  src="/investor/saga_pitch_deck.pdf"
                  title="Saga Pitch Deck"
                ></iframe>
              </div>
            </div>
          </section>
        {/if}
      </main>

      <!-- Footer -->
      <footer class="footer">
        <p>Questions? Contact us at <a href="mailto:investors@saga-labs.com">investors@saga-labs.com</a></p>
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
          Need access? Contact us at <a href="mailto:investors@saga-labs.com">investors@saga-labs.com</a>
        </p>
      </div>

      <!-- Background animation -->
      <div class="bg-animation">
        <div class="grid"></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .pitch-page {
    min-height: 100vh;
    background: #0a0a0f;
    color: white;
    font-family: 'Inter', system-ui, sans-serif;
  }

  /* Dashboard Layout */
  .dashboard {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(10, 10, 15, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .logo-link {
    display: flex;
  }

  .logo {
    height: 32px;
    filter: invert(1);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .header-title h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .badge {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
  }

  .tabs button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .tabs button:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  .tabs button.active {
    color: white;
    background: rgba(99, 102, 241, 0.2);
  }

  .content {
    flex: 1;
    padding: 2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* Hero Section */
  .hero {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
    border-radius: 24px;
    border: 1px solid rgba(99, 102, 241, 0.2);
    margin-bottom: 2rem;
  }

  .hero h2 {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, white 0%, rgba(255, 255, 255, 0.8) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 2rem 0;
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 4rem;
  }

  .hero-stat {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #6366f1;
  }

  .stat-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Sections */
  .section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: white;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  /* Why Section */
  .why-section {
    display: flex;
    justify-content: center;
  }

  .why-card {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%);
    border: 1px solid rgba(34, 197, 94, 0.2);
    border-radius: 20px;
    padding: 2rem;
    max-width: 600px;
    width: 100%;
  }

  .why-card h3 {
    margin: 0 0 1.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    text-align: center;
  }

  .why-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .why-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.85);
  }

  .check {
    width: 20px;
    height: 20px;
    background: rgba(34, 197, 94, 0.2);
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
    margin-top: 2px;
  }

  .check::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 3px;
    width: 5px;
    height: 10px;
    border: solid #22c55e;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  /* Materials Grid */
  .materials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .material-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s;
  }

  .material-card:hover {
    border-color: rgba(99, 102, 241, 0.5);
    transform: translateY(-2px);
  }

  .material-icon {
    width: 48px;
    height: 48px;
    background: rgba(99, 102, 241, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    color: #6366f1;
  }

  .material-icon svg {
    width: 24px;
    height: 24px;
  }

  .material-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .material-card p {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .material-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
  }

  .btn.primary {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
  }

  .btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* PDF Viewer */
  .pdf-viewer-container {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
  }

  .pdf-viewer-container h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .pdf-viewer {
    width: 100%;
    height: 70vh;
    border-radius: 12px;
    overflow: hidden;
    background: #111;
  }

  .pdf-viewer iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  /* Footer */
  .footer {
    padding: 2rem;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer p {
    margin: 0;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .footer a {
    color: #6366f1;
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
    position: relative;
    overflow: hidden;
  }

  .gate-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 400px;
    padding: 2rem;
    position: relative;
    z-index: 1;
  }

  .gate-content .logo {
    height: 48px;
    filter: invert(1);
    margin-bottom: 1.5rem;
  }

  .gate-content h1 {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .gate-content .subtitle {
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 2rem;
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
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    font-size: 1rem;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    outline: none;
    transition: border-color 0.2s;
  }

  .input-group input:focus {
    border-color: #6366f1;
  }

  .input-group input.error {
    border-color: #ef4444;
  }

  .input-group button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .input-group button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .error-message {
    color: #ef4444;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .contact {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .contact a {
    color: #6366f1;
    text-decoration: none;
  }

  /* Background animation */
  .bg-animation {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
  }

  .grid {
    position: absolute;
    inset: -50%;
    background-image:
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: grid-move 20s linear infinite;
  }

  @keyframes grid-move {
    0% { transform: translate(0, 0) rotate(0deg); }
    100% { transform: translate(50px, 50px) rotate(0deg); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .header-left {
      flex-direction: column;
      gap: 0.5rem;
    }

    .tabs {
      width: 100%;
      justify-content: center;
    }

    .content {
      padding: 1rem;
    }

    .hero h2 {
      font-size: 1.5rem;
    }

    .hero-stats {
      flex-direction: column;
      gap: 1.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
</style>
