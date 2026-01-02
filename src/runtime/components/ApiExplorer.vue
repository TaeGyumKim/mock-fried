<template>
  <div class="api-explorer">
    <header class="explorer-header">
      <h1>{{ title }}</h1>
      <p
        v-if="description"
        class="description"
      >
        {{ description }}
      </p>
    </header>

    <div
      v-if="loading"
      class="loading"
    >
      Loading API schema...
    </div>

    <div
      v-else-if="error"
      class="error"
    >
      {{ error }}
    </div>

    <template v-else>
      <!-- OpenAPI Section -->
      <section
        v-if="schema?.openapi"
        class="api-section"
      >
        <h2 class="section-title">
          <span class="badge rest">REST</span>
          {{ schema.openapi.info.title }}
          <span class="version">v{{ schema.openapi.info.version }}</span>
        </h2>

        <div class="endpoints">
          <EndpointCard
            v-for="endpoint in schema.openapi.paths"
            :key="`${endpoint.method}-${endpoint.path}`"
            :endpoint="endpoint"
            type="rest"
            @execute="executeRest"
          />
        </div>
      </section>

      <!-- RPC Section -->
      <section
        v-if="schema?.rpc"
        class="api-section"
      >
        <h2 class="section-title">
          <span class="badge rpc">RPC</span>
          {{ schema.rpc.package || 'Services' }}
        </h2>

        <div
          v-for="service in schema.rpc.services"
          :key="service.name"
          class="service-group"
        >
          <h3 class="service-name">
            {{ service.name }}
          </h3>
          <div class="endpoints">
            <RpcMethodCard
              v-for="method in service.methods"
              :key="method.name"
              :service="service.name"
              :method="method"
              @execute="executeRpc"
            />
          </div>
        </div>
      </section>
    </template>

    <!-- Response Modal -->
    <ResponseViewer
      v-if="response"
      :response="response"
      @close="response = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#imports'
import type { ApiSchema, ApiClient } from '../../types'
import EndpointCard from './EndpointCard.vue'
import RpcMethodCard from './RpcMethodCard.vue'
import ResponseViewer from './ResponseViewer.vue'

defineProps<{
  title?: string
  description?: string
}>()

const { $api } = useNuxtApp() as unknown as { $api: ApiClient }

const schema = ref<ApiSchema | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const response = ref<{
  success: boolean
  data: unknown
  time: number
  type: 'rest' | 'rpc'
  info: string
} | null>(null)

// 스키마 로드
onMounted(async () => {
  try {
    schema.value = await $api.getSchema()
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load schema'
  }
  finally {
    loading.value = false
  }
})

// REST API 실행
async function executeRest(params: {
  path: string
  method: string
  pathParams?: Record<string, string>
  queryParams?: Record<string, string>
  body?: unknown
}) {
  const startTime = Date.now()

  try {
    // Path 파라미터 치환
    let finalPath = params.path
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        finalPath = finalPath.replace(`{${key}}`, value)
      }
    }

    const data = await $api.rest(finalPath, {
      method: params.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      params: params.queryParams,
      body: params.body,
    })

    response.value = {
      success: true,
      data,
      time: Date.now() - startTime,
      type: 'rest',
      info: `${params.method} ${finalPath}`,
    }
  }
  catch (e) {
    response.value = {
      success: false,
      data: e instanceof Error ? e.message : 'Unknown error',
      time: Date.now() - startTime,
      type: 'rest',
      info: `${params.method} ${params.path}`,
    }
  }
}

// RPC 실행
async function executeRpc(params: {
  service: string
  method: string
  body?: Record<string, unknown>
}) {
  const startTime = Date.now()

  try {
    const data = await $api.rpc(params.service, params.method, params.body)

    response.value = {
      success: true,
      data,
      time: Date.now() - startTime,
      type: 'rpc',
      info: `${params.service}.${params.method}`,
    }
  }
  catch (e) {
    response.value = {
      success: false,
      data: e instanceof Error ? e.message : 'Unknown error',
      time: Date.now() - startTime,
      type: 'rpc',
      info: `${params.service}.${params.method}`,
    }
  }
}
</script>

<style scoped>
.api-explorer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.explorer-header {
  margin-bottom: 2rem;
}

.explorer-header h1 {
  margin: 0 0 0.5rem;
  color: #1a1a1a;
  font-size: 1.75rem;
}

.explorer-header .description {
  color: #666;
  margin: 0;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
}

.loading {
  background: #f5f5f5;
  color: #666;
}

.error {
  background: #fff5f5;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.api-section {
  margin: 2rem 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 1rem;
  font-size: 1.25rem;
  color: #333;
}

.section-title .version {
  font-size: 0.875rem;
  color: #666;
  font-weight: normal;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge.rest {
  background: #61affe;
  color: white;
}

.badge.rpc {
  background: #7c3aed;
  color: white;
}

.service-group {
  margin: 1.5rem 0;
}

.service-name {
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e0e0e0;
  color: #444;
  font-size: 1.1rem;
}

.endpoints {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>
