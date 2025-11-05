<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart } from 'chart.js/auto';
  import AdminCard from '$lib/components/AdminCard.svelte';
  
  let summary: any = $state(null);
  let articlesTrend: any = $state(null);
  let analysisTrend: any = $state(null);
  let llmTrend: any = $state(null);
  let logs: any = $state(null);
  let loading = $state(true);
  
  onMount(async () => {
    try {
      // Fetch all data in parallel
      const [summaryRes, articlesRes, analysisRes, llmRes, logsRes] = await Promise.all([
        fetch('/api/admin/summary'),
        fetch('/api/admin/trends/articles?days=10'),
        fetch('/api/admin/trends/analysis?days=10'),
        fetch('/api/admin/trends/llm?days=10'),
        fetch('/api/admin/logs/today?lines=20')
      ]);
      
      summary = await summaryRes.json();
      articlesTrend = await articlesRes.json();
      analysisTrend = await analysisRes.json();
      llmTrend = await llmRes.json();
      logs = await logsRes.json();
      
      loading = false;
      
      // Render charts after data is loaded
      setTimeout(() => {
        renderArticlesChart();
        renderAnalysisChart();
        renderLLMChart();
      }, 100);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      loading = false;
    }
  });
  
  function renderArticlesChart() {
    const ctx = document.getElementById('articlesChart') as HTMLCanvasElement;
    if (!ctx || !articlesTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: articlesTrend.dates,
        datasets: [{
          label: 'Articles Added',
          data: articlesTrend.articles_added,
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
        labels: analysisTrend.dates,
        datasets: [{
          label: 'Sections Written',
          data: analysisTrend.sections_written,
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
  
  function renderLLMChart() {
    const ctx = document.getElementById('llmChart') as HTMLCanvasElement;
    if (!ctx || !llmTrend) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: llmTrend.dates,
        datasets: [
          {
            label: 'Simple',
            data: llmTrend.simple,
            borderColor: '#8b5cf6',
            backgroundColor: 'rgba(139, 92, 246, 0.3)',
            fill: true
          },
          {
            label: 'Medium',
            data: llmTrend.medium,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            fill: true
          },
          {
            label: 'Complex',
            data: llmTrend.complex,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' }
        },
        scales: {
          y: { stacked: true }
        }
      }
    });
  }
</script>

<div class="admin-container">
  <div class="header">
    <h1>Admin Dashboard</h1>
    <a href="/dashboard" class="back-link">← Back to App</a>
  </div>
  
  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <!-- Stat Cards -->
    <div class="stats-grid">
      <AdminCard 
        title="Articles" 
        value={summary?.today?.ingestion?.articles_added} 
        subtitle="today" 
      />
      <AdminCard 
        title="Sections" 
        value={summary?.today?.analysis?.sections_written} 
        subtitle="today" 
      />
      <AdminCard 
        title="Topics" 
        value={summary?.today?.graph_state?.topics} 
        subtitle="total" 
      />
      <AdminCard 
        title="Errors" 
        value={summary?.today?.system?.errors} 
        subtitle="today" 
      />
    </div>
    
    <!-- Charts -->
    <div class="chart-container">
      <h2>📈 Articles Added (Last 10 Days)</h2>
      <div class="chart-wrapper">
        <canvas id="articlesChart"></canvas>
      </div>
    </div>
    
    <div class="chart-container">
      <h2>📝 Analysis Sections Written (Last 10 Days)</h2>
      <div class="chart-wrapper">
        <canvas id="analysisChart"></canvas>
      </div>
    </div>
    
    <div class="chart-container">
      <h2>🤖 LLM Usage (Last 10 Days)</h2>
      <div class="chart-wrapper">
        <canvas id="llmChart"></canvas>
      </div>
    </div>
    
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
  
  .back-link {
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  .back-link:hover {
    text-decoration: underline;
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
</style>
