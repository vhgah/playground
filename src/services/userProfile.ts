import { ref, get, set, serverTimestamp } from 'firebase/database'
import type { User } from 'firebase/auth'
import { db } from './firebase'
import type { CharacterRecord, CharacterState, SceneId } from '../stores/useAppStore'

const SCENES: SceneId[] = ['office', 'home', 'beach', 'cafe', 'park']
const STATES: CharacterState[] = ['idle', 'coding', 'music', 'reading', 'sleeping', 'eating', 'gaming', 'workout', 'meeting', 'designing', 'walking']
const LEGACY_STATE_MAP: Record<string, CharacterState> = {
  focus: 'reading',
  break: 'eating',
  offline: 'sleeping',
}

function asSceneId(v: unknown, fallback: SceneId): SceneId {
  return typeof v === 'string' && SCENES.includes(v as SceneId) ? (v as SceneId) : fallback
}

function asCharacterState(v: unknown, fallback: CharacterState): CharacterState {
  if (typeof v !== 'string') return fallback
  if (STATES.includes(v as CharacterState)) return v as CharacterState
  return LEGACY_STATE_MAP[v] || fallback
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
    (typeof v.skinColor === 'string' || typeof v.skinTone === 'string')
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
    skinColor:
      typeof v.skinColor === 'string'
        ? v.skinColor
        : typeof v.skinTone === 'string'
          ? v.skinTone
          : base.skinColor,
    hairStyle: v.hairStyle === '0' || v.hairStyle === '1' || v.hairStyle === '2' || v.hairStyle === '3' ? v.hairStyle : base.hairStyle,
    hairColor: typeof v.hairColor === 'string' ? v.hairColor : base.hairColor,
    topStyle: v.topStyle === '0' || v.topStyle === '1' || v.topStyle === '2' || v.topStyle === '3' ? v.topStyle : base.topStyle,
    topColor:
      typeof v.topColor === 'string'
        ? v.topColor
        : typeof v.outfitColor === 'string'
          ? v.outfitColor
          : base.topColor,
    bottomColor: typeof v.bottomColor === 'string' ? v.bottomColor : base.bottomColor,
    photoURL: v.photoURL === null || typeof v.photoURL === 'string' ? v.photoURL : user.photoURL ?? base.photoURL,
    email: v.email === null || typeof v.email === 'string' ? v.email : user.email ?? base.email,
    tasks,
    spotify:
      v.spotify &&
      typeof v.spotify === 'object' &&
      typeof (v.spotify as { name?: unknown }).name === 'string' &&
      Array.isArray((v.spotify as { artists?: unknown }).artists)
        ? {
            name: (v.spotify as { name: string }).name,
            artists: (v.spotify as { artists: string[] }).artists,
            albumName: String((v.spotify as { albumName?: unknown }).albumName || 'Unknown album'),
            albumImageUrl:
              typeof (v.spotify as { albumImageUrl?: unknown }).albumImageUrl === 'string'
                ? (v.spotify as { albumImageUrl: string }).albumImageUrl
                : undefined,
            songUrl:
              typeof (v.spotify as { songUrl?: unknown }).songUrl === 'string'
                ? (v.spotify as { songUrl: string }).songUrl
                : undefined,
            isPlaying: Boolean((v.spotify as { isPlaying?: unknown }).isPlaying),
            updatedAt:
              typeof (v.spotify as { updatedAt?: unknown }).updatedAt === 'number'
                ? (v.spotify as { updatedAt: number }).updatedAt
                : undefined,
          }
        : null,
  }
}

export function recordFromRtdb(raw: Record<string, unknown>): CharacterRecord | null {
  if (!isOnboardedProfile(raw)) return null

  const tasks: CharacterRecord['tasks'] = Array.isArray(raw.tasks)
    ? raw.tasks.filter(
        (t): t is { id: number; text: string; done: boolean } =>
          t &&
          typeof t === 'object' &&
          typeof (t as { id?: unknown }).id === 'number' &&
          typeof (t as { text?: unknown }).text === 'string' &&
          typeof (t as { done?: unknown }).done === 'boolean',
      )
    : []

  let spotify: CharacterRecord['spotify'] = null
  if (raw.spotify && typeof raw.spotify === 'object') {
    const s = raw.spotify as Record<string, unknown>
    if (typeof s.name === 'string' && Array.isArray(s.artists)) {
      spotify = {
        name: s.name,
        artists: s.artists.filter((a): a is string => typeof a === 'string'),
        albumName: typeof s.albumName === 'string' ? s.albumName : 'Unknown album',
        albumImageUrl: typeof s.albumImageUrl === 'string' ? s.albumImageUrl : undefined,
        songUrl: typeof s.songUrl === 'string' ? s.songUrl : undefined,
        isPlaying: Boolean(s.isPlaying),
        updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : undefined,
      }
    }
  }

  return {
    name: typeof raw.name === 'string' ? raw.name : 'Unknown',
    gender: asGender(raw.gender),
    state: asCharacterState(raw.state, 'idle'),
    public: typeof raw.public === 'boolean' ? raw.public : true,
    scene: asSceneId(raw.scene, 'office'),
    skinColor:
      typeof raw.skinColor === 'string'
        ? raw.skinColor
        : typeof raw.skinTone === 'string'
          ? raw.skinTone
          : '#FFDBB4',
    hairStyle: raw.hairStyle === '0' || raw.hairStyle === '1' || raw.hairStyle === '2' || raw.hairStyle === '3' ? raw.hairStyle : '0',
    hairColor: typeof raw.hairColor === 'string' ? raw.hairColor : '#1f2937',
    topStyle: raw.topStyle === '0' || raw.topStyle === '1' || raw.topStyle === '2' || raw.topStyle === '3' ? raw.topStyle : '0',
    topColor:
      typeof raw.topColor === 'string'
        ? raw.topColor
        : typeof raw.outfitColor === 'string'
          ? raw.outfitColor
          : '#6366f1',
    bottomColor: typeof raw.bottomColor === 'string' ? raw.bottomColor : '#1e3a5f',
    photoURL: typeof raw.photoURL === 'string' ? raw.photoURL : null,
    email: typeof raw.email === 'string' ? raw.email : null,
    tasks,
    spotify,
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
