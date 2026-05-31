import {
  BTCWalletManager,
  createAdapter,
  detectAvailableWallets,
} from '@btc-connect/core';

// 创建钱包管理器
const manager = new BTCWalletManager({
  onError: (error) => console.error('Wallet error:', error),
  onStateChange: (state) => console.log('State changed:', state),
});

// 检测可用钱包 (支持延迟注入的钱包，20秒内每300ms轮询)
const detectWallets = async () => {
  const result = await detectAvailableWallets({
    timeout: 20000,
    interval: 300,
  });

  console.log(`检测到 ${result.wallets.length} 个钱包, 耗时 ${result.elapsedTime}ms`);
  return result;
};

// 注册事件监听
manager.on('connect', (accounts) => {
  console.log('钱包已连接:', accounts);
  updateUI();
});

manager.on('disconnect', () => {
  console.log('钱包已断开');
  updateUI();
});

manager.on('networkChange', ({ network }) => {
  console.log('网络已变更:', network);
  updateNetworkUI(network);
});

manager.on('accountChange', (accounts) => {
  console.log('账户已变更:', accounts);
  updateUI();
});

// 连接钱包
const connectWallet = async (walletId) => {
  try {
    const accounts = await manager.connect(walletId);
    console.log('连接成功:', accounts);
  } catch (error) {
    console.error('连接失败:', error);
  }
};

// 断开连接
const disconnectWallet = async () => {
  try {
    await manager.disconnect();
  } catch (error) {
    console.error('断开连接失败:', error);
  }
};

// 网络切换
const switchNetwork = async (network) => {
  try {
    await manager.switchNetwork(network);
    console.log('网络切换成功');
  } catch (error) {
    if (error.message?.includes('not supported')) {
      console.log('当前钱包不支持程序化网络切换，请手动在钱包中切换');
    } else {
      console.error('网络切换失败:', error);
    }
  }
};

// 消息签名
const signMessage = async (message) => {
  const adapter = manager.getCurrentAdapter();
  if (!adapter) {
    console.error('请先连接钱包');
    return;
  }
  try {
    const signature = await adapter.signMessage(message);
    console.log('签名成功:', signature);
    return signature;
  } catch (error) {
    console.error('签名失败:', error);
  }
};

// UI 更新
const updateUI = () => {
  const state = manager.getState();
  const addressDisplay = document.getElementById('address-display');
  const connectSection = document.getElementById('connect-section');
  const accountSection = document.getElementById('account-section');

  if (state.currentAccount) {
    if (addressDisplay) addressDisplay.textContent = state.currentAccount.address;
    if (connectSection) connectSection.style.display = 'none';
    if (accountSection) accountSection.style.display = 'block';
  } else {
    if (addressDisplay) addressDisplay.textContent = '';
    if (connectSection) connectSection.style.display = 'block';
    if (accountSection) accountSection.style.display = 'none';
  }
};

const updateNetworkUI = (network) => {
  const networkDisplay = document.getElementById('network-display');
  if (networkDisplay) {
    networkDisplay.textContent = network === 'livenet' ? '主网' : '测试网';
  }
};

// 初始化
const init = async () => {
  const result = await detectWallets();

  if (result.wallets.length === 0) {
    console.log('未检测到可用钱包，请安装 UniSat 或 OKX 钱包扩展');
    return;
  }

  // 绑定按钮事件
  const unisatBtn = document.getElementById('unisat-btn');
  if (unisatBtn) unisatBtn.addEventListener('click', () => connectWallet('unisat'));

  const okxBtn = document.getElementById('okx-btn');
  if (okxBtn) okxBtn.addEventListener('click', () => connectWallet('okx'));

  const disconnectBtn = document.getElementById('disconnect-btn');
  if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectWallet);

  const mainnetBtn = document.getElementById('switch-mainnet');
  if (mainnetBtn) mainnetBtn.addEventListener('click', () => switchNetwork('livenet'));

  const testnetBtn = document.getElementById('switch-testnet');
  if (testnetBtn) testnetBtn.addEventListener('click', () => switchNetwork('testnet'));

  const signBtn = document.getElementById('sign-message');
  if (signBtn) signBtn.addEventListener('click', () => signMessage('Hello, Bitcoin!'));
};

// 启动
if (typeof window !== 'undefined') {
  init();
}

export default manager;
