<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';
  import AdminCard from '$lib/components/AdminCard.svelte';

  let summary: any = $state(null);
  let articlesTrend: any = $state(null);
  let analysisTrend: any = $state(null);
  let strategyAnalysisTrend: any = $state(null);
  let queriesTrend: any = $state(null);
  let logs: any = $state(null);
  let distribution: any = $state(null);
  let recentTopics: any = $state(null);
  let materialStats: any = $state(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      // Fetch all data in parallel
      const [summaryRes, articlesRes, analysisRes, strategyAnalysisRes, queriesRes, logsRes, distRes, recentRes, materialRes] = await Promise.all([
        fetch('/api/admin/summary'),
        fetch('/api/admin/trends/articles?days=7'),
        fetch('/api/admin/trends/analysis?days=7'),
        fetch('/api/admin/trends/strategy-analysis?days=7'),
        fetch('/api/admin/trends/queries?days=7'),
        fetch('/api/admin/logs/today?lines=20'),
        fetch('/api/admin/article-distribution'),
        fetch('/api/admin/topics-recent?days=7'),
        fetch('/api/admin/stats/material?days=7')
      ]);

      summary = await summaryRes.json();
      articlesTrend = await articlesRes.json();
      analysisTrend = await analysisRes.json();
      strategyAnalysisTrend = await strategyAnalysisRes.json();
      queriesTrend = await queriesRes.json();
      logs = await logsRes.json();
      distribution = await distRes.json();
      recentTopics = await recentRes.json();
      materialStats = await materialRes.json();
      
      loading = false;
      
      // Render charts after data is loaded
      setTimeout(() => {
        renderQueriesChart();
        renderArticlesChart();
        renderAnalysisChart();
        renderStrategyAnalysisChart();
      }, 100);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      loading = false;
    }
  });
  
  function renderQueriesChart() {
    const ctx = document.getElementById('queriesChart') as HTMLCanvasElement;
    if (!ctx || !queriesTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...queriesTrend.dates],  // Clone array
        datasets: [{
          label: 'Queries Performed',
          data: [...queriesTrend.queries],  // Clone array
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
  
  function renderArticlesChart() {
    const ctx = document.getElementById('articlesChart') as HTMLCanvasElement;
    if (!ctx || !articlesTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...articlesTrend.dates],  // Clone array
        datasets: [{
          label: 'Articles Added',
          data: [...articlesTrend.added],  // Clone array
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
  
  function renderAnalysisChart() {
    const ctx = document.getElementById('analysisChart') as HTMLCanvasElement;
    if (!ctx || !analysisTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...analysisTrend.dates],
        datasets: [{
          label: 'Analysis Completed',
          data: [...analysisTrend.completed],
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236, 72, 153, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
  
  function renderStrategyAnalysisChart() {
    const ctx = document.getElementById('strategyAnalysisChart') as HTMLCanvasElement;
    if (!ctx || !strategyAnalysisTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...strategyAnalysisTrend.dates],
        datasets: [{
          label: 'Strategy Analysis',
          data: [...strategyAnalysisTrend.completed],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
  
</script>

<div class="admin-container">
  <div class="header">
    <h1>Dashboard</h1>
  </div>
  
  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <!-- ============================================================ -->
    <!-- SECTION 1: USER ENGAGEMENT - Who is using the system -->
    <!-- ============================================================ -->
    <h2>👥 User Activity</h2>
    <div class="stats-grid">
      <AdminCard
        title="Sessions"
        value={summary?.engagement?.sessions || 0}
        subtitle="logins today"
      />
      <AdminCard
        title="Created"
        value={summary?.engagement?.strategies_created || 0}
        subtitle="new strategies"
      />
      <AdminCard
        title="Updated"
        value={summary?.engagement?.strategies_updated || 0}
        subtitle="edited strategies"
      />
      <AdminCard
        title="Viewed"
        value={summary?.engagement?.strategies_viewed || 0}
        subtitle="strategies opened"
      />
      <AdminCard
        title="Reports"
        value={summary?.engagement?.reports_viewed || 0}
        subtitle="topic reports"
      />
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 2: ARTICLE PIPELINE - Content flowing in -->
    <!-- ============================================================ -->
    <h2>📊 Article Pipeline</h2>
    <div class="stats-grid">
      <AdminCard
        title="Queries"
        value={summary?.pipeline?.queries}
        subtitle="API calls"
      />
      <AdminCard
        title="Fetched"
        value={summary?.pipeline?.fetched}
        subtitle="from sources"
      />
      <AdminCard
        title="Processed"
        value={summary?.pipeline?.processed}
        subtitle="entered pipeline"
      />
      <AdminCard
        title="Added"
        value={summary?.pipeline?.added}
        subtitle="to graph"
      />
      <AdminCard
        title="Rejected"
        value={summary?.pipeline?.rejected}
        subtitle="filtered out"
      />
    </div>

    <!-- Articles by Tier -->
    <h3>📈 By Quality Tier</h3>
    <div class="stats-grid">
      <AdminCard
        title="Tier 3"
        value={summary?.tier_breakdown?.tier_3 || 0}
        subtitle="premium"
      />
      <AdminCard
        title="Tier 2"
        value={summary?.tier_breakdown?.tier_2 || 0}
        subtitle="standard"
      />
      <AdminCard
        title="Tier 1"
        value={summary?.tier_breakdown?.tier_1 || 0}
        subtitle="filler"
      />
      <AdminCard
        title="Tier 0"
        value={summary?.tier_breakdown?.tier_0 || 0}
        subtitle="archive"
      />
    </div>

    <!-- Capacity Management -->
    <h3>🔧 Capacity Management</h3>
    <div class="stats-grid">
      <AdminCard
        title="Downgraded"
        value={summary?.capacity?.downgraded || 0}
        subtitle="priority reduced"
      />
      <AdminCard
        title="Archived"
        value={summary?.capacity?.archived || 0}
        subtitle="moved to tier 0"
      />
      <AdminCard
        title="Rejected (Capacity)"
        value={summary?.capacity?.rejected_capacity || 0}
        subtitle="capacity full"
      />
      <AdminCard
        title="Duplicates Skipped"
        value={summary?.capacity?.duplicates_skipped || 0}
        subtitle="already exists"
      />
    </div>

    <!-- Article Lifecycle (Backend vs Neo4j sync) -->
    <h3>🔄 Article Lifecycle</h3>
    <div class="stats-grid">
      <AdminCard
        title="Backend Stored"
        value={summary?.article_lifecycle?.backend_stored || 0}
        subtitle="saved to disk"
      />
      <AdminCard
        title="Neo4j Created"
        value={summary?.article_lifecycle?.neo4j_created || 0}
        subtitle="graph nodes"
      />
      <AdminCard
        title="ABOUT Links"
        value={summary?.article_lifecycle?.about_links_created || 0}
        subtitle="topic connections"
      />
      <AdminCard
        title="Neo4j Deleted"
        value={summary?.article_lifecycle?.neo4j_deleted || 0}
        subtitle="removed from graph"
      />
    </div>

    <!-- Self-Healing Stats -->
    <h3>🩹 Self-Healing</h3>
    <div class="stats-grid">
      <AdminCard
        title="Heal Attempted"
        value={summary?.self_healing?.attempted || 0}
        subtitle="missing articles"
      />
      <AdminCard
        title="Heal Success"
        value={summary?.self_healing?.success || 0}
        subtitle="recovered"
      />
      <AdminCard
        title="Heal Deleted"
        value={summary?.self_healing?.deleted || 0}
        subtitle="orphans removed"
      />
      <AdminCard
        title="Heal Failed"
        value={summary?.self_healing?.failed || 0}
        subtitle="errors"
      />
    </div>

    <!-- Relationship Discovery Stats -->
    <h3>🔗 Relationship Discovery</h3>
    <div class="stats-grid">
      <AdminCard
        title="Run"
        value={summary?.relationship_discovery?.run || 0}
        subtitle="discoveries executed"
      />
      <AdminCard
        title="Throttled"
        value={summary?.relationship_discovery?.throttled || 0}
        subtitle="skipped (well-connected)"
      />
      <AdminCard
        title="Failed"
        value={summary?.relationship_discovery?.failed || 0}
        subtitle="errors"
      />
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 3: TOPIC ACTIVITY - Topics discovered from articles -->
    <!-- ============================================================ -->
    <h2>🏷️ Topic Activity</h2>
    <div class="stats-grid">
      <AdminCard
        title="Suggested"
        value={summary?.topics?.suggested || 0}
        subtitle="LLM proposals"
      />
      <AdminCard
        title="Created"
        value={summary?.topics?.created || 0}
        subtitle="added to graph"
      />
      <AdminCard
        title="Rejected"
        value={summary?.topics?.rejected || 0}
        subtitle="failed gates"
      />
      <AdminCard
        title="Deleted"
        value={summary?.topics?.deleted || 0}
        subtitle="removed"
      />
    </div>

    <!-- Topic Rejection Breakdown (compact) -->
    {#if (summary?.topics?.rejected || 0) > 0}
    <div class="compact-breakdown">
      Rejected: {summary?.topics?.rejected_no_proposal || 0} no proposal, {summary?.topics?.rejected_relevance || 0} relevance, {summary?.topics?.rejected_capacity || 0} capacity
    </div>
    {/if}

    <!-- Recently Added Topics (always show) -->
    <h3>📈 New Topics</h3>
    <div class="recent-topics">
      <div class="topic-row">
        <span class="topic-label">Today:</span>
        <span class="topic-list">{recentTopics?.today?.length > 0 ? recentTopics.today.map((t: any) => t.name).join(', ') : 'None'}</span>
      </div>
      {#if recentTopics?.yesterday?.length > 0}
        <div class="topic-row">
          <span class="topic-label">Yesterday:</span>
          <span class="topic-list">{recentTopics.yesterday.map((t: any) => t.name).join(', ')}</span>
        </div>
      {/if}
      {#if recentTopics?.this_week?.length > 0}
        <div class="topic-row">
          <span class="topic-label">This week:</span>
          <span class="topic-list">{recentTopics.this_week.map((t: any) => t.name).join(', ')}</span>
        </div>
      {/if}
      <p class="topic-total">Total: {recentTopics?.total || 0} new topics in last 7 days (limit: 2/day)</p>
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 4: TOPIC ANALYSIS - Analysis agent writes reports -->
    <!-- ============================================================ -->
    <h2>🤖 Topic Analysis</h2>
    <div class="stats-grid">
      <AdminCard
        title="Triggered"
        value={summary?.analysis?.triggered || 0}
        subtitle="new articles found"
      />
      <AdminCard
        title="Completed"
        value={summary?.analysis?.completed || 0}
        subtitle="analysis finished"
      />
      <AdminCard
        title="Skipped"
        value={(summary?.analysis?.skipped_no_new || 0) + (summary?.analysis?.skipped_cooldown || 0) + (summary?.analysis?.skipped_no_articles || 0)}
        subtitle="no new / cooldown / no articles"
      />
      <AdminCard
        title="Sections Written"
        value={summary?.analysis?.sections_written || 0}
        subtitle="successful"
      />
      <AdminCard
        title="Sections Failed"
        value={summary?.analysis?.sections_failed || 0}
        subtitle="errors"
      />
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 4.5: MATERIAL BUILDER - What goes into each analysis -->
    <!-- ============================================================ -->
    <h2>📦 Material Builder</h2>
    {#if materialStats?.runs > 0}
    <p class="section-hint">{materialStats.runs} runs in last {materialStats.days} days - averages per run:</p>
    <div class="stats-grid">
      <AdminCard
        title="Topics"
        value={materialStats.averages?.topics?.toFixed(1) || 0}
        subtitle={`total: ${materialStats.totals?.topics || 0}`}
      />
      <AdminCard
        title="Articles"
        value={materialStats.averages?.articles?.toFixed(1) || 0}
        subtitle={`total: ${materialStats.totals?.articles || 0}`}
      />
      <AdminCard
        title="Tier 3"
        value={materialStats.averages?.tier3?.toFixed(1) || 0}
        subtitle={`total: ${materialStats.totals?.tier3 || 0}`}
      />
      <AdminCard
        title="Tier 2"
        value={materialStats.averages?.tier2?.toFixed(1) || 0}
        subtitle={`total: ${materialStats.totals?.tier2 || 0}`}
      />
      <AdminCard
        title="Tier 1"
        value={materialStats.averages?.tier1?.toFixed(1) || 0}
        subtitle={`total: ${materialStats.totals?.tier1 || 0}`}
      />
      <AdminCard
        title="Tokens Est."
        value={materialStats.averages?.tokens_est ? Math.round(materialStats.averages.tokens_est).toLocaleString() : 0}
        subtitle={`total: ${materialStats.totals?.tokens_est?.toLocaleString() || 0}`}
      />
    </div>

    <!-- Freshness by Timeframe -->
    {#if materialStats.freshness && Object.keys(materialStats.freshness).length > 0}
    <h3>⏱️ Article Freshness (avg age when collected)</h3>
    <div class="freshness-grid">
      {#if materialStats.freshness.current}
        <div class="freshness-card">
          <span class="freshness-label">Current</span>
          <span class="freshness-value">{materialStats.freshness.current.avg_hours?.toFixed(1) || '?'}h</span>
          <span class="freshness-range">({materialStats.freshness.current.min_hours?.toFixed(0) || 0}-{materialStats.freshness.current.max_hours?.toFixed(0) || 0}h)</span>
        </div>
      {/if}
      {#if materialStats.freshness.medium}
        <div class="freshness-card">
          <span class="freshness-label">Medium</span>
          <span class="freshness-value">{materialStats.freshness.medium.avg_days?.toFixed(1) || '?'}d</span>
          <span class="freshness-range">({materialStats.freshness.medium.min_days?.toFixed(0) || 0}-{materialStats.freshness.medium.max_days?.toFixed(0) || 0}d)</span>
        </div>
      {/if}
      {#if materialStats.freshness.fundamental}
        <div class="freshness-card">
          <span class="freshness-label">Fundamental</span>
          <span class="freshness-value">{materialStats.freshness.fundamental.avg_days?.toFixed(1) || '?'}d</span>
          <span class="freshness-range">({materialStats.freshness.fundamental.min_days?.toFixed(0) || 0}-{materialStats.freshness.fundamental.max_days?.toFixed(0) || 0}d)</span>
        </div>
      {/if}
    </div>
    {/if}

    <!-- Self-Healing Stats -->
    {#if materialStats.healing && materialStats.healing.total_attempts > 0}
    <h3>🩹 Self-Healing (missing articles)</h3>
    <div class="stats-grid">
      <AdminCard
        title="Success"
        value={materialStats.healing.success || 0}
        subtitle="recovered"
      />
      <AdminCard
        title="Deleted"
        value={materialStats.healing.deleted || 0}
        subtitle="not in Perigon"
      />
      <AdminCard
        title="Failed"
        value={materialStats.healing.failed || 0}
        subtitle="errors"
      />
    </div>
    {/if}
    {:else}
    <p class="no-data">No Material Builder runs recorded yet. Tracking will appear after the next analysis.</p>
    {/if}

    <!-- ============================================================ -->
    <!-- SECTION 5: STRATEGY ANALYSIS - User-triggered pipeline -->
    <!-- ============================================================ -->
    <h2>💼 Strategy Analysis Pipeline</h2>
    <div class="stats-grid">
      <AdminCard
        title="Triggered"
        value={summary?.strategy_analysis?.triggered || 0}
        subtitle="backend → graph api"
      />
      <AdminCard
        title="Received"
        value={summary?.strategy_analysis?.received || 0}
        subtitle="graph api got request"
      />
      <AdminCard
        title="Step 1"
        value={`${summary?.strategy_analysis?.step1_completed || 0}/${summary?.strategy_analysis?.step1_started || 0}`}
        subtitle="topic mapping"
      />
      <AdminCard
        title="Step 2"
        value={`${summary?.strategy_analysis?.step2_completed || 0}/${summary?.strategy_analysis?.step2_started || 0}`}
        subtitle="exploration"
      />
      <AdminCard
        title="Step 3"
        value={`${summary?.strategy_analysis?.step3_completed || 0}/${summary?.strategy_analysis?.step3_started || 0}`}
        subtitle="final analysis"
      />
      <AdminCard
        title="Completed"
        value={summary?.strategy_analysis?.completed || 0}
        subtitle="full pipeline done"
      />
      <AdminCard
        title="Failed"
        value={summary?.strategy_analysis?.failed || 0}
        subtitle="errors (check logs)"
      />
    </div>

    <!-- write_all.py Catch-All (New Strategies) -->
    <h3>🆕 New Strategy Catch-All (write_all.py)</h3>
    <div class="stats-grid">
      <AdminCard
        title="Found"
        value={summary?.strategy_analysis?.new_found || 0}
        subtitle="never-analyzed"
      />
      <AdminCard
        title="Started"
        value={summary?.strategy_analysis?.new_started || 0}
        subtitle="processing"
      />
      <AdminCard
        title="Completed"
        value={summary?.strategy_analysis?.new_completed || 0}
        subtitle="success"
      />
      <AdminCard
        title="Failed"
        value={summary?.strategy_analysis?.new_failed || 0}
        subtitle="errors"
      />
    </div>

    <!-- Strategy Health (Real-time check) -->
    {#if summary?.strategy_health}
    <div class="health-check" class:healthy={summary.strategy_health.healthy} class:unhealthy={!summary.strategy_health.healthy}>
      <h3>{summary.strategy_health.healthy ? '✅' : '⚠️'} Strategy Health</h3>
      <p>
        <strong>Total Strategies:</strong> {summary.strategy_health.total_strategies} |
        <strong>Never Analyzed:</strong> {summary.strategy_health.never_analyzed_count}
        {#if summary.strategy_health.never_analyzed_count > 0}
          <span class="warning">(should be 0!)</span>
        {/if}
      </p>
      {#if summary.strategy_health.never_analyzed?.length > 0}
        <div class="never-analyzed-list">
          <strong>Pending:</strong>
          {#each summary.strategy_health.never_analyzed as s}
            <span class="pending-strategy">
              {s.username}/{s.strategy_id.slice(-6)}
              <span class="wait-time">{s.wait_mins}m</span>
            </span>
          {/each}
        </div>
      {/if}
    </div>
    {/if}

    <!-- ============================================================ -->
    <!-- SECTION 5.5: BACKEND ERRORS - API failures -->
    <!-- ============================================================ -->
    {@const totalBackendErrors = (summary?.backend_errors?.ingest || 0) +
      (summary?.backend_errors?.get || 0) +
      (summary?.backend_errors?.search || 0) +
      (summary?.backend_errors?.stats || 0) +
      (summary?.backend_errors?.users || 0) +
      (summary?.backend_errors?.strategy || 0) +
      (summary?.backend_errors?.analysis || 0) +
      (summary?.backend_errors?.dashboard || 0) +
      (summary?.backend_errors?.findings || 0)}
    {#if totalBackendErrors > 0}
    <h2 class="error-header">⚠️ Backend Errors ({totalBackendErrors})</h2>
    <div class="stats-grid">
      {#if summary?.backend_errors?.ingest > 0}
        <AdminCard title="Ingest" value={summary.backend_errors.ingest} subtitle="article storage" />
      {/if}
      {#if summary?.backend_errors?.get > 0}
        <AdminCard title="Get" value={summary.backend_errors.get} subtitle="article retrieval" />
      {/if}
      {#if summary?.backend_errors?.search > 0}
        <AdminCard title="Search" value={summary.backend_errors.search} subtitle="keyword search" />
      {/if}
      {#if summary?.backend_errors?.strategy > 0}
        <AdminCard title="Strategy" value={summary.backend_errors.strategy} subtitle="strategy ops" />
      {/if}
      {#if summary?.backend_errors?.analysis > 0}
        <AdminCard title="Analysis" value={summary.backend_errors.analysis} subtitle="analysis ops" />
      {/if}
      {#if summary?.backend_errors?.findings > 0}
        <AdminCard title="Findings" value={summary.backend_errors.findings} subtitle="exploration findings" />
      {/if}
      {#if summary?.backend_errors?.users > 0}
        <AdminCard title="Users" value={summary.backend_errors.users} subtitle="user listing" />
      {/if}
      {#if summary?.backend_errors?.dashboard > 0}
        <AdminCard title="Dashboard" value={summary.backend_errors.dashboard} subtitle="dashboard ops" />
      {/if}
      {#if summary?.backend_errors?.stats > 0}
        <AdminCard title="Stats" value={summary.backend_errors.stats} subtitle="storage stats" />
      {/if}
    </div>
    {/if}

    <!-- ============================================================ -->
    <!-- SECTION 6: LLM CALLS - Resource usage -->
    <!-- ============================================================ -->
    <h2>🤖 LLM Calls</h2>
    <div class="stats-grid">
      <AdminCard title="Simple (20B)" value={summary?.llm_calls?.tiers?.simple || 0} subtitle="local/external" />
      <AdminCard title="Medium (120B)" value={summary?.llm_calls?.tiers?.medium || 0} subtitle="research/writing" />
      <AdminCard title="Complex" value={summary?.llm_calls?.tiers?.complex || 0} subtitle="strategic" />
      <AdminCard title="Fast" value={summary?.llm_calls?.tiers?.fast || 0} subtitle="user-facing" />
    </div>
    <div class="llm-servers">
      {#each Object.entries(summary?.llm_calls?.servers || {}).sort((a, b) => (b[1] as number) - (a[1] as number)) as [server, count]}
        <span class="server" class:paid={server.includes('paid') || server === 'anthropic'}>
          {server}: {count}
        </span>
      {/each}
    </div>

    <!-- ============================================================ -->
    <!-- SECTION 7: STORAGE & GRAPH - Descriptive stats -->
    <!-- ============================================================ -->
    <h2>💾 Article Storage</h2>
    <div class="stats-grid">
      <AdminCard
        title="Cold Storage"
        value={summary?.cold_storage?.total_articles?.toLocaleString() || 0}
        subtitle="raw articles"
      />
      <AdminCard
        title="Date Range"
        value={summary?.cold_storage?.total_days || 0}
        subtitle="days of data"
      />
      <AdminCard
        title="URLs Indexed"
        value={summary?.cold_storage?.urls_indexed?.toLocaleString() || 0}
        subtitle="for deduplication"
      />
    </div>
    
    <!-- Graph State Cards -->
    <h2>🕸️ Graph State</h2>
    <div class="stats-grid">
      <AdminCard 
        title="Topics" 
        value={summary?.graph_state?.topics} 
        subtitle="total" 
      />
      <AdminCard 
        title="Articles" 
        value={summary?.graph_state?.articles} 
        subtitle="in graph" 
      />
      <AdminCard 
        title="Connections" 
        value={summary?.graph_state?.connections} 
        subtitle="total" 
      />
      <AdminCard 
        title="Avg Articles/Topic" 
        value={summary?.graph_state?.avg_articles_per_topic?.toFixed(1)} 
        subtitle="capacity monitoring" 
      />
    </div>
    
    <!-- Article Distribution Summary -->
    {#if distribution?.distribution}
    {@const totals = Object.values(distribution.distribution).reduce((acc: any, t: any) => {
      ['fundamental', 'medium', 'current'].forEach(tf => {
        ['risk', 'opportunity', 'trend', 'catalyst'].forEach(p => {
          acc[tf][p] += t[tf]?.[p] || 0;
        });
      });
      return acc;
    }, {
      fundamental: { risk: 0, opportunity: 0, trend: 0, catalyst: 0 },
      medium: { risk: 0, opportunity: 0, trend: 0, catalyst: 0 },
      current: { risk: 0, opportunity: 0, trend: 0, catalyst: 0 }
    })}
    {@const topicCount = Object.keys(distribution.distribution).length}
    {@const grandTotal = totals.fundamental.risk + totals.fundamental.opportunity + totals.fundamental.trend + totals.fundamental.catalyst +
      totals.medium.risk + totals.medium.opportunity + totals.medium.trend + totals.medium.catalyst +
      totals.current.risk + totals.current.opportunity + totals.current.trend + totals.current.catalyst}
    <h2>📊 Article Distribution ({topicCount} Topics)</h2>
    <div class="distribution-summary">
      <table class="dist-table">
        <thead>
          <tr>
            <th></th>
            <th>Fundamental</th>
            <th>Medium</th>
            <th>Current</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Risk</td>
            <td>{totals.fundamental.risk} <span class="avg">({(totals.fundamental.risk / topicCount).toFixed(1)})</span></td>
            <td>{totals.medium.risk} <span class="avg">({(totals.medium.risk / topicCount).toFixed(1)})</span></td>
            <td>{totals.current.risk} <span class="avg">({(totals.current.risk / topicCount).toFixed(1)})</span></td>
            <td class="total">{totals.fundamental.risk + totals.medium.risk + totals.current.risk}</td>
          </tr>
          <tr>
            <td>Opportunity</td>
            <td>{totals.fundamental.opportunity} <span class="avg">({(totals.fundamental.opportunity / topicCount).toFixed(1)})</span></td>
            <td>{totals.medium.opportunity} <span class="avg">({(totals.medium.opportunity / topicCount).toFixed(1)})</span></td>
            <td>{totals.current.opportunity} <span class="avg">({(totals.current.opportunity / topicCount).toFixed(1)})</span></td>
            <td class="total">{totals.fundamental.opportunity + totals.medium.opportunity + totals.current.opportunity}</td>
          </tr>
          <tr>
            <td>Trend</td>
            <td>{totals.fundamental.trend} <span class="avg">({(totals.fundamental.trend / topicCount).toFixed(1)})</span></td>
            <td>{totals.medium.trend} <span class="avg">({(totals.medium.trend / topicCount).toFixed(1)})</span></td>
            <td>{totals.current.trend} <span class="avg">({(totals.current.trend / topicCount).toFixed(1)})</span></td>
            <td class="total">{totals.fundamental.trend + totals.medium.trend + totals.current.trend}</td>
          </tr>
          <tr>
            <td>Catalyst</td>
            <td>{totals.fundamental.catalyst} <span class="avg">({(totals.fundamental.catalyst / topicCount).toFixed(1)})</span></td>
            <td>{totals.medium.catalyst} <span class="avg">({(totals.medium.catalyst / topicCount).toFixed(1)})</span></td>
            <td>{totals.current.catalyst} <span class="avg">({(totals.current.catalyst / topicCount).toFixed(1)})</span></td>
            <td class="total">{totals.fundamental.catalyst + totals.medium.catalyst + totals.current.catalyst}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td>Total</td>
            <td>{totals.fundamental.risk + totals.fundamental.opportunity + totals.fundamental.trend + totals.fundamental.catalyst}</td>
            <td>{totals.medium.risk + totals.medium.opportunity + totals.medium.trend + totals.medium.catalyst}</td>
            <td>{totals.current.risk + totals.current.opportunity + totals.current.trend + totals.current.catalyst}</td>
            <td class="total">{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
      <p class="dist-hint">See <a href="/admin/distribution">Distribution</a> for per-topic breakdown</p>
    </div>
    {/if}

    <!-- Trend Charts -->
    {#if queriesTrend?.dates?.length > 1}
      <div class="chart-container">
        <h2>📊 Queries Performed (Last 7 Days)</h2>
        <div class="chart-wrapper">
          <canvas id="queriesChart"></canvas>
        </div>
      </div>
      
      <div class="chart-container">
        <h2>📈 Articles Added (Last 7 Days)</h2>
        <div class="chart-wrapper">
          <canvas id="articlesChart"></canvas>
        </div>
      </div>
      
      <div class="chart-container">
        <h2>🤖 Analysis Completed (Last 7 Days)</h2>
        <div class="chart-wrapper">
          <canvas id="analysisChart"></canvas>
        </div>
      </div>
      
      <div class="chart-container">
        <h2>💼 Strategy Analysis (Last 7 Days)</h2>
        <div class="chart-wrapper">
          <canvas id="strategyAnalysisChart"></canvas>
        </div>
      </div>
    {:else}
      <div class="info-message">
        <h3>📊 Trend Charts</h3>
        <p>Collecting historical data... Currently have {queriesTrend?.dates?.length || 0} day(s) of data.</p>
        <p>Trend charts will appear after collecting data for multiple days.</p>
        <p><strong>Today's Stats:</strong></p>
        <ul>
          <li>Queries: {queriesTrend?.queries?.[0] || 0}</li>
          <li>Articles Added: {articlesTrend?.added?.[0] || 0}</li>
          <li>Analysis Completed: {analysisTrend?.completed?.[0] || 0}</li>
        </ul>
      </div>
    {/if}
    
    <!-- Logs -->
    <div class="logs-container">
      <h2>📋 Recent Events ({logs?.message_count || 0} messages)</h2>
      <pre>{logs?.messages?.join('\n') || 'No logs available'}</pre>
    </div>
  {/if}
</div>

<style>
  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9fafb;
    min-height: 100vh;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #111827;
  }
  
  .loading {
    text-align: center;
    padding: 4rem;
    font-size: 1.25rem;
    color: #6b7280;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  /* LLM Servers - Compact list */
  .llm-servers {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    background: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .server {
    font-family: monospace;
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    background: #d1fae5;
    color: #065f46;
  }

  .server.paid {
    background: #fef3c7;
    color: #92400e;
  }
  
  .chart-container {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .chart-container h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 1rem;
  }
  
  .chart-wrapper {
    height: 300px;
    position: relative;
  }
  
  .logs-container {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1.5rem;
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .logs-container h2 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #d4d4d4;
    margin-bottom: 1rem;
  }
  
  pre {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.5;
  }
  
  .info-message {
    background: #f0f9ff;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .info-message h3 {
    font-size: 1.5rem;
    color: #1e40af;
    margin-bottom: 1rem;
  }
  
  .info-message p {
    color: #1e3a8a;
    margin-bottom: 0.5rem;
  }
  
  .info-message ul {
    list-style: none;
    padding: 0;
    margin-top: 1rem;
    display: inline-block;
    text-align: left;
  }
  
  .info-message li {
    color: #1e3a8a;
    padding: 0.25rem 0;
    font-weight: 500;
  }

  /* Distribution Summary Styles */
  .distribution-summary {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .dist-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .dist-table th,
  .dist-table td {
    padding: 0.5rem 0.75rem;
    text-align: center;
    border-bottom: 1px solid #e5e7eb;
  }

  .dist-table th {
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #d1d5db;
  }

  .dist-table th:first-child,
  .dist-table td:first-child {
    text-align: left;
    font-weight: 500;
  }

  .dist-table td.total {
    font-weight: 600;
  }

  .dist-table tfoot td {
    font-weight: 600;
    border-top: 2px solid #d1d5db;
    border-bottom: none;
  }

  .dist-table .avg {
    color: #9ca3af;
    font-size: 0.85em;
  }

  .dist-hint {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
  }

  .dist-hint a {
    color: #374151;
    text-decoration: underline;
  }

  /* Compact breakdown text */
  .compact-breakdown {
    font-size: 0.85rem;
    color: #6b7280;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }

  /* Recently Added Topics */
  .recent-topics {
    background: white;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .topic-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .topic-label {
    font-weight: 600;
    color: #374151;
    min-width: 80px;
  }

  .topic-list {
    color: #1976d2;
  }

  .topic-total {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  /* Strategy Health Check */
  .health-check {
    background: white;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-left: 4px solid #9ca3af;
  }

  .health-check.healthy {
    border-left-color: #10b981;
    background: #f0fdf4;
  }

  .health-check.unhealthy {
    border-left-color: #f59e0b;
    background: #fffbeb;
  }

  .health-check h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }

  .health-check p {
    margin: 0;
    font-size: 0.9rem;
    color: #374151;
  }

  .health-check .warning {
    color: #dc2626;
    font-weight: 600;
  }

  .never-analyzed-list {
    margin-top: 0.75rem;
    font-size: 0.85rem;
  }

  .pending-strategy {
    display: inline-block;
    background: #fef3c7;
    color: #92400e;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    margin: 0.25rem;
    font-family: monospace;
    font-size: 0.8rem;
  }

  .wait-time {
    background: #dc2626;
    color: white;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    margin-left: 0.3rem;
    font-size: 0.7rem;
  }

  /* Section hint text */
  .section-hint {
    font-size: 0.9rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .no-data {
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 8px;
    color: #6b7280;
    text-align: center;
    margin-bottom: 2rem;
  }

  /* Freshness grid */
  .freshness-grid {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .freshness-card {
    background: white;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 140px;
  }

  .freshness-label {
    font-size: 0.85rem;
    color: #6b7280;
    font-weight: 500;
  }

  .freshness-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .freshness-range {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  /* Error header styling */
  .error-header {
    color: #dc2626;
    background: #fef2f2;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border-left: 4px solid #dc2626;
  }
</style>
