<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <!-- 页头 -->
    <header class="bitcoin-gradient text-white shadow-lg mb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold mb-2">🔗 BTC Connect 完整测试套件</h1>
          <p class="text-orange-100">Nuxt 3 + Vue 3 钱包功能完整测试</p>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto">
      <!-- 状态概览卡片 -->
      <div class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          📊 钱包状态概览
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {{ isConnected ? '✅' : '❌' }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              连接状态
            </div>
          </div>
          <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">
              {{ accounts.length }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              账户数量
            </div>
          </div>
          <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {{ currentNetwork || '未知' }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              当前网络
            </div>
          </div>
        </div>

        <!-- 详细状态信息 -->
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span class="font-semibold">当前地址:</span>
            <span class="ml-2 text-sm">{{ address || '无' }}</span>
          </div>
          <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span class="font-semibold">余额:</span>
            <span class="ml-2">{{ balanceInfo ? `${balanceInfo.total || 0} BTC` : '未知' }}</span>
          </div>
        </div>

        <div v-if="error" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-red-600 dark:text-red-400">
          <span class="font-semibold">错误:</span> {{ error.message }}
        </div>
      </div>

      <!-- 响应式调试面板 -->
      <ClientOnly>
        <WalletDebugPanel class="mb-8" />
      </ClientOnly>

      <!-- AutoConnect 状态监控 -->
      <AutoConnectStatusCard class="mb-8" />

      <!-- 测试控制 -->
      <div class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          🎮 测试控制
        </h2>
        <div class="flex flex-wrap gap-3">
          <button
            @click="runAllTests"
            :disabled="isRunning"
            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isRunning">⏳ 运行中...</span>
            <span v-else>🚀 运行所有测试</span>
          </button>
          <button
            @click="clearLogs"
            class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🗑️ 清除日志
          </button>
          <button
            @click="openModal()"
            class="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            🔗 打开钱包选择器
          </button>
        </div>
      </div>

      <!-- 单项测试按钮 -->
      <div class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          🧪 单项测试
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            @click="testConnection"
            :disabled="isRunning"
            class="test-button"
          >
            🔗 连接测试
          </button>
          <button
            @click="testAccounts"
            :disabled="isRunning"
            class="test-button"
          >
            👤 账户信息测试
          </button>
          <button
            @click="testBalance"
            :disabled="isRunning"
            class="test-button"
          >
            💰 余额测试
          </button>
          <button
            @click="testNetwork"
            :disabled="isRunning"
            class="test-button"
          >
            🌐 网络测试
          </button>
          <button
            @click="testSignature"
            :disabled="isRunning"
            class="test-button"
          >
            ✍️ 消息签名测试
          </button>
          <button
            @click="testPsbtSignature"
            :disabled="isRunning"
            class="test-button"
          >
            📝 PSBT签名测试
          </button>
          <button
            @click="testTransaction"
            :disabled="isRunning"
            class="test-button"
          >
            📤 交易测试
          </button>
          <button
            @click="testModal"
            :disabled="isRunning"
            class="test-button"
          >
            🪟 模态框测试
          </button>
          <button
            @click="testWalletSwitch"
            :disabled="isRunning"
            class="test-button"
          >
            🔄 钱包切换测试
          </button>
          <button
            @click="testDisconnection"
            :disabled="isRunning"
            class="test-button"
          >
            ❌ 断开连接测试
          </button>
          <button
            @click="testDetection"
            :disabled="isRunning"
            class="test-button"
          >
            🔍 钱包检测测试
          </button>
          <button
            @click="testHealthCheckFn"
            :disabled="isRunning"
            class="test-button"
          >
            🏥 健康检查测试
          </button>
          <button
            @click="testAdapterMonitorFn"
            :disabled="isRunning"
            class="test-button"
          >
            📊 监控统计测试
          </button>
        </div>
      </div>

      <!-- 🔌 Adapter 详情面板 -->
      <div class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          🔌 Adapter 详情
        </h2>
        
        <div v-if="!currentAdapter" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>请先连接钱包以查看 Adapter 详情</p>
        </div>
        
        <div v-else class="space-y-6">
          <!-- 📋 基本信息 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              📋 基本信息
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span class="text-sm text-gray-500 dark:text-gray-400">ID</span>
                <p class="font-mono text-sm">{{ currentAdapter.id }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500 dark:text-gray-400">名称</span>
                <p class="font-semibold">{{ currentAdapter.name }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-500 dark:text-gray-400">就绪状态</span>
                <p :class="currentAdapter.isReady() ? 'text-green-600' : 'text-red-600'">
                  {{ currentAdapter.isReady() ? '✅ 已就绪' : '❌ 未就绪' }}
                </p>
              </div>
              <div>
                <span class="text-sm text-gray-500 dark:text-gray-400">图标</span>
                <img :src="currentAdapter.icon" :alt="currentAdapter.name" class="w-8 h-8 inline-block" />
              </div>
            </div>
          </div>

          <!-- 📊 状态信息 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              📊 状态信息 (getState)
            </h3>
            <pre class="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">{{ JSON.stringify(adapterState, null, 2) }}</pre>
          </div>

          <!-- 🔧 方法列表 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              🔧 方法列表 ({{ adapterMethods.length }} 个)
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="method in adapterMethods"
                :key="method"
                class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-mono"
              >
                {{ method }}()
              </span>
            </div>
          </div>

          <!-- 🧪 方法测试 -->
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
              🧪 方法测试
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
              <button
                @click="testAdapterMethod('connect')"
                :disabled="isRunning || !currentAdapter.isReady()"
                class="test-button text-sm"
              >
                🔗 connect
              </button>
              <button
                @click="testAdapterMethod('disconnect')"
                :disabled="isRunning || !isConnected"
                class="test-button text-sm"
              >
                ❌ disconnect
              </button>
              <button
                @click="testAdapterMethod('getAccounts')"
                :disabled="isRunning || !isConnected"
                class="test-button text-sm"
              >
                👤 getAccounts
              </button>
              <button
                @click="testAdapterMethod('getNetwork')"
                :disabled="isRunning || !isConnected"
                class="test-button text-sm"
              >
                🌐 getNetwork
              </button>
              <button
                @click="testAdapterMethod('signMessage')"
                :disabled="isRunning || !isConnected"
                class="test-button text-sm"
              >
                ✍️ signMessage
              </button>
            </div>
            
            <!-- 方法调用结果 -->
            <div v-if="methodResult" class="mt-4">
              <h4 class="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                📤 调用结果
              </h4>
              <pre class="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto max-h-48 overflow-y-auto">{{ methodResult }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试结果 -->
      <div v-if="Object.keys(testResults).length > 0" class="wallet-card mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          📈 测试结果
        </h2>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
          <div
            v-for="[test, result] in Object.entries(testResults)"
            :key="test"
            class="mb-2"
          >
            <span class="text-yellow-400">{{ test }}:</span> {{ result }}
          </div>
        </div>
      </div>

      <!-- 实时日志 -->
      <div class="wallet-card">
        <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          📝 实时日志
        </h2>
        <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          <div v-if="logs.length === 0" class="text-gray-500 italic">
            等待测试开始...
          </div>
          <div
            v-else
            v-for="(log, index) in logs"
            :key="index"
            class="mb-1"
          >
            {{ log }}
          </div>
        </div>
      </div>

      <!-- 说明信息 -->
      <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 class="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
          ℹ️ 测试说明
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="font-semibold text-blue-700 dark:text-blue-300">基础功能:</p>
            <ul class="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
              <li>🔗 <strong>连接测试:</strong> 测试钱包连接功能</li>
              <li>👤 <strong>账户测试:</strong> 获取账户信息和公钥</li>
              <li>💰 <strong>余额测试:</strong> 获取已确认和未确认余额</li>
              <li>🌐 <strong>网络测试:</strong> 获取当前网络并尝试切换</li>
            </ul>
          </div>
          <div>
            <p class="font-semibold text-blue-700 dark:text-blue-300">高级功能:</p>
            <ul class="ml-4 space-y-1 text-gray-700 dark:text-gray-300">
              <li>✍️ <strong>消息签名:</strong> 测试消息签名功能</li>
              <li>📝 <strong>PSBT签名:</strong> 测试PSBT功能</li>
              <li>📤 <strong>交易测试:</strong> 演示比特币发送功能</li>
              <li>🔄 <strong>钱包切换:</strong> 测试在不同钱包间切换</li>
            </ul>
          </div>
        </div>
        <p class="mt-4 text-xs text-gray-600 dark:text-gray-400">
          <strong>注意:</strong> 某些功能可能需要特定的钱包支持。测试前请确保已安装并启用相应的比特币钱包扩展。
        </p>
      </div>

    </main>

    <!-- 全局模态框 -->
    <ClientOnly>
      <WalletModal />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// 导入所需的 composables
import {
  useWallet,
  useCore,
  useAccount,
  useConnectWallet,
  useBalance,
  useWalletModal,
  useSignature,
  useTransactions,
  useNetwork,
  useWalletInfo,
  // 新增 Composables
  useWalletDetection,
  useWalletEvent,
  useWalletManager,
  useWalletManagerAdvanced
} from '@btc-connect/vue'
import WalletDebugPanel from './WalletDebugPanel.vue'

// 页面元数据
useHead({
  title: 'BTC Connect - 完整测试套件',
  meta: [
    { name: 'description', content: 'Bitcoin wallet connection complete test suite using Nuxt 3' }
  ]
})

// 状态管理
const logs = ref<string[]>([])
const testResults = ref<Record<string, string>>({})
const isRunning = ref(false)

// Adapter 详情相关状态
const adapterState = ref<Record<string, any>>({})
const adapterMethods = ref<string[]>([])
const methodResult = ref<string>('')

// 钱包状态
const { status, accounts, currentAccount, network, error, isConnected, isConnecting, address, balance, publicKey } = useWallet()
const wallet = useWallet()

console.log('wallet', wallet)
const { connect, disconnect, switchWallet, availableWallets } = useConnectWallet()
const { open: openModal, isOpen: isModalOpen } = useWalletModal()
const { network: currentNetwork, switchNetwork } = useNetwork()
const { accounts: accountList } = useAccount()
const { balance: balanceInfo } = useBalance()
const { signMessage, signPsbt } = useSignature()
const { sendBitcoin } = useTransactions()

// ========== 新增 Composables ==========

// 钱包检测
const {
  isDetecting,
  detectedWallets,
  isComplete: detectionComplete,
  elapsedTime: detectionElapsedTime,
  detectionStats,
  startDetection,
  stopDetection,
  restartDetection
} = useWalletDetection()

// 钱包管理器
const {
  currentAdapter,
  availableAdapters,
  adapterStates,
  getAdapter
} = useWalletManager()

// 高级钱包管理器
const {
  healthCheck,
  adapterMonitor,
  connectMultiple,
  disconnectAll
} = useWalletManagerAdvanced()

// 钱包事件历史
const eventHistory = ref<Array<{type: string, data: any, timestamp: number}>>([])

// 工具函数
const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value = [...logs.value.slice(-9), `${timestamp}: ${message}`]
}

const addTestResult = (test: string, result: string) => {
  testResults.value = { ...testResults.value, [test]: result }
  addLog(`${test}: ${result}`)
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 测试函数
const testConnection = async () => {
  try {
    addTestResult('连接测试', '开始连接...')
    if (!isConnected.value) {
      await connect('unisat')
      addTestResult('连接测试', '✅ 连接成功')
    } else {
      addTestResult('连接测试', 'ℹ️ 已经连接')
    }
  } catch (error) {
    addTestResult('连接测试', `❌ 连接失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testAccounts = async () => {
  try {
    addTestResult('账户测试', '获取账户信息...')
    if (!isConnected.value) {
      addTestResult('账户测试', '❌ 请先连接钱包')
      return
    }

    addTestResult('账户测试', `✅ 账户数量: ${accounts.value.length}`)
    addTestResult('当前账户', `✅ 地址: ${address.value || '无'}`)
    addTestResult('公钥测试', `✅ 公钥: ${publicKey.value ? '已获取' : '未获取'}`)
  } catch (error) {
    addTestResult('账户测试', `❌ 账户测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testBalance = async () => {
  try {
    addTestResult('余额测试', '获取余额信息...')
    if (!isConnected.value) {
      addTestResult('余额测试', '❌ 请先连接钱包')
      return
    }

    if (balanceInfo.value) {
      addTestResult('余额测试', `✅ 已确认: ${balanceInfo.value.confirmed || 0} BTC`)
      addTestResult('未确认余额', `✅ 未确认: ${balanceInfo.value.unconfirmed || 0} BTC`)
      addTestResult('总余额', `✅ 总计: ${balanceInfo.value.total || 0} BTC`)
    } else {
      addTestResult('余额测试', 'ℹ️ 余额信息为空')
    }
  } catch (error) {
    addTestResult('余额测试', `❌ 余额测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testNetwork = async () => {
  try {
    addTestResult('网络测试', '获取网络信息...')
    if (!isConnected.value) {
      addTestResult('网络测试', '❌ 请先连接钱包')
      return
    }

    const networkName = currentNetwork.value?.name || currentNetwork.value || '未知'
    addTestResult('当前网络', `✅ 当前网络: ${networkName}`)

    // 尝试切换到测试网
    if (networkName && networkName !== 'testnet') {
      try {
        await switchNetwork('testnet')
        addTestResult('网络切换', '✅ 已切换到测试网')
      } catch (error) {
        addTestResult('网络切换', `ℹ️ 切换失败（可能不支持）: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  } catch (error) {
    addTestResult('网络测试', `❌ 网络测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testSignature = async () => {
  try {
    addTestResult('签名测试', '开始消息签名测试...')
    if (!isConnected.value) {
      addTestResult('签名测试', '❌ 请先连接钱包')
      return
    }

    const testMessage = 'BTC Connect 测试消息 - ' + new Date().toISOString()
    const signature = await signMessage(testMessage)
    addTestResult('消息签名', `✅ 签名成功，长度: ${signature.length}`)
    addTestResult('签名内容', `✅ 签名: ${signature.substring(0, 20)}...`)
  } catch (error) {
    addTestResult('消息签名', `❌ 签名失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testPsbtSignature = async () => {
  try {
    addTestResult('PSBT签名测试', '开始PSBT签名测试...')
    if (!isConnected.value) {
      addTestResult('PSBT签名测试', '❌ 请先连接钱包')
      return
    }

    // 示例PSBT
    const testPsbt = 'cHNldP8BAHUCAAAAASaBcTce3u7JuyxvGB1J9nGQk8jKtzQZpq7a8C7m3COAAAAAAD/////////aLKkAAAAAABYAFOvsZAAAAGXapLMCqJDB9CGVMhKbTRV4F5bGpBAAAAAP7///8CYFvKAAAAFgAUk7d6Jq6FqAQVIRsJhvLZd8vnLWbAAAAABYAFOvsZAAAAGXapLMCqJDB9CGVMhKbTRV4F5bGpBAAAAAAAAAAAAAQAEAQIAAAAAACIAIBIkCrVlAVrLAmK0opVb6L7aZujhY1h0cW00Uz9lqJ8AAAAAABYAFMr+kKqT4QGZjwQdS0R3g7Aq1yvVbIgMEQIEAhgAgL7YQAAAAAAiAgL5Q7VdWRa4Q7rTKQOxIVaYjqmzZ1JR7c8qJpgA4AAAAAAAABgUT'

    const signedPsbt = await signPsbt(testPsbt)
    addTestResult('PSBT签名', `✅ PSBT签名成功，长度: ${signedPsbt.length}`)
  } catch (error) {
    addTestResult('PSBT签名', `❌ PSBT签名失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testTransaction = async () => {
  try {
    addTestResult('交易测试', '开始发送比特币测试...')
    if (!isConnected.value) {
      addTestResult('交易测试', '❌ 请先连接钱包')
      return
    }

    const testAddress = 'tb1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    const testAmount = 0.00001

    addTestResult('交易测试', `ℹ️ 准备发送 ${testAmount} BTC 到 ${testAddress}`)
    addTestResult('交易测试', '⚠️ 这是一个演示，不会实际发送交易')
  } catch (error) {
    addTestResult('交易测试', `❌ 交易测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testModal = () => {
  try {
    if (isModalOpen.value) {
      addTestResult('模态框测试', 'ℹ️ 模态框已打开')
    } else {
      openModal()
      addTestResult('模态框测试', '✅ 模态框已打开')
    }
  } catch (error) {
    addTestResult('模态框测试', `❌ 模态框测试失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testWalletSwitch = async () => {
  try {
    addTestResult('钱包切换测试', '获取可用钱包...')

    const otherWallets = availableWallets.value.filter((w: any) => !w.id.includes(currentAccount.value?.address || ''))
    if (otherWallets.length > 0) {
      const targetWallet = otherWallets[0]
      await switchWallet(targetWallet.id)
      addTestResult('钱包切换', `✅ 已切换到: ${targetWallet.name}`)
    } else {
      addTestResult('钱包切换', 'ℹ️ 没有其他可用的钱包')
    }
  } catch (error) {
    addTestResult('钱包切换测试', `❌ 钱包切换失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const testDisconnection = async () => {
  try {
    addTestResult('断开测试', '开始断开连接...')
    if (isConnected.value) {
      await disconnect()
      addTestResult('断开测试', '✅ 已断开连接')
    } else {
      addTestResult('断开测试', 'ℹ️ 钱包未连接')
    }
  } catch (error) {
    addTestResult('断开测试', `❌ 断开连接失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// ========== 新增测试函数 ==========

// 钱包检测测试
const testDetection = async () => {
  addTestResult('钱包检测', '开始检测...')
  try {
    await startDetection()
    addTestResult('钱包检测', `✅ 检测完成: ${detectedWallets.value.length}个钱包`)
  } catch (error) {
    addTestResult('钱包检测', `❌ 检测失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 健康检查测试
const testHealthCheckFn = async () => {
  addTestResult('健康检查', '执行健康检查...')
  try {
    const health = await healthCheck()
    if ('details' in health) {
      addTestResult('健康检查', `✅ 状态: ${health.status}, 详情: ${health.details.length}个适配器`)
    } else {
      addTestResult('健康检查', `✅ 状态: ${health.status}, 消息: ${health.message}`)
    }
  } catch (error) {
    addTestResult('健康检查', `❌ 检查失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// 监控统计测试
const testAdapterMonitorFn = () => {
  const stats = adapterMonitor()
  addTestResult('监控统计', `✅ 总适配器: ${stats.totalAdapters}, 已连接: ${stats.connectedAdapters}`)
}

// 清除事件历史
const clearEventHistory = () => {
  eventHistory.value = []
  addLog('📝 事件历史已清除')
}

// ========== Adapter 详情相关函数 ==========

// 获取 adapter 的公共方法列表
const getAdapterMethods = (adapter: any): string[] => {
  if (!adapter) return []
  
  const proto = Object.getPrototypeOf(adapter)
  const allMethods = Object.getOwnPropertyNames(proto)
  
  // 过滤出公共方法（排除 constructor 和 _ 开头的方法）
  return allMethods.filter(method => {
    return method !== 'constructor' && !method.startsWith('_')
  })
}

// 更新 adapter 状态和方法列表
const updateAdapterInfo = () => {
  if (currentAdapter.value) {
    adapterState.value = currentAdapter.value.getState()
    adapterMethods.value = getAdapterMethods(currentAdapter.value)
  } else {
    adapterState.value = {}
    adapterMethods.value = []
  }
}

// 测试 adapter 方法
const testAdapterMethod = async (methodName: string) => {
  if (!currentAdapter.value) {
    methodResult.value = '错误: 未连接钱包'
    return
  }
  
  methodResult.value = `⏳ 正在调用 ${methodName}()...`
  addLog(`🧪 测试 Adapter 方法: ${methodName}`)
  
  try {
    let result: any
    
    switch (methodName) {
      case 'connect':
        result = await currentAdapter.value.connect()
        break
      case 'disconnect':
        await currentAdapter.value.disconnect()
        result = { success: true, message: '已断开连接' }
        break
      case 'getAccounts':
        result = await currentAdapter.value.getAccounts()
        break
      case 'getNetwork':
        result = await currentAdapter.value.getNetwork()
        break
      case 'signMessage':
        const testMsg = 'BTC Connect Adapter 测试消息 - ' + new Date().toISOString()
        result = await currentAdapter.value.signMessage(testMsg)
        break
      default:
        result = { error: '未知方法' }
    }
    
    methodResult.value = JSON.stringify(result, null, 2)
    addLog(`✅ ${methodName}() 成功`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    methodResult.value = `❌ 错误: ${errorMsg}`
    addLog(`❌ ${methodName}() 失败: ${errorMsg}`)
  }
}

// 运行所有测试
const runAllTests = async () => {
  isRunning.value = true
  addLog('🚀 开始运行完整测试套件...')

  try {
    // 按顺序执行测试
    await testConnection()
    await delay(1000)

    await testAccounts()
    await delay(500)

    await testBalance()
    await delay(500)

    await testNetwork()
    await delay(500)

    await testSignature()
    await delay(500)

    await testPsbtSignature()
    await delay(500)

    await testTransaction()
    await delay(500)

    testModal()
    await delay(500)

    await testWalletSwitch()

    addLog('✅ 测试套件执行完成！')
  } catch (error) {
    addLog(`❌ 测试套件执行失败: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    isRunning.value = false
  }
}

// 清除日志
const clearLogs = () => {
  logs.value = []
  testResults.value = {}
  addLog('📝 日志已清除')
}

// 事件监听
onMounted(() => {
  // 监听钱包事件
  const { manager } = useCore()

  if (manager.value) {
    manager.value.on('connect', (params: any) => {
      const accountCount = params?.accounts?.length ?? 0
      addLog(`钱包已连接，账户数量: ${accountCount}`)
      updateAdapterInfo()
    })

    manager.value.on('disconnect', () => {
      addLog('钱包已断开连接')
      updateAdapterInfo()
    })

    manager.value.on('accountChange', (params: any) => {
      const accountCount = params?.accounts?.length ?? 0
      addLog(`账户已变更，新账户数量: ${accountCount}`)
      updateAdapterInfo()
    })

    manager.value.on('networkChange', (params: any) => {
      const network = params?.network ?? 'unknown'
      addLog(`网络已切换到: ${network}`)
      updateAdapterInfo()
    })
  }
  
  // 初始化 adapter 信息
  updateAdapterInfo()
})

// 监听 currentAdapter 变化
watch(currentAdapter, () => {
  updateAdapterInfo()
}, { immediate: true })
</script>

<style scoped>
.test-button {
  @apply px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors;
}

.bitcoin-gradient {
  background: linear-gradient(135deg, #f7931a 0%, #ff6b35 100%);
}

.wallet-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700;
}

/* 自定义滚动条样式 */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>