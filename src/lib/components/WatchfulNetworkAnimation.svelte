<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 700;
  export let height = 420;
  export let accentColor = '#2563eb';

  // THE STORY: Thousands of AI agents watching, scanning, connecting
  // Independent agents detect signals -> They find correlations -> Synthesis happens -> Intelligence emerges

  interface Agent {
    id: number;
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    angle: number;
    scanRadius: number;
    scanAngle: number;
    sector: string;
    status: 'scanning' | 'alert' | 'connecting';
    signalStrength: number;
    pulsePhase: number;
  }

  interface Connection {
    from: number;
    to: number;
    strength: number;
    active: boolean;
    progress: number;
    dataPackets: { position: number; size: number }[];
  }

  interface Signal {
    id: number;
    x: number;
    y: number;
    radius: number;
    opacity: number;
    agentId: number;
  }

  interface InsightBurst {
    x: number;
    y: number;
    radius: number;
    opacity: number;
  }

  let agents: Agent[] = [];
  let connections: Connection[] = [];
  let signals: Signal[] = [];
  let insightBursts: InsightBurst[] = [];
  let animationFrame: number;
  let time = 0;
  let signalId = 0;
  let centralPulse = 0;
  let insightPhase = 0; // 0 = scanning, 1 = detecting, 2 = connecting, 3 = insight

  const sectors = [
    { name: 'Policy', angle: 0 },
    { name: 'Supply', angle: Math.PI / 3 },
    { name: 'Markets', angle: (2 * Math.PI) / 3 },
    { name: 'Credit', angle: Math.PI },
    { name: 'Macro', angle: (4 * Math.PI) / 3 },
    { name: 'Geo', angle: (5 * Math.PI) / 3 },
  ];

  const centerX = width / 2;
  const centerY = height / 2;
  const orbitRadius = Math.min(width, height) * 0.32;

  onMount(() => {
    // Create agents in orbital positions around sectors
    agents = [];
    let agentId = 0;

    sectors.forEach((sector, sectorIdx) => {
      // 3 agents per sector at slightly different radii
      for (let i = 0; i < 3; i++) {
        const angleOffset = (i - 1) * 0.2;
        const radiusOffset = (i - 1) * 20;
        const x = centerX + Math.cos(sector.angle + angleOffset) * (orbitRadius + radiusOffset);
        const y = centerY + Math.sin(sector.angle + angleOffset) * (orbitRadius + radiusOffset);

        agents.push({
          id: agentId++,
          x,
          y,
          baseX: x,
          baseY: y,
          angle: sector.angle,
          scanRadius: 30 + Math.random() * 20,
          scanAngle: Math.random() * Math.PI * 2,
          sector: sector.name,
          status: 'scanning',
          signalStrength: 0,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    });

    // Create potential connections between agents
    connections = [];
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        // Connect agents from different sectors
        if (agents[i].sector !== agents[j].sector) {
          if (Math.random() < 0.15) {
            connections.push({
              from: i,
              to: j,
              strength: 0.3 + Math.random() * 0.4,
              active: false,
              progress: 0,
              dataPackets: [],
            });
          }
        }
      }
    }

    const animate = () => {
      time++;

      // Cycle through phases
      const cycleDuration = 600; // 10 seconds
      const cycleTime = time % cycleDuration;

      if (cycleTime < 200) {
        insightPhase = 0; // Scanning
      } else if (cycleTime < 350) {
        insightPhase = 1; // Detecting
      } else if (cycleTime < 500) {
        insightPhase = 2; // Connecting
      } else {
        insightPhase = 3; // Insight burst
      }

      // Update central pulse
      centralPulse = (centralPulse + 0.03) % (Math.PI * 2);

      // Animate agents
      agents = agents.map((agent) => {
        // Gentle floating motion
        const floatX = Math.sin(time * 0.02 + agent.id * 0.5) * 3;
        const floatY = Math.cos(time * 0.025 + agent.id * 0.7) * 3;

        // Update scan angle
        const newScanAngle = agent.scanAngle + 0.03;

        // Update pulse
        const newPulsePhase = agent.pulsePhase + 0.05;

        // Status based on phase
        let newStatus = agent.status;
        let newSignalStrength = agent.signalStrength;

        if (insightPhase === 0) {
          newStatus = 'scanning';
          newSignalStrength = Math.max(0, agent.signalStrength - 0.02);
        } else if (insightPhase === 1) {
          // Random agents detect signals
          if (Math.random() < 0.02 && agent.signalStrength < 0.5) {
            newStatus = 'alert';
            newSignalStrength = Math.min(1, agent.signalStrength + 0.3);

            // Emit signal
            signals = [
              ...signals,
              {
                id: signalId++,
                x: agent.baseX + floatX,
                y: agent.baseY + floatY,
                radius: 5,
                opacity: 0.8,
                agentId: agent.id,
              },
            ];
          }
        } else if (insightPhase === 2) {
          if (agent.signalStrength > 0.3) {
            newStatus = 'connecting';
          }
        } else if (insightPhase === 3) {
          newStatus = 'scanning';
          newSignalStrength = Math.max(0, agent.signalStrength - 0.03);
        }

        return {
          ...agent,
          x: agent.baseX + floatX,
          y: agent.baseY + floatY,
          scanAngle: newScanAngle,
          pulsePhase: newPulsePhase,
          status: newStatus,
          signalStrength: newSignalStrength,
        };
      });

      // Animate connections
      connections = connections.map((conn) => {
        const fromAgent = agents[conn.from];
        const toAgent = agents[conn.to];

        let newActive = conn.active;
        let newProgress = conn.progress;
        let newPackets = [...conn.dataPackets];

        // Activate connections during connecting phase
        if (insightPhase >= 2) {
          if (fromAgent.signalStrength > 0.3 && toAgent.signalStrength > 0.3) {
            newActive = true;
          }
        } else {
          newActive = false;
        }

        // Animate progress
        if (newActive && newProgress < 1) {
          newProgress = Math.min(1, newProgress + 0.02);
        } else if (!newActive && newProgress > 0) {
          newProgress = Math.max(0, newProgress - 0.03);
        }

        // Spawn data packets on active connections
        if (newActive && newProgress > 0.5 && Math.random() < 0.05) {
          newPackets.push({ position: 0, size: 2 + Math.random() * 2 });
        }

        // Animate packets
        newPackets = newPackets
          .map((p) => ({ ...p, position: p.position + 0.02 }))
          .filter((p) => p.position < 1);

        return {
          ...conn,
          active: newActive,
          progress: newProgress,
          dataPackets: newPackets,
        };
      });

      // Animate signals
      signals = signals
        .map((s) => ({
          ...s,
          radius: s.radius + 1,
          opacity: Math.max(0, s.opacity - 0.015),
        }))
        .filter((s) => s.opacity > 0);

      // Create insight burst at center during insight phase
      if (insightPhase === 3 && time % 30 === 0) {
        insightBursts = [
          ...insightBursts,
          {
            x: centerX,
            y: centerY,
            radius: 10,
            opacity: 0.9,
          },
        ];
      }

      // Animate insight bursts
      insightBursts = insightBursts
        .map((b) => ({
          ...b,
          radius: b.radius + 2,
          opacity: Math.max(0, b.opacity - 0.01),
        }))
        .filter((b) => b.opacity > 0);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });

  function getStatusColor(status: string, strength: number): string {
    if (status === 'alert') return '#ef4444';
    if (status === 'connecting') return '#22c55e';
    return accentColor;
  }
</script>

<svg
  class="watchful-network-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="watchGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="insightGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.15" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </radialGradient>

    <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={accentColor} />
      <stop offset="50%" stop-color="#22c55e" />
      <stop offset="100%" stop-color={accentColor} />
    </linearGradient>
  </defs>

  <!-- Dark background -->
  <rect x="0" y="0" width={width} height={height} fill="#0a0a0f" />

  <!-- Subtle radial grid -->
  {#each [0.3, 0.5, 0.7, 0.9] as ratio}
    <circle
      cx={centerX}
      cy={centerY}
      r={orbitRadius * ratio * 1.5}
      fill="none"
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.08"
    />
  {/each}

  <!-- Sector lines -->
  {#each sectors as sector}
    <line
      x1={centerX}
      y1={centerY}
      x2={centerX + Math.cos(sector.angle) * orbitRadius * 1.4}
      y2={centerY + Math.sin(sector.angle) * orbitRadius * 1.4}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.1"
      stroke-dasharray="4 4"
    />
    <text
      x={centerX + Math.cos(sector.angle) * (orbitRadius * 1.25)}
      y={centerY + Math.sin(sector.angle) * (orbitRadius * 1.25)}
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="9"
      fill={accentColor}
      opacity="0.4"
      font-weight="600"
    >
      {sector.name.toUpperCase()}
    </text>
  {/each}

  <!-- Central SAGA hub -->
  <circle cx={centerX} cy={centerY} r={orbitRadius * 0.3} fill="url(#centerGradient)" />

  <!-- Central pulsing rings -->
  <circle
    cx={centerX}
    cy={centerY}
    r={30 + Math.sin(centralPulse) * 5}
    fill="none"
    stroke={insightPhase === 3 ? '#22c55e' : accentColor}
    stroke-width="2"
    opacity={0.3 + Math.sin(centralPulse) * 0.1}
  />
  <circle
    cx={centerX}
    cy={centerY}
    r={45 + Math.sin(centralPulse * 0.8) * 8}
    fill="none"
    stroke={insightPhase === 3 ? '#22c55e' : accentColor}
    stroke-width="1"
    opacity={0.15 + Math.sin(centralPulse) * 0.05}
  />

  <!-- Insight bursts -->
  {#each insightBursts as burst}
    <circle
      cx={burst.x}
      cy={burst.y}
      r={burst.radius}
      fill="none"
      stroke="#22c55e"
      stroke-width="3"
      opacity={burst.opacity}
      filter="url(#insightGlow)"
    />
    <circle
      cx={burst.x}
      cy={burst.y}
      r={burst.radius * 0.7}
      fill="none"
      stroke="#22c55e"
      stroke-width="1.5"
      opacity={burst.opacity * 0.7}
    />
  {/each}

  <!-- Agent connections -->
  {#each connections as conn}
    {@const from = agents[conn.from]}
    {@const to = agents[conn.to]}
    {#if from && to && conn.progress > 0}
      <!-- Connection line -->
      <line
        x1={from.x}
        y1={from.y}
        x2={from.x + (to.x - from.x) * conn.progress}
        y2={from.y + (to.y - from.y) * conn.progress}
        stroke="#22c55e"
        stroke-width="1.5"
        opacity={conn.progress * 0.5}
      />

      <!-- Data packets traveling -->
      {#each conn.dataPackets as packet}
        <circle
          cx={from.x + (to.x - from.x) * packet.position}
          cy={from.y + (to.y - from.y) * packet.position}
          r={packet.size}
          fill="#22c55e"
          opacity="0.8"
        />
      {/each}
    {/if}
  {/each}

  <!-- Signal ripples -->
  {#each signals as signal}
    <circle
      cx={signal.x}
      cy={signal.y}
      r={signal.radius}
      fill="none"
      stroke="#ef4444"
      stroke-width="2"
      opacity={signal.opacity}
    />
  {/each}

  <!-- AI Agents -->
  {#each agents as agent}
    {@const color = getStatusColor(agent.status, agent.signalStrength)}
    {@const isActive = agent.status !== 'scanning'}
    {@const agentSize = 12}

    <!-- Scan arc -->
    {#if agent.status === 'scanning'}
      <path
        d="M {agent.x} {agent.y}
           L {agent.x + Math.cos(agent.scanAngle) * agent.scanRadius} {agent.y + Math.sin(agent.scanAngle) * agent.scanRadius}
           A {agent.scanRadius} {agent.scanRadius} 0 0 1 {agent.x + Math.cos(agent.scanAngle + 0.8) * agent.scanRadius} {agent.y + Math.sin(agent.scanAngle + 0.8) * agent.scanRadius}
           Z"
        fill={accentColor}
        opacity="0.08"
      />
      <line
        x1={agent.x}
        y1={agent.y}
        x2={agent.x + Math.cos(agent.scanAngle) * agent.scanRadius}
        y2={agent.y + Math.sin(agent.scanAngle) * agent.scanRadius}
        stroke={accentColor}
        stroke-width="1"
        opacity="0.3"
      />
    {/if}

    <!-- Agent glow when active -->
    {#if isActive}
      <circle
        cx={agent.x}
        cy={agent.y}
        r={agentSize * 2}
        fill={color}
        opacity={agent.signalStrength * 0.3}
        filter="url(#watchGlow)"
      />
    {/if}

    <!-- Agent body (hexagonal eye shape) -->
    <circle
      cx={agent.x}
      cy={agent.y}
      r={agentSize}
      fill="#0a0a0f"
      stroke={color}
      stroke-width={isActive ? 2 : 1}
      opacity={isActive ? 1 : 0.5}
    />

    <!-- Inner "eye" -->
    <circle
      cx={agent.x}
      cy={agent.y}
      r={agentSize * 0.5}
      fill={color}
      opacity={isActive ? 0.7 + Math.sin(agent.pulsePhase) * 0.3 : 0.2}
    />

    <!-- Pupil that looks toward scan direction -->
    <circle
      cx={agent.x + Math.cos(agent.scanAngle) * 2}
      cy={agent.y + Math.sin(agent.scanAngle) * 2}
      r="2"
      fill={isActive ? '#fff' : color}
      opacity={isActive ? 0.9 : 0.4}
    />

    <!-- Connection line to center when connecting -->
    {#if agent.status === 'connecting'}
      <line
        x1={agent.x}
        y1={agent.y}
        x2={centerX}
        y2={centerY}
        stroke="#22c55e"
        stroke-width="1"
        opacity="0.2"
        stroke-dasharray="4 4"
      />
    {/if}
  {/each}

  <!-- Central SAGA core -->
  <circle
    cx={centerX}
    cy={centerY}
    r="20"
    fill="#0a0a0f"
    stroke={insightPhase === 3 ? '#22c55e' : accentColor}
    stroke-width="2"
    opacity="0.9"
  />
  <circle
    cx={centerX}
    cy={centerY}
    r="12"
    fill={insightPhase === 3 ? '#22c55e' : accentColor}
    opacity={insightPhase === 3 ? 0.5 + Math.sin(centralPulse * 2) * 0.3 : 0.3}
  />
  <text
    x={centerX}
    y={centerY + 3}
    text-anchor="middle"
    font-size="8"
    fill="#fff"
    font-weight="700"
    opacity="0.9"
  >
    SAGA
  </text>

  <!-- Phase indicator -->
  <text
    x={width / 2}
    y="25"
    text-anchor="middle"
    font-size="10"
    fill={insightPhase === 3 ? '#22c55e' : insightPhase >= 1 ? '#ef4444' : accentColor}
    opacity="0.8"
    font-weight="600"
  >
    {#if insightPhase === 0}
      AGENTS SCANNING...
    {:else if insightPhase === 1}
      SIGNALS DETECTED
    {:else if insightPhase === 2}
      CORRELATIONS FOUND
    {:else}
      INSIGHT SYNTHESIZED
    {/if}
  </text>

  <!-- Status bar -->
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
    width={(width - 100) * ((time % 600) / 600)}
    height="4"
    rx="2"
    fill={insightPhase === 3 ? '#22c55e' : insightPhase >= 1 ? '#ef4444' : accentColor}
    opacity="0.7"
  />

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
    THOUSANDS OF AI AGENTS — EVERY ANGLE CHECKED — NOTHING MISSED
  </text>
</svg>

<style>
  .watchful-network-animation {
    display: block;
  }
</style>
