/**
 * Client Parser Unit Tests
 *
 * openapi-generator로 생성된 TypeScript 클라이언트 파싱 기능 검증
 * - 구버전 형식: let urlPath = `...`
 * - 신버전 형식: this.request({ path: `...` })
 */
import { describe, it, expect } from 'vitest'

// parseApiFile 함수를 테스트하기 위해 직접 정규식 패턴 테스트
describe('Client Parser - Path Extraction Patterns', () => {
  // 구버전 형식: let urlPath = `...`
  describe('Old Format: let urlPath = `...`', () => {
    it('should extract simple path', () => {
      const body = `
        let urlPath = \`/users\`;
        const response = await this.request({
            path: urlPath,
            method: 'GET',
        });
      `
      const pathMatch = body.match(/let\s+urlPath\s*=\s*`([^`]+)`/)
      expect(pathMatch?.[1]).toBe('/users')
    })

    it('should extract path with single parameter', () => {
      const body = `
        let urlPath = \`/users/\${requestParameters.id}\`;
        const response = await this.request({
            path: urlPath,
            method: 'GET',
        });
      `
      const pathMatch = body.match(/let\s+urlPath\s*=\s*`([^`]+)`/)
      expect(pathMatch?.[1]).toBe('/users/${requestParameters.id}')

      // 파라미터 변환
      let path = pathMatch![1]
      path = path.replace(/\$\{[^}]+\}/g, (match) => {
        const paramName = match.match(/requestParameters(?:\.(\w+)|\["?(\w+)"?\])/)?.[1]
          || match.match(/requestParameters(?:\.(\w+)|\["?(\w+)"?\])/)?.[2]
        return paramName ? `{${paramName}}` : ''
      })
      expect(path).toBe('/users/{id}')
    })

    it('should extract path with bracket notation parameter', () => {
      const body = `
        let urlPath = \`/users/\${requestParameters["userId"]}\`;
      `
      const pathMatch = body.match(/let\s+urlPath\s*=\s*`([^`]+)`/)
      let path = pathMatch![1]
      path = path.replace(/\$\{[^}]+\}/g, (match) => {
        const paramName = match.match(/requestParameters(?:\.(\w+)|\["?(\w+)"?\])/)?.[1]
          || match.match(/requestParameters(?:\.(\w+)|\["?(\w+)"?\])/)?.[2]
        return paramName ? `{${paramName}}` : ''
      })
      expect(path).toBe('/users/{userId}')
    })
  })

  // 신버전 형식: this.request({ path: `...` })
  describe('New Format: this.request({ path: `...` })', () => {
    it('should extract simple path', () => {
      const body = `
        const response = await this.request({
            path: \`/before-after/posts\`,
            method: 'GET',
        }, initOverrides);
      `
      const pathMatch = body.match(/path:\s*`([^`]+)`/)
      expect(pathMatch?.[1]).toBe('/before-after/posts')
    })

    it('should extract path with single parameter and .replace()', () => {
      const body = `
        const response = await this.request({
            path: \`/before-after/posts/{postId}\`.replace(\`{${'postId'}}\`, encodeURIComponent(String(requestParameters.postId))),
            method: 'GET',
        }, initOverrides);
      `
      const pathMatch = body.match(/path:\s*`([^`]+)`/)
      expect(pathMatch?.[1]).toBe('/before-after/posts/{postId}')

      // {${"postId"}} -> {postId} 변환
      let path = pathMatch![1]
      path = path.replace(/\{\$\{["']?(\w+)["']?\}\}/g, '{$1}')
      expect(path).toBe('/before-after/posts/{postId}')
    })

    it('should extract path with multiple parameters and chained .replace()', () => {
      const body = `
        const response = await this.request({
            path: \`/admin/lounge/{boardType}/posts/{postId}/comments/{commentId}/stats\`.replace(\`{${'boardType'}}\`, encodeURIComponent(String(requestParameters.boardType))).replace(\`{${'postId'}}\`, encodeURIComponent(String(requestParameters.postId))).replace(\`{${'commentId'}}\`, encodeURIComponent(String(requestParameters.commentId))),
            method: 'POST',
        }, initOverrides);
      `
      const pathMatch = body.match(/path:\s*`([^`]+)`/)
      expect(pathMatch?.[1]).toBe('/admin/lounge/{boardType}/posts/{postId}/comments/{commentId}/stats')

      // 변환 후에도 {param} 형태 유지
      let path = pathMatch![1]
      path = path.replace(/\{\$\{["']?(\w+)["']?\}\}/g, '{$1}')
      expect(path).toBe('/admin/lounge/{boardType}/posts/{postId}/comments/{commentId}/stats')
    })

    it('should extract path parameters from path string', () => {
      const path = '/admin/lounge/{boardType}/posts/{postId}/comments/{commentId}/stats'
      const pathParamMatches = [...path.matchAll(/\{(\w+)\}/g)]
      const paramNames = pathParamMatches.map(m => m[1])

      expect(paramNames).toEqual(['boardType', 'postId', 'commentId'])
    })
  })
})

describe('Client Parser - Method Extraction', () => {
  it('should extract GET method', () => {
    const body = `
      const response = await this.request({
          path: \`/users\`,
          method: 'GET',
      });
    `
    const methodMatch = body.match(/method:\s*'(\w+)'/)
    expect(methodMatch?.[1]).toBe('GET')
  })

  it('should extract POST method', () => {
    const body = `
      const response = await this.request({
          path: \`/users\`,
          method: 'POST',
          body: CreateUserRequestToJSON(requestParameters.createUserRequest),
      });
    `
    const methodMatch = body.match(/method:\s*'(\w+)'/)
    expect(methodMatch?.[1]).toBe('POST')
  })

  it('should extract DELETE method', () => {
    const body = `
      const response = await this.request({
          path: \`/users/{id}\`.replace(\`{${'id'}}\`, encodeURIComponent(String(requestParameters.id))),
          method: 'DELETE',
      });
    `
    const methodMatch = body.match(/method:\s*'(\w+)'/)
    expect(methodMatch?.[1]).toBe('DELETE')
  })
})

describe('Client Parser - Query Parameter Extraction', () => {
  // 신버전 형식: if (requestParameters.param !== undefined)
  it('should extract query params with dot notation', () => {
    const body = `
      if (requestParameters.cursor !== undefined) {
          queryParameters['cursor'] = requestParameters.cursor;
      }

      if (requestParameters.limit !== undefined) {
          queryParameters['limit'] = requestParameters.limit;
      }

      if (requestParameters.sortBy !== undefined) {
          queryParameters['sortBy'] = requestParameters.sortBy;
      }
    `
    const queryParamRegex = /if\s*\(requestParameters(?:\.(\w+)|\[['"](\w+)['"]\])\s*!==?\s*(?:undefined|null)\)\s*\{\s*queryParameters\[['"](\w+)['"]\]/g
    const params: string[] = []
    let match
    while ((match = queryParamRegex.exec(body)) !== null) {
      const paramName = match[3] || match[1] || match[2]
      if (paramName) params.push(paramName)
    }

    expect(params).toEqual(['cursor', 'limit', 'sortBy'])
  })

  // 구버전 형식: if (requestParameters['param'] !== undefined)
  it('should extract query params with bracket notation', () => {
    const body = `
      if (requestParameters['page'] !== undefined) {
          queryParameters['page'] = requestParameters['page'];
      }

      if (requestParameters["limit"] !== undefined) {
          queryParameters["limit"] = requestParameters["limit"];
      }
    `
    const queryParamRegex = /if\s*\(requestParameters(?:\.(\w+)|\[['"](\w+)['"]\])\s*!==?\s*(?:undefined|null)\)\s*\{\s*queryParameters\[['"](\w+)['"]\]/g
    const params: string[] = []
    let match
    while ((match = queryParamRegex.exec(body)) !== null) {
      const paramName = match[3] || match[1] || match[2]
      if (paramName) params.push(paramName)
    }

    expect(params).toEqual(['page', 'limit'])
  })
})

describe('Client Parser - JSDoc and Method Signature', () => {
  it('should match JSDoc with Raw method signature', () => {
    const content = `
    /**
     * 비포/애프터 게시글 목록 조회
     */
    async getAllBeforeAfterPostsRaw(requestParameters: GetAllBeforeAfterPostsRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetAllBeforeAfterPosts200Response>> {
    `
    const rawMethodRegex = /\/\*\*([\s\S]*?)\*\/[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*async\s+(\w+)Raw\([^)]*\):\s*Promise<runtime\.ApiResponse<((?:[^<>]|<[^>]*>)+)>>/
    const match = rawMethodRegex.exec(content)

    expect(match).not.toBeNull()
    expect(match?.[2]).toBe('getAllBeforeAfterPosts')
    expect(match?.[3]).toBe('GetAllBeforeAfterPosts200Response')
  })

  it('should match method without requestParameters', () => {
    const content = `
    /**
     * 나의 루틴 목록 조회
     */
    async listUserRoutinesRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<RoutineListResponseResponse>> {
    `
    const rawMethodRegex = /\/\*\*([\s\S]*?)\*\/[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*async\s+(\w+)Raw\([^)]*\):\s*Promise<runtime\.ApiResponse<((?:[^<>]|<[^>]*>)+)>>/
    const match = rawMethodRegex.exec(content)

    expect(match).not.toBeNull()
    expect(match?.[2]).toBe('listUserRoutines')
    expect(match?.[3]).toBe('RoutineListResponseResponse')
  })

  it('should match void response type', () => {
    const content = `
    /**
     * 루틴 삭제
     */
    async deleteRoutineRaw(requestParameters: DeleteRoutineRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
    `
    const rawMethodRegex = /\/\*\*([\s\S]*?)\*\/[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*async\s+(\w+)Raw\([^)]*\):\s*Promise<runtime\.ApiResponse<((?:[^<>]|<[^>]*>)+)>>/
    const match = rawMethodRegex.exec(content)

    expect(match).not.toBeNull()
    expect(match?.[2]).toBe('deleteRoutine')
    expect(match?.[3]).toBe('void')
  })

  it('should match generic array response type', () => {
    const content = `
    /**
     * 태그 목록 조회
     */
    async getTagsRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<string>>> {
    `
    const rawMethodRegex = /\/\*\*([\s\S]*?)\*\/[\t\v\f\r \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*\n\s*async\s+(\w+)Raw\([^)]*\):\s*Promise<runtime\.ApiResponse<((?:[^<>]|<[^>]*>)+)>>/
    const match = rawMethodRegex.exec(content)

    expect(match).not.toBeNull()
    expect(match?.[2]).toBe('getTags')
    expect(match?.[3]).toBe('Array<string>')
  })

  it('should extract summary from multiline JSDoc', () => {
    const jsdocContent = `
     * 비프/애프터 게시글 목록을 조회합니다.
     * - 기본적으로 최신순(LATEST)으로 20개를 반환합니다.
     * - 무한 스크롤 방식 지원: cursor기반 페이지네이션 처리
     * 비포/애프터 게시글 목록 조회
     `
    const jsdocLines = jsdocContent.split('\n')
      .map(line => line.replace(/^\s*\*\s?/, '').trim())
      .filter(line => line.length > 0 && !line.startsWith('@'))

    // 마지막 라인을 summary로 사용
    const summary = jsdocLines[jsdocLines.length - 1] || jsdocLines[0]
    expect(summary).toBe('비포/애프터 게시글 목록 조회')
  })
})

describe('Client Parser - Response Type Analysis', () => {
  it('should identify primitive types', () => {
    const primitiveTypes = ['string', 'number', 'boolean', 'object', 'void', 'any', 'unknown']

    expect(primitiveTypes.includes('string')).toBe(true)
    expect(primitiveTypes.includes('void')).toBe(true)
    expect(primitiveTypes.includes('UserResponse')).toBe(false)
  })

  it('should identify array types', () => {
    const checkArray = (type: string) => type.startsWith('Array<') || type.endsWith('[]')

    expect(checkArray('Array<string>')).toBe(true)
    expect(checkArray('Array<UserResponse>')).toBe(true)
    expect(checkArray('string[]')).toBe(true)
    expect(checkArray('UserResponse')).toBe(false)
  })

  it('should extract inner type from Array', () => {
    const extractArrayType = (type: string) => {
      const match = type.match(/Array<(.+)>/) || type.match(/(.+)\[\]/)
      return match?.[1]?.trim()
    }

    expect(extractArrayType('Array<string>')).toBe('string')
    expect(extractArrayType('Array<UserResponse>')).toBe('UserResponse')
    expect(extractArrayType('string[]')).toBe('string')
  })
})

describe('Client Parser - Real World Patterns', () => {
  it('should parse BeforeAfterPostsApi pattern', () => {
    // 실제 외부 프로젝트에서 가져온 패턴
    const methodBody = `
        const queryParameters: any = {};

        if (requestParameters.cursor !== undefined) {
            queryParameters['cursor'] = requestParameters.cursor;
        }

        if (requestParameters.limit !== undefined) {
            queryParameters['limit'] = requestParameters.limit;
        }

        const response = await this.request({
            path: \`/before-after/posts\`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => GetAllBeforeAfterPosts200ResponseFromJSON(jsonValue));
    `

    // Path 추출
    const pathMatch = methodBody.match(/path:\s*`([^`]+)`/)
    expect(pathMatch?.[1]).toBe('/before-after/posts')

    // Method 추출
    const methodMatch = methodBody.match(/method:\s*'(\w+)'/)
    expect(methodMatch?.[1]).toBe('GET')

    // Query params 추출
    const queryParamRegex = /if\s*\(requestParameters(?:\.(\w+)|\[['"](\w+)['"]\])\s*!==?\s*(?:undefined|null)\)\s*\{\s*queryParameters\[['"](\w+)['"]\]/g
    const params: string[] = []
    let match
    while ((match = queryParamRegex.exec(methodBody)) !== null) {
      params.push(match[3] || match[1] || match[2])
    }
    expect(params).toEqual(['cursor', 'limit'])
  })

  it('should parse AdminLoungeApi pattern with multiple path params', () => {
    const methodBody = `
        const response = await this.request({
            path: \`/admin/lounge/{boardType}/posts/{postId}/comments/{commentId}/stats/adjustments\`.replace(\`{${'boardType'}}\`, encodeURIComponent(String(requestParameters.boardType))).replace(\`{${'postId'}}\`, encodeURIComponent(String(requestParameters.postId))).replace(\`{${'commentId'}}\`, encodeURIComponent(String(requestParameters.commentId))),
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: AdjustCommentStatsRequestRequestToJSON(requestParameters.adjustCommentStatsRequestRequest),
        }, initOverrides);
    `

    // Path 추출
    const pathMatch = methodBody.match(/path:\s*`([^`]+)`/)
    let path = pathMatch?.[1] || ''

    // {${"param"}} -> {param} 변환
    path = path.replace(/\{\$\{["']?(\w+)["']?\}\}/g, '{$1}')
    expect(path).toBe('/admin/lounge/{boardType}/posts/{postId}/comments/{commentId}/stats/adjustments')

    // Path params 추출
    const pathParams = [...path.matchAll(/\{(\w+)\}/g)].map(m => m[1])
    expect(pathParams).toEqual(['boardType', 'postId', 'commentId'])

    // Method 추출
    const methodMatch = methodBody.match(/method:\s*'(\w+)'/)
    expect(methodMatch?.[1]).toBe('POST')
  })
})
