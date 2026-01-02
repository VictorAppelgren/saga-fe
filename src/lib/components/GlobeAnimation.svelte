<script lang="ts">
  import { onMount } from 'svelte';

  export let size = 400;
  export let accentColor = '#2563eb';

  let rotation = 0;
  let pulsePhase = 0;

  const radius = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;

  // Generate evenly distributed points on a sphere using Fibonacci spiral
  // This guarantees even distribution regardless of rotation
  const nodeCount = 55;

  function generateFibonacciSphere(n: number): { x: number; y: number; z: number; size: number }[] {
    const points: { x: number; y: number; z: number; size: number }[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < n; i++) {
      // Fibonacci spiral distribution
      const theta = 2 * Math.PI * i / goldenRatio;
      const phi = Math.acos(1 - 2 * (i + 0.5) / n);

      // Convert to Cartesian (on unit sphere)
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.cos(phi); // Y is up
      const z = Math.sin(phi) * Math.sin(theta);

      // Vary sizes - larger for "major hubs"
      const size = 2 + Math.random() * 2.5;

      points.push({ x, y, z, size });
    }
    return points;
  }

  const baseNodes = generateFibonacciSphere(nodeCount);

  // Generate connections - connect nearby nodes
  function generateConnections(): [number, number][] {
    const conns: [number, number][] = [];
    const maxDist = 0.7; // Connection distance threshold on unit sphere

    for (let i = 0; i < baseNodes.length; i++) {
      for (let j = i + 1; j < baseNodes.length; j++) {
        const dx = baseNodes[i].x - baseNodes[j].x;
        const dy = baseNodes[i].y - baseNodes[j].y;
        const dz = baseNodes[i].z - baseNodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDist) {
          conns.push([i, j]);
        }
      }
    }
    return conns;
  }

  const connections = generateConnections();

  // Apply rotation and project nodes
  function getRotatedNode(node: { x: number; y: number; z: number; size: number }, rotAngle: number) {
    const rad = rotAngle * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Rotate around Y axis
    const x = node.x * cos - node.z * sin;
    const z = node.x * sin + node.z * cos;

    return {
      x: x * radius,
      y: node.y * radius,
      z: z * radius,
      size: node.size,
    };
  }

  // Project 3D to 2D
  function project(x: number, y: number, z: number, nodeSize: number) {
    const perspective = 600;
    const scale = perspective / (perspective - z);

    // Front-facing: z > 0 means toward viewer after rotation
    const visible = z > -radius * 0.15;

    return {
      screenX: x * scale + centerX,
      screenY: -y * scale + centerY, // Flip Y so up is up
      z: z,
      visible,
      size: nodeSize,
      // Depth for opacity: 1 at front, lower at back
      depth: Math.max(0.2, (z + radius) / (2 * radius)),
    };
  }

  // Get all projected nodes
  $: projectedNodes = baseNodes.map((node) => {
    const rotated = getRotatedNode(node, rotation);
    return project(rotated.x, rotated.y, rotated.z, rotated.size);
  });

  // Generate globe grid lines using lat/lng
  function latLngTo3D(lat: number, lng: number, r: number) {
    const latRad = lat * (Math.PI / 180);
    const lngRad = (lng + rotation) * (Math.PI / 180);
    return {
      x: r * Math.cos(latRad) * Math.sin(lngRad),
      y: r * Math.sin(latRad),
      z: r * Math.cos(latRad) * Math.cos(lngRad),
    };
  }

  function projectGrid(x: number, y: number, z: number) {
    const perspective = 600;
    const scale = perspective / (perspective - z);
    return {
      x: x * scale + centerX,
      y: -y * scale + centerY,
      visible: z > -radius * 0.15,
    };
  }

  function generateGridLines() {
    const lines: { points: string; opacity: number }[] = [];

    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      let points: string[] = [];
      for (let lng = -180; lng <= 180; lng += 10) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = projectGrid(pos3d.x, pos3d.y, pos3d.z);
        if (proj.visible) {
          points.push(`${proj.x.toFixed(1)},${proj.y.toFixed(1)}`);
        } else if (points.length > 2) {
          lines.push({ points: points.join(' '), opacity: 0.12 });
          points = [];
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.12 });
      }
    }

    // Longitude lines
    for (let lng = -180; lng < 180; lng += 30) {
      let points: string[] = [];
      for (let lat = -90; lat <= 90; lat += 8) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = projectGrid(pos3d.x, pos3d.y, pos3d.z);
        if (proj.visible) {
          points.push(`${proj.x.toFixed(1)},${proj.y.toFixed(1)}`);
        } else if (points.length > 2) {
          lines.push({ points: points.join(' '), opacity: 0.12 });
          points = [];
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.12 });
      }
    }

    return lines;
  }

  $: gridLines = generateGridLines();

  // Traveling data pulses
  let pulses: { connection: number; progress: number }[] = [];

  onMount(() => {
    // Start with Atlantic view
    rotation = 30;

    // Smooth slow rotation
    const rotationInterval = setInterval(() => {
      rotation = (rotation + 0.12) % 360;
    }, 40);

    // Breathing/pulse effect
    const pulseInterval = setInterval(() => {
      pulsePhase = (pulsePhase + 0.06) % (Math.PI * 2);
    }, 40);

    // Create data pulses - more frequent with more connections
    const pulseCreator = setInterval(() => {
      // Add 2 pulses at a time for denser activity
      const idx1 = Math.floor(Math.random() * connections.length);
      const idx2 = Math.floor(Math.random() * connections.length);
      pulses = [...pulses, { connection: idx1, progress: 0 }, { connection: idx2, progress: 0 }];
    }, 280);

    // Animate pulses
    const pulseAnimator = setInterval(() => {
      pulses = pulses
        .map(p => ({ ...p, progress: p.progress + 0.018 }))
        .filter(p => p.progress < 1);
    }, 25);

    return () => {
      clearInterval(rotationInterval);
      clearInterval(pulseInterval);
      clearInterval(pulseCreator);
      clearInterval(pulseAnimator);
    };
  });
</script>

<svg
  class="globe-animation"
  viewBox="0 0 {size} {size}"
  width={size}
  height={size}
>
  <defs>
    <radialGradient id="globeGradient" cx="35%" cy="35%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.12" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.03" />
    </radialGradient>

    <filter id="cityGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Globe sphere -->
  <circle
    cx={centerX}
    cy={centerY}
    r={radius}
    fill="url(#globeGradient)"
    stroke={accentColor}
    stroke-width="1.5"
    opacity="0.4"
  />

  <!-- Grid lines -->
  {#each gridLines as line}
    <polyline
      points={line.points}
      fill="none"
      stroke={accentColor}
      stroke-width="0.6"
      opacity={line.opacity}
    />
  {/each}

  <!-- Connection lines (rendered first, behind nodes) -->
  {#each connections as [from, to], i}
    {@const node1 = projectedNodes[from]}
    {@const node2 = projectedNodes[to]}
    {#if node1?.visible && node2?.visible}
      {@const avgDepth = (node1.depth + node2.depth) / 2}
      <line
        x1={node1.screenX}
        y1={node1.screenY}
        x2={node2.screenX}
        y2={node2.screenY}
        stroke={accentColor}
        stroke-width={0.8 + avgDepth * 0.8}
        opacity={(0.25 + Math.sin(pulsePhase + i * 0.2) * 0.1) * avgDepth + 0.1}
      />
    {/if}
  {/each}

  <!-- Traveling pulses -->
  {#each pulses as pulse}
    {@const conn = connections[pulse.connection]}
    {@const node1 = conn ? projectedNodes[conn[0]] : null}
    {@const node2 = conn ? projectedNodes[conn[1]] : null}
    {#if node1?.visible && node2?.visible}
      {@const px = node1.screenX + (node2.screenX - node1.screenX) * pulse.progress}
      {@const py = node1.screenY + (node2.screenY - node1.screenY) * pulse.progress}
      <circle
        cx={px}
        cy={py}
        r="3.5"
        fill={accentColor}
        filter="url(#pulseGlow)"
        opacity={(1 - pulse.progress) * 0.85}
      />
    {/if}
  {/each}

  <!-- Nodes (sorted by z: further back rendered first) -->
  {#each projectedNodes.filter(n => n.visible).sort((a, b) => a.z - b.z) as node}
    <!-- Outer glow -->
    <circle
      cx={node.screenX}
      cy={node.screenY}
      r={node.size * 2.5}
      fill={accentColor}
      opacity={(0.15 + Math.sin(pulsePhase) * 0.05) * node.depth}
    />
    <!-- Main dot -->
    <circle
      cx={node.screenX}
      cy={node.screenY}
      r={node.size * 1.3}
      fill={accentColor}
      filter="url(#cityGlow)"
      opacity={0.5 + node.depth * 0.4}
    />
    <!-- Bright center -->
    <circle
      cx={node.screenX}
      cy={node.screenY}
      r={node.size * 0.5}
      fill="white"
      opacity={0.6 + node.depth * 0.35}
    />
  {/each}
</svg>

<style>
  .globe-animation {
    display: block;
  }
</style>
