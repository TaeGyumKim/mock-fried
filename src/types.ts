/**
 * Pagination 설정
 */
export interface MockPaginationConfig {
  /**
   * 캐싱 활성화
   * @default true
   */
  cache?: boolean

  /**
   * 캐시 TTL (밀리초)
   * @default 1800000 (30분)
   */
  cacheTTL?: number

  /**
   * 기본 총 아이템 수
   * @default 100
   */
  defaultTotal?: number

  /**
   * 기본 페이지 크기
   * @default 20
   */
  defaultLimit?: number

  /**
   * 응답에 snapshotId 포함 여부
   * @default false
   */
  includeSnapshotId?: boolean
}

/**
 * Cursor 설정
 */
export interface MockCursorConfig {
  /**
   * 만료 활성화
   * @default true
   */
  enableExpiry?: boolean

  /**
   * Cursor TTL (밀리초)
   * @default 3600000 (1시간)
   */
  cursorTTL?: number

  /**
   * 정렬 정보 포함 여부
   * @default false
   */
  includeSortInfo?: boolean

  /**
   * 역방향 페이지네이션 쿼리 파라미터명
   * @default 'isBackward'
   */
  backwardParam?: string
}

/**
 * ID 생성 포맷
 * - 'sequential': 'id-1', 'id-2', ... (prefix + index)
 * - 'uuid': 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
 * - 'ulid': '01ARZ3NDEKTSV4RRFFQ69G5FAV'
 * - 'nanoid': 'V1StGXR8_Z5jdHi6B-myT' (21자)
 * - 'numeric': 1, 2, 3, ...
 * - 'hash': seed 기반 해시 문자열
 */
export type MockIdFormat = 'sequential' | 'uuid' | 'ulid' | 'nanoid' | 'numeric' | 'hash'

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
 * ID 필드 생성 설정
 */
export interface MockIdConfig {
  /**
   * ID 필드로 인식할 필드명 패턴 (정확히 일치)
   * @default ['id', 'uuid', 'key', '_id']
   */
  fieldPatterns?: string[]

  /**
   * ID 필드 suffix 패턴 (끝나는 문자열)
   * @default ['_id', 'Id', '_key', 'Key', '_uuid', 'Uuid']
   */
  fieldSuffixes?: string[]

  /**
   * 기본 ID 생성 포맷
   * @default 'uuid'
   */
  format?: MockIdFormat

  /**
   * sequential/numeric 포맷에서 사용할 prefix
   * @default 'id-' (sequential), '' (numeric)
   */
  prefix?: string

  /**
   * 특정 필드명에 대한 포맷 오버라이드
   * @example { 'machine_id': 'uuid', 'order_number': 'numeric' }
   */
  fieldOverrides?: Record<string, MockIdFormat | MockIdFieldConfig>
}

/**
 * Mock 데이터 생성 설정
 */
export interface MockDataGenerationConfig {
  /**
   * Optional 필드에 값이 생성될 확률 (0-1)
   * @default 0.7
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
   * 문자열 필드 최대 길이
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
    pastDays?: number // default: 365
    futureDays?: number // default: 30
  }

  /**
   * ID 필드 생성 설정
   */
  id?: MockIdConfig
}

/**
 * Mock Module Options
 * nuxt.config.ts에서 mock 키로 설정
 */
export interface MockModuleOptions {
  /**
   * Mock 기능 활성화 여부
   * @default true
   */
  enable: boolean

  /**
   * Mock API 라우트 prefix
   * @default '/mock'
   */
  prefix: string

  /**
   * OpenAPI 설정
   * - 문자열: 스펙 파일 경로 (yaml/json)
   * - 객체: 생성된 클라이언트 패키지 설정
   * @example './mocks/openapi.yaml'
   * @example { package: '@org/openapi-client' }
   */
  openapi?: string | OpenApiClientConfig

  /**
   * Proto 파일 또는 디렉토리 경로 (상대 경로)
   * @example './mocks/example.proto' 또는 './mocks'
   */
  proto?: string

  /**
   * Pagination 설정
   */
  pagination?: MockPaginationConfig

  /**
   * Cursor 설정
   */
  cursor?: MockCursorConfig
}

/**
 * 런타임 설정 (서버 사이드)
 */
export interface MockRuntimeConfig {
  enable: boolean
  prefix: string
  /** OpenAPI 스펙 파일 경로 (기존 방식) */
  openapiPath?: string
  /** 클라이언트 패키지 루트 경로 */
  clientPackagePath?: string
  /** 클라이언트 패키지 설정 */
  clientPackageConfig?: OpenApiClientConfig
  protoPath?: string
  /** Pagination 설정 */
  pagination?: MockPaginationConfig
  /** Cursor 설정 */
  cursor?: MockCursorConfig
}

/**
 * 클라이언트용 공개 런타임 설정
 */
export interface MockPublicRuntimeConfig {
  enable: boolean
  prefix: string
}

/**
 * API 클라이언트 인터페이스
 */
export interface ApiClient {
  /**
   * REST API 호출
   * @param path - API 경로 (prefix 제외)
   * @param options - fetch 옵션
   */
  rest: <T = unknown>(path: string, options?: ApiRequestOptions) => Promise<T>

  /**
   * RPC 호출
   * @param service - 서비스명
   * @param method - 메서드명
   * @param params - 요청 파라미터
   */
  rpc: <T = unknown>(service: string, method: string, params?: Record<string, unknown>) => Promise<T>

  /**
   * API 스키마 조회
   * @returns OpenAPI 및 RPC 스키마 메타데이터
   */
  getSchema: () => Promise<ApiSchema>

  /**
   * 동적 서비스 접근 (Proxy)
   * @example api.UserService.GetUser({ id: 1 })
   */
  [serviceName: string]: ApiServiceProxy | ApiClient['rest'] | ApiClient['rpc'] | ApiClient['getSchema']
}

/**
 * 동적 서비스 Proxy 타입
 */
export interface ApiServiceProxy {
  [methodName: string]: <T = unknown>(params?: Record<string, unknown>) => Promise<T>
}

/**
 * API 요청 옵션
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  params?: Record<string, string | number>
  headers?: Record<string, string>
}

/**
 * OpenAPI 핸들러 컨텍스트
 */
export interface OpenAPIHandlerContext {
  operation: {
    operationId: string
    path: string
    method: string
  }
  request: {
    params: Record<string, string>
    query: Record<string, string>
    body: unknown
    headers: Record<string, string>
  }
}

/**
 * Proto 서비스 정의
 */
export interface ProtoServiceDefinition {
  serviceName: string
  methods: ProtoMethodDefinition[]
}

/**
 * Proto 메서드 정의
 */
export interface ProtoMethodDefinition {
  name: string
  requestType: unknown
  responseType: unknown
  requestStream: boolean
  responseStream: boolean
}

/**
 * Mock 응답 결과
 */
export interface MockResponse<T = unknown> {
  success: boolean
  data: T
  meta?: {
    service?: string
    method?: string
    operationId?: string
  }
}

/**
 * API 스키마 응답 (GET /mock/__schema)
 */
export interface ApiSchema {
  openapi?: OpenApiSchema
  rpc?: RpcSchema
}

/**
 * OpenAPI 스키마 메타데이터
 */
export interface OpenApiSchema {
  info: {
    title: string
    version: string
    description?: string
  }
  paths: OpenApiPathItem[]
  /** Client package 방식 사용 시 추가 메타데이터 */
  _meta?: {
    source: 'client-package' | 'spec-file'
    package?: string
    apiClasses?: string[]
    modelCount?: number
    endpointCount?: number
  }
}

/**
 * OpenAPI 경로 아이템
 */
export interface OpenApiPathItem {
  path: string
  method: string
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  parameters?: OpenApiParameter[]
  requestBody?: OpenApiRequestBody
  responses?: Record<string, OpenApiResponse>
}

/**
 * OpenAPI 파라미터
 */
export interface OpenApiParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'cookie'
  required?: boolean
  description?: string
  schema?: OpenApiSchemaObject
}

/**
 * OpenAPI 요청 본문
 */
export interface OpenApiRequestBody {
  required?: boolean
  description?: string
  content?: Record<string, { schema?: OpenApiSchemaObject }>
}

/**
 * OpenAPI 응답
 */
export interface OpenApiResponse {
  description?: string
  content?: Record<string, { schema?: OpenApiSchemaObject }>
}

/**
 * OpenAPI 스키마 객체
 */
export interface OpenApiSchemaObject {
  type?: string
  format?: string
  properties?: Record<string, OpenApiSchemaObject>
  items?: OpenApiSchemaObject
  required?: string[]
  enum?: unknown[]
  example?: unknown
  $ref?: string
}

/**
 * RPC 스키마 메타데이터
 */
export interface RpcSchema {
  package?: string
  services: RpcServiceSchema[]
}

/**
 * RPC 서비스 스키마
 */
export interface RpcServiceSchema {
  name: string
  methods: RpcMethodSchema[]
}

/**
 * RPC 메서드 스키마
 */
export interface RpcMethodSchema {
  name: string
  requestType: string
  responseType: string
  requestFields?: RpcFieldSchema[]
  responseFields?: RpcFieldSchema[]
}

/**
 * RPC 필드 스키마
 */
export interface RpcFieldSchema {
  name: string
  type: string
  repeated?: boolean
  optional?: boolean
}

// ============================================
// OpenAPI Client Package Parser Types
// ============================================

/**
 * OpenAPI 클라이언트 패키지 설정
 */
export interface OpenApiClientConfig {
  /**
   * npm 패키지명
   * @example '@ptcorp-eosikahair/openapi'
   */
  package: string

  /**
   * API 파일 디렉토리 (패키지 루트 기준)
   * @default 'src/apis'
   */
  apisDir?: string

  /**
   * Model 파일 디렉토리 (패키지 루트 기준)
   * @default 'src/models'
   */
  modelsDir?: string
}

/**
 * 파싱된 API 엔드포인트 정보
 */
export interface ParsedEndpoint {
  /** API 경로 */
  path: string
  /** HTTP 메서드 */
  method: string
  /** 오퍼레이션 ID (메서드명) */
  operationId: string
  /** 설명 (JSDoc) */
  summary?: string
  /** API 클래스명 */
  apiClassName: string
  /** Path 파라미터 */
  pathParams: ParsedParameter[]
  /** Query 파라미터 */
  queryParams: ParsedParameter[]
  /** Request Body 타입명 */
  requestBodyType?: string
  /** Response 타입명 */
  responseType: string
}

/**
 * 파싱된 파라미터
 */
export interface ParsedParameter {
  name: string
  type: string
  required: boolean
  description?: string
}

/**
 * 파싱된 모델 스키마
 */
export interface ParsedModelSchema {
  /** 모델명 */
  name: string
  /** 필드 목록 */
  fields: ParsedModelField[]
  /** enum 값 (enum인 경우) */
  enumValues?: string[]
}

/**
 * 파싱된 모델 필드
 */
export interface ParsedModelField {
  /** 필드명 (camelCase, TypeScript interface 기준) */
  name: string
  /** JSON 키명 (snake_case 등, API 응답 기준) - name과 같으면 생략 가능 */
  jsonKey?: string
  /** TypeScript 타입 */
  type: string
  /** 필수 여부 */
  required: boolean
  /** 배열 여부 */
  isArray: boolean
  /** 참조 타입명 (다른 모델 참조 시) */
  refType?: string
  /** 설명 (JSDoc) */
  description?: string
}

/**
 * 클라이언트 패키지 파싱 결과
 */
export interface ParsedClientPackage {
  /** 패키지 정보 */
  info: {
    name: string
    title?: string
    version?: string
  }
  /** 엔드포인트 목록 */
  endpoints: ParsedEndpoint[]
  /** 모델 스키마 맵 */
  models: Map<string, ParsedModelSchema>
}

// ============================================
// Mock Data Cache Types
// ============================================

/**
 * Mock 데이터 캐시 키
 */
export interface MockCacheKey {
  /** 엔드포인트 경로 (파라미터 치환 전) */
  path: string
  /** HTTP 메서드 */
  method: string
  /** Path 파라미터 */
  pathParams?: Record<string, string>
  /** Query 파라미터 */
  queryParams?: Record<string, string | number>
}

/**
 * Mock 데이터 캐시 엔트리
 */
export interface MockCacheEntry<T = unknown> {
  /** 캐시된 데이터 */
  data: T
  /** 생성 시간 */
  createdAt: number
  /** 마지막 접근 시간 */
  accessedAt: number
}

/**
 * Pagination 정보
 */
export interface PaginationInfo {
  /** 현재 페이지 (1-based) */
  page: number
  /** 페이지당 항목 수 */
  limit: number
  /** 전체 항목 수 */
  total: number
  /** 전체 페이지 수 */
  totalPages: number
}

/**
 * Cursor 기반 페이지네이션 정보
 */
export interface CursorPaginationInfo {
  /** 다음 커서 */
  nextCursor?: string
  /** 이전 커서 */
  prevCursor?: string
  /** 더 있는지 여부 */
  hasMore: boolean
}

/**
 * Mock 데이터 저장소 (리스트 API용)
 */
export interface MockDataStore<T = unknown> {
  /** 전체 데이터 목록 */
  items: T[]
  /** 생성 시간 */
  createdAt: number
  /** ID 카운터 */
  idCounter: number
}
