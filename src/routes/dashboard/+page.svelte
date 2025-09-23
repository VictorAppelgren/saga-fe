<script lang="ts">
  // Robust API base: use env if available, fallback to backend default, fallback to window.location.origin
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://0.0.0.0:8000';

  // Simple markdown renderer: bold, headings, bullets, spacing
  import { simpleMarkdown } from '$lib/utils/simpleMarkdown';
  import { linkifyIds } from '$lib/utils/linkifyIds';
  import { getArticle } from '../api/articles';
  import { getReport } from '$lib/api/reports';
  // simpleMarkdown is now imported from utils for DRYness.

  // Remove linkifyInsightText - we'll use linkifyIds from utils

  import { onMount, afterUpdate } from 'svelte';
  import type { Theme, HistoryEntry } from '$lib/types/storage';
  // Remove Asset import - using interests now
  import ThemeReview from '$lib/components/ThemeReview.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ThemeInfo from '$lib/components/ThemeInfo.svelte';
  import Chat from '$lib/components/Chat.svelte';

  // --- STRATEGY API ---
  let strategyText = '';
  let loadingStrategy = false;
  let savingStrategy = false;
  let strategyError = '';

  async function fetchStrategy() {
    if (currentSelection.type !== 'strategy' || !currentSelection.value) return;
    loadingStrategy = true;
    strategyError = '';
    try {
      const res = await fetch(`${API_BASE}/strategy/${currentSelection.value}`);
      if (!res.ok) throw new Error('Could not fetch strategy.');
      const data = await res.json();
      strategyText = data.strategy || '';
    } catch (e) {
      strategyError = 'Failed to load strategy.';
      strategyText = '';
    } finally {
      loadingStrategy = false;
    }
  }

  async function saveStrategy() {
    if (!currentSelection.value) return;
    savingStrategy = true;
    strategyError = '';
    try {
      const res = await fetch(`${API_BASE}/strategy/${currentSelection.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: strategyText, research_domains: [] })
      });
      if (!res.ok) throw new Error('Could not save strategy.');
      // Optionally show a success message
    } catch (e) {
      strategyError = 'Failed to save strategy.';
    } finally {
      savingStrategy = false;
    }
  }

  // Watch for strategy section open/change
  $: if (currentSelection.type === 'strategy' && currentSelection.value) {
    fetchStrategy();
  }

  export let data;
// data.assets is now populated from the backend API for sidebar rendering.


  let historyEntries: HistoryEntry[] = [];
  let groupedHistory: Record<string, HistoryEntry[]> = {};

  // --- Tabbed Report/Article State ---
  type Tab = {
    type: 'report' | 'article',
    id: string,
    label: string,
    content: string,
    loading: boolean
  };

  let tabs: Tab[] = [
    { type: 'report', id: '', label: 'Report', content: '', loading: false }
  ];
  let activeTabIdx = 0;

  // Helper: open or focus a tab
  // Open a new tab or focus an existing one for articles only
async function openTab(type: 'article', id: string, label: string) {
    const idx = tabs.findIndex(t => t.type === type && t.id === id);
    if (idx !== -1) {
      activeTabIdx = idx;
      return;
    }
    // Add new tab
    tabs = [...tabs, { type, id, label, content: '', loading: true }];
    activeTabIdx = tabs.length - 1;
    // Fetch content
    try {
      if (type === 'article') {
        const data = await getArticle(id);
        // Enhanced article rendering with proper styling
        let articleHtml = `
          <div class="article-card">
            <div class="article-section">
              <h1 class="section-title-main">${data.title}</h1>
            </div>
            
            ${data.summary ? `
            <div class="article-section">
              <h3 class="section-title"><strong>Summary</strong></h3>
              <div class="summary-content">${data.summary}</div>
            </div>` : ''}
            
            <div class="article-section">
              <h3 class="section-title"><strong>Article Details</strong></h3>
              ${data.url ? `<div class="metadata-row"><strong>URL:</strong> <a href="${data.url}" target="_blank" rel="noopener">${data.url}</a></div>` : ''}
              ${data.published_date ? `<div class="metadata-row"><strong>Published:</strong> ${new Date(data.published_date).toLocaleDateString()}</div>` : ''}
            </div>
          </div>
        `;
        tabs[activeTabIdx].content = articleHtml;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load tab content:', e);
      tabs[activeTabIdx].content = 'Failed to load content.';
    } finally {
      tabs[activeTabIdx].loading = false;
      tabs = [...tabs]; // trigger reactivity
    }
  }

  function closeTab(idx: number) {
    if (idx === 0) return; // Don't close Report
    tabs = tabs.slice(0, idx).concat(tabs.slice(idx + 1));
    if (activeTabIdx >= idx) {
      activeTabIdx = Math.max(0, activeTabIdx - 1);
    }
  }

  function selectTab(idx: number) {
    activeTabIdx = idx;
  }

  // Intercept clicks on article links in markdown
function handleTabLinkClick(event: MouseEvent) {
  let target = event.target as HTMLElement;
  // Traverse up in case the click is on a <b> or child inside <a>
  while (target && target !== event.currentTarget) {
    if (target.tagName === 'A') {
      const articleId = target.getAttribute('data-article-id');
      if (articleId) {
        event.preventDefault();
        event.stopPropagation();
        openTab('article', articleId, `Article ${articleId}`);
        return;
      }
    }
    target = target.parentElement;
  }
}



  async function loadHistory() {
    const response = await fetch('/api/history');
    const data = await response.json();
    historyEntries = data.entries || [];
  }

  function formatTimestamp(isoString: string): { date: string, time: string } {
    const date = new Date(isoString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateStr = '';
    if (date.toDateString() === now.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    } else {
      dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Stockholm'
    });

    return { date: dateStr, time: timeStr };
  }

  function groupHistoryByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
    return entries.reduce((groups, entry) => {
      const { date } = formatTimestamp(entry.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
      return groups;
    }, {} as Record<string, HistoryEntry[]>);
  }

  onMount(async () => {
    await loadHistory();
  });

  type Selection = { type: 'theme' | 'nav' | 'interest'; value: string };

  let currentSelection: Selection = { type: 'nav', value: 'dashboard' };

  function selectInterest(interest: any): void {
    currentSelection = { type: 'interest', value: interest.id };
  }

  function selectTheme(theme: Theme): void {
    currentSelection = { type: 'theme', value: theme.id };
  }

  function selectNav(value: string): void {
    currentSelection = { type: 'nav', value };
  }

  $: themeForDisplay = null;

  let selectedFilter = 'all';

  function filterHistory(filter: string) {
    selectedFilter = filter.toLowerCase();
  }

  $: filteredHistory = Object.entries(groupedHistory).map(([date, entries]) => ({
    date,
    items: entries.filter(item =>
      selectedFilter === 'all' ||
      (selectedFilter === 'changes' && item.type === 'theme') ||
      (selectedFilter === 'system' && item.type === 'system')
    )
  })).filter(group => group.items.length > 0);
</script>



<div class="app-container">
  <div class="dashboard-container">
  <!-- Sidebar Navigation -->
  <nav class="sidebar">
    <div class="logo-container">
      <img src="/argos-logo-black.png" alt="Argos Intelligence Logo" class="logo" />
    </div>
    
    <div class="themes-section">
       <ul class="themes-list">
        {#if data && data.interests && Array.isArray(data.interests)}
          {#each data.interests as interest}
            <li class="interest-list-item">
              <button class:active={currentSelection.type === 'interest' && currentSelection.value === interest.id}
                      on:click={() => selectInterest(interest)}>
                {interest.name}
              </button>
            </li>
          {/each}
        {/if}
      </ul>
      
    </div>

    <div class="sidebar-spacer"></div>

    <ul class="nav-links">
      <li class:active={currentSelection.type === 'nav' && currentSelection.value === 'history'}>
        <button
          class="nav-button {currentSelection.type === 'nav' && currentSelection.value === 'history' ? 'active' : ''}"
          on:click={() => selectNav('history')}
          aria-label="Navigate to History"
        >
          <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
          </svg>
          History
        </button>
      </li>
      <li class:active={currentSelection.type === 'nav' && currentSelection.value === 'settings'}>
        <button
          class="nav-button {currentSelection.type === 'nav' && currentSelection.value === 'settings' ? 'active' : ''}"
          on:click={() => selectNav('settings')}
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
        <div class="avatar">{data.user?.username?.[0]?.toUpperCase() || 'U'}</div>
        <span class="username">{data.user?.username || 'User'}</span>
      </div>
      <button class="logout-button" aria-label="Log out">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
      </button>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="main-content scrollable-main">
    {#if themeForDisplay}
      <div class="theme-header">
        <div class="spacer"></div>
      </div>
      <ThemeInfo theme={themeForDisplay} />
      <ThemeReview theme={themeForDisplay} />
    {:else if currentSelection.type === 'interest'}
      <section class="card asset-info-box asset-info-theme wide-box">
        <h2 class="asset-dashboard-title">{data?.interests?.find(i => i?.id === currentSelection?.value)?.name || 'No topic'}</h2>
        <div class="info-row"><span class="info-label">Type:</span> <span class="info-value">Research Topic</span></div>
      </section>
      <!-- Tab bar and tab content area remain below for asset view -->
      <div class="tab-bar" style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
        {#each tabs as tab, idx}
          <button
            class="strategy-save-btn tab-button {activeTabIdx === idx ? 'active' : ''}"
            style="max-width:unset; width:auto; border-radius:12px 12px 0 0; margin-bottom:-1.5px; position:relative; padding-right:2.2em;"
            on:click={() => selectTab(idx)}
          >
            {tab.label}
            {#if idx !== 0}
              <span
                class="tab-close"
                style="position:absolute; right:0.6em; top:0.5em; color:var(--text-muted,#888); font-size:1.1em; cursor:pointer;"
                on:click|stopPropagation={() => closeTab(idx)}
                aria-label="Close tab"
              >×</span>
            {/if}
          </button>
        {/each}
      </div>
      <section class="card asset-markdown-box asset-markdown-theme wide-box">
        <h3 class="asset-markdown-title">{tabs[activeTabIdx].label}</h3>
        {#if tabs[activeTabIdx].type === 'report'}
          {#await getReport(currentSelection.value) then report}
            <div class="asset-markdown-content markdown-root" on:click={handleTabLinkClick}>
              {#if report.markdown}
                {#each report.markdown.split('\n') as line}
                  {@html linkifyIds(simpleMarkdown(line))}
                {/each}
              {:else if report.sections}
                {#each Object.entries(report.sections) as [sectionName, content]}
                  {#if content && content.trim()}
                    <h2>{sectionName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
                    {@html linkifyIds(simpleMarkdown(content))}
                  {/if}
                {/each}
              {:else}
                <div class="asset-markdown-error">No report content found.</div>
              {/if}
            </div>
          {:catch error}
            <div class="asset-markdown-error">No report found for this topic.</div>
          {/await}
        {:else}
          <div class="tab-content" on:click={handleTabLinkClick}>
            {@html tabs[activeTabIdx].content}
          </div>
        {/if}
      </section>
    {:else if currentSelection.type === 'strategy'}
      <form class="strategy-form strategy-form-theme" on:submit|preventDefault={saveStrategy}>
        <h2 class="strategy-heading">Strategy</h2>
        <div class="strategy-description">
          The strategy you define here is infused in all steps of your workflow. It sets the tone for your research, guides what market data to analyze, and is used when aggregating all research into a final report.
        </div>
        <textarea
          id="strategy-text"
          name="strategy-text"
          placeholder="Enter your strategy here..."
          class="strategy-textarea"
          bind:value={strategyText}
          disabled={loadingStrategy}
        ></textarea>
        <button type="submit" class="strategy-save-btn" disabled={savingStrategy || loadingStrategy}>
          {savingStrategy ? 'Saving...' : 'Save'}
        </button>
        {#if strategyError}
          <div class="strategy-error">{strategyError}</div>
        {/if}
      </form>
      <!-- Removed stat-item and Project Overview blocks that may be causing errors -->
      {:else if currentSelection.value === 'history'}
        <div class="top-bar">
          <h1>History</h1>
          <div class="filter-buttons">
            <button
              class="filter-button {selectedFilter === 'all' ? 'active' : ''}"
              on:click={() => filterHistory('all')}
              aria-label="Show all history"
            >
              All
            </button>
            <button
              class="filter-button {selectedFilter === 'changes' ? 'active' : ''}"
              on:click={() => filterHistory('changes')}
              aria-label="Show changes only"
            >
              Changes
            </button>
            <button
              class="filter-button {selectedFilter === 'updates' ? 'active' : ''}"
              on:click={() => filterHistory('updates')}
              aria-label="Show updates only"
            >
              Updates
            </button>
            <button
              class="filter-button {selectedFilter === 'system' ? 'active' : ''}"
              on:click={() => filterHistory('system')}
              aria-label="Show system events only"
            >
              System
            </button>
          </div>
        </div>

        <div class="history-container">
          {#if historyEntries.length > 0}
            {#each Object.entries(groupedHistory) as [date, entries] (date)}
              <div class="history-group">
                <h3>{date}</h3>
                <div class="history-entries">
                  {#each entries as entry (entry.timestamp)}
                    <div class="history-entry">
                      <span class="time">{formatTimestamp(entry.timestamp).time}</span>
                      <span class="type">{entry.type}</span>
                      <span class="title">{entry.title}</span>
                      <span class="description">{entry.description}</span>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          {:else}
            <p>No history entries yet.</p>
          {/if}
        </div>
      {:else if currentSelection.value === 'dashboard'}
        <div class="top-bar">
          <h1>Dashboard</h1>
        </div>
        <section class="card welcome-box welcome-theme">
          <h2 class="welcome-title">Welcome to Argos</h2>
          <p class="welcome-description">Argos is your unified platform for asset intelligence, research, and strategy management. Use the sidebar to explore assets, manage strategies, and review your project history. Get started by selecting an asset or strategy, or explore your history and settings from the navigation menu.</p>
        </section>
      {:else if currentSelection.value === 'settings'}
        <div class="top-bar">
          <h1>Settings</h1>
        </div>
        <div class="content-section">
          <div class="card">
            <h3>User Settings</h3>
            <p>Settings content will be displayed here.</p>
          </div>
        </div>
      {/if}
    </main>
  </div>
  <Chat topic_id={currentSelection?.type === 'interest' ? currentSelection?.value : (data?.interests?.[0]?.id || '')} />
</div>

<style>
  .article-card {
    background: var(--card-bg, #fff);
    border-radius: 18px;
    box-shadow: 0 2px 10px rgba(30,40,80,0.08), 0 1.5px 4px rgba(30,40,80,0.04);
    padding: 2.2rem 2.4rem 2.1rem 2.4rem;
    max-width: 800px;
    margin: 2.5rem auto 2.5rem auto;
    font-family: inherit;
    color: var(--text-primary, #222);
    transition: box-shadow 0.2s;
  }

  .article-section {
    margin-bottom: 4.8rem;
  }

  .section-title-main {
    font-size: 2.4rem;
    font-weight: 900;
    color: var(--primary, #1976d2);
    margin-top: 0.8rem;
    margin-bottom: 2.1rem;
    letter-spacing: -0.01em;
    line-height: 1.13;
    display: block;
    text-shadow: 0 2px 8px rgba(25, 118, 210, 0.06);
  }

  .section-title {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primary, #1976d2);
    margin: 1.5rem 0 1rem 0;
  }

  .summary-content {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .metadata-row {
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .metadata-row strong {
    font-weight: 700;
    margin-right: 0.5rem;
  }

  /* Make all h3 headings in asset-markdown-box (insight/markdown sections) bold and spaced */
  /* Simple, direct styling for insight content headings like 'Current Thesis' */
  :global(.tab-content h3) {
    font-weight: 800; /* BOLD */
    margin-top: 2.5rem; /* SPACE ABOVE */
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  /* Global styles for article content */
  :global(.tab-content .section-title-main) {
    font-size: 1.8rem !important;
    font-weight: 700 !important;
    color: var(--text-primary, #222) !important;
    margin-top: 0.8rem !important;
    margin-bottom: 2.1rem !important;
    letter-spacing: -0.01em !important;
    line-height: 1.3 !important;
    display: block !important;
  }

  :global(.tab-content .section-title) {
    font-size: 1.6rem !important;
    font-weight: 700 !important;
    color: var(--text-primary, #222) !important;
    margin: 1.5rem 0 1rem 0 !important;
  }



  .summary-content {
    font-size: 1.15rem;
    color: var(--text-secondary, #555);
    margin-bottom: 2.2rem;
    line-height: 1.7;
    font-weight: 500;
  }

  .metadata-section {
    border-top: 1px solid var(--border-color, #e0e6f0);
    background-color: var(--card-bg-secondary, #f8f9fa);
    padding: 1.5rem;
    margin: 1.5rem -1.5rem -1.2rem; /* Extend to card edges */
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    font-size: 0.95rem;
  }

  .metadata-row {
    display: grid;
    grid-template-columns: 170px 1fr;
    gap: 0.8rem 1.5rem;
    align-items: start;
    margin-bottom: 1.7rem;
    padding-bottom: 0.7rem;
    border-bottom: 1.5px solid #e6eaf1;
  }

  .metadata-label {
    font-weight: 900;
    font-size: 1.15rem;
    color: var(--primary, #1976d2);
    text-align: right;
    letter-spacing: 0.03em;
    padding: 0.2rem 0.5rem 0.2rem 0;
    background: rgba(25,118,210,0.07);
    border-radius: 7px;
    box-shadow: 0 1px 3px rgba(25,118,210,0.03);
    margin-right: 0.2rem;
    display: inline-block;
  }

  .taxonomy-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-top: 0.1rem;
  }

  .taxonomy-tag {
    background-color: var(--tag-bg, #eef2f7);
    color: var(--tag-text, #334155);
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 500;
    line-height: 1.2;
  }

  .scrollable-main {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .app-container {
    display: grid;
    grid-template-columns: 1fr 25%;
    min-height: 100vh;
    background: var(--bg-color, white);
  }

  .dashboard-container {
    display: grid;
    grid-template-columns: 250px 1fr;
    min-height: 100vh;
    color: var(--text-color, black);
  }

  :global(.dark) {
    --bg-color: black;
    --text-color: white;
    --card-bg: #1a1a1a;
    --border-color: #333;
    --hover-bg: #2a2a2a;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }

  .sidebar {
    width: 280px;
    height: 100vh;
    background: var(--card-bg, #f5f5f5);
    padding: 1.5rem 0 0 1.25rem;
    display: flex;
    flex-direction: column;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 3rem 0 0;
    margin-bottom: 2rem;
    text-align: center;
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

  .themes-section {
    margin-bottom: 1rem;
    padding: 0 1.25rem;
  }

  :global(.themes-section .theme-form-container) {
    display: block;
    padding: 0.5rem 0;
  }

  :global(.themes-section .add-theme-button) {
    width: auto;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
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
    padding: 0.75rem 1rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color, black);
    transition: background-color 0.2s;
    border-radius: 8px 0 0 8px;
  }

  .themes-list button:hover {
    background: var(--hover-bg, #eeeeee);
    margin-right: 0;
  }

  .themes-list li.active button {
    background: var(--bg-color, white);
    margin-right: 0;
    font-weight: 500;
  }

  .sidebar-spacer {
    flex: 1;
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
  }

  .nav-links li.active button {
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

  :global(.theme-section .theme-toggle) {
    margin: 0 auto;
  }

  .user-section {
    margin-top: 1rem;
    padding: 1rem 1.25rem 1rem 0;
    border-top: 1px solid var(--border-color, #e0e0e0);
    display: flex;
    align-items: center;
    justify-content: space-between;
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

  .main-content {
    padding: 2rem;
    background: var(--bg-color, white);
    overflow-y: auto;
  }

  .history-filters {
    display: flex;
    gap: 0.5rem;
  }

  .filter-button {
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 20px;
    background: none;
    color: var(--text-color, black);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .filter-button:hover {
    background: var(--hover-bg, #eeeeee);
  }

  .filter-button.active {
    background: var(--text-color, black);
    color: var(--bg-color, white);
    border-color: var(--text-color, black);
  }

  .history-container {
    margin-top: 2rem;
  }

  .history-group {
    margin-bottom: 2rem;
  }

  .date-header {
    font-weight: 600;
    color: var(--text-color, black);
    margin-bottom: 1rem;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .history-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--card-bg, #f5f5f5);
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }

  .time-stamp {
    color: var(--text-muted, #666);
    font-size: 0.875rem;
    min-width: 48px;
  }

  .history-content {
    display: flex;
    gap: 1rem;
    flex: 1;
  }

  .history-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    position: relative;
  }

  .history-icon::before {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .history-icon.update {
    background: #E3F2FD;
  }

  .history-icon.update::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231976d2'%3E%3Cpath d='M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58s9.14-3.47 12.65 0L21 3v7.12zM12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z'/%3E%3C/svg%3E");
  }

  .history-icon.create {
    background: #E8F5E9;
  }

  .history-icon.create::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232e7d32'%3E%3Cpath d='M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'/%3E%3C/svg%3E");
  }

  .history-icon.delete {
    background: #FFEBEE;
  }

  .history-icon.delete::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c62828'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E");
  }

  .history-icon.system {
    background: #FFF3E0;
  }

  .history-icon.system::before {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef6c00'%3E%3Cpath d='M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2V19h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2V15h2c1.1 0 2-.9 2-2V9z'/%3E%3C/svg%3E");
  }

  .history-text {
    flex: 1;
    font-size: 0.875rem;
  }

  .history-details {
    color: var(--text-muted, #666);
    font-size: 0.8125rem;
    margin-top: 0.25rem;
  }

  .highlight {
    font-weight: 500;
  }

  .theme-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1rem;
  }

  .delete-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #FFEBEE;
    color: #c62828;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s;
  }

  .delete-button:hover {
    background: #FFCDD2;
  }

  .delete-button .icon {
    width: 18px;
    height: 18px;
    margin-right: 0;
    fill: currentColor;
  }

  :global(.dark) .delete-button {
    background: #c62828;
    color: white;
  }

  :global(.dark) .delete-button:hover {
    background: #b71c1c;
  }

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
  }

  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .card {
    background: var(--card-bg, #f5f5f5);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .card.wide {
    grid-column: span 2;
  }

  h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #666;
  }

  :global(.dark) .stat-label {
    color: #999;
  }

  .activity-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .activity-list li {
    display: flex;
    align-items: flex-start;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .activity-list li:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .activity-time {
    font-size: 0.875rem;
    color: #666;
    min-width: 60px;
  }

  :global(.dark) .activity-time {
    color: #999;
  }

  .project-table {
    width: 100%;
    border-collapse: collapse;
  }

  .project-table th,
  .project-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .project-table th {
    font-weight: 500;
    color: #666;
  }

  :global(.dark) .project-table th {
    color: #999;
  }

  .status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
  }

  .status.active {
    background: #e3f2fd;
    color: #1976d2;
  }

  .status.pending {
    background: #fff3e0;
    color: #f57c00;
  }

  :global(.dark) .status.active {
    background: #1a237e;
    color: #90caf9;
  }

  :global(.dark) .status.pending {
    background: #e65100;
    color: #ffe0b2;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--border-color, #e0e0e0);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress {
    height: 100%;
    background: #2196f3;
    border-radius: 3px;
  }

  :global(.dark) .progress {
    background: #90caf9;
  }
.asset-dashboard-theme {
  max-width: 700px;
  margin: 2rem auto;
}
.asset-dashboard-title {
  margin-bottom: 1.5rem;
  font-size: 2rem;
  color: var(--primary);
}
.asset-markdown-theme {
  max-width: 700px;
  margin: 1.5rem auto 0 auto;
  padding: 2rem 2.5rem;
}
.asset-markdown-title {
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--primary);
}
.asset-markdown-content {
  font-size: 1.05rem;
  color: var(--text-primary, var(--text-color, #444)) !important;
}
.asset-markdown-error {
  color: var(--text-secondary, #888);
}
.asset-markdown-error-json {
  font-size: 0.9em;
  color: var(--text-tertiary, #999);
  background: var(--background-secondary, #f6f6f6);
  padding: 0.5em;
  border-radius: 6px;
  overflow-x: auto;
}
.strategy-form-theme {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 90vh;
  min-height: 600px;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 1.5rem;
  box-sizing: border-box;
}
.strategy-label {
  align-self: flex-start;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.strategy-textarea {
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  font-size: 1.1rem;
  margin-bottom: 1.2rem;
  resize: none;
  background: var(--card-bg, #f5f5f5);
  color: var(--text-primary, var(--text-color, #222));
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  padding: 1rem;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  box-sizing: border-box;
  overflow-y: auto;
}
.strategy-textarea:focus {
  outline: none;
  border-color: var(--primary, #2196f3);
  background: var(--background-secondary, #fff);
}
.strategy-save-btn {
  width: 100%;
  max-width: 900px;
  padding: 1.2rem 0;
  font-size: 1.15rem;
  background: var(--card-bg, #f5f5f5);
  color: var(--text-primary, var(--text-color, #222));
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  margin-top: auto;
  margin-bottom: 0;
  box-shadow: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.strategy-save-btn:focus {
  outline: 2px solid var(--primary, #2196f3);
  outline-offset: 2px;
}
.strategy-save-btn:hover {
  background: var(--background-secondary, #ededed);
  border-color: var(--primary, #2196f3);
}
.strategy-heading {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
  color: var(--primary, var(--text-primary, #222));
  width: 100%;
  text-align: left;
}
.strategy-description {
  font-size: 1.05rem;
  color: var(--text-secondary, #555);
  margin-bottom: 1.4rem;
  width: 100%;
  text-align: left;
}

.welcome-theme {
  max-width: 600px;
  margin: 2rem auto 1.5rem auto;
  padding: 2rem 2.5rem;
  text-align: center;
}
.welcome-title {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: var(--primary);
}
.welcome-description {
  font-size: 1.1rem;
  color: var(--text-primary, var(--text-color, #444)) !important;
  transition: color 0.2s;
}

.markdown-root {
  color: var(--text-primary, var(--text-color, #444)) !important;
  transition: color 0.2s;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin: 1.5rem auto 0.5rem auto;
  max-width: 1100px;
}
.tab-button {
  all: unset;
  display: inline-block;
  padding: 0.55rem 1.5rem;
  background: var(--card-bg, white);
  color: var(--text-secondary, #666);
  border: 1.5px solid var(--border-color, #ddd);
  border-bottom: none;
  border-radius: 12px 12px 0 0;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  margin-bottom: -1.5px;
  transition: background 0.2s, color 0.2s, border 0.2s;
}
.tab-button.active {
  background: var(--card-bg, white);
  color: var(--text-primary, #222);
  border-color: var(--border-color, #ddd);
  font-weight: 600;
  z-index: 2;
}
.tab-button:hover:not(.active) {
  background: var(--hover-bg, #f5f5f5);
  color: var(--text-primary, #222);
  border-color: var(--border-color, #ddd);
}

/* Dark mode tab styles */
:global(.dark) .tab-button {
  background: var(--card-bg, #333);
  color: var(--text-secondary, #aaa);
  border-color: var(--border-color, #555);
}
:global(.dark) .tab-button.active {
  background: var(--card-bg, #333);
  color: var(--text-primary, #fff);
  border-color: var(--border-color, #555);
}
:global(.dark) .tab-button:hover:not(.active) {
  background: var(--hover-bg, #444);
  color: var(--text-primary, #fff);
  border-color: var(--border-color, #555);
}

.wide-box {
  width: 100%;
  max-width: 1100px;
  margin: 0.7rem auto 1.5rem auto;
  box-sizing: border-box;
}
@media (max-width: 1200px) {
  .wide-box {
    max-width: 99vw;
    margin-left: 0.5vw;
    margin-right: 0.5vw;
  }
}

</style>