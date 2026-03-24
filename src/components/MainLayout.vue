<template>
  <div class="main-layout">
    <button
      class="mobile-menu-trigger"
      type="button"
      aria-label="Open menu"
      @click="state.showMobileSidebar = true"
    >
      ☰
    </button>

    <Sidebar />
    <Scene />
    <CharacterPanel />
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue'
import Scene from './Scene.vue'
import CharacterPanel from './CharacterPanel.vue'
import { state } from '../stores/useAppStore'
</script>
