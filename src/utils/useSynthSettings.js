import { reactive } from "vue";

// Gemeinsame Klangeinstellungen für Oberfläche und Audio-Engine
export const synthSettings = reactive({
    oscillatorType: "triangle", 
    volume: -12,
});
