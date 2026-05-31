import { describe, expect, it, beforeAll } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useWalletModal } from '../useWalletModal';
import { Window } from 'happy-dom';

beforeAll(() => {
  const window = new Window();
  globalThis.document = window.document;
  globalThis.window = window;
});

describe('useWalletModal', () => {
  describe('初始状态', () => {
    it('should return isOpen as false initially', () => {
      const { result } = renderHook(() => useWalletModal());
      expect(result.current.isOpen).toBe(false);
    });

    it('should return open and close functions', () => {
      const { result } = renderHook(() => useWalletModal());
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
    });
  });

  describe('open', () => {
    it('should set isOpen to true when called', () => {
      const { result } = renderHook(() => useWalletModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should not change state if already open', () => {
      const { result } = renderHook(() => useWalletModal());

      // First open
      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      // Second open (should remain true)
      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('close', () => {
    it('should set isOpen to false when called', () => {
      const { result } = renderHook(() => useWalletModal());

      // First open
      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      // Then close
      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
    });

    it('should not change state if already closed', () => {
      const { result } = renderHook(() => useWalletModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('状态同步', () => {
    it('should sync state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useWalletModal());
      const { result: result2 } = renderHook(() => useWalletModal());

      // Both start closed
      expect(result1.current.isOpen).toBe(false);
      expect(result2.current.isOpen).toBe(false);

      // Open from first instance
      act(() => {
        result1.current.open();
      });

      // Both should be open
      expect(result1.current.isOpen).toBe(true);
      expect(result2.current.isOpen).toBe(true);

      // Close from second instance
      act(() => {
        result2.current.close();
      });

      // Both should be closed
      expect(result1.current.isOpen).toBe(false);
      expect(result2.current.isOpen).toBe(false);
    });
  });

  describe('函数稳定性', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useWalletModal());

      const firstOpen = result.current.open;
      const firstClose = result.current.close;

      rerender();

      expect(result.current.open).toBe(firstOpen);
      expect(result.current.close).toBe(firstClose);
    });
  });

  describe('toggle', () => {
    it('should toggle modal state', () => {
      const { result } = renderHook(() => useWalletModal());

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('openWithSource', () => {
    it('should open modal with source tracking', () => {
      const { result } = renderHook(() => useWalletModal());

      expect(result.current.isOpen).toBe(false);
      expect(result.current.openSource).toBe(null);

      act(() => {
        result.current.openWithSource('header-button');
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.openSource).toBe('header-button');
    });

    it('should increment openCount when opened with source', () => {
      const { result } = renderHook(() => useWalletModal());

      expect(result.current.openCount).toBe(0);

      act(() => {
        result.current.openWithSource('button-1');
      });

      expect(result.current.openCount).toBe(1);

      act(() => {
        result.current.openWithSource('button-2');
      });

      expect(result.current.openCount).toBe(2);
    });
  });

  describe('forceClose', () => {
    it('should close the modal', () => {
      const { result } = renderHook(() => useWalletModal());

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.forceClose();
      });

      expect(result.current.isOpen).toBe(false);
      expect(result.current.openSource).toBe(null);
    });
  });

  describe('openSource', () => {
    it('should be null initially', () => {
      const { result } = renderHook(() => useWalletModal());
      expect(result.current.openSource).toBe(null);
    });

    it('should be "default" when opened with open()', () => {
      const { result } = renderHook(() => useWalletModal());

      act(() => {
        result.current.open();
      });

      expect(result.current.openSource).toBe('default');
    });

    it('should be reset to null when closed', () => {
      const { result } = renderHook(() => useWalletModal());

      act(() => {
        result.current.openWithSource('test-source');
      });
      expect(result.current.openSource).toBe('test-source');

      act(() => {
        result.current.close();
      });

      expect(result.current.openSource).toBe(null);
    });
  });

  describe('openCount', () => {
    it('should be 0 initially', () => {
      const { result } = renderHook(() => useWalletModal());
      expect(result.current.openCount).toBe(0);
    });

    it('should increment on each open', () => {
      const { result } = renderHook(() => useWalletModal());

      act(() => {
        result.current.open();
      });
      expect(result.current.openCount).toBe(1);

      act(() => {
        result.current.close();
      });

      act(() => {
        result.current.open();
      });
      expect(result.current.openCount).toBe(2);
    });
  });

  describe('config', () => {
    it('should have default config values', () => {
      const { result } = renderHook(() => useWalletModal());

      expect(result.current.config.closeOnEscape).toBe(true);
      expect(result.current.config.closeOnOutsideClick).toBe(true);
      expect(result.current.config.showCloseButton).toBe(true);
      expect(result.current.config.preventBodyScroll).toBe(true);
      expect(result.current.config.animationDuration).toBe(300);
    });
  });

  describe('setConfig', () => {
    it('should update config values', () => {
      const { result } = renderHook(() => useWalletModal());

      act(() => {
        result.current.setConfig({
          closeOnEscape: false,
          animationDuration: 500,
        });
      });

      expect(result.current.config.closeOnEscape).toBe(false);
      expect(result.current.config.animationDuration).toBe(500);
      // Other values should remain default
      expect(result.current.config.closeOnOutsideClick).toBe(true);
    });
  });

  describe('modalState', () => {
    it('should return complete modal state', () => {
      const { result } = renderHook(() => useWalletModal());

      act(() => {
        result.current.openWithSource('test');
      });

      const state = result.current.modalState;
      expect(state.isOpen).toBe(true);
      expect(state.source).toBe('test');
      expect(state.openCount).toBe(1);
      expect(state.openTimestamp).toBeGreaterThan(0);
    });
  });
});