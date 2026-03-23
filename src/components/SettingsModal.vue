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

        <button class="btn btn-danger" type="button" @click="$emit('logout')">Sign out</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  user: { displayName?: string | null; photoURL?: string | null; email?: string | null } | null
  privacyMode: boolean
}>()

defineEmits<{
  close: []
  logout: []
  'toggle-privacy': []
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
