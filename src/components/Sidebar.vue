<template>
    <div class="sidebar-wrapper" :class="{ open: isOpen }">
        <!-- Arrow Toggle -->
        <button class="sidebar-toggle" :class="{ open: isOpen }" @click="isOpen = !isOpen; emit('toggle', isOpen)">
            <span :class="{ rotated: isOpen }">❯</span>
        </button>

        <!-- Sidebar -->
        <div class="sidebar" :class="{ open: isOpen }">
            <canvas ref="canvasRef" width="600" height="200" class="wave-window" />
            <Oscillator @ready="setSynth" />
            <ADSRPanel />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as Tone from "tone";
import Oscillator from "./Oscillator.vue";
import ADSRPanel from "./ADSRPanel.vue";
import { analyserRef } from '../utils/useAudioEngine.js';

const emit = defineEmits(['toggle']);

const canvasRef = ref(null);
const isOpen = ref(false);

let synth;
let analyser;
let animationFrameId;

const setSynth = (s) => {
    synth = s;

    analyser = new Tone.Analyser("waveform", 1024);
    synth.connect(analyser);
    synth.toDestination();

    draw();
};

const draw = () => {
    const canvas = canvasRef.value;
    if (!canvas || !analyserRef.value) {
        animationFrameId = requestAnimationFrame(draw);
        return;
    }

    const ctx = canvas.getContext("2d");
    const values = analyserRef.value.getValue();

    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    for (let i = 0; i < values.length; i++) {
        const x = (i / values.length) * canvas.width;
        const y = ((values[i] + 1) / 2) * canvas.height;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
    animationFrameId = requestAnimationFrame(draw);
};

onMounted(() => {
    draw(); // startet den Loop sofort, wartet intern auf analyserRef
});

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
});

</script>

<style scoped>
.sidebar-wrapper {
    position: relative;
    width: 0;
    height: 100vh;
    transition: width 0.35s ease;
    overflow: visible;
    z-index: 1000;
}

.sidebar-wrapper.open {
    width: 640px;
}

.sidebar {
    width: 640px;
    height: 100%;

    background: #1e1e2f;
    color: white;

    border-left: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);

    padding: 24px;
    overflow-y: auto;
    backdrop-filter: blur(10px);

    box-sizing: border-box;
}

/* Pfeil sitzt links an der Sidebar */
.sidebar-toggle {
    position: absolute;
    left: -50px;
    top: 50%;
    transform: translateY(-50%);

    width: 50px;
    height: 80px;

    border: none;
    cursor: pointer;

    background: #4f46e5;
    color: white;

    border-radius: 12px 0 0 12px;
    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.2);

    transition: all 0.3s ease;
}

.sidebar-toggle:hover {
    background: #6366f1;
}

.sidebar-toggle span {
    display: inline-block;
    font-size: 24px;
    transition: transform 0.3s ease;
}

.sidebar-toggle span.rotated {
    transform: rotate(180deg);
}
.wave-window {
    background: #111827;
    border: 1px solid #374151;
    border-radius: 12px;

    margin-bottom: 20px;

    box-shadow:
        inset 0 0 10px rgba(0,0,0,0.4),
        0 4px 12px rgba(0,0,0,0.2);
}

.wave-window canvas {
    display: block;
    width: 100%;
    height: auto;
    background: #000;
    border-radius: 8px;
}
</style>