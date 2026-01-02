<script lang="ts">
  import { onMount } from 'svelte';

  export let size = 400;
  export let accentColor = '#2563eb';

  let mounted = false;
  let rotation = 0;
  let pulsePhase = 0;

  const radius = size * 0.38;
  const centerX = size / 2;
  const centerY = size / 2;

  // Financial centers distributed evenly around the globe
  // Using longitude spread across full 360 degrees for even distribution
  const cities = [
    // Row 1: Northern high latitude (~55°)
    { name: 'London', lat: 52, lng: -10, size: 4 },
    { name: 'Moscow', lat: 56, lng: 50, size: 3 },
    { name: 'Vancouver', lat: 49, lng: -130, size: 2.5 },

    // Row 2: Northern mid latitude (~40°)
    { name: 'New York', lat: 41, lng: -74, size: 4 },
    { name: 'Madrid', lat: 40, lng: -4, size: 2.5 },
    { name: 'Beijing', lat: 40, lng: 116, size: 3.5 },
    { name: 'Tokyo', lat: 36, lng: 140, size: 4 },
    { name: 'San Francisco', lat: 38, lng: -122, size: 3 },

    // Row 3: Tropical/Equatorial (~20° to ~5°)
    { name: 'Mumbai', lat: 19, lng: 73, size: 3 },
    { name: 'Hong Kong', lat: 22, lng: 114, size: 3.5 },
    { name: 'Singapore', lat: 1, lng: 104, size: 3 },
    { name: 'Dubai', lat: 25, lng: 55, size: 3 },
    { name: 'Mexico City', lat: 19, lng: -99, size: 2.5 },
    { name: 'Lagos', lat: 6, lng: 3, size: 2 },

    // Row 4: Southern latitude (~-25° to -35°)
    { name: 'Sao Paulo', lat: -24, lng: -47, size: 3 },
    { name: 'Sydney', lat: -34, lng: 151, size: 3 },
    { name: 'Johannesburg', lat: -26, lng: 28, size: 2.5 },
    { name: 'Buenos Aires', lat: -35, lng: -58, size: 2.5 },
  ];

  // Create connections that span across the globe
  const connections = [
    // Trans-Atlantic
    [0, 3], [0, 4], [3, 4],
    // Europe to Asia
    [0, 1], [1, 11], [0, 11],
    // Asia connections
    [5, 6], [6, 9], [9, 10], [8, 10], [8, 11],
    // Pacific connections
    [6, 7], [7, 3],
    // Americas
    [3, 12], [7, 12], [3, 14], [14, 17],
    // Southern hemisphere
    [14, 15], [15, 16], [16, 17],
    // Cross connections
    [10, 15], [13, 16], [2, 7],
    // More global links
    [0, 13], [1, 5], [11, 8],
  ];

  // Convert lat/lng to 3D coordinates on sphere
  function latLngTo3D(lat: number, lng: number, r: number) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + rotation) * (Math.PI / 180);
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.cos(phi),
      z: r * Math.sin(phi) * Math.sin(theta),
    };
  }

  // Project 3D to 2D - orthographic projection (no perspective distortion)
  function project(x: number, y: number, z: number) {
    // Orthographic projection - simpler, shows full hemisphere evenly
    return {
      x: x + centerX,
      y: y + centerY,
      z: z,
      // Show front hemisphere (z < 0 means facing us)
      visible: z < radius * 0.15,
      // Depth for opacity: closer to front = higher value
      depth: Math.max(0, 1 - (z / radius + 1) / 2),
    };
  }

  // Get projected city positions
  $: projectedCities = cities.map((city) => {
    const pos3d = latLngTo3D(city.lat, city.lng, radius);
    const proj = project(pos3d.x, pos3d.y, pos3d.z);
    return { ...city, ...proj };
  });

  // Generate globe grid lines
  function generateGridLines() {
    const lines: { points: string; opacity: number }[] = [];

    // Latitude lines (horizontal circles)
    for (let lat = -60; lat <= 60; lat += 30) {
      let points: string[] = [];
      let lastVisible = false;

      for (let lng = 0; lng <= 360; lng += 5) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = project(pos3d.x, pos3d.y, pos3d.z);

        if (proj.visible) {
          points.push(`${proj.x.toFixed(1)},${proj.y.toFixed(1)}`);
          lastVisible = true;
        } else if (lastVisible) {
          // End current segment
          if (points.length > 2) {
            lines.push({ points: points.join(' '), opacity: 0.12 });
          }
          points = [];
          lastVisible = false;
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.12 });
      }
    }

    // Longitude lines (vertical arcs)
    for (let lng = 0; lng < 360; lng += 30) {
      let points: string[] = [];

      for (let lat = -90; lat <= 90; lat += 5) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = project(pos3d.x, pos3d.y, pos3d.z);

        if (proj.visible) {
          points.push(`${proj.x.toFixed(1)},${proj.y.toFixed(1)}`);
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.12 });
      }
    }

    return lines;
  }

  $: gridLines = generateGridLines();

  // Traveling data pulses along connections
  let pulses: { connection: number; progress: number }[] = [];

  onMount(() => {
    mounted = true;

    // Start showing Atlantic/Americas view
    rotation = 60;

    // Smooth rotation
    const rotationInterval = setInterval(() => {
      rotation = (rotation + 0.15) % 360;
    }, 40);

    // Breathing effect
    const pulseInterval = setInterval(() => {
      pulsePhase = (pulsePhase + 0.08) % (Math.PI * 2);
    }, 40);

    // Create traveling pulses more frequently
    const pulseCreator = setInterval(() => {
      const connectionIndex = Math.floor(Math.random() * connections.length);
      pulses = [...pulses, { connection: connectionIndex, progress: 0 }];
    }, 400);

    // Animate pulses
    const pulseAnimator = setInterval(() => {
      pulses = pulses
        .map(p => ({ ...p, progress: p.progress + 0.02 }))
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
    <!-- Gradient for globe -->
    <radialGradient id="globeGradient" cx="30%" cy="30%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.1" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.02" />
    </radialGradient>

    <!-- Glow filter for cities -->
    <filter id="cityGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Pulse glow -->
    <filter id="pulseGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Globe outline -->
  <circle
    cx={centerX}
    cy={centerY}
    r={radius}
    fill="url(#globeGradient)"
    stroke={accentColor}
    stroke-width="1.5"
    opacity="0.35"
  />

  <!-- Grid lines -->
  {#each gridLines as line}
    <polyline
      points={line.points}
      fill="none"
      stroke={accentColor}
      stroke-width="0.5"
      opacity={line.opacity}
    />
  {/each}

  <!-- Connections between cities -->
  {#each connections as [from, to], i}
    {@const city1 = projectedCities[from]}
    {@const city2 = projectedCities[to]}
    {#if city1.visible && city2.visible}
      {@const avgDepth = (city1.depth + city2.depth) / 2}
      <line
        x1={city1.x}
        y1={city1.y}
        x2={city2.x}
        y2={city2.y}
        stroke={accentColor}
        stroke-width={1.2 + avgDepth * 0.8}
        opacity={(0.25 + Math.sin(pulsePhase + i * 0.4) * 0.12) * avgDepth + 0.1}
      />
    {/if}
  {/each}

  <!-- Traveling pulses -->
  {#each pulses as pulse}
    {@const [from, to] = connections[pulse.connection]}
    {@const city1 = projectedCities[from]}
    {@const city2 = projectedCities[to]}
    {#if city1.visible && city2.visible}
      {@const px = city1.x + (city2.x - city1.x) * pulse.progress}
      {@const py = city1.y + (city2.y - city1.y) * pulse.progress}
      <circle
        cx={px}
        cy={py}
        r="3"
        fill={accentColor}
        filter="url(#pulseGlow)"
        opacity={1 - pulse.progress}
      />
    {/if}
  {/each}

  <!-- Cities - sorted by z so further ones render first (higher z = further back) -->
  {#each projectedCities.filter(c => c.visible).sort((a, b) => b.z - a.z) as city}
    <!-- Outer glow -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * 3}
      fill={accentColor}
      opacity={(0.15 + Math.sin(pulsePhase) * 0.06) * city.depth}
    />
    <!-- City dot -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * 1.5}
      fill={accentColor}
      filter="url(#cityGlow)"
      opacity={0.5 + city.depth * 0.4}
    />
    <!-- Bright center -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * 0.6}
      fill="white"
      opacity={0.6 + city.depth * 0.35}
    />
  {/each}
</svg>

<style>
  .globe-animation {
    display: block;
  }
</style>
