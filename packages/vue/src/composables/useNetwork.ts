import type { Network } from '@btc-connect/core';
import { computed, ref, watch } from 'vue';
import { useWalletContext } from '../walletContext';

/**
 * Network management Composable
 *
 * Provides network state management and switching functionality for Bitcoin wallets.
 *
 * @returns Network state and methods
 * @returns {ComputedRef<{network: Network | undefined; name: string; type: string}>} returns.network - Current network info
 * @returns {Ref<Network | undefined>} returns.currentNetwork - Current network value
 * @returns {(targetNetwork: Network) => Promise<void>} returns.switchNetwork - Switch to a different network
 * @returns {ComputedRef<string>} returns.name - Network display name
 * @returns {(net: Network) => {name: string; type: string}} returns.getNetworkInfo - Get network info by network type
 *
 * @example
 * ```vue
 * <script setup>
 * import { useNetwork } from '@btc-connect/vue';
 *
 * const { network, switchNetwork, name } = useNetwork();
 *
 * const handleSwitchNetwork = async (targetNetwork: 'livenet' | 'testnet') => {
 *   try {
 *     await switchNetwork(targetNetwork);
 *     console.log('Switched to:', targetNetwork);
 *   } catch (error) {
 *     console.error('Failed to switch network:', error);
 *   }
 * };
 * </script>
 *
 * <template>
 *   <div>
 *     <p>Current Network: {{ name }}</p>
 *     <button @click="handleSwitchNetwork('testnet')">Switch to Testnet</button>
 *     <button @click="handleSwitchNetwork('livenet')">Switch to Mainnet</button>
 *   </div>
 * </template>
 * ```
 */

// Local network info mapping
const NETWORK_INFO: Record<Network, { name: string; type: string }> = {
  livenet: {
    name: 'Mainnet',
    type: 'main',
  },
  testnet: {
    name: 'Testnet',
    type: 'test',
  },
  regtest: {
    name: 'Regtest',
    type: 'regtest',
  },
  mainnet: {
    name: 'Mainnet',
    type: 'main',
  },
};

function getNetworkName(network?: Network): string {
  if (!network) return 'Unknown';
  return NETWORK_INFO[network]?.name || 'Unknown';
}

function getNetworkType(network?: Network): string {
  if (!network) return 'unknown';
  return NETWORK_INFO[network]?.type || 'unknown';
}

/**
 * Use network management Composable
 *
 * @returns Network state and switching methods
 */
export function useNetwork() {
  const ctx = useWalletContext();

  // 初始化时确保网络状态的一致性
  const currentNetwork = ref<Network | undefined>(
    ctx.state.value.network || 'livenet',
  );

  // 监听网络变化
  watch(
    ctx.state,
    (newState) => {
      // 只有当网络真正变化时才更新，避免undefined覆盖
      if (newState.network !== undefined) {
        currentNetwork.value = newState.network;
      }
    },
    { immediate: true },
  );

  const switchNetwork = async (targetNetwork: Network): Promise<void> => {
    if (ctx.manager.value?.switchNetwork) {
      return await ctx.manager.value.switchNetwork(targetNetwork);
    }
    throw new Error('Network switching not supported or no wallet connected');
  };

  const network = computed(() => {
    const net = currentNetwork.value;
    return {
      network: net,
      name: getNetworkName(net),
      type: getNetworkType(net),
    };
  });

  const getNetworkInfo = (net: Network) => {
    return {
      name: getNetworkName(net),
      type: getNetworkType(net),
    };
  };

  return {
    network,
    currentNetwork,
    switchNetwork,
    name: computed(() => getNetworkName(currentNetwork.value)),
    getNetworkInfo,
  };
}
