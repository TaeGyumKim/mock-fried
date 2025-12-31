import { defineEventHandler, readBody, getRouterParams, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import * as protoLoader from '@grpc/proto-loader'
import * as grpc from '@grpc/grpc-js'
import { readdirSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'pathe'
import {
  generateMockMessage,
  deriveSeedFromRequest,
  CursorPaginationManager,
  PagePaginationManager,
} from '../utils/mock'
import {
  ProtoItemProvider,
  analyzeProtoPagination,
  type ProtoMessageType,
} from '../utils/mock/providers'

// Proto 캐시
interface ProtoCache {
  packageDefinition: protoLoader.PackageDefinition
  grpcObject: grpc.GrpcObject
  services: Map<string, grpc.ServiceDefinition>
}

let protoCache: ProtoCache | null = null
let cachedProtoPath: string | null = null
// Proto Mode용 pagination managers
let protoCursorManager: CursorPaginationManager<Record<string, unknown>> | null = null
let protoPageManager: PagePaginationManager<Record<string, unknown>> | null = null

/**
 * 디렉토리에서 모든 .proto 파일 찾기
 */
function findProtoFiles(dirPath: string): string[] {
  const files: string[] = []

  const stat = statSync(dirPath)
  if (stat.isFile() && extname(dirPath) === '.proto') {
    return [dirPath]
  }

  if (stat.isDirectory()) {
    const entries = readdirSync(dirPath)
    for (const entry of entries) {
      const fullPath = join(dirPath, entry)
      const entryStat = statSync(fullPath)

      if (entryStat.isFile() && extname(entry) === '.proto') {
        files.push(fullPath)
      }
      else if (entryStat.isDirectory()) {
        files.push(...findProtoFiles(fullPath))
      }
    }
  }

  return files
}

/**
 * gRPC 객체에서 서비스 정의 추출
 */
function extractServices(
  obj: grpc.GrpcObject,
  services: Map<string, grpc.ServiceDefinition>,
  prefix = '',
): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullName = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'function' && 'service' in value) {
      // 서비스 생성자 발견
      const serviceConstructor = value as grpc.ServiceClientConstructor
      services.set(key, serviceConstructor.service)
      services.set(fullName, serviceConstructor.service)
    }
    else if (typeof value === 'object' && value !== null) {
      // 중첩 패키지 탐색
      extractServices(value as grpc.GrpcObject, services, fullName)
    }
  }
}

/**
 * Proto 파일 로드 및 파싱
 */
async function loadProto(protoPath: string): Promise<ProtoCache> {
  if (protoCache && cachedProtoPath === protoPath) {
    return protoCache
  }

  const protoFiles = findProtoFiles(protoPath)

  if (protoFiles.length === 0) {
    throw new Error(`No .proto files found in ${protoPath}`)
  }

  // protoPath가 파일인 경우 dirname 사용, 디렉토리인 경우 그대로 사용
  const stat = statSync(protoPath)
  const includeDir = stat.isFile() ? dirname(protoPath) : protoPath

  const packageDefinition = await protoLoader.load(protoFiles, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [includeDir],
  })

  const grpcObject = grpc.loadPackageDefinition(packageDefinition)

  const services = new Map<string, grpc.ServiceDefinition>()
  extractServices(grpcObject, services)

  protoCache = {
    packageDefinition,
    grpcObject,
    services,
  }
  cachedProtoPath = protoPath

  return protoCache
}

/**
 * Proto 캐시 초기화
 */
export function clearProtoCache(): void {
  protoCache = null
  cachedProtoPath = null
  protoCursorManager = null
  protoPageManager = null
}

/**
 * 메서드 정의에서 응답 타입 정보 추출
 */
function getResponseTypeInfo(methodDef: grpc.MethodDefinition<unknown, unknown>): Record<string, unknown> {
  // proto-loader의 타입 정의에서 responseType 추출
  const responseType = methodDef.responseType as unknown as {
    type?: Record<string, unknown>
    format?: string
  }

  if (responseType?.type) {
    return responseType.type
  }

  // 기본 빈 객체 반환
  return {}
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const mockConfig = config.mock as { prefix?: string, protoPath?: string } | undefined

  if (!mockConfig?.protoPath) {
    throw createError({
      statusCode: 500,
      message: 'Proto path not configured',
    })
  }

  // URL 파라미터에서 서비스/메서드 추출
  const params = getRouterParams(event)
  const serviceName = params.service
  const methodName = params.method

  if (!serviceName || !methodName) {
    throw createError({
      statusCode: 400,
      message: 'Service and method are required',
    })
  }

  // Proto 로드
  let cache: ProtoCache
  try {
    cache = await loadProto(mockConfig.protoPath)
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to load proto files: ${error instanceof Error ? error.message : 'Unknown error'}`,
    })
  }

  // 서비스 찾기
  const serviceDefinition = cache.services.get(serviceName)
  if (!serviceDefinition) {
    const availableServices = Array.from(cache.services.keys()).filter(k => !k.includes('.'))
    throw createError({
      statusCode: 404,
      message: `Service '${serviceName}' not found. Available services: ${availableServices.join(', ')}`,
    })
  }

  // 메서드 찾기
  const methodDef = serviceDefinition[methodName] as grpc.MethodDefinition<unknown, unknown> | undefined
  if (!methodDef) {
    const availableMethods = Object.keys(serviceDefinition)
    throw createError({
      statusCode: 404,
      message: `Method '${methodName}' not found in service '${serviceName}'. Available methods: ${availableMethods.join(', ')}`,
    })
  }

  // 스트리밍 체크 (unary만 지원)
  if (methodDef.requestStream || methodDef.responseStream) {
    throw createError({
      statusCode: 501,
      message: 'Streaming methods are not supported. Only unary RPC is available.',
    })
  }

  // 요청 body 읽기
  let requestBody: Record<string, unknown>
  try {
    requestBody = (await readBody(event)) as Record<string, unknown> ?? {}
  }
  catch {
    requestBody = {}
  }

  // 응답 타입 정보 추출
  const responseTypeInfo = getResponseTypeInfo(methodDef) as ProtoMessageType

  // seed 생성 (결정론적)
  const seed = deriveSeedFromRequest(requestBody)

  // Pagination 응답 분석
  const paginationInfo = analyzeProtoPagination(responseTypeInfo)

  let mockResponse: unknown

  if (paginationInfo) {
    // Pagination 파라미터 추출 (요청 body에서)
    const page = Number(requestBody.page) || 1
    const limit = Number(requestBody.limit) || Number(requestBody.page_size) || 20
    const cursor = requestBody.cursor as string | undefined
    const total = 100 // 기본 총 아이템 수

    // ItemProvider 생성
    const itemProvider = new ProtoItemProvider(paginationInfo.itemMessageType, {
      modelName: `${serviceName}.${methodName}`,
    })

    // Pagination Manager 초기화 (캐싱)
    if (!protoCursorManager) {
      protoCursorManager = new CursorPaginationManager(itemProvider)
    }
    if (!protoPageManager) {
      protoPageManager = new PagePaginationManager(itemProvider)
    }

    // Cursor 기반 또는 Page 기반 pagination
    if (cursor || paginationInfo.isCursorBased) {
      const result = protoCursorManager.getCursorPageWithProvider(itemProvider, {
        cursor,
        limit,
        total,
        seed,
      })

      // 응답 구조 생성
      const responseData: Record<string, unknown> = {
        [paginationInfo.itemsFieldName]: result.items,
      }

      // Pagination 메타 필드 추가
      for (const metaField of paginationInfo.metaFields) {
        const lowerField = metaField.toLowerCase()
        if (lowerField.includes('next') && lowerField.includes('cursor')) {
          responseData[metaField] = result.nextCursor
        }
        else if (lowerField.includes('prev') && lowerField.includes('cursor')) {
          responseData[metaField] = result.prevCursor
        }
        else if (lowerField.includes('has_more') || lowerField.includes('hasmore')) {
          responseData[metaField] = result.hasMore
        }
        else if (lowerField === 'cursor') {
          responseData[metaField] = result.nextCursor
        }
        else if (lowerField === 'total' || lowerField === 'total_items') {
          responseData[metaField] = total
        }
      }

      mockResponse = responseData
    }
    else {
      // Page 기반 pagination
      const result = protoPageManager.getPagedResponseWithProvider(itemProvider, {
        page,
        limit,
        total,
        seed,
      })

      // 응답 구조 생성
      const responseData: Record<string, unknown> = {
        [paginationInfo.itemsFieldName]: result.items,
      }

      // Pagination 메타 필드 추가
      for (const metaField of paginationInfo.metaFields) {
        const lowerField = metaField.toLowerCase()
        if (lowerField === 'page' || lowerField === 'page_number') {
          responseData[metaField] = result.page
        }
        else if (lowerField === 'total_pages' || lowerField === 'totalpages') {
          responseData[metaField] = result.totalPages
        }
        else if (lowerField === 'total' || lowerField === 'total_items') {
          responseData[metaField] = result.total
        }
        else if (lowerField === 'limit' || lowerField === 'page_size' || lowerField === 'size') {
          responseData[metaField] = result.limit
        }
        else if (lowerField === 'offset') {
          responseData[metaField] = (result.page - 1) * result.limit
        }
      }

      mockResponse = responseData
    }
  }
  else {
    // Pagination이 아닌 일반 응답
    mockResponse = generateMockMessage(responseTypeInfo, seed)
  }

  return {
    success: true,
    service: serviceName,
    method: methodName,
    data: mockResponse,
  }
})
