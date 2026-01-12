<script lang="ts">
  import { MILESTONES, formatCurrency } from './FinancialData';
</script>

<div class="timeline-container">
  <div class="timeline-header">
    <h3>24-Month Milestones</h3>
    <span class="subtitle">From seed to category leader</span>
  </div>

  <div class="timeline">
    {#each MILESTONES as milestone, i}
      <div class="milestone" class:year2={i >= 4}>
        <div class="milestone-marker">
          <div class="marker-dot"></div>
          {#if i < MILESTONES.length - 1}
            <div class="marker-line"></div>
          {/if}
        </div>
        <div class="milestone-content">
          <div class="quarter-badge" class:year2={i >= 4}>{milestone.quarter}</div>
          <h4>{milestone.milestone}</h4>
          <div class="metrics">
            <div class="metric">
              <span class="metric-label">ARR</span>
              <span class="metric-value arr">{formatCurrency(milestone.arr, true)}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Customers</span>
              <span class="metric-value">{milestone.customers}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Team</span>
              <span class="metric-value">{milestone.team}</span>
            </div>
          </div>
          <p class="why">{milestone.why}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="timeline-footer">
    <div class="year-summary">
      <div class="year">
        <span class="year-label">Year 1</span>
        <span class="year-target">$3.6M ARR</span>
        <span class="year-detail">25 customers, 8 team members</span>
      </div>
      <div class="arrow"></div>
      <div class="year highlight">
        <span class="year-label">Year 2</span>
        <span class="year-target">$8.6M ARR</span>
        <span class="year-detail">60+ customers, 18 team members</span>
      </div>
    </div>
  </div>
</div>

<style>
  .timeline-container {
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
  }

  .timeline-header {
    margin-bottom: 2rem;
  }

  .timeline-header h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
  }

  .subtitle {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .milestone {
    display: flex;
    gap: 1.5rem;
    position: relative;
  }

  .milestone-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 20px;
  }

  .marker-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #6366f1;
    border: 3px solid #0f0f1a;
    box-shadow: 0 0 0 2px #6366f1;
    z-index: 1;
  }

  .milestone.year2 .marker-dot {
    background: #8b5cf6;
    box-shadow: 0 0 0 2px #8b5cf6;
  }

  .marker-line {
    width: 2px;
    flex: 1;
    background: linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.2) 100%);
    min-height: 60px;
  }

  .milestone.year2 .marker-line {
    background: linear-gradient(180deg, #8b5cf6 0%, rgba(139, 92, 246, 0.2) 100%);
  }

  .milestone-content {
    flex: 1;
    padding-bottom: 1.5rem;
  }

  .quarter-badge {
    display: inline-block;
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .quarter-badge.year2 {
    background: rgba(139, 92, 246, 0.2);
    color: #c4b5fd;
  }

  .milestone-content h4 {
    margin: 0 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: white;
  }

  .metrics {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .metric {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
  }

  .metric-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
  }

  .metric-value.arr {
    color: #22c55e;
  }

  .why {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }

  .timeline-footer {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .year-summary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }

  .year {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 12px;
  }

  .year.highlight {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .year-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .year-target {
    font-size: 1.5rem;
    font-weight: 700;
    color: #22c55e;
  }

  .year-detail {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .arrow {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    position: relative;
  }

  .arrow::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-left: 8px solid #8b5cf6;
  }

  @media (max-width: 600px) {
    .year-summary {
      flex-direction: column;
    }

    .arrow {
      width: 2px;
      height: 30px;
      background: linear-gradient(180deg, #6366f1, #8b5cf6);
    }

    .arrow::after {
      right: 50%;
      top: auto;
      bottom: 0;
      transform: translateX(50%);
      border: 6px solid transparent;
      border-top: 8px solid #8b5cf6;
      border-left: 6px solid transparent;
    }
  }
</style>
