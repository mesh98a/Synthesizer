import { reactive } from "vue";

export const ADSR_DEFS = [
  { key: "attack", label: "Attack", color: "#5b8fff", min: 0.01, max: 5, default: 0.1 },
  { key: "decay", label: "Decay", color: "#a78bfa", min: 0.01, max: 5, default: 0.3 },
  { key: "sustain", label: "Sustain", color: "#34d399", min: 0, max: 1, default: 0.7 },
  { key: "release", label: "Release", color: "#f472b6", min: 0.01, max: 10, default: 0.5 },
];

export const adsrValues = reactive({
  attack: 0.1,
  decay: 0.3,
  sustain: 0.7,
  release: 0.5,
});