<script lang="ts">
  import { onMount } from 'svelte';

  interface Contact {
    id: string;
    name: string;
    email: string;
    company: string;
    message: string;
    submitted_at: string;
    status: string;
    updated_at?: string;
  }

  let contacts: Contact[] = $state([]);
  let total = $state(0);
  let newCount = $state(0);
  let loading = $state(true);
  let filter = $state<'all' | 'new' | 'contacted' | 'closed'>('all');

  onMount(async () => {
    await loadContacts();
  });

  async function loadContacts() {
    loading = true;
    try {
      const res = await fetch('/api/admin/contacts');
      const data = await res.json();
      contacts = data.contacts;
      total = data.total;
      newCount = data.new;
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      loading = false;
    }
  }

  async function updateStatus(contactId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/contacts/${contactId}?status=${newStatus}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        await loadContacts();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'new': return '#22c55e';
      case 'contacted': return '#3b82f6';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  }

  $effect(() => {
    // Filtered contacts based on status
  });

  const filteredContacts = $derived(
    filter === 'all' ? contacts : contacts.filter(c => c.status === filter)
  );
</script>

<div class="leads-container">
  <div class="header">
    <h1>Leads</h1>
    <div class="stats">
      <span class="stat total">{total} total</span>
      {#if newCount > 0}
        <span class="stat new">{newCount} new</span>
      {/if}
    </div>
  </div>

  <div class="filters">
    <button class:active={filter === 'all'} onclick={() => filter = 'all'}>All</button>
    <button class:active={filter === 'new'} onclick={() => filter = 'new'}>New</button>
    <button class:active={filter === 'contacted'} onclick={() => filter = 'contacted'}>Contacted</button>
    <button class:active={filter === 'closed'} onclick={() => filter = 'closed'}>Closed</button>
  </div>

  {#if loading}
    <div class="loading">Loading...</div>
  {:else if filteredContacts.length === 0}
    <div class="empty">
      {#if filter === 'all'}
        <p>No leads yet. They'll appear here when someone fills out the contact form.</p>
      {:else}
        <p>No {filter} leads.</p>
      {/if}
    </div>
  {:else}
    <div class="leads-list">
      {#each filteredContacts as contact (contact.id)}
        <div class="lead-card" class:is-new={contact.status === 'new'}>
          <div class="lead-header">
            <div class="lead-info">
              <h3>{contact.name}</h3>
              <span class="company">{contact.company}</span>
            </div>
            <span class="status-badge" style="background: {getStatusColor(contact.status)}">
              {contact.status}
            </span>
          </div>

          <div class="lead-details">
            <a href="mailto:{contact.email}" class="email">{contact.email}</a>
            <span class="date">{formatDate(contact.submitted_at)}</span>
          </div>

          {#if contact.message}
            <div class="message">
              <p>{contact.message}</p>
            </div>
          {/if}

          <div class="actions">
            {#if contact.status === 'new'}
              <button class="btn-contacted" onclick={() => updateStatus(contact.id, 'contacted')}>
                Mark Contacted
              </button>
            {/if}
            {#if contact.status === 'contacted'}
              <button class="btn-closed" onclick={() => updateStatus(contact.id, 'closed')}>
                Mark Closed
              </button>
            {/if}
            {#if contact.status === 'closed'}
              <button class="btn-reopen" onclick={() => updateStatus(contact.id, 'new')}>
                Reopen
              </button>
            {/if}
            <a href="mailto:{contact.email}?subject=Re: Saga Labs Inquiry" class="btn-email">
              Send Email
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .leads-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #111827;
    margin: 0;
  }

  .stats {
    display: flex;
    gap: 0.75rem;
  }

  .stat {
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .stat.total {
    background: #f3f4f6;
    color: #374151;
  }

  .stat.new {
    background: #dcfce7;
    color: #166534;
  }

  .filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .filters button {
    padding: 0.5rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    color: #6b7280;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filters button:hover {
    background: #f9fafb;
    color: #374151;
  }

  .filters button.active {
    background: #111827;
    color: white;
    border-color: #111827;
  }

  .loading, .empty {
    text-align: center;
    padding: 4rem 2rem;
    color: #6b7280;
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }

  .leads-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .lead-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.2s;
  }

  .lead-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .lead-card.is-new {
    border-left: 4px solid #22c55e;
  }

  .lead-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .lead-info h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .company {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
    text-transform: capitalize;
  }

  .lead-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .email {
    color: #3b82f6;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .email:hover {
    text-decoration: underline;
  }

  .date {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .message {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .message p {
    margin: 0;
    color: #374151;
    font-size: 0.9rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .actions button, .actions a {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    border: none;
    transition: all 0.2s;
  }

  .btn-contacted {
    background: #3b82f6;
    color: white;
  }

  .btn-contacted:hover {
    background: #2563eb;
  }

  .btn-closed {
    background: #6b7280;
    color: white;
  }

  .btn-closed:hover {
    background: #4b5563;
  }

  .btn-reopen {
    background: #f3f4f6;
    color: #374151;
  }

  .btn-reopen:hover {
    background: #e5e7eb;
  }

  .btn-email {
    background: white;
    color: #374151;
    border: 1px solid #e5e7eb;
  }

  .btn-email:hover {
    background: #f9fafb;
  }
</style>
