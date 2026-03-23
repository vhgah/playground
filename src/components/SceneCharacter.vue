<template>
  <div
    class="char-in-scene"
    :class="{ sel: selected, 'is-me': isMe }"
    @click="$emit('select')"
  >
    <span class="state-badge">{{ stateMeta.label }}</span>
    <CharacterAvatar class="char-scene-svg" :character="character" />
    <div class="char-scene-name">{{ character.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CharacterAvatar from './CharacterAvatar.vue'
import type { CharacterRecord } from '../stores/useAppStore'

const props = defineProps<{
  character: CharacterRecord
  selected: boolean
  isMe: boolean
}>()

defineEmits<{
  select: []
}>()

const stateMeta = computed(() => {
  const labels: Record<string, string> = {
    idle: 'Idle',
    coding: 'Coding',
    meeting: 'Meeting',
    focus: 'Focus',
    break: 'Break',
    offline: 'Offline',
  }

  return { label: labels[props.character.state] || 'Idle' }
})
</script>
