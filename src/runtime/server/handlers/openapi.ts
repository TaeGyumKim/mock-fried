import { defineEventHandler, getQuery, readBody, createError, getRequestURL } from 'h3'
import { useRuntimeConfig } from '#imports'
import { readFileSync } from 'node:fs'
import yaml from 'js-yaml'
import {
  generateMockFromSchema,
  hashString,
  SchemaMockGenerator,
  extractDataModelName,
  CursorPaginationManager,
  PagePaginationManager,
} from '../utils/mock'
import { getClientPackage } from '../utils/client-parser'
import type {
  ParsedEndpoint,
  ParsedClientPackage,
  OpenApiClientConfig,
  MockPaginationConfig,
  MockCursorConfig,
  MockResponseFormat,
} from '../../../types'

// ============================================
// OpenAPI Backend 모드 (기존 스펙 파일 방식)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let apiInstance: any = null
let cachedSpecPath: string | null = null

interface OpenAPISpec {
  openapi?: string
  info?: Record<string, unknown>
  paths?: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, Record<string, unknown>>
  }
}

function loadOpenAPISpec(specPath: string): OpenAPISpec {
  const content = readFileSync(specPath, 'utf-8')

  if (specPath.endsWith('.yaml') || specPath.endsWith('.yml')) {
    return yaml.load(content) as OpenAPISpec
  }

  return JSON.parse(content) as OpenAPISpec
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOpenAPIBackend(specPath: string): Promise<any> {
  if (apiInstance && cachedSpecPath === specPath) {
    return apiInstance
  }

  const { OpenAPIBackend } = await import('openapi-backend')
  const definition = loadOpenAPISpec(specPath)

  apiInstance = new OpenAPIBackend({
    definition,
    quick: true,
  })

  apiInstance.register({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notFound: async (_c: any) => {
      return {
        statusCode: 404,
        body: { error: 'Not found', message: 'No matching operation found' },
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notImplemented: async (c: any) => {
      const operationId = c.operation?.operationId || 'unknown'
      const responses = c.operation?.responses as
        | Record<
          string,
          { content?: Record<string, { schema?: Record<string, unknown>, example?: unknown }> }
        >
        | undefined

      const successResponse
        = responses?.['200'] || responses?.['201'] || Object.values(responses || {})[0]
      const content = successResponse?.content
      const jsonContent = content?.['application/json']

      let mockData: unknown = null

      if (jsonContent?.example) {
        mockData = jsonContent.example
      }
      else if (jsonContent?.schema) {
        const seed = hashString(operationId + JSON.stringify(c.request?.params || {}))
        mockData = generateMockFromSchema(jsonContent.schema, seed)
      }

      return {
        statusCode: 200,
        body: mockData,
        meta: { operationId },
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validationFail: async (c: any) => {
      return {
        statusCode: 400,
        body: {
          error: 'Validation failed',
          details: c.validation?.errors || [],
        },
      }
    },
  })

  await apiInstance.init()
  cachedSpecPath = specPath

  return apiInstance
}

// ============================================
// Client Package 모드 (생성된 클라이언트 파싱)
// ============================================

let cachedClientPackage: ParsedClientPackage | null = null
let cachedClientPath: string | null = null
let mockGenerator: SchemaMockGenerator | null = null
let cursorPaginationManager: CursorPaginationManager | null = null
let pagePaginationManager: PagePaginationManager | null = null

/**
 * 클라이언트 패키지에서 파싱된 정보 가져오기
 */
function getClientPackageData(
  packagePath: string,
  config?: OpenApiClientConfig,
  paginationConfig?: MockPaginationConfig,
  cursorConfig?: MockCursorConfig,
): {
  package: ParsedClientPackage
  generator: SchemaMockGenerator
  cursorManager: CursorPaginationManager
  pageManager: PagePaginationManager
} {
  if (cachedClientPackage && cachedClientPath === packagePath && mockGenerator && cursorPaginationManager && pagePaginationManager) {
    return {
      package: cachedClientPackage,
      generator: mockGenerator,
      cursorManager: cursorPaginationManager,
      pageManager: pagePaginationManager,
    }
  }

  cachedClientPackage = getClientPackage(packagePath, config)
  cachedClientPath = packagePath
  mockGenerator = new SchemaMockGenerator(cachedClientPackage.models)

  // Initialize pagination managers with config
  cursorPaginationManager = new CursorPaginationManager(mockGenerator, {
    cursorConfig: cursorConfig,
  })
  pagePaginationManager = new PagePaginationManager(mockGenerator, {
    config: paginationConfig,
  })

  return {
    package: cachedClientPackage,
    generator: mockGenerator,
    cursorManager: cursorPaginationManager,
    pageManager: pagePaginationManager,
  }
}

/**
 * 엔드포인트 경로의 구체성 점수 계산 (높을수록 우선)
 * - 파라미터가 적을수록 높은 점수
 * - 경로가 길수록 높은 점수
 */
function getPathSpecificity(path: string): number {
  const segments = path.split('/').filter(Boolean)
  const paramCount = (path.match(/\{(\w+)\}/g) || []).length
  // 구체적인 경로일수록 높은 점수 (파라미터가 적고, 세그먼트가 많을수록)
  return segments.length * 100 - paramCount * 10
}

/**
 * 요청 경로와 메서드에 매칭되는 엔드포인트 찾기
 * 더 구체적인 경로(파라미터가 적은)를 우선 매칭
 */
function findMatchingEndpoint(
  endpoints: ParsedEndpoint[],
  path: string,
  method: string,
): { endpoint: ParsedEndpoint, pathParams: Record<string, string> } | null {
  const normalizedMethod = method.toUpperCase()

  // 엔드포인트를 구체성 점수로 정렬 (높은 점수 = 더 구체적 = 우선)
  const sortedEndpoints = [...endpoints]
    .filter(e => e.method === normalizedMethod)
    .sort((a, b) => getPathSpecificity(b.path) - getPathSpecificity(a.path))

  for (const endpoint of sortedEndpoints) {
    // 경로 패턴 매칭 (예: /admin/accounts/{accountId} -> /admin/accounts/123)
    const pattern = endpoint.path.replace(/\{(\w+)\}/g, '([^/]+)')
    const regex = new RegExp(`^${pattern}$`)
    const match = path.match(regex)

    if (match) {
      // Path 파라미터 추출
      const pathParams: Record<string, string> = {}
      const paramNames = endpoint.path.match(/\{(\w+)\}/g) || []

      paramNames.forEach((param, index) => {
        const paramName = param.slice(1, -1) // {id} -> id
        pathParams[paramName] = match[index + 1] || ''
      })

      return { endpoint, pathParams }
    }
  }

  return null
}

/**
 * 클라이언트 패키지 모드에서 Mock 응답 생성
 */
function handleClientPackageRequest(
  pkg: ParsedClientPackage,
  generator: SchemaMockGenerator,
  cursorManager: CursorPaginationManager,
  pageManager: PagePaginationManager,
  path: string,
  method: string,
  query: Record<string, string | number>,
  _responseFormat: MockResponseFormat = 'auto',
): { statusCode: number, body: unknown, meta?: Record<string, unknown> } {
  const match = findMatchingEndpoint(pkg.endpoints, path, method)

  if (!match) {
    return {
      statusCode: 404,
      body: { error: 'Not found', message: `No matching endpoint for ${method} ${path}` },
    }
  }

  const { endpoint, pathParams } = match

  // Primitive/generic 타입 응답 처리 (object, string, number, boolean, void 등)
  const primitiveTypes = ['object', 'string', 'number', 'boolean', 'void', 'any', 'unknown']
  if (primitiveTypes.includes(endpoint.responseType.toLowerCase())) {
    // 경로명 기반으로 적절한 기본 응답 생성
    const pathLower = path.toLowerCase()
    let primitiveResponse: unknown = {}

    if (pathLower.includes('health')) {
      primitiveResponse = { status: 'ok', timestamp: new Date().toISOString() }
    }
    else if (pathLower.includes('ping')) {
      primitiveResponse = { pong: true }
    }
    else if (endpoint.responseType === 'string') {
      primitiveResponse = 'success'
    }
    else if (endpoint.responseType === 'number') {
      primitiveResponse = 0
    }
    else if (endpoint.responseType === 'boolean') {
      primitiveResponse = true
    }

    return {
      statusCode: 200,
      body: primitiveResponse,
      meta: {
        operationId: endpoint.operationId,
        apiClass: endpoint.apiClassName,
        responseType: endpoint.responseType,
      },
    }
  }

  const typeInfo = extractDataModelName(endpoint.responseType, pkg.models)
  const { modelName, isList, listFieldName, wrapperType } = typeInfo

  // Pagination 파라미터 추출
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || Number(query.size) || 20
  const cursor = query.cursor as string | undefined

  // 래퍼 응답 타입의 다른 필드들 생성 (pagination 등)
  const wrapperSchema = wrapperType ? pkg.models.get(wrapperType) : null
  const hasItemsField = listFieldName === 'items'
  const hasPaginationFields = wrapperSchema?.fields.some(f =>
    ['page', 'totalPages', 'total', 'totalItems', 'pagination'].includes(f.name),
  )

  let responseData: unknown

  if (isList) {
    const seed = `${endpoint.path}-${JSON.stringify(pathParams)}`

    // 페이지네이션이 있는 리스트 응답 (items 필드 + pagination 필드)
    if (hasItemsField && hasPaginationFields) {
      if (cursor) {
        // 커서 기반 페이지네이션 (새 CursorPaginationManager 사용)
        const result = cursorManager.getCursorPage(modelName, {
          cursor,
          limit,
          total: 100,
          seed,
        })
        // Remove internal _snapshotId from response
        const { _snapshotId: _, ...responseWithoutSnapshotId } = result
        responseData = responseWithoutSnapshotId
      }
      else {
        // 페이지 기반 페이지네이션 (새 PagePaginationManager 사용)
        const result = pageManager.getPagedResponse(modelName, {
          page,
          limit,
          total: 100,
          seed,
        })
        // Remove internal _snapshotId from response if present
        const { _snapshotId: _, ...responseWithoutSnapshotId } = result
        responseData = responseWithoutSnapshotId
      }
    }
    else {
      // 단순 배열 래퍼 응답 (posts, comments 등)
      // 래퍼 구조로 응답 생성 - 페이지 기반으로 다른 아이템 생성
      const itemCount = limit || 10
      const startIndex = (page - 1) * itemCount // page 파라미터 반영
      const items = Array.from({ length: itemCount }, (_, i) => {
        const globalIndex = startIndex + i
        return generator.generateOne(modelName, `${seed}-${globalIndex}`, globalIndex)
      })

      if (listFieldName) {
        // 래퍼 스키마의 다른 필드들도 생성
        const otherFields: Record<string, unknown> = {}

        // listFieldName에 해당하는 필드의 JSON 키 가져오기
        const listField = wrapperSchema?.fields.find(f => f.name === listFieldName)
        const listJsonKey = listField?.jsonKey || listFieldName

        if (wrapperSchema) {
          for (const field of wrapperSchema.fields) {
            if (field.name !== listFieldName) {
              const outputKey = field.jsonKey || field.name
              // 커서 관련 필드 처리
              if (field.name === 'nextCursor' || field.name === 'cursor') {
                otherFields[outputKey] = cursor
                  ? Buffer.from(String(itemCount)).toString('base64')
                  : undefined
              }
              else if (field.name === 'hasMore') {
                otherFields[outputKey] = true
              }
              else if (field.name === 'total' || field.name === 'totalItems') {
                otherFields[outputKey] = 100
              }
              // 다른 필드는 generateOne으로 생성
            }
          }
        }

        responseData = {
          [listJsonKey]: items,
          ...otherFields,
        }
      }
      else {
        responseData = items
      }
    }
  }
  else {
    // 단일 객체 응답
    const seed = `${endpoint.operationId}-${JSON.stringify(pathParams)}`
    responseData = generator.generateOne(endpoint.responseType, seed)
  }

  return {
    statusCode: 200,
    body: responseData,
    meta: {
      operationId: endpoint.operationId,
      apiClass: endpoint.apiClassName,
      responseType: endpoint.responseType,
    },
  }
}

// ============================================
// 핸들러
// ============================================

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
      responseFormat?: MockResponseFormat
    }
    | undefined

  // 요청 URL에서 prefix 제거
  const requestUrl = getRequestURL(event)
  const prefix = mockConfig?.prefix || '/mock'
  let path = requestUrl.pathname

  if (path.startsWith(prefix)) {
    path = path.substring(prefix.length) || '/'
  }

  // 쿼리 파라미터 추출
  const query = getQuery(event) as Record<string, string | number>

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

    const result = handleClientPackageRequest(
      pkg,
      generator,
      cursorManager,
      pageManager,
      path,
      event.method,
      query,
      mockConfig.responseFormat ?? 'auto',
    )

    if (result.statusCode) {
      event.node.res.statusCode = result.statusCode
    }

    return result.body
  }

  // 모드 2: OpenAPI 스펙 파일 모드
  if (mockConfig?.openapiPath) {
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
