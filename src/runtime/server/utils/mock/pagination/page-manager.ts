/**
 * Page/Limit 기반 Pagination 관리자
 * 스냅샷 기반의 일관된 페이지네이션을 제공
 */
import type {
  PagePaginationOptions,
  PagePaginationResult,
  PaginationConfig,
  PaginationSnapshot,
} from './types'
import { DEFAULT_PAGINATION_CONFIG } from './types'
import type { SnapshotStore } from './snapshot-store'
import { getSnapshotStore } from './snapshot-store'
import type { SchemaMockGenerator } from '../client-generator'

/**
 * Page 기반 Pagination 관리자 클래스
 */
export class PagePaginationManager {
  private generator: SchemaMockGenerator
  private snapshotStore: SnapshotStore
  private config: Required<PaginationConfig>

  constructor(
    generator: SchemaMockGenerator,
    options?: {
      snapshotStore?: SnapshotStore
      config?: PaginationConfig
    },
  ) {
    this.generator = generator
    this.snapshotStore = options?.snapshotStore ?? getSnapshotStore()
    this.config = { ...DEFAULT_PAGINATION_CONFIG, ...options?.config }
  }

  /**
   * Page 기반 페이지 조회
   */
  getPagedResponse(
    modelName: string,
    options: PagePaginationOptions = {},
  ): PagePaginationResult<Record<string, unknown>> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      total = this.config.defaultTotal,
      seed = modelName,
      snapshotId,
      cache = this.config.cache,
      ttl = this.config.cacheTTL,
    } = options

    // 모델의 ID 필드명 가져오기 (SchemaMockGenerator와 일관성 유지)
    const idFieldName = this.generator.findIdFieldName(modelName) ?? 'id'

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

    // 페이지 범위 계산
    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(startIndex, endIndex)

    // 아이템 생성 (동일 seed = 동일 데이터)
    const items = pageItemIds.map((itemId, i) =>
      this.generator.generateOneWithId(modelName, itemId, `${seed}-${itemId}`, startIndex + i),
    )

    const result: PagePaginationResult<Record<string, unknown>> = {
      items,
      pagination: {
        page,
        limit,
        total: snapshot.total,
        totalPages: Math.ceil(snapshot.total / limit),
      },
    }

    // 스냅샷 ID 포함 (옵션)
    if (this.config.includeSnapshotId) {
      result._snapshotId = snapshot.id
    }

    return result
  }

  /**
   * Offset 기반 페이지 조회
   */
  getOffsetResponse(
    modelName: string,
    options: {
      offset?: number
      limit?: number
      total?: number
      seed?: string
      snapshotId?: string
      cache?: boolean
      ttl?: number
    } = {},
  ): {
    items: Record<string, unknown>[]
    offset: number
    limit: number
    total: number
    _snapshotId?: string
  } {
    const {
      offset = 0,
      limit = this.config.defaultLimit,
      total = this.config.defaultTotal,
      seed = modelName,
      snapshotId,
      cache = this.config.cache,
      ttl = this.config.cacheTTL,
    } = options

    // 모델의 ID 필드명 가져오기 (SchemaMockGenerator와 일관성 유지)
    const idFieldName = this.generator.findIdFieldName(modelName) ?? 'id'

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

    // 범위 계산
    const endIndex = Math.min(offset + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(offset, endIndex)

    // 아이템 생성
    const items = pageItemIds.map((itemId, i) =>
      this.generator.generateOneWithId(modelName, itemId, `${seed}-${itemId}`, offset + i),
    )

    const result: {
      items: Record<string, unknown>[]
      offset: number
      limit: number
      total: number
      _snapshotId?: string
    } = {
      items,
      offset,
      limit,
      total: snapshot.total,
    }

    if (this.config.includeSnapshotId) {
      result._snapshotId = snapshot.id
    }

    return result
  }
}
