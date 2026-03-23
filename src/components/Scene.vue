<template>
  <main class="scene-area">
    <div class="scene-bg" :class="`scene-${state.currentScene}`" />
    <div class="scene-deco" />

    <div v-if="sceneUsers.length" class="scene-chars">
      <SceneCharacter
        v-for="character in sceneUsers"
        :key="character.id"
        :character="character"
        :selected="state.selectedId === character.id"
        :is-me="character.id === state.user?.uid"
        @select="state.selectedId = character.id"
      />
    </div>

    <div v-else class="empty-scene">
      <div class="eicon">◌</div>
      <div>No characters in this scene yet</div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SceneCharacter from './SceneCharacter.vue'
import { visibleUsers, state } from '../stores/useAppStore'

const sceneUsers = computed(() => {
  return visibleUsers.value.filter((character) => character.scene === state.currentScene)
})
</script>
