<script lang="ts">
  import { onMount } from 'svelte';

  export let size = 400;
  export let accentColor = '#2563eb';

  let rotation = 0;
  let pulsePhase = 0;

  const radius = size * 0.4;
  const centerX = size / 2;
  const centerY = size / 2;

  // 45 cities spread across the globe - financial and business centers
  // Organized by latitude bands with good longitude spread
  const cities = [
    // Band 1: Arctic/Far North (55-70°N) - 6 cities
    { name: 'Reykjavik', lat: 64, lng: -22, size: 2 },      // 0
    { name: 'Oslo', lat: 60, lng: 11, size: 2.5 },          // 1
    { name: 'Stockholm', lat: 59, lng: 18, size: 2.5 },     // 2
    { name: 'Helsinki', lat: 60, lng: 25, size: 2 },        // 3
    { name: 'Moscow', lat: 56, lng: 37, size: 3 },          // 4
    { name: 'Anchorage', lat: 61, lng: -150, size: 2 },     // 5

    // Band 2: Northern (45-55°N) - 10 cities
    { name: 'London', lat: 51, lng: 0, size: 4 },           // 6
    { name: 'Paris', lat: 49, lng: 2, size: 3.5 },          // 7
    { name: 'Frankfurt', lat: 50, lng: 9, size: 3 },        // 8
    { name: 'Zurich', lat: 47, lng: 8, size: 3 },           // 9
    { name: 'Amsterdam', lat: 52, lng: 5, size: 2.5 },      // 10
    { name: 'New York', lat: 41, lng: -74, size: 4.5 },     // 11
    { name: 'Chicago', lat: 42, lng: -88, size: 3.5 },      // 12
    { name: 'Toronto', lat: 44, lng: -79, size: 3 },        // 13
    { name: 'Vancouver', lat: 49, lng: -123, size: 2.5 },   // 14
    { name: 'Seattle', lat: 47, lng: -122, size: 2.5 },     // 15

    // Band 3: Mid-Northern (30-45°N) - 10 cities
    { name: 'Tokyo', lat: 36, lng: 140, size: 4.5 },        // 16
    { name: 'Beijing', lat: 40, lng: 116, size: 4 },        // 17
    { name: 'Shanghai', lat: 31, lng: 121, size: 4 },       // 18
    { name: 'Seoul', lat: 37, lng: 127, size: 3.5 },        // 19
    { name: 'Los Angeles', lat: 34, lng: -118, size: 4 },   // 20
    { name: 'San Francisco', lat: 38, lng: -122, size: 3.5 },// 21
    { name: 'Madrid', lat: 40, lng: -4, size: 2.5 },        // 22
    { name: 'Milan', lat: 45, lng: 9, size: 2.5 },          // 23
    { name: 'Dubai', lat: 25, lng: 55, size: 3.5 },         // 24
    { name: 'Tel Aviv', lat: 32, lng: 35, size: 2.5 },      // 25

    // Band 4: Tropical/Equator (15°N to 15°S) - 10 cities
    { name: 'Mumbai', lat: 19, lng: 73, size: 3.5 },        // 26
    { name: 'Singapore', lat: 1, lng: 104, size: 4 },       // 27
    { name: 'Hong Kong', lat: 22, lng: 114, size: 4 },      // 28
    { name: 'Bangkok', lat: 14, lng: 100, size: 3 },        // 29
    { name: 'Lagos', lat: 6, lng: 3, size: 3 },             // 30
    { name: 'Nairobi', lat: -1, lng: 37, size: 2.5 },       // 31
    { name: 'Panama City', lat: 9, lng: -79, size: 2.5 },   // 32
    { name: 'Mexico City', lat: 19, lng: -99, size: 3 },    // 33
    { name: 'Miami', lat: 26, lng: -80, size: 3 },          // 34
    { name: 'Jakarta', lat: -6, lng: 107, size: 3 },        // 35

    // Band 5: Southern (25-45°S) - 9 cities
    { name: 'Sydney', lat: -34, lng: 151, size: 4 },        // 36
    { name: 'Melbourne', lat: -38, lng: 145, size: 3 },     // 37
    { name: 'Perth', lat: -32, lng: 116, size: 2.5 },       // 38
    { name: 'Auckland', lat: -37, lng: 175, size: 2.5 },    // 39
    { name: 'Sao Paulo', lat: -24, lng: -47, size: 4 },     // 40
    { name: 'Buenos Aires', lat: -35, lng: -58, size: 3 },  // 41
    { name: 'Santiago', lat: -33, lng: -71, size: 2.5 },    // 42
    { name: 'Cape Town', lat: -34, lng: 18, size: 3 },      // 43
    { name: 'Johannesburg', lat: -26, lng: 28, size: 3 },   // 44
  ];

  // Dense network of connections - financial flows between centers
  const connections = [
    // Arctic band internal
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5],
    // Arctic to Northern Europe
    [1, 6], [2, 8], [3, 4], [4, 8],
    // Northern Europe internal (tight cluster)
    [6, 7], [7, 8], [8, 9], [9, 10], [6, 10], [7, 9], [6, 8],
    // North America internal
    [11, 12], [12, 13], [13, 14], [14, 15], [11, 13], [15, 21], [20, 21],
    // Transatlantic (major finance routes)
    [6, 11], [7, 11], [8, 11], [6, 13], [10, 11],
    // Asia internal (East Asia cluster)
    [16, 17], [17, 18], [18, 19], [16, 19], [17, 19], [16, 18],
    // Asia-Pacific connections
    [16, 27], [18, 27], [18, 28], [28, 27], [27, 29], [28, 29],
    // Europe to Middle East/Asia
    [8, 24], [9, 24], [6, 24], [24, 25], [24, 26], [25, 26],
    // Middle East to Asia
    [24, 27], [24, 28], [26, 27], [26, 28],
    // Tropical Asia internal
    [27, 28], [28, 29], [27, 29], [27, 35], [29, 35],
    // Africa internal
    [30, 31], [31, 43], [43, 44], [30, 43],
    // Americas internal
    [32, 33], [33, 34], [34, 11], [32, 34], [33, 20],
    // South America internal
    [40, 41], [41, 42], [40, 42],
    // Australia/NZ internal
    [36, 37], [37, 38], [36, 39],
    // Major global routes
    [11, 16], [20, 16], [21, 16], // US-Japan
    [6, 28], [6, 27], // London-Asia
    [11, 40], [34, 40], // US-Brazil
    [27, 36], [28, 36], // Asia-Australia
    [36, 39], // Australia-NZ
    [16, 36], [18, 36], // Japan/China-Australia
    [6, 43], [6, 30], // London-Africa
    [24, 26], [24, 31], // Dubai hub
    [40, 30], // Brazil-Africa
    [42, 20], // Chile-LA
    [38, 27], // Perth-Singapore
    // Cross-Pacific
    [20, 18], [21, 18], [14, 16], [15, 16],
    // More density in key hubs
    [11, 6], [11, 7], [11, 8], // NY-Europe
    [16, 28], [16, 27], // Tokyo-HK/Singapore
    [27, 26], [27, 24], // Singapore hub
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
