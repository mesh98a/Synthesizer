<template>
  <div>
    <button @click="play">Play</button>

    <div class="top_knobs">
      <Knob label="Oscillator" :categories="types" :value="type" color="#5b8fff" :ticks="types.length"
        @change="changeType" />
      <Knob label="Volume" color="#34d399" :min="-6" :max="6" :value="volume" @change="v => {
        volume = v
        if (synth) synth.volume.value = v
      }" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Tone from "tone";
import Knob from './Knob.vue'

const emit = defineEmits(["ready"]);
const type = ref("sine");

const types = [
  { value: "sine", label: "Sine" },
  { value: "square", label: "Square" },
  { value: "triangle", label: "Triangle" },
  { value: "sawtooth", label: "Sawtooth" },
];

let synth;
const volume = ref(-12);

// changeType bekommt den neuen Wert vom Knob-Event
const changeType = (newValue) => {
  type.value = newValue;
  if (synth) {
    synth.oscillator.type = newValue;
  }
};

const play = async () => {
  await Tone.start();
  synth.triggerAttackRelease("C4", "2n");
};

onMounted(() => {
  synth = new Tone.Synth({ oscillator: { type: type.value } });
  emit("ready", synth);
});
</script>

<style scoped>
.top_knobs {
  display: flex;
  gap: 48px;
}
</style>