<script lang="ts">
  import { onMount } from 'svelte';
  
  export let articleId: string;
  export let onClose: () => void;
  
  type NormalizedArticle = {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    publisher?: string;
    publishedDate?: string;
    url?: string;
    authors?: string;
    sourceDomain?: string;
  };

  let article: NormalizedArticle | null = null;
  let loading = true;
  let error = false;
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
  
  // Extract publisher name from domain
  function getPublisher(domain?: string): string | undefined {
    if (!domain) return undefined;
    const publishers: Record<string, string> = {
      'bloomberg.com': 'Bloomberg',
      'reuters.com': 'Reuters',
      'ft.com': 'Financial Times',
      'wsj.com': 'Wall Street Journal',
      'cnbc.com': 'CNBC',
      'marketwatch.com': 'MarketWatch',
      'economist.com': 'The Economist',
      'nytimes.com': 'New York Times',
      'washingtonpost.com': 'Washington Post',
      'theguardian.com': 'The Guardian',
      'bbc.com': 'BBC',
      'cnn.com': 'CNN'
    };
    
    return publishers[domain] || domain.replace(/^www\./, '').split('.')[0].charAt(0).toUpperCase() + domain.replace(/^www\./, '').split('.')[0].slice(1);
  }

  function normalizeArticle(raw: any): NormalizedArticle {
    const base = raw?.data && typeof raw.data === 'object' ? raw.data : raw;
    const source = base?.source || raw?.source || {};
    const publisher =
      base?.publisher ||
      source?.name ||
      source?.publisher ||
      getPublisher(source?.domain || base?.domain);

    const authors =
      base?.authorsByline ||
      base?.author ||
      (Array.isArray(base?.authors) ? base.authors.join(', ') : undefined);

    const publishDate =
      base?.published_date ||
      base?.published_at ||
      base?.pubDate ||
      raw?.published_date ||
      raw?.published_at;

    return {
      id: base?.id || raw?.id || raw?.argos_id || articleId,
      title: base?.title || raw?.title || 'Untitled Article',
      summary: base?.summary || base?.description || base?.argos_summary,
      content: base?.content || base?.body || base?.enContent || base?.enContentFull,
      publisher,
      publishedDate: publishDate,
      url: base?.url || raw?.url,
      authors,
      sourceDomain: source?.domain || base?.domain
    };
  }

  function formatDate(value?: string): string | undefined {
    if (!value) return undefined;
    const timestamp = Date.parse(value);
    if (Number.isNaN(timestamp)) return undefined;
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onMount(async () => {
    try {
      const response = await fetch(`${API_BASE}/articles/${articleId}`);
      if (!response.ok) throw new Error('Failed to fetch article');
      const raw = await response.json();
      article = normalizeArticle(raw);
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
          <!-- Article ID -->
          <span class="metadata-item article-id">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            ID: {article.id}
          </span>
          
          <!-- Publisher - always show -->
          <span class="metadata-item source-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Publisher: {article.publisher || article.sourceDomain || '-'}
          </span>
          
          <!-- Published date - always show -->
          <span class="metadata-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Published: {formatDate(article.publishedDate) || '-'}
          </span>

          {#if article.authors}
            <span class="metadata-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
              </svg>
              {article.authors}
            </span>
          {/if}
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
            {#each article.content.trim().split(/\n\s*\n/) as paragraph (paragraph)}
              {#if paragraph.trim().length}
                <p>{paragraph}</p>
              {/if}
            {/each}
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
