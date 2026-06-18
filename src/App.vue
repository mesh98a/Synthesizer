<template>
  <div class="synth-app">
    <div class="synth-main">
      <div class="placeholder-stage"> Bars</div>
      
      <div class="keyboard-area">
        <PianoKeyboard />
      </div>
    </div>

    <aside class="synth-sidebar">
      Settings
    </aside>
  </div>
</template>

<script setup>
import PianoKeyboard from './components/PianoKeyboard.vue';
</script>

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
  width: 300px;
  background-color: #241d15;
  border-left: 2px solid #0c0a07;
  padding: 20px;
}

.keyboard-area {
  height: 100px;
  background-color: #161310;
  position: relative;
  width: 100%;
}
</style>

<style>
html, body {
  margin: 0 ;
  padding: 0 ;
  width: 100vw;
  height: 100vh;
  background-color: #14110d;
  overflow: hidden;
}
</style>