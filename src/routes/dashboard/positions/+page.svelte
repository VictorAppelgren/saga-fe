<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getPositions,
    getPortfolioStats,
    getActiveSignals,
    createPosition,
    closePosition,
    type Position,
    type PortfolioStats,
    type ActiveSignal
  } from '$lib/api/positions';

  export let data: { user: { username: string } };

  // State
  let positions: Position[] = [];
  let stats: PortfolioStats | null = null;
  let activeSignals: ActiveSignal[] = [];
  let loading = true;
  let error = '';

  // Modals
  let showEntryModal = false;
  let showExitModal = false;
  let selectedSignal: ActiveSignal | null = null;
  let selectedPosition: Position | null = null;

  // Entry form state
  let entryPrice = '';
  let entryDirection: 'long' | 'short' = 'long';
  let entryTarget = '';
  let entryStopLoss = '';
  let entryNotes = '';
  let entryLoading = false;
  let entryError = '';

  // Exit form state
  let exitPrice = '';
  let exitReason: 'target_reached' | 'stop_hit' | 'manual' | 'ai_suggested' = 'manual';
  let exitNotes = '';
  let exitLoading = false;
  let exitError = '';

  $: username = data.user?.username || '';
  $: openPositions = positions.filter(p => p.status === 'open');
  $: closedPositions = positions.filter(p => p.status === 'closed');

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    if (!username) return;

    loading = true;
    error = '';

    try {
      const [posRes, statsRes, signalsRes] = await Promise.all([
        getPositions(username),
        getPortfolioStats(username),
        getActiveSignals(username),
      ]);
      positions = posRes.positions || [];
      stats = statsRes;
      activeSignals = signalsRes.active_signals || [];
    } catch (e: any) {
      error = e.message || 'Failed to load data';
    } finally {
      loading = false;
    }
  }

  function openEntryModal(signal: ActiveSignal) {
    selectedSignal = signal;
    entryPrice = signal.signal.market_price_at_detection || '';
    entryDirection = signal.stance === 'bear' ? 'short' : 'long';
    entryTarget = '';
    entryStopLoss = '';
    entryNotes = '';
    entryError = '';
    showEntryModal = true;
  }

  function openExitModal(position: Position) {
    selectedPosition = position;
    exitPrice = '';
    exitReason = 'manual';
    exitNotes = '';
    exitError = '';
    showExitModal = true;
  }

  async function handleEntry() {
    if (!selectedSignal || !entryPrice) {
      entryError = 'Entry price is required';
      return;
    }

    entryLoading = true;
    entryError = '';

    try {
      await createPosition(username, {
        strategy_id: selectedSignal.strategy_id,
        entry_price: parseFloat(entryPrice),
        direction: entryDirection,
        target_price: entryTarget ? parseFloat(entryTarget) : null,
        stop_loss: entryStopLoss ? parseFloat(entryStopLoss) : null,
        notes: entryNotes,
      });

      showEntryModal = false;
      await loadData();
    } catch (e: any) {
      entryError = e.message || 'Failed to create position';
    } finally {
      entryLoading = false;
    }
  }

  async function handleExit() {
    if (!selectedPosition || !exitPrice) {
      exitError = 'Exit price is required';
      return;
    }

    exitLoading = true;
    exitError = '';

    try {
      await closePosition(username, selectedPosition.position_id, {
        exit_price: parseFloat(exitPrice),
        exit_reason: exitReason,
        notes: exitNotes,
      });

      showExitModal = false;
      await loadData();
    } catch (e: any) {
      exitError = e.message || 'Failed to close position';
    } finally {
      exitLoading = false;
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatPrice(price: number | string | null | undefined): string {
    if (price === null || price === undefined) return '-';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return num.toFixed(4);
  }
</script>

<div class="positions-page">
  <!-- Header -->
  <div class="page-header">
    <h1>Positions</h1>
    <a href="/dashboard" class="back-link">Back to Dashboard</a>
  </div>

  {#if loading}
    <div class="loading">Loading...</div>
  {:else if error}
    <div class="error-message">{error}</div>
  {:else}
    <!-- Stats Bar -->
    {#if stats}
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{stats.open_count}</span>
          <span class="stat-label">Open</span>
        </div>
        <div class="stat">
          <span class="stat-value {stats.total_pnl_percent >= 0 ? 'positive' : 'negative'}">
            {stats.total_pnl_percent >= 0 ? '+' : ''}{stats.total_pnl_percent}%
          </span>
          <span class="stat-label">Total P&L</span>
        </div>
        <div class="stat">
          <span class="stat-value">{stats.win_rate}%</span>
          <span class="stat-label">Win Rate</span>
        </div>
        <div class="stat">
          <span class="stat-value">{stats.signal_accuracy}%</span>
          <span class="stat-label">Signal Accuracy</span>
        </div>
      </div>
    {/if}

    <!-- Active Signals -->
    {#if activeSignals.length > 0}
      <section class="section">
        <h2>Pending Signals ({activeSignals.length})</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Current</th>
                <th>Suggested</th>
                <th>Confidence</th>
                <th>Reasoning</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {#each activeSignals as signal}
                <tr class="signal-row">
                  <td class="asset">{signal.asset}</td>
                  <td>{signal.current_status || 'monitoring'}</td>
                  <td class="suggested {signal.signal.status}">
                    {signal.signal.status === 'enter' ? 'ENTER' : 'EXIT'}
                  </td>
                  <td class="confidence {signal.signal.confidence || ''}">
                    {signal.signal.confidence || '-'}
                  </td>
                  <td class="reasoning">{signal.signal.reasoning || '-'}</td>
                  <td>
                    {#if signal.signal.status === 'enter'}
                      <button class="btn btn-enter" on:click={() => openEntryModal(signal)}>
                        Enter
                      </button>
                    {:else}
                      <button class="btn btn-exit" on:click={() => {
                        const pos = openPositions.find(p => p.strategy_id === signal.strategy_id);
                        if (pos) openExitModal(pos);
                      }}>
                        Exit
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {/if}

    <!-- Open Positions -->
    <section class="section">
      <h2>Open Positions ({openPositions.length})</h2>
      {#if openPositions.length === 0}
        <p class="empty">No open positions</p>
      {:else}
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Direction</th>
                <th>Entry</th>
                <th>Target</th>
                <th>Stop</th>
                <th>Entered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {#each openPositions as position}
                <tr>
                  <td class="asset">{position.asset}</td>
                  <td class="direction {position.direction}">{position.direction}</td>
                  <td>{formatPrice(position.entry.price)}</td>
                  <td>{formatPrice(position.target_price)}</td>
                  <td>{formatPrice(position.stop_loss)}</td>
                  <td>{formatDate(position.entry.timestamp)}</td>
                  <td>
                    <button class="btn btn-exit" on:click={() => openExitModal(position)}>
                      Exit
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>

    <!-- Closed Positions -->
    <section class="section">
      <h2>Position History ({closedPositions.length})</h2>
      {#if closedPositions.length === 0}
        <p class="empty">No closed positions yet</p>
      {:else}
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Direction</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>P&L</th>
                <th>Duration</th>
                <th>AI Signal</th>
              </tr>
            </thead>
            <tbody>
              {#each closedPositions as position}
                <tr>
                  <td class="asset">{position.asset}</td>
                  <td class="direction {position.direction}">{position.direction}</td>
                  <td>{formatPrice(position.entry.price)}</td>
                  <td>{formatPrice(position.exit?.price)}</td>
                  <td class="pnl {position.performance?.outcome || ''}">
                    {position.performance?.pnl_percent !== undefined
                      ? `${position.performance.pnl_percent >= 0 ? '+' : ''}${position.performance.pnl_percent}%`
                      : '-'}
                  </td>
                  <td>{position.performance?.duration_days ?? '-'}d</td>
                  <td class="signal-result">
                    {#if position.entry.suggested_by_ai}
                      {position.performance?.outcome === 'win' ? '✅' : '❌'}
                    {:else}
                      -
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>
  {/if}
</div>

<!-- Entry Modal -->
{#if showEntryModal && selectedSignal}
  <div class="modal-overlay" on:click={() => showEntryModal = false} on:keydown={(e) => e.key === 'Escape' && (showEntryModal = false)} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog">
      <h2>Enter Position</h2>

      <div class="signal-summary">
        <span class="asset">{selectedSignal.asset}</span>
        <span class="confidence {selectedSignal.signal.confidence || ''}">{selectedSignal.signal.confidence || 'medium'}</span>
      </div>

      {#if selectedSignal.signal.reasoning}
        <div class="reasoning-box">
          <strong>Why enter:</strong> {selectedSignal.signal.reasoning}
        </div>
      {/if}

      {#if selectedSignal.signal.key_factors?.length}
        <ul class="factors">
          {#each selectedSignal.signal.key_factors as factor}
            <li>{factor}</li>
          {/each}
        </ul>
      {/if}

      <div class="form">
        <div class="field">
          <label for="entry-price">Entry Price</label>
          <input id="entry-price" type="number" step="0.0001" bind:value={entryPrice} placeholder="e.g., 1.0892" />
          <small>Market at signal: {selectedSignal.signal.market_price_at_detection || 'N/A'}</small>
        </div>

        <div class="field">
          <label>Direction</label>
          <div class="direction-buttons">
            <button
              class:selected={entryDirection === 'long'}
              on:click={() => entryDirection = 'long'}
            >Long</button>
            <button
              class:selected={entryDirection === 'short'}
              on:click={() => entryDirection = 'short'}
            >Short</button>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="entry-target">Target (optional)</label>
            <input id="entry-target" type="number" step="0.0001" bind:value={entryTarget} />
          </div>
          <div class="field">
            <label for="entry-stop">Stop Loss (optional)</label>
            <input id="entry-stop" type="number" step="0.0001" bind:value={entryStopLoss} />
          </div>
        </div>

        <div class="field">
          <label for="entry-notes">Notes (optional)</label>
          <textarea id="entry-notes" bind:value={entryNotes} rows="2"></textarea>
        </div>
      </div>

      {#if entryError}
        <div class="error">{entryError}</div>
      {/if}

      <div class="actions">
        <button class="btn btn-cancel" on:click={() => showEntryModal = false}>Cancel</button>
        <button class="btn btn-confirm" on:click={handleEntry} disabled={entryLoading}>
          {entryLoading ? 'Creating...' : 'Confirm Entry'}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Exit Modal -->
{#if showExitModal && selectedPosition}
  <div class="modal-overlay" on:click={() => showExitModal = false} on:keydown={(e) => e.key === 'Escape' && (showExitModal = false)} role="button" tabindex="0">
    <div class="modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog">
      <h2>Exit Position</h2>

      <div class="position-summary">
        <span class="asset">{selectedPosition.asset}</span>
        <span class="direction {selectedPosition.direction}">{selectedPosition.direction}</span>
        <span>Entry: {formatPrice(selectedPosition.entry.price)}</span>
      </div>

      <div class="form">
        <div class="field">
          <label for="exit-price">Exit Price</label>
          <input id="exit-price" type="number" step="0.0001" bind:value={exitPrice} placeholder="e.g., 1.1150" />
        </div>

        <div class="field">
          <label for="exit-reason">Exit Reason</label>
          <select id="exit-reason" bind:value={exitReason}>
            <option value="manual">Manual Decision</option>
            <option value="target_reached">Target Reached</option>
            <option value="stop_hit">Stop Hit</option>
            <option value="ai_suggested">AI Suggested</option>
          </select>
        </div>

        <div class="field">
          <label for="exit-notes">Notes (optional)</label>
          <textarea id="exit-notes" bind:value={exitNotes} rows="2"></textarea>
        </div>
      </div>

      {#if exitError}
        <div class="error">{exitError}</div>
      {/if}

      <div class="actions">
        <button class="btn btn-cancel" on:click={() => showExitModal = false}>Cancel</button>
        <button class="btn btn-exit" on:click={handleExit} disabled={exitLoading}>
          {exitLoading ? 'Closing...' : 'Confirm Exit'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .positions-page {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .back-link {
    color: var(--text-muted, #6b7280);
    text-decoration: none;
    font-size: 0.875rem;
  }

  .back-link:hover {
    color: var(--text, #fff);
  }

  .loading, .error-message {
    text-align: center;
    padding: 2rem;
  }

  .error-message {
    color: #ef4444;
  }

  /* Stats Bar */
  .stats-bar {
    display: flex;
    gap: 2rem;
    padding: 1rem 1.5rem;
    background: var(--card-bg, #1f1f1f);
    border-radius: 12px;
    margin-bottom: 2rem;
    border: 1px solid var(--border, #333);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .stat-value.positive { color: #22c55e; }
  .stat-value.negative { color: #ef4444; }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-muted, #6b7280);
    text-transform: uppercase;
  }

  /* Sections */
  .section {
    margin-bottom: 2rem;
  }

  .section h2 {
    font-size: 1rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .empty {
    color: var(--text-muted, #6b7280);
    font-style: italic;
  }

  /* Tables */
  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th, td {
    padding: 0.75rem 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border, #333);
  }

  th {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--text-muted, #6b7280);
    font-weight: 500;
  }

  .signal-row {
    background: rgba(59, 130, 246, 0.05);
  }

  .asset {
    font-weight: 600;
  }

  .direction.long { color: #22c55e; }
  .direction.short { color: #ef4444; }

  .suggested.enter { color: #22c55e; font-weight: 600; }
  .suggested.exit { color: #ef4444; font-weight: 600; }

  .confidence.high { color: #22c55e; }
  .confidence.medium { color: #f59e0b; }
  .confidence.low { color: #6b7280; }

  .reasoning {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pnl.win { color: #22c55e; }
  .pnl.loss { color: #ef4444; }

  /* Buttons */
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .btn-enter {
    background: #22c55e;
    color: white;
  }

  .btn-exit {
    background: #ef4444;
    color: white;
  }

  .btn-cancel {
    background: transparent;
    border: 1px solid var(--border, #333);
    color: var(--text, #fff);
  }

  .btn-confirm {
    background: #22c55e;
    color: white;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: var(--card-bg, #1f1f1f);
    border-radius: 12px;
    padding: 1.5rem;
    max-width: 480px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid var(--border, #333);
  }

  .modal h2 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
  }

  .signal-summary, .position-summary {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 0.75rem;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .reasoning-box {
    font-size: 0.875rem;
    padding: 0.75rem;
    background: var(--hover-bg, #2a2a2a);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .factors {
    font-size: 0.875rem;
    margin: 0 0 1rem 1.25rem;
    padding: 0;
  }

  .factors li {
    margin-bottom: 0.25rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .field label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .field input, .field textarea, .field select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border, #333);
    border-radius: 6px;
    background: var(--input-bg, #2a2a2a);
    color: var(--text, #fff);
    font-size: 0.875rem;
  }

  .field small {
    color: var(--text-muted, #6b7280);
    font-size: 0.75rem;
  }

  .field-row {
    display: flex;
    gap: 1rem;
  }

  .field-row .field {
    flex: 1;
  }

  .direction-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .direction-buttons button {
    flex: 1;
    padding: 0.5rem;
    border: 2px solid var(--border, #333);
    border-radius: 6px;
    background: transparent;
    color: var(--text, #fff);
    cursor: pointer;
  }

  .direction-buttons button.selected {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
  }

  .error {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .actions .btn-cancel {
    flex: 1;
  }

  .actions .btn-confirm, .actions .btn-exit {
    flex: 2;
  }
</style>
