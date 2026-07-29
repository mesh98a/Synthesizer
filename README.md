# Synthesizer

Ein interaktiver polyfoner Synthesizer für den Browser, entwickelt mit Vue 3, Vite und Tone.js. Das Projekt verbindet eine spielbare Klaviatur mit Klangregelung und mehreren Echtzeitvisualisierungen

## Funktionen

- Spielbare Klaviatur mit 88 Tasten von A0 bis C8
- Polyfone Klangerzeugung mit Tone.js
- Vier wählbare Wellenformen
- ADSR-Hüllkurve für Attack, Decay, Sustain und Release
- Laden und Abspielen von MIDI-Dateien (`.mid` und `.midi`)
- Wiedergabesteuerung für MIDI mit Play, Pause und Stop
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
│   ├── MidiPlayer.vue
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
Klaviatur ────────┐
                  ├── Notenereignisse
MIDI-Player ──────┘
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

## MIDI-Wiedergabe

Der MIDI-Player befindet sich in `MidiPlayer.vue`. Über die Schaltfläche **Datei laden** können lokale Dateien im Format `.mid` oder `.midi` ausgewählt werden. Die Bibliothek `@tonejs/midi` liest die Datei ein und wandelt ihre Spuren in einzelne Notenereignisse um.

```text
MIDI-Datei
    ↓
@tonejs/midi
    ↓
Spuren und Noten
    ↓
Tone.Transport
    ├── Note On  → Ton starten
    └── Note Off → Ton beenden
         ↓
PianoKeyboard.vue
    ├── Klangerzeugung
    └── Visualisierung der aktiven Taste
```

`Tone.Transport` plant Startzeit und Dauer jeder Note. **Play** startet oder setzt die Wiedergabe fort, **Pause** hält sie an und **Stop** beendet sie und setzt die Position an den Anfang zurück. Die MIDI-Noten verwenden denselben Synthesizer und dieselben ADSR- und Oszillatoreinstellungen wie die manuell gespielte Klaviatur.

## Quellen

- [Vue.js Dokumentation](https://vuejs.org/guide/introduction.html)
- [Tone.js Dokumentation](https://tonejs.github.io/)
- [Web Audio API – AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- [Grundlagen zu MIDI und Synthesizern](https://digitalsoundandmusic.com/chapters/ch6/)
- [Modulare analoge Synthesizer](https://habr.com/ru/articles/236703/)
- [Synthesizer-Tutorial auf YouTube](https://www.youtube.com/watch?v=yy2nQuEAjls)

## Autoren

Artur Meshalkin, Damian Welc

## Lizenzsverweis

Diese Software wird „wie besehen“ bereitgestellt, ohne jegliche Garantie oder Gewährleistung. Die Nutzung erfolgt auf
eigene Verantwortung. Der Ersteller übernimmt keine Haftung für Schäden oder Probleme, die durch die Verwendung dieser
Software entstehen.

Dieses Projekt ist lizenziert unter der [CC BY 4.0 Lizenz](https://creativecommons.org/licenses/by/4.0/).
