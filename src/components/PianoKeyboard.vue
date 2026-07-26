<template>
    <div class="keyboard-container">
        <div v-for="key in keys" :key="key.note" :class="[
            'piano-key',
            key.isBlack ? 'key-black' : 'key-white',
            { 'is-active': activeNotes.has(key.note) }
        ]" :style="{ left: key.left + '%', width: key.width + '%' }" @mousedown="playNote(key.note)"
            @mouseup="stopNote(key.note)" @mouseleave="stopNote(key.note)">
            <span v-if="!key.isBlack && key.note.startsWith('C')" class="key-label">
                {{ key.note }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
    disposeAudioEngine,
    initializeAudioEngine,
    noteOff,
    noteOn
} from '../utils/useAudioEngine.js'

const props = defineProps({
    activeNotes: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['keys-generated', 'note-on', 'note-off'])

const keys = ref([])
const notesOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function generate88Keys() {
    const generatedKeys = [
        { note: 'A0', isBlack: false },
        { note: 'A#0', isBlack: true },
        { note: 'B0', isBlack: false }
    ]

    for (let octave = 1; octave <= 7; octave++) {
        notesOrder.forEach((noteName) => {
            generatedKeys.push({
                note: noteName + octave,
                isBlack: noteName.includes('#')
            })
        })
    }

    generatedKeys.push({ note: 'C8', isBlack: false })

    const whiteKeyCount = generatedKeys.filter((key) => !key.isBlack).length
    const whiteWidth = 100 / whiteKeyCount
    const blackWidth = whiteWidth * 0.6
    let whiteIndex = 0

    generatedKeys.forEach((key) => {
        if (key.isBlack) {
            key.left = whiteIndex * whiteWidth - blackWidth / 2
            key.width = blackWidth
        } else {
            key.left = whiteIndex * whiteWidth
            key.width = whiteWidth
            whiteIndex++
        }
    })

    keys.value = generatedKeys
    emit('keys-generated', generatedKeys)
}

async function playNote(note) {
    if (props.activeNotes.has(note)) return

    if (await noteOn(note)) {
        emit('note-on', note)
    }
}

function stopNote(note) {
    if (props.activeNotes.has(note) && noteOff(note)) {
        emit('note-off', note)
    }
}

onMounted(() => {
    generate88Keys()
    initializeAudioEngine()
})

onUnmounted(() => {
    disposeAudioEngine()
})
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

.key-white:active,
.piano-key.key-white.is-active {
    background: #ff4747 !important;
}

.key-black {
    height: 62%;
    background: #1c1814;
    border: 1px solid #000;
    box-shadow: inset 0 -4px 4px rgba(0, 0, 0, 0.4);
    z-index: 2;
}

.key-black:hover {
    background: #2b251f;
}

.key-black:active,
.piano-key.key-black.is-active {
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
