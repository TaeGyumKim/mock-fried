<template>
  <div class="container">
    <header class="header">
      <h1>Mock-Fried Client Package Mode (v7 Format)</h1>
      <p class="subtitle">
        Nuxt3 Mock API Module - openapi-generator v7 Format Test
      </p>
      <div class="links">
        <NuxtLink
          to="/api-test"
          class="btn"
        >
          API Tester
        </NuxtLink>
      </div>
    </header>

    <!-- REST API Demo -->
    <section class="section">
      <h2>REST API Demo (v7 Format)</h2>
      <p class="info-text">
        새로운 openapi-generator v7 형식: inline path, dot notation
      </p>
      <div class="buttons">
        <button @click="restGetUsers">
          GET /users
        </button>
        <button @click="restGetUser">
          GET /users/1
        </button>
        <button @click="restGetPosts">
          GET /posts
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
        openapi-generator v7 형식으로 생성된 TypeScript 클라이언트를 사용한 API 호출
      </p>
      <div class="buttons">
        <button @click="clientGetUsers">
          UsersApi.getUsers()
        </button>
        <button @click="clientGetPosts">
          PostsApi.getPosts()
        </button>
        <button @click="clientGetHealth">
          HealthApi.getHealth()
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

    <!-- Multiple Path Params Demo -->
    <section class="section">
      <h2>Multiple Path Parameters Demo</h2>
      <p class="info-text">
        다중 path 파라미터 with chained .replace() 테스트
      </p>
      <div class="buttons">
        <button @click="getComments">
          GET /posts/{postId}/comments
        </button>
        <button @click="getComment">
          GET /posts/{postId}/comments/{commentId}
        </button>
      </div>
      <div
        v-if="nestedResult"
        class="result"
      >
        <pre>{{ JSON.stringify(nestedResult, null, 2) }}</pre>
      </div>
      <div
        v-if="nestedError"
        class="error"
      >
        {{ nestedError }}
      </div>
    </section>

    <!-- Info Section -->
    <section class="info">
      <h2>v7 Format 특징</h2>
      <ul>
        <li><code>path: \`/users/{id}\`.replace(...)</code> - inline path 형식</li>
        <li><code>requestParameters.param</code> - dot notation 사용</li>
        <li>다중 path param에 chained <code>.replace()</code> 호출</li>
        <li><code>=== null || === undefined</code> null 체크</li>
      </ul>
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
const usersApi = new UsersApi(config)
const postsApi = new PostsApi(config)
const healthApi = new HealthApi(config)
const commentsApi = new CommentsApi(config)

// State
const restResult = ref<unknown>(null)
const restError = ref<string | null>(null)
const clientResult = ref<unknown>(null)
const clientError = ref<string | null>(null)
const nestedResult = ref<unknown>(null)
const nestedError = ref<string | null>(null)

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

async function restGetPosts() {
  restResult.value = null
  restError.value = null
  try {
    const data = await $fetch('/mock/posts')
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

async function clientGetHealth() {
  clientResult.value = null
  clientError.value = null
  try {
    const data = await healthApi.getHealth()
    clientResult.value = data
  }
  catch (e) {
    clientError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

// Nested path params handlers
async function getComments() {
  nestedResult.value = null
  nestedError.value = null
  try {
    const data = await commentsApi.getComments({ postId: 'post-123' })
    nestedResult.value = data
  }
  catch (e) {
    nestedError.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

async function getComment() {
  nestedResult.value = null
  nestedError.value = null
  try {
    const data = await commentsApi.getCommentById({ postId: 'post-123', commentId: 'comment-456' })
    nestedResult.value = data
  }
  catch (e) {
    nestedError.value = e instanceof Error ? e.message : 'Unknown error'
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
