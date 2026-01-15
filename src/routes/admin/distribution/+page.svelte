<script lang="ts">
  import { onMount } from 'svelte';

  let distribution: any = $state(null);
  let loading = $state(true);
  let sortBy = $state('total');
  let sortAsc = $state(false);

  // Expected limits from config
  const MAX_PER_PERSPECTIVE = 10;
  const MAX_PER_TIMEFRAME = 40; // 4 perspectives x 10
  const MAX_PER_TOPIC = 120;

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

  // Check if topic total is over limit
  function isTopicOverLimit(total: number): boolean {
    return total > MAX_PER_TOPIC;
  }

  // Check if timeframe total is over limit
  function isTimeframeOverLimit(total: number): boolean {
    return total > MAX_PER_TIMEFRAME;
  }

  // Check if perspective count is over limit
  function isPerspectiveOverLimit(count: number): boolean {
    return count > MAX_PER_PERSPECTIVE;
  }

  // Calculate bar width percentage (relative to max 100px container)
  // Scale: each perspective max is 10, so bar at 10 = full width
  function getBarWidthPx(count: number): number {
    // Scale to max 20px per bar segment, cap at limit
    const maxBarWidth = 20;
    return Math.min(count, MAX_PER_PERSPECTIVE) * (maxBarWidth / MAX_PER_PERSPECTIVE);
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
    return sortAsc ? ' ↑' : ' ↓';
  }

  // Count violations
  function countViolations(): { topics: number; perspectives: number } {
    if (!distribution?.distribution) return { topics: 0, perspectives: 0 };

    let topicViolations = 0;
    let perspectiveViolations = 0;

    for (const topic of Object.values(distribution.distribution) as any[]) {
      const total = getTopicTotal(topic);
      if (total > MAX_PER_TOPIC) topicViolations++;

      for (const tf of ['fundamental', 'medium', 'current']) {
        const tfData = topic[tf];
        if (tfData) {
          for (const persp of ['risk', 'opportunity', 'trend', 'catalyst']) {
            if ((tfData[persp] || 0) > MAX_PER_PERSPECTIVE) perspectiveViolations++;
          }
        }
      }
    }

    return { topics: topicViolations, perspectives: perspectiveViolations };
  }
</script>

<div class="distribution-page">
  <div class="header">
    <h1>Article Distribution</h1>
    <p class="subtitle">Active articles (Tier 1-3) per topic by timeframe and perspective</p>
    <p class="limits-info">
      Limits: {MAX_PER_PERSPECTIVE}/perspective, {MAX_PER_TIMEFRAME}/timeframe, {MAX_PER_TOPIC}/topic
    </p>
  </div>

  {#if loading}
    <div class="loading">Loading distribution data...</div>
  {:else if distribution?.distribution}
    {@const violations = countViolations()}
    {#if violations.topics > 0 || violations.perspectives > 0}
      <div class="violations-banner">
        <strong>Capacity Violations:</strong>
        {#if violations.topics > 0}
          <span class="violation-count">{violations.topics} topics over limit</span>
        {/if}
        {#if violations.perspectives > 0}
          <span class="violation-count">{violations.perspectives} perspective buckets over limit</span>
        {/if}
      </div>
    {/if}

    <div class="stats-summary">
      <span><strong>{distribution.topic_count}</strong> topics</span>
      <span><strong>{distribution.total_articles?.toLocaleString()}</strong> active articles</span>
    </div>

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
        {@const topicOver = isTopicOverLimit(total)}
        <div class="distribution-row" class:over-limit={topicOver}>
          <span class="topic-col" title={topicId}>{t.name || topicId}</span>

          <!-- Fundamental -->
          {@const fundTotal = getTimeframeTotal(t, 'fundamental')}
          <div class="timeframe-col" class:tf-over={isTimeframeOverLimit(fundTotal)}>
            <div class="bar-group">
              <span class="mini-bar risk" class:bar-over={isPerspectiveOverLimit(t.fundamental?.risk || 0)} style="width: {getBarWidthPx(t.fundamental?.risk || 0)}px" title="Risk: {t.fundamental?.risk || 0}"></span>
              <span class="mini-bar opportunity" class:bar-over={isPerspectiveOverLimit(t.fundamental?.opportunity || 0)} style="width: {getBarWidthPx(t.fundamental?.opportunity || 0)}px" title="Opportunity: {t.fundamental?.opportunity || 0}"></span>
              <span class="mini-bar trend" class:bar-over={isPerspectiveOverLimit(t.fundamental?.trend || 0)} style="width: {getBarWidthPx(t.fundamental?.trend || 0)}px" title="Trend: {t.fundamental?.trend || 0}"></span>
              <span class="mini-bar catalyst" class:bar-over={isPerspectiveOverLimit(t.fundamental?.catalyst || 0)} style="width: {getBarWidthPx(t.fundamental?.catalyst || 0)}px" title="Catalyst: {t.fundamental?.catalyst || 0}"></span>
            </div>
            <span class="tf-count">{fundTotal}</span>
          </div>

          <!-- Medium -->
          {@const medTotal = getTimeframeTotal(t, 'medium')}
          <div class="timeframe-col" class:tf-over={isTimeframeOverLimit(medTotal)}>
            <div class="bar-group">
              <span class="mini-bar risk" class:bar-over={isPerspectiveOverLimit(t.medium?.risk || 0)} style="width: {getBarWidthPx(t.medium?.risk || 0)}px" title="Risk: {t.medium?.risk || 0}"></span>
              <span class="mini-bar opportunity" class:bar-over={isPerspectiveOverLimit(t.medium?.opportunity || 0)} style="width: {getBarWidthPx(t.medium?.opportunity || 0)}px" title="Opportunity: {t.medium?.opportunity || 0}"></span>
              <span class="mini-bar trend" class:bar-over={isPerspectiveOverLimit(t.medium?.trend || 0)} style="width: {getBarWidthPx(t.medium?.trend || 0)}px" title="Trend: {t.medium?.trend || 0}"></span>
              <span class="mini-bar catalyst" class:bar-over={isPerspectiveOverLimit(t.medium?.catalyst || 0)} style="width: {getBarWidthPx(t.medium?.catalyst || 0)}px" title="Catalyst: {t.medium?.catalyst || 0}"></span>
            </div>
            <span class="tf-count">{medTotal}</span>
          </div>

          <!-- Current -->
          {@const curTotal = getTimeframeTotal(t, 'current')}
          <div class="timeframe-col" class:tf-over={isTimeframeOverLimit(curTotal)}>
            <div class="bar-group">
              <span class="mini-bar risk" class:bar-over={isPerspectiveOverLimit(t.current?.risk || 0)} style="width: {getBarWidthPx(t.current?.risk || 0)}px" title="Risk: {t.current?.risk || 0}"></span>
              <span class="mini-bar opportunity" class:bar-over={isPerspectiveOverLimit(t.current?.opportunity || 0)} style="width: {getBarWidthPx(t.current?.opportunity || 0)}px" title="Opportunity: {t.current?.opportunity || 0}"></span>
              <span class="mini-bar trend" class:bar-over={isPerspectiveOverLimit(t.current?.trend || 0)} style="width: {getBarWidthPx(t.current?.trend || 0)}px" title="Trend: {t.current?.trend || 0}"></span>
              <span class="mini-bar catalyst" class:bar-over={isPerspectiveOverLimit(t.current?.catalyst || 0)} style="width: {getBarWidthPx(t.current?.catalyst || 0)}px" title="Catalyst: {t.current?.catalyst || 0}"></span>
            </div>
            <span class="tf-count">{curTotal}</span>
          </div>

          <span class="total-col" class:total-over={topicOver}>{total}</span>
        </div>
      {/each}

      <div class="distribution-legend">
        <span><span class="legend-dot risk"></span> Risk</span>
        <span><span class="legend-dot opportunity"></span> Opportunity</span>
        <span><span class="legend-dot trend"></span> Trend</span>
        <span><span class="legend-dot catalyst"></span> Catalyst</span>
        <span class="legend-separator">|</span>
        <span class="legend-over"><span class="legend-dot over"></span> Over limit</span>
      </div>
    </div>
  {:else}
    <div class="no-data">No distribution data available</div>
  {/if}
</div>

<style>
  .distribution-page {
    padding: 2rem;
    max-width: 1400px;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.75rem;
    font-weight: bold;
    color: #111827;
    margin: 0;
  }

  .subtitle {
    color: #6b7280;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
  }

  .limits-info {
    font-size: 0.75rem;
    color: #9ca3af;
    margin: 0;
  }

  .loading, .no-data {
    text-align: center;
    padding: 4rem;
    font-size: 1.25rem;
    color: #6b7280;
  }

  .violations-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-left: 4px solid #dc2626;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    color: #991b1b;
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .violation-count {
    background: #dc2626;
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .stats-summary {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
    font-size: 0.875rem;
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
    grid-template-columns: 220px 1fr 1fr 1fr 70px;
    gap: 1rem;
    padding: 0.5rem 0;
    align-items: center;
  }

  .distribution-header {
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    color: #374151;
    font-size: 0.875rem;
  }

  .distribution-row {
    border-bottom: 1px solid #f3f4f6;
  }

  .distribution-row:hover {
    background: #f9fafb;
  }

  .distribution-row.over-limit {
    background: #fef2f2;
  }

  .distribution-row.over-limit:hover {
    background: #fee2e2;
  }

  .sortable {
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 600;
    color: #374151;
    text-align: left;
    padding: 0.25rem 0;
    font-size: 0.875rem;
  }

  .sortable:hover {
    color: #2563eb;
  }

  .topic-col {
    font-weight: 500;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
  }

  .timeframe-col {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .timeframe-col.tf-over {
    background: #fef3c7;
    border-radius: 4px;
    padding: 0.25rem;
    margin: -0.25rem;
  }

  .bar-group {
    display: flex;
    gap: 2px;
    align-items: center;
    min-width: 90px;
  }

  .tf-count {
    font-size: 0.75rem;
    color: #6b7280;
    min-width: 28px;
    text-align: right;
    font-weight: 500;
  }

  .total-col {
    text-align: right;
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
  }

  .total-col.total-over {
    color: #dc2626;
    font-weight: 700;
  }

  .mini-bar {
    display: inline-block;
    height: 14px;
    min-width: 2px;
    border-radius: 2px;
    transition: all 0.15s;
  }

  .mini-bar.bar-over {
    outline: 2px solid #dc2626;
    outline-offset: 1px;
  }

  .mini-bar.risk { background: #ef4444; }
  .mini-bar.opportunity { background: #22c55e; }
  .mini-bar.trend { background: #3b82f6; }
  .mini-bar.catalyst { background: #f59e0b; }

  .distribution-legend {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
    font-size: 0.8rem;
    color: #6b7280;
    align-items: center;
  }

  .legend-separator {
    color: #d1d5db;
  }

  .legend-over {
    color: #dc2626;
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
  .legend-dot.over {
    background: #fecaca;
    outline: 2px solid #dc2626;
    outline-offset: 1px;
  }
</style>
