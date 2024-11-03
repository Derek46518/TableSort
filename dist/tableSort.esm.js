function getElem(ele, mode, parent) {
    // Return generic Element type or NodeList
    if (typeof ele !== 'string') {
        return ele;
    }
    let searchContext = document;
    if (mode === null && parent) {
        searchContext = parent;
    }
    else if (mode && mode instanceof Node && 'querySelector' in mode) {
        searchContext = mode;
    }
    else if (parent && parent instanceof Node && 'querySelector' in parent) {
        searchContext = parent;
    }
    // If mode is 'all', search for all elements that match, otherwise, search for the first match
    // Casting the result as E or NodeList
    return mode === 'all' ? searchContext.querySelectorAll(ele) : searchContext.querySelector(ele);
}

// reportInfo 函數，用於在控制台輸出變量信息
let reportInfo = function (vars, showType = false) {
    if (showType) {
        console.log('Data Type : ' + typeof vars, '\nValue : ' + vars);
    }
    else {
        console.log(vars);
    }
};
// getInnerText 函數，用於取得元素的內部文字
let getInnerText = function (el) {
    return el.getAttribute('data-sort') || el.textContent || el.innerText || '';
};
// caseInsensitiveSort 函數，默認的大小寫不敏感的排序方法
let caseInsensitiveSort = function (a, b, ascending = true) {
    a = a.trim().toLowerCase();
    b = b.trim().toLowerCase();
    if (a === b)
        return 0;
    return ascending ? (a < b ? -1 : 1) : (a < b ? 1 : -1);
};
let stabilize = function (sort, antiStabilize) {
    return function (a, b) {
        let unstableResult = sort(a.td, b.td);
        return unstableResult === 0 ? (antiStabilize ? b.index - a.index : a.index - b.index) : unstableResult;
    };
};
// TableSort 類，用於表格排序
class TableSort {
    static version = '1.0.0';
    static instance = [];
    table;
    thead;
    options;
    current;
    col;
    constructor(el, options = {}) {
        if (typeof el === 'string')
            getElem(el);
        if (!(el instanceof HTMLTableElement))
            throw new Error('Element must be a table');
        this.table = el;
        this.thead = false;
        this.options = options;
        this.init(el, options, TableSort.instance.length);
        TableSort.instance.push(this);
        if (TableSort.instance.length === 1)
            reportInfo('TableSort is loaded, version:' + TableSort.version);
    }
    // 初始化表格並設置點擊事件監聽器
    init(el, options, id) {
        let firstRow = null;
        let defaultSort = null;
        let that = this;
        if (el.rows.length > 0) {
            if (el.tHead && el.tHead.rows.length > 0) {
                firstRow = el.tHead.rows[el.tHead.rows.length - 1];
                that.thead = true;
            }
            else {
                firstRow = el.rows[0];
            }
        }
        if (!firstRow)
            return;
        let onClick = function () {
            if (that.current && that.current !== this) {
                that.current.removeAttribute('aria-sort');
            }
            that.current = this;
            that.sortTable(this);
        };
        firstRow = getElem('.table-sort', 'all', firstRow);
        if (firstRow instanceof NodeList) {
            firstRow.forEach((value) => {
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
    }
    // sortTable 函數，用於進行表格排序
    sortTable(header, update) {
        let that = this;
        let column = header.cellIndex;
        let sortOrder = header.getAttribute('aria-sort');
        // 判斷排序方向，並切換為相反的方向
        if (!update) {
            sortOrder = sortOrder === 'ascending' ? 'descending' : 'ascending';
            header.setAttribute('aria-sort', sortOrder);
        }
        let ascending = sortOrder === 'ascending';
        let sortFunction = (a, b) => caseInsensitiveSort(a, b, ascending);
        let getRow = getElem('.table-body .table-row:not(.no-sort)', 'all', that.table);
        if (getRow.length < 2)
            return;
        let getBody = getElem('.table-body', 'all', that.table);
        for (let i = 0; i < getBody.length; i++) {
            let newRows = [];
            let totalRows = 0;
            getRow = getElem('.table-row:not(.no-sort)', 'all', getBody[i]);
            for (let j = 0; j < getRow.length; j++) {
                let cell = getRow[j].children[column];
                newRows.push({
                    tr: getRow[j],
                    td: cell ? getInnerText(cell) : '',
                    index: totalRows
                });
                totalRows++;
            }
            newRows.sort(stabilize(sortFunction, sortOrder === 'descending'));
            newRows.forEach((row) => getBody[i].appendChild(row.tr));
        }
    }
    refresh() {
        if (this.current !== undefined) {
            this.sortTable(this.current, true);
        }
    }
}

export { TableSort };
