/**
 * OpenAPI/Swagger Spec Loader
 *
 * @apidevtools/swagger-parser를 사용하여 스펙 파일을 로드, 검증, dereference 처리
 * swagger2openapi를 사용하여 Swagger 2.0을 OpenAPI 3.0으로 변환
 * Swagger 2.0과 OpenAPI 3.x 모두 지원
 *
 * NOTE: SwaggerParser는 동적 import로 로드하여 Proto-only 환경에서
 * 불필요한 의존성 번들링을 방지합니다.
 */
import type { OpenAPIV2, OpenAPIV3 } from 'openapi-types'

export type ParsedSpec = OpenAPIV2.Document | OpenAPIV3.Document

export type SpecVersion = 'swagger2' | 'openapi3'

export interface SpecLoaderResult {
  /** 원본 스펙 (검증됨) */
  spec: ParsedSpec
  /** 스펙 버전 */
  version: SpecVersion
  /** $ref가 해석된 스펙 */
  dereferenced: ParsedSpec
  /** OpenAPI 3.x로 변환된 스펙 (openapi-backend용) */
  openapi3Spec: OpenAPIV3.Document
}

/**
 * OpenAPI/Swagger 스펙 파일 로드 및 파싱
 *
 * - $ref 해석 (dereference)
 * - 버전 자동 감지
 * - Swagger 2.0 → OpenAPI 3.0 변환
 * - 검증
 *
 * @param specPath 스펙 파일 경로 (YAML/JSON)
 */
export async function loadSpec(specPath: string): Promise<SpecLoaderResult> {
  // 동적 import로 swagger-parser 로드 (번들링 최적화)
  const SwaggerParser = (await import('@apidevtools/swagger-parser')).default

  // 1. 파싱만 (검증 없이, 원본 보존)
  const spec = await SwaggerParser.parse(specPath) as ParsedSpec

  // 2. 버전 감지
  const version = isSwagger2(spec) ? 'swagger2' : 'openapi3'

  // 3. OpenAPI 3.0 변환 (Swagger 2.0인 경우)
  // swagger2openapi는 파일 경로에서 직접 로드하여 변환
  let openapi3Spec: OpenAPIV3.Document
  if (version === 'swagger2') {
    const { convertFile } = await import('swagger2openapi')
    const result = await convertFile(specPath, {
      patch: true, // 자동 패치 적용
      warnOnly: true, // 경고만 하고 계속 진행
    })
    openapi3Spec = result.openapi as OpenAPIV3.Document
  }
  else {
    openapi3Spec = spec as OpenAPIV3.Document
  }

  // 4. $ref 해석 (dereference) - 별도로 로드하여 처리
  const dereferenced = await SwaggerParser.dereference(specPath) as ParsedSpec

  return { spec, version, dereferenced, openapi3Spec }
}

/**
 * Swagger 2.0 여부 확인
 */
export function isSwagger2(spec: ParsedSpec): spec is OpenAPIV2.Document {
  return 'swagger' in spec && spec.swagger === '2.0'
}

/**
 * OpenAPI 3.x 여부 확인
 */
export function isOpenApi3(spec: ParsedSpec): spec is OpenAPIV3.Document {
  return 'openapi' in spec && (spec.openapi?.startsWith('3.') ?? false)
}

/**
 * 스키마 정의 위치 가져오기 (버전별)
 *
 * - Swagger 2.0: definitions
 * - OpenAPI 3.x: components/schemas
 */
export function getSchemaDefinitions(spec: ParsedSpec): Record<string, unknown> {
  if (isSwagger2(spec)) {
    return (spec.definitions ?? {}) as Record<string, unknown>
  }
  return (spec.components?.schemas ?? {}) as Record<string, unknown>
}

/**
 * 응답 스키마 추출 (버전별)
 *
 * 200 → 201 → 204 → default 순서로 찾음
 *
 * @param responses 응답 정의 객체
 * @param spec 스펙 (버전 감지용)
 */
export function getResponseSchema(
  responses: OpenAPIV2.ResponsesObject | OpenAPIV3.ResponsesObject | undefined,
  spec: ParsedSpec,
): unknown | undefined {
  if (!responses) return undefined

  // 200, 201, 204, default 순으로 찾기
  const successCodes = ['200', '201', '204', 'default']

  for (const code of successCodes) {
    const response = responses[code]
    if (!response) continue

    // $ref 응답 처리 (dereference 후에도 일부 남을 수 있음)
    if ('$ref' in response) continue

    if (isSwagger2(spec)) {
      // Swagger 2.0: response.schema
      const swagger2Response = response as OpenAPIV2.ResponseObject
      if (swagger2Response.schema) {
        return swagger2Response.schema
      }
    }
    else {
      // OpenAPI 3.x: response.content['application/json'].schema
      const oas3Response = response as OpenAPIV3.ResponseObject
      const content = oas3Response.content
      if (content?.['application/json']?.schema) {
        return content['application/json'].schema
      }
      // application/json 외 다른 content-type도 시도
      if (content) {
        const firstContentType = Object.keys(content)[0]
        if (firstContentType && content[firstContentType]?.schema) {
          return content[firstContentType].schema
        }
      }
    }
  }

  return undefined
}

/**
 * 파라미터 스키마 추출 (버전별)
 *
 * - Swagger 2.0: type 직접 또는 schema
 * - OpenAPI 3.x: schema
 */
export function getParameterSchema(
  param: OpenAPIV2.ParameterObject | OpenAPIV3.ParameterObject,
  spec: ParsedSpec,
): unknown {
  if (isSwagger2(spec)) {
    const swagger2Param = param as OpenAPIV2.ParameterObject
    // Swagger 2.0: body 파라미터는 schema, 나머지는 type 직접
    if ('schema' in swagger2Param && swagger2Param.schema) {
      return swagger2Param.schema
    }
    // type, format 등 직접 있는 경우
    return {
      type: swagger2Param.type,
      format: swagger2Param.format,
      enum: swagger2Param.enum,
      minimum: swagger2Param.minimum,
      maximum: swagger2Param.maximum,
      default: swagger2Param.default,
    }
  }

  // OpenAPI 3.x: schema
  const oas3Param = param as OpenAPIV3.ParameterObject
  return oas3Param.schema
}

/**
 * path-level + operation-level 파라미터 병합
 *
 * operation-level이 path-level을 override (같은 name + in 조합)
 */
export function mergeParameters(
  pathParams: (OpenAPIV2.ParameterObject | OpenAPIV3.ParameterObject)[] | undefined,
  operationParams: (OpenAPIV2.ParameterObject | OpenAPIV3.ParameterObject)[] | undefined,
): (OpenAPIV2.ParameterObject | OpenAPIV3.ParameterObject)[] {
  const merged = new Map<string, OpenAPIV2.ParameterObject | OpenAPIV3.ParameterObject>()

  // path-level 먼저
  for (const param of pathParams ?? []) {
    const key = `${param.name}:${param.in}`
    merged.set(key, param)
  }

  // operation-level로 override
  for (const param of operationParams ?? []) {
    const key = `${param.name}:${param.in}`
    merged.set(key, param)
  }

  return Array.from(merged.values())
}

/**
 * Swagger 2.0의 body 파라미터를 requestBody처럼 추출
 */
export function getRequestBodySchema(
  params: (OpenAPIV2.ParameterObject | OpenAPIV3.ParameterObject)[] | undefined,
  spec: ParsedSpec,
): unknown | undefined {
  if (!params) return undefined

  if (isSwagger2(spec)) {
    // Swagger 2.0: in: body 파라미터 찾기
    const bodyParam = params.find(
      p => (p as OpenAPIV2.ParameterObject).in === 'body',
    ) as OpenAPIV2.InBodyParameterObject | undefined
    return bodyParam?.schema
  }

  // OpenAPI 3.x는 requestBody 사용 (별도 처리)
  return undefined
}
