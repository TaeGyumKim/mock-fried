/**
 * ItemProvider 구현체 모듈
 */

// Interfaces (re-export for convenience)
export type {
  ItemProvider,
  ItemProviderOptions,
  IdGenerator,
  DefaultIdGeneratorOptions,
} from '../pagination/interfaces'

// Schema Provider (Client Package Mode)
export { SchemaItemProvider } from './schema-item-provider'

// OpenAPI Provider (Spec File Mode)
export {
  OpenAPIItemProvider,
  analyzePaginationSchema,
  type OpenAPISchema,
  type PaginationSchemaInfo,
} from './openapi-item-provider'

// Proto Provider (Proto Mode)
export {
  ProtoItemProvider,
  analyzeProtoPagination,
  type ProtoMessageType,
  type ProtoFieldDef,
  type ProtoPaginationInfo,
} from './proto-item-provider'
