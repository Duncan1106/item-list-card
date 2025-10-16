import {
  debounce,
  showToast,
  confirmDialog,
  callService,
  highlightParts
} from '../src/utils.js';

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('debounce', () => {
    it('should delay function execution', (done) => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      setTimeout(() => {
        expect(fn).toHaveBeenCalledTimes(1);
        done();
      }, 150);
    });

    it('should cancel previous calls', (done) => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      setTimeout(() => {
        debounced(); // This should cancel the first call
      }, 50);

      setTimeout(() => {
        expect(fn).toHaveBeenCalledTimes(1);
        done();
      }, 200);
    });

    it('should call cancel method', () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced.cancel();

      setTimeout(() => {
        expect(fn).not.toHaveBeenCalled();
      }, 150);
    });
  });

  describe('showToast', () => {
    it('should dispatch custom event when element exists', () => {
      const mockElement = { dispatchEvent: jest.fn() };
      const message = 'Test message';

      showToast(mockElement, message);

      expect(mockElement.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hass-notification',
          detail: { message },
          bubbles: true,
          composed: true
        })
      );
    });

    it('should do nothing when element is null', () => {
      const mockDispatch = jest.fn();
      showToast(null, 'message');
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('confirmDialog', () => {
    it('should return true when window.confirm returns true', async () => {
      global.window.confirm.mockReturnValue(true);
      const result = await confirmDialog(null, 'Test?');
      expect(result).toBe(true);
    });

    it('should return false when window.confirm returns false', async () => {
      global.window.confirm.mockReturnValue(false);
      const result = await confirmDialog(null, 'Test?');
      expect(result).toBe(false);
    });

    it('should return false when window.confirm is not available', async () => {
      delete global.window.confirm;
      const result = await confirmDialog(null, 'Test?');
      expect(result).toBe(false);
    });
  });

  describe('callService', () => {
    const mockHass = {
      callService: jest.fn()
    };

    it('should call hass.callService successfully', async () => {
      mockHass.callService.mockResolvedValue();

      await callService(mockHass, 'domain', 'service', { data: 'test' });

      expect(mockHass.callService).toHaveBeenCalledWith('domain', 'service', { data: 'test' });
    });

    it('should show toast and throw error on failure', async () => {
      const error = new Error('Service failed');
      mockHass.callService.mockRejectedValue(error);
      const mockToastEl = { dispatchEvent: jest.fn() };

      await expect(callService(mockHass, 'domain', 'service', {}, mockToastEl, 'Custom error'))
        .rejects.toThrow('Service failed');

      expect(mockToastEl.dispatchEvent).toHaveBeenCalled();
    });
  });

  describe('highlightParts', () => {
    it('should return original text when no term provided', () => {
      const result = highlightParts('hello world');
      expect(result).toEqual(['hello world']);
    });

    it('should return original text when term is empty', () => {
      const result = highlightParts('hello world', '');
      expect(result).toEqual(['hello world']);
    });

    it('should highlight matching words', () => {
      const result = highlightParts('hello world', 'world');
      expect(result).toHaveLength(2);
      expect(result[0]).toBe('hello ');
      expect(result[1]).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: ['world']
      }));
    });

    it('should handle multiple matches', () => {
      const result = highlightParts('hello world hello', 'hello');
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: ['hello']
      }));
      expect(result[1]).toBe(' world ');
      expect(result[2]).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: ['hello']
      }));
    });

    it('should prefer longer matches', () => {
      const result = highlightParts('hello world', 'hell world');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: ['hello world']
      }));
    });
  });
});