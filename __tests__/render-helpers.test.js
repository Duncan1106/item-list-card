import { renderQuantityControls, renderItemRow } from '../src/render-helpers.js';
import { isNumeric } from '../src/data-handlers.js';

describe('render-helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderQuantityControls', () => {
    const mockSourceMap = { '1': { entity_id: 'todo.test' } };
    const mockPendingUpdates = new Set();

    it('should render text for non-numeric items', () => {
      const item = { u: '1', d: 'text description', c: 1 };
      const result = renderQuantityControls(item, mockSourceMap, mockPendingUpdates, jest.fn());

      expect(result).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: expect.any(Array)
      }));
      // Check that it contains the text
      expect(result.strings.join('')).toContain('text description');
    });

    it('should render quantity controls for numeric items', () => {
      const item = { u: '1', d: '5', c: 1 };
      const updateFn = jest.fn();
      const result = renderQuantityControls(item, mockSourceMap, mockPendingUpdates, updateFn);

      expect(result).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: expect.any(Array)
      }));

      // Should have decrement button, quantity display, and increment button
      const htmlString = result.strings.join('');
      expect(htmlString).toContain('mdi:minus-circle-outline');
      expect(htmlString).toContain('5');
      expect(htmlString).toContain('mdi:plus-circle-outline');
    });

    it('should disable buttons when item is pending', () => {
      const item = { u: '1', d: '5', c: 1 };
      const pendingUpdates = new Set(['1']);
      const result = renderQuantityControls(item, mockSourceMap, pendingUpdates, jest.fn());

      expect(result).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: expect.any(Array)
      }));

      const htmlString = result.strings.join('');
      expect(htmlString).toContain('disabled');
    });

    it('should not show decrement button for quantity 1', () => {
      const item = { u: '1', d: '1', c: 1 };
      const result = renderQuantityControls(item, mockSourceMap, mockPendingUpdates, jest.fn());

      const htmlString = result.strings.join('');
      expect(htmlString).not.toContain('mdi:minus-circle-outline');
      expect(htmlString).toContain('mdi:plus-circle-outline');
    });
  });

  describe('renderItemRow', () => {
    const mockSourceMap = {
      '1': { entity_id: 'todo.test', friendly_name: 'Test List' }
    };
    const mockPendingUpdates = new Set();
    const mockUpdateFn = jest.fn();
    const mockAddFn = jest.fn();
    const mockCompleteFn = jest.fn();
    const mockHighlightFn = jest.fn().mockReturnValue(['test ', { strings: ['<span>'], values: ['item'] }]);

    it('should render item row with all controls', () => {
      const item = { u: '1', s: 'test item', d: '1', c: 1 };
      const result = renderItemRow(
        item,
        mockSourceMap,
        mockPendingUpdates,
        mockUpdateFn,
        mockAddFn,
        mockCompleteFn,
        true, // showOrigin
        'test', // search
        true, // highlightMatches
        mockHighlightFn
      );

      expect(result).toEqual(expect.objectContaining({
        strings: expect.any(Array),
        values: expect.any(Array)
      }));

      const htmlString = result.strings.join('');
      expect(htmlString).toContain('item-row');
      expect(htmlString).toContain('item-summary');
      expect(htmlString).toContain('item-controls');
      expect(htmlString).toContain('Test List'); // friendly name
    });

    it('should not show origin when disabled', () => {
      const item = { u: '1', s: 'test item', d: '1', c: 1 };
      const result = renderItemRow(
        item,
        mockSourceMap,
        mockPendingUpdates,
        mockUpdateFn,
        mockAddFn,
        mockCompleteFn,
        false, // showOrigin
        'test',
        true,
        mockHighlightFn
      );

      const htmlString = result.strings.join('');
      expect(htmlString).not.toContain('Test List');
    });

    it('should call highlight function when highlighting is enabled', () => {
      const item = { u: '1', s: 'test item', d: '1', c: 1 };
      renderItemRow(
        item,
        mockSourceMap,
        mockPendingUpdates,
        mockUpdateFn,
        mockAddFn,
        mockCompleteFn,
        true,
        'test',
        true,
        mockHighlightFn
      );

      expect(mockHighlightFn).toHaveBeenCalledWith('test item', 'test');
    });

    it('should not call highlight function when disabled', () => {
      const item = { u: '1', s: 'test item', d: '1', c: 1 };
      renderItemRow(
        item,
        mockSourceMap,
        mockPendingUpdates,
        mockUpdateFn,
        mockAddFn,
        mockCompleteFn,
        true,
        'test',
        false, // highlightMatches
        mockHighlightFn
      );

      expect(mockHighlightFn).not.toHaveBeenCalled();
    });
  });
});