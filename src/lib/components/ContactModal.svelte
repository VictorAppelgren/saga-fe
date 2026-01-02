<script lang="ts">
  import { X } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { api } from '$lib/api/client';

  export let open = false;

  const dispatch = createEventDispatcher();

  let name = '';
  let email = '';
  let company = '';
  let message = '';
  let submitted = false;
  let submitting = false;
  let error = '';

  function close() {
    open = false;
    dispatch('close');
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    submitting = true;
    error = '';

    try {
      await api('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, company, message })
      });
      submitted = true;
    } catch (err) {
      console.error('Contact form error:', err);
      error = 'Something went wrong. Please try again or email us directly.';
    } finally {
      submitting = false;
    }
  }

  function reset() {
    name = '';
    email = '';
    company = '';
    message = '';
    submitted = false;
    error = '';
  }

  // Reset form when modal opens
  $: if (open) reset();
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <button
      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
      on:click={close}
      aria-label="Close modal"
    ></button>

    <!-- Modal -->
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in duration-200">
      <!-- Close button -->
      <button
        class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition"
        on:click={close}
        aria-label="Close"
      >
        <X class="w-5 h-5" />
      </button>

      {#if submitted}
        <!-- Success State -->
        <div class="text-center py-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-2">Thanks for reaching out</h3>
          <p class="text-gray-600 mb-6">We've received your message and will be in touch soon.</p>
          <button
            class="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition"
            on:click={close}
          >
            Close
          </button>
        </div>
      {:else}
        <!-- Form -->
        <h2 class="text-2xl font-bold mb-2">Let's talk</h2>
        <p class="text-gray-600 mb-6">We work with a limited number of partners. Tell us about yourself.</p>

        <form on:submit={handleSubmit} class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              id="name"
              bind:value={name}
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              placeholder="Your name"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label for="company" class="block text-sm font-medium text-gray-700 mb-1">Company / Fund</label>
            <input
              type="text"
              id="company"
              bind:value={company}
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              placeholder="Your organization"
            />
          </div>

          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">What brings you here?</label>
            <textarea
              id="message"
              bind:value={message}
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
              placeholder="Tell us briefly about your interest..."
            ></textarea>
          </div>

          {#if error}
            <p class="text-red-600 text-sm">{error}</p>
          {/if}

          <button
            type="submit"
            disabled={submitting}
            class="w-full py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending...' : 'Send message'}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-4">
          Or email directly: <a href="mailto:info@saga-labs.com" class="underline">info@saga-labs.com</a>
        </p>
      {/if}
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes zoom-in {
    from { transform: scale(0.95); }
    to { transform: scale(1); }
  }

  .animate-in {
    animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
  }
</style>
