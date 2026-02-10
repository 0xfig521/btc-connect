<template>
  <div class="wallet-debug-panel">
    <h3>🔍 响应式状态调试面板</h3>

    <!-- 原始状态对象 -->
    <div class="debug-section">
      <h4>原始状态对象:</h4>
      <pre>{{ JSON.stringify(walletState, null, 2) }}</pre>
    </div>

    <!-- 分解的响应式值 -->
    <div class="debug-section">
      <h4>分解的响应式值:</h4>
      <div class="status-grid">
        <div class="status-item">
          <strong>isConnected:</strong> {{ isConnected }}
        </div>
        <div class="status-item">
          <strong>accounts.length:</strong> {{ accounts.length }}
        </div>
        <div class="status-item">
          <strong>address:</strong> {{ address || 'null' }}
        </div>
        <div class="status-item">
          <strong>balance:</strong> {{ balance || 'null' }}
        </div>
        <div class="status-item">
          <strong>publicKey:</strong> {{ publicKey ? `${publicKey.slice(0, 20)}...` : 'null' }}
        </div>
        <div class="status-item">
          <strong>currentWallet:</strong> {{ currentWallet?.name || 'null' }}
        </div>
        <div class="status-item">
          <strong>currentAdapter:</strong> {{ currentAdapter?.name || 'null' }}
        </div>
        <div class="status-item">
          <strong>error:</strong> {{ error?.message || 'null' }}
        </div>
      </div>
    </div>

    <!-- 强制刷新按钮 -->
    <div class="debug-section">
      <button @click="forceUpdate" class="force-btn">
        🔄 强制刷新状态
      </button>
      <button @click="triggerReconnect" class="reconnect-btn">
        🔗 重新连接
      </button>
    </div>

    <!-- 实时日志 -->
    <div class="debug-section">
      <h4>状态变化日志:</h4>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useWallet } from '@btc-connect/vue'

const logs = ref<string[]>([])

const wallet = useWallet()
const {
  state: walletState,
  status,
  accounts,
  currentAccount,
  network,
  error,
  currentWallet,
  isConnected,
  isConnecting,
  address,
  balance,
  publicKey,
  currentAdapter,
  manager
} = wallet

// 添加日志
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`${timestamp}: ${message}`)
  // 保留最新的50条日志
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

// 强制更新状态
const forceUpdate = () => {
  addLog('🔄 强制刷新状态')
  // 强制访问所有响应式属性，触发重新计算
  void wallet.state.value
  void wallet.currentWallet.value
  void wallet.isConnected.value
  void wallet.address.value
  void wallet.balance.value
  void wallet.publicKey.value
}

// 触发重新连接
const triggerReconnect = async () => {
  try {
    addLog('🔗 开始重新连接...')
    if (manager.value) {
      // 如果已连接，先断开
      if (isConnected.value) {
        await wallet.disconnect()
        addLog('✅ 已断开连接')
      }
      // 尝试连接到 UniSat
      await wallet.connect('unisat')
      addLog('✅ 重新连接成功')
    } else {
      addLog('❌ Manager 不可用')
    }
  } catch (error) {
    addLog(`❌ 重新连接失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 监听状态变化
watch(() => walletState.value, (newState, oldState) => {
  addLog(`📊 状态变化: ${oldState?.status} → ${newState.status}`)
}, { deep: true })

watch(() => isConnected.value, (newValue, oldValue) => {
  addLog(`🔗 连接状态: ${oldValue} → ${newValue}`)
})

watch(() => address.value, (newValue, oldValue) => {
  addLog(`📍 地址变化: ${oldValue?.slice(0, 10)}... → ${newValue?.slice(0, 10)}...`)
})

watch(() => balance.value, (newValue, oldValue) => {
  addLog(`💰 余额变化: ${JSON.stringify(oldValue)} → ${JSON.stringify(newValue)}`)
})

watch(() => currentAdapter.value, (newValue, oldValue) => {
  addLog(`🔌 适配器变化: ${oldValue?.name || 'null'} → ${newValue?.name || 'null'}`)
})

// 组件挂载时初始化
onMounted(() => {
  addLog('🚀 调试面板已挂载')
  addLog(`📊 初始状态: ${status.value}`)
  addLog(`🔌 Manager 可用: ${!!manager.value}`)
  addLog(`📱 可用钱包数量: ${wallet.availableWallets.value?.length || 0}`)
})

// 定期检查状态
const stateChecker = setInterval(() => {
  if (manager.value) {
    const currentState = manager.value.getState()
    // 这里只记录，不触发响应式更新
    // addLog(`⏰ 定时检查: ${currentState.status}`)
  }
}, 3000)

// 清理定时器
onUnmounted(() => {
  clearInterval(stateChecker)
})
</script>

<style scoped>
.wallet-debug-panel {
  padding: 20px;
  background: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 8px;
  margin: 20px 0;
  font-family: monospace;
  font-size: 12px;
}

.debug-section {
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.debug-section h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 8px;
}

.status-item {
  padding: 4px 8px;
  background: #f9f9f9;
  border-left: 3px solid #007bff;
}

pre {
  background: #f8f8f8;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  max-height: 200px;
}

.force-btn, .reconnect-btn {
  padding: 8px 16px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.force-btn {
  background: #28a745;
  color: white;
}

.reconnect-btn {
  background: #007bff;
  color: white;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.log-entry {
  padding: 2px 0;
  border-bottom: 1px solid #eee;
  font-size: 11px;
}

.log-entry:last-child {
  border-bottom: none;
}
</style>