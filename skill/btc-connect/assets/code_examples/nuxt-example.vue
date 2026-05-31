<!-- plugins/btc-connect.client.ts -->
<!--
import { BTCWalletPlugin } from '@btc-connect/vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BTCWalletPlugin, {
    autoConnect: true,
    theme: 'auto',
  })
})
-->

<template>
  <div>
    <h1>Nuxt 3 钱包集成</h1>

    <!-- ClientOnly 包裹避免 SSR 问题 -->
    <ClientOnly>
      <ConnectButton />
      <WalletPanel />
    </ClientOnly>
  </div>
</template>

<script setup>
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

const signature = ref('')
const message = ref('Hello, Bitcoin!')

const handleConnect = async (walletId) => {
  try {
    await connect(walletId)
  } catch (error) {
    console.error('连接失败:', error)
  }
}

const handleSwitchNetwork = async (targetNetwork) => {
  try {
    await switchNetwork(targetNetwork)
  } catch (error) {
    console.error('网络切换失败:', error)
  }
}

const handleSignMessage = async () => {
  try {
    const sig = await signMessage(message.value)
    signature.value = sig
  } catch (error) {
    console.error('签名失败:', error)
  }
}
</script>
