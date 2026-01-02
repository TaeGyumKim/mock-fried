# Mock-Fried Roadmap

## v1.1.0 - Mock Control Features

예상 작업량: 3개 기능, 각 기능별 세부 구현 계획

---

## Feature 1: Mock 데이터 오버라이드

### 목표
특정 엔드포인트에 대해 자동 생성 대신 사용자 정의 응답을 반환

### 사용 시나리오
1. 특정 ID에 대해 고정된 테스트 데이터 필요
2. 특수 케이스 (빈 배열, null 값 등) 테스트
3. UI 스냅샷 테스트를 위한 일관된 데이터

### API 설계

```typescript
// nuxt.config.ts
mock: {
  enable: true,
  prefix: '/mock',
  openapi: './api/openapi.yaml',

  // 신규: 오버라이드 설정
  overrides: {
    // 정적 오버라이드 - 경로별 고정 응답
    '/users/admin-user': {
      id: 'admin-user',
      name: 'Admin User',
      role: 'admin',
      permissions: ['read', 'write', 'delete']
    },

    // 함수형 오버라이드 - 동적 응답
    '/users/:id': (params, query) => {
      if (params.id === 'not-found') {
        return { _status: 404, error: 'User not found' }
      }
      return null // null 반환 시 자동 생성으로 폴백
    },

    // 배열 오버라이드 - 특정 조건별 다른 응답
    '/products': [
      {
        match: { query: { category: 'empty' } },
        response: { items: [], total: 0 }
      },
      {
        match: { query: { category: 'error' } },
        response: { _status: 500, error: 'Database error' }
      }
    ]
  }
}
```

### 타입 정의

```typescript
// src/types.ts 추가

/**
 * Mock 오버라이드 설정
 */
export interface MockOverrideConfig {
  [path: string]: MockOverrideValue
}

export type MockOverrideValue =
  | MockOverrideStatic           // 정적 응답
  | MockOverrideFunction         // 함수형 응답
  | MockOverrideConditional[]    // 조건부 응답 배열

export interface MockOverrideStatic {
  _status?: number               // HTTP 상태 코드
  _headers?: Record<string, string>  // 응답 헤더
  _delay?: number                // 지연 시간 (ms)
  [key: string]: unknown
}

export type MockOverrideFunction = (
  params: Record<string, string>,
  query: Record<string, string>,
  body?: unknown
) => MockOverrideStatic | null | Promise<MockOverrideStatic | null>

export interface MockOverrideConditional {
  match: {
    method?: string
    query?: Record<string, string>
    body?: Record<string, unknown>
    headers?: Record<string, string>
  }
  response: MockOverrideStatic
}
```

### 구현 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/types.ts` | MockOverrideConfig 타입 추가 |
| `src/module.ts` | overrides 옵션 처리, 런타임 설정 전달 |
| `src/runtime/server/utils/override-matcher.ts` | 신규: 오버라이드 매칭 로직 |
| `src/runtime/server/handlers/openapi.ts` | 오버라이드 체크 후 응답 |
| `src/runtime/server/handlers/rpc.ts` | Proto RPC 오버라이드 지원 |

### 구현 순서

1. **타입 정의** (30분)
   - MockOverrideConfig 및 관련 타입 추가
   - MockModuleOptions에 overrides 필드 추가

2. **오버라이드 매처 구현** (2시간)
   - 경로 패턴 매칭 (`:id` 파라미터 지원)
   - 조건부 매칭 (query, body, headers)
   - 함수형 오버라이드 실행

3. **핸들러 통합** (1시간)
   - openapi.ts: 응답 생성 전 오버라이드 체크
   - _status, _delay 등 메타 필드 처리

4. **테스트 작성** (1시간)
   - 단위 테스트: override-matcher.test.ts
   - E2E 테스트: playground에 오버라이드 예제

5. **문서 업데이트** (30분)
   - README.md 사용법 추가
   - CLAUDE.md 개발 가이드 업데이트

---

## Feature 2: 에러 시뮬레이션 (조건부 응답)

### 목표
프론트엔드 에러 핸들링 테스트를 위한 다양한 에러 응답 시뮬레이션

### 사용 시나리오
1. 네트워크 지연 테스트 (로딩 스피너)
2. 4xx/5xx 에러 핸들링 테스트
3. 간헐적 에러 (flaky API) 시뮬레이션
4. Rate limiting 테스트

### API 설계

**방법 1: 헤더 기반 제어**

```typescript
// 클라이언트에서 헤더로 제어
await $fetch('/mock/users', {
  headers: {
    'X-Mock-Status': '500',           // 강제 에러 상태
    'X-Mock-Delay': '2000',           // 2초 지연
    'X-Mock-Error': 'timeout',        // 에러 타입
    'X-Mock-Fail-Rate': '0.3',        // 30% 확률로 실패
  }
})
```

**방법 2: 설정 기반 시나리오**

```typescript
// nuxt.config.ts
mock: {
  scenarios: {
    // 전역 시나리오
    slowNetwork: {
      delay: { min: 500, max: 2000 }
    },

    // 경로별 시나리오
    authError: {
      paths: ['/users/*', '/orders/*'],
      probability: 0.1,  // 10% 확률
      response: { _status: 401, error: 'Unauthorized' }
    },

    serverDown: {
      enabled: false,  // 수동 활성화
      response: { _status: 503, error: 'Service unavailable' }
    }
  },

  // 활성화할 시나리오
  activeScenarios: ['slowNetwork']
}
```

**방법 3: 런타임 API**

```typescript
// POST /mock/__scenario 로 시나리오 제어
await $fetch('/mock/__scenario', {
  method: 'POST',
  body: {
    enable: ['slowNetwork', 'authError'],
    disable: ['serverDown']
  }
})

// GET /mock/__scenario 로 현재 상태 조회
const status = await $fetch('/mock/__scenario')
// { active: ['slowNetwork', 'authError'], available: [...] }
```

### 타입 정의

```typescript
// src/types.ts 추가

/**
 * Mock 시나리오 설정
 */
export interface MockScenarioConfig {
  /** 시나리오 ID */
  id?: string
  /** 활성화 여부 */
  enabled?: boolean
  /** 적용 대상 경로 (glob 패턴) */
  paths?: string[]
  /** 적용 확률 (0-1) */
  probability?: number
  /** 응답 지연 */
  delay?: number | { min: number; max: number }
  /** 강제 응답 */
  response?: MockOverrideStatic
}

export interface MockScenariosConfig {
  [scenarioName: string]: MockScenarioConfig
}

/**
 * 에러 시뮬레이션 헤더
 */
export interface MockSimulationHeaders {
  'X-Mock-Status'?: string      // HTTP 상태 코드
  'X-Mock-Delay'?: string       // 지연 시간 (ms)
  'X-Mock-Error'?: string       // 에러 타입: 'timeout' | 'network' | 'validation'
  'X-Mock-Fail-Rate'?: string   // 실패 확률 (0-1)
  'X-Mock-Scenario'?: string    // 활성화할 시나리오
}
```

### 구현 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/types.ts` | MockScenarioConfig 타입 추가 |
| `src/module.ts` | scenarios 옵션 처리 |
| `src/runtime/server/utils/scenario-manager.ts` | 신규: 시나리오 상태 관리 |
| `src/runtime/server/handlers/scenario.ts` | 신규: /mock/__scenario 핸들러 |
| `src/runtime/server/handlers/openapi.ts` | 시나리오/헤더 기반 에러 처리 |
| `src/runtime/server/middleware/mock-headers.ts` | 신규: X-Mock-* 헤더 처리 |

### 구현 순서

1. **타입 정의** (30분)
   - MockScenarioConfig 타입 추가
   - MockSimulationHeaders 인터페이스

2. **시나리오 매니저 구현** (1.5시간)
   - 메모리 기반 시나리오 상태 저장
   - 활성화/비활성화 로직
   - 확률 기반 트리거

3. **헤더 미들웨어 구현** (1시간)
   - X-Mock-* 헤더 파싱
   - 지연 처리 (setTimeout)
   - 에러 응답 생성

4. **시나리오 API 핸들러** (1시간)
   - GET /mock/__scenario
   - POST /mock/__scenario

5. **핸들러 통합** (1시간)
   - openapi.ts, rpc.ts에 시나리오 체크 추가

6. **테스트 작성** (1시간)
   - 시나리오 매니저 단위 테스트
   - E2E: 에러 시뮬레이션 테스트

---

## Feature 3: API Explorer 개선

### 목표
현재 기본적인 API Explorer를 실용적인 개발 도구로 개선

### 현재 상태
- 기본 엔드포인트 목록 표시
- 간단한 요청 실행
- 응답 뷰어

### 개선 사항

#### 3.1 UI/UX 개선

```vue
<!-- 개선된 ApiExplorer.vue -->
<template>
  <div class="api-explorer">
    <!-- 검색 및 필터 -->
    <div class="toolbar">
      <input v-model="search" placeholder="Search endpoints..." />
      <select v-model="methodFilter">
        <option value="">All Methods</option>
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <!-- ... -->
      </select>
      <select v-model="tagFilter">
        <option value="">All Tags</option>
        <option v-for="tag in tags" :value="tag">{{ tag }}</option>
      </select>
    </div>

    <!-- 엔드포인트 그룹 -->
    <div class="endpoint-groups">
      <details v-for="group in groupedEndpoints" :open="group.isOpen">
        <summary>{{ group.tag }} ({{ group.endpoints.length }})</summary>
        <EndpointCard
          v-for="ep in group.endpoints"
          :endpoint="ep"
          @execute="handleExecute"
        />
      </details>
    </div>

    <!-- 요청 히스토리 -->
    <div class="history-panel">
      <h3>Request History</h3>
      <div v-for="item in history" class="history-item">
        <span :class="item.method">{{ item.method }}</span>
        <span>{{ item.path }}</span>
        <span :class="item.status >= 400 ? 'error' : 'success'">
          {{ item.status }}
        </span>
      </div>
    </div>
  </div>
</template>
```

#### 3.2 요청 빌더 개선

```typescript
interface RequestBuilder {
  // Path 파라미터 자동 감지 및 입력 UI
  pathParams: { name: string; value: string; required: boolean }[]

  // Query 파라미터 (스키마 기반 타입 힌트)
  queryParams: { name: string; value: string; type: string }[]

  // Request Body (JSON 에디터)
  body: string  // JSON string with syntax highlighting

  // Headers
  headers: { name: string; value: string }[]

  // 시뮬레이션 옵션
  simulation: {
    delay?: number
    forceStatus?: number
    scenario?: string
  }
}
```

#### 3.3 응답 뷰어 개선

```vue
<template>
  <div class="response-viewer">
    <!-- 탭: Body | Headers | Timing -->
    <div class="tabs">
      <button @click="activeTab = 'body'">Body</button>
      <button @click="activeTab = 'headers'">Headers</button>
      <button @click="activeTab = 'timing'">Timing</button>
    </div>

    <!-- Body 탭: JSON 트리 뷰어 -->
    <div v-if="activeTab === 'body'" class="body-viewer">
      <div class="toolbar">
        <button @click="expandAll">Expand All</button>
        <button @click="collapseAll">Collapse All</button>
        <button @click="copyToClipboard">Copy</button>
        <button @click="downloadJson">Download</button>
      </div>
      <JsonTreeView :data="response.body" />
    </div>

    <!-- Headers 탭 -->
    <div v-if="activeTab === 'headers'" class="headers-viewer">
      <table>
        <tr v-for="[key, value] in Object.entries(response.headers)">
          <td>{{ key }}</td>
          <td>{{ value }}</td>
        </tr>
      </table>
    </div>

    <!-- Timing 탭 -->
    <div v-if="activeTab === 'timing'" class="timing-viewer">
      <div>Request Time: {{ timing.total }}ms</div>
      <div>Size: {{ formatBytes(response.size) }}</div>
    </div>
  </div>
</template>
```

### 구현 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/runtime/components/ApiExplorer.vue` | 전체 리팩토링 |
| `src/runtime/components/EndpointCard.vue` | 요청 빌더 개선 |
| `src/runtime/components/ResponseViewer.vue` | 탭 UI, JSON 트리 뷰어 |
| `src/runtime/components/JsonTreeView.vue` | 신규: 접이식 JSON 뷰어 |
| `src/runtime/components/RequestHistory.vue` | 신규: 요청 히스토리 |
| `src/runtime/components/styles/explorer.css` | 신규: 스타일 통합 |

### 구현 순서

1. **JsonTreeView 컴포넌트** (2시간)
   - 재귀적 JSON 렌더링
   - 접기/펼치기 기능
   - 타입별 색상 하이라이팅

2. **RequestHistory 컴포넌트** (1시간)
   - localStorage 기반 저장
   - 히스토리 항목 재실행

3. **EndpointCard 개선** (2시간)
   - 파라미터 자동 감지
   - 타입 기반 입력 UI
   - 시뮬레이션 옵션 UI

4. **ResponseViewer 개선** (1.5시간)
   - 탭 UI 구현
   - 헤더/타이밍 표시
   - 복사/다운로드 기능

5. **ApiExplorer 통합** (2시간)
   - 검색/필터 기능
   - 태그별 그룹핑
   - 레이아웃 개선

6. **스타일링** (1시간)
   - Tailwind 없이 순수 CSS
   - 다크모드 지원
   - 반응형 레이아웃

---

## 구현 우선순위 및 일정

### Phase 1: Mock Control (v1.1.0)

| 순서 | 기능 | 예상 시간 | 우선순위 |
|------|------|----------|---------|
| 1 | Mock 데이터 오버라이드 | 5시간 | **High** |
| 2 | 에러 시뮬레이션 (헤더 기반) | 4시간 | **High** |
| 3 | 에러 시뮬레이션 (시나리오 API) | 2시간 | Medium |

### Phase 2: Developer Experience (v1.2.0)

| 순서 | 기능 | 예상 시간 | 우선순위 |
|------|------|----------|---------|
| 4 | API Explorer 개선 | 10시간 | Medium |
| 5 | 문서 및 예제 강화 | 2시간 | Low |

### Phase 3: Proto Enhancement (v1.3.0)

| 순서 | 기능 | 예상 시간 | 우선순위 |
|------|------|----------|---------|
| 6 | Well-known Types | 3시간 | Medium |
| 7 | Server Streaming (SSE) | 6시간 | Low |

---

## 기술적 고려사항

### 오버라이드 매칭 알고리즘

```typescript
// 경로 패턴 매칭 우선순위
1. 완전 일치: '/users/admin' > '/users/:id'
2. 더 구체적인 패턴: '/users/:id/orders' > '/users/:id'
3. 먼저 정의된 패턴
```

### 시나리오 상태 관리

```typescript
// 서버 재시작 시에도 유지하려면 파일 기반 저장 옵션
interface ScenarioStore {
  memory: Map<string, boolean>  // 기본
  file?: string                  // 옵션: .mock-scenarios.json
}
```

### API Explorer 번들 크기

```
현재: ~15KB (gzipped)
목표: ~25KB (JsonTreeView 추가 시)
```

---

## 검증 체크리스트

### Feature 1: 오버라이드
- [ ] 정적 오버라이드 동작
- [ ] 함수형 오버라이드 동작
- [ ] 조건부 오버라이드 동작
- [ ] _status 메타 필드 처리
- [ ] _delay 메타 필드 처리
- [ ] null 반환 시 폴백

### Feature 2: 에러 시뮬레이션
- [ ] X-Mock-Status 헤더 동작
- [ ] X-Mock-Delay 헤더 동작
- [ ] X-Mock-Fail-Rate 확률 동작
- [ ] 시나리오 API 동작
- [ ] 시나리오 활성화/비활성화

### Feature 3: API Explorer
- [ ] 검색 기능
- [ ] 필터 기능
- [ ] JSON 트리 뷰어
- [ ] 요청 히스토리
- [ ] 복사/다운로드

---

## 다음 단계

1. **Feature 1부터 시작** - 가장 실용적이고 사용자 요청 많음
2. **테스트 주도 개발** - 각 기능별 테스트 먼저 작성
3. **점진적 릴리스** - 기능별로 마이너 버전 릴리스
