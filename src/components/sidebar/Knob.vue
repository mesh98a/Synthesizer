<template>
    <div class="knob-wrapper">
        <!-- Interaktiver Bereich des Drehreglers -->
        <div class="knob-container" @mousedown="startDrag" @touchstart.prevent="startDrag">
            <!-- Skalenstriche rund um den Regler -->
            <div v-for="(tk, i) in ticks" :key="i" class="tick" :style="{
                left: tk.x + 'px',
                top: tk.y + 'px',
                width: (tk.isActive ? 12 : 9) + 'px',
                background: tk.isActive ? color : '#1e1e30',
                boxShadow: tk.isActive ? `0 0 6px ${color}99` : 'none',
                transform: `translate(-50%, -50%) rotate(${tk.deg + 90}deg)`,
            }" />

            <!-- Drehbarer Reglerkörper -->
            <div class="knob-body" :style="{
                transform: `rotate(${rotation}deg)`,
            }">
                <div class="knob-shine" />
                <div class="knob-marker" />
                <div class="knob-pip" />
            </div>
        </div>

        <!-- Bezeichnung der aktiven Kategorie oder numerischer Wert -->
        <div class="knob-value">
            <template v-if="categories">
                {{categories.find(c => c.value === value)?.label ?? value}}
            </template>
            <template v-else>
                {{ typeof value === 'number' ? value.toFixed(2) : value }}
            </template>
        </div>

        <!-- Beschriftung des Reglers -->
        <div class="knob-label">{{ label }}</div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";

// Eigenschaften und geometrische Konstanten
const props = defineProps({
    label: { type: String, required: true },
    color: { type: String, required: true },
    value: [Number, String],

    min: { type: Number, },
    max: { type: Number },
    categories: {
        type: Array,
        default: null,
    },
    ticks: { type: Number, default: 11 },
});

const MIN_DEG = -135;
const MAX_DEG = 135;
const RANGE = MAX_DEG - MIN_DEG;
const R = 38;
const C = 2 * Math.PI * R;
const ARC = C * 0.75;
const ARC_OFFSET = C * 0.125;
const TICK_RADIUS = 54;
const TICKS = props.ticks;

const emit = defineEmits(["change"]);

// Eindeutige Kennung für mögliche Farbverläufe
const gradId = computed(() => `grad-${props.label}`);

// Normalisiert Kategorien oder Zahlenwerte auf den Bereich von null bis eins
const categoryCount = computed(() => props.categories?.length ?? 0);

const norm = computed(() => {
    if (props.categories) {
        const idx = props.categories.findIndex(c => c.value === props.value);
        const i = idx === -1 ? 0 : idx;
        return categoryCount.value > 1 ? i / (categoryCount.value - 1) : 0;
    }
    return (props.value - props.min) / (props.max - props.min);
})

const rotation = computed(() => MIN_DEG + norm.value * RANGE);
const fillLen = computed(() => ARC * norm.value);

// Berechnet Position und Aktivzustand jedes Skalenstrichs
const ticks = computed(() =>
    Array.from({ length: TICKS }, (_, i) => {
        const t = i / (TICKS - 1);
        const deg = MIN_DEG + t * RANGE;
        const rad = (deg - 90) * (Math.PI / 180);
        const x = 60 + TICK_RADIUS * Math.cos(rad);
        const y = 60 + TICK_RADIUS * Math.sin(rad);
        return { x, y, deg, isActive: t <= norm.value, t };
    })
);

// Steuert Maus- und Touchbewegungen während des Ziehens
const isDragging = ref(false);
const startY = ref(0);
const startVal = ref(0);

function startDrag(e) {
    isDragging.value = true;
    startY.value = e.clientY;
    startVal.value = props.value;

    function onMove(ev) {
        if (!isDragging.value) return;
        ev.preventDefault();
        const y = ev.clientY;
        const delta = (startY.value - y) / 160;

        if (props.categories) {
            // Rastet bei kategorialen Werten auf dem nächsten Eintrag ein
            const currentIdx = props.categories.findIndex(c => c.value === startVal.value);
            const rawIdx = currentIdx + delta * (categoryCount.value - 1);
            const clampedIdx = Math.round(Math.max(0, Math.min(categoryCount.value - 1, rawIdx)));
            emit("change", props.categories[clampedIdx].value);
        } else {
            // Begrenzt numerische Werte auf den erlaubten Bereich
            const next = Math.max(
                props.min,
                Math.min(props.max, startVal.value + delta * (props.max - props.min))
            );
            emit("change", next);
        }
    }

    function onUp() {
        // Entfernt globale Ereignisse nach Abschluss der Interaktion
        isDragging.value = false;
        globalThis.removeEventListener("mousemove", onMove);
        globalThis.removeEventListener("touchmove", onMove);
        globalThis.removeEventListener("mouseup", onUp);
        globalThis.removeEventListener("touchend", onUp);
    }

    globalThis.addEventListener("mousemove", onMove);
    globalThis.addEventListener("touchmove", onMove, { passive: false });
    globalThis.addEventListener("mouseup", onUp);
    globalThis.addEventListener("touchend", onUp);
}
</script>

<style scoped>
.knob-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.knob-container {
    position: relative;
    width: 120px;
    height: 120px;
    cursor: grab;
    user-select: none;
}

.tick {
    position: absolute;
    height: 3px;
    border-radius: 2px;
    pointer-events: none;
}

.knob-body {
    position: absolute;
    inset: 22px;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 32%, #35354e, #0e0e18);
    transition: transform 0.05s ease;
    will-change: transform;
}

.knob-marker {
    position: absolute;
    top: 8%;
    left: 50%;
    transform: translateX(-50%);
    width: 3px;
    height: 30%;
    border-radius: 2px;
    background: linear-gradient(to bottom, white, v-bind(color));
    box-shadow: 0 0 8px v-bind(color);
}

.knob-pip {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #12121e;
    border: 1px solid #252535;
}

.knob-value {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
}

.knob-label {
    font-size: 14px;
    color: #555577;
}
</style>
