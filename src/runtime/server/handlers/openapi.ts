import { defineEventHandler, readBody, createError } from 'h3'
import { parseQuery } from 'ufo'
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
  type SchemaContext,
} from '../utils/mock'
import {
  OpenAPIItemProvider,
  analyzePaginationSchema,
  type OpenAPISchema,
} from '../utils/mock/providers'
import { getClientPackage } from '../utils/client-parser'
import type {
  ParsedEndpoint,
  ParsedClientPackage,
  OpenApiClientConfig,
  MockPaginationConfig,
  MockCursorConfig,
} from '../../../types'

// ============================================
// OpenAPI Backend 모드 (기존 스펙 파일 방식)
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let apiInstance: any = null
let cachedSpecPath: string | null = null
// Spec File Mode용 pagination managers
let specCursorManager: CursorPaginationManager<Record<string, unknown>> | null = null
let specPageManager: PagePaginationManager<Record<string, unknown>> | null = null

interface OpenAPISpec {
  openapi?: string
  info?: Record<string, unknown>
  paths?: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, Record<string, unknown>>
  }
}

// 캐시된 스펙 (스키마 컨텍스트용)
let cachedOpenAPISpec: OpenAPISpec | null = null

function loadOpenAPISpec(specPath: string): OpenAPISpec {
  const content = readFileSync(specPath, 'utf-8')

  if (specPath.endsWith('.yaml') || specPath.endsWith('.yml')) {
    return yaml.load(content) as OpenAPISpec
  }

  return JSON.parse(content) as OpenAPISpec
}

function resolveSchemaRef(
  schema: OpenAPISchema,
  schemas?: Record<string, Record<string, unknown>>,
): OpenAPISchema {
  if (!schema.$ref || !schemas) return schema
  const schemaName = schema.$ref.split('/').pop()
  const resolved = schemaName ? schemas[schemaName] : undefined
  return (resolved ?? schema) as OpenAPISchema
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOpenAPIBackend(specPath: string): Promise<any> {
  if (apiInstance && cachedSpecPath === specPath) {
    return apiInstance
  }

  const { OpenAPIBackend } = await import('openapi-backend')
  const definition = loadOpenAPISpec(specPath)

  // 스키마 컨텍스트용 캐시
  cachedOpenAPISpec = definition

  apiInstance = new OpenAPIBackend({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    definition: definition as any,
    quick: false, // $ref 역참조를 위해 false로 설정
    validate: false, // Mock 서버에서는 request validation 비활성화
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

      // 204 No Content 처리 (DELETE 등)
      if (responses?.['204']) {
        return {
          statusCode: 204,
          body: null,
          meta: { operationId },
        }
      }

      const successResponse
        = responses?.['200'] || responses?.['201'] || Object.values(responses || {})[0]
      const content = successResponse?.content
      const jsonContent = content?.['application/json']

      let mockData: unknown = null

      if (jsonContent?.example) {
        mockData = jsonContent.example
      }
      else if (jsonContent?.schema) {
        const schema = jsonContent.schema as OpenAPISchema
        const seed = `${operationId}-${JSON.stringify(c.request?.params || {})}`
        const apiSchemas = (c.api?.document as OpenAPISpec | undefined)?.components?.schemas
        const schemaContext: SchemaContext = {
          schemas: apiSchemas || cachedOpenAPISpec?.components?.schemas,
          maxDepth: 10,
        }
        const resolvedSchema = resolveSchemaRef(schema, schemaContext.schemas)

        // Pagination 응답 스키마 분석
        const paginationInfo = analyzePaginationSchema(resolvedSchema)

        if (paginationInfo) {
          // Pagination 파라미터 추출
          const query = c.request?.query || {}
          const page = Number(query.page) || 1
          const limit = Number(query.limit) || Number(query.size) || 20
          const cursor = query.cursor as string | undefined
          const total = 100 // 기본 총 아이템 수

          // ItemProvider 생성
          const itemProvider = new OpenAPIItemProvider(paginationInfo.itemSchema, {
            modelName: operationId,
            schemaContext,
          })

          // Pagination Manager 초기화 (캐싱)
          if (!specCursorManager) {
            specCursorManager = new CursorPaginationManager(itemProvider)
          }
          if (!specPageManager) {
            specPageManager = new PagePaginationManager(itemProvider)
          }

          // Cursor 기반 또는 Page 기반 pagination
          if (cursor || paginationInfo.isCursorBased) {
            const result = specCursorManager.getCursorPageWithProvider(itemProvider, {
              cursor,
              limit,
              total,
              seed,
            })

            // 응답 스키마에 맞게 구조 생성
            const responseData: Record<string, unknown> = {
              [paginationInfo.itemsFieldName]: result.items,
            }

            // Pagination 메타 필드 추가
            if (paginationInfo.metaFields.includes('nextCursor')) {
              responseData.nextCursor = result.nextCursor ?? null
            }
            if (paginationInfo.metaFields.includes('prevCursor')) {
              responseData.prevCursor = result.prevCursor ?? null
            }
            if (paginationInfo.metaFields.includes('hasMore')) {
              responseData.hasMore = result.hasMore
            }
            if (paginationInfo.metaFields.includes('hasPrev')) {
              responseData.hasPrev = result.hasPrev ?? false
            }
            if (paginationInfo.metaFields.includes('total')) {
              responseData.total = total
            }
            if (paginationInfo.metaFields.includes('cursor')) {
              responseData.cursor = result.nextCursor ?? null
            }

            mockData = responseData
          }
          else {
            // Page 기반 pagination
            const result = specPageManager.getPagedResponseWithProvider(itemProvider, {
              page,
              limit,
              total,
              seed,
            })

            // 응답 스키마에 맞게 구조 생성
            const responseData: Record<string, unknown> = {
              [paginationInfo.itemsFieldName]: result.items,
            }

            // Pagination 메타 필드 추가
            if (paginationInfo.metaFields.includes('page')) {
              responseData.page = result.page
            }
            if (paginationInfo.metaFields.includes('totalPages')) {
              responseData.totalPages = result.totalPages
            }
            if (paginationInfo.metaFields.includes('total')) {
              responseData.total = result.total
            }
            if (paginationInfo.metaFields.includes('totalItems')) {
              responseData.totalItems = result.total
            }
            if (paginationInfo.metaFields.includes('limit')) {
              responseData.limit = result.limit
            }
            if (paginationInfo.metaFields.includes('size')) {
              responseData.size = result.limit
            }
            if (paginationInfo.metaFields.includes('offset')) {
              responseData.offset = (result.page - 1) * result.limit
            }

            mockData = responseData
          }
        }
        else {
          // Pagination이 아닌 일반 응답
          const numericSeed = hashString(seed)
          // 스키마 컨텍스트 생성 ($ref 해결용)
          // OpenAPIBackend의 document에서 스키마 가져오기 (더 안정적)
          mockData = generateMockFromSchema(
            schema as Record<string, unknown>,
            numericSeed,
            schemaContext,
          )
        }
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
 * OpenAPI 관련 캐시 초기화
 */
export function clearOpenApiCache(): void {
  apiInstance = null
  cachedSpecPath = null
  cachedOpenAPISpec = null
  cachedClientPackage = null
  cachedClientPath = null
  mockGenerator = null
  cursorPaginationManager = null
  pagePaginationManager = null
  specCursorManager = null
  specPageManager = null
}

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
): { statusCode: number, body: unknown, meta?: Record<string, unknown> } {
  const match = findMatchingEndpoint(pkg.endpoints, path, method)

  if (!match) {
    return {
      statusCode: 404,
      body: { error: 'Not found', message: `No matching endpoint for ${method} ${path}` },
    }
  }

  const { endpoint, pathParams } = match

  // void 응답 처리 (DELETE 등 204 No Content)
  if (endpoint.responseType.toLowerCase() === 'void') {
    return {
      statusCode: 204,
      body: null,
      meta: {
        operationId: endpoint.operationId,
        apiClass: endpoint.apiClassName,
        responseType: endpoint.responseType,
      },
    }
  }

  // Primitive/generic 타입 응답 처리 (object, string, number, boolean 등)
  const primitiveTypes = ['object', 'string', 'number', 'boolean', 'any', 'unknown']
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
      // cursor 파라미터가 있으면 CursorPaginationManager 사용
      if (cursor) {
        const result = cursorManager.getCursorPage(modelName, {
          cursor,
          limit,
          total: 100,
          seed,
        })

        if (listFieldName) {
          // 래퍼 구조로 변환 (items -> posts 등)
          const listField = wrapperSchema?.fields.find(f => f.name === listFieldName)
          const listJsonKey = listField?.jsonKey || listFieldName

          const otherFields: Record<string, unknown> = {}
          if (wrapperSchema) {
            for (const field of wrapperSchema.fields) {
              if (field.name !== listFieldName) {
                const outputKey = field.jsonKey || field.name
                if (field.name === 'nextCursor' || field.name === 'cursor') {
                  otherFields[outputKey] = result.nextCursor ?? null
                }
                else if (field.name === 'prevCursor') {
                  otherFields[outputKey] = result.prevCursor ?? null
                }
                else if (field.name === 'hasMore') {
                  otherFields[outputKey] = result.hasMore
                }
                else if (field.name === 'hasPrev') {
                  otherFields[outputKey] = result.hasPrev ?? false
                }
                else if (field.name === 'total' || field.name === 'totalItems') {
                  otherFields[outputKey] = 100
                }
              }
            }
          }

          responseData = {
            [listJsonKey]: result.items,
            ...otherFields,
          }
        }
        else {
          responseData = result.items
        }
      }
      else {
        // cursor가 없으면 첫 페이지 - CursorPaginationManager 사용
        // 이렇게 하면 cursor/page 모두 동일한 스냅샷과 ID를 사용
        const result = cursorManager.getCursorPage(modelName, {
          limit,
          total: 100,
          seed,
        })

        if (listFieldName) {
          const listField = wrapperSchema?.fields.find(f => f.name === listFieldName)
          const listJsonKey = listField?.jsonKey || listFieldName

          const otherFields: Record<string, unknown> = {}
          if (wrapperSchema) {
            for (const field of wrapperSchema.fields) {
              if (field.name !== listFieldName) {
                const outputKey = field.jsonKey || field.name
                if (field.name === 'nextCursor' || field.name === 'cursor') {
                  otherFields[outputKey] = result.nextCursor ?? null
                }
                else if (field.name === 'prevCursor') {
                  otherFields[outputKey] = result.prevCursor ?? null
                }
                else if (field.name === 'hasMore') {
                  otherFields[outputKey] = result.hasMore
                }
                else if (field.name === 'hasPrev') {
                  otherFields[outputKey] = result.hasPrev ?? false
                }
                else if (field.name === 'total' || field.name === 'totalItems') {
                  otherFields[outputKey] = 100
                }
              }
            }
          }

          responseData = {
            [listJsonKey]: result.items,
            ...otherFields,
          }
        }
        else {
          responseData = result.items
        }
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

    const result = handleClientPackageRequest(
      pkg,
      generator,
      cursorManager,
      pageManager,
      path,
      event.method,
      query,
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
