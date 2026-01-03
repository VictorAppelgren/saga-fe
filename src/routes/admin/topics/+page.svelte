<script lang="ts">
  import { onMount } from 'svelte';

  let topics: any[] = $state([]);
  let loading = $state(true);
  let expandedTopic: string | null = $state(null);
  let topicDetails: any = $state(null);
  let loadingDetails = $state(false);
  let deleteConfirm: string | null = $state(null);
  let holdTimer: number | null = $state(null);
  let holdProgress: number = $state(0);

  const HOLD_DURATION = 2000; // 2 seconds to confirm delete

  onMount(async () => {
    try {
      const response = await fetch('/api/admin/topics');
      const data = await response.json();
      topics = data.topics || [];
      loading = false;
    } catch (error) {
      console.error('Failed to load topics:', error);
      loading = false;
    }
  });

  async function toggleTopic(topicId: string) {
    if (expandedTopic === topicId) {
      expandedTopic = null;
      topicDetails = null;
      return;
    }

    expandedTopic = topicId;
    loadingDetails = true;

    try {
      const response = await fetch(`/api/admin/topics/${topicId}`);
      topicDetails = await response.json();
      loadingDetails = false;
    } catch (error) {
      console.error('Failed to load topic details:', error);
      loadingDetails = false;
    }
  }

  function startDeleteClick(topicId: string) {
    if (deleteConfirm !== topicId) {
      deleteConfirm = topicId;
      // Auto-cancel after 5 seconds if not held
      setTimeout(() => {
        if (deleteConfirm === topicId && !holdTimer) {
          deleteConfirm = null;
        }
      }, 5000);
      return;
    }
  }

  function startHold(topicId: string) {
    if (deleteConfirm !== topicId) return;

    const startTime = Date.now();
    holdProgress = 0;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      holdProgress = Math.min(100, (elapsed / HOLD_DURATION) * 100);

      if (elapsed >= HOLD_DURATION) {
        clearInterval(interval);
        executeDelete(topicId);
      }
    }, 50);

    holdTimer = interval as unknown as number;
  }

  function cancelHold() {
    if (holdTimer) {
      clearInterval(holdTimer);
      holdTimer = null;
      holdProgress = 0;
    }
  }

  async function executeDelete(topicId: string) {
    holdTimer = null;
    holdProgress = 0;

    try {
      const response = await fetch(`/api/admin/topics/${topicId}`, { method: 'DELETE' });
      if (response.ok) {
        topics = topics.filter(t => t.id !== topicId);
        deleteConfirm = null;
        if (expandedTopic === topicId) {
          expandedTopic = null;
          topicDetails = null;
        }
      }
    } catch (error) {
      console.error('Failed to delete topic:', error);
    }
  }

  function cancelDelete() {
    cancelHold();
    deleteConfirm = null;
  }
</script>

<div class="topics-container">
  <div class="header">
    <h1>Topics</h1>
    <div class="topic-count">{topics.length} topics</div>
  </div>
  
  {#if loading}
    <div class="loading">Loading topics...</div>
  {:else}
    <div class="topics-list">
      {#each topics as topic}
        <div class="topic-card" class:expanded={expandedTopic === topic.id}>
          <div class="topic-header-row">
            <button
              class="topic-header"
              onclick={() => toggleTopic(topic.id)}
            >
              <div class="topic-info">
                <span class="topic-name">{topic.name}</span>
              </div>
              <div class="topic-meta">
                {#if topic.category}
                  <span class="category">{topic.category}</span>
                {/if}
              </div>
              <span class="expand-icon">{expandedTopic === topic.id ? '▼' : '▶'}</span>
            </button>
            {#if deleteConfirm === topic.id}
              <div class="delete-confirm-wrapper">
                <button
                  class="delete-btn confirm"
                  onmousedown={() => startHold(topic.id)}
                  onmouseup={cancelHold}
                  onmouseleave={cancelHold}
                >
                  Hold to delete
                  {#if holdProgress > 0}
                    <div class="hold-progress" style="width: {holdProgress}%"></div>
                  {/if}
                </button>
                <button class="cancel-btn" onclick={cancelDelete}>Cancel</button>
              </div>
            {:else}
              <button
                class="delete-btn"
                onclick={() => startDeleteClick(topic.id)}
              >
                Delete
              </button>
            {/if}
          </div>
          
          {#if expandedTopic === topic.id}
            <div class="topic-details">
              {#if loadingDetails}
                <div class="details-loading">Loading details...</div>
              {:else if topicDetails}
                <!-- Statistics Cards -->
                <div class="stats-cards">
                  <div class="stat-card">
                    <div class="stat-label">Total Articles</div>
                    <div class="stat-value">{topicDetails.article_stats?.total_articles || 0}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Fundamental</div>
                    <div class="stat-value blue">{topicDetails.article_stats?.fundamental_count || 0}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Medium</div>
                    <div class="stat-value yellow">{topicDetails.article_stats?.medium_count || 0}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Current</div>
                    <div class="stat-value red">{topicDetails.article_stats?.current_count || 0}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Influences</div>
                    <div class="stat-value">{topicDetails.relationships?.influences_count || 0}</div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-label">Correlates</div>
                    <div class="stat-value">{topicDetails.relationships?.correlates_count || 0}</div>
                  </div>
                </div>
                
                <!-- Topic Info -->
                <div class="details-section">
                  <h3>Topic Information</h3>
                  <div class="info-grid">
                    <div><strong>ID:</strong> {topicDetails.topic_id}</div>
                    <div><strong>Name:</strong> {topicDetails.topic_name}</div>
                    {#if topicDetails.topic_data?.category}
                      <div><strong>Category:</strong> {topicDetails.topic_data.category}</div>
                    {/if}
                    {#if topicDetails.topic_data?.importance}
                      <div><strong>Importance:</strong> {topicDetails.topic_data.importance}</div>
                    {/if}
                  </div>
                </div>
                
                <!-- Recent Articles -->
                {#if topicDetails.articles && topicDetails.articles.length > 0}
                  <div class="details-section">
                    <h3>Recent Articles ({topicDetails.articles.length})</h3>
                    <div class="articles-list">
                      {#each topicDetails.articles as article}
                        <div class="article-item">
                          <div class="article-header-row">
                            <div class="article-title">
                              {#if article.source}
                                <a href={article.source} target="_blank" rel="noopener">{article.title || 'Untitled'}</a>
                              {:else}
                                {article.title || 'Untitled'}
                              {/if}
                            </div>
                            <div class="article-badges">
                              {#if article.timeframe}
                                <span class="badge timeframe-{article.timeframe}">{article.timeframe}</span>
                              {/if}
                              {#if article.priority}
                                <span class="badge priority">{article.priority}</span>
                              {/if}
                            </div>
                          </div>
                          
                          {#if article.summary}
                            <div class="article-summary">{article.summary.substring(0, 200)}...</div>
                          {/if}
                          
                          <!-- Importance Scores -->
                          {#if article.importance_risk || article.importance_opportunity || article.importance_trend || article.importance_catalyst}
                            <div class="importance-scores">
                              {#if article.importance_risk}
                                <span class="score risk">Risk: {article.importance_risk}/10</span>
                              {/if}
                              {#if article.importance_opportunity}
                                <span class="score opportunity">Opp: {article.importance_opportunity}/10</span>
                              {/if}
                              {#if article.importance_trend}
                                <span class="score trend">Trend: {article.importance_trend}/10</span>
                              {/if}
                              {#if article.importance_catalyst}
                                <span class="score catalyst">Cat: {article.importance_catalyst}/10</span>
                              {/if}
                            </div>
                          {/if}
                          
                          <!-- Motivation & Implications -->
                          {#if article.motivation}
                            <div class="article-motivation">
                              <strong>Why it matters:</strong> {article.motivation}
                            </div>
                          {/if}
                          {#if article.implications}
                            <div class="article-implications">
                              <strong>Implications:</strong> {article.implications}
                            </div>
                          {/if}
                          
                          <div class="article-meta">
                            {#if article.published_at}
                              <span>Published: {new Date(article.published_at).toLocaleDateString()}</span>
                            {/if}
                            {#if article.linked_at}
                              <span>Linked: {new Date(article.linked_at).toLocaleDateString()}</span>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
                
                <!-- Analysis Reports -->
                {#if topicDetails.reports && Object.keys(topicDetails.reports).length > 0}
                  <div class="details-section">
                    <h3>Analysis Sections</h3>
                    <div class="reports-list">
                      {#each Object.entries(topicDetails.reports) as [section, content]}
                        {#if content && content.trim()}
                          <details class="report-section">
                            <summary>{section.replace('_', ' ').toUpperCase()}</summary>
                            <div class="report-content">{content}</div>
                          </details>
                        {/if}
                      {/each}
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .topics-container {
    padding: 2rem;
    max-width: 1200px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #111827;
    margin: 0;
  }
  
  .topic-count {
    font-size: 0.875rem;
    color: #6b7280;
    background: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  
  .loading {
    text-align: center;
    padding: 4rem;
    font-size: 1.25rem;
    color: #6b7280;
  }
  
  .topics-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .topic-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: all 0.2s;
  }
  
  .topic-card:hover {
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
  
  .topic-card.expanded {
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .topic-header-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .topic-header {
    flex: 1;
    padding: 1.25rem;
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    text-align: left;
  }

  .topic-header:hover {
    background: #f9fafb;
  }

  .delete-btn {
    padding: 0.5rem 0.75rem;
    margin-right: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: white;
    color: #6b7280;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .delete-btn:hover {
    border-color: #ef4444;
    color: #ef4444;
  }

  .delete-btn.confirm {
    background: #ef4444;
    border-color: #ef4444;
    color: white;
    position: relative;
    overflow: hidden;
    min-width: 100px;
  }

  .delete-confirm-wrapper {
    display: flex;
    gap: 0.5rem;
    margin-right: 0.75rem;
  }

  .cancel-btn {
    padding: 0.5rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: white;
    color: #6b7280;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .cancel-btn:hover {
    border-color: #9ca3af;
    color: #374151;
  }

  .hold-progress {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: rgba(0, 0, 0, 0.2);
    transition: width 0.05s linear;
    pointer-events: none;
  }
  
  .topic-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .topic-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }
  
  .topic-stars {
    font-size: 1rem;
  }
  
  .topic-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .category {
    background: #e0e7ff;
    color: #4338ca;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
  }
  
  .importance {
    color: #6b7280;
  }
  
  .expand-icon {
    font-size: 1.25rem;
    color: #9ca3af;
    transition: transform 0.2s;
  }
  
  .topic-details {
    padding: 0 1.25rem 1.25rem;
    border-top: 1px solid #e5e7eb;
    animation: slideDown 0.2s ease-out;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .details-loading {
    padding: 2rem;
    text-align: center;
    color: #6b7280;
  }
  
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stat-card {
    background: #f9fafb;
    padding: 1rem;
    border-radius: 6px;
    text-align: center;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }
  
  .stat-value.blue {
    color: #3b82f6;
  }
  
  .stat-value.yellow {
    color: #f59e0b;
  }
  
  .stat-value.red {
    color: #ef4444;
  }
  
  .details-section {
    margin-top: 1.5rem;
  }
  
  .details-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.75rem;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.75rem;
    font-size: 0.875rem;
    color: #4b5563;
  }
  
  .articles-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .article-item {
    padding: 1rem;
    background: #f9fafb;
    border-radius: 6px;
    border-left: 3px solid #3b82f6;
  }
  
  .article-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .article-title {
    font-weight: 600;
    color: #111827;
    font-size: 0.95rem;
    flex: 1;
  }
  
  .article-title a {
    color: #1976d2;
    text-decoration: none;
  }
  
  .article-title a:hover {
    text-decoration: underline;
  }
  
  .article-badges {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
  
  .badge {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge.timeframe-fundamental {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .badge.timeframe-medium {
    background: #fef3c7;
    color: #92400e;
  }
  
  .badge.timeframe-current {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .badge.priority {
    background: #e0e7ff;
    color: #4338ca;
  }
  
  .article-summary {
    font-size: 0.85rem;
    color: #6b7280;
    margin-bottom: 0.75rem;
    line-height: 1.5;
  }
  
  .importance-scores {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }
  
  .score {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .score.risk {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .score.opportunity {
    background: #d1fae5;
    color: #065f46;
  }
  
  .score.trend {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .score.catalyst {
    background: #fef3c7;
    color: #92400e;
  }
  
  .article-motivation,
  .article-implications {
    font-size: 0.8rem;
    color: #4b5563;
    margin-bottom: 0.5rem;
    line-height: 1.5;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
  }
  
  .article-motivation strong,
  .article-implications strong {
    color: #111827;
  }
  
  .article-meta {
    font-size: 0.75rem;
    color: #9ca3af;
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }
  
  .reports-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .report-section {
    background: #f9fafb;
    border-radius: 6px;
    padding: 0.5rem;
  }
  
  .report-section summary {
    cursor: pointer;
    font-weight: 600;
    color: #374151;
    padding: 0.5rem;
    font-size: 0.875rem;
  }
  
  .report-section summary:hover {
    color: #111827;
  }
  
  .report-content {
    padding: 1rem;
    font-size: 0.875rem;
    color: #4b5563;
    line-height: 1.6;
    white-space: pre-wrap;
    background: white;
    border-radius: 4px;
    margin-top: 0.5rem;
  }
</style>
