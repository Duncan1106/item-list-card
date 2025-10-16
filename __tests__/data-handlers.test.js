import {
  safeParseJSON,
  computeItemsFingerprint,
  isNumeric,
  normalizeTodoText,
  parseShowMoreButtons,
  setFilterService,
  clearFilterPreservingTodoKey,
  showMore
} from '../src/data-handlers.js';

describe('data-handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('safeParseJSON', () => {
    it('should parse valid JSON', () => {
      const result = safeParseJSON('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const result = safeParseJSON('invalid json', { fallback: true });
      expect(result).toEqual({ fallback: true });
    });
  });

  describe('computeItemsFingerprint', () => {
    it('should return null for null entity', () => {
      expect(computeItemsFingerprint(null)).toBeNull();
    });

    it('should compute fingerprint from entity', () => {
      const entity = {
        state: '5',
        attributes: {
          filtered_items: '[{"id": 1}]',
          source_map: '{"1": {"entity_id": "todo.test"}}'
        }
      };
      const result = computeItemsFingerprint(entity);
      expect(result).toBe('5|[{"id": 1}]|{"1": {"entity_id": "todo.test"}}');
    });
  });

  describe('isNumeric', () => {
    it('should return true for numeric strings', () => {
      expect(isNumeric('123')).toBe(true);
      expect(isNumeric('0')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric('12a')).toBe(false);
      expect(isNumeric('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isNumeric(123)).toBe(false);
      expect(isNumeric(null)).toBe(false);
    });
  });

  describe('normalizeTodoText', () => {
    it('should remove todo: prefix', () => {
      expect(normalizeTodoText('todo:category text')).toBe('text');
    });

    it('should return original text if no prefix', () => {
      expect(normalizeTodoText('regular text')).toBe('regular text');
    });

    it('should handle empty strings', () => {
      expect(normalizeTodoText('')).toBe('');
      expect(normalizeTodoText('todo:')).toBe('');
    });
  });

  describe('parseShowMoreButtons', () => {
    it('should return empty array for empty string', () => {
      expect(parseShowMoreButtons('')).toEqual([]);
    });

    it('should parse comma-separated numbers', () => {
      expect(parseShowMoreButtons('5,10,15')).toEqual([5, 10, 15]);
    });

    it('should deduplicate and sort', () => {
      expect(parseShowMoreButtons('15,5,10,5')).toEqual([5, 10, 15]);
    });

    it('should filter out invalid values', () => {
      expect(parseShowMoreButtons('5,abc,10')).toEqual([5, 10]);
    });
  });

  describe('setFilterService', () => {
    const mockHass = {
      callService: jest.fn(),
      states: {
        'input_text.test': { state: 'old value' }
      }
    };

    it('should not call service if values are the same', async () => {
      mockHass.states['input_text.test'].state = 'same value';
      await setFilterService('input_text.test', mockHass, 'previous', 'same value', null, () => {}, () => {});
      expect(mockHass.callService).not.toHaveBeenCalled();
    });

    it('should call service and update filter value', async () => {
      mockHass.callService.mockResolvedValue();
      const setFilterValue = jest.fn();
      const requestUpdate = jest.fn();

      await setFilterService('input_text.test', mockHass, 'old', 'new value', null, setFilterValue, requestUpdate);

      expect(mockHass.callService).toHaveBeenCalledWith('input_text', 'set_value', {
        entity_id: 'input_text.test',
        value: 'new value'
      });
      expect(setFilterValue).toHaveBeenCalledWith('new value');
      expect(requestUpdate).toHaveBeenCalled();
    });

    it('should revert on service failure', async () => {
      mockHass.callService.mockRejectedValue(new Error('Failed'));
      const setFilterValue = jest.fn();
      const requestUpdate = jest.fn();

      await expect(setFilterService('input_text.test', mockHass, 'old', 'new value', null, setFilterValue, requestUpdate))
        .rejects.toThrow('Failed');

      expect(setFilterValue).toHaveBeenCalledWith('old');
      expect(requestUpdate).toHaveBeenCalled();
    });
  });

  describe('clearFilterPreservingTodoKey', () => {
    const mockHass = {
      states: {
        'input_text.test': { state: 'todo:category search text' }
      }
    };

    it('should preserve todo key when clearing', async () => {
      const setFilterValue = jest.fn();
      const requestUpdate = jest.fn();
      const setFilterService = jest.fn().mockResolvedValue();

      await clearFilterPreservingTodoKey('input_text.test', mockHass, setFilterValue, requestUpdate, setFilterService);

      expect(setFilterValue).toHaveBeenCalledWith('todo:category ');
      expect(setFilterService).toHaveBeenCalled();
    });

    it('should clear completely when no todo key', async () => {
      mockHass.states['input_text.test'].state = 'just search text';
      const setFilterValue = jest.fn();
      const requestUpdate = jest.fn();
      const setFilterService = jest.fn().mockResolvedValue();

      await clearFilterPreservingTodoKey('input_text.test', mockHass, setFilterValue, requestUpdate, setFilterService);

      expect(setFilterValue).toHaveBeenCalledWith('');
      expect(setFilterService).toHaveBeenCalled();
    });
  });

  describe('showMore', () => {
    const mockItems = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
    const setDisplayLimit = jest.fn();
    const setCachedItems = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should show all items when option is "all"', () => {
      showMore('all', mockItems, 2, setDisplayLimit, setCachedItems);

      expect(setDisplayLimit).toHaveBeenCalledWith(5);
      expect(setCachedItems).toHaveBeenCalledWith(mockItems);
    });

    it('should add specific number of items', () => {
      showMore(3, mockItems, 2, setDisplayLimit, setCachedItems);

      expect(setDisplayLimit).toHaveBeenCalledWith(5);
      expect(setCachedItems).toHaveBeenCalledWith(mockItems);
    });

    it('should default to adding 10 items', () => {
      showMore(undefined, mockItems, 2, setDisplayLimit, setCachedItems);

      expect(setDisplayLimit).toHaveBeenCalledWith(5);
      expect(setCachedItems).toHaveBeenCalledWith(mockItems.slice(0, 5));
    });

    it('should not exceed available items', () => {
      showMore(10, mockItems, 2, setDisplayLimit, setCachedItems);

      expect(setDisplayLimit).toHaveBeenCalledWith(5);
      expect(setCachedItems).toHaveBeenCalledWith(mockItems);
    });
  });
});