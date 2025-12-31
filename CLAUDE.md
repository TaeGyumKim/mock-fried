# Mock-Fried 프로젝트 가이드

## 프로젝트 개요

Nuxt 3 Mock API 모듈 - OpenAPI 및 Protobuf RPC Mock 서버

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
│           │   ├── openapi.ts # OpenAPI Mock 핸들러 (메인)
│           │   ├── rpc.ts     # Proto RPC 핸들러
│           │   ├── schema.ts  # 스키마 메타데이터
│           │   └── reset.ts   # 캐시 초기화
│           └── utils/
│               ├── mock/      # Mock 데이터 생성
│               │   ├── schema-generator.ts  # OpenAPI Mock 생성
│               │   ├── proto-generator.ts   # Proto Mock 생성
│               │   └── pagination.ts        # 페이지네이션 매니저
│               └── client-parser.ts  # TS 클라이언트 패키지 파서
├── packages/                  # 샘플/테스트용 패키지 (CI에서 사용)
│   ├── openapi-comprehensive/ # OpenAPI 클라이언트 샘플
│   └── sample-proto/          # Proto 파일 샘플
├── playground-openapi/        # OpenAPI 테스트 환경 (로컬 전용, 내부망 의존성)
├── playground-proto/          # Proto 테스트 환경 (로컬 전용, 내부망 의존성)
└── test/                      # E2E 테스트
    └── fixtures/              # 테스트용 Nuxt 앱
```

## 주요 파일 설명

### 핸들러 (src/runtime/server/handlers/)

| 파일 | 역할 | 엔드포인트 |
|------|------|-----------|
| `openapi.ts` | OpenAPI Mock 응답 생성 | `GET/POST/... /mock/**` |
| `rpc.ts` | Proto RPC Mock 응답 | `POST /mock/rpc/:service/:method` |
| `schema.ts` | API 스키마 메타데이터 | `GET /mock/__schema` |
| `reset.ts` | 캐시 초기화 | `POST /mock/__reset` |

### Mock 유틸 (src/runtime/server/utils/mock/)

| 파일 | 역할 |
|------|------|
| `schema-generator.ts` | OpenAPI 스키마 기반 Mock 데이터 생성 |
| `proto-generator.ts` | Proto 메시지 기반 Mock 데이터 생성 |
| `pagination.ts` | Page/Cursor 페이지네이션 매니저 |
| `shared.ts` | 공유 유틸 (hashString, seededRandom) |

## 개발 명령어

```bash
yarn install              # 의존성 설치
yarn dev:prepare          # 타입 스텁 생성 (CI용)
yarn dev:prepare:playground # playground 포함 준비 (로컬용)
yarn dev:openapi          # OpenAPI playground 실행 (로컬)
yarn dev:proto            # Proto playground 실행 (로컬)
yarn lint                 # ESLint 검사
yarn lint:fix             # ESLint 자동 수정
yarn test                 # 테스트 실행
yarn test:watch           # 테스트 watch 모드
yarn prepack              # 빌드
```

## CI/CD 파이프라인

### GitHub Actions 워크플로우

**CI Pipeline** (`.github/workflows/ci.yml`):

```text
lint → build → test
```

**Publish Pipeline** (`.github/workflows/publish.yml`):

```text
lint → build → test → npm publish
```

### Workspaces 구성

- `packages/*` - CI에서 사용하는 샘플 패키지
- `playground-*` - **워크스페이스에서 제외** (내부망 의존성 때문에 CI에서 사용 불가)

### 샘플 패키지

| 패키지 | 용도 |
|--------|------|
| `@mock-fried/openapi-comprehensive` | OpenAPI 클라이언트 테스트용 샘플 |
| `@mock-fried/sample-proto` | Proto RPC 테스트용 샘플 |

## 구현 현황

### OpenAPI Mock (✅ Production Ready)

- Path/Query 파라미터 파싱
- Page/Cursor 페이지네이션
- Deterministic 데이터 생성
- Client Package / Spec File 모드
- Generic 타입, JSON 키 매핑

### Protobuf RPC Mock (⚠️ Basic Support)

- Unary RPC만 지원
- Streaming 미구현
- Pagination 미구현
- repeated 필드 고정 1개

## 미구현 기능 (TODO)

### Proto RPC 확장

- [ ] Server streaming 지원
- [ ] Pagination 패턴 지원
- [ ] repeated 필드 다수 아이템 생성
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

## 코드 스타일

- ESLint + Prettier 사용
- `@nuxt/eslint-config` 기반
- 한글 주석 허용

## 테스트

```bash
yarn test                    # 전체 테스트
yarn test:watch              # watch 모드
yarn test test/handlers/     # 특정 디렉토리
```

테스트 파일 위치: `test/` 디렉토리

**참고**: `test/emsp-*.test.ts` 파일은 내부 프로젝트용으로 `.gitignore`에 포함

## 배포

### npm 게시 (GitHub Release)

1. GitHub에서 Release 생성
2. Publish 워크플로우 자동 실행
3. npm에 자동 게시

### 로컬 배포 (수동)

```bash
yarn prepack                 # 빌드
npm publish --access public  # npm 게시
```

## 주의사항

1. **URL 파싱**: h3의 `getRequestURL`, `getQuery` 대신 `event.path` + `parseQuery` 사용
2. **ESM 환경**: `createRequire`는 lazy initialization 필요
3. **Edge Runtime**: fs 모듈 필요로 미지원
4. **캐시**: 개발 중 설정 변경 시 `POST /mock/__reset` 호출 필요
5. **CI 빌드**: `yarn dev:prepare` 후 `yarn prepack` 실행 필요 (tsconfig.json이 .nuxt 참조)

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
