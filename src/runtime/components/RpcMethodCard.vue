<template>
  <div
    class="rpc-card"
    :class="{ expanded }"
  >
    <div
      class="card-header"
      @click="expanded = !expanded"
    >
      <span class="method-badge">RPC</span>
      <span class="method-name">{{ method.name }}</span>
      <span class="types">
        {{ method.requestType }} → {{ method.responseType }}
      </span>
      <span class="expand-icon">{{ expanded ? '▼' : '▶' }}</span>
    </div>

    <div
      v-if="expanded"
      class="card-body"
    >
      <!-- Request Fields -->
      <div
        v-if="method.requestFields && method.requestFields.length > 0"
        class="fields-section"
      >
        <h4>Request Fields ({{ method.requestType }})</h4>
        <div
          v-for="field in method.requestFields"
          :key="field.name"
          class="field-row"
        >
          <label :for="`field-${field.name}`">
            {{ field.name }}
            <span class="field-type">{{ formatFieldType(field) }}</span>
          </label>
          <input
            :id="`field-${field.name}`"
            v-model="fieldValues[field.name]"
            type="text"
            :placeholder="getPlaceholder(field)"
          >
        </div>
      </div>

      <!-- Raw JSON Input -->
      <div class="json-section">
        <h4>Request JSON</h4>
        <textarea
          v-model="jsonValue"
          rows="4"
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
import { ref, watch } from 'vue'
import type { RpcMethodSchema, RpcFieldSchema } from '../../types'

const props = defineProps<{
  service: string
  method: RpcMethodSchema
}>()

const emit = defineEmits<{
  execute: [params: {
    service: string
    method: string
    body?: Record<string, unknown>
  }]
}>()

const expanded = ref(false)
const fieldValues = ref<Record<string, string>>({})
const jsonValue = ref('')

// 필드 값 변경 시 JSON 동기화
watch(fieldValues, (values: Record<string, string>) => {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(values)) {
    if (value) {
      // 숫자 변환 시도
      const num = Number(value)
      obj[key] = Number.isNaN(num) ? value : num
    }
  }
  if (Object.keys(obj).length > 0) {
    jsonValue.value = JSON.stringify(obj, null, 2)
  }
}, { deep: true })

function formatFieldType(field: RpcFieldSchema): string {
  let type = field.type
  if (field.repeated) type = `${type}[]`
  if (field.optional) type = `${type}?`
  return type
}

function getPlaceholder(field: RpcFieldSchema): string {
  const typeHints: Record<string, string> = {
    string: '"text"',
    int32: '123',
    int64: '123',
    float: '1.23',
    double: '1.23',
    bool: 'true/false',
  }
  return typeHints[field.type] || field.type
}

function execute() {
  let body: Record<string, unknown> | undefined

  if (jsonValue.value) {
    try {
      body = JSON.parse(jsonValue.value)
    }
    catch {
      // JSON 파싱 실패 시 필드 값 사용
      body = {}
      for (const [key, value] of Object.entries(fieldValues.value)) {
        if (value) {
          const num = Number(value)
          body[key] = Number.isNaN(num) ? value : num
        }
      }
    }
  }

  emit('execute', {
    service: props.service,
    method: props.method.name,
    body,
  })
}
</script>

<style scoped>
.rpc-card {
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

.method-badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 4px;
  background: #7c3aed;
  color: white;
}

.method-name {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
}

.types {
  flex: 1;
  font-size: 0.8rem;
  color: #888;
  font-family: 'Fira Code', 'Monaco', monospace;
}

.expand-icon {
  color: #999;
  font-size: 0.75rem;
}

.card-body {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
}

.fields-section,
.json-section {
  margin-bottom: 1rem;
}

.fields-section h4,
.json-section h4 {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: #444;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.field-row label {
  min-width: 140px;
  font-size: 0.85rem;
  color: #555;
}

.field-type {
  font-size: 0.75rem;
  color: #888;
  font-family: 'Fira Code', 'Monaco', monospace;
}

.field-row input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.field-row input:focus {
  outline: none;
  border-color: #7c3aed;
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
  border-color: #7c3aed;
}

.execute-btn {
  padding: 0.5rem 1.5rem;
  background: #7c3aed;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.execute-btn:hover {
  background: #6d28d9;
}
</style>
