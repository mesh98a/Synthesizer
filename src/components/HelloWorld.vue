<script setup>
import { ref } from 'vue'

const msg = "Hello World"
const count = ref(0)
</script>

<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="count++">Count is: {{ count }}</button>
  </div>
</template>

<style scoped>
.hello {
  text-align: center;
  margin-top: 50px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #42b883; 
  margin-bottom: 20px;
}

button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  background-color: #369870;
  transform: scale(1.05);
}


</style>
