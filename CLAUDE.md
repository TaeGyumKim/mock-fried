# Mock-Fried 프로젝트 가이드

## 프로젝트 개요

Nuxt 3 Mock API 모듈 - OpenAPI (3.x & Swagger 2.0) 및 Protobuf RPC Mock 서버

## 기술 스택

- **Framework**: Nuxt 3 Module
- **Runtime**: Nitro (h3 서버 핸들러)
- **Package Manager**: Yarn Berry (node-modules linker)
- **Language**: TypeScript
- **Test**: Vitest
- **CI/CD**: GitHub Actions

## 프로젝트 구조

```
mock-fried/
├── src/
│   ├── module.ts              # Nuxt 모듈 엔트리
│   ├── types.ts               # 타입 정의
│   └── runtime/
│       ├── plugin.ts          # $api 클라이언트 플러그인
│       ├── composables/       # useApi composable
│       ├── components/        # API Explorer 컴포넌트
│       └── server/
│           ├── handlers/      # Nitro 서버 핸들러
│           │   ├── openapi/   # OpenAPI Mock 핸들러 (모듈화)
│           │   │   ├── index.ts      # 메인 라우터
│           │   │   ├── spec-mode.ts  # Spec File Mode
│           │   │   └── client-mode.ts # Client Package Mode
│           │   ├── rpc.ts     # Proto RPC 핸들러
│           │   ├── schema.ts  # 스키마 메타데이터
│           │   └── reset.ts   # 캐시 초기화
│           └── utils/
│               ├── proto-utils.ts     # Proto 공유 유틸리티
│               ├── cache-manager.ts   # 캐시 중앙 관리
│               ├── pagination-factory.ts # Pagination 팩토리
│               ├── mock/      # Mock 데이터 생성
│               │   ├── client-generator.ts  # Client Package Mode Mock 생성
│               │   ├── openapi-generator.ts # OpenAPI 스키마 기반 Mock 생성
│               │   ├── proto-generator.ts   # Proto 메시지 기반 Mock 생성
│               │   ├── shared.ts            # 공유 유틸 (hashString, seededRandom)
│               │   ├── pagination/          # Pagination 모듈
│               │   │   ├── interfaces/      # ItemProvider, IdGenerator 인터페이스
│               │   │   ├── cursor-manager.ts # Cursor 기반 페이지네이션
│               │   │   ├── page-manager.ts   # Page 기반 페이지네이션
│               │   │   └── snapshot-store.ts # 스냅샷 저장소
│               │   └── providers/           # ItemProvider 구현체
│               │       ├── schema-item-provider.ts  # Client Package Mode
│               │       ├── openapi-item-provider.ts # Spec File Mode
│               │       └── proto-item-provider.ts   # Proto Mode
│               └── client-parser.ts  # TS 클라이언트 패키지 파서
├── packages/                  # 샘플 패키지 (CI + Playground 공용)
│   ├── sample-openapi/        # OpenAPI 3.x 스펙 파일 (Spec File Mode 테스트)
│   ├── sample-swagger/        # Swagger 2.0 스펙 파일 (Swagger 지원 테스트)
│   ├── openapi-client/        # openapi-generator 출력 (Client Package Mode 테스트)
│   └── sample-proto/          # Proto 파일 샘플 (UserService, ProductService)
├── playground-openapi/        # OpenAPI 3.x Spec File Mode 테스트 환경
├── playground-swagger/        # Swagger 2.0 Spec File Mode 테스트 환경
├── playground-openapi-client/ # Client Package Mode 테스트 환경 (생성된 클라이언트 사용)
├── playground-proto/          # Proto 테스트 환경
└── test/                      # E2E 테스트
    └── fixtures/              # 테스트용 Nuxt 앱
```

## 주요 파일 설명

### 핸들러 (src/runtime/server/handlers/)

| 파일 | 역할 | 엔드포인트 |
|------|------|-----------|
| `openapi/index.ts` | OpenAPI 메인 라우터 | `GET/POST/... /mock/**` |
| `openapi/spec-mode.ts` | Spec File Mode 처리 | - |
| `openapi/client-mode.ts` | Client Package Mode 처리 | - |
| `rpc.ts` | Proto RPC Mock 응답 | `POST /mock/rpc/:service/:method` |
| `schema.ts` | API 스키마 메타데이터 | `GET /mock/__schema` |
| `reset.ts` | 캐시 초기화 | `POST /mock/__reset` |

### 공유 유틸리티 (src/runtime/server/utils/)

| 파일 | 역할 |
|------|------|
| `proto-utils.ts` | Proto 유틸 (PROTO_TYPE_MAP, findProtoFiles, getProtoTypeName) |
| `cache-manager.ts` | 캐시 중앙 관리 (MockCacheManager 싱글톤) |
| `pagination-factory.ts` | Pagination Manager 팩토리 함수 |
| `spec-loader.ts` | OpenAPI/Swagger 스펙 로딩 (버전 감지, 변환, $ref dereference) |

### Mock 유틸 (src/runtime/server/utils/mock/)

| 파일 | 역할 |
|------|------|
| `client-generator.ts` | Client Package Mode Mock 데이터 생성 |
| `openapi-generator.ts` | OpenAPI 스키마 기반 Mock 데이터 생성 |
| `proto-generator.ts` | Proto 메시지 기반 Mock 데이터 생성 |
| `shared.ts` | 공유 유틸 (hashString, seededRandom, generateIdValue) |

### Pagination 모듈 (src/runtime/server/utils/mock/pagination/)

| 파일 | 역할 |
|------|------|
| `interfaces/` | ItemProvider, IdGenerator 인터페이스 정의 |
| `cursor-manager.ts` | Cursor 기반 페이지네이션 (ID 기반 연결 cursor) |
| `page-manager.ts` | Page/Limit 기반 페이지네이션 |
| `snapshot-store.ts` | 스냅샷 저장소 (데이터 일관성 보장) |
| `types.ts` | Pagination 관련 타입 정의 |

### ItemProvider 구현체 (src/runtime/server/utils/mock/providers/)

| 파일 | 역할 |
|------|------|
| `schema-item-provider.ts` | Client Package Mode용 - SchemaMockGenerator 래핑 |
| `openapi-item-provider.ts` | Spec File Mode용 - OpenAPI 스키마 기반 |
| `proto-item-provider.ts` | Proto Mode용 - Protobuf 메시지 기반 |

## 개발 명령어

```bash
yarn install                # 의존성 설치
yarn dev:prepare            # 타입 스텁 생성 (CI용)
yarn dev:prepare:playground # 모든 playground 준비 (로컬용)
yarn dev:openapi            # OpenAPI 3.x Spec File Mode playground 실행
yarn dev:swagger            # Swagger 2.0 Spec File Mode playground 실행
yarn dev:openapi-client     # Client Package Mode playground 실행
yarn dev:proto              # Proto playground 실행
yarn lint                   # ESLint 검사
yarn lint:fix               # ESLint 자동 수정
yarn test                   # 전체 테스트 실행
yarn test:unit              # 단위 테스트만
yarn test:e2e               # E2E 테스트만
yarn test:coverage          # 커버리지 리포트 생성
yarn test:watch             # 테스트 watch 모드
yarn prepack                # 빌드
```

## CI/CD 파이프라인

### GitHub Actions 워크플로우

**CI Pipeline** (`.github/workflows/ci.yml`):

```text
lint → type-check
     ↘ build → test (unit)
              ↘ e2e-test (matrix: openapi, swagger, openapi-client, proto, proto-advanced)
              ↘ playground (빌드 검증)
```

**Release Please** (`.github/workflows/release-please.yml`):

```text
main push → Release Please Action
              ↓
         Release PR 자동 생성/업데이트
              ↓
         PR 머지 시 → npm publish (provenance)
```

**CodeQL Security Scan** (`.github/workflows/codeql.yml`):

```text
주간 보안 취약점 스캔 (JavaScript/TypeScript)
```

**Dependabot** (`.github/dependabot.yml`):

```text
주간 의존성 업데이트 (npm + GitHub Actions)
```

### Release Please 워크플로우 상세

이 프로젝트는 **Release Please**를 사용하여 자동화된 릴리즈 관리를 합니다.

#### 동작 방식

1. **커밋 푸시**: main 브랜치에 Conventional Commits 형식으로 커밋
2. **PR 자동 생성**: Release Please가 릴리즈 PR 자동 생성 (`release-please--branches--main`)
3. **버전 결정**: 커밋 메시지 분석하여 버전 자동 결정
   - `fix:` → patch (1.0.0 → 1.0.1)
   - `feat:` → minor (1.0.0 → 1.1.0)
   - `feat!:` 또는 `BREAKING CHANGE:` → major (1.0.0 → 2.0.0)
4. **PR 머지**: 릴리즈 PR 머지 시 자동으로:
   - GitHub Release 생성
   - npm publish 실행
   - CHANGELOG.md 업데이트

#### 주요 장점

| 항목 | 설명 |
|------|------|
| **자동화** | PR 머지만 하면 릴리즈 완료 |
| **버전 관리** | Conventional Commits 기반 자동 버전 결정 |
| **CHANGELOG** | 자동 생성 및 업데이트 |
| **롤백** | git revert + 새 릴리즈로 간단히 롤백 |
| **Provenance** | npm provenance 서명으로 보안 강화 |

#### 관련 파일

| 파일 | 역할 |
|------|------|
| `.github/workflows/release-please.yml` | Release Please 워크플로우 |
| `release-please-config.json` | 릴리즈 설정 (타입, 컴포넌트) |
| `.release-please-manifest.json` | 현재 버전 추적 |
| `CHANGELOG.md` | 자동 생성된 변경 이력 |

#### GitHub Repository 설정 필수

1. **Settings → Actions → General**:
   - "Allow GitHub Actions to create and approve pull requests" 활성화

2. **Settings → Secrets and variables → Actions**:
   - `NPM_TOKEN`: npm access token (publish 권한 필요)

### 버전 관리 및 롤백

#### npm 버전 롤백

문제 발생 시 이전 버전으로 롤백하는 방법:

```bash
# 1. 문제 커밋 revert
git revert <commit-hash>
git push origin main

# 2. Release Please가 새 patch 버전 PR 생성
# 3. PR 머지하면 새 버전이 npm에 게시됨

# (긴급) npm unpublish (72시간 이내)
npm unpublish mock-fried@1.0.5
```

#### 특정 버전 설치 (사용자 측)

```bash
# 특정 버전 고정
npm install mock-fried@1.0.4

# package.json에서 버전 고정
"mock-fried": "1.0.4"  # exact version
"mock-fried": "~1.0.4" # patch updates only
```

### Workspaces 구성

- `packages/*` - 샘플 패키지 (CI + Playground 공용)
- `playground-*` - Yarn workspace에서 제외 (`link:` 프로토콜로 packages 참조)

### 샘플 패키지

| 패키지 | 용도 | 내용 |
|--------|------|------|
| `@mock-fried/sample-openapi` | OpenAPI 3.x Spec File Mode 테스트 | openapi.yaml (7 API 그룹, 43개 엔드포인트) |
| `@mock-fried/sample-swagger` | Swagger 2.0 Spec File Mode 테스트 | swagger.yaml (9 API 그룹, 50개 엔드포인트) |
| `@mock-fried/openapi-client` | Client Package Mode 테스트 | openapi-generator 출력 (동일 스펙 기반) |
| `@mock-fried/sample-proto` | Proto RPC 테스트용 | example.proto (7 서비스, 37 메서드) |

**Mock 모드 설명**:

- **Spec File Mode**: OpenAPI 3.x 또는 Swagger 2.0 YAML/JSON 파일에서 직접 Mock 엔드포인트 생성
- **Client Package Mode**: openapi-generator 출력 패키지를 파싱하여 Mock 엔드포인트 생성

### Proto RPC 서비스 구성 (sample-proto)

| 서비스 | 메서드 수 | 주요 기능 |
| ------ | -------- | -------- |
| UserService | 5 | CRUD, 페이지네이션, 검색 |
| ProductService | 4 | CRUD, 페이지네이션, 검색 |
| OrderService | 4 | CRUD, 중첩 메시지 |
| PostService | 3 | 커서 기반 페이지네이션 |
| CommentService | 2 | 중첩 리소스 패턴 |
| HealthService | 3 | 헬스체크, 버전, ping |
| AdvancedService | 16 | 심화 타입 (재귀, Map, Enum 등) |

### OpenAPI 스펙 구성 (sample-openapi, openapi-client 동일)

| API 그룹 | 엔드포인트 수 | 주요 기능 |
|----------|-------------|----------|
| Users | 5 | CRUD, 페이지네이션, 필터링 |
| Products | 3 | CRUD, 페이지네이션 |
| Orders | 3 | CRUD, 중첩 구조 |
| Posts | 3 | 커서 기반 페이지네이션 |
| Comments | 2 | 중첩 리소스 |
| Health | 4 | 헬스체크, 버전, ping, tags |
| EdgeCases | 18 | 다양한 스키마 테스트 |

**EdgeCases 엔드포인트**:
- Primitive 응답 (integer, string, boolean)
- 다중 경로 파라미터 (2개, 3개)
- 직접 배열 응답 (객체, 문자열)
- Nullable 필드
- Schema Composition (allOf)
- Polymorphic Types (oneOf with discriminator)
- Deeply Nested Objects
- Recursive Schema (self-reference)
- 다양한 수치형 (int32, int64, float, double)
- Date 형식 (date, date-time)
- Min/Max 제약조건
- Map/Dictionary (additionalProperties)
- 204 No Content 응답

## 구현 현황

### OpenAPI Mock (✅ Production Ready)

- Path/Query 파라미터 파싱
- Page/Cursor 페이지네이션
- Deterministic 데이터 생성
- Client Package / Spec File 모드
- Generic 타입, JSON 키 매핑
- **Swagger 2.0 지원** (자동 OpenAPI 3.0 변환)

### Protobuf RPC Mock (✅ Production Ready)

- Unary RPC 지원
- Page/Cursor 페이지네이션 (자동 감지)
- Deterministic 데이터 생성
- repeated 필드 자동 감지

## Cursor Pagination 설정

### 역방향 페이지네이션 (isBackward)

Cursor 기반 페이지네이션에서 역방향 탐색을 지원합니다.

#### 설정

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  mock: {
    cursor: {
      backwardParam: 'isBackward', // 기본값: 'isBackward'
    },
  },
})
```

#### 우선순위 규칙

1. **cursor 있음 + isBackward**: query param이 cursor 내부 direction을 오버라이드
2. **cursor 없음 + isBackward=true**: 끝에서부터 시작 (역방향)
3. **cursor 없음 + isBackward 없음**: 처음부터 시작 (정방향, 기본)

#### 사용 예시

```bash
# 첫 페이지 역방향 (끝에서 시작)
GET /mock/posts?limit=10&isBackward=true

# cursor로 계속 탐색 (cursor 내부 direction 사용)
GET /mock/posts?cursor=xxx&limit=10

# cursor direction 오버라이드 (역방향으로 전환)
GET /mock/posts?cursor=xxx&limit=10&isBackward=true

# 커스텀 파라미터명 (config: backwardParam: 'reverse')
GET /mock/posts?limit=10&reverse=true
```

#### RPC 지원

Proto RPC에서는 request body에서 파라미터를 추출합니다:

```typescript
// camelCase
{ cursor: 'xxx', limit: 10, isBackward: true }

// snake_case
{ cursor: 'xxx', limit: 10, is_backward: true }
```

## 미구현 기능 (TODO)

### Proto RPC 확장

- [ ] Server streaming 지원
- [ ] Well-known types (Timestamp, Duration 등)

### 기타

- [ ] API Explorer 컴포넌트 개선
- [ ] Mock 데이터 오버라이드 기능
- [ ] 조건부 응답 (에러 시뮬레이션)

## 알려진 이슈 및 해결 내역

### v1.0.3 - URL 파싱 오류 수정

**문제**: 외부 환경에서 `getRequestURL(event)` 호출 시 Invalid URL 에러
**해결**: `event.path` 직접 사용으로 변경

### v1.0.4 - getQuery 오류 수정

**문제**: `getQuery(event)` 내부에서 URL 파싱 실패
**해결**: `parseQuery` (ufo 패키지) 사용으로 변경

### v1.0.5 - 번들 환경 호환성

**문제**: `createRequire(import.meta.url)` 번들 환경에서 실패
**해결**: lazy initialization + `process.cwd()` fallback

### v1.1.0 - Proto RPC 타입 처리 개선

**문제**: proto-loader가 타입/레이블을 문자열로 반환하여 Mock 생성 실패
**해결**: PROTO_TYPE_MAP에 문자열 키 추가, isRepeated 문자열 레이블 체크

### v1.1.1 - 재귀 타입 페이지네이션 오탐 수정

**문제**: TreeNode.children 같은 재귀 타입이 페이지네이션으로 오인됨
**해결**: 메타 필드(page/cursor) 없으면 페이지네이션 감지 스킵

### v1.1.2 - OpenAPI $ref 스키마 해석 수정

**문제**: 페이지네이션 응답의 items가 `$ref`로 참조된 경우 ID 필드 감지 및 Mock 생성 실패
**해결**: `resolveSchemaRef` 헬퍼 추가, `OpenAPIItemProvider`에 `schemaContext` 전달

### v1.2.0 - Swagger 2.0 지원

**추가 기능**: Swagger 2.0 스펙 파일 지원
**구현 방식**:

- `@apidevtools/swagger-parser`로 스펙 로딩/검증/$ref 해석
- `swagger2openapi`로 Swagger 2.0 → OpenAPI 3.0 자동 변환
- `spec-loader.ts` 유틸리티로 버전 감지 및 통합 처리
- `/__schema` 응답에 `_meta.specVersion` 필드 추가 (`swagger2` | `openapi3`)

## 코드 스타일

- ESLint + Prettier 사용
- `@nuxt/eslint-config` 기반
- 한글 주석 허용

## 테스트

```bash
yarn test                       # 전체 테스트 (unit + e2e)
yarn test:unit                  # 단위 테스트만
yarn test:e2e                   # E2E 테스트만
yarn test:e2e:openapi           # OpenAPI 3.x Spec File Mode E2E
yarn test:e2e:swagger           # Swagger 2.0 Spec File Mode E2E
yarn test:e2e:openapi-client    # OpenAPI Client Package Mode E2E
yarn test:e2e:proto             # Proto RPC E2E
yarn test:watch                 # watch 모드
```

테스트 파일 위치: `test/` 디렉토리

### 테스트 커버리지

| 테스트 파일 | 테스트 수 | 커버리지 |
|------------|----------|---------|
| `playground-openapi.e2e.test.ts` | 76 | OpenAPI 3.x Spec File Mode 100% |
| `playground-swagger.e2e.test.ts` | 68 | Swagger 2.0 Spec File Mode 100% |
| `playground-openapi-client.e2e.test.ts` | 78 | Client Package Mode 100% |
| `playground-openapi-client-v7.e2e.test.ts` | 28 | openapi-generator v7 호환성 |
| `playground-proto.e2e.test.ts` | 93 | Proto RPC 100% (7 서비스) |
| `playground-proto-advanced.e2e.test.ts` | 37 | AdvancedService 심화 테스트 |
| `spec-loader.test.ts` | 23 | 스펙 로더 유틸리티 테스트 |
| `refactored-utils.test.ts` | 26 | 공유 유틸리티 테스트 |
| Other unit tests | 117 | Core utilities |
| **Total** | **546** | |

### E2E 테스트 구성

두 OpenAPI E2E 테스트 파일은 동일한 구조로 동기화되어 있습니다:

- **Basic APIs**: Users, Products, Orders, Posts, Comments, Health
- **Meta Endpoints**: `__schema`, `__reset`
- **EdgeCases**: 18개 엔드포인트 (Primitive, allOf, oneOf, Recursive 등)
- **Data Consistency**: 결정론적 데이터 검증

**참고**: `test/emsp-*.test.ts` 파일은 내부 프로젝트용으로 `.gitignore`에 포함

## 배포

### npm 게시 (Release Please - 권장)

1. main 브랜치에 Conventional Commits 형식으로 커밋
2. Release Please가 자동으로 릴리즈 PR 생성
3. PR 리뷰 후 머지
4. 자동으로 GitHub Release 생성 + npm publish

```bash
# 커밋 예시
git commit -m "fix: proto-loader string type handling"  # patch
git commit -m "feat: add new pagination mode"           # minor
git commit -m "feat!: breaking API change"              # major
```

### 로컬 배포 (긴급 시에만)

```bash
yarn prepack                 # 빌드
npm publish --access public  # npm 게시
```

**주의**: 로컬 배포 시 Release Please와 버전 충돌 가능. 가급적 Release Please 사용 권장.

## 주의사항

1. **URL 파싱**: h3의 `getRequestURL`, `getQuery` 대신 `event.path` + `parseQuery` 사용
2. **ESM 환경**: `createRequire`는 lazy initialization 필요
3. **Edge Runtime**: fs 모듈 필요로 미지원
4. **캐시**: 개발 중 설정 변경 시 `POST /mock/__reset` 호출 필요
5. **CI 빌드**: `yarn dev:prepare` 후 `yarn prepack` 실행 필요 (tsconfig.json이 .nuxt 참조)


## 코드 변경 전 CI 검증 (필수)

코드 변경 후 커밋 전에 반드시 다음 검증을 수행:

```bash
yarn lint             # ESLint 검사
npx vue-tsc --noEmit  # TypeScript 타입 검사
yarn test:unit        # 단위 테스트 (선택)
```

### 자주 발생하는 CI 오류

| 오류 유형 | 원인 | 해결 방법 |
|----------|------|----------|
| `is defined but never used` | 미사용 import | import 제거 또는 `_` prefix 추가 |
| `Component name should be multi-word` | Vue 컴포넌트 이름 규칙 | `<!-- eslint-disable vue/multi-word-component-names -->` 추가 |
| `Type X is not assignable to type Y` | 타입 불일치 | `as unknown as TargetType` 사용 |
| `The 'g' flag is unnecessary` | regex exec 단일 실행 시 | `/g` 플래그 제거 |
| `Unexpected console statement` | console.log 사용 | 의도적 로그는 경고로 허용 |

### 타입 변환 시 주의

OpenAPI 타입 간 변환 시 직접 캐스팅이 안 되는 경우:

```typescript
// ❌ 오류: Type 'A' is not assignable to type 'B'
const value = sourceValue as TargetType

// ✅ 해결: unknown을 거쳐 변환
const value = sourceValue as unknown as TargetType
```

## 트러블슈팅

### 캐시 정리 (개발 환경 초기화)

개발 서버 오류 발생 시 캐시 정리:

**PowerShell (Windows):**

```powershell
Remove-Item -Recurse -Force .yarn/install-state.gz, .nuxt, playground-openapi/.nuxt, playground-swagger/.nuxt, playground-openapi-client/.nuxt, playground-proto/.nuxt -ErrorAction SilentlyContinue
yarn install
yarn dev:prepare:playground
```

**Bash (Linux/macOS):**

```bash
rm -rf .yarn/install-state.gz .nuxt playground-openapi/.nuxt playground-swagger/.nuxt playground-openapi-client/.nuxt playground-proto/.nuxt
yarn install
yarn dev:prepare:playground
```

### openapi-generator oneOf 빈 타입 버그

openapi-generator가 `oneOf`를 빈 타입으로 생성하는 경우가 있음:

```typescript
// 버그: export type Notification = ;
// 수정: export type Notification = EmailNotification | PushNotification | SmsNotification;
```

`packages/openapi-client/src/models/` 내 파일 확인 필요

## MCP 도구

프로젝트에 MCP 서버가 설정되어 있습니다. (`.mcp.json` 참조)

| MCP | 용도 |
|-----|------|
| `github` | PR, 이슈, 릴리즈 관리 |
| `fetch` | 웹 문서/API 참조 |
| `npm` | 패키지 버전, publish |
| `typescript` | 타입 진단 |
| `playwright` | E2E 테스트 |

### 활용 예시

```bash
# GitHub MCP로 PR 생성
# npm MCP로 버전 범프
# Playwright MCP로 E2E 테스트 실행
```

자세한 설정 및 추가 MCP 옵션: `MCP_RECOMMENDATIONS.md` 참조
