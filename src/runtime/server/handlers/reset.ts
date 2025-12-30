import { defineEventHandler } from 'h3'
import { clearOpenApiCache } from './openapi'
import { clearProtoCache } from './rpc'
import { clearSchemaCache } from './schema'
import { clearClientPackageCache } from '../utils/client-parser'
import { resetSnapshotStore } from '../utils/mock/pagination'

/**
 * 캐시 초기화 핸들러
 * POST {prefix}/__reset
 *
 * 모든 캐시를 초기화하여 설정 변경사항을 즉시 반영할 수 있게 합니다.
 * 개발 환경에서 핫리로드 후 캐시 문제 해결에 유용합니다.
 *
 * POST를 사용하는 이유: GET은 브라우저/CDN 프리페치로 의도치 않게 호출될 수 있음
 */
export default defineEventHandler(() => {
  // OpenAPI 관련 캐시 초기화
  clearOpenApiCache()

  // Proto 캐시 초기화
  clearProtoCache()

  // 스키마 캐시 초기화
  clearSchemaCache()

  // 클라이언트 패키지 캐시 초기화
  clearClientPackageCache()

  // 페이지네이션 스냅샷 초기화
  resetSnapshotStore()

  return {
    success: true,
    message: 'All caches have been reset',
    timestamp: new Date().toISOString(),
  }
})
