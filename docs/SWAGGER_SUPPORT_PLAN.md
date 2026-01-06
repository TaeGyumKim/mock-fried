# Swagger 2.0 지원 구현 완료

> **✅ 구현 완료** (v1.2.0 ~ v1.3.1)
>
> - 구현일: 2025-01-05 ~ 2025-01-06
> - 테스트: 546개 통과 (Swagger E2E 68개 포함)

## 개요

Swagger 2.0 스펙 파일을 OpenAPI 3.x와 동일하게 지원합니다.

### 구현 방식

1. `@apidevtools/swagger-parser` - 스펙 파싱, $ref 해석, 검증
2. `swagger2openapi` - Swagger 2.0 → OpenAPI 3.0 자동 변환
3. 기존 `openapi-backend` 파이프라인 재사용

## 주요 파일

| 파일 | 역할 |
|------|------|
| `src/runtime/server/utils/spec-loader.ts` | 스펙 로드/변환 유틸리티 |
| `packages/sample-swagger/swagger.yaml` | Swagger 2.0 샘플 스펙 (50개 엔드포인트) |
| `playground-swagger/` | Swagger 2.0 테스트 환경 |
| `test/e2e/playground-swagger.e2e.test.ts` | E2E 테스트 (68개) |
| `test/spec-loader.test.ts` | 단위 테스트 (23개) |

## API 구성

| API 그룹 | 엔드포인트 수 | 주요 기능 |
|----------|-------------|----------|
| Users | 5 | CRUD, 페이지네이션, 필터링 |
| Products | 3 | CRUD, 페이지네이션 |
| Orders | 3 | CRUD, 중첩 구조 |
| Posts | 3 | 커서 기반 페이지네이션 |
| Comments | 2 | 중첩 리소스 |
| Health | 4 | 헬스체크, 버전, ping, tags |
| EdgeCases | 18 | 다양한 스키마 테스트 |
| AdvancedCases | 10 | 재귀 스키마, 깊은 중첩 |
| Activities | 2 | 양방향 커서 페이지네이션 |

## Swagger 2.0 제한사항

- `oneOf` 미지원 (OpenAPI 3.x 전용)
- `x-nullable: true` 사용 (`nullable` 대신)
- `definitions` 사용 (`components/schemas` 대신)

## 사용 방법

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['mock-fried'],
  mock: {
    openapi: {
      specPath: './swagger.yaml', // Swagger 2.0 또는 OpenAPI 3.x
    },
  },
})
```

`/__schema` 응답에서 `_meta.specVersion` 필드로 버전 확인 가능 (`swagger2` | `openapi3`)

## 변경 이력

| 버전 | 날짜 | 내용 |
|------|------|------|
| v1.2.0 | 2025-01-05 | Swagger 2.0 지원 추가 |
| v1.3.0 | 2025-01-06 | AdvancedCases, Activities API 추가 |
| v1.3.1 | 2025-01-06 | listFieldName 타입 수정 |
