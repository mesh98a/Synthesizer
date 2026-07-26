<template>
    <div class="envelope-display">
        <svg :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" style="display: block">
            <!-- Horizontale Hilfslinien -->
            <line v-for="t in [0.25, 0.5, 0.75]" :key="t" :x1="pad.left" :y1="pad.top + t * iH" :x2="W - pad.right"
                :y2="pad.top + t * iH" stroke="#1a1a28" stroke-width="1" />

            <!-- Trennlinien zwischen den ADSR-Phasen -->
            <line v-for="(x, i) in [x1, x2, x3]" :key="'div' + i" :x1="x" :y1="pad.top" :x2="x" :y2="bottom"
                stroke="#252535" stroke-width="1" stroke-dasharray="3 3" />

            <!-- Hilfslinie für den Sustain-Pegel -->
            <line :x1="pad.left" :y1="sLevel" :x2="W - pad.right" :y2="sLevel" stroke="#34d39922" stroke-width="1"
                stroke-dasharray="4 4" />

            <defs>
                <linearGradient id="envFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#5b8fff" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#5b8fff" stop-opacity="0.02" />
                </linearGradient>
            </defs>

            <!-- Fläche unter der Hüllkurve -->
            <path :d="fillPath" fill="url(#envFill)" />

            <!-- Linearer Attack und exponentieller Decay -->
            <path :d="attackDecayPath" fill="none" stroke="#5b8fff" stroke-width="2.5" stroke-linecap="round"
                style="filter: drop-shadow(0 0 6px #5b8fff88)" />

            <!-- Sustain bleibt bestehen solange die Taste gehalten wird -->
            <line :x1="x2" :y1="sLevel" :x2="x3" :y2="sLevel" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"
                stroke-dasharray="6 4" />

            <!-- Exponentieller Release nach dem Loslassen der Taste -->
            <path :d="releasePath" fill="none" stroke="#f472b6" stroke-width="2.5" stroke-linecap="round"
                style="filter: drop-shadow(0 0 6px #f472b688)" />

            <!-- Farbflächen der einzelnen Phasen -->
            <rect v-for="(seg, i) in segments" :key="'seg' + i" :x="seg.x1" :y="pad.top" :width="seg.x2 - seg.x1"
                :height="iH" :fill="seg.color" fill-opacity="0.04" />

            <!-- Kurzbezeichnungen der ADSR-Phasen -->
            <text v-for="seg in segLabels" :key="'lbl' + seg.label" :x="seg.x" :y="bottom + 14" text-anchor="middle"
                font-size="9" :fill="seg.color" font-family="monospace" font-weight="bold" opacity="0.8">{{ seg.label
                }}</text>

            <!-- Markierungen der Phasenübergänge -->
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

const colors = {
    attack: "#5b8fff",
    decay: "#a78bfa",
    sustain: "#34d399",
    release: "#f472b6",
};


const W = 440; // Gesamte Breite des SVG-Bereichs
const H = 140; // Gesamte Höhe des SVG-Bereichs
const pad = { top: 16, bottom: 20, left: 12, right: 12 }; // Innenabstände der Zeichenfläche
const iW = W - pad.left - pad.right; // Nutzbare Breite innerhalb der Abstände
const iH = H - pad.top - pad.bottom; // Nutzbare Höhe innerhalb der Abstände

const bottom = pad.top + iH;

// Leitet die Zeichenpositionen aus Abmessungen und ADSR-Werten ab
const sLevel = computed(() => pad.top + (1 - props.sustain) * iH);

// Verteilt die vier Phasen proportional auf die verfügbare Breite
const segments_x = computed(() => {
    const total = props.attack + props.decay + 0.4 + props.release; // Gesamtdauer aller dargestellten Phasen
    const aN = (props.attack / total) * iW; // Breite der Attack-Phase
    const dN = (props.decay / total) * iW; // Breite der Decay-Phase
    const sN = (0.4 / total) * iW; // Feste Breite der Sustain-Phase
    const rN = (props.release / total) * iW; // Breite der Release-Phase
    const x0 = pad.left; // Startpunkt der Hüllkurve
    const _x1 = x0 + aN; // Position nach der Attack-Phase
    const _x2 = _x1 + dN; // Position nach der Decay-Phase
    const _x3 = _x2 + sN; // Position nach der Sustain-Phase
    const _x4 = _x3 + rN; // Endpunkt nach der Release-Phase
    return { x0, x1: _x1, x2: _x2, x3: _x3, x4: _x4 };
});

const x1 = computed(() => segments_x.value.x1); // Ende der Attack-Phase
const x2 = computed(() => segments_x.value.x2); // Ende der Decay-Phase
const x3 = computed(() => segments_x.value.x3); // Ende der Sustain-Phase

// Berechnet den verbleibenden Pegel eines exponentiellen Abfalls
function exponentialRemaining(progress, steepness = 4) {
    const end = Math.exp(-steepness); // Restwert am Ende des Verlaufs
    return (Math.exp(-steepness * progress) - end) / (1 - end);
}

// Wandelt berechnete Punkte in SVG-Pfadsegmente um
function pointsToPath(points) {
    return points.map(({ x, y }) => `L ${x} ${y}`).join(" ");
}

// Stützpunkte für den exp. Decay
const decayPoints = computed(() => {
    const { x1, x2 } = segments_x.value;
    const pointCount = 24;

    return Array.from({ length: pointCount }, (_, index) => {
        const progress = (index + 1) / pointCount;
        const level = props.sustain
            + (1 - props.sustain) * exponentialRemaining(progress);

        return {
            x: x1 + (x2 - x1) * progress,
            y: pad.top + (1 - level) * iH,
        };
    });
});

// Stützpunkte für den exp. Release
const releasePoints = computed(() => {
    const { x3, x4 } = segments_x.value;
    const pointCount = 24;

    return Array.from({ length: pointCount }, (_, index) => {
        const progress = (index + 1) / pointCount;
        const level = props.sustain * exponentialRemaining(progress);

        return {
            x: x3 + (x4 - x3) * progress,
            y: pad.top + (1 - level) * iH,
        };
    });
});

// Baut den Pfad für Attack und Decay auf
const attackDecayPath = computed(() => {
    const { x0, x1 } = segments_x.value; // Liest Startpunkt und Ende der Attack-Phase aus
    return [
        `M ${x0} ${bottom}`, // Setzt den Pfadstart auf den unteren linken Punkt
        `L ${x1} ${pad.top}`, // Zeichnet den linearen Anstieg der Attack-Phase
        pointsToPath(decayPoints.value), // Fügt den exponentiellen Decay-Verlauf an
    ].join(" ");
});

// Baut den Pfad für den Release nach dem Loslassen der Taste auf
const releasePath = computed(() => {
    const { x3 } = segments_x.value; // Liest den Startpunkt der Release-Phase aus
    return [
        `M ${x3} ${sLevel.value}`, // Setzt den Pfadstart auf den Sustain-Pegel
        pointsToPath(releasePoints.value), // Fügt den exponentiellen Release-Verlauf an
    ].join(" ");
});

// Schließt den Kurvenverlauf zu einer füllbaren Fläche
const fillPath = computed(() => {
    const { x0, x1, x3, x4 } = segments_x.value;
    return [
        `M ${x0} ${bottom}`,
        `L ${x1} ${pad.top}`,
        pointsToPath(decayPoints.value),
        `L ${x3} ${sLevel.value}`,
        pointsToPath(releasePoints.value),
        `L ${x4} ${bottom}`,
        `L ${x0} ${bottom}`,
        "Z",
    ].join(" ");
});

// Liefert die farbigen Bereiche der vier Phasen
const segments = computed(() => {
    const { x0, x1, x2, x3, x4 } = segments_x.value;
    return [
        { x1: x0, x2: x1, color: colors.attack },
        { x1: x1, x2: x2, color: colors.decay },
        { x1: x2, x2: x3, color: colors.sustain },
        { x1: x3, x2: x4, color: colors.release },
    ];
});

// Positioniert die Kurzbezeichnungen mittig in ihren Phasen
const segLabels = computed(() => {
    const { x0, x1, x2, x3, x4 } = segments_x.value;
    return [
        { label: "A", x: (x0 + x1) / 2, color: colors.attack },
        { label: "D", x: (x1 + x2) / 2, color: colors.decay },
        { label: "S", x: (x2 + x3) / 2, color: colors.sustain },
        { label: "R", x: (x3 + x4) / 2, color: colors.release },
    ];
});

// Markiert Ende beziehungsweise Übergang jeder ADSR-Phase
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
