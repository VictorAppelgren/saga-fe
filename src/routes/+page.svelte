<script lang="ts">
	import { Network, Brain, TrendingUp, Shield, Globe, Zap, Target, Eye, Menu, X, ChevronRight } from 'lucide-svelte';
	import ContactModal from '$lib/components/ContactModal.svelte';
	import NetworkAnimation from '$lib/components/NetworkAnimation.svelte';
	import NetworkBackground from '$lib/components/NetworkBackground.svelte';
	import GlobeAnimation from '$lib/components/GlobeAnimation.svelte';
	import DataFlowAnimation from '$lib/components/DataFlowAnimation.svelte';
	import RadarScanAnimation from '$lib/components/RadarScanAnimation.svelte';
	import TimelineGraphAnimation from '$lib/components/TimelineGraphAnimation.svelte';
	import AlertPulseAnimation from '$lib/components/AlertPulseAnimation.svelte';
	import EntityClusterAnimation from '$lib/components/EntityClusterAnimation.svelte';
	import SignalStrengthAnimation from '$lib/components/SignalStrengthAnimation.svelte';
	import CascadeStoryAnimation from '$lib/components/CascadeStoryAnimation.svelte';
	import WatchfulNetworkAnimation from '$lib/components/WatchfulNetworkAnimation.svelte';

	let mobileMenuOpen = $state(false);
	let activeTab = $state<'home' | 'technology' | 'investors' | 'examples'>('home');
	let showContactModal = $state(false);

	// Accent color - elegant deep blue
	const accentColor = '#2563eb';

	function setTab(tab: 'home' | 'technology' | 'investors' | 'examples') {
		activeTab = tab;
		mobileMenuOpen = false;
		console.log('Tab changed to:', tab);

		// Scroll to top for home
		if (tab === 'home') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
		// Scroll to the content section for tech/investors/examples
		else if (tab === 'technology' || tab === 'investors' || tab === 'examples') {
			setTimeout(() => {
				const section = document.querySelector(`[data-tab="${tab}"]`);
				if (section) {
					section.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 50);
		}
	}

</script>

<div class="bg-white text-gray-900">
	<!-- Navigation Bar - Clean & Minimal -->
	<nav class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50">
		<div class="max-w-6xl mx-auto px-6 py-5">
			<div class="flex items-center justify-between">
				<!-- Logo -->
				<button onclick={() => setTab('home')} class="flex items-center gap-3 hover:opacity-70 transition-opacity">
					<img src="/saga-labs.avif" alt="Saga Labs" class="h-8" />
				</button>

				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center gap-10">
					<button
						onclick={() => setTab('home')}
						class="group relative text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium {activeTab === 'home' ? 'text-gray-900' : ''}"
					>
						Home
						<span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full {activeTab === 'home' ? 'w-full' : ''}"></span>
					</button>
					<button
						onclick={() => setTab('technology')}
						class="group relative text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium {activeTab === 'technology' ? 'text-gray-900' : ''}"
					>
						Technology
						<span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full {activeTab === 'technology' ? 'w-full' : ''}"></span>
					</button>
					<button
						onclick={() => setTab('investors')}
						class="group relative text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium {activeTab === 'investors' ? 'text-gray-900' : ''}"
					>
						For Investors
						<span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full {activeTab === 'investors' ? 'w-full' : ''}"></span>
					</button>
					<button
						onclick={() => setTab('examples')}
						class="group relative text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium {activeTab === 'examples' ? 'text-gray-900' : ''}"
					>
						Examples
						<span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full {activeTab === 'examples' ? 'w-full' : ''}"></span>
					</button>
					<a href="/login" class="group relative text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
						Login
						<span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
					</a>
				</div>

				<!-- Mobile Menu Button -->
				<button class="md:hidden p-2" onclick={() => mobileMenuOpen = !mobileMenuOpen}>
					{#if mobileMenuOpen}
						<X class="w-5 h-5" />
					{:else}
						<Menu class="w-5 h-5" />
					{/if}
				</button>
			</div>

			<!-- Mobile Menu -->
			{#if mobileMenuOpen}
				<div class="md:hidden mt-6 pb-6 space-y-1 border-t border-gray-100 pt-6">
					<button onclick={() => setTab('home')} class="block w-full text-left py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm">Home</button>
					<button onclick={() => setTab('technology')} class="block w-full text-left py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm">Technology</button>
					<button onclick={() => setTab('investors')} class="block w-full text-left py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm">For Investors</button>
					<button onclick={() => setTab('examples')} class="block w-full text-left py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm">Examples</button>
					<a href="/login" class="block py-3 text-gray-600 hover:text-gray-900 transition-colors text-sm">Login</a>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Hero Section - Clean & Impactful -->
	<section class="relative min-h-[90vh] flex items-center pt-16 sm:pt-20 overflow-hidden">
		<!-- Subtle gradient background -->
		<div class="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-white pointer-events-none"></div>

		<div class="relative max-w-7xl mx-auto px-5 sm:px-8 md:px-12 lg:pl-24 lg:pr-8 py-12 sm:py-16 flex flex-col lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-8 items-center">
			<!-- Text Content - FIRST on mobile -->
			<div class="text-center lg:text-left">
				<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-5 leading-[1.15] tracking-tight text-gray-900">
					Your Judgment. Amplified Beyond Human Scale.
				</h1>

				<p class="text-base sm:text-lg mb-3 text-gray-900 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
					Every angle checked. Every risk exposed. Nothing missed.
				</p>

				<p class="text-sm sm:text-base text-gray-500 max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-7">
					From confidence to conviction — know you've checked what others haven't.
				</p>

				<button
					onclick={() => showContactModal = true}
					class="group relative px-7 py-3.5 bg-blue-600 text-white text-sm font-medium rounded-xl cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5"
				>
					<span class="relative z-10">Get in touch</span>
					<div class="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
				</button>
			</div>

			<!-- Globe - SECOND on mobile, centered -->
			<div class="flex justify-center w-full lg:justify-end">
				<div class="relative w-[260px] sm:w-[300px] md:w-[340px] lg:w-[380px] aspect-square">
					<!-- Globe SVG - responsive sizing with aspect-square to prevent overflow -->
					<GlobeAnimation size={380} accentColor={accentColor} />
					<!-- Glow effect behind globe -->
					<div class="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -z-10"></div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- The Core Problem - Light Intro -->
	<section class="relative max-w-4xl mx-auto px-6 py-16 sm:py-20 overflow-hidden">
		<div class="text-center">
			<h2 class="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 leading-tight text-gray-900">
				The Risks You Don't Know You're Taking
			</h2>

			<p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 leading-relaxed">
				The risks that hurt you aren't the ones you're watching. They're the ones you didn't know existed.
			</p>

			<p class="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
				Your mental model is powerful — but it only includes what you've thought to include. Chain reactions are building right now, toward your portfolio, that you haven't mapped yet.
			</p>

			<p class="text-xl sm:text-2xl font-medium text-gray-900">
				Saga shows you the whole picture — including the parts you didn't know to look for.
			</p>
		</div>
	</section>

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- SHOWCASE: GOD-TIER ANIMATIONS -->
	<section class="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
		<div class="text-center mb-12 sm:mb-16">
			<p class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">The Living Map</p>
			<h2 class="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 text-gray-900">
				Chain Reactions Made Visible
			</h2>
			<p class="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
				Millions of entities mapped. Every connection traced. See where risk is building before it hits your portfolio.
			</p>
		</div>

		<!-- Animation 1: The Living Map -->
		<div class="mb-16 sm:mb-20">
			<div class="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
				<div class="lg:w-2/5 text-left px-2">
					<p class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">The Living Map</p>
					<h3 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">
						Millions of Entities. Every Connection Mapped.
					</h3>
					<p class="text-gray-600 mb-4">
						Events don't happen in isolation. A policy shift cascades through supply chains, sectors, and markets. Saga maps every path — so you see where risk is building before it hits your portfolio.
					</p>
					<p class="text-gray-900 font-medium">
						Chain reactions made visible. Nothing missed.
					</p>
				</div>
				<div class="lg:w-3/5 w-full">
					<div class="rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 aspect-[4/3] bg-[#0a0a0f]">
						<CascadeStoryAnimation width={700} height={525} accentColor={accentColor} />
					</div>
				</div>
			</div>
		</div>

		<!-- HIDDEN: Animation 2: Your Research Team (code preserved)
		<div>
			<div class="flex flex-col lg:flex-row-reverse items-center gap-6 lg:gap-10">
				<div class="lg:w-2/5 text-left px-2">
					<p class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">Your AI Research Team</p>
					<h3 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-900">
						Thousands of Agents. Working for You.
					</h3>
					<p class="text-gray-600 mb-4">
						Your judgment is irreplaceable. But your reach had limits — until now. Saga's agents scan every sector continuously, confirming your thesis or surfacing risks you'd never find alone.
					</p>
					<p class="text-gray-900 font-medium">
						Same judgment. Complete conviction.
					</p>
				</div>
				<div class="lg:w-3/5 w-full">
					<div class="rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 aspect-[16/10] bg-[#0a0a0f]">
						<WatchfulNetworkAnimation width={700} height={438} accentColor={accentColor} />
					</div>
				</div>
			</div>
		</div>
		END HIDDEN Animation 2 -->
	</section>

	<!-- HOME TAB CONTENT -->
	{#if activeTab === 'home'}

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- The Problem We Solve - Clean & Direct -->
	<section class="relative max-w-4xl mx-auto px-6 py-16 sm:py-24 overflow-hidden">
		<!-- Subtle network background -->
		<div class="absolute inset-0 opacity-20">
			<NetworkBackground opacity={0.08} color={accentColor} />
		</div>
		<div class="relative">
		<h2 class="text-4xl md:text-5xl font-semibold mb-12 text-center leading-tight">
			The Blind Spots That Cost You
		</h2>

		<div class="space-y-8 text-lg leading-relaxed text-gray-600">
			<p>
				The best investment professionals spend decades building mental models of how the world connects. That's their edge — pattern recognition, intuition built from experience, knowing what matters.
			</p>

			<p class="text-2xl font-medium text-gray-900">
				But even the best mental model has limits.
			</p>

			<p>
				Too many sources to read. Too many entities to track. Too many chains of events cascading simultaneously.
			</p>

			<p class="text-2xl font-medium text-gray-900">
				You're not failing because you're not smart enough. You're failing because no human can watch everything.
			</p>
		</div>

		<div class="mt-20 pt-20 border-t border-gray-100">
			<h3 class="text-2xl font-semibold mb-8 text-center">
				Hidden Risks. Exposed Before They Hit.
			</h3>

			<p class="text-lg text-gray-600 leading-relaxed mb-8">
				A policy shift in Chile quietly threatens your lithium exposure. A labor dispute in Finland cascades into your European paper positions. A drought in Taiwan is building toward a semiconductor shock that will hit your holdings in six weeks.
			</p>

			<p class="text-lg font-medium text-gray-900">
				These aren't random surprises. They're chain reactions — and Saga exposes them before they hit.
			</p>
		</div>

		<div class="mt-20 bg-gray-900 text-white rounded-2xl p-10">
			<h3 class="text-2xl font-semibold mb-6">Saga checks every angle. Exposes every risk.</h3>
			<p class="text-lg text-gray-300 mb-6">
				Thousands of AI agents doing what one expert does — but across the entire world, continuously.
			</p>
			<div class="space-y-2 text-gray-300">
				<p>Every source monitored. Every entity mapped. Every chain reaction traced.</p>
				<p>Nothing missed. Complete certainty.</p>
			</div>
		</div>

		<p class="text-2xl font-medium text-center mt-16 text-gray-900">
			Walk into every decision knowing what others will discover too late.
		</p>
		</div>
	</section>

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- Two Ways We Strengthen You - Minimal Cards -->
	<section id="platform" class="relative max-w-5xl mx-auto px-6 py-16 sm:py-24 overflow-hidden">
		<div class="relative">
		<h2 class="text-4xl md:text-5xl font-semibold mb-6 text-center">
			Two Ways We Strengthen You
		</h2>
		<p class="text-lg text-center mb-20 text-gray-500">
			Every angle mapped before you commit. Nothing building undetected while you hold.
		</p>

		<div class="grid md:grid-cols-2 gap-12">
			<!-- Deep Strategic Due Diligence -->
			<div class="group space-y-6 p-8 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
				<p class="text-sm font-medium text-blue-600 uppercase tracking-wide">Before you commit</p>
				<h3 class="text-2xl font-semibold group-hover:text-blue-900 transition-colors">Deep Strategic Due Diligence</h3>
				<p class="text-gray-600 leading-relaxed">
					Every angle mapped. Every chain reaction traced. Every risk surfaced — before you make the decision. Complete information, complete conviction.
				</p>
				<p class="font-medium text-gray-900">
					Walk in knowing what others will discover too late.
				</p>
			</div>

			<!-- Continuous Portfolio & Risk Monitoring -->
			<div class="group space-y-6 p-8 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
				<p class="text-sm font-medium text-blue-600 uppercase tracking-wide">While you hold</p>
				<h3 class="text-2xl font-semibold group-hover:text-blue-900 transition-colors">Continuous Portfolio Monitoring</h3>
				<p class="text-gray-600 leading-relaxed">
					Your portfolio watched against a living map of global events. 24/7 vigilance. Chain reactions detected while they're still forming — not after they've hit.
				</p>
				<p class="font-medium text-gray-900">
					Nothing building undetected. Ever.
				</p>
			</div>
		</div>
		</div>
	</section>

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- From Confidence to Conviction Section -->
	<section class="relative max-w-5xl mx-auto px-6 py-16 sm:py-24 overflow-hidden">
		<div class="relative grid lg:grid-cols-[1fr_auto] gap-12 items-center">
			<!-- Left: Content -->
			<div>
				<h2 class="text-4xl md:text-5xl font-semibold mb-8 leading-tight">
					From Confidence to Conviction
				</h2>

				<div class="space-y-6 text-lg text-gray-600 leading-relaxed">
					<p class="text-xl font-medium text-gray-900">
						Confidence is "I think I'm right."<br/>
						Conviction is "I know I've checked."
					</p>

					<p>
						There's a gap between good judgment and total certainty. It's filled with doubt. Second-guessing. The nagging question: <em>What am I missing?</em>
					</p>

					<p>
						Saga closes that gap. Thousands of AI agents checking every angle — confirming your thesis or exposing the risks you'd never have found alone.
					</p>
				</div>

				<div class="mt-12 grid grid-cols-3 gap-6">
					<div class="group">
						<p class="text-2xl md:text-3xl font-semibold text-blue-600 mb-1 transition-transform group-hover:scale-105">1,000+</p>
						<p class="text-xs md:text-sm text-gray-500">sources monitored</p>
					</div>
					<div class="group">
						<p class="text-2xl md:text-3xl font-semibold text-blue-600 mb-1 transition-transform group-hover:scale-105">Millions</p>
						<p class="text-xs md:text-sm text-gray-500">of connections mapped</p>
					</div>
					<div class="group">
						<p class="text-2xl md:text-3xl font-semibold text-blue-600 mb-1 transition-transform group-hover:scale-105">24/7</p>
						<p class="text-xs md:text-sm text-gray-500">continuous monitoring</p>
					</div>
				</div>

				<p class="text-xl font-medium mt-10 text-gray-900">
					Same judgment. Complete conviction.
				</p>
			</div>

			<!-- Right: Small Globe -->
			<div class="hidden lg:block">
				<div class="relative">
					<GlobeAnimation size={280} accentColor={accentColor} />
					<div class="absolute inset-0 bg-blue-500/8 blur-2xl rounded-full -z-10"></div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- Analysis That Doesn't Expire - NEW Living Analysis Section -->
	<section class="relative max-w-4xl mx-auto px-6 py-16 sm:py-24 overflow-hidden">
		<div class="relative">
			<h2 class="text-4xl md:text-5xl font-semibold mb-8 text-center leading-tight">
				Analysis That Doesn't Expire
			</h2>

			<div class="space-y-6 text-lg text-gray-600 leading-relaxed text-center max-w-3xl mx-auto">
				<p class="text-xl font-medium text-gray-900">
					A great analysis isn't a document. It's a conversation that never stops.
				</p>

				<p>
					Static reports are dead the moment they're written. Markets move. Events cascade. Yesterday's thesis needs today's validation.
				</p>

				<p>
					Saga keeps analyzing. Your thesis is tested against every new piece of information, every day. Conclusions that adapt. Intelligence that evolves.
				</p>
			</div>

			<div class="mt-12 bg-gray-900 text-white rounded-2xl p-10 text-center">
				<p class="text-xl font-medium mb-4">
					Not a snapshot. A living system.
				</p>
				<p class="text-gray-400">
					Your analysis stays alive — updating, adapting, challenging itself with every new development.
				</p>
			</div>
		</div>
	</section>

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- Who This Is For -->
	<section class="relative max-w-4xl mx-auto px-6 py-16 sm:py-24 overflow-hidden">
		<div class="relative">
		<h2 class="text-4xl md:text-5xl font-semibold mb-6 text-center">Who This Is For</h2>
		<p class="text-lg text-center mb-20 text-gray-500">
			For funds, institutions, and strategic teams making decisions that matter.
		</p>

		<div class="grid md:grid-cols-2 gap-x-16 gap-y-12">
			<div class="group p-6 -m-6 rounded-xl hover:bg-gray-50 transition-all duration-300">
				<h3 class="text-xl font-semibold mb-3 flex items-center gap-3">
					<span class="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-150 transition-transform duration-300"></span>
					Investors & Portfolio Managers
				</h3>
				<p class="text-gray-600 leading-relaxed pl-5">
					See the chain reactions forming across your positions before they hit prices.
				</p>
			</div>

			<div class="group p-6 -m-6 rounded-xl hover:bg-gray-50 transition-all duration-300">
				<h3 class="text-xl font-semibold mb-3 flex items-center gap-3">
					<span class="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-150 transition-transform duration-300"></span>
					PE / VC / M&A Teams
				</h3>
				<p class="text-gray-600 leading-relaxed pl-5">
					Deep strategic due diligence that maps every angle before you commit capital.
				</p>
			</div>

			<div class="group p-6 -m-6 rounded-xl hover:bg-gray-50 transition-all duration-300">
				<h3 class="text-xl font-semibold mb-3 flex items-center gap-3">
					<span class="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-150 transition-transform duration-300"></span>
					Corporate Strategy & Risk
				</h3>
				<p class="text-gray-600 leading-relaxed pl-5">
					Monitor your supply chain against a living map of global events. 24/7 intelligence.
				</p>
			</div>

			<div class="group p-6 -m-6 rounded-xl hover:bg-gray-50 transition-all duration-300">
				<h3 class="text-xl font-semibold mb-3 flex items-center gap-3">
					<span class="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-150 transition-transform duration-300"></span>
					CIOs and Allocators
				</h3>
				<p class="text-gray-600 leading-relaxed pl-5">
					Understand how decisions cascade through interconnected systems before you commit.
				</p>
			</div>
		</div>
		</div>
	</section>

	<!-- Section Divider -->
	<div class="max-w-xs mx-auto flex items-center gap-4 py-4">
		<div class="flex-1 h-px bg-gradient-to-r from-transparent to-gray-200"></div>
		<div class="w-1.5 h-1.5 rounded-full bg-blue-600/40"></div>
		<div class="flex-1 h-px bg-gradient-to-l from-transparent to-gray-200"></div>
	</div>

	<!-- Your AI Research Team -->
	<section class="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 overflow-hidden">
		<div class="grid lg:grid-cols-2 gap-16 items-center">
			<!-- Left: Globe Animation -->
			<div class="hidden lg:flex justify-center order-2 lg:order-1">
				<div class="relative">
					<GlobeAnimation size={380} accentColor={accentColor} />
					<div class="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -z-10"></div>
				</div>
			</div>

			<!-- Right: Content -->
			<div class="order-1 lg:order-2">
				<h2 class="text-4xl md:text-5xl font-semibold mb-6">
					Thousands of Experts. Working Only for You.
				</h2>
				<p class="text-lg mb-6 text-gray-500">
					Your AI research team — specialized agents extending your reach across the entire world
				</p>

				<p class="text-gray-600 mb-12 max-w-xl">
					Not one model trying to do everything — a coordinated team of specialized agents, each doing what it does best. All working for you.
				</p>

				<div class="space-y-8">
					<div class="group flex gap-4">
						<span class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">R</span>
						<div>
							<h3 class="text-lg font-semibold mb-1">Reading Agents</h3>
							<p class="text-gray-600 text-sm">Processing thousands of sources in real-time. <span class="text-blue-600">The width of understanding.</span></p>
						</div>
					</div>

					<div class="group flex gap-4">
						<span class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">M</span>
						<div>
							<h3 class="text-lg font-semibold mb-1">Mapping Agents</h3>
							<p class="text-gray-600 text-sm">Connecting millions of entities into a living map. <span class="text-blue-600">Chain reactions become visible.</span></p>
						</div>
					</div>

					<div class="group flex gap-4">
						<span class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">A</span>
						<div>
							<h3 class="text-lg font-semibold mb-1">Analysis Agents</h3>
							<p class="text-gray-600 text-sm">Causal inference. Pattern recognition. Anomaly detection. <span class="text-blue-600">The depth of understanding.</span></p>
						</div>
					</div>

					<div class="group flex gap-4">
						<span class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0">S</span>
						<div>
							<h3 class="text-lg font-semibold mb-1">Simulation Agents</h3>
							<p class="text-gray-600 text-sm">Projecting how events cascade forward. <span class="text-blue-600">The forward-looking edge.</span></p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Mobile Globe (shows on smaller screens) -->
		<div class="lg:hidden flex justify-center mt-16">
			<GlobeAnimation size={300} accentColor={accentColor} />
		</div>

		<div class="mt-16 bg-gray-900 text-white rounded-2xl p-10 text-center">
			<p class="text-lg text-gray-300">
				All agents coordinated into coherent intelligence. Working for you, 24/7, across the entire world.
			</p>
		</div>
	</section>

	<!-- Simple CTA Section -->
	<section class="relative max-w-3xl mx-auto px-6 py-32 text-center overflow-hidden">
		<!-- Animated network clusters -->
		<div class="absolute inset-0 opacity-60">
			<NetworkAnimation nodeCount={20} accentColor={accentColor} />
		</div>
		<div class="absolute inset-0 bg-gradient-to-b from-white/55 via-white/35 to-white/55 pointer-events-none"></div>
		<div class="relative">
			<h2 class="text-3xl md:text-4xl font-semibold mb-6 leading-tight">
				Every angle checked. Every risk exposed. Nothing missed.
			</h2>
			<p class="text-lg text-gray-500 mb-10">
				See what others miss. Act before they can.
			</p>
			<button
				onclick={() => showContactModal = true}
				class="group relative px-8 py-4 bg-blue-600 text-white text-base font-medium rounded-xl cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5"
			>
				<span class="relative z-10">Get in touch</span>
				<div class="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
			</button>
			<p class="text-sm text-gray-400 mt-6">
				We work with a limited number of partners. If this resonates, let's talk.
			</p>
		</div>
	</section>

	{/if}

	<!-- TECHNOLOGY TAB CONTENT -->
	{#if activeTab === 'technology'}
	<section data-tab="technology" class="relative max-w-4xl mx-auto px-6 py-32 overflow-hidden">
		<!-- Animated network background for tech section -->
		<div class="absolute inset-0 opacity-70">
			<NetworkAnimation nodeCount={30} accentColor={accentColor} />
		</div>
		<div class="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/60 pointer-events-none"></div>

		<div class="relative">
			<h2 class="text-4xl md:text-5xl font-semibold mb-8 text-center leading-tight">
				Infrastructure That Scales Human Understanding to Total Conviction
			</h2>

			<p class="text-lg text-gray-600 text-center mb-6 max-w-3xl mx-auto">
				Your judgment is sharp. But can you check every angle? Every source? Every chain reaction forming right now?
			</p>

			<p class="text-xl font-medium text-center mb-20">
				We built infrastructure that can. So you can be certain, not just confident.
			</p>
		</div>

		<!-- The Gap Between Confidence and Conviction -->
		<div class="relative mb-32">
			<h3 class="text-2xl font-semibold mb-6 text-center">The Gap Between Confidence and Conviction</h3>
			<p class="text-lg text-gray-500 text-center mb-12 max-w-2xl mx-auto">
				Great tools exist. But each solves part of the puzzle. None gives you the complete picture.
			</p>

			<div class="space-y-6 max-w-3xl mx-auto">
				<div class="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300">
					<h4 class="font-semibold mb-2 flex items-center gap-3">
						<span class="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></span>
						Data Terminals
					</h4>
					<p class="text-gray-600 pl-5">Excellent for numbers, performance, and market data. But events arrive in silos — the chain reactions that matter are the connections between them.</p>
					<p class="text-sm text-blue-600 pl-5 mt-2">Saga adds: The connective tissue between events and your portfolio.</p>
				</div>

				<div class="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300">
					<h4 class="font-semibold mb-2 flex items-center gap-3">
						<span class="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></span>
						Traditional Risk Systems
					</h4>
					<p class="text-gray-600 pl-5">Built on historical correlations and market-wide expectations. They measure what already happened — and assume the future rhymes with the past.</p>
					<p class="text-sm text-blue-600 pl-5 mt-2">Saga adds: Forward simulation. Not just robust — the most robust player in your field.</p>
				</div>

				<div class="group p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300">
					<h4 class="font-semibold mb-2 flex items-center gap-3">
						<span class="w-2 h-2 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></span>
						Frontier AI Models
					</h4>
					<p class="text-gray-600 pl-5">Incredibly powerful — but they need the right infrastructure to shine. Raw LLMs answer questions. They can't tell you which questions to ask about your specific exposures.</p>
					<p class="text-sm text-blue-600 pl-5 mt-2">Saga adds: The structured context, domain expertise, and iterative depth that lets frontier AI do profound work.</p>
				</div>
			</div>

			<p class="text-center text-lg font-medium text-gray-900 mt-12">
				Saga isn't a replacement. It's the layer that makes everything else work together.
			</p>
		</div>

		<!-- The Four Pillars -->
		<div class="relative">
			<h3 class="text-2xl font-semibold mb-6 text-center">The Four Pillars of Scaled Intelligence</h3>
			<p class="text-lg text-gray-500 text-center mb-16 max-w-2xl mx-auto">
				Every pillar serves one purpose: giving you the complete picture so you can act with complete conviction.
			</p>

			<div class="grid md:grid-cols-2 gap-8 mb-32">
				<div class="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm">
					<p class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">Width</p>
					<h4 class="text-xl font-semibold mb-3 group-hover:text-blue-900 transition-colors">Collect</h4>
					<p class="text-gray-600 leading-relaxed mb-2">
						Thousands of sources processed in real-time. News, filings, trade data, policy announcements, earnings calls.
					</p>
					<p class="text-sm text-blue-600 mb-3">One expert reads 50 sources/day. We read thousands.</p>
					<p class="text-sm font-medium text-gray-900">→ Never miss what matters</p>
				</div>

				<div class="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm">
					<p class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">Depth</p>
					<h4 class="text-xl font-semibold mb-3 group-hover:text-blue-900 transition-colors">Analyze</h4>
					<p class="text-gray-600 leading-relaxed mb-2">
						Thousands of specialized agents. Causal inference. Pattern recognition. Anomaly detection.
					</p>
					<p class="text-sm text-blue-600 mb-3">Risk intelligence shaped to your exposures.</p>
					<p class="text-sm font-medium text-gray-900">→ Understand what it means for you</p>
				</div>

				<div class="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm">
					<p class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">Connection</p>
					<h4 class="text-xl font-semibold mb-3 group-hover:text-blue-900 transition-colors">Map</h4>
					<p class="text-gray-600 leading-relaxed mb-2">
						Millions of entities in a living map. Companies, suppliers, geographies, policies — all linked.
					</p>
					<p class="text-sm text-blue-600 mb-3">Chain reactions become visible.</p>
					<p class="text-sm font-medium text-gray-900">→ See how everything connects</p>
				</div>

				<div class="group p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm">
					<p class="text-sm font-medium text-blue-600 uppercase tracking-wide mb-3">Foresight</p>
					<h4 class="text-xl font-semibold mb-3 group-hover:text-blue-900 transition-colors">Simulate</h4>
					<p class="text-gray-600 leading-relaxed mb-2">
						Projecting how events cascade forward. Stress-testing scenarios before they happen.
					</p>
					<p class="text-sm text-blue-600 mb-3">Not just robust — the most robust player in your field.</p>
					<p class="text-sm font-medium text-gray-900">→ Know what happens next</p>
				</div>
			</div>
		</div>

		<!-- Built Over Years. Not Months. -->
		<div class="mb-20 bg-gray-900 text-white rounded-2xl p-10">
			<h3 class="text-2xl font-semibold mb-8 text-center">Built Over Years. Not Months.</h3>

			<p class="text-lg text-gray-300 text-center max-w-3xl mx-auto mb-8">
				Graph architecture. Multi-agent systems. Financial domain expertise. Simulation engines that understand how markets actually move.
			</p>

			<p class="text-xl text-center font-medium">
				This is infrastructure-level IP — the kind that takes years to build and can't be replicated by throwing money at the problem.
			</p>
		</div>

		<!-- CTA -->
		<div class="relative mt-20 text-center">
			<h3 class="text-2xl font-semibold mb-4">See What Certainty Looks Like</h3>
			<p class="text-lg text-gray-500 mb-8">
				Walk through a scenario relevant to your portfolio. See the chain reactions you're not seeing today.
			</p>
			<button
				onclick={() => showContactModal = true}
				class="group relative px-8 py-4 bg-blue-600 text-white text-base font-medium rounded-xl cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5"
			>
				<span class="relative z-10">Get in touch</span>
				<div class="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
			</button>
			<p class="text-sm text-gray-400 mt-6">info@saga-labs.com</p>
		</div>
	</section>
	{/if}

	<!-- INVESTORS TAB CONTENT -->
	{#if activeTab === 'investors'}
	<section data-tab="investors" class="relative max-w-4xl mx-auto px-6 py-32 overflow-hidden">
		<!-- Subtle network background -->
		<div class="absolute inset-0 opacity-15">
			<NetworkBackground opacity={0.1} color={accentColor} />
		</div>
		<div class="relative">
		<!-- Hero -->
		<h2 class="text-4xl md:text-5xl font-semibold mb-8 text-center leading-tight">
			The Intelligence Layer No One Has Built
		</h2>
		<p class="text-lg text-gray-500 text-center mb-16 max-w-3xl mx-auto">
			Trillions in institutional capital make decisions every day. They have data terminals. They have analytics. They have brilliant teams. What they don't have is the infrastructure to put frontier AI to work on their most complex problems.
		</p>

		<div class="space-y-6 text-lg text-gray-600 leading-relaxed mb-20">
			<p class="text-center">
				Palantir built intelligence infrastructure for defense — now worth $400B+.<br/>
				Recorded Future built it for cyber — $2.7B exit.
			</p>
			<p class="text-xl font-medium text-gray-900 text-center">
				No one has built it for capital allocation — where human judgment still matters most.
			</p>
			<p class="text-2xl font-semibold text-gray-900 text-center">
				That's the category we're defining. We're building it.
			</p>
		</div>

		<!-- The IP -->
		<div class="mb-32 border-t border-gray-100 pt-20">
			<h3 class="text-2xl font-semibold mb-12 text-center">The Unfair Advantage</h3>

			<div class="space-y-6 text-lg text-gray-600 leading-relaxed mb-16 text-center">
				<p class="text-xl font-medium text-gray-900">The Core Insight:</p>
				<p>
					Investment professionals have powerful mental models — but those models can't scale beyond human limits.
				</p>
				<p class="text-xl font-medium text-gray-900">
					Saga is infrastructure that scales human understanding.
				</p>
			</div>

			<p class="text-lg text-gray-500 text-center mb-12">
				Three layers of proprietary IP make this possible:
			</p>

			<div class="grid md:grid-cols-3 gap-8">
				<div>
					<h4 class="text-lg font-semibold mb-3">1. Proprietary Research</h4>
					<p class="text-gray-600 leading-relaxed">Years of academic work on information structuring, causal mapping, and financial system modeling. The foundation.</p>
				</div>
				<div>
					<h4 class="text-lg font-semibold mb-3">2. GenAI + Graph Database</h4>
					<p class="text-gray-600 leading-relaxed">Specialized agents working across millions of mapped entities. Not generic LLMs. Purpose-built for chain reaction detection.</p>
				</div>
				<div>
					<h4 class="text-lg font-semibold mb-3">3. Simulation Layer</h4>
					<p class="text-gray-600 leading-relaxed">Forward-looking scenario modeling mapped to your specific exposures. What happens next, not what happened.</p>
				</div>
			</div>
		</div>

		<!-- The Market -->
		<div class="mb-32 border-t border-gray-100 pt-20">
			<h3 class="text-2xl font-semibold mb-6 text-center">The Market</h3>
			<p class="text-lg text-gray-500 text-center mb-16">
				Who Pays for This — And Why
			</p>

			<div class="grid md:grid-cols-2 gap-x-16 gap-y-12 mb-16">
				<div>
					<h4 class="text-lg font-semibold mb-4">Target Customers</h4>
					<div class="text-gray-600 space-y-2 leading-relaxed">
						<p>Hedge funds and asset managers</p>
						<p>PE/VC firms (due diligence on acquisitions)</p>
						<p>Family offices with complex exposures</p>
						<p>Corporate strategy and risk teams</p>
					</div>
				</div>

				<div>
					<h4 class="text-lg font-semibold mb-4">What They Pay For</h4>
					<div class="text-gray-600 space-y-2 leading-relaxed">
						<p>Deep strategic due diligence</p>
						<p>Continuous portfolio monitoring</p>
						<p>The edge of seeing risks first</p>
					</div>
				</div>
			</div>

			<div class="bg-gray-900 text-white rounded-2xl p-8 text-center">
				<p class="text-lg font-medium">
					Premium justified by alpha generation and loss prevention.
				</p>
			</div>
		</div>


		<!-- Traction -->
		<div class="mb-32 border-t border-gray-100 pt-20">
			<h3 class="text-2xl font-semibold mb-6 text-center">Traction</h3>
			<p class="text-lg text-gray-500 text-center mb-16">
				Where We Are
			</p>

			<div class="grid md:grid-cols-2 gap-x-16 gap-y-12 mb-16">
				<div>
					<h4 class="text-lg font-semibold mb-3">Working Platform</h4>
					<p class="text-gray-600 leading-relaxed">
						Fully operational. 4-6 models running 24/7. Thousands of AI agents processing global intelligence continuously.
					</p>
				</div>

				<div>
					<h4 class="text-lg font-semibold mb-3">Proprietary Infrastructure</h4>
					<p class="text-gray-600 leading-relaxed">
						Graph database with millions of entities. Multi-agent coordination layer. Simulation engines. Years of IP, not months.
					</p>
				</div>

				<div>
					<h4 class="text-lg font-semibold mb-3">Real-Time Ingestion</h4>
					<p class="text-gray-600 leading-relaxed">
						Thousands of sources ingested continuously.
					</p>
				</div>

				<div>
					<h4 class="text-lg font-semibold mb-3">Customer Engagement</h4>
					<p class="text-gray-600 leading-relaxed">
						Active pilots with hedge funds, family offices ($500M+ AUM), corporate strategy teams. Strong pull. Repeat engagement.
					</p>
				</div>
			</div>

			<div class="border-t border-gray-100 pt-12">
				<h4 class="text-lg font-semibold mb-6 text-center">What's Next (12 Months)</h4>
				<div class="text-gray-600 space-y-2 max-w-xl mx-auto">
					<p>Convert pilots to $500K+ ARR</p>
					<p>Document 3-5 case studies with quantified ROI</p>
					<p>Expand data ingestion (trade data, satellite, alternative data)</p>
					<p>Scale agent network to 100,000+ monitored relationships per customer</p>
				</div>
			</div>
		</div>

		<!-- The Moat That Deepens Daily -->
		<div class="mb-32 border-t border-gray-100 pt-20">
			<h3 class="text-2xl font-semibold mb-6 text-center">The Moat That Deepens Daily</h3>
			<p class="text-lg text-gray-500 text-center mb-16 max-w-2xl mx-auto">
				Network effects that compound, infrastructure advantages that can't be replicated
			</p>

			<div class="space-y-16">
				<div>
					<h4 class="text-lg font-semibold mb-6">Network Effects That Compound:</h4>
					<div class="space-y-2 text-gray-600 mb-6">
						<p>Every day of data = <span class="font-medium text-gray-900">Better entity resolution</span></p>
						<p>Better resolution = <span class="font-medium text-gray-900">Smarter pattern recognition</span></p>
						<p>Smarter patterns = <span class="font-medium text-gray-900">Earlier warnings</span></p>
						<p>Earlier warnings = <span class="font-medium text-gray-900">More customer value</span></p>
						<p>More customers = <span class="font-medium text-gray-900">Richer graph</span></p>
					</div>
					<p class="font-medium text-gray-900">
						The flywheel spins faster every day. Competitors start from zero.
					</p>
				</div>

				<div>
					<h4 class="text-lg font-semibold mb-6">The Infrastructure Advantage:</h4>
					<div class="space-y-3 text-gray-600">
						<p><span class="font-medium text-gray-900">Millions of entities mapped</span> — Building this takes years, not months.</p>
						<p><span class="font-medium text-gray-900">Years of causal modeling research</span> — Academic foundation that can't be replicated.</p>
						<p><span class="font-medium text-gray-900">Multi-agent orchestration layer</span> — Proprietary architecture.</p>
						<p><span class="font-medium text-gray-900">Domain-specific training</span> — Financial causality patterns. Generic LLMs don't have this.</p>
					</div>
				</div>

				<div>
					<h4 class="text-lg font-semibold mb-6">The Timing Advantage:</h4>
					<div class="space-y-3 text-gray-600">
						<p><span class="font-medium text-gray-900">First mover in agentic AI for financial intelligence</span> — Category is forming now.</p>
						<p><span class="font-medium text-gray-900">Building while others are pitching</span> — Working platform. Real customers.</p>
						<p><span class="font-medium text-gray-900">Bloomberg can't pivot</span> — Their relational architecture is their prison.</p>
					</div>
				</div>

				<div>
					<h4 class="text-lg font-semibold mb-6">Why Better AI Makes Us More Valuable:</h4>
					<p class="text-gray-600 mb-6">
						For AI to deliver real economic value, frontier models need the right infrastructure: structured problems, rich context, and time to work iteratively toward profound insights.
					</p>
					<div class="space-y-3 text-gray-600">
						<p><span class="font-medium text-gray-900">Saga is that infrastructure.</span> We're not an AI wrapper — we're the tool that lets frontier AI do what it does best.</p>
						<p><span class="font-medium text-gray-900">The living map provides structured context</span> — millions of entities and relationships that give AI the raw material for deep analysis.</p>
						<p><span class="font-medium text-gray-900">The agent architecture enables sustained work</span> — not one-shot queries, but iterative refinement over days and weeks.</p>
						<p><span class="font-medium text-gray-900">As models improve, our value compounds.</span> Better AI + better infrastructure = exponentially better insights.</p>
					</div>
					<p class="font-medium text-gray-900 mt-6">
						Most AI startups worry about being replaced by the next model. We're building the infrastructure that makes every next model more powerful.
					</p>
				</div>
			</div>

			<p class="text-xl font-medium text-gray-900 text-center mt-16">
				This isn't a feature. It's infrastructure-level IP that deepens every day.
			</p>
		</div>

		<!-- The Team -->
		<div class="mb-32 border-t border-gray-100 pt-20">
			<h3 class="text-2xl font-semibold mb-6 text-center">The Team</h3>
			<p class="text-lg text-gray-500 text-center mb-16">
				Built by experts at the frontier
			</p>

			<div class="space-y-8 text-gray-600 leading-relaxed">
				<p>
					<span class="font-medium text-gray-900">Academic Foundation:</span> Published research on graph databases and LLMs for market causality mapping. Years of work on information structuring for financial systems.
				</p>
				<p>
					<span class="font-medium text-gray-900">Technical Depth:</span> Multi-agent AI architectures. Graph database design. Simulation engine development. The technical leadership to build infrastructure, not just applications.
				</p>
				<p>
					<span class="font-medium text-gray-900">Financial Domain Expertise:</span> Understanding of portfolio construction, risk management, mandate constraints. We know what traders and PMs actually need.
				</p>
				<p>
					<span class="font-medium text-gray-900">Builder Mentality:</span> Working platform. Processing real intelligence. Not a pitch deck — a functioning system proving value today.
				</p>
			</div>
		</div>

		<!-- The Ask -->
		<div class="mb-32 bg-gray-900 text-white rounded-2xl p-10">
			<h3 class="text-2xl font-semibold mb-6 text-center">The Ask</h3>
			<p class="text-gray-400 text-center mb-12">
				What we're building toward
			</p>

			<div class="space-y-3 text-gray-300 mb-12">
				<p class="font-medium text-white mb-4">Raising to:</p>
				<p>Expand data ingestion to match Recorded Future breadth</p>
				<p>Scale engineering team (AI, data, infrastructure)</p>
				<p>Achieve SOC 2 Type II certification</p>
				<p>Convert pilots to paying customers with documented ROI</p>
			</div>

			<div class="border-t border-gray-700 pt-8 text-center">
				<p class="text-lg font-medium text-white mb-2">18-Month Target</p>
				<p class="text-gray-400">Significant ARR with marquee institutional logos</p>
			</div>
		</div>

		<!-- The Endgame -->
		<div class="mb-32 border-t border-gray-100 pt-20">
			<h3 class="text-2xl font-semibold mb-8 text-center">The Endgame</h3>

			<div class="space-y-4 text-lg text-gray-600 text-center mb-12">
				<p class="font-medium text-gray-900">
					Today: Saga helps portfolios see chain reactions before they materialize
				</p>
				<p class="font-medium text-gray-900">
					Tomorrow: Every investment decision starts with Saga's intelligence layer
				</p>
			</div>

			<div class="bg-gray-900 text-white rounded-2xl p-10 mb-12 text-center">
				<p class="text-xl font-medium mb-4">
					Not a tool. Not a dashboard. Infrastructure.
				</p>
				<p class="text-gray-400">
					The nervous system for how capital understands the world.
				</p>
			</div>

			<div class="mb-12">
				<div class="grid md:grid-cols-3 gap-8 text-center">
					<div>
						<p class="font-semibold mb-2">Bloomberg</p>
						<p class="text-sm text-gray-500">Became the data layer</p>
					</div>
					<div>
						<p class="font-semibold mb-2">Palantir</p>
						<p class="text-sm text-gray-500">Became the intelligence layer for defense</p>
					</div>
					<div>
						<p class="font-semibold mb-2">Recorded Future</p>
						<p class="text-sm text-gray-500">Became the threat layer for cyber</p>
					</div>
				</div>
			</div>

			<div class="text-center space-y-4">
				<p class="text-2xl font-semibold text-gray-900">
					Saga becomes the intelligence layer for capital allocation.
				</p>
				<p class="text-lg text-gray-500">
					The $100T+ market with no current leader. That's the category we're building.
				</p>
			</div>
		</div>

		<!-- Final CTA -->
		<div class="text-center py-20">
			<h3 class="text-2xl md:text-3xl font-semibold mb-6 leading-tight">
				The intelligence infrastructure layer for financial markets.
			</h3>
			<p class="text-lg text-gray-500 mb-10">
				A category worth building. No current leader. We're building it.
			</p>

			<button
				onclick={() => showContactModal = true}
				class="group relative px-8 py-4 bg-blue-600 text-white text-base font-medium rounded-xl cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5"
			>
				<span class="relative z-10">Interested? Let's talk</span>
				<div class="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
			</button>
			<p class="text-sm text-gray-400 mt-6">info@saga-labs.com</p>
		</div>
		</div>
	</section>
	{/if}

	<!-- EXAMPLES TAB CONTENT -->
	{#if activeTab === 'examples'}
	<section data-tab="examples" class="relative max-w-5xl mx-auto px-6 py-32 overflow-hidden">
		<!-- Network animation background -->
		<div class="absolute inset-0 opacity-55">
			<NetworkAnimation nodeCount={25} accentColor={accentColor} />
		</div>
		<div class="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/60 pointer-events-none"></div>
		<div class="relative">
		<h2 class="text-4xl md:text-5xl font-semibold mb-8 text-center leading-tight">
			Chain Reactions Made Visible
		</h2>
		<p class="text-lg text-gray-500 text-center mb-8 max-w-3xl mx-auto">
			These represent the types of chain reactions Saga monitors — scenarios where public information, properly connected, reveals risks and opportunities that isolated news coverage misses.
		</p>

		<p class="text-xl font-medium text-gray-900 text-center mb-20">
			The information exists. The question is whether you see the connections in time.
		</p>

		<div class="space-y-20">
			<!-- Scenario 1: AI Infrastructure - Detailed breakdown -->
			<div class="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-lg shadow-blue-100/30 border border-gray-100">
				<div class="flex items-center gap-3 mb-6">
					<span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full uppercase tracking-wide">AI & Infrastructure</span>
					<span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Risk Avoided</span>
				</div>
				<h3 class="text-2xl font-semibold mb-2">The AI Capex Squeeze</h3>
				<p class="text-gray-500 mb-8">Portfolio: Long AI infrastructure plays + data center REITs</p>

				<div class="grid md:grid-cols-2 gap-8 mb-8">
					<div>
						<p class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">The Chain Reaction</p>
						<p class="text-gray-600 leading-relaxed">
							Hyperscaler capex guidance revision + power grid interconnection delays + copper supply constraints + cooling equipment lead times extending — converging toward AI infrastructure bottleneck
						</p>
					</div>
					<div>
						<p class="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">The Scattered Signal</p>
						<p class="text-gray-600 leading-relaxed">
							Capex numbers in earnings transcripts. Grid delays in utility filings. Copper in commodity reports. Cooling in industrial sector coverage. All separate. No synthesis.
						</p>
					</div>
				</div>

				<div class="bg-gray-900 text-white rounded-xl p-6 mb-6">
					<p class="text-sm font-medium text-blue-400 uppercase tracking-wide mb-2">What Saga Revealed</p>
					<p class="text-gray-300">
						Mapped the full dependency chain from AI compute demand to physical infrastructure constraints. Identified which data center positions faced delayed revenue recognition. Timeline: 6-8 weeks to earnings impact.
					</p>
				</div>

				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<p class="font-medium text-gray-900">
						The Edge: Reduced data center concentration AND rotated into power infrastructure beneficiaries before the repricing.
					</p>
					<p class="text-sm text-blue-600 font-medium whitespace-nowrap">Flagged 5 weeks early</p>
				</div>
			</div>

			<!-- Scenario 2: Energy/Oil - Streamlined visual format -->
			<div class="border-t border-gray-200 pt-16">
				<div class="flex items-center gap-3 mb-6">
					<span class="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full uppercase tracking-wide">Energy & Commodities</span>
					<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Opportunity Captured</span>
				</div>
				<h3 class="text-2xl font-semibold mb-2">The Refinery Margin Surge</h3>
				<p class="text-gray-500 mb-8">Portfolio: Underweight energy refiners</p>

				<div class="relative pl-8 border-l-2 border-blue-200 space-y-6 mb-8">
					<div>
						<p class="text-sm font-medium text-blue-600 mb-1">Red Sea disruptions</p>
						<p class="text-gray-600 text-sm">Tanker rerouting adding 10-14 days to crude delivery</p>
					</div>
					<div>
						<p class="text-sm font-medium text-blue-600 mb-1">+ US Gulf maintenance cycle</p>
						<p class="text-gray-600 text-sm">Major refinery turnarounds coinciding with demand surge</p>
					</div>
					<div>
						<p class="text-sm font-medium text-blue-600 mb-1">+ European inventory drawdown</p>
						<p class="text-gray-600 text-sm">Strategic reserves hitting multi-year lows</p>
					</div>
					<div>
						<p class="text-sm font-medium text-blue-600 mb-1">= Crack spread expansion</p>
						<p class="text-gray-600 text-sm">Refining margins set to expand significantly</p>
					</div>
				</div>

				<p class="text-gray-600 mb-6">
					<span class="font-medium text-gray-900">The Scattered Signal:</span> Shipping data in logistics feeds. Maintenance schedules in energy sector reports. Inventory data in government releases. Each covered. None connected to refiner equity implications.
				</p>

				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-green-50 rounded-xl p-6">
					<p class="font-medium text-gray-900">
						The Edge: Built refiner position before margins expanded. Captured the upside others didn't see coming.
					</p>
					<p class="text-sm text-green-700 font-medium whitespace-nowrap">Flagged 3 weeks early</p>
				</div>
			</div>

			<!-- Scenario 3: Geopolitical/Trade - Outcome-focused format -->
			<div class="border-t border-gray-200 pt-16">
				<div class="flex items-center gap-3 mb-6">
					<span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full uppercase tracking-wide">Trade & Geopolitics</span>
					<span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Risk Avoided</span>
				</div>
				<h3 class="text-2xl font-semibold mb-2">The Rare Earth Chokepoint</h3>
				<p class="text-gray-500 mb-8">Portfolio: Long defense contractors + aerospace suppliers</p>

				<div class="bg-gray-50 rounded-xl p-6 mb-8">
					<p class="text-lg font-medium text-gray-900 mb-4">What was avoided:</p>
					<p class="text-gray-600 leading-relaxed mb-4">
						Export control escalation targeting rare earth processing created supply disruption for critical defense components. Holdings had concentrated supplier exposure that wasn't visible in standard risk screens.
					</p>
					<p class="text-gray-600 leading-relaxed">
						<span class="font-medium text-gray-900">The Scattered Signal:</span> Policy signals in government filings across multiple jurisdictions. Processing capacity data in mining industry reports. Component sourcing in defense contractor 10-Ks. The connection to specific holdings required mapping dozens of supplier relationships.
					</p>
				</div>

				<div class="grid sm:grid-cols-3 gap-4 text-center">
					<div class="bg-white rounded-lg p-4 border border-gray-100">
						<p class="text-2xl font-semibold text-blue-600 mb-1">4 weeks</p>
						<p class="text-sm text-gray-500">early warning</p>
					</div>
					<div class="bg-white rounded-lg p-4 border border-gray-100">
						<p class="text-2xl font-semibold text-blue-600 mb-1">3 holdings</p>
						<p class="text-sm text-gray-500">exposure identified</p>
					</div>
					<div class="bg-white rounded-lg p-4 border border-gray-100">
						<p class="text-2xl font-semibold text-blue-600 mb-1">12%</p>
						<p class="text-sm text-gray-500">drawdown avoided</p>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-24 border-t border-gray-200 pt-16">
			<h3 class="text-2xl font-semibold mb-8 text-center">The Pattern</h3>

			<div class="grid md:grid-cols-5 gap-4 mb-12">
				<div class="text-center p-4">
					<p class="text-3xl font-semibold text-blue-600 mb-2">1</p>
					<p class="text-sm text-gray-600">Information existed — public, available</p>
				</div>
				<div class="text-center p-4">
					<p class="text-3xl font-semibold text-blue-600 mb-2">2</p>
					<p class="text-sm text-gray-600">Scattered across sources and geographies</p>
				</div>
				<div class="text-center p-4">
					<p class="text-3xl font-semibold text-blue-600 mb-2">3</p>
					<p class="text-sm text-gray-600">Connection was the insight, not the data</p>
				</div>
				<div class="text-center p-4">
					<p class="text-3xl font-semibold text-blue-600 mb-2">4</p>
					<p class="text-sm text-gray-600">Human-scale couldn't synthesize fast enough</p>
				</div>
				<div class="text-center p-4">
					<p class="text-3xl font-semibold text-blue-600 mb-2">5</p>
					<p class="text-sm text-gray-600">AI-scale mapped it in time to act</p>
				</div>
			</div>

			<p class="text-xl font-medium text-gray-900 text-center mb-4">
				Your portfolio has chain reactions building right now.
			</p>
			<p class="text-lg text-gray-500 text-center mb-12">
				The question is whether you'll see them in time.
			</p>

			<div class="text-center">
				<button
					onclick={() => showContactModal = true}
					class="group relative px-8 py-4 bg-blue-600 text-white text-base font-medium rounded-xl cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/25 hover:-translate-y-0.5"
				>
					<span class="relative z-10">Show me what's building toward my positions</span>
					<div class="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
				</button>
				<p class="text-sm text-gray-400 mt-6">
					Give us your top exposures. We'll show you what you're not seeing.
				</p>
			</div>
		</div>
		</div>
	</section>
	{/if}

	<!-- HIDDEN: TEST SECTION - 6 SVG ANIMATIONS (code preserved, section hidden)
	<section class="max-w-6xl mx-auto px-6 py-20 border-t-4 border-dashed border-red-300 bg-red-50/30">
		<div class="text-center mb-12">
			<p class="text-sm font-bold text-red-500 uppercase tracking-wide mb-2">TEMPORARY TEST SECTION</p>
			<h2 class="text-3xl font-semibold text-gray-900 mb-4">New SVG Animations</h2>
			<p class="text-gray-500">Evaluate these 6 animations for potential use across the site</p>
		</div>
		<p class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Row 1 - Original 3 (Improved)</p>
		<div class="grid lg:grid-cols-3 gap-8 mb-12">
			<div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
				<h3 class="text-lg font-semibold mb-2 text-gray-900">1. Data Ingestion Flow</h3>
				<p class="text-sm text-gray-500 mb-4">Sources feeding into Saga's processing pipeline</p>
				<div class="bg-gray-900 rounded-xl p-4 flex items-center justify-center">
					<DataFlowAnimation width={350} height={220} accentColor={accentColor} />
				</div>
			</div>
			<div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
				<h3 class="text-lg font-semibold mb-2 text-gray-900">2. Risk Radar</h3>
				<div class="bg-gray-900 rounded-xl p-4 flex items-center justify-center">
					<RadarScanAnimation size={250} accentColor={accentColor} />
				</div>
			</div>
			<div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
				<h3 class="text-lg font-semibold mb-2 text-gray-900">3. Chain Reactions</h3>
				<div class="bg-gray-900 rounded-xl p-4 flex items-center justify-center">
					<TimelineGraphAnimation width={350} height={250} accentColor={accentColor} />
				</div>
			</div>
		</div>
		<p class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Row 2 - New 3</p>
		<div class="grid lg:grid-cols-3 gap-8">
			<div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
				<h3 class="text-lg font-semibold mb-2 text-gray-900">4. Alert Pulses</h3>
				<div class="bg-gray-900 rounded-xl p-4 flex items-center justify-center">
					<AlertPulseAnimation width={350} height={220} accentColor={accentColor} />
				</div>
			</div>
			<div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
				<h3 class="text-lg font-semibold mb-2 text-gray-900">5. Entity Clusters</h3>
				<div class="bg-gray-900 rounded-xl p-4 flex items-center justify-center">
					<EntityClusterAnimation width={350} height={220} accentColor={accentColor} />
				</div>
			</div>
			<div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
				<h3 class="text-lg font-semibold mb-2 text-gray-900">6. Signal Monitor</h3>
				<div class="bg-gray-900 rounded-xl p-4 flex items-center justify-center">
					<SignalStrengthAnimation width={350} height={220} accentColor={accentColor} />
				</div>
			</div>
		</div>
	</section>
	END HIDDEN TEST SECTION -->

	<!-- Footer - Clean & Minimal -->
	<footer class="border-t border-gray-100 py-12">
		<div class="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
			<p class="text-sm text-gray-400">Saga Labs AB</p>
			<button onclick={() => showContactModal = true} class="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none">
				info@saga-labs.com
			</button>
		</div>
	</footer>

	<!-- Contact Modal -->
	<ContactModal bind:open={showContactModal} />
</div>

