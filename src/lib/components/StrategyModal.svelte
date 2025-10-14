<script lang="ts">
  import type { StrategyDetail } from '$lib/api/strategies';
  
  export let mode: 'create' | 'edit' = 'create';
  export let strategy: StrategyDetail | null = null;
  export let onSave: (data: any) => void;
  export let onCancel: () => void;
  
  let asset_primary = strategy?.asset.primary || '';
  let strategy_text = strategy?.user_input.strategy_text || '';
  let position_text = strategy?.user_input.position_text || '';
  let target = strategy?.user_input.target || '';
  
  function handleSubmit() {
    onSave({
      asset_primary,
      strategy_text,
      position_text,
      target
    });
  }
</script>

<div class="modal-overlay" on:click={onCancel} role="presentation">
  <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true">
    <h2>{mode === 'create' ? 'Create New Strategy' : 'Edit Strategy'}</h2>
    
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="asset">
          Asset <span class="required">*</span>
        </label>
        <input 
          id="asset"
          type="text" 
          bind:value={asset_primary} 
          placeholder="e.g., EURUSD, AAPL, BTC" 
          required 
          disabled={mode === 'edit'}
        />
        <span class="help-text">The primary asset for this strategy</span>
      </div>
      
      <div class="form-group">
        <label for="strategy">
          Strategy Thesis <span class="required">*</span>
        </label>
        <textarea 
          id="strategy"
          bind:value={strategy_text} 
          placeholder="Describe your investment thesis, market view, and reasoning..."
          rows="6"
          required
        ></textarea>
        <span class="help-text">Your analysis and reasoning for this trade</span>
      </div>
      
      <div class="form-group">
        <label for="position">
          Target Outlook
        </label>
        <textarea 
          id="position"
          bind:value={position_text} 
          placeholder="If in a position: entry, size, stop loss. If monitoring: expected price action..."
          rows="4"
        ></textarea>
        <span class="help-text">Position details if active, or outlook if monitoring (optional)</span>
      </div>
      
      <div class="form-group">
        <label for="target">
          Target
        </label>
        <input 
          id="target"
          type="text" 
          bind:value={target} 
          placeholder="e.g., 1.1200, $180, 50000 (optional)" 
        />
        <span class="help-text">Your price target or expected level (optional)</span>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn-secondary" on:click={onCancel}>
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {mode === 'create' ? 'Create Strategy' : 'Save Changes'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }
  
  .modal-content {
    background: var(--card-bg, white);
    border-radius: 12px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }
  
  h2 {
    margin: 0 0 1.5rem 0;
    color: var(--text-color, black);
    font-size: 1.5rem;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: var(--text-color, black);
  }
  
  .required {
    color: #e53935;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: var(--bg-color, white);
    color: var(--text-color, black);
    transition: border-color 0.2s;
  }
  
  input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary, #1976d2);
  }
  
  input:disabled {
    background: var(--hover-bg, #f5f5f5);
    cursor: not-allowed;
  }
  
  textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .help-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--text-muted, #666);
  }
  
  .modal-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color, #e0e0e0);
  }
  
  button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-secondary {
    background: var(--hover-bg, #f5f5f5);
    color: var(--text-color, black);
  }
  
  .btn-secondary:hover {
    background: var(--border-color, #e0e0e0);
  }
  
  .btn-primary {
    background: var(--primary, #1976d2);
    color: white;
  }
  
  .btn-primary:hover {
    background: #1565c0;
  }
</style>
