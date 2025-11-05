<script lang="ts">
  let { title, value, subtitle = '' }: { title: string; value: number | undefined; subtitle?: string } = $props();
</script>

<div class="card">
  <div class="title">{title}</div>
  <div class="value">{value ?? '-'}</div>
  <div class="subtitle">{subtitle}</div>
</div>

<style>
  .card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    text-align: center;
  }
  
  .title {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 2rem;
    font-weight: bold;
    color: #111827;
  }
  
  .subtitle {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.25rem;
  }
</style>
