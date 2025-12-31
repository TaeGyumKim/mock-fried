/**
 * ItemProvider 인터페이스
 * Pagination에서 아이템 생성을 위한 범용 인터페이스
 * Schema, OpenAPI, Proto 등 다양한 모드에서 구현하여 사용
 */

/**
 * 아이템 생성 프로바이더 인터페이스
 * @template T 생성되는 아이템의 타입 (기본: Record<string, unknown>)
 */
export interface ItemProvider<T = Record<string, unknown>> {
  /**
   * 인덱스 기반 아이템 생성
   * @param index 아이템 인덱스 (0-based)
   * @param seed 생성 seed (결정론적 데이터 생성용)
   * @returns 생성된 아이템
   */
  generateItem(index: number, seed: string): T

  /**
   * ID가 지정된 아이템 생성 (Pagination용)
   * @param id 아이템 ID (string 또는 number)
   * @param index 아이템 인덱스
   * @param seed 생성 seed
   * @returns ID가 설정된 아이템
   */
  generateItemWithId(id: string | number, index: number, seed: string): T

  /**
   * ID 필드명 반환
   * @returns 모델의 ID 필드명 (예: 'id', 'userId', 'productId')
   */
  getIdFieldName(): string

  /**
   * ID 값 생성
   * @param index 아이템 인덱스
   * @param seed 생성 seed
   * @returns 생성된 ID 값
   */
  generateId(index: number, seed: string): string | number

  /**
   * 모델명 반환 (옵셔널)
   * @returns 모델명 (예: 'User', 'Post', 'Product')
   */
  getModelName?(): string
}

/**
 * ItemProvider 생성 옵션
 */
export interface ItemProviderOptions {
  /** ID 필드명 (기본: 'id') */
  idFieldName?: string
  /** 모델명 (타입 참조용) */
  modelName?: string
}
