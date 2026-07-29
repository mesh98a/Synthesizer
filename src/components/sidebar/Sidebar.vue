<template>
    <div class="sidebar-wrapper" :class="{ open: isOpen }">
        <!-- Button zum Öffnen und Schließen -->
        <button class="sidebar-toggle" :class="{ open: isOpen }" @click="isOpen = !isOpen; emit('toggle', isOpen)">
            <span :class="{ rotated: isOpen }">❯</span>
        </button>

        <!-- Seitenleiste mit Wellenform und Klangreglern -->
        <div class="sidebar" :class="{ open: isOpen }">
            <WaveformDisplay />
            <Oscillator />
            <ADSRPanel />
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import WaveformDisplay from "./WaveformDisplay.vue";
import Oscillator from "./Oscillator.vue";
import ADSRPanel from "./ADSRPanel.vue";

const emit = defineEmits(['toggle']);

const isOpen = ref(false);

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

.sidebar-toggle {
    position: absolute;
    left: -32px;
    top: 50%;
    transform: translateY(-50%);

    width: 32px;
    height: 56px;

    border: none;
    cursor: pointer;

    background: #4f46e5;
    color: white;

    border-radius: 8px 0 0 8px;
    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.2);

    transition: all 0.3s ease;
}

.sidebar-toggle:hover {
    background: #6366f1;
}

.sidebar-toggle span {
    display: inline-block;
    font-size: 18px;
    transition: transform 0.3s ease;
}

.sidebar-toggle span.rotated {
    transform: rotate(180deg);
}
</style>
