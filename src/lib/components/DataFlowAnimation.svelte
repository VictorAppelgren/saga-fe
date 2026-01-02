<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 400;
  export let height = 300;
  export let accentColor = '#2563eb';

  interface DataPacket {
    id: number;
    x: number;
    y: number;
    speed: number;
    size: number;
    lane: number;
    type: 'news' | 'filing' | 'trade' | 'policy' | 'earnings';
  }

  interface ProcessingNode {
    x: number;
    y: number;
    label: string;
    activity: number;
  }

  const sourceLabels = ['News', 'SEC', 'Trade', 'Policy', 'Earnings'];
  const laneCount = 5;
  const laneHeight = (height - 60) / laneCount;

  let packets: DataPacket[] = [];
  let processingNodes: ProcessingNode[] = [];
  let animationFrame: number;
  let packetId = 0;

  // Processing zone on the right
  const processZoneX = width - 80;

  onMount(() => {
    // Initialize processing nodes (where data gets analyzed)
    processingNodes = [
      { x: processZoneX, y: 50, label: 'Analyze', activity: 0.3 },
      { x: processZoneX + 30, y: height / 2, label: 'Map', activity: 0.3 },
      { x: processZoneX, y: height - 50, label: 'Alert', activity: 0.3 }
    ];

    // Spawn packets
    const spawnInterval = setInterval(() => {
      const numToSpawn = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numToSpawn; i++) {
        const lane = Math.floor(Math.random() * laneCount);
        const types: DataPacket['type'][] = ['news', 'filing', 'trade', 'policy', 'earnings'];
        packets = [...packets, {
          id: packetId++,
          x: -20 - Math.random() * 40,
          y: 30 + lane * laneHeight + laneHeight / 2,
          speed: 2 + Math.random() * 2.5,
          size: 3 + Math.random() * 3,
          lane,
          type: types[lane]
        }];
      }
    }, 120);

    const animate = () => {
      // Move packets
      packets = packets
        .map(p => ({ ...p, x: p.x + p.speed }))
        .filter(p => p.x < width + 30);

      // Update processing node activity based on nearby packets
      processingNodes = processingNodes.map(node => {
        const nearbyPackets = packets.filter(p =>
          Math.abs(p.x - node.x) < 40 && Math.abs(p.y - node.y) < 60
        );
        return {
          ...node,
          activity: nearbyPackets.length > 0
            ? Math.min(1, node.activity + 0.15)
            : Math.max(0.3, node.activity * 0.95)
        };
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(spawnInterval);
    };
  });

  function getPacketColor(type: DataPacket['type']): string {
    return accentColor; // Keep unified color, vary by opacity/size
  }
</script>

<svg
  class="data-flow-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="dataPacketGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <linearGradient id="laneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.1" />
      <stop offset="80%" stop-color={accentColor} stop-opacity="0.3" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.1" />
    </linearGradient>

    <linearGradient id="packetTrail" x1="100%" y1="0%" x2="0%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.8" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </linearGradient>
  </defs>

  <!-- Source labels on left -->
  {#each sourceLabels as label, i}
    <text
      x="8"
      y={30 + i * laneHeight + laneHeight / 2 + 3}
      font-size="8"
      fill={accentColor}
      opacity="0.6"
      font-weight="500"
    >
      {label}
    </text>
  {/each}

  <!-- Lane lines -->
  {#each Array(laneCount) as _, i}
    <line
      x1="50"
      y1={30 + i * laneHeight + laneHeight / 2}
      x2={processZoneX - 20}
      y2={30 + i * laneHeight + laneHeight / 2}
      stroke={accentColor}
      stroke-width="1"
      opacity="0.15"
      stroke-dasharray="4 4"
    />
  {/each}

  <!-- Processing zone background -->
  <rect
    x={processZoneX - 30}
    y="20"
    width="90"
    height={height - 40}
    rx="8"
    fill={accentColor}
    opacity="0.05"
  />

  <!-- Data packets with trails -->
  {#each packets as packet}
    <!-- Trail -->
    <ellipse
      cx={packet.x - packet.size * 3}
      cy={packet.y}
      rx={packet.size * 5}
      ry={packet.size * 0.5}
      fill="url(#packetTrail)"
      opacity="0.4"
    />
    <!-- Main packet -->
    <circle
      cx={packet.x}
      cy={packet.y}
      r={packet.size}
      fill={accentColor}
      filter="url(#dataPacketGlow)"
      opacity="0.9"
    />
    <!-- Bright core -->
    <circle
      cx={packet.x}
      cy={packet.y}
      r={packet.size * 0.4}
      fill="white"
      opacity="0.8"
    />
  {/each}

  <!-- Processing nodes -->
  {#each processingNodes as node}
    <!-- Glow -->
    <circle
      cx={node.x}
      cy={node.y}
      r={18 * node.activity}
      fill={accentColor}
      opacity={node.activity * 0.3}
    />
    <!-- Main node -->
    <circle
      cx={node.x}
      cy={node.y}
      r="10"
      fill={accentColor}
      opacity={0.5 + node.activity * 0.4}
    />
    <!-- Core -->
    <circle
      cx={node.x}
      cy={node.y}
      r="4"
      fill="white"
      opacity={0.6 + node.activity * 0.3}
    />
    <!-- Label -->
    <text
      x={node.x}
      y={node.y + 20}
      text-anchor="middle"
      font-size="8"
      fill={accentColor}
      opacity="0.7"
      font-weight="500"
    >
      {node.label}
    </text>
  {/each}

  <!-- "Saga" output indicator -->
  <text
    x={width - 25}
    y={height / 2}
    font-size="10"
    fill={accentColor}
    opacity="0.8"
    font-weight="600"
    text-anchor="middle"
    transform="rotate(90, {width - 25}, {height / 2})"
  >
    SAGA
  </text>
</svg>

<style>
  .data-flow-animation {
    display: block;
  }
</style>
