<script lang="ts">
  import { onMount } from 'svelte';

  export let width = 400;
  export let height = 280;
  export let accentColor = '#2563eb';

  interface Signal {
    id: number;
    label: string;
    value: number;
    targetValue: number;
    maxValue: number;
    alertThreshold: number;
  }

  let signals: Signal[] = [];
  let animationFrame: number;
  let time = 0;

  const signalLabels = [
    { label: 'Supply Risk', threshold: 0.7 },
    { label: 'Policy Shift', threshold: 0.65 },
    { label: 'Market Stress', threshold: 0.75 },
    { label: 'Credit Signal', threshold: 0.6 },
    { label: 'FX Pressure', threshold: 0.7 },
    { label: 'Commodity', threshold: 0.65 }
  ];

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  onMount(() => {
    // Initialize signals
    signals = signalLabels.map((s, i) => ({
      id: i,
      label: s.label,
      value: 0.3 + seededRandom(i * 7) * 0.4,
      targetValue: 0.3 + seededRandom(i * 13) * 0.5,
      maxValue: 1,
      alertThreshold: s.threshold
    }));

    // Periodically update target values
    const updateInterval = setInterval(() => {
      signals = signals.map(s => ({
        ...s,
        targetValue: Math.max(0.1, Math.min(0.95, s.targetValue + (Math.random() - 0.5) * 0.3))
      }));
    }, 800);

    const animate = () => {
      time += 0.05;

      // Smooth interpolation toward target
      signals = signals.map(s => ({
        ...s,
        value: s.value + (s.targetValue - s.value) * 0.08
      }));

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(updateInterval);
    };
  });

  const barWidth = 45;
  const barSpacing = (width - 60) / signalLabels.length;
  const maxBarHeight = height - 80;
</script>

<svg
  class="signal-strength-animation"
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
>
  <defs>
    <filter id="barGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <linearGradient id="barGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color={accentColor} stop-opacity="0.5" />
      <stop offset="100%" stop-color={accentColor} stop-opacity="0.9" />
    </linearGradient>

    <linearGradient id="alertGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0.95" />
    </linearGradient>
  </defs>

  <!-- Background grid lines -->
  {#each [0.25, 0.5, 0.75, 1] as level}
    <line
      x1="30"
      y1={height - 50 - maxBarHeight * level}
      x2={width - 30}
      y2={height - 50 - maxBarHeight * level}
      stroke={accentColor}
      stroke-width="0.5"
      opacity="0.15"
      stroke-dasharray="4 4"
    />
    <text
      x="22"
      y={height - 47 - maxBarHeight * level}
      font-size="7"
      fill={accentColor}
      opacity="0.4"
      text-anchor="end"
    >
      {Math.round(level * 100)}%
    </text>
  {/each}

  <!-- Signal bars -->
  {#each signals as signal, i}
    {@const x = 40 + i * barSpacing}
    {@const barHeight = signal.value * maxBarHeight}
    {@const isAlert = signal.value > signal.alertThreshold}
    {@const thresholdY = height - 50 - signal.alertThreshold * maxBarHeight}

    <!-- Alert threshold line -->
    <line
      x1={x - barWidth / 2 - 5}
      y1={thresholdY}
      x2={x + barWidth / 2 + 5}
      y2={thresholdY}
      stroke="#ef4444"
      stroke-width="1"
      opacity="0.4"
      stroke-dasharray="2 2"
    />

    <!-- Bar glow -->
    {#if isAlert}
      <rect
        x={x - barWidth / 2 - 3}
        y={height - 50 - barHeight - 3}
        width={barWidth + 6}
        height={barHeight + 6}
        rx="4"
        fill="#ef4444"
        opacity="0.2"
        filter="url(#barGlow)"
      />
    {/if}

    <!-- Main bar -->
    <rect
      x={x - barWidth / 2}
      y={height - 50 - barHeight}
      width={barWidth}
      height={barHeight}
      rx="3"
      fill={isAlert ? "url(#alertGradient)" : "url(#barGradient)"}
    />

    <!-- Value indicator at top -->
    <circle
      cx={x}
      cy={height - 50 - barHeight}
      r="4"
      fill={isAlert ? "#ef4444" : accentColor}
      opacity="0.9"
    />
    <circle
      cx={x}
      cy={height - 50 - barHeight}
      r="2"
      fill="white"
      opacity="0.8"
    />

    <!-- Label -->
    <text
      x={x}
      y={height - 30}
      text-anchor="middle"
      font-size="7"
      fill={accentColor}
      opacity="0.7"
      font-weight="500"
    >
      {signal.label}
    </text>

    <!-- Percentage value -->
    <text
      x={x}
      y={height - 55 - barHeight}
      text-anchor="middle"
      font-size="8"
      fill={isAlert ? "#ef4444" : accentColor}
      opacity="0.8"
      font-weight="600"
    >
      {Math.round(signal.value * 100)}%
    </text>
  {/each}

  <!-- Title -->
  <text
    x={width / 2}
    y="18"
    text-anchor="middle"
    font-size="11"
    fill={accentColor}
    opacity="0.7"
    font-weight="600"
  >
    SIGNAL STRENGTH MONITOR
  </text>
</svg>

<style>
  .signal-strength-animation {
    display: block;
  }
</style>
