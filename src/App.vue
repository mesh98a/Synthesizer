<script setup>
import { ref } from 'vue'
import Sidebar from './components/sidebar/Sidebar.vue'
import PianoKeyboard from './components/PianoKeyboard.vue'
import FFTBild from './components/FFTBild.vue'
import VisualStage from './components/VisualStage.vue'

const sidebarOpen = ref(false)
const activeNotes = ref(new Set())
const sharedKeys = ref([])

// Übernimmt die berechneten Tastenpositionen für die visuelle Bühne
function handleKeysGenerated(keysData) {
  sharedKeys.value = keysData
}

// Hält die Menge der aktuell gedrückten Noten synchron
function handleNoteOn(note) {
  activeNotes.value.add(note)
}

function handleNoteOff(note) {
  activeNotes.value.delete(note)
}
</script>

<template>
  <div class="synth-app" :class="{ 'sidebar-open': sidebarOpen }">
    <div class="synth-main">
      <div class="placeholder-stage">
        <VisualStage :active-notes="activeNotes" :keys="sharedKeys" />
      </div>

      <div class="keyboard-area">
        <PianoKeyboard
          :active-notes="activeNotes"
          @keys-generated="handleKeysGenerated"
          @note-on="handleNoteOn"
          @note-off="handleNoteOff"
        />
      </div>

      <div class="fft-area">
        <FFTBild />
      </div>
    </div>

    <aside class="synth-sidebar">
      <Sidebar @toggle="sidebarOpen = $event" />
    </aside>
  </div>
</template>

<style scoped>
.synth-app {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #14110d;
  color: #f3eee2;
  font-family: sans-serif;
  overflow: hidden;
}

.synth-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

.placeholder-stage {
  flex: 1;
  min-height: 0;
  background-color: #0a0807;
  position: relative;
  border-bottom: 2px solid #241d15;
}

.synth-sidebar {
  flex: 0 0 auto;
  height: 100%;
}

.keyboard-area {
  height: 160px;
  background-color: #161310;
  position: relative;
  width: 100%;
}

.fft-area {
  padding: 0 18px 18px;
  background: linear-gradient(180deg, #161310 0%, #100e0b 100%);
  border-top: 1px solid #241d15;
}
</style>

<style>
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background-color: #14110d;
  overflow: hidden;
}
</style>
