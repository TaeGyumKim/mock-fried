/**
 * Cursor 기반 Pagination 관리자
 * ID 기반의 연결성 있는 cursor를 제공
 */
import type {
  CursorPayload,
  CursorPaginationOptions,
  CursorPaginationResult,
  CursorConfig,
  PaginationSnapshot,
} from './types'
import { DEFAULT_CURSOR_CONFIG, DEFAULT_PAGINATION_CONFIG } from './types'
import type { SnapshotStore } from './snapshot-store'
import { getSnapshotStore } from './snapshot-store'
import type { SchemaMockGenerator } from '../client-generator'

/**
 * Cursor 인코딩
 */
export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload)
  return Buffer.from(json).toString('base64url')
}

/**
 * Cursor 디코딩
 * - base64url 인코딩된 CursorPayload JSON
 * - Legacy base64 인코딩된 인덱스 번호
 * - Raw UUID/ID 문자열 (직접 ID로 사용)
 */
export function decodeCursor(cursor: string): CursorPayload | null {
  // 1. base64url 인코딩된 JSON CursorPayload 시도
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8')
    const parsed = JSON.parse(json) as CursorPayload
    // 유효한 CursorPayload인지 확인
    if (parsed && typeof parsed.lastId === 'string' && parsed.direction) {
      return parsed
    }
  }
  catch {
    // Ignore - try other formats
  }

  // 2. Legacy cursor format (base64 encoded index)
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
    const index = Number.parseInt(decoded, 10)
    if (!Number.isNaN(index) && decoded === String(index)) {
      return {
        lastId: `legacy-${index}`,
        direction: 'forward',
        timestamp: Date.now(),
      }
    }
  }
  catch {
    // Ignore - try other formats
  }

  // 3. Raw ID 문자열 (UUID, ULID 등) - 직접 ID로 사용
  // UUID 패턴: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // ULID 패턴: 26자리 영숫자
  // NanoID 패턴: 21자리 영숫자+특수문자
  if (cursor && cursor.length >= 8 && !cursor.includes(' ')) {
    return {
      lastId: cursor,
      direction: 'forward',
      timestamp: Date.now(),
    }
  }

  return null
}

/**
 * Cursor 만료 여부 확인
 */
export function isCursorExpired(payload: CursorPayload, config: CursorConfig = {}): boolean {
  const { enableExpiry = DEFAULT_CURSOR_CONFIG.enableExpiry, cursorTTL = DEFAULT_CURSOR_CONFIG.cursorTTL } = config
  if (!enableExpiry) return false
  return Date.now() - payload.timestamp > cursorTTL
}

/**
 * Cursor 기반 Pagination 관리자 클래스
 */
export class CursorPaginationManager {
  private generator: SchemaMockGenerator
  private snapshotStore: SnapshotStore
  private cursorConfig: Required<CursorConfig>

  constructor(
    generator: SchemaMockGenerator,
    options?: {
      snapshotStore?: SnapshotStore
      cursorConfig?: CursorConfig
    },
  ) {
    this.generator = generator
    this.snapshotStore = options?.snapshotStore ?? getSnapshotStore()
    this.cursorConfig = { ...DEFAULT_CURSOR_CONFIG, ...options?.cursorConfig }
  }

  /**
   * Cursor 기반 페이지 조회
   */
  getCursorPage(
    modelName: string,
    options: CursorPaginationOptions = {},
  ): CursorPaginationResult<Record<string, unknown>> {
    const {
      cursor,
      limit = DEFAULT_PAGINATION_CONFIG.defaultLimit,
      total = DEFAULT_PAGINATION_CONFIG.defaultTotal,
      seed = modelName,
      snapshotId,
      cache = true,
      ttl,
    } = options

    // 스냅샷 조회 또는 생성
    let snapshot: PaginationSnapshot
    if (snapshotId) {
      const existing = this.snapshotStore.getById(snapshotId)
      if (existing) {
        snapshot = existing
      }
      else {
        snapshot = this.snapshotStore.getOrCreate(modelName, seed, total, { cache, ttl })
      }
    }
    else {
      snapshot = this.snapshotStore.getOrCreate(modelName, seed, total, { cache, ttl })
    }

    // Cursor 파싱
    let startIndex = 0
    let cursorPayload: CursorPayload | null = null

    if (cursor) {
      cursorPayload = decodeCursor(cursor)

      if (cursorPayload) {
        // 만료 체크
        if (isCursorExpired(cursorPayload, this.cursorConfig)) {
          // 만료된 cursor - 처음부터 시작
          startIndex = 0
        }
        else if (cursorPayload.lastId.startsWith('legacy-')) {
          // Legacy cursor format
          startIndex = Number.parseInt(cursorPayload.lastId.replace('legacy-', ''), 10)
        }
        else {
          // ID 기반 cursor - anchor 아이템 찾기
          const anchorIndex = snapshot.itemIds.findIndex(id => id === cursorPayload!.lastId)

          if (anchorIndex !== -1) {
            startIndex = cursorPayload.direction === 'forward'
              ? anchorIndex + 1
              : Math.max(0, anchorIndex - limit)
          }
          else {
            // Anchor를 찾을 수 없음 - timestamp 기반 fallback
            // 비율로 추정 (timestamp가 생성 시간에서 얼마나 지났는지)
            const elapsedRatio = Math.min(1, (cursorPayload.timestamp - snapshot.createdAt) / (snapshot.expiresAt || Date.now() - snapshot.createdAt))
            startIndex = Math.floor(elapsedRatio * snapshot.total)
          }
        }
      }
    }

    // 범위 계산
    const endIndex = Math.min(startIndex + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(startIndex, endIndex)

    // 아이템 생성
    const items = pageItemIds.map((itemId, i) =>
      this.generator.generateOneWithId(modelName, itemId, `${seed}-${itemId}`, startIndex + i),
    )

    // 새 cursor 생성
    const hasMore = endIndex < snapshot.total
    const hasPrev = startIndex > 0

    const result: CursorPaginationResult<Record<string, unknown>> = {
      items,
      hasMore,
    }

    if (hasMore && pageItemIds.length > 0) {
      result.nextCursor = encodeCursor({
        lastId: pageItemIds[pageItemIds.length - 1]!,
        direction: 'forward',
        snapshotId: snapshot.id,
        timestamp: Date.now(),
        sortField: this.cursorConfig.includeSortInfo ? 'id' : undefined,
        sortOrder: this.cursorConfig.includeSortInfo ? 'asc' : undefined,
      })
    }

    if (hasPrev && pageItemIds.length > 0) {
      result.prevCursor = encodeCursor({
        lastId: pageItemIds[0]!,
        direction: 'backward',
        snapshotId: snapshot.id,
        timestamp: Date.now(),
        sortField: this.cursorConfig.includeSortInfo ? 'id' : undefined,
        sortOrder: this.cursorConfig.includeSortInfo ? 'asc' : undefined,
      })
    }

    result._snapshotId = snapshot.id

    return result
  }
}
