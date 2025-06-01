<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { FocusArea, Frequency } from '$lib/types/storage';
  import { onMount } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let name = '';
  let thesis = '';
  let focusArea: FocusArea = 'europe';
  let frequency: Frequency = 'daily';
  let timeOfDay = '09:00';
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const focusAreas: FocusArea[] = ['europe', 'asia', 'north america', 'south america', 'africa'];
  const frequencies: Frequency[] = ['hourly', 'daily', 'weekly', 'monthly'];
  let timezones: string[] = [];

  onMount(() => {
    // Get all IANA timezones
    timezones = Intl.supportedValuesOf('timeZone');
  });

  function handleSubmit() {
    if (!name || !thesis) return;
    
    dispatch('themeCreated', {
      name,
      thesis,
      focusArea,
      periodicity: {
        frequency,
        timeOfDay,
        timezone
      }
    });

    // Reset form
    name = '';
    thesis = '';
    focusArea = 'europe';
    frequency = 'daily';
    timeOfDay = '09:00';
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
</script>

<div class="theme-form-container">
  <form class="theme-form" on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="name">Name <span class="required">*</span></label>
      <input 
        id="name"
        bind:value={name}
        placeholder="Enter theme name"
        required
      />
    </div>

    <div class="form-group">
      <label for="thesis">Thesis <span class="required">*</span></label>
      <textarea
        id="thesis"
        bind:value={thesis}
        placeholder="Enter your thesis"
        required
      ></textarea>
    </div>

    <div class="form-group">
      <label for="focusArea">Focus Area <span class="required">*</span></label>
      <select
        id="focusArea"
        bind:value={focusArea}
        required
        class="select-input"
      >
        {#each focusAreas as area}
          <option value={area}>{area.charAt(0).toUpperCase() + area.slice(1)}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <div class="section-title">Periodicity Settings</div>
      <div class="periodicity-grid">
        <div class="periodicity-item">
          <label for="frequency">Frequency <span class="required">*</span></label>
          <select
            id="frequency"
            bind:value={frequency}
            required
            class="select-input"
          >
            {#each frequencies as freq}
              <option value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</option>
            {/each}
          </select>
        </div>

        <div class="periodicity-item">
          <label for="timeOfDay">Time of Day <span class="required">*</span></label>
          <input
            type="time"
            id="timeOfDay"
            bind:value={timeOfDay}
            required
            class="time-input"
          />
        </div>

        <div class="periodicity-item">
          <label for="timezone">Timezone <span class="required">*</span></label>
          <select
            id="timezone"
            bind:value={timezone}
            required
            class="select-input"
          >
            {#each timezones as tz}
              <option value={tz}>{tz.replace('_', ' ')}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="secondary-button" on:click={() => dispatch('cancel')}>Cancel</button>
      <button type="submit" class="submit" disabled={!name || !thesis}>Create Theme</button>
    </div>
  </form>
</div>

<style>
  .theme-form-container {
    max-width: 600px;
    margin: 0 auto;
  }

  .theme-form {
    background: var(--card-bg, #f5f5f5);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 12px;
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-group:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .required {
    color: #dc3545;
  }

  input, textarea, .select-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 6px;
    background: var(--bg-color, white);
    color: var(--text-color, black);
    font-size: 0.875rem;
  }

  .select-input {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;
    padding-right: 2.5rem;
  }

  textarea {
    min-height: 120px;
    resize: vertical;
  }

  .section-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color, black);
    margin-bottom: 0.75rem;
  }

  .periodicity-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .periodicity-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .periodicity-item label {
    margin: 0;
  }

  .time-input {
    font-family: inherit;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .secondary-button {
    background: var(--border-color, #e0e0e0);
    color: var(--text-color, black);
  }

  .secondary-button:hover {
    background: #d0d0d0;
  }

  .submit {
    background: #007AFF;
    color: white;
  }

  .submit:disabled {
    background: #cccccc;
    cursor: default;
  }

  .submit:hover:not(:disabled) {
    background: #0056b3;
  }
</style>
