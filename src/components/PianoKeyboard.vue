<template>
  <div class="keyboard-container">
    <div
      v-for="key in keys"
      :key="key.note"
      :class="['piano-key',  
                key.isBlack ? 'key-black' : 'key-white',
                { 'is-active': activeNotes.has(key.note) }
                ]"
      :style="{ left: key.left + '%', width: key.width + '%' }"
      @mousedown="playNote(key.note)"
      @mouseup="stopNote(key.note)"
      @mouseleave="stopNote(key.note)"
    >
      <span v-if="!key.isBlack && key.note.startsWith('C')" class="key-label">
        {{ key.note }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as Tone from 'tone';

const props = defineProps({
  activeNotes: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['keys-generated', 'note-on', 'note-off']);

const keys = ref([]);
const notesOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

let polySynth = null;

function generate88Keys() {
  const generatedKeys = [];

  // 1. octave 0
  generatedKeys.push({ note: 'A0', isBlack: false });
  generatedKeys.push({ note: 'A#0', isBlack: true });
  generatedKeys.push({ note: 'B0', isBlack: false });

  // 2. octave 1 to 7
  for (let oct = 1; oct <= 7; oct++) {
    notesOrder.forEach(noteName => {
      generatedKeys.push({
        note: noteName + oct,
        isBlack: noteName.includes('#')
      });
    });
  }

  // 3. Octave 8
  generatedKeys.push({ note: 'C8', isBlack: false });

  // 4. positioning of keys
  const whiteKeys = generatedKeys.filter(k => !k.isBlack);
  const totalWhiteWidth = 100 / whiteKeys.length;
  const blackWidth = totalWhiteWidth * 0.6;

  let whiteIndex = 0;

  generatedKeys.forEach((key, index) => {
    if (!key.isBlack) {
      key.left = whiteIndex * totalWhiteWidth;
      key.width = totalWhiteWidth;
      whiteIndex++;
    } else {
      key.left = (whiteIndex * totalWhiteWidth) - (blackWidth / 2);
      key.width = blackWidth;
    }
  });

  keys.value = generatedKeys;

  emit('keys-generated', generatedKeys);
}

// TONE-FUNCTIONS
async function playNote(note) {
  if (props.activeNotes.has(note)) return;
  
  if (Tone.context.state !== 'running') await Tone.start();
  

  if (polySynth) {
    polySynth.triggerAttack(note);
    emit('note-on', note);
    //TEST - MULTIPLE KEYS PRESSED
    //props.activeNotes.add('C3');
    //polySynth.triggerAttack('C3');
    //props.activeNotes.add('D3');
    //polySynth.triggerAttack('D3');
  }
}

function stopNote(note) {
  //release if note is  active
  if (polySynth && props.activeNotes.has(note)) {
    polySynth.triggerRelease(note);
    emit('note-off', note);
  }
}

onMounted(() => {
  generate88Keys();
  polySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'triangle' //'triangle','sine', 'sawtooth' , 'square'
    }
  }).toDestination();
});

onUnmounted(() => {
  if (polySynth) {
    polySynth.dispose();
  }
});
</script>

<style scoped>
.keyboard-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #14110d;
  overflow: hidden;
}

.piano-key {
  position: absolute;
  top: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 15px;
  box-sizing: border-box;
  border-radius: 0 0 4px 4px;
  user-select: none;
  cursor: pointer;
  transition: background-color 0.1s ease;
}

.key-white {
  height: 100%;
  background: #f3eee2;
  border-left: 1px solid #bfb7a6;
  border-right: 1px solid #bfb7a6;
  border-bottom: 1px solid #bfb7a6;
  z-index: 1;
}

.key-white:hover {
  background: #e5dfd0;
}

.key-white:active, .piano-key.key-white.is-active {
  background: #ff4747 !important;
}

.key-black {
  height: 62%;
  background: #1c1814;
  border: 1px solid #000;
  box-shadow: inset 0px -4px 4px rgba(0,0,0,0.4);
  z-index: 2;
}

.key-black:hover {
  background: #2b251f;
}

.key-black:active, .piano-key.key-black.is-active {
  background: #b33232 !important;
}

.key-label {
  font-size: 9px;
  font-family: monospace;
  font-weight: bold;
  color: #8c826e;
  pointer-events: none;
}
</style>