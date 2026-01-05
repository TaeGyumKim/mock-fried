/**
 * Pagination Manager Factory
 * Centralized creation of CursorPaginationManager and PagePaginationManager
 */
import type { CursorConfig, PaginationConfig } from './mock/pagination/types'
import { CursorPaginationManager, PagePaginationManager } from './mock/pagination'
import type { ItemProvider } from './mock/pagination/interfaces'
import type { SchemaMockGenerator } from './mock'

/**
 * 캐시된 CursorPaginationManager를 가져오거나 새로 생성
 * @param provider ItemProvider 또는 SchemaMockGenerator
 * @param cacheRef 캐시 참조 객체 (cursorManager 프로퍼티를 가진 객체)
 * @param config 선택적 CursorConfig
 */
export function getOrCreateCursorManager<T = Record<string, unknown>>(
  provider: ItemProvider<T> | SchemaMockGenerator,
  cacheRef: { cursorManager: CursorPaginationManager<T> | null },
  config?: CursorConfig,
): CursorPaginationManager<T> {
  if (cacheRef.cursorManager) {
    return cacheRef.cursorManager
  }

  // ItemProvider인지 SchemaMockGenerator인지 구분
  if ('generateItem' in provider && 'generateItemWithId' in provider) {
    cacheRef.cursorManager = new CursorPaginationManager<T>(provider as ItemProvider<T>)
  }
  else {
    cacheRef.cursorManager = new CursorPaginationManager<T>(
      provider as unknown as SchemaMockGenerator,
      { cursorConfig: config },
    ) as unknown as CursorPaginationManager<T>
  }

  return cacheRef.cursorManager
}

/**
 * 캐시된 PagePaginationManager를 가져오거나 새로 생성
 * @param provider ItemProvider 또는 SchemaMockGenerator
 * @param cacheRef 캐시 참조 객체 (pageManager 프로퍼티를 가진 객체)
 * @param config 선택적 PaginationConfig
 */
export function getOrCreatePageManager<T = Record<string, unknown>>(
  provider: ItemProvider<T> | SchemaMockGenerator,
  cacheRef: { pageManager: PagePaginationManager<T> | null },
  config?: PaginationConfig,
): PagePaginationManager<T> {
  if (cacheRef.pageManager) {
    return cacheRef.pageManager
  }

  // ItemProvider인지 SchemaMockGenerator인지 구분
  if ('generateItem' in provider && 'generateItemWithId' in provider) {
    cacheRef.pageManager = new PagePaginationManager<T>(provider as ItemProvider<T>)
  }
  else {
    cacheRef.pageManager = new PagePaginationManager<T>(
      provider as unknown as SchemaMockGenerator,
      { config },
    ) as unknown as PagePaginationManager<T>
  }

  return cacheRef.pageManager
}
