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
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: inherit;
  }
</style>

<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
  {#if $theme === 'light'}
    🌞
  {:else}
    🌙
  {/if}
</button>