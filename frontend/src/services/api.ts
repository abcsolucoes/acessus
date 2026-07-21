/* ============================================================
   Camada de API
   Todas as chamadas ao backend passam por aqui.
   ============================================================ */

// VITE_API_URL para deploy em domínios distintos (ex: Render, VPS com proxy reverso)
// Fallback: mesmo hostname do frontend — funciona em localhost e na rede local
export const API_URL = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:8080`

// ── Token ─────────────────────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function saveToken(token: string): void {
  localStorage.setItem('token', token)
}

export function removeToken(): void {
  localStorage.removeItem('token')
}

// ── Headers autenticados ───────────────────────────────────
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getToken()
  if (!token) return extra
  return { Authorization: `Bearer ${token}`, ...extra }
}

// ── Fetch com tratamento de erro padrão ────────────────────
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<T> {

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout))

  // 401 — token inválido, expirado ou usuário desativado no backend
  // Limpa a sessão e redireciona para o login independente de qual página disparou
  if (res.status === 401) {
    // Só redireciona se havia um token (sessão expirada)
    // Se não havia token, é a tela de login com credenciais erradas — deixa o catch tratar
    if (getToken()) {
      removeToken()
      window.location.href = '/login'
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || body.message || 'Credenciais inválidas')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || body.message || `Erro ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const contentType = res.headers.get('content-type')

  if (contentType?.includes('application/json')) {
    return res.json()
  }

  return res.text() as Promise<T>
}

export function decodeToken(): { name: string; role: string; sub: string } | null {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    // Verifica se o token expirou (exp é em segundos Unix)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      removeToken()  // limpa o token expirado do localStorage
      return null
    }

    return payload
  } catch {
    return null
  }
}