<template>
  <div class="container">
    <header class="header">
      <h1>Mock-Fried Client Package Mode</h1>
      <p class="subtitle">
        Nuxt3 Mock API Module - openapi-generator TypeScript Client
      </p>
      <div class="links">
        <NuxtLink
          to="/api-test"
          class="btn"
        >
          API Tester
        </NuxtLink>
        <NuxtLink
          to="/explorer"
          class="btn btn-secondary"
        >
          API Explorer
        </NuxtLink>
      </div>
    </header>

    <!-- REST API Demo -->
    <section class="section">
      <h2>REST API Demo</h2>
      <div class="buttons">
        <button @click="restGetUsers">
          GET /users
        </button>
        <button @click="restGetUser">
          GET /users/1
        </button>
        <button @click="restGetProducts">
          GET /products
        </button>
      </div>
      <div
        v-if="restResult"
        class="result"
      >
        <pre>{{ JSON.stringify(restResult, null, 2) }}</pre>
      </div>
      <div
        v-if="restError"
        class="error"
      >
        {{ restError }}
      </div>
    </section>

    <!-- Generated Client Demo -->
    <section class="section">
      <h2>Generated Client Demo</h2>
      <p class="info-text">
        openapi-generator로 생성된 TypeScript 클라이언트를 사용한 API 호출
      </p>
      <div class="buttons">
        <button @click="clientGetUsers">
          UsersApi.getUsers()
        </button>
        <button @click="clientGetProducts">
          ProductsApi.getProducts()
        </button>
        <button @click="clientGetPosts">
          PostsApi.getPosts()
        </button>
      </div>
      <div
        v-if="clientResult"
        class="result"
      >
        <pre>{{ JSON.stringify(clientResult, null, 2) }}</pre>
      </div>
      <div
        v-if="clientError"
        class="error"
      >
        {{ clientError }}
      </div>
    </section>

    <!-- EdgeCases Demo -->
    <section class="section">
      <h2>EdgeCases Demo</h2>
      <p class="info-text">
        Primitive 응답, 재귀 구조, allOf/oneOf 등 다양한 스키마 테스트
      </p>
      <div class="buttons">
        <button @click="edgeGetCount">
          getTotalCount (number)
        </button>
        <button @click="edgeGetStatus">
          getSystemStatus (string)
        </button>
        <button @click="edgeGetEnabled">
          isFeatureEnabled (boolean)
        </button>
        <button @click="edgeGetReport">
          getReport (nested)
        </button>
        <button @click="edgeGetCategoryTree">
          getCategoryTree (recursive)
        </button>
      </div>
      <div
        v-if="edgeResult"
        class="result"
      >
        <pre>{{ JSON.stringify(edgeResult, null, 2) }}</pre>
      </div>
      <div
        v-if="edgeError"
        class="error"
      >
        {{ edgeError }}
      </div>
    </section>

    <!-- Info Section -->
    <section class="info">
      <h2>Client Package Mode</h2>
      <p>
        mock-fried 모듈이 <code>@mock-fried/openapi-client</code> 패키지를 파싱하여
        자동으로 Mock 엔드포인트를 생성합니다.
      </p>
      <ul>
        <li>openapi-generator로 생성된 TypeScript 클라이언트 패키지 지원</li>
        <li>타입 안전성이 보장된 API 호출</li>
        <li>동일한 Mock 데이터 생성 로직 사용</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  UsersApi,
  ProductsApi,
  PostsApi,
  EdgeCasesApi,
  Configuration,
} from '@mock-fried/openapi-client'

// Mock 서버 기본 URL 설정
const config = new Configuration({
  basePath: '/mock',
})

// API 인스턴스들
const usersApi = new UsersApi(config)
const productsApi = new ProductsApi(config)
const postsApi = new PostsApi(config)
const edgeCasesApi = new EdgeCasesApi(config)

// State
const restResult = ref<unknown>(null)
const restError = ref<string | null>(null)
const clientResult = ref<unknown>(null)
const clientError = ref<string | null>(null)
const edgeResult = ref<unknown>(null)
const edgeError = ref<string | null>(null)

// REST API handlers
async function restGetUsers() {
  restResult.value = null
  restError.value = null
  try {
    const data = await $fetch('/mock/users')
    restResult.value = data
  }
  catch (e) {
    restError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function restGetUser() {
  restResult.value = null
  restError.value = null
  try {
    const data = await $fetch('/mock/users/1')
    restResult.value = data
  }
  catch (e) {
    restError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function restGetProducts() {
  restResult.value = null
  restError.value = null
  try {
    const data = await $fetch('/mock/products')
    restResult.value = data
  }
  catch (e) {
    restError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

// Generated Client handlers
async function clientGetUsers() {
  clientResult.value = null
  clientError.value = null
  try {
    const data = await usersApi.getUsers({ limit: 5 })
    clientResult.value = data
  }
  catch (e) {
    clientError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function clientGetProducts() {
  clientResult.value = null
  clientError.value = null
  try {
    const data = await productsApi.getProducts({ limit: 5 })
    clientResult.value = data
  }
  catch (e) {
    clientError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function clientGetPosts() {
  clientResult.value = null
  clientError.value = null
  try {
    const data = await postsApi.getPosts({ limit: 5 })
    clientResult.value = data
  }
  catch (e) {
    clientError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

// EdgeCases handlers
async function edgeGetCount() {
  edgeResult.value = null
  edgeError.value = null
  try {
    const data = await edgeCasesApi.getTotalCount()
    edgeResult.value = { type: 'number', value: data }
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function edgeGetStatus() {
  edgeResult.value = null
  edgeError.value = null
  try {
    const data = await edgeCasesApi.getSystemStatus()
    edgeResult.value = { type: 'string', value: data }
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function edgeGetEnabled() {
  edgeResult.value = null
  edgeError.value = null
  try {
    const data = await edgeCasesApi.isFeatureEnabled()
    edgeResult.value = { type: 'boolean', value: data }
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function edgeGetReport() {
  edgeResult.value = null
  edgeError.value = null
  try {
    const data = await edgeCasesApi.getReport({ id: 'report-1' })
    edgeResult.value = data
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function edgeGetCategoryTree() {
  edgeResult.value = null
  edgeError.value = null
  try {
    const data = await edgeCasesApi.getCategoryTree({ id: 'cat-root' })
    edgeResult.value = data
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  color: #00dc82;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1rem;
}

.links {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #00dc82;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  transition: background 0.2s;
}

.btn:hover {
  background: #00b368;
}

.btn-secondary {
  background: #4990e2;
}

.btn-secondary:hover {
  background: #3a7bc8;
}

.section {
  margin: 2rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
}

.section h2 {
  margin-top: 0;
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.info-text {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.buttons button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.buttons button:hover {
  border-color: #00dc82;
  background: #e8fff4;
}

.result {
  background: #1a1a1a;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.result pre {
  margin: 0;
  color: #00dc82;
  font-size: 0.85rem;
  line-height: 1.5;
}

.error {
  color: #dc3545;
  padding: 0.75rem;
  background: #fff5f5;
  border-radius: 6px;
  border: 1px solid #dc3545;
}

.info {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f8f8;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
}

.info h2 {
  margin-top: 0;
  color: #333;
}

.info ul {
  margin: 1rem 0 0 0;
  padding-left: 1.5rem;
  color: #666;
}

.info li {
  margin-bottom: 0.5rem;
}

code {
  background: #e8fff4;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
</style>
