<template>
  <svg viewBox="0 0 100 180" aria-hidden="true">
    <g v-html="avatarSvg" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CharacterRecord } from '../stores/useAppStore'

const props = defineProps<{
  character: CharacterRecord
}>()

function shiftHex(hex: string, amt: number) {
  const raw = hex.startsWith('#') ? hex.slice(1) : hex
  if (raw.length !== 6) return '#000000'

  const r = Math.max(0, Math.min(255, parseInt(raw.slice(0, 2), 16) + amt))
  const g = Math.max(0, Math.min(255, parseInt(raw.slice(2, 4), 16) + amt))
  const b = Math.max(0, Math.min(255, parseInt(raw.slice(4, 6), 16) + amt))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

const avatarSvg = computed(() => {
  const c = props.character
  const sk = c.skinTone || '#f1c27d'
  const hc = c.hairColor || '#1f2937'
  const tc = c.outfitColor || '#6366f1'
  const bc = shiftHex(tc, -52)
  const dk = (color: string, amount: number) => shiftHex(color, -amount)

  const hairStyles = {
    female: `<ellipse cx="50" cy="39" rx="23" ry="14" fill="${hc}"/>
             <rect x="26" y="41" width="9" height="36" rx="4" fill="${hc}"/>
             <rect x="65" y="41" width="9" height="36" rx="4" fill="${hc}"/>
             <ellipse cx="50" cy="76" rx="22" ry="6" fill="${hc}"/>`,
    male: `<ellipse cx="50" cy="40" rx="23" ry="14" fill="${hc}"/>
           <rect x="27" y="40" width="8" height="14" rx="4" fill="${hc}"/>
           <rect x="65" y="40" width="8" height="14" rx="4" fill="${hc}"/>`,
    other: `<ellipse cx="50" cy="38" rx="23" ry="15" fill="${hc}"/>
            <circle cx="30" cy="40" r="7" fill="${hc}"/>
            <circle cx="70" cy="40" r="7" fill="${hc}"/>
            <circle cx="38" cy="30" r="7" fill="${hc}"/>
            <circle cx="62" cy="30" r="7" fill="${hc}"/>
            <circle cx="50" cy="27" r="7" fill="${hc}"/>
            <rect x="27" y="42" width="8" height="12" rx="4" fill="${hc}"/>
            <rect x="65" y="42" width="8" height="12" rx="4" fill="${hc}"/>`,
  } as const

  let eyes = `<circle cx="40" cy="62" r="3" fill="#333"/><circle cx="60" cy="62" r="3" fill="#333"/>
              <circle cx="41" cy="61" r="1" fill="#fff"/><circle cx="61" cy="61" r="1" fill="#fff"/>`
  let mouth = `<path d="M43,73 Q50,78 57,73" stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`
  let arms = `<path d="M26,98 C18,112 16,126 19,134" stroke="${sk}" stroke-width="7" fill="none" stroke-linecap="round"/>
              <path d="M74,98 C82,112 84,126 81,134" stroke="${sk}" stroke-width="7" fill="none" stroke-linecap="round"/>`
  let acc = ''

  if (c.state === 'coding') {
    mouth = `<path d="M44,73 Q50,76 56,73" stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`
    arms = `<path d="M26,98 C22,114 24,128 28,138" stroke="${sk}" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M74,98 C78,114 76,128 72,138" stroke="${sk}" stroke-width="7" fill="none" stroke-linecap="round"/>`
    acc = `<rect x="16" y="132" width="68" height="38" rx="4" fill="#2d3748" stroke="#4a5568" stroke-width="1"/>
           <rect x="18" y="134" width="64" height="26" rx="3" fill="#0f172a"/>
           <rect x="20" y="137" width="22" height="2" rx="1" fill="#6366f1" opacity=".9"/>
           <rect x="20" y="141" width="34" height="2" rx="1" fill="#10b981" opacity=".9"/>
           <rect x="20" y="149" width="40" height="2" rx="1" fill="#f59e0b" opacity=".8"/>
           <rect x="16" y="170" width="68" height="6" rx="2" fill="#374151"/>`
  } else if (c.state === 'meeting') {
    mouth = `<path d="M44,73 Q50,76 56,73" stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`
    acc = `<rect x="30" y="122" width="40" height="50" rx="4" fill="#f1f5f9"/>
           <rect x="38" y="118" width="24" height="10" rx="3" fill="#e2e8f0"/>
           <rect x="33" y="130" width="30" height="2" rx="1" fill="#94a3b8"/>
           <rect x="33" y="136" width="26" height="2" rx="1" fill="#94a3b8"/>
           <rect x="33" y="142" width="30" height="2" rx="1" fill="#94a3b8"/>`
  } else if (c.state === 'music') {
    eyes = `<path d="M37,63 Q40,59 43,63" stroke="#333" fill="none" stroke-width="2"/>
               <path d="M57,63 Q60,59 63,63" stroke="#333" fill="none" stroke-width="2"/>`
    mouth = `<path d="M43,73 Q50,79 57,73" stroke="#c0392b" fill="none" stroke-width="2" stroke-linecap="round"/>`
    acc = `<path d="M20,57 Q50,14 80,57" stroke="${hc}" fill="none" stroke-width="6" stroke-linecap="round"/>
               <ellipse cx="18" cy="58" rx="9" ry="11" fill="#374151"/>
               <ellipse cx="82" cy="58" rx="9" ry="11" fill="#374151"/>
               <ellipse cx="18" cy="58" rx="5" ry="7"  fill="#4a5568"/>
               <ellipse cx="82" cy="58" rx="5" ry="7"  fill="#4a5568"/>
               <text x="76" y="48" font-size="13" fill="#f59e0b">♪</text>
               <text x="83" y="35" font-size="10" fill="#818cf8">♫</text>
               <text x="70" y="32" font-size="9"  fill="#ec4899">♩</text>`
  } else if (c.state === 'reading') {
    eyes = `<path d="M37,63 Q40,60 43,63" stroke="#333" fill="none" stroke-width="2"/>
            <path d="M57,63 Q60,60 63,63" stroke="#333" fill="none" stroke-width="2"/>`
    acc = `<rect x="20" y="128" width="60" height="42" rx="4" fill="#8B4513"/>
           <line x1="50" y1="128" x2="50" y2="170" stroke="#6B3410" stroke-width="2"/>
           <rect x="22" y="130" width="26" height="38" rx="2" fill="#fef9f0"/>
           <rect x="52" y="130" width="26" height="38" rx="2" fill="#fef9f0"/>`
  } else if (c.state === 'sleeping') {
    eyes = `<path d="M37,62 Q40,58 43,62" stroke="#333" fill="none" stroke-width="2"/>
            <path d="M57,62 Q60,58 63,62" stroke="#333" fill="none" stroke-width="2"/>`
    mouth = `<path d="M45,74 Q50,71 55,74" stroke="#c0392b" fill="none" stroke-width="1.5" stroke-linecap="round"/>`
    acc = `<text x="64" y="46" font-size="10" fill="#94a3b8" font-weight="bold">z</text>
           <text x="70" y="36" font-size="14" fill="#94a3b8" font-weight="bold" opacity=".75">z</text>`
  } else if (c.state === 'eating') {
    mouth = `<ellipse cx="50" cy="74" rx="5" ry="4" fill="#c0392b"/>`
    acc = `<ellipse cx="50" cy="152" rx="24" ry="12" fill="#e2e8f0"/>
           <ellipse cx="50" cy="148" rx="24" ry="10" fill="#f97316"/>
           <path d="M26,148 Q50,138 74,148" fill="#fed7aa"/>`
  } else if (c.state === 'gaming') {
    acc = `<rect x="24" y="138" width="52" height="28" rx="14" fill="#374151"/>
           <circle cx="36" cy="150" r="7" fill="#4a5568"/>
           <circle cx="62" cy="146" r="3.5" fill="#ef4444"/>
           <circle cx="68" cy="152" r="3.5" fill="#3b82f6"/>
           <circle cx="56" cy="152" r="3.5" fill="#10b981"/>`
  } else if (c.state === 'workout') {
    eyes = `<path d="M37,61 Q40,57 43,61" stroke="#333" fill="none" stroke-width="2"/>
               <path d="M57,61 Q60,57 63,61" stroke="#333" fill="none" stroke-width="2"/>`
    mouth = `<path d="M43,73 Q50,79 57,73" stroke="#c0392b" fill="none" stroke-width="2" stroke-linecap="round"/>`
    arms = `<path d="M26,98 C16,90 12,80 16,134" stroke="${sk}" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M74,98 C84,90 88,80 84,134" stroke="${sk}" stroke-width="7" fill="none" stroke-linecap="round"/>`
    acc = `<rect x="8"  y="132" width="84" height="8" rx="4" fill="#4a5568"/>
            <rect x="6"  y="126" width="14" height="20" rx="7" fill="#374151"/>
            <rect x="9"  y="129" width="7"  height="14" rx="3" fill="#6b7280"/>
            <rect x="80" y="126" width="14" height="20" rx="7" fill="#374151"/>
            <rect x="84" y="129" width="7"  height="14" rx="3" fill="#6b7280"/>
            <path d="M76,48 Q78,54 76,58 Q74,54 76,48" fill="#93c5fd" opacity=".8"/>`
  }

  const top = `<rect x="24" y="91" width="52" height="46" rx="7" fill="${dk(tc, 12)}"/>
               <rect x="8" y="89" width="22" height="22" rx="8" fill="${dk(tc, 12)}"/>
               <rect x="70" y="89" width="22" height="22" rx="8" fill="${dk(tc, 12)}"/>
               <polygon points="50,92 38,108 50,111" fill="${tc}"/>
               <polygon points="50,92 62,108 50,111" fill="${tc}"/>
               <rect x="38" y="92" width="24" height="40" rx="4" fill="${shiftHex(tc, 35)}"/>`
  const bottom = `<rect x="28" y="133" width="20" height="38" rx="6" fill="${bc}"/>
                  <rect x="52" y="133" width="20" height="38" rx="6" fill="${bc}"/>
                  <rect x="26" y="130" width="48" height="8" rx="4" fill="${dk(bc, 18)}"/>`

  return `
    <ellipse cx="50" cy="175" rx="30" ry="6" fill="rgba(0,0,0,.18)"/>
    ${bottom}
    ${top}
    <ellipse cx="37" cy="172" rx="14" ry="6" fill="#1a1a1a"/>
    <ellipse cx="63" cy="172" rx="14" ry="6" fill="#1a1a1a"/>
    <rect x="43" y="82" width="14" height="14" rx="5" fill="${sk}"/>
    <ellipse cx="26" cy="56" rx="4.5" ry="6" fill="${sk}"/>
    <ellipse cx="74" cy="56" rx="4.5" ry="6" fill="${sk}"/>
    <ellipse cx="50" cy="55" rx="23" ry="26" fill="${sk}"/>
    ${hairStyles[c.gender] || hairStyles.other}
    ${eyes}
    <ellipse cx="50" cy="70" rx="2.5" ry="1.5" fill="${shiftHex(sk, -18)}" opacity=".5"/>
    ${mouth}
    <circle cx="36" cy="70" r="7" fill="#ffb3b3" opacity=".22"/>
    <circle cx="64" cy="70" r="7" fill="#ffb3b3" opacity=".22"/>
    ${arms}
    ${acc}`
})
</script>
