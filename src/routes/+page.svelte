<script lang="ts">
	import { Network, Brain, TrendingUp, Shield, Globe, Zap, Target, Eye, Menu, X, ChevronRight } from 'lucide-svelte';
	
	let mobileMenuOpen = $state(false);
	let activeTab = $state<'home' | 'technology' | 'investors' | 'examples'>('home');
	
	function setTab(tab: 'home' | 'technology' | 'investors' | 'examples') {
		activeTab = tab;
		mobileMenuOpen = false;
		console.log('Tab changed to:', tab);
		
		// Scroll to the content section for tech/investors/examples
		if (tab === 'technology' || tab === 'investors' || tab === 'examples') {
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
					<a href="/login" class="block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-center font-semibold">Login</a>
				</div>
			{/if}
			</div>
		</nav>
	<!-- Hero Section with Gradient -->
	<section class="relative overflow-hidden pt-20">
		<!-- Gradient Background -->
		<div
			class="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"
		></div>

		<!-- Animated Grid Pattern -->
		<div
			class="absolute inset-0 opacity-[0.03]"
			style="background-image: radial-gradient(circle at 1px 1px, black 1px, transparent 0); background-size: 40px 40px;"
		></div>

		<div class="relative max-w-6xl mx-auto px-6 py-20 text-center">
			<!-- Icon Badge -->
			<div class="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full mb-8">
				<Network class="w-4 h-4" />
				<span class="text-sm font-semibold">Intelligence Infrastructure</span>
			</div>

			<h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
				Saga — The Unfair Advantage
			</h1>

			<p class="text-2xl md:text-3xl mb-6 text-gray-900 font-semibold leading-relaxed max-w-4xl mx-auto">
				Strategic Due Diligence. Continuous Risk Intelligence.
			</p>

			<p class="text-xl md:text-2xl mb-6 text-gray-700 leading-relaxed max-w-4xl mx-auto">
				Proprietary AI infrastructure that delivers unprecedented depth AND width of market understanding — powered by graph databases, multi-agent systems, and simulation engines that map the world in ways no one else can.
			</p>

			<p class="text-xl md:text-2xl mb-10 text-gray-900 font-semibold leading-relaxed max-w-4xl mx-auto">
				We don't replace human intuition. We strengthen it.<br/>
				You see more. You understand more. You're prepared for more.
			</p>

			<div class="flex gap-4 justify-center flex-wrap">
				<a
					href="/login"
					class="group px-8 py-4 bg-black text-white text-lg font-semibold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 rounded-lg"
				>
					Request Early Access
					<span class="inline-block group-hover:translate-x-1 transition-transform">→</span>
				</a>
				<a
					href="/dashboard"
					class="px-8 py-4 border-2 border-black text-black text-lg font-semibold hover:bg-gray-50 transition-all rounded-lg"
				>
					See the Platform
				</a>
			</div>

			<!-- Hero Image - Integrated -->
			<div class="mt-10 relative max-w-4xl mx-auto">
				<div class="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-200" style="height: 300px;">
					<img 
						src="/images/pexels-tara-winstead-8386440.jpg" 
						alt="Global intelligence network" 
						class="w-full h-full object-cover object-center"
					/>
					<!-- Subtle overlay for better text contrast if needed -->
					<div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
				</div>
			</div>
		</div>
	</section>

	<!-- HOME TAB CONTENT -->
	{#if activeTab === 'home'}
	<!-- The Problem We Solve -->
	<section class="max-w-6xl mx-auto px-6 py-20">
		<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200 shadow-sm">
			<h2 class="text-4xl md:text-5xl font-bold mb-10 text-center">
				The Problem We Solve
			</h2>
			<p class="text-3xl font-bold text-center mb-12">
				The Risks You Can't See Are the Ones That Hurt You
			</p>
			
			<div class="text-xl leading-relaxed space-y-6 mb-12">
				<p>
					A policy shift in Chile quietly threatens your lithium exposure. A labor dispute in Finland cascades into your European paper positions. A drought in Taiwan is building toward a semiconductor shock that will hit your holdings in six weeks.
				</p>
				<p class="font-semibold">
					These aren't random surprises. They're chain reactions — visible if you have the infrastructure to see them.
				</p>
			</div>

			<div class="bg-white rounded-xl p-8 mb-8 border border-gray-200">
				<h3 class="text-2xl font-bold mb-4">Traditional tools can't do this.</h3>
				<div class="space-y-3 text-lg text-gray-700">
					<p><strong>Bloomberg</strong> shows news in silos. Risk systems look backward. Generic AI has no financial domain expertise and no proprietary data architecture.</p>
				</div>
			</div>

			<div class="bg-black text-white rounded-xl p-8 mb-8">
				<h3 class="text-2xl font-bold mb-4">Seeing chain reactions across global systems requires something new:</h3>
				<div class="space-y-2 text-lg">
					<p>→ Graph databases mapping 50 million+ entity relationships.</p>
					<p>→ Multi-agent AI systems analyzing causality in parallel.</p>
					<p>→ Simulation engines projecting how risks cascade forward.</p>
					<p>→ Proprietary methods developed through frontier AI research.</p>
				</div>
			</div>

			<p class="text-2xl font-bold text-center">
				We built it. No one else has.
			</p>
		</div>
	</section>

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
				class="group p-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-2xl transition-all hover:scale-[1.02]"
			>
				<div class="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
					<Target class="w-10 h-10 text-white" />
				</div>
				<h3 class="text-3xl font-bold mb-4">Deep Strategic Due Diligence</h3>
				<p class="text-lg text-gray-600 mb-6 italic">Before the investment. Before the merger. Before the strategic decision.</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					Understand ALL the angles — risks, opportunities, chain effects across geographies, sectors, and supply chains. Our AI agents map the entire landscape around your decision, surfacing what you'd never think to look for.
				</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					The level of completeness that was impossible before AI could map the world at scale.
				</p>
				<p class="text-xl font-bold">Go in with eyes wide open.</p>
			</div>

			<!-- Continuous Portfolio & Risk Monitoring -->
			<div
				class="group p-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-2xl transition-all hover:scale-[1.02]"
			>
				<div class="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
					<Eye class="w-10 h-10 text-white" />
				</div>
				<h3 class="text-3xl font-bold mb-4">Continuous Portfolio & Risk Monitoring</h3>
				<p class="text-lg text-gray-600 mb-6 italic">After the decision. Every day. 24/7.</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					Your portfolio and supply chain monitored against a living map of global events. Thousands of AI agents working continuously — reading, analyzing, connecting, simulating.
				</p>
				<p class="text-lg leading-relaxed text-gray-700 mb-4">
					Risks surfaced before they materialize. Opportunities revealed as dislocations form.
				</p>
				<p class="text-xl font-bold">Stay robust. Stay prepared. Always.</p>
			</div>
		</div>
	</section>

	<!-- The Fortress Philosophy -->
	<section class="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200">
		<h2 class="text-4xl font-bold mb-6 text-center">
			The Fortress Philosophy
		</h2>
		<p class="text-2xl text-center mb-12 text-gray-600">
			The Fortress Approach to Investment Intelligence
		</p>

		<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 border border-gray-200">
			<div class="text-xl leading-relaxed space-y-6">
				<p>
					JP Morgan became the largest bank in history by obsessing over survival. Their fortress balance sheet philosophy means they KNOW they can weather what breaks their competitors.
				</p>
				<p class="font-semibold text-2xl">
					That's what Saga builds for your portfolio.
				</p>
				<p>
					Not just risk alerts. Not just market news. A fundamental shift in how prepared you are.
				</p>
				<p>
					When you understand chain reactions others can't see, you're positioned while they're scrambling. When black swans hit, you're better off — because you were already more robust than the rest.
				</p>
				<p class="font-bold text-2xl">
					This is the unfair advantage that compounds.
				</p>
			</div>
		</div>
	</section>

	<!-- Human + AI -->
	<section class="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200">
		<h2 class="text-4xl font-bold mb-6 text-center">
			Human + AI
		</h2>
		<p class="text-2xl text-center mb-12 text-gray-600">
			AI Strengthens Human Intuition. It Doesn't Replace It.
		</p>

		<div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-10 border border-gray-200">
			<div class="text-xl leading-relaxed space-y-6">
				<p>
					The best decisions still require human judgment — pattern recognition born from experience, intuition honed over decades, the ability to weigh what can't be quantified.
				</p>
				<p class="font-semibold">
					But human intuition has limits.
				</p>
				<p>
					You can't read 10,000 sources daily. You can't map 50 million entity relationships in your head. You can't simulate how a policy change cascades through six connected systems.
				</p>
				<p class="font-semibold">
					Saga handles what humans can't — the scale, the speed, the connections.
				</p>
				<p class="font-semibold">
					You handle what AI can't — the judgment, the wisdom, the final call.
				</p>
				<p class="font-bold text-2xl">
					Together: decisions that neither could make alone.
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
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<TrendingUp class="w-6 h-6 text-blue-600" />
					</div>
					<div>
						<h3 class="text-xl font-bold mb-2">Recorded Future</h3>
						<p class="text-lg text-gray-700">$2.7B exit mapping <strong>cyber threats</strong></p>
					</div>
				</div>
			</div>
			
			<div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
				<div class="flex items-start gap-4">
					<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<Shield class="w-6 h-6 text-purple-600" />
					</div>
					<div>
						<h3 class="text-xl font-bold mb-2">Palantir</h3>
						<p class="text-lg text-gray-700">$400B+ mapping <strong>defense intelligence</strong></p>
					</div>
				</div>
			</div>
		</div>

		<div class="bg-black text-white rounded-xl p-8 mb-10 text-center">
			<p class="text-2xl font-bold mb-4">No one has built this for financial markets, corporate strategy, and risk.</p>
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
					<div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<TrendingUp class="w-6 h-6 text-blue-600" />
					</div>
					<h3 class="text-2xl font-bold">Investors & Portfolio Managers</h3>
				</div>
				<p class="text-lg text-gray-700">
					See the chain reactions forming across your positions before they hit prices. Understand your true exposure. Protect downside. Capture dislocations.
				</p>
			</div>

			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<Target class="w-6 h-6 text-purple-600" />
					</div>
					<h3 class="text-2xl font-bold">PE / VC / M&A Teams</h3>
				</div>
				<p class="text-lg text-gray-700">
					Deep strategic due diligence that maps every angle before you commit capital. Risks, opportunities, dependencies — the complete picture.
				</p>
			</div>

			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<Shield class="w-6 h-6 text-pink-600" />
					</div>
					<h3 class="text-2xl font-bold">Corporate Strategy & Risk Teams</h3>
				</div>
				<p class="text-lg text-gray-700">
					Monitor your supply chain and strategic position against a living map of global events. 24/7 intelligence. No more surprises.
				</p>
			</div>

			<div class="p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all">
				<div class="flex items-start gap-4 mb-4">
					<div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
						<Zap class="w-6 h-6 text-green-600" />
					</div>
					<h3 class="text-2xl font-bold">CIOs and Allocators</h3>
				</div>
				<p class="text-lg text-gray-700">
					See how decisions cascade through interconnected systems before you commit. Understand the risk landscape at a depth that transforms how you allocate.
				</p>
			</div>
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
			class="inline-block px-8 py-4 bg-black text-white text-lg font-semibold hover:bg-gray-800 transition rounded-lg shadow-lg"
		>
			Request Early Access
		</a>
	</section>

	{/if}

	<!-- TECHNOLOGY TAB CONTENT -->
	{#if activeTab === 'technology'}
	<section data-tab="technology" class="max-w-6xl mx-auto px-6 py-24">
		<h2 class="text-5xl font-bold mb-6 text-center">The Infrastructure Behind the Unfair Advantage</h2>
		<p class="text-2xl text-center mb-8 text-gray-600 max-w-4xl mx-auto">
			Three converging technology shifts made this possible.
		</p>
		<p class="text-xl text-center mb-16 text-gray-600 max-w-4xl mx-auto">
			We combined them into proprietary infrastructure that no one else has built.
		</p>
		<p class="text-2xl font-bold text-center mb-16">
			Graph databases. Multi-agent AI. Simulation engines. Unified into one system that maps how the world actually works.
		</p>

		<!-- Why Traditional Tools Fail -->
		<div class="mb-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200">
			<h3 class="text-4xl font-bold mb-6 text-center">Why Bloomberg, Risk Systems, and Generic AI Leave You Exposed</h3>
			
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
		<h3 class="text-4xl font-bold mb-12 text-center">The Four Pillars</h3>
		<p class="text-xl text-center mb-16 text-gray-600">
			How Saga Sees What Others Miss
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
				</div>
			</div>
		</div>

		<!-- Why This Can't Be Easily Replicated -->
		<div class="mt-16 mb-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200">
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

		<!-- Architecture Diagram Placeholder -->
		<div class="mt-16 p-12 bg-gray-50 rounded-2xl border border-gray-200 text-center">
			<h3 class="text-2xl font-bold mb-4">The Saga Architecture</h3>
			<div class="space-y-4 text-lg text-gray-700">
				<p><strong>Data Layer:</strong> 10,000+ sources → Real-time ingestion → Knowledge graph storage</p>
				<p><strong>Intelligence Layer:</strong> Multi-agent AI network → Causal analysis → Risk assessment</p>
				<p><strong>Simulation Layer:</strong> Scenario modeling → Impact projection → Portfolio mapping</p>
				<p><strong>Interface Layer:</strong> Alerts → Reports → Interactive exploration</p>
			</div>
		</div>

		<!-- CTA -->
		<div class="mt-16 text-center">
			<h3 class="text-3xl font-bold mb-6">See It In Action</h3>
			<p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
				Request a technical demo to see how Saga maps risk across your specific portfolio exposures.
			</p>
			<a
				href="/login"
				class="inline-block px-8 py-4 bg-black text-white text-lg font-semibold hover:bg-gray-800 transition rounded-lg shadow-lg"
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
			Agentic AI infrastructure for financial intelligence
		</p>
		<p class="text-xl text-center mb-16 text-gray-600 max-w-4xl mx-auto">
			The category that Recorded Future built for cyber. The category that Palantir dominates in defense. No one has built it for finance. We are.
		</p>

		<!-- The Opportunity -->
		<div class="mb-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200">
			<h3 class="text-4xl font-bold mb-6 text-center">The Opportunity</h3>
			
			<div class="text-xl leading-relaxed space-y-6 mb-10">
				<p class="text-2xl font-bold text-center">
					Recorded Future: Cyber intelligence → $2.7B exit<br/>
					Palantir: Defense intelligence → $400B+ market cap<br/>
					Financial markets: No equivalent. Yet.
				</p>
			</div>

			<div class="bg-black text-white rounded-xl p-10">
				<div class="text-xl space-y-4">
					<p>→ <strong>$100T+</strong> in institutional capital flying blind on chain reactions</p>
					<p>→ <strong>Bloomberg</strong> shows news in silos. <strong>Risk systems</strong> look backward. <strong>Generic AI</strong> has no architecture.</p>
					<p>→ The risks that destroy portfolios are the <strong>connections no one mapped</strong>.</p>
				</div>
			</div>
		</div>

		<!-- The IP -->
		<div class="mb-24 bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12 border border-gray-200">
			<h3 class="text-4xl font-bold mb-6 text-center">The IP: Proprietary Research + GenAI + Graph</h3>
			
			<div class="text-xl leading-relaxed space-y-6 mb-10">
				<p class="text-2xl font-bold text-center">
					The secret: Years of research on structuring, mapping, and connecting financial information.
				</p>
				<p class="text-center text-gray-700">
					Now powered by GenAI agents + graph databases. Tailored to each user's specific portfolio.
				</p>
			</div>

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
		<div class="mb-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200">
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
						Fully operational platform processing real-time intelligence 24/7
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
						Graph database, multi-agent system, simulation engines
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
						Pilots with hedge funds, family offices, and corporate strategy teams. Strong pull from commodities traders and multi-sector PMs.
					</p>
				</div>
			</div>

			<div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200">
				<h4 class="text-2xl font-bold mb-4 text-center">What's Next</h4>
				<div class="text-lg text-gray-700 space-y-2">
					<p>→ Convert pilots to paying customers</p>
					<p>→ Build documented case studies with quantified value</p>
					<p>→ Expand data ingestion (trade data, regulatory filings, alternative data)</p>
					<p>→ Scale agent network and simulation capabilities</p>
				</div>
			</div>
		</div>

		<!-- Why We Win -->
		<div class="mb-24">
			<h3 class="text-4xl font-bold mb-6 text-center">Why We Win</h3>
			
			<div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-10 border border-gray-200">
				<div class="text-xl space-y-6">
					<p>
						<strong>1. Years of IP</strong> — Agent coordination layer + graph architecture built from frontier research. Not replicable in months.
					</p>
					<p>
						<strong>2. Structural moat</strong> — Bloomberg's relational architecture can't pivot. Generic AI has no financial architecture. Starting from scratch = years behind.
					</p>
					<p>
						<strong>3. Network effects</strong> — More data → better resolution → smarter patterns → deeper moat. Compounds daily.
					</p>
				</div>
			</div>
		</div>

		<!-- The Team -->
		<div class="mb-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200">
			<h3 class="text-4xl font-bold mb-6 text-center">The Team</h3>
			<p class="text-xl text-center mb-12 text-gray-600">
				Built by experts at the frontier
			</p>

			<div class="max-w-4xl mx-auto">
				<div class="bg-white rounded-xl p-10 border border-gray-200">
					<div class="text-xl leading-relaxed space-y-6">
						<p>
							<strong>Academic leadership</strong> in applied generative AI for finance
						</p>
						<p>
							<strong>Published research</strong> on graph databases and LLMs for market causality
						</p>
						<p>
							<strong>Technical depth</strong> at the frontier of what's possible
						</p>
						<p>
							<strong>Domain expertise</strong> in portfolio construction and institutional workflows
						</p>
					</div>
				</div>
			</div>

			<p class="text-2xl text-center mt-10 font-bold">
				The combination of AI research depth and financial domain expertise that makes this possible.
			</p>
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

		<!-- The Vision -->
		<div class="mb-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 border border-gray-200">
			<h3 class="text-4xl font-bold mb-8 text-center">The Vision</h3>
			
			<p class="text-3xl text-center font-bold mb-6">
				The nervous system for institutional capital.
			</p>
			<p class="text-2xl text-center text-gray-700 max-w-4xl mx-auto">
				The foundational layer every significant investment decision runs through — because the cost of being blindsided is too high and the edge of seeing first is too valuable.
			</p>
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
	<section id="security" class="max-w-6xl mx-auto px-6 py-24">
		<h2 class="text-5xl font-bold mb-4 text-center">Enterprise-Grade From Day One</h2>
		<p class="text-xl text-center mb-16 text-gray-600">Your data and your edge stay protected.</p>

		<div class="grid md:grid-cols-3 gap-8">
			<div class="p-8 bg-gray-50 rounded-2xl border border-gray-200">
				<div class="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
					<Shield class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-2xl font-bold mb-3">Complete Encryption</h3>
				<p class="text-lg text-gray-700">
					All data encrypted in transit and at rest. No exceptions. No compromises.
				</p>
			</div>

			<div class="p-8 bg-gray-50 rounded-2xl border border-gray-200">
				<div class="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
					<Shield class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-2xl font-bold mb-3">Isolated Environments</h3>
				<p class="text-lg text-gray-700">
					Your data stays yours. No sharing across clients. No reuse. No model training on customer
					information. Your portfolio intelligence remains your competitive advantage.
				</p>
			</div>

			<div class="p-8 bg-gray-50 rounded-2xl border border-gray-200">
				<div class="w-14 h-14 bg-pink-600 rounded-xl flex items-center justify-center mb-6">
					<Shield class="w-8 h-8 text-white" />
				</div>
				<h3 class="text-2xl font-bold mb-3">Compliance Path</h3>
				<p class="text-lg text-gray-700">
					SOC 2 Type II certification in progress. Built to align with GDPR and ISO 27001 frameworks
					from the start. Designed for institutional requirements.
				</p>
			</div>
		</div>
	</section>

	<!-- Final CTA Section -->
	<section class="max-w-6xl mx-auto px-6 py-24 border-t border-gray-200 text-center">
		<h2 class="text-4xl font-bold mb-8">The Risks You Don't See Are the Ones That Hurt You</h2>
		<div class="text-xl leading-relaxed space-y-6 mb-12 max-w-4xl mx-auto">
			<p>
				Right now, somewhere in the world, events are converging that will threaten your portfolio. A
				policy shift. A supply chain stress. A geopolitical development. The connections are forming.
				The risk is building.
			</p>
			<p>
				Traditional tools won't show you until it's too late. Your competitors using Saga will see it
				first.
			</p>
			<p>
				This is the unfair advantage. The funds that have it will compound their edge — better risk
				management, earlier warnings, fewer surprises, opportunities captured from dislocations others
				miss.
			</p>
			<p class="font-semibold">
				The funds that don't will keep reacting to headlines and wondering what they didn't see.
			</p>
		</div>

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
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
		<p class="text-lg">30-minute demo. Your portfolio exposures. The risks you might be missing.</p>
		<p class="text-lg mt-4">
			Talk to Our Team — <a href="mailto:info@saga-labs.com" class="underline font-semibold"
				>info@saga-labs.com</a
			>
		</p>
	</section>
	</section>
	{/if}

	<!-- EXAMPLES TAB CONTENT -->
	{#if activeTab === 'examples'}
	<section data-tab="examples" class="max-w-6xl mx-auto px-6 py-24">
		<h2 class="text-5xl font-bold mb-6 text-center">Examples</h2>
		<p class="text-xl text-center mb-16 text-gray-600 max-w-4xl mx-auto">
			How Saga works in practice — real scenarios and use cases
		</p>

		<!-- Unified Examples Section -->
		<h2 class="text-5xl font-bold mb-6 text-center">Chain Reactions Made Visible</h2>
		<p class="text-2xl text-center mb-8 text-gray-600 max-w-4xl mx-auto">
			Your positions define what we watch. Our infrastructure reveals what's threatening them.
		</p>
		<p class="text-xl text-center mb-16 text-gray-600 max-w-4xl mx-auto">
			Real scenarios where hidden threats became visible — in time to act
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

		<div class="mt-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border border-gray-200">
			<p class="text-2xl font-bold mb-6">
				These scenarios show how Saga reveals hidden risk.
			</p>
			<p class="text-xl text-gray-700 mb-8">
				Request a demo to see what threats might be building in your portfolio right now.
			</p>
			<a
				href="/login"
				class="inline-block px-8 py-4 bg-black text-white text-lg font-semibold hover:bg-gray-800 transition rounded-lg shadow-lg"
			>
				Request Demo
			</a>
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
