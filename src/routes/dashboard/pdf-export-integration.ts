// TEMPORARY FILE - REVIEW BEFORE APPLYING TO +page.svelte

// Required additions to +page.svelte:

// 1. Add to imports:
import PdfExportModal from '$lib/components/PdfExportModal.svelte';

// 2. Add state variable:
let showPdfModal = false;

// 3. Add this function (place in script section):
function getExportableSections(strategy: StrategyDetail) {
  return [
    { title: 'Strategy Thesis', content: strategy.user_input.strategy_text },
    { title: 'Target Outlook', content: strategy.user_input.position_text },
    { title: 'Price Target', content: strategy.user_input.target },
    ...(strategy.latest_analysis?.final_analysis 
      ? Object.entries(strategy.latest_analysis.final_analysis).map(([key, content]) => ({
          title: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          content
        }))
      : [])
  ];
}

// 4. Add this button (place near other action buttons):
<button class="btn-export" on:click={() => showPdfModal = true}>
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
  Export PDF
</button>

// 5. Add this modal (place at bottom of template):
{#if showPdfModal && currentSelection.type === 'strategy'}
  <PdfExportModal 
    strategy={{
      title: strategy.asset.primary,
      sections: getExportableSections(strategy)
    }} 
    onClose={() => showPdfModal = false}
  />
{/if}

// 6. Add to styles:
.btn-export {
  background: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-left: 0.5rem;
}

.btn-export:hover {
  background: #1a252f;
}
