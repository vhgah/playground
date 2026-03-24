<template>
  <aside class="sidebar">
    <div class="sidebar-logo">CharWorld</div>

    <div class="sec-title">Scenes</div>
    <button
      v-for="scene in sceneOptions"
      :key="scene.id"
      class="scene-btn"
      :class="{ active: state.currentScene === scene.id }"
      type="button"
      @click="changeScene(scene.id)"
    >
      <span>{{ scene.icon }}</span>
      <span>{{ scene.label }}</span>
    </button>

    <hr class="divider" />

    <div class="sec-title">Characters</div>
    <button
      v-for="character in characters"
      :key="character.id"
      class="char-side-item"
      :class="{ sel: state.selectedId === character.id }"
      type="button"
      @click="state.selectedId = character.id"
    >
      <div class="mini-avatar">
        <CharacterAvatar :character="character" />
      </div>
      <div style="min-width: 0">
        <div class="char-side-name">
          {{ character.name }}
          <span v-if="character.id === state.user?.uid" class="me-badge">ME</span>
        </div>
        <div class="char-side-state">{{ stateMeta[character.state].icon }} {{ stateMeta[character.state].label }}</div>
      </div>
    </button>

    <div class="sidebar-foot">
      <div class="sb-user">
        <img
          v-if="state.user?.photoURL"
          class="sb-avatar"
          :src="state.user.photoURL"
          :alt="state.user.displayName || 'User avatar'"
        />
        <div v-else class="sb-avatar" style="display: grid; place-items: center; background: var(--border)">
          {{ initials }}
        </div>
        <div class="sb-name">{{ state.user?.displayName || 'Guest user' }}</div>
      </div>

      <button class="btn-icon" type="button" @click="state.showSettings = true">⚙</button>
    </div>

    <SettingsModal
      :open="state.showSettings"
      :user="state.user"
      :privacy-mode="state.privacyMode"
      @close="state.showSettings = false"
      @logout="logout"
      @toggle-privacy="togglePrivacy"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { signOut } from 'firebase/auth'
import { ref, update } from 'firebase/database'
import { auth, db } from '../services/firebase'
import CharacterAvatar from './CharacterAvatar.vue'
import SettingsModal from './SettingsModal.vue'
import { visibleUsers, state, type CharacterState, type SceneId } from '../stores/useAppStore'
import { CHARACTER_STATE_META } from '../constants/states'

const sceneOptions: Array<{ id: SceneId; label: string; icon: string }> = [
  { id: 'office', label: 'Office', icon: '🏢' },
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'beach', label: 'Beach', icon: '🏖' },
  { id: 'cafe', label: 'Cafe', icon: '☕' },
  { id: 'park', label: 'Park', icon: '🌿' },
]

const stateMeta: Record<CharacterState, { label: string; icon: string }> = CHARACTER_STATE_META

const characters = visibleUsers

const initials = computed(() => {
  return (state.user?.displayName || 'GW')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

function togglePrivacy() {
  state.privacyMode = !state.privacyMode

  const uid = state.user?.uid
  if (uid && state.users[uid]) {
    state.users[uid].public = !state.privacyMode
  }
}

async function changeScene(sceneId: SceneId) {
  state.currentScene = sceneId

  const uid = state.user?.uid
  if (!uid || !state.users[uid]) return

  // Move my own character to selected scene immediately.
  state.users[uid].scene = sceneId
  state.selectedId = uid

  try {
    await update(ref(db, `users/${uid}`), { scene: sceneId })
  } catch (error) {
    console.warn('Unable to sync scene to Firebase', error)
  }
}

async function logout() {
  state.showSettings = false

  try {
    await signOut(auth)
  } catch (error) {
    console.warn('Unable to sign out cleanly', error)
    state.user = null
    state.screen = 'login'
  }
}
</script>
