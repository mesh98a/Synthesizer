import { shallowRef, watch } from 'vue'
import * as Tone from 'tone'
import { adsrValues } from './useADSR.js'
import { synthSettings } from './useSynthSettings.js'

// Stellt Synthesizer und Analysegeräte komponentenübergreifend bereit
export const polySynthRef = shallowRef(null)
export const analyserRef = shallowRef(null)
export const fftAnalyserRef = shallowRef(null)

let stopSettingsWatchers = []

// Erstellt den Synthesizer einmalig und verbindet beide Analysegeräte
export function initializeAudioEngine() {
    if (polySynthRef.value) return

    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: synthSettings.oscillatorType },
        envelope: { ...adsrValues }
    }).toDestination()
    synth.volume.value = synthSettings.volume

    const waveformAnalyser = new Tone.Analyser('waveform', 1024)
    const fftAnalyser = new Tone.Analyser({
        type: 'fft',
        size: 1024,
        smoothing: 0.8
    })

    synth.connect(waveformAnalyser)
    synth.connect(fftAnalyser)

    polySynthRef.value = synth
    analyserRef.value = waveformAnalyser
    fftAnalyserRef.value = fftAnalyser

    // Überträgt Änderungen der Oberfläche direkt an den laufenden Synthesizer
    stopSettingsWatchers = [
        watch(adsrValues, (value) => {
            polySynthRef.value?.set({ envelope: { ...value } })
        }, { deep: true }),
        watch(() => synthSettings.oscillatorType, (type) => {
            polySynthRef.value?.set({ oscillator: { type } })
        }),
        watch(() => synthSettings.volume, (volume) => {
            if (polySynthRef.value) {
                polySynthRef.value.volume.value = volume
            }
        })
    ]
}

// Startet eine Note und aktiviert bei Bedarf den Browser-Audiokontext
export async function noteOn(note) {
    const synth = polySynthRef.value
    if (!synth) return false

    if (Tone.context.state !== 'running') {
        await Tone.start()
    }

    synth.triggerAttack(note)
    return true
}

// Beendet die angegebene Note
export function noteOff(note) {
    const synth = polySynthRef.value
    if (!synth) return false

    synth.triggerRelease(note)
    return true
}

// Liefert die aktuelle Abtastrate für die Frequenzdarstellung
export function getAudioSampleRate() {
    return Tone.context.sampleRate
}

// Gibt Beobachter und Audio-Ressourcen vollständig frei
export function disposeAudioEngine() {
    stopSettingsWatchers.forEach((stop) => stop())
    stopSettingsWatchers = []

    polySynthRef.value?.releaseAll()
    polySynthRef.value?.dispose()
    analyserRef.value?.dispose()
    fftAnalyserRef.value?.dispose()

    polySynthRef.value = null
    analyserRef.value = null
    fftAnalyserRef.value = null
}
