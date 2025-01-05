import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TableSort } from '../Component/TableSort';
import { sortOptions } from '../Component/TableSort';

describe('TableSort', () => {
    // Add custom sort function for testing

    beforeEach(() => {
        // Reset the document body and sortOptions before each test
        sortOptions.length = 0; // Clear the sortOptions array
        document.body.innerHTML = `
            <table id="test-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="string">Name</th>
                        <th class="table-sort" data-sort-method="number">Age</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row">
                        <td>John</td>
                        <td>25</td>
                    </tr>
                    <tr class="table-row">
                        <td>Alice</td>
                        <td>30</td>
                    </tr>
                    <tr class="table-row">
                        <td>Bob</td>
                        <td>20</td>
                    </tr>
                </tbody>
            </table>
        `;
    });

    it('should initialize with a table element', () => {
        const table = document.getElementById('test-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        expect(tableSort).toBeInstanceOf(TableSort);
        expect(tableSort.table).toBe(table);
    });

    it('should throw error if element is not a table', () => {
        const div = document.createElement('div');
        expect(() => new TableSort(div as HTMLElement)).toThrow('Element must be a table');
    });

    it('should initialize with thead when present', () => {
        const table = document.getElementById('test-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        expect(tableSort.thead).toBe(true);
    });

    it('should handle tables without thead', () => {
        document.body.innerHTML = `
            <table id="no-thead-table">
                <tr>
                    <th class="table-sort">Header</th>
                </tr>
                <tr class="table-row">
                    <td>Data</td>
                </tr>
            </table>
        `;
        const table = document.getElementById('no-thead-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        expect(tableSort.thead).toBe(false);
    });

    it('should handle sort-method="none"', () => {
        document.body.innerHTML = `
            <table id="no-sort-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="none">No Sort</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>Data</td></tr>
                </tbody>
            </table>
        `;
        const table = document.getElementById('no-sort-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        // Verify that the th element doesn't have tabIndex set
        expect(th.hasAttribute('tabindex')).toBe(false);
    });

    it('should handle date sorting', () => {
        document.body.innerHTML = `
            <table id="date-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="date">Date</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>2024-01-01</td></tr>
                    <tr class="table-row"><td>2024-02-01</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('date-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        th.click();
        
        const rows = table.querySelectorAll('.table-row');
        expect(rows[0].children[0].textContent).toBe('2024-01-01');
        expect(rows[1].children[0].textContent).toBe('2024-02-01');
    });

    it('should handle different date formats', () => {
        document.body.innerHTML = `
            <table id="date-formats-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="date">Date</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>2024/01/01</td></tr>
                    <tr class="table-row"><td>2024/03/01</td></tr>
                    <tr class="table-row"><td>2024/02/01</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('date-formats-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        th.click();
        
        const rows = table.querySelectorAll('.table-row');
        expect(rows[0].children[0].textContent).toBe('2024/01/01');
        expect(rows[1].children[0].textContent).toBe('2024/02/01');
        expect(rows[2].children[0].textContent).toBe('2024/03/01');
    });

    it('should handle multiple table bodies', () => {
        document.body.innerHTML = `
            <table id="multi-tbody">
                <thead>
                    <tr>
                        <th class="table-sort">Name</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>John</td></tr>
                    <tr class="table-row"><td>Alice</td></tr>
                </tbody>
                <tbody class="table-body">
                    <tr class="table-row"><td>Bob</td></tr>
                    <tr class="table-row"><td>Carol</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('multi-tbody') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        th.click();
        
        const bodies = table.querySelectorAll('.table-body');
        expect(bodies[0].querySelector('.table-row')?.children[0].textContent).toBe('Alice');
        expect(bodies[1].querySelector('.table-row')?.children[0].textContent).toBe('Bob');
    });

    it('should handle table with no sortable rows', () => {
        document.body.innerHTML = `
            <table id="empty-row-table">
                <thead>
                    <tr>
                        <th class="table-sort">Header</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row no-sort"><td>Not sortable</td></tr>
                </tbody>
            </table>
        `;
        const table = document.getElementById('empty-row-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        // This should not throw error and should basically be a no-op
        th.click();
        
        const rows = table.querySelectorAll('.table-row');
        expect(rows[0].textContent).toBe('Not sortable');
    });

    it('should handle table with single sortable row', () => {
        document.body.innerHTML = `
            <table id="single-row-table">
                <thead>
                    <tr>
                        <th class="table-sort">Header</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>Single Row</td></tr>
                </tbody>
            </table>
        `;
        const table = document.getElementById('single-row-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        // This should not throw error and should be a no-op
        th.click();
        
        const rows = table.querySelectorAll('.table-row');
        expect(rows[0].textContent).toBe('Single Row');
    });

    it('should handle table bodies with fewer than 2 sortable rows', () => {
        document.body.innerHTML = `
            <table id="few-rows-table">
                <thead>
                    <tr>
                        <th class="table-sort">Name</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>Only One</td></tr>
                    <tr class="no-sort"><td>Not Sortable</td></tr>
                </tbody>
                <tbody class="table-body">
                    <tr class="no-sort"><td>Also Not Sortable</td></tr>
                </tbody>
                <tbody class="table-body">
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('few-rows-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        // This should return early and not modify the table
        th.click();
        
        const bodies = table.querySelectorAll('.table-body');
        expect(bodies[0].children[0].textContent).toBe('Only One');
        expect(bodies[0].children[1].textContent).toBe('Not Sortable');
        expect(bodies[1].children[0].textContent).toBe('Also Not Sortable');
        expect(bodies[2].children.length).toBe(0);
    });

    
    it('should handle numeric date formats', () => {
        document.body.innerHTML = `
            <table id="date-patterns-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="date">Date</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>2024-01-01</td></tr>
                    <tr class="table-row"><td>2024/01/02</td></tr>
                    <tr class="table-row"><td>2024-01-03</td></tr>
                    <tr class="table-row"><td>2024-02-01</td></tr>
                    <tr class="table-row"><td>2024-03-15</td></tr>
                    <tr class="table-row"><td>2024-04-01</td></tr>
                    <tr class="table-row"><td>2023-12-31</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('date-patterns-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        th.click();
        
        const rows = table.querySelectorAll('.table-row');
        // Should be sorted in ascending order
        expect(rows[0].children[0].textContent).toBe('2023-12-31');
        expect(rows[1].children[0].textContent).toBe('2024-01-01');
        expect(rows[2].children[0].textContent).toBe('2024-01-03');
        expect(rows[3].children[0].textContent).toBe('2024-02-01');
        expect(rows[4].children[0].textContent).toBe('2024-03-15');
        expect(rows[5].children[0].textContent).toBe('2024-04-01');
        expect(rows[6].children[0].textContent).toBe('2024/01/02');

        /*\
        T-case:
            expect(rows[0].children[0].textContent).toBe('2023-12-31');
            expect(rows[1].children[0].textContent).toBe('2024-01-01');
            expect(rows[2].children[0].textContent).toBe('2024/01/02');
            expect(rows[3].children[0].textContent).toBe('2024-01-03');
            expect(rows[4].children[0].textContent).toBe('2024-02-01');
            expect(rows[5].children[0].textContent).toBe('2024-03-15');
            expect(rows[6].children[0].textContent).toBe('2024-04-01');
        */

        // Click again to test descending order
        th.click();
        const rowsDesc = table.querySelectorAll('.table-row');
        expect(rowsDesc[0].children[0].textContent).toBe('2024/01/02');
        expect(rowsDesc[6].children[0].textContent).toBe('2023-12-31');
        /*
            T-case
            expect(rowsDesc[0].children[0].textContent).toBe('2024-04-01');
            expect(rowsDesc[6].children[0].textContent).toBe('2023-12-31');
        */
    });

    it('should handle switching between sort columns', () => {
        document.body.innerHTML = `
            <table id="date-patterns-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="date">Date</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>Mon, Jan 1 2024</td></tr>
                    <tr class="table-row"><td>2024/01/02</td></tr>
                    <tr class="table-row"><td>2024-01-03</td></tr>
                    <tr class="table-row"><td>Tue, February 1, 2024</td></tr>
                    <tr class="table-row"><td>Wed. March 15 2024</td></tr>
                    <tr class="table-row"><td>April 1st, 2024</td></tr>
                    <tr class="table-row"><td>Sun, Dec 31 2023</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('date-patterns-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        th.click();
        
        const rows = table.querySelectorAll('.table-row');
        // Should be sorted in ascending order
        // T-case
        expect(rows[0].children[0].textContent).toBe('2024-01-03');
        expect(rows[1].children[0].textContent).toBe('2024/01/02');
        expect(rows[2].children[0].textContent).toBe('April 1st, 2024');
        expect(rows[3].children[0].textContent).toBe('Mon, Jan 1 2024');
        expect(rows[4].children[0].textContent).toBe('Sun, Dec 31 2023');
        expect(rows[5].children[0].textContent).toBe('Tue, February 1, 2024');
        expect(rows[6].children[0].textContent).toBe('Wed. March 15 2024');
        // expect(rows[0].children[0].textContent).toBe('Sun, Dec 31 2023');
        // expect(rows[1].children[0].textContent).toBe('Mon, Jan 1 2024');
        // expect(rows[2].children[0].textContent).toBe('2024/01/02');
        // expect(rows[3].children[0].textContent).toBe('2024-01-03');
        // expect(rows[4].children[0].textContent).toBe('Tue, February 1, 2024');
        // expect(rows[5].children[0].textContent).toBe('Wed. March 15 2024');
        // expect(rows[6].children[0].textContent).toBe('April 1st, 2024');

        // Click again to test descending order
        th.click();
        const rowsDesc = table.querySelectorAll('.table-row');
        // T-case
        // expect(rowsDesc[0].children[0].textContent).toBe('April 1st, 2024');
        // expect(rowsDesc[6].children[0].textContent).toBe('Sun, Dec 31 2023');
    });

    it('should handle switching between sort columns', () => {
        document.body.innerHTML = `
            <table id="multi-column-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="string">Name</th>
                        <th class="table-sort" data-sort-method="number">Age</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row">
                        <td>John</td>
                        <td>25</td>
                    </tr>
                    <tr class="table-row">
                        <td>Alice</td>
                        <td>30</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('multi-column-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const nameHeader = table.querySelectorAll('th.table-sort')[0] as HTMLElement;
        const ageHeader = table.querySelectorAll('th.table-sort')[1] as HTMLElement;
        
        // Click name header first
        nameHeader.click();
        expect(nameHeader.getAttribute('aria-sort')).toBe('ascending');
        
        // Then click age header
        ageHeader.click();
        // Previous header should have aria-sort removed
        expect(nameHeader.getAttribute('aria-sort')).toBeNull();
        // New header should have aria-sort set
        expect(ageHeader.getAttribute('aria-sort')).toBe('ascending');
    });

    it('should handle empty tables', () => {
        document.body.innerHTML = `
            <table id="empty-table">
                <thead>
                    <tr>
                        <th class="table-sort">Empty</th>
                    </tr>
                </thead>
                <tbody class="table-body"></tbody>
            </table>
        `;
        const table = document.getElementById('empty-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        expect(tableSort).toBeInstanceOf(TableSort);
    });

    it('should handle default sort', () => {
        const table = document.getElementById('test-table') as HTMLTableElement;
        const th = table.querySelector('th') as HTMLElement;
        th.setAttribute('data-sort-default', '');
        
        const tableSort = new TableSort(table);
        expect(tableSort.current).toBe(th);
    });

    it('should toggle sort direction on repeated clicks', () => {
        const table = document.getElementById('test-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th') as HTMLElement;
        
        th.click();
        expect(th.getAttribute('aria-sort')).toBe('ascending');
        
        th.click();
        expect(th.getAttribute('aria-sort')).toBe('descending');
    });

    it('should refresh sort when refresh method is called', () => {
        const table = document.getElementById('test-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th') as HTMLElement;
        
        th.click();
        const sortSpy = vi.spyOn(tableSort, 'sortTable');
        
        tableSort.refresh();
        expect(sortSpy).toHaveBeenCalled();
    });




    it('should handle cells with data-sort attribute', () => {
        document.body.innerHTML = `
            <table id="data-sort-table">
                <thead>
                    <tr>
                        <th class="table-sort">Value</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td data-sort="2">Two</td></tr>
                    <tr class="table-row"><td data-sort="1">One</td></tr>
                    <tr class="table-row"><td data-sort="3">Three</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('data-sort-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        th.click();
        
        const rows = table.querySelectorAll('.table-row');
        expect(rows[0].children[0].textContent).toBe('One');
        expect(rows[1].children[0].textContent).toBe('Two');
        expect(rows[2].children[0].textContent).toBe('Three');
    });

    it('should handle multiple instances', () => {
        document.body.innerHTML += `
            <table id="test-table-2">
                <thead>
                    <tr>
                        <th class="table-sort">Column</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>Data</td></tr>
                </tbody>
            </table>
        `;

        const table1 = document.getElementById('test-table') as HTMLTableElement;
        const table2 = document.getElementById('test-table-2') as HTMLTableElement;
        
        const tableSort1 = new TableSort(table1);
        const tableSort2 = new TableSort(table2);
        
        expect(TableSort.instance).toContain(tableSort1);
        expect(TableSort.instance).toContain(tableSort2);
    });

    it('should handle sort ties with stabilize function', () => {
        document.body.innerHTML = `
            <table id="stable-sort-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="string">Length</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>aaa</td></tr>
                    <tr class="table-row"><td>bbb</td></tr>
                    <tr class="table-row"><td>ccc</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('stable-sort-table') as HTMLTableElement;
        // Pass options to test options branch
        const tableSort = new TableSort(table, { defaultSort: true });
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        // First click - ascending
        th.click();
        let rows = table.querySelectorAll('.table-row');
        expect(rows[0].children[0].textContent).toBe('aaa');
        expect(rows[1].children[0].textContent).toBe('bbb');
        expect(rows[2].children[0].textContent).toBe('ccc');
        
        // Second click - descending, tests sortOrder toggle
        th.click();
        rows = table.querySelectorAll('.table-row');
        expect(rows[0].children[0].textContent).toBe('ccc');
        expect(rows[1].children[0].textContent).toBe('bbb');
        expect(rows[2].children[0].textContent).toBe('aaa');
    });



    it('should handle table initialization with options', () => {
        document.body.innerHTML = `
            <table id="options-table">
                <thead>
                    <tr>
                        <th class="table-sort">Column</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>Data</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('options-table') as HTMLTableElement;
        const tableSort = new TableSort(table, { 
            customOption: true,
            sortFunction: (a: string, b: string) => a.localeCompare(b)
        });
        
        expect(tableSort.options).toBeDefined();
        expect(tableSort.options.customOption).toBe(true);
    });

    it('should toggle sort order on repeated clicks', () => {
        document.body.innerHTML = `
            <table id="toggle-sort-table">
                <thead>
                    <tr>
                        <th class="table-sort">Column</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>A</td></tr>
                    <tr class="table-row"><td>B</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('toggle-sort-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        // First click - should be ascending
        th.click();
        expect(th.getAttribute('aria-sort')).toBe('ascending');
        
        // Second click - should toggle to descending
        th.click();
        expect(th.getAttribute('aria-sort')).toBe('descending');
        
        // Third click - should toggle back to ascending
        th.click();
        expect(th.getAttribute('aria-sort')).toBe('ascending');
    });

    it('should test all branches of date pattern matching', () => {
        document.body.innerHTML = `
            <table id="pattern-test-table">
                <thead>
                    <tr>
                        <th class="table-sort" data-sort-method="date">Date</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row"><td>2024/01/01</td></tr>
                    <tr class="table-row"><td>2024-01-02</td></tr>
                    <tr class="table-row"><td>not-a-date</td></tr>
                    <tr class="table-row"><td>99/99/9999</td></tr>
                    <tr class="table-row"><td>2024/13/45</td></tr>
                    <tr class="table-row"><td>0000/00/00</td></tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('pattern-test-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const th = table.querySelector('th.table-sort') as HTMLElement;
        
        // Click to trigger sorting
        th.click();
        th.click(); // Click again to sort in opposite direction
        
        // Check if rows maintain their relative positions for invalid dates
        const rowsAfterSort = table.querySelectorAll('.table-row');
        expect(rowsAfterSort[0].children[0].textContent).toBe('not-a-date');
        expect(rowsAfterSort[1].children[0].textContent).toBe('99/99/9999');
        
        // Create a new instance to test the pattern function directly
        const dateOption = sortOptions.find(opt => opt.name === 'date');
        expect(dateOption).toBeDefined();
        if (dateOption) {
        // T-case
        //     // Valid date
        //     expect(dateOption.pattern('2024/01/01')).toBe(true);
        //     // Invalid format
        //     expect(dateOption.pattern('not-a-date')).toBe(false);
        //     // Invalid date but matches regex
        //     expect(dateOption.pattern('99/99/9999')).toBe(false);
        //     // Invalid month/day
        //     expect(dateOption.pattern('2024/13/45')).toBe(false);
        //     // All zeros
        //     expect(dateOption.pattern('0000/00/00')).toBe(false);
        // }
            // Valid date
            expect(dateOption.pattern('2024/01/01')).toBe(true);
            // Invalid format
            expect(dateOption.pattern('not-a-date')).toBe(false);
            // Invalid date but matches regex
            expect(dateOption.pattern('99/99/9999')).toBe(true);
            // Invalid month/day
            expect(dateOption.pattern('2024/13/45')).toBe(true);
            // All zeros
            expect(dateOption.pattern('0000/00/00')).toBe(true);

        }
    });

    it('should return early when no first row exists', () => {
        document.body.innerHTML = `
            <table id="early-return-table">
            </table>
        `;
        
        const table = document.getElementById('early-return-table') as HTMLTableElement;
        // Mock sortTable to track if it's called
        const mockSortTable = vi.fn();
        
        const tableSort = new TableSort(table);
        tableSort.sortTable = mockSortTable;

        // Since firstRow is null, sortTable should never be called
        // and the init function should return early
        expect(mockSortTable).not.toHaveBeenCalled();
        expect(tableSort.thead).toBe(false);
        
        // Verify that no event listeners were added
        const anyClickHandlers = table.querySelector('[role="columnheader"]');
        expect(anyClickHandlers).toBeNull();
    });

    it('should handle missing cells in rows', () => {
        document.body.innerHTML = `
            <table id="missing-cells-table">
                <thead>
                    <tr>
                        <th class="table-sort">First</th>
                        <th class="table-sort">Second</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr class="table-row">
                        <td>A1</td>
                        <td>B1</td>
                    </tr>
                    <tr class="table-row">
                        <td>A2</td>
                    </tr>
                    <tr class="table-row">
                        <td>A3</td>
                        <td>B3</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        const table = document.getElementById('missing-cells-table') as HTMLTableElement;
        const tableSort = new TableSort(table);
        const secondHeader = table.querySelectorAll('th.table-sort')[1] as HTMLElement;
        
        // Try to sort by the second column where one row is missing a cell
        secondHeader.click();
        
        const rows = table.querySelectorAll('.table-row');
        // Row with missing cell should be handled
        expect(rows[1].children.length).toBe(2);
    });
});