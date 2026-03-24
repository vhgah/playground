export interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  albumName: string
  albumImageUrl?: string
  songUrl?: string
  isPlaying: boolean
  progressMs?: number
  durationMs?: number
}

interface SpotifyTokenStore {
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

const SPOTIFY_SCOPE = 'user-read-currently-playing user-read-recently-played'
const TOKEN_STORAGE_KEY = 'cw:spotify:token'
const STATE_STORAGE_KEY = 'cw:spotify:oauth-state'
const VERIFIER_STORAGE_KEY = 'cw:spotify:code-verifier'

function getSpotifyClientId(): string {
  return '5ae2b8c92c2d474685884818e68dfc97'
}

function getSpotifyRedirectUri(): string {
  const configured = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
  return configured || `${window.location.origin}${window.location.pathname}`
}

export function isSpotifyConfigured(): boolean {
  return !!getSpotifyClientId()
}

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('')
}

async function sha256(input: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  return crypto.subtle.digest('SHA-256', encoder.encode(input))
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function loadTokenStore(): SpotifyTokenStore | null {
  const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as SpotifyTokenStore
    if (!parsed?.accessToken || typeof parsed.expiresAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function saveTokenStore(data: SpotifyTokenStore) {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data))
}

function clearOAuthTempStorage() {
  sessionStorage.removeItem(STATE_STORAGE_KEY)
  sessionStorage.removeItem(VERIFIER_STORAGE_KEY)
}

export function clearSpotifySession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  clearOAuthTempStorage()
}

async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokenStore> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: getSpotifyClientId(),
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    clearSpotifySession()
    throw new Error('Unable to refresh Spotify token')
  }

  const payload = (await response.json()) as {
    access_token: string
    expires_in: number
    refresh_token?: string
  }

  const next: SpotifyTokenStore = {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token || refreshToken,
    expiresAt: Date.now() + payload.expires_in * 1000,
  }
  saveTokenStore(next)
  return next
}

async function getValidAccessToken(): Promise<string | null> {
  const current = loadTokenStore()
  if (!current) return null

  // Refresh when token will expire soon.
  if (Date.now() >= current.expiresAt - 60_000) {
    if (!current.refreshToken) {
      clearSpotifySession()
      return null
    }
    const refreshed = await refreshAccessToken(current.refreshToken)
    return refreshed.accessToken
  }
  return current.accessToken
}

export async function beginSpotifyAuth() {
  if (!isSpotifyConfigured()) throw new Error('Spotify is not configured')

  const state = randomString(24)
  const codeVerifier = randomString(96)
  const codeChallenge = base64UrlEncode(await sha256(codeVerifier))

  sessionStorage.setItem(STATE_STORAGE_KEY, state)
  sessionStorage.setItem(VERIFIER_STORAGE_KEY, codeVerifier)

  const authUrl = new URL('https://accounts.spotify.com/authorize')
  authUrl.searchParams.set('client_id', getSpotifyClientId())
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', getSpotifyRedirectUri())
  authUrl.searchParams.set('scope', SPOTIFY_SCOPE)
  authUrl.searchParams.set('code_challenge_method', 'S256')
  authUrl.searchParams.set('code_challenge', codeChallenge)
  authUrl.searchParams.set('state', state)

  window.location.assign(authUrl.toString())
}

export async function handleSpotifyCallbackIfPresent(): Promise<boolean> {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (!code && !error) return false

  // Remove OAuth params from URL for cleaner UX.
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('error')
  window.history.replaceState({}, document.title, url.toString())

  if (error) {
    clearOAuthTempStorage()
    throw new Error(`Spotify authorization failed: ${error}`)
  }
  if (!code) {
    clearOAuthTempStorage()
    throw new Error('Spotify authorization code is missing')
  }

  const expectedState = sessionStorage.getItem(STATE_STORAGE_KEY)
  const verifier = sessionStorage.getItem(VERIFIER_STORAGE_KEY)
  clearOAuthTempStorage()

  if (!expectedState || state !== expectedState || !verifier) {
    throw new Error('Spotify state validation failed')
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getSpotifyRedirectUri(),
    client_id: getSpotifyClientId(),
    code_verifier: verifier,
  })

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) {
    throw new Error('Unable to exchange Spotify authorization code')
  }

  const payload = (await response.json()) as {
    access_token: string
    refresh_token?: string
    expires_in: number
  }

  saveTokenStore({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: Date.now() + payload.expires_in * 1000,
  })
  return true
}

function mapTrackFromItem(item: any, isPlaying: boolean): SpotifyTrack | null {
  const track = item?.track || item?.item
  if (!track?.id || !track?.name || !Array.isArray(track?.artists)) return null
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map((artist: { name?: string }) => artist.name || 'Unknown'),
    albumName: track.album?.name || 'Unknown album',
    albumImageUrl: track.album?.images?.[0]?.url,
    songUrl: track.external_urls?.spotify,
    isPlaying,
    progressMs: item?.progress_ms,
    durationMs: track.duration_ms,
  }
}

async function spotifyApi(path: string): Promise<Response> {
  const token = await getValidAccessToken()
  if (!token) throw new Error('Spotify is not connected')

  return fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export function hasSpotifySession(): boolean {
  return !!loadTokenStore()
}

export async function getSpotifyCurrentOrRecentTrack(): Promise<SpotifyTrack | null> {
  // Try currently-playing first (Premium-only, returns 403 on Free accounts).
  try {
    const currentRes = await spotifyApi('/me/player/currently-playing')
    if (currentRes.status === 200) {
      const payload = await currentRes.json()
      const currentTrack = mapTrackFromItem(payload, !!payload?.is_playing)
      if (currentTrack) return currentTrack
    }
  } catch {
    // Silently fall through to recently-played.
  }

  // Fallback: recently-played works for all account tiers.
  const recentRes = await spotifyApi('/me/player/recently-played?limit=1')
  if (!recentRes.ok) {
    throw new Error('Unable to fetch recently played track')
  }
  const recentPayload = await recentRes.json()
  const firstItem = recentPayload?.items?.[0]
  return mapTrackFromItem(firstItem, false)
}
