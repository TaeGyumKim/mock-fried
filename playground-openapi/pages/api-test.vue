<template>
  <div class="container">
    <header class="header">
      <h1>OpenAPI Mock Tester</h1>
      <p class="subtitle">
        Spec File Mode: $fetch로 Mock API 직접 테스트
      </p>
      <NuxtLink
        to="/"
        class="back-link"
      >
        &larr; Back to Demo
      </NuxtLink>
    </header>

    <!-- API Selection -->
    <section class="section">
      <h2>API 선택</h2>
      <div class="api-grid">
        <div
          v-for="api in apiList"
          :key="api.name"
          class="api-card"
          :class="{ active: selectedApi === api.name }"
          @click="selectApi(api.name)"
        >
          <div class="api-name">
            {{ api.name }}
          </div>
          <div class="api-desc">
            {{ api.description }}
          </div>
        </div>
      </div>
    </section>

    <!-- Endpoint Selection -->
    <section
      v-if="selectedApi"
      class="section"
    >
      <h2>{{ selectedApi }} Endpoints</h2>
      <div class="endpoint-list">
        <button
          v-for="endpoint in currentEndpoints"
          :key="endpoint.id"
          class="endpoint-btn"
          :class="{ active: selectedEndpoint?.id === endpoint.id }"
          @click="selectEndpoint(endpoint)"
        >
          <span
            class="method"
            :class="endpoint.method.toLowerCase()"
          >{{ endpoint.method }}</span>
          <span class="path">{{ endpoint.path }}</span>
        </button>
      </div>
    </section>

    <!-- Parameters -->
    <section
      v-if="selectedEndpoint"
      class="section"
    >
      <h2>Parameters</h2>
      <div class="params-form">
        <div
          v-for="param in selectedEndpoint.params"
          :key="param.name"
          class="param-row"
        >
          <label :for="param.name">
            {{ param.name }}
            <span
              v-if="param.required"
              class="required"
            >*</span>
            <span class="param-in">({{ param.in }})</span>
          </label>
          <input
            :id="param.name"
            v-model="paramValues[param.name]"
            :type="param.type === 'number' ? 'number' : 'text'"
            :placeholder="param.placeholder || param.name"
          >
        </div>
        <div
          v-if="selectedEndpoint.params.length === 0"
          class="no-params"
        >
          파라미터 없음
        </div>
      </div>
      <button
        class="execute-btn"
        :disabled="loading"
        @click="executeRequest"
      >
        {{ loading ? 'Loading...' : 'Execute' }}
      </button>
    </section>

    <!-- Response -->
    <section
      v-if="response !== null || error"
      class="section"
    >
      <h2>Response</h2>
      <div
        v-if="error"
        class="error"
      >
        {{ error }}
      </div>
      <div
        v-if="responseInfo"
        class="response-info"
      >
        <span
          class="status"
          :class="responseInfo.ok ? 'ok' : 'error'"
        >
          {{ responseInfo.status }}
        </span>
        <span class="time">{{ responseInfo.time }}ms</span>
      </div>
      <pre
        v-if="response !== null"
        class="result"
      >{{ JSON.stringify(response, null, 2) }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
interface EndpointParam {
  name: string
  type: 'string' | 'number'
  in: 'path' | 'query'
  required: boolean
  placeholder?: string
}

interface Endpoint {
  id: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  params: EndpointParam[]
}

// API 목록
const apiList = [
  { name: 'Users', description: '사용자 관리 (CRUD)' },
  { name: 'Products', description: '상품 관리 (CRUD)' },
  { name: 'Orders', description: '주문 관리 (CRUD)' },
  { name: 'Posts', description: '게시글 관리 (커서 페이지네이션)' },
  { name: 'Comments', description: '댓글 관리 (중첩 리소스)' },
  { name: 'Health', description: '헬스 체크 및 시스템 정보' },
]

// 각 API별 엔드포인트 정의
const endpointsByApi: Record<string, Endpoint[]> = {
  Users: [
    {
      id: 'getUsers',
      method: 'GET',
      path: '/users',
      params: [
        { name: 'page', type: 'number', in: 'query', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
        { name: 'status', type: 'string', in: 'query', required: false, placeholder: 'active' },
        { name: 'role', type: 'string', in: 'query', required: false, placeholder: 'user' },
      ],
    },
    {
      id: 'getUserById',
      method: 'GET',
      path: '/users/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'user-123' },
      ],
    },
    {
      id: 'createUser',
      method: 'POST',
      path: '/users',
      params: [
        { name: 'username', type: 'string', in: 'query', required: true, placeholder: 'johndoe' },
        { name: 'email', type: 'string', in: 'query', required: true, placeholder: 'john@example.com' },
      ],
    },
    {
      id: 'deleteUser',
      method: 'DELETE',
      path: '/users/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'user-123' },
      ],
    },
  ],
  Products: [
    {
      id: 'getProducts',
      method: 'GET',
      path: '/products',
      params: [
        { name: 'page', type: 'number', in: 'query', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
        { name: 'category', type: 'string', in: 'query', required: false, placeholder: 'electronics' },
        { name: 'minPrice', type: 'number', in: 'query', required: false, placeholder: '0' },
        { name: 'maxPrice', type: 'number', in: 'query', required: false, placeholder: '1000' },
      ],
    },
    {
      id: 'getProductById',
      method: 'GET',
      path: '/products/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'prod-123' },
      ],
    },
  ],
  Orders: [
    {
      id: 'getOrders',
      method: 'GET',
      path: '/orders',
      params: [
        { name: 'page', type: 'number', in: 'query', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
        { name: 'status', type: 'string', in: 'query', required: false, placeholder: 'pending' },
        { name: 'userId', type: 'string', in: 'query', required: false, placeholder: 'user-123' },
      ],
    },
    {
      id: 'getOrderById',
      method: 'GET',
      path: '/orders/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'order-123' },
      ],
    },
  ],
  Posts: [
    {
      id: 'getPosts',
      method: 'GET',
      path: '/posts',
      params: [
        { name: 'cursor', type: 'string', in: 'query', required: false, placeholder: '' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
        { name: 'authorId', type: 'string', in: 'query', required: false, placeholder: 'user-123' },
      ],
    },
    {
      id: 'getPostById',
      method: 'GET',
      path: '/posts/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'post-123' },
      ],
    },
  ],
  Comments: [
    {
      id: 'getComments',
      method: 'GET',
      path: '/posts/{postId}/comments',
      params: [
        { name: 'postId', type: 'string', in: 'path', required: true, placeholder: 'post-123' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
      ],
    },
  ],
  Health: [
    {
      id: 'getHealth',
      method: 'GET',
      path: '/health',
      params: [],
    },
    {
      id: 'getVersion',
      method: 'GET',
      path: '/version',
      params: [],
    },
    {
      id: 'ping',
      method: 'GET',
      path: '/ping',
      params: [],
    },
    {
      id: 'getTags',
      method: 'GET',
      path: '/tags',
      params: [],
    },
  ],
}

// State
const selectedApi = ref<string | null>(null)
const selectedEndpoint = ref<Endpoint | null>(null)
const paramValues = ref<Record<string, unknown>>({})
const response = ref<unknown>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const responseInfo = ref<{ status: number, ok: boolean, time: number } | null>(null)

// Computed
const currentEndpoints = computed(() => {
  if (!selectedApi.value) return []
  return endpointsByApi[selectedApi.value] || []
})

// Methods
function selectApi(apiName: string) {
  selectedApi.value = apiName
  selectedEndpoint.value = null
  paramValues.value = {}
  response.value = null
  error.value = null
  responseInfo.value = null
}

function selectEndpoint(endpoint: Endpoint) {
  selectedEndpoint.value = endpoint
  // 기본값 설정
  paramValues.value = {}
  endpoint.params.forEach((param) => {
    if (param.type === 'number' && param.placeholder) {
      paramValues.value[param.name] = Number.parseInt(param.placeholder)
    }
  })
  response.value = null
  error.value = null
  responseInfo.value = null
}

function buildUrl(endpoint: Endpoint, params: Record<string, unknown>): string {
  let url = `/mock${endpoint.path}`

  // Path 파라미터 치환
  endpoint.params
    .filter(p => p.in === 'path')
    .forEach((param) => {
      const value = params[param.name]
      if (value !== undefined && value !== '') {
        url = url.replace(`{${param.name}}`, String(value))
      }
    })

  // Query 파라미터 추가
  const queryParams = endpoint.params
    .filter(p => p.in === 'query')
    .filter(p => params[p.name] !== undefined && params[p.name] !== '')
    .map(p => `${p.name}=${encodeURIComponent(String(params[p.name]))}`)

  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`
  }

  return url
}

async function executeRequest() {
  if (!selectedEndpoint.value) return

  loading.value = true
  error.value = null
  response.value = null
  responseInfo.value = null

  const startTime = Date.now()
  const url = buildUrl(selectedEndpoint.value, paramValues.value)

  try {
    const result = await $fetch(url, {
      method: selectedEndpoint.value.method,
    })
    response.value = result
    responseInfo.value = {
      status: 200,
      ok: true,
      time: Date.now() - startTime,
    }
  }
  catch (e: unknown) {
    const err = e as { statusCode?: number, message?: string, data?: unknown }
    error.value = err.message || 'Unknown error'
    response.value = err.data || null
    responseInfo.value = {
      status: err.statusCode || 500,
      ok: false,
      time: Date.now() - startTime,
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
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

.back-link {
  display: inline-block;
  color: #4990e2;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-link:hover {
  text-decoration: underline;
}

.section {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #fafafa;
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.1rem;
}

/* API Grid */
.api-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.api-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.api-card:hover {
  border-color: #00dc82;
  transform: translateY(-2px);
}

.api-card.active {
  border-color: #00dc82;
  background: #e8fff4;
}

.api-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.api-desc {
  font-size: 0.8rem;
  color: #666;
}

/* Endpoint List */
.endpoint-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.endpoint-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
}

.endpoint-btn:hover {
  border-color: #00dc82;
  background: #f8f8f8;
}

.endpoint-btn.active {
  border-color: #00dc82;
  background: #e8fff4;
}

.method {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}

.method.get {
  background: #61affe;
  color: white;
}

.method.post {
  background: #49cc90;
  color: white;
}

.method.put {
  background: #fca130;
  color: white;
}

.method.delete {
  background: #f93e3e;
  color: white;
}

.method.patch {
  background: #50e3c2;
  color: white;
}

.path {
  font-family: monospace;
  color: #333;
}

/* Parameters Form */
.params-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.param-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.param-row label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.param-in {
  color: #999;
  font-weight: 400;
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

.param-row input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.param-row input:focus {
  outline: none;
  border-color: #00dc82;
}

.no-params {
  color: #999;
  font-style: italic;
  font-size: 0.9rem;
}

.execute-btn {
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  background: #00dc82;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.execute-btn:hover:not(:disabled) {
  background: #00b368;
}

.execute-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Response */
.response-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.85rem;
}

.status.ok {
  background: #d4edda;
  color: #155724;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
}

.time {
  color: #666;
  font-size: 0.85rem;
}

.result {
  background: #1a1a1a;
  color: #00dc82;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  max-height: 500px;
  overflow-y: auto;
}

.error {
  color: #dc3545;
  padding: 0.75rem;
  background: #fff5f5;
  border-radius: 6px;
  border: 1px solid #dc3545;
  margin-bottom: 0.75rem;
}
</style>
