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
  let loading = $state(true);

  onMount(async () => {
    try {
      // Fetch all data in parallel
      const [summaryRes, articlesRes, analysisRes, strategyAnalysisRes, queriesRes, logsRes, distRes, recentRes] = await Promise.all([
        fetch('/api/admin/summary'),
        fetch('/api/admin/trends/articles?days=7'),
        fetch('/api/admin/trends/analysis?days=7'),
        fetch('/api/admin/trends/strategy-analysis?days=7'),
        fetch('/api/admin/trends/queries?days=7'),
        fetch('/api/admin/logs/today?lines=20'),
        fetch('/api/admin/article-distribution'),
        fetch('/api/admin/topics-recent?days=7')
      ]);

      summary = await summaryRes.json();
      articlesTrend = await articlesRes.json();
      analysisTrend = await analysisRes.json();
      strategyAnalysisTrend = await strategyAnalysisRes.json();
      queriesTrend = await queriesRes.json();
      logs = await logsRes.json();
      distribution = await distRes.json();
      recentTopics = await recentRes.json();
      
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
    <!-- Pipeline Flow Cards -->
    <h2>📊 Today's Pipeline</h2>
    <div class="stats-grid">
      <AdminCard 
        title="Queries" 
        value={summary?.pipeline?.queries} 
        subtitle="today" 
      />
      <AdminCard 
        title="Fetched" 
        value={summary?.pipeline?.fetched} 
        subtitle="from API" 
      />
      <AdminCard 
        title="Processed" 
        value={summary?.pipeline?.processed} 
        subtitle="entered pipeline" 
      />
      <AdminCard 
        title="Rejected" 
        value={summary?.pipeline?.rejected} 
        subtitle="filtered out" 
      />
      <AdminCard 
        title="Errors" 
        value={summary?.errors} 
        subtitle="today" 
      />
    </div>
    
    <!-- Tier Breakdown - Shows quality of articles added -->
    <h2>📈 Articles Added by Tier</h2>
    <div class="stats-grid">
      <AdminCard 
        title="Tier 3 Added" 
        value={summary?.tier_breakdown?.tier_3 || 0} 
        subtitle="premium (triggers analysis)" 
      />
      <AdminCard 
        title="Tier 2 Added" 
        value={summary?.tier_breakdown?.tier_2 || 0} 
        subtitle="standard (triggers analysis)" 
      />
      <AdminCard 
        title="Tier 1 Added" 
        value={summary?.tier_breakdown?.tier_1 || 0} 
        subtitle="filler" 
      />
      <AdminCard 
        title="Tier 0 Added" 
        value={summary?.tier_breakdown?.tier_0 || 0} 
        subtitle="archive" 
      />
    </div>
    
    <!-- Agent Analysis -->
    <h2>🤖 Agent Analysis</h2>
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
        title="Skipped (No New)"
        value={summary?.analysis?.skipped_no_new || 0}
        subtitle="no new Tier 3 articles"
      />
      <AdminCard
        title="Skipped (Cooldown)"
        value={summary?.analysis?.skipped_cooldown || 0}
        subtitle="< 24h since last write"
      />
      <AdminCard
        title="Sections Written"
        value={summary?.analysis?.sections || 0}
        subtitle="content generated"
      />
    </div>
    
    <!-- Strategy Analysis (Custom User Strategies) -->
    <h2>💼 Strategy Analysis</h2>
    <div class="stats-grid">
      <AdminCard 
        title="Triggered" 
        value={summary?.strategy_analysis?.triggered || 0} 
        subtitle="user strategies" 
      />
      <AdminCard 
        title="Completed" 
        value={summary?.strategy_analysis?.completed || 0} 
        subtitle="analyses done" 
      />
    </div>
    
    <!-- Capacity Management -->
    <h2>🔧 Capacity Management</h2>
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
    
    <!-- Topic Activity -->
    <h2>🏷️ Topic Activity</h2>
    <div class="stats-grid">
      <AdminCard 
        title="Suggested" 
        value={summary?.topics?.suggested || 0} 
        subtitle="LLM proposed" 
      />
      <AdminCard 
        title="Created" 
        value={summary?.topics?.created || 0} 
        subtitle="added to graph" 
      />
      <AdminCard 
        title="Rejected (Total)" 
        value={summary?.topics?.rejected || 0} 
        subtitle="failed gates" 
      />
      <AdminCard 
        title="Deleted" 
        value={summary?.topics?.deleted || 0} 
        subtitle="removed" 
      />
    </div>
    
    <!-- Topic Rejection Breakdown -->
    {#if (summary?.topics?.rejected || 0) > 0}
    <h3>📋 Rejection Breakdown</h3>
    <div class="stats-grid">
      <AdminCard
        title="No Proposal"
        value={summary?.topics?.rejected_no_proposal || 0}
        subtitle="LLM returned null"
      />
      <AdminCard
        title="Relevance"
        value={summary?.topics?.rejected_relevance || 0}
        subtitle="not trading-relevant"
      />
      <AdminCard
        title="Capacity Guard"
        value={summary?.topics?.rejected_capacity || 0}
        subtitle="quality/granularity"
      />
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

    <!-- Storage Stats -->
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
      <div class="dist-row header">
        <span class="dist-label"></span>
        <span class="dist-cell">Fundamental</span>
        <span class="dist-cell">Medium</span>
        <span class="dist-cell">Current</span>
        <span class="dist-cell total">Total</span>
        <span class="dist-cell avg">Avg/Topic</span>
      </div>
      <div class="dist-row">
        <span class="dist-label risk-label">Risk</span>
        <span class="dist-cell">{totals.fundamental.risk}</span>
        <span class="dist-cell">{totals.medium.risk}</span>
        <span class="dist-cell">{totals.current.risk}</span>
        <span class="dist-cell total">{totals.fundamental.risk + totals.medium.risk + totals.current.risk}</span>
        <span class="dist-cell avg">{((totals.fundamental.risk + totals.medium.risk + totals.current.risk) / topicCount).toFixed(1)}</span>
      </div>
      <div class="dist-row">
        <span class="dist-label opp-label">Opportunity</span>
        <span class="dist-cell">{totals.fundamental.opportunity}</span>
        <span class="dist-cell">{totals.medium.opportunity}</span>
        <span class="dist-cell">{totals.current.opportunity}</span>
        <span class="dist-cell total">{totals.fundamental.opportunity + totals.medium.opportunity + totals.current.opportunity}</span>
        <span class="dist-cell avg">{((totals.fundamental.opportunity + totals.medium.opportunity + totals.current.opportunity) / topicCount).toFixed(1)}</span>
      </div>
      <div class="dist-row">
        <span class="dist-label trend-label">Trend</span>
        <span class="dist-cell">{totals.fundamental.trend}</span>
        <span class="dist-cell">{totals.medium.trend}</span>
        <span class="dist-cell">{totals.current.trend}</span>
        <span class="dist-cell total">{totals.fundamental.trend + totals.medium.trend + totals.current.trend}</span>
        <span class="dist-cell avg">{((totals.fundamental.trend + totals.medium.trend + totals.current.trend) / topicCount).toFixed(1)}</span>
      </div>
      <div class="dist-row">
        <span class="dist-label cat-label">Catalyst</span>
        <span class="dist-cell">{totals.fundamental.catalyst}</span>
        <span class="dist-cell">{totals.medium.catalyst}</span>
        <span class="dist-cell">{totals.current.catalyst}</span>
        <span class="dist-cell total">{totals.fundamental.catalyst + totals.medium.catalyst + totals.current.catalyst}</span>
        <span class="dist-cell avg">{((totals.fundamental.catalyst + totals.medium.catalyst + totals.current.catalyst) / topicCount).toFixed(1)}</span>
      </div>
      <div class="dist-row footer">
        <span class="dist-label">Total</span>
        <span class="dist-cell">{totals.fundamental.risk + totals.fundamental.opportunity + totals.fundamental.trend + totals.fundamental.catalyst}</span>
        <span class="dist-cell">{totals.medium.risk + totals.medium.opportunity + totals.medium.trend + totals.medium.catalyst}</span>
        <span class="dist-cell">{totals.current.risk + totals.current.opportunity + totals.current.trend + totals.current.catalyst}</span>
        <span class="dist-cell total grand">{grandTotal}</span>
        <span class="dist-cell avg">{(grandTotal / topicCount).toFixed(1)}</span>
      </div>
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

  .dist-row {
    display: grid;
    grid-template-columns: 100px repeat(4, 1fr);
    gap: 0.5rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid #f3f4f6;
  }

  .dist-row.header {
    font-weight: 600;
    color: #374151;
    border-bottom: 2px solid #e5e7eb;
  }

  .dist-row.footer {
    font-weight: 600;
    border-top: 2px solid #e5e7eb;
    border-bottom: none;
    margin-top: 0.5rem;
    padding-top: 1rem;
  }

  .dist-label {
    font-weight: 500;
    color: #374151;
  }

  .dist-label.risk-label { color: #ef4444; }
  .dist-label.opp-label { color: #22c55e; }
  .dist-label.trend-label { color: #3b82f6; }
  .dist-label.cat-label { color: #f59e0b; }

  .dist-cell {
    text-align: center;
    color: #4b5563;
  }

  .dist-cell.total {
    font-weight: 600;
    color: #111827;
  }

  .dist-cell.grand {
    font-size: 1.1rem;
    color: #1976d2;
  }

  .dist-hint {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
    text-align: center;
  }

  .dist-hint a {
    color: #1976d2;
    text-decoration: none;
  }

  .dist-hint a:hover {
    text-decoration: underline;
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
</style>
