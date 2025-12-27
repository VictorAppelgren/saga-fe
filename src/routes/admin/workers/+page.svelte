<script lang="ts">
  import { onMount } from 'svelte';

  let workers: any = $state(null);
  let loading = $state(true);
  let error = $state('');

  async function fetchWorkers() {
    try {
      const response = await fetch('/api/admin/workers');
      if (response.ok) {
        workers = await response.json();
        error = '';
      } else {
        error = 'Failed to fetch worker status';
      }
    } catch (e) {
      error = 'Worker status endpoint not available yet';
    }
    loading = false;
  }

  onMount(() => {
    fetchWorkers();
    // Refresh every 10 seconds
    const interval = setInterval(fetchWorkers, 10000);
    return () => clearInterval(interval);
  });

  function getStatusColor(active: boolean): string {
    return active ? '#22c55e' : '#ef4444';
  }

  function formatSecondsAgo(seconds: number): string {
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ago`;
  }
</script>

<div class="workers-page">
  <div class="header">
    <h1>Workers</h1>
    <p class="subtitle">Active workers and their current tasks</p>
  </div>

  {#if loading}
    <div class="loading">Loading worker status...</div>
  {:else if error}
    <div class="info-box">
      <h3>Worker Status Coming Soon</h3>
      <p>{error}</p>
      <p class="hint">Worker tracking requires a backend endpoint. For now, check Docker logs:</p>
      <pre class="command">docker compose logs --tail=50 worker-main worker-sources</pre>
    </div>
  {:else if workers}
    <div class="summary-section">
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-value">{workers.total_workers || 0}</div>
          <div class="summary-label">Total Workers</div>
        </div>
        <div class="summary-card active">
          <div class="summary-value">{workers.active || 0}</div>
          <div class="summary-label">Active</div>
        </div>
        <div class="summary-card inactive">
          <div class="summary-value">{workers.inactive || 0}</div>
          <div class="summary-label">Inactive</div>
        </div>
      </div>
    </div>

    {#if workers.workers?.length > 0}
      <div class="workers-grid">
        {#each workers.workers as worker}
          <div class="worker-card" style="border-left-color: {getStatusColor(worker.active)}">
            <div class="worker-header">
              <span class="worker-name">{worker.worker_id}</span>
              <span class="worker-status" style="color: {getStatusColor(worker.active)}">
                {worker.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>

            <div class="worker-info">
              <div class="info-row">
                <span class="label">Machine:</span>
                <span class="value">{worker.machine || 'Unknown'}</span>
              </div>
              <div class="info-row">
                <span class="label">Last Seen:</span>
                <span class="value">{formatSecondsAgo(worker.seconds_ago)}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="no-workers">
        <p>No workers registered yet.</p>
        <p class="hint">Workers will appear here once they make API calls.</p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .workers-page {
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

  .loading {
    text-align: center;
    padding: 4rem;
    font-size: 1.25rem;
    color: #6b7280;
  }

  .info-box {
    background: #f0f9ff;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  .info-box h3 {
    font-size: 1.5rem;
    color: #1e40af;
    margin-bottom: 1rem;
  }

  .info-box p {
    color: #1e3a8a;
    margin-bottom: 0.5rem;
  }

  .hint {
    font-size: 0.9rem;
    color: #6b7280;
  }

  .command {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
    margin-top: 1rem;
    display: inline-block;
  }

  .summary-section {
    margin-bottom: 2rem;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .summary-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .summary-card.active {
    border-bottom: 3px solid #22c55e;
  }

  .summary-card.inactive {
    border-bottom: 3px solid #ef4444;
  }

  .summary-value {
    font-size: 2rem;
    font-weight: 700;
    color: #111827;
  }

  .summary-label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }

  .workers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .worker-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    border-left: 4px solid #6b7280;
  }

  .worker-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .worker-name {
    font-weight: 600;
    font-size: 1.1rem;
    color: #111827;
  }

  .worker-status {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
  }

  .worker-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
  }

  .label {
    color: #6b7280;
  }

  .value {
    color: #111827;
    font-weight: 500;
  }

  .no-workers {
    text-align: center;
    padding: 3rem;
    background: #f9fafb;
    border-radius: 8px;
    color: #6b7280;
  }

  .no-workers p {
    margin: 0.5rem 0;
  }
</style>
