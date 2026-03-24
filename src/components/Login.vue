<template>
  <div class="login-card">
    <h1>CharWorld</h1>
    <p>Bring your team into a shared workspace with live character presence.</p>

    <button class="google-btn" type="button" @click="login">
      <svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.8-6-6.2s2.7-6.2 6-6.2c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 2.7 14.7 2 12 2 6.9 2 2.8 6.2 2.8 11.5S6.9 21 12 21c6.9 0 9.2-4.8 9.2-7.2 0-.5 0-.8-.1-1.2H12Z"
        />
        <path
          fill="#34A853"
          d="M2.8 7.1 6 9.4c.9-2.1 3-3.5 6-3.5 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 2.7 14.7 2 12 2 8 2 4.5 4.3 2.8 7.1Z"
        />
        <path
          fill="#4A90E2"
          d="M12 21c2.6 0 4.8-.8 6.4-2.3l-3-2.5c-.8.6-1.8 1.1-3.4 1.1-4 0-5.2-2.4-5.5-3.5L3.2 16C4.8 18.9 8.1 21 12 21Z"
        />
        <path
          fill="#FBBC05"
          d="M2.8 7.1A9.8 9.8 0 0 0 1.9 11c0 1.4.3 2.8.9 4l3.3-2.6A5.8 5.8 0 0 1 6 11c0-.5.1-1 .2-1.5L2.8 7.1Z"
        />
      </svg>
      <span>Continue with Google</span>
    </button>

    <div class="login-note">Your character profile will be synced after sign in.</div>
  </div>
</template>

<script setup lang="ts">
import { auth, provider } from '../services/firebase'
import { getAdditionalUserInfo, signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { normalizeGoogleGender } from '../services/userProfile'

const GENDER_CACHE_KEY = 'cw:pending-google-gender'

function cacheGenderFromCredential(credential: unknown) {
  const info = getAdditionalUserInfo(credential as import('firebase/auth').UserCredential)
  const profile = info?.profile as Record<string, unknown> | null | undefined
  sessionStorage.setItem(GENDER_CACHE_KEY, normalizeGoogleGender(profile?.gender))
}

async function login() {
  try {
    const credential = await signInWithPopup(auth, provider)
    cacheGenderFromCredential(credential)
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : ''
    if (code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider)
      return
    }
    console.error('Google sign-in failed', e)
  }
}
</script>
