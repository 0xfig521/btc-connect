<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        🔄 AutoConnect 状态监控
      </h3>
      <div class="flex items-center space-x-2">
        <div
          class="w-3 h-3 rounded-full"
          :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ isConnected ? '已连接' : '未连接' }}
        </span>
      </div>
    </div>

    <!-- AutoConnect 状态信息 -->
    <div class="space-y-3">
      <!-- 连接状态 -->
      <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">连接状态:</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ connectionStatus }}
        </span>
      </div>

      <!-- 钱包信息 -->
      <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">当前钱包:</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ currentWallet?.name || '无' }}
        </span>
      </div>

      <!-- 账户地址 -->
      <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">账户地址:</span>
        <span class="text-sm font-mono text-gray-600 dark:text-gray-400">
          {{ formatAddress(address ?? undefined) }}
        </span>
      </div>

      <!-- 网络 -->
      <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">当前网络:</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ network || '未知' }}
        </span>
      </div>

      <!-- AutoConnect 尝试次数 -->
      <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">AutoConnect 尝试:</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ autoConnectAttempts }} 次
        </span>
      </div>

      <!-- 最后连接时间 -->
      <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">最后连接:</span>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ lastConnectionTime || '从未连接' }}
        </span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="mt-4 flex space-x-2">
      <button
        @click="testAutoConnect"
        :disabled="isTesting"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span v-if="isTesting">测试中...</span>
        <span v-else>🔄 测试 AutoConnect</span>
      </button>

      <button
        @click="clearHistory"
        class="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
      >
        🗑️ 清除历史
      </button>
    </div>

    <!-- 连接历史 -->
    <div v-if="connectionHistory.length > 0" class="mt-4">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">连接历史:</h4>
      <div class="space-y-1 max-h-32 overflow-y-auto">
        <div
          v-for="(event, index) in connectionHistory"
          :key="index"
          class="text-xs p-2 bg-gray-50 dark:bg-gray-700 rounded"
        >
          <span class="text-gray-600 dark:text-gray-400">{{ event.time }}</span>
          <span class="ml-2" :class="event.type === 'success' ? 'text-green-600' : event.type === 'error' ? 'text-red-600' : 'text-blue-600'">
            {{ event.message }}
          </span>
        </div>
      </div>
    </div>

    <!-- AutoConnect 说明 -->
    <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
      <p class="text-xs text-blue-800 dark:text-blue-200">
        <strong>AutoConnect 说明:</strong>
        如果之前连接过钱包，系统会在页面加载后自动尝试重新连接。请确保钱包扩展已启用并解锁。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCore, useWallet } from '@btc-connect/vue'

// 状态管理
const autoConnectAttempts = ref(0)
const isTesting = ref(false)
const lastConnectionTime = ref('')
const connectionHistory = ref<Array<{
  time: string
  message: string
  type: 'success' | 'error' | 'info'
}>>([])

// 钱包状态
const { isConnected, currentWallet, availableWallets } = useCore()
const { address, network } = useWallet()

// 连接状态描述
const connectionStatus = computed(() => {
  if (isConnected.value) return '✅ 已连接'
  if (autoConnectAttempts.value > 0) return '🔄 AutoConnect 尝试中...'
  return '❌ 未连接'
})

// 格式化地址
const formatAddress = (addr?: string) => {
  if (!addr) return '无'
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
}

// 获取网络显示名称
const getNetworkDisplayName = (net?: any) => {
  if (!net) return '未知'

  // 如果是网络字符串
  if (typeof net === 'string') {
    const networkMap: Record<string, string> = {
      'livenet': 'Mainnet',
      'mainnet': 'Mainnet',
      'testnet': 'Testnet',
      'regtest': 'Regtest'
    }
    return networkMap[net] || net
  }

  // 如果是网络对象
  if (net.name) return net.name
  if (net.network) return getNetworkDisplayName(net.network)

  return '未知'
}

// 添加历史记录
const addHistory = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const time = new Date().toLocaleTimeString()
  connectionHistory.value.unshift({ time, message, type })
  if (connectionHistory.value.length > 10) {
    connectionHistory.value = connectionHistory.value.slice(0, 10)
  }
}

// 测试 AutoConnect
const testAutoConnect = async () => {
  isTesting.value = true
  autoConnectAttempts.value++

  addHistory('开始测试 AutoConnect 功能...', 'info')

  try {
    // 检查可用钱包
    if (availableWallets.value.length === 0) {
      addHistory('没有检测到可用的钱包', 'error')
      return
    }

    addHistory(`检测到 ${availableWallets.value.length} 个钱包`, 'info')

    // 等待一段时间看是否自动连接
    await new Promise(resolve => setTimeout(resolve, 3000))

    if (isConnected.value) {
      addHistory(`AutoConnect 成功连接到 ${currentWallet.value?.name}`, 'success')
      lastConnectionTime.value = new Date().toLocaleString()
    } else {
      addHistory('AutoConnect 未能自动连接，请手动连接', 'error')
    }
  } catch (error) {
    addHistory(`AutoConnect 测试失败: ${error instanceof Error ? error.message : String(error)}`, 'error')
  } finally {
    isTesting.value = false
  }
}

// 清除历史
const clearHistory = () => {
  connectionHistory.value = []
  autoConnectAttempts.value = 0
  lastConnectionTime.value = ''
}

// 监听连接状态变化
watch(isConnected, (connected) => {
  if (connected) {
    addHistory(`钱包已连接: ${currentWallet.value?.name}`, 'success')
    lastConnectionTime.value = new Date().toLocaleString()
  } else {
    addHistory('钱包已断开连接', 'info')
  }
})

// 监听钱包变化
watch(currentWallet, (wallet) => {
  if (wallet) {
    addHistory(`切换到钱包: ${wallet.name}`, 'info')
  }
})

// 组件挂载时记录
onMounted(() => {
  addHistory('AutoConnect 监控组件已初始化', 'info')

  // 检查是否有之前连接的钱包
  const lastWalletId = localStorage.getItem('btc-connect:last-wallet-id')
  if (lastWalletId) {
    addHistory(`发现上次连接的钱包: ${lastWalletId}`, 'info')
  } else {
    addHistory('没有发现之前的连接记录', 'info')
  }
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>