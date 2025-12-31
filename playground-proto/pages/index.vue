<template>
  <div class="container">
    <header class="header">
      <h1>Mock-Fried Proto Demo</h1>
      <p class="subtitle">
        Nuxt3 Mock API Module - Protobuf RPC Testing
      </p>
      <div class="nav-links">
        <NuxtLink
          to="/api-test"
          class="nav-link"
        >
          API Tester
        </NuxtLink>
        <NuxtLink
          to="/explorer"
          class="nav-link nav-link-secondary"
        >
          RPC Explorer
        </NuxtLink>
      </div>
    </header>

    <!-- RPC Section -->
    <section class="section">
      <h2>Protobuf RPC Mock</h2>
      <div class="buttons">
        <button @click="rpcGetUser">
          UserService.GetUser
        </button>
        <button @click="rpcListUsers">
          UserService.ListUsers
        </button>
        <button @click="rpcCreateUser">
          UserService.CreateUser
        </button>
      </div>
      <div class="buttons">
        <button @click="rpcGetProduct">
          ProductService.GetProduct
        </button>
        <button @click="rpcListProducts">
          ProductService.ListProducts
        </button>
        <button @click="rpcSearchProducts">
          ProductService.SearchProducts
        </button>
      </div>
      <div
        v-if="rpcLoading"
        class="loading"
      >
        Loading...
      </div>
      <pre
        v-if="rpcResult"
        class="result"
      >{{ JSON.stringify(rpcResult, null, 2) }}</pre>
      <div
        v-if="rpcError"
        class="error"
      >
        {{ rpcError }}
      </div>
    </section>

    <!-- Dynamic Service Access Section -->
    <section class="section">
      <h2>Dynamic Service Access</h2>
      <div class="buttons">
        <button @click="dynamicGetUser">
          $api.UserService.GetUser()
        </button>
        <button @click="dynamicListProducts">
          $api.ProductService.ListProducts()
        </button>
      </div>
      <div
        v-if="dynamicLoading"
        class="loading"
      >
        Loading...
      </div>
      <pre
        v-if="dynamicResult"
        class="result"
      >{{ JSON.stringify(dynamicResult, null, 2) }}</pre>
      <div
        v-if="dynamicError"
        class="error"
      >
        {{ dynamicError }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { $api } = useNuxtApp()

// RPC state
const rpcResult = ref<unknown>(null)
const rpcLoading = ref(false)
const rpcError = ref<string | null>(null)

// Dynamic state
const dynamicResult = ref<unknown>(null)
const dynamicLoading = ref(false)
const dynamicError = ref<string | null>(null)

// RPC handlers - User Service
async function rpcGetUser() {
  rpcLoading.value = true
  rpcError.value = null
  try {
    rpcResult.value = await $api.rpc('UserService', 'GetUser', { id: 1 })
  }
  catch (e) {
    rpcError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    rpcLoading.value = false
  }
}

async function rpcListUsers() {
  rpcLoading.value = true
  rpcError.value = null
  try {
    rpcResult.value = await $api.rpc('UserService', 'ListUsers', {
      page: 1,
      limit: 10,
    })
  }
  catch (e) {
    rpcError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    rpcLoading.value = false
  }
}

async function rpcCreateUser() {
  rpcLoading.value = true
  rpcError.value = null
  try {
    rpcResult.value = await $api.rpc('UserService', 'CreateUser', {
      name: 'New User',
      email: 'newuser@example.com',
      role: 2, // USER_ROLE_USER
    })
  }
  catch (e) {
    rpcError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    rpcLoading.value = false
  }
}

// RPC handlers - Product Service
async function rpcGetProduct() {
  rpcLoading.value = true
  rpcError.value = null
  try {
    rpcResult.value = await $api.rpc('ProductService', 'GetProduct', { id: 1 })
  }
  catch (e) {
    rpcError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    rpcLoading.value = false
  }
}

async function rpcListProducts() {
  rpcLoading.value = true
  rpcError.value = null
  try {
    rpcResult.value = await $api.rpc('ProductService', 'ListProducts', {
      page: 1,
      limit: 5,
      category: 'electronics',
    })
  }
  catch (e) {
    rpcError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    rpcLoading.value = false
  }
}

async function rpcSearchProducts() {
  rpcLoading.value = true
  rpcError.value = null
  try {
    rpcResult.value = await $api.rpc('ProductService', 'SearchProducts', {
      keyword: 'phone',
      limit: 10,
    })
  }
  catch (e) {
    rpcError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    rpcLoading.value = false
  }
}

// Dynamic access handlers
async function dynamicGetUser() {
  dynamicLoading.value = true
  dynamicError.value = null
  try {
    dynamicResult.value = await $api.UserService.GetUser({ id: 1 })
  }
  catch (e) {
    dynamicError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    dynamicLoading.value = false
  }
}

async function dynamicListProducts() {
  dynamicLoading.value = true
  dynamicError.value = null
  try {
    dynamicResult.value = await $api.ProductService.ListProducts({
      page: 1,
      limit: 5,
    })
  }
  catch (e) {
    dynamicError.value = e instanceof Error ? e.message : 'Unknown error'
  }
  finally {
    dynamicLoading.value = false
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
  color: #7c3aed;
  margin-bottom: 0.5rem;
}

.header {
  margin-bottom: 2rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1rem;
}

.nav-links {
  display: flex;
  gap: 0.75rem;
}

.nav-link {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #7c3aed;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.nav-link:hover {
  background: #6d28d9;
}

.nav-link-secondary {
  background: #4990e2;
}

.nav-link-secondary:hover {
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
  background: #7c3aed;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #6d28d9;
}

button:active {
  background: #5b21b6;
}

.loading {
  color: #666;
  font-style: italic;
}

.result {
  background: #1a1a1a;
  color: #a78bfa;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

.error {
  color: #dc3545;
  padding: 0.5rem;
  background: #fff5f5;
  border-radius: 6px;
  border: 1px solid #dc3545;
}
</style>
