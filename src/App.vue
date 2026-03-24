<template>
  <div id="loading-screen" class="screen" :class="{ active: screen === 'loading' }">
    <div class="spinner" />
  </div>

  <div id="login-screen" class="screen" :class="{ active: screen === 'login' }">
    <Login />
  </div>

  <div id="creator-screen" class="screen" :class="{ active: screen === 'creator' }">
    <Creator />
  </div>

  <div id="main-screen" class="screen" :class="{ active: screen === 'main' }">
    <MainLayout />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { auth } from './services/firebase'
import { getAdditionalUserInfo, getRedirectResult, onAuthStateChanged, type UserCredential } from 'firebase/auth'
import { loadUserProfile, normalizeGoogleGender } from './services/userProfile'
import { state } from './stores/useAppStore'
import { handleSpotifyCallbackIfPresent, hasSpotifySession, isSpotifyConfigured } from './services/spotify'

import Login from './components/Login.vue'
import Creator from './components/Creator.vue'
import MainLayout from './components/MainLayout.vue'

const screen = computed(() => state.screen)
const GENDER_CACHE_KEY = 'cw:pending-google-gender'
let pendingGender: 'female' | 'male' | 'other' = 'other'

function extractGoogleGender(credential: unknown): 'female' | 'male' | 'other' | null {
  if (!credential) return null
  const info = getAdditionalUserInfo(credential as UserCredential)
  const profile = info?.profile as Record<string, unknown> | null | undefined
  return normalizeGoogleGender(profile?.gender)
}

onMounted(() => {
  void (async () => {
    state.spotify.configured = isSpotifyConfigured()
    state.spotify.connected = hasSpotifySession()

    try {
      const resolvedSpotifyAuth = await handleSpotifyCallbackIfPresent()
      if (resolvedSpotifyAuth) {
        state.spotify.connected = true
        state.spotify.error = null
      }
    } catch (error) {
      state.spotify.connected = false
      state.spotify.error = error instanceof Error ? error.message : 'Spotify authorization failed'
    }

    const cachedGender = sessionStorage.getItem(GENDER_CACHE_KEY)
    if (cachedGender) {
      pendingGender = normalizeGoogleGender(cachedGender)
      sessionStorage.removeItem(GENDER_CACHE_KEY)
    }

    try {
      const redirectCredential = await getRedirectResult(auth)
      const genderFromRedirect = extractGoogleGender(redirectCredential)
      if (genderFromRedirect) pendingGender = genderFromRedirect
    } catch (e) {
      console.warn('getRedirectResult failed', e)
    }

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        state.user = null
        state.screen = 'login'
        return
      }

      state.user = user
      state.screen = 'loading'

      try {
        const { screen, record } = await loadUserProfile(user.uid, user, pendingGender)
        state.users[user.uid] = record
        state.step = screen === 'creator' ? 0 : state.step
        state.screen = screen
        state.selectedId = user.uid
        pendingGender = 'other'
      } catch (e) {
        console.error('loadUserProfile failed', e)
        const display = user.displayName?.trim()
        state.users[user.uid] = {
          name: display || 'New Character',
          gender: pendingGender,
          state: 'idle',
          public: true,
          scene: 'office',
          skinTone: '#f1c27d',
          hairColor: '#1f2937',
          outfitColor: '#6366f1',
          photoURL: user.photoURL,
          email: user.email,
          tasks: [],
        }
        state.step = 0
        state.screen = 'creator'
        state.selectedId = user.uid
        pendingGender = 'other'
      }
    })
  })()
})
</script>
