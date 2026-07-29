<template>
    <div>
        <div class="oscillator-panel">
            <!-- Auswahl der Wellenform und Einstellung der Lautstärke -->
            <div class="top_controls">
                <div class="oscillator-group">
                    <div class="control-label">Oscillator</div>
                    <div class="radio-list">
                        <label v-for="type in types" :key="type.value" class="radio-option">
                            <input v-model="synthSettings.oscillatorType" type="radio" name="oscillator-type"
                                :value="type.value" />
                            <span class="radio-dot"></span>
                            <span class="radio-text">{{ type.label }}</span>
                        </label>
                    </div>
                </div>

                <div class="volume-group">
                    <div class="control-label">Volume</div>
                    <div class="slider-row">
                        <input v-model.number="synthSettings.volume" class="volume-slider" type="range" min="-24" max="6"
                            step="0.2" aria-label="Volume" />
                        <div class="volume-value">{{ synthSettings.volume.toFixed(1) }} dB</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { synthSettings } from '../../utils/useSynthSettings.js'

// Unterstützte Oszillatorformen für die Radioauswahl
const types = [
    { value: "sine", label: "Sine" },
    { value: "square", label: "Square" },
    { value: "triangle", label: "Triangle" },
    { value: "sawtooth", label: "Sawtooth" },
];
</script>

<style scoped>
.top_controls {
    display: flex;
    gap: 22px;
    align-items: flex-start;
}

.oscillator-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex: 1 1 auto;
}

.volume-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 160px;
}

.oscillator-panel {
    padding: 18px;
    border-radius: 16px;
    border: 1px solid rgba(91, 143, 255, 0.18);
    background: linear-gradient(180deg,
            rgba(18, 22, 38, 0.96),
            rgba(11, 14, 25, 0.96));
    margin-bottom: 28px;
    /* Abstand zum ADSR-Panel */
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}


/* .slider-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(91, 143, 255, 0.14);
  background: linear-gradient(180deg, rgba(18, 22, 38, 0.95), rgba(11, 14, 25, 0.95));
} */

.volume-slider {
    width: 100%;
    accent-color: #5b8fff;
    cursor: pointer;
}

.volume-value {
    font-size: 12px;
    font-weight: 600;
    color: #f3eee2;
    letter-spacing: 0.02em;
    text-align: right;
}

.control-label {
    font-size: 14px;
    color: #555577;
}

.radio-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
    width: 100%;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(91, 143, 255, 0.14);
    background: linear-gradient(180deg, rgba(18, 22, 38, 0.95), rgba(11, 14, 25, 0.95));
    color: #f3eee2;
    cursor: pointer;
    user-select: none;
    transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.radio-option:hover {
    transform: translateY(-1px);
    border-color: rgba(91, 143, 255, 0.35);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.22);
}

.radio-option:has(input:checked) {
    border-color: rgba(91, 143, 255, 0.65);
    background: linear-gradient(180deg, rgba(28, 38, 66, 0.98), rgba(13, 18, 31, 0.98));
    box-shadow: 0 0 0 1px rgba(91, 143, 255, 0.14), 0 10px 22px rgba(0, 0, 0, 0.25);
}

.radio-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    accent-color: #5b8fff;
}

.radio-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(243, 238, 226, 0.35);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 0 0 2px rgba(11, 14, 25, 0.9);
    flex: 0 0 auto;
}

.radio-option:has(input:checked) .radio-dot {
    background: #5b8fff;
    border-color: #9ab7ff;
    box-shadow: 0 0 10px rgba(91, 143, 255, 0.6);
}

.radio-text {
    line-height: 1;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.02em;
}
</style>
