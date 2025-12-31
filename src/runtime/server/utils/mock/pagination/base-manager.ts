/**
 * BasePaginationManager
 * Pagination Manager의 공통 로직을 담당하는 추상 클래스
 */
import type { ItemProvider } from './interfaces'
import type { PaginationSnapshot, PaginationConfig } from './types'
import { DEFAULT_PAGINATION_CONFIG } from './types'
import type { SnapshotStore } from './snapshot-store'
import { getSnapshotStore } from './snapshot-store'

/**
 * BasePaginationManager 옵션
 */
export interface BasePaginationManagerOptions {
  snapshotStore?: SnapshotStore
  config?: PaginationConfig
}

/**
 * Pagination Manager 기본 클래스
 */
export abstract class BasePaginationManager<T = Record<string, unknown>> {
  protected snapshotStore: SnapshotStore
  protected config: Required<PaginationConfig>
  protected itemProvider: ItemProvider<T>

  constructor(
    itemProvider: ItemProvider<T>,
    options?: BasePaginationManagerOptions,
  ) {
    this.itemProvider = itemProvider
    this.snapshotStore = options?.snapshotStore ?? getSnapshotStore()
    this.config = { ...DEFAULT_PAGINATION_CONFIG, ...options?.config }
  }

  /**
   * 스냅샷 조회 또는 생성
   */
  protected getOrCreateSnapshot(
    modelName: string,
    seed: string,
    total: number,
    options?: { cache?: boolean, ttl?: number, snapshotId?: string },
  ): PaginationSnapshot {
    // 기존 스냅샷 ID로 조회
    if (options?.snapshotId) {
      const existing = this.snapshotStore.getById(options.snapshotId)
      if (existing) {
        return existing
      }
    }

    // 새 스냅샷 생성 또는 캐시에서 조회
    return this.snapshotStore.getOrCreate(modelName, seed, total, {
      cache: options?.cache ?? this.config.cache,
      ttl: options?.ttl ?? this.config.cacheTTL,
      idFieldName: this.itemProvider.getIdFieldName(),
    })
  }

  /**
   * ID 목록으로 아이템 생성
   */
  protected generateItemsFromIds(
    itemIds: (string | number)[],
    seed: string,
    startIndex: number = 0,
  ): T[] {
    return itemIds.map((id, i) =>
      this.itemProvider.generateItemWithId(id, startIndex + i, `${seed}-${id}`),
    )
  }

  /**
   * ItemProvider 반환
   */
  getItemProvider(): ItemProvider<T> {
    return this.itemProvider
  }

  /**
   * 설정 반환
   */
  getConfig(): Required<PaginationConfig> {
    return this.config
  }
}
