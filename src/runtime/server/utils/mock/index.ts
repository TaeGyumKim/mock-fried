/**
 * Mock 생성기 모듈 진입점
 * 하위 호환성을 위해 모든 기존 export를 유지
 */

// Shared utilities
export {
  hashString,
  seededRandom,
  SeededRandom,
  generateId,
  generateSnapshotId,
  // ID generation
  DEFAULT_ID_CONFIG,
  isIdField,
  generateIdValue,
  generateByFormat,
} from './shared'

// Proto generator
export {
  generateMockValueForProtoField,
  generateMockMessage,
  deriveSeedFromRequest,
} from './proto-generator'

// OpenAPI schema generator
export {
  generateMockFromSchema,
  type SchemaContext,
} from './openapi-generator'

// Client package generator
export {
  inferValueByFieldName,
  generateValueByType,
  inferTypeFromFieldName,
  SchemaMockGenerator,
  extractDataModelName,
  type ResponseTypeInfo,
} from './client-generator'

// Pagination (enhanced)
export {
  // Types
  type CursorPayload,
  type PaginationSnapshot,
  type PagePaginationOptions,
  type PagePaginationResult,
  type CursorPaginationOptions,
  type CursorPaginationResult,
  type PaginationConfig,
  type CursorConfig,
  DEFAULT_PAGINATION_CONFIG,
  DEFAULT_CURSOR_CONFIG,
  // Snapshot Store
  SnapshotStore,
  getSnapshotStore,
  resetSnapshotStore,
  // Cursor Manager
  CursorPaginationManager,
  encodeCursor,
  decodeCursor,
  isCursorExpired,
  // Page Manager
  PagePaginationManager,
} from './pagination'
