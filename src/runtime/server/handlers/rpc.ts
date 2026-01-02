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
 * Protobuf 타입 번호를 문자열로 변환
 * https://protobuf.dev/programming-guides/proto3/#scalar
 */
const PROTO_TYPE_MAP: Record<number, string> = {
  1: 'double',
  2: 'float',
  3: 'int64',
  4: 'uint64',
  5: 'int32',
  6: 'fixed64',
  7: 'fixed32',
  8: 'bool',
  9: 'string',
  10: 'group',
  11: 'message', // 중첩 메시지
  12: 'bytes',
  13: 'uint32',
  14: 'enum',
  15: 'sfixed32',
  16: 'sfixed64',
  17: 'sint32',
  18: 'sint64',
}

/**
 * Protobuf 필드 descriptor 인터페이스
 */
interface ProtoFieldDescriptor {
  name: string
  number: number
  label: number // 1=OPTIONAL, 2=REQUIRED, 3=REPEATED
  type: number // PROTO_TYPE_MAP 참조
  typeName?: string // 메시지/enum 타입 이름
  defaultValue?: unknown
  oneofIndex?: number // oneof 필드 인덱스
  proto3Optional?: boolean // proto3 optional 여부
}

/**
 * Proto 타입 descriptor 인터페이스
 */
interface ProtoTypeDescriptor {
  field?: ProtoFieldDescriptor[]
  nestedType?: ProtoTypeDescriptor[]
  enumType?: Array<{ name?: string, value?: Array<{ name: string, number: number }> }>
  name?: string
  oneofDecl?: Array<{ name: string }>
}

/**
 * 타입 해석 컨텍스트
 */
interface TypeResolverContext {
  packageDefinition: protoLoader.PackageDefinition
  visitedTypes: Set<string>
  depth: number
  maxDepth: number
}

/**
 * packageDefinition에서 타입 정보 찾기
 */
function findTypeInPackageDefinition(
  typeName: string,
  packageDefinition: protoLoader.PackageDefinition,
): ProtoTypeDescriptor | null {
  // typeName은 ".package.TypeName" 형식
  const cleanName = typeName.startsWith('.') ? typeName.slice(1) : typeName

  // packageDefinition에서 타입 찾기
  const typeInfo = packageDefinition[cleanName] as unknown as {
    type?: ProtoTypeDescriptor
  } | undefined

  return typeInfo?.type || null
}

/**
 * 필드 descriptor를 generateMockMessage 형식으로 변환
 */
function convertFieldDescriptor(
  fieldDesc: ProtoFieldDescriptor,
  protoType: ProtoTypeDescriptor,
  context: TypeResolverContext,
): { type: string, rule?: string, resolvedType?: Record<string, unknown>, typeName?: string } {
  const typeName = PROTO_TYPE_MAP[fieldDesc.type] || 'string'

  const result: {
    type: string
    rule?: string
    resolvedType?: Record<string, unknown>
    typeName?: string
  } = {
    type: typeName,
    rule: fieldDesc.label === 3 ? 'repeated' : undefined,
  }

  // 중첩 메시지 또는 enum 타입인 경우
  if (fieldDesc.typeName) {
    const shortName = fieldDesc.typeName.split('.').pop() || fieldDesc.typeName
    result.typeName = shortName

    // 깊이 제한 체크
    if (context.depth >= context.maxDepth) {
      return result
    }

    // 이미 방문한 타입인지 체크 (재귀 방지)
    if (context.visitedTypes.has(fieldDesc.typeName)) {
      // 재귀 타입: 빈 resolvedType 반환하여 generateMockMessage에서 처리하도록
      result.resolvedType = { fields: {}, name: shortName }
      return result
    }

    // 1. 같은 메시지 내의 nested enum 찾기
    const enumType = protoType.enumType?.find(
      (e: unknown) => (e as { name?: string }).name === shortName,
    )

    if (enumType) {
      result.resolvedType = {
        values: enumType.value?.reduce((acc, v) => {
          acc[v.name] = v.number
          return acc
        }, {} as Record<string, number>),
      }
      return result
    }

    // 2. 같은 메시지 내의 nested type 찾기
    const nestedType = protoType.nestedType?.find(
      (t: unknown) => (t as { name?: string }).name === shortName,
    )

    if (nestedType) {
      const nestedContext = {
        ...context,
        depth: context.depth + 1,
        visitedTypes: new Set([...context.visitedTypes, fieldDesc.typeName]),
      }
      result.resolvedType = resolveProtoType(nestedType, nestedContext)
      return result
    }

    // 3. packageDefinition에서 외부 타입 찾기
    const externalType = findTypeInPackageDefinition(fieldDesc.typeName, context.packageDefinition)

    if (externalType) {
      const externalContext = {
        ...context,
        depth: context.depth + 1,
        visitedTypes: new Set([...context.visitedTypes, fieldDesc.typeName]),
      }
      result.resolvedType = resolveProtoType(externalType, externalContext)
    }
  }

  return result
}

/**
 * Proto 타입을 generateMockMessage 형식으로 변환
 */
function resolveProtoType(
  protoType: ProtoTypeDescriptor,
  context: TypeResolverContext,
): Record<string, unknown> {
  if (!protoType.field) {
    return { fields: {}, name: protoType.name }
  }

  const fields: Record<string, {
    type: string
    rule?: string
    resolvedType?: Record<string, unknown>
    typeName?: string
  }> = {}

  // oneof 필드 그룹 추적
  const oneofGroups = new Map<number, string[]>()

  for (const fieldDesc of protoType.field) {
    // oneof 그룹 추적
    if (fieldDesc.oneofIndex !== undefined && !fieldDesc.proto3Optional) {
      const group = oneofGroups.get(fieldDesc.oneofIndex) || []
      group.push(fieldDesc.name)
      oneofGroups.set(fieldDesc.oneofIndex, group)
    }

    fields[fieldDesc.name] = convertFieldDescriptor(fieldDesc, protoType, context)
  }

  return {
    fields,
    name: protoType.name,
    // oneof 그룹 정보 (첫 번째 필드만 생성하도록)
    oneofGroups: oneofGroups.size > 0 ? Object.fromEntries(oneofGroups) : undefined,
  }
}

/**
 * 메서드 정의에서 응답 타입 정보 추출
 *
 * proto-loader의 구조:
 * {
 *   format: string,
 *   type: {
 *     field: ProtoFieldDescriptor[],
 *     nestedType: [],
 *     enumType: [],
 *     name: string
 *   },
 *   fileDescriptorProtos: Buffer[]
 * }
 *
 * generateMockMessage()가 기대하는 형식:
 * {
 *   fields: {
 *     fieldName: { type: string, rule?: string, resolvedType?: {} }
 *   }
 * }
 */
function getResponseTypeInfo(
  methodDef: grpc.MethodDefinition<unknown, unknown>,
  packageDefinition: protoLoader.PackageDefinition,
): Record<string, unknown> {
  const responseType = methodDef.responseType as unknown as {
    type?: ProtoTypeDescriptor
  }

  if (!responseType?.type?.field) {
    return {}
  }

  const context: TypeResolverContext = {
    packageDefinition,
    visitedTypes: new Set<string>(),
    depth: 0,
    maxDepth: 5, // 최대 재귀 깊이
  }

  return resolveProtoType(responseType.type, context)
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
  const responseTypeInfo = getResponseTypeInfo(methodDef, cache.packageDefinition) as ProtoMessageType

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
