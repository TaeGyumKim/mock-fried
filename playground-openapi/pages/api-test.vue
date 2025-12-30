<template>
  <div class="container">
    <header class="header">
      <h1>OpenAPI Client Tester</h1>
      <p class="subtitle">
        @ptcorp-eosikahair/openapi 클라이언트로 Mock API 테스트
      </p>
      <NuxtLink
        to="/"
        class="back-link"
      >
        ← Back to Demo
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
      v-if="response || error"
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
        v-if="response"
        class="result"
      >{{ JSON.stringify(response, null, 2) }}</pre>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  AdminAccountApi,
  AdminAuthApi,
  AuthApi,
  BeforeAfterPostsApi,
  DailyAndConcernPostsApi,
  DeviceApi,
  GlobalApi,
  SampleApi,
  Configuration,
  type OtpType,
} from '@ptcorp-eosikahair/openapi'

// Mock 서버 기본 URL 설정
const config = new Configuration({
  basePath: '/mock',
})

// API 인스턴스들
const apis = {
  AdminAccount: new AdminAccountApi(config),
  AdminAuth: new AdminAuthApi(config),
  Auth: new AuthApi(config),
  BeforeAfterPosts: new BeforeAfterPostsApi(config),
  DailyAndConcernPosts: new DailyAndConcernPostsApi(config),
  Device: new DeviceApi(config),
  Global: new GlobalApi(config),
  Sample: new SampleApi(config),
}

interface EndpointParam {
  name: string
  type: 'string' | 'number'
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
  { name: 'AdminAccount', description: '관리자 계정 관리' },
  { name: 'AdminAuth', description: '관리자 인증' },
  { name: 'Auth', description: '사용자 인증' },
  { name: 'BeforeAfterPosts', description: '비포애프터 게시글' },
  { name: 'DailyAndConcernPosts', description: '일상/고민 게시글' },
  { name: 'Device', description: '디바이스 관리' },
  { name: 'Global', description: '글로벌 설정' },
  { name: 'Sample', description: '샘플 API' },
]

// 각 API별 엔드포인트 정의
const endpointsByApi: Record<string, Endpoint[]> = {
  AdminAccount: [
    {
      id: 'listAccounts',
      method: 'GET',
      path: '/admin/accounts',
      params: [
        { name: 'page', type: 'number', required: false, placeholder: '1' },
        { name: 'size', type: 'number', required: false, placeholder: '20' },
      ],
      handler: p => apis.AdminAccount.adminListAccounts({
        page: p.page as number,
        size: p.size as number,
      }),
    },
    {
      id: 'getAccount',
      method: 'GET',
      path: '/admin/accounts/{accountId}',
      params: [
        { name: 'accountId', type: 'string', required: true, placeholder: 'account-123' },
      ],
      handler: p => apis.AdminAccount.adminGetAccount({
        accountId: p.accountId as string,
      }),
    },
    {
      id: 'listUserTokens',
      method: 'GET',
      path: '/admin/accounts/{accountId}/tokens',
      params: [
        { name: 'accountId', type: 'string', required: true, placeholder: 'account-123' },
      ],
      handler: p => apis.AdminAccount.listUserTokens({
        accountId: p.accountId as string,
      }),
    },
  ],
  AdminAuth: [
    {
      id: 'adminLogin',
      method: 'POST',
      path: '/admin/auth/login',
      params: [
        { name: 'adminUserId', type: 'string', required: true, placeholder: 'admin' },
        { name: 'password', type: 'string', required: true, placeholder: 'password' },
      ],
      handler: p => apis.AdminAuth.adminLogin({
        adminLoginRequest: {
          adminUserId: p.adminUserId as string,
          password: p.password as string,
        },
      }),
    },
  ],
  Auth: [
    {
      id: 'getMyAccount',
      method: 'GET',
      path: '/auth/profile',
      params: [],
      handler: () => apis.Auth.getMyAccount(),
    },
    {
      id: 'requestOtp',
      method: 'POST',
      path: '/auth/otp/request',
      params: [
        { name: 'phoneNumber', type: 'string', required: true, placeholder: '010-1234-5678' },
        { name: 'otpType', type: 'string', required: true, placeholder: 'email | phoneNumber' },
      ],
      handler: p => apis.Auth.requestOtp({
        requestOtpRequest: {
          phoneNumber: p.phoneNumber as string,
          otpType: p.otpType as OtpType,
        },
      }),
    },
    {
      id: 'completeRegistration',
      method: 'PUT',
      path: '/auth/registration',
      params: [
        { name: 'nickname', type: 'string', required: true, placeholder: 'nickname' },
      ],
      handler: p => apis.Auth.completeRegistration({
        userRegistrationRequest: {
          nickname: p.nickname as string,
        },
      }),
    },
  ],
  BeforeAfterPosts: [
    {
      id: 'getAllPosts',
      method: 'GET',
      path: '/before-after/posts',
      params: [
        { name: 'cursor', type: 'string', required: false, placeholder: '' },
        { name: 'limit', type: 'number', required: false, placeholder: '20' },
      ],
      handler: p => apis.BeforeAfterPosts.getAllBeforeAfterPosts({
        cursor: p.cursor as string,
        limit: p.limit as number,
      }),
    },
    {
      id: 'getPost',
      method: 'GET',
      path: '/before-after/posts/{postId}',
      params: [
        { name: 'postId', type: 'string', required: true, placeholder: 'post-123' },
      ],
      handler: p => apis.BeforeAfterPosts.getBeforeAfterPost({
        postId: p.postId as string,
      }),
    },
    {
      id: 'getPopularPosts',
      method: 'GET',
      path: '/before-after/posts/popular',
      params: [],
      handler: () => apis.BeforeAfterPosts.getPopularBeforeAfterPosts(),
    },
  ],
  DailyAndConcernPosts: [
    {
      id: 'getAllPosts',
      method: 'GET',
      path: '/daily-concern/posts',
      params: [
        { name: 'cursor', type: 'string', required: false, placeholder: '' },
        { name: 'limit', type: 'number', required: false, placeholder: '20' },
      ],
      handler: p => apis.DailyAndConcernPosts.getAllDailyAndConcernPosts({
        cursor: p.cursor as string,
        limit: p.limit as number,
      }),
    },
    {
      id: 'getPost',
      method: 'GET',
      path: '/daily-concern/posts/{postId}',
      params: [
        { name: 'postId', type: 'string', required: true, placeholder: 'post-123' },
      ],
      handler: p => apis.DailyAndConcernPosts.getDailyAndConcernPost({
        postId: p.postId as string,
      }),
    },
    {
      id: 'getPopularPosts',
      method: 'GET',
      path: '/daily-concern/posts/popular',
      params: [],
      handler: () => apis.DailyAndConcernPosts.getPopularDailyAndConcernPosts(),
    },
  ],
  Device: [
    {
      id: 'getAllDevices',
      method: 'GET',
      path: '/devices-manage',
      params: [
        { name: 'page', type: 'number', required: false, placeholder: '1' },
        { name: 'limit', type: 'number', required: false, placeholder: '20' },
      ],
      handler: p => apis.Device.getAllUserDevices({
        page: p.page as number,
        limit: p.limit as number,
      }),
    },
    {
      id: 'getDevice',
      method: 'GET',
      path: '/devices-manage/{userDeviceId}',
      params: [
        { name: 'userDeviceId', type: 'string', required: true, placeholder: 'device-123' },
      ],
      handler: p => apis.Device.getUserDevice({
        userDeviceId: p.userDeviceId as string,
      }),
    },
  ],
  Global: [
    {
      id: 'getHealth',
      method: 'GET',
      path: '/health',
      params: [],
      handler: () => apis.Global.getHealth(),
    },
    {
      id: 'getVersion',
      method: 'GET',
      path: '/version',
      params: [],
      handler: () => apis.Global.getVersion(),
    },
  ],
  Sample: [
    {
      id: 'sampleAdminOnlyApi',
      method: 'GET',
      path: '/samples/admin-only-api',
      params: [],
      handler: () => apis.Sample.sampleAdminOnlyApi(),
    },
    {
      id: 'sampleUserApi',
      method: 'GET',
      path: '/samples/user-and-authorized-only-api',
      params: [
        { name: 'someParameter', type: 'string', required: false, placeholder: 'test' },
      ],
      handler: p => apis.Sample.sampleUserAndAuthorizedOnlyApi({
        someParameter: p.someParameter as string,
      }),
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
    if (param.type === 'number') {
      paramValues.value[param.name] = param.placeholder ? Number.parseInt(param.placeholder) : undefined
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
