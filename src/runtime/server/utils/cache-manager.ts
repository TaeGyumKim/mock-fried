/**
 * Centralized cache management for all handlers
 * Eliminates duplicated cache variables across openapi.ts, rpc.ts, and schema.ts
 */
import type {
  ParsedClientPackage,
  ApiSchema,
} from '../../../types'
import type { SchemaMockGenerator } from './mock'
import type { CursorPaginationManager, PagePaginationManager } from './mock/pagination'
import type * as protoLoader from '@grpc/proto-loader'
import type * as grpc from '@grpc/grpc-js'
import type { SpecLoaderResult } from './spec-loader'

/**
 * OpenAPI 스펙 인터페이스
 */
export interface OpenAPISpec {
  openapi?: string
  info?: Record<string, unknown>
  paths?: Record<string, Record<string, unknown>>
  components?: {
    schemas?: Record<string, Record<string, unknown>>
  }
}

/**
 * Proto 캐시 인터페이스
 */
export interface ProtoCache {
  packageDefinition: protoLoader.PackageDefinition
  grpcObject: grpc.GrpcObject
  services: Map<string, grpc.ServiceDefinition>
}

/**
 * OpenAPI Spec File Mode 캐시
 */
interface SpecModeCache {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiInstance: any
  specPath: string | null
  spec: OpenAPISpec | null
  /** swagger-parser로 로드된 스펙 결과 (Swagger 2.0 지원) */
  specLoader: SpecLoaderResult | null
  cursorManager: CursorPaginationManager<Record<string, unknown>> | null
  pageManager: PagePaginationManager<Record<string, unknown>> | null
  backwardParam: string
}

/**
 * OpenAPI Client Package Mode 캐시
 */
interface ClientModeCache {
  package: ParsedClientPackage | null
  path: string | null
  generator: SchemaMockGenerator | null
  cursorManager: CursorPaginationManager | null
  pageManager: PagePaginationManager | null
}

/**
 * Proto RPC Mode 캐시
 */
interface ProtoModeCache {
  cache: ProtoCache | null
  path: string | null
  cursorManager: CursorPaginationManager<Record<string, unknown>> | null
  pageManager: PagePaginationManager<Record<string, unknown>> | null
  backwardParam: string
}

/**
 * Schema 캐시
 */
interface SchemaCache {
  schema: ApiSchema | null
}

/**
 * 중앙 집중식 캐시 매니저
 */
class MockCacheManager {
  private _specMode: SpecModeCache = {
    apiInstance: null,
    specPath: null,
    spec: null,
    specLoader: null,
    cursorManager: null,
    pageManager: null,
    backwardParam: 'isBackward',
  }

  private _clientMode: ClientModeCache = {
    package: null,
    path: null,
    generator: null,
    cursorManager: null,
    pageManager: null,
  }

  private _protoMode: ProtoModeCache = {
    cache: null,
    path: null,
    cursorManager: null,
    pageManager: null,
    backwardParam: 'isBackward',
  }

  private _schemaCache: SchemaCache = {
    schema: null,
  }

  // Getters for spec mode
  get specMode(): SpecModeCache {
    return this._specMode
  }

  // Getters for client mode
  get clientMode(): ClientModeCache {
    return this._clientMode
  }

  // Getters for proto mode
  get protoMode(): ProtoModeCache {
    return this._protoMode
  }

  // Getters for schema cache
  get schemaCache(): SchemaCache {
    return this._schemaCache
  }

  /**
   * OpenAPI 관련 캐시 초기화 (Spec Mode + Client Mode)
   */
  clearOpenApi(): void {
    // Spec mode
    this._specMode.apiInstance = null
    this._specMode.specPath = null
    this._specMode.spec = null
    this._specMode.specLoader = null
    this._specMode.cursorManager = null
    this._specMode.pageManager = null
    this._specMode.backwardParam = 'isBackward'

    // Client mode
    this._clientMode.package = null
    this._clientMode.path = null
    this._clientMode.generator = null
    this._clientMode.cursorManager = null
    this._clientMode.pageManager = null
  }

  /**
   * Proto 캐시 초기화
   */
  clearProto(): void {
    this._protoMode.cache = null
    this._protoMode.path = null
    this._protoMode.cursorManager = null
    this._protoMode.pageManager = null
    this._protoMode.backwardParam = 'isBackward'
  }

  /**
   * Schema 캐시 초기화
   */
  clearSchema(): void {
    this._schemaCache.schema = null
  }

  /**
   * 모든 캐시 초기화
   */
  clearAll(): void {
    this.clearOpenApi()
    this.clearProto()
    this.clearSchema()
  }
}

/**
 * 싱글톤 캐시 매니저 인스턴스
 */
export const cacheManager = new MockCacheManager()
