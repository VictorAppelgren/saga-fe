<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let name = '';
  let thesis = '';
  let marketFocus = '';
  let isFormVisible = false;

  function toggleForm() {
    isFormVisible = !isFormVisible;
  }

  function handleSubmit() {
    if (!name || !thesis) return;
    
    dispatch('themeCreated', {
      name,
      thesis,
      marketFocus
    });

    // Reset form
    name = '';
    thesis = '';
    marketFocus = '';
    isFormVisible = false;
  }
</script>

<div class="theme-form-container">
  <button class="add-theme-button" on:click={toggleForm}>
    + Add Theme
  </button>

  {#if isFormVisible}
    <form class="theme-form" on:submit|preventDefault={handleSubmit}>
      <div class="form-group">
        <label for="name">Name <span class="required">*</span></label>
        <input 
          id="name"
          bind:value={name}
          placeholder="Enter theme name"
          required
        />
      </div>

      <div class="form-group">
        <label for="thesis">Thesis <span class="required">*</span></label>
        <textarea
          id="thesis"
          bind:value={thesis}
          placeholder="Enter your thesis"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="marketFocus">Market Focus</label>
        <input
          id="marketFocus"
          bind:value={marketFocus}
          placeholder="Enter market focus (optional)"
        />
      </div>

      <div class="form-actions">
        <button type="button" class="cancel" on:click={toggleForm}>Cancel</button>
        <button type="submit" class="submit" disabled={!name || !thesis}>Create Theme</button>
      </div>
    </form>
  {/if}
</div>

<style>
  .theme-form-container {
    margin-top: 1rem;
  }

  .add-theme-button {
    width: 100%;
    padding: 0.75rem;
    background: none;
    border: 1px dashed var(--border-color, #e0e0e0);
    border-radius: 8px;
    color: var(--text-color, black);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .add-theme-button:hover {
    background: var(--hover-bg, #eeeeee);
    border-style: solid;
  }

  .theme-form {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--card-bg, #f5f5f5);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .required {
    color: #dc3545;
  }

  input, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 4px;
    background: var(--bg-color, white);
    color: var(--text-color, black);
    font-size: 0.875rem;
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .cancel {
    background: var(--border-color, #e0e0e0);
    color: var(--text-color, black);
  }

  .submit {
    background: #007AFF;
    color: white;
  }

  .submit:disabled {
    background: #cccccc;
    cursor: default;
  }

  .cancel:hover {
    background: #d0d0d0;
  }

  .submit:hover:not(:disabled) {
    background: #0056b3;
  }
</style>
