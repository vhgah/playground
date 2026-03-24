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
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth'
import { loadUserProfile } from './services/userProfile'
import { state } from './stores/useAppStore'

import Login from './components/Login.vue'
import Creator from './components/Creator.vue'
import MainLayout from './components/MainLayout.vue'

const screen = computed(() => state.screen)

onMounted(() => {
  void (async () => {
    try {
      await getRedirectResult(auth)
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
        const { screen, record } = await loadUserProfile(user.uid, user)
        state.users[user.uid] = record
        state.step = screen === 'creator' ? 0 : state.step
        state.screen = screen
        state.selectedId = user.uid
      } catch (e) {
        console.error('loadUserProfile failed', e)
        const display = user.displayName?.trim()
        state.users[user.uid] = {
          name: display || 'New Character',
          gender: 'other',
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
      }
    })
  })()
})
</script>
