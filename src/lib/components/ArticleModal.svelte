<script lang="ts">
  import { onMount } from 'svelte';
  
  export let articleId: string;
  export let onClose: () => void;
  
  let article: any = null;
  let loading = true;
  let error = false;
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  onMount(async () => {
    try {
      const response = await fetch(`${API_BASE}/articles/${articleId}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      article = await response.json();
    } catch (e) {
      console.error('Error loading article:', e);
      error = true;
    } finally {
      loading = false;
    }
  });
</script>

<div class="modal-overlay" on:click={onClose} role="presentation">
  <div class="modal-content" on:click|stopPropagation role="dialog" aria-modal="true">
    <button class="close-button" on:click={onClose} aria-label="Close article">×</button>
    
    {#if loading}
      <div class="loading">Loading article...</div>
    {:else if error}
      <div class="error">Failed to load article</div>
    {:else if article}
      <div class="article-content">
        <h1 class="article-title">{article.title}</h1>
        
        <!-- Metadata bar -->
        <div class="metadata-bar">
          <span class="metadata-item article-id">ID: {article.id || articleId}</span>
          <span class="metadata-item">Source: {article.source?.domain || '-'}</span>
          <span class="metadata-item">Published: {article.pubDate || article.published_at || '-'}</span>
        </div>
        
        <!-- Summary -->
        {#if article.summary}
          <div class="article-summary">
            <h3>Summary</h3>
            <p>{article.summary}</p>
          </div>
        {/if}
        
        <!-- Full Content -->
        {#if article.content}
          <div class="article-body">
            <h3>Full Content</h3>
            <p>{article.content}</p>
          </div>
        {/if}

        <!-- View original link -->
        {#if article.url}
          <div class="article-footer">
            <a href={article.url} target="_blank" rel="noopener noreferrer" class="external-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
              View Original Article
            </a>
          </div>
        {/if}
      </div>
    {/if}
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
    padding: 2rem;
  }

  .modal-content {
    background: var(--bg-color, white);
    border-radius: 12px;
    padding: 2rem;
    max-width: 800px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: var(--text-muted, #666);
    padding: 0.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .close-button:hover {
    background: var(--hover-bg, #f0f0f0);
  }

  .loading,
  .error {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--text-muted, #666);
    font-size: 1.1rem;
  }

  .error {
    color: #d32f2f;
  }

  .article-content {
    padding-right: 2rem;
  }

  .source-badge {
    display: inline-block;
    background: var(--primary, #1976d2);
    color: white;
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 1rem;
  }

  .article-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-color, black);
    margin: 0 0 1rem 0;
    line-height: 1.3;
  }

  .metadata-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .metadata-item {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted, #666);
    font-size: 0.9rem;
  }

  .metadata-item svg {
    opacity: 0.7;
  }

  .source-item {
    color: var(--primary, #1976d2);
    font-weight: 600;
  }

  .source-item svg {
    opacity: 1;
  }

  .article-id {
    font-family: 'Monaco', 'Courier New', monospace;
    font-size: 0.85rem;
  }

  .article-summary {
    background: var(--hover-bg, #f8f9fa);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border-left: 4px solid var(--primary, #1976d2);
  }

  .article-summary h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color, black);
  }

  .article-summary p {
    margin: 0;
    line-height: 1.7;
    color: var(--text-color, black);
  }

  .article-footer {
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color, #e0e0e0);
  }

  .article-body {
    margin-top: 2rem;
    line-height: 1.7;
    color: var(--text-color, black);
  }

  .article-body h3 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .article-body p + p {
    margin-top: 1rem;
  }

  .external-link {
    color: var(--primary, #1976d2);
    text-decoration: none;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: var(--hover-bg, #f8f9fa);
    border-radius: 8px;
    transition: background-color 0.2s;
  }

  .external-link:hover {
    background: var(--border-color, #e0e0e0);
  }

  .external-link svg {
    flex-shrink: 0;
  }

  :global(.dark) .article-summary {
    background: var(--card-bg, #2a2a2a);
  }

  :global(.dark) .external-link {
    background: var(--card-bg, #2a2a2a);
  }

  :global(.dark) .external-link:hover {
    background: #3a3a3a;
  }
</style>
