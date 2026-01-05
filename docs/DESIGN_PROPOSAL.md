# Mock-Fried 확장 설계안

## 개요

이 문서는 Mock-Fried 모듈의 다음 기능 확장에 대한 설계안을 정의합니다:

1. **응답 커스터마이징** - 선언형 overrides + interceptor
2. **다중 스펙 지원** - apis 기반 멀티 인스턴스
3. **핸들러 우선순위** - override > interceptor > default mock
4. **클라이언트 주입** - $api, $apis, useApi()

---

## 1. 타입 정의

### 1.1 확장된 모듈 옵션

```typescript
// src/types.ts

/**
 * Mock 응답 Override 정의
 */
export interface MockResponseOverride {
  /** HTTP 상태 코드 */
  status?: number
  /** 응답 본문 (정적 데이터) */
  body?: unknown
  /** 응답 지연 (ms) */
  delayMs?: number
  /** 에러 확률 (0-1, 0.3 = 30% 확률로 에러) */
  errorRate?: number
  /** 에러 시 상태 코드 */
  errorStatus?: number
  /** 에러 시 응답 본문 */
  errorBody?: unknown
  /** 헤더 추가/덮어쓰기 */
  headers?: Record<string, string>
}

/**
 * Mock Interceptor 컨텍스트
 */
export interface MockInterceptorContext {
  /** 요청 경로 */
  path: string
  /** HTTP 메서드 */
  method: string
  /** Path 파라미터 */
  pathParams: Record<string, string>
  /** Query 파라미터 */
  query: Record<string, string | number>
  /** Request Body */
  body: unknown
  /** Request Headers */
  headers: Record<string, string>
}

/**
 * Mock Interceptor 함수 타입
 */
export type MockInterceptor = (
  ctx: MockInterceptorContext,
  defaultResponse: unknown,
) => unknown | Promise<unknown>

/**
 * 필드 기본값 설정
 */
export interface MockFieldDefaults {
  /** 필드명 -> 고정값 매핑 */
  [fieldName: string]: unknown
}

/**
 * Mock 데이터 생성 설정
 */
export interface MockDataGenerationConfig {
  /**
   * Optional 필드에 값이 생성될 확률 (0-1)
   * 0 = 항상 undefined, 1 = 항상 값 생성
   * @default 0.7 (70%)
   */
  nullableRate?: number

  /**
   * 배열 필드의 최소 아이템 수
   * @default 1
   */
  arrayMinLength?: number

  /**
   * 배열 필드의 최대 아이템 수
   * @default 5
   */
  arrayMaxLength?: number

  /**
   * 중첩 객체 배열의 최대 아이템 수
   * @default 3
   */
  nestedArrayMaxLength?: number

  /**
   * 문자열 필드 최대 길이 (description, content 등)
   * @default 100
   */
  stringMaxLength?: number

  /**
   * 숫자 범위 설정
   */
  numberRange?: {
    min?: number // default: 0
    max?: number // default: 1000
  }

  /**
   * 날짜 범위 설정 (현재 기준 일 수)
   */
  dateRange?: {
    pastDays?: number   // default: 365
    futureDays?: number // default: 30
  }

  /**
   * ID 필드 생성 설정
   */
  id?: MockIdConfig
}

/**
 * ID 생성 포맷
 */
export type MockIdFormat =
  | 'sequential'  // 'id-1', 'id-2', ... (prefix + index)
  | 'uuid'        // 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  | 'ulid'        // '01ARZ3NDEKTSV4RRFFQ69G5FAV'
  | 'nanoid'      // 'V1StGXR8_Z5jdHi6B-myT' (21자)
  | 'numeric'     // 1, 2, 3, ...
  | 'hash'        // seed 기반 해시 문자열

/**
 * ID 필드 생성 설정
 */
export interface MockIdConfig {
  /**
   * ID 필드로 인식할 필드명 패턴
   * 정확히 일치하거나 suffix로 일치하는 필드를 ID로 처리
   * @default ['id', 'uuid', 'key', '_id', 'Id']
   * @example ['id', 'machine_id', 'device_key', 'record_uuid']
   */
  fieldPatterns?: string[]

  /**
   * ID 필드 suffix 패턴 (끝나는 문자열)
   * @default ['_id', 'Id', '_key', 'Key', '_uuid', 'Uuid']
   * @example 'user_id', 'machineId', 'device_key' 등이 매칭됨
   */
  fieldSuffixes?: string[]

  /**
   * 기본 ID 생성 포맷
   * @default 'sequential'
   */
  format?: MockIdFormat

  /**
   * sequential/numeric 포맷에서 사용할 prefix
   * @default 'id-' (sequential), '' (numeric)
   * @example 'user-' → 'user-1', 'user-2', ...
   */
  prefix?: string

  /**
   * 특정 필드명에 대한 포맷 오버라이드
   * @example { 'machine_id': 'uuid', 'order_number': 'numeric', 'trace_id': 'ulid' }
   */
  fieldOverrides?: Record<string, MockIdFormat | MockIdFieldConfig>
}

/**
 * 필드별 세부 ID 설정
 */
export interface MockIdFieldConfig {
  /** 생성 포맷 */
  format: MockIdFormat
  /** sequential/numeric용 prefix */
  prefix?: string
  /** 고정값 (테스트용) */
  fixedValue?: string | number
}

/**
 * 단일 API 설정
 */
export interface MockApiConfig {
  /** API prefix (예: '/mock/v1') */
  prefix: string
  /** OpenAPI 스펙 파일 또는 클라이언트 패키지 */
  openapi?: string | OpenApiClientConfig
  /** Proto 파일 경로 */
  proto?: string
  /** 이 API에 대한 Override 설정 */
  overrides?: Record<string, MockResponseOverride>
  /** Pagination 설정 */
  pagination?: MockPaginationConfig
  /** Cursor 설정 */
  cursor?: MockCursorConfig
}

/**
 * Stateful Mock 설정
 */
export interface MockStatefulConfig {
  /** 활성화 여부 */
  enable: boolean
  /** 세션 헤더명 */
  sessionHeader?: string // default: 'X-Mock-Session-Id'
  /** 세션 TTL (ms) */
  ttl?: number // default: 3600000 (1시간)
  /** 자동 세션 생성 */
  autoSession?: boolean // default: true
}

/**
 * Mock Module Options (확장)
 */
export interface MockModuleOptionsV2 {
  /**
   * Mock 기능 활성화 여부
   * @default true
   */
  enable: boolean

  /**
   * === 단일 API 모드 (기존 호환) ===
   */

  /** 기본 prefix */
  prefix?: string // default: '/mock'

  /** OpenAPI 설정 (단일) */
  openapi?: string | OpenApiClientConfig

  /** Proto 설정 (단일) */
  proto?: string

  /**
   * === 다중 API 모드 ===
   */

  /** 다중 API 설정 */
  apis?: Record<string, MockApiConfig>

  /** 기본 API 키 ($api에 바인딩) */
  default?: string

  /**
   * === 응답 커스터마이징 ===
   */

  /**
   * 선언형 Override (1단계)
   * 키 형식: 'METHOD /path' (예: 'GET /users/{id}')
   */
  overrides?: Record<string, MockResponseOverride>

  /**
   * Interceptor 함수 (2단계)
   * 파일 경로로 지정 (동적 import)
   */
  interceptorFile?: string

  /**
   * 필드 기본값 (단순 키 매칭)
   */
  fieldDefaults?: MockFieldDefaults

  /**
   * === 기타 설정 ===
   */

  /** Pagination 설정 */
  pagination?: MockPaginationConfig

  /** Cursor 설정 */
  cursor?: MockCursorConfig

  /** 응답 포맷 */
  responseFormat?: MockResponseFormat

  /** Stateful mock 설정 */
  stateful?: MockStatefulConfig

  /**
   * Mock 데이터 생성 설정
   * nullable 확률, 배열 길이, 숫자 범위 등
   */
  dataGeneration?: MockDataGenerationConfig

  /**
   * 전역 에러 레이트 (0-1)
   * 모든 요청에 대해 확률적으로 에러 응답 반환
   * @default 0 (에러 없음)
   */
  globalErrorRate?: number

  /**
   * 전역 에러 시 상태 코드
   * @default 500
   */
  globalErrorStatus?: number

  /**
   * 전역 에러 시 응답 본문
   */
  globalErrorBody?: unknown
}
```

### 1.2 런타임 설정

```typescript
// src/types.ts

/**
 * 런타임 설정 (서버 사이드) - 확장
 */
export interface MockRuntimeConfigV2 {
  enable: boolean

  // 단일 API 모드
  prefix: string
  openapiPath?: string
  clientPackagePath?: string
  clientPackageConfig?: OpenApiClientConfig
  protoPath?: string

  // 다중 API 모드
  apis?: Record<string, {
    prefix: string
    openapiPath?: string
    clientPackagePath?: string
    clientPackageConfig?: OpenApiClientConfig
    protoPath?: string
    overrides?: Record<string, MockResponseOverride>
  }>
  defaultApiKey?: string

  // 응답 커스터마이징
  overrides?: Record<string, MockResponseOverride>
  interceptorFile?: string
  fieldDefaults?: MockFieldDefaults

  // 기타
  pagination?: MockPaginationConfig
  cursor?: MockCursorConfig
  responseFormat?: MockResponseFormat
  stateful?: MockStatefulConfig
}
```

---

## 2. 핸들러 우선순위

```text
요청 수신
    │
    ▼
┌─────────────────────────────────────┐
│  0. 전역 에러 레이트 체크            │
│     - globalErrorRate 확률 체크      │
│     - 에러 시 즉시 에러 응답 반환     │
└─────────────────────────────────────┘
    │ 정상 진행
    ▼
┌─────────────────────────────────────┐
│  1. Override 매칭 (선언형)           │
│     - 'METHOD /path' 키로 직접 매칭  │
│     - errorRate 확률 체크            │
│     - 매칭 시: status, body, delay   │
│       적용 후 즉시 반환              │
└─────────────────────────────────────┘
    │ 매칭 없음
    ▼
┌─────────────────────────────────────┐
│  2. Default Mock 생성               │
│     - OpenAPI/Proto 기반 자동 생성   │
│     - dataGeneration 설정 적용       │
│       · nullableRate로 optional 처리 │
│       · arrayMinLength/MaxLength     │
│       · numberRange, dateRange       │
│     - fieldDefaults 적용            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│  3. Interceptor 호출 (선택적)       │
│     - (ctx, defaultResponse) => res │
│     - 조건부 수정 가능               │
└─────────────────────────────────────┘
    │
    ▼
응답 반환
```

### 에러 레이트 우선순위

```text
1. globalErrorRate     - 전역 에러 (모든 요청에 적용)
        ↓
2. override.errorRate  - 엔드포인트별 에러 (특정 API만)
```

**예시**: `globalErrorRate: 0.05` + `override['POST /orders'].errorRate: 0.3`

- `GET /users` → 5% 에러 확률 (전역만 적용)
- `POST /orders` → 30% 에러 확률 (override가 우선, 전역 무시)

### 2.2 핸들러 구현 (의사코드)

```typescript
// src/runtime/server/handlers/openapi/index.ts

async function handleRequest(event: H3Event) {
  const config = useRuntimeConfig(event).mock
  const { path, method, query, body, headers } = parseRequest(event)

  // 0. 전역 에러 레이트 체크
  if (config.globalErrorRate && Math.random() < config.globalErrorRate) {
    return createResponse(
      config.globalErrorStatus ?? 500,
      config.globalErrorBody ?? { error: 'Internal Server Error' }
    )
  }

  // 1. Override 매칭
  const overrideKey = `${method} ${path}`
  const override = findOverride(config.overrides, overrideKey, { path, method })

  if (override) {
    // 엔드포인트별 에러 확률 체크
    if (override.errorRate && Math.random() < override.errorRate) {
      await delay(override.delayMs)
      return createResponse(override.errorStatus ?? 500, override.errorBody)
    }

    // 정상 응답
    await delay(override.delayMs)
    return createResponse(override.status ?? 200, override.body, override.headers)
  }

  // 2. Default Mock 생성 (dataGeneration 설정 적용)
  let response = generateDefaultMock(path, method, {
    ...config,
    dataGeneration: config.dataGeneration ?? DEFAULT_DATA_GENERATION,
  })

  // fieldDefaults 적용
  if (config.fieldDefaults) {
    response = applyFieldDefaults(response, config.fieldDefaults)
  }

  // 3. Interceptor 호출
  if (config.interceptorFile) {
    const interceptor = await loadInterceptor(config.interceptorFile)
    const ctx: MockInterceptorContext = { path, method, pathParams, query, body, headers }
    response = await interceptor(ctx, response)
  }

  return createResponse(200, response)
}

// 기본 데이터 생성 설정
const DEFAULT_DATA_GENERATION: MockDataGenerationConfig = {
  nullableRate: 0.7,        // 70% 확률로 optional 필드에 값 생성
  arrayMinLength: 1,
  arrayMaxLength: 5,
  nestedArrayMaxLength: 3,
  stringMaxLength: 100,
  numberRange: { min: 0, max: 1000 },
  dateRange: { pastDays: 365, futureDays: 30 },
}

// 기본 ID 설정
const DEFAULT_ID_CONFIG: MockIdConfig = {
  fieldPatterns: ['id', 'uuid', 'key', '_id'],
  fieldSuffixes: ['_id', 'Id', '_key', 'Key', '_uuid', 'Uuid'],
  format: 'uuid', // 기본 포맷: uuid
  prefix: 'id-',
  fieldOverrides: {},
}

/**
 * ID 필드 여부 확인
 */
function isIdField(fieldName: string, config: MockIdConfig): boolean {
  // 1. 정확한 패턴 매칭
  if (config.fieldPatterns?.includes(fieldName)) return true

  // 2. Suffix 매칭
  if (config.fieldSuffixes?.some(suffix => fieldName.endsWith(suffix))) return true

  // 3. Override에 등록된 필드
  if (config.fieldOverrides?.[fieldName]) return true

  return false
}

/**
 * ID 값 생성
 */
function generateIdValue(
  fieldName: string,
  index: number,
  seed: string,
  config: MockIdConfig
): string | number {
  // 1. Override 확인
  const override = config.fieldOverrides?.[fieldName]
  if (override) {
    const fieldConfig = typeof override === 'string'
      ? { format: override }
      : override

    // 고정값이 있으면 반환
    if (fieldConfig.fixedValue !== undefined) {
      return fieldConfig.fixedValue
    }

    return generateByFormat(fieldConfig.format, index, seed, fieldConfig.prefix)
  }

  // 2. 기본 포맷으로 생성
  return generateByFormat(config.format ?? 'sequential', index, seed, config.prefix)
}

/**
 * 포맷별 ID 생성
 */
function generateByFormat(
  format: MockIdFormat,
  index: number,
  seed: string,
  prefix?: string
): string | number {
  switch (format) {
    case 'sequential':
      return `${prefix ?? 'id-'}${index + 1}`

    case 'numeric':
      return index + 1

    case 'uuid':
      return generateSeededUUID(seed, index)

    case 'ulid':
      return generateSeededULID(seed, index)

    case 'nanoid':
      return generateSeededNanoId(seed, index)

    case 'hash':
      return hashString(`${seed}-${index}`)

    default:
      return `${prefix ?? 'id-'}${index + 1}`
  }
}

/**
 * Seed 기반 UUID v4 생성 (결정적)
 */
function generateSeededUUID(seed: string, index: number): string {
  const rng = new SeededRandom(`${seed}-uuid-${index}`)
  const hex = '0123456789abcdef'
  let uuid = ''

  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-'
    } else if (i === 14) {
      uuid += '4' // version 4
    } else if (i === 19) {
      uuid += hex[(rng.next() & 0x3) | 0x8] // variant
    } else {
      uuid += hex[Math.floor(rng.next() * 16)]
    }
  }

  return uuid
}

/**
 * Override 키 매칭 (path parameter 지원)
 */
function findOverride(
  overrides: Record<string, MockResponseOverride>,
  key: string,
  request: { path: string, method: string }
): MockResponseOverride | null {
  // 1. 정확한 매칭
  if (overrides[key]) return overrides[key]

  // 2. 패턴 매칭 ('GET /users/{id}' -> 'GET /users/123')
  for (const [pattern, override] of Object.entries(overrides)) {
    const [overrideMethod, overridePath] = pattern.split(' ')
    if (overrideMethod !== request.method) continue

    const regex = new RegExp(
      '^' + overridePath.replace(/\{(\w+)\}/g, '([^/]+)') + '$'
    )
    if (regex.test(request.path)) {
      return override
    }
  }

  return null
}
```

---

## 3. 다중 API 지원

### 3.1 설정 예시

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  mock: {
    enable: true,

    // 다중 API 설정
    apis: {
      v1: {
        prefix: '/mock/v1',
        openapi: { package: '@org/api-v1' },
        overrides: {
          'GET /users/{id}': { status: 404, body: { error: 'Not found' } }
        }
      },
      v2: {
        prefix: '/mock/v2',
        openapi: { package: '@org/api-v2' },
      },
      internal: {
        prefix: '/mock/internal',
        openapi: './specs/internal.yaml',
      },
      grpc: {
        prefix: '/mock/rpc',
        proto: './protos/services.proto',
      }
    },

    // 기본 API (= $api)
    default: 'v1',

    // 전역 Override (모든 API에 적용)
    overrides: {
      'POST /auth/logout': { status: 200, body: { success: true } }
    },

    // 전역 필드 기본값
    fieldDefaults: {
      isVerified: true,
      email: 'test@example.com',
    },

    // Interceptor
    interceptorFile: './mock/interceptor.ts',
  }
})
```

### 3.2 클라이언트 주입

```typescript
// src/runtime/plugin.ts

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig().public.mock

  // 단일 API 모드 또는 default API
  const defaultClient = createApiClient(config.prefix)

  // 다중 API 클라이언트
  const apiClients: Record<string, ApiClient> = {}
  if (config.apis) {
    for (const [key, apiConfig] of Object.entries(config.apis)) {
      apiClients[key] = createApiClient(apiConfig.prefix)
    }
  }

  return {
    provide: {
      // 기본 클라이언트 (하위 호환)
      api: defaultClient,

      // 다중 클라이언트 맵
      apis: apiClients,
    }
  }
})
```

### 3.3 Composable

```typescript
// src/runtime/composables/useApi.ts

/**
 * API 클라이언트 접근 composable
 * @param key - API 키 (없으면 default)
 */
export function useApi(key?: string): ApiClient {
  const { $api, $apis } = useNuxtApp()

  if (!key) {
    return $api
  }

  if ($apis && key in $apis) {
    return $apis[key]
  }

  console.warn(`[mock-fried] API '${key}' not found, falling back to default`)
  return $api
}

// 타입 보강
declare module '#app' {
  interface NuxtApp {
    $api: ApiClient
    $apis: Record<string, ApiClient>
  }
}
```

### 3.4 사용 예시

```vue
<script setup>
// 기본 API 사용 (기존과 동일)
const { $api } = useNuxtApp()
const users = await $api.rest('/users')

// 특정 API 사용
const v2Api = useApi('v2')
const newUsers = await v2Api.rest('/users')

// 직접 접근
const { $apis } = useNuxtApp()
const internalData = await $apis.internal.rest('/metrics')
</script>
```

---

## 4. Interceptor 파일 구조

### 4.1 파일 정의

```typescript
// mock/interceptor.ts

import type { MockInterceptorContext } from 'mock-fried'

export default function interceptor(
  ctx: MockInterceptorContext,
  defaultResponse: unknown
): unknown {
  // 프리미엄 사용자 시뮬레이션
  if (ctx.headers['x-plan'] === 'premium') {
    return {
      ...(defaultResponse as object),
      isPremium: true,
      features: ['advanced', 'priority-support'],
    }
  }

  // 특정 사용자 ID에 대한 커스텀 응답
  if (ctx.path.startsWith('/users/') && ctx.pathParams.id === 'special') {
    return {
      id: 'special',
      name: 'VIP User',
      role: 'ADMIN',
    }
  }

  // 에러 시뮬레이션 (특정 조건)
  if (ctx.query.forceError === 'true') {
    throw createError({ statusCode: 500, message: 'Forced error' })
  }

  return defaultResponse
}
```

### 4.2 로딩 방식

```typescript
// src/runtime/server/utils/interceptor-loader.ts

let cachedInterceptor: MockInterceptor | null = null
let cachedPath: string | null = null

export async function loadInterceptor(filePath: string): Promise<MockInterceptor> {
  if (cachedInterceptor && cachedPath === filePath) {
    return cachedInterceptor
  }

  try {
    // 동적 import (Nitro 런타임에서 지원)
    const module = await import(filePath)
    cachedInterceptor = module.default || module.interceptor
    cachedPath = filePath
    return cachedInterceptor
  } catch (e) {
    console.warn(`[mock-fried] Failed to load interceptor: ${filePath}`, e)
    return (_, res) => res // 기본 pass-through
  }
}
```

---

## 5. Stateful Mock (옵션)

### 5.1 세션 스토어

```typescript
// src/runtime/server/utils/session-store.ts

interface SessionData {
  createdItems: Map<string, unknown[]> // path -> items
  deletedIds: Set<string>
  createdAt: number
  accessedAt: number
}

const sessions = new Map<string, SessionData>()

export function getSession(sessionId: string, config: MockStatefulConfig): SessionData {
  let session = sessions.get(sessionId)

  if (!session) {
    session = {
      createdItems: new Map(),
      deletedIds: new Set(),
      createdAt: Date.now(),
      accessedAt: Date.now(),
    }
    sessions.set(sessionId, session)
  }

  session.accessedAt = Date.now()
  return session
}

export function cleanupExpiredSessions(ttl: number): void {
  const now = Date.now()
  for (const [id, session] of sessions) {
    if (now - session.accessedAt > ttl) {
      sessions.delete(id)
    }
  }
}

export function resetSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export function resetAllSessions(): void {
  sessions.clear()
}
```

### 5.2 Reset API

```typescript
// src/runtime/server/handlers/reset.ts

export default defineEventHandler(async (event) => {
  const sessionId = getHeader(event, 'X-Mock-Session-Id')

  if (sessionId) {
    resetSession(sessionId)
    return { success: true, message: `Session ${sessionId} reset` }
  }

  resetAllSessions()
  return { success: true, message: 'All sessions reset' }
})
```

---

## 6. 구현 우선순위

### Phase 1: 응답 커스터마이징 (1-2주)

1. `MockResponseOverride` 타입 추가
2. `overrides` 설정 파싱 및 런타임 전달
3. 핸들러에 override 매칭 로직 추가
4. delay, errorRate 지원
5. 테스트 케이스 작성

### Phase 2: API Explorer 확장 (1주)

1. EndpointCard에 파라미터 에디터 추가
2. JSON body editor (textarea + validation)
3. cURL 생성 기능
4. 응답 복사 버튼
5. 요청 히스토리 (localStorage)

### Phase 3: 다중 스펙 지원 (1-2주)

1. `apis` 설정 구조 추가
2. 모듈에서 다중 핸들러 등록
3. `$apis` 클라이언트 주입
4. `useApi(key)` composable
5. API Explorer에서 API 선택 UI

### Phase 4: Interceptor 지원 (1주)

1. `interceptorFile` 설정 추가
2. 동적 import 로더 구현
3. 핸들러 파이프라인에 통합
4. 문서화

### Phase 5: Parser 테스트 강화 (1주)

1. openapi-generator v6, v7 fixtures 추가
2. 스냅샷 테스트 구현
3. CI 통합

### Phase 6: Stateful Mock (선택, 2주)

1. 세션 스토어 구현
2. POST/DELETE 상태 반영
3. Reset API
4. TTL 관리
5. 문서화

---

## 7. 설정 예시 (최종)

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  mock: {
    enable: true,

    // === 기본 설정 (단일 API 모드) ===
    prefix: '/mock',
    openapi: { package: '@myorg/api-client' },

    // === 또는 다중 API 모드 ===
    // apis: {
    //   main: { prefix: '/mock', openapi: { package: '@myorg/api-client' } },
    //   admin: { prefix: '/mock/admin', openapi: './admin-spec.yaml' },
    // },
    // default: 'main',

    // === 응답 커스터마이징 ===
    overrides: {
      // 특정 엔드포인트 응답 고정
      'GET /users/me': {
        status: 200,
        body: { id: 'test-user', name: 'Test User', role: 'ADMIN' },
      },
      // 에러 시뮬레이션
      'POST /payments': {
        status: 500,
        body: { error: 'Payment service unavailable' },
      },
      // 지연 + 확률적 에러
      'GET /slow-api': {
        delayMs: 2000,
        errorRate: 0.1, // 10% 확률로 에러
        errorStatus: 503,
        errorBody: { error: 'Service temporarily unavailable' },
      },
    },

    // 필드 기본값
    fieldDefaults: {
      isVerified: true,
      isActive: true,
      email: 'mock@example.com',
    },

    // 고급: Interceptor
    interceptorFile: './mock/interceptor.ts',

    // Pagination
    pagination: {
      cache: true,
      cacheTTL: 1800000,
      defaultTotal: 100,
      defaultLimit: 20,
    },

    // === Mock 데이터 생성 설정 ===
    dataGeneration: {
      // Optional 필드에 값이 생성될 확률 (0-1)
      // 0 = 항상 undefined, 1 = 항상 값 있음
      nullableRate: 0.8, // 80% 확률로 값 생성

      // 배열 길이 범위
      arrayMinLength: 1,
      arrayMaxLength: 5,
      nestedArrayMaxLength: 3,

      // 숫자 범위
      numberRange: { min: 0, max: 10000 },

      // 날짜 범위 (현재 기준)
      dateRange: { pastDays: 365, futureDays: 30 },

      // === ID 필드 생성 설정 ===
      id: {
        // ID로 인식할 필드명 (정확히 일치)
        fieldPatterns: ['id', 'uuid', 'key', '_id'],

        // ID로 인식할 suffix 패턴 (끝나는 문자열)
        // 예: 'user_id', 'machineId', 'device_key' 등 매칭
        fieldSuffixes: ['_id', 'Id', '_key', 'Key', '_uuid', 'Uuid'],

        // 기본 ID 생성 포맷
        // 'sequential' | 'uuid' | 'ulid' | 'nanoid' | 'numeric' | 'hash'
        format: 'uuid', // 기본값: uuid

        // sequential/numeric 포맷용 prefix (format이 sequential일 때 사용)
        prefix: 'id-',

        // 특정 필드별 오버라이드
        fieldOverrides: {
          // 단순 포맷 지정
          'trace_id': 'ulid',
          'order_number': 'numeric',

          // 세부 설정
          'device_key': {
            format: 'nanoid',
          },
          'user_id': {
            format: 'sequential',
            prefix: 'user-', // 결과: 'user-1', 'user-2', ...
          },
          // 테스트용 고정값
          'test_id': {
            format: 'sequential',
            fixedValue: 'test-fixed-id',
          },
        },
      },
    },

    // === 전역 에러 시뮬레이션 ===
    // 모든 요청에 5% 확률로 500 에러
    globalErrorRate: 0.05,
    globalErrorStatus: 500,
    globalErrorBody: { error: 'Internal Server Error', code: 'MOCK_ERROR' },

    // Stateful (선택)
    // stateful: {
    //   enable: true,
    //   sessionHeader: 'X-Mock-Session-Id',
    //   ttl: 3600000,
    // },
  },
})
```

---

## 8. 마이그레이션 가이드

### 기존 사용자

기존 설정은 그대로 동작합니다:

```typescript
// 기존 (계속 지원)
mock: {
  enable: true,
  prefix: '/mock',
  openapi: { package: '@myorg/api' },
}
```

### 새 기능 사용

```typescript
// 확장 기능 사용
mock: {
  enable: true,
  prefix: '/mock',
  openapi: { package: '@myorg/api' },

  // 추가: 응답 커스터마이징
  overrides: { ... },
  fieldDefaults: { ... },
}
```

---

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| 0.1.0 | 2024-12-30 | 초안 작성 |
