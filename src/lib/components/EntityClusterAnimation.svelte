<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 400;
  export let height = 280;
  export let accentColor = '#2563eb';

  interface Entity {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    label: string;
    cluster: number;
  }

  interface ClusterConnection {
    from: number;
    to: number;
    strength: number;
  }

  let entities: Entity[] = [];
  let connections: ClusterConnection[] = [];
  let animationFrame: number;

  const clusterCenters = [
    { x: width * 0.25, y: height * 0.35 },
    { x: width * 0.75, y: height * 0.35 },
    { x: width * 0.5, y: height * 0.7 }
  ];

  const clusterLabels = ['Supply Chain', 'Policy Risk', 'Market Impact'];

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  onMount(() => {
    // Create entities in clusters
    const entityLabels = [
      ['TSMC', 'Apple', 'Samsung', 'Intel'],
      ['Fed', 'ECB', 'BOJ', 'Tariff'],
      ['S&P', 'VIX', 'Yield', 'DXY']
    ];

    entities = [];
    let id = 0;
    clusterCenters.forEach((center, clusterIdx) => {
      entityLabels[clusterIdx].forEach((label, i) => {
        const angle = (i / entityLabels[clusterIdx].length) * Math.PI * 2 + seededRandom(id * 7);
        const dist = 30 + seededRandom(id * 13) * 25;
        entities.push({
          id: id++,
          x: center.x + Math.cos(angle) * dist,
          y: center.y + Math.sin(angle) * dist,
          vx: (seededRandom(id * 17) - 0.5) * 0.3,
          vy: (seededRandom(id * 23) - 0.5) * 0.3,
          size: 6 + seededRandom(id * 31) * 4,
          label,
          cluster: clusterIdx
        });
      });
    });

    // Create connections within clusters
    connections = [];
    entities.forEach((e1, i) => {
      entities.forEach((e2, j) => {
        if (i < j && e1.cluster === e2.cluster) {
          connections.push({
            from: i,
            to: j,
            strength: 0.4 + seededRandom(i * 50 + j) * 0.4
          });
        }
      });
    });

    // Add some cross-cluster connections
    connections.push({ from: 0, to: 4, strength: 0.3 });
    connections.push({ from: 3, to: 8, strength: 0.25 });
    connections.push({ from: 5, to: 10, strength: 0.35 });

    const animate = () => {
      // Move entities with gentle floating motion
      entities = entities.map(e => {
        const center = clusterCenters[e.cluster];
        const dx = center.x - e.x;
        const dy = center.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Pull toward cluster center if too far
        let ax = 0, ay = 0;
        if (dist > 60) {
          ax = dx * 0.001;
          ay = dy * 0.001;
        }

        // Add slight random motion
        ax += (Math.random() - 0.5) * 0.02;
        ay += (Math.random() - 0.5) * 0.02;

        let newVx = (e.vx + ax) * 0.98;
        let newVy = (e.vy + ay) * 0.98;

        return {
          ...e,
          x: e.x + newVx,
          y: e.y + newVy,
          vx: newVx,
          vy: newVy
        };
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });
</script>

<svg
  class="entity-cluster-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="clusterGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Cluster backgrounds -->
  {#each clusterCenters as center, i}
    <circle
      cx={center.x}
      cy={center.y}
      r="70"
      fill={accentColor}
      opacity="0.04"
    />
    <text
      x={center.x}
      y={center.y - 55}
      text-anchor="middle"
      font-size="9"
      fill={accentColor}
      opacity="0.5"
      font-weight="600"
    >
      {clusterLabels[i]}
    </text>
  {/each}

  <!-- Connections -->
  {#each connections as conn}
    {@const from = entities[conn.from]}
    {@const to = entities[conn.to]}
    {@const isCrossCluster = from.cluster !== to.cluster}
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={accentColor}
      stroke-width={isCrossCluster ? 1.5 : 1}
      opacity={isCrossCluster ? conn.strength * 0.8 : conn.strength * 0.4}
      stroke-dasharray={isCrossCluster ? "4 3" : "none"}
    />
  {/each}

  <!-- Entities -->
  {#each entities as entity}
    <!-- Glow -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size * 1.5}
      fill={accentColor}
      opacity="0.2"
    />
    <!-- Main node -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size}
      fill={accentColor}
      opacity="0.7"
      filter="url(#clusterGlow)"
    />
    <!-- Bright center -->
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size * 0.4}
      fill="white"
      opacity="0.7"
    />
    <!-- Label -->
    <text
      x={entity.x}
      y={entity.y + entity.size + 10}
      text-anchor="middle"
      font-size="7"
      fill={accentColor}
      opacity="0.7"
      font-weight="500"
    >
      {entity.label}
    </text>
  {/each}

  <!-- Title -->
  <text
    x={width / 2}
    y={height - 8}
    text-anchor="middle"
    font-size="10"
    fill={accentColor}
    opacity="0.5"
    font-weight="600"
  >
    ENTITY RELATIONSHIPS
  </text>
</svg>

<style>
  .entity-cluster-animation {
    display: block;
  }
</style>
