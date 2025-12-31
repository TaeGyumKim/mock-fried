/**
 * OpenAPIItemProvider
 * Spec File Mode용 ItemProvider 구현체
 * OpenAPI 스키마를 기반으로 Mock 아이템 생성
 */
import type { ItemProvider, ItemProviderOptions } from '../pagination/interfaces'
import { generateMockFromSchema } from '../openapi-generator'
import { hashString, generateIdValue, DEFAULT_ID_CONFIG } from '../shared'
import type { MockIdConfig } from '../../../../../types'

/**
 * OpenAPI 스키마 타입
 */
export interface OpenAPISchema {
  type?: string
  properties?: Record<string, OpenAPISchema>
  items?: OpenAPISchema
  required?: string[]
  $ref?: string
  allOf?: OpenAPISchema[]
  oneOf?: OpenAPISchema[]
  anyOf?: OpenAPISchema[]
  enum?: unknown[]
  format?: string
  example?: unknown
  minimum?: number
  maximum?: number
  minItems?: number
  maxItems?: number
  additionalProperties?: boolean | OpenAPISchema
}

/**
 * Pagination 응답 분석 결과
 */
export interface PaginationSchemaInfo {
  /** 아이템 배열 필드명 (items, data, posts 등) */
  itemsFieldName: string
  /** 아이템 스키마 */
  itemSchema: OpenAPISchema
  /** Page 기반 여부 */
  isPageBased: boolean
  /** Cursor 기반 여부 */
  isCursorBased: boolean
  /** Pagination 메타 필드들 */
  metaFields: string[]
}

/**
 * OpenAPI 스키마 기반 ItemProvider 구현체
 */
export class OpenAPIItemProvider implements ItemProvider<Record<string, unknown>> {
  private schema: OpenAPISchema
  private idFieldName: string
  private idConfig: MockIdConfig
  private modelName: string

  constructor(
    schema: OpenAPISchema,
    options?: ItemProviderOptions & { idConfig?: MockIdConfig },
  ) {
    this.schema = schema
    this.idFieldName = options?.idFieldName ?? this.detectIdField(schema) ?? 'id'
    this.idConfig = options?.idConfig ?? DEFAULT_ID_CONFIG
    this.modelName = options?.modelName ?? 'OpenAPIItem'
  }

  /**
   * 스키마에서 ID 필드 감지
   */
  private detectIdField(schema: OpenAPISchema): string | null {
    const properties = schema.properties
    if (!properties) return null

    // 우선순위: id > *Id > *_id > uuid > key
    const priorityPatterns = ['id', /.*Id$/, /.*_id$/, 'uuid', 'key']

    for (const pattern of priorityPatterns) {
      for (const fieldName of Object.keys(properties)) {
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
    const item = generateMockFromSchema(this.schema, numericSeed) as Record<string, unknown>
    return item
  }

  /**
   * ID가 지정된 아이템 생성
   */
  generateItemWithId(id: string | number, index: number, seed: string): Record<string, unknown> {
    const item = this.generateItem(index, seed)

    // primitive 타입인 경우 객체로 래핑 (스키마가 string/number 등일 때)
    if (typeof item !== 'object' || item === null) {
      return { [this.idFieldName]: id, value: item }
    }

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
   * 스키마 반환
   */
  getSchema(): OpenAPISchema {
    return this.schema
  }
}

/**
 * OpenAPI 응답 스키마에서 Pagination 정보 분석
 * items/data 배열 필드와 pagination 관련 필드 자동 감지
 */
export function analyzePaginationSchema(schema: OpenAPISchema): PaginationSchemaInfo | null {
  const properties = schema.properties
  if (!properties) return null

  // 배열 필드 우선순위
  const arrayFieldPriority = ['items', 'data', 'posts', 'comments', 'results', 'records', 'list', 'users', 'products', 'orders']

  // Page 기반 pagination 필드
  const pageFields = ['page', 'totalPages', 'total', 'totalItems', 'limit', 'size', 'offset']

  // Cursor 기반 pagination 필드
  const cursorFields = ['nextCursor', 'prevCursor', 'cursor', 'hasMore', 'hasNext', 'hasPrev']

  // 배열 필드 찾기
  let itemsFieldName: string | null = null
  let itemSchema: OpenAPISchema | null = null

  // 우선순위 필드 먼저 확인
  for (const fieldName of arrayFieldPriority) {
    const field = properties[fieldName]
    if (field && field.type === 'array' && field.items) {
      itemsFieldName = fieldName
      itemSchema = field.items
      break
    }
  }

  // 우선순위에 없는 배열 필드 확인
  if (!itemsFieldName) {
    for (const [fieldName, field] of Object.entries(properties)) {
      if (field.type === 'array' && field.items) {
        itemsFieldName = fieldName
        itemSchema = field.items
        break
      }
    }
  }

  if (!itemsFieldName || !itemSchema) return null

  // Pagination 타입 판단
  const foundPageFields = pageFields.filter(f => f in properties)
  const foundCursorFields = cursorFields.filter(f => f in properties)

  const isPageBased = foundPageFields.length >= 2
  const isCursorBased = foundCursorFields.length >= 1

  return {
    itemsFieldName,
    itemSchema,
    isPageBased,
    isCursorBased,
    metaFields: [...foundPageFields, ...foundCursorFields],
  }
}
