<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { enhance } from '$app/forms';
  import { invalidateAll } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  // Use server-side unlocked state
  $: unlocked = data.unlocked;

  // Handle form submission - reload data on success
  function handleSubmit() {
    return async ({ result, update }: { result: any; update: () => Promise<void> }) => {
      if (result.type === 'success') {
        // Reload the page data to get the new unlocked state
        await invalidateAll();
      } else {
        // Show error
        await update();
      }
    };
  }
</script>

<svelte:head>
  <title>Saga - Investor Materials</title>
</svelte:head>

<div class="pitch-container" class:dark={$theme === 'dark'}>
  {#if unlocked}
    <div class="unlocked">
      <div class="header">
        <img src="/saga-logo.svg" alt="Saga" class="logo" />
        <h1>Investor Materials</h1>
      </div>

      <div class="content">
        <div class="materials-section">
          <div class="material-card">
            <div class="material-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
              </svg>
            </div>
            <h3>Pitch Deck</h3>
            <p>Our seed round investor presentation</p>
            <div class="material-actions">
              <a href="/investor/saga_pitch_deck.pdf" target="_blank" class="action-btn primary">
                View PDF
              </a>
              <a href="/investor/saga_pitch_deck.pdf" download class="action-btn secondary">
                Download
              </a>
            </div>
          </div>

          <div class="material-card">
            <div class="material-icon">
              <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
              </svg>
            </div>
            <h3>Financial Model</h3>
            <p>24-month budget and projections (Excel)</p>
            <div class="material-actions">
              <a href="/investor/saga_budget.xlsx" download class="action-btn primary">
                Download Excel
              </a>
            </div>
          </div>
        </div>

        <div class="pdf-viewer">
          <iframe
            src="/investor/saga_pitch_deck.pdf"
            title="Saga Pitch Deck"
            width="100%"
            height="100%"
          ></iframe>
        </div>
      </div>
    </div>
  {:else}
    <div class="password-gate">
      <img src="/saga-logo.svg" alt="Saga" class="logo" />
      <h1>Investor Materials</h1>
      <p class="subtitle">Enter the access code to view our pitch deck</p>

      <form method="POST" action="?/verify" use:enhance={handleSubmit}>
        <div class="input-group">
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            class:error={form?.error}
          />
          <button type="submit">Access</button>
        </div>
      </form>

      {#if form?.error}
        <p class="error-message">Incorrect password. Please try again.</p>
      {/if}

      <p class="contact">
        Need access? Contact us at <a href="mailto:info@saga-labs.com">info@saga-labs.com</a>
      </p>
    </div>
  {/if}
</div>

<style>
  .pitch-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    color: black;
    padding: 2rem;
  }

  .pitch-container.dark {
    background: black;
    color: white;
  }

  .logo {
    height: 48px;
    width: auto;
    margin-bottom: 1.5rem;
  }

  .dark .logo {
    filter: invert(1);
  }

  /* Password Gate Styles */
  .password-gate {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 400px;
  }

  .password-gate h1 {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .subtitle {
    color: #666;
    margin-bottom: 2rem;
  }

  .dark .subtitle {
    color: #999;
  }

  form {
    width: 100%;
  }

  .input-group {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    margin-bottom: 1rem;
  }

  .input-group input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    background: white;
    color: black;
    outline: none;
    transition: border-color 0.2s;
  }

  .dark .input-group input {
    background: #111;
    color: white;
    border-color: #333;
  }

  .input-group input:focus {
    border-color: black;
  }

  .dark .input-group input:focus {
    border-color: white;
  }

  .input-group input.error {
    border-color: #dc3545;
  }

  .input-group button {
    padding: 0.75rem 1.5rem;
    background: black;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dark .input-group button {
    background: white;
    color: black;
  }

  .input-group button:hover {
    background: #333;
  }

  .dark .input-group button:hover {
    background: #ddd;
  }

  .error-message {
    color: #dc3545;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .contact {
    font-size: 0.875rem;
    color: #666;
  }

  .dark .contact {
    color: #999;
  }

  .contact a {
    color: inherit;
    text-decoration: underline;
  }

  /* Unlocked View Styles */
  .unlocked {
    width: 100%;
    max-width: 1200px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 1rem;
  }

  .unlocked .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .dark .unlocked .header {
    border-color: #333;
  }

  .unlocked .header .logo {
    height: 32px;
    margin-bottom: 0;
  }

  .unlocked .header h1 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .pdf-viewer {
    flex: 1;
    min-height: 0;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }

  .dark .pdf-viewer {
    border-color: #333;
  }

  .pdf-viewer iframe {
    border: none;
    display: block;
  }

  /* Material cards section */
  .materials-section {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .material-card {
    flex: 1;
    min-width: 280px;
    max-width: 400px;
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 12px;
    background: #fafafa;
    transition: all 0.2s;
  }

  .dark .material-card {
    background: #111;
    border-color: #333;
  }

  .material-card:hover {
    border-color: #999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .dark .material-card:hover {
    border-color: #555;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }

  .material-icon {
    margin-bottom: 1rem;
    color: #333;
  }

  .dark .material-icon {
    color: #ccc;
  }

  .material-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .material-card p {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .dark .material-card p {
    color: #999;
  }

  .material-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }

  .action-btn.primary {
    background: black;
    color: white;
  }

  .dark .action-btn.primary {
    background: white;
    color: black;
  }

  .action-btn.primary:hover {
    background: #333;
  }

  .dark .action-btn.primary:hover {
    background: #ddd;
  }

  .action-btn.secondary {
    background: #e8e8e8;
    color: black;
  }

  .dark .action-btn.secondary {
    background: #333;
    color: white;
  }

  .action-btn.secondary:hover {
    background: #ddd;
  }

  .dark .action-btn.secondary:hover {
    background: #444;
  }
</style>
