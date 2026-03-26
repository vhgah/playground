<template>
  <aside class="char-panel" :class="{ hidden: !character || !state.showCharPanel }">
    <template v-if="character">
      <div class="panel-head">
        <CharacterAvatar class="panel-avatar" :character="character" />

        <div class="panel-info">
          <div class="panel-name">{{ character.name }}</div>
          <div class="panel-gender">{{ genderLabel }}</div>
          <div class="panel-state-badge">{{ stateMeta.icon }} {{ stateMeta.label }}</div>
        </div>

        <button class="btn-icon panel-close" type="button" @click="state.showCharPanel = false">
          ✕
        </button>
      </div>

      <div class="panel-body">
        <div class="panel-sec">
          <div class="panel-sec-title">Status</div>

          <div v-if="isMine" class="state-grid">
            <button
              v-for="option in states"
              :key="option.id"
              class="state-btn"
              :class="{ active: character.state === option.id }"
              type="button"
              @click="changeState(option.id)"
            >
              <span class="state-icon">{{ option.icon }}</span>
              {{ option.label }}
            </button>
          </div>

          <div v-else class="other-view">
            <div class="big-state">{{ stateMeta.icon }}</div>
            <div class="state-label">{{ stateMeta.icon }} {{ stateMeta.label }}</div>
            <div class="state-sub">Currently hanging out in the {{ sceneLabel }}.</div>
          </div>
        </div>

        <div v-if="isMine" class="panel-sec">
          <div class="form-group">
            <div class="panel-sec-title">Skin color</div>
            <div class="color-row">
              <button
                v-for="color in skinColors"
                :key="color"
                class="swatch small"
                :class="{ sel: character.skinColor === color }"
                :style="{ background: color }"
                type="button"
                @click="updateAppearance({ skinColor: color })"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="panel-sec-title">Hair style</div>
            <div class="opt-row">
              <button
                v-for="option in hairStyleOptions"
                :key="option.value"
                class="opt-btn"
                :class="{ sel: character.hairStyle === option.value }"
                type="button"
                @click="updateAppearance({ hairStyle: option.value })"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <div class="form-label">Hair color</div>
            <div class="color-row">
              <button
                v-for="color in hairColors"
                :key="color"
                class="swatch small"
                :class="{ sel: character.hairColor === color }"
                :style="{ background: color }"
                type="button"
                @click="updateAppearance({ hairColor: color })"
              />
            </div>
          </div>
        </div>

        <div v-if="isMine" class="panel-sec">
          <div class="panel-sec-title">Outfit</div>

          <div class="form-group">
            <div class="form-label">Top style</div>
            <div class="opt-row">
              <button
                v-for="option in topStyleOptions"
                :key="option.value"
                class="opt-btn"
                :class="{ sel: character.topStyle === option.value }"
                type="button"
                @click="updateAppearance({ topStyle: option.value })"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="form-group">
            <div class="form-label">Top color</div>
            <div class="color-row">
              <button
                v-for="color in topColors"
                :key="color"
                class="swatch small"
                :class="{ sel: character.topColor === color }"
                :style="{ background: color }"
                type="button"
                @click="updateAppearance({ topColor: color })"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="form-label">Bottom color</div>
            <div class="color-row">
              <button
                v-for="color in bottomColors"
                :key="color"
                class="swatch small"
                :class="{ sel: character.bottomColor === color }"
                :style="{ background: color }"
                type="button"
                @click="updateAppearance({ bottomColor: color })"
              />
            </div>
          </div>
        </div>

        <div v-if="isMine && character.state === 'music'" class="panel-sec">
          <div class="panel-sec-title">🎵 Now Playing</div>
          <div class="np-input-row">
            <input
              v-model="songUrl"
              class="np-input"
              placeholder="Dán link YouTube / Spotify..."
              type="url"
              @keydown.enter="fetchSong"
            />
            <button class="btn-np-fetch" type="button" :disabled="fetchingson" @click="fetchSong">
              {{ fetchingson ? '...' : '↵' }}
            </button>
          </div>
          <div v-if="fetchError" class="np-error">{{ fetchError }}</div>
        </div>

        <div v-if="isMine && state.spotify.connected" class="panel-sec">
          <div class="panel-sec-title">Now Listening</div>
          <div class="other-view" style="padding-top: 0.5rem; padding-bottom: 0.5rem">
            <div v-if="state.spotify.track" class="state-label">
              {{ state.spotify.track.isPlaying ? '🎵' : '⏯' }} {{ state.spotify.track.name }}
            </div>
            <div v-if="state.spotify.track" class="state-sub">
              {{ state.spotify.track.artists.join(', ') }}
            </div>
            <div v-else class="state-sub">No song found. Open settings to refresh Spotify.</div>
          </div>
        </div>
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ref as dbRef, update } from 'firebase/database'
import { db } from '../services/firebase'
import CharacterAvatar from './CharacterAvatar.vue'
import {
  selectedUser,
  state,
  type CharacterRecord,
  type CharacterState,
  type SceneId,
} from '../stores/useAppStore'
import { CHARACTER_STATES } from '../constants/states'

const states: Array<{ id: CharacterState; label: string; icon: string }> = CHARACTER_STATES
const fallbackState = { id: 'idle' as CharacterState, label: 'Relaxing', icon: '😊' }

const genderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
] as const

const hairStyleOptions = [
  { label: '✂️ Short', value: '0' },
  { label: '🌊 Long', value: '1' },
  { label: '🌀 Curly', value: '2' },
  { label: '🎀 Bun', value: '3' },
] as const

const topStyleOptions = [
  { label: '👕 T-shirt', value: '0' },
  { label: '👔 Shirt', value: '1' },
  { label: '🧥 Jacket', value: '2' },
  { label: '👗 Dress', value: '3' },
] as const

const sceneOptions: Array<{ label: string; value: SceneId }> = [
  { label: 'Office', value: 'office' },
  { label: 'Home', value: 'home' },
  { label: 'Beach', value: 'beach' },
  { label: 'Cafe', value: 'cafe' },
  { label: 'Park', value: 'park' },
]

const skinColors = ['#FFDBB4', '#F1C27D', '#E0A060', '#C68642', '#8D5524', '#4A2912'] as const
const hairColors = [
  '#1a1a1a',
  '#4a3728',
  '#8B4513',
  '#DAA520',
  '#FF6B6B',
  '#9B59B6',
  '#3498DB',
  '#E8E8E8',
] as const
const topColors = [
  '#6366f1',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#ec4899',
  '#f8fafc',
  '#374151',
] as const
const bottomColors = [
  '#1e3a5f',
  '#374151',
  '#7c3aed',
  '#065f46',
  '#92400e',
  '#ec4899',
  '#e5e7eb',
  '#1f2937',
] as const

const character = selectedUser
const draftName = ref('')
const songUrl = ref('')
const fetchingson = ref(false)
const fetchError = ref('')

async function fetchSong() {
  const url = songUrl.value.trim()
  if (!url) return
  fetchingson.value = true
  fetchError.value = ''
  try {
    let title = ''
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (!res.ok) throw new Error('Không lấy được thông tin bài hát')
      const data = await res.json()
      title = data.title
    } else if (url.includes('spotify.com')) {
      const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error('Không lấy được thông tin bài hát')
      const data = await res.json()
      title = data.title
    } else {
      throw new Error('Chỉ hỗ trợ YouTube và Spotify')
    }
    await syncPatch({ nowPlaying: { title, url } })
    songUrl.value = ''
  } catch (e: unknown) {
    fetchError.value = e instanceof Error ? e.message : 'Lỗi không xác định'
  } finally {
    fetchingson.value = false
  }
}

async function clearNowPlaying() {
  await syncPatch({ nowPlaying: null })
}

const isMine = computed(() => {
  return !!character.value && character.value === state.users[state.user?.uid || '']
})

const stateMeta = computed(() => {
  return states.find((option) => option.id === character.value?.state) || fallbackState
})

const genderLabel = computed(() => {
  const map: Record<string, string> = {
    female: 'Female',
    male: 'Male',
    other: 'Custom',
  }
  return map[character.value?.gender || 'other']
})

const sceneLabel = computed(() => {
  const map: Record<string, string> = {
    office: 'office',
    home: 'home',
    beach: 'beach',
    cafe: 'cafe',
    park: 'park',
  }
  return map[character.value?.scene || 'office']
})

watch(
  () => character.value?.name,
  (name) => {
    draftName.value = name || ''
  },
  { immediate: true },
)

async function syncPatch(patch: Partial<CharacterRecord>) {
  const uid = state.user?.uid
  if (!uid || !state.users[uid]) return

  Object.assign(state.users[uid], patch)

  try {
    await update(dbRef(db, `users/${uid}`), patch)
  } catch (e) {
    console.warn('Unable to sync profile patch to Firebase', e)
  }
}

async function changeState(newState: CharacterState) {
  if (!character.value) return
  await syncPatch({ state: newState })
}

async function saveName() {
  const nextName = draftName.value.trim()
  if (!nextName || !isMine.value || !character.value || nextName === character.value.name) {
    draftName.value = character.value?.name || ''
    return
  }

  await syncPatch({ name: nextName })
}

async function updateAppearance(patch: Partial<CharacterRecord>) {
  if (!isMine.value) return
  await syncPatch(patch)
}

async function updateScene(scene: SceneId) {
  if (!isMine.value) return
  state.currentScene = scene
  await syncPatch({ scene })
}
</script>
