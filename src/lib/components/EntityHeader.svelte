<!-- EntityHeader.svelte - Shared header for strategies and topics -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Props
  export let title: string;
  export let badge: string | null = null; // e.g., "📌" for default strategies
  export let badgeTitle: string = '';
  export let metadata: { label: string; value: string }[] = [];
  export let hint: string = '';

  // Action button visibility
  export let showBack: boolean = true;
  export let showEdit: boolean = false;
  export let showDelete: boolean = false;
  export let showExport: boolean = false;
  export let showToggleDefault: boolean = false;
  export let isDefault: boolean = false;

  // User input sections (for strategies)
  export let sections: { heading: string; content: string; hint?: string }[] = [];

  const dispatch = createEventDispatcher();

  function handleBack() {
    dispatch('back');
  }

  function handleEdit() {
    dispatch('edit');
  }

  function handleDelete() {
    dispatch('delete');
  }

  function handleExport() {
    dispatch('export');
  }

  function handleToggleDefault() {
    dispatch('toggleDefault');
  }
</script>

<div class="entity-info-card">
  <div class="entity-header-buttons">
    {#if showBack}
      <button class="back-button" on:click={handleBack} title="Back to Dashboard">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </button>
    {/if}

    <div class="entity-actions">
      {#if showToggleDefault}
        <button class="btn-toggle-default" on:click={handleToggleDefault}>
          {isDefault ? 'Remove Default' : 'Make Default'}
        </button>
      {/if}

      {#if showEdit}
        <button class="btn-edit" on:click={handleEdit}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Edit
        </button>
      {/if}

      {#if showDelete}
        <button class="btn-delete" on:click={handleDelete}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          Delete
        </button>
      {/if}

      {#if showExport}
        <button class="btn-export" on:click={handleExport}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          Export PDF
        </button>
      {/if}
    </div>
  </div>

  <div class="entity-header">
    <h2 class="entity-title">
      {title}
      {#if badge}
        <span class="badge-large" title={badgeTitle}>{badge}</span>
      {/if}
    </h2>

    {#if metadata.length > 0}
      <div class="entity-meta">
        {#each metadata as item, i}
          <span class="meta-item"><strong>{item.label}:</strong> {item.value}</span>
          {#if i < metadata.length - 1}
            <span class="meta-divider">•</span>
          {/if}
        {/each}
      </div>
    {/if}

    {#if hint}
      <p class="entity-hint">{hint}</p>
    {/if}
  </div>

  <!-- User Input Sections (for strategies) -->
  {#each sections as section}
    <div class="entity-section">
      <h3 class="section-heading">
        {section.heading}
        {#if section.hint}
          <span class="section-hint">{section.hint}</span>
        {/if}
      </h3>
      <p class="section-content">{section.content}</p>
    </div>
  {/each}
</div>

<style>
  .entity-info-card {
    background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, var(--hover-bg, #fafafa) 100%);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 20px;
    padding: 1.75rem 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05), 0 1px 4px rgba(0, 0, 0, 0.02);
  }

  :global(.dark) .entity-info-card {
    background: linear-gradient(145deg, var(--card-bg, #1c1c1e) 0%, #232326 100%);
    border-color: var(--border-color, #38383a);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  }

  .entity-header-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color, #e5e5e7);
  }

  :global(.dark) .entity-header-buttons {
    border-color: var(--border-color, #38383a);
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--surface-variant, #f5f5f7);
    border: 1px solid var(--border-color, #e5e5e7);
    border-radius: 10px;
    color: var(--text-color, #1d1d1f);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: var(--hover-bg, #e8e8ed);
    border-color: var(--border-hover, #d1d1d6);
  }

  :global(.dark) .back-button {
    background: var(--surface-variant, #2c2c2e);
    border-color: var(--border-color, #48484a);
    color: var(--text-color, #f5f5f7);
  }

  :global(.dark) .back-button:hover {
    background: var(--hover-bg, #3a3a3c);
  }

  .entity-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .btn-toggle-default,
  .btn-edit,
  .btn-delete,
  .btn-export {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.8125rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-toggle-default {
    background: #f0f0f2;
    color: #666;
  }

  .btn-toggle-default:hover {
    background: #e0e0e2;
  }

  .btn-edit {
    background: var(--primary, #007aff);
    color: white;
  }

  .btn-edit:hover {
    background: #0066d6;
  }

  .btn-delete {
    background: #ff3b30;
    color: white;
  }

  .btn-delete:hover {
    background: #d63029;
  }

  .btn-export {
    background: #2c3e50;
    color: white;
  }

  .btn-export:hover {
    background: #1a252f;
    transform: scale(1.02);
  }

  :global(.dark) .btn-toggle-default {
    background: #3a3a3c;
    color: #98989d;
  }

  :global(.dark) .btn-toggle-default:hover {
    background: #48484a;
  }

  .entity-header {
    margin-bottom: 1.5rem;
  }

  .entity-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-color, #1d1d1f);
    margin: 0 0 0.5rem 0;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.dark) .entity-title {
    color: var(--text-color, #f5f5f7);
  }

  .badge-large {
    font-size: 1.25rem;
  }

  .entity-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.875rem;
    color: var(--text-muted, #86868b);
    margin-bottom: 0.75rem;
  }

  .meta-item strong {
    color: var(--text-color, #1d1d1f);
    font-weight: 600;
  }

  :global(.dark) .meta-item strong {
    color: var(--text-color, #f5f5f7);
  }

  .meta-divider {
    color: var(--text-muted, #86868b);
  }

  .entity-hint {
    font-size: 0.875rem;
    color: var(--text-muted, #86868b);
    margin: 0;
    font-style: italic;
  }

  .entity-section {
    padding: 1.25rem 0;
    border-top: 1px solid var(--border-color, #e5e5e7);
  }

  :global(.dark) .entity-section {
    border-color: var(--border-color, #38383a);
  }

  .section-heading {
    font-size: 0.8125rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted, #86868b);
    margin: 0 0 0.75rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .section-hint {
    font-size: 0.75rem;
    font-weight: 400;
    font-style: italic;
    text-transform: none;
    letter-spacing: normal;
  }

  .section-content {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-color, #1d1d1f);
    margin: 0;
  }

  :global(.dark) .section-content {
    color: var(--text-color, #f5f5f7);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .entity-info-card {
      padding: 1.25rem 1rem;
      border-radius: 16px;
    }

    .entity-header-buttons {
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }

    .entity-actions {
      flex-wrap: wrap;
    }

    .entity-title {
      font-size: 1.5rem;
    }

    .entity-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .meta-divider {
      display: none;
    }
  }
</style>
