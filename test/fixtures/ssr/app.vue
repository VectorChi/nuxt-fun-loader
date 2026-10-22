<template>
  <main>
    <FunLoader id="component" />
    <FunLoader
      id="override"
      theme="calm"
      icon="pulse"
      label="Saving"
      :interval="900"
      ordered
    />
    <FunLoader
      id="custom"
      :messages="['One moment…', 'Almost there…']"
    />
    <FunLoader
      id="toggle"
      :paused="on"
      :icon-only="on"
    />
    <button
      id="flip"
      @click="on = !on"
    >
      Flip
    </button>
    <fun-loader
      id="raw"
      theme="calm"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const on = ref(false)
</script>
