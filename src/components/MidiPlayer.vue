<template>
    <div class="midi-player">
        <label class="midi-load-btn">
            Datei laden
            <input type="file" accept=".mid,.midi" @change="handleFileChange" hidden />
        </label>

        <span v-if="fileName" class="midi-filename">{{ fileName }}</span>

        <button
            class="midi-play-btn"
            :disabled="!midiLoaded"
            @click="togglePlayback"
        >
            {{ isPlaying ? 'Pause' : 'Play' }}
        </button>

        <button
            class="midi-stop-btn"
            :disabled="!midiLoaded"
            @click="stopPlayback"
        >
            Stop
        </button>
    </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import * as Tone from 'tone'
import { Midi } from '@tonejs/midi'

const props = defineProps({
    keyboardRef: {
        type: Object,
        default: null
    }
})

const fileName = ref('')
const midiLoaded = ref(false)
const isPlaying = ref(false)
const currentlyPlayingNotes = new Set()
const transport = Tone.getTransport()

let scheduledEventIds = []

// Liest die Datei ein und parst sie in Noten-Events
async function handleFileChange(event) {
    const file = event.target.files[0]
    if (!file) return

    stopPlayback()

    const arrayBuffer = await file.arrayBuffer()
    const midi = new Midi(arrayBuffer)

    fileName.value = file.name
    scheduleNotes(midi)
    midiLoaded.value = true
}

// Plant jede Note der MIDI-Datei auf der Transport-Zeitachse ein
function scheduleNotes(midi) {
    clearSchedule()

    midi.tracks.forEach((track) => {
        track.notes.forEach((note) => {
            const onId = transport.schedule((time) => {
                currentlyPlayingNotes.add(note.name)
                props.keyboardRef?.playNote(note.name)
            }, note.time)

            const offId = transport.schedule((time) => {
                currentlyPlayingNotes.delete(note.name)
                props.keyboardRef?.stopNote(note.name)
            }, note.time + note.duration)

            scheduledEventIds.push(onId, offId)
        })
    })
}

// Entfernt alle geplanten Events von der Transport-Zeitachse
function clearSchedule() {
    scheduledEventIds.forEach((id) => transport.clear(id))
    scheduledEventIds = []
}

// Startet oder pausiert die Wiedergabe
async function togglePlayback() {
    if (Tone.getContext().state !== 'running') {
        await Tone.start()
    }

    
    if (isPlaying.value) {
        // Pausiert
        transport.pause()
        isPlaying.value = false
        
        currentlyPlayingNotes.forEach((note) => {
            props.keyboardRef?.stopNote(note)   
        })
        currentlyPlayingNotes.clear()

    } else {
        // Startet
        transport.start()
        isPlaying.value = true
    }
}

// Stoppt die Wiedergabe komplett und setzt die Zeitachse zurück
function stopPlayback() {
    transport.stop()
    isPlaying.value = false

    currentlyPlayingNotes.forEach((note) => {
        props.keyboardRef?.stopNote(note)   
    })
    currentlyPlayingNotes.clear()
}

onUnmounted(() => {
    clearSchedule()
    transport.stop()
    currentlyPlayingNotes.forEach((note) => {
        props.keyboardRef?.stopNote(note)
    })
    currentlyPlayingNotes.clear()
})
</script>

<style scoped>
.midi-player {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    background-color: #1c1814;
    border-bottom: 1px solid #241d15;
    flex-shrink: 0;
}

.midi-load-btn,
.midi-play-btn,
.midi-stop-btn {
    padding: 6px 14px;
    background: #2b251f;
    color: #f3eee2;
    border: 1px solid #3a332a;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.midi-load-btn:hover,
.midi-play-btn:hover:not(:disabled),
.midi-stop-btn:hover:not(:disabled) {
    background: #3a332a;
}

.midi-play-btn:disabled,
.midi-stop-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.midi-filename {
    font-size: 12px;
    color: #8c826e;
    font-family: monospace;
}
</style>