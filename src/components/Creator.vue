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
      <div class="step-sublabel">Profile</div>

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
      <div class="step-sublabel">Appearance</div>

      <div class="form-group">
        <div class="form-label">Skin tone</div>
        <div class="color-row">
          <button
            v-for="color in skinTones"
            :key="color"
            class="swatch"
            :class="{ sel: char.skinTone === color }"
            :style="{ background: color }"
            type="button"
            @click="char.skinTone = color"
          />
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

      <div class="form-group">
        <div class="form-label">Outfit color</div>
        <div class="color-row">
          <button
            v-for="color in outfitColors"
            :key="color"
            class="swatch"
            :class="{ sel: char.outfitColor === color }"
            :style="{ background: color }"
            type="button"
            @click="char.outfitColor = color"
          />
        </div>
      </div>
    </section>

    <section v-else-if="step === 2" class="creator-step active">
      <div class="step-sublabel">Workspace</div>

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
          <button
            class="opt-btn"
            :class="{ sel: char.public }"
            type="button"
            @click="char.public = true"
          >
            Public
          </button>
          <button
            class="opt-btn"
            :class="{ sel: !char.public }"
            type="button"
            @click="char.public = false"
          >
            Private
          </button>
        </div>
      </div>
    </section>

    <section v-else class="creator-step active">
      <div class="step-sublabel">Review</div>

      <div class="review-grid">
        <div><b>Name:</b> {{ char.name || 'Unnamed character' }}</div>
        <div><b>Gender:</b> {{ selectedGenderLabel }}</div>
        <div><b>Scene:</b> {{ selectedSceneLabel }}</div>
        <div><b>Visibility:</b> {{ char.public ? 'Public' : 'Private' }}</div>
        <div>
          <b>Palette:</b>
          Skin <span class="color-dot" :style="{ background: char.skinTone }" />,
          Hair <span class="color-dot" :style="{ background: char.hairColor }" />,
          Outfit <span class="color-dot" :style="{ background: char.outfitColor }" />
        </div>
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
import { computed, reactive } from 'vue'
import { ref, update } from 'firebase/database'
import CharacterAvatar from './CharacterAvatar.vue'
import { db } from '../services/firebase'
import { state, type CharacterRecord, type SceneId } from '../stores/useAppStore'

const genderOptions = [
  { label: 'Female', value: 'female' },
  { label: 'Male', value: 'male' },
  { label: 'Other', value: 'other' },
] as const

const sceneOptions: Array<{ label: string; value: SceneId }> = [
  { label: 'Office', value: 'office' },
  { label: 'Home', value: 'home' },
  { label: 'Beach', value: 'beach' },
  { label: 'Cafe', value: 'cafe' },
  { label: 'Park', value: 'park' },
]

const skinTones = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524'] as const
const hairColors = ['#111827', '#2f241d', '#6b4226', '#b45309'] as const
const outfitColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'] as const

const step = computed(() => state.step)
const userId = computed(() => state.user?.uid)

const char = reactive<CharacterRecord>({
  name: state.user?.displayName || 'New Character',
  gender: 'other',
  state: 'idle',
  public: true,
  scene: 'office',
  skinTone: skinTones[0]!,
  hairColor: hairColors[0]!,
  outfitColor: outfitColors[0]!,
  photoURL: state.user?.photoURL,
  email: state.user?.email,
  tasks: [],
})

const selectedGenderLabel = computed(() => {
  return genderOptions.find((option) => option.value === char.gender)?.label || 'Other'
})

const selectedSceneLabel = computed(() => {
  return sceneOptions.find((option) => option.value === char.scene)?.label || 'Office'
})

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
    await update(ref(db, `users/${uid}`), { ...char })
  } catch (error) {
    console.warn('Unable to sync character to Firebase', error)
  }
}
</script>
