<template>
    <div class="adsr-panel">

        <!-- Vier Regler für die Hüllkurvenphasen -->
        <div class="knobs-row">
            <Knob v-for="def in ADSR_DEFS" :key="def.key" :label="def.label" :color="def.color" :value="values[def.key]"
                :min="def.min" :max="def.max" @change="(v) => (values[def.key] = v)" />
        </div>

        <!-- Grafische Darstellung der Hüllkurve -->
        <EnvelopeCurve :attack="values.attack" :decay="values.decay" :sustain="values.sustain"
            :release="values.release" />

        <!-- Numerische Ausgabe der aktuellen Werte -->
        <div class="readout-strip">
            <div v-for="def in ADSR_DEFS" :key="def.key" class="readout-cell">
                <div class="readout-label">{{ def.label.slice(0, 3) }}</div>
                <div class="readout-value" :style="{ color: def.color }">
                    {{ def.key === "sustain"
                        ? `${Math.round(values[def.key] * 100)}%`
                        : `${values[def.key].toFixed(2)}s`
                    }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import Knob from "./Knob.vue";
import EnvelopeCurve from "./EnvelopeCurve.vue";
import { ADSR_DEFS, adsrValues as values } from "../../utils/useADSR.js";
</script>

<style scoped>
.adsr-panel {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    padding: 36px 32px 32px;
    background: linear-gradient(160deg, #0d0d1a 0%, #080810 100%);
    border-radius: 24px;
    border: 1px solid #1a1a2c;
    box-shadow:
        0 0 0 1px #06060e,
        0 32px 64px rgba(0, 0, 0, 0.8),
        inset 0 1px 0 rgba(255, 255, 255, 0.04);
    font-family: "Inter", system-ui, sans-serif;
    user-select: none;
}

.knob-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
}

.panel-title {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #33334a;
    font-family: monospace;
    font-weight: 600;
}

.knobs-row {
    display: flex;
    gap: 24px;
    align-items: flex-start;
}

.readout-strip {
    display: flex;
    gap: 20px;
}

.readout-cell {
    text-align: center;
}

.readout-label {
    font-size: 9px;
    color: #333350;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: monospace;
}

.readout-value {
    font-size: 12px;
    font-family: monospace;
    font-weight: 700;
    margin-top: 2px;
}
</style>
