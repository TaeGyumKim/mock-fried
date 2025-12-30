import { useNuxtApp } from '#app'
import type { ApiClient } from '../../types'

/**
 * Mock API 클라이언트 composable
 *
 * @example
 * ```ts
 * const api = useApi()
 *
 * // REST 호출
 * const users = await api.rest('/users')
 *
 * // RPC 호출
 * const user = await api.rpc('UserService', 'GetUser', { id: 1 })
 *
 * // 동적 서비스 접근
 * const user = await api.UserService.GetUser({ id: 1 })
 * ```
 */
export function useApi(): ApiClient {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$api as ApiClient
}
