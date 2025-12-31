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
import type { ItemProvider } from './interfaces'
import { SchemaItemProvider } from '../providers/schema-item-provider'

/**
 * PagePaginationManager 옵션
 */
export interface PagePaginationManagerOptions {
  snapshotStore?: SnapshotStore
  config?: PaginationConfig
}

/**
 * Page 기반 Pagination 관리자 클래스
 */
export class PagePaginationManager<T = Record<string, unknown>> {
  private itemProvider: ItemProvider<T> | null = null
  private generator: SchemaMockGenerator | null = null
  private snapshotStore: SnapshotStore
  private config: Required<PaginationConfig>

  /**
   * ItemProvider 기반 생성자 (새 방식)
   */
  constructor(itemProvider: ItemProvider<T>, options?: PagePaginationManagerOptions)
  /**
   * SchemaMockGenerator 기반 생성자 (하위 호환성)
   * @deprecated Use ItemProvider instead
   */
  constructor(generator: SchemaMockGenerator, options?: { snapshotStore?: SnapshotStore, config?: PaginationConfig })
  constructor(
    providerOrGenerator: ItemProvider<T> | SchemaMockGenerator,
    options?: PagePaginationManagerOptions | { snapshotStore?: SnapshotStore, config?: PaginationConfig },
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
    this.config = { ...DEFAULT_PAGINATION_CONFIG, ...options?.config }
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
   * Page 기반 페이지 조회
   */
  getPagedResponse(
    modelName: string,
    options: PagePaginationOptions = {},
  ): PagePaginationResult<T> {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      total = this.config.defaultTotal,
      seed = modelName,
      snapshotId,
      cache = this.config.cache,
      ttl = this.config.cacheTTL,
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

    // 페이지 범위 계산
    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(startIndex, endIndex)

    // 아이템 생성 - ItemProvider 사용
    const items = pageItemIds.map((itemId, i) =>
      provider.generateItemWithId(itemId, startIndex + i, `${seed}-${itemId}`),
    )

    const result: PagePaginationResult<T> = {
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
    items: T[]
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

    // 범위 계산
    const endIndex = Math.min(offset + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(offset, endIndex)

    // 아이템 생성 - ItemProvider 사용
    const items = pageItemIds.map((itemId, i) =>
      provider.generateItemWithId(itemId, offset + i, `${seed}-${itemId}`),
    )

    const result: {
      items: T[]
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

  /**
   * ItemProvider 반환
   */
  getItemProvider(): ItemProvider<T> | null {
    return this.itemProvider
  }

  /**
   * 외부 ItemProvider를 사용한 Page 기반 페이지 조회
   * Spec File Mode 등에서 각 엔드포인트마다 다른 스키마를 사용할 때 유용
   */
  getPagedResponseWithProvider<P = T>(
    provider: ItemProvider<P>,
    options: PagePaginationOptions = {},
  ): PagePaginationResult<P> & { page: number, limit: number, total: number, totalPages: number } {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      total = this.config.defaultTotal,
      seed = provider.getModelName?.() ?? 'default',
      snapshotId,
      cache = this.config.cache,
      ttl = this.config.cacheTTL,
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

    // 페이지 범위 계산
    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, snapshot.total)
    const pageItemIds = snapshot.itemIds.slice(startIndex, endIndex)

    // 아이템 생성 - 외부 ItemProvider 사용
    const items = pageItemIds.map((itemId, i) =>
      provider.generateItemWithId(itemId, startIndex + i, `${seed}-${itemId}`),
    )

    const totalPages = Math.ceil(snapshot.total / limit)

    const result: PagePaginationResult<P> & { page: number, limit: number, total: number, totalPages: number } = {
      items,
      pagination: {
        page,
        limit,
        total: snapshot.total,
        totalPages,
      },
      page,
      limit,
      total: snapshot.total,
      totalPages,
    }

    // 스냅샷 ID 포함 (옵션)
    if (this.config.includeSnapshotId) {
      result._snapshotId = snapshot.id
    }

    return result
  }
}
