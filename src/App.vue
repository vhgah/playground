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
import { ref, onValue } from 'firebase/database'
import { auth, db } from './services/firebase'
import { getAdditionalUserInfo, getRedirectResult, onAuthStateChanged, type UserCredential } from 'firebase/auth'
import { loadUserProfile, normalizeGoogleGender, recordFromRtdb } from './services/userProfile'
import { state } from './stores/useAppStore'
import { handleSpotifyCallbackIfPresent, hasSpotifySession, isSpotifyConfigured } from './services/spotify'

import Login from './components/Login.vue'
import Creator from './components/Creator.vue'
import MainLayout from './components/MainLayout.vue'

const screen = computed(() => state.screen)
const GENDER_CACHE_KEY = 'cw:pending-google-gender'
let pendingGender: 'female' | 'male' | 'other' = 'other'
let stopUsersRealtimeSync: (() => void) | null = null

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
        if (stopUsersRealtimeSync) {
          stopUsersRealtimeSync()
          stopUsersRealtimeSync = null
        }
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
          skinColor: '#FFDBB4',
          hairStyle: '0',
          hairColor: '#1f2937',
          topStyle: '0',
          topColor: '#6366f1',
          bottomColor: '#1e3a5f',
          photoURL: user.photoURL,
          email: user.email,
          tasks: [],
          spotify: null,
        }
        state.step = 0
        state.screen = 'creator'
        state.selectedId = user.uid
        pendingGender = 'other'
      }

      if (!stopUsersRealtimeSync) {
        const usersRef = ref(db, 'users')
        stopUsersRealtimeSync = onValue(usersRef, (snapshot) => {
          const value = snapshot.val() as Record<string, Record<string, unknown>> | null
          if (!value) {
            for (const uid of Object.keys(state.users)) {
              if (!uid.startsWith('demo-')) {
                delete state.users[uid]
              }
            }
            return
          }

          const remoteUids = new Set<string>()

          Object.entries(value).forEach(([uid, raw]) => {
            remoteUids.add(uid)
            const record = recordFromRtdb(raw)

            if (record) {
              state.users[uid] = {
                ...state.users[uid],
                ...record,
              }
            }
          })

          for (const uid of Object.keys(state.users)) {
            if (!uid.startsWith('demo-') && !remoteUids.has(uid)) {
              delete state.users[uid]
            }
          }
        })
      }
    })
  })()
})
</script>
