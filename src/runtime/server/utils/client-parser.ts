/**
 * OpenAPI 생성 클라이언트 패키지 파서
 * TypeScript/JavaScript로 생성된 API 클라이언트에서 엔드포인트 및 모델 정보를 추출
 * - .ts 파일 (소스) 및 .js 파일 (컴파일된) 모두 지원
 * - src/ 디렉토리 없을 경우 dist/ 자동 fallback
 */
/* eslint-disable regexp/no-super-linear-backtracking, regexp/optimal-quantifier-concatenation */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, join } from 'pathe'
import type {
  ParsedEndpoint,
  ParsedParameter,
  ParsedModelSchema,
  ParsedModelField,
  ParsedClientPackage,
  OpenApiClientConfig,
} from '../../../types'

/**
 * API 파일에서 엔드포인트 정보 추출
 * .ts 및 .js 파일 모두 지원
 */
function parseApiFile(filePath: string, fileName: string): ParsedEndpoint[] {
  const content = readFileSync(filePath, 'utf-8')
  const endpoints: ParsedEndpoint[] = []
  const isJsFile = fileName.endsWith('.js')

  // API 클래스명 추출 - TS: export class, JS: class (exports는 별도)
  const classMatch = content.match(/(?:export\s+)?class\s+(\w+Api)/)
  const apiClassName = classMatch?.[1] || fileName.replace(/\.(ts|js)$/, '')

  // Raw 메서드 패턴 매칭 (openapi-generator 출력 형식)
  // TS: async methodRaw(): Promise<runtime.ApiResponse<Type>>
  // JS: methodRaw() { return __awaiter(...) } - 타입 정보 없음
  // 멀티라인 JSDoc 지원: /** ... */ 전체를 캡처한 후 마지막 줄에서 summary 추출
  // 중첩된 제네릭 타입 지원: Array<Type> 형태를 올바르게 캡처
  const rawMethodRegexTS = /\/\*\*([\s\S]*?)\*\/\s*\n\s*async\s+(\w+)Raw\([^)]*\):\s*Promise<runtime\.ApiResponse<((?:[^<>]|<[^>]*>)+)>>/g
  const rawMethodRegexJS = /\/\*\*([\s\S]*?)\*\/\s*\n\s*(\w+)Raw\s*\([^)]*\)\s*\{/g

  // 각 Raw 메서드의 본문에서 path, method 추출
  // openapi-generator 형식 1: return new runtime.JSONApiResponse(...)
  // openapi-generator 형식 2: return new runtime.VoidApiResponse(...)
  // TS: async methodRaw(...) { ... }
  // JS: methodRaw(...) { return __awaiter(...) }
  const methodBodyRegexTS = /async\s+(\w+)Raw\([^)]*\)[^{]*\{([\s\S]*?)return new runtime\./g
  const methodBodyRegexJS = /(\w+)Raw\s*\([^)]*\)\s*\{([\s\S]*?)return new runtime\./g

  let match
  const methodBodies = new Map<string, string>()
  const methodBodyRegex = isJsFile ? methodBodyRegexJS : methodBodyRegexTS

  // 먼저 메서드 본문들을 수집
  while ((match = methodBodyRegex.exec(content)) !== null) {
    const methodName = match[1]
    const body = match[2]
    if (methodName && body) {
      methodBodies.set(methodName, body)
    }
  }

  // JSDoc과 메서드 시그니처 매칭
  // TS: JSDoc + async + 타입 정보 모두 캡처
  // JS: JSDoc + 메서드명만 캡처 (타입 정보 없음)
  const rawMethodRegex = isJsFile ? rawMethodRegexJS : rawMethodRegexTS
  rawMethodRegex.lastIndex = 0
  while ((match = rawMethodRegex.exec(content)) !== null) {
    const jsdocContent = match[1]
    const operationId = match[2]
    // JS 파일은 타입 정보가 없으므로 'unknown' 사용
    // TS 파일에서도 매치 실패 시 'unknown' 사용
    const responseType = isJsFile ? 'unknown' : (match[3] || 'unknown')

    if (!jsdocContent || !operationId) continue

    // JSDoc에서 summary 추출 (마지막 * 라인 또는 첫 번째 의미있는 라인)
    const jsdocLines = jsdocContent.split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .filter(line => line.length > 0 && !line.startsWith('@'))

    // 마지막 라인을 summary로 사용 (보통 짧은 설명이 마지막에 있음)
    const summary = jsdocLines[jsdocLines.length - 1] || jsdocLines[0] || operationId

    const body = methodBodies.get(operationId)
    if (!body) continue

    // path 추출 - 두 가지 형식 지원
    // 형식 1 (구버전): let urlPath = `/users`
    // 형식 2 (신버전): this.request({ path: `/users`, ... })
    let path: string | undefined

    // 형식 1: let urlPath = `...`
    const urlPathMatch = body.match(/let\s+urlPath\s*=\s*`([^`]+)`/)
    if (urlPathMatch?.[1]) {
      path = urlPathMatch[1]
      // ${...} 형태를 {param} 형태로 변환 또는 제거
      path = path.replace(/\$\{[^}]+\}/g, (match) => {
        const paramName = match.match(/requestParameters(?:\.(\w+)|\["?(\w+)"?\])/)?.[1]
          || match.match(/requestParameters(?:\.(\w+)|\["?(\w+)"?\])/)?.[2]
        if (paramName) {
          return `{${paramName}}`
        }
        return ''
      })
    }

    // 형식 2: this.request({ path: `...` }) - 신버전 openapi-generator
    // path: `/before-after/posts` 또는 path: `/before-after/posts/{postId}`.replace(...)
    if (!path) {
      const requestPathMatch = body.match(/path:\s*`([^`]+)`/)
      if (requestPathMatch?.[1]) {
        path = requestPathMatch[1]
        // {${"postId"}} 형태를 {postId}로 변환
        path = path.replace(/\{\$\{["']?(\w+)["']?\}\}/g, '{$1}')
      }
    }

    if (!path) continue

    // method 추출
    // 형식 1: method: 'GET'
    // 형식 2: init: { method: 'GET', ... }
    const methodMatch = body.match(/method:\s*'(\w+)'/)
    const method = methodMatch?.[1] || 'GET'

    // Path 파라미터 추출 (path에서 {param} 형태)
    const pathParams: ParsedParameter[] = []
    const pathParamMatches = path.matchAll(/\{(\w+)\}/g)
    for (const pm of pathParamMatches) {
      const paramName = pm[1]
      if (paramName) {
        pathParams.push({
          name: paramName,
          type: 'string',
          required: true,
        })
      }
    }

    // Query 파라미터 추출
    // 형식 1: if (requestParameters['param'] !== undefined) { queryParameters['param'] = ...
    // 형식 2: if (requestParameters.param !== undefined) { queryParameters['param'] = ...
    const queryParams: ParsedParameter[] = []
    const queryParamRegex = /if\s*\(requestParameters(?:\.(\w+)|\[['"](\w+)['"]\])\s*!==?\s*(?:undefined|null)\)\s*\{\s*queryParameters\[['"](\w+)['"]\]/g
    let qpm
    while ((qpm = queryParamRegex.exec(body)) !== null) {
      // 캡처 그룹: [1] = dot notation, [2] = bracket notation, [3] = queryParameters key
      const paramName = qpm[3] || qpm[1] || qpm[2]
      if (paramName) {
        queryParams.push({
          name: paramName,
          type: 'string',
          required: false,
        })
      }
    }

    // Request Body 타입 추출
    let requestBodyType: string | undefined
    const bodyMatch = body.match(/body:\s*(\w+)ToJSON\(requestParameters\.(\w+)\)/)
    if (bodyMatch?.[1]) {
      requestBodyType = bodyMatch[1]
    }

    endpoints.push({
      path,
      method: method.toUpperCase(),
      operationId,
      summary,
      apiClassName,
      pathParams,
      queryParams,
      requestBodyType,
      responseType,
    })
  }

  return endpoints
}

/**
 * 타입 문자열 정규화 및 분석
 */
function analyzeType(rawType: string): {
  type: string
  isArray: boolean
  refType?: string
} {
  const primitives = ['string', 'number', 'boolean', 'Date', 'object', 'any', 'unknown', 'void', 'null', 'undefined']

  // 배열 여부 확인
  const isArray = rawType.startsWith('Array<') || rawType.endsWith('[]')
  let type = rawType

  if (isArray) {
    // Array<Type> 또는 Type[] 에서 Type 추출
    const arrayTypeMatch = rawType.match(/Array<(.+)>/) || rawType.match(/(.+)\[\]/)
    if (arrayTypeMatch?.[1]) {
      type = arrayTypeMatch[1].trim()
    }
  }

  // 참조 타입 확인 (primitive가 아닌 경우)
  let refType: string | undefined
  if (!primitives.includes(type) && !type.includes('|') && !type.includes('&')) {
    refType = type
  }

  return { type, isArray, refType }
}

/**
 * 모델 파일에서 스키마 정보 추출
 * 3가지 전략 사용: 1) ToJSON 함수 파싱 2) FromJSONTyped 파싱 3) Interface 직접 파싱
 * .ts 및 .js 파일 모두 지원
 */
function parseModelFile(filePath: string, fileName: string): ParsedModelSchema | undefined {
  const content = readFileSync(filePath, 'utf-8')
  const modelName = fileName.replace(/\.(ts|js)$/, '')

  // Interface가 있는지 먼저 확인 (interface가 있으면 enum-only가 아님)
  const hasInterface = content.includes(`export interface ${modelName}`)

  // Enum 체크 (as const 패턴) - 파일이 enum만 있는 경우에만 적용
  // 예: OtpType.ts는 enum만 있지만, DailyAndConcernPostSummaryResponse.ts는 interface + 내부 enum이 있음
  if (!hasInterface) {
    // enum 이름이 modelName과 일치하는지 확인
    const enumRegex = new RegExp(`export\\s+const\\s+(${modelName})\\s*=\\s*\\{([^}]+)\\}\\s*as\\s*const`)
    const enumMatch = content.match(enumRegex)
    if (enumMatch?.[2]) {
      const enumValues: string[] = []
      const valueMatches = enumMatch[2].matchAll(/(\w+):\s*['"]([^'"]+)['"]/g)
      for (const vm of valueMatches) {
        if (vm[2]) {
          enumValues.push(vm[2])
        }
      }
      if (enumValues.length > 0) {
        return {
          name: modelName,
          fields: [],
          enumValues,
        }
      }
    }
  }

  const fields: ParsedModelField[] = []

  // JSON 키 매핑 저장 (propertyName -> jsonKey)
  const jsonKeyMap = new Map<string, string>()

  // 전략 1: ToJSON 함수에서 필드 추출 및 JSON 키 매핑 파악
  // return { 'json_key': value.propertyName, ... }
  const toJsonMatch = content.match(/export\s+function\s+\w+ToJSON[^{]*\{[\s\S]*?return\s*\{([\s\S]*?)\};?\s*\}/)
  if (toJsonMatch?.[1]) {
    const returnBody = toJsonMatch[1]
    // 'json_key': value.propertyName 패턴 - JSON 키와 프로퍼티명 둘 다 캡처
    const fieldMatches = returnBody.matchAll(/['"](\w+)['"]\s*:\s*(?:value\.(\w+)|[^,\n]*?value\.(\w+))/g)

    for (const fm of fieldMatches) {
      const jsonKey = fm[1]
      if (!jsonKey) continue
      const propertyName = fm[2] || fm[3]
      if (!propertyName) continue

      // JSON 키 매핑 저장
      jsonKeyMap.set(propertyName, jsonKey)

      // 이미 추가된 필드는 건너뛰기
      if (fields.some(f => f.name === propertyName)) continue

      fields.push({
        name: propertyName,
        jsonKey: jsonKey !== propertyName ? jsonKey : undefined,
        type: 'unknown', // ToJSON에서는 타입을 알 수 없음, 나중에 interface에서 보완
        required: false,
        isArray: false,
      })
    }
  }

  // 전략 2: FromJSONTyped 함수에서 타입 힌트 추출
  // 'fieldName': !exists(json, 'fieldName') ? undefined : (new Date(json['fieldName'])),
  const fromJsonMatch = content.match(/export\s+function\s+\w+FromJSONTyped[^{]*\{[\s\S]*?return\s*\{([\s\S]*?)\};?\s*\}/)
  if (fromJsonMatch?.[1]) {
    const returnBody = fromJsonMatch[1]

    // Date 타입 감지: (new Date(json['fieldName']))
    const dateFields = new Set<string>()
    const dateMatches = returnBody.matchAll(/['"](\w+)['"]\s*:.*?new\s+Date\(/g)
    for (const dm of dateMatches) {
      if (dm[1]) dateFields.add(dm[1])
    }

    // 배열 타입 감지: (json['fieldName'] as Array<any>).map(...)
    const arrayFields = new Set<string>()
    const arrayMatches = returnBody.matchAll(/['"](\w+)['"]\s*:.*?\(json\[['"](\w+)['"]\]\s*as\s*Array/g)
    for (const am of arrayMatches) {
      if (am[1]) arrayFields.add(am[1])
    }

    // 참조 타입 감지: SomeTypeFromJSON(json['fieldName'])
    const refTypeMap = new Map<string, string>()
    const refMatches = returnBody.matchAll(/['"](\w+)['"]\s*:.*?(\w+)FromJSON\(json\[/g)
    for (const rm of refMatches) {
      if (rm[1] && rm[2] && !rm[2].includes('Array')) {
        refTypeMap.set(rm[1], rm[2])
      }
    }

    // 배열 참조 타입 감지: .map(SomeTypeFromJSON)
    const arrayRefMatches = returnBody.matchAll(/['"](\w+)['"]\s*:.*?\.map\((\w+)FromJSON\)/g)
    for (const arm of arrayRefMatches) {
      if (arm[1] && arm[2]) {
        refTypeMap.set(arm[1], arm[2])
        arrayFields.add(arm[1])
      }
    }

    // 기존 필드 정보 업데이트
    for (const field of fields) {
      if (dateFields.has(field.name)) {
        field.type = 'Date'
      }
      if (arrayFields.has(field.name)) {
        field.isArray = true
      }
      const refType = refTypeMap.get(field.name)
      if (refType) {
        field.refType = refType
        field.type = refType
      }
    }
  }

  // 전략 3: Interface 직접 파싱으로 타입 정보 보완
  const interfaceMatch = content.match(/export\s+interface\s+(\w+)(?:\s+extends\s+[\w,\s]+)?\s*\{([\s\S]*?)\n\}/)
  if (interfaceMatch?.[2]) {
    const interfaceBody = interfaceMatch[2]

    // 간단한 필드 파싱: fieldName?: Type;
    const simpleFieldRegex = /^\s+(\w+)(\?)?:\s*([^;]+);/gm
    let sfm
    while ((sfm = simpleFieldRegex.exec(interfaceBody)) !== null) {
      const name = sfm[1]
      const rawTypeStr = sfm[3]
      if (!name || !rawTypeStr) continue

      const optional = sfm[2] === '?'
      const rawType = rawTypeStr.trim()

      const { type, isArray, refType } = analyzeType(rawType)

      // 기존 필드 업데이트 또는 새로 추가
      const existingField = fields.find(f => f.name === name)
      if (existingField) {
        // ToJSON/FromJSON에서 이미 파싱된 필드 정보 보완
        if (existingField.type === 'unknown') {
          existingField.type = type
        }
        existingField.required = !optional
        if (!existingField.isArray) {
          existingField.isArray = isArray
        }
        if (!existingField.refType && refType) {
          existingField.refType = refType
        }
      }
      else {
        // 새 필드 추가 - jsonKeyMap에서 JSON 키 가져오기
        const jsonKey = jsonKeyMap.get(name)
        fields.push({
          name,
          jsonKey: jsonKey && jsonKey !== name ? jsonKey : undefined,
          type,
          required: !optional,
          isArray,
          refType,
        })
      }
    }
  }

  // 필드가 없으면 undefined 반환
  if (fields.length === 0) {
    return undefined
  }

  return {
    name: modelName,
    fields,
  }
}

/**
 * 디렉토리 경로 해결 (src/ → dist/ fallback 지원)
 */
function resolveDir(packageRoot: string, configDir: string): string {
  const primaryPath = resolve(packageRoot, configDir)
  if (existsSync(primaryPath)) {
    return primaryPath
  }

  // src/ 경로가 없으면 dist/로 fallback
  if (configDir.startsWith('src/')) {
    const distDir = configDir.replace(/^src\//, 'dist/')
    const distPath = resolve(packageRoot, distDir)
    if (existsSync(distPath)) {
      return distPath
    }
  }

  // dist/ 경로가 없으면 src/로 fallback (역방향)
  if (configDir.startsWith('dist/')) {
    const srcDir = configDir.replace(/^dist\//, 'src/')
    const srcPath = resolve(packageRoot, srcDir)
    if (existsSync(srcPath)) {
      return srcPath
    }
  }

  // 기본 경로 반환 (존재하지 않더라도)
  return primaryPath
}

/**
 * API/Model 파일 필터 (.ts, .js 지원, index 및 .d.ts 제외)
 */
function filterApiFiles(files: string[]): string[] {
  return files.filter(f =>
    (f.endsWith('Api.ts') || f.endsWith('Api.js'))
    && !f.includes('index')
    && !f.endsWith('.d.ts'),
  )
}

function filterModelFiles(files: string[]): string[] {
  return files.filter(f =>
    (f.endsWith('.ts') || f.endsWith('.js'))
    && !f.includes('index')
    && !f.endsWith('.d.ts'),
  )
}

/**
 * 클라이언트 패키지 전체 파싱
 * - .ts 파일 (소스) 및 .js 파일 (컴파일된) 모두 지원
 * - src/ 디렉토리 없을 경우 dist/ 자동 fallback
 */
export function parseClientPackage(
  packageRoot: string,
  config?: Partial<OpenApiClientConfig>,
): ParsedClientPackage {
  const apisDir = config?.apisDir || 'src/apis'
  const modelsDir = config?.modelsDir || 'src/models'

  // src/ → dist/ fallback 지원
  const apisPath = resolveDir(packageRoot, apisDir)
  const modelsPath = resolveDir(packageRoot, modelsDir)

  // 패키지 정보 읽기
  const pkgJsonPath = join(packageRoot, 'package.json')
  let pkgInfo = { name: 'unknown', title: undefined as string | undefined, version: undefined as string | undefined }
  if (existsSync(pkgJsonPath)) {
    try {
      const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
      pkgInfo = {
        name: pkgJson.name || 'unknown',
        title: pkgJson.description,
        version: pkgJson.version,
      }
    }
    catch {
      // ignore
    }
  }

  // API 파일들 파싱 (.ts 및 .js 모두 지원)
  const endpoints: ParsedEndpoint[] = []
  if (existsSync(apisPath)) {
    const apiFiles = filterApiFiles(readdirSync(apisPath))
    for (const file of apiFiles) {
      const filePath = join(apisPath, file)
      const parsed = parseApiFile(filePath, file)
      endpoints.push(...parsed)
    }
  }

  // Model 파일들 파싱 (.ts 및 .js 모두 지원)
  const models = new Map<string, ParsedModelSchema>()
  if (existsSync(modelsPath)) {
    const modelFiles = filterModelFiles(readdirSync(modelsPath))
    for (const file of modelFiles) {
      const filePath = join(modelsPath, file)
      const parsed = parseModelFile(filePath, file)
      if (parsed) {
        models.set(parsed.name, parsed)
      }
    }
  }

  return {
    info: pkgInfo,
    endpoints,
    models,
  }
}

/**
 * 캐시된 파싱 결과
 */
let cachedPackage: ParsedClientPackage | null = null
let cachedPackagePath: string | null = null

/**
 * 클라이언트 패키지 파싱 (캐시 지원)
 */
export function getClientPackage(
  packageRoot: string,
  config?: Partial<OpenApiClientConfig>,
): ParsedClientPackage {
  if (cachedPackage && cachedPackagePath === packageRoot) {
    return cachedPackage
  }

  cachedPackage = parseClientPackage(packageRoot, config)
  cachedPackagePath = packageRoot

  return cachedPackage
}

/**
 * 캐시 초기화
 */
export function clearClientPackageCache(): void {
  cachedPackage = null
  cachedPackagePath = null
}
