/**
 * OpenAPI Client Package Mode Handler
 * Handles mock responses based on generated OpenAPI client packages
 */
import {
  SchemaMockGenerator,
  extractDataModelName,
  CursorPaginationManager,
  PagePaginationManager,
} from '../../utils/mock'
import { getClientPackage } from '../../utils/client-parser'
import { cacheManager } from '../../utils/cache-manager'
import type {
  ParsedEndpoint,
  ParsedClientPackage,
  OpenApiClientConfig,
  MockPaginationConfig,
  MockCursorConfig,
} from '../../../../types'

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
 * 클라이언트 패키지에서 파싱된 정보 가져오기 (캐싱 포함)
 */
export function getClientPackageData(
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
  const cache = cacheManager.clientMode

  if (
    cache.package
    && cache.path === packagePath
    && cache.generator
    && cache.cursorManager
    && cache.pageManager
  ) {
    return {
      package: cache.package,
      generator: cache.generator,
      cursorManager: cache.cursorManager,
      pageManager: cache.pageManager,
    }
  }

  cache.package = getClientPackage(packagePath, config)
  cache.path = packagePath
  cache.generator = new SchemaMockGenerator(cache.package.models)

  // Initialize pagination managers with config
  cache.cursorManager = new CursorPaginationManager(cache.generator, {
    cursorConfig: cursorConfig,
  })
  cache.pageManager = new PagePaginationManager(cache.generator, {
    config: paginationConfig,
  })

  return {
    package: cache.package,
    generator: cache.generator,
    cursorManager: cache.cursorManager,
    pageManager: cache.pageManager,
  }
}

/**
 * 클라이언트 패키지 모드에서 Mock 응답 생성
 */
export function handleClientPackageRequest(
  pkg: ParsedClientPackage,
  generator: SchemaMockGenerator,
  cursorManager: CursorPaginationManager,
  pageManager: PagePaginationManager,
  path: string,
  method: string,
  query: Record<string, string | number>,
  backwardParam: string = 'isBackward',
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
    return handlePrimitiveResponse(path, endpoint)
  }

  const typeInfo = extractDataModelName(endpoint.responseType, pkg.models)
  const { modelName, isList, listFieldName, wrapperType } = typeInfo

  // Pagination 파라미터 추출
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || Number(query.size) || 20
  const cursor = query.cursor as string | undefined
  const isBackward = query[backwardParam] === 'true' || query[backwardParam] === '1'

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
      responseData = handlePaginatedListResponse(
        cursorManager,
        pageManager,
        modelName,
        seed,
        page,
        limit,
        cursor,
        isBackward,
      )
    }
    else {
      // 단순 배열 래퍼 응답 (posts, comments 등)
      responseData = handleSimpleListResponse(
        cursorManager,
        modelName,
        seed,
        limit,
        cursor,
        isBackward,
        listFieldName,
        wrapperSchema,
      )
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

/**
 * Primitive 타입 응답 처리
 */
function handlePrimitiveResponse(
  path: string,
  endpoint: ParsedEndpoint,
): { statusCode: number, body: unknown, meta: Record<string, unknown> } {
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

/**
 * 페이지네이션이 있는 리스트 응답 처리
 */
function handlePaginatedListResponse(
  cursorManager: CursorPaginationManager,
  pageManager: PagePaginationManager,
  modelName: string,
  seed: string,
  page: number,
  limit: number,
  cursor: string | undefined,
  isBackward: boolean,
): unknown {
  if (cursor || isBackward) {
    // 커서 기반 페이지네이션
    const result = cursorManager.getCursorPage(modelName, {
      cursor,
      limit,
      total: 100,
      seed,
      isBackward,
    })
    // Remove internal _snapshotId from response
    const { _snapshotId: _, ...responseWithoutSnapshotId } = result
    return responseWithoutSnapshotId
  }
  else {
    // 페이지 기반 페이지네이션
    const result = pageManager.getPagedResponse(modelName, {
      page,
      limit,
      total: 100,
      seed,
    })
    // Remove internal _snapshotId from response if present
    const { _snapshotId: _, ...responseWithoutSnapshotId } = result
    return responseWithoutSnapshotId
  }
}

/**
 * 단순 배열 래퍼 응답 처리
 */
function handleSimpleListResponse(
  cursorManager: CursorPaginationManager,
  modelName: string,
  seed: string,
  limit: number,
  cursor: string | undefined,
  isBackward: boolean,
  listFieldName: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapperSchema: any,
): unknown {
  const result = cursorManager.getCursorPage(modelName, {
    cursor,
    limit,
    total: 100,
    seed,
    isBackward,
  })

  if (listFieldName) {
    const listField = wrapperSchema?.fields.find((f: { name: string }) => f.name === listFieldName)
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

    return {
      [listJsonKey]: result.items,
      ...otherFields,
    }
  }
  else {
    return result.items
  }
}
