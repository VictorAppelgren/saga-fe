<script lang="ts">
  import { generateStrategyPdf } from '$lib/utils/pdfGenerator';
  import { fade } from 'svelte/transition';
  
  interface Props {
    strategy: {
      title: string;
      sections: Array<{ title: string; content: string; isCustom?: boolean }>;
    };
    onClose: () => void;
  }
  
  let { strategy, onClose }: Props = $props();
  
  let sections = $state([...strategy.sections.map(s => ({ ...s, included: true, expanded: false }))]);
  let draggedItem: number | null = null;

  function toggleSection(index: number) {
    sections[index].expanded = !sections[index].expanded;
    sections = [...sections];
  }

  function toggleIncluded(index: number) {
    sections[index].included = !sections[index].included;
    sections = [...sections];
  }

  function handleDragStart(index: number) {
    draggedItem = index;
  }

  function handleDragOver(index: number) {
    if (draggedItem === null || draggedItem === index) return;
    
    const newItems = [...sections];
    const item = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, item);
    
    sections = newItems;
    draggedItem = index;
  }

  function handleDragEnd() {
    draggedItem = null;
  }

  function addCustomSection() {
    sections = [...sections, { title: 'Custom Section', content: '', isCustom: true, included: true, expanded: true }];
  }

  async function exportPdf() {
    try {
      const pdfBlob = await generateStrategyPdf(
        strategy.title,
        sections.filter(s => s.included && s.content.trim())
      );
      
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${strategy.title.replace(/\s+/g, '_')}_Report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF');
    }
  }
</script>

<div class="modal-overlay" onclick={onClose} onkeydown={(e) => e.key === 'Escape' && onClose()} role="presentation" transition:fade>
  <div class="modal-content" onclick={(e) => e.stopPropagation()} onkeydown={() => {}} role="dialog" aria-modal="true">
    <h2>Export {strategy.title} to PDF</h2>
    
    <div class="section-list">
      {#each sections as section, index (index)}
        <div 
          class="section-card {section.isCustom ? 'custom' : ''} {draggedItem === index ? 'dragging' : ''}"
          role="listitem"
        >
          <span 
            class="drag-handle"
            draggable={true}
            ondragstart={() => handleDragStart(index)}
            ondragover={() => handleDragOver(index)}
            ondragend={handleDragEnd}
          >
            ☰
          </span>
          
          <div class="section-main">
            <div class="section-header" onclick={() => toggleSection(index)}>
              <h3 class="section-title">{section.title}</h3>
              <button class="expand-btn" type="button">
                {section.expanded ? '−' : '+'}
              </button>
            </div>
            
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                checked={section.included} 
                onchange={() => toggleIncluded(index)}
              />
              <span class="checkbox-text">Include in PDF</span>
            </label>
            
            {#if section.expanded}
              <div class="section-content-expanded">
                {#if section.isCustom}
                  <textarea 
                    bind:value={section.content}
                    placeholder="Enter your custom content..."
                  ></textarea>
                {:else}
                  <p class="content-text">{section.content}</p>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
    
    <div class="modal-actions">
      <button class="btn-secondary" onclick={addCustomSection}>
        + Add Custom Section
      </button>
      <button class="btn-primary" onclick={exportPdf}>
        Generate PDF
      </button>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: var(--card-bg, white);
    border-radius: 12px;
    padding: 2rem;
    width: 900px;
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }
  
  .modal-content h2 {
    margin: 0 0 1.5rem 0;
    color: var(--text-color, #1a1a1a);
  }
  
  .section-list {
    margin: 1.5rem 0;
  }
  
  .section-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .section-card.custom {
    background: #fff9e6;
    border-left: 3px solid #f0c808;
  }
  
  .section-card.dragging {
    opacity: 0.5;
    box-shadow: 0 0 10px rgba(0, 113, 227, 0.3);
  }
  
  .drag-handle {
    cursor: move;
    font-size: 1.5rem;
    color: #999;
    padding: 0.5rem;
    user-select: none;
    display: flex;
    align-items: flex-start;
    padding-top: 0.25rem;
  }
  
  .drag-handle:hover {
    color: #666;
  }
  
  .section-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  
  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .expand-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.2s;
  }
  
  .expand-btn:hover {
    background: #f0f0f0;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #666;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .checkbox-text {
    user-select: none;
  }
  
  .section-content-expanded {
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e0e0e0;
  }
  
  .content-text {
    margin: 0;
    color: #333;
    line-height: 1.6;
    white-space: pre-wrap;
  }
  
  
  textarea {
    width: 100%;
    min-height: 100px;
    padding: 0.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    font-family: inherit;
  }
  
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color, #e0e0e0);
  }
  
  .btn-secondary, .btn-primary {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-secondary {
    background: var(--hover-bg, #f5f5f5);
    color: var(--text-color, #333);
  }
  
  .btn-secondary:hover {
    background: var(--border-color, #e0e0e0);
  }
  
  .btn-primary {
    background: #2c3e50;
    color: white;
  }
  
  .btn-primary:hover {
    background: #1a252f;
  }
</style>
