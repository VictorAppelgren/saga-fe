<script lang="ts">
  import { theme } from '$lib/stores/theme';

  let password = '';
  let error = false;
  let unlocked = false;

  // Password gate - not highly sensitive, just a gate for investor access
  const PITCH_PASSWORD = 'xK7m9Np2Qr4s';

  function checkPassword() {
    if (password === PITCH_PASSWORD) {
      unlocked = true;
      error = false;
    } else {
      error = true;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      checkPassword();
    }
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
        <div class="pdf-actions">
          <a href="/pitch/saga_pitch_deck.pdf" download class="download-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download PDF
          </a>
          <a href="/pitch/saga_pitch_deck.pdf" target="_blank" class="view-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M19 19H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
            Open in New Tab
          </a>
        </div>

        <div class="pdf-viewer">
          <iframe
            src="/pitch/saga_pitch_deck.pdf"
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

      <div class="input-group">
        <input
          type="password"
          bind:value={password}
          placeholder="Enter password"
          on:keydown={handleKeydown}
          class:error
        />
        <button on:click={checkPassword}>Access</button>
      </div>

      {#if error}
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

  .pdf-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .download-btn,
  .view-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
  }

  .download-btn {
    background: black;
    color: white;
  }

  .dark .download-btn {
    background: white;
    color: black;
  }

  .download-btn:hover {
    background: #333;
  }

  .dark .download-btn:hover {
    background: #ddd;
  }

  .view-btn {
    background: #f0f0f0;
    color: black;
  }

  .dark .view-btn {
    background: #222;
    color: white;
  }

  .view-btn:hover {
    background: #e0e0e0;
  }

  .dark .view-btn:hover {
    background: #333;
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
</style>
