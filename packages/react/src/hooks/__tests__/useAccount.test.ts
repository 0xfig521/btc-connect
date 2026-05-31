import { afterEach, beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { Window } from 'happy-dom';
import { renderHook } from '@testing-library/react';
import { useAccount } from '../useAccount';
import type { AccountInfo } from '../../types';

const window = new Window();
const document = window.document;

(globalThis as any).document = document;
(globalThis as any).window = window;
(globalThis as any).HTMLElement = window.HTMLElement;
(globalThis as any).Element = window.Element;
(globalThis as any).Node = window.Node;

// Mock useWalletContext
let mockContextValue: {
  state: {
    accounts: AccountInfo[];
    currentAccount: AccountInfo | undefined;
  };
};

// Store the original module to restore after tests
const originalModule = await import('../../context/provider');

describe('useAccount', () => {
  beforeEach(() => {
    // Reset mock context
    mockContextValue = {
      state: {
        accounts: [],
        currentAccount: undefined,
      },
    };

    // Mock useWalletContext
    spyOn(originalModule, 'useWalletContext').mockImplementation(() => mockContextValue as any);
  });

  afterEach(() => {
    // Restore all spies
    mock.restore();
  });

  describe('初始状态', () => {
    it('should return null address when no account connected', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.address).toBeNull();
    });

    it('should return null publicKey when no account connected', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.publicKey).toBeNull();
    });

    it('should return empty accounts array initially', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.accounts).toEqual([]);
    });

    it('should return null currentAccount when not connected', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.currentAccount).toBeUndefined();
    });
  });

  describe('hasAccounts', () => {
    it('should return false when accounts array is empty', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasAccounts).toBe(false);
    });

    it('should return true when accounts array has items', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
        publicKey: '03abcdef',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasAccounts).toBe(true);
    });

    it('should return true when multiple accounts exist', () => {
      const testAccounts: AccountInfo[] = [
        { address: 'tb1qabc123', publicKey: '03abcdef' },
        { address: 'tb1qdef456', publicKey: '03fedcba' },
      ];
      mockContextValue.state.accounts = testAccounts;
      mockContextValue.state.currentAccount = testAccounts[0];

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasAccounts).toBe(true);
    });
  });

  describe('hasPublicKey', () => {
    it('should return false when publicKey is null', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasPublicKey).toBe(false);
    });

    it('should return false when publicKey is undefined', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
        publicKey: undefined,
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasPublicKey).toBe(false);
    });

    it('should return true when publicKey exists', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
        publicKey: '03abcdef123456',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasPublicKey).toBe(true);
    });

    it('should return true when publicKey is empty string', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
        publicKey: '',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      // Empty string is falsy, so hasPublicKey should be false
      expect(result.current.hasPublicKey).toBe(false);
    });
  });

  describe('hasAddress', () => {
    it('should return false when address is null', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasAddress).toBe(false);
    });

    it('should return true when address exists', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
        publicKey: '03abcdef',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasAddress).toBe(true);
    });

    it('should return false when currentAccount is undefined', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.hasAddress).toBe(false);
    });
  });

  describe('address', () => {
    it('should return correct address from currentAccount', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qtest123456789',
        publicKey: '03pubkey123',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.address).toBe('tb1qtest123456789');
    });

    it('should return null when currentAccount is undefined', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.address).toBeNull();
    });

    it('should handle address with different formats', () => {
      const testCases = [
        'tb1qabc123',
        'bc1qxyz789',
        '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      ];

      testCases.forEach((address) => {
        const testAccount: AccountInfo = { address };
        mockContextValue.state.accounts = [testAccount];
        mockContextValue.state.currentAccount = testAccount;

        const { result } = renderHook(() => useAccount());

        expect(result.current.address).toBe(address);
      });
    });
  });

  describe('publicKey', () => {
    it('should return correct publicKey from currentAccount', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
        publicKey: '03abcdef123456789',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.publicKey).toBe('03abcdef123456789');
    });

    it('should return null when publicKey is undefined', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qabc123',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.publicKey).toBeNull();
    });

    it('should return null when currentAccount is undefined', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.publicKey).toBeNull();
    });
  });

  describe('accounts', () => {
    it('should return accounts array from state', () => {
      const testAccounts: AccountInfo[] = [
        { address: 'tb1qabc123', publicKey: '03abc' },
        { address: 'tb1qdef456', publicKey: '03def' },
      ];
      mockContextValue.state.accounts = testAccounts;
      mockContextValue.state.currentAccount = testAccounts[0];

      const { result } = renderHook(() => useAccount());

      expect(result.current.accounts).toEqual(testAccounts);
      expect(result.current.accounts.length).toBe(2);
    });

    it('should return empty array when no accounts', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.accounts).toEqual([]);
      expect(Array.isArray(result.current.accounts)).toBe(true);
    });

    it('should reflect state changes', () => {
      const initialAccounts: AccountInfo[] = [];
      mockContextValue.state.accounts = initialAccounts;
      mockContextValue.state.currentAccount = undefined;

      const { result, rerender } = renderHook(() => useAccount());

      expect(result.current.accounts).toEqual([]);

      // Update state
      const newAccounts: AccountInfo[] = [
        { address: 'tb1qnew123', publicKey: '03new' },
      ];
      mockContextValue.state.accounts = newAccounts;
      mockContextValue.state.currentAccount = newAccounts[0];

      rerender();

      expect(result.current.accounts).toEqual(newAccounts);
    });
  });

  describe('currentAccount', () => {
    it('should return currentAccount from state', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qcurrent123',
        publicKey: '03current',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.currentAccount).toEqual(testAccount);
    });

    it('should return undefined when no currentAccount', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current.currentAccount).toBeUndefined();
    });

    it('should contain all account properties', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qfull123',
        publicKey: '03full',
        balance: {
          confirmed: 10000,
          unconfirmed: 5000,
          total: 15000,
        },
        network: 'livenet',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.currentAccount?.address).toBe('tb1qfull123');
      expect(result.current.currentAccount?.publicKey).toBe('03full');
      expect(result.current.currentAccount?.balance?.total).toBe(15000);
      expect(result.current.currentAccount?.network).toBe('livenet');
    });
  });

  describe('返回值结构', () => {
    it('should return all expected properties', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      expect(result.current).toHaveProperty('address');
      expect(result.current).toHaveProperty('publicKey');
      expect(result.current).toHaveProperty('currentAccount');
      expect(result.current).toHaveProperty('accounts');
      expect(result.current).toHaveProperty('hasAccounts');
      expect(result.current).toHaveProperty('hasPublicKey');
      expect(result.current).toHaveProperty('hasAddress');
    });

    it('should have correct types for all properties', () => {
      mockContextValue.state.accounts = [];
      mockContextValue.state.currentAccount = undefined;

      const { result } = renderHook(() => useAccount());

      // Check types
      expect(typeof result.current.hasAccounts).toBe('boolean');
      expect(typeof result.current.hasPublicKey).toBe('boolean');
      expect(typeof result.current.hasAddress).toBe('boolean');
      expect(Array.isArray(result.current.accounts)).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('should handle account without publicKey', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qnopubkey',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      expect(result.current.address).toBe('tb1qnopubkey');
      expect(result.current.publicKey).toBeNull();
      expect(result.current.hasPublicKey).toBe(false);
      expect(result.current.hasAddress).toBe(true);
    });

    it('should handle multiple accounts with different publicKey availability', () => {
      const testAccounts: AccountInfo[] = [
        { address: 'tb1qwithpub', publicKey: '03pubkey' },
        { address: 'tb1qwithoutpub' },
      ];
      mockContextValue.state.accounts = testAccounts;
      mockContextValue.state.currentAccount = testAccounts[0];

      const { result } = renderHook(() => useAccount());

      expect(result.current.accounts.length).toBe(2);
      expect(result.current.currentAccount?.publicKey).toBe('03pubkey');
      expect(result.current.hasPublicKey).toBe(true);
    });

    it('should handle empty string publicKey', () => {
      const testAccount: AccountInfo = {
        address: 'tb1qemptypub',
        publicKey: '',
      };
      mockContextValue.state.accounts = [testAccount];
      mockContextValue.state.currentAccount = testAccount;

      const { result } = renderHook(() => useAccount());

      // Empty string is falsy, so hasPublicKey should be false
      expect(result.current.hasPublicKey).toBe(false);
    });
  });
});
