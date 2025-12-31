/**
 * Pagination 스냅샷 저장소
 * 일관된 페이지네이션을 위한 데이터 스냅샷 관리
 */
import type { MockIdConfig } from '../../../../../types'
import type { PaginationSnapshot, PaginationConfig } from './types'
import { DEFAULT_PAGINATION_CONFIG } from './types'
import { generateSnapshotId, generateIdValue, DEFAULT_ID_CONFIG } from '../shared'
import type { IdGenerator } from './interfaces'

/**
 * 기본 IdGenerator 구현체 (MockIdConfig 기반)
 */
class DefaultIdGenerator implements IdGenerator {
  constructor(private idConfig: MockIdConfig) {}

  generateId(fieldName: string, index: number, seed: string): string | number {
    return generateIdValue(fieldName, index, seed, this.idConfig)
  }
}

/**
 * 스냅샷 저장소 옵션
 */
export interface SnapshotStoreOptions {
  config?: PaginationConfig
  idConfig?: MockIdConfig
  idGenerator?: IdGenerator
}

/**
 * 스냅샷 저장소 클래스
 */
export class SnapshotStore {
  private snapshots: Map<string, PaginationSnapshot> = new Map()
  private config: Required<PaginationConfig>
  private idGenerator: IdGenerator
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(options?: SnapshotStoreOptions)
  /** @deprecated Use options object instead */
  constructor(config?: PaginationConfig, idConfig?: MockIdConfig)
  constructor(configOrOptions?: PaginationConfig | SnapshotStoreOptions, idConfig?: MockIdConfig) {
    // 하위 호환성: 이전 시그니처 지원
    let config: PaginationConfig | undefined
    let idGenerator: IdGenerator | undefined

    if (configOrOptions && 'idGenerator' in configOrOptions) {
      // 새 옵션 객체 방식
      config = configOrOptions.config
      idGenerator = configOrOptions.idGenerator
      if (!idGenerator && configOrOptions.idConfig) {
        idGenerator = new DefaultIdGenerator(configOrOptions.idConfig)
      }
    }
    else {
      // 이전 방식 (하위 호환성)
      config = configOrOptions as PaginationConfig | undefined
      if (idConfig) {
        idGenerator = new DefaultIdGenerator(idConfig)
      }
    }

    this.config = { ...DEFAULT_PAGINATION_CONFIG, ...config }
    this.idGenerator = idGenerator ?? new DefaultIdGenerator(DEFAULT_ID_CONFIG)

    // 주기적 정리 (5분마다)
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
    }
  }

  /**
   * 스냅샷 키 생성
   */
  private getKey(modelName: string, seed: string): string {
    return `${modelName}:${seed}`
  }

  /**
   * 아이템 ID 목록 생성 (IdGenerator 사용)
   * 실제 응답에서 사용될 ID와 동일한 값을 생성
   * @param total 총 아이템 수
   * @param seed 생성 seed
   * @param modelName 모델명
   * @param idFieldName ID 필드명 (모델의 실제 ID 필드)
   * @param customIdGenerator 커스텀 ID 생성기 (옵션)
   */
  private generateItemIds(
    total: number,
    seed: string,
    modelName: string,
    idFieldName: string,
    customIdGenerator?: IdGenerator,
  ): (string | number)[] {
    const generator = customIdGenerator ?? this.idGenerator
    return Array.from({ length: total }, (_, i) => {
      return generator.generateId(idFieldName, i, `${seed}-${modelName}-${i}`)
    })
  }

  /**
   * 스냅샷 가져오기 또는 생성
   * @param modelName 모델명
   * @param seed 생성 seed
   * @param total 총 아이템 수
   * @param options 옵션
   * @param options.ttl 캐시 TTL (ms)
   * @param options.cache 캐싱 활성화 여부
   * @param options.idFieldName ID 필드명 (모델의 실제 ID 필드)
   * @param options.idGenerator 커스텀 ID 생성기
   */
  getOrCreate(
    modelName: string,
    seed: string,
    total: number,
    options?: { ttl?: number, cache?: boolean, idFieldName?: string, idGenerator?: IdGenerator },
  ): PaginationSnapshot {
    const key = this.getKey(modelName, seed)
    const shouldCache = options?.cache ?? this.config.cache
    // 기본 ID 필드명은 'id', 옵션으로 모델의 실제 ID 필드명을 지정 가능
    const idFieldName = options?.idFieldName ?? 'id'

    // 기존 스냅샷 확인
    const existing = this.snapshots.get(key)
    if (existing && !this.isExpired(existing)) {
      existing.accessedAt = Date.now()
      return existing
    }

    // 새 스냅샷 생성
    const now = Date.now()
    const ttl = options?.ttl ?? this.config.cacheTTL
    const snapshot: PaginationSnapshot = {
      id: generateSnapshotId(),
      modelName,
      seed,
      total,
      itemIds: this.generateItemIds(total, seed, modelName, idFieldName, options?.idGenerator),
      idFieldName,
      createdAt: now,
      expiresAt: shouldCache ? now + ttl : undefined,
      accessedAt: now,
    }

    if (shouldCache) {
      this.snapshots.set(key, snapshot)
    }

    return snapshot
  }

  /**
   * 스냅샷 ID로 조회
   */
  getById(snapshotId: string): PaginationSnapshot | undefined {
    for (const snapshot of this.snapshots.values()) {
      if (snapshot.id === snapshotId && !this.isExpired(snapshot)) {
        snapshot.accessedAt = Date.now()
        return snapshot
      }
    }
    return undefined
  }

  /**
   * 스냅샷 만료 여부 확인
   */
  private isExpired(snapshot: PaginationSnapshot): boolean {
    return snapshot.expiresAt !== undefined && Date.now() > snapshot.expiresAt
  }

  /**
   * 만료된 스냅샷 정리
   */
  cleanup(): number {
    let cleaned = 0
    for (const [key, snapshot] of this.snapshots) {
      if (this.isExpired(snapshot)) {
        this.snapshots.delete(key)
        cleaned++
      }
    }
    return cleaned
  }

  /**
   * 모든 스냅샷 삭제
   */
  clear(): void {
    this.snapshots.clear()
  }

  /**
   * 스냅샷 수 조회
   */
  size(): number {
    return this.snapshots.size
  }

  /**
   * 정리 인터벌 중지
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// 싱글톤 인스턴스
let defaultStore: SnapshotStore | null = null

/**
 * 기본 스냅샷 저장소 가져오기
 */
export function getSnapshotStore(options?: SnapshotStoreOptions): SnapshotStore
/** @deprecated Use options object instead */
export function getSnapshotStore(config?: PaginationConfig, idConfig?: MockIdConfig): SnapshotStore
export function getSnapshotStore(
  configOrOptions?: PaginationConfig | SnapshotStoreOptions,
  idConfig?: MockIdConfig,
): SnapshotStore {
  if (!defaultStore) {
    if (configOrOptions && 'idGenerator' in configOrOptions) {
      defaultStore = new SnapshotStore(configOrOptions)
    }
    else {
      defaultStore = new SnapshotStore(configOrOptions as PaginationConfig | undefined, idConfig)
    }
  }
  return defaultStore
}

/**
 * 기본 스냅샷 저장소 초기화
 */
export function resetSnapshotStore(): void {
  if (defaultStore) {
    defaultStore.destroy()
    defaultStore = null
  }
}
