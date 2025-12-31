/**
 * IdGenerator 인터페이스
 * SnapshotStore에서 아이템 ID 생성을 위한 인터페이스
 */

/**
 * ID 생성기 인터페이스
 */
export interface IdGenerator {
  /**
   * ID 값 생성
   * @param fieldName ID 필드명 (예: 'id', 'userId')
   * @param index 아이템 인덱스 (0-based)
   * @param seed 생성 seed
   * @returns 생성된 ID 값 (string 또는 number)
   */
  generateId(fieldName: string, index: number, seed: string): string | number
}

/**
 * 기본 IdGenerator 구현 옵션
 */
export interface DefaultIdGeneratorOptions {
  /** ID 포맷 */
  format?: 'sequential' | 'uuid' | 'ulid' | 'nanoid' | 'numeric' | 'hash'
  /** ID 접두사 */
  prefix?: string
}
