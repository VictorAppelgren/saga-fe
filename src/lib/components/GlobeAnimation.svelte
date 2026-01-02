<script lang="ts">
  import { onMount } from 'svelte';

  export let size = 400;
  export let accentColor = '#2563eb';

  let rotation = 0;
  let pulsePhase = 0;

  const radius = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;

  // 24 cities spread evenly across the globe at different latitudes
  // Organized in 5 latitude bands with cities spread across longitudes
  const cities = [
    // Band 1: Far North (~60°N) - 4 cities spread 90° apart
    { name: 'Stockholm', lat: 59, lng: 18, size: 2.5 },
    { name: 'Helsinki', lat: 60, lng: 25, size: 2 },
    { name: 'Anchorage', lat: 61, lng: -150, size: 2 },
    { name: 'Oslo', lat: 60, lng: 11, size: 2 },

    // Band 2: Northern (~45°N) - 6 cities spread ~60° apart
    { name: 'London', lat: 51, lng: 0, size: 4 },
    { name: 'Paris', lat: 49, lng: 2, size: 3 },
    { name: 'New York', lat: 41, lng: -74, size: 4 },
    { name: 'Chicago', lat: 42, lng: -88, size: 3 },
    { name: 'Tokyo', lat: 36, lng: 140, size: 4 },
    { name: 'Beijing', lat: 40, lng: 116, size: 3.5 },

    // Band 3: Tropical/Equator (~15°N to 15°S) - 6 cities
    { name: 'Mumbai', lat: 19, lng: 73, size: 3 },
    { name: 'Singapore', lat: 1, lng: 104, size: 3.5 },
    { name: 'Dubai', lat: 25, lng: 55, size: 3 },
    { name: 'Lagos', lat: 6, lng: 3, size: 2.5 },
    { name: 'Panama', lat: 9, lng: -79, size: 2 },
    { name: 'Nairobi', lat: -1, lng: 37, size: 2.5 },

    // Band 4: Southern (~30°S) - 4 cities
    { name: 'Sydney', lat: -34, lng: 151, size: 3.5 },
    { name: 'Sao Paulo', lat: -24, lng: -47, size: 3.5 },
    { name: 'Cape Town', lat: -34, lng: 18, size: 3 },
    { name: 'Perth', lat: -32, lng: 116, size: 2.5 },

    // Band 5: Far South (~45°S) - 4 cities
    { name: 'Buenos Aires', lat: -35, lng: -58, size: 3 },
    { name: 'Auckland', lat: -37, lng: 175, size: 2.5 },
    { name: 'Santiago', lat: -33, lng: -71, size: 2.5 },
    { name: 'Melbourne', lat: -38, lng: 145, size: 3 },
  ];

  // Connections forming a global network
  const connections = [
    // Northern band internal
    [0, 1], [4, 5], [6, 7], [8, 9],
    // North to North cross
    [4, 6], [5, 9], [6, 4], [8, 6],
    // Northern to Tropical
    [4, 12], [5, 10], [6, 14], [7, 14], [9, 11], [8, 11],
    // Tropical internal
    [10, 11], [11, 12], [12, 13], [13, 15], [14, 13],
    // Tropical to Southern
    [11, 16], [13, 18], [14, 17], [10, 19],
    // Southern internal
    [16, 19], [17, 20], [18, 22], [16, 23],
    // Southern band
    [20, 22], [21, 23], [21, 16],
    // Long distance connections
    [6, 8], [4, 17], [8, 16], [0, 6],
  ];

  // Convert lat/lng to 3D coordinates - standard spherical coordinates
  function latLngTo3D(lat: number, lng: number, r: number) {
    // Convert to radians
    const latRad = lat * (Math.PI / 180);
    const lngRad = (lng + rotation) * (Math.PI / 180);

    // Spherical to Cartesian
    // x = right/left, y = up/down, z = toward/away from viewer
    return {
      x: r * Math.cos(latRad) * Math.sin(lngRad),
      y: -r * Math.sin(latRad),  // Negative so north is up
      z: r * Math.cos(latRad) * Math.cos(lngRad),
    };
  }

  // Project 3D to 2D with slight perspective
  function project(x: number, y: number, z: number) {
    // Simple perspective projection
    const perspective = 800;
    const scale = perspective / (perspective - z);

    return {
      x: x * scale + centerX,
      y: y * scale + centerY,
      z: z,
      // Visible if facing us (z < 0 means in front)
      visible: z < radius * 0.3,
      // Depth: 1 at front, 0 at back
      depth: Math.max(0.1, (radius - z) / (2 * radius)),
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

      for (let lng = -180; lng <= 180; lng += 8) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = project(pos3d.x, pos3d.y, pos3d.z);

        if (proj.visible) {
          points.push(`${proj.x.toFixed(1)},${proj.y.toFixed(1)}`);
        } else if (points.length > 2) {
          lines.push({ points: points.join(' '), opacity: 0.15 });
          points = [];
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.15 });
      }
    }

    // Longitude lines (vertical arcs)
    for (let lng = -180; lng < 180; lng += 30) {
      let points: string[] = [];

      for (let lat = -90; lat <= 90; lat += 6) {
        const pos3d = latLngTo3D(lat, lng, radius);
        const proj = project(pos3d.x, pos3d.y, pos3d.z);

        if (proj.visible) {
          points.push(`${proj.x.toFixed(1)},${proj.y.toFixed(1)}`);
        } else if (points.length > 2) {
          lines.push({ points: points.join(' '), opacity: 0.15 });
          points = [];
        }
      }
      if (points.length > 2) {
        lines.push({ points: points.join(' '), opacity: 0.15 });
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

    // Create data pulses
    const pulseCreator = setInterval(() => {
      const idx = Math.floor(Math.random() * connections.length);
      pulses = [...pulses, { connection: idx, progress: 0 }];
    }, 350);

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

  <!-- Connection lines (rendered first, behind cities) -->
  {#each connections as [from, to], i}
    {@const city1 = projectedCities[from]}
    {@const city2 = projectedCities[to]}
    {#if city1?.visible && city2?.visible}
      {@const avgDepth = (city1.depth + city2.depth) / 2}
      <line
        x1={city1.x}
        y1={city1.y}
        x2={city2.x}
        y2={city2.y}
        stroke={accentColor}
        stroke-width={1 + avgDepth}
        opacity={(0.3 + Math.sin(pulsePhase + i * 0.3) * 0.15) * avgDepth + 0.15}
      />
    {/if}
  {/each}

  <!-- Traveling pulses -->
  {#each pulses as pulse}
    {@const conn = connections[pulse.connection]}
    {@const city1 = conn ? projectedCities[conn[0]] : null}
    {@const city2 = conn ? projectedCities[conn[1]] : null}
    {#if city1?.visible && city2?.visible}
      {@const px = city1.x + (city2.x - city1.x) * pulse.progress}
      {@const py = city1.y + (city2.y - city1.y) * pulse.progress}
      <circle
        cx={px}
        cy={py}
        r="4"
        fill={accentColor}
        filter="url(#pulseGlow)"
        opacity={(1 - pulse.progress) * 0.9}
      />
    {/if}
  {/each}

  <!-- Cities (sorted by z: further back rendered first) -->
  {#each projectedCities.filter(c => c.visible).sort((a, b) => b.z - a.z) as city}
    <!-- Outer glow -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * 2.8}
      fill={accentColor}
      opacity={(0.18 + Math.sin(pulsePhase) * 0.07) * city.depth}
    />
    <!-- Main dot -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * 1.4}
      fill={accentColor}
      filter="url(#cityGlow)"
      opacity={0.55 + city.depth * 0.4}
    />
    <!-- Bright center -->
    <circle
      cx={city.x}
      cy={city.y}
      r={city.size * 0.55}
      fill="white"
      opacity={0.65 + city.depth * 0.3}
    />
  {/each}
</svg>

<style>
  .globe-animation {
    display: block;
  }
</style>
