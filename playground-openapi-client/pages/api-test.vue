<template>
  <div class="container">
    <header class="header">
      <h1>OpenAPI Client Tester</h1>
      <p class="subtitle">
        Client Package Mode: openapi-generator로 생성된 클라이언트로 Mock API 테스트
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
  ProductsApi,
  OrdersApi,
  PostsApi,
  CommentsApi,
  HealthApi,
  EdgeCasesApi,
  AdvancedCasesApi,
  ActivitiesApi,
  Configuration,
} from '@mock-fried/openapi-client'

// Mock 서버 기본 URL 설정
const config = new Configuration({
  basePath: '/mock',
})

// API 인스턴스들
const apis = {
  Users: new UsersApi(config),
  Products: new ProductsApi(config),
  Orders: new OrdersApi(config),
  Posts: new PostsApi(config),
  Comments: new CommentsApi(config),
  Health: new HealthApi(config),
  EdgeCases: new EdgeCasesApi(config),
  AdvancedCases: new AdvancedCasesApi(config),
  Activities: new ActivitiesApi(config),
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

// API 목록 (playground-openapi와 동일)
const apiList = [
  { name: 'Users', description: '사용자 관리 (CRUD)' },
  { name: 'Products', description: '상품 관리 (CRUD)' },
  { name: 'Orders', description: '주문 관리 (CRUD)' },
  { name: 'Posts', description: '게시글 관리 (커서 페이지네이션)' },
  { name: 'Comments', description: '댓글 관리 (중첩 리소스)' },
  { name: 'Health', description: '헬스 체크 및 시스템 정보' },
  { name: 'EdgeCases', description: 'Primitive, Nested, Recursive 등 다양한 스키마' },
  { name: 'AdvancedCases', description: 'Proto AdvancedService 대응 (Scalars, Company, Preferences)' },
  { name: 'Activities', description: '양방향 Cursor Pagination' },
]

// 각 API별 엔드포인트 정의 (playground-openapi와 동일한 구조)
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
        { name: 'search', type: 'string', in: 'query', required: false, placeholder: '' },
      ],
      handler: async (p) => {
        return apis.Users.getUsers({
          page: p.page as number,
          limit: p.limit as number,
          status: p.status as 'active' | 'inactive' | 'suspended',
          role: p.role as 'admin' | 'user' | 'guest',
          search: p.search as string,
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
        { name: 'username', type: 'string', in: 'body', required: true, placeholder: 'john_doe' },
        { name: 'email', type: 'string', in: 'body', required: true, placeholder: 'john@example.com' },
        { name: 'name', type: 'string', in: 'body', required: false, placeholder: 'John Doe' },
        { name: 'role', type: 'string', in: 'body', required: false, placeholder: 'user' },
      ],
      handler: async (p) => {
        return apis.Users.createUser({
          createUserRequest: {
            username: p.username as string,
            email: p.email as string,
            name: p.name as string,
            role: p.role as 'admin' | 'user' | 'guest',
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
  Products: [
    {
      id: 'getProducts',
      method: 'GET',
      path: '/products',
      params: [
        { name: 'page', type: 'number', in: 'query', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
        { name: 'category', type: 'string', in: 'query', required: false, placeholder: 'electronics' },
        { name: 'minPrice', type: 'number', in: 'query', required: false, placeholder: '' },
        { name: 'maxPrice', type: 'number', in: 'query', required: false, placeholder: '' },
      ],
      handler: async (p) => {
        return apis.Products.getProducts({
          page: p.page as number,
          limit: p.limit as number,
          category: p.category as 'electronics' | 'clothing' | 'food' | 'books' | 'other',
          minPrice: p.minPrice as number,
          maxPrice: p.maxPrice as number,
        })
      },
    },
    {
      id: 'getProductById',
      method: 'GET',
      path: '/products/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'prod-123' },
      ],
      handler: async (p) => {
        return apis.Products.getProductById({ id: p.id as string })
      },
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
        { name: 'userId', type: 'string', in: 'query', required: false, placeholder: '' },
      ],
      handler: async (p) => {
        return apis.Orders.getOrders({
          page: p.page as number,
          limit: p.limit as number,
          status: p.status as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
          userId: p.userId as string,
        })
      },
    },
    {
      id: 'getOrderById',
      method: 'GET',
      path: '/orders/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'order-123' },
      ],
      handler: async (p) => {
        return apis.Orders.getOrderById({ id: p.id as string })
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
        { name: 'authorId', type: 'string', in: 'query', required: false, placeholder: '' },
      ],
      handler: async (p) => {
        return apis.Posts.getPosts({
          cursor: p.cursor as string,
          limit: p.limit as number,
          authorId: p.authorId as string,
        })
      },
    },
    {
      id: 'getPostById',
      method: 'GET',
      path: '/posts/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'post-123' },
      ],
      handler: async (p) => {
        return apis.Posts.getPostById({ id: p.id as string })
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
    {
      id: 'getTags',
      method: 'GET',
      path: '/tags',
      params: [],
      handler: async () => {
        return apis.Health.getTags()
      },
    },
  ],
  EdgeCases: [
    // Primitive response types
    {
      id: 'getTotalCount',
      method: 'GET',
      path: '/stats/count',
      params: [],
      handler: async () => apis.EdgeCases.getTotalCount(),
    },
    {
      id: 'getSystemStatus',
      method: 'GET',
      path: '/stats/status',
      params: [],
      handler: async () => apis.EdgeCases.getSystemStatus(),
    },
    {
      id: 'isFeatureEnabled',
      method: 'GET',
      path: '/stats/enabled',
      params: [],
      handler: async () => apis.EdgeCases.isFeatureEnabled(),
    },
    // Multiple path parameters
    {
      id: 'getCategoryProduct',
      method: 'GET',
      path: '/categories/{categoryId}/products/{productId}',
      params: [
        { name: 'categoryId', type: 'string', in: 'path', required: true, placeholder: 'cat-1' },
        { name: 'productId', type: 'string', in: 'path', required: true, placeholder: 'prod-1' },
      ],
      handler: async p => apis.EdgeCases.getCategoryProduct({
        categoryId: p.categoryId as string,
        productId: p.productId as string,
      }),
    },
    {
      id: 'getOrderItem',
      method: 'GET',
      path: '/users/{userId}/orders/{orderId}/items/{itemId}',
      params: [
        { name: 'userId', type: 'string', in: 'path', required: true, placeholder: 'user-1' },
        { name: 'orderId', type: 'string', in: 'path', required: true, placeholder: 'order-1' },
        { name: 'itemId', type: 'string', in: 'path', required: true, placeholder: 'item-1' },
      ],
      handler: async p => apis.EdgeCases.getOrderItem({
        userId: p.userId as string,
        orderId: p.orderId as string,
        itemId: p.itemId as string,
      }),
    },
    // Direct array response
    {
      id: 'getFeaturedProducts',
      method: 'GET',
      path: '/featured/products',
      params: [],
      handler: async () => apis.EdgeCases.getFeaturedProducts(),
    },
    {
      id: 'getSearchSuggestions',
      method: 'GET',
      path: '/search/suggestions',
      params: [
        { name: 'q', type: 'string', in: 'query', required: true, placeholder: 'phone' },
      ],
      handler: async p => apis.EdgeCases.getSearchSuggestions({ q: p.q as string }),
    },
    // Nullable fields
    {
      id: 'getProfile',
      method: 'GET',
      path: '/profiles/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'user-1' },
      ],
      handler: async p => apis.EdgeCases.getProfile({ id: p.id as string }),
    },
    // Schema composition (allOf)
    {
      id: 'getAdminUser',
      method: 'GET',
      path: '/admin/users/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'admin-1' },
      ],
      handler: async p => apis.EdgeCases.getAdminUser({ id: p.id as string }),
    },
    // Polymorphic (oneOf)
    {
      id: 'getNotification',
      method: 'GET',
      path: '/notifications/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'notif-1' },
      ],
      handler: async p => apis.EdgeCases.getNotification({ id: p.id as string }),
    },
    // Deeply nested
    {
      id: 'getReport',
      method: 'GET',
      path: '/reports/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'report-1' },
      ],
      handler: async p => apis.EdgeCases.getReport({ id: p.id as string }),
    },
    // Recursive structure
    {
      id: 'getCategoryTree',
      method: 'GET',
      path: '/categories/{id}/tree',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'cat-root' },
      ],
      handler: async p => apis.EdgeCases.getCategoryTree({ id: p.id as string }),
    },
    // Various numeric types
    {
      id: 'getMetrics',
      method: 'GET',
      path: '/analytics/metrics',
      params: [],
      handler: async () => apis.EdgeCases.getMetrics(),
    },
    // Date formats
    {
      id: 'getEvent',
      method: 'GET',
      path: '/events/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'event-1' },
      ],
      handler: async p => apis.EdgeCases.getEvent({ id: p.id as string }),
    },
    // Min/Max constraints
    {
      id: 'getSettings',
      method: 'GET',
      path: '/settings',
      params: [],
      handler: async () => apis.EdgeCases.getSettings(),
    },
    // Map/Dictionary
    {
      id: 'getConfig',
      method: 'GET',
      path: '/config',
      params: [],
      handler: async () => apis.EdgeCases.getConfig(),
    },
    // 204 No Content
    {
      id: 'clearCache',
      method: 'DELETE',
      path: '/cache',
      params: [],
      handler: async () => {
        await apis.EdgeCases.clearCache()
        return { success: true, message: 'Cache cleared' }
      },
    },
    {
      id: 'deleteSession',
      method: 'DELETE',
      path: '/sessions/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'session-1' },
      ],
      handler: async (p) => {
        await apis.EdgeCases.deleteSession({ id: p.id as string })
        return { success: true, message: 'Session deleted' }
      },
    },
  ],
  AdvancedCases: [
    // All scalar types
    {
      id: 'getAllScalarTypes',
      method: 'GET',
      path: '/advanced/scalars',
      params: [],
      handler: async () => apis.AdvancedCases.getAllScalarTypes(),
    },
    // Deeply nested Company (Address, Departments, Employees)
    {
      id: 'getCompany',
      method: 'GET',
      path: '/advanced/company/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'company-1' },
      ],
      handler: async p => apis.AdvancedCases.getCompany({ id: p.id as string }),
    },
    // User preferences
    {
      id: 'getUserPreferences',
      method: 'GET',
      path: '/advanced/preferences',
      params: [],
      handler: async () => apis.AdvancedCases.getUserPreferences(),
    },
    {
      id: 'updateUserPreferences',
      method: 'PUT',
      path: '/advanced/preferences',
      params: [],
      handler: async () => apis.AdvancedCases.updateUserPreferences({ userPreferences: {} }),
    },
    // Advanced orders with page pagination
    {
      id: 'listAdvancedOrders',
      method: 'GET',
      path: '/advanced/orders',
      params: [
        { name: 'page', type: 'number', in: 'query', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
      ],
      handler: async p => apis.AdvancedCases.listAdvancedOrders({
        page: p.page as number,
        limit: p.limit as number,
      }),
    },
    {
      id: 'getAdvancedOrder',
      method: 'GET',
      path: '/advanced/orders/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'order-1' },
      ],
      handler: async p => apis.AdvancedCases.getAdvancedOrder({ id: p.id as string }),
    },
    // Recursive TreeNode
    {
      id: 'getTreeNode',
      method: 'GET',
      path: '/advanced/tree/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'node-1' },
      ],
      handler: async p => apis.AdvancedCases.getTreeNode({ id: p.id as string }),
    },
    // Recursive OrgMember
    {
      id: 'getOrgChart',
      method: 'GET',
      path: '/advanced/org-chart/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'member-1' },
      ],
      handler: async p => apis.AdvancedCases.getOrgChart({ id: p.id as string }),
    },
    // Recursive CommentThread
    {
      id: 'getCommentThread',
      method: 'GET',
      path: '/advanced/comment-thread/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'thread-1' },
      ],
      handler: async p => apis.AdvancedCases.getCommentThread({ id: p.id as string }),
    },
    // Graph structure (nodes + edges)
    {
      id: 'getGraph',
      method: 'GET',
      path: '/advanced/graph/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'graph-1' },
      ],
      handler: async p => apis.AdvancedCases.getGraph({ id: p.id as string }),
    },
  ],
  Activities: [
    // Bidirectional cursor pagination
    {
      id: 'listActivities',
      method: 'GET',
      path: '/activities',
      params: [
        { name: 'cursor', type: 'string', in: 'query', required: false, placeholder: '' },
        { name: 'limit', type: 'number', in: 'query', required: false, placeholder: '20' },
        { name: 'userId', type: 'string', in: 'query', required: false, placeholder: 'user-123' },
      ],
      handler: async p => apis.Activities.listActivities({
        cursor: p.cursor as string,
        limit: p.limit as number,
        userId: p.userId as string,
      }),
    },
    {
      id: 'getActivity',
      method: 'GET',
      path: '/activities/{id}',
      params: [
        { name: 'id', type: 'string', in: 'path', required: true, placeholder: 'activity-1' },
      ],
      handler: async p => apis.Activities.getActivity({ id: p.id as string }),
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
  min-width: 55px;
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
