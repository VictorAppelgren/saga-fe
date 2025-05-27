<script lang="ts">
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	export let form;
</script>

<div class="top-left">
  <ThemeToggle />
</div>
<h1>Login</h1>
<form method="POST">
	<label>
		Username:
		<input name="username" required />
	</label>
	<label>
		Password:
		<input name="password" type="password" required />
	</label>
	<button type="submit">Log in</button>
</form>

{#if form?.error}
	<p style="color:red">{form.error}</p>
{/if}

<style>
  .top-left {
    position: absolute;
    top: 1rem;
    left: 1rem;
  }
</style>