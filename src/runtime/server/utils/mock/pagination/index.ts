/**
 * Pagination 모듈 진입점
 */

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
} from './snapshot-store'

// Cursor Manager
export {
  CursorPaginationManager,
  encodeCursor,
  decodeCursor,
  isCursorExpired,
} from './cursor-manager'

// Page Manager
export {
  PagePaginationManager,
} from './page-manager'
