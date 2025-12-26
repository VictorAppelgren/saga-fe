<script lang="ts">
  import { onMount } from 'svelte';

  let distribution: any = $state(null);
  let loading = $state(true);
  let sortBy = $state('total');
  let sortAsc = $state(false);

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/article-distribution');
      distribution = await response.json();
      loading = false;
    } catch (error) {
      console.error('Failed to load distribution:', error);
      loading = false;
    }
  });

  function getTopicTotal(topic: any): number {
    return (topic.fundamental?.risk || 0) + (topic.fundamental?.opportunity || 0) +
           (topic.fundamental?.trend || 0) + (topic.fundamental?.catalyst || 0) +
           (topic.medium?.risk || 0) + (topic.medium?.opportunity || 0) +
           (topic.medium?.trend || 0) + (topic.medium?.catalyst || 0) +
           (topic.current?.risk || 0) + (topic.current?.opportunity || 0) +
           (topic.current?.trend || 0) + (topic.current?.catalyst || 0);
  }

  function getTimeframeTotal(topic: any, timeframe: string): number {
    const tf = topic[timeframe];
    if (!tf) return 0;
    return (tf.risk || 0) + (tf.opportunity || 0) + (tf.trend || 0) + (tf.catalyst || 0);
  }

  function sortedTopics() {
    if (!distribution?.distribution) return [];

    const entries = Object.entries(distribution.distribution);

    return entries.sort(([, a]: any, [, b]: any) => {
      let aVal, bVal;

      if (sortBy === 'total') {
        aVal = getTopicTotal(a);
        bVal = getTopicTotal(b);
      } else if (sortBy === 'name') {
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        aVal = getTimeframeTotal(a, sortBy);
        bVal = getTimeframeTotal(b, sortBy);
      }

      return sortAsc ? aVal - bVal : bVal - aVal;
    });
  }

  function toggleSort(column: string) {
    if (sortBy === column) {
      sortAsc = !sortAsc;
    } else {
      sortBy = column;
      sortAsc = false;
    }
  }

  function getSortIcon(column: string): string {
    if (sortBy !== column) return '';
    return sortAsc ? ' ^' : ' v';
  }
</script>

<div class="distribution-page">
  <div class="header">
    <h1>Article Distribution</h1>
    <p class="subtitle">Articles per topic by timeframe and perspective</p>
  </div>

  {#if loading}
    <div class="loading">Loading distribution data...</div>
  {:else if distribution?.distribution}
    <div class="distribution-container">
      <div class="distribution-header">
        <button class="topic-col sortable" onclick={() => toggleSort('name')}>
          Topic{getSortIcon('name')}
        </button>
        <button class="timeframe-col sortable" onclick={() => toggleSort('fundamental')}>
          Fundamental{getSortIcon('fundamental')}
        </button>
        <button class="timeframe-col sortable" onclick={() => toggleSort('medium')}>
          Medium{getSortIcon('medium')}
        </button>
        <button class="timeframe-col sortable" onclick={() => toggleSort('current')}>
          Current{getSortIcon('current')}
        </button>
        <button class="total-col sortable" onclick={() => toggleSort('total')}>
          Total{getSortIcon('total')}
        </button>
      </div>

      {#each sortedTopics() as [topicId, topic]}
        {@const t = topic as any}
        {@const total = getTopicTotal(t)}
        <div class="distribution-row">
          <span class="topic-col" title={topicId}>{t.name || topicId}</span>
          <span class="timeframe-col">
            <span class="mini-bar risk" style="width: {Math.min(t.fundamental?.risk || 0, 20) * 5}px" title="Risk: {t.fundamental?.risk || 0}"></span>
            <span class="mini-bar opportunity" style="width: {Math.min(t.fundamental?.opportunity || 0, 20) * 5}px" title="Opp: {t.fundamental?.opportunity || 0}"></span>
            <span class="mini-bar trend" style="width: {Math.min(t.fundamental?.trend || 0, 20) * 5}px" title="Trend: {t.fundamental?.trend || 0}"></span>
            <span class="mini-bar catalyst" style="width: {Math.min(t.fundamental?.catalyst || 0, 20) * 5}px" title="Cat: {t.fundamental?.catalyst || 0}"></span>
            <span class="tf-count">{getTimeframeTotal(t, 'fundamental')}</span>
          </span>
          <span class="timeframe-col">
            <span class="mini-bar risk" style="width: {Math.min(t.medium?.risk || 0, 20) * 5}px" title="Risk: {t.medium?.risk || 0}"></span>
            <span class="mini-bar opportunity" style="width: {Math.min(t.medium?.opportunity || 0, 20) * 5}px" title="Opp: {t.medium?.opportunity || 0}"></span>
            <span class="mini-bar trend" style="width: {Math.min(t.medium?.trend || 0, 20) * 5}px" title="Trend: {t.medium?.trend || 0}"></span>
            <span class="mini-bar catalyst" style="width: {Math.min(t.medium?.catalyst || 0, 20) * 5}px" title="Cat: {t.medium?.catalyst || 0}"></span>
            <span class="tf-count">{getTimeframeTotal(t, 'medium')}</span>
          </span>
          <span class="timeframe-col">
            <span class="mini-bar risk" style="width: {Math.min(t.current?.risk || 0, 20) * 5}px" title="Risk: {t.current?.risk || 0}"></span>
            <span class="mini-bar opportunity" style="width: {Math.min(t.current?.opportunity || 0, 20) * 5}px" title="Opp: {t.current?.opportunity || 0}"></span>
            <span class="mini-bar trend" style="width: {Math.min(t.current?.trend || 0, 20) * 5}px" title="Trend: {t.current?.trend || 0}"></span>
            <span class="mini-bar catalyst" style="width: {Math.min(t.current?.catalyst || 0, 20) * 5}px" title="Cat: {t.current?.catalyst || 0}"></span>
            <span class="tf-count">{getTimeframeTotal(t, 'current')}</span>
          </span>
          <span class="total-col">{total}</span>
        </div>
      {/each}

      <div class="distribution-legend">
        <span><span class="legend-dot risk"></span> Risk</span>
        <span><span class="legend-dot opportunity"></span> Opportunity</span>
        <span><span class="legend-dot trend"></span> Trend</span>
        <span><span class="legend-dot catalyst"></span> Catalyst</span>
      </div>
    </div>
  {:else}
    <div class="no-data">No distribution data available</div>
  {/if}
</div>

<style>
  .distribution-page {
    padding: 2rem;
    max-width: 1200px;
  }

  .header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #111827;
    margin: 0;
  }

  .subtitle {
    color: #6b7280;
    margin-top: 0.5rem;
  }

  .loading, .no-data {
    text-align: center;
    padding: 4rem;
    font-size: 1.25rem;
    color: #6b7280;
  }

  .distribution-container {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow-x: auto;
  }

  .distribution-header, .distribution-row {
    display: grid;
    grid-template-columns: 200px 1fr 1fr 1fr 80px;
    gap: 0.5rem;
    padding: 0.5rem 0;
    align-items: center;
  }

  .distribution-header {
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    color: #374151;
  }

  .distribution-row {
    border-bottom: 1px solid #f3f4f6;
  }

  .distribution-row:hover {
    background: #f9fafb;
  }

  .sortable {
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
    color: #374151;
    text-align: left;
    padding: 0.25rem 0;
  }

  .sortable:hover {
    color: #1976d2;
  }

  .topic-col {
    font-weight: 500;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .timeframe-col {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .tf-count {
    margin-left: 0.5rem;
    font-size: 0.75rem;
    color: #6b7280;
    min-width: 20px;
  }

  .total-col {
    text-align: right;
    font-weight: 600;
    color: #111827;
  }

  .mini-bar {
    display: inline-block;
    height: 12px;
    min-width: 2px;
    border-radius: 2px;
  }

  .mini-bar.risk { background: #ef4444; }
  .mini-bar.opportunity { background: #22c55e; }
  .mini-bar.trend { background: #3b82f6; }
  .mini-bar.catalyst { background: #f59e0b; }

  .distribution-legend {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .legend-dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
    margin-right: 4px;
    vertical-align: middle;
  }

  .legend-dot.risk { background: #ef4444; }
  .legend-dot.opportunity { background: #22c55e; }
  .legend-dot.trend { background: #3b82f6; }
  .legend-dot.catalyst { background: #f59e0b; }
</style>
