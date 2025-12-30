import { defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { readFileSync, existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import yaml from 'js-yaml'
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
} from '../../../types'
import { getClientPackage } from '../utils/client-parser'

// ESM 환경에서 require.resolve 사용을 위한 helper
const _require = createRequire(import.meta.url)

/**
 * Client package 설정에서 OpenAPI 스키마 메타데이터 추출
 */
function parseClientPackageSchema(config: OpenApiClientConfig): OpenApiSchema | undefined {
  try {
    // 패키지 경로 resolve (ESM 환경에서도 동작하도록 createRequire 사용)
    const packagePath = _require.resolve(`${config.package}/package.json`)
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
    const pathItems: OpenApiPathItem[] = clientPackage.endpoints.map((endpoint) => {
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
    })

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
    // eslint-disable-next-line no-console
    console.error('[mock-fried] Failed to parse client package:', error)
    return undefined
  }
}

// 캐시
let cachedSchema: ApiSchema | null = null

/**
 * 스키마 캐시 초기화
 */
export function clearSchemaCache(): void {
  cachedSchema = null
}

/**
 * OpenAPI 스펙에서 스키마 메타데이터 추출
 */
function parseOpenApiSpec(specPath: string): OpenApiSchema | undefined {
  if (!existsSync(specPath)) {
    return undefined
  }

  try {
    const content = readFileSync(specPath, 'utf-8')
    let spec: Record<string, unknown>

    if (specPath.endsWith('.yaml') || specPath.endsWith('.yml')) {
      spec = yaml.load(content) as Record<string, unknown>
    }
    else {
      spec = JSON.parse(content)
    }

    const info = spec.info as Record<string, unknown> || {}
    const paths = spec.paths as Record<string, Record<string, unknown>> || {}

    const pathItems: OpenApiPathItem[] = []

    for (const [path, methods] of Object.entries(paths)) {
      for (const [method, operation] of Object.entries(methods)) {
        if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
          const op = operation as Record<string, unknown>

          // 파라미터 추출
          const parameters: OpenApiParameter[] = []
          if (Array.isArray(op.parameters)) {
            for (const param of op.parameters) {
              const p = param as Record<string, unknown>
              parameters.push({
                name: p.name as string,
                in: p.in as 'path' | 'query' | 'header' | 'cookie',
                required: p.required as boolean | undefined,
                description: p.description as string | undefined,
                schema: p.schema as OpenApiParameter['schema'],
              })
            }
          }

          pathItems.push({
            path,
            method: method.toUpperCase(),
            operationId: op.operationId as string | undefined,
            summary: op.summary as string | undefined,
            description: op.description as string | undefined,
            tags: op.tags as string[] | undefined,
            parameters: parameters.length > 0 ? parameters : undefined,
            requestBody: op.requestBody as OpenApiPathItem['requestBody'],
            responses: op.responses as OpenApiPathItem['responses'],
          })
        }
      }
    }

    return {
      info: {
        title: (info.title as string) || 'Unknown API',
        version: (info.version as string) || '1.0.0',
        description: info.description as string | undefined,
      },
      paths: pathItems,
    }
  }
  catch (error) {
    // eslint-disable-next-line no-console
    console.error('[mock-fried] Failed to parse OpenAPI spec:', specPath, error)
    return undefined
  }
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

    const packageDefinition = await protoLoader.load(protoPath, {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
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
    // eslint-disable-next-line no-console
    console.error('[mock-fried] Failed to parse Proto spec:', protoPath, error)
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
 * Proto 타입 번호를 문자열로 변환
 */
function getProtoTypeName(typeNum: number, typeName?: string): string {
  const typeMap: Record<number, string> = {
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
    11: 'message',
    12: 'bytes',
    13: 'uint32',
    14: 'enum',
    15: 'sfixed32',
    16: 'sfixed64',
    17: 'sint32',
    18: 'sint64',
  }

  if (typeName) {
    return typeName.split('.').pop() || typeName
  }

  return typeMap[typeNum] || 'unknown'
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
  if (cachedSchema) {
    return cachedSchema
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
    const pathItems: OpenApiPathItem[] = clientPkg.endpoints.map((endpoint) => {
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
    })

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
    // YAML/JSON spec 파일 방식
    const openapi = parseOpenApiSpec(mockConfig.openapiPath)
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
  cachedSchema = schema

  return schema
})
