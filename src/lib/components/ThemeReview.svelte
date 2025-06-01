<script lang="ts">
  import type { Theme } from '$lib/types/storage';
  export let theme: Theme;



  // Mock review data
  const review = `Market Analysis Report - ${theme.name} (${new Date().toLocaleDateString()})

Recent market developments have shown significant shifts in sentiment and trading patterns. Key indicators suggest a complex interplay of fundamental and technical factors that warrant careful analysis.

Technical Analysis:
- Support levels remain strong at current price points
- Moving averages indicate potential trend continuation
- Volume patterns suggest increasing market participation

Market Sentiment:
- Institutional investors maintain cautiously optimistic outlook
- Retail participation shows steady growth
- Risk metrics indicate moderate market uncertainty

Key Developments:
- Regulatory changes impact market dynamics
- Infrastructure improvements enhance market efficiency
- Innovation drives new opportunities

Risk Assessment:
- Market volatility within expected ranges
- Liquidity metrics show healthy market conditions
- Correlation patterns suggest diversification benefits

Forward Outlook:
The overall market trajectory appears constructive, supported by positive technical indicators and fundamental developments. However, participants should maintain vigilance regarding potential risk factors.`;
</script>

<div class="review-section">
  <h2>Review</h2>
  <div class="review-content">
    <p>{review}</p>
  </div>
</div>

<style>
  .review-section {
    margin-top: 1.5rem;
    padding: 2rem;
    background: var(--card-bg, #f5f5f5);
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .review-content {
    font-size: 0.95rem;
    line-height: 1.6;
  }

  p {
    margin: 0;
    white-space: pre-wrap;
  }
</style>
