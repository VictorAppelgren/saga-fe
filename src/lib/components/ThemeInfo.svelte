<script lang="ts">
  export let theme: {
    name: string;
    thesis: string;
    marketFocus?: string;
  };
</script>

<div class="theme-info">
  <h2>{theme.name}</h2>
  
  <div class="info-section">
    <h3>Thesis</h3>
    <p>{theme.thesis}</p>
  </div>

  {#if theme.marketFocus}
    <div class="info-section">
      <h3>Market Focus</h3>
      <p>{theme.marketFocus}</p>
    </div>
  {/if}
</div>

<style>
  .theme-info {
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

  .info-section {
    margin-bottom: 1.5rem;
  }

  .info-section:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
  }

  :global(.dark) h3 {
    color: #999;
  }

  p {
    margin: 0;
    line-height: 1.5;
  }
</style>
