<!-- TopicDetailView.svelte - Topic/Interest detail view with report -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getReport } from '$lib/api/reports';
  import EntityHeader from '$lib/components/EntityHeader.svelte';
  import AnalysisDisplay from '$lib/components/AnalysisDisplay.svelte';
  import FindingsCards from '$lib/components/FindingsCards.svelte';

  // Props
  export let interestId: string;
  export let interestName: string;
  export let openSections: Record<string, boolean> = {};

  const dispatch = createEventDispatcher();

  function handleBack() {
    dispatch('back');
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
</script>

<section class="strategy-detail-box">
  <!-- Entity Header Component for Topics -->
  <EntityHeader
    title={interestName || 'No topic'}
    metadata={[{ label: 'Type', value: 'Research Topic' }]}
    hint="Click this topic or any watchlist on the left to explore details and talk to Saga about it in the chat."
    showBack={true}
    on:back={handleBack}
  />

  <!-- Report content using AnalysisDisplay component -->
  {#await getReport(interestId) then report}
    {#if report.sections && Object.keys(report.sections).length > 0}
      <AnalysisDisplay
        sections={report.sections}
        heroKey="executive_summary"
        showEditButtons={false}
        {openSections}
        on:sectionToggle={(e) => handleSectionToggle(e.detail.section, e.detail.isOpen)}
        on:contentClick={handleArticleLinkClick}
      />

      <!-- Findings Cards (Risks & Opportunities) - After Analysis -->
      {#if report.exploration_findings}
        <FindingsCards
          risks={report.exploration_findings.risks || []}
          opportunities={report.exploration_findings.opportunities || []}
          on:discuss={(e) => handleDiscussFindings(e.detail.finding, e.detail.type)}
        />
      {/if}
    {:else}
      <div class="no-analysis">
        <p>No report content found for this topic.</p>
      </div>
    {/if}
  {:catch error}
    <div class="no-analysis">
      <p>No report found for this topic.</p>
    </div>
  {/await}
</section>

<style>
  .strategy-detail-box {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1.5rem;
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
