/**
 * Shared Proto utilities
 * Extracted from rpc.ts and schema.ts to eliminate duplication
 */
import { readdirSync, statSync } from 'node:fs'
import { join, extname } from 'pathe'

/**
 * Protobuf 타입 문자열 변환
 * proto-loader는 타입을 "TYPE_INT32" 같은 문자열로 반환할 수 있음
 * https://protobuf.dev/programming-guides/proto3/#scalar
 */
export const PROTO_TYPE_MAP: Record<string | number, string> = {
  // 숫자 키 (legacy/fallback)
  1: 'double',
  2: 'float',
  3: 'int64',
  4: 'uint64',
  5: 'int32',
  6: 'fixed64',
  7: 'fixed32',
  8: 'bool',
  9: 'string',
  10: 'group',
  11: 'message',
  12: 'bytes',
  13: 'uint32',
  14: 'enum',
  15: 'sfixed32',
  16: 'sfixed64',
  17: 'sint32',
  18: 'sint64',
  // 문자열 키 (proto-loader 실제 반환값)
  TYPE_DOUBLE: 'double',
  TYPE_FLOAT: 'float',
  TYPE_INT64: 'int64',
  TYPE_UINT64: 'uint64',
  TYPE_INT32: 'int32',
  TYPE_FIXED64: 'fixed64',
  TYPE_FIXED32: 'fixed32',
  TYPE_BOOL: 'bool',
  TYPE_STRING: 'string',
  TYPE_GROUP: 'group',
  TYPE_MESSAGE: 'message',
  TYPE_BYTES: 'bytes',
  TYPE_UINT32: 'uint32',
  TYPE_ENUM: 'enum',
  TYPE_SFIXED32: 'sfixed32',
  TYPE_SFIXED64: 'sfixed64',
  TYPE_SINT32: 'sint32',
  TYPE_SINT64: 'sint64',
}

/**
 * 디렉토리에서 모든 .proto 파일 찾기
 */
export function findProtoFiles(dirPath: string): string[] {
  const files: string[] = []

  const stat = statSync(dirPath)
  if (stat.isFile() && extname(dirPath) === '.proto') {
    return [dirPath]
  }

  if (stat.isDirectory()) {
    const entries = readdirSync(dirPath)
    for (const entry of entries) {
      const fullPath = join(dirPath, entry)
      const entryStat = statSync(fullPath)

      if (entryStat.isFile() && extname(entry) === '.proto') {
        files.push(fullPath)
      }
      else if (entryStat.isDirectory()) {
        files.push(...findProtoFiles(fullPath))
      }
    }
  }

  return files
}

/**
 * Proto 타입 번호를 문자열로 변환
 */
export function getProtoTypeName(typeNum: number | string, typeName?: string): string {
  if (typeName) {
    return typeName.split('.').pop() || typeName
  }

  return PROTO_TYPE_MAP[typeNum] || 'unknown'
}
