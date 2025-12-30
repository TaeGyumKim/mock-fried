<template>
  <div
    class="endpoint-card"
    :class="{ expanded }"
  >
    <div
      class="card-header"
      @click="expanded = !expanded"
    >
      <span
        class="method"
        :class="methodClass"
      >
        {{ endpoint.method }}
      </span>
      <span class="path">{{ endpoint.path }}</span>
      <span
        v-if="endpoint.summary"
        class="summary"
      >
        {{ endpoint.summary }}
      </span>
      <span class="expand-icon">{{ expanded ? '▼' : '▶' }}</span>
    </div>

    <div
      v-if="expanded"
      class="card-body"
    >
      <p
        v-if="endpoint.description"
        class="description"
      >
        {{ endpoint.description }}
      </p>

      <!-- Path Parameters -->
      <div
        v-if="pathParams.length > 0"
        class="params-section"
      >
        <h4>Path Parameters</h4>
        <div
          v-for="param in pathParams"
          :key="param.name"
          class="param-row"
        >
          <label :for="`path-${param.name}`">
            {{ param.name }}
            <span
              v-if="param.required"
              class="required"
            >*</span>
          </label>
          <input
            :id="`path-${param.name}`"
            v-model="pathParamValues[param.name]"
            type="text"
            :placeholder="param.description || param.name"
          >
        </div>
      </div>

      <!-- Query Parameters -->
      <div
        v-if="queryParams.length > 0"
        class="params-section"
      >
        <h4>Query Parameters</h4>
        <div
          v-for="param in queryParams"
          :key="param.name"
          class="param-row"
        >
          <label :for="`query-${param.name}`">
            {{ param.name }}
            <span
              v-if="param.required"
              class="required"
            >*</span>
          </label>
          <input
            :id="`query-${param.name}`"
            v-model="queryParamValues[param.name]"
            type="text"
            :placeholder="param.description || param.name"
          >
        </div>
      </div>

      <!-- Request Body -->
      <div
        v-if="hasRequestBody"
        class="params-section"
      >
        <h4>Request Body</h4>
        <textarea
          v-model="bodyValue"
          rows="5"
          placeholder="{ }"
        />
      </div>

      <button
        class="execute-btn"
        @click="execute"
      >
        Execute
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OpenApiPathItem } from '../../types'

const props = defineProps<{
  endpoint: OpenApiPathItem
  type: 'rest' | 'rpc'
}>()

const emit = defineEmits<{
  execute: [params: {
    path: string
    method: string
    pathParams?: Record<string, string>
    queryParams?: Record<string, string>
    body?: unknown
  }]
}>()

const expanded = ref(false)
const pathParamValues = ref<Record<string, string>>({})
const queryParamValues = ref<Record<string, string>>({})
const bodyValue = ref('')

const methodClass = computed(() => {
  const method = props.endpoint.method.toLowerCase()
  return {
    get: method === 'get',
    post: method === 'post',
    put: method === 'put',
    delete: method === 'delete',
    patch: method === 'patch',
  }
})

const pathParams = computed(() => {
  return (props.endpoint.parameters || []).filter(p => p.in === 'path')
})

const queryParams = computed(() => {
  return (props.endpoint.parameters || []).filter(p => p.in === 'query')
})

const hasRequestBody = computed(() => {
  return ['POST', 'PUT', 'PATCH'].includes(props.endpoint.method) && props.endpoint.requestBody
})

function execute() {
  const params: Parameters<typeof emit>[1] = {
    path: props.endpoint.path,
    method: props.endpoint.method,
  }

  if (Object.keys(pathParamValues.value).length > 0) {
    params.pathParams = { ...pathParamValues.value }
  }

  if (Object.keys(queryParamValues.value).length > 0) {
    const filtered: Record<string, string> = {}
    for (const [k, v] of Object.entries(queryParamValues.value)) {
      if (v) filtered[k] = v
    }
    if (Object.keys(filtered).length > 0) {
      params.queryParams = filtered
    }
  }

  if (bodyValue.value) {
    try {
      params.body = JSON.parse(bodyValue.value)
    }
    catch {
      params.body = bodyValue.value
    }
  }

  emit('execute', params)
}
</script>

<style scoped>
.endpoint-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: #fafafa;
  transition: background 0.2s;
}

.card-header:hover {
  background: #f0f0f0;
}

.method {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 4px;
  min-width: 60px;
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
  color: #1a1a1a;
}

.path {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.9rem;
  color: #333;
}

.summary {
  flex: 1;
  color: #666;
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.expand-icon {
  color: #999;
  font-size: 0.75rem;
}

.card-body {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.description {
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.9rem;
}

.params-section {
  margin-bottom: 1rem;
}

.params-section h4 {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: #444;
}

.param-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.param-row label {
  min-width: 120px;
  font-size: 0.85rem;
  color: #555;
}

.param-row .required {
  color: #f93e3e;
}

.param-row input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.param-row input:focus {
  outline: none;
  border-color: #61affe;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.85rem;
  resize: vertical;
}

textarea:focus {
  outline: none;
  border-color: #61affe;
}

.execute-btn {
  padding: 0.5rem 1.5rem;
  background: #4990e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.execute-btn:hover {
  background: #357abd;
}
</style>
