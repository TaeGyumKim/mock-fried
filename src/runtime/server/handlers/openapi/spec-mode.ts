/**
 * OpenAPI Spec File Mode Handler
 * Handles mock responses based on OpenAPI YAML/JSON spec files
 * Supports both Swagger 2.0 and OpenAPI 3.x
 */
import {
  generateMockFromSchema,
  hashString,
  type SchemaContext,
} from '../../utils/mock'
import type { CursorPaginationManager, PagePaginationManager } from '../../utils/mock/pagination'
import {
  OpenAPIItemProvider,
  analyzePaginationSchema,
  type OpenAPISchema,
} from '../../utils/mock/providers'
import { cacheManager, type OpenAPISpec } from '../../utils/cache-manager'
import { getOrCreateCursorManager, getOrCreatePageManager } from '../../utils/pagination-factory'
import { loadSpec, getSchemaDefinitions, type SpecLoaderResult } from '../../utils/spec-loader'

/**
 * 캐시된 스펙 로드 결과 가져오기
 * @internal
 */
async function getCachedSpecLoader(specPath: string): Promise<SpecLoaderResult> {
  const cache = cacheManager.specMode

  // 캐시된 결과 반환
  if (cache.specLoader && cache.specPath === specPath) {
    return cache.specLoader
  }

  // 새로 로드 (swagger-parser 사용)
  const result = await loadSpec(specPath)

  // 캐시 업데이트
  cache.specLoader = result
  cache.specPath = specPath

  console.log(`[mock-fried] Loaded ${result.version} spec: ${specPath}`)

  return result
}

/**
 * 스키마 참조 해결
 */
export function resolveSchemaRef(
  schema: OpenAPISchema,
  schemas?: Record<string, Record<string, unknown>>,
): OpenAPISchema {
  if (!schema.$ref || !schemas) return schema
  const schemaName = schema.$ref.split('/').pop()
  const resolved = schemaName ? schemas[schemaName] : undefined
  return (resolved ?? schema) as OpenAPISchema
}

/**
 * OpenAPI Backend 인스턴스 가져오기 (캐싱 포함)
 * Swagger 2.0과 OpenAPI 3.x 모두 지원
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOpenAPIBackend(specPath: string): Promise<any> {
  const cache = cacheManager.specMode

  if (cache.apiInstance && cache.specPath === specPath) {
    return cache.apiInstance
  }

  const { OpenAPIBackend } = await import('openapi-backend')

  // swagger-parser로 스펙 로드 (Swagger 2.0 → OpenAPI 3.0 변환 포함)
  const { spec, openapi3Spec } = await getCachedSpecLoader(specPath)

  // 스키마 컨텍스트용 캐시 (원본 스펙)
  cache.spec = spec as OpenAPISpec

  const apiInstance = new OpenAPIBackend({
    // OpenAPI 3.0 스펙 전달 (Swagger 2.0도 변환되어 사용)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    definition: openapi3Spec as any,
    quick: true, // 이미 OpenAPI 3.0으로 변환됨
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
      return handleNotImplemented(c, cache)
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
  cache.apiInstance = apiInstance
  cache.specPath = specPath

  return apiInstance
}

/**
 * notImplemented 핸들러 - Mock 응답 생성
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleNotImplemented(c: any, cache: typeof cacheManager.specMode) {
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
      schemas: apiSchemas || cache.spec?.components?.schemas,
      maxDepth: 10,
    }
    const resolvedSchema = resolveSchemaRef(schema, schemaContext.schemas)

    // Pagination 응답 스키마 분석
    const paginationInfo = analyzePaginationSchema(resolvedSchema)

    if (paginationInfo) {
      mockData = handlePaginationResponse(c, cache, paginationInfo, seed, schemaContext, operationId)
    }
    else {
      // Pagination이 아닌 일반 응답
      const numericSeed = hashString(seed)
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
}

/**
 * Pagination 응답 처리
 */
function handlePaginationResponse(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  c: any,
  cache: typeof cacheManager.specMode,
  paginationInfo: ReturnType<typeof analyzePaginationSchema>,
  seed: string,
  schemaContext: SchemaContext,
  operationId: string,
): Record<string, unknown> {
  if (!paginationInfo) {
    return {}
  }

  // Pagination 파라미터 추출
  const query = c.request?.query || {}
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || Number(query.size) || 20
  const cursor = query.cursor as string | undefined
  const isBackward = query[cache.backwardParam] === 'true' || query[cache.backwardParam] === '1'
  const total = 100 // 기본 총 아이템 수

  // ItemProvider 생성
  const itemProvider = new OpenAPIItemProvider(paginationInfo.itemSchema, {
    modelName: operationId,
    schemaContext,
  })

  // Pagination Manager 가져오기 (캐시 활용)
  const cursorManager = getOrCreateCursorManager(itemProvider, cache)
  const pageManager = getOrCreatePageManager(itemProvider, cache)

  // Cursor 기반 또는 Page 기반 pagination
  if (cursor || isBackward || paginationInfo.isCursorBased) {
    const result = cursorManager.getCursorPageWithProvider(itemProvider, {
      cursor,
      limit,
      total,
      seed,
      isBackward,
    })

    return buildCursorResponse(result, paginationInfo, total)
  }
  else {
    // Page 기반 pagination
    const result = pageManager.getPagedResponseWithProvider(itemProvider, {
      page,
      limit,
      total,
      seed,
    })

    return buildPageResponse(result, paginationInfo)
  }
}

/**
 * Cursor 기반 응답 구조 생성
 */
function buildCursorResponse(
  result: ReturnType<CursorPaginationManager<Record<string, unknown>>['getCursorPageWithProvider']>,
  paginationInfo: NonNullable<ReturnType<typeof analyzePaginationSchema>>,
  total: number,
): Record<string, unknown> {
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

  return responseData
}

/**
 * Page 기반 응답 구조 생성
 */
function buildPageResponse(
  result: ReturnType<PagePaginationManager<Record<string, unknown>>['getPagedResponseWithProvider']>,
  paginationInfo: NonNullable<ReturnType<typeof analyzePaginationSchema>>,
): Record<string, unknown> {
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

  return responseData
}
