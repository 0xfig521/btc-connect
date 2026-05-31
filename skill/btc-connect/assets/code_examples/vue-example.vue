<template>
  <div class="wallet-example">
    <h2>BTC-Connect Vue 示例</h2>

    <!-- 使用预构建组件 -->
    <ConnectButton />
    <AddressDisplay />
    <BalanceDisplay />
    <WalletStatus />

    <div v-if="!isConnected">
      <button
        v-for="wallet in availableWallets"
        :key="wallet.id"
        @click="handleConnect(wallet.id)"
        :disabled="isConnecting"
      >
        {{ isConnecting ? '连接中...' : `连接 ${wallet.name}` }}
      </button>
      <button @click="walletModal.open()">
        选择钱包
      </button>
    </div>

    <div v-else>
      <!-- 账户信息 (模板中自动解包 Ref) -->
      <div>
        <h3>账户信息</h3>
        <p>地址: {{ address }}</p>
        <p>余额: {{ balance }} satoshis</p>
      </div>

      <!-- 网络管理 -->
      <div>
        <h3>网络管理</h3>
        <p>当前网络: {{ network }}</p>
        <button @click="handleSwitchNetwork('livenet')">主网</button>
        <button @click="handleSwitchNetwork('testnet')">测试网</button>
      </div>

      <!-- 消息签名 -->
      <div>
        <h3>消息签名</h3>
        <input v-model="message" type="text" placeholder="输入要签名的消息" />
        <button @click="handleSignMessage">签名消息</button>
        <p v-if="signature">签名结果: {{ signature }}</p>
      </div>

      <button @click="disconnect">断开连接</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  useWallet,
  ConnectButton,
  AddressDisplay,
  BalanceDisplay,
  WalletStatus,
} from '@btc-connect/vue'

// 统一 useWallet() API - 返回值为 ComputedRef/Ref
const {
  isConnected,
  address,
  balance,
  network,
  connect,
  disconnect,
  switchNetwork,
  signMessage,
  walletModal,
  availableWallets,
} = useWallet()

// 组件内部状态
const signature = ref('')
const message = ref('Hello, Bitcoin!')

// 连接钱包
const handleConnect = async (walletId) => {
  try {
    await connect(walletId)
  } catch (error) {
    console.error('连接失败:', error)
  }
}

// 网络切换
const handleSwitchNetwork = async (targetNetwork) => {
  try {
    await switchNetwork(targetNetwork)
  } catch (error) {
    console.error('网络切换失败:', error)
  }
}

// 消息签名
const handleSignMessage = async () => {
  try {
    const sig = await signMessage(message.value)
    signature.value = sig
  } catch (error) {
    console.error('签名失败:', error)
  }
}

// 监听连接状态变化
watch(isConnected, (connected) => {
  if (!connected) {
    signature.value = ''
  }
})
</script>

<style scoped>
.wallet-example {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.wallet-example h2 {
  text-align: center;
  margin-bottom: 24px;
}

.wallet-example h3 {
  margin: 16px 0 8px;
}

button {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
}

input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-right: 8px;
}
</style>
