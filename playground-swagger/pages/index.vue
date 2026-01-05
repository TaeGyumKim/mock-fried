<template>
  <div class="container">
    <header class="header">
      <h1>Mock-Fried Swagger 2.0 Demo</h1>
      <p class="subtitle">
        Testing Swagger 2.0 Spec File Support
      </p>
    </header>

    <!-- Schema Info Section -->
    <section class="section">
      <h2>Schema Info</h2>
      <div class="buttons">
        <button @click="fetchSchema">
          GET /__schema
        </button>
      </div>
      <div
        v-if="schemaLoading"
        class="loading"
      >
        Loading...
      </div>
      <pre
        v-if="schemaResult"
        class="result"
      >{{ JSON.stringify(schemaResult, null, 2) }}</pre>
      <div
        v-if="schemaError"
        class="error"
      >
        {{ schemaError }}
      </div>
    </section>

    <!-- Users API Section -->
    <section class="section">
      <h2>Users API (Page Pagination)</h2>
      <div class="buttons">
        <button @click="fetchUsers">
          GET /users
        </button>
        <button @click="fetchUser('user-1')">
          GET /users/user-1
        </button>
      </div>
      <div
        v-if="usersLoading"
        class="loading"
      >
        Loading...
      </div>
      <pre
        v-if="usersResult"
        class="result"
      >{{ JSON.stringify(usersResult, null, 2) }}</pre>
      <div
        v-if="usersError"
        class="error"
      >
        {{ usersError }}
      </div>
    </section>

    <!-- Posts API Section (Cursor) -->
    <section class="section">
      <h2>Posts API (Cursor Pagination)</h2>
      <div class="buttons">
        <button @click="fetchPosts">
          GET /posts
        </button>
        <button @click="fetchPostsWithCursor">
          GET /posts (with cursor)
        </button>
      </div>
      <div
        v-if="postsLoading"
        class="loading"
      >
        Loading...
      </div>
      <pre
        v-if="postsResult"
        class="result"
      >{{ JSON.stringify(postsResult, null, 2) }}</pre>
      <div
        v-if="postsError"
        class="error"
      >
        {{ postsError }}
      </div>
    </section>

    <!-- Edge Cases Section -->
    <section class="section">
      <h2>Edge Cases</h2>
      <div class="buttons">
        <button @click="fetchPrimitiveInt">
          GET /stats/count (integer)
        </button>
        <button @click="fetchPrimitiveString">
          GET /stats/status (string)
        </button>
        <button @click="fetchPrimitiveBool">
          GET /stats/enabled (boolean)
        </button>
        <button @click="fetchDirectArray">
          GET /featured/products (array)
        </button>
      </div>
      <div
        v-if="edgeLoading"
        class="loading"
      >
        Loading...
      </div>
      <pre
        v-if="edgeResult"
        class="result"
      >{{ JSON.stringify(edgeResult, null, 2) }}</pre>
      <div
        v-if="edgeError"
        class="error"
      >
        {{ edgeError }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// Schema state
const schemaResult = ref<unknown>(null)
const schemaLoading = ref(false)
const schemaError = ref<string | null>(null)

// Users state
const usersResult = ref<unknown>(null)
const usersLoading = ref(false)
const usersError = ref<string | null>(null)

// Posts state
const postsResult = ref<unknown>(null)
const postsLoading = ref(false)
const postsError = ref<string | null>(null)
const lastCursor = ref<string | null>(null)

// Edge cases state
const edgeResult = ref<unknown>(null)
const edgeLoading = ref(false)
const edgeError = ref<string | null>(null)

// Schema handlers
async function fetchSchema() {
  schemaLoading.value = true
  schemaError.value = null
  try {
    schemaResult.value = await $fetch('/mock/__schema')
  }
  catch (e) {
    schemaError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    schemaLoading.value = false
  }
}

// Users handlers
async function fetchUsers() {
  usersLoading.value = true
  usersError.value = null
  try {
    usersResult.value = await $fetch('/mock/users', {
      query: { page: 1, limit: 5 },
    })
  }
  catch (e) {
    usersError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    usersLoading.value = false
  }
}

async function fetchUser(id: string) {
  usersLoading.value = true
  usersError.value = null
  try {
    usersResult.value = await $fetch(`/mock/users/${id}`)
  }
  catch (e) {
    usersError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    usersLoading.value = false
  }
}

// Posts handlers
async function fetchPosts() {
  postsLoading.value = true
  postsError.value = null
  try {
    const result = await $fetch<{ nextCursor?: string }>('/mock/posts', {
      query: { limit: 5 },
    })
    postsResult.value = result
    lastCursor.value = result.nextCursor || null
  }
  catch (e) {
    postsError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    postsLoading.value = false
  }
}

async function fetchPostsWithCursor() {
  postsLoading.value = true
  postsError.value = null
  try {
    const result = await $fetch<{ nextCursor?: string }>('/mock/posts', {
      query: { limit: 5, cursor: lastCursor.value },
    })
    postsResult.value = result
    lastCursor.value = result.nextCursor || null
  }
  catch (e) {
    postsError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    postsLoading.value = false
  }
}

// Edge cases handlers
async function fetchPrimitiveInt() {
  edgeLoading.value = true
  edgeError.value = null
  try {
    edgeResult.value = await $fetch('/mock/stats/count')
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    edgeLoading.value = false
  }
}

async function fetchPrimitiveString() {
  edgeLoading.value = true
  edgeError.value = null
  try {
    edgeResult.value = await $fetch('/mock/stats/status')
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    edgeLoading.value = false
  }
}

async function fetchPrimitiveBool() {
  edgeLoading.value = true
  edgeError.value = null
  try {
    edgeResult.value = await $fetch('/mock/stats/enabled')
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    edgeLoading.value = false
  }
}

async function fetchDirectArray() {
  edgeLoading.value = true
  edgeError.value = null
  try {
    edgeResult.value = await $fetch('/mock/featured/products')
  }
  catch (e) {
    edgeError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    edgeLoading.value = false
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

h1 {
  color: #f59e0b;
  margin-bottom: 0.5rem;
}

.header {
  margin-bottom: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1rem;
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
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.25rem;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: #f59e0b;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #d97706;
}

button:active {
  background: #b45309;
}

.loading {
  color: #666;
  font-style: italic;
}

.result {
  background: #1a1a1a;
  color: #f59e0b;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
  max-height: 300px;
}

.error {
  color: #dc3545;
  padding: 0.5rem;
  background: #fff5f5;
  border-radius: 6px;
  border: 1px solid #dc3545;
}
</style>
