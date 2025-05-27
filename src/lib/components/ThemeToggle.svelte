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
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  :global(.dark) .theme-toggle .icon {
    fill: white;
  }

  .theme-toggle .icon {
    fill: black;
  }
</style>

<button class="theme-toggle" on:click={toggleTheme} aria-label="Toggle theme">
  {#if $theme === 'light'}
    <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"/>
    </svg>
  {:else}
    <svg class="icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C12 9.31371 12 12 12 18Z"/>
    </svg>
  {/if}
</button>