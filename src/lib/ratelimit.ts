import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Helper para inicializar Redis con fallback graceful
// Si las env vars no están seteadas, devuelve null y el rate limit
// se desactiva (no bloquea la app, solo loguea warning).
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    console.warn('[ratelimit] UPSTASH env vars no configuradas — rate limiting deshabilitado')
    return null
  }
  return new Redis({ url, token })
}

const redis = getRedis()

// Limiters por categoría de endpoint
// Sliding window: cuenta requests en ventana móvil (más justo que fixed window)

// Sync HabiHub: caro, raro. 5 por hora.
export const syncRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'),
      analytics: false,
      prefix: 'rl:sync',
    })
  : null

// Mutaciones admin (crear/editar/borrar): 30 por minuto
export const mutationRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: false,
      prefix: 'rl:mutation',
    })
  : null

// Upload de imágenes: 60 por minuto (admin sube muchas en sesión)
export const uploadRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, '1 m'),
      analytics: false,
      prefix: 'rl:upload',
    })
  : null

// Lecturas admin (get-property, get-cities, etc.): 100 por minuto
export const readRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: false,
      prefix: 'rl:read',
    })
  : null

/**
 * Aplica un rate limit a una request. Devuelve null si OK, o un
 * Response 429 si excedió el límite. Si el limiter es null
 * (Upstash caído o no configurado), deja pasar (fallback graceful).
 *
 * Identificador: usa header x-forwarded-for (IP del cliente) +
 * opcionalmente userId si está disponible. Combina ambos para
 * que distintos usuarios desde la misma IP no se bloqueen entre sí.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  if (!limiter) {
    // Fallback: sin rate limit configurado, dejar pasar
    return { ok: true }
  }

  const result = await limiter.limit(identifier)

  if (result.success) {
    return { ok: true }
  }

  // Calcular Retry-After en segundos
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
  return { ok: false, retryAfter: Math.max(retryAfter, 1) }
}

/**
 * Helper para extraer el identificador de una request.
 * Combina IP + userId (si disponible) para que el rate limit
 * funcione tanto en endpoints autenticados como no.
 */
export function getIdentifier(request: Request, userId?: string | null): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return userId ? `${ip}:${userId}` : ip
}
