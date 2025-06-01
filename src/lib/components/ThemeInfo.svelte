<script lang="ts">
  import type { Theme } from '$lib/types/storage';
  export let theme: Theme;
</script>

<div class="theme-info">
  <h2>{theme.name}</h2>
  
  <div class="info-section">
    <h3>Thesis</h3>
    <p>{theme.thesis}</p>
  </div>

  <div class="info-section">
    <h3>Focus Area</h3>
    <p class="focus-area">{theme.focusArea.charAt(0).toUpperCase() + theme.focusArea.slice(1)}</p>
  </div>

  <div class="info-section">
    <h3>Rewrite Schedule</h3>
    <div class="periodicity-info">
      <div class="schedule-item">
        <span class="label">Frequency:</span>
        <span class="value">{theme.periodicity.frequency.charAt(0).toUpperCase() + theme.periodicity.frequency.slice(1)}</span>
      </div>
      <div class="schedule-item">
        <span class="label">Time:</span>
        <span class="value">{theme.periodicity.timeOfDay}</span>
      </div>
      <div class="schedule-item">
        <span class="label">Timezone:</span>
        <span class="value">{theme.periodicity.timezone.replace('_', ' ')}</span>
      </div>
    </div>
  </div>
</div>

<style>
  .theme-info {
    padding: 2rem;
    background: var(--card-bg, #f5f5f5);
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .info-section {
    margin-bottom: 1.5rem;
  }

  .info-section:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #666;
  }

  :global(.dark) h3 {
    color: #999;
  }

  p {
    margin: 0;
    line-height: 1.5;
  }

  .focus-area {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: var(--hover-bg, #eeeeee);
    border-radius: 1rem;
    font-size: 0.875rem;
  }

  .periodicity-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 0.5rem;
  }

  .schedule-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .label {
    font-size: 0.75rem;
    color: #666;
  }

  :global(.dark) .label {
    color: #999;
  }

  .value {
    font-weight: 500;
  }
</style>
