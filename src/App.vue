<script setup>
import { ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import PianoKeyboard from './components/PianoKeyboard.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <div class="synth-app" :class="{ 'sidebar-open': sidebarOpen }">
    <div class="synth-main">
      <div class="placeholder-stage"> Bars</div>
      
      <div class="keyboard-area">
        <PianoKeyboard />
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
  margin-right: 0;
  transition: margin-right 0.35s ease;
}

.synth-app.sidebar-open .synth-main {
  margin-right: 640px;
}

.placeholder-stage {
  flex: 1;
  background-color: #0a0807;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid #241d15;
}

.synth-sidebar {
  width: 0;
  flex: 0 0 auto;
}

.keyboard-area {
  height: 100px;
  background-color: #161310;
  position: relative;
  width: 100%;
}
</style>