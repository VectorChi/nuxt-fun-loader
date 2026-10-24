<template>
  <main>
    <h1>fun-loader playground</h1>
    <p class="note">
      Every loader here is <code>&lt;FunLoader&gt;</code> unless marked. App-wide defaults from
      <code>nuxt.config.ts</code>: <code>{{ defaultsText }}</code>.
    </p>

    <section>
      <h2>Long request</h2>
      <p class="note">
        Messages change after 8 and 20 seconds of waiting. Start a fake request and watch them switch.
      </p>
      <div class="row">
        <button
          type="button"
          @click="running ? finish() : start()"
        >
          {{ running ? 'Finish request' : 'Simulate long request' }}
        </button>
        <span
          v-if="running"
          class="clock"
        >{{ elapsed }} s, {{ stage }}</span>
      </div>
      <div class="demo">
        <FunLoader
          v-if="running"
          theme="dev"
        />
        <span v-else-if="finished">Done.</span>
      </div>
    </section>

    <section>
      <h2>Themes</h2>
      <div
        v-for="theme in themes"
        :key="theme"
        class="demo theme"
      >
        <code>{{ theme }}</code>
        <FunLoader :theme="theme" />
      </div>
    </section>

    <section>
      <h2>Icons</h2>
      <div
        v-for="icon in icons"
        :key="icon"
        class="demo theme"
      >
        <code>{{ icon }}</code>
        <FunLoader
          theme="calm"
          :icon="icon"
        />
      </div>
    </section>

    <section>
      <h2>Per-loader overrides</h2>
      <div class="demo">
        <code>icon="globe" :interval="1200"</code>
        <FunLoader
          theme="kitchen"
          icon="globe"
          :interval="1200"
        />
      </div>
      <div class="demo">
        <code>:messages="steps" ordered</code>
        <FunLoader
          :messages="steps"
          ordered
        />
      </div>
      <div class="demo">
        <code>icon-only label="Saving"</code>
        <button
          type="button"
          disabled
        >
          <FunLoader
            icon="spinner"
            icon-only
            label="Saving"
          />
          Save
        </button>
      </div>
      <div class="demo">
        <code>:paused="{{ paused }}"</code>
        <FunLoader
          theme="calm"
          :paused="paused"
        />
        <button
          type="button"
          @click="paused = !paused"
        >
          {{ paused ? 'Resume' : 'Pause' }}
        </button>
      </div>
      <div class="demo">
        <code>raw &lt;fun-loader&gt;, no app defaults</code>
        <fun-loader theme="design" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, ref } from 'vue'
import { ICONS } from '@vectorchi/fun-loader/element'
import { DEFAULTS_KEY } from '../src/runtime/app/defaults'

// A constant, not an inline array: a new array on every render restarts the rotation.
const steps = ['Checking your cart…', 'Reserving your seats…', 'Finishing up…']
const themes = ['thinking', 'dev', 'design', 'art', 'calm', 'finance', 'kitchen', 'transfer']
const icons = ICONS
// What the module's plugin provides from funLoader.defaults.
const defaultsText = JSON.stringify(inject(DEFAULTS_KEY, {}))

const paused = ref(false)
const running = ref(false)
const finished = ref(false)
const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const stage = computed(() => elapsed.value >= 20 ? 'very long wait lines' : elapsed.value >= 8 ? 'long wait lines' : 'regular lines')

function start() {
  elapsed.value = 0
  finished.value = false
  running.value = true
  timer = setInterval(() => elapsed.value++, 1000)
}

function finish() {
  clearInterval(timer)
  running.value = false
  finished.value = true
}

onBeforeUnmount(() => clearInterval(timer))
</script>

<style>
body { font: 16px/1.5 system-ui, sans-serif; margin: 0; color: #222; background: #fff; }
main { max-width: 44rem; margin: 0 auto; padding: 2rem 1rem; }
h2 { margin-top: 2.5rem; font-size: 1.1rem; }
.note { color: #555; }
.row { display: flex; gap: 1rem; align-items: center; }
.clock { color: #555; font-variant-numeric: tabular-nums; }
.demo { display: flex; gap: 1rem; align-items: center; min-height: 2.5rem; flex-wrap: wrap; }
.theme code, .demo > code { min-width: 9rem; color: #666; font-size: .85rem; }
button { font: inherit; padding: .35rem .8rem; display: inline-flex; gap: .5rem; align-items: center; }
@media (prefers-color-scheme: dark) {
  body { color: #eee; background: #111; }
  .note, .clock, .theme code, .demo > code { color: #aaa; }
}
</style>
