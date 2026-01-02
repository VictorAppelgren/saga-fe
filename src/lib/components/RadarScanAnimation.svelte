<script lang="ts">
  import { onMount } from 'svelte';

  export let size = 350;
  export let accentColor = '#2563eb';

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size * 0.42;

  let sweepAngle = 0;
  let detectedRisks: { x: number; y: number; age: number; size: number; id: number; label: string }[] = [];
  let animationFrame: number;
  let riskId = 0;

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  // Sector labels around the radar
  const sectors = ['Tech', 'Energy', 'Finance', 'Healthcare', 'Commodities', 'Policy'];

  // Monitored entities (risks to detect)
  const monitoredEntities = Array.from({ length: 24 }, (_, i) => {
    const angle = seededRandom(i * 7) * Math.PI * 2;
    const dist = 0.3 + seededRandom(i * 13) * 0.6;
    const riskLabels = ['Supply', 'Policy', 'Credit', 'Tariff', 'Rate', 'Margin', 'FX', 'Demand'];
    return {
      x: centerX + Math.cos(angle) * maxRadius * dist,
      y: centerY + Math.sin(angle) * maxRadius * dist,
      angle,
      size: 2 + seededRandom(i * 19) * 2.5,
      label: riskLabels[i % riskLabels.length]
    };
  });

  onMount(() => {
    const animate = () => {
      sweepAngle = (sweepAngle + 1.5) % 360;
      const sweepRad = sweepAngle * (Math.PI / 180);

      // Detect entities when sweep passes
      monitoredEntities.forEach((entity, i) => {
        const angleDiff = Math.abs(entity.angle - sweepRad) % (Math.PI * 2);
        const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

        if (normalizedDiff < 0.12) {
          const existingRisk = detectedRisks.find(r =>
            Math.abs(r.x - entity.x) < 8 && Math.abs(r.y - entity.y) < 8 && r.age < 80
          );
          if (!existingRisk) {
            detectedRisks = [...detectedRisks, {
              x: entity.x,
              y: entity.y,
              age: 0,
              size: entity.size,
              id: riskId++,
              label: entity.label
            }];
          }
        }
      });

      // Age and fade risks
      detectedRisks = detectedRisks
        .map(r => ({ ...r, age: r.age + 1 }))
        .filter(r => r.age < 150);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  });

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
    <filter id="riskGlow" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <radialGradient id="radarBg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.08" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.02" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <circle
    cx={centerX}
    cy={centerY}
    r={maxRadius}
    fill="url(#radarBg)"
  />

  <!-- Concentric rings -->
  {#each [0.25, 0.5, 0.75, 1] as ringRatio}
    <circle
      cx={centerX}
      cy={centerY}
      r={maxRadius * ringRatio}
      fill="none"
      stroke={accentColor}
      stroke-width="1"
      opacity="0.15"
    />
  {/each}

  <!-- Sector dividers and labels -->
  {#each sectors as sector, i}
    {@const angle = (i / sectors.length) * Math.PI * 2 - Math.PI / 2}
    <line
      x1={centerX}
      y1={centerY}
      x2={centerX + Math.cos(angle) * maxRadius}
      y2={centerY + Math.sin(angle) * maxRadius}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.2"
    />
    <text
      x={centerX + Math.cos(angle + Math.PI / sectors.length) * (maxRadius + 15)}
      y={centerY + Math.sin(angle + Math.PI / sectors.length) * (maxRadius + 15)}
      text-anchor="middle"
      font-size="9"
      fill={accentColor}
      opacity="0.5"
      font-weight="500"
    >
      {sector}
    </text>
  {/each}

  <!-- Sweep cone (fading trail) -->
  <path
    d="
      M {centerX} {centerY}
      L {centerX + Math.cos((sweepAngle - 40) * Math.PI / 180) * maxRadius} {centerY + Math.sin((sweepAngle - 40) * Math.PI / 180) * maxRadius}
      A {maxRadius} {maxRadius} 0 0 1 {sweepEndX} {sweepEndY}
      Z
    "
    fill={accentColor}
    opacity="0.12"
  />

  <!-- Main sweep line -->
  <line
    x1={centerX}
    y1={centerY}
    x2={sweepEndX}
    y2={sweepEndY}
    stroke={accentColor}
    stroke-width="2"
    opacity="0.85"
  />

  <!-- Static entity markers (faint) -->
  {#each monitoredEntities as entity}
    <circle
      cx={entity.x}
      cy={entity.y}
      r={entity.size * 0.6}
      fill={accentColor}
      opacity="0.12"
    />
  {/each}

  <!-- Detected risks (bright, fading) -->
  {#each detectedRisks as risk}
    {@const fadeOpacity = Math.max(0, 1 - risk.age / 150)}
    {@const pulseScale = 1 + (risk.age < 20 ? (20 - risk.age) * 0.03 : 0)}
    <!-- Outer glow -->
    <circle
      cx={risk.x}
      cy={risk.y}
      r={risk.size * 2.5 * pulseScale}
      fill={accentColor}
      opacity={fadeOpacity * 0.25}
      filter="url(#riskGlow)"
    />
    <!-- Main risk dot -->
    <circle
      cx={risk.x}
      cy={risk.y}
      r={risk.size * pulseScale}
      fill={accentColor}
      opacity={fadeOpacity * 0.9}
    />
    <!-- Bright center -->
    <circle
      cx={risk.x}
      cy={risk.y}
      r={risk.size * 0.4 * pulseScale}
      fill="white"
      opacity={fadeOpacity * 0.8}
    />
    <!-- Risk label (only show for recent detections) -->
    {#if risk.age < 60}
      <text
        x={risk.x}
        y={risk.y - risk.size - 5}
        text-anchor="middle"
        font-size="7"
        fill={accentColor}
        opacity={fadeOpacity * 0.7}
        font-weight="500"
      >
        {risk.label}
      </text>
    {/if}
  {/each}

  <!-- Center hub -->
  <circle
    cx={centerX}
    cy={centerY}
    r="6"
    fill={accentColor}
    opacity="0.9"
  />
  <circle
    cx={centerX}
    cy={centerY}
    r="3"
    fill="white"
    opacity="0.8"
  />

  <!-- Outer ring border -->
  <circle
    cx={centerX}
    cy={centerY}
    r={maxRadius}
    fill="none"
    stroke={accentColor}
    stroke-width="2"
    opacity="0.4"
  />

  <!-- Title -->
  <text
    x={centerX}
    y={size - 8}
    text-anchor="middle"
    font-size="10"
    fill={accentColor}
    opacity="0.6"
    font-weight="600"
  >
    RISK MONITORING
  </text>
</svg>

<style>
  .radar-animation {
    display: block;
  }
</style>
