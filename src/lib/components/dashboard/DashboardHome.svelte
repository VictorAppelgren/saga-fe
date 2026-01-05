<!-- DashboardHome.svelte - Welcome screen and recommended questions -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import GlobeAnimation from '$lib/components/GlobeAnimation.svelte';

  const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

  // Props
  export let username: string;

  interface DashboardQuestion {
    text: string;
    strategyId: string;
    strategyAsset: string;
  }

  let dashboardQuestions: DashboardQuestion[] = [];
  let loadingQuestions = true;

  const dispatch = createEventDispatcher();

  function handleQuestionClick(question: DashboardQuestion) {
    dispatch('questionClick', question);
  }

  async function loadDashboardQuestions() {
    try {
      console.log('Loading dashboard questions for user:', username);
      if (!username) {
        console.log('No username found');
        loadingQuestions = false;
        return;
      }

      const response = await fetch(`${API_BASE}/users/${username}/strategies`);
      const result = await response.json();
      const strategies = result.strategies || [];
      console.log('Found strategies:', strategies.length);

      // Extract questions from all strategies
      const questions: DashboardQuestion[] = [];
      for (const strategyItem of strategies) {
        try {
          const detailResponse = await fetch(`${API_BASE}/users/${username}/strategies/${strategyItem.id}`);
          const strategy = await detailResponse.json();
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

      console.log('Total questions found:', questions.length);
      dashboardQuestions = questions;
      loadingQuestions = false;
    } catch (error) {
      console.error('Failed to load dashboard questions:', error);
      loadingQuestions = false;
    }
  }

  onMount(() => {
    loadDashboardQuestions();
  });
</script>

<div class="top-bar">
  <h1>Dashboard</h1>
</div>

<section class="card welcome-box welcome-theme">
  <p class="welcome-label">Your Command Center</p>
  <h2 class="welcome-title">Welcome back, {username || 'there'}</h2>
  <p class="welcome-subtitle">We're here to amplify your judgment. Monitor risks, spot opportunities, and walk into every decision with certainty.</p>
  <p class="welcome-hint">Select a watchlist or topic on the left to explore insights, or use Saga's recommended questions below.</p>
</section>

{#if !loadingQuestions && dashboardQuestions.length > 0}
  <section class="card insights-box">
    <p class="insights-label">Recommended</p>
    <h3 class="insights-title">Questions Worth Exploring</h3>
    <p class="insights-description">Our AI agents identified these insights. Click any question to discuss with Saga:</p>
    <div class="questions-grid">
      {#each dashboardQuestions as question}
        <button class="question-card" on:click={() => handleQuestionClick(question)}>
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

<!-- Subtle globe decoration at bottom -->
<div class="dashboard-globe-container">
  <GlobeAnimation size={180} accentColor="#2563eb" />
</div>

<style>
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

  .welcome-label,
  .insights-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--primary);
    margin-bottom: 0.5rem;
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

  :global(.dark) .welcome-theme {
    background: linear-gradient(135deg, var(--card-bg, #1c1c1e) 0%, #252528 100%);
    border-color: var(--border-color, #38383a);
  }

  :global(.dark) .welcome-title {
    color: var(--text-color, #f5f5f7);
  }

  /* Insights box */
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

  .dashboard-globe-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 3rem auto 2rem auto;
    opacity: 0.35;
    max-width: 180px;
  }

  @media (max-width: 768px) {
    .welcome-box {
      margin: 0 0 0.5rem 0;
    }

    .welcome-title {
      font-size: 1.25rem;
    }

    .welcome-subtitle {
      font-size: 0.875rem;
    }

    .insights-box {
      margin: 0;
    }

    .questions-grid {
      grid-template-columns: 1fr;
    }

    .question-card {
      padding: 0.75rem 0.5rem;
      border-radius: 6px;
    }
  }
</style>
