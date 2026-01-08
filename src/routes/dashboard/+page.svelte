<script lang="ts">
  // Dashboard Orchestrator - Main page coordinator
  import { onMount } from 'svelte';
  import { invalidateAll } from '$app/navigation';

  // UI Store for responsive sidebars
  import {
    leftSidebarOpen,
    rightSidebarOpen,
    isMobile,
    toggleLeftSidebar,
    toggleRightSidebar,
    anySidebarOpen
  } from '$lib/stores/ui';

  // Dashboard components
  import { LeftSidebar, RightSidebar, StrategyDetailView, TopicDetailView, DashboardHome } from '$lib/components/dashboard';

  // Other components
  import ThemeInfo from '$lib/components/ThemeInfo.svelte';
  import ThemeReview from '$lib/components/ThemeReview.svelte';
  import StrategyModal from '$lib/components/StrategyModal.svelte';
  import ArticleModal from '$lib/components/ArticleModal.svelte';
  import FindingModal from '$lib/components/FindingModal.svelte';

  // Types
  import type { Theme } from '$lib/types/storage';
  import type { Strategy, StrategyDetail, ImproveStrategyTextResponse } from '$lib/api/strategies';
  import { updateStrategy, createStrategy, deleteStrategy as deleteStrategyAPI, improveStrategyText } from '$lib/api/strategies';

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Page data from load function
  export let data;

  // --- SELECTION STATE ---
  type Selection = { type: 'theme' | 'nav' | 'interest' | 'strategy'; value: string };
  let currentSelection: Selection = { type: 'nav', value: 'dashboard' };

  // --- MODAL STATE ---
  let showStrategyModal = false;
  let showArticleModal = false;
  let showFindingModal = false;
  let modalMode: 'create' | 'edit' = 'create';
  let editingStrategy: StrategyDetail | null = null;
  let selectedArticleId: string | null = null;
  let selectedFindingId: string | null = null;

  // --- STRATEGY STATE ---
  let strategyRefreshKey = 0;
  let openSections: Record<string, boolean> = {};

  // --- AI IMPROVEMENT STATE (modal-only now) ---
  // Note: Improvement happens in the edit modal, not inline in main view

  // --- CHAT STATE ---
  let chatTriggerMessage: string | null = null;

  // --- FEEDBACK CONTEXT (for suggesting changes) ---
  interface FeedbackContext {
    section: string;
    sectionTitle: string;
    strategyId: string;
    currentContent: string;
  }
  let feedbackContext: FeedbackContext | null = null;

  // For theme display (legacy)
  $: themeForDisplay = null;

  // --- SELECTION HANDLERS ---
  function selectStrategy(strategy: Strategy): void {
    currentSelection = { type: 'strategy', value: strategy.id };
    openSections = {};
    if ($isMobile) leftSidebarOpen.set(false);
  }

  function selectInterest(interest: { id: string; name: string }): void {
    currentSelection = { type: 'interest', value: interest.id };
    if ($isMobile) leftSidebarOpen.set(false);
  }

  function selectNav(value: string): void {
    currentSelection = { type: 'nav', value };
  }

  function selectTheme(theme: Theme): void {
    currentSelection = { type: 'theme', value: theme.id };
  }

  // --- STRATEGY MODAL HANDLERS ---
  function openCreateStrategyModal() {
    modalMode = 'create';
    editingStrategy = null;
    showStrategyModal = true;
  }

  function openEditModal(strategy: StrategyDetail) {
    modalMode = 'edit';
    editingStrategy = strategy;
    showStrategyModal = true;
  }

  async function handleStrategySave(formData: any) {
    try {
      if (modalMode === 'create') {
        const savedStrategy = await createStrategy({
          username: data.user.username,
          ...formData
        });
        showStrategyModal = false;
        currentSelection = { type: 'strategy', value: savedStrategy.id };
        await invalidateAll();
      } else if (editingStrategy) {
        const strategyId = editingStrategy.id;
        await updateStrategy(strategyId, {
          username: data.user.username,
          strategy_text: formData.strategy_text,
          position_text: formData.position_text,
          target: formData.target
        });
        showStrategyModal = false;
        currentSelection = { type: 'strategy', value: strategyId };
        await new Promise(resolve => setTimeout(resolve, 100));
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

  // --- DEFAULT STATUS TOGGLE ---
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
      await invalidateAll();
      strategyRefreshKey++;
      alert(result.message);
    } catch (error) {
      console.error('Error toggling default status:', error);
      alert('Failed to update default status');
    }
  }

  // --- AI IMPROVEMENT HANDLERS ---
  // Main view "Improve" button now opens the edit modal
  function handleImproveStrategy(strategy: StrategyDetail) {
    // Open edit modal - the modal has its own improvement functionality
    openEditModal(strategy);
  }

  // For modal - returns the result instead of setting state
  async function handleImproveThesisForModal(strategy: StrategyDetail): Promise<ImproveStrategyTextResponse | null> {
    try {
      const result = await improveStrategyText(
        data.user.username,
        strategy.id,
        strategy.user_input.strategy_text,
        strategy.asset.primary,
        strategy.user_input.position_text || undefined
      );
      return result;
    } catch (error) {
      console.error('Error improving strategy:', error);
      throw error;
    }
  }

  // --- FEEDBACK/SUGGEST CHANGES HANDLERS ---
  function handleSuggestChanges(detail: { sectionName: string; sectionTitle: string; content: string; strategyId: string }) {
    feedbackContext = {
      section: detail.sectionName,
      sectionTitle: detail.sectionTitle,
      strategyId: detail.strategyId,
      currentContent: detail.content
    };
    openSections = { ...openSections, [detail.sectionName]: true };

    if (typeof document !== 'undefined') {
      const chatSection = document.querySelector('.chat-container');
      chatSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function clearFeedbackContext() {
    feedbackContext = null;
  }

  function handleSectionRewritten(detail: { section: string; newContent: string }) {
    console.info(`Section rewritten: ${detail.section}`);
    feedbackContext = null;
    openSections = { ...openSections, [detail.section]: true };
    strategyRefreshKey += 1;
  }

  function handleSectionToggle(detail: { section: string; isOpen: boolean }) {
    openSections = { ...openSections, [detail.section]: detail.isOpen };
  }

  // --- ARTICLE & FINDING LINK HANDLER ---
  function handleArticleLinkClick(event: MouseEvent) {
    let target = event.target as HTMLElement;
    while (target && target !== event.currentTarget) {
      if (target.tagName === 'A') {
        // Check for finding ID first (R_XXXXXXXXX or O_XXXXXXXXX)
        const findingId = target.getAttribute('data-finding-id');
        if (findingId) {
          event.preventDefault();
          event.stopPropagation();
          selectedFindingId = findingId;
          showFindingModal = true;
          return;
        }
        // Then check for article ID
        const articleId = target.getAttribute('data-article-id');
        if (articleId) {
          event.preventDefault();
          event.stopPropagation();
          selectedArticleId = articleId;
          showArticleModal = true;
          return;
        }
      }
      target = target.parentElement as HTMLElement;
    }
  }

  // --- DISCUSS FINDINGS HANDLER ---
  function handleDiscussFindings(detail: { finding: any; type: string }) {
    chatTriggerMessage = `Tell me more about this ${detail.type}: "${detail.finding.headline}"`;
  }

  // --- DASHBOARD HOME QUESTION HANDLER ---
  async function handleQuestionClick(question: { text: string; strategyId: string; strategyAsset: string }) {
    currentSelection = { type: 'strategy', value: question.strategyId };

    await new Promise(resolve => setTimeout(resolve, 200));

    const chatSection = document.querySelector('.chat-container');
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    chatTriggerMessage = null;
    await new Promise(resolve => setTimeout(resolve, 10));
    chatTriggerMessage = question.text;
  }

  // --- TRIGGER CHAT FROM RIGHT SIDEBAR ---
  function handleTriggerChat(message: string) {
    chatTriggerMessage = null;
    setTimeout(() => {
      chatTriggerMessage = message;
    }, 10);
  }
</script>

<div class="app-container">
  <!-- Mobile Header with toggle buttons -->
  {#if $isMobile}
    <header class="mobile-header">
      <button class="mobile-toggle-btn" on:click={() => { rightSidebarOpen.set(false); toggleLeftSidebar(); }} aria-label="Toggle menu">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      <span class="mobile-title">Saga</span>
      <button class="mobile-toggle-btn" on:click={() => { leftSidebarOpen.set(false); toggleRightSidebar(); }} aria-label="Toggle chat">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>
    </header>
  {/if}

  <!-- Backdrop for mobile when sidebar is open -->
  {#if $anySidebarOpen}
    <button
      class="sidebar-backdrop"
      on:click={() => { leftSidebarOpen.set(false); rightSidebarOpen.set(false); }}
      on:touchmove|preventDefault
      aria-label="Close sidebar"
    ></button>
  {/if}

  <!-- Left Sidebar -->
  <LeftSidebar
    strategies={data?.strategies || []}
    interests={data?.interests || []}
    user={data?.user}
    {currentSelection}
    isOpen={$leftSidebarOpen}
    isMobile={$isMobile}
    on:selectStrategy={(e) => selectStrategy(e.detail)}
    on:selectInterest={(e) => selectInterest(e.detail)}
    on:selectNav={(e) => selectNav(e.detail)}
    on:createStrategy={openCreateStrategyModal}
  />

  <!-- Main Content -->
  <main class="main-content scrollable-main">
    {#if themeForDisplay}
      <div class="theme-header">
        <div class="spacer"></div>
      </div>
      <ThemeInfo theme={themeForDisplay} />
      <ThemeReview theme={themeForDisplay} />
    {:else if currentSelection.type === 'interest'}
      <TopicDetailView
        interestId={currentSelection.value}
        interestName={data?.interests?.find((i: { id: string; name: string }) => i?.id === currentSelection?.value)?.name || 'No topic'}
        {openSections}
        on:back={() => currentSelection = { type: 'nav', value: 'dashboard' }}
        on:sectionToggle={(e) => handleSectionToggle(e.detail)}
        on:articleClick={(e) => handleArticleLinkClick(e.detail)}
        on:discussFindings={(e) => handleDiscussFindings(e.detail)}
      />
    {:else if currentSelection.type === 'strategy'}
      <StrategyDetailView
        strategyId={currentSelection.value}
        username={data.user.username}
        isAdmin={data.user?.is_admin || false}
        refreshKey={strategyRefreshKey}
        {openSections}
        on:back={() => currentSelection = { type: 'nav', value: 'dashboard' }}
        on:edit={(e) => openEditModal(e.detail)}
        on:delete={(e) => handleDeleteStrategy(e.detail)}
        on:toggleDefault={(e) => toggleDefaultStatus(e.detail.strategyId, e.detail.isDefault)}
        on:improveStrategy={(e) => handleImproveStrategy(e.detail)}
        on:suggestChanges={(e) => handleSuggestChanges(e.detail)}
        on:sectionToggle={(e) => handleSectionToggle(e.detail)}
        on:articleClick={(e) => handleArticleLinkClick(e.detail)}
        on:discussFindings={(e) => handleDiscussFindings(e.detail)}
      />
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
      <DashboardHome
        username={data.user?.username || ''}
        on:questionClick={(e) => handleQuestionClick(e.detail)}
      />
    {:else}
      <div class="content-section">
        <p>Select a strategy or asset to view details.</p>
      </div>
    {/if}
  </main>

  <!-- Right Sidebar (Chat) -->
  <RightSidebar
    isOpen={$rightSidebarOpen}
    isMobile={$isMobile}
    {currentSelection}
    username={data?.user?.username || null}
    triggerMessage={chatTriggerMessage}
    {feedbackContext}
    strategies={data?.strategies || []}
    interests={data?.interests || []}
    on:toggle={toggleRightSidebar}
    on:clearFeedback={clearFeedbackContext}
    on:sectionRewritten={(e) => handleSectionRewritten(e.detail)}
    on:selectStrategy={(e) => selectStrategy(e.detail)}
    on:selectInterest={(e) => selectInterest(e.detail)}
    on:triggerChat={(e) => handleTriggerChat(e.detail)}
  />
</div>

{#if showStrategyModal}
  <StrategyModal
    mode={modalMode}
    strategy={editingStrategy}
    onSave={handleStrategySave}
    onCancel={() => showStrategyModal = false}
    onImproveThesis={modalMode === 'edit' && editingStrategy ? handleImproveThesisForModal : null}
  />
{/if}

{#if showArticleModal && selectedArticleId}
  <ArticleModal
    articleId={selectedArticleId}
    onClose={() => showArticleModal = false}
  />
{/if}

{#if showFindingModal && selectedFindingId}
  <FindingModal
    findingId={selectedFindingId}
    onClose={() => showFindingModal = false}
  />
{/if}

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     GLOBAL CSS VARIABLES
     ═══════════════════════════════════════════════════════════════════════════ */

  :global(.dark) {
    --bg-color: #000000;
    --text-color: #f5f5f7;
    --text-muted: #86868b;
    --card-bg: #1c1c1e;
    --border-color: #38383a;
    --hover-bg: #2c2c2e;
    --primary: #2563eb;
    --surface-variant: #2c2c2e;
  }

  :global(:root) {
    --bg-color: #ffffff;
    --text-color: #1d1d1f;
    --text-muted: #86868b;
    --card-bg: #ffffff;
    --border-color: #d2d2d7;
    --hover-bg: #f5f5f7;
    --primary: #2563eb;
    --surface-variant: #f5f5f7;
  }

  :global(body) {
    margin: 0;
    padding: 0;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     RESPONSIVE 3-COLUMN LAYOUT
     ═══════════════════════════════════════════════════════════════════════════ */

  .app-container {
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    min-height: 100vh;
    background: var(--bg-color, white);
    position: relative;
    overflow: hidden;
  }

  /* When right sidebar is closed on desktop */
  .app-container:has(:global(.right-sidebar:not(.open))) {
    grid-template-columns: 280px 1fr 0;
  }

  .app-container:has(:global(.right-sidebar:not(.open))) .main-content {
    margin-right: 0;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     MAIN CONTENT
     ═══════════════════════════════════════════════════════════════════════════ */

  .main-content {
    padding: 1.5rem 2rem;
    background: var(--bg-color, #ffffff);
    overflow-y: auto;
    min-height: 100vh;
  }

  .scrollable-main {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     MOBILE HEADER
     ═══════════════════════════════════════════════════════════════════════════ */

  .mobile-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 56px;
    background: var(--card-bg, #ffffff);
    border-bottom: 1px solid var(--border-color, #d2d2d7);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1rem;
    z-index: 200;
  }

  :global(.dark) .mobile-header {
    background: var(--card-bg, #1c1c1e);
  }

  .mobile-toggle-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    color: var(--text-color, #1d1d1f);
    transition: background 0.2s;
  }

  .mobile-toggle-btn:hover {
    background: var(--hover-bg, #f5f5f7);
  }

  .mobile-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-color, #1d1d1f);
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SIDEBAR BACKDROP (mobile overlay)
     ═══════════════════════════════════════════════════════════════════════════ */

  .sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 90;
    border: none;
    cursor: pointer;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     SETTINGS & GENERIC CONTENT
     ═══════════════════════════════════════════════════════════════════════════ */

  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .top-bar h1 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 600;
  }

  .content-section {
    padding: 1rem 0;
  }

  .card {
    background: var(--card-bg, #f5f5f5);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .theme-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 1rem;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     MOBILE RESPONSIVE STYLES
     ═══════════════════════════════════════════════════════════════════════════ */

  @media (max-width: 768px) {
    .app-container {
      display: block;
      padding-top: 56px;
      min-height: 100vh;
      min-height: 100dvh;
      overflow-x: hidden;
    }

    .main-content {
      width: 100%;
      min-height: calc(100vh - 56px);
      min-height: calc(100dvh - 56px);
      overflow-y: auto;
      padding: 0.5rem 1rem !important;
      padding-bottom: env(safe-area-inset-bottom, 0) !important;
    }

    .scrollable-main {
      height: auto;
      min-height: calc(100vh - 56px);
      min-height: calc(100dvh - 56px);
      padding: 0.5rem 1rem !important;
      padding-bottom: env(safe-area-inset-bottom, 20px) !important;
    }

    .card {
      border-radius: 8px;
      padding: 1rem;
      margin: 0;
    }

    /* Lock body scroll when sidebar is open */
    .app-container:has(:global(.sidebar.mobile.open)) .main-content {
      overflow: hidden;
      position: fixed;
      width: 100%;
    }
  }

  /* Tablet adjustments */
  @media (min-width: 769px) and (max-width: 1024px) {
    .app-container {
      grid-template-columns: 240px 1fr 280px;
    }
  }
</style>
