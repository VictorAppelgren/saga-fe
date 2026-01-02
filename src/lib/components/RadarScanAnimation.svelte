<script lang="ts">
  import { onMount } from 'svelte';

  export let size = 350;
  export let accentColor = '#2563eb';

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.42;

  let sweepAngle = 0;
  let detectedBlips: { x: number; y: number; age: number; size: number; id: number }[] = [];
  let rings: { radius: number; opacity: number }[] = [];
  let animationFrame: number;
  let blipId = 0;

  // Seeded random for consistent blip positions
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Generate static target points (entities being monitored)
  const staticTargets = Array.from({ length: 18 }, (_, i) => {
    const angle = seededRandom(i * 7) * Math.PI * 2;
    const dist = 0.25 + seededRandom(i * 13) * 0.65;
    return {
      x: centerX + Math.cos(angle) * maxRadius * dist,
      y: centerY + Math.sin(angle) * maxRadius * dist,
      angle: angle,
      size: 2 + seededRandom(i * 19) * 3
    };
  });

  onMount(() => {
    // Initialize concentric rings
    rings = [0.25, 0.5, 0.75, 1].map(r => ({
      radius: maxRadius * r,
      opacity: 0.15
    }));

    const animate = () => {
      // Rotate sweep
      sweepAngle = (sweepAngle + 1.2) % 360;
      const sweepRad = sweepAngle * (Math.PI / 180);

      // Check if sweep passes over any targets
      staticTargets.forEach((target, i) => {
        const angleDiff = Math.abs(target.angle - sweepRad) % (Math.PI * 2);
        const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

        if (normalizedDiff < 0.1) {
          // Add blip when sweep passes
          const existingBlip = detectedBlips.find(b =>
            Math.abs(b.x - target.x) < 5 && Math.abs(b.y - target.y) < 5 && b.age < 100
          );
          if (!existingBlip) {
            detectedBlips = [...detectedBlips, {
              x: target.x,
              y: target.y,
              age: 0,
              size: target.size,
              id: blipId++
            }];
          }
        }
      });

      // Age and fade blips
      detectedBlips = detectedBlips
        .map(b => ({ ...b, age: b.age + 1 }))
        .filter(b => b.age < 180);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });

  // Calculate sweep gradient end point
  $: sweepEndX = centerX + Math.cos(sweepAngle * Math.PI / 180) * maxRadius;
  $: sweepEndY = centerY + Math.sin(sweepAngle * Math.PI / 180) * maxRadius;
</script>

<svg
  class="radar-animation"
  viewBox="0 0 {size} {size}"
  width={size}
  height={size}
>
  <defs>
    <!-- Radar sweep gradient -->
    <linearGradient id="sweepGradient" gradientUnits="userSpaceOnUse"
      x1={centerX} y1={centerY} x2={sweepEndX} y2={sweepEndY}>
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.8" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </linearGradient>

    <!-- Cone sweep gradient -->
    <radialGradient id="coneGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.3" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0" />
    </radialGradient>

    <!-- Blip glow -->
    <filter id="blipGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Sweep cone clip path -->
    <clipPath id="sweepCone">
      <path d="
        M {centerX} {centerY}
        L {centerX + Math.cos((sweepAngle - 30) * Math.PI / 180) * maxRadius * 1.2} {centerY + Math.sin((sweepAngle - 30) * Math.PI / 180) * maxRadius * 1.2}
        A {maxRadius * 1.2} {maxRadius * 1.2} 0 0 1 {centerX + Math.cos(sweepAngle * Math.PI / 180) * maxRadius * 1.2} {centerY + Math.sin(sweepAngle * Math.PI / 180) * maxRadius * 1.2}
        Z
      " />
    </clipPath>
  </defs>

  <!-- Background circle -->
  <circle
    cx={centerX}
    cy={centerY}
    r={maxRadius}
    fill={accentColor}
    opacity="0.03"
  />

  <!-- Concentric rings -->
  {#each rings as ring}
    <circle
      cx={centerX}
      cy={centerY}
      r={ring.radius}
      fill="none"
      stroke={accentColor}
      stroke-width="1"
      opacity={ring.opacity}
    />
  {/each}

  <!-- Cross hairs -->
  <line
    x1={centerX - maxRadius}
    y1={centerY}
    x2={centerX + maxRadius}
    y2={centerY}
    stroke={accentColor}
    stroke-width="0.5"
    opacity="0.2"
  />
  <line
    x1={centerX}
    y1={centerY - maxRadius}
    x2={centerX}
    y2={centerY + maxRadius}
    stroke={accentColor}
    stroke-width="0.5"
    opacity="0.2"
  />

  <!-- Sweep cone (fading trail) -->
  <path
    d="
      M {centerX} {centerY}
      L {centerX + Math.cos((sweepAngle - 45) * Math.PI / 180) * maxRadius} {centerY + Math.sin((sweepAngle - 45) * Math.PI / 180) * maxRadius}
      A {maxRadius} {maxRadius} 0 0 1 {centerX + Math.cos(sweepAngle * Math.PI / 180) * maxRadius} {centerY + Math.sin(sweepAngle * Math.PI / 180) * maxRadius}
      Z
    "
    fill={accentColor}
    opacity="0.15"
  />

  <!-- Main sweep line -->
  <line
    x1={centerX}
    y1={centerY}
    x2={sweepEndX}
    y2={sweepEndY}
    stroke={accentColor}
    stroke-width="2"
    opacity="0.8"
  />

  <!-- Center point -->
  <circle
    cx={centerX}
    cy={centerY}
    r="4"
    fill={accentColor}
    opacity="0.9"
  />
  <circle
    cx={centerX}
    cy={centerY}
    r="2"
    fill="white"
    opacity="0.8"
  />

  <!-- Static target markers (faint) -->
  {#each staticTargets as target}
    <circle
      cx={target.x}
      cy={target.y}
      r={target.size * 0.5}
      fill={accentColor}
      opacity="0.1"
    />
  {/each}

  <!-- Detected blips (fade over time) -->
  {#each detectedBlips as blip}
    {@const fadeOpacity = Math.max(0, 1 - blip.age / 180)}
    <!-- Outer glow -->
    <circle
      cx={blip.x}
      cy={blip.y}
      r={blip.size * 2}
      fill={accentColor}
      opacity={fadeOpacity * 0.3}
      filter="url(#blipGlow)"
    />
    <!-- Main blip -->
    <circle
      cx={blip.x}
      cy={blip.y}
      r={blip.size}
      fill={accentColor}
      opacity={fadeOpacity * 0.9}
    />
    <!-- Bright center -->
    <circle
      cx={blip.x}
      cy={blip.y}
      r={blip.size * 0.4}
      fill="white"
      opacity={fadeOpacity * 0.7}
    />
  {/each}

  <!-- Outer ring (border) -->
  <circle
    cx={centerX}
    cy={centerY}
    r={maxRadius}
    fill="none"
    stroke={accentColor}
    stroke-width="2"
    opacity="0.4"
  />
</svg>

<style>
  .radar-animation {
    display: block;
  }
</style>
