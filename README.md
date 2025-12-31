# Mock-Fried

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![CI][ci-src]][ci-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt 3 Mock API Module - OpenAPI & Protobuf RPC Mock Server

## Features

- **OpenAPI Mock Server** - OpenAPI 스펙 기반 자동 Mock 응답 생성
- **Protobuf RPC Mock** - Proto 파일 기반 gRPC-style RPC Mock
- **Deterministic Data** - 동일한 요청에 대해 일관된 Mock 데이터 반환
- **Pagination Support** - 페이지 기반 / 커서 기반 페이지네이션 지원
- **API Explorer** - Swagger UI 스타일의 인터랙티브 API 테스트 UI
- **Type-Safe Client** - `$api` 클라이언트로 타입 안전한 API 호출
- **Zero Config** - 스펙 파일만 있으면 즉시 사용 가능

## Quick Setup

```bash
# npm
npm install mock-fried

# yarn
yarn add mock-fried

# pnpm
pnpm add mock-fried
```

`nuxt.config.ts`에 모듈 추가:

```typescript
export default defineNuxtConfig({
  modules: ['mock-fried'],

  mock: {
    enable: true,
    prefix: '/mock',
    openapi: './mocks/openapi.yaml',  // OpenAPI 스펙 경로
    proto: './mocks/example.proto',    // Proto 파일 경로 (optional)
  },
})
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enable` | `boolean` | `true` | Mock 기능 활성화 |
| `prefix` | `string` | `'/mock'` | API 라우트 prefix |
| `openapi` | `string \| object` | - | OpenAPI 스펙 파일 경로 또는 클라이언트 패키지 설정 |
| `proto` | `string` | - | Proto 파일 경로 |
| `pagination` | `object` | - | 페이지 기반 페이지네이션 설정 |
| `cursor` | `object` | - | 커서 기반 페이지네이션 설정 |

### OpenAPI 설정 옵션

**1. 스펙 파일 직접 사용:**

```typescript
mock: {
  // 상대 경로
  openapi: './mocks/openapi.yaml',

  // 절대 경로
  openapi: '/path/to/openapi.yaml',

  // npm 패키지 내 스펙 파일
  openapi: '@your-org/api-spec/openapi.yaml',
}
```

**2. 생성된 클라이언트 패키지 사용 (권장):**

```typescript
mock: {
  // openapi-generator로 생성된 TypeScript 클라이언트 패키지
  openapi: {
    package: '@your-org/api-client',
    apisDir: 'src/apis',      // optional, default: 'src/apis'
    modelsDir: 'src/models',  // optional, default: 'src/models'
  },
}
```

생성된 클라이언트 패키지를 사용하면:

- 정확한 타입 기반 Mock 데이터 생성
- 실제 API 응답 구조와 일치하는 Mock 응답
- snake_case/camelCase JSON 키 변환 자동 처리

### Pagination 설정

**페이지 기반 페이지네이션:**

```typescript
mock: {
  openapi: { package: '@your-org/api-client' },
  pagination: {
    defaultLimit: 20,        // 기본 페이지 크기
    maxLimit: 100,           // 최대 페이지 크기
    totalItems: 100,         // 전체 아이템 수
  },
}
```

**커서 기반 페이지네이션:**

```typescript
mock: {
  openapi: { package: '@your-org/api-client' },
  cursor: {
    defaultLimit: 20,
    maxLimit: 100,
    totalItems: 100,
  },
}
```

## Usage

### 직접 HTTP 호출 (권장)

Mock 서버는 Nitro 핸들러로 동작하므로, Nuxt의 `useFetch`나 `$fetch`로 직접 호출할 수 있습니다.
기존 API 클라이언트가 있다면 baseURL만 `/mock`으로 변경하여 사용하세요.

```typescript
// useFetch 사용 (SSR 지원)
const { data: users } = await useFetch('/mock/users')
const { data: user } = await useFetch('/mock/users/123')

// $fetch 사용
const products = await $fetch('/mock/products', {
  query: { page: 1, limit: 10 }
})

// 커서 기반 페이지네이션
const items = await $fetch('/mock/items', {
  query: { cursor: 'abc123', limit: 20 }
})

// POST 요청
const newUser = await $fetch('/mock/users', {
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' }
})
```

### useApi Composable

auto-import 되는 `useApi` composable로 타입 안전한 호출이 가능합니다.

```typescript
// useApi는 auto-import됨
const api = useApi()

// REST 호출
const users = await api.rest('/users')
const user = await api.rest('/users/123')

// Query 파라미터
const products = await api.rest('/products', {
  params: { page: 1, limit: 10 }
})

// POST 요청
const newUser = await api.rest('/users', {
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' }
})
```

### RPC (Protobuf)

```typescript
const api = useApi()

// 명시적 RPC 호출
const user = await api.rpc('UserService', 'GetUser', { id: 1 })

// 동적 서비스 접근
const user = await api.UserService.GetUser({ id: 1 })
const products = await api.ProductService.ListProducts({ page: 1, limit: 10 })

// 또는 직접 $fetch 사용
const result = await $fetch('/mock/rpc/UserService/GetUser', {
  method: 'POST',
  body: { id: 1 }
})
```

### API Schema 조회

```typescript
const api = useApi()

// 전체 스키마 조회
const schema = await api.getSchema()
// { openapi: {...}, rpc: {...} }

// 또는 직접 호출
const schema = await $fetch('/mock/__schema')
```

### 캐시 초기화

개발 중 설정 변경 시 캐시를 초기화하려면:

```typescript
// POST 요청으로 캐시 초기화
await $fetch('/mock/__reset', { method: 'POST' })
```

## Deterministic Mock Data

Mock-Fried는 **결정론적(deterministic)** Mock 데이터를 생성합니다:

- 동일한 엔드포인트 + path 파라미터 조합은 항상 동일한 데이터 반환
- 예: `/users/1`과 `/users/2`는 각각 다른 일관된 데이터 반환
- 서버 재시작 후에도 동일한 데이터 유지

이를 통해:
- 프론트엔드 개발 시 예측 가능한 테스트
- E2E 테스트에서 안정적인 데이터 검증
- UI 스냅샷 테스트 지원

## API Explorer

모듈에 포함된 API Explorer 컴포넌트로 Swagger UI 스타일의 인터페이스 제공:

```vue
<template>
  <MockApiExplorer
    title="My API Explorer"
    description="Interactive API Testing"
  />
</template>
```

### 포함된 컴포넌트

| Component | Description |
|-----------|-------------|
| `<MockApiExplorer>` | 메인 API 탐색기 |
| `<MockEndpointCard>` | REST 엔드포인트 카드 |
| `<MockRpcMethodCard>` | RPC 메서드 카드 |
| `<MockResponseViewer>` | 응답 뷰어 모달 |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mock/__schema` | GET | API 스키마 메타데이터 |
| `/mock/__reset` | POST | 캐시 초기화 |
| `/mock/rpc/:service/:method` | POST | RPC Mock 핸들러 |
| `/mock/**` | * | OpenAPI Mock 핸들러 |

## Implementation Coverage

### OpenAPI Mock (✅ Production Ready)

| Feature | Status | Description |
|---------|--------|-------------|
| Path Parameter | ✅ | `/users/{id}` → `/users/123` 매칭 |
| Query Parameter | ✅ | `?page=1&limit=10` 파싱 |
| Path Specificity | ✅ | 더 구체적인 경로 우선 매칭 |
| Page Pagination | ✅ | page/limit 기반 페이지네이션 |
| Cursor Pagination | ✅ | cursor 기반 무한 스크롤 |
| Deterministic Data | ✅ | 동일 요청 = 동일 응답 |
| Client Package Mode | ✅ | 생성된 TS 클라이언트 파싱 |
| Spec File Mode | ✅ | YAML/JSON OpenAPI 스펙 |
| Generic Types | ✅ | `Array<User>`, `PageResponse<T>` |
| JSON Key Mapping | ✅ | snake_case ↔ camelCase |
| Request Body | ✅ | POST/PUT/PATCH body 처리 |
| All HTTP Methods | ✅ | GET, POST, PUT, DELETE, PATCH |

### Protobuf RPC Mock (✅ Production Ready)

| Feature | Status | Description |
|---------|--------|-------------|
| Unary RPC | ✅ | 단일 요청-응답 |
| Service Routing | ✅ | `/rpc/:service/:method` |
| Proto File Parsing | ✅ | .proto 파일 로드 |
| Basic Types | ✅ | string, int32/64, float, double, bool |
| Enum Types | ✅ | 첫 번째 enum 값 반환 |
| Nested Messages | ✅ | 중첩 메시지 타입 |
| Repeated Fields | ✅ | 배열 필드 (자동 생성) |
| Map Fields | ✅ | map 타입 지원 |
| Page Pagination | ✅ | page/limit 기반 페이지네이션 |
| Cursor Pagination | ✅ | cursor 기반 무한 스크롤 |
| Deterministic Data | ✅ | 동일 요청 = 동일 응답 |
| Server Streaming | ❌ | 미구현 |
| Client Streaming | ❌ | 미구현 |
| Bidirectional Streaming | ❌ | 미구현 |

### 구현 예정 (Roadmap)

Proto RPC 기능 확장:

- [ ] Server streaming 지원
- [ ] Well-known types (Timestamp, Duration 등)

## Compatibility

| Environment | Support | Notes |
|-------------|---------|-------|
| Node.js Server | ✅ | 기본 대상 |
| Nuxt 3/4 | ✅ | 테스트됨 |
| Nitro SSR | ✅ | 번들 환경 지원 |
| Edge Runtime | ❌ | fs 모듈 필요 |

**요구사항:**
- Node.js 18+
- Nuxt 3.0+

## Development

```bash
# Install dependencies
yarn install

# Generate type stubs
yarn dev:prepare

# Prepare all playgrounds
yarn dev:prepare:playground

# Develop with OpenAPI Spec File Mode
yarn dev:openapi

# Develop with OpenAPI Client Package Mode
yarn dev:openapi-client

# Develop with Proto playground
yarn dev:proto

# Run ESLint
yarn lint
yarn lint:fix

# Format with Prettier
yarn format

# Run tests
yarn test
yarn test:watch

# Type check
yarn test:types
```

## Project Structure

```
mock-fried/
├── src/
│   ├── module.ts              # 모듈 엔트리
│   ├── types.ts               # 타입 정의
│   └── runtime/
│       ├── plugin.ts          # $api 클라이언트 플러그인
│       ├── composables/       # useApi composable
│       ├── components/        # API Explorer 컴포넌트
│       └── server/
│           ├── handlers/      # Nitro 서버 핸들러
│           └── utils/         # Mock 데이터 생성 유틸
├── packages/                  # 샘플 패키지 (CI + Playground 공용)
│   ├── sample-openapi/        # OpenAPI 스펙 파일 (Spec File Mode)
│   ├── openapi-client/        # openapi-generator 출력 (Client Package Mode)
│   └── sample-proto/          # Proto 파일 샘플
├── playground-openapi/        # Spec File Mode 테스트
├── playground-openapi-client/ # Client Package Mode 테스트
├── playground-proto/          # Proto RPC 테스트
└── test/                      # E2E 테스트
```

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/mock-fried/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/mock-fried

[npm-downloads-src]: https://img.shields.io/npm/dm/mock-fried.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/mock-fried

[ci-src]: https://img.shields.io/github/actions/workflow/status/TaeGyumKim/mock-fried/ci.yml?branch=main&style=flat&colorA=020420&colorB=00DC82
[ci-href]: https://github.com/TaeGyumKim/mock-fried/actions/workflows/ci.yml

[license-src]: https://img.shields.io/npm/l/mock-fried.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/mock-fried

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
