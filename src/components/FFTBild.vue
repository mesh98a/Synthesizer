<template>
    <section class="fft-panel">
        <button class="fft-header" type="button" @click="isOpen = !isOpen">
            <span>FFT-Spektrum</span>
            <span class="fft-header-meta">{{ isOpen ? 'Einklappen' : 'Ausklappen' }}</span>
        </button>

        <div class="fft-body" :class="{ open: isOpen }">
            <canvas ref="canvasRef" class="fft-canvas" />
        </div>
    </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import {
    fftAnalyserRef,
    getAudioSampleRate
} from "../utils/useAudioEngine.js";

const isOpen = ref(false);
const canvasRef = ref(null);

// Grenzen und Achsenmarken des Frequenzdiagramms
const MIN_FREQUENCY = 20;
const MAX_FREQUENCY = 20000;
const MIN_DECIBELS = -100;
const MAX_DECIBELS = 0;
const FREQUENCY_TICKS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
const DECIBEL_TICKS = [0, -20, -40, -60, -80, -100];

// Darstellungseinstellungen für Canvas und Spektrum
const CANVAS_HEIGHT = 190;
const SPECTRUM_STEP = 2;

// Abstände der eigentlichen Diagrammfläche zum Canvas-Rand
const PLOT = {
    left: 46,
    right: 14,
    top: 12,
    bottom: 28
};

let animationFrameId = 0;
let resizeObserver = null;

// Begrenzt einen Wert auf das übergebene Intervall
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

// Formatiert große Frequenzen kompakt in Kilohertz
function formatFrequency(frequency) {
    return frequency >= 1000 ? `${frequency / 1000}k` : String(frequency);
}

// Rechnet logarithmisch zwischen Frequenz und horizontaler Position um
function frequencyToX(frequency, left, width, maxFrequency) {
    const ratio = Math.log(frequency / MIN_FREQUENCY) / Math.log(maxFrequency / MIN_FREQUENCY);
    return left + ratio * width;
}

function xToFrequency(x, left, width, maxFrequency) {
    const ratio = clamp((x - left) / width, 0, 1);
    return MIN_FREQUENCY * Math.pow(maxFrequency / MIN_FREQUENCY, ratio);
}

// Überträgt Dezibelwerte auf die vertikale Diagrammachse
function decibelsToY(decibels, top, height) {
    const normalized = (clamp(decibels, MIN_DECIBELS, MAX_DECIBELS) - MIN_DECIBELS)
        / (MAX_DECIBELS - MIN_DECIBELS);
    return top + (1 - normalized) * height;
}

// Ermittelt den höchsten Messwert innerhalb eines Frequenzbands
function getBandPeak(values, startFrequency, endFrequency, nyquist) {
    const firstBin = clamp(
        Math.floor((startFrequency / nyquist) * values.length),
        0,
        values.length - 1
    );
    const lastBin = clamp(
        Math.ceil((endFrequency / nyquist) * values.length),
        firstBin,
        values.length - 1
    );

    let peak = MIN_DECIBELS;
    for (let index = firstBin; index <= lastBin; index += 1) {
        if (Number.isFinite(values[index])) {
            peak = Math.max(peak, values[index]);
        }
    }

    return clamp(peak, MIN_DECIBELS, MAX_DECIBELS);
}

// Plant das nächste Bild der fortlaufenden FFT-Animation
function drawNextFrame() {
    animationFrameId = requestAnimationFrame(draw);
}

// Passt die interne Auflösung des Canvas an Größe und Pixeldichte an
function resizeCanvas() {
    const canvas = canvasRef.value;
    if (!canvas || !canvas.parentElement) return;

    const width = canvas.parentElement.clientWidth;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(CANVAS_HEIGHT * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }
}

// Zeichnet die horizontalen Rasterlinien und ihre Dezibelwerte
function drawDecibelGrid(ctx, width, plotHeight) {
    DECIBEL_TICKS.forEach((decibels) => {
        const y = decibelsToY(decibels, PLOT.top, plotHeight);

        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.moveTo(PLOT.left, y);
        ctx.lineTo(width - PLOT.right, y);
        ctx.stroke();

        ctx.fillStyle = "#6b7a92";
        ctx.textAlign = "right";
        ctx.textBaseline = decibels === MAX_DECIBELS
            ? "top"
            : decibels === MIN_DECIBELS
                ? "bottom"
                : "middle";
        ctx.fillText(String(decibels), PLOT.left - 7, y);
    });
}

// Zeichnet die logarithmische Frequenzachse mit Rasterlinien
function drawFrequencyGrid(ctx, maxFrequency, plotWidth, baseY) {
    const ticks = FREQUENCY_TICKS.filter((frequency) => frequency <= maxFrequency);

    ticks.forEach((frequency, index) => {
        const x = frequencyToX(frequency, PLOT.left, plotWidth, maxFrequency);

        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.beginPath();
        ctx.moveTo(x, PLOT.top);
        ctx.lineTo(x, baseY);
        ctx.stroke();

        ctx.fillStyle = "#6b7a92";
        ctx.textAlign = index === 0 ? "left" : index === ticks.length - 1 ? "right" : "center";
        ctx.textBaseline = "top";
        ctx.fillText(formatFrequency(frequency), x, baseY + 7);
    });
}

// Wandelt die FFT-Messwerte in Punkte innerhalb der Diagrammfläche um
function createSpectrumPoints(values, maxFrequency, nyquist, plotWidth, plotHeight) {
    const points = [];
    const plotRight = PLOT.left + plotWidth;

    for (let x = PLOT.left; x <= plotRight; x += SPECTRUM_STEP) {
        const startFrequency = xToFrequency(x, PLOT.left, plotWidth, maxFrequency);
        const endX = Math.min(x + SPECTRUM_STEP, plotRight);
        const endFrequency = xToFrequency(endX, PLOT.left, plotWidth, maxFrequency);
        const decibels = getBandPeak(values, startFrequency, endFrequency, nyquist);

        points.push({
            x,
            y: decibelsToY(decibels, PLOT.top, plotHeight)
        });
    }

    return points;
}

// Zeichnet die farbige Spektrumfläche und ihre obere Begrenzungslinie
function drawSpectrum(ctx, points, baseY) {
    const gradient = ctx.createLinearGradient(0, PLOT.top, 0, baseY);
    gradient.addColorStop(0, "rgba(94, 234, 212, 0.75)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0.08)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, baseY);
    points.forEach(({ x, y }) => ctx.lineTo(x, y));
    ctx.lineTo(points.at(-1).x, baseY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    points.forEach(({ x, y }, index) => {
        index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#5eead4";
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// Zeichnet Achsen, Frequenzfläche und Spektrallinie in jedem Animationsbild
function draw() {
    const canvas = canvasRef.value;
    const analyser = fftAnalyserRef.value;

    if (!canvas) {
        drawNextFrame();
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        drawNextFrame();
        return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#090910";
    ctx.fillRect(0, 0, width, height);

    if (!isOpen.value || !analyser) {
        ctx.fillStyle = "#4b5563";
        ctx.font = "12px monospace";
        ctx.fillText("FFT aktivieren, um das Frequenzbild zu sehen", 16, height / 2);
        drawNextFrame();
        return;
    }

    const values = analyser.getValue();
    const sampleRate = getAudioSampleRate();
    // Die Nyquist-Grenze verhindert Frequenzen oberhalb der halben Abtastrate
    const nyquist = sampleRate / 2;
    const maxFrequency = Math.min(MAX_FREQUENCY, nyquist);
    const plotWidth = Math.max(1, width - PLOT.left - PLOT.right);
    const plotHeight = Math.max(1, height - PLOT.top - PLOT.bottom);
    const baseY = PLOT.top + plotHeight;

    ctx.font = "10px monospace";
    ctx.lineWidth = 1;
    drawDecibelGrid(ctx, width, plotHeight);
    drawFrequencyGrid(ctx, maxFrequency, plotWidth, baseY);

    // Fasst FFT-Bins pixelweise zu gut lesbaren Spitzenwerten zusammen
    const points = createSpectrumPoints(values, maxFrequency, nyquist, plotWidth, plotHeight);
    drawSpectrum(ctx, points, baseY);

    ctx.fillStyle = "#7c8aa5";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("dB", 8, PLOT.top);

    drawNextFrame();
}

onMounted(() => {
    resizeCanvas();
    draw();

    // Beobachtet Größenänderungen des Containers mit einem Browser-Fallback
    if (window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => resizeCanvas());
        if (canvasRef.value?.parentElement) {
            resizeObserver.observe(canvasRef.value.parentElement);
        }
    } else {
        window.addEventListener("resize", resizeCanvas);
    }
});

onUnmounted(() => {
    // Beendet Animation und Größenbeobachtung beim Entfernen der Komponente
    cancelAnimationFrame(animationFrameId);

    if (resizeObserver) {
        resizeObserver.disconnect();
    } else {
        window.removeEventListener("resize", resizeCanvas);
    }
});
</script>

<style scoped>
.fft-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    color: #e5eefb;
}

.fft-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #273044;
    border-radius: 12px;
    background: linear-gradient(180deg, #111522 0%, #0a0d14 100%);
    color: inherit;
    cursor: pointer;
    font-family: monospace;
    text-transform: uppercase;
    letter-spacing: 0.12em;
}

.fft-header-meta {
    font-size: 10px;
    color: #7c8aa5;
}

.fft-body {
    overflow: hidden;
    max-height: 0;
    opacity: 0;
    transform: translateY(-6px);
    transition: max-height 0.28s ease, opacity 0.22s ease, transform 0.22s ease;
    border: 1px solid transparent;
    border-radius: 14px;
}

.fft-body.open {
    max-height: 260px;
    opacity: 1;
    transform: translateY(0);
    border-color: #273044;
    background: #090910;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.fft-canvas {
    display: block;
    width: 100%;
    height: 190px;
}
</style>
