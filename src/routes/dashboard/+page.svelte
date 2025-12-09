<script lang="ts">
  // Robust API base: use env if available, fallback to backend default, fallback to window.location.origin
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Simple markdown renderer: bold, headings, bullets, spacing
  import { onMount } from 'svelte';
  import { simpleMarkdown } from '$lib/utils/simpleMarkdown';
  import { linkifyIds } from '$lib/utils/linkifyIds';
  import { getArticle } from '../api/articles';
  import { getReport } from '$lib/api/reports';
  // simpleMarkdown is now imported from utils for DRYness.

  // Remove linkifyInsightText - we'll use linkifyIds from utils

  import type { Theme } from '$lib/types/storage';
  // Remove Asset import - using interests now
  import ThemeReview from '$lib/components/ThemeReview.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import ThemeInfo from '$lib/components/ThemeInfo.svelte';
  import Chat from '$lib/components/Chat.svelte';
  import StrategyModal from '$lib/components/StrategyModal.svelte';
  import ArticleModal from '$lib/components/ArticleModal.svelte';
  import { getStrategy, createStrategy, updateStrategy, deleteStrategy as deleteStrategyAPI, type Strategy, type StrategyDetail } from '$lib/api/strategies';
  import { invalidateAll } from '$app/navigation';

  // --- STRATEGY MODAL STATE ---
  let showStrategyModal = false;
  let modalMode: 'create' | 'edit' = 'create';
  let editingStrategy: StrategyDetail | null = null;

  // --- STRATEGY REFRESH KEY ---
  let strategyRefreshKey = 0;

  // --- TOGGLE DEFAULT STATUS ---
  async function toggleDefaultStatus(strategyId: string, currentStatus: boolean) {
    try {
      const newStatus = !currentStatus;
      const response = await fetch(`${API_BASE}/users/${data.user.username}/strategies/${strategyId}/set-default/${newStatus}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const error = await response.json();
        alert(error.detail || 'Failed to update default status');
        return;
      }
      
      const result = await response.json();
      
      // Refresh the page data first
      await invalidateAll();
      
      // Then force strategy detail to re-fetch
      strategyRefreshKey++;
      
      alert(result.message);
    } catch (error) {
      console.error('Error toggling default status:', error);
      alert('Failed to update default status');
    }
  }

  // --- ARTICLE MODAL STATE ---
  let showArticleModal = false;
  let selectedArticleId: string | null = null;

  // --- DASHBOARD QUESTIONS STATE ---
  interface DashboardQuestion {
    text: string;
    strategyId: string;
    strategyAsset: string;
  }
  let dashboardQuestions: DashboardQuestion[] = [];
  let loadingQuestions = true;
  let chatTriggerMessage: string | null = null; // Message to trigger in chat

  function openCreateStrategyModal() {
    modalMode = 'create';
    editingStrategy = null;
    showStrategyModal = true;
  }

  async function openEditModal(strategy: StrategyDetail) {
    modalMode = 'edit';
    editingStrategy = strategy;
    showStrategyModal = true;
  }

  async function handleStrategySave(formData: any) {
    try {
      let savedStrategy;
      if (modalMode === 'create') {
        savedStrategy = await createStrategy({
          username: data.user.username,
          ...formData
        });
        showStrategyModal = false;
        // After creating, select the new strategy
        currentSelection = { type: 'strategy', value: savedStrategy.id };
        // Refresh data from server
        await invalidateAll();
      } else if (editingStrategy) {
        const strategyId = editingStrategy.id;
        savedStrategy = await updateStrategy(strategyId, {
          username: data.user.username,
          strategy_text: formData.strategy_text,
          position_text: formData.position_text,
          target: formData.target
        });
        showStrategyModal = false;
        // Stay on the same strategy after editing
        currentSelection = { type: 'strategy', value: strategyId };
        // Small delay to ensure backend has written the file
        await new Promise(resolve => setTimeout(resolve, 100));
        // Refresh data from server
        await invalidateAll();
      }
    } catch (e) {
      console.error('Failed to save strategy:', e);
      alert('Failed to save strategy. Please try again.');
    }
  }

  async function handleDeleteStrategy(strategyId: string) {
    if (confirm('Are you sure you want to delete this strategy? It will be moved to archive.')) {
      try {
        await deleteStrategyAPI(data.user.username, strategyId);
        currentSelection = { type: 'nav', value: 'dashboard' };
        window.location.reload();
      } catch (e) {
        console.error('Failed to delete strategy:', e);
        alert('Failed to delete strategy. Please try again.');
      }
    }
  }

  export let data;

  // Load dashboard questions from user strategies
  async function loadDashboardQuestions() {
    try {
      const username = data?.user?.username;
      console.log('🔍 Loading dashboard questions for user:', username);
      if (!username) {
        console.log('❌ No username found');
        loadingQuestions = false;
        return;
      }

      const response = await fetch(`${API_BASE}/users/${username}/strategies`);
      const result = await response.json();
      const strategies = result.strategies || [];
      console.log('📋 Found strategies:', strategies.length);

      // Extract questions from all strategies
      const questions: DashboardQuestion[] = [];
      for (const strategyItem of strategies) {
        try {
          console.log('🔍 Loading strategy:', strategyItem.id);
          const detailResponse = await fetch(`${API_BASE}/users/${username}/strategies/${strategyItem.id}`);
          const strategy = await detailResponse.json();
          console.log('📄 Strategy data:', strategy);
          console.log('💡 Dashboard question:', strategy.dashboard_question);
          if (strategy.dashboard_question) {
            questions.push({
              text: strategy.dashboard_question,
              strategyId: strategyItem.id,
              strategyAsset: strategy.asset.primary
            });
          }
        } catch (e) {
          console.error('Failed to load strategy details:', e);
        }
      }

      console.log('✅ Total questions found:', questions.length, questions);
      dashboardQuestions = questions.slice(0, 3); // Max 3 questions
      loadingQuestions = false;
    } catch (error) {
      console.error('Failed to load dashboard questions:', error);
      loadingQuestions = false;
    }
  }

  // Start chat with a question
  async function startChatWithQuestion(question: DashboardQuestion) {
    console.log('🎯 Question clicked:', question);
    
    // 1. Select the strategy
    currentSelection = { type: 'strategy', value: question.strategyId };
    console.log('✅ Strategy selected:', question.strategyId);
    
    // 2. Wait a moment for the UI to update
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 3. Scroll to chat and focus
    const chatSection = document.querySelector('.chat-container');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // 4. Trigger message in chat by updating prop
    console.log('📤 Triggering chat with message:', question.text);
    // Reset first to ensure reactive statement fires even if same message
    chatTriggerMessage = null;
    await new Promise(resolve => setTimeout(resolve, 10));
    chatTriggerMessage = question.text;
  }

  // Load questions on mount
  onMount(() => {
    loadDashboardQuestions();
  });

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
        
        // Strategy view: Open modal overlay
        if (currentSelection.type === 'strategy') {
          selectedArticleId = articleId;
          showArticleModal = true;
        } else {
          // Asset view: Open tab (existing behavior)
          openTab('article', articleId, `Article ${articleId}`);
        }
        return;
      }
    }
    target = target.parentElement;
  }
}




  type Selection = { type: 'theme' | 'nav' | 'interest' | 'strategy'; value: string };

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

  function selectStrategy(strategy: Strategy): void {
    currentSelection = { type: 'strategy', value: strategy.id };
  }

  $: themeForDisplay = null;

  // Helper to turn snake_case section keys into nice titles
  function formatSectionTitle(key: string): string {
    const map: Record<string, string> = {
      executive_summary: 'Executive Summary',
      position_analysis: 'Position Analysis',
      risk_analysis: 'Risk Analysis',
      opportunity_analysis: 'Opportunity Analysis',
      recommendation: 'Recommendation',
      scenarios_and_catalysts: 'Scenarios & Catalysts',
      structuring_and_risk_management: 'Structuring & Risk Management',
      context_and_alignment: 'Context & Alignment'
    };
    if (map[key]) return map[key];
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  }
</script>



  <div class="app-container">
  <div class="dashboard-container">
  <!-- Sidebar Navigation -->
  <nav class="sidebar">
    <div class="logo-container" style="background-color: var(--sidebar-background-color)">
      <a href="/dashboard" aria-label="Go to main dashboard">
        <img src="/saga-labs.avif" alt="Saga Intelligence Logo" class="logo" />
      </a>
    </div>
    
    <div class="scrollable-section">
      <div class="themes-section">
        <!-- STRATEGIES SECTION -->
        <div class="section-header">
          <h3 class="section-title">Strategies</h3>
          <button class="add-button" on:click={openCreateStrategyModal} aria-label="Create new strategy" style="margin-right: 1.25rem;">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
        
        <ul class="themes-list">
          {#if data?.strategies && data.strategies.length > 0}
            {#each data.strategies as strategy}
              <li class="strategy-list-item">
                <button 
                  class:active={currentSelection.type === 'strategy' && currentSelection.value === strategy.id}
                  on:click={() => selectStrategy(strategy)}
                >
                  <div class="strategy-item">
                    <span class="strategy-asset">
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
            <li class="empty-state">No strategies yet</li>
          {/if}
        </ul>
        
        <!-- DIVIDER -->
        <div class="section-divider"></div>
        
        <!-- ASSETS/INTERESTS SECTION -->
        <div class="section-header">
          <h3 class="section-title">Assets</h3>
          <div style="width: 24px; margin-right: 1.25rem;"></div>
        </div>
        
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
    </div>

    <ul class="nav-links">
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
      {#if data.user?.is_admin}
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
      <section class="strategy-detail-box">
        <!-- Topic Info Card - matches strategy view -->
        <div class="strategy-info-card">
          <div class="strategy-header-buttons">
            <button class="back-button" on:click={() => currentSelection = { type: 'nav', value: 'dashboard' }} title="Back to Dashboard">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back
            </button>
          </div>
          
          <div class="strategy-header">
            <h2 class="strategy-title">{data?.interests?.find(i => i?.id === currentSelection?.value)?.name || 'No topic'}</h2>
            <div class="strategy-meta">
              <span class="meta-item"><strong>Type:</strong> Research Topic</span>
            </div>
            <p class="strategy-hint">Click this topic or any strategy on the left to explore details and talk to Saga about it in the chat.</p>
          </div>
        </div>

        <!-- Tab bar -->
        <div class="topic-tab-bar">
          {#each tabs as tab, idx}
            <button
              class="topic-tab-button {activeTabIdx === idx ? 'active' : ''}"
              on:click={() => selectTab(idx)}
            >
              {tab.label}
              {#if idx !== 0}
                <span
                  class="tab-close-btn"
                  on:click|stopPropagation={() => closeTab(idx)}
                  aria-label="Close tab"
                >×</span>
              {/if}
            </button>
          {/each}
        </div>

        <!-- Report content - MATCHES STRATEGY VIEW EXACTLY -->
        {#if tabs[activeTabIdx].type === 'report'}
          {#await getReport(currentSelection.value) then report}
            {@const heroSection = report.sections?.executive_summary ? 'executive_summary' : (report.sections?.house_view ? 'house_view' : null)}
            {#if report.sections && Object.keys(report.sections).length > 0}
              <!-- Hero Section (always expanded) - uses executive_summary OR house_view -->
              {#if heroSection && report.sections[heroSection]}
                <div class="executive-summary-section">
                  <h3 class="section-heading">{formatSectionTitle(heroSection)}</h3>
                  <div class="executive-summary-content" on:click={handleTabLinkClick}>
                    {#each report.sections[heroSection].split('\n') as line}
                      {@html linkifyIds(simpleMarkdown(line))}
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Analysis Sections Container - SAME AS STRATEGY -->
              <div class="analysis-sections-container">
                <div class="analysis-sections-header">
                  <span class="analysis-sections-label">Analysis Sections</span>
                </div>
                {#each Object.entries(report.sections) as [sectionName, content]}
                  {#if sectionName !== heroSection && content && content.trim()}
                    <details class="analysis-card">
                      <summary class="analysis-card-header">
                        <span class="analysis-card-title">{formatSectionTitle(sectionName)}</span>
                        <span class="analysis-card-chevron">›</span>
                      </summary>
                      <div class="analysis-card-content" on:click={handleTabLinkClick}>
                        {#each content.split('\n') as line}
                          {@html linkifyIds(simpleMarkdown(line))}
                        {/each}
                      </div>
                    </details>
                  {/if}
                {/each}
              </div>
            {:else}
              <div class="topic-content-card">
                <div class="asset-markdown-error">No report content found.</div>
              </div>
            {/if}
          {:catch error}
            <div class="topic-content-card">
              <div class="asset-markdown-error">No report found for this topic.</div>
            </div>
          {/await}
        {:else}
          <div class="topic-content-card">
            <div class="tab-content" on:click={handleTabLinkClick}>
              {@html tabs[activeTabIdx].content}
            </div>
          </div>
        {/if}
      </section>
    {:else if currentSelection.type === 'strategy'}
      {#key strategyRefreshKey}
      {#await getStrategy(data.user.username, currentSelection.value)}
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading strategy...</p>
        </div>
      {:then strategy}
        <section class="strategy-detail-box">
          <!-- Strategy Info Card - wraps header, meta, and thesis -->
          <div class="strategy-info-card">
            <div class="strategy-header-buttons">
              <button class="back-button" on:click={() => currentSelection = { type: 'nav', value: 'dashboard' }} title="Back to Dashboard">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Back
              </button>
              <div class="strategy-actions">
                {#if data.user?.is_admin}
                  <button 
                    class="btn-toggle-default" 
                    on:click={() => toggleDefaultStatus(strategy.id, strategy.is_default || false)}
                  >
                    {strategy.is_default ? 'Remove Default' : 'Make Default'}
                  </button>
                {/if}

                {#if !strategy.is_default || data.user?.is_admin}
                  <button class="btn-edit" on:click={() => openEditModal(strategy)}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                    Edit
                  </button>
                {/if}

                {#if !strategy.is_default}
                  <button class="btn-delete" on:click={() => handleDeleteStrategy(strategy.id)}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                    Delete
                  </button>
                {/if}
              </div>
            </div>
            
            <div class="strategy-header">
              <h2 class="strategy-title">
                {strategy.asset.primary}
                {#if strategy.is_default}
                  <span class="default-badge-large" title="Example Strategy">📌</span>
                {/if}
              </h2>
              <div class="strategy-meta">
                <span class="meta-item"><strong>Target:</strong> {strategy.user_input.target}</span>
                <span class="meta-divider">•</span>
                <span class="meta-item"><strong>Version:</strong> {strategy.version}</span>
                <span class="meta-divider">•</span>
                <span class="meta-item"><strong>Updated:</strong> {new Date(strategy.updated_at).toLocaleDateString()}</span>
              </div>
              <p class="strategy-hint">Keep this thesis high-level; use Edit to adjust it, then chat on the right about this strategy or its topics.</p>
            </div>
            
            <!-- User Input Section -->
            <div class="strategy-section">
              <h3 class="section-heading">
                Strategy Thesis
                {#if strategy.is_default}
                  <span class="section-hint">(example text, read-only)</span>
                {:else}
                  <span class="section-hint">(your text – change it with Edit)</span>
                {/if}
              </h3>
              <p class="section-content">{strategy.user_input.strategy_text}</p>
            </div>
            
            {#if strategy.user_input.position_text}
              <div class="strategy-section">
                <h3 class="section-heading">Target Outlook</h3>
                <p class="section-content">{strategy.user_input.position_text}</p>
              </div>
            {/if}
            
            {#if strategy.user_input.target}
              <div class="strategy-section">
                <h3 class="section-heading">Target</h3>
                <p class="section-content">{strategy.user_input.target}</p>
              </div>
            {/if}
          </div>
          
          <!-- Analysis Section (if exists) -->
          {#if strategy.latest_analysis?.analyzed_at}
            <!-- Executive Summary (always expanded) -->
            {#if strategy.latest_analysis.final_analysis?.executive_summary}
              <div class="executive-summary-section">
                <h3 class="section-heading">Executive Summary</h3>
                <div class="executive-summary-content" on:click={handleTabLinkClick}>
                  {#each strategy.latest_analysis.final_analysis.executive_summary.split('\\n') as line}
                    {@html linkifyIds(simpleMarkdown(line))}
                  {/each}
                </div>
              </div>
            {/if}

            <div class="analysis-sections-container">
              <div class="analysis-sections-header">
                <span class="analysis-sections-label">Analysis Sections</span>
                <span class="analysis-timestamp">Updated {new Date(strategy.latest_analysis.analyzed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <!-- All other sections collapsed by default -->
              {#if strategy.latest_analysis.final_analysis}
                {#each Object.entries(strategy.latest_analysis.final_analysis) as [sectionKey, content]}
                  {#if sectionKey !== 'executive_summary' && content && content.trim()}
                    <details class="analysis-card">
                      <summary class="analysis-card-header">
                        <span class="analysis-card-title">{formatSectionTitle(sectionKey)}</span>
                        <span class="analysis-card-chevron">›</span>
                      </summary>
                      <div class="analysis-card-content" on:click={handleTabLinkClick}>
                        {#each content.split('\n') as line}
                          {@html linkifyIds(simpleMarkdown(line))}
                        {/each}
                      </div>
                    </details>
                  {/if}
                {/each}
              {/if}

            </div>
          {:else}
            <div class="no-analysis">
              <p>No AI analysis generated yet</p>
              <button class="btn-generate">
                Generate Analysis (Coming Soon)
              </button>
            </div>
          {/if}
        </section>
      {:catch error}
        <p>Error loading strategy: {error.message}</p>
      {/await}
      {/key}
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
      {:else if currentSelection.value === 'dashboard'}
        <div class="top-bar">
          <h1>Dashboard</h1>
        </div>
        <section class="card welcome-box welcome-theme">
          <h2 class="welcome-title">Welcome, {data.user?.username || 'there'}!</h2>
          <p class="welcome-subtitle">Your AI-powered strategy command center. Monitor market risks in real-time, identify emerging opportunities, and make informed decisions based on comprehensive analysis of your trading strategies.</p>
          <p class="welcome-hint">On the left you'll see your topics and strategies (including examples). Add your own at a macro level, then click a topic or strategy to open chat with Saga or use one of the questions below.</p>
        </section>

        {#if !loadingQuestions && dashboardQuestions.length > 0}
          <section class="card insights-box">
            <h3 class="insights-title">💡 Strategy Insights</h3>
            <p class="insights-description">Based on your active strategies, here are some critical questions to consider:</p>
            <div class="questions-grid">
              {#each dashboardQuestions as question}
                <button class="question-card" on:click={() => startChatWithQuestion(question)}>
                  <span class="question-icon">💭</span>
                  <div class="question-content">
                    <span class="question-text">{question.text}</span>
                    <span class="strategy-badge">{question.strategyAsset}</span>
                  </div>
                </button>
              {/each}
            </div>
          </section>
        {/if}
      {:else}
        <div class="content-section">
          <p>Select a strategy or asset to view details.</p>
        </div>
      {/if}
    </main>
  </div>
  
  {#if currentSelection?.type === 'interest' || currentSelection?.type === 'strategy'}
    {#key currentSelection?.value}
      <Chat 
        topic_id={currentSelection?.type === 'interest' ? currentSelection?.value : null}
        strategy_id={currentSelection?.type === 'strategy' ? currentSelection?.value : null}
        username={data?.user?.username || null}
        triggerMessage={chatTriggerMessage}
      />
    {/key}
  {:else}
    <div class="chat-placeholder">
      <div class="chat-placeholder-content">
        <h3>💬 Start a Conversation</h3>
        <p>Choose a <strong>strategy</strong> or <strong>topic</strong> from the sidebar to begin chatting.</p>
        <p class="placeholder-hint">Each strategy and topic has its own dedicated conversation history that persists across sessions.</p>
      </div>
    </div>
  {/if}
</div>

{#if showStrategyModal}
  <StrategyModal
    mode={modalMode}
    strategy={editingStrategy}
    onSave={handleStrategySave}
    onCancel={() => showStrategyModal = false}
  />
{/if}

{#if showArticleModal && selectedArticleId}
  <ArticleModal
    articleId={selectedArticleId}
    onClose={() => showArticleModal = false}
  />
{/if}

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
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted, #86868b);
    margin: 0;
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
    --bg-color: #000000;
    --text-color: #f5f5f7;
    --text-muted: #86868b;
    --card-bg: #1c1c1e;
    --border-color: #38383a;
    --hover-bg: #2c2c2e;
    --primary: #0a84ff;
    --surface-variant: #2c2c2e;
  }

  :global(:root) {
    --bg-color: #ffffff;
    --text-color: #1d1d1f;
    --text-muted: #86868b;
    --card-bg: #ffffff;
    --border-color: #d2d2d7;
    --hover-bg: #f5f5f7;
    --primary: #007aff;
    --surface-variant: #f5f5f7;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }

  .sidebar {
    width: 280px;
    height: 100vh;
    background: var(--surface-variant, #f5f5f7);
    padding: 1.5rem 0 0 1.25rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-right: 1px solid var(--border-color, #d2d2d7);
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

  .main-content {
    padding: 1.5rem 2rem;
    background: var(--bg-color, #ffffff);
    overflow-y: auto;
    min-height: 100vh;
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

  /* Welcome box styling */
  .welcome-box {
    background: var(--card-bg, #f9fafb);
    border: 1px solid var(--border-color, #e5e7eb);
  }
  .welcome-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.75rem;
    font-weight: 800;
  }
  .welcome-subtitle {
    margin: 0 0 1rem 0;
    color: var(--text-muted, #6b7280);
    font-weight: 500;
  }
  .welcome-section {
    margin-top: 1rem;
  }
  .welcome-description {
    margin: 0.25rem 0;
    line-height: 1.6;
  }
  .welcome-prompt {
    margin: 0.25rem 0 0.75rem 0;
    font-weight: 600;
  }
  .examples-title {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted, #6b7280);
  }
  .welcome-examples {
    margin: 0.5rem 0 0 1.25rem;
    padding: 0;
  }
  .welcome-examples li {
    margin: 0.35rem 0;
  }

  /* Question cards styling */
  .question-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .question-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: var(--card-bg, #ffffff);
    border: 2px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;
  }

  .question-card:hover {
    border-color: var(--primary, #3b82f6);
    background: var(--hover-bg, #f9fafb);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .question-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .question-text {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary, #111827);
    line-height: 1.4;
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

/* ═══════════════════════════════════════════════════════════════════════════
   WELCOME BOX - Apple-inspired hero section
   ═══════════════════════════════════════════════════════════════════════════ */

.welcome-theme {
  max-width: 680px;
  margin: 2rem auto 1.5rem auto;
  padding: 2.5rem 3rem;
  text-align: center;
  background: linear-gradient(135deg, var(--card-bg, #ffffff) 0%, var(--hover-bg, #f5f5f7) 100%);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.welcome-title {
  margin-bottom: 0.75rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color, #1d1d1f);
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-muted, #86868b);
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
}

.welcome-hint {
  font-size: 0.875rem;
  color: var(--text-muted, #86868b);
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, #e5e5e7);
  line-height: 1.5;
}

.welcome-description {
  font-size: 1.05rem;
  color: var(--text-secondary, #424245);
  transition: color 0.2s;
}

:global(.dark) .welcome-theme {
  background: linear-gradient(135deg, var(--card-bg, #1c1c1e) 0%, #252528 100%);
  border-color: var(--border-color, #38383a);
}

:global(.dark) .welcome-title {
  color: var(--text-color, #f5f5f7);
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

/* Strategy Sidebar Styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #666);
  margin: 0;
}

.add-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary, #1976d2);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.add-button:hover {
  background: #1565c0;
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
}

.strategy-target {
  font-size: 0.85rem;
  color: var(--text-muted, #666);
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

/* ═══════════════════════════════════════════════════════════════════════════
   STRATEGY DETAIL VIEW - Apple-inspired clean design
   ═══════════════════════════════════════════════════════════════════════════ */

.strategy-detail-box {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}

.strategy-header-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.strategy-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-color, #e5e5e7);
}

.strategy-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: var(--text-color, #1d1d1f);
  margin: 0 0 0.75rem 0;
  letter-spacing: -0.02em;
}

.strategy-meta {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 0.875rem;
  color: var(--text-muted, #86868b);
}

.meta-item strong {
  color: var(--text-color, #1d1d1f);
  font-weight: 600;
}

.strategy-hint {
  font-size: 0.875rem;
  color: var(--text-muted, #86868b);
  margin-top: 0.75rem;
  line-height: 1.5;
}

.strategy-actions {
  display: flex;
  gap: 0.625rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: var(--surface-variant, #f5f5f7);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 100px;
  color: var(--text-color, #1d1d1f);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:hover {
  background: var(--hover-bg, #e8e8ed);
  transform: translateX(-2px);
}

.btn-edit, .btn-delete, .btn-default {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-edit {
  background: var(--primary, #007aff);
  color: white;
}

.btn-edit:hover {
  background: #0066d6;
  transform: scale(1.02);
}

.btn-delete {
  background: var(--surface-variant, #f5f5f7);
  color: #ff3b30;
  border: 1px solid #ffccc9;
}

.btn-delete:hover {
  background: #fff0ef;
  border-color: #ff3b30;
}

.btn-default {
  background: var(--surface-variant, #f5f5f7);
  color: var(--text-color, #1d1d1f);
  border: 1px solid var(--border-color, #e5e5e7);
}

.btn-default:hover {
  background: var(--hover-bg, #e8e8ed);
}

/* Toggle Default button - theme-aware */
.btn-toggle-default {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  border-radius: 100px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--surface-variant, #f5f5f7);
  color: var(--text-color, #1d1d1f);
  border: 1px solid var(--border-color, #e5e5e7);
}

.btn-toggle-default:hover {
  background: var(--hover-bg, #e8e8ed);
  border-color: var(--text-muted, #86868b);
}

:global(.dark) .btn-toggle-default {
  background: var(--surface-variant, #2c2c2e);
  color: var(--text-color, #f5f5f7);
  border-color: var(--border-color, #48484a);
}

:global(.dark) .btn-toggle-default:hover {
  background: var(--hover-bg, #3a3a3c);
  border-color: var(--text-muted, #86868b);
}

/* Strategy Info Card - wraps header content */
.strategy-info-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 20px;
  padding: 2rem 2.25rem;
  margin-bottom: 1.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}

:global(.dark) .strategy-info-card {
  background: var(--card-bg, #1c1c1e);
  border-color: var(--border-color, #38383a);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

/* Meta divider */
.meta-divider {
  color: var(--text-muted, #86868b);
  font-size: 0.75rem;
}

/* Topic Tab Bar */
.topic-tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0;
  padding: 0 0.25rem;
}

.topic-tab-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface-variant, #f5f5f7);
  border: 1px solid var(--border-color, #e5e5e7);
  border-bottom: none;
  border-radius: 14px 14px 0 0;
  color: var(--text-muted, #86868b);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-bottom: -1px;
}

.topic-tab-button.active {
  background: var(--card-bg, #ffffff);
  color: var(--text-color, #1d1d1f);
  border-color: var(--border-color, #e5e5e7);
  font-weight: 600;
  z-index: 2;
}

.topic-tab-button:hover:not(.active) {
  background: var(--hover-bg, #e8e8ed);
  color: var(--text-color, #1d1d1f);
}

.tab-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 1rem;
  line-height: 1;
  color: var(--text-muted, #86868b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-color, #1d1d1f);
}

:global(.dark) .topic-tab-button {
  background: var(--surface-variant, #2c2c2e);
  border-color: var(--border-color, #38383a);
}

:global(.dark) .topic-tab-button.active {
  background: var(--card-bg, #1c1c1e);
  color: var(--text-color, #f5f5f7);
}

:global(.dark) .topic-tab-button:hover:not(.active) {
  background: var(--hover-bg, #3a3a3c);
}

:global(.dark) .tab-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color, #f5f5f7);
}

/* Topic Content Card */
.topic-content-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 0 20px 20px 20px;
  padding: 2rem 2.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}

.topic-content-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color, #1d1d1f);
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.02em;
}

:global(.dark) .topic-content-card {
  background: var(--card-bg, #1c1c1e);
  border-color: var(--border-color, #38383a);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

:global(.dark) .topic-content-title {
  color: var(--text-color, #f5f5f7);
}

.strategy-section {
  margin-bottom: 1.75rem;
}

.section-heading {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #86868b);
  margin: 0 0 0.625rem 0;
}

.section-hint {
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  font-size: 0.8rem;
}

.section-content {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-color, #1d1d1f);
  white-space: pre-wrap;
}

:global(.dark) .strategy-title {
  color: var(--text-color, #f5f5f7);
}

:global(.dark) .meta-item strong {
  color: var(--text-color, #f5f5f7);
}

:global(.dark) .section-content {
  color: var(--text-color, #e5e5e7);
}

:global(.dark) .back-button {
  background: var(--surface-variant, #2c2c2e);
  border-color: var(--border-color, #38383a);
  color: var(--text-color, #f5f5f7);
}

:global(.dark) .back-button:hover {
  background: var(--hover-bg, #3a3a3c);
}

:global(.dark) .btn-delete {
  background: rgba(255, 59, 48, 0.1);
  border-color: rgba(255, 59, 48, 0.3);
}

:global(.dark) .btn-delete:hover {
  background: rgba(255, 59, 48, 0.2);
}

/* Executive Summary - Hero card style */
.executive-summary-section {
  margin-top: 1.75rem;
  padding: 2rem 2.25rem;
  background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, var(--hover-bg, #fafafa) 100%);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.executive-summary-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary, #007aff) 0%, #5856d6 50%, #af52de 100%);
  border-radius: 20px 20px 0 0;
}

.executive-summary-section .section-heading {
  font-size: 1.25rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: -0.02em;
  color: var(--text-color, #1d1d1f);
  margin-bottom: 1.25rem;
}

:global(.dark) .executive-summary-section .section-heading {
  color: var(--text-color, #f5f5f7);
}

.executive-summary-content {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-color, #1d1d1f);
  font-weight: 400;
}

:global(.dark) .executive-summary-section {
  background: linear-gradient(145deg, var(--card-bg, #1c1c1e) 0%, #232326 100%);
  border-color: var(--border-color, #38383a);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

:global(.dark) .executive-summary-section::before {
  background: linear-gradient(90deg, #0a84ff 0%, #5e5ce6 50%, #bf5af2 100%);
}

:global(.dark) .executive-summary-content {
  color: var(--text-color, #f5f5f7);
}

/* Asset/Topic executive summary */
.asset-executive-summary {
  padding: 1.75rem 2rem;
  margin-bottom: 1.75rem;
  background: linear-gradient(145deg, var(--hover-bg, #fafafa) 0%, var(--card-bg, #ffffff) 100%);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 16px;
  position: relative;
}

.asset-executive-summary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary, #007aff) 0%, #5856d6 100%);
  border-radius: 16px 16px 0 0;
}

.asset-executive-summary h2 {
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: none;
  letter-spacing: -0.01em;
  color: var(--text-color, #1d1d1f);
  margin: 0 0 1rem 0;
}

:global(.dark) .asset-executive-summary {
  background: linear-gradient(145deg, #232326 0%, var(--card-bg, #1c1c1e) 100%);
  border-color: var(--border-color, #38383a);
}

:global(.dark) .asset-executive-summary::before {
  background: linear-gradient(90deg, #0a84ff 0%, #5e5ce6 100%);
}

:global(.dark) .asset-executive-summary h2 {
  color: var(--text-color, #f5f5f7);
}

/* ═══════════════════════════════════════════════════════════════════════════
   APPLE-INSPIRED ANALYSIS CARDS
   Clean, minimal, with subtle depth and smooth animations
   ═══════════════════════════════════════════════════════════════════════════ */

.analysis-sections-container {
  margin-top: 1.75rem;
  padding: 1.75rem 2rem 2rem 2rem;
  border-radius: 20px;
  border: 1px solid var(--border-color, #e5e5e7);
  background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, var(--hover-bg, #fafafa) 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.analysis-sections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color, #e5e5e7);
  margin-bottom: 0.5rem;
}

.analysis-sections-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted, #86868b);
}

.analysis-timestamp {
  font-size: 0.75rem;
  color: var(--text-muted, #86868b);
  font-weight: 500;
}

/* Individual analysis card - Apple style */
.analysis-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.analysis-card:hover {
  border-color: var(--border-hover, #d1d1d6);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.analysis-card[open] {
  background: linear-gradient(145deg, var(--card-bg, #ffffff) 0%, #f8f9fa 100%);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 122, 255, 0.25);
}

.analysis-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.125rem 1.5rem;
  cursor: pointer;
  user-select: none;
  list-style: none;
  background: transparent;
  transition: background 0.2s ease;
}

.analysis-card-header::-webkit-details-marker {
  display: none;
}

.analysis-card-header:hover {
  background: var(--hover-bg, #f5f5f7);
}

.analysis-card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-color, #1d1d1f);
  letter-spacing: -0.01em;
}

.analysis-card-chevron {
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--text-muted, #86868b);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  line-height: 1;
}

.analysis-card[open] .analysis-card-chevron {
  transform: rotate(90deg);
  color: var(--primary, #007aff);
}

.analysis-card-content {
  padding: 1.5rem 2.25rem 2.25rem 2.25rem;
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--text-color, #1d1d1f);
  animation: slideDown 0.25s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode adjustments */
:global(.dark) .analysis-sections-container {
  background: linear-gradient(145deg, var(--card-bg, #1c1c1e) 0%, #232326 100%);
  border-color: var(--border-color, #38383a);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

:global(.dark) .analysis-card {
  background: var(--card-bg, #1c1c1e);
  border-color: var(--border-color, #38383a);
}

:global(.dark) .analysis-card:hover {
  border-color: var(--border-hover, #48484a);
}

:global(.dark) .analysis-card[open] {
  background: linear-gradient(145deg, #1c1c1e 0%, #252528 100%);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.25);
  border-color: rgba(10, 132, 255, 0.4);
}

:global(.dark) .analysis-card-header:hover {
  background: var(--hover-bg, #2c2c2e);
}

:global(.dark) .analysis-card-title {
  color: var(--text-color, #f5f5f7);
}

:global(.dark) .analysis-card[open] .analysis-card-chevron {
  color: #0a84ff;
}

:global(.dark) .analysis-card-content {
  color: var(--text-color, #f5f5f7);
}

.evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.evidence-column {
  padding: 1.5rem;
  border-radius: 8px;
}

.evidence-column.supporting {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.evidence-column.contradicting {
  background: #ffebee;
  border-left: 4px solid #f44336;
}

:global(.dark) .evidence-column.supporting {
  background: #1b5e20;
}

:global(.dark) .evidence-column.contradicting {
  background: #b71c1c;
}

.evidence-list {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0 0;
}

.evidence-list li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.evidence-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  font-weight: bold;
  font-size: 1.2rem;
}

.analysis-summary {
  display: flex;
  gap: 2rem;
  padding: 1.5rem;
  background: var(--surface-variant, #f5f5f5);
  border-radius: 8px;
  margin-top: 1.5rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-muted, #666);
  font-weight: 500;
}

.summary-value {
  font-size: 1.125rem;
  font-weight: 700;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  display: inline-block;
}

.summary-value.risk-low,
.summary-value.opp-low {
  background: #e8f5e9;
  color: #2e7d32;
}

.summary-value.risk-medium,
.summary-value.opp-medium {
  background: #fff3e0;
  color: #ef6c00;
}

.summary-value.risk-high,
.summary-value.opp-high {
  background: #ffebee;
  color: #c62828;
}

.summary-value.risk-critical {
  background: #d32f2f;
  color: white;
}

.summary-value.opp-exceptional {
  background: #1b5e20;
  color: white;
}

.no-analysis {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-muted, #666);
}

.no-analysis p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

.btn-generate {
  padding: 0.75rem 1.5rem;
  background: var(--primary, #1976d2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-muted, #666);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color, #e0e0e0);
  border-top-color: var(--primary, #1976d2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary, #1976d2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-retry:hover {
  background: #1565c0;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STRATEGY INSIGHTS - Apple-inspired cards
   ═══════════════════════════════════════════════════════════════════════════ */

.insights-box {
  margin: 1.5rem 0;
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.insights-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--text-color, #1d1d1f);
  letter-spacing: -0.01em;
}

.insights-description {
  color: var(--text-muted, #86868b);
  margin-bottom: 1.75rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.875rem;
}

.question-card {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e5e5e7);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  color: var(--text-color, #1d1d1f);
}

.question-card:hover {
  background: var(--card-bg, #ffffff);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  border-color: var(--primary, #007aff);
}

.question-card:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.question-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  opacity: 0.9;
}

.question-content {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
}

.question-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-color, #1d1d1f);
  font-weight: 500;
}

.strategy-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, var(--primary, #007aff) 0%, #5856d6 100%);
  color: #ffffff;
  padding: 0.3rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  align-self: flex-start;
  text-transform: uppercase;
}

:global(.dark) .insights-box {
  background: var(--card-bg, #1c1c1e);
  border-color: var(--border-color, #38383a);
}

:global(.dark) .insights-title {
  color: var(--text-color, #f5f5f7);
}

:global(.dark) .question-card {
  background: var(--surface-variant, #2c2c2e);
  border-color: var(--border-color, #38383a);
}

:global(.dark) .question-card:hover {
  background: var(--surface-variant, #3a3a3c);
  border-color: var(--primary, #0a84ff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15);
}

:global(.dark) .question-text {
  color: var(--text-color, #f5f5f7);
}

:global(.dark) .strategy-badge {
  background: linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%);
}

.welcome-subtitle {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text-secondary, #666);
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .evidence-grid {
    grid-template-columns: 1fr;
  }
  
  .strategy-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .strategy-actions {
    width: 100%;
  }

  .questions-grid {
    grid-template-columns: 1fr;
  }
}

/* Chat Placeholder */
.chat-placeholder {
  width: 320px;
  max-width: 100%;
  background: var(--surface-color, #ffffff);
  border-left: 1px solid var(--border-color, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  flex-shrink: 0;
}

.chat-placeholder-content {
  text-align: center;
  max-width: 300px;
}

.chat-placeholder-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: var(--text-color, #000000);
}

.chat-placeholder-content p {
  margin: 0 0 0.75rem 0;
  color: var(--text-secondary, #666666);
  line-height: 1.5;
}

.placeholder-hint {
  font-size: 0.875rem;
  color: var(--text-muted, #999999);
  font-style: italic;
}

</style>