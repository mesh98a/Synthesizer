# Synthesizer

Ein interaktiver polyfoner Synthesizer für den Browser, entwickelt mit Vue 3, Vite und Tone.js. Das Projekt verbindet eine spielbare Klaviatur mit Klangregelung und mehreren Echtzeitvisualisierungen

## Funktionen

- Spielbare Klaviatur mit 88 Tasten von A0 bis C8
- Polyfone Klangerzeugung mit Tone.js
- Vier wählbare Wellenformen
- ADSR-Hüllkurve für Attack, Decay, Sustain und Release
- Animierte Notenbalken über der Klaviatur
- Darstellung der aktuellen Ausgangswellenform
- FFT-Frequenzspektrum von 20 Hz bis 20 kHz

## Voraussetzungen

- Node.js
- npm

## Installation

Repository herunterladen oder klonen und anschließend die Abhängigkeiten installieren

```bash
npm install
```

## Entwicklung

Lokalen Entwicklungsserver starten

```bash
npm run dev
```

Die von Vite ausgegebene Adresse anschließend im Browser öffnen

## Projektstruktur

```text
src/
├── App.vue
├── main.js
├── components/
│   ├── FFTBild.vue
│   ├── PianoKeyboard.vue
│   ├── VisualStage.vue
│   ├── SoundSettings.vue
│   └── sidebar/
│       ├── ADSRPanel.vue
│       ├── EnvelopeCurve.vue
│       ├── Knob.vue
│       ├── Oscillator.vue
│       ├── Sidebar.vue
│       └── WaveformDisplay.vue
└── utils/
    ├── useADSR.js
    ├── useAudioEngine.js
    └── useSynthSettings.js
```

## Aufbau der Audioverarbeitung

```text
Klaviatur
    ↓
Tone.PolySynth
    ├── Oszillator
    ├── ADSR-Hüllkurve
    └── Lautstärke
         ↓
    Audioausgang
         ├── Wellenform-Analyse
         └── FFT-Analyse
```

`useAudioEngine.js` erstellt den Synthesizer und verbindet ihn mit den beiden Analysegeräten. Die reaktiven Einstellungen aus `useSynthSettings.js` und `useADSR.js` werden automatisch an den laufenden Synthesizer übertragen

## Autoren
Artur Meshalkin, Damian Welc

## Lizenzsverweis

Diese Software wird „wie besehen“ bereitgestellt, ohne jegliche Garantie oder Gewährleistung. Die Nutzung erfolgt auf
eigene Verantwortung. Der Ersteller übernimmt keine Haftung für Schäden oder Probleme, die durch die Verwendung dieser
Software entstehen.

Dieses Projekt ist lizenziert unter der [CC BY 4.0 Lizenz]( https://creativecommons.org/licenses/by/4.0/)