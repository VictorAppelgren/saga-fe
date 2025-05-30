<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { get } from 'svelte/store';
  import ThemeForm from '$lib/components/ThemeForm.svelte';
  import ThemeReview from '$lib/components/ThemeReview.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ThemeInfo from '$lib/components/ThemeInfo.svelte';
  import Chat from '$lib/components/Chat.svelte';

  interface Theme {
    name: string;
    thesis: string;
    marketFocus: string;
  }

  // Mock history data
  const historyData = [
    {
      date: 'Today',
      items: [
        {
          time: '13:45',
          type: 'update',
          title: 'EUR/USD Analysis',
          description: 'was updated with new market data',
          details: 'Changes made to market focus and thesis'
        },
        {
          time: '09:22',
          type: 'create',
          title: 'Tech Sector Analysis',
          description: 'New theme was created'
        }
      ]
    },
    {
      date: 'Yesterday',
      items: [
        {
          time: '16:30',
          type: 'system',
          title: 'System',
          description: 'System performed automated data refresh',
          details: 'Updated 3 themes with latest market data'
        },
        {
          time: '11:15',
          type: 'delete',
          title: 'Crypto Markets',
          description: 'Theme was archived'
        }
      ]
    },
    {
      date: 'May 28, 2025',
      items: [
        {
          time: '14:20',
          type: 'update',
          title: 'Automotive Trends',
          description: 'analysis was updated',
          details: 'Added new market research data and updated projections'
        }
      ]
    }
  ];

  let selectedFilter = 'all';
  
  function filterHistory(filter: string) {
    selectedFilter = filter.toLowerCase();
  }

  $: filteredHistory = historyData.map(group => ({
    date: group.date,
    items: group.items.filter(item => 
      selectedFilter === 'all' || 
      (selectedFilter === 'changes' && (item.type === 'create' || item.type === 'delete')) ||
      (selectedFilter === 'updates' && item.type === 'update') ||
      (selectedFilter === 'system' && item.type === 'system')
    )
  })).filter(group => group.items.length > 0);

  export let data;

  let themes = [
    {
      name: 'EUR/USD',
      thesis: 'Analysis of EUR/USD currency pair movements and market dynamics',
      marketFocus: 'Foreign Exchange'
    },
    {
      name: 'Automotive Trends',
      thesis: 'Tracking global automotive industry trends and technological shifts',
      marketFocus: 'Automotive Industry'
    }
  ];

  interface Theme {
    name: string;
    thesis: string;
    marketFocus: string;
  }

  interface MarketReview {
    date: string;
    outlook: 'Bullish' | 'Bearish' | 'Neutral';
    analysis: string;
    impact: 'High' | 'Medium' | 'Low';
    confidence: number;
  }

  type Selection = {
    type: 'theme' | 'nav';
    value: string;
  };

  let currentSelection: Selection = { type: 'nav', value: 'dashboard' };

  function selectTheme(theme: Theme): void {
    currentSelection = { type: 'theme', value: theme.name };
  }

  function selectNav(value: string): void {
    currentSelection = { type: 'nav', value };
  }

  function handleThemeCreated(event: CustomEvent<Theme>): void {
    const newTheme = event.detail;
    themes = [...themes, newTheme];
  }

  $: selectedTheme = currentSelection.type === 'theme' 
    ? themes.find(t => t.name === currentSelection.value) || {
        name: '',
        thesis: '',
        marketFocus: ''
      }
    : {
        name: '',
        thesis: '',
        marketFocus: ''
      };
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
        {#each themes as theme}
          <li class:active={currentSelection.type === 'theme' && currentSelection.value === theme.name}>
            <button on:click={() => selectTheme(theme)}>
              {theme.name}
            </button>
          </li>
        {/each}
      </ul>
      <ThemeForm on:themeCreated={handleThemeCreated} />
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
        <div class="avatar">{data.user[0].toUpperCase()}</div>
        <span class="username">{data.user}</span>
      </div>
      <button class="logout-button" aria-label="Log out">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
          <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
      </button>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="main-content">
    {#if currentSelection.type === 'theme'}
      <ThemeInfo theme={selectedTheme} />
      <ThemeReview themeName={currentSelection.value} />
    {:else if currentSelection.type === 'nav'}
      {#if currentSelection.value === 'dashboard'}
        <div class="top-bar">
          <h1>Dashboard</h1>
        </div>

      <div class="dashboard-grid">
        <div class="card">
          <h3>Quick Stats</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">128</span>
              <span class="stat-label">Total Projects</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">86%</span>
              <span class="stat-label">Completion Rate</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">24</span>
              <span class="stat-label">Active Tasks</span>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Recent Activity</h3>
          <ul class="activity-list">
            <li>
              <span class="activity-time">2h ago</span>
              <span class="activity-text">New project "Atlas" created</span>
            </li>
            <li>
              <span class="activity-time">5h ago</span>
              <span class="activity-text">Updated team settings</span>
            </li>
            <li>
              <span class="activity-time">1d ago</span>
              <span class="activity-text">Completed milestone: Phase 1</span>
            </li>
          </ul>
        </div>

        <div class="card wide">
          <h3>Project Overview</h3>
          <table class="project-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Atlas Integration</td>
                <td><span class="status active">Active</span></td>
                <td>
                  <div class="progress-bar">
                    <div class="progress" style="width: 75%"></div>
                  </div>
                </td>
                <td>June 15, 2025</td>
              </tr>
              <tr>
                <td>Data Migration</td>
                <td><span class="status pending">Pending</span></td>
                <td>
                  <div class="progress-bar">
                    <div class="progress" style="width: 30%"></div>
                  </div>
                </td>
                <td>July 1, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
          {#each filteredHistory as group}
            <div class="history-group">
              <h2 class="history-date">{group.date}</h2>
              {#each group.items as item}
                <div class="history-item">
                  <div class="history-time">{item.time}</div>
                  <div class="history-icon {item.type}" aria-hidden="true"></div>
                  <div class="history-content">
                    <div class="history-text">
                      {#if item.title}
                        <span class="highlight">{item.title}</span>
                      {/if}
                      {item.description}
                      {#if item.details}
                        <div class="history-details">{item.details}</div>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
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
    {/if}
  </main>
  </div>
  <Chat />
</div>

<style>
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
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ef6c00'%3E%3Cpath d='M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z'/%3E%3C/svg%3E");
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
</style>