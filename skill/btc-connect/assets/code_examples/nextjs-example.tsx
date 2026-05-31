'use client';

import dynamic from 'next/dynamic';
import { BTCWalletProvider, ConnectButton, useWallet } from '@btc-connect/react';

// 动态导入避免 SSR 问题
const WalletPanel = dynamic(() => Promise.resolve(WalletPanelInner), {
  ssr: false,
  loading: () => <div>Loading wallet...</div>,
});

// 页面组件
export default function WalletPage() {
  return (
    <BTCWalletProvider autoConnect>
      <WalletPanel />
    </BTCWalletProvider>
  );
}

// 钱包面板 - 使用统一 useWallet() API
function WalletPanelInner() {
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
  } = useWallet();

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  const handleSwitchNetwork = async (
    targetNetwork: 'livenet' | 'testnet' | 'regtest',
  ) => {
    try {
      await switchNetwork(targetNetwork);
    } catch (error) {
      console.error('网络切换失败:', error);
    }
  };

  const handleSignMessage = async (message: string) => {
    try {
      return await signMessage(message);
    } catch (error) {
      console.error('签名失败:', error);
    }
  };

  return (
    <div>
      <ConnectButton />

      {!isConnected ? (
        <div>
          {availableWallets.map((wallet) => (
            <button key={wallet.id} onClick={() => handleConnect(wallet.id)}>
              连接 {wallet.name}
            </button>
          ))}
          <button onClick={() => walletModal.openModal()}>
            选择钱包
          </button>
        </div>
      ) : (
        <div>
          <p>地址: {address}</p>
          <p>余额: {balance} satoshis</p>
          <p>网络: {network}</p>

          <button onClick={() => handleSwitchNetwork('livenet')}>主网</button>
          <button onClick={() => handleSwitchNetwork('testnet')}>测试网</button>

          <button onClick={() => handleSignMessage('Hello, Bitcoin!')}>
            签名消息
          </button>

          <button onClick={disconnect}>断开连接</button>
        </div>
      )}
    </div>
  );
}
