# Swagger 2.0 지원 구현 계획

## 개요

Swagger 2.0 스펙 파일을 OpenAPI 3.x와 동일하게 지원하기 위한 리팩토링 계획입니다.
Interface + Abstract Class 패턴을 사용하여 코드 재사용성과 확장성을 확보합니다.

---

## 현재 구조 분석

### 문제점

현재 Mock Generator가 OpenAPI 3.x 구조를 직접 참조:

```typescript
// openapi-generator.ts - OpenAPI 3.x 구조 가정
const schema = spec.components?.schemas?.[modelName]  // Swagger 2.0: definitions
const paramSchema = param.schema?.type               // Swagger 2.0: param.type
```

### Swagger 2.0 vs OpenAPI 3.x 차이

| 항목 | Swagger 2.0 | OpenAPI 3.x |
|------|-------------|-------------|
| 버전 키 | `swagger: "2.0"` | `openapi: "3.x.x"` |
| 스키마 위치 | `definitions` | `components/schemas` |
| 파라미터 타입 | `type` 직접 | `schema.type` |
| 요청 본문 | `in: body` 파라미터 | `requestBody` |
| Form 데이터 | `in: formData` | `requestBody` (multipart) |
| Content Type | `produces/consumes` | `content` |
| $ref 경로 | `#/definitions/...` | `#/components/schemas/...` |

---

## 설계: Interface + Abstract Class 패턴

### 클래스 다이어그램

```
┌─────────────────────────────────────┐
│      ISpecMockGenerator             │  ← Interface (계약)
│  - parseSpec()                      │
│  - generateMock()                   │
│  - getSchemaDefinition()            │
│  - resolveRef()                     │
│  - getEndpoints()                   │
└─────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│    AbstractSpecMockGenerator        │  ← Abstract Class (공통 구현)
│  # spec: ParsedSpec                 │
│  + generateString()                 │
│  + generateNumber()                 │
│  + generateBoolean()                │
│  + generateArray()                  │
│  + generateObject()                 │
│  + generateFromSchema()             │
│  ~ abstract parseSpec()             │
│  ~ abstract resolveRef()            │
│  ~ abstract getRefPrefix()          │
└─────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│ OpenApi3Generator│  │ Swagger2Generator│  ← Concrete Classes
│ + parseSpec()    │  │ + parseSpec()    │
│ + resolveRef()   │  │ + resolveRef()   │
│ # getRefPrefix() │  │ # getRefPrefix() │
│   → #/components/│  │   → #/definitions│
└──────────────────┘  └──────────────────┘
```

---

## 구현 상세

### Step 1: Interface 정의

**파일**: `src/runtime/server/utils/mock/interfaces/spec-generator.interface.ts`

```typescript
/**
 * Mock Generator Interface
 * OpenAPI 3.x와 Swagger 2.0 모두 이 인터페이스를 구현
 */
export interface ISpecMockGenerator {
  /** 스펙 파일 파싱 */
  parseSpec(specPath: string): ParsedSpec | undefined

  /** Mock 데이터 생성 */
  generateMock(
    schemaName: string,
    seed: string,
    index: number
  ): Record<string, unknown>

  /** 스키마 정의 조회 */
  getSchemaDefinition(name: string): SchemaDefinition | undefined

  /** $ref 경로 해석 */
  resolveRef(ref: string): SchemaDefinition | undefined

  /** 엔드포인트 목록 */
  getEndpoints(): ParsedEndpoint[]

  /** 스펙 버전 */
  readonly version: 'openapi3' | 'swagger2'
}

export interface ParsedSpec {
  info: { title: string; version: string }
  endpoints: ParsedEndpoint[]
  schemas: Map<string, SchemaDefinition>
}

export interface ParsedEndpoint {
  path: string
  method: string
  operationId?: string
  summary?: string
  parameters?: ParsedParameter[]
  requestBody?: SchemaDefinition
  responseSchema?: SchemaDefinition
}

export interface ParsedParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'body' | 'formData'
  required?: boolean
  schema?: SchemaDefinition
}

export interface SchemaDefinition {
  type?: string
  properties?: Record<string, SchemaDefinition>
  items?: SchemaDefinition
  $ref?: string
  required?: string[]
  format?: string
  minimum?: number
  maximum?: number
  enum?: unknown[]
  nullable?: boolean
}
```

---

### Step 2: Abstract Base Class

**파일**: `src/runtime/server/utils/mock/generators/abstract-generator.ts`

```typescript
import type {
  ISpecMockGenerator,
  ParsedSpec,
  SchemaDefinition,
  ParsedEndpoint
} from '../interfaces'
import { hashString, seededRandom } from '../shared'

export abstract class AbstractSpecMockGenerator implements ISpecMockGenerator {
  protected spec: ParsedSpec | null = null

  abstract readonly version: 'openapi3' | 'swagger2'

  // ===== Abstract Methods (자식에서 구현) =====
  abstract parseSpec(specPath: string): ParsedSpec | undefined
  abstract resolveRef(ref: string): SchemaDefinition | undefined
  protected abstract getRefPrefix(): string

  // ===== Common Implementation =====

  getSchemaDefinition(name: string): SchemaDefinition | undefined {
    return this.spec?.schemas.get(name)
  }

  getEndpoints(): ParsedEndpoint[] {
    return this.spec?.endpoints ?? []
  }

  generateMock(
    schemaName: string,
    seed: string,
    index: number
  ): Record<string, unknown> {
    const schema = this.getSchemaDefinition(schemaName)
    if (!schema) return {}

    return this.generateFromSchema(schema, `${seed}-${index}`) as Record<string, unknown>
  }

  // ===== Protected Helper Methods =====

  protected generateFromSchema(schema: SchemaDefinition, seed: string): unknown {
    // $ref 해석
    if (schema.$ref) {
      const resolved = this.resolveRef(schema.$ref)
      if (resolved) return this.generateFromSchema(resolved, seed)
      return {}
    }

    switch (schema.type) {
      case 'object':
        return this.generateObject(schema, seed)
      case 'array':
        return this.generateArray(schema, seed)
      case 'string':
        return this.generateString(seed, schema)
      case 'integer':
      case 'number':
        return this.generateNumber(seed, schema)
      case 'boolean':
        return this.generateBoolean(seed)
      default:
        return null
    }
  }

  protected generateString(seed: string, schema?: SchemaDefinition): string {
    const hash = hashString(seed)

    // enum 처리
    if (schema?.enum && schema.enum.length > 0) {
      return String(schema.enum[hash % schema.enum.length])
    }

    // format 처리
    switch (schema?.format) {
      case 'date':
        return new Date(2020 + (hash % 5), hash % 12, (hash % 28) + 1)
          .toISOString().split('T')[0]
      case 'date-time':
        return new Date(2020 + (hash % 5), hash % 12, (hash % 28) + 1)
          .toISOString()
      case 'email':
        return `user${hash % 1000}@example.com`
      case 'uuid':
        return `${hash.toString(16).padStart(8, '0')}-0000-0000-0000-000000000000`
      case 'uri':
      case 'url':
        return `https://example.com/resource/${hash % 1000}`
      default:
        return `mock-string-${hash % 10000}`
    }
  }

  protected generateNumber(seed: string, schema?: SchemaDefinition): number {
    const random = seededRandom(seed)
    const min = schema?.minimum ?? 0
    const max = schema?.maximum ?? 10000

    if (schema?.type === 'integer') {
      return Math.floor(random * (max - min)) + min
    }
    return random * (max - min) + min
  }

  protected generateBoolean(seed: string): boolean {
    return hashString(seed) % 2 === 0
  }

  protected generateArray(schema: SchemaDefinition, seed: string): unknown[] {
    const count = 3 + (hashString(seed) % 5)
    const items: unknown[] = []

    if (schema.items) {
      for (let i = 0; i < count; i++) {
        items.push(this.generateFromSchema(schema.items, `${seed}-item-${i}`))
      }
    }

    return items
  }

  protected generateObject(
    schema: SchemaDefinition,
    seed: string
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    if (schema.properties) {
      for (const [key, prop] of Object.entries(schema.properties)) {
        result[key] = this.generateFromSchema(prop, `${seed}-${key}`)
      }
    }

    return result
  }

  // ===== Utility Methods =====

  protected loadSpecFile(specPath: string): Record<string, unknown> | null {
    // 구현: YAML/JSON 파일 로드
    // 기존 schema.ts의 로직 재사용
  }
}
```

---

### Step 3: OpenAPI 3.x Generator

**파일**: `src/runtime/server/utils/mock/generators/openapi3-generator.ts`

```typescript
import { AbstractSpecMockGenerator } from './abstract-generator'
import type { ParsedSpec, SchemaDefinition, ParsedEndpoint } from '../interfaces'

export class OpenApi3Generator extends AbstractSpecMockGenerator {
  readonly version = 'openapi3' as const

  protected getRefPrefix(): string {
    return '#/components/schemas/'
  }

  parseSpec(specPath: string): ParsedSpec | undefined {
    const raw = this.loadSpecFile(specPath)
    if (!raw || !String(raw.openapi)?.startsWith('3.')) return undefined

    const schemas = new Map<string, SchemaDefinition>()

    // components/schemas 파싱
    const components = raw.components as Record<string, unknown> | undefined
    if (components?.schemas) {
      for (const [name, schema] of Object.entries(components.schemas as Record<string, unknown>)) {
        schemas.set(name, schema as SchemaDefinition)
      }
    }

    this.spec = {
      info: raw.info as { title: string; version: string },
      endpoints: this.parseEndpoints(raw.paths as Record<string, unknown>),
      schemas,
    }

    return this.spec
  }

  resolveRef(ref: string): SchemaDefinition | undefined {
    const name = ref.replace(this.getRefPrefix(), '')
    return this.getSchemaDefinition(name)
  }

  private parseEndpoints(paths: Record<string, unknown>): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = []

    for (const [path, pathItem] of Object.entries(paths)) {
      const item = pathItem as Record<string, unknown>

      for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
        if (item[method]) {
          const op = item[method] as Record<string, unknown>
          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: op.operationId as string | undefined,
            summary: op.summary as string | undefined,
            parameters: this.parseParameters(op.parameters as unknown[]),
            requestBody: this.parseRequestBody(op.requestBody as Record<string, unknown>),
            responseSchema: this.parseResponse(op.responses as Record<string, unknown>),
          })
        }
      }
    }

    return endpoints
  }

  private parseParameters(params: unknown[]): ParsedParameter[] {
    // OpenAPI 3.x 파라미터 파싱
    // schema 속성 사용
  }

  private parseRequestBody(body: Record<string, unknown>): SchemaDefinition | undefined {
    // OpenAPI 3.x requestBody 파싱
  }

  private parseResponse(responses: Record<string, unknown>): SchemaDefinition | undefined {
    // OpenAPI 3.x response 파싱
  }
}
```

---

### Step 4: Swagger 2.0 Generator

**파일**: `src/runtime/server/utils/mock/generators/swagger2-generator.ts`

```typescript
import { AbstractSpecMockGenerator } from './abstract-generator'
import type { ParsedSpec, SchemaDefinition, ParsedEndpoint, ParsedParameter } from '../interfaces'

export class Swagger2Generator extends AbstractSpecMockGenerator {
  readonly version = 'swagger2' as const

  protected getRefPrefix(): string {
    return '#/definitions/'
  }

  parseSpec(specPath: string): ParsedSpec | undefined {
    const raw = this.loadSpecFile(specPath)
    if (!raw || raw.swagger !== '2.0') return undefined

    const schemas = new Map<string, SchemaDefinition>()

    // definitions 파싱
    if (raw.definitions) {
      for (const [name, schema] of Object.entries(raw.definitions as Record<string, unknown>)) {
        schemas.set(name, this.normalizeSchema(schema))
      }
    }

    this.spec = {
      info: raw.info as { title: string; version: string },
      endpoints: this.parseEndpoints(raw.paths as Record<string, unknown>),
      schemas,
    }

    return this.spec
  }

  resolveRef(ref: string): SchemaDefinition | undefined {
    const name = ref.replace(this.getRefPrefix(), '')
    return this.getSchemaDefinition(name)
  }

  private parseEndpoints(paths: Record<string, unknown>): ParsedEndpoint[] {
    const endpoints: ParsedEndpoint[] = []

    for (const [path, pathItem] of Object.entries(paths)) {
      const item = pathItem as Record<string, unknown>

      for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
        if (item[method]) {
          const op = item[method] as Record<string, unknown>
          const params = this.parseParameters(op.parameters as unknown[])

          endpoints.push({
            path,
            method: method.toUpperCase(),
            operationId: op.operationId as string | undefined,
            summary: op.summary as string | undefined,
            parameters: params.filter(p => p.in !== 'body'),
            requestBody: this.extractBodyParameter(params),
            responseSchema: this.parseResponse(op.responses as Record<string, unknown>),
          })
        }
      }
    }

    return endpoints
  }

  private parseParameters(params: unknown[]): ParsedParameter[] {
    if (!params) return []

    return params.map((p: any) => ({
      name: p.name,
      in: p.in,
      required: p.required,
      // Swagger 2.0: type이 직접 있거나 schema가 있음
      schema: p.schema || { type: p.type, format: p.format },
    }))
  }

  private extractBodyParameter(params: ParsedParameter[]): SchemaDefinition | undefined {
    const bodyParam = params.find(p => p.in === 'body')
    return bodyParam?.schema
  }

  private parseResponse(responses: Record<string, unknown>): SchemaDefinition | undefined {
    // Swagger 2.0: responses.200.schema
    const success = responses?.['200'] as Record<string, unknown>
    return success?.schema as SchemaDefinition | undefined
  }

  /** Swagger 2.0 스키마 → 공통 형식 정규화 */
  private normalizeSchema(swagger2Schema: any): SchemaDefinition {
    return {
      type: swagger2Schema.type,
      properties: swagger2Schema.properties,
      items: swagger2Schema.items,
      $ref: swagger2Schema.$ref,
      required: swagger2Schema.required,
      format: swagger2Schema.format,
      minimum: swagger2Schema.minimum,
      maximum: swagger2Schema.maximum,
      enum: swagger2Schema.enum,
    }
  }
}
```

---

### Step 5: Factory Pattern

**파일**: `src/runtime/server/utils/mock/generators/generator-factory.ts`

```typescript
import type { ISpecMockGenerator } from '../interfaces'
import { OpenApi3Generator } from './openapi3-generator'
import { Swagger2Generator } from './swagger2-generator'
import { readFileSync, existsSync } from 'node:fs'
import yaml from 'js-yaml'

export class SpecMockGeneratorFactory {
  private static cache = new Map<string, ISpecMockGenerator>()

  static create(specPath: string): ISpecMockGenerator {
    // 캐시 확인
    if (this.cache.has(specPath)) {
      return this.cache.get(specPath)!
    }

    const raw = this.loadRawSpec(specPath)

    let generator: ISpecMockGenerator

    if (raw.swagger === '2.0') {
      generator = new Swagger2Generator()
    } else {
      generator = new OpenApi3Generator()
    }

    generator.parseSpec(specPath)
    this.cache.set(specPath, generator)

    return generator
  }

  static clearCache(): void {
    this.cache.clear()
  }

  private static loadRawSpec(specPath: string): Record<string, unknown> {
    if (!existsSync(specPath)) {
      throw new Error(`Spec file not found: ${specPath}`)
    }

    const content = readFileSync(specPath, 'utf-8')

    if (specPath.endsWith('.yaml') || specPath.endsWith('.yml')) {
      return yaml.load(content) as Record<string, unknown>
    }

    return JSON.parse(content)
  }
}
```

---

### Step 6: 핸들러 통합

**파일**: `src/runtime/server/handlers/openapi.ts` (수정)

```typescript
import { SpecMockGeneratorFactory } from '../utils/mock/generators'

// 핸들러 내부
export default defineEventHandler(async (event) => {
  const specPath = getSpecPath()

  // Factory로 적절한 Generator 생성
  const generator = SpecMockGeneratorFactory.create(specPath)

  // Mock 데이터 생성
  const mockData = generator.generateMock(schemaName, seed, index)

  return mockData
})
```

---

## 파일 구조

```
src/runtime/server/utils/mock/
├── interfaces/
│   ├── index.ts
│   ├── spec-generator.interface.ts     # ISpecMockGenerator
│   └── types.ts                        # ParsedSpec, SchemaDefinition 등
├── generators/
│   ├── index.ts
│   ├── abstract-generator.ts           # AbstractSpecMockGenerator
│   ├── openapi3-generator.ts           # OpenAPI 3.x 구현
│   ├── swagger2-generator.ts           # Swagger 2.0 구현
│   └── generator-factory.ts            # Factory
├── pagination/                          # 기존 유지 (변경 없음)
│   ├── cursor-manager.ts
│   ├── page-manager.ts
│   └── ...
├── providers/                           # 기존 유지 (리팩토링 대상)
│   ├── schema-item-provider.ts
│   └── openapi-item-provider.ts
└── shared.ts                            # 공유 유틸 (hashString, seededRandom)
```

---

## 테스트 계획

### 단위 테스트

**파일**: `test/generators/abstract-generator.test.ts`

```typescript
describe('AbstractSpecMockGenerator', () => {
  describe('generateString', () => {
    it('should generate deterministic string')
    it('should handle date format')
    it('should handle email format')
    it('should handle enum values')
  })

  describe('generateNumber', () => {
    it('should respect min/max constraints')
    it('should generate integer for integer type')
  })

  describe('generateFromSchema', () => {
    it('should resolve $ref and generate mock')
    it('should handle nested objects')
    it('should handle arrays')
  })
})
```

**파일**: `test/generators/openapi3-generator.test.ts`

```typescript
describe('OpenApi3Generator', () => {
  it('should detect OpenAPI 3.x version')
  it('should parse components/schemas')
  it('should resolve #/components/schemas/ refs')
  it('should parse requestBody')
})
```

**파일**: `test/generators/swagger2-generator.test.ts`

```typescript
describe('Swagger2Generator', () => {
  it('should detect Swagger 2.0 version')
  it('should parse definitions')
  it('should resolve #/definitions/ refs')
  it('should convert body parameter to requestBody')
  it('should handle direct type in parameters')
})
```

### E2E 테스트

**파일**: `test/e2e/playground-swagger.e2e.test.ts`

```typescript
describe('Swagger 2.0 E2E', () => {
  it('should parse Swagger 2.0 spec')
  it('should return mock data for endpoints')
  it('should support pagination')
  it('should handle $ref correctly')
})
```

---

## 샘플 Swagger 2.0 패키지

**파일**: `packages/sample-swagger/swagger.yaml`

```yaml
swagger: "2.0"
info:
  title: Sample Swagger 2.0 API
  version: "1.0.0"
basePath: /api
produces:
  - application/json
consumes:
  - application/json

paths:
  /users:
    get:
      operationId: getUsers
      summary: List users
      parameters:
        - name: page
          in: query
          type: integer
        - name: limit
          in: query
          type: integer
      responses:
        200:
          description: User list
          schema:
            $ref: "#/definitions/UserListResponse"
    post:
      operationId: createUser
      summary: Create user
      parameters:
        - name: body
          in: body
          required: true
          schema:
            $ref: "#/definitions/CreateUserRequest"
      responses:
        201:
          schema:
            $ref: "#/definitions/User"

  /users/{id}:
    get:
      operationId: getUserById
      parameters:
        - name: id
          in: path
          required: true
          type: string
      responses:
        200:
          schema:
            $ref: "#/definitions/User"

definitions:
  User:
    type: object
    required:
      - id
      - name
    properties:
      id:
        type: string
      name:
        type: string
      email:
        type: string
        format: email
      createdAt:
        type: string
        format: date-time

  UserListResponse:
    type: object
    properties:
      items:
        type: array
        items:
          $ref: "#/definitions/User"
      total:
        type: integer
      page:
        type: integer

  CreateUserRequest:
    type: object
    required:
      - name
    properties:
      name:
        type: string
      email:
        type: string
        format: email
```

---

## 구현 순서

| 순서 | 작업 | 파일 | 예상 난이도 |
|------|------|------|------------|
| 1 | Interface 정의 | `interfaces/*.ts` | 낮음 |
| 2 | Abstract Base Class | `generators/abstract-generator.ts` | 중간 |
| 3 | OpenAPI 3.x Generator | `generators/openapi3-generator.ts` | 중간 |
| 4 | Swagger 2.0 Generator | `generators/swagger2-generator.ts` | 중간 |
| 5 | Factory | `generators/generator-factory.ts` | 낮음 |
| 6 | 핸들러 통합 | `handlers/openapi.ts`, `handlers/schema.ts` | 중간 |
| 7 | 샘플 패키지 | `packages/sample-swagger/` | 낮음 |
| 8 | Playground | `playground-swagger/` | 낮음 |
| 9 | 단위 테스트 | `test/generators/*.test.ts` | 중간 |
| 10 | E2E 테스트 | `test/e2e/playground-swagger.e2e.test.ts` | 중간 |
| 11 | 문서화 | `CLAUDE.md` | 낮음 |

---

## 예상 결과

### 신규 파일

- `src/runtime/server/utils/mock/interfaces/` (3개)
- `src/runtime/server/utils/mock/generators/` (5개)
- `packages/sample-swagger/` (2개)
- `playground-swagger/` (5개)
- `test/generators/` (3개)
- `test/e2e/playground-swagger.e2e.test.ts` (1개)

### 수정 파일

- `src/runtime/server/handlers/openapi.ts`
- `src/runtime/server/handlers/schema.ts`
- `CLAUDE.md`

### 테스트 수

- 단위 테스트: ~20개
- E2E 테스트: ~15개

---

## 장점

| 항목 | 설명 |
|------|------|
| 단일 책임 원칙 | 각 클래스가 하나의 스펙 버전만 담당 |
| 코드 재사용 | 공통 로직은 Abstract Class에서 구현 |
| 확장성 | 새 스펙 버전 추가 시 새 클래스만 추가 |
| 테스트 용이 | Interface 기반 mocking 가능 |
| 타입 안전 | TypeScript의 강력한 타입 체크 활용 |
| 의존성 없음 | 외부 변환 패키지 불필요 |
