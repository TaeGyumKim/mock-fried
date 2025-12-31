# Mock-Fried 프로젝트용 MCP 추천

## CI/CD & GitHub

### @anthropic/mcp-github

GitHub 통합 - PR, 이슈, Actions 관리

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "<your-token>"
      }
    }
  }
}
```

**용도:**
- PR 생성/리뷰/머지
- 이슈 관리
- GitHub Actions 워크플로우 확인
- 릴리즈 생성

---

## 코드 품질 & 테스트

### @anthropic/mcp-typescript

TypeScript 언어 서버 통합

```json
{
  "mcpServers": {
    "typescript": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-typescript"]
    }
  }
}
```

**용도:**
- 타입 에러 진단
- 리팩토링 지원
- Go to definition/references

### mcp-server-playwright

Playwright E2E 테스트 실행

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-playwright"]
    }
  }
}
```

**용도:**
- E2E 테스트 실행
- 스크린샷 캡처
- 브라우저 자동화

---

## 패키지 & 의존성

### mcp-npm

npm 패키지 관리

```json
{
  "mcpServers": {
    "npm": {
      "command": "npx",
      "args": ["-y", "mcp-npm"]
    }
  }
}
```

**용도:**
- 패키지 버전 확인
- 의존성 업데이트
- npm publish 자동화
- 취약점 검사

---

## 문서 & 검색

### @anthropic/mcp-fetch

웹 페이지/API 문서 조회

```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-fetch"]
    }
  }
}
```

**용도:**
- OpenAPI 스펙 문서 조회
- Nuxt/Nitro 공식 문서 참조
- npm 패키지 문서 확인

### mcp-obsidian (또는 mcp-notion)

프로젝트 문서 관리

```json
{
  "mcpServers": {
    "obsidian": {
      "command": "npx",
      "args": ["-y", "mcp-obsidian"],
      "env": {
        "OBSIDIAN_VAULT_PATH": "/path/to/vault"
      }
    }
  }
}
```

**용도:**
- 프로젝트 문서 작성/조회
- 회의록, 결정 사항 기록
- 지식 베이스 관리

---

## 터미널 & 시스템

### @anthropic/mcp-shell

향상된 셸 명령 실행

```json
{
  "mcpServers": {
    "shell": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-shell"]
    }
  }
}
```

**용도:**
- 복잡한 빌드 스크립트 실행
- 테스트 파이프라인 실행
- 로그 분석

---

## 데이터베이스 (선택적)

### mcp-sqlite / mcp-postgres

데이터베이스 연동 (향후 Mock 데이터 저장용)

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "mcp-sqlite", "--db", "./mock-data.db"]
    }
  }
}
```

**용도:**
- Mock 데이터 영구 저장
- 테스트 데이터 시딩
- 쿼리 테스트

---

## 모니터링 & 로깅

### mcp-sentry

에러 모니터링 통합

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "mcp-sentry"],
      "env": {
        "SENTRY_AUTH_TOKEN": "<token>",
        "SENTRY_ORG": "<org>",
        "SENTRY_PROJECT": "<project>"
      }
    }
  }
}
```

**용도:**
- 에러 조회/분석
- 이슈 트래킹
- 릴리즈 연동

---

## 추천 조합 (mock-fried 프로젝트용)

### 필수

| MCP | 용도 |
|-----|------|
| `@anthropic/mcp-github` | PR/이슈/릴리즈 관리 |
| `@anthropic/mcp-fetch` | 문서/API 참조 |

### 권장

| MCP | 용도 |
|-----|------|
| `mcp-npm` | 패키지 관리, 버전 범프 |
| `@anthropic/mcp-typescript` | 타입 진단 |
| `mcp-playwright` | E2E 테스트 |

### 선택

| MCP | 용도 |
|-----|------|
| `mcp-sqlite` | Mock 데이터 영구 저장 |
| `mcp-sentry` | 프로덕션 에러 모니터링 |

---

## 설정 예시 (claude_code_config.json)

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-fetch"]
    },
    "npm": {
      "command": "npx",
      "args": ["-y", "mcp-npm"]
    },
    "typescript": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-typescript"]
    }
  }
}
```

---

## 유용한 워크플로우 예시

### 1. 버전 릴리즈 자동화

```text
1. 코드 변경 및 커밋
2. GitHub에서 Release 생성
3. CI/CD 파이프라인 자동 실행 (lint → build → test → publish)
4. npm에 자동 게시
```

### 2. PR 리뷰 보조

```text
1. GitHub MCP로 PR diff 조회
2. TypeScript MCP로 타입 에러 확인
3. CI 파이프라인 결과 확인 (lint → build → test)
4. GitHub MCP로 리뷰 코멘트 작성
```

### 3. 로컬 개발

```text
1. yarn dev:prepare:playground (playground 포함 준비)
2. yarn dev:openapi (OpenAPI playground 실행)
3. TypeScript MCP로 타입 체크
4. yarn test (테스트 실행)
```
