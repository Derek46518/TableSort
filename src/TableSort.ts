import { getElem } from '@carry0987/utils';

// reportInfo 函數，用於在控制台輸出變量信息
let reportInfo = function (vars: any, showType = false) {
    if (showType) {
        console.log('Data Type : ' + typeof vars, '\nValue : ' + vars);
    } else {
        console.log(vars);
    }
};

// createEvent 函數，用於創建自定義事件
let createEvent = function (name: any) {
    let evt;
    if (typeof window.CustomEvent === 'function') {
        evt = new CustomEvent(name);
    } else {
        evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(name, false, false, undefined);
    }
    return evt;
};

// getInnerText 函數，用於取得元素的內部文字
let getInnerText = function (el: HTMLElement): string {
    return el.getAttribute('data-sort') || el.textContent || el.innerText || '';
};

// caseInsensitiveSort 函數，默認的大小寫不敏感的排序方法
let caseInsensitiveSort = function (a: string, b: string): number {
    a = a.trim().toLowerCase();
    b = b.trim().toLowerCase();
    if (a === b) return 0;
    return a < b ? 1 : -1;
};

// getCellByKey 函數，用於根據鍵值找到對應的表格單元格
let getCellByKey = function (cells: HTMLCollection | NodeListOf<HTMLElement>, key: string): HTMLElement | undefined {
    return Array.from(cells).find((cell: Element) => {
        return cell.getAttribute('data-sort-column-key') === key;
    }) as HTMLElement | undefined;
};

// 稳定排序函数，如果两个元素相等，保持它们的相对顺序
type SortFunction = (a: string, b: string) => number;
type SortItem = {
    td: string;
    index: number;
};
let stabilize = function (sort: SortFunction, antiStabilize: boolean) {
    return function (a: SortItem, b: SortItem): number {
        let unstableResult = sort(a.td, b.td);
        return unstableResult === 0 ? (antiStabilize ? b.index - a.index : a.index - b.index) : unstableResult;
    };
};

// parseDate 函數，解析日期字串並返回時間戳
let parseDate = function (date: string): number {
    date = date.replace(/\-/g, '/');
    reportInfo(date);
    date = date.replace(/(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, '$1-$2-$3');
    return new Date(date).getTime() || -1;
};

// 定義 SortOption 類型，用於描述排序選項
type SortOption = {
    name: string;
    pattern: (item: string) => boolean;
    sort: (a: string, b: string) => number;
};

// 排序選項的數組
let sortOptions: SortOption[] = [];

// TableSort 類，用於表格排序
class TableSort {
    static version: string = '1.0.0';
    static instance: TableSort[] = [];
    table: HTMLElement;
    thead: boolean;
    options: any;
    current?: HTMLElement;
    col?: number;

    constructor(el: HTMLElement | string, options: any = {}) {
        let ele;
        if (typeof el === 'string') ele = getElem<HTMLElement>(el);
        if (!(el instanceof HTMLTableElement)) throw new Error('Element must be a table');
        
        this.table = el;
        this.thead = false;
        this.options = options;
        this.init(el, options, TableSort.instance.length);
        TableSort.instance.push(this);
        if (TableSort.instance.length === 1) reportInfo('TableSort is loaded, version:' + TableSort.version);
    }

    // 初始化表格並設置點擊事件監聽器
    init(el: HTMLTableElement, options: any, id: number) {
        let firstRow: HTMLTableRowElement | NodeListOf<HTMLElement> | null = null;
        let defaultSort: HTMLElement | null = null;
        let i: number;
        let that = this;

        if (el.rows.length > 0) {
            if (el.tHead && el.tHead.rows.length > 0) {
                firstRow = el.tHead.rows[el.tHead.rows.length - 1];
                that.thead = true;
            } else {
                firstRow = el.rows[0];
            }
        }

        if (!firstRow) return;

        let onClick = function (this: HTMLElement) {
            if (that.current && that.current !== this) {
                that.current.removeAttribute('aria-sort');
            }
            that.current = this;
            that.sortTable(this);
        };

        firstRow = getElem('.table-sort', 'all', firstRow) as NodeListOf<HTMLElement>;
        if (firstRow) {
            firstRow.forEach((value: HTMLElement) => {
                value.setAttribute('role', 'columnheader');
                if (value.getAttribute('data-sort-method') !== 'none') {
                    value.tabIndex = 0;
                    value.addEventListener('click', onClick, false);
                    if (value.getAttribute('data-sort-default') !== null) {
                        defaultSort = value;
                    }
                }
            });
        }

        if (defaultSort) {
            that.current = defaultSort;
            that.sortTable(defaultSort);
        }

        sortOptions.push({
            name: 'date',
            pattern: (item: string) => {
                return (
                    /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.?\,?\s*/i.test(item) ||
                    /\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/.test(item) ||
                    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(item)
                ) && !isNaN(parseDate(item));
            },
            sort: (a: string, b: string): number => parseDate(b) - parseDate(a)
        });
    }

    // sortTable 函數，用於進行表格排序
    sortTable(header: HTMLElement, update?: boolean): void {
        let that = this;
        let column = (header as HTMLTableCellElement).cellIndex;
        let sortFunction = caseInsensitiveSort;
        let sortOrder = header.getAttribute('aria-sort') || '';

        if (!update) {
            sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
            header.setAttribute('aria-sort', sortOrder);
        }

        let getRow = getElem('.table-body .table-row:not(.no-sort)', 'all', that.table);
        if (getRow.length < 2) return;

        let getBody = getElem('.table-body', 'all', that.table);
        for (let i = 0; i < getBody.length; i++) {
            let newRows = [];
            let noSorts = {};
            let totalRows = 0;
            let noSortsSoFar = 0;
            getRow = getElem('.table-row:not(.no-sort)', 'all', getBody[i]);

            for (let j = 0; j < getRow.length; j++) {
                let cell = getRow[j].children[column];
                newRows.push({
                    tr: getRow[j],
                    td: cell ? getInnerText(cell as HTMLElement) : '',
                    index: totalRows
                });
                totalRows++;
            }

            newRows.sort(stabilize(sortFunction, sortOrder === 'descending'));
            newRows.forEach((row) => getBody[i].appendChild(row.tr));
        }
    }

    refresh(): void {
        if (this.current !== undefined) {
            this.sortTable(this.current, true);
        }
    }
}
