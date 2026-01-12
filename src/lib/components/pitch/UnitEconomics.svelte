<script lang="ts">
  import { UNIT_ECONOMICS, COMPARABLES, formatCurrency, formatPercent } from './FinancialData';
</script>

<div class="economics-container">
  <div class="section">
    <h3>Unit Economics</h3>
    <p class="section-subtitle">Why this business scales</p>

    <div class="metrics-grid">
      <div class="metric-box highlight">
        <div class="metric-icon ltv">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">LTV:CAC Ratio</span>
          <span class="metric-value big">{UNIT_ECONOMICS.ltvCacRatio}x</span>
          <span class="metric-note">Exceptional efficiency</span>
        </div>
      </div>

      <div class="metric-box">
        <div class="metric-icon acv">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">ACV</span>
          <span class="metric-value">{formatCurrency(UNIT_ECONOMICS.acv, true)}</span>
          <span class="metric-note">Per customer/year</span>
        </div>
      </div>

      <div class="metric-box">
        <div class="metric-icon margin">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">Gross Margin</span>
          <span class="metric-value">{formatPercent(UNIT_ECONOMICS.grossMargin)}</span>
          <span class="metric-note">SaaS efficiency</span>
        </div>
      </div>

      <div class="metric-box">
        <div class="metric-icon cac">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">CAC</span>
          <span class="metric-value">{formatCurrency(UNIT_ECONOMICS.cac, true)}</span>
          <span class="metric-note">Founder-led sales</span>
        </div>
      </div>

      <div class="metric-box">
        <div class="metric-icon ltv-val">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">LTV (5yr)</span>
          <span class="metric-value">{formatCurrency(UNIT_ECONOMICS.ltv, true)}</span>
          <span class="metric-note">10% annual churn</span>
        </div>
      </div>

      <div class="metric-box">
        <div class="metric-icon payback">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">Payback</span>
          <span class="metric-value">&lt;1 month</span>
          <span class="metric-note">High ACV = instant</span>
        </div>
      </div>

      <div class="metric-box full-width">
        <div class="metric-icon nrr">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
        </div>
        <div class="metric-content">
          <span class="metric-label">Net Revenue Retention</span>
          <span class="metric-value green">{formatPercent(UNIT_ECONOMICS.nrr)}+</span>
          <span class="metric-note">Expansion from seat growth & premium features</span>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>Market Comparables</h3>
    <p class="section-subtitle">Similar companies and their valuations</p>

    <div class="comparables-table">
      <div class="table-header">
        <span>Company</span>
        <span>Category</span>
        <span>Valuation</span>
        <span>Multiple</span>
      </div>
      {#each COMPARABLES as comp}
        <div class="table-row">
          <span class="company">{comp.company}</span>
          <span class="category">{comp.category}</span>
          <span class="valuation">{comp.valuation}</span>
          <span class="multiple">{comp.multiple}</span>
        </div>
      {/each}
    </div>

    <div class="exit-projection">
      <h4>Seed Investor Returns</h4>
      <div class="projection-grid">
        <div class="projection">
          <span class="proj-label">Target ARR at Series A</span>
          <span class="proj-value">$3-4M</span>
        </div>
        <div class="projection">
          <span class="proj-label">Expected Series A Raise</span>
          <span class="proj-value">$10-15M</span>
        </div>
        <div class="projection highlight">
          <span class="proj-label">Seed Investor Return</span>
          <span class="proj-value green">4-6x</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .economics-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .section {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
  }

  .section h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .section-subtitle {
    margin: 0 0 1.5rem 0;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .metric-box {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    transition: all 0.2s;
  }

  .metric-box:hover {
    border-color: rgba(99, 102, 241, 0.3);
    background: rgba(99, 102, 241, 0.05);
  }

  .metric-box.highlight {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
    border-color: rgba(99, 102, 241, 0.3);
  }

  .metric-box.full-width {
    grid-column: 1 / -1;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .metric-icon svg {
    width: 22px;
    height: 22px;
  }

  .metric-icon.ltv { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
  .metric-icon.acv { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
  .metric-icon.margin { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
  .metric-icon.cac { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
  .metric-icon.ltv-val { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
  .metric-icon.payback { background: rgba(236, 72, 153, 0.2); color: #ec4899; }
  .metric-icon.nrr { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

  .metric-content {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .metric-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }

  .metric-value.big {
    font-size: 1.75rem;
    background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .metric-value.green {
    color: #22c55e;
  }

  .metric-note {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .comparables-table {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 1.5rem;
  }

  .table-header, .table-row {
    display: grid;
    grid-template-columns: 2fr 2fr 1.5fr 1fr;
    gap: 1rem;
    padding: 0.75rem 1rem;
  }

  .table-header {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px 8px 0 0;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
  }

  .table-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
  }

  .table-row:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  .company {
    font-weight: 600;
    color: white;
  }

  .category {
    color: rgba(255, 255, 255, 0.6);
  }

  .valuation {
    color: #6366f1;
    font-weight: 500;
  }

  .multiple {
    color: #22c55e;
    font-weight: 500;
  }

  .exit-projection {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 12px;
    padding: 1.25rem;
  }

  .exit-projection h4 {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
    text-align: center;
  }

  .projection-grid {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .projection {
    text-align: center;
  }

  .projection.highlight {
    background: rgba(34, 197, 94, 0.1);
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
  }

  .proj-label {
    display: block;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.25rem;
  }

  .proj-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
  }

  .proj-value.green {
    color: #22c55e;
  }

  @media (max-width: 600px) {
    .table-header, .table-row {
      grid-template-columns: 1fr 1fr;
    }

    .category, .multiple {
      display: none;
    }
  }
</style>
