/**
 * 공통 Mock 생성 유틸리티
 * Proto와 OpenAPI 모두에서 사용하는 기본 함수들
 */
import type { MockIdConfig, MockIdFormat, MockIdFieldConfig } from '../../../../types'

/**
 * 문자열에서 해시값 생성
 */
export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32비트 정수로 변환
  }
  return Math.abs(hash)
}

/**
 * seed 기반으로 결정론적 난수 생성 (간단한 LCG)
 */
export function seededRandom(seed: number): () => number {
  let currentSeed = seed
  return () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7FFFFFFF
    return currentSeed / 0x7FFFFFFF
  }
}

/**
 * 시드 기반 난수 생성기 클래스
 * OOP 스타일로 사용할 수 있는 래퍼
 */
export class SeededRandom {
  private seed: number

  constructor(seed: number | string) {
    this.seed = typeof seed === 'string' ? hashString(seed) : seed
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7FFFFFFF
    return this.seed / 0x7FFFFFFF
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)]!
  }

  /**
   * 주어진 확률로 true 반환
   */
  chance(probability: number): boolean {
    return this.next() < probability
  }

  /**
   * UUID v4 형식 문자열 생성 (결정론적)
   */
  uuid(): string {
    const hex = '0123456789abcdef'
    let uuid = ''
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-'
      }
      else if (i === 14) {
        uuid += '4' // version 4
      }
      else if (i === 19) {
        uuid += hex[this.nextInt(8, 11)] // variant
      }
      else {
        uuid += hex[this.nextInt(0, 15)]
      }
    }
    return uuid
  }

  /**
   * ULID 형식 문자열 생성 (결정론적)
   * 26자리 Base32 인코딩 (Crockford's Base32)
   */
  ulid(): string {
    const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

    // 타임스탬프 부분 (10자리) - seed 기반으로 결정론적 생성
    let timestamp = ''
    for (let i = 0; i < 10; i++) {
      timestamp += ENCODING[this.nextInt(0, 31)]
    }

    // 랜덤 부분 (16자리)
    let random = ''
    for (let i = 0; i < 16; i++) {
      random += ENCODING[this.nextInt(0, 31)]
    }

    return timestamp + random
  }

  /**
   * NanoID 형식 문자열 생성 (결정론적, 21자리)
   */
  nanoid(size: number = 21): string {
    const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-'
    let id = ''
    for (let i = 0; i < size; i++) {
      id += ALPHABET[this.nextInt(0, ALPHABET.length - 1)]
    }
    return id
  }

  /**
   * 짧은 해시 ID 생성 (결정론적, 8자리)
   */
  hashId(size: number = 8): string {
    const hex = '0123456789abcdef'
    let id = ''
    for (let i = 0; i < size; i++) {
      id += hex[this.nextInt(0, 15)]
    }
    return id
  }
}

/**
 * 고유 ID 생성 (결정론적)
 */
export function generateId(prefix: string, seed: number | string): string {
  const rng = new SeededRandom(seed)
  return `${prefix}-${rng.uuid().slice(0, 8)}`
}

/**
 * 스냅샷 ID 생성
 */
export function generateSnapshotId(): string {
  return `snap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ============================================
// ID 생성 관련 타입 및 함수
// ============================================

/**
 * 기본 ID 설정
 */
export const DEFAULT_ID_CONFIG: MockIdConfig = {
  fieldPatterns: ['id', 'uuid', 'key', '_id'],
  fieldSuffixes: ['_id', 'Id', '_key', 'Key', '_uuid', 'Uuid'],
  format: 'uuid', // 기본 포맷: uuid
  prefix: 'id-',
  fieldOverrides: {},
}

/**
 * ID 필드 여부 확인
 */
export function isIdField(fieldName: string, config: MockIdConfig = DEFAULT_ID_CONFIG): boolean {
  const patterns = config.fieldPatterns ?? DEFAULT_ID_CONFIG.fieldPatterns!
  const suffixes = config.fieldSuffixes ?? DEFAULT_ID_CONFIG.fieldSuffixes!

  // 1. 정확한 패턴 매칭
  if (patterns.includes(fieldName)) return true

  // 2. Suffix 매칭
  if (suffixes.some(suffix => fieldName.endsWith(suffix))) return true

  // 3. Override에 등록된 필드
  if (config.fieldOverrides?.[fieldName]) return true

  return false
}

/**
 * ID 값 생성
 */
export function generateIdValue(
  fieldName: string,
  index: number,
  seed: string,
  config: MockIdConfig = DEFAULT_ID_CONFIG,
): string | number {
  const rng = new SeededRandom(`${seed}-${fieldName}-${index}`)

  // 1. Override 확인
  const override = config.fieldOverrides?.[fieldName]
  if (override) {
    const fieldConfig: MockIdFieldConfig = typeof override === 'string'
      ? { format: override }
      : override

    // 고정값이 있으면 반환
    if (fieldConfig.fixedValue !== undefined) {
      return fieldConfig.fixedValue
    }

    return generateByFormat(fieldConfig.format, index, rng, fieldConfig.prefix)
  }

  // 2. 기본 포맷으로 생성
  const format = config.format ?? DEFAULT_ID_CONFIG.format!
  const prefix = config.prefix ?? DEFAULT_ID_CONFIG.prefix
  return generateByFormat(format, index, rng, prefix)
}

/**
 * 포맷별 ID 생성
 */
export function generateByFormat(
  format: MockIdFormat,
  index: number,
  rng: SeededRandom,
  prefix?: string,
): string | number {
  switch (format) {
    case 'sequential':
      return `${prefix ?? 'id-'}${index + 1}`

    case 'numeric':
      return index + 1

    case 'uuid':
      return rng.uuid()

    case 'ulid':
      return rng.ulid()

    case 'nanoid':
      return rng.nanoid()

    case 'hash':
      return rng.hashId()

    default:
      return rng.uuid()
  }
}
