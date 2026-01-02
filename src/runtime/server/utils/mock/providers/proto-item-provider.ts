/**
 * ProtoItemProvider
 * Proto Mode용 ItemProvider 구현체
 * Protobuf 메시지 타입을 기반으로 Mock 아이템 생성
 */
import type { ItemProvider, ItemProviderOptions } from '../pagination/interfaces'
import { generateMockMessage } from '../proto-generator'
import { hashString, generateIdValue, DEFAULT_ID_CONFIG } from '../shared'
import type { MockIdConfig } from '../../../../../types'

/**
 * Proto 필드 정의 타입
 */
export interface ProtoFieldDef {
  name: string
  type: string
  rule?: 'repeated' | 'required' | 'optional'
  keyType?: string
  resolvedType?: ProtoMessageType
}

/**
 * Proto 메시지 타입
 */
export interface ProtoMessageType {
  name: string
  fields?: Record<string, ProtoFieldDef>
  values?: Record<string, number> // enum인 경우
}

/**
 * Pagination 응답 분석 결과
 */
export interface ProtoPaginationInfo {
  /** 아이템 배열 필드명 */
  itemsFieldName: string
  /** 아이템 메시지 타입 */
  itemMessageType: ProtoMessageType
  /** Page 기반 여부 */
  isPageBased: boolean
  /** Cursor 기반 여부 */
  isCursorBased: boolean
  /** Pagination 메타 필드들 */
  metaFields: string[]
}

/**
 * Proto 메시지 기반 ItemProvider 구현체
 */
export class ProtoItemProvider implements ItemProvider<Record<string, unknown>> {
  private messageType: ProtoMessageType
  private idFieldName: string
  private idConfig: MockIdConfig
  private modelName: string

  constructor(
    messageType: ProtoMessageType,
    options?: ItemProviderOptions & { idConfig?: MockIdConfig },
  ) {
    this.messageType = messageType
    this.idFieldName = options?.idFieldName ?? this.detectIdField(messageType) ?? 'id'
    this.idConfig = options?.idConfig ?? DEFAULT_ID_CONFIG
    this.modelName = options?.modelName ?? messageType.name ?? 'ProtoItem'
  }

  /**
   * 메시지 타입에서 ID 필드 감지
   */
  private detectIdField(messageType: ProtoMessageType): string | null {
    const fields = messageType.fields
    if (!fields) return null

    // 우선순위: id > *Id > *_id > uuid > key
    const priorityPatterns = ['id', /.*Id$/, /.*_id$/, 'uuid', 'key']

    for (const pattern of priorityPatterns) {
      for (const fieldName of Object.keys(fields)) {
        if (typeof pattern === 'string') {
          if (fieldName === pattern) return fieldName
        }
        else if (pattern.test(fieldName)) {
          return fieldName
        }
      }
    }

    return null
  }

  /**
   * 인덱스 기반 아이템 생성
   */
  generateItem(index: number, seed: string): Record<string, unknown> {
    const numericSeed = hashString(`${seed}-${index}`)
    const item = generateMockMessage(this.messageType as unknown as Record<string, unknown>, numericSeed)
    return item
  }

  /**
   * ID가 지정된 아이템 생성
   */
  generateItemWithId(id: string | number, index: number, seed: string): Record<string, unknown> {
    const item = this.generateItem(index, seed)
    item[this.idFieldName] = id
    return item
  }

  /**
   * ID 필드명 반환
   */
  getIdFieldName(): string {
    return this.idFieldName
  }

  /**
   * ID 값 생성
   */
  generateId(index: number, seed: string): string | number {
    return generateIdValue(this.idFieldName, index, seed, this.idConfig)
  }

  /**
   * 모델명 반환
   */
  getModelName(): string {
    return this.modelName
  }

  /**
   * 메시지 타입 반환
   */
  getMessageType(): ProtoMessageType {
    return this.messageType
  }
}

/**
 * Proto 응답 메시지에서 Pagination 정보 분석
 * repeated 필드와 pagination 관련 필드 자동 감지
 */
export function analyzeProtoPagination(messageType: ProtoMessageType): ProtoPaginationInfo | null {
  const fields = messageType.fields
  if (!fields) return null

  // Page 기반 pagination 필드
  const pageFieldPatterns = ['page', 'total_pages', 'total', 'total_items', 'limit', 'size', 'offset', 'page_size', 'page_number']

  // Cursor 기반 pagination 필드
  const cursorFieldPatterns = ['next_cursor', 'prev_cursor', 'cursor', 'has_more', 'has_next', 'has_prev', 'next_page_token', 'page_token']

  // repeated 필드 찾기 (첫 번째 repeated 필드를 아이템 목록으로 간주)
  let itemsFieldName: string | null = null
  let itemMessageType: ProtoMessageType | null = null

  for (const [fieldName, fieldDef] of Object.entries(fields)) {
    if (fieldDef.rule === 'repeated' && fieldDef.resolvedType?.fields) {
      itemsFieldName = fieldName
      itemMessageType = fieldDef.resolvedType
      break
    }
  }

  if (!itemsFieldName || !itemMessageType) return null

  // Pagination 타입 판단
  const fieldNames = Object.keys(fields).map(f => f.toLowerCase())
  const foundPageFields = pageFieldPatterns.filter(p => fieldNames.includes(p.toLowerCase()))
  const foundCursorFields = cursorFieldPatterns.filter(p => fieldNames.includes(p.toLowerCase()))

  const isPageBased = foundPageFields.length >= 2
  const isCursorBased = foundCursorFields.length >= 1

  return {
    itemsFieldName,
    itemMessageType,
    isPageBased,
    isCursorBased,
    metaFields: [...foundPageFields, ...foundCursorFields],
  }
}
