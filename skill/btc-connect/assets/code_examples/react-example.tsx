import { BTCWalletProvider, ConnectButton, useWallet } from '@btc-connect/react';

// App 根组件 - 配置 Provider
export function App() {
  return (
    <BTCWalletProvider autoConnect>
      <WalletPanel />
    </BTCWalletProvider>
  );
}

// 钱包面板 - 使用统一 useWallet() API
function WalletPanel() {
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

  // 连接钱包
  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
    } catch (error) {
      console.error('连接失败:', error);
    }
  };

  // 网络切换
  const handleSwitchNetwork = async (
    targetNetwork: 'livenet' | 'testnet' | 'regtest',
  ) => {
    try {
      await switchNetwork(targetNetwork);
    } catch (error) {
      console.error('网络切换失败:', error);
    }
  };

  // 消息签名
  const handleSignMessage = async (message: string) => {
    try {
      const signature = await signMessage(message);
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
    }
  };

  return (
    <div>
      {/* 使用预构建 ConnectButton 组件 */}
      <ConnectButton />

      {/* 或自定义 UI */}
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
