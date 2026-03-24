<template>
  <div class="creator-box">
    <div class="creator-head">
      <div class="creator-title">Create your character</div>

      <div class="step-dots">
        <div
          v-for="index in 4"
          :key="index"
          class="step-dot"
          :class="{ active: index - 1 === step, done: index - 1 < step }"
        />
      </div>
    </div>

    <div class="creator-preview">
      <CharacterAvatar class="preview-svg" :character="char" />
    </div>

    <section v-if="step === 0" class="creator-step active">
      <div class="step-sublabel">Step 1 / 4 - Basic profile</div>

      <div class="form-group">
        <label class="form-label" for="char-name">Display name</label>
        <input id="char-name" v-model="char.name" class="form-input" maxlength="24" />
      </div>

      <div class="form-group">
        <div class="form-label">Gender</div>
        <div class="opt-row">
          <button
            v-for="option in genderOptions"
            :key="option.value"
            class="opt-btn"
            :class="{ sel: char.gender === option.value }"
            type="button"
            @click="char.gender = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </section>

    <section v-else-if="step === 1" class="creator-step active">
      <div class="step-sublabel">Step 2 / 4 - Appearance</div>

      <div class="form-group">
        <div class="form-label">Skin color</div>
        <div class="color-row">
          <button
            v-for="color in skinColors"
            :key="color"
            class="swatch"
            :class="{ sel: char.skinColor === color }"
            :style="{ background: color }"
            type="button"
            @click="char.skinColor = color"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Hair style</div>
        <div class="opt-row">
          <button
            v-for="option in hairStyleOptions"
            :key="option.value"
            class="opt-btn"
            :class="{ sel: char.hairStyle === option.value }"
            type="button"
            @click="char.hairStyle = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Hair color</div>
        <div class="color-row">
          <button
            v-for="color in hairColors"
            :key="color"
            class="swatch"
            :class="{ sel: char.hairColor === color }"
            :style="{ background: color }"
            type="button"
            @click="char.hairColor = color"
          />
        </div>
      </div>
    </section>

    <section v-else-if="step === 2" class="creator-step active">
      <div class="step-sublabel">Step 3 / 4 - Outfit</div>

      <div class="form-group">
        <div class="form-label">Top style</div>
        <div class="opt-row">
          <button
            v-for="option in topStyleOptions"
            :key="option.value"
            class="opt-btn"
            :class="{ sel: char.topStyle === option.value }"
            type="button"
            @click="char.topStyle = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Top color</div>
        <div class="color-row">
          <button
            v-for="color in topColors"
            :key="color"
            class="swatch"
            :class="{ sel: char.topColor === color }"
            :style="{ background: color }"
            type="button"
            @click="char.topColor = color"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Bottom color</div>
        <div class="color-row">
          <button
            v-for="color in bottomColors"
            :key="color"
            class="swatch"
            :class="{ sel: char.bottomColor === color }"
            :style="{ background: color }"
            type="button"
            @click="char.bottomColor = color"
          />
        </div>
      </div>
    </section>

    <section v-else class="creator-step active">
      <div class="step-sublabel">Step 4 / 4 - Review</div>

      <div class="form-group">
        <div class="form-label">Default scene</div>
        <div class="opt-row">
          <button
            v-for="scene in sceneOptions"
            :key="scene.value"
            class="opt-btn"
            :class="{ sel: char.scene === scene.value }"
            type="button"
            @click="char.scene = scene.value"
          >
            {{ scene.label }}
          </button>
        </div>
      </div>

      <div class="form-group">
        <div class="form-label">Visibility</div>
        <div class="opt-row">
          <button class="opt-btn" :class="{ sel: char.public }" type="button" @click="char.public = true">
            Public
          </button>
          <button class="opt-btn" :class="{ sel: !char.public }" type="button" @click="char.public = false">
            Private
          </button>
        </div>
      </div>

      <div class="review-grid">
        <div><b>Name:</b> {{ char.name || 'Unnamed character' }}</div>
        <div><b>Gender:</b> {{ selectedGenderLabel }}</div>
        <div><b>Skin:</b> <span class="color-dot" :style="{ background: char.skinColor }" /></div>
        <div><b>Hair:</b> {{ selectedHairStyleLabel }} <span class="color-dot" :style="{ background: char.hairColor }" /></div>
        <div><b>Top:</b> {{ selectedTopStyleLabel }} <span class="color-dot" :style="{ background: char.topColor }" /></div>
        <div><b>Bottom:</b> <span class="color-dot" :style="{ background: char.bottomColor }" /></div>
        <div><b>Scene:</b> {{ selectedSceneLabel }}</div>
        <div><b>Visibility:</b> {{ char.public ? 'Public' : 'Private' }}</div>
      </div>
    </section>

    <div class="creator-footer">
      <button class="btn btn-secondary" type="button" :disabled="step === 0" @click="prev">
        Back
      </button>

      <div class="creator-footer-right">
        <button class="btn btn-primary" type="button" @click="next">
          {{ step === 3 ? 'Enter workspace' : 'Continue' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ref, update } from 'firebase/database'
import CharacterAvatar from './CharacterAvatar.vue'
import { db } from '../services/firebase'
import { state, type CharacterRecord, type SceneId } from '../stores/useAppStore'

const genderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
] as const

const hairStyleOptions = [
  { label: '✂️ Short', value: '0' },
  { label: '🌊 Long', value: '1' },
  { label: '🌀 Curly', value: '2' },
  { label: '🎀 Bun', value: '3' },
] as const

const topStyleOptions = [
  { label: '👕 T-shirt', value: '0' },
  { label: '👔 Shirt', value: '1' },
  { label: '🧥 Jacket', value: '2' },
  { label: '👗 Dress', value: '3' },
] as const

const sceneOptions: Array<{ label: string; value: SceneId }> = [
  { label: 'Office', value: 'office' },
  { label: 'Home', value: 'home' },
  { label: 'Beach', value: 'beach' },
  { label: 'Cafe', value: 'cafe' },
  { label: 'Park', value: 'park' },
]

const skinColors = ['#FFDBB4', '#F1C27D', '#E0A060', '#C68642', '#8D5524', '#4A2912'] as const
const hairColors = ['#1a1a1a', '#4a3728', '#8B4513', '#DAA520', '#FF6B6B', '#9B59B6', '#3498DB', '#E8E8E8'] as const
const topColors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#f8fafc', '#374151'] as const
const bottomColors = ['#1e3a5f', '#374151', '#7c3aed', '#065f46', '#92400e', '#ec4899', '#e5e7eb', '#1f2937'] as const

const step = computed(() => state.step)
const userId = computed(() => state.user?.uid)
const DEFAULT_NAME = 'New Character'

const char = reactive<CharacterRecord>({
  name: DEFAULT_NAME,
  gender: 'other',
  state: 'idle',
  public: true,
  scene: 'office',
  skinColor: skinColors[0],
  hairStyle: '0',
  hairColor: hairColors[0],
  topStyle: '0',
  topColor: topColors[0],
  bottomColor: bottomColors[0],
  photoURL: null,
  email: null,
  tasks: [],
  spotify: null,
})

watch(
  () => [state.screen, state.user?.uid] as const,
  ([screen, uid]) => {
    if (screen !== 'creator' || !uid) return
    const u = state.users[uid]
    if (!u) return
    char.name = u.name || state.user?.displayName?.trim() || DEFAULT_NAME
    char.gender = u.gender
    char.state = u.state
    char.public = u.public
    char.scene = u.scene
    char.skinColor = u.skinColor
    char.hairStyle = u.hairStyle
    char.hairColor = u.hairColor
    char.topStyle = u.topStyle
    char.topColor = u.topColor
    char.bottomColor = u.bottomColor
    char.photoURL = u.photoURL ?? state.user?.photoURL ?? null
    char.email = u.email ?? state.user?.email ?? null
    char.tasks = u.tasks?.length ? [...u.tasks] : []
    char.spotify = u.spotify ?? null
  },
  { immediate: true },
)

const selectedGenderLabel = computed(() => genderOptions.find((option) => option.value === char.gender)?.label || 'Other')
const selectedHairStyleLabel = computed(() => hairStyleOptions.find((option) => option.value === char.hairStyle)?.label || 'Short')
const selectedTopStyleLabel = computed(() => topStyleOptions.find((option) => option.value === char.topStyle)?.label || 'T-shirt')
const selectedSceneLabel = computed(() => sceneOptions.find((option) => option.value === char.scene)?.label || 'Office')

function prev() {
  if (state.step > 0) state.step -= 1
}

function next() {
  if (state.step < 3) {
    state.step += 1
    return
  }
  void save()
}

async function save() {
  const uid = userId.value || `local-${Date.now()}`
  state.users[uid] = {
    ...char,
    photoURL: state.user?.photoURL || char.photoURL || null,
    email: state.user?.email || char.email || null,
  }
  state.selectedId = uid
  state.currentScene = char.scene
  state.screen = 'main'

  if (!userId.value) return

  try {
    await update(ref(db, `users/${uid}`), { ...char, profileComplete: true })
  } catch (error) {
    console.warn('Unable to sync character to Firebase', error)
  }
}
</script>
