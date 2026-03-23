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
import { onAuthStateChanged } from 'firebase/auth'
import { state } from './stores/useAppStore'

import Login from './components/Login.vue'
import Creator from './components/Creator.vue'
import MainLayout from './components/MainLayout.vue'

const screen = computed(() => state.screen)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      state.user = user
      if (!state.users[user.uid]) {
        state.users[user.uid] = {
          name: user.displayName || 'New Character',
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
        state.screen = 'creator'
      } else {
        state.screen = 'main'
      }
      state.selectedId = user.uid
    } else {
      state.screen = 'login'
    }
  })
})
</script>
