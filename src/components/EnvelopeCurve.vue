<template>
  <div class="envelope-display">
    <svg :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" style="display: block">
      <!-- Grid lines -->
      <line v-for="t in [0.25, 0.5, 0.75]" :key="t" :x1="pad.left" :y1="pad.top + t * iH" :x2="W - pad.right"
        :y2="pad.top + t * iH" stroke="#1a1a28" stroke-width="1" />

      <!-- Segment dividers -->
      <line v-for="(x, i) in [x1, x2, x3]" :key="'div' + i" :x1="x" :y1="pad.top" :x2="x" :y2="bottom" stroke="#252535"
        stroke-width="1" stroke-dasharray="3 3" />

      <!-- Sustain level guideline -->
      <line :x1="pad.left" :y1="sLevel" :x2="W - pad.right" :y2="sLevel" stroke="#34d39922" stroke-width="1"
        stroke-dasharray="4 4" />

      <defs>
        <linearGradient id="envFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5b8fff" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#5b8fff" stop-opacity="0.02" />
        </linearGradient>
      </defs>

      <!-- Fill under curve -->
      <path :d="fillPath" fill="url(#envFill)" />

      <!-- Main curve -->
      <path :d="curvePath" fill="none" stroke="#5b8fff" stroke-width="2.5" stroke-linecap="round"
        style="filter: drop-shadow(0 0 6px #5b8fff88)" />

      <!-- Segment color overlays -->
      <rect v-for="(seg, i) in segments" :key="'seg' + i" :x="seg.x1" :y="pad.top" :width="seg.x2 - seg.x1" :height="iH"
        :fill="seg.color" fill-opacity="0.04" />

      <!-- Segment labels (A D S R) -->
      <text v-for="seg in segLabels" :key="'lbl' + seg.label" :x="seg.x" :y="bottom + 14" text-anchor="middle"
        font-size="9" :fill="seg.color" font-family="monospace" font-weight="bold" opacity="0.8">{{ seg.label }}</text>

      <!-- Key point dots -->
      <circle v-for="(pt, i) in keyPoints" :key="'pt' + i" :cx="pt.x" :cy="pt.y" r="3.5" :fill="pt.color"
        :style="{ filter: `drop-shadow(0 0 4px ${pt.color})` }" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  attack: { type: Number, required: true },
  decay: { type: Number, required: true },
  sustain: { type: Number, required: true },
  release: { type: Number, required: true },
});

const W = 440;
const H = 140;
const pad = { top: 16, bottom: 20, left: 12, right: 12 };
const iW = W - pad.left - pad.right;
const iH = H - pad.top - pad.bottom;

const bottom = pad.top + iH;

const colors = {
  attack: "#5b8fff",
  decay: "#a78bfa",
  sustain: "#34d399",
  release: "#f472b6",
};

// Derived positions
const sLevel = computed(() => pad.top + (1 - props.sustain) * iH);

const segments_x = computed(() => {
  const total = props.attack + props.decay + 0.4 + props.release;
  const aN = (props.attack / total) * iW;
  const dN = (props.decay / total) * iW;
  const sN = (0.4 / total) * iW;
  const rN = (props.release / total) * iW;
  const x0 = pad.left;
  const _x1 = x0 + aN;
  const _x2 = _x1 + dN;
  const _x3 = _x2 + sN;
  const _x4 = _x3 + rN;
  return { x0, x1: _x1, x2: _x2, x3: _x3, x4: _x4 };
});

const x1 = computed(() => segments_x.value.x1);
const x2 = computed(() => segments_x.value.x2);
const x3 = computed(() => segments_x.value.x3);

const curvePath = computed(() => {
  const { x0, x1, x2, x3, x4 } = segments_x.value;
  const aN = x1 - x0;
  const dN = x2 - x1;
  const rN = x4 - x3;
  const sl = sLevel.value;
  return [
    `M ${x0} ${bottom}`,
    `C ${x0 + aN * 0.4} ${bottom}, ${x1 - aN * 0.1} ${pad.top}, ${x1} ${pad.top}`,
    `C ${x1 + dN * 0.5} ${pad.top}, ${x2 - dN * 0.1} ${sl}, ${x2} ${sl}`,
    `L ${x3} ${sl}`,
    `C ${x3 + rN * 0.3} ${sl}, ${x4 - rN * 0.1} ${bottom}, ${x4} ${bottom}`,
  ].join(" ");
});

const fillPath = computed(
  () => curvePath.value + ` L ${segments_x.value.x4} ${bottom} L ${pad.left} ${bottom} Z`
);

const segments = computed(() => {
  const { x0, x1, x2, x3, x4 } = segments_x.value;
  return [
    { x1: x0, x2: x1, color: colors.attack },
    { x1: x1, x2: x2, color: colors.decay },
    { x1: x2, x2: x3, color: colors.sustain },
    { x1: x3, x2: x4, color: colors.release },
  ];
});

const segLabels = computed(() => {
  const { x0, x1, x2, x3, x4 } = segments_x.value;
  return [
    { label: "A", x: (x0 + x1) / 2, color: colors.attack },
    { label: "D", x: (x1 + x2) / 2, color: colors.decay },
    { label: "S", x: (x2 + x3) / 2, color: colors.sustain },
    { label: "R", x: (x3 + x4) / 2, color: colors.release },
  ];
});

const keyPoints = computed(() => {
  const { x1, x2, x3, x4 } = segments_x.value;
  const sl = sLevel.value;
  return [
    { x: x1, y: pad.top, color: colors.attack },
    { x: x2, y: sl, color: colors.decay },
    { x: x3, y: sl, color: colors.sustain },
    { x: x4, y: bottom, color: colors.release },
  ];
});
</script>

<style scoped>
.envelope-display {
  background: #090910;
  border: 1px solid #1a1a2e;
  border-radius: 12px;
  padding: 4px 0 0;
  box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
</style>
