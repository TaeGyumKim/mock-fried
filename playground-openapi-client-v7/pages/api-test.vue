<template>
  <div class="container">
    <header class="header">
      <h1>OpenAPI Client v7 Tester</h1>
      <p class="subtitle">
        Client Package Mode: openapi-generator v7 형식으로 Mock API 테스트
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
            <span class="param-type">({{ param.in }})</span>
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
import {
  UsersApi,
  PostsApi,
  HealthApi,
  CommentsApi,
  Configuration,
} from '@mock-fried/openapi-client-v7'

// Mock 서버 기본 URL 설정
const config = new Configuration({
  basePath: '/mock',
})

// API 인스턴스들
const apis = {
  Users: new UsersApi(config),
  Posts: new PostsApi(config),
  Health: new HealthApi(config),
  Comments: new CommentsApi(config),
}

interface EndpointParam {
  name: string
  type: 'string' | 'number'
  in: 'path' | 'query' | 'body'
  required: boolean
  placeholder?: string
}

interface Endpoint {
  id: string
  method: string
  path: string
  params: EndpointParam[]
  handler: (params: Record<string, unknown>) => Promise<unknown>
}

// API 목록
const apiList = [
  { name: 'Users', description: '사용자 관리 (Page 페이지네이션)' },
  { name: 'Posts', description: '게시글 관리 (Cursor 페이지네이션)' },
  { name: 'Health', description: '헬스 체크' },
  { name: 'Comments', description: '댓글 관리 (다중 Path Params)' },
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
      ],
      handler: async (p) => {
        return apis.Users.getUsers({
          page: p.page as number,
          limit: p.limit as number,
          status: p.status as 'active' | 'inactive' | 'suspended',
        })
      },
    },
    {
      id: 'getUserById',
      method: 'GET',
      path: '/users/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'user-123' },
      ],
      handler: async (p) => {
        return apis.Users.getUserById({ id: p.id as string })
      },
    },
    {
      id: 'createUser',
      method: 'POST',
      path: '/users',
      params: [
        { name: 'name', type: 'string', in: 'body', required: true, placeholder: 'John Doe' },
        { name: 'email', type: 'string', in: 'body', required: true, placeholder: 'john@example.com' },
      ],
      handler: async (p) => {
        return apis.Users.createUser({
          createUserRequest: {
            name: p.name as string,
            email: p.email as string,
          },
        })
      },
    },
    {
      id: 'deleteUser',
      method: 'DELETE',
      path: '/users/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'user-123' },
      ],
      handler: async (p) => {
        await apis.Users.deleteUser({ id: p.id as string })
        return { success: true, message: 'User deleted' }
      },
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
      ],
      handler: async (p) => {
        return apis.Posts.getPosts({
          cursor: p.cursor as string,
          limit: p.limit as number,
        })
      },
    },
    {
      id: 'getPostById',
      method: 'GET',
      path: '/posts/{postId}',
      params: [
        { name: 'postId', type: 'string', in: 'path', required: true, placeholder: 'post-123' },
      ],
      handler: async (p) => {
        return apis.Posts.getPostById({ postId: p.postId as string })
      },
    },
    {
      id: 'getPostsByAuthor',
      method: 'GET',
      path: '/users/{authorId}/posts',
      params: [
        { name: 'authorId', type: 'string', in: 'path', required: true, placeholder: 'user-123' },
        { name: 'cursor', type: 'string', in: 'query', required: false, placeholder: '' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
      ],
      handler: async (p) => {
        return apis.Posts.getPostsByAuthor({
          authorId: p.authorId as string,
          cursor: p.cursor as string,
          limit: p.limit as number,
        })
      },
    },
  ],
  Health: [
    {
      id: 'getHealth',
      method: 'GET',
      path: '/health',
      params: [],
      handler: async () => {
        return apis.Health.getHealth()
      },
    },
    {
      id: 'getVersion',
      method: 'GET',
      path: '/version',
      params: [],
      handler: async () => {
        return apis.Health.getVersion()
      },
    },
    {
      id: 'ping',
      method: 'GET',
      path: '/ping',
      params: [],
      handler: async () => {
        return apis.Health.ping()
      },
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
      handler: async (p) => {
        return apis.Comments.getComments({
          postId: p.postId as string,
          limit: p.limit as number,
        })
      },
    },
    {
      id: 'getCommentById',
      method: 'GET',
      path: '/posts/{postId}/comments/{commentId}',
      params: [
        { name: 'postId', type: 'string', in: 'path', required: true, placeholder: 'post-123' },
        { name: 'commentId', type: 'string', in: 'path', required: true, placeholder: 'comment-456' },
      ],
      handler: async (p) => {
        return apis.Comments.getCommentById({
          postId: p.postId as string,
          commentId: p.commentId as string,
        })
      },
    },
    {
      id: 'updateComment',
      method: 'PUT',
      path: '/posts/{postId}/comments/{commentId}',
      params: [
        { name: 'postId', type: 'string', in: 'path', required: true, placeholder: 'post-123' },
        { name: 'commentId', type: 'string', in: 'path', required: true, placeholder: 'comment-456' },
        { name: 'content', type: 'string', in: 'body', required: true, placeholder: 'Updated comment' },
      ],
      handler: async (p) => {
        return apis.Comments.updateComment({
          postId: p.postId as string,
          commentId: p.commentId as string,
          content: p.content as string,
        })
      },
    },
    {
      id: 'deleteComment',
      method: 'DELETE',
      path: '/posts/{postId}/comments/{commentId}',
      params: [
        { name: 'postId', type: 'string', in: 'path', required: true, placeholder: 'post-123' },
        { name: 'commentId', type: 'string', in: 'path', required: true, placeholder: 'comment-456' },
      ],
      handler: async (p) => {
        await apis.Comments.deleteComment({
          postId: p.postId as string,
          commentId: p.commentId as string,
        })
        return { success: true, message: 'Comment deleted' }
      },
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

async function executeRequest() {
  if (!selectedEndpoint.value) return

  loading.value = true
  error.value = null
  response.value = null
  responseInfo.value = null

  const startTime = Date.now()

  try {
    const result = await selectedEndpoint.value.handler(paramValues.value)
    response.value = result
    responseInfo.value = {
      status: 200,
      ok: true,
      time: Date.now() - startTime,
    }
  }
  catch (e: unknown) {
    const err = e as { status?: number, message?: string }
    error.value = err.message || 'Unknown error'
    responseInfo.value = {
      status: err.status || 500,
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
  min-width: 55px;
  text-align: center;
}

.method.get { background: #61affe; color: white; }
.method.post { background: #49cc90; color: white; }
.method.put { background: #fca130; color: white; }
.method.delete { background: #f93e3e; color: white; }

.path {
  font-family: monospace;
  color: #333;
}

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

.required { color: #dc3545; }

.param-type {
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

.execute-btn:hover:not(:disabled) { background: #00b368; }
.execute-btn:disabled { background: #ccc; cursor: not-allowed; }

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

.status.ok { background: #d4edda; color: #155724; }
.status.error { background: #f8d7da; color: #721c24; }

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
