import { describe, it, expect } from 'vitest';
import { TableSort } from '../index';

describe('TableSort index', () => {
    it('should export TableSort class', () => {
        expect(TableSort).toBeDefined();
        expect(typeof TableSort).toBe('function');
        
        // Verify it's the correct class by checking for a known static property
        expect(TableSort).toHaveProperty('version');
        
        // Create an instance to verify it works
        const table = document.createElement('table');
        const instance = new TableSort(table);
        expect(instance).toBeInstanceOf(TableSort);
    });
});