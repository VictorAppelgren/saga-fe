<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { get } from 'svelte/store';

  function toggleTheme() {
    const current = get(theme);
    theme.set(current === 'light' ? 'dark' : 'light');
  }
</script>

<style>
  .theme-toggle {
    background: var(--card-bg, #f5f5f5);
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: 20px;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    width: 120px;
    position: relative;
    transition: background-color 0.3s;
  }

  .toggle-slider {
    width: 50%;
    height: 26px;
    background: var(--text-color, black);
    border-radius: 16px;
    position: absolute;
    transition: transform 0.3s;
    left: 4px;
  }

  .toggle-text {
    flex: 1;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color, black);
    z-index: 1;
    transition: color 0.3s;
  }

  .active {
    color: var(--bg-color, white);
  }

  .dark .toggle-slider {
    transform: translateX(calc(100% - 8px));
  }
</style>

<button class="theme-toggle {$theme}" on:click={toggleTheme} aria-label="Toggle theme">
  <div class="toggle-slider"></div>
  <span class="toggle-text {$theme === 'light' ? 'active' : ''}">Light</span>
  <span class="toggle-text {$theme === 'dark' ? 'active' : ''}">Dark</span>
</button>