<template>
  <div class="modal-overlay" :class="{ hidden: !open }" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <span>Workspace settings</span>
        <button class="btn-icon" type="button" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="settings-user">
          <img
            v-if="user?.photoURL"
            class="settings-avatar"
            :src="user.photoURL"
            :alt="user.displayName || 'User avatar'"
          />
          <div
            v-else
            class="settings-avatar"
            style="display: grid; place-items: center; background: var(--border)"
          >
            {{ initials }}
          </div>

          <div>
            <div class="settings-name">{{ user?.displayName || 'Guest user' }}</div>
            <div class="settings-email">{{ user?.email || 'Sign in to sync your character' }}</div>
          </div>
        </div>

        <div class="settings-row">
          <div>
            <div class="settings-row-label">Privacy mode</div>
            <div class="settings-row-desc">Hide your character from public scenes.</div>
          </div>

          <label class="toggle">
            <input :checked="privacyMode" type="checkbox" @change="$emit('toggle-privacy')" />
            <span class="toggle-track" />
          </label>
        </div>

        <div class="settings-row settings-spotify">
          <div>
            <div class="settings-row-label">Spotify</div>
            <div class="settings-row-desc">
              <template v-if="!spotify.configured">Set `VITE_SPOTIFY_CLIENT_ID` to enable.</template>
              <template v-else-if="spotify.track">
                {{ spotify.track.isPlaying ? 'Now playing' : 'Recently played' }}:
                <strong>{{ spotify.track.name }}</strong> - {{ spotify.track.artists.join(', ') }}
              </template>
              <template v-else>
                {{ spotify.connected ? 'Connected. Press refresh to sync track.' : 'Connect to show your current song.' }}
              </template>
            </div>
            <div v-if="spotify.error" class="settings-error">{{ spotify.error }}</div>
          </div>

          <div class="settings-actions">
            <button
              v-if="spotify.connected"
              class="btn btn-secondary btn-sm"
              type="button"
              :disabled="spotify.loading"
              @click="$emit('refresh-spotify')"
            >
              {{ spotify.loading ? 'Syncing...' : 'Refresh' }}
            </button>
            <button
              v-if="spotify.connected"
              class="btn btn-danger btn-sm"
              type="button"
              @click="$emit('disconnect-spotify')"
            >
              Disconnect
            </button>
            <button
              v-else
              class="btn btn-primary btn-sm"
              type="button"
              :disabled="!spotify.configured"
              @click="$emit('connect-spotify')"
            >
              Connect
            </button>
          </div>
        </div>

        <button class="btn btn-danger" type="button" @click="$emit('logout')">Sign out</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SpotifyState } from '../stores/useAppStore'

const props = defineProps<{
  open: boolean
  user: { displayName?: string | null; photoURL?: string | null; email?: string | null } | null
  privacyMode: boolean
  spotify: SpotifyState
}>()

defineEmits<{
  close: []
  logout: []
  'toggle-privacy': []
  'connect-spotify': []
  'disconnect-spotify': []
  'refresh-spotify': []
}>()

const initials = computed(() => {
  return (props.user?.displayName || 'G')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})
</script>
