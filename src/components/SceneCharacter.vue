<template>
  <div
    class="char-in-scene"
    :class="{ sel: selected, 'is-me': isMe }"
    @click="$emit('select')"
  >
    <span class="state-badge">{{ stateMeta.icon }} {{ stateMeta.label }}</span>
    <CharacterAvatar class="char-scene-svg" :character="character" />
    <div class="char-scene-name">{{ character.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CharacterAvatar from './CharacterAvatar.vue'
import type { CharacterRecord } from '../stores/useAppStore'
import { CHARACTER_STATE_META } from '../constants/states'

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
