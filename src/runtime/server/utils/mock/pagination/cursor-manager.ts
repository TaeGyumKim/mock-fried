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
  PaginationConfig,
} from './types'
import { DEFAULT_CURSOR_CONFIG, DEFAULT_PAGINATION_CONFIG } from './types'
import type { SnapshotStore } from './snapshot-store'
import { getSnapshotStore } from './snapshot-store'
import type { SchemaMockGenerator } from '../client-generator'
import type { ItemProvider } from './interfaces'
import { SchemaItemProvider } from '../providers/schema-item-provider'

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
 * - Raw 숫자 (numeric ID 직접 사용)
 */
export function decodeCursor(cursor: string): CursorPayload | null {
  // 1. base64url 인코딩된 JSON CursorPayload 시도
  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf-8')
    const parsed = JSON.parse(json) as CursorPayload
    // 유효한 CursorPayload인지 확인 (lastId는 string 또는 number)
    if (parsed && (typeof parsed.lastId === 'string' || typeof parsed.lastId === 'number') && parsed.direction) {
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

  // 3. Raw numeric ID (숫자 문자열인 경우 숫자로 변환)
  const numericId = Number(cursor)
  if (!Number.isNaN(numericId) && cursor === String(numericId)) {
    return {
      lastId: numericId,
      direction: 'forward',
      timestamp: Date.now(),
    }
  }

  // 4. Raw ID 문자열 (UUID, ULID 등) - 직접 ID로 사용
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
 * CursorPaginationManager 옵션
 */
export interface CursorPaginationManagerOptions {
  snapshotStore?: SnapshotStore
  cursorConfig?: CursorConfig
  config?: PaginationConfig
}

/**
 * Cursor 기반 Pagination 관리자 클래스
 */
export class CursorPaginationManager<T = Record<string, unknown>> {
  private itemProvider: ItemProvider<T> | null = null
  private generator: SchemaMockGenerator | null = null
  private snapshotStore: SnapshotStore
  private cursorConfig: Required<CursorConfig>
  private config: Required<PaginationConfig>

  /**
   * ItemProvider 기반 생성자 (새 방식)
   */
  constructor(itemProvider: ItemProvider<T>, options?: CursorPaginationManagerOptions)
  /**
   * SchemaMockGenerator 기반 생성자 (하위 호환성)
   * @deprecated Use ItemProvider instead
   */
  constructor(generator: SchemaMockGenerator, options?: { snapshotStore?: SnapshotStore, cursorConfig?: CursorConfig })
  constructor(
    providerOrGenerator: ItemProvider<T> | SchemaMockGenerator,
    options?: CursorPaginationManagerOptions | { snapshotStore?: SnapshotStore, cursorConfig?: CursorConfig },
  ) {
    // ItemProvider인지 SchemaMockGenerator인지 구분
    if ('generateItem' in providerOrGenerator && 'generateItemWithId' in providerOrGenerator) {
      // ItemProvider
      this.itemProvider = providerOrGenerator
      this.generator = null
    }
    else {
      // SchemaMockGenerator (하위 호환성)
      this.generator = providerOrGenerator as SchemaMockGenerator
      this.itemProvider = null
    }

    this.snapshotStore = options?.snapshotStore ?? getSnapshotStore()
    this.cursorConfig = { ...DEFAULT_CURSOR_CONFIG, ...options?.cursorConfig }
    this.config = { ...DEFAULT_PAGINATION_CONFIG, ...(options as CursorPaginationManagerOptions)?.config }
  }

  /**
   * 모델에 대한 ItemProvider 가져오기 (내부용)
   */
  private getProviderForModel(modelName: string): ItemProvider<T> {
    if (this.itemProvider) {
      return this.itemProvider
    }

    // SchemaMockGenerator를 ItemProvider로 래핑
    if (this.generator) {
      return new SchemaItemProvider(this.generator, modelName) as unknown as ItemProvider<T>
    }

    throw new Error('No ItemProvider or SchemaMockGenerator available')
  }

  /**
   * Cursor 기반 페이지 조회
   */
  getCursorPage(
    modelName: string,
    options: CursorPaginationOptions = {},
  ): CursorPaginationResult<T> {
    const {
      cursor,
      limit = this.config.defaultLimit,
      total = this.config.defaultTotal,
      seed = modelName,
      snapshotId,
      cache = this.config.cache,
      ttl = this.config.cacheTTL,
      isBackward = false,
    } = options

    // ItemProvider 가져오기
    const provider = this.getProviderForModel(modelName)
    const idFieldName = provider.getIdFieldName()

    // 스냅샷 조회 또는 생성
    let snapshot: PaginationSnapshot
    if (snapshotId) {
      const existing = this.snapshotStore.getById(snapshotId)
      if (existing) {
        snapshot = existing
      }
      else {
        snapshot = this.snapshotStore.getOrCreate(modelName, seed, total, { cache, ttl, idFieldName })
      }
    }
    else {
      snapshot = this.snapshotStore.getOrCreate(modelName, seed, total, { cache, ttl, idFieldName })
    }

    // Cursor 파싱
    let startIndex = 0

    if (cursor) {
      const cursorPayload = decodeCursor(cursor)

      if (cursorPayload) {
        // 만료 체크
        if (isCursorExpired(cursorPayload, this.cursorConfig)) {
          // 만료된 cursor - 처음부터 시작 (isBackward면 끝부터)
          startIndex = isBackward ? Math.max(0, snapshot.total - limit) : 0
        }
        else if (typeof cursorPayload.lastId === 'string' && cursorPayload.lastId.startsWith('legacy-')) {
          // Legacy cursor format
          startIndex = Number.parseInt(cursorPayload.lastId.replace('legacy-', ''), 10)
        }
        else {
          // ID 기반 cursor - anchor 아이템 찾기
          const targetId = String(cursorPayload.lastId)
          const anchorIndex = snapshot.itemIds.findIndex(id => String(id) === targetId)

          if (anchorIndex !== -1) {
            // isBackward query parameter가 cursor direction보다 우선
            const effectiveDirection = isBackward ? 'backward' : cursorPayload.direction
            startIndex = effectiveDirection === 'forward'
              ? anchorIndex + 1
              : Math.max(0, anchorIndex - limit)
          }
          else {
            startIndex = isBackward ? Math.max(0, snapshot.total - limit) : 0
          }
        }
      }
    }
    else if (isBackward) {
      // cursor 없이 isBackward=true면 끝에서부터 시작
      startIndex = Math.max(0, snapshot.total - limit)
    }

    // 범위 계산
    const endIndex = Math.min(startIndex + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(startIndex, endIndex)

    // 아이템 생성 - ItemProvider 사용
    const items = pageItemIds.map((itemId, i) =>
      provider.generateItemWithId(itemId, startIndex + i, `${seed}-${itemId}`),
    )

    // 새 cursor 생성
    const hasMore = endIndex < snapshot.total
    const hasPrev = startIndex > 0

    const result: CursorPaginationResult<T> = {
      items,
      hasMore,
      hasPrev,
    }

    if (hasMore && pageItemIds.length > 0) {
      result.nextCursor = encodeCursor({
        lastId: pageItemIds[pageItemIds.length - 1]!,
        direction: 'forward',
        snapshotId: snapshot.id,
        timestamp: Date.now(),
        sortField: this.cursorConfig.includeSortInfo ? snapshot.idFieldName : undefined,
        sortOrder: this.cursorConfig.includeSortInfo ? 'asc' : undefined,
      })
    }

    if (hasPrev && pageItemIds.length > 0) {
      result.prevCursor = encodeCursor({
        lastId: pageItemIds[0]!,
        direction: 'backward',
        snapshotId: snapshot.id,
        timestamp: Date.now(),
        sortField: this.cursorConfig.includeSortInfo ? snapshot.idFieldName : undefined,
        sortOrder: this.cursorConfig.includeSortInfo ? 'asc' : undefined,
      })
    }

    if (this.config.includeSnapshotId) {
      result._snapshotId = snapshot.id
    }

    return result
  }

  /**
   * ItemProvider 반환
   */
  getItemProvider(): ItemProvider<T> | null {
    return this.itemProvider
  }

  /**
   * 외부 ItemProvider를 사용한 Cursor 기반 페이지 조회
   * Spec File Mode 등에서 각 엔드포인트마다 다른 스키마를 사용할 때 유용
   */
  getCursorPageWithProvider<P = T>(
    provider: ItemProvider<P>,
    options: CursorPaginationOptions = {},
  ): CursorPaginationResult<P> {
    const {
      cursor,
      limit = this.config.defaultLimit,
      total = this.config.defaultTotal,
      seed = provider.getModelName?.() ?? 'default',
      snapshotId,
      cache = this.config.cache,
      ttl = this.config.cacheTTL,
      isBackward = false,
    } = options

    const idFieldName = provider.getIdFieldName()
    const modelName = provider.getModelName?.() ?? 'default'

    // 스냅샷 조회 또는 생성
    let snapshot: PaginationSnapshot
    if (snapshotId) {
      const existing = this.snapshotStore.getById(snapshotId)
      if (existing) {
        snapshot = existing
      }
      else {
        snapshot = this.snapshotStore.getOrCreate(modelName, seed, total, { cache, ttl, idFieldName })
      }
    }
    else {
      snapshot = this.snapshotStore.getOrCreate(modelName, seed, total, { cache, ttl, idFieldName })
    }

    // Cursor 파싱
    let startIndex = 0

    if (cursor) {
      const cursorPayload = decodeCursor(cursor)

      if (cursorPayload) {
        // 만료 체크
        if (isCursorExpired(cursorPayload, this.cursorConfig)) {
          // 만료된 cursor - 처음부터 시작 (isBackward면 끝부터)
          startIndex = isBackward ? Math.max(0, snapshot.total - limit) : 0
        }
        else if (typeof cursorPayload.lastId === 'string' && cursorPayload.lastId.startsWith('legacy-')) {
          startIndex = Number.parseInt(cursorPayload.lastId.replace('legacy-', ''), 10)
        }
        else {
          const targetId = String(cursorPayload.lastId)
          const anchorIndex = snapshot.itemIds.findIndex(id => String(id) === targetId)

          if (anchorIndex !== -1) {
            // isBackward query parameter가 cursor direction보다 우선
            const effectiveDirection = isBackward ? 'backward' : cursorPayload.direction
            startIndex = effectiveDirection === 'forward'
              ? anchorIndex + 1
              : Math.max(0, anchorIndex - limit)
          }
          else {
            startIndex = isBackward ? Math.max(0, snapshot.total - limit) : 0
          }
        }
      }
    }
    else if (isBackward) {
      // cursor 없이 isBackward=true면 끝에서부터 시작
      startIndex = Math.max(0, snapshot.total - limit)
    }

    // 범위 계산
    const endIndex = Math.min(startIndex + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(startIndex, endIndex)

    // 아이템 생성 - 외부 ItemProvider 사용
    const items = pageItemIds.map((itemId, i) =>
      provider.generateItemWithId(itemId, startIndex + i, `${seed}-${itemId}`),
    )

    // 새 cursor 생성
    const hasMore = endIndex < snapshot.total
    const hasPrev = startIndex > 0

    const result: CursorPaginationResult<P> = {
      items,
      hasMore,
      hasPrev,
    }

    if (hasMore && pageItemIds.length > 0) {
      result.nextCursor = encodeCursor({
        lastId: pageItemIds[pageItemIds.length - 1]!,
        direction: 'forward',
        snapshotId: snapshot.id,
        timestamp: Date.now(),
        sortField: this.cursorConfig.includeSortInfo ? snapshot.idFieldName : undefined,
        sortOrder: this.cursorConfig.includeSortInfo ? 'asc' : undefined,
      })
    }

    if (hasPrev && pageItemIds.length > 0) {
      result.prevCursor = encodeCursor({
        lastId: pageItemIds[0]!,
        direction: 'backward',
        snapshotId: snapshot.id,
        timestamp: Date.now(),
        sortField: this.cursorConfig.includeSortInfo ? snapshot.idFieldName : undefined,
        sortOrder: this.cursorConfig.includeSortInfo ? 'asc' : undefined,
      })
    }

    if (this.config.includeSnapshotId) {
      result._snapshotId = snapshot.id
    }

    return result
  }
}
