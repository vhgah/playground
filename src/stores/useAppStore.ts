import { computed, reactive, watch } from 'vue'

export type Screen = 'loading' | 'login' | 'creator' | 'main'
export type SceneId = 'office' | 'home' | 'beach' | 'cafe' | 'park'
export type CharacterState =
  | 'idle'
  | 'coding'
  | 'music'
  | 'reading'
  | 'sleeping'
  | 'eating'
  | 'gaming'
  | 'workout'
  | 'meeting'

export interface TaskItem {
  id: number
  text: string
  done: boolean
}

export interface CharacterRecord {
  id?: string
  name: string
  gender: 'female' | 'male' | 'other'
  state: CharacterState
  public: boolean
  scene: SceneId
  skinColor: string
  hairStyle: '0' | '1' | '2' | '3'
  hairColor: string
  topStyle: '0' | '1' | '2' | '3'
  topColor: string
  bottomColor: string
  photoURL?: string | null
  email?: string | null
  tasks: TaskItem[]
  spotify?: {
    name: string
    artists: string[]
    albumName: string
    albumImageUrl?: string
    songUrl?: string
    isPlaying: boolean
    updatedAt?: number
  } | null
}

export interface SpotifyState {
  connected: boolean
  loading: boolean
  configured: boolean
  error: string | null
  track: {
    name: string
    artists: string[]
    albumName: string
    albumImageUrl?: string
    songUrl?: string
    isPlaying: boolean
  } | null
}

const demoUsers: Record<string, CharacterRecord> = {
  // 'demo-alice': {
  //   name: 'Alice',
  //   gender: 'female',
  //   state: 'coding',
  //   public: true,
  //   scene: 'office',
  //   skinTone: '#f1c27d',
  //   hairColor: '#2f241d',
  //   outfitColor: '#818cf8',
  //   tasks: [
  //     { id: 1, text: 'Review pull request', done: true },
  //     { id: 2, text: 'Ship avatar scene', done: false },
  //   ],
  //   spotify: null,
  // },
  // 'demo-lucas': {
  //   name: 'Lucas',
  //   gender: 'male',
  //   state: 'music',
  //   public: true,
  //   scene: 'office',
  //   skinTone: '#c68642',
  //   hairColor: '#1f2937',
  //   outfitColor: '#f59e0b',
  //   tasks: [{ id: 1, text: 'Sync with product team', done: false }],
  //   spotify: null,
  // },
}

export const state = reactive<{
  user: {
    uid: string
    displayName?: string | null
    photoURL?: string | null
    email?: string | null
  } | null
  users: Record<string, CharacterRecord>
  screen: Screen
  step: number
  selectedId: string | null
  currentScene: SceneId
  showSettings: boolean
  showCharPanel: boolean
  showMobileSidebar: boolean
  privacyMode: boolean
  spotify: SpotifyState
}>({
  user: null,
  users: { ...demoUsers },
  screen: 'loading',
  step: 0,
  selectedId: 'demo-alice',
  currentScene: 'office',
  showSettings: false,
  showCharPanel: false,
  showMobileSidebar: false,
  privacyMode: false,
  spotify: {
    connected: false,
    loading: false,
    configured: false,
    error: null,
    track: null,
  },
})

export const visibleUsers = computed(() => {
  const uid = state.user?.uid

  return Object.entries(state.users)
    .filter(([id, user]) => id === uid || user.public !== false)
    .map(([id, user]) => ({ ...user, id }))
})

export const selectedUser = computed(() => {
  if (!state.selectedId) return null
  return state.users[state.selectedId]
})

watch(
  () => state.selectedId,
  () => {
    if (!state.selectedId || !state.users[state.selectedId]) {
      state.selectedId = visibleUsers.value[0]?.id ?? null
    }

    const selected = state.selectedId ? state.users[state.selectedId] : null
    if (selected?.scene) {
      state.currentScene = selected.scene
    }
  },
  { immediate: true },
)
