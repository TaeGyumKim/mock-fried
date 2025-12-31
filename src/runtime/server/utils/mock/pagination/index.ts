/**
 * Pagination 모듈 진입점
 */

// Interfaces
export type { ItemProvider, ItemProviderOptions } from './interfaces'
export type { IdGenerator, DefaultIdGeneratorOptions } from './interfaces'

// Types
export type {
  CursorPayload,
  PaginationSnapshot,
  PagePaginationOptions,
  PagePaginationResult,
  CursorPaginationOptions,
  CursorPaginationResult,
  PaginationConfig,
  CursorConfig,
} from './types'

export {
  DEFAULT_PAGINATION_CONFIG,
  DEFAULT_CURSOR_CONFIG,
} from './types'

// Snapshot Store
export {
  SnapshotStore,
  getSnapshotStore,
  resetSnapshotStore,
  type SnapshotStoreOptions,
} from './snapshot-store'

// Base Manager
export { BasePaginationManager, type BasePaginationManagerOptions } from './base-manager'

// Cursor Manager
export {
  CursorPaginationManager,
  encodeCursor,
  decodeCursor,
  isCursorExpired,
  type CursorPaginationManagerOptions,
} from './cursor-manager'

// Page Manager
export {
  PagePaginationManager,
  type PagePaginationManagerOptions,
} from './page-manager'
