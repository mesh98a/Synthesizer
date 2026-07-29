<template>
    <!-- Zeigt die aktuelle Ausgangswellenform des Synthesizers -->
    <canvas
        ref="canvasRef"
        width="600"
        height="200"
        class="wave-window"
        role="img"
    />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { analyserRef } from "../../utils/useAudioEngine.js";

const canvasRef = ref(null);

let animationFrameId;

const plot = {
    left: 42,
    right: 14,
    top: 14,
    bottom: 28,
};

const drawAxes = (ctx, canvas) => {
    const plotWidth = canvas.width - plot.left - plot.right;
    const plotHeight = canvas.height - plot.top - plot.bottom;
    const centerY = plot.top + plotHeight / 2;

    ctx.save();
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1;

    // Dezente Hilfslinien für positive, neutrale und negative Amplitude
    for (const level of [1, 0.5, 0, -0.5, -1]) {
        const y = plot.top + ((1 - level) / 2) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(plot.left, y);
        ctx.lineTo(plot.left + plotWidth, y);
        ctx.stroke();
    }

    // Amplituden- und Zeitachse
    ctx.strokeStyle = "rgba(203, 213, 225, 0.65)";
    ctx.beginPath();
    ctx.moveTo(plot.left, plot.top);
    ctx.lineTo(plot.left, plot.top + plotHeight);
    ctx.moveTo(plot.left, centerY);
    ctx.lineTo(plot.left + plotWidth, centerY);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText("+1", plot.left - 7, plot.top);
    ctx.fillText("0", plot.left - 7, centerY);
    ctx.fillText("-1", plot.left - 7, plot.top + plotHeight);

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("amplitude", plot.left + 6, plot.top + 4);

    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("time →", plot.left + plotWidth, canvas.height - 7);
    ctx.restore();
};

// Zeichnet die aktuelle Wellenform in das Canvas
const draw = () => {
    const canvas = canvasRef.value;
    if (!canvas || !analyserRef.value) {
        animationFrameId = requestAnimationFrame(draw);
        return;
    }

    const ctx = canvas.getContext("2d");
    const values = analyserRef.value.getValue();
    const plotWidth = canvas.width - plot.left - plot.right;
    const plotHeight = canvas.height - plot.top - plot.bottom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxes(ctx, canvas);

    ctx.save();
    ctx.beginPath();
    ctx.rect(plot.left, plot.top, plotWidth, plotHeight);
    ctx.clip();

    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < values.length; i++) {
        const x = plot.left + (i / (values.length - 1)) * plotWidth;
        const y = plot.top + ((1 - values[i]) / 2) * plotHeight;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }

    ctx.stroke();
    ctx.restore();
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
