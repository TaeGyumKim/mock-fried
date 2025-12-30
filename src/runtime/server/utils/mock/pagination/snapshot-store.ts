/**
 * Pagination 스냅샷 저장소
 * 일관된 페이지네이션을 위한 데이터 스냅샷 관리
 */
import type { MockIdConfig } from '../../../../../types'
import type { PaginationSnapshot, PaginationConfig } from './types'
import { DEFAULT_PAGINATION_CONFIG } from './types'
import { generateSnapshotId, generateIdValue, DEFAULT_ID_CONFIG } from '../shared'

/**
 * 스냅샷 저장소 클래스
 */
export class SnapshotStore {
  private snapshots: Map<string, PaginationSnapshot> = new Map()
  private config: Required<PaginationConfig>
  private idConfig: MockIdConfig
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor(config?: PaginationConfig, idConfig?: MockIdConfig) {
    this.config = { ...DEFAULT_PAGINATION_CONFIG, ...config }
    this.idConfig = idConfig ?? DEFAULT_ID_CONFIG

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
   * 아이템 ID 목록 생성 (MockIdConfig 기반)
   * 실제 응답에서 사용될 ID와 동일한 값을 생성
   */
  private generateItemIds(total: number, seed: string, modelName: string): string[] {
    return Array.from({ length: total }, (_, i) => {
      const id = generateIdValue('id', i, `${seed}-${modelName}-${i}`, this.idConfig)
      return String(id) // uuid, ulid, nanoid 등을 문자열로 변환
    })
  }

  /**
   * 스냅샷 가져오기 또는 생성
   */
  getOrCreate(
    modelName: string,
    seed: string,
    total: number,
    options?: { ttl?: number, cache?: boolean },
  ): PaginationSnapshot {
    const key = this.getKey(modelName, seed)
    const shouldCache = options?.cache ?? this.config.cache

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
      itemIds: this.generateItemIds(total, seed, modelName),
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
export function getSnapshotStore(config?: PaginationConfig, idConfig?: MockIdConfig): SnapshotStore {
  if (!defaultStore) {
    defaultStore = new SnapshotStore(config, idConfig)
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
