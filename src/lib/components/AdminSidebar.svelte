<script lang="ts">
  import { page } from '$app/stores';
  
  const links = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/topics', label: 'Topics', icon: '🏷️' },
    { href: '/admin/distribution', label: 'Distribution', icon: '📈' },
    { href: '/admin/workers', label: 'Workers', icon: '⚙️' }
  ];
</script>

<nav class="sidebar">
  <div class="sidebar-header">
    <h2>Admin Panel</h2>
  </div>
  
  <ul class="nav-links">
    {#each links as link}
      <li>
        <a 
          href={link.href} 
          class:active={$page.url.pathname === link.href}
        >
          <span class="icon">{link.icon}</span>
          <span class="label">{link.label}</span>
        </a>
      </li>
    {/each}
  </ul>
</nav>

<style>
  .sidebar {
    width: 200px;
    background: var(--surface-color, #ffffff);
    border-right: 1px solid var(--border-color, #e0e0e0);
    padding: 1.5rem 0;
    height: 100vh;
    position: sticky;
    top: 0;
  }
  
  .sidebar-header {
    padding: 0 1.5rem 1rem;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    margin-bottom: 1rem;
  }
  
  .sidebar-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-color, #000000);
  }
  
  .nav-links {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .nav-links li {
    margin: 0;
  }
  
  .nav-links a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    color: var(--text-secondary, #666666);
    text-decoration: none;
    transition: all 0.2s;
  }
  
  .nav-links a:hover {
    background: var(--hover-bg, #f5f5f5);
    color: var(--text-color, #000000);
  }
  
  .nav-links a.active {
    background: var(--primary-light, #e3f2fd);
    color: var(--primary-color, #1976d2);
    font-weight: 500;
    border-right: 3px solid var(--primary-color, #1976d2);
  }
  
  .icon {
    font-size: 1.25rem;
  }
  
  .label {
    font-size: 0.95rem;
  }
</style>
