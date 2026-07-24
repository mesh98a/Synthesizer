<template>
  <section class="fft-panel">
    <button class="fft-header" type="button" @click="isOpen = !isOpen">
      <span>FFT-Spektrum</span>
      <span class="fft-header-meta">{{ isOpen ? 'Einklappen' : 'Ausklappen' }}</span>
    </button>

    <div class="fft-body" :class="{ open: isOpen }">
      <canvas ref="canvasRef" class="fft-canvas" />
      <div class="fft-caption">
        <span>0 Hz</span>
        <span>Frequenzen</span>
        <span>Nyquist</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { fftAnalyserRef } from "../utils/useAudioEngine.js";

const isOpen = ref(false);
const canvasRef = ref(null);

let animationFrameId = 0;
let resizeObserver = null;

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas || !canvas.parentElement) return;

  const width = canvas.parentElement.clientWidth;
  const height = 190;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
}

function draw() {
  const canvas = canvasRef.value;
  const analyser = fftAnalyserRef.value;

  if (!canvas) {
    animationFrameId = requestAnimationFrame(draw);
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    animationFrameId = requestAnimationFrame(draw);
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
    animationFrameId = requestAnimationFrame(draw);
    return;
  }

  const values = analyser.getValue();
  const barGap = 2;
  const barWidth = Math.max(2, (width - 24 - barGap * (values.length - 1)) / values.length);
  const graphHeight = height - 44;
  const baseY = graphHeight + 18;

  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = 14 + (graphHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(12, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
  }

  values.forEach((value, index) => {
    const normalized = Number.isFinite(value) ? Math.max(0, Math.min(1, (value + 100) / 100)) : 0;
    const barHeight = normalized * graphHeight;
    const x = 12 + index * (barWidth + barGap);
    const y = baseY - barHeight;

    const hue = 170 + Math.round((index / Math.max(1, values.length - 1)) * 80);
    const gradient = ctx.createLinearGradient(0, y, 0, baseY);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 68%, 0.95)`);
    gradient.addColorStop(1, `hsla(${hue}, 100%, 48%, 0.35)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth, barHeight);
  });

/*   ctx.fillStyle = "#93c5fd";
  ctx.font = "10px monospace";
  ctx.fillText("Frequenzen", 12, height - 8);
  ctx.fillText("0", 12, height - 22);
  ctx.fillText("Hz", width - 28, height - 22); */

  animationFrameId = requestAnimationFrame(draw);
}

onMounted(() => {
  resizeCanvas();
  draw();

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

.fft-caption {
  display: flex;
  justify-content: space-between;
  padding: 0 12px 10px;
  font-size: 10px;
  font-family: monospace;
  color: #6b7a92;
}
</style>