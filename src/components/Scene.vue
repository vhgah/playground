<template>
  <main class="scene-area">
    <div class="scene-bg" :class="`scene-${state.currentScene}`" />
    <div class="scene-deco" v-html="sceneDeco" />

    <div v-if="sceneUsers.length" class="scene-chars">
      <SceneCharacter
        v-for="character in sceneUsers"
        :key="character.id"
        :character="character"
        :selected="state.selectedId === character.id"
        :is-me="character.id === state.user?.uid"
        @select="selectCharacter(character.id)"
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

const SCENE_DECO: Record<string, string> = {
  office: `
    <div style="position:absolute;top:6%;left:4%;width:110px;height:140px;background:rgba(200,220,255,.18);border:3px solid rgba(255,255,255,.25);border-radius:3px">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(135,195,235,.3) 50%,rgba(255,255,255,.1) 50%)"></div>
      <div style="position:absolute;top:0;left:50%;width:2px;height:100%;background:rgba(255,255,255,.25)"></div>
    </div>
    <div style="position:absolute;top:6%;right:5%;width:160px;height:100px;background:rgba(245,245,245,.88);border-radius:4px;border:3px solid #9a8a78;display:flex;align-items:center;justify-content:center;font-size:2rem;opacity:.5">📊</div>
    <div style="position:absolute;bottom:28%;left:6%;font-size:2.5rem;opacity:.5">🪴</div>
    <div style="position:absolute;bottom:28%;right:7%;font-size:2rem;opacity:.4">🗑️</div>`,
  home: `
    <div style="position:absolute;top:8%;right:6%;width:140px;height:90px;background:#1a1a2e;border-radius:8px;border:4px solid #444;display:flex;align-items:center;justify-content:center;font-size:2.5rem;opacity:.55">📺</div>
    <div style="position:absolute;top:8%;left:5%;width:100px;height:130px;background:rgba(200,220,255,.2);border:3px solid rgba(255,255,255,.3);border-radius:3px">
      <div style="position:absolute;top:10px;left:10px;right:10px;bottom:10px;background:rgba(135,195,235,.4)"></div>
    </div>
    <div style="position:absolute;bottom:28%;left:6%;font-size:2.5rem;opacity:.55">🛋️</div>
    <div style="position:absolute;bottom:28%;right:6%;font-size:2rem;opacity:.5">🪴</div>`,
  beach: `
    <div style="position:absolute;top:6%;right:10%;font-size:4rem;opacity:.65">☀️</div>
    <div style="position:absolute;bottom:28%;left:4%;font-size:3rem;opacity:.6">🌴</div>
    <div style="position:absolute;bottom:28%;right:4%;font-size:3rem;opacity:.6">🌴</div>
    <div style="position:absolute;bottom:25%;left:50%;transform:translateX(-50%);font-size:2rem;opacity:.5">⛱️</div>
    <div style="position:absolute;bottom:14%;left:50%;transform:translateX(-50%);font-size:1.5rem;opacity:.4">🌊🌊🌊</div>`,
  cafe: `
    <div style="position:absolute;top:7%;left:5%;font-size:2rem;opacity:.5">☕</div>
    <div style="position:absolute;top:7%;right:5%;font-size:1.5rem;opacity:.4">🎵</div>
    <div style="position:absolute;bottom:28%;left:5%;font-size:2rem;opacity:.55">🪑</div>
    <div style="position:absolute;bottom:28%;right:5%;font-size:2rem;opacity:.55">🪑</div>
    <div style="position:absolute;bottom:28%;left:50%;transform:translateX(-50%);width:60px;height:8px;background:rgba(120,80,40,.6);border-radius:2px"></div>`,
  park: `
    <div style="position:absolute;top:6%;left:50%;transform:translateX(-50%);font-size:2rem;opacity:.4">☁️ ☁️</div>
    <div style="position:absolute;top:8%;left:8%;font-size:3rem;opacity:.6">🌳</div>
    <div style="position:absolute;top:8%;right:8%;font-size:3rem;opacity:.6">🌳</div>
    <div style="position:absolute;bottom:28%;left:4%;font-size:2.5rem;opacity:.55">🌻</div>
    <div style="position:absolute;bottom:28%;right:4%;font-size:2rem;opacity:.55">🦆</div>
    <div style="position:absolute;bottom:25%;left:50%;transform:translateX(-50%);font-size:2rem;opacity:.5">🪑</div>`,
}

const sceneUsers = computed(() => {
  return visibleUsers.value.filter((character) => character.scene === state.currentScene)
})

const sceneDeco = computed(() => SCENE_DECO[state.currentScene] || '')

function selectCharacter(characterId: string) {
  state.selectedId = characterId
  state.showCharPanel = true
}
</script>
