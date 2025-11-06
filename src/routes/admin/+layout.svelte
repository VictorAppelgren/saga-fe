<script lang="ts">
  import AdminSidebar from '$lib/components/AdminSidebar.svelte';
</script>

<div class="admin-layout">
  <AdminSidebar />
  <main class="admin-content">
    <slot />
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background: var(--background-color, #f5f5f5);
  }
  
  .admin-content {
    flex: 1;
    overflow-y: auto;
  }
</style>
