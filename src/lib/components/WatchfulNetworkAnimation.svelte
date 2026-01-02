<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 700;
  export let height = 420;
  export let accentColor = '#2563eb';

  // THE STORY: Continuous multi-agent intelligence
  // Agents independently detect signals, communicate to SAGA, insights synthesized
  // No synchronized phases - organic, continuous flow

  interface Agent {
    id: number;
    x: number;
    y: number;
    sector: string;
    scanAngle: number;
    scanSpeed: number;
    alertLevel: number; // 0 = idle, 0-1 = detecting, decays over time
    lastSignalTime: number;
    pulsePhase: number;
  }

  interface DataStream {
    id: number;
    fromAgent: number;
    progress: number; // 0-1 traveling to SAGA
    color: string;
    size: number;
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
  let sagaPulse = 0;
  let sagaActivity = 0; // How many streams recently arrived

  const centerX = width / 2;
  const centerY = height / 2;
  const sagaRadius = 45; // Larger SAGA node
  const agentOrbitRadius = Math.min(width, height) * 0.38;

  const sectors = [
    { name: 'Policy', color: '#8b5cf6', angle: -Math.PI / 2 },
    { name: 'Supply', color: '#f59e0b', angle: -Math.PI / 6 },
    { name: 'Markets', color: '#ef4444', angle: Math.PI / 6 },
    { name: 'Credit', color: '#ec4899', angle: Math.PI / 2 },
    { name: 'Macro', color: '#06b6d4', angle: (5 * Math.PI) / 6 },
    { name: 'Geo', color: '#22c55e', angle: (-5 * Math.PI) / 6 },
  ];

  onMount(() => {
    // Create agents - 2-3 per sector, slightly offset positions
    agents = [];
    let agentId = 0;

    sectors.forEach((sector, sectorIdx) => {
      const agentCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < agentCount; i++) {
        const angleOffset = (i - (agentCount - 1) / 2) * 0.25;
        const radiusOffset = (i % 2 === 0 ? -15 : 15) + Math.random() * 10;
        const baseAngle = sector.angle + angleOffset;

        agents.push({
          id: agentId++,
          x: centerX + Math.cos(baseAngle) * (agentOrbitRadius + radiusOffset),
          y: centerY + Math.sin(baseAngle) * (agentOrbitRadius + radiusOffset),
          sector: sector.name,
          scanAngle: Math.random() * Math.PI * 2,
          scanSpeed: 0.02 + Math.random() * 0.02,
          alertLevel: 0,
          lastSignalTime: -1000,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    });

    const animate = () => {
      time++;
      sagaPulse += 0.04;

      // Decay SAGA activity
      sagaActivity = Math.max(0, sagaActivity - 0.01);

      // Update each agent independently
      agents = agents.map(agent => {
        let newAlertLevel = agent.alertLevel;
        let newLastSignalTime = agent.lastSignalTime;

        // Scan rotation
        const newScanAngle = agent.scanAngle + agent.scanSpeed;

        // Random chance to detect a signal (independent per agent)
        const timeSinceLastSignal = time - agent.lastSignalTime;
        if (timeSinceLastSignal > 120 && Math.random() < 0.008) {
          // Agent detects something!
          newAlertLevel = 0.8 + Math.random() * 0.2;
          newLastSignalTime = time;

          // Create visual signal ripple
          const sectorData = sectors.find(s => s.name === agent.sector);
          signals = [...signals, {
            id: signalId++,
            x: agent.x,
            y: agent.y,
            radius: 8,
            opacity: 0.8,
            color: sectorData?.color || accentColor,
          }];

          // Send data stream to SAGA
          dataStreams = [...dataStreams, {
            id: streamId++,
            fromAgent: agent.id,
            progress: 0,
            color: sectorData?.color || accentColor,
            size: 3 + Math.random() * 2,
          }];
        }

        // Decay alert level
        newAlertLevel = Math.max(0, newAlertLevel - 0.008);

        return {
          ...agent,
          scanAngle: newScanAngle,
          alertLevel: newAlertLevel,
          lastSignalTime: newLastSignalTime,
          pulsePhase: agent.pulsePhase + 0.05,
        };
      });

      // Animate data streams traveling to SAGA
      dataStreams = dataStreams.map(stream => {
        const newProgress = stream.progress + 0.015;

        // When stream reaches SAGA, boost activity
        if (stream.progress < 1 && newProgress >= 1) {
          sagaActivity = Math.min(1, sagaActivity + 0.3);
        }

        return { ...stream, progress: newProgress };
      }).filter(s => s.progress < 1.1);

      // Animate signal ripples
      signals = signals
        .map(s => ({ ...s, radius: s.radius + 1.5, opacity: s.opacity - 0.025 }))
        .filter(s => s.opacity > 0);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });

  function getSectorColor(sectorName: string): string {
    return sectors.find(s => s.name === sectorName)?.color || accentColor;
  }
</script>

<svg
  class="watchful-network-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="agentGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <filter id="sagaCoreGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>

    <radialGradient id="sagaGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.2" />
      <stop offset="70%" stop-color={accentColor} stop-opacity="0.05" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Dark background -->
  <rect x="0" y="0" width={width} height={height} fill="#0a0a0f" />

  <!-- Subtle orbital rings -->
  {#each [0.6, 0.8, 1.0] as ratio}
    <circle
      cx={centerX}
      cy={centerY}
      r={agentOrbitRadius * ratio}
      fill="none"
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.06"
    />
  {/each}

  <!-- Sector divider lines (subtle) -->
  {#each sectors as sector}
    <line
      x1={centerX}
      y1={centerY}
      x2={centerX + Math.cos(sector.angle) * (agentOrbitRadius + 50)}
      y2={centerY + Math.sin(sector.angle) * (agentOrbitRadius + 50)}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.05"
      stroke-dasharray="4 8"
    />
  {/each}

  <!-- Sector labels -->
  {#each sectors as sector}
    <text
      x={centerX + Math.cos(sector.angle) * (agentOrbitRadius + 35)}
      y={centerY + Math.sin(sector.angle) * (agentOrbitRadius + 35)}
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="9"
      fill={sector.color}
      opacity="0.5"
      font-weight="600"
    >
      {sector.name.toUpperCase()}
    </text>
  {/each}

  <!-- Connection lines from agents to SAGA (faint background) -->
  {#each agents as agent}
    <line
      x1={agent.x}
      y1={agent.y}
      x2={centerX}
      y2={centerY}
      stroke={accentColor}
      stroke-width="0.5"
      opacity={0.03 + agent.alertLevel * 0.05}
    />
  {/each}

  <!-- Data streams traveling to SAGA -->
  {#each dataStreams as stream}
    {@const agent = agents.find(a => a.id === stream.fromAgent)}
    {#if agent}
      {@const px = agent.x + (centerX - agent.x) * stream.progress}
      {@const py = agent.y + (centerY - agent.y) * stream.progress}

      <!-- Trail -->
      <line
        x1={agent.x}
        y1={agent.y}
        x2={px}
        y2={py}
        stroke={stream.color}
        stroke-width="1.5"
        opacity={0.4 * (1 - stream.progress * 0.5)}
      />

      <!-- Traveling packet -->
      <circle
        cx={px}
        cy={py}
        r={stream.size}
        fill={stream.color}
        opacity={0.9}
        filter="url(#agentGlow)"
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
    {@const color = getSectorColor(agent.sector)}
    {@const isAlerted = agent.alertLevel > 0.1}
    {@const agentSize = 14}

    <!-- Scan arc (when not alerted) -->
    {#if !isAlerted}
      <path
        d="M {agent.x} {agent.y}
           L {agent.x + Math.cos(agent.scanAngle) * 28} {agent.y + Math.sin(agent.scanAngle) * 28}
           A 28 28 0 0 1 {agent.x + Math.cos(agent.scanAngle + 0.6) * 28} {agent.y + Math.sin(agent.scanAngle + 0.6) * 28}
           Z"
        fill={color}
        opacity="0.1"
      />
      <line
        x1={agent.x}
        y1={agent.y}
        x2={agent.x + Math.cos(agent.scanAngle) * 28}
        y2={agent.y + Math.sin(agent.scanAngle) * 28}
        stroke={color}
        stroke-width="1"
        opacity="0.3"
      />
    {/if}

    <!-- Alert glow -->
    {#if isAlerted}
      <circle
        cx={agent.x}
        cy={agent.y}
        r={agentSize * 2}
        fill={color}
        opacity={agent.alertLevel * 0.4}
        filter="url(#agentGlow)"
      />
    {/if}

    <!-- Agent body -->
    <circle
      cx={agent.x}
      cy={agent.y}
      r={agentSize}
      fill="#0a0a0f"
      stroke={color}
      stroke-width={isAlerted ? 2 : 1}
      opacity={0.6 + agent.alertLevel * 0.4}
    />

    <!-- Inner eye -->
    <circle
      cx={agent.x}
      cy={agent.y}
      r={agentSize * 0.55}
      fill={color}
      opacity={0.3 + agent.alertLevel * 0.5 + Math.sin(agent.pulsePhase) * 0.1}
    />

    <!-- Pupil (looks toward scan direction or center when alerted) -->
    {@const lookAngle = isAlerted ? Math.atan2(centerY - agent.y, centerX - agent.x) : agent.scanAngle}
    <circle
      cx={agent.x + Math.cos(lookAngle) * 3}
      cy={agent.y + Math.sin(lookAngle) * 3}
      r="2.5"
      fill={isAlerted ? '#fff' : color}
      opacity={0.7 + agent.alertLevel * 0.3}
    />
  {/each}

  <!-- Central SAGA hub - LARGER -->
  <!-- Outer glow ring -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRadius * 2}
    fill="url(#sagaGradient)"
  />

  <!-- Activity pulse rings -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRadius + 15 + Math.sin(sagaPulse) * 5 + sagaActivity * 10}
    fill="none"
    stroke={accentColor}
    stroke-width="1"
    opacity={0.15 + sagaActivity * 0.2}
  />
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRadius + 30 + Math.sin(sagaPulse * 0.7) * 8 + sagaActivity * 15}
    fill="none"
    stroke={accentColor}
    stroke-width="0.5"
    opacity={0.08 + sagaActivity * 0.1}
  />

  <!-- SAGA core -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRadius}
    fill="#0a0a0f"
    stroke={accentColor}
    stroke-width="2"
    opacity="0.95"
  />

  <!-- SAGA inner glow (activity indicator) -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRadius - 8}
    fill={accentColor}
    opacity={0.15 + sagaActivity * 0.25 + Math.sin(sagaPulse * 2) * 0.05}
  />

  <!-- SAGA bright core -->
  <circle
    cx={centerX}
    cy={centerY}
    r={sagaRadius * 0.4}
    fill={accentColor}
    opacity={0.4 + sagaActivity * 0.4}
    filter="url(#sagaCoreGlow)"
  />

  <!-- SAGA label -->
  <text
    x={centerX}
    y={centerY + 4}
    text-anchor="middle"
    font-size="14"
    fill="#fff"
    font-weight="700"
    opacity="0.95"
  >
    SAGA
  </text>
</svg>

<style>
  .watchful-network-animation {
    display: block;
  }
</style>
