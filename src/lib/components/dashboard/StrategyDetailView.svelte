<!-- StrategyDetailView.svelte - Strategy detail view with analysis -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getStrategy, type StrategyDetail, type Stance, type PositionStatus, type TimeHorizon } from '$lib/api/strategies';
  import EntityHeader from '$lib/components/EntityHeader.svelte';
  import AnalysisDisplay from '$lib/components/AnalysisDisplay.svelte';
  import FindingsCards from '$lib/components/FindingsCards.svelte';
  import PdfExportModal from '$lib/components/PdfExportModal.svelte';

  // Props
  export let strategyId: string;
  export let username: string;
  export let isAdmin: boolean = false;
  export let refreshKey: number = 0;
  export let openSections: Record<string, boolean> = {};

  let showPdfModal = false;

  const dispatch = createEventDispatcher();

  // Helper to format stance display
  function getStanceDisplay(stance: Stance): { icon: string; label: string; color: string } {
    switch (stance) {
      case 'bull':
        return { icon: '\u2191', label: 'Bullish', color: '#22c55e' };
      case 'bear':
        return { icon: '\u2193', label: 'Bearish', color: '#ef4444' };
      default:
        return { icon: '\u2194', label: 'Neutral', color: '#6b7280' };
    }
  }

  // Helper to format position status display
  function getPositionDisplay(status: PositionStatus): { icon: string; label: string; color: string } {
    switch (status) {
      case 'looking_to_enter':
        return { icon: '\ud83c\udfaf', label: 'Looking to Enter', color: '#f59e0b' };
      case 'in_position':
        return { icon: '\u2705', label: 'In Position', color: '#3b82f6' };
      default:
        return { icon: '\ud83d\udc41', label: 'Monitoring', color: '#6b7280' };
    }
  }

  // Helper to format time horizon display
  function getHorizonDisplay(horizon: TimeHorizon): string {
    switch (horizon) {
      case 'weeks':
        return '1-4 weeks';
      case 'months':
        return '1-6 months';
      case 'quarters':
        return '6+ months';
      default:
        return '';
    }
  }

  function handleBack() {
    dispatch('back');
  }

  function handleEdit(strategy: StrategyDetail) {
    dispatch('edit', strategy);
  }

  function handleDelete(strategyId: string) {
    dispatch('delete', strategyId);
  }

  function handleToggleDefault(strategyId: string, isDefault: boolean) {
    dispatch('toggleDefault', { strategyId, isDefault });
  }

  function handleImproveStrategy(strategy: StrategyDetail) {
    // Opens edit modal (handled by parent)
    dispatch('improveStrategy', strategy);
  }

  function handleSuggestChanges(sectionName: string, sectionTitle: string, content: string) {
    dispatch('suggestChanges', { sectionName, sectionTitle, content, strategyId });
  }

  function handleSectionToggle(section: string, isOpen: boolean) {
    dispatch('sectionToggle', { section, isOpen });
  }

  function handleArticleLinkClick(event: CustomEvent<MouseEvent>) {
    dispatch('articleClick', event.detail);
  }

  function handleDiscussFindings(finding: any, type: string) {
    dispatch('discussFindings', { finding, type });
  }

  function getExportableSections(strategy: StrategyDetail) {
    return [
      { title: 'Strategy Thesis', content: strategy.user_input.strategy_text },
      { title: 'Target Outlook', content: strategy.user_input.position_text || '' },
      { title: 'Price Target', content: strategy.user_input.target || '' },
      ...(strategy.latest_analysis?.final_analysis
        ? Object.entries(strategy.latest_analysis.final_analysis).map(([key, content]) => ({
            title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            content: content || ''
          }))
        : [])
    ];
  }
</script>

{#key refreshKey}
  {#await getStrategy(username, strategyId)}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading strategy...</p>
    </div>
  {:then strategy}
    <section class="strategy-detail-box">
      <!-- Entity Header Component -->
      <EntityHeader
        title={strategy.asset.primary}
        badge={strategy.is_default ? '📌' : null}
        badgeTitle="Example Strategy"
        metadata={[
          { label: 'Target', value: strategy.user_input.target },
          { label: 'Version', value: String(strategy.version) },
          { label: 'Updated', value: new Date(strategy.updated_at).toLocaleDateString() }
        ]}
        hint="Keep this thesis high-level; use Edit to adjust it, then chat on the right about this strategy or its topics."
        showBack={true}
        showEdit={!strategy.is_default || isAdmin}
        showDelete={!strategy.is_default}
        showExport={true}
        showToggleDefault={isAdmin}
        isDefault={strategy.is_default || false}
        showImproveButton={!strategy.is_default || isAdmin}
        sections={[
          {
            heading: 'Strategy Thesis',
            content: strategy.user_input.strategy_text,
            hint: strategy.is_default ? '(example text, read-only)' : '(your text – change it with Edit)'
          },
          ...(strategy.user_input.position_text ? [{ heading: 'Target Outlook', content: strategy.user_input.position_text }] : []),
          ...(strategy.user_input.target ? [{ heading: 'Target', content: strategy.user_input.target }] : [])
        ]}
        on:back={handleBack}
        on:edit={() => handleEdit(strategy)}
        on:delete={() => handleDelete(strategy.id)}
        on:export={() => showPdfModal = true}
        on:toggleDefault={() => handleToggleDefault(strategy.id, strategy.is_default || false)}
        on:improveStrategy={() => handleImproveStrategy(strategy)}
      />

      <!-- Strategy Settings (Read-Only Display) -->
      <div class="strategy-settings-display">
        <div class="setting-item">
          <span class="setting-label">View:</span>
          <span class="setting-value" style="color: {getStanceDisplay(strategy.stance).color}">
            {getStanceDisplay(strategy.stance).icon} {getStanceDisplay(strategy.stance).label}
          </span>
        </div>
        <div class="setting-item">
          <span class="setting-label">Status:</span>
          <span class="setting-value" style="color: {getPositionDisplay(strategy.position_status).color}">
            {getPositionDisplay(strategy.position_status).icon} {getPositionDisplay(strategy.position_status).label}
          </span>
          {#if strategy.time_horizon}
            <span class="horizon-badge">
              {getHorizonDisplay(strategy.time_horizon)}
            </span>
          {/if}
        </div>
      </div>

      <!-- Analysis Display Component -->
      {#if strategy.latest_analysis?.analyzed_at && strategy.latest_analysis.final_analysis}
        <AnalysisDisplay
          sections={strategy.latest_analysis.final_analysis}
          heroKey="executive_summary"
          showEditButtons={true}
          timestamp={strategy.latest_analysis.analyzed_at}
          {openSections}
          on:suggestEdit={(e) => handleSuggestChanges(e.detail.section, e.detail.title, e.detail.content)}
          on:sectionToggle={(e) => handleSectionToggle(e.detail.section, e.detail.isOpen)}
          on:contentClick={handleArticleLinkClick}
        />

        <!-- Findings Cards (Risks & Opportunities) - After Analysis -->
        {#if strategy.exploration_findings}
          <FindingsCards
            risks={strategy.exploration_findings.risks || []}
            opportunities={strategy.exploration_findings.opportunities || []}
            on:discuss={(e) => handleDiscussFindings(e.detail.finding, e.detail.type)}
          />
        {/if}
      {:else}
        <div class="no-analysis">
          <p>No AI analysis generated yet</p>
          <button class="btn-generate">
            Generate Analysis (Coming Soon)
          </button>
        </div>
      {/if}

      {#if showPdfModal}
        <PdfExportModal
          strategy={{
            title: strategy.asset.primary,
            sections: getExportableSections(strategy)
          }}
          onClose={() => showPdfModal = false}
        />
      {/if}
    </section>
  {:catch error}
    <p class="error-message">Error loading strategy: {error.message}</p>
  {/await}
{/key}

<style>
  .strategy-detail-box {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1.5rem;
  }

  .loading-container {
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

  .error-message {
    text-align: center;
    padding: 2rem;
    color: #ff3b30;
  }

  /* Strategy Settings Display (Read-Only) */
  .strategy-settings-display {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 0.75rem 1rem;
    margin-bottom: 1.5rem;
    background: var(--hover-bg, #f8f9fa);
    border-radius: 10px;
    flex-wrap: wrap;
  }

  .setting-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .setting-label {
    font-size: 0.9rem;
    color: var(--text-muted, #666);
  }

  .setting-value {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .horizon-badge {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    background: rgba(139, 92, 246, 0.1);
    color: #7c3aed;
    border-radius: 4px;
    font-weight: 500;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .strategy-detail-box {
      margin: 0 !important;
      padding: 0 !important;
      max-width: 100% !important;
      width: 100% !important;
    }
  }
</style>
