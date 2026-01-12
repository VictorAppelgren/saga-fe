<script lang="ts">
  export let title: string;
  export let value: string;
  export let subtitle: string = '';
  export let highlight: boolean = false;
  export let trend: 'up' | 'down' | 'neutral' | null = null;
</script>

<div class="metric-card" class:highlight>
  <div class="metric-header">
    <span class="metric-title">{title}</span>
    {#if trend}
      <span class="trend" class:up={trend === 'up'} class:down={trend === 'down'}>
        {#if trend === 'up'}
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
        {:else if trend === 'down'}
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
        {/if}
      </span>
    {/if}
  </div>
  <div class="metric-value">{value}</div>
  {#if subtitle}
    <div class="metric-subtitle">{subtitle}</div>
  {/if}
</div>

<style>
  .metric-card {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  }

  .metric-card.highlight {
    background: linear-gradient(135deg, #312e81 0%, #1e1b4b 100%);
    border-color: rgba(99, 102, 241, 0.5);
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .metric-title {
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    line-height: 1.1;
  }

  .metric-subtitle {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .trend {
    display: flex;
    align-items: center;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
  }

  .trend svg {
    width: 16px;
    height: 16px;
  }

  .trend.up {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .trend.down {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }
</style>
