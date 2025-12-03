<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { theme } from '$lib/stores/theme';
	export let form;
</script>

<div class="bottom-left">
  <ThemeToggle />
</div>

<div class="login-container" class:dark={$theme === 'dark'}>
  <div class="login-box">
    <div class="logo">
      <img src="/saga-labs.avif" alt="Saga Intelligence Logo" />
    </div>
    <h1>Login</h1>
    <form method="POST">
      <div class="form-group">
        <label for="username">Username</label>
        <input id="username" name="username" required />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <button type="submit">Log in</button>
    </form>

    {#if form?.error}
      <p class="error">{form.error}</p>
    {/if}
  </div>
</div>

<style>
  .bottom-left {
    position: fixed;
    bottom: 1.5rem;
    left: 1.5rem;
    z-index: 10;
  }

  .login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
    background: white;
    color: black;
  }

  .login-container.dark {
    background: black;
    color: white;
  }

  .logo {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo img {
    max-width: 225px;
    height: auto;
    filter: var(--logo-filter, none);
  }

  .dark .logo img {
    --logo-filter: invert(1);
  }

  .login-box {
    background: white;
    padding: 2rem;
    border: 2px solid black;
    border-radius: 8px;
    width: 100%;
    max-width: 400px;
  }

  .dark .login-box {
    background: black;
    border-color: white;
  }

  h1 {
    margin: 0 0 1.5rem 0;
    text-align: center;
    font-size: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid black;
    border-radius: 4px;
    font-size: 1rem;
    background: white;
    color: black;
  }

  .dark input {
    border-color: white;
    background: black;
    color: white;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background: black;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
  }

  .dark button {
    background: white;
    color: black;
  }

  button:hover {
    background: #333;
  }

  .dark button:hover {
    background: #ccc;
  }

  .error {
    color: red;
    margin-top: 1rem;
    text-align: center;
  }

  .dark .error {
    color: #ff6b6b;
  }
</style>