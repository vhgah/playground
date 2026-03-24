import { ref, get, set, serverTimestamp } from 'firebase/database'
import type { User } from 'firebase/auth'
import { db } from './firebase'
import type { CharacterRecord, CharacterState, SceneId } from '../stores/useAppStore'

const SCENES: SceneId[] = ['office', 'home', 'beach', 'cafe', 'park']
const STATES: CharacterState[] = ['idle', 'coding', 'meeting', 'focus', 'break', 'offline']

function asSceneId(v: unknown, fallback: SceneId): SceneId {
  return typeof v === 'string' && SCENES.includes(v as SceneId) ? (v as SceneId) : fallback
}

function asCharacterState(v: unknown, fallback: CharacterState): CharacterState {
  return typeof v === 'string' && STATES.includes(v as CharacterState) ? (v as CharacterState) : fallback
}

function asGender(v: unknown): CharacterRecord['gender'] {
  return v === 'female' || v === 'male' || v === 'other' ? v : 'other'
}

export function normalizeGoogleGender(v: unknown): CharacterRecord['gender'] {
  if (typeof v !== 'string') return 'other'
  const g = v.trim().toLowerCase()
  if (g === 'male') return 'male'
  if (g === 'female') return 'female'
  return 'other'
}

/** Đã hoàn tất creator (hoặc bản ghi cũ đủ field). */
export function isOnboardedProfile(val: unknown): boolean {
  if (!val || typeof val !== 'object') return false
  const v = val as Record<string, unknown>
  if (v.profileComplete === true) return true
  return (
    typeof v.name === 'string' &&
    typeof v.scene === 'string' &&
    typeof v.skinTone === 'string'
  )
}

export function defaultCharacterFromAuth(
  user: User,
  preferredGender: CharacterRecord['gender'] = 'other',
): CharacterRecord {
  const display = user.displayName?.trim()
  return {
    name: display || 'New Character',
    gender: preferredGender,
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
}

export function mergeRtdbProfile(
  val: unknown,
  user: User,
  preferredGender: CharacterRecord['gender'] = 'other',
): CharacterRecord {
  const base = defaultCharacterFromAuth(user, preferredGender)
  if (!val || typeof val !== 'object') return base
  const v = val as Record<string, unknown>

  const tasks: CharacterRecord['tasks'] = Array.isArray(v.tasks)
    ? v.tasks.filter(
        (t): t is { id: number; text: string; done: boolean } =>
          t &&
          typeof t === 'object' &&
          typeof (t as { id?: unknown }).id === 'number' &&
          typeof (t as { text?: unknown }).text === 'string' &&
          typeof (t as { done?: unknown }).done === 'boolean',
      )
    : base.tasks

  return {
    name: typeof v.name === 'string' ? v.name : base.name,
    gender: asGender(v.gender),
    state: asCharacterState(v.state, base.state),
    public: typeof v.public === 'boolean' ? v.public : base.public,
    scene: asSceneId(v.scene, base.scene),
    skinTone: typeof v.skinTone === 'string' ? v.skinTone : base.skinTone,
    hairColor: typeof v.hairColor === 'string' ? v.hairColor : base.hairColor,
    outfitColor: typeof v.outfitColor === 'string' ? v.outfitColor : base.outfitColor,
    photoURL: v.photoURL === null || typeof v.photoURL === 'string' ? v.photoURL : user.photoURL ?? base.photoURL,
    email: v.email === null || typeof v.email === 'string' ? v.email : user.email ?? base.email,
    tasks,
  }
}

export type ProfileRoute = { screen: 'main' | 'creator'; record: CharacterRecord }

/**
 * Đọc /users/{uid}; nếu chưa có thì tạo stub trên RTDB (profileComplete: false).
 * Reload trang vẫn phân nhánh đúng nhờ dữ liệu trên server.
 */
export async function loadUserProfile(
  uid: string,
  user: User,
  preferredGender: CharacterRecord['gender'] = 'other',
): Promise<ProfileRoute> {
  const r = ref(db, `users/${uid}`)
  const snap = await get(r)

  if (!snap.exists()) {
    await set(r, {
      uid,
      email: user.email ?? null,
      photoURL: user.photoURL ?? null,
      profileComplete: false,
      createdAt: serverTimestamp(),
    })
    return { screen: 'creator', record: defaultCharacterFromAuth(user, preferredGender) }
  }

  const val = snap.val()
  const record = mergeRtdbProfile(val, user, preferredGender)
  if (isOnboardedProfile(val)) {
    return { screen: 'main', record }
  }
  return { screen: 'creator', record }
}
