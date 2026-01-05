import { defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { consola } from 'consola'
import { createRequire } from 'node:module'
import { existsSync, statSync } from 'node:fs'
import type {
  ApiSchema,
  OpenApiSchema,
  OpenApiPathItem,
  OpenApiParameter,
  RpcSchema,
  RpcServiceSchema,
  RpcMethodSchema,
  RpcFieldSchema,
  OpenApiClientConfig,
  ParsedClientPackage,
  ParsedEndpoint,
} from '../../../types'
import { getClientPackage } from '../utils/client-parser'
import { findProtoFiles, getProtoTypeName } from '../utils/proto-utils'
import { cacheManager } from '../utils/cache-manager'
import { loadSpec, getSchemaDefinitions, mergeParameters, type ParsedSpec } from '../utils/spec-loader'

const logger = consola.withTag('mock-fried')

// ESM 환경에서 require.resolve 사용을 위한 helper (lazy initialization)
let _require: NodeRequire | null = null
function getRequire(): NodeRequire {
  if (!_require) {
    try {
      _require = createRequire(import.meta.url)
    }
    catch {
      // Fallback: 번들된 환경에서 import.meta.url이 유효하지 않을 수 있음
      _require = createRequire(process.cwd() + '/package.json')
    }
  }
  return _require
}

/**
 * ParsedEndpoint를 OpenApiPathItem으로 변환
 */
function convertEndpointToPathItem(endpoint: ParsedEndpoint): OpenApiPathItem {
  const parameters: OpenApiParameter[] = [
    ...(endpoint.pathParams || []).map(p => ({
      name: p.name,
      in: 'path' as const,
      required: p.required,
      schema: { type: p.type },
    })),
    ...(endpoint.queryParams || []).map(p => ({
      name: p.name,
      in: 'query' as const,
      required: p.required,
      schema: { type: p.type },
    })),
  ]

  return {
    path: endpoint.path,
    method: endpoint.method,
    operationId: endpoint.operationId,
    summary: endpoint.summary,
    tags: endpoint.apiClassName ? [endpoint.apiClassName] : undefined,
    parameters: parameters.length > 0 ? parameters : undefined,
    requestBody: endpoint.requestBodyType
      ? {
          content: {
            'application/json': {
              schema: { $ref: `#/components/schemas/${endpoint.requestBodyType}` },
            },
          },
        }
      : undefined,
    responses: {
      200: {
        description: 'Success',
        content: endpoint.responseType
          ? {
              'application/json': {
                schema: { $ref: `#/components/schemas/${endpoint.responseType}` },
              },
            }
          : undefined,
      },
    },
  }
}

/**
 * Client package 설정에서 OpenAPI 스키마 메타데이터 추출
 */
function parseClientPackageSchema(config: OpenApiClientConfig): OpenApiSchema | undefined {
  try {
    // 패키지 경로 resolve (ESM 환경에서도 동작하도록 createRequire 사용)
    const packagePath = getRequire().resolve(`${config.package}/package.json`)
    const packageRoot = packagePath.replace('/package.json', '').replace('\\package.json', '')

    const clientPackage: ParsedClientPackage = getClientPackage(packageRoot, config)

    // API 클래스별로 그룹화
    const apiGroups = new Map<string, typeof clientPackage.endpoints>()
    for (const endpoint of clientPackage.endpoints) {
      const apiName = endpoint.apiClassName || 'default'
      if (!apiGroups.has(apiName)) {
        apiGroups.set(apiName, [])
      }
      apiGroups.get(apiName)!.push(endpoint)
    }

    // ParsedEndpoint를 OpenApiPathItem으로 변환
    const pathItems = clientPackage.endpoints.map(convertEndpointToPathItem)

    return {
      info: {
        title: clientPackage.info.title || clientPackage.info.name || 'Unknown API',
        version: clientPackage.info.version || '1.0.0',
        description: `Generated from ${config.package}`,
      },
      paths: pathItems,
      // 추가 메타데이터: 모델 수, API 클래스 목록
      _meta: {
        source: 'client-package',
        package: config.package,
        apiClasses: Array.from(apiGroups.keys()),
        modelCount: clientPackage.models.size,
        endpointCount: clientPackage.endpoints.length,
      },
    }
  }
  catch (error) {
    logger.error('Failed to parse client package:', error)
    return undefined
  }
}

/**
 * 스키마 캐시 초기화
 */
export function clearSchemaCache(): void {
  cacheManager.clearSchema()
}

/**
 * OpenAPI 스펙에서 스키마 메타데이터 추출 (swagger-parser 사용)
 * Swagger 2.0과 OpenAPI 3.x 모두 지원
 */
async function parseOpenApiSpec(specPath: string): Promise<OpenApiSchema | undefined> {
  if (!existsSync(specPath)) {
    return undefined
  }

  try {
    const { spec, version } = await loadSpec(specPath)
    const info = spec.info || {}

    // 원본 스펙 사용 (dereferenced는 순환 참조 문제가 있을 수 있음)
    const paths = (spec as ParsedSpec).paths || {}
    const pathItems: OpenApiPathItem[] = []

    for (const [path, pathItem] of Object.entries(paths)) {
      const pathObj = pathItem as Record<string, unknown>

      // path-level params 추출
      const pathLevelParams = extractParameters(pathObj.parameters as unknown[] | undefined)

      for (const [method, operation] of Object.entries(pathObj)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          const op = operation as Record<string, unknown>

          // operation-level params 추출
          const operationParams = extractParameters(op.parameters as unknown[] | undefined)

          // path-level + operation-level params 병합 (spec-loader의 mergeParameters 사용)
          const mergedParams = mergeParameters(pathLevelParams, operationParams)

          // requestBody/responses는 $ref만 포함하여 순환 참조 방지
          const requestBody = extractRequestBodyRef(op.requestBody as Record<string, unknown> | undefined)
          const responses = extractResponsesRef(op.responses as Record<string, unknown> | undefined)

          pathItems.push({
            path,
            method: method.toUpperCase(),
            operationId: op.operationId as string | undefined,
            summary: op.summary as string | undefined,
            description: op.description as string | undefined,
            tags: op.tags as string[] | undefined,
            parameters: mergedParams.length > 0 ? mergedParams : undefined,
            requestBody,
            responses,
          })
        }
      }
    }

    // 스키마 수 계산 (버전에 따라 위치가 다름)
    const schemas = getSchemaDefinitions(spec)
    const schemaCount = Object.keys(schemas).length

    return {
      info: {
        title: (info.title as string) || 'Unknown API',
        version: (info.version as string) || '1.0.0',
        description: info.description as string | undefined,
      },
      paths: pathItems,
      _meta: {
        source: 'spec-file',
        specVersion: version, // 'swagger2' | 'openapi3'
        schemaCount,
        endpointCount: pathItems.length,
      },
    }
  }
  catch (error) {
    logger.error('Failed to parse OpenAPI spec:', specPath, error)
    return undefined
  }
}

/**
 * 파라미터 배열 추출 헬퍼
 */
function extractParameters(params: unknown[] | undefined): OpenApiParameter[] {
  if (!Array.isArray(params)) return []

  return params.map((param) => {
    const p = param as Record<string, unknown>
    return {
      name: p.name as string,
      in: p.in as 'path' | 'query' | 'header' | 'cookie',
      required: p.required as boolean | undefined,
      description: p.description as string | undefined,
      schema: p.schema as OpenApiParameter['schema'],
    }
  })
}

/**
 * requestBody에서 $ref만 추출 (순환 참조 방지)
 */
function extractRequestBodyRef(
  requestBody: Record<string, unknown> | undefined,
): OpenApiPathItem['requestBody'] {
  if (!requestBody) return undefined

  // OpenAPI 3.x: content.application/json.schema.$ref
  const content = requestBody.content as Record<string, Record<string, unknown>> | undefined
  if (content?.['application/json']?.schema) {
    const schema = content['application/json'].schema as Record<string, unknown>
    return {
      content: {
        'application/json': {
          schema: schema.$ref ? { $ref: schema.$ref as string } : { type: 'object' },
        },
      },
    }
  }

  // Swagger 2.0: body parameter의 schema
  return undefined
}

/**
 * responses에서 $ref만 추출 (순환 참조 방지)
 */
function extractResponsesRef(
  responses: Record<string, unknown> | undefined,
): OpenApiPathItem['responses'] {
  if (!responses) return undefined

  const result: Record<string, { description?: string, content?: Record<string, { schema: { $ref?: string, type?: string } }> }> = {}

  for (const [code, response] of Object.entries(responses)) {
    const res = response as Record<string, unknown>

    // OpenAPI 3.x: content.application/json.schema
    const content = res.content as Record<string, Record<string, unknown>> | undefined
    if (content?.['application/json']?.schema) {
      const schema = content['application/json'].schema as Record<string, unknown>
      result[code] = {
        description: res.description as string | undefined,
        content: {
          'application/json': {
            schema: schema.$ref
              ? { $ref: schema.$ref as string }
              : { type: (schema.type as string) || 'object' },
          },
        },
      }
    }
    // Swagger 2.0: schema 직접
    else if (res.schema) {
      const schema = res.schema as Record<string, unknown>
      result[code] = {
        description: res.description as string | undefined,
        content: {
          'application/json': {
            schema: schema.$ref
              ? { $ref: schema.$ref as string }
              : { type: (schema.type as string) || 'object' },
          },
        },
      }
    }
    else {
      result[code] = {
        description: res.description as string | undefined,
      }
    }
  }

  return result
}

/**
 * Proto 파일에서 스키마 메타데이터 추출
 */
async function parseProtoSpec(protoPath: string): Promise<RpcSchema | undefined> {
  if (!existsSync(protoPath)) {
    return undefined
  }

  try {
    const protoLoader = await import('@grpc/proto-loader')
    const { dirname } = await import('pathe')

    // 디렉토리인 경우 모든 proto 파일 찾기
    const stat = statSync(protoPath)
    const protoFiles = stat.isDirectory() ? findProtoFiles(protoPath) : [protoPath]
    const includeDir = stat.isDirectory() ? protoPath : dirname(protoPath)

    if (protoFiles.length === 0) {
      return undefined
    }

    const packageDefinition = await protoLoader.load(protoFiles, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [includeDir],
    })

    const services: RpcServiceSchema[] = []
    let packageName: string | undefined

    // 패키지 정의에서 서비스 추출
    for (const [fullName, def] of Object.entries(packageDefinition)) {
      const definition = def as Record<string, unknown>

      // 패키지명 추출
      if (!packageName && fullName.includes('.')) {
        packageName = fullName.split('.').slice(0, -1).join('.')
      }

      // 서비스인지 확인 (format 속성이 없으면 서비스)
      if (!definition.format && typeof definition === 'object') {
        const methods: RpcMethodSchema[] = []

        for (const [methodName, methodDef] of Object.entries(definition)) {
          const method = methodDef as Record<string, unknown>

          if (method.requestType && method.responseType) {
            const reqType = method.requestType as Record<string, unknown>
            const resType = method.responseType as Record<string, unknown>

            // 요청 필드 추출
            const requestFields = extractFields(reqType)
            const responseFields = extractFields(resType)

            methods.push({
              name: methodName,
              requestType: (reqType.name as string) || 'Unknown',
              responseType: (resType.name as string) || 'Unknown',
              requestFields: requestFields.length > 0 ? requestFields : undefined,
              responseFields: responseFields.length > 0 ? responseFields : undefined,
            })
          }
        }

        if (methods.length > 0) {
          const serviceName = fullName.split('.').pop() || fullName
          services.push({
            name: serviceName,
            methods,
          })
        }
      }
    }

    return {
      package: packageName,
      services,
    }
  }
  catch (error) {
    logger.error('Failed to parse Proto spec:', protoPath, error)
    return undefined
  }
}

/**
 * 메시지 타입에서 필드 추출
 */
function extractFields(messageType: Record<string, unknown>): RpcFieldSchema[] {
  const fields: RpcFieldSchema[] = []
  const typeObj = messageType.type as Record<string, unknown> | undefined

  if (typeObj && typeObj.field && Array.isArray(typeObj.field)) {
    for (const field of typeObj.field) {
      const f = field as Record<string, unknown>
      fields.push({
        name: f.name as string,
        type: getProtoTypeName(f.type as number, f.typeName as string | undefined),
        repeated: f.label === 3, // LABEL_REPEATED = 3
        optional: f.label === 1, // LABEL_OPTIONAL = 1
      })
    }
  }

  return fields
}

/**
 * 스키마 핸들러
 * GET /mock/__schema
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const mockConfig = config.mock as {
    openapiPath?: string
    protoPath?: string
    clientPackageConfig?: OpenApiClientConfig
    clientPackagePath?: string
  }

  // 캐시 확인
  const schemaCache = cacheManager.schemaCache
  if (schemaCache.schema) {
    return schemaCache.schema
  }

  const schema: ApiSchema = {}

  // OpenAPI 스펙 파싱 - client package 또는 spec 파일
  if (mockConfig.clientPackageConfig?.package) {
    // Client package 방식 (openapi.package 설정)
    const openapi = parseClientPackageSchema(mockConfig.clientPackageConfig)
    if (openapi) {
      schema.openapi = openapi
    }
  }
  else if (mockConfig.clientPackagePath) {
    // Client package 방식 - clientPackagePath만 있는 경우 (fallback)
    const clientPkg = getClientPackage(mockConfig.clientPackagePath)

    // API 클래스별로 그룹화
    const apiGroups = new Map<string, string[]>()
    for (const endpoint of clientPkg.endpoints) {
      const apiName = endpoint.apiClassName || 'default'
      if (!apiGroups.has(apiName)) {
        apiGroups.set(apiName, [])
      }
    }

    // ParsedEndpoint를 OpenApiPathItem으로 변환
    const pathItems = clientPkg.endpoints.map(convertEndpointToPathItem)

    schema.openapi = {
      info: {
        title: clientPkg.info.title || clientPkg.info.name || 'Unknown API',
        version: clientPkg.info.version || '1.0.0',
        description: `Generated from client package`,
      },
      paths: pathItems,
      _meta: {
        source: 'client-package',
        apiClasses: Array.from(apiGroups.keys()),
        modelCount: clientPkg.models.size,
        endpointCount: clientPkg.endpoints.length,
      },
    }
  }
  else if (mockConfig.openapiPath) {
    // YAML/JSON spec 파일 방식 (Swagger 2.0 / OpenAPI 3.x 지원)
    const openapi = await parseOpenApiSpec(mockConfig.openapiPath)
    if (openapi) {
      schema.openapi = openapi
    }
  }

  // Proto 스펙 파싱
  if (mockConfig.protoPath) {
    const rpc = await parseProtoSpec(mockConfig.protoPath)
    if (rpc) {
      schema.rpc = rpc
    }
  }

  // 스펙이 없으면 에러
  if (!schema.openapi && !schema.rpc) {
    throw createError({
      statusCode: 404,
      message: 'No API schema available',
    })
  }

  // 캐시 저장
  schemaCache.schema = schema

  return schema
})
