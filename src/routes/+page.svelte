<script lang="ts">
	import { Network, Brain, TrendingUp, Shield, Globe, Zap, Target, Eye, Menu, X, ChevronRight } from 'lucide-svelte';
	
	let mobileMenuOpen = $state(false);
	let activeTab = $state<'home' | 'technology' | 'investors' | 'examples' | 'compliance'>('home');
	
	function setTab(tab: 'home' | 'technology' | 'investors' | 'examples' | 'compliance') {
		activeTab = tab;
		mobileMenuOpen = false;
		console.log('Tab changed to:', tab);
		
		// Scroll to top for home
		if (tab === 'home') {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
		// Scroll to the content section for tech/investors/examples/compliance
		else if (tab === 'technology' || tab === 'investors' || tab === 'examples' || tab === 'compliance') {
			setTimeout(() => {
				const section = document.querySelector(`[data-tab="${tab}"]`);
				if (section) {
					section.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 50);
		}
	}
</script>

<div class="bg-white text-black">
	<!-- Navigation Bar -->
	<nav class="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
		<div class="max-w-7xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<!-- Logo -->
				<button onclick={() => setTab('home')} class="flex items-center gap-3 hover:opacity-80 transition">
					<img src="/saga-labs.avif" alt="Saga Labs" class="h-10" />
				</button>
				
				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center gap-8">
					<button 
						onclick={() => setTab('home')} 
						class="text-gray-700 hover:text-black transition font-medium {activeTab === 'home' ? 'text-black font-semibold' : ''}"
					>
						Home
					</button>
					<button 
						onclick={() => setTab('technology')} 
						class="text-gray-700 hover:text-black transition font-medium {activeTab === 'technology' ? 'text-black font-semibold' : ''}"
					>
						Technology
					</button>
					<button 
						onclick={() => setTab('investors')} 
						class="text-gray-700 hover:text-black transition font-medium {activeTab === 'investors' ? 'text-black font-semibold' : ''}"
					>
						For Investors
					</button>
					<button 
						onclick={() => setTab('examples')} 
						class="text-gray-700 hover:text-black transition font-medium {activeTab === 'examples' ? 'text-black font-semibold' : ''}"
					>
						Examples
					</button>
					<button 
						onclick={() => setTab('compliance')} 
						class="text-gray-700 hover:text-black transition font-medium {activeTab === 'compliance' ? 'text-black font-semibold' : ''}"
					>
						Compliance <span class="text-xs text-gray-500">(Coming Soon)</span>
					</button>
					<a href="/login" class="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold">Login</a>
				</div>
				
				<!-- Mobile Menu Button -->
				<button class="md:hidden" onclick={() => mobileMenuOpen = !mobileMenuOpen}>
					{#if mobileMenuOpen}
						<X class="w-6 h-6" />
					{:else}
						<Menu class="w-6 h-6" />
					{/if}
				</button>
			</div>
			
			<!-- Mobile Menu -->
			{#if mobileMenuOpen}
				<div class="md:hidden mt-4 pb-4 space-y-3">
					<button onclick={() => setTab('home')} class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition">Home</button>
					<button onclick={() => setTab('technology')} class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition">Technology</button>
					<button onclick={() => setTab('investors')} class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition">For Investors</button>
					<button onclick={() => setTab('examples')} class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition">Examples</button>
					<button onclick={() => setTab('compliance')} class="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition">Compliance (Coming Soon)</button>
					<a href="/login" class="block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-center font-semibold">Login</a>
				</div>
			{/if}
			</div>
		</nav>
	<!-- Hero Section with Gradient -->
	<section class="relative overflow-hidden pt-20">
		<!-- Gradient Background -->
		<div
			class="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"
		></div>

		<!-- Connected World Network - Subtle Background -->
		<div class="absolute inset-0 flex items-center justify-center overflow-hidden">
			<img 
				src="/connected_world.png" 
				alt="Global network of connected markets" 
				class="w-full max-w-5xl opacity-[0.14] object-contain pointer-events-none select-none"
				style="filter: grayscale(25%);"
			/>
		</div>

		<div class="relative max-w-6xl mx-auto px-6 py-12 text-center">
			<!-- Icon Badge -->
			<div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-full mb-6">
				<Network class="w-4 h-4" />
				<span class="text-sm font-semibold">Intelligence Infrastructure</span>
			</div>

			<h1 class="text-5xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
				Saga — The Unfair Advantage
			</h1>

			<p class="text-xl md:text-2xl mb-6 text-gray-900 font-semibold max-w-4xl mx-auto">
				Strategic Due Diligence. Continuous Risk Intelligence.
			</p>

			<div class="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto mb-8 space-y-4">
				<p class="text-gray-700">
					The risks you can't see are the ones that hurt you — not because you're not smart enough, but because there's too much to see.
				</p>
				
				<div class="border-l-2 border-gray-300 pl-6 pr-4 py-4 space-y-3">
					<p class="font-semibold text-gray-900">
						Saga scales human intuition beyond human limits. Thousands of AI agents mapping the world continuously — so you see chain reactions others miss.
					</p>
					
					<p class="font-semibold text-gray-900">
						We don't replace your judgment. We amplify it. You see more. You understand more. You're prepared for more.
					</p>
				</div>
			</div>

			<div class="flex gap-4 justify-center flex-wrap">
				<a
					href="/login"
					class="group px-8 py-4 bg-gray-900 text-white text-lg font-semibold hover:bg-black transition-all rounded-full"
				>
					Request Early Access
					<span class="inline-block group-hover:translate-x-1 transition-transform">→</span>
				</a>
				<a
					href="/dashboard"
					class="px-8 py-4 border border-gray-300 text-gray-900 text-lg font-semibold hover:bg-gray-50 transition-all rounded-full"
				>
					See the Platform
				</a>
			</div>

			<!-- Hero Image - Integrated (Connected World) -->
			<div class="mt-8 relative max-w-4xl mx-auto">
				<div class="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-100 bg-white" style="height: 240px;">
					<img 
						src="/connected_world.png" 
						alt="Global network of connected markets" 
						class="w-full h-full object-contain"
					/>
				</div>
			</div>
		</div>
	</section>

	<!-- HOME TAB CONTENT -->
	{#if activeTab === 'home'}
	<!-- The Problem We Solve -->
	<section class="max-w-6xl mx-auto px-6 py-20">
		<div class="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h2 class="text-4xl md:text-5xl font-bold mb-10 text-center">
				The Scale Problem No Human Can Solve
			</h2>
			
			<div class="text-xl leading-relaxed space-y-6 mb-12 max-w-4xl mx-auto">
				<p>
					The best investment professionals spend decades building mental models of how the world connects. That's their edge — pattern recognition, intuition built from experience, knowing what matters.
				</p>
				<p class="font-semibold text-2xl">
					But even the best mental model has limits.
				</p>
				<p>
					Too many sources to read. Too many entities to track. Too many chains of events cascading simultaneously. Too many angles to hold in one head.
				</p>
				<p class="font-semibold text-2xl">
					You're not failing because you're not smart enough.<br/>
					You're failing because no human can watch everything.
				</p>
			</div>

			<div class="bg-white/80 rounded-xl p-10 mb-12 border border-gray-200">
				<p class="text-2xl font-bold text-center mb-8">
					The Risks You Can't See Are the Ones That Hurt You
				</p>
				<div class="text-xl leading-relaxed space-y-6">
					<p>
						A policy shift in Chile quietly threatens your lithium exposure. A labor dispute in Finland cascades into your European paper positions. A drought in Taiwan is building toward a semiconductor shock that will hit your holdings in six weeks.
					</p>
					<p class="font-semibold">
						These aren't random surprises. They're chain reactions — visible if you have the infrastructure to see them.
					</p>
				</div>
			</div>

			<div class="bg-white rounded-xl p-8 mb-8 border border-gray-200">
				<h3 class="text-2xl font-bold mb-4">Traditional tools can't do this.</h3>
				<div class="space-y-3 text-lg text-gray-700">
					<p><strong>Bloomberg</strong> shows news in silos. Risk systems look backward. Generic AI has no financial domain expertise and no proprietary data architecture.</p>
				</div>
			</div>

			<div class="bg-black text-white rounded-xl p-8 mb-8">
				<h3 class="text-2xl font-bold mb-4">This is the scale problem. Saga solves it.</h3>
				<div class="space-y-3 text-lg">
					<p class="font-semibold">Thousands of AI agents doing what one expert does — but across the entire world, continuously.</p>
					<p>→ Every source. Every entity. Every chain reaction.</p>
					<p>→ Mapped, analyzed, simulated, surfaced.</p>
				</div>
			</div>

			<p class="text-2xl font-bold text-center mb-4">
				Your mental model, amplified beyond human limits.
			</p>
			<p class="text-xl text-center text-gray-700">
				We built it. No one else has.
			</p>
		</div>
	</section>

	<!-- Visual Divider - Connected World -->
	<div class="relative h-32 overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white"></div>
		<img 
			src="/connected_world.png" 
			alt="Global network of connected markets"
			class="w-full h-full object-contain opacity-[0.10] pointer-events-none select-none"
			style="object-position: center 40%; filter: grayscale(25%);"
		/>
	</div>

	<!-- Two Ways We Strengthen You -->
	<section id="platform" class="max-w-6xl mx-auto px-6 py-24">
		<h2 class="text-5xl font-bold mb-4 text-center">
			Two Ways We Strengthen You
		</h2>
		<p class="text-xl text-center mb-16 text-gray-600">
			Deep strategic due diligence. Continuous portfolio monitoring.
		</p>

		<div class="grid md:grid-cols-2 gap-8">
			<!-- Deep Strategic Due Diligence -->
			<div
				class="group p-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:scale-[1.01]"
			>
				<div class="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
					<Target class="w-7 h-7 text-white" />
				</div>
				<h3 class="text-3xl font-bold mb-4">Deep Strategic Due Diligence</h3>
				<p class="text-lg text-gray-600 mb-6 italic">Before the investment. Before the merger. Before the strategic decision.</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					Understand ALL the angles — risks, opportunities, chain effects across geographies, sectors, and supply chains. Our AI agents map the entire landscape around your decision, surfacing what you'd never think to look for.
				</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					The level of completeness that was impossible before AI could map the world at scale.
				</p>
				<p class="text-xl font-bold mb-4">Go in with eyes wide open.</p>
				<p class="text-lg leading-relaxed text-gray-700">
					And because every angle is mapped and documented, you have the audit trail that proves you did the work.
				</p>
			</div>

			<!-- Continuous Portfolio & Risk Monitoring -->
			<div
				class="group p-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:scale-[1.01]"
			>
				<div class="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
					<Eye class="w-7 h-7 text-white" />
				</div>
				<h3 class="text-3xl font-bold mb-4">Continuous Portfolio & Risk Monitoring</h3>
				<p class="text-lg text-gray-600 mb-6 italic">After the decision. Every day. 24/7.</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					Your portfolio and supply chain monitored against a living map of global events. Thousands of AI agents working continuously — reading, analyzing, connecting, simulating.
				</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					Risks surfaced before they materialize. Opportunities revealed as dislocations form.
				</p>
				<p class="text-xl font-bold mb-4">Stay robust. Stay prepared. Always.</p>
				<p class="text-lg leading-relaxed text-gray-700">
					Your AI agents never sleep. They watch what you can't.
				</p>
			</div>
		</div>
	</section>

	<!-- Human + AI -->
	<section class="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200">
		<h2 class="text-4xl font-bold mb-6 text-center">
			AI Scales Human Intuition. It Doesn't Replace It.
		</h2>

		<div class="bg-gradient-to-br from-gray-50 to-blue-50/60 rounded-2xl p-10 border border-gray-100">
			<div class="text-xl leading-relaxed space-y-6 max-w-4xl mx-auto">
				<p>
					The best decisions still require human judgment — pattern recognition born from experience, intuition honed over decades, the ability to weigh what can't be quantified.
				</p>
				<p class="font-semibold text-2xl">
					Your mental model of the world is your edge.<br/>
					Saga makes it bigger.
				</p>
				
				<div class="bg-white/85 rounded-2xl p-8 my-8 border border-gray-100">
					<div class="space-y-4">
						<p class="font-semibold text-gray-900">You can't read 10,000 sources daily. <span class="text-gray-500 font-medium">Our agents can.</span></p>
						<p class="font-semibold text-gray-900">You can't map 50 million entity relationships. <span class="text-gray-500 font-medium">Our graph does.</span></p>
						<p class="font-semibold text-gray-900">You can't simulate how six policy changes cascade. <span class="text-gray-500 font-medium">Our engines do.</span></p>
					</div>
				</div>

				<p class="font-semibold text-xl">
					Saga handles the scale problem — the sheer volume of information no human can process.
				</p>
				<p class="font-semibold text-xl">
					You handle what AI can't — the judgment, the wisdom, the final call.
				</p>
				<p class="font-bold text-2xl text-center mt-8">
					Together: decisions that neither could make alone.<br/>
					A mental model that spans the entire world.
				</p>
			</div>
		</div>
	</section>

	<!-- The Category Opportunity -->
	<section class="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200">
		<h2 class="text-4xl font-bold mb-6 text-center">
			The Category Opportunity
		</h2>
		<p class="text-2xl text-center mb-12 text-gray-600">
			A Category Worth Hundreds of Billions — With No Financial Markets Leader
		</p>

		<div class="grid md:grid-cols-2 gap-6 mb-10">
			<div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
				<div class="flex items-start gap-4">
					<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<TrendingUp class="w-5 h-5 text-gray-600" />
					</div>
					<div>
						<h3 class="text-xl font-bold mb-2">Recorded Future</h3>
						<p class="text-lg text-gray-700">$2.7B exit mapping <strong>cyber threats</strong></p>
					</div>
				</div>
			</div>
			
			<div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
				<div class="flex items-start gap-4">
					<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Shield class="w-5 h-5 text-gray-600" />
					</div>
					<div>
						<h3 class="text-xl font-bold mb-2">Palantir</h3>
						<p class="text-lg text-gray-700">$400B+ mapping <strong>defense intelligence</strong></p>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-gray-900 text-white rounded-2xl p-10 mb-10">
			<p class="text-2xl font-bold mb-4 text-center">No one has built this for financial markets, corporate strategy, and risk.</p>
			<div class="text-lg space-y-3 mt-6 max-w-3xl mx-auto">
				<p>The tools exist for cyber threats. For defense intelligence. For government.</p>
				<p class="font-semibold text-xl">But the $100 trillion in institutional capital making investment decisions?<br/>They're still flying blind on chain reactions.</p>
			</div>
		</div>

		<div class="text-xl leading-relaxed space-y-6 max-w-4xl mx-auto">
			<p>
				We combine Palantir's intelligence depth with Recorded Future's data breadth — purpose-built for investments, M&A, and continuous risk monitoring.
			</p>
			<p class="font-bold text-2xl text-center">
				The funds that adopt this will compound their advantage.
			</p>
			<p class="font-bold text-2xl text-center">
				The rest will keep getting blindsided.
			</p>
		</div>
	</section>

	<!-- Who This Is For -->
	<section class="max-w-6xl mx-auto px-6 py-24 bg-gray-50 rounded-3xl">
		<h2 class="text-5xl font-bold mb-4 text-center">Who This Is For</h2>
		<p class="text-2xl text-center mb-4 text-gray-600">
			Built for Those Who Refuse to Fly Blind
		</p>
		<p class="text-xl text-center mb-16 text-gray-600">
			For funds, institutions, and strategic teams making decisions that matter.
		</p>

		<div class="grid md:grid-cols-2 gap-8">
			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<TrendingUp class="w-5 h-5 text-gray-600" />
					</div>
					<h3 class="text-2xl font-bold">Investors & Portfolio Managers</h3>
				</div>
				<p class="text-lg text-gray-700">
					See the chain reactions forming across your positions before they hit prices. Understand your true exposure. Protect downside. Capture dislocations.
				</p>
			</div>

			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Target class="w-5 h-5 text-gray-600" />
					</div>
					<h3 class="text-2xl font-bold">PE / VC / M&A Teams</h3>
				</div>
				<p class="text-lg text-gray-700">
					Deep strategic due diligence that maps every angle before you commit capital. Risks, opportunities, dependencies — the complete picture.
				</p>
			</div>

			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Shield class="w-5 h-5 text-gray-600" />
					</div>
					<h3 class="text-2xl font-bold">Corporate Strategy & Risk Teams</h3>
				</div>
				<p class="text-lg text-gray-700">
					Monitor your supply chain and strategic position against a living map of global events. 24/7 intelligence. No more surprises.
				</p>
			</div>

			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Zap class="w-5 h-5 text-gray-600" />
					</div>
					<h3 class="text-2xl font-bold">CIOs and Allocators</h3>
				</div>
				<p class="text-lg text-gray-700">
					See how decisions cascade through interconnected systems before you commit. Understand the risk landscape at a depth that transforms how you allocate.
				</p>
			</div>

			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Shield class="w-5 h-5 text-gray-600" />
					</div>
					<div>
						<h3 class="text-2xl font-bold">Compliance & Fiduciary Teams</h3>
						<p class="text-sm text-gray-500 italic mt-1">Coming Soon</p>
					</div>
				</div>
				<p class="text-lg text-gray-700 mb-4">
					Prove you understood the risks. Every chain reaction documented. Every scenario analyzed. The audit trail that demonstrates due diligence.
				</p>
				<button 
					onclick={() => setTab('compliance')}
					class="text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 transition"
				>
					See our Compliance roadmap
					<ChevronRight class="w-4 h-4" />
				</button>
			</div>
		</div>
	</section>

	<!-- The Agentic Intelligence Layer -->
	<section class="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200">
		<h2 class="text-4xl font-bold mb-6 text-center">
			The Agentic Intelligence Layer
		</h2>
		<p class="text-2xl text-center mb-16 text-gray-600">
			How Thousands of AI Agents Scale Your Understanding
		</p>

		<div class="bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 rounded-3xl p-12 border border-gray-100 shadow-sm mb-12">
			<div class="text-xl leading-relaxed space-y-4 mb-12 max-w-4xl mx-auto text-center">
				<p class="font-semibold">Traditional AI: One model trying to do everything.</p>
				<p class="font-bold text-2xl">Saga: A coordinated network of specialized agents, each doing what it does best.</p>
			</div>

			<div class="grid md:grid-cols-2 gap-8">
				<!-- Reading Agents -->
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<div class="flex items-start gap-4 mb-4">
						<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
							<Globe class="w-5 h-5 text-gray-600" />
						</div>
						<h3 class="text-2xl font-bold">Reading Agents</h3>
					</div>
					<p class="text-lg text-gray-700 mb-3">
						Continuously processing 10,000+ sources in real-time. News, filings, trade data, policy announcements, earnings calls.
					</p>
					<p class="text-lg font-semibold text-gray-900">
						The width of understanding no human team can match.
					</p>
				</div>

				<!-- Mapping Agents -->
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<div class="flex items-start gap-4 mb-4">
						<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
							<Network class="w-5 h-5 text-gray-600" />
						</div>
						<h3 class="text-2xl font-bold">Mapping Agents</h3>
					</div>
					<p class="text-lg text-gray-700 mb-3">
						Connecting entities into a living knowledge graph. 50 million+ relationships: companies → suppliers → geographies → policies → your positions.
					</p>
					<p class="text-lg font-semibold text-gray-900">
						Chain reactions become visible.
					</p>
				</div>

				<!-- Analysis Agents -->
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<div class="flex items-start gap-4 mb-4">
						<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
							<Brain class="w-5 h-5 text-gray-600" />
						</div>
						<h3 class="text-2xl font-bold">Analysis Agents</h3>
					</div>
					<p class="text-lg text-gray-700 mb-3">
						Causal inference. Pattern recognition. Anomaly detection. Specialized reasoning applied to YOUR specific exposures.
					</p>
					<p class="text-lg font-semibold text-gray-900">
						The depth of understanding shaped to your portfolio.
					</p>
				</div>

				<!-- Simulation Agents -->
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<div class="flex items-start gap-4 mb-4">
						<div class="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
							<TrendingUp class="w-5 h-5 text-gray-600" />
						</div>
						<h3 class="text-2xl font-bold">Simulation Agents</h3>
					</div>
					<p class="text-lg text-gray-700 mb-3">
						Projecting how current events cascade forward. Stress-testing scenarios that haven't happened yet.
					</p>
					<p class="text-lg font-semibold text-gray-900">
						The forward-looking edge that sees what's building.
					</p>
				</div>
			</div>

			<div class="mt-12 bg-gray-900 text-white rounded-2xl p-10">
				<h4 class="text-2xl font-bold mb-4 text-center">Orchestration Layer</h4>
				<p class="text-lg text-center">
					Coordinating all agents into coherent intelligence. Not chaos — a symphony of specialized expertise. Working for you, 24/7, across the entire world.
				</p>
			</div>

			<p class="text-2xl font-bold text-center mt-10">
				This is what "scaling human intuition" actually means.
			</p>
		</div>
	</section>

	<!-- Simple CTA Section on Home -->
	<section class="max-w-4xl mx-auto px-6 py-24 text-center">
		<h2 class="text-4xl font-bold mb-6">
			Every portfolio has hidden risks building somewhere.
		</h2>
		<p class="text-2xl text-gray-700 mb-8">
			Saga finds them before they find you — and reveals the opportunities that emerge from the dislocations.
		</p>
		<a
			href="/login"
			class="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-semibold hover:bg-black transition rounded-full"
		>
			Request Early Access
		</a>
	</section>

	{/if}

	<!-- TECHNOLOGY TAB CONTENT -->
	{#if activeTab === 'technology'}
	<section data-tab="technology" class="max-w-6xl mx-auto px-6 py-24">
		<h2 class="text-5xl font-bold mb-6 text-center">The Infrastructure That Scales Human Understanding</h2>
		
		<div class="text-xl text-center mb-12 text-gray-700 max-w-4xl mx-auto space-y-4">
			<p>
				The best investment minds spend decades building mental models of how the world connects. But no human can hold 50 million relationships, read 10,000 sources daily, or simulate cascading scenarios continuously.
			</p>
			<p class="font-semibold text-2xl">
				We built infrastructure that can.
			</p>
		</div>
		
		<p class="text-2xl font-bold text-center mb-8">
			Graph databases. Multi-agent AI. Simulation engines.
		</p>
		<p class="text-xl text-center mb-16 text-gray-600">
			Unified into one system that amplifies human intuition beyond human limits.
		</p>
		<p class="text-2xl font-bold text-center mb-16">
			This is how you scale understanding.
		</p>

		<!-- Why Traditional Tools Fail -->
		<div class="mb-24 bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h3 class="text-4xl font-bold mb-6 text-center">Why Bloomberg, Risk Systems, and Generic AI Leave You Exposed</h3>
			
			<p class="text-xl text-center mb-10 text-gray-700 max-w-3xl mx-auto">
				These tools weren't built for the scale problem. They assume humans can connect the dots manually. They assume historical patterns predict future risks. They assume generic AI can substitute for specialized intelligence.
			</p>
			<p class="text-xl text-center mb-12 font-semibold">
				Those assumptions are why portfolios keep getting blindsided.
			</p>
			
			<div class="space-y-8">
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-3">The Problem With Bloomberg</h4>
					<p class="text-xl text-gray-700">
						News in silos. Events in isolation. You connect the dots manually — but the risks that hurt you are the connections you didn't think to make.
					</p>
				</div>

				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-3">The Problem With Traditional Risk Systems</h4>
					<p class="text-xl text-gray-700">
						Backward-looking. Built on historical correlations. They measure risk that already happened. They don't see what's forming.
					</p>
				</div>

				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-3">The Problem With Generic AI</h4>
					<p class="text-xl text-gray-700">
						No financial domain expertise. No proprietary architecture. ChatGPT can summarize. It can't tell you three unrelated events are converging to threaten 15% of your AUM.
					</p>
				</div>
			</div>

			<p class="text-2xl text-center mt-10 font-bold">
				Seeing chain reactions requires infrastructure built specifically for this problem.
			</p>
		</div>

		<!-- The Four Pillars -->
		<h3 class="text-4xl font-bold mb-12 text-center">The Four Pillars of Scaled Intelligence</h3>
		<p class="text-xl text-center mb-16 text-gray-600">
			How thousands of AI agents extend your mental model
		</p>

		<!-- The Four Pillars -->
		<div class="space-y-12">
			<!-- Collect -->
			<div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-10 shadow-sm">
				<div class="flex items-start gap-6 mb-6">
					<div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<Zap class="w-10 h-10 text-white" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-3">Collect</h3>
						<p class="text-xl text-gray-600">10,000+ sources. Real-time. Global.</p>
					</div>
				</div>
				<div class="space-y-4 text-lg text-gray-700">
					<p>
						News, trade data, regulatory filings, shipping movements, policy announcements, earnings calls, government communications.
					</p>
					<p>
						Our agents never sleep. They process everything happening in the world that could affect your positions — at a scale no human team can match.
					</p>
					<p class="font-semibold">
						This is the width of understanding.
					</p>
					<div class="mt-4 pt-4 border-t border-blue-200">
						<p class="text-base text-gray-600">
							One expert can read maybe 50 sources deeply per day. Our agents read 10,000+ and never sleep. <span class="font-semibold text-blue-700">That's what scaling width means.</span>
						</p>
					</div>
				</div>
			</div>

			<!-- Analyze -->
			<div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border border-pink-200 p-10 shadow-sm">
				<div class="flex items-start gap-6 mb-6">
					<div class="w-16 h-16 bg-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<Brain class="w-10 h-10 text-white" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-3">Analyze</h3>
						<p class="text-xl text-gray-600">Thousands of specialized AI agents working in parallel.</p>
					</div>
				</div>
				<div class="space-y-4 text-lg text-gray-700">
					<p>
						Not one model trying to do everything — a coordinated network. Causal inference. Pattern recognition. Anomaly detection. Risk assessment. Each agent doing what it does best.
					</p>
					<p>
						The analysis isn't generic market intelligence. It's risk intelligence shaped to YOUR exposures.
					</p>
					<p class="font-semibold">
						This is the depth of understanding.
					</p>
					<div class="mt-4 pt-4 border-t border-pink-200">
						<p class="text-base text-gray-600">
							One analyst can deeply understand maybe 3 sectors. Our agents maintain deep expertise across hundreds simultaneously. <span class="font-semibold text-pink-700">That's what scaling depth means.</span>
						</p>
					</div>
				</div>
			</div>

			<!-- Map -->
			<div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-10 shadow-sm">
				<div class="flex items-start gap-6 mb-6">
					<div class="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<Network class="w-10 h-10 text-white" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-3">Map</h3>
						<p class="text-xl text-gray-600">50 million+ entities and relationships. One living knowledge graph.</p>
					</div>
				</div>
				<div class="space-y-4 text-lg text-gray-700">
					<p>
						Companies linked to suppliers linked to geographies linked to policies linked to your positions.
					</p>
					<p>
						When a drought hits Taiwan, we've already mapped how it cascades: TSMC capacity → semiconductor supply → auto manufacturers → your equity holdings.
					</p>
					<p class="font-semibold">
						This is how chain reactions become visible.
					</p>
					<div class="mt-4 pt-4 border-t border-purple-200">
						<p class="text-base text-gray-600">
							Your mental model might hold a few hundred key relationships. Our graph holds 50 million+ and growing. <span class="font-semibold text-purple-700">That's what scaling connection means.</span>
						</p>
					</div>
				</div>
			</div>

			<!-- Simulate -->
			<div class="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 p-10 shadow-sm">
				<div class="flex items-start gap-6 mb-6">
					<div class="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
						<TrendingUp class="w-10 h-10 text-white" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-3">Simulate</h3>
						<p class="text-xl text-gray-600">We don't just report what happened. We model what happens next.</p>
					</div>
				</div>
				<div class="space-y-4 text-lg text-gray-700">
					<p>
						Our simulation engines project how current events cascade through interconnected systems — stress-testing against scenarios that haven't materialized yet.
					</p>
					<p>
						You see where risk is building before the market recognizes the threat.
					</p>
					<p class="font-semibold">
						This is the forward-looking edge.
					</p>
					<div class="mt-4 pt-4 border-t border-green-200">
						<p class="text-base text-gray-600">
							You might mentally simulate 2-3 scenarios. Our engines run thousands continuously. <span class="font-semibold text-green-700">That's what scaling foresight means.</span>
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Why This Can't Be Easily Replicated -->
		<div class="mt-16 mb-16 bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h3 class="text-4xl font-bold mb-6 text-center">Why This Can't Be Easily Replicated</h3>
			<p class="text-xl text-center mb-12 text-gray-600">
				The technical moat that deepens every day
			</p>

			<div class="space-y-6 text-xl max-w-4xl mx-auto">
				<p>
					→ <strong>Graph architecture took years to build</strong> — 50M+ entities with financial-specific relationships
				</p>
				<p>
					→ <strong>Multi-agent systems from frontier research</strong> — not off-the-shelf models
				</p>
				<p>
					→ <strong>Simulation engines require deep domain expertise</strong> — understanding how markets actually move
				</p>
				<p>
					→ <strong>Data network effects compound daily</strong> — every day we run, competitors fall further behind
				</p>
			</div>

			<p class="text-2xl text-center mt-10 font-bold">
				This is infrastructure-level IP. Years of work. Not replicable in months.
			</p>
		</div>

		<!-- CTA -->
		<div class="mt-16 text-center">
			<h3 class="text-3xl font-bold mb-6">See It In Action</h3>
			<p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
				Request a technical demo to see how Saga maps risk across your specific portfolio exposures.
			</p>
			<a
				href="/login"
				class="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-semibold hover:bg-black transition rounded-full"
			>
				Request Demo
			</a>
		</div>
	</section>
	{/if}

	<!-- INVESTORS TAB CONTENT -->
	{#if activeTab === 'investors'}
	<section data-tab="investors" class="max-w-6xl mx-auto px-6 py-24">
		<!-- Hero -->
		<h2 class="text-5xl font-bold mb-6 text-center">The Category-Defining Opportunity</h2>
		<p class="text-2xl text-center mb-8 text-gray-600 max-w-4xl mx-auto font-semibold">
			Infrastructure that scales human intelligence for financial markets
		</p>
		
		<div class="text-xl text-center mb-16 text-gray-700 max-w-4xl mx-auto space-y-4">
			<p>
				Recorded Future built a $2.7B business scaling threat intelligence for cyber.<br/>
				Palantir is worth $400B+ scaling intelligence for defense.
			</p>
			<p class="font-semibold text-2xl">
				No one has built this for the $100T+ in institutional capital making investment decisions with human-scale mental models.
			</p>
			<p class="font-bold text-2xl">
				That's the opportunity. We're building it.
			</p>
		</div>

		<!-- The IP -->
		<div class="mb-24 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 border border-gray-200">
			<h3 class="text-4xl font-bold mb-6 text-center">The IP: Why We Win</h3>
			
			<div class="text-xl leading-relaxed space-y-6 mb-10 max-w-4xl mx-auto">
				<p class="text-2xl font-bold text-center">
					The Core Insight:
				</p>
				<p class="text-center text-gray-700">
					Investment professionals have powerful mental models — but those models can't scale beyond human limits.
				</p>
				<p class="text-center font-semibold text-2xl">
					Saga is infrastructure that scales human understanding.
				</p>
			</div>
			
			<p class="text-xl text-center mb-10 font-semibold">
				Three layers of proprietary IP make this possible:
			</p>

			<div class="grid md:grid-cols-3 gap-6">
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-3">1. Proprietary Research</h4>
					<p class="text-gray-700">Years of academic work on information structuring, causal mapping, and financial system modeling. The foundation.</p>
				</div>
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-3">2. GenAI + Graph Database</h4>
					<p class="text-gray-700">Specialized agents working across 50M+ mapped entities. Not generic LLMs. Purpose-built for chain reaction detection.</p>
				</div>
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-3">3. Simulation Layer</h4>
					<p class="text-gray-700">Forward-looking scenario modeling mapped to your specific exposures. What happens next, not what happened.</p>
				</div>
			</div>
		</div>

		<!-- The Market -->
		<div class="mb-24 bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h3 class="text-4xl font-bold mb-6 text-center">The Market</h3>
			<p class="text-xl text-center mb-12 text-gray-600">
				Who Pays for This — And Why
			</p>

			<div class="grid md:grid-cols-2 gap-8 mb-10">
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-4">Target Customers</h4>
					<div class="text-lg text-gray-700 space-y-2">
						<p>→ Hedge funds and asset managers</p>
						<p>→ PE/VC firms (due diligence on acquisitions)</p>
						<p>→ Family offices with complex exposures</p>
						<p>→ Corporate strategy and risk teams</p>
					</div>
				</div>

				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-4">What They Pay For</h4>
					<div class="text-lg text-gray-700 space-y-2">
						<p>→ Deep strategic due diligence</p>
						<p>→ Continuous portfolio monitoring</p>
						<p>→ The edge of seeing risks first</p>
					</div>
				</div>
			</div>

			<div class="bg-black text-white rounded-xl p-8 text-center">
				<p class="text-xl font-semibold">
					Premium justified by alpha generation and loss prevention.
				</p>
			</div>
		</div>


		<!-- Traction -->
		<div class="mb-24">
			<h3 class="text-4xl font-bold mb-6 text-center">Traction</h3>
			<p class="text-xl text-center mb-12 text-gray-600">
				Where We Are
			</p>

			<div class="grid md:grid-cols-2 gap-8 mb-10">
				<div class="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
							<span class="text-2xl">✓</span>
						</div>
						<h4 class="text-xl font-bold">Working Platform</h4>
					</div>
					<p class="text-lg text-gray-700">
						Fully operational. 4-6 models running 24/7. Thousands of AI agents processing global intelligence continuously.
					</p>
				</div>

				<div class="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
							<span class="text-2xl">✓</span>
						</div>
						<h4 class="text-xl font-bold">Proprietary Infrastructure</h4>
					</div>
					<p class="text-lg text-gray-700">
						Graph database with 50M+ entities. Multi-agent coordination layer. Simulation engines. Years of IP, not months.
					</p>
				</div>

				<div class="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
							<span class="text-2xl">✓</span>
						</div>
						<h4 class="text-xl font-bold">Real-Time Ingestion</h4>
					</div>
					<p class="text-lg text-gray-700">
						10,000+ sources ingested continuously
					</p>
				</div>

				<div class="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
					<div class="flex items-center gap-3 mb-4">
						<div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
							<span class="text-2xl">✓</span>
						</div>
						<h4 class="text-xl font-bold">Customer Engagement</h4>
					</div>
					<p class="text-lg text-gray-700">
						Active pilots with: Hedge funds (commodities, multi-sector), Family offices ($500M+ AUM), Corporate strategy teams (Fortune 500). Strong pull. Repeat engagement. Moving toward contracts.
					</p>
				</div>
			</div>

			<div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
				<h4 class="text-2xl font-bold mb-4 text-center">What's Next (12 Months)</h4>
				<div class="text-lg text-gray-700 space-y-2">
					<p>→ Convert pilots to $500K+ ARR</p>
					<p>→ Document 3-5 case studies with quantified ROI</p>
					<p>→ Expand data ingestion (trade data, satellite, alternative data)</p>
					<p>→ Scale agent network to 100,000+ monitored relationships per customer</p>
					<p>→ Begin compliance module development</p>
				</div>
			</div>
		</div>

		<!-- The Moat That Deepens Daily -->
		<div class="mb-24">
			<h3 class="text-4xl font-bold mb-6 text-center">The Moat That Deepens Daily</h3>
			<p class="text-xl text-center mb-10 text-gray-600 max-w-3xl mx-auto">
				Network effects that compound, infrastructure advantages that can't be replicated, and timing that creates a winner-take-most dynamic
			</p>
			
			<div class="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
				<div class="mb-10">
					<h4 class="text-2xl font-bold mb-6">Network Effects That Compound:</h4>
					<div class="bg-white rounded-xl p-8 border border-gray-200 space-y-3 text-lg">
						<p>→ Every day of data = <strong>Better entity resolution</strong></p>
						<p>→ Better resolution = <strong>Smarter pattern recognition</strong></p>
						<p>→ Smarter patterns = <strong>Earlier warnings</strong></p>
						<p>→ Earlier warnings = <strong>More customer value</strong></p>
						<p>→ More customers = <strong>More portfolio coverage</strong></p>
						<p>→ More coverage = <strong>Richer graph</strong></p>
						<p>→ Richer graph = <strong>Wider moat</strong></p>
					</div>
					<p class="text-xl font-semibold mt-6 text-center">
						The flywheel spins faster every day. Competitors start from zero.
					</p>
				</div>

				<div class="mb-10">
					<h4 class="text-2xl font-bold mb-6">The Infrastructure Advantage:</h4>
					<div class="space-y-4 text-lg">
						<p>
							<strong>50M+ entities mapped</strong> — Competitors start at zero. Building this takes years, not months.
						</p>
						<p>
							<strong>Years of causal modeling research</strong> — Academic foundation that can't be replicated by throwing engineers at the problem.
						</p>
						<p>
							<strong>Multi-agent orchestration layer</strong> — Proprietary architecture. Not available in any framework or library.
						</p>
						<p>
							<strong>Domain-specific training</strong> — Financial causality patterns learned from years of data. Generic LLMs don't have this.
						</p>
					</div>
				</div>

				<div>
					<h4 class="text-2xl font-bold mb-6">The Timing Advantage:</h4>
					<div class="space-y-4 text-lg">
						<p>
							<strong>First mover in agentic AI for financial intelligence</strong> — Category is forming now. We're defining it.
						</p>
						<p>
							<strong>Building while others are pitching</strong> — Working platform. Real customers. Data flywheel spinning.
						</p>
						<p>
							<strong>Bloomberg can't pivot</strong> — Their relational architecture is their prison. Rebuilding = abandoning their moat.
						</p>
						<p>
							<strong>Generic AI has no architecture</strong> — ChatGPT can't map 50M entities or simulate cascading scenarios. Wrong tool.
						</p>
					</div>
				</div>

				<p class="text-2xl font-bold text-center mt-10">
					This isn't a feature. It's infrastructure-level IP that deepens every day.
				</p>
			</div>
		</div>

		<!-- The Team -->
		<div class="mb-24 bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h3 class="text-4xl font-bold mb-6 text-center">The Team</h3>
			<p class="text-xl text-center mb-12 text-gray-600">
				Built by experts at the frontier
			</p>

			<div class="max-w-4xl mx-auto">
				<div class="bg-white rounded-xl p-10 border border-gray-200">
					<div class="text-xl leading-relaxed space-y-6">
						<p>
							<strong>Academic Foundation:</strong> Published research on graph databases and LLMs for market causality mapping. Years of work on information structuring for financial systems. This isn't applied AI — it's frontier research turned into product.
						</p>
						<p>
							<strong>Technical Depth:</strong> Multi-agent AI architectures. Graph database design. Simulation engine development. Real-time data pipeline engineering. The technical leadership to build infrastructure, not just applications.
						</p>
						<p>
							<strong>Financial Domain Expertise:</strong> Understanding of portfolio construction, risk management, mandate constraints. We know what traders and PMs actually need — because we've worked with them. Not technologists guessing at finance problems.
						</p>
						<p>
							<strong>Builder Mentality:</strong> Working platform. Processing real intelligence. Engaging customers. Not a pitch deck — a functioning system proving value today.
						</p>
					</div>
				</div>
			</div>
		</div>

		<!-- The Ask -->
		<div class="mb-24 bg-black text-white rounded-3xl p-12 border border-gray-800">
			<h3 class="text-4xl font-bold mb-6 text-center">The Ask</h3>
			<p class="text-xl text-center mb-12">
				What we're building toward
			</p>

			<div class="max-w-4xl mx-auto space-y-6 text-xl mb-10">
				<p class="font-bold text-2xl">Raising to:</p>
				<p>→ Expand data ingestion to match Recorded Future breadth</p>
				<p>→ Scale engineering team (AI, data, infrastructure)</p>
				<p>→ Achieve SOC 2 Type II certification</p>
				<p>→ Convert pilots to paying customers with documented ROI</p>
			</div>

			<div class="bg-white/10 rounded-xl p-8 text-center">
				<p class="text-2xl font-bold mb-2">18-Month Target</p>
				<p class="text-xl">Significant ARR with marquee institutional logos</p>
			</div>
		</div>

		<!-- The Endgame -->
		<div class="mb-24 bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h3 class="text-4xl font-bold mb-8 text-center">The Endgame: Intelligence Infrastructure for Capital</h3>
			
			<div class="text-xl leading-relaxed space-y-6 max-w-4xl mx-auto mb-10">
				<p class="text-2xl font-bold text-center">
					Today: Saga helps portfolios see chain reactions before they materialize
				</p>
				<p class="text-2xl font-bold text-center">
					Tomorrow: Every investment decision — from $10M venture bets to $10B M&A — starts with Saga's intelligence layer
				</p>
			</div>

			<div class="bg-white rounded-xl p-10 border border-gray-200 mb-10">
				<h4 class="text-2xl font-bold mb-6 text-center">The World Is Too Complex for Human-Scale Mental Models</h4>
				<div class="grid md:grid-cols-2 gap-6 text-lg">
					<div class="space-y-3">
						<p>→ <strong>50,000+</strong> publicly traded companies</p>
						<p>→ <strong>Millions</strong> of private entities</p>
						<p>→ <strong>Infinite</strong> supply chain permutations</p>
					</div>
					<div class="space-y-3">
						<p>→ Cascading policy changes across <strong>195 countries</strong></p>
						<p>→ Real-time events affecting <strong>everything simultaneously</strong></p>
						<p>→ Connections forming <strong>faster than humans can map</strong></p>
					</div>
				</div>
				<p class="text-xl font-semibold text-center mt-8">
					No human team can map this. No traditional system was built for it.
				</p>
			</div>

			<div class="space-y-6 text-xl mb-10">
				<p class="font-bold text-2xl text-center">
					Saga becomes the intelligence layer that institutional capital runs on:
				</p>
				<div class="bg-white rounded-xl p-8 border border-gray-200 space-y-4">
					<p><strong>Hedge funds:</strong> Continuous risk monitoring across global portfolios</p>
					<p><strong>Private equity:</strong> Due diligence that sees what sell-side missed</p>
					<p><strong>Corporate strategy:</strong> M&A intelligence that maps competitive landscapes</p>
					<p><strong>Family offices:</strong> Wealth preservation through early warning systems</p>
					<p><strong>Compliance teams:</strong> Audit trails that prove fiduciary duty</p>
				</div>
			</div>

			<div class="bg-black text-white rounded-xl p-10 mb-10">
				<p class="text-2xl font-bold text-center mb-6">
					Not a tool. Not a dashboard. Infrastructure.
				</p>
				<p class="text-xl text-center">
					The nervous system for how capital understands the world.
				</p>
			</div>

			<div class="text-xl space-y-6">
				<p class="font-bold text-2xl text-center mb-6">Just like:</p>
				<div class="grid md:grid-cols-3 gap-6">
					<div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
						<p class="font-bold text-lg mb-2">Bloomberg</p>
						<p class="text-base">Became the <strong>data layer</strong><br/>(terminals everywhere)</p>
					</div>
					<div class="bg-purple-50 rounded-xl p-6 border border-purple-200">
						<p class="font-bold text-lg mb-2">Palantir</p>
						<p class="text-base">Became the <strong>intelligence layer</strong> for defense<br/>($400B market cap)</p>
					</div>
					<div class="bg-pink-50 rounded-xl p-6 border border-pink-200">
						<p class="font-bold text-lg mb-2">Recorded Future</p>
						<p class="text-base">Became the <strong>threat layer</strong> for cyber<br/>($2.7B exit)</p>
					</div>
				</div>
			</div>

			<div class="mt-10 space-y-4">
				<p class="text-3xl font-bold text-center">
					Saga becomes the intelligence layer for capital allocation.
				</p>
				<p class="text-2xl text-center text-gray-700">
					That's the category we're defining.
				</p>
				<p class="text-2xl text-center text-gray-700">
					That's the $100T+ market with no current leader.
				</p>
				<p class="text-2xl font-bold text-center">
					That's what we're building.
				</p>
			</div>
		</div>

		<!-- Final CTA -->
		<div class="text-center py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border border-gray-200">
			<h3 class="text-4xl font-bold mb-6">
				The intelligence infrastructure layer for financial markets.
			</h3>
			<p class="text-2xl text-gray-700 mb-4 max-w-3xl mx-auto font-semibold">
				A category worth building. No current leader.
			</p>
			<p class="text-2xl font-bold mb-10">
				We're building it.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
				<a
					href="/login"
					class="px-8 py-4 bg-black text-white text-lg font-semibold hover:bg-gray-800 transition rounded-lg shadow-lg"
				>
					Request Early Access
				</a>
				<a
					href="/dashboard"
					class="px-8 py-4 border-2 border-black text-black text-lg font-semibold hover:bg-gray-50 transition rounded-lg"
				>
					See the Platform
				</a>
			</div>
			
			<p class="text-lg text-gray-600">
				<a href="mailto:info@saga-labs.com" class="underline font-semibold hover:text-black transition">info@saga-labs.com</a>
			</p>
		</div>
	</section>
	{/if}

	<!-- EXAMPLES TAB CONTENT -->
	{#if activeTab === 'examples'}
	<section data-tab="examples" class="max-w-6xl mx-auto px-6 py-24">
		<h2 class="text-5xl font-bold mb-6 text-center">Chain Reactions Made Visible</h2>
		<p class="text-2xl text-center mb-8 text-gray-700 max-w-4xl mx-auto">
			Real scenarios where human-scale monitoring failed — and AI-scale intelligence caught the risk in time
		</p>
		
		<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 mb-16 border border-gray-200 max-w-4xl mx-auto">
			<p class="text-xl leading-relaxed mb-4">
				The risks that hurt portfolios aren't the obvious ones. They're the chain reactions: Event A affects Entity B, which threatens Supply Chain C, which impacts Position D.
			</p>
			<p class="text-xl font-semibold">
				No human can track these connections across the entire world. But thousands of AI agents can.
			</p>
		</div>
		
		<p class="text-2xl text-center mb-16 font-bold">
			Here's what that looks like in practice.
		</p>

		<div class="space-y-8">
			<!-- Scenario 1: Semiconductor Supply Chain -->
			<div class="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<TrendingUp class="w-7 h-7 text-blue-600" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-2">The Semiconductor Blindspot</h3>
						<p class="text-lg text-gray-600">Portfolio: Long auto suppliers + tech positions</p>
					</div>
				</div>
				<div class="space-y-5 text-gray-700">
					<p class="text-lg">
						<span class="font-bold text-black">The Chain Reaction:</span> Taiwan drought conditions + automotive demand surge + TSMC capacity constraints converging toward global semiconductor shortage
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Bloomberg Showed:</span> Three separate news items in three different feeds. Drought in Taiwan. Auto sales data. Chip maker earnings. No connection drawn. No portfolio impact flagged.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Saga Revealed:</span> Direct threat to auto supplier holdings mapped through supply chain dependencies. Secondary exposure through tech positions. Severity projection based on historical supply disruptions. Timeline: 2-3 weeks to material impact.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">When Flagged:</span> 14 days before shortage hit mainstream financial news
					</p>
					<div class="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-6">
						<p class="text-xl font-bold text-black">
							✓ The Edge: Time to reduce concentrated auto supplier risk AND position for the repricing others would chase when shortage became obvious
						</p>
					</div>
				</div>
			</div>

			<!-- Scenario 2: Commodity Supply Shock -->
			<div class="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Network class="w-7 h-7 text-purple-600" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-2">The Commodity Chain Reaction</h3>
						<p class="text-lg text-gray-600">Portfolio: Long European paper commodities</p>
					</div>
				</div>
				<div class="space-y-5 text-gray-700">
					<p class="text-lg">
						<span class="font-bold text-black">The Chain Reaction:</span> Finnish labor dispute + European mill capacity constraints + packaging supply chain stress + energy cost spikes converging toward price volatility
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Bloomberg Showed:</span> A labor news item buried in Nordic regional coverage. Energy prices reported separately. Mill capacity data in industry reports. No connection to commodity positions. No risk flag.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Saga Revealed:</span> Direct exposure in European paper commodity holdings. Cascading supply pressure mapped across 12 connected mills. EUR currency pressure amplifying impact. Price impact probability: 85%. Timeline: 5-7 days.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">When Flagged:</span> 5 days before pricing volatility hit
					</p>
					<div class="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-6">
						<p class="text-xl font-bold text-black">
							✓ The Edge: Hedged downside risk with options AND captured asymmetric opportunity from the dislocation when competitors were caught flat-footed
						</p>
					</div>
				</div>
			</div>

			<!-- Scenario 3: Lithium Supply Risk -->
			<div class="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Zap class="w-7 h-7 text-green-600" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-2">The Lithium Miner Squeeze</h3>
						<p class="text-lg text-gray-600">Portfolio: Long lithium miners + EV supply chain exposure</p>
					</div>
				</div>
				<div class="space-y-5 text-gray-700">
					<p class="text-lg">
						<span class="font-bold text-black">The Chain Reaction:</span> Chile water policy changes + Chinese export restrictions + mining labor disputes + environmental regulation tightening converging toward supply constraints
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Bloomberg Showed:</span> Water policy in Chile environmental section. Chinese trade data in Asia coverage. Labor news in mining industry reports. Regulations in policy briefs. All separate. No synthesis.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Saga Revealed:</span> Converging pressure on 40% of global lithium supply. Direct exposure through miner holdings. Secondary exposure through EV battery manufacturers. Opportunity: Competitors in alternative geographies positioned to benefit. ESG-driven capital rotation creating mispricing.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">When Flagged:</span> 3 weeks before supply concerns hit analyst reports
					</p>
					<div class="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-6">
						<p class="text-xl font-bold text-black">
							✓ The Edge: Rotated out of concentrated Chile exposure AND positioned in Australian/Canadian miners before the repricing
						</p>
					</div>
				</div>
			</div>

			<!-- Scenario 4: Credit Portfolio Risk -->
			<div class="bg-white rounded-2xl border border-gray-200 p-10 shadow-sm hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-6">
					<div class="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
						<Shield class="w-7 h-7 text-pink-600" />
					</div>
					<div>
						<h3 class="text-3xl font-bold mb-2">The Industrial Credit Cascade</h3>
						<p class="text-lg text-gray-600">Portfolio: Industrial credit positions + leveraged loans</p>
					</div>
				</div>
				<div class="space-y-5 text-gray-700">
					<p class="text-lg">
						<span class="font-bold text-black">The Chain Reaction:</span> Key borrower's largest customer announces restructuring + input cost pressure from commodity spike + trade policy creating tariff exposure + working capital deterioration across sector
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Bloomberg Showed:</span> Customer restructuring in M&A section. Commodity prices in markets data. Trade policy in government coverage. Working capital metrics in quarterly filings. No connection to credit portfolio.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">What Saga Revealed:</span> Customer concentration risk (35% of borrower revenue). Margin pressure from input costs threatening covenant compliance. Tariff exposure on 20% of production. Working capital stress visible in payment terms. Credit deterioration probability: 70%. Timeline: 2-3 months.
					</p>
					<p class="text-lg">
						<span class="font-bold text-black">When Flagged:</span> 8 weeks before credit rating downgrade
					</p>
					<div class="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-lg p-6">
						<p class="text-xl font-bold text-black">
							✓ The Edge: Exited position before spread widening AND identified restructuring opportunity at distressed levels when others panicked
						</p>
					</div>
				</div>
			</div>
		</div>

		<div class="mt-16 bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h3 class="text-3xl font-bold mb-8 text-center">The Pattern Across All Examples</h3>
			
			<div class="text-xl leading-relaxed space-y-6 max-w-4xl mx-auto mb-10">
				<p>Notice what these scenarios have in common:</p>
				
				<div class="bg-white rounded-xl p-8 border border-gray-200 space-y-4">
					<p><strong>1.</strong> The information existed. It was public. Available.</p>
					<p><strong>2.</strong> It was scattered across multiple sources, categories, geographies.</p>
					<p><strong>3.</strong> The CONNECTION was the insight — not any single data point.</p>
					<p><strong>4.</strong> Human-scale monitoring couldn't synthesize fast enough.</p>
					<p><strong>5.</strong> AI-scale monitoring mapped the chain reaction in time to act.</p>
				</div>
				
				<p class="font-bold text-2xl text-center">
					This is the scale problem.<br/>
					This is what Saga solves.
				</p>
				
				<p class="text-center">
					Your portfolio has chain reactions building right now. The question is whether you'll see them in time.
				</p>
			</div>
			
			<div class="text-center">
				<a
					href="/login"
					class="inline-block px-8 py-4 bg-gray-900 text-white text-lg font-semibold hover:bg-black transition rounded-full"
				>
					Request a Demo
				</a>
				<p class="text-lg mt-4 text-gray-600">
					See what risks might be forming in your positions.
				</p>
			</div>
		</div>
	</section>
	{/if}

	<!-- COMPLIANCE TAB CONTENT -->
	{#if activeTab === 'compliance'}
	<section data-tab="compliance" class="max-w-6xl mx-auto px-6 py-24">
		<div class="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full mb-6 mx-auto">
			<Shield class="w-4 h-4" />
			<span class="text-sm font-semibold">Coming 2025</span>
		</div>
		
		<h2 class="text-5xl font-bold mb-6 text-center">Compliance Intelligence</h2>
		<p class="text-2xl text-center mb-16 text-gray-700 max-w-4xl mx-auto">
			Understanding Is the Foundation of Compliance
		</p>

		<!-- Core Message -->
		<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 mb-16 border border-gray-200">
			<div class="text-xl leading-relaxed space-y-6 max-w-4xl mx-auto">
				<p>
					Regulators and LPs increasingly ask one question: <strong>"Did you understand the risks?"</strong>
				</p>
				<p>
					The era of "we didn't see it coming" as an acceptable answer is ending. Fiduciary duty now requires demonstrable due diligence. Compliance requires proof of understanding.
				</p>
			</div>
		</div>

		<!-- The Saga Approach -->
		<div class="mb-16">
			<h3 class="text-4xl font-bold mb-8 text-center">The Saga Approach: Compliance Through Understanding</h3>
			
			<div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 border border-gray-200">
				<p class="text-2xl font-semibold text-center mb-8">
					What if compliance was a byproduct of genuinely understanding your risks?
				</p>
				
				<div class="text-xl leading-relaxed space-y-6 max-w-4xl mx-auto">
					<p>When every chain reaction is mapped...</p>
					<p>When every scenario is simulated...</p>
					<p>When every risk is documented as it's identified...</p>
					
					<p class="font-bold text-2xl text-center pt-6">
						You don't just have compliance.<br/>
						You have PROOF that you did the work.
					</p>
				</div>
			</div>
		</div>

		<!-- How It Works -->
		<div class="mb-16">
			<h3 class="text-4xl font-bold mb-8 text-center">How It Works</h3>
			
			<div class="grid md:grid-cols-3 gap-8">
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-4">Continuous Documentation</h4>
					<p class="text-lg text-gray-700">
						Every risk Saga surfaces is timestamped and logged. Every chain reaction mapped. Every scenario simulated. An automatic audit trail of your risk awareness.
					</p>
				</div>
				
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-4">Due Diligence Packages</h4>
					<p class="text-lg text-gray-700">
						Before major investments: comprehensive risk mapping. After: documentation of what you knew, when you knew it. Ready for LP questions, regulatory inquiries, board presentations.
					</p>
				</div>
				
				<div class="bg-white rounded-xl p-8 border border-gray-200">
					<h4 class="text-2xl font-bold mb-4">Demonstrable Process</h4>
					<p class="text-lg text-gray-700">
						Not just "we have a risk management process." But: "Here are the specific risks we identified, the chain reactions we mapped, the scenarios we simulated, and the actions we took."
					</p>
				</div>
			</div>
		</div>

		<!-- The Regulatory Tailwind -->
		<div class="mb-16 bg-white rounded-3xl p-12 border border-gray-100 shadow-sm">
			<h3 class="text-4xl font-bold mb-8 text-center">The Regulatory Tailwind</h3>
			
			<div class="text-xl leading-relaxed space-y-4 max-w-4xl mx-auto">
				<p><strong>Post-2008:</strong> Increased focus on risk management documentation</p>
				<p><strong>Post-SVB:</strong> Scrutiny on whether institutions understood concentration risks</p>
				<p><strong>Ongoing:</strong> ESG disclosure requirements demanding demonstrated understanding</p>
				
				<p class="font-semibold text-2xl text-center pt-6">
					The trend is clear: regulators want proof of understanding, not just process.
				</p>
				<p class="text-center text-gray-700">
					Saga provides that proof — as a natural byproduct of genuine risk intelligence.
				</p>
			</div>
		</div>

		<!-- For Now: Built-In Benefits -->
		<div class="mb-16">
			<h3 class="text-4xl font-bold mb-8 text-center">For Now: Compliance Benefits Built-In</h3>
			
			<div class="bg-white rounded-xl p-10 border border-gray-200">
				<p class="text-xl mb-8 text-center">
					Even without the dedicated compliance module, Saga customers benefit from automatic documentation:
				</p>
				
				<div class="grid md:grid-cols-2 gap-6 mb-8">
					<div class="flex items-start gap-3">
						<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
							<span class="text-white text-sm font-bold">✓</span>
						</div>
						<p class="text-lg">Every risk surfaced is logged with timestamp</p>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
							<span class="text-white text-sm font-bold">✓</span>
						</div>
						<p class="text-lg">Chain reaction analysis is preserved</p>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
							<span class="text-white text-sm font-bold">✓</span>
						</div>
						<p class="text-lg">Scenario simulations are recorded</p>
					</div>
					<div class="flex items-start gap-3">
						<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
							<span class="text-white text-sm font-bold">✓</span>
						</div>
						<p class="text-lg">Actions and alerts are tracked</p>
					</div>
				</div>
				
				<div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border border-gray-200">
					<p class="text-xl text-center font-semibold mb-4">
						When the compliance module launches, this data becomes structured reporting.
					</p>
					<p class="text-lg text-center text-gray-700">
						The understanding comes first. The compliance documentation follows naturally.
					</p>
				</div>
			</div>
		</div>

		<!-- CTA -->
		<div class="text-center py-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl border border-gray-200">
			<h3 class="text-3xl font-bold mb-6">Want Early Access to the Compliance Module?</h3>
			<p class="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
				Join the waitlist to be notified when compliance intelligence launches in 2025.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
				<a
					href="/login"
					class="px-8 py-4 bg-black text-white text-lg font-semibold hover:bg-gray-800 transition rounded-lg shadow-lg"
				>
					Join the Waitlist
				</a>
			</div>
			<p class="text-lg text-gray-600">
				Questions about our compliance roadmap? <a href="mailto:info@saga-labs.com" class="underline font-semibold hover:text-black transition">info@saga-labs.com</a>
			</p>
		</div>
	</section>
	{/if}

	<!-- Footer -->
	<footer class="border-t border-gray-200 py-12 text-center">
		<p class="text-lg font-semibold mb-2">Saga Labs AB</p>
		<p class="text-lg mb-2">
			<a href="mailto:info@saga-labs.com" class="underline">info@saga-labs.com</a>
		</p>
		<p class="text-lg italic">The unfair advantage in portfolio intelligence.</p>
	</footer>
</div>
