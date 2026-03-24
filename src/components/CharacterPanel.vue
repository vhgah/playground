<template>
  <aside class="char-panel" :class="{ hidden: !character }">
    <template v-if="character">
      <div class="panel-head">
        <CharacterAvatar class="panel-avatar" :character="character" />

        <div class="panel-info">
          <div class="panel-name">{{ character.name }}</div>
          <div class="panel-gender">{{ genderLabel }}</div>
          <div class="panel-state-badge">{{ stateMeta.icon }} {{ stateMeta.label }}</div>
        </div>
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
              @click="character.state = option.id"
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

        <!-- <div class="panel-sec">
          <div class="panel-sec-title">Tasks</div>

          <template v-if="isMine">
            <div class="task-add">
              <input
                v-model="newTask"
                class="task-input"
                placeholder="Add a new task"
                @keydown.enter.prevent="addTask"
              />
              <button class="btn btn-primary btn-sm" type="button" @click="addTask">Add</button>
            </div>

            <div class="task-list">
              <div v-for="task in character.tasks" :key="task.id" class="task-item">
                <button
                  class="task-check"
                  :class="{ done: task.done }"
                  type="button"
                  @click="task.done = !task.done"
                >
                  ✓
                </button>
                <div class="task-text" :class="{ done: task.done }">{{ task.text }}</div>
                <button class="task-del" type="button" @click="removeTask(task.id)">✕</button>
              </div>
            </div>
          </template>

          <div v-else class="other-view">
            <div class="state-label">{{ character.tasks.length }} active items</div>
            <div class="state-sub">Task editing is available only on your own character.</div>
          </div>
        </div> -->
      </div>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CharacterAvatar from './CharacterAvatar.vue'
import { selectedUser, state, type CharacterState } from '../stores/useAppStore'
import { CHARACTER_STATES } from '../constants/states'

const newTask = ref('')

const states: Array<{ id: CharacterState; label: string; icon: string }> = CHARACTER_STATES

const fallbackState = { id: 'idle' as CharacterState, label: 'Relaxing', icon: '😊' }

const character = selectedUser

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

function addTask() {
  if (!character.value || !newTask.value.trim()) return

  character.value.tasks.unshift({
    id: Date.now(),
    text: newTask.value.trim(),
    done: false,
  })
  newTask.value = ''
}

function removeTask(taskId: number) {
  if (!character.value) return
  character.value.tasks = character.value.tasks.filter((task) => task.id !== taskId)
}
</script>
