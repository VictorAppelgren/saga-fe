<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';
  import AdminCard from '$lib/components/AdminCard.svelte';
  
  let summary: any = $state(null);
  let articlesTrend: any = $state(null);
  let queriesTrend: any = $state(null);
  let graphTrend: any = $state(null);
  let logs: any = $state(null);
  let loading = $state(true);
  
  onMount(async () => {
    try {
      // Fetch all data in parallel
      const [summaryRes, articlesRes, queriesRes, graphRes, logsRes] = await Promise.all([
        fetch('/api/admin/summary'),
        fetch('/api/admin/trends/articles?days=7'),
        fetch('/api/admin/trends/queries?days=7'),
        fetch('/api/admin/trends/graph?days=7'),
        fetch('/api/admin/logs/today?lines=20')
      ]);
      
      summary = await summaryRes.json();
      articlesTrend = await articlesRes.json();
      queriesTrend = await queriesRes.json();
      graphTrend = await graphRes.json();
      logs = await logsRes.json();
      
      loading = false;
      
      // Render charts after data is loaded
      setTimeout(() => {
        renderQueriesChart();
        renderArticlesChart();
        renderTopicsChart();
        renderGraphArticlesChart();
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
          data: [...articlesTrend.articles_added],  // Clone array
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
  
  function renderTopicsChart() {
    const ctx = document.getElementById('topicsChart') as HTMLCanvasElement;
    if (!ctx || !graphTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...graphTrend.dates],  // Clone array
        datasets: [{
          label: 'Total Topics',
          data: [...graphTrend.topics],  // Clone array
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
  
  function renderGraphArticlesChart() {
    const ctx = document.getElementById('graphArticlesChart') as HTMLCanvasElement;
    if (!ctx || !graphTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...graphTrend.dates],  // Clone array
        datasets: [{
          label: 'Total Articles in Graph',
          data: [...graphTrend.articles],  // Clone array
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
    <div class="stats-grid">
      <AdminCard 
        title="Queries" 
        value={summary?.today?.ingestion?.queries} 
        subtitle="today" 
      />
      <AdminCard 
        title="Articles Added" 
        value={summary?.today?.ingestion?.articles_added} 
        subtitle="today" 
      />
      <AdminCard 
        title="Rewrites" 
        value={summary?.today?.analysis?.rewrite_succeeded} 
        subtitle="today" 
      />
      <AdminCard 
        title="Errors" 
        value={summary?.today?.system?.errors} 
        subtitle="today" 
      />
    </div>
    
    <!-- Graph State Cards -->
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
        title="Orphans" 
        value={summary?.graph_state?.orphans?.articles} 
        subtitle="articles" 
      />
    </div>
    
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
        <h2>🕸️ Total Topics Over Time (Last 7 Days)</h2>
        <div class="chart-wrapper">
          <canvas id="topicsChart"></canvas>
        </div>
      </div>
      
      <div class="chart-container">
        <h2>📚 Total Articles in Graph (Last 7 Days)</h2>
        <div class="chart-wrapper">
          <canvas id="graphArticlesChart"></canvas>
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
          <li>Articles Added: {articlesTrend?.articles_added?.[0] || 0}</li>
          <li>Total Topics: {graphTrend?.topics?.[0] || 0}</li>
          <li>Total Articles: {graphTrend?.articles?.[0] || 0}</li>
        </ul>
      </div>
    {/if}
    
    <!-- Logs -->
    <div class="logs-container">
      <h2>📋 Recent Logs ({logs?.lines?.length || 0} lines)</h2>
      <pre>{logs?.lines?.join('\n') || 'No logs available'}</pre>
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
</style>
