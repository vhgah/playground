<template>
  <svg viewBox="0 0 80 128" aria-hidden="true">
    <rect x="18" y="54" width="44" height="42" rx="16" :fill="character.outfitColor" />
    <rect x="24" y="88" width="12" height="30" rx="6" fill="#1f2937" />
    <rect x="44" y="88" width="12" height="30" rx="6" fill="#1f2937" />
    <rect x="20" y="58" width="8" height="28" rx="4" :fill="character.skinTone" />
    <rect x="52" y="58" width="8" height="28" rx="4" :fill="character.skinTone" />
    <circle cx="40" cy="34" r="20" :fill="character.skinTone" />
    <path
      d="M22 32c0-13 8-22 18-22s18 9 18 22v4c-6-5-12-7-18-7s-12 2-18 7v-4Z"
      :fill="character.hairColor"
    />
    <circle cx="33" cy="35" r="2" fill="#111827" />
    <circle cx="47" cy="35" r="2" fill="#111827" />
    <path d="M34 44c2 2 10 2 12 0" stroke="#7c2d12" stroke-width="2.5" stroke-linecap="round" />
  </svg>
</template>

<script setup lang="ts">
import type { CharacterRecord } from '../stores/useAppStore'

defineProps<{
  character: CharacterRecord
}>()
</script>
