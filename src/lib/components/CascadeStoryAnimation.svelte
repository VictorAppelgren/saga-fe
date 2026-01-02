<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 700;
  export let height = 420;
  export let accentColor = '#2563eb';

  // THE STORY: A single event cascades through Saga's knowledge graph
  // Taiwan Drought -> TSMC -> Apple/Nvidia -> Consumer Electronics -> Retail -> YOUR PORTFOLIO

  interface StoryNode {
    id: number;
    x: number;
    y: number;
    label: string;
    sublabel: string;
    tier: number; // 0 = trigger, 1-4 = cascade levels, 5 = portfolio
    activated: boolean;
    activationTime: number;
    glowIntensity: number;
  }

  interface CascadeEdge {
    from: number;
    to: number;
    progress: number; // 0-1 for animation
    active: boolean;
  }

  interface RippleRing {
    id: number;
    x: number;
    y: number;
    radius: number;
    opacity: number;
  }

  let nodes: StoryNode[] = [];
  let edges: CascadeEdge[] = [];
  let ripples: RippleRing[] = [];
  let animationFrame: number;
  let storyPhase = 0; // 0-5 for cascade stages
  let storyTime = 0;
  let rippleId = 0;
  let alertPulse = 0;
  let showAlert = false;

  // Story phases timing (in frames at 60fps)
  const PHASE_DURATION = 120; // 2 seconds per phase
  const TOTAL_PHASES = 6;

  onMount(() => {
    // Define the cascade story nodes
    // Tier 0: The Trigger Event
    // Tier 1: Direct Impact
    // Tier 2: Secondary Effects
    // Tier 3: Market Effects
    // Tier 4: Portfolio Impact
    // Tier 5: Alert (Saga catches it)

    const centerY = height / 2;
    const startX = 60;
    const endX = width - 80;
    const tierSpacing = (endX - startX) / 5;

    nodes = [
      // Tier 0 - Trigger
      { id: 0, x: startX, y: centerY, label: 'Taiwan', sublabel: 'DROUGHT', tier: 0, activated: false, activationTime: 0, glowIntensity: 0 },

      // Tier 1 - Direct Impact
      { id: 1, x: startX + tierSpacing, y: centerY - 60, label: 'TSMC', sublabel: 'Supply Cut', tier: 1, activated: false, activationTime: 0, glowIntensity: 0 },
      { id: 2, x: startX + tierSpacing, y: centerY + 60, label: 'UMC', sublabel: 'Capacity', tier: 1, activated: false, activationTime: 0, glowIntensity: 0 },

      // Tier 2 - Secondary
      { id: 3, x: startX + tierSpacing * 2, y: centerY - 90, label: 'Apple', sublabel: 'iPhone', tier: 2, activated: false, activationTime: 0, glowIntensity: 0 },
      { id: 4, x: startX + tierSpacing * 2, y: centerY - 30, label: 'Nvidia', sublabel: 'GPUs', tier: 2, activated: false, activationTime: 0, glowIntensity: 0 },
      { id: 5, x: startX + tierSpacing * 2, y: centerY + 30, label: 'AMD', sublabel: 'Chips', tier: 2, activated: false, activationTime: 0, glowIntensity: 0 },
      { id: 6, x: startX + tierSpacing * 2, y: centerY + 90, label: 'Qualcomm', sublabel: 'Mobile', tier: 2, activated: false, activationTime: 0, glowIntensity: 0 },

      // Tier 3 - Market Effects
      { id: 7, x: startX + tierSpacing * 3, y: centerY - 70, label: 'Consumer', sublabel: 'Electronics', tier: 3, activated: false, activationTime: 0, glowIntensity: 0 },
      { id: 8, x: startX + tierSpacing * 3, y: centerY, label: 'Auto', sublabel: 'Sector', tier: 3, activated: false, activationTime: 0, glowIntensity: 0 },
      { id: 9, x: startX + tierSpacing * 3, y: centerY + 70, label: 'Data', sublabel: 'Centers', tier: 3, activated: false, activationTime: 0, glowIntensity: 0 },

      // Tier 4 - Portfolio Exposure
      { id: 10, x: startX + tierSpacing * 4, y: centerY - 40, label: 'Your', sublabel: 'Tech Exposure', tier: 4, activated: false, activationTime: 0, glowIntensity: 0 },
      { id: 11, x: startX + tierSpacing * 4, y: centerY + 40, label: 'Your', sublabel: 'Supply Chain', tier: 4, activated: false, activationTime: 0, glowIntensity: 0 },

      // Tier 5 - Saga Alert
      { id: 12, x: endX, y: centerY, label: 'SAGA', sublabel: 'ALERT', tier: 5, activated: false, activationTime: 0, glowIntensity: 0 },
    ];

    // Define the cascade edges
    edges = [
      // Tier 0 -> 1
      { from: 0, to: 1, progress: 0, active: false },
      { from: 0, to: 2, progress: 0, active: false },
      // Tier 1 -> 2
      { from: 1, to: 3, progress: 0, active: false },
      { from: 1, to: 4, progress: 0, active: false },
      { from: 2, to: 5, progress: 0, active: false },
      { from: 2, to: 6, progress: 0, active: false },
      // Tier 2 -> 3
      { from: 3, to: 7, progress: 0, active: false },
      { from: 4, to: 7, progress: 0, active: false },
      { from: 4, to: 9, progress: 0, active: false },
      { from: 5, to: 8, progress: 0, active: false },
      { from: 6, to: 8, progress: 0, active: false },
      // Tier 3 -> 4
      { from: 7, to: 10, progress: 0, active: false },
      { from: 8, to: 11, progress: 0, active: false },
      { from: 9, to: 10, progress: 0, active: false },
      // Tier 4 -> 5
      { from: 10, to: 12, progress: 0, active: false },
      { from: 11, to: 12, progress: 0, active: false },
    ];

    const animate = () => {
      storyTime++;

      // Determine current phase
      const newPhase = Math.min(TOTAL_PHASES - 1, Math.floor(storyTime / PHASE_DURATION));

      // Reset story if completed
      if (storyTime > PHASE_DURATION * (TOTAL_PHASES + 1)) {
        storyTime = 0;
        storyPhase = 0;
        showAlert = false;
        nodes = nodes.map(n => ({ ...n, activated: false, glowIntensity: 0 }));
        edges = edges.map(e => ({ ...e, progress: 0, active: false }));
        ripples = [];
      }

      // Activate nodes by tier when phase changes
      if (newPhase !== storyPhase) {
        storyPhase = newPhase;

        // Activate nodes of current tier
        nodes = nodes.map(n => {
          if (n.tier === storyPhase && !n.activated) {
            // Create ripple on activation
            ripples = [...ripples, {
              id: rippleId++,
              x: n.x,
              y: n.y,
              radius: 5,
              opacity: 0.8
            }];
            return { ...n, activated: true, activationTime: storyTime };
          }
          return n;
        });

        // Activate edges leading TO current tier
        edges = edges.map(e => {
          const toNode = nodes.find(n => n.id === e.to);
          if (toNode && toNode.tier === storyPhase && !e.active) {
            return { ...e, active: true };
          }
          return e;
        });

        // Show alert when final phase reached
        if (storyPhase === 5) {
          showAlert = true;
        }
      }

      // Animate edge progress
      edges = edges.map(e => {
        if (e.active && e.progress < 1) {
          return { ...e, progress: Math.min(1, e.progress + 0.03) };
        }
        return e;
      });

      // Animate node glow
      nodes = nodes.map(n => {
        if (n.activated) {
          const timeSinceActivation = storyTime - n.activationTime;
          // Pulse glow
          const baseGlow = n.tier === 5 ? 1 : 0.7;
          const pulse = Math.sin(timeSinceActivation * 0.1) * 0.3;
          return { ...n, glowIntensity: baseGlow + pulse };
        }
        return n;
      });

      // Animate ripples
      ripples = ripples
        .map(r => ({
          ...r,
          radius: r.radius + 1.5,
          opacity: Math.max(0, r.opacity - 0.02)
        }))
        .filter(r => r.opacity > 0);

      // Alert pulse
      if (showAlert) {
        alertPulse = (alertPulse + 0.08) % (Math.PI * 2);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });

  // Get tier color - gradient from blue to red as risk cascades
  function getTierColor(tier: number, activated: boolean): string {
    if (!activated) return accentColor;
    if (tier === 0) return '#3b82f6'; // Blue - trigger
    if (tier === 1) return '#8b5cf6'; // Purple
    if (tier === 2) return '#a855f7'; // Violet
    if (tier === 3) return '#d946ef'; // Magenta
    if (tier === 4) return '#f43f5e'; // Rose - portfolio at risk
    if (tier === 5) return '#ef4444'; // Red - alert!
    return accentColor;
  }

  // Phase labels for the story
  const phaseLabels = [
    { tier: 0, label: 'EVENT DETECTED' },
    { tier: 1, label: 'DIRECT IMPACT' },
    { tier: 2, label: 'SUPPLY CHAIN' },
    { tier: 3, label: 'MARKET SECTORS' },
    { tier: 4, label: 'PORTFOLIO EXPOSURE' },
    { tier: 5, label: 'ALERT TRIGGERED' },
  ];
</script>

<svg
  class="cascade-story-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <!-- Glow filters for each tier -->
    <filter id="cascadeGlow0" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="cascadeGlow5" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <!-- Arrow marker -->
    <marker id="cascadeArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill={accentColor} opacity="0.6" />
    </marker>

    <!-- Gradient for cascade flow -->
    <linearGradient id="cascadeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#ef4444" />
    </linearGradient>
  </defs>

  <!-- Dark background with subtle grid -->
  <rect x="0" y="0" width={width} height={height} fill="#0a0a0f" />

  <!-- Subtle grid lines -->
  {#each Array(Math.floor(width / 50)) as _, i}
    <line
      x1={i * 50}
      y1="0"
      x2={i * 50}
      y2={height}
      stroke={accentColor}
      stroke-width="0.3"
      opacity="0.1"
    />
  {/each}
  {#each Array(Math.floor(height / 50)) as _, i}
    <line
      x1="0"
      y1={i * 50}
      x2={width}
      y2={i * 50}
      stroke={accentColor}
      stroke-width="0.3"
      opacity="0.1"
    />
  {/each}

  <!-- Progress bar at bottom -->
  <rect
    x="50"
    y={height - 25}
    width={width - 100}
    height="4"
    rx="2"
    fill={accentColor}
    opacity="0.15"
  />
  <rect
    x="50"
    y={height - 25}
    width={(width - 100) * Math.min(1, storyTime / (PHASE_DURATION * TOTAL_PHASES))}
    height="4"
    rx="2"
    fill="url(#cascadeGradient)"
    opacity="0.8"
  />

  <!-- Tier markers -->
  {#each phaseLabels as phase, i}
    {@const x = 60 + i * ((width - 140) / 5)}
    {@const isActive = storyPhase >= phase.tier}
    <text
      x={x}
      y="22"
      text-anchor="middle"
      font-size="8"
      fill={isActive ? getTierColor(phase.tier, true) : accentColor}
      opacity={isActive ? 0.9 : 0.3}
      font-weight="600"
    >
      {phase.label}
    </text>
    <circle
      cx={x}
      cy="35"
      r="3"
      fill={isActive ? getTierColor(phase.tier, true) : accentColor}
      opacity={isActive ? 0.9 : 0.2}
    />
    {#if i < 5}
      <line
        x1={x + 10}
        y1="35"
        x2={x + ((width - 140) / 5) - 10}
        y2="35"
        stroke={isActive && storyPhase > phase.tier ? 'url(#cascadeGradient)' : accentColor}
        stroke-width="1"
        opacity={isActive && storyPhase > phase.tier ? 0.6 : 0.15}
      />
    {/if}
  {/each}

  <!-- Cascade edges -->
  {#each edges as edge}
    {@const fromNode = nodes.find(n => n.id === edge.from)}
    {@const toNode = nodes.find(n => n.id === edge.to)}
    {#if fromNode && toNode}
      {@const dx = toNode.x - fromNode.x}
      {@const dy = toNode.y - fromNode.y}
      {@const currentX = fromNode.x + dx * edge.progress}
      {@const currentY = fromNode.y + dy * edge.progress}

      <!-- Background line -->
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={accentColor}
        stroke-width="1"
        opacity="0.1"
      />

      <!-- Animated progress line -->
      {#if edge.active}
        <line
          x1={fromNode.x}
          y1={fromNode.y}
          x2={currentX}
          y2={currentY}
          stroke={getTierColor(toNode.tier, true)}
          stroke-width="2"
          opacity="0.7"
        />

        <!-- Traveling particle -->
        {#if edge.progress < 1}
          <circle
            cx={currentX}
            cy={currentY}
            r="3"
            fill={getTierColor(toNode.tier, true)}
            opacity="0.9"
          />
        {/if}
      {/if}
    {/if}
  {/each}

  <!-- Ripple effects -->
  {#each ripples as ripple}
    <circle
      cx={ripple.x}
      cy={ripple.y}
      r={ripple.radius}
      fill="none"
      stroke={accentColor}
      stroke-width="2"
      opacity={ripple.opacity}
    />
  {/each}

  <!-- Story nodes -->
  {#each nodes as node}
    {@const color = getTierColor(node.tier, node.activated)}
    {@const nodeSize = node.tier === 0 ? 28 : node.tier === 5 ? 32 : 22}

    <!-- Glow effect when activated -->
    {#if node.activated}
      <circle
        cx={node.x}
        cy={node.y}
        r={nodeSize * 1.8}
        fill={color}
        opacity={node.glowIntensity * 0.2}
        filter={node.tier === 5 ? 'url(#cascadeGlow5)' : 'url(#cascadeGlow0)'}
      />
    {/if}

    <!-- Node background -->
    <circle
      cx={node.x}
      cy={node.y}
      r={nodeSize}
      fill="#0a0a0f"
      stroke={color}
      stroke-width={node.activated ? 2 : 1}
      opacity={node.activated ? 1 : 0.3}
    />

    <!-- Node fill -->
    <circle
      cx={node.x}
      cy={node.y}
      r={nodeSize - 3}
      fill={color}
      opacity={node.activated ? 0.2 : 0.05}
    />

    <!-- Bright center for activated nodes -->
    {#if node.activated}
      <circle
        cx={node.x}
        cy={node.y}
        r={nodeSize * 0.3}
        fill={color}
        opacity={node.glowIntensity * 0.8}
      />
    {/if}

    <!-- Node labels -->
    <text
      x={node.x}
      y={node.y - 3}
      text-anchor="middle"
      font-size={node.tier === 5 ? '10' : '8'}
      fill={node.activated ? color : accentColor}
      opacity={node.activated ? 1 : 0.5}
      font-weight="700"
    >
      {node.label}
    </text>
    <text
      x={node.x}
      y={node.y + 8}
      text-anchor="middle"
      font-size="7"
      fill={node.activated ? color : accentColor}
      opacity={node.activated ? 0.8 : 0.3}
      font-weight="500"
    >
      {node.sublabel}
    </text>
  {/each}

  <!-- Alert indicator when triggered -->
  {#if showAlert}
    {@const alertNode = nodes.find(n => n.id === 12)}
    {#if alertNode}
      <!-- Pulsing outer ring -->
      <circle
        cx={alertNode.x}
        cy={alertNode.y}
        r={50 + Math.sin(alertPulse) * 10}
        fill="none"
        stroke="#ef4444"
        stroke-width="2"
        opacity={0.4 + Math.sin(alertPulse) * 0.2}
      />
      <circle
        cx={alertNode.x}
        cy={alertNode.y}
        r={65 + Math.sin(alertPulse * 0.7) * 8}
        fill="none"
        stroke="#ef4444"
        stroke-width="1"
        opacity={0.2 + Math.sin(alertPulse) * 0.1}
      />
    {/if}
  {/if}

  <!-- Title -->
  <text
    x={width / 2}
    y={height - 8}
    text-anchor="middle"
    font-size="9"
    fill={accentColor}
    opacity="0.5"
    font-weight="600"
  >
    CHAIN REACTION DETECTION — BEFORE IT HITS YOUR PORTFOLIO
  </text>
</svg>

<style>
  .cascade-story-animation {
    display: block;
  }
</style>
