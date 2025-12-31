/**
 * SchemaItemProvider
 * Client Package Mode용 ItemProvider 구현체
 * SchemaMockGenerator를 래핑하여 ItemProvider 인터페이스 제공
 */
import type { ItemProvider, ItemProviderOptions } from '../pagination/interfaces'
import type { SchemaMockGenerator } from '../client-generator'
import { generateIdValue, DEFAULT_ID_CONFIG } from '../shared'
import type { MockIdConfig } from '../../../../../types'

/**
 * Schema 기반 ItemProvider 구현체
 */
export class SchemaItemProvider implements ItemProvider<Record<string, unknown>> {
  private generator: SchemaMockGenerator
  private modelName: string
  private idFieldName: string
  private idConfig: MockIdConfig

  constructor(
    generator: SchemaMockGenerator,
    modelName: string,
    options?: ItemProviderOptions & { idConfig?: MockIdConfig },
  ) {
    this.generator = generator
    this.modelName = modelName
    this.idFieldName = options?.idFieldName ?? generator.findIdFieldName(modelName) ?? 'id'
    this.idConfig = options?.idConfig ?? DEFAULT_ID_CONFIG
  }

  /**
   * 인덱스 기반 아이템 생성
   */
  generateItem(index: number, seed: string): Record<string, unknown> {
    return this.generator.generateOne(this.modelName, seed, index)
  }

  /**
   * ID가 지정된 아이템 생성
   */
  generateItemWithId(id: string | number, index: number, seed: string): Record<string, unknown> {
    return this.generator.generateOneWithId(this.modelName, id, seed, index)
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
}
