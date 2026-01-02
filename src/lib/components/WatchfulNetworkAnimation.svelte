<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 700;
  export let height = 420;
  export let accentColor = '#2563eb';

  // THE STORY: YOUR JUDGMENT amplified by SAGA
  // Center = YOUR PORTFOLIO (what you care about)
  // SAGA surrounds it, with agents extending your reach to the entire world
  // Intelligence flows BACK to you - confirming thesis or exposing risks

  interface Agent {
    id: number;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    sector: string;
    color: string;
    scanAngle: number;
    scanSpeed: number;
    alertLevel: number;
    lastSignalTime: number;
    pulsePhase: number;
  }

  interface DataStream {
    id: number;
    fromAgent: number;
    progress: number;
    color: string;
    size: number;
    type: 'intel' | 'confirm' | 'alert';
  }

  interface Signal {
    id: number;
    x: number;
    y: number;
    radius: number;
    opacity: number;
    color: string;
  }

  let agents: Agent[] = [];
  let dataStreams: DataStream[] = [];
  let signals: Signal[] = [];
  let animationFrame: number;
  let time = 0;
  let streamId = 0;
  let signalId = 0;
  let centerPulse = 0;
  let sagaActivity = 0;

  const centerX = width / 2;
  const centerY = height / 2;
  const portfolioRadius = 35;
  const sagaRingRadius = 75;
  const agentOrbitRadius = Math.min(width, height) * 0.42;

  const sectors = [
    { name: 'Policy', color: '#8b5cf6', angle: -Math.PI / 2 },
    { name: 'Supply', color: '#f59e0b', angle: -Math.PI / 6 },
    { name: 'Markets', color: '#ef4444', angle: Math.PI / 6 },
    { name: 'Credit', color: '#ec4899', angle: Math.PI / 2 },
    { name: 'Macro', color: '#06b6d4', angle: (5 * Math.PI) / 6 },
    { name: 'Geo', color: '#22c55e', angle: (-5 * Math.PI) / 6 },
  ];

  onMount(() => {
    agents = [];
    let agentId = 0;

    // Create agents around the perimeter
    sectors.forEach((sector) => {
      const agentCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < agentCount; i++) {
        const angleOffset = (i - (agentCount - 1) / 2) * 0.2;
        const radiusOffset = (i % 2 === 0 ? -12 : 12);
        const baseAngle = sector.angle + angleOffset;
        const x = centerX + Math.cos(baseAngle) * (agentOrbitRadius + radiusOffset);
        const y = centerY + Math.sin(baseAngle) * (agentOrbitRadius + radiusOffset);

        agents.push({
          id: agentId++,
          x,
          y,
          baseX: x,
          baseY: y,
          sector: sector.name,
          color: sector.color,
          scanAngle: Math.random() * Math.PI * 2,
          scanSpeed: 0.015 + Math.random() * 0.015,
          alertLevel: 0,
          lastSignalTime: -500 + Math.random() * 500,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    });

    const animate = () => {
      time++;
      centerPulse += 0.03;
      sagaActivity = Math.max(0, sagaActivity - 0.008);

      // Gentle floating for agents
      agents = agents.map(agent => {
        const floatX = Math.sin(time * 0.015 + agent.id * 0.7) * 2;
        const floatY = Math.cos(time * 0.018 + agent.id * 0.5) * 2;

        let newAlertLevel = agent.alertLevel;
        let newLastSignalTime = agent.lastSignalTime;

        const newScanAngle = agent.scanAngle + agent.scanSpeed;

        // Independent signal detection
        const timeSinceLastSignal = time - agent.lastSignalTime;
        if (timeSinceLastSignal > 180 && Math.random() < 0.006) {
          newAlertLevel = 0.7 + Math.random() * 0.3;
          newLastSignalTime = time;

          signals = [...signals, {
            id: signalId++,
            x: agent.baseX + floatX,
            y: agent.baseY + floatY,
            radius: 6,
            opacity: 0.8,
            color: agent.color,
          }];

          // Determine stream type based on random
          const rand = Math.random();
          const streamType = rand < 0.15 ? 'alert' : rand < 0.4 ? 'confirm' : 'intel';

          dataStreams = [...dataStreams, {
            id: streamId++,
            fromAgent: agent.id,
            progress: 0,
            color: streamType === 'alert' ? '#ef4444' : streamType === 'confirm' ? '#22c55e' : agent.color,
            size: streamType === 'alert' ? 5 : 3 + Math.random() * 2,
            type: streamType,
          }];
        }

        newAlertLevel = Math.max(0, newAlertLevel - 0.006);

        return {
          ...agent,
          x: agent.baseX + floatX,
          y: agent.baseY + floatY,
          scanAngle: newScanAngle,
          alertLevel: newAlertLevel,
          lastSignalTime: newLastSignalTime,
          pulsePhase: agent.pulsePhase + 0.04,
        };
      });

      // Animate data streams toward center
      dataStreams = dataStreams.map(stream => {
        const newProgress = stream.progress + 0.012;

        if (stream.progress < 1 && newProgress >= 1) {
          sagaActivity = Math.min(1, sagaActivity + (stream.type === 'alert' ? 0.4 : 0.2));
        }

        return { ...stream, progress: newProgress };
      }).filter(s => s.progress < 1.15);

      // Animate signals
      signals = signals
        .map(s => ({ ...s, radius: s.radius + 1.2, opacity: s.opacity - 0.02 }))
        .filter(s => s.opacity > 0);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  });
</script>

<svg
  class="watchful-network-animation"
  viewBox="0 0 {width} {height}"
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid slice"
>
  <defs>
    <filter id="agentGlow2" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <filter id="centerGlow2" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <radialGradient id="centerGradient2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.2" />
      <stop offset="60%" stop-color={accentColor} stop-opacity="0.05" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Dark background -->
  <rect x="0" y="0" width={width} height={height} fill="#0a0a0f" />

  <!-- Orbital rings -->
  {#each [0.5, 0.7, 0.9] as ratio}
    <circle
      cx={centerX}
      cy={centerY}
      r={agentOrbitRadius * ratio}
      fill="none"
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.05"
    />
  {/each}

  <!-- Sector dividers -->
  {#each sectors as sector}
    <line
      x1={centerX + Math.cos(sector.angle) * (sagaRingRadius + 20)}
      y1={centerY + Math.sin(sector.angle) * (sagaRingRadius + 20)}
      x2={centerX + Math.cos(sector.angle) * (agentOrbitRadius + 40)}
      y2={centerY + Math.sin(sector.angle) * (agentOrbitRadius + 40)}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.04"
      stroke-dasharray="3 6"
    />
  {/each}

  <!-- Sector labels -->
  {#each sectors as sector}
    <text
      x={centerX + Math.cos(sector.angle) * (agentOrbitRadius + 28)}
      y={centerY + Math.sin(sector.angle) * (agentOrbitRadius + 28)}
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="9"
      fill={sector.color}
      opacity="0.6"
      font-weight="600"
    >
      {sector.name.toUpperCase()}
    </text>
  {/each}

  <!-- Connection lines (faint) -->
  {#each agents as agent}
    <line
      x1={agent.x}
      y1={agent.y}
      x2={centerX}
      y2={centerY}
      stroke={accentColor}
      stroke-width="0.5"
      opacity={0.02 + agent.alertLevel * 0.03}
    />
  {/each}

  <!-- Data streams -->
  {#each dataStreams as stream}
    {@const agent = agents.find(a => a.id === stream.fromAgent)}
    {#if agent}
      {@const px = agent.x + (centerX - agent.x) * stream.progress}
      {@const py = agent.y + (centerY - agent.y) * stream.progress}

      <line
        x1={agent.x}
        y1={agent.y}
        x2={px}
        y2={py}
        stroke={stream.color}
        stroke-width={stream.type === 'alert' ? 2 : 1.5}
        opacity={0.4 * (1 - stream.progress * 0.3)}
      />

      <circle
        cx={px}
        cy={py}
        r={stream.size}
        fill={stream.color}
        opacity={0.9}
        filter="url(#agentGlow2)"
      />
    {/if}
  {/each}

  <!-- Signal ripples -->
  {#each signals as signal}
    <circle
      cx={signal.x}
      cy={signal.y}
      r={signal.radius}
      fill="none"
      stroke={signal.color}
      stroke-width="2"
      opacity={signal.opacity}
    />
  {/each}

  <!-- AI Agents -->
  {#each agents as agent}
    {@const isAlerted = agent.alertLevel > 0.1}
    {@const agentSize = 13}

    <!-- Scan arc -->
    {#if !isAlerted}
      <path
        d="M {agent.x} {agent.y}
           L {agent.x + Math.cos(agent.scanAngle) * 25} {agent.y + Math.sin(agent.scanAngle) * 25}
           A 25 25 0 0 1 {agent.x + Math.cos(agent.scanAngle + 0.5) * 25} {agent.y + Math.sin(agent.scanAngle + 0.5) * 25}
           Z"
        fill={agent.color}
        opacity="0.08"
      />
      <line
        x1={agent.x}
        y1={agent.y}
        x2={agent.x + Math.cos(agent.scanAngle) * 25}
        y2={agent.y + Math.sin(agent.scanAngle) * 25}
        stroke={agent.color}
        stroke-width="1"
        opacity="0.25"
      />
    {/if}

    <!-- Alert glow -->
    {#if isAlerted}
      <circle
        cx={agent.x}
        cy={agent.y}
        r={agentSize * 2}
        fill={agent.color}
        opacity={agent.alertLevel * 0.35}
        filter="url(#agentGlow2)"
      />
    {/if}

    <!-- Agent body -->
    <circle
      cx={agent.x}
      cy={agent.y}
      r={agentSize}
      fill="#0a0a0f"
      stroke={agent.color}
      stroke-width={isAlerted ? 2 : 1}
      opacity={0.7 + agent.alertLevel * 0.3}
    />

    <!-- Inner eye -->
    <circle
      cx={agent.x}
      cy={agent.y}
      r={agentSize * 0.5}
      fill={agent.color}
      opacity={0.35 + agent.alertLevel * 0.4 + Math.sin(agent.pulsePhase) * 0.08}
    />

    <!-- Pupil -->
    {@const lookAngle = isAlerted ? Math.atan2(centerY - agent.y, centerX - agent.x) : agent.scanAngle}
    <circle
      cx={agent.x + Math.cos(lookAngle) * 2.5}
      cy={agent.y + Math.sin(lookAngle) * 2.5}
      r="2"
      fill={isAlerted ? '#fff' : agent.color}
      opacity={0.8 + agent.alertLevel * 0.2}
    />
  {/each}

  <!-- CENTER: SAGA surrounding YOUR PORTFOLIO -->
  <!-- Outer ambient glow -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRingRadius * 1.8}
    fill="url(#centerGradient2)"
  />

  <!-- SAGA ring pulse -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRingRadius + 15 + Math.sin(centerPulse) * 4 + sagaActivity * 8}
    fill="none"
    stroke={accentColor}
    stroke-width="1"
    opacity={0.15 + sagaActivity * 0.15}
  />
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRingRadius + 28 + Math.sin(centerPulse) * 4 * 0.6 + sagaActivity * 12}
    fill="none"
    stroke={accentColor}
    stroke-width="0.5"
    opacity={0.08 + sagaActivity * 0.08}
  />

  <!-- SAGA ring -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRingRadius}
    fill="none"
    stroke={accentColor}
    stroke-width="2"
    opacity="0.4"
  />

  <!-- SAGA label on ring -->
  <text
    x={centerX}
    y={centerY - sagaRingRadius - 8}
    text-anchor="middle"
    font-size="10"
    fill={accentColor}
    opacity="0.7"
    font-weight="600"
  >
    SAGA
  </text>

  <!-- Inner glow (activity) -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRingRadius - 10}
    fill={accentColor}
    opacity={0.05 + sagaActivity * 0.15}
    filter="url(#centerGlow2)"
  />

  <!-- YOUR PORTFOLIO at center -->
  <circle
    cx={centerX}
    cy={centerY}
    r={portfolioRadius}
    fill="#0a0a0f"
    stroke="#fff"
    stroke-width="2"
    opacity="1"
  />

  <circle
    cx={centerX}
    cy={centerY}
    r={portfolioRadius - 6}
    fill="#fff"
    opacity={0.1 + sagaActivity * 0.15 + Math.sin(centerPulse * 1.5) * 0.03}
  />

  <circle
    cx={centerX}
    cy={centerY}
    r={portfolioRadius * 0.4}
    fill="#fff"
    opacity={0.4 + sagaActivity * 0.3}
  />

  <!-- "YOU" label -->
  <text
    x={centerX}
    y={centerY + 4}
    text-anchor="middle"
    font-size="11"
    fill="#fff"
    font-weight="700"
    opacity="0.95"
  >
    YOU
  </text>

  <text
    x={centerX}
    y={centerY + portfolioRadius + 16}
    text-anchor="middle"
    font-size="8"
    fill="#fff"
    opacity="0.4"
    font-weight="500"
  >
    YOUR JUDGMENT
  </text>
</svg>

<style>
  .watchful-network-animation {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
