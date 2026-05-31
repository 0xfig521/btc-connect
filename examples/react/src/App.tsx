import { BTCWalletProvider, ConnectButton, useWallet } from '@btc-connect/react';

function WalletInfo() {
  const { isConnected, address, balance, connect, disconnect, availableWallets } = useWallet();

  return (
    <div style={{ marginTop: '20px' }}>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <p>Balance: {balance !== undefined ? `${balance} BTC` : 'Loading...'}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <div>
          <p>Available Wallets:</p>
          <ul>
            {availableWallets.map((wallet) => (
              <li key={wallet.id}>
                <button onClick={() => connect(wallet.id)}>{wallet.name}</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BTCWalletProvider autoConnect={true}>
      <div style={{ padding: '20px' }}>
        <h1>BTC Connect - React Example</h1>
        <ConnectButton />
        <WalletInfo />
      </div>
    </BTCWalletProvider>
  );
}

export default App;