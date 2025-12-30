/**
 * Pagination 관련 타입 정의
 */

/**
 * Cursor 페이로드 - 연결성 있는 cursor 데이터
 */
export interface CursorPayload {
  /** 마지막 아이템 ID (anchor) */
  lastId: string
  /** 방향: forward (다음) | backward (이전) */
  direction: 'forward' | 'backward'
  /** 스냅샷 ID (옵션) */
  snapshotId?: string
  /** 생성 시간 (만료 체크용) */
  timestamp: number
  /** 정렬 필드 (옵션) */
  sortField?: string
  /** 정렬 순서 (옵션) */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Pagination 스냅샷 - 일관된 페이지네이션을 위한 데이터 스냅샷
 */
export interface PaginationSnapshot {
  /** 스냅샷 고유 ID */
  id: string
  /** 모델명 */
  modelName: string
  /** 생성 seed */
  seed: string
  /** 총 아이템 수 */
  total: number
  /** 아이템 ID 목록 (순서 보장) */
  itemIds: string[]
  /** 생성 시간 */
  createdAt: number
  /** 만료 시간 (옵션) */
  expiresAt?: number
  /** 마지막 접근 시간 */
  accessedAt: number
}

/**
 * Page 기반 Pagination 옵션
 */
export interface PagePaginationOptions {
  /** 페이지 번호 (1-based) */
  page?: number
  /** 페이지 크기 */
  limit?: number
  /** 총 아이템 수 */
  total?: number
  /** 생성 seed */
  seed?: string
  /** 스냅샷 ID (일관성 유지용) */
  snapshotId?: string
  /** 캐싱 활성화 */
  cache?: boolean
  /** 캐시 TTL (ms) */
  ttl?: number
}

/**
 * Page 기반 Pagination 결과
 */
export interface PagePaginationResult<T> {
  /** 아이템 목록 */
  items: T[]
  /** Pagination 메타데이터 */
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  /** 스냅샷 ID (클라이언트 전달용) */
  _snapshotId?: string
}

/**
 * Cursor 기반 Pagination 옵션
 */
export interface CursorPaginationOptions {
  /** Cursor 문자열 */
  cursor?: string
  /** 페이지 크기 */
  limit?: number
  /** 총 아이템 수 */
  total?: number
  /** 생성 seed */
  seed?: string
  /** 스냅샷 ID (일관성 유지용) */
  snapshotId?: string
  /** 캐싱 활성화 */
  cache?: boolean
  /** 캐시 TTL (ms) */
  ttl?: number
}

/**
 * Cursor 기반 Pagination 결과
 */
export interface CursorPaginationResult<T> {
  /** 아이템 목록 */
  items: T[]
  /** 다음 페이지 cursor */
  nextCursor?: string
  /** 이전 페이지 cursor */
  prevCursor?: string
  /** 더 많은 데이터 존재 여부 */
  hasMore: boolean
  /** 스냅샷 ID (클라이언트 전달용) */
  _snapshotId?: string
}

/**
 * Pagination 설정
 */
export interface PaginationConfig {
  /** 캐싱 활성화 (기본: true) */
  cache?: boolean
  /** 캐시 TTL ms (기본: 1800000 = 30분) */
  cacheTTL?: number
  /** 기본 총 아이템 수 (기본: 100) */
  defaultTotal?: number
  /** 기본 페이지 크기 (기본: 20) */
  defaultLimit?: number
  /** 응답에 snapshotId 포함 (기본: false) */
  includeSnapshotId?: boolean
}

/**
 * Cursor 설정
 */
export interface CursorConfig {
  /** 만료 활성화 (기본: true) */
  enableExpiry?: boolean
  /** Cursor TTL ms (기본: 3600000 = 1시간) */
  cursorTTL?: number
  /** 정렬 정보 포함 (기본: false) */
  includeSortInfo?: boolean
}

/**
 * 기본 설정값
 */
export const DEFAULT_PAGINATION_CONFIG: Required<PaginationConfig> = {
  cache: true,
  cacheTTL: 30 * 60 * 1000, // 30분
  defaultTotal: 100,
  defaultLimit: 20,
  includeSnapshotId: false,
}

export const DEFAULT_CURSOR_CONFIG: Required<CursorConfig> = {
  enableExpiry: true,
  cursorTTL: 60 * 60 * 1000, // 1시간
  includeSortInfo: false,
}
