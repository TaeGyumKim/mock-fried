import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { ApiClient, ApiRequestOptions, ApiSchema } from '../types'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const mockConfig = config.public?.mock as { enable?: boolean, prefix?: string } | undefined

  // Mock이 비활성화된 경우 빈 API 반환
  if (!mockConfig?.enable) {
    return {
      provide: {
        api: {} as ApiClient,
      },
    }
  }

  const prefix = mockConfig.prefix || '/mock'

  /**
   * REST API 호출
   */
  const rest = async <T = unknown>(path: string, options?: ApiRequestOptions): Promise<T> => {
    const url = `${prefix}${path.startsWith('/') ? path : '/' + path}`

    const fetchOptions: RequestInit & { params?: Record<string, string | number> } = {
      method: options?.method || 'GET',
    }

    // GET이 아닌 경우 body 추가
    if (options?.body && fetchOptions.method !== 'GET') {
      fetchOptions.body = JSON.stringify(options.body)
      fetchOptions.headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      }
    }

    // 사용자 헤더 추가 (기존 헤더 덮어쓰기 가능)
    if (options?.headers) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        ...options.headers,
      }
    }

    // 쿼리 파라미터 처리
    let finalUrl = url
    if (options?.params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(options.params)) {
        searchParams.append(key, String(value))
      }
      finalUrl = `${url}?${searchParams.toString()}`
    }

    const response = await $fetch<T>(finalUrl, fetchOptions as Parameters<typeof $fetch>[1])
    return response
  }

  /**
   * RPC 호출
   */
  const rpc = async <T = unknown>(
    service: string,
    method: string,
    params?: Record<string, unknown>,
  ): Promise<T> => {
    const url = `${prefix}/rpc/${service}/${method}`

    const response = await $fetch<{ data: T }>(url, {
      method: 'POST',
      body: params,
    })

    return response.data
  }

  // 스키마 캐시
  let cachedSchema: ApiSchema | null = null

  /**
   * API 스키마 조회
   */
  const getSchema = async (): Promise<ApiSchema> => {
    if (cachedSchema) {
      return cachedSchema
    }

    const url = `${prefix}/__schema`
    const schema = await $fetch<ApiSchema>(url)
    cachedSchema = schema
    return schema
  }

  // 기본 API 클라이언트
  const baseApi: Pick<ApiClient, 'rest' | 'rpc' | 'getSchema'> = {
    rest,
    rpc,
    getSchema,
  }

  // Proxy로 동적 서비스 접근 지원
  const apiProxy = new Proxy(baseApi as ApiClient, {
    get(target, prop: string) {
      // 기본 메서드 접근
      if (prop === 'rest' || prop === 'rpc' || prop === 'getSchema') {
        return target[prop as keyof typeof target]
      }

      // 동적 서비스 접근: api.UserService.GetUser(params)
      return new Proxy({} as Record<string, unknown>, {
        get(_, methodName: string) {
          return (params?: Record<string, unknown>) => rpc(prop, methodName, params)
        },
      })
    },
  })

  return {
    provide: {
      api: apiProxy,
    },
  }
})
