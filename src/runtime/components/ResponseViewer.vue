<template>
  <div
    class="response-overlay"
    @click.self="$emit('close')"
  >
    <div class="response-modal">
      <header class="modal-header">
        <div class="header-info">
          <span
            class="status"
            :class="{ success: response.success, error: !response.success }"
          >
            {{ response.success ? 'SUCCESS' : 'ERROR' }}
          </span>
          <span class="info">{{ response.info }}</span>
          <span class="time">{{ response.time }}ms</span>
        </div>
        <button
          class="close-btn"
          @click="$emit('close')"
        >
          ×
        </button>
      </header>

      <div class="modal-body">
        <div class="response-actions">
          <button
            class="action-btn"
            @click="copyToClipboard"
          >
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
          <button
            class="action-btn"
            @click="toggleFormat"
          >
            {{ formatted ? 'Raw' : 'Format' }}
          </button>
        </div>

        <pre class="response-content">{{ displayContent }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  response: {
    success: boolean
    data: unknown
    time: number
    type: 'rest' | 'rpc'
    info: string
  }
}>()

defineEmits<{
  close: []
}>()

const formatted = ref(true)
const copied = ref(false)

const displayContent = computed(() => {
  if (formatted.value) {
    return JSON.stringify(props.response.data, null, 2)
  }
  return JSON.stringify(props.response.data)
})

function toggleFormat() {
  formatted.value = !formatted.value
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(displayContent.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    // 클립보드 API 실패 시 무시
  }
}
</script>

<style scoped>
.response-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.response-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #1a1a1a;
  color: white;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 4px;
}

.status.success {
  background: #49cc90;
  color: white;
}

.status.error {
  background: #f93e3e;
  color: white;
}

.info {
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.9rem;
}

.time {
  font-size: 0.85rem;
  color: #888;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.modal-body {
  flex: 1;
  overflow: auto;
  padding: 1rem 1.5rem;
}

.response-actions {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-btn {
  padding: 0.4rem 0.8rem;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.response-content {
  background: #1a1a1a;
  color: #00dc82;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
