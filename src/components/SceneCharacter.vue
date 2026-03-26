<template>
  <div
    class="char-in-scene"
    :class="{ sel: selected, 'is-me': isMe }"
    @click="$emit('select')"
  >
    <span
      class="state-badge"
      :class="{ clickable: character.state === 'music' && !!character.nowPlaying?.url }"
      @click.stop="character.state === 'music' && character.nowPlaying?.url && window.open(character.nowPlaying.url, '_blank')"
    ><span class="state-badge-text">{{ stateMeta.icon }} {{ character.state === 'music' && character.nowPlaying ? character.nowPlaying.title : stateMeta.label }}</span></span>
    <CharacterAvatar class="char-scene-svg" :character="character" />
    <div class="char-scene-name">{{ character.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CharacterAvatar from './CharacterAvatar.vue'
import type { CharacterRecord } from '../stores/useAppStore'
import { CHARACTER_STATE_META } from '../constants/states'

const window = globalThis.window

const props = defineProps<{
  character: CharacterRecord
  selected: boolean
  isMe: boolean
}>()

defineEmits<{
  select: []
}>()

const stateMeta = computed(() => {
  return CHARACTER_STATE_META[props.character.state] || { label: 'Relaxing', icon: '😊' }
})
</script>
