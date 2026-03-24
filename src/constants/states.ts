import type { CharacterState } from '../stores/useAppStore'

export const CHARACTER_STATES: Array<{ id: CharacterState; label: string; icon: string }> = [
  { id: 'idle', label: 'Relaxing', icon: '😊' },
  { id: 'coding', label: 'Coding', icon: '💻' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'reading', label: 'Reading', icon: '📖' },
  { id: 'sleeping', label: 'Sleeping', icon: '😴' },
  { id: 'eating', label: 'Eating', icon: '🍜' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'workout', label: 'Workout', icon: '💪' },
  { id: 'meeting', label: 'Meeting', icon: '📋' },
]

export const CHARACTER_STATE_LABELS: Record<CharacterState, string> = Object.fromEntries(
  CHARACTER_STATES.map((state) => [state.id, state.label]),
) as Record<CharacterState, string>

export const CHARACTER_STATE_META: Record<CharacterState, { label: string; icon: string }> = Object.fromEntries(
  CHARACTER_STATES.map((state) => [state.id, { label: state.label, icon: state.icon }]),
) as Record<CharacterState, { label: string; icon: string }>
