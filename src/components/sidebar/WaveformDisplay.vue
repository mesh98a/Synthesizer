<template>
    <!-- Zeigt die aktuelle Ausgangswellenform des Synthesizers -->
    <canvas ref="canvasRef" width="600" height="200" class="wave-window" />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { analyserRef } from "../../utils/useAudioEngine.js";

const canvasRef = ref(null);

let animationFrameId;

// Zeichnet die aktuelle Wellenform in das Canvas
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
    // Startet die Schleife sofort und wartet intern auf analyserRef
    draw();
});

onUnmounted(() => {
    // Stoppt die Zeichenschleife beim Entfernen der Komponente
    cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
.wave-window {
    display: block;
    width: 100%;
    height: auto;
    margin-bottom: 20px;
    background: #111827;
    border: 1px solid #374151;
    border-radius: 12px;
    box-shadow:
        inset 0 0 10px rgba(0, 0, 0, 0.4),
        0 4px 12px rgba(0, 0, 0, 0.2);
}
</style>
