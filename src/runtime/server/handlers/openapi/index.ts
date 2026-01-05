/**
 * OpenAPI Mock Handler
 * Main router that delegates to Spec File Mode or Client Package Mode
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { parseQuery } from 'ufo'
import { useRuntimeConfig } from '#imports'
import { cacheManager } from '../../utils/cache-manager'
import { getOpenAPIBackend } from './spec-mode'
import { getClientPackageData, handleClientPackageRequest } from './client-mode'
import type {
  OpenApiClientConfig,
  MockPaginationConfig,
  MockCursorConfig,
} from '../../../../types'

/**
 * OpenAPI 관련 캐시 초기화
 */
export function clearOpenApiCache(): void {
  cacheManager.clearOpenApi()
}

/**
 * OpenAPI Mock 핸들러
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const mockConfig = config.mock as
    | {
      prefix?: string
      openapiPath?: string
      clientPackagePath?: string
      clientPackageConfig?: OpenApiClientConfig
      pagination?: MockPaginationConfig
      cursor?: MockCursorConfig
    }
    | undefined

  // 요청 경로에서 prefix 제거 및 쿼리 파라미터 분리
  const prefix = mockConfig?.prefix || '/mock'
  const fullPath = event.path
  const queryIndex = fullPath.indexOf('?')
  let path = queryIndex >= 0 ? fullPath.substring(0, queryIndex) : fullPath
  const queryString = queryIndex >= 0 ? fullPath.substring(queryIndex + 1) : ''

  if (path.startsWith(prefix)) {
    path = path.substring(prefix.length) || '/'
  }

  // 쿼리 파라미터 추출 (URL 파싱 없이 직접 파싱)
  const query = parseQuery(queryString) as Record<string, string | number>

  // 요청 body 읽기 (GET이 아닌 경우)
  let body: unknown
  if (event.method !== 'GET' && event.method !== 'HEAD') {
    try {
      body = await readBody(event)
    }
    catch {
      body = undefined
    }
  }

  // 모드 1: 클라이언트 패키지 모드
  if (mockConfig?.clientPackagePath) {
    const { package: pkg, generator, cursorManager, pageManager } = getClientPackageData(
      mockConfig.clientPackagePath,
      mockConfig.clientPackageConfig,
      mockConfig.pagination,
      mockConfig.cursor,
    )

    const backwardParam = mockConfig?.cursor?.backwardParam || 'isBackward'
    const result = handleClientPackageRequest(
      pkg,
      generator,
      cursorManager,
      pageManager,
      path,
      event.method,
      query,
      backwardParam,
    )

    if (result.statusCode) {
      event.node.res.statusCode = result.statusCode
    }

    return result.body
  }

  // 모드 2: OpenAPI 스펙 파일 모드
  if (mockConfig?.openapiPath) {
    // Set backward param for spec file mode
    cacheManager.specMode.backwardParam = mockConfig?.cursor?.backwardParam || 'isBackward'
    const backend = await getOpenAPIBackend(mockConfig.openapiPath)

    // 요청 헤더 추출
    const headers: Record<string, string> = {}
    const rawHeaders = event.headers
    if (rawHeaders) {
      for (const [key, value] of Object.entries(rawHeaders)) {
        if (value) headers[key] = String(value)
      }
    }

    const result = await backend.handleRequest({
      method: event.method,
      path,
      query,
      body,
      headers,
    })

    if (result?.statusCode) {
      event.node.res.statusCode = result.statusCode
    }

    return result?.body ?? result
  }

  // 설정 없음
  throw createError({
    statusCode: 500,
    message: 'OpenAPI configuration not found. Set openapi path or client package.',
  })
})
