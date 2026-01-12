<!-- LeftSidebar.svelte - Watchlists and Topics navigation -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import type { Strategy } from '$lib/api/strategies';

  // Props
  export let strategies: Strategy[] = [];
  export let interests: { id: string; name: string }[] = [];
  export let user: { username: string; is_admin?: boolean } | null = null;
  export let currentSelection: { type: string; value: string };
  export let isOpen: boolean = true;
  export let isMobile: boolean = false;

  const dispatch = createEventDispatcher();

  function handleSelectStrategy(strategy: Strategy) {
    dispatch('selectStrategy', strategy);
  }

  function handleSelectInterest(interest: { id: string; name: string }) {
    dispatch('selectInterest', interest);
  }

  function handleSelectNav(value: string) {
    dispatch('selectNav', value);
  }

  function handleCreateStrategy() {
    dispatch('createStrategy');
  }
</script>

<aside class="sidebar left-sidebar" class:open={isOpen} class:mobile={isMobile}>
  <div class="logo-container">
    <a href="/dashboard" aria-label="Go to main dashboard">
      <img src="/saga-logo.svg" alt="Saga" class="logo" />
    </a>
  </div>

  <div class="scrollable-section">
    <div class="themes-section">
      <!-- WATCHLISTS SECTION -->
      <div class="section-header">
        <h3 class="section-title">
          Watchlists
          <span class="info-tooltip" title="Your investment positions and theses. Add macro-level positions you're tracking, and Saga's AI agents will monitor risks, opportunities, and relevant news for each one.">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </span>
        </h3>
        <button class="add-button" on:click={handleCreateStrategy} aria-label="Create new watchlist">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
        </button>
      </div>

      <ul class="themes-list">
        {#if strategies && strategies.length > 0}
          {#each strategies as strategy}
            <li class="strategy-list-item">
              <button
                class:active={currentSelection.type === 'strategy' && currentSelection.value === strategy.id}
                on:click={() => handleSelectStrategy(strategy)}
              >
                <div class="strategy-item">
                  <span class="strategy-asset">
                    {#if strategy.stance === 'bull'}
                      <span class="stance-indicator bull" title="Bullish view">&#8593;</span>
                    {:else if strategy.stance === 'bear'}
                      <span class="stance-indicator bear" title="Bearish view">&#8595;</span>
                    {:else}
                      <span class="stance-indicator neutral" title="Neutral / Monitoring">&#8596;</span>
                    {/if}
                    {strategy.asset}
                    {#if strategy.is_default}
                      <span class="default-badge" title="Example Strategy (Read-Only)">📌</span>
                    {:else if strategy.has_analysis}
                      <span class="analysis-badge" title="Has AI analysis">✓</span>
                    {/if}
                  </span>
                </div>
              </button>
            </li>
          {/each}
        {:else}
          <li class="empty-state">No watchlists yet</li>
        {/if}
      </ul>

      <!-- DIVIDER -->
      <div class="section-divider"></div>

      <!-- TOPICS SECTION -->
      <div class="section-header">
        <h3 class="section-title">
          Topics
          <span class="info-tooltip" title="Broader market themes and areas of interest. Track macro topics like 'Fed Policy' or 'AI Semiconductors' to stay informed on developments that may impact your positions.">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </span>
        </h3>
        <div style="width: 24px;"></div>
      </div>

      <ul class="themes-list">
        {#if interests && Array.isArray(interests)}
          {#each interests as interest}
            <li class="interest-list-item">
              <button
                class:active={currentSelection.type === 'interest' && currentSelection.value === interest.id}
                on:click={() => handleSelectInterest(interest)}
              >
                {interest.name}
              </button>
            </li>
          {/each}
        {/if}
      </ul>
    </div>
  </div>

  <ul class="nav-links">
    <li class:active={currentSelection.type === 'nav' && currentSelection.value === 'settings'}>
      <button
        class="nav-button {currentSelection.type === 'nav' && currentSelection.value === 'settings' ? 'active' : ''}"
        on:click={() => handleSelectNav('settings')}
        aria-label="Navigate to Settings"
      >
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
        </svg>
        Settings
      </button>
    </li>
  </ul>

  <div class="theme-section">
    <ThemeToggle />
  </div>

  <div class="user-section">
    <div class="user-info">
      <div class="avatar">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
      <span class="username">{user?.username || 'User'}</span>
    </div>
    {#if user?.is_admin}
      <a href="/admin" class="admin-link" title="Admin Dashboard">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </a>
    {/if}
    <button class="logout-button" aria-label="Log out">
      <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
      </svg>
    </button>
  </div>
</aside>

<style>
  .sidebar {
    height: 100vh;
    background: var(--surface-variant, #f5f5f7);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease;
  }

  .left-sidebar {
    width: 280px;
    padding: 1.5rem 0 0 1.25rem;
    border-right: 1px solid var(--border-color, #d2d2d7);
  }

  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 3rem 0 0;
    margin-bottom: 2rem;
    text-align: center;
    background: var(--surface-color, #ffffff);
  }

  .logo {
    max-width: 200px;
    width: 100%;
    height: auto;
    filter: var(--logo-filter, none);
  }

  :global(.dark) .logo {
    --logo-filter: invert(1);
  }

  .scrollable-section {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
  }

  .scrollable-section::-webkit-scrollbar {
    width: 6px;
  }

  .scrollable-section::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollable-section::-webkit-scrollbar-thumb {
    background: var(--border-color, #e0e0e0);
    border-radius: 3px;
  }

  .scrollable-section::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted, #999);
  }

  .themes-section {
    margin-bottom: 1rem;
    padding: 0 1.25rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
  }

  .section-title {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #86868b);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .info-tooltip {
    display: inline-flex;
    align-items: center;
    cursor: help;
    color: var(--text-muted, #86868b);
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .info-tooltip:hover {
    opacity: 1;
  }

  .add-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--primary, #007aff);
    border: none;
    cursor: pointer;
    color: #ffffff;
    border-radius: 8px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 122, 255, 0.3);
  }

  .add-button:hover {
    background: #0066d6;
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(0, 122, 255, 0.4);
  }

  .themes-list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
    width: 100%;
  }

  .themes-list button {
    width: 100%;
    text-align: left;
    padding: 0.625rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color, #1d1d1f);
    font-size: 0.9375rem;
    font-weight: 400;
    letter-spacing: -0.01em;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 10px 0 0 10px;
  }

  .themes-list button:hover {
    background: var(--hover-bg, #e8e8ed);
    color: var(--text-color, #1d1d1f);
  }

  .themes-list li.active button,
  .themes-list button.active {
    background: var(--bg-color, #ffffff);
    font-weight: 600;
    color: var(--primary, #007aff);
  }

  .section-divider {
    height: 1px;
    background: var(--border-color, #e0e0e0);
    margin: 1.5rem 0;
  }

  .strategy-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    position: relative;
  }

  .strategy-asset {
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }

  .stance-indicator {
    font-weight: 700;
    font-size: 0.85rem;
    line-height: 1;
  }

  .stance-indicator.bull {
    color: #22c55e;
  }

  .stance-indicator.bear {
    color: #ef4444;
  }

  .stance-indicator.neutral {
    color: #6b7280;
  }

  .default-badge {
    margin-left: 0.25rem;
  }

  .analysis-badge {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: #4caf50;
    font-weight: bold;
  }

  .empty-state {
    padding: 1rem;
    text-align: center;
    color: var(--text-muted, #666);
    font-size: 0.875rem;
    list-style: none;
  }

  .nav-links {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
  }

  .nav-links button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: var(--text-color, black);
    text-decoration: none;
    transition: background-color 0.2s;
    background: none;
    border: none;
    width: 100%;
    cursor: pointer;
    font-size: 1rem;
    border-radius: 8px 0 0 8px;
  }

  .nav-links button:hover {
    background: var(--hover-bg, #eeeeee);
    margin-right: 0;
  }

  .nav-links li.active button {
    background: var(--bg-color, white);
    margin-right: 0;
    font-weight: 500;
  }

  .icon {
    width: 20px;
    height: 20px;
    margin-right: 0.75rem;
    fill: currentColor;
  }

  .theme-section {
    padding: 1rem 2.5rem 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .user-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem 1rem 0;
    border-top: 1px solid var(--border-color, #e0e0e0);
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--text-color, black);
    color: var(--bg-color, white);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    margin-right: 0.75rem;
  }

  .username {
    font-weight: 500;
  }

  .admin-link {
    color: var(--text-color, black);
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .admin-link:hover {
    background: var(--hover-bg, #eeeeee);
  }

  .logout-button {
    color: var(--text-color, black);
    padding: 0.5rem;
    border-radius: 8px;
    transition: background-color 0.2s;
    background: none;
    border: none;
    cursor: pointer;
  }

  .logout-button:hover {
    background: var(--hover-bg, #eeeeee);
  }

  /* Mobile styles */
  .sidebar.mobile {
    position: fixed;
    top: 56px;
    bottom: 0;
    height: calc(100vh - 56px);
    height: calc(100dvh - 56px);
    width: 85vw !important;
    max-width: 320px;
    z-index: 100;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.25);
    background: var(--surface-variant, #f5f5f7);
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    touch-action: pan-y;
  }

  .left-sidebar.mobile {
    left: 0;
    transform: translateX(-100%);
  }

  .left-sidebar.mobile.open {
    transform: translateX(0);
  }

  @media (max-width: 768px) {
    .sidebar.mobile {
      position: fixed;
      top: 56px;
      bottom: 0;
      height: calc(100vh - 56px);
      height: calc(100dvh - 56px);
      width: 85vw !important;
      max-width: 320px;
      z-index: 100;
    }
  }
</style>
