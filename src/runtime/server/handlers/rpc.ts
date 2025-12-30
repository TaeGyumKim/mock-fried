import { defineEventHandler, readBody, getRouterParams, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import * as protoLoader from '@grpc/proto-loader'
import * as grpc from '@grpc/grpc-js'
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'pathe'
import { generateMockMessage, deriveSeedFromRequest } from '../utils/mock'

// Proto 캐시
interface ProtoCache {
  packageDefinition: protoLoader.PackageDefinition
  grpcObject: grpc.GrpcObject
  services: Map<string, grpc.ServiceDefinition>
}

let protoCache: ProtoCache | null = null
let cachedProtoPath: string | null = null

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

  const packageDefinition = await protoLoader.load(protoFiles, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [protoPath],
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
  let requestBody: unknown
  try {
    requestBody = await readBody(event)
  }
  catch {
    requestBody = {}
  }

  // 응답 타입 정보 추출
  const responseTypeInfo = getResponseTypeInfo(methodDef)

  // seed 생성 (결정론적)
  const seed = deriveSeedFromRequest(requestBody)

  // Mock 응답 생성
  const mockResponse = generateMockMessage(responseTypeInfo, seed)

  return {
    success: true,
    service: serviceName,
    method: methodName,
    data: mockResponse,
  }
})
