import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reportInfo, createEvent, getInnerText, caseInsensitiveSort, getCellByKey, stabilize, parseDate} from '../Component/TableSort';


describe('reportInfo', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should log value without type when showType is false', () => {
        const testValue = 'test string';
        reportInfo(testValue);
        expect(console.log).toHaveBeenCalledWith(testValue);
    });

    it('should log both type and value when showType is true', () => {
        const testValue = 'test string';
        reportInfo(testValue, true);
        expect(console.log).toHaveBeenCalledWith('Data Type : ' + 'string', '\nValue : ' + 'test string');
    });

    it('should handle different data types', () => {
        const testCases = [
            { value: 42, type: 'number' },
            { value: true, type: 'boolean' },
            { value: { key: 'value' }, type: 'object' },
            { value: null, type: 'object' },
            { value: undefined, type: 'undefined' },
            { value: [], type: 'object' }
        ];

        testCases.forEach(({ value, type }) => {
            reportInfo(value, true);
            expect(console.log).toHaveBeenCalledWith('Data Type : ' + type, '\nValue : ' + value);
            vi.clearAllMocks();
        });
    });
});


describe('createEvent', () => {
    it('should create a CustomEvent when supported', () => {
        const event = createEvent('test-event');
        expect(event instanceof CustomEvent).toBe(true);
        expect(event.type).toBe('test-event');
    });

    it('should fallback to document.createEvent when CustomEvent is not supported', () => {
        const originalCustomEvent = window.CustomEvent;
        window.CustomEvent = undefined as any;

        const createEventSpy = vi.spyOn(document, 'createEvent');
        const event = createEvent('test-event');

        expect(createEventSpy).toHaveBeenCalledWith('CustomEvent');
        window.CustomEvent = originalCustomEvent;
    });
});


describe('getInnerText', () => {
    it('should return data-sort attribute value if present', () => {
      const el = document.createElement('div');
      el.setAttribute('data-sort', 'sort-value');
      el.textContent = 'text-content';
      expect(getInnerText(el)).toBe('sort-value');
    });
  
    it('should return textContent if no data-sort attribute', () => {
      const el = document.createElement('div');
      el.textContent = 'text-content';
      expect(getInnerText(el)).toBe('text-content');
    });
  
    it('should return innerText if no data-sort or textContent', () => {
      const el = document.createElement('div');
      // Force textContent to be null/empty while having innerText
      Object.defineProperty(el, 'textContent', {
        value: null,
        writable: true
      });
      Object.defineProperty(el, 'innerText', {
        value: 'inner-text-content',
        writable: true
      });
      expect(getInnerText(el)).toBe('inner-text-content');
    });
  
    it('should return empty string if all properties are empty/null', () => {
      const el = document.createElement('div');
      // Force all properties to be null/empty
      Object.defineProperty(el, 'textContent', {
        value: null,
        writable: true
      });
      Object.defineProperty(el, 'innerText', {
        value: null,
        writable: true
      });
      expect(getInnerText(el)).toBe('');
    });
  });


describe('caseInsensitiveSort', () => {
    it('should sort strings case-insensitively in ascending order', () => {
        expect(caseInsensitiveSort('b', 'A', true)).toBe(1);
        expect(caseInsensitiveSort('A', 'b', true)).toBe(-1);
        expect(caseInsensitiveSort('a', 'A', true)).toBe(0);
    });

    it('should sort strings case-insensitively in descending order', () => {
        expect(caseInsensitiveSort('b', 'A', false)).toBe(-1);
        expect(caseInsensitiveSort('A', 'b', false)).toBe(1);
        expect(caseInsensitiveSort('a', 'A', false)).toBe(0);
    });
});

describe('getCellByKey', () => {
    it('should find cell by data-sort-column-key', () => {
        const row = document.createElement('tr');
        const cell1 = document.createElement('td');
        const cell2 = document.createElement('td');
        
        cell1.setAttribute('data-sort-column-key', 'test-key');
        row.appendChild(cell1);
        row.appendChild(cell2);
        
        const result = getCellByKey(row.children, 'test-key');
        expect(result).toBe(cell1);
    });

    it('should return undefined if no matching cell found', () => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        row.appendChild(cell);
        
        const result = getCellByKey(row.children, 'non-existent-key');
        expect(result).toBeUndefined();
    });
});

describe('parseDate', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should parse date strings correctly', () => {
        expect(parseDate('2024-01-05')).toBe(new Date('2024-01-05').getTime());
        expect(parseDate('2024/01/05')).toBe(new Date('2024-01-05').getTime());
    });

    // it('should handle different date formats', () => {
    //     expect(parseDate('Jan 1, 2024')).toBe(new Date('2024/01/01').getTime()); // die
    //     expect(parseDate('2024-01-05')).toBe(new Date('2024/01/05').getTime());
    //     expect(parseDate('2024/01/05')).toBe(new Date('2024/01/05').getTime());
    // });

    it('should return -1 for invalid dates', () => {
        expect(parseDate('invalid-date')).toBe(-1);
    });
});

describe('stabilize', () => {
    it('should maintain order when values are equal in ascending order', () => {
        const mockSort = (a: string, b: string) => 0;
        const stabilizedSort = stabilize(mockSort, false);
        
        const item1 = { td: 'same', index: 0 };
        const item2 = { td: 'same', index: 1 };
        
        expect(stabilizedSort(item1, item2)).toBe(-1);
        expect(stabilizedSort(item2, item1)).toBe(1);
    });

    it('should maintain reverse order when values are equal in descending order', () => {
        const mockSort = (a: string, b: string) => 0;
        const stabilizedSort = stabilize(mockSort, true);
        
        const item1 = { td: 'same', index: 0 };
        const item2 = { td: 'same', index: 1 };
        
        expect(stabilizedSort(item1, item2)).toBe(1);
        expect(stabilizedSort(item2, item1)).toBe(-1);
    });
});

