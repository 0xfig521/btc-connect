import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { GlobalWindow } from 'happy-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { useBalance } from '../useBalance';
import type { BalanceDetail } from '../../types';

const window = new GlobalWindow();
(global as any).document = window.document;
(global as any).window = window;

// Mock useWalletContext
const mockGetBalance = mock(async (): Promise<BalanceDetail | null> => null);
const mockGetPublicKey = mock(async (): Promise<string | null> => null);
const mockGetCurrentAdapter = mock(() => null);

const mockManager = {
  getCurrentAdapter: mockGetCurrentAdapter,
} as any;

let mockContextValue: {
  manager: typeof mockManager | null;
  isConnected: boolean;
  state: {
    currentAccount: {
      balance: BalanceDetail | null;
    } | null;
  };
};

const originalModule = await import('../../context/provider');

describe('useBalance', () => {
  beforeEach(() => {
    mockGetBalance.mockClear();
    mockGetPublicKey.mockClear();
    mockGetCurrentAdapter.mockClear();

    mockContextValue = {
      manager: mockManager,
      isConnected: false,
      state: {
        currentAccount: null,
      },
    };

    spyOn(originalModule, 'useWalletContext').mockImplementation(() => mockContextValue as any);
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Initial State', () => {
    it('should return null balance when not connected', () => {
      mockContextValue.isConnected = false;
      mockContextValue.manager = null;

      const { result } = renderHook(() => useBalance());

      expect(result.current.balance).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should return zero values for balance properties when balance is null', () => {
      mockContextValue.isConnected = false;
      mockContextValue.manager = null;

      const { result } = renderHook(() => useBalance());

      expect(result.current.confirmedBalance).toBe(0);
      expect(result.current.unconfirmedBalance).toBe(0);
      expect(result.current.totalBalance).toBe(0);
    });
  });

  describe('Balance Values', () => {
    it('should return correct confirmedBalance from balance object', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 10000,
        unconfirmed: 5000,
        total: 15000,
      };

      mockContextValue.isConnected = true;
      mockContextValue.state.currentAccount = { balance: testBalance };
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(testBalance);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.confirmedBalance).toBe(10000);
      });
    });

    it('should return correct unconfirmedBalance from balance object', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 10000,
        unconfirmed: 5000,
        total: 15000,
      };

      mockContextValue.isConnected = true;
      mockContextValue.state.currentAccount = { balance: testBalance };
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(testBalance);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.unconfirmedBalance).toBe(5000);
      });
    });

    it('should return correct totalBalance from balance object', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 10000,
        unconfirmed: 5000,
        total: 15000,
      };

      mockContextValue.isConnected = true;
      mockContextValue.state.currentAccount = { balance: testBalance };
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(testBalance);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.totalBalance).toBe(15000);
      });
    });

    it('should handle balance with zero values', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 0,
        unconfirmed: 0,
        total: 0,
      };

      mockContextValue.isConnected = true;
      mockContextValue.state.currentAccount = { balance: testBalance };
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(testBalance);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.confirmedBalance).toBe(0);
        expect(result.current.unconfirmedBalance).toBe(0);
        expect(result.current.totalBalance).toBe(0);
      });
    });

    it('should handle balance with only confirmed amount', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 20000,
        unconfirmed: 0,
        total: 20000,
      };

      mockContextValue.isConnected = true;
      mockContextValue.state.currentAccount = { balance: testBalance };
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(testBalance);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.confirmedBalance).toBe(20000);
        expect(result.current.unconfirmedBalance).toBe(0);
        expect(result.current.totalBalance).toBe(20000);
      });
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to true when fetching balance', async () => {
      let resolveBalance: (value: BalanceDetail | null) => void;
      const balancePromise = new Promise<BalanceDetail | null>((resolve) => {
        resolveBalance = resolve;
      });

      mockContextValue.isConnected = true;
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: () => balancePromise,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      resolveBalance!({
        confirmed: 1000,
        unconfirmed: 0,
        total: 1000,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should set isLoading to false after balance fetch completes', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 5000,
        unconfirmed: 1000,
        total: 6000,
      };

      mockContextValue.isConnected = true;
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(testBalance);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('refreshBalance', () => {
    it('should be a function', () => {
      mockContextValue.isConnected = false;
      mockContextValue.manager = null;

      const { result } = renderHook(() => useBalance());

      expect(typeof result.current.refreshBalance).toBe('function');
    });

    it('should not throw when manager is null', async () => {
      mockContextValue.isConnected = false;
      mockContextValue.manager = null;

      const { result } = renderHook(() => useBalance());

      await expect(result.current.refreshBalance()).resolves.toBeUndefined();
    });

    it('should fetch balance when refreshBalance is called', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 3000,
        unconfirmed: 500,
        total: 3500,
      };

      mockContextValue.isConnected = true;
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce({
        confirmed: 1000,
        unconfirmed: 0,
        total: 1000,
      });

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockGetBalance.mockResolvedValueOnce(testBalance);

      await result.current.refreshBalance();

      expect(mockGetBalance).toHaveBeenCalled();
    });

    it('should set isLoading during refresh', async () => {
      const testBalance: BalanceDetail = {
        confirmed: 1000,
        unconfirmed: 0,
        total: 1000,
      };

      mockContextValue.isConnected = true;
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(testBalance);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let resolveRefresh: (value: BalanceDetail | null) => void;
      const refreshPromise = new Promise<BalanceDetail | null>((resolve) => {
        resolveRefresh = resolve;
      });
      mockGetBalance.mockReturnValueOnce(refreshPromise);

      const refreshCall = result.current.refreshBalance();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      resolveRefresh!(testBalance);
      await refreshCall;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('Return Value Structure', () => {
    it('should return all expected properties', () => {
      mockContextValue.isConnected = false;
      mockContextValue.manager = null;

      const { result } = renderHook(() => useBalance());

      expect(result.current).toHaveProperty('balance');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('refreshBalance');
      expect(result.current).toHaveProperty('confirmedBalance');
      expect(result.current).toHaveProperty('unconfirmedBalance');
      expect(result.current).toHaveProperty('totalBalance');
    });

    it('should have correct types for all properties', () => {
      mockContextValue.isConnected = false;
      mockContextValue.manager = null;

      const { result } = renderHook(() => useBalance());

      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.refreshBalance).toBe('function');
      expect(typeof result.current.confirmedBalance).toBe('number');
      expect(typeof result.current.unconfirmedBalance).toBe('number');
      expect(typeof result.current.totalBalance).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle getBalance error gracefully', async () => {
      mockContextValue.isConnected = true;
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockRejectedValueOnce(new Error('Balance fetch failed'));

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBeNull();
    });

    it('should handle invalid balance response', async () => {
      mockContextValue.isConnected = true;
      mockGetCurrentAdapter.mockReturnValue({
        getBalance: mockGetBalance,
        getPublicKey: mockGetPublicKey,
        state: {
          currentAccount: {},
          accounts: [],
        },
      });
      mockGetBalance.mockResolvedValueOnce(null);

      const { result } = renderHook(() => useBalance());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.balance).toBeNull();
    });
  });
});
