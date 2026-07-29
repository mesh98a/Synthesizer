<template>
    <div class="stage-container">
        <canvas ref="canvasRef"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
    activeNotes: {
        type: Object,
        required: true
    },
    keys: {
        type: Array,
        required: true
    }
});

const canvasRef = ref(null);
let ctx = null;
let animationFrameId = null;

const liveBars = new Map();
const fallingBars = [];
const speed = 4;

const whiteKeyBarColor = '#f1c40f';
const blackKeyBarColor = '#d4a600';

// Resize handler
function resizeCanvas() {
    if (!canvasRef.value || !canvasRef.value.parentElement) return;
    canvasRef.value.width = canvasRef.value.parentElement.clientWidth;
    canvasRef.value.height = canvasRef.value.parentElement.clientHeight;
}

watch(() => props.activeNotes, (newNotes) => {
    if (!canvasRef.value) return;

    // Start a bar when pressing a key
    newNotes.forEach(note => {
        if (!liveBars.has(note)) {
            const keyInfo = props.keys.find(k => k.note === note);
            if (keyInfo) {
                // Converting parent percentage width/position into true pixel values
                // Makes sure that note rectangles align over the keyboard layout below.
                const x = (keyInfo.left / 100) * canvasRef.value.width;
                const width = (keyInfo.width / 100) * canvasRef.value.width;

                liveBars.set(note, {
                    x,
                    width,
                    y: canvasRef.value.height,
                    height: 0,                  // starts as a flat bar
                    isBlack: keyInfo.isBlack
                });
            }
        }
    });

    // Bar falls uppon key release
    liveBars.forEach((bar, note) => {
        if (!newNotes.has(note)) {
            fallingBars.push(bar);
            liveBars.delete(note);
        }
    });
}, { deep: true });

function setBarColor(isBlackKey) {
    ctx.fillStyle = isBlackKey ? blackKeyBarColor : whiteKeyBarColor;
}

let lastTime = performance.now();

function render(now) {
    // dt converts miliseconds into seconds
    // assures through delta time that higher FPS doesnt result in faster moving bars
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    const pixelsPerSecond = 240; // speed

    ctx.fillStyle = '#0a0807';
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height);


    liveBars.forEach((bar) => {
        const delta = pixelsPerSecond * dt;
        bar.y -= delta;
        bar.height += delta;
        setBarColor(bar.isBlack);
        ctx.fillRect(bar.x, bar.y, bar.width, bar.height);
    });

    for (let i = fallingBars.length - 1; i >= 0; i--) {
        const bar = fallingBars[i];
        bar.y -= pixelsPerSecond * dt;
        setBarColor(bar.isBlack);
        ctx.fillRect(bar.x, bar.y, bar.width, bar.height);

        // Removes bars that move off screen
        if (bar.y + bar.height < 0) fallingBars.splice(i, 1);
    }

    animationFrameId = requestAnimationFrame(render);
}

onMounted(() => {
    ctx = canvasRef.value.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(render);
});

onUnmounted(() => {
    window.removeEventListener('resize', resizeCanvas);
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
});
</script>

<style scoped>
.stage-container {
    width: 100%;
    height: 100%;
    position: relative;
}

canvas {
    display: block;
    width: 100%;
    height: 100%;
}
</style>
