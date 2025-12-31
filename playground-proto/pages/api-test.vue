<template>
  <div class="container">
    <header class="header">
      <h1>Proto RPC Mock Tester</h1>
      <p class="subtitle">
        Protobuf RPC Mock Server - Interactive Testing
      </p>
      <NuxtLink
        to="/"
        class="back-link"
      >
        &larr; Back to Demo
      </NuxtLink>
    </header>

    <!-- Service Selection -->
    <section class="section">
      <h2>Service</h2>
      <div class="service-grid">
        <div
          v-for="service in serviceList"
          :key="service.name"
          class="service-card"
          :class="{ active: selectedService === service.name }"
          @click="selectService(service.name)"
        >
          <div class="service-name">
            {{ service.name }}
          </div>
          <div class="service-desc">
            {{ service.description }}
          </div>
        </div>
      </div>
    </section>

    <!-- Method Selection -->
    <section
      v-if="selectedService"
      class="section"
    >
      <h2>{{ selectedService }} Methods</h2>
      <div class="method-list">
        <button
          v-for="method in currentMethods"
          :key="method.id"
          class="method-btn"
          :class="{ active: selectedMethod?.id === method.id }"
          @click="selectMethod(method)"
        >
          <span class="method-type">{{ method.type }}</span>
          <span class="method-name">{{ method.name }}</span>
        </button>
      </div>
    </section>

    <!-- Request Parameters -->
    <section
      v-if="selectedMethod"
      class="section"
    >
      <h2>Request Parameters</h2>
      <div class="params-form">
        <div
          v-for="param in selectedMethod.params"
          :key="param.name"
          class="param-row"
        >
          <label :for="param.name">
            {{ param.name }}
            <span
              v-if="param.required"
              class="required"
            >*</span>
            <span class="param-type">({{ param.type }})</span>
          </label>
          <input
            :id="param.name"
            v-model="paramValues[param.name]"
            :type="param.type === 'number' ? 'number' : 'text'"
            :placeholder="param.placeholder || param.name"
          >
        </div>
        <div
          v-if="selectedMethod.params.length === 0"
          class="no-params"
        >
          No parameters
        </div>
      </div>
      <button
        class="execute-btn"
        :disabled="loading"
        @click="executeRequest"
      >
        {{ loading ? 'Loading...' : 'Execute RPC' }}
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
          {{ responseInfo.ok ? 'Success' : 'Error' }}
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
const { $api } = useNuxtApp()

interface MethodParam {
  name: string
  type: 'string' | 'number'
  required: boolean
  placeholder?: string
}

interface RpcMethod {
  id: string
  name: string
  type: 'Unary'
  params: MethodParam[]
}

// Service list
const serviceList = [
  { name: 'UserService', description: 'User CRUD (GetUser, ListUsers, CreateUser, UpdateUser, DeleteUser)' },
  { name: 'ProductService', description: 'Product Management (GetProduct, ListProducts, CreateProduct)' },
]

// Methods by service
const methodsByService: Record<string, RpcMethod[]> = {
  UserService: [
    {
      id: 'getUser',
      name: 'GetUser',
      type: 'Unary',
      params: [
        { name: 'id', type: 'string', required: true, placeholder: '1' },
      ],
    },
    {
      id: 'listUsers',
      name: 'ListUsers',
      type: 'Unary',
      params: [
        { name: 'page', type: 'number', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', required: false, placeholder: '10' },
        { name: 'filter', type: 'string', required: false, placeholder: '' },
      ],
    },
    {
      id: 'createUser',
      name: 'CreateUser',
      type: 'Unary',
      params: [
        { name: 'name', type: 'string', required: true, placeholder: 'John Doe' },
        { name: 'email', type: 'string', required: true, placeholder: 'john@example.com' },
        { name: 'age', type: 'number', required: false, placeholder: '30' },
      ],
    },
    {
      id: 'updateUser',
      name: 'UpdateUser',
      type: 'Unary',
      params: [
        { name: 'id', type: 'string', required: true, placeholder: '1' },
        { name: 'name', type: 'string', required: false, placeholder: 'Jane Doe' },
        { name: 'email', type: 'string', required: false, placeholder: 'jane@example.com' },
        { name: 'age', type: 'number', required: false, placeholder: '25' },
      ],
    },
    {
      id: 'deleteUser',
      name: 'DeleteUser',
      type: 'Unary',
      params: [
        { name: 'id', type: 'string', required: true, placeholder: '1' },
      ],
    },
  ],
  ProductService: [
    {
      id: 'getProduct',
      name: 'GetProduct',
      type: 'Unary',
      params: [
        { name: 'id', type: 'string', required: true, placeholder: '1' },
      ],
    },
    {
      id: 'listProducts',
      name: 'ListProducts',
      type: 'Unary',
      params: [
        { name: 'page', type: 'number', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', required: false, placeholder: '5' },
        { name: 'category', type: 'number', required: false, placeholder: '1' },
      ],
    },
    {
      id: 'createProduct',
      name: 'CreateProduct',
      type: 'Unary',
      params: [
        { name: 'name', type: 'string', required: true, placeholder: 'Product Name' },
        { name: 'description', type: 'string', required: false, placeholder: 'Description' },
        { name: 'price', type: 'number', required: true, placeholder: '99.99' },
        { name: 'stock', type: 'number', required: false, placeholder: '100' },
        { name: 'category', type: 'number', required: false, placeholder: '1' },
      ],
    },
  ],
}

// State
const selectedService = ref<string | null>(null)
const selectedMethod = ref<RpcMethod | null>(null)
const paramValues = ref<Record<string, unknown>>({})
const response = ref<unknown>(null)
const error = ref<string | null>(null)
const loading = ref(false)
const responseInfo = ref<{ ok: boolean, time: number } | null>(null)

// Computed
const currentMethods = computed(() => {
  if (!selectedService.value) return []
  return methodsByService[selectedService.value] || []
})

// Methods
function selectService(serviceName: string) {
  selectedService.value = serviceName
  selectedMethod.value = null
  paramValues.value = {}
  response.value = null
  error.value = null
  responseInfo.value = null
}

function selectMethod(method: RpcMethod) {
  selectedMethod.value = method
  paramValues.value = {}
  method.params.forEach((param) => {
    if (param.type === 'number' && param.placeholder) {
      paramValues.value[param.name] = Number.parseFloat(param.placeholder)
    }
  })
  response.value = null
  error.value = null
  responseInfo.value = null
}

async function executeRequest() {
  if (!selectedService.value || !selectedMethod.value) return

  loading.value = true
  error.value = null
  response.value = null
  responseInfo.value = null

  const startTime = Date.now()

  try {
    const result = await $api.rpc(
      selectedService.value,
      selectedMethod.value.name,
      paramValues.value,
    )
    response.value = result
    responseInfo.value = {
      ok: true,
      time: Date.now() - startTime,
    }
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error'
    responseInfo.value = {
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
  color: #7c3aed;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1rem;
}

.back-link {
  display: inline-block;
  color: #7c3aed;
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

/* Service Grid */
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.service-card {
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.service-card:hover {
  border-color: #7c3aed;
  transform: translateY(-2px);
}

.service-card.active {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.service-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.service-desc {
  font-size: 0.8rem;
  color: #666;
}

/* Method List */
.method-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.method-btn {
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

.method-btn:hover {
  border-color: #7c3aed;
  background: #f8f8f8;
}

.method-btn.active {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.method-type {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  background: #7c3aed;
  color: white;
  min-width: 50px;
  text-align: center;
}

.method-name {
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
  border-color: #7c3aed;
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
  background: #7c3aed;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.execute-btn:hover:not(:disabled) {
  background: #6d28d9;
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
  color: #a78bfa;
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
