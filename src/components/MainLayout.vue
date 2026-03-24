<template>
  <div style="display: contents">
    <Sidebar />
    <Scene />
    <CharacterPanel />
    <button
      v-if="!state.showCharPanel"
      class="btn-icon panel-open-btn"
      type="button"
      @click="state.showCharPanel = true"
    >
      ☰
    </button>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Scene from './Scene.vue'
import CharacterPanel from './CharacterPanel.vue'
import { state } from '../stores/useAppStore'
</script>
