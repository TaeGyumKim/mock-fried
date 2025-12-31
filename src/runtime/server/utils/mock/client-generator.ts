/**
 * Client Package Mock 데이터 생성기
 * OpenAPI Generator로 생성된 TypeScript 클라이언트 패키지 기반 Mock 생성
 */
import type { ParsedModelSchema, ParsedModelField, MockIdConfig } from '../../../../types'
import { hashString, SeededRandom, isIdField, generateIdValue, DEFAULT_ID_CONFIG } from './shared'

/**
 * 필드명 기반 Mock 값 추론
 */
export function inferValueByFieldName(
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): unknown {
  const name = fieldName.toLowerCase()

  // ID 관련 - MockIdConfig 사용
  if (isIdField(fieldName, idConfig)) {
    return generateIdValue(fieldName, index, rng.hashId(16), idConfig)
  }

  // 이메일
  if (name.includes('email') || name.includes('mail')) {
    const domains = ['example.com', 'test.com', 'mock.io']
    const names = ['user', 'test', 'mock', 'admin']
    return `${rng.pick(names)}${rng.nextInt(1, 999)}@${rng.pick(domains)}`
  }

  // 이름
  if (name === 'name' || name.includes('username') || name.includes('firstname') || name.includes('lastname')) {
    const firstNames = ['김철수', '이영희', '박민수', 'John', 'Jane', 'Mike', 'Sarah', 'Alex']
    return rng.pick(firstNames)
  }

  // 전화번호
  if (name.includes('phone') || name.includes('mobile') || name.includes('tel')) {
    return `010-${rng.nextInt(1000, 9999)}-${rng.nextInt(1000, 9999)}`
  }

  // URL
  if (name.includes('url') || name.includes('link') || name.includes('href')) {
    return `https://example.com/${fieldName}/${rng.nextInt(1, 1000)}`
  }

  // 이미지
  if (name.includes('image') || name.includes('avatar') || name.includes('photo') || name.includes('thumbnail') || name.includes('picture')) {
    return `https://picsum.photos/seed/${rng.nextInt(1, 1000)}/200/200`
  }

  // 날짜/시간
  if (name.includes('date') || name.endsWith('at') || name.includes('time') || name.includes('created') || name.includes('updated')) {
    const now = Date.now()
    const offset = rng.nextInt(-365, 30) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 설명/내용
  if (name.includes('description') || name.includes('content') || name.includes('body') || name.includes('text')) {
    return `Mock ${fieldName} 데이터 #${rng.nextInt(1, 100)}`
  }

  // 제목
  if (name.includes('title') || name.includes('subject') || name.includes('headline')) {
    return `샘플 ${fieldName} #${rng.nextInt(1, 100)}`
  }

  // 상태/단계
  if (name.includes('status') || name.includes('state') || name.includes('stage')) {
    return rng.pick(['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED', 'APPROVED', 'REJECTED'])
  }

  // 연월 (YYYYMM 형식)
  if (name.includes('yearmonth') || (name.includes('month') && !name.includes('months'))) {
    const year = 2024 + rng.nextInt(0, 1)
    const month = rng.nextInt(1, 12)
    return year * 100 + month
  }

  // 메모/노트/메시지
  if (name.includes('note') || name.includes('memo') || name.includes('remark') || name.includes('comment') || name.includes('message')) {
    return `${fieldName} 내용입니다. #${rng.nextInt(1, 100)}`
  }

  // 카운트/수량
  if (name.includes('count') || name.includes('quantity') || name.includes('num')) {
    return rng.nextInt(0, 100)
  }

  // 비율/퍼센트
  if (name.includes('rate') || name.includes('ratio') || name.includes('percent')) {
    return `${rng.nextInt(1, 100)}`
  }

  // 금액 (amount는 가격보다 넓은 의미)
  if (name.includes('amount') || name.includes('price') || name.includes('cost') || name.includes('fee') || name.includes('commission')) {
    return rng.nextInt(1000, 100000)
  }

  // 페이지네이션
  if (name === 'page') return 1
  if (name === 'limit' || name === 'size' || name === 'pagesize') return 20
  if (name === 'total' || name === 'totalcount' || name === 'totalitems') return rng.nextInt(50, 500)
  if (name === 'totalpages') return rng.nextInt(3, 25)

  // 순서/시퀀스
  if (name.includes('sequence') || name.includes('order') || name.includes('priority') || name.includes('rank') || name === 'sort') {
    return rng.nextInt(1, 100)
  }

  // boolean
  if (name.startsWith('is') || name.startsWith('has') || name.startsWith('can') || name.startsWith('should') || name.startsWith('will')) {
    return rng.next() > 0.5
  }

  // 결과/성공 여부 (boolean)
  if (name === 'result' || name === 'success' || name.includes('enabled') || name.includes('valid') || name.includes('complete')) {
    return rng.next() > 0.5
  }

  // 담당자/소유자
  if (name.includes('owner') || name.includes('manager') || name.includes('author') || name.includes('writer') || name.includes('creator')) {
    const names = ['김철수', '이영희', '박민수', 'John', 'Jane']
    return rng.pick(names)
  }

  // 주소 관련
  if (name.includes('address') || name.includes('street')) {
    return `서울시 강남구 테헤란로 ${rng.nextInt(1, 500)}번길`
  }

  if (name.includes('city')) {
    return rng.pick(['서울', '부산', '대구', '인천', '광주', '대전'])
  }

  if (name.includes('country')) {
    return rng.pick(['KR', 'US', 'JP', 'CN'])
  }

  if (name.includes('zipcode') || name.includes('postal')) {
    return `${rng.nextInt(10000, 99999)}`
  }

  // 사업자등록번호
  if (name.includes('bizreg') || name.includes('regno')) {
    return `${rng.nextInt(100, 999)}-${rng.nextInt(10, 99)}-${rng.nextInt(10000, 99999)}`
  }

  // 기타 일반적인 필드들
  if (name.includes('code')) {
    return `CODE-${rng.nextInt(1000, 9999)}`
  }

  if (name.includes('type') || name.includes('category')) {
    return rng.pick(['TYPE_A', 'TYPE_B', 'TYPE_C'])
  }

  // 태그/라벨
  if (name.includes('tag') || name.includes('label')) {
    return rng.pick(['태그1', '태그2', '태그3', 'Tag A', 'Tag B'])
  }

  // 스케일/레벨/등급
  if (name.includes('scale') || name.includes('level') || name.includes('grade') || name.includes('tier')) {
    return rng.pick(['SMALL', 'MEDIUM', 'LARGE', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3'])
  }

  // 기간 (일/월 수)
  if (name.includes('days') || name.includes('months') || name.includes('weeks') || name.includes('years')) {
    return rng.nextInt(1, 30)
  }

  // 특정 일 (payday 등)
  if (name.includes('day') && !name.includes('days')) {
    return rng.nextInt(1, 28)
  }

  // 이유/사유
  if (name.includes('reason') || name.includes('cause')) {
    return rng.pick(['사용자 요청', '시스템 처리', '기간 만료', '정책 변경'])
  }

  // 비밀번호 (마스킹)
  if (name.includes('password') || name.includes('pwd')) {
    return '********'
  }

  if (name.includes('version')) {
    return `${rng.nextInt(1, 10)}.${rng.nextInt(0, 9)}.${rng.nextInt(0, 99)}`
  }

  if (name.includes('token') || name.includes('key') || name.includes('secret')) {
    return rng.uuid()
  }

  // 파일/첨부파일
  if (name.includes('file') || name.includes('attachment') || name.includes('document')) {
    return `https://storage.example.com/files/${rng.hashId(12)}.pdf`
  }

  return null
}

/**
 * TypeScript 타입에 따른 기본값 생성
 * 타입 우선 추론 후 필드명 기반 세부 추론
 */
export function generateValueByType(
  type: string,
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): unknown {
  const lowerType = type.toLowerCase()

  // 1. 명시적 타입 우선 처리
  switch (lowerType) {
    case 'number':
    case 'int':
    case 'integer':
    case 'float':
    case 'double':
      // number 타입은 필드명 기반으로 적절한 범위 결정
      return inferNumberByFieldName(fieldName, rng, index, idConfig)

    case 'boolean':
    case 'bool':
      // boolean 타입은 필드명과 무관하게 boolean 반환
      return inferBooleanByFieldName(fieldName, rng)

    case 'date':
      return inferDateByFieldName(fieldName, rng)

    case 'string':
      // string 타입은 필드명 기반 추론 시도
      return inferStringByFieldName(fieldName, rng, index, idConfig)

    case 'unknown':
    case 'any':
    case 'object':
      // unknown/any/object 타입은 필드명 기반으로 타입 추측
      return inferTypeFromFieldName(fieldName, rng, index, idConfig)

    default: {
      // enum 타입이거나 알 수 없는 타입 - 필드명 추론 시도
      const inferred = inferValueByFieldName(fieldName, rng, index, idConfig)
      if (inferred !== null) return inferred
      return `mock-${fieldName}-${rng.nextInt(1, 10000)}`
    }
  }
}

/**
 * number 타입 필드의 값 생성
 * 필드명에 따라 적절한 범위 결정
 */
export function inferNumberByFieldName(
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): number {
  const name = fieldName.toLowerCase()

  // ID 관련 - MockIdConfig 사용
  if (isIdField(fieldName, idConfig)) {
    const id = generateIdValue(fieldName, index, rng.hashId(16), idConfig)
    return typeof id === 'number' ? id : index + 1
  }

  // 연월 (YYYYMM 형식)
  if (name.includes('yearmonth') || (name.includes('month') && name.includes('year'))) {
    const year = 2024 + rng.nextInt(0, 1)
    const month = rng.nextInt(1, 12)
    return year * 100 + month
  }

  // 연도
  if (name === 'year' || name.endsWith('year')) {
    return rng.nextInt(2020, 2030)
  }

  // 월
  if (name === 'month' || name.endsWith('month')) {
    return rng.nextInt(1, 12)
  }

  // 일
  if ((name === 'day' || name.endsWith('day')) && !name.includes('days')) {
    return rng.nextInt(1, 28)
  }

  // 페이지네이션
  if (name === 'page' || name === 'pagenumber' || name === 'currentpage') return rng.nextInt(1, 10)
  if (name === 'limit' || name === 'size' || name === 'pagesize') return rng.nextInt(10, 50)
  if (name === 'total' || name === 'totalcount' || name === 'totalitems') return rng.nextInt(100, 10000)
  if (name === 'totalpages') return rng.nextInt(5, 100)
  if (name === 'offset') return rng.nextInt(0, 500)

  // 카운트/수량 관련 - 넓은 범위
  if (name.includes('count') || name.includes('quantity') || name.includes('num')) {
    return rng.nextInt(0, 10000)
  }

  // 조회수/좋아요 등 통계
  if (name.includes('views') || name.includes('likes') || name.includes('hits') || name.includes('clicks')) {
    return rng.nextInt(0, 100000)
  }

  // 변화량 (change, diff)
  if (name.includes('change') || name.includes('diff') || name.includes('delta')) {
    return rng.nextInt(-1000, 1000)
  }

  // 비율/퍼센트 (0-100)
  if (name.includes('rate') || name.includes('ratio') || name.includes('percent') || name.includes('percentage')) {
    return rng.nextInt(0, 100)
  }

  // 금액/가격 - 큰 범위
  if (name.includes('amount') || name.includes('price') || name.includes('cost') || name.includes('fee') || name.includes('commission') || name.includes('salary') || name.includes('budget')) {
    return rng.nextInt(1000, 10000000)
  }

  // 나이
  if (name.includes('age')) {
    return rng.nextInt(1, 100)
  }

  // 점수/스코어
  if (name.includes('score') || name.includes('point') || name.includes('rating')) {
    return rng.nextInt(0, 100)
  }

  // 레벨/등급
  if (name.includes('level') || name.includes('grade') || name.includes('tier')) {
    return rng.nextInt(1, 10)
  }

  // 순서/우선순위
  if (name.includes('sequence') || name.includes('order') || name.includes('priority') || name.includes('rank') || name === 'sort' || name === 'index') {
    return rng.nextInt(1, 1000)
  }

  // 기간 (일/월/주/년 수)
  if (name.includes('days') || name.includes('months') || name.includes('weeks') || name.includes('years') || name.includes('duration')) {
    return rng.nextInt(1, 365)
  }

  // 거리/길이/크기
  if (name.includes('distance') || name.includes('length') || name.includes('width') || name.includes('height') || name.includes('size')) {
    return rng.nextInt(1, 10000)
  }

  // 기본값: 넓은 범위
  return rng.nextInt(0, 100000)
}

/**
 * boolean 타입 필드의 값 생성
 */
export function inferBooleanByFieldName(fieldName: string, rng: SeededRandom): boolean {
  const name = fieldName.toLowerCase()

  // 특정 필드명은 true 확률 조정
  if (name.includes('enabled') || name.includes('active') || name.includes('valid') || name.includes('success')) {
    return rng.next() > 0.3 // 70% true
  }
  if (name.includes('deleted') || name.includes('disabled') || name.includes('expired') || name.includes('blocked')) {
    return rng.next() > 0.7 // 30% true
  }

  return rng.next() > 0.5
}

/**
 * Date 타입 필드의 값 생성
 */
export function inferDateByFieldName(fieldName: string, rng: SeededRandom): string {
  const name = fieldName.toLowerCase()
  const now = Date.now()

  // 생성일/등록일 - 과거
  if (name.includes('created') || name.includes('registered') || name.includes('joined')) {
    const offset = rng.nextInt(-365, -1) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 수정일/업데이트 - 최근
  if (name.includes('updated') || name.includes('modified')) {
    const offset = rng.nextInt(-30, 0) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 만료일/마감일 - 미래
  if (name.includes('expir') || name.includes('deadline') || name.includes('due')) {
    const offset = rng.nextInt(1, 365) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 시작일
  if (name.includes('start') || name.includes('begin')) {
    const offset = rng.nextInt(-30, 30) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 종료일
  if (name.includes('end') || name.includes('finish')) {
    const offset = rng.nextInt(1, 90) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 기본: -1년 ~ +1달 범위
  const offset = rng.nextInt(-365, 30) * 24 * 60 * 60 * 1000
  return new Date(now + offset).toISOString()
}

/**
 * string 타입 필드의 값 생성
 */
export function inferStringByFieldName(
  fieldName: string,
  rng: SeededRandom,
  index: number = 0,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): string {
  // 필드명 기반 추론 시도
  const inferred = inferValueByFieldName(fieldName, rng, index, idConfig)
  if (inferred !== null && typeof inferred === 'string') {
    return inferred
  }

  // 기본 문자열
  return `mock-${fieldName}-${rng.nextInt(1, 10000)}`
}

/**
 * 필드명에서 타입을 추측하여 적절한 값 생성
 * (unknown/any/object 타입인 경우 사용)
 */
export function inferTypeFromFieldName(
  fieldName: string,
  rng: SeededRandom,
  index: number,
  idConfig: MockIdConfig = DEFAULT_ID_CONFIG,
): unknown {
  const name = fieldName.toLowerCase()

  // ID 관련 - MockIdConfig 사용 (먼저 체크)
  if (isIdField(fieldName, idConfig)) {
    return generateIdValue(fieldName, index, rng.hashId(16), idConfig)
  }

  // 연월 (YYYYMM 형식)
  if (name.includes('yearmonth')) {
    const year = 2024 + rng.nextInt(0, 1)
    const month = rng.nextInt(1, 12)
    return year * 100 + month
  }

  // 숫자 관련
  if (name.includes('count') || name.includes('num') || name.includes('amount')
    || name.includes('size') || name.includes('total') || name.includes('views')
    || name.includes('likes') || name.includes('price') || name.includes('age')
    || name.includes('quantity') || name.includes('index') || name.includes('order')
    || name.includes('sequence') || name.includes('priority') || name.includes('rank')
    || name.includes('fee') || name.includes('commission')) {
    return rng.nextInt(0, 1000)
  }

  // 비율/퍼센트
  if (name.includes('rate') || name.includes('ratio') || name.includes('percent')) {
    return `${rng.nextInt(1, 100)}`
  }

  // boolean 관련
  if (name.startsWith('is') || name.startsWith('has') || name.startsWith('can')
    || name.startsWith('should') || name.startsWith('will') || name.includes('enabled')
    || name.includes('active') || name.includes('visible') || name.includes('valid')
    || name === 'result' || name === 'success' || name.includes('complete')) {
    return rng.next() > 0.5
  }

  // 날짜 관련
  if (name.includes('date') || name.endsWith('at') || name.includes('time')
    || name.includes('created') || name.includes('updated') || name.includes('modified')
    || name.includes('deadline')) {
    const now = Date.now()
    const offset = rng.nextInt(-365, 30) * 24 * 60 * 60 * 1000
    return new Date(now + offset).toISOString()
  }

  // 기간 (일/월 수)
  if (name.includes('days') || name.includes('months') || name.includes('weeks') || name.includes('years')) {
    return rng.nextInt(1, 30)
  }

  // 특정 일 (payday 등)
  if (name.includes('day') && !name.includes('days')) {
    return rng.nextInt(1, 28)
  }

  // URL 관련
  if (name.includes('url') || name.includes('link') || name.includes('href')) {
    return `https://example.com/${fieldName}/${rng.nextInt(1, 1000)}`
  }

  // 이미지 관련
  if (name.includes('image') || name.includes('thumbnail') || name.includes('avatar')
    || name.includes('photo') || name.includes('picture')) {
    return `https://picsum.photos/seed/${rng.nextInt(1, 1000)}/200/200`
  }

  // 파일/첨부파일
  if (name.includes('file') || name.includes('attachment') || name.includes('document')) {
    return `https://storage.example.com/files/${rng.hashId(12)}.pdf`
  }

  // 상태/단계
  if (name.includes('status') || name.includes('state') || name.includes('stage')) {
    return rng.pick(['ACTIVE', 'INACTIVE', 'PENDING', 'COMPLETED'])
  }

  // 스케일/레벨
  if (name.includes('scale') || name.includes('level') || name.includes('grade') || name.includes('tier')) {
    return rng.pick(['SMALL', 'MEDIUM', 'LARGE'])
  }

  // 이유/사유
  if (name.includes('reason') || name.includes('cause')) {
    return rng.pick(['사용자 요청', '시스템 처리', '기간 만료'])
  }

  // 기본값: 문자열
  return `mock-${fieldName}-${rng.nextInt(1, 1000)}`
}

/**
 * 응답 타입 분석 결과
 */
export interface ResponseTypeInfo {
  /** 실제 데이터 모델명 */
  modelName: string
  /** 리스트 응답 여부 */
  isList: boolean
  /** 배열 필드명 (posts, items, comments 등) - 응답 구조 생성시 사용 */
  listFieldName?: string
  /** 래퍼 응답 타입인 경우 원본 타입명 */
  wrapperType?: string
}

/**
 * 응답 타입에서 실제 데이터 모델명 추출
 * 다양한 배열 필드명을 지원 (items, data, posts, comments 등)
 */
export function extractDataModelName(
  responseType: string,
  models: Map<string, ParsedModelSchema>,
): ResponseTypeInfo {
  // 직접 배열 타입 처리: Array<Type> 또는 Type[]
  const arrayMatch = responseType.match(/^Array<(.+)>$/) || responseType.match(/^(.+)\[\]$/)
  if (arrayMatch) {
    const innerType = arrayMatch[1]!.trim()
    return {
      modelName: innerType,
      isList: true,
      // listFieldName이 없으면 직접 배열 반환 (wrapper 없음)
      listFieldName: undefined,
      wrapperType: undefined,
    }
  }

  const schema = models.get(responseType)

  if (schema) {
    // 배열 필드 우선순위: items > data > posts > comments > 기타 배열 필드
    const priorityFields = ['items', 'data', 'posts', 'comments', 'results', 'records', 'list']

    // 우선순위 필드 먼저 확인
    for (const fieldName of priorityFields) {
      const field = schema.fields.find(f => f.name === fieldName && f.isArray)
      if (field && field.refType) {
        return {
          modelName: field.refType,
          isList: true,
          listFieldName: fieldName,
          wrapperType: responseType,
        }
      }
    }

    // 우선순위에 없는 배열 필드 확인
    const arrayField = schema.fields.find(f => f.isArray && f.refType)
    if (arrayField && arrayField.refType) {
      return {
        modelName: arrayField.refType,
        isList: true,
        listFieldName: arrayField.name,
        wrapperType: responseType,
      }
    }

    // 단일 참조 필드 확인 (data 필드가 객체인 경우)
    const dataField = schema.fields.find(f => f.name === 'data' && !f.isArray)
    if (dataField?.refType) {
      return {
        modelName: dataField.refType,
        isList: false,
        wrapperType: responseType,
      }
    }
  }

  return { modelName: responseType, isList: false }
}

/**
 * 순환 참조 감지를 위한 최대 깊이
 */
const MAX_RECURSION_DEPTH = 5

/**
 * 스키마 기반 Mock 데이터 생성기 클래스
 */
export class SchemaMockGenerator {
  private models: Map<string, ParsedModelSchema>
  private dataStore: Map<string, unknown[]> = new Map()
  private idConfig: MockIdConfig

  constructor(models: Map<string, ParsedModelSchema>, idConfig: MockIdConfig = DEFAULT_ID_CONFIG) {
    this.models = models
    this.idConfig = idConfig
  }

  /**
   * 모델 스키마 기반 단일 객체 생성
   */
  generateOne(modelName: string, seed?: string | number, index: number = 0): Record<string, unknown> {
    return this.generateOneInternal(modelName, seed, index, new Set<string>(), 0)
  }

  /**
   * 내부 구현: 순환 참조 감지를 위한 재귀 생성
   */
  private generateOneInternal(
    modelName: string,
    seed: string | number | undefined,
    index: number,
    visitedModels: Set<string>,
    depth: number,
  ): Record<string, unknown> {
    const schema = this.models.get(modelName)
    if (!schema) {
      return {}
    }

    // 순환 참조 감지 - 같은 모델을 다시 만나면 빈 객체 반환
    if (visitedModels.has(modelName) && depth > 1) {
      return {}
    }

    // 최대 깊이 초과시 빈 객체 반환
    if (depth >= MAX_RECURSION_DEPTH) {
      return {}
    }

    // enum인 경우
    if (schema.enumValues && schema.enumValues.length > 0) {
      const rng = new SeededRandom(seed ?? modelName)
      return { value: rng.pick(schema.enumValues) }
    }

    // 현재 모델을 방문 목록에 추가
    const newVisited = new Set(visitedModels)
    newVisited.add(modelName)

    const rng = new SeededRandom(seed ?? `${modelName}-${index}`)
    const result: Record<string, unknown> = {}

    for (const field of schema.fields) {
      const value = this.generateFieldInternal(field, rng, index, newVisited, depth)
      if (value !== undefined) {
        // Use jsonKey for the actual JSON output, fallback to name
        const outputKey = field.jsonKey || field.name
        result[outputKey] = value
      }
    }

    return result
  }

  /**
   * ID 부여된 단일 객체 생성 (Pagination용)
   * 주어진 ID를 모델의 ID 필드에 설정하여 cursor와 응답 ID가 일치하도록 함
   * @param modelName 모델명
   * @param itemId 아이템 ID (string 또는 number)
   * @param seed 생성 seed
   * @param index 인덱스
   */
  generateOneWithId(modelName: string, itemId: string | number, seed?: string | number, index: number = 0): Record<string, unknown> {
    const item = this.generateOne(modelName, seed ?? `${modelName}-${itemId}`, index)

    // ID 필드 찾기 및 주어진 ID로 덮어쓰기
    const idFieldName = this.findIdFieldName(modelName)
    if (idFieldName) {
      const outputKey = this.getOutputKey(modelName, idFieldName)
      item[outputKey] = itemId
    }
    else if (!('id' in item)) {
      // ID 필드를 찾지 못했고 'id' 키도 없으면 추가
      item.id = itemId
    }
    else {
      // 기존 'id' 키가 있으면 덮어쓰기
      item.id = itemId
    }

    return item
  }

  /**
   * 모델의 ID 필드명 찾기 (MockIdConfig 기반)
   * public으로 변경하여 CursorPaginationManager에서 사용 가능
   */
  findIdFieldName(modelName: string): string | null {
    const schema = this.models.get(modelName)
    if (!schema) return null

    // MockIdConfig 기반으로 ID 필드 찾기
    for (const field of schema.fields) {
      if (isIdField(field.name, this.idConfig)) {
        return field.name
      }
    }

    return null
  }

  /**
   * 필드의 출력 키 가져오기 (jsonKey 또는 name)
   */
  private getOutputKey(modelName: string, fieldName: string): string {
    const schema = this.models.get(modelName)
    if (!schema) return fieldName

    const field = schema.fields.find(f => f.name === fieldName)
    return field?.jsonKey || fieldName
  }

  /**
   * 필드 값 생성 (순환 참조 감지 포함)
   */
  private generateFieldInternal(
    field: ParsedModelField,
    rng: SeededRandom,
    index: number,
    visitedModels: Set<string>,
    depth: number,
  ): unknown {
    // optional이고 70% 확률로 undefined가 아님
    if (!field.required && rng.next() > 0.7) {
      return undefined
    }

    // 참조 타입인 경우
    if (field.refType) {
      const refSchema = this.models.get(field.refType)

      // enum 참조
      if (refSchema?.enumValues) {
        const value = rng.pick(refSchema.enumValues)
        return field.isArray ? [value] : value
      }

      // 순환 참조 감지 - 이미 방문한 모델이면 빈 객체/배열 반환
      if (visitedModels.has(field.refType)) {
        return field.isArray ? [] : {}
      }

      // 객체 참조
      if (field.isArray) {
        const count = rng.nextInt(1, 3)
        return Array.from({ length: count }, (_, i) =>
          this.generateOneInternal(field.refType!, `${field.refType}-${index}-${i}`, i, visitedModels, depth + 1),
        )
      }

      return this.generateOneInternal(field.refType, `${field.refType}-${index}`, index, visitedModels, depth + 1)
    }

    // 배열인 경우
    if (field.isArray) {
      const count = rng.nextInt(1, 5)
      return Array.from({ length: count }, (_, i) =>
        generateValueByType(field.type, field.name, rng, i, this.idConfig),
      )
    }

    return generateValueByType(field.type, field.name, rng, index, this.idConfig)
  }

  /**
   * 리스트 데이터 생성 (캐시 지원 - Pagination)
   * @deprecated Use pagination/page-manager.ts instead for enhanced pagination
   */
  generateList(
    modelName: string,
    options: {
      page?: number
      limit?: number
      total?: number
      seed?: string
    } = {},
  ): {
    items: Record<string, unknown>[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  } {
    const { page = 1, limit = 20, total = 100, seed = modelName } = options
    const cacheKey = `${modelName}-${seed}`

    let allItems = this.dataStore.get(cacheKey) as Record<string, unknown>[] | undefined

    if (!allItems || allItems.length < total) {
      allItems = Array.from({ length: total }, (_, i) =>
        this.generateOne(modelName, `${seed}-${i}`, i),
      )
      this.dataStore.set(cacheKey, allItems)
    }

    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, total)
    const items = allItems.slice(startIndex, endIndex)

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * 커서 기반 리스트 생성 (무한 스크롤용)
   * @deprecated Use pagination/cursor-manager.ts instead for enhanced pagination
   */
  generateCursorList(
    modelName: string,
    options: {
      cursor?: string
      limit?: number
      total?: number
      seed?: string
    } = {},
  ): {
    items: Record<string, unknown>[]
    nextCursor?: string
    prevCursor?: string
    hasMore: boolean
  } {
    const { cursor, limit = 20, total = 100, seed = modelName } = options
    const cacheKey = `${modelName}-${seed}`

    let allItems = this.dataStore.get(cacheKey) as Record<string, unknown>[] | undefined

    if (!allItems || allItems.length < total) {
      allItems = Array.from({ length: total }, (_, i) =>
        this.generateOne(modelName, `${seed}-${i}`, i),
      )
      this.dataStore.set(cacheKey, allItems)
    }

    // 커서 파싱 (base64 encoded index)
    let startIndex = 0
    if (cursor) {
      try {
        startIndex = Number.parseInt(Buffer.from(cursor, 'base64').toString('utf-8'), 10)
      }
      catch {
        startIndex = 0
      }
    }

    const endIndex = Math.min(startIndex + limit, total)
    const items = allItems.slice(startIndex, endIndex)
    const hasMore = endIndex < total

    return {
      items,
      nextCursor: hasMore ? Buffer.from(String(endIndex)).toString('base64') : undefined,
      prevCursor: startIndex > 0 ? Buffer.from(String(Math.max(0, startIndex - limit))).toString('base64') : undefined,
      hasMore,
    }
  }

  /**
   * 모델 가져오기
   */
  getModels(): Map<string, ParsedModelSchema> {
    return this.models
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.dataStore.clear()
  }
}

// Re-export for convenience
export { SeededRandom, hashString }
