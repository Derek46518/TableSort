const Util = {
    getElem(ele: HTMLElement | string, mode?: 'all' | HTMLElement | null, parent?: HTMLElement): Element | HTMLElement | HTMLElement[] | NodeListOf<Element> | null {
        if (typeof ele === 'object') {
            return ele;
        } else if (mode === undefined && parent === undefined) {
            return isNaN(Number(ele)) ? document.querySelector(ele) : document.getElementById(ele as string);
        } else if (mode === 'all' || mode === null) {
            return (parent === undefined) ? document.querySelectorAll(ele) : parent.querySelectorAll(ele);
        } else if (typeof mode === 'object' && parent === undefined) {
            return mode.querySelector(ele);
        }
        return null; // 預設返回值，如果不符合任何條件
    },

    getChildIndex(node: HTMLElement): number | false {
        // node.parentNode 可能為NULL
        if (node.parentNode&& node.parentNode !== undefined) {
            return Array.prototype.indexOf.call(node.parentNode.children, node);
        }
        return false;
    }
};

//Report info in console
let reportInfo = function(vars:any, showType = false) {
    if (showType === true) {
        console.log('Data Type : ' + typeof vars, '\nValue : ' + vars);
    } else {
        console.log(vars);
    }
}

let createEvent = function(name:any) {
    let evt;
    if (typeof window.CustomEvent === 'function') {
        evt = new CustomEvent(name);
    } else {
        evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(name, false, false, undefined);
    }
    return evt;
}

let getInnerText = function(el:HTMLElement):string {
    return el.getAttribute('data-sort') || el.textContent || el.innerText || '';
};

//Default sort method if no better sort method is found
let caseInsensitiveSort = function(a:string, b:string) {
    a = a.trim().toLowerCase();
    b = b.trim().toLowerCase();

    if (a === b) return 0;
    if (a < b) return 1;

    return -1;
};

let getCellByKey = function(cells: HTMLCollection | NodeListOf<HTMLElement>, key: string): HTMLElement | undefined {
    return Array.from(cells).find((cell: Element) => {
        return cell.getAttribute('data-sort-column-key') === key;
    }) as HTMLElement | undefined;
};

//Stable sort function
//If two elements are equal under the original sort function,
//then there relative order is reversed
type SortFunction = (a: string, b: string) => 0| 1 | -1;
type SortItem = {
    td: string;
    index: number;
};
let stabilize = function(sort: SortFunction, antiStabilize: boolean) {
    return function(a: SortItem, b: SortItem): number {
        let unstableResult = sort(a.td, b.td);
        if (unstableResult === 0) {
            return antiStabilize ? b.index - a.index : a.index - b.index;
        }
        return unstableResult;
    };
};


let parseDate = function(date: string): number {
    date = date.replace(/\-/g, '/');
    reportInfo(date);
    
    // Format the date before getting the time
    date = date.replace(/(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, '$1-$2-$3');
    return new Date(date).getTime() || -1;
};

type SortOption = {
    name: string;
    pattern: (item: string) => boolean;
    sort: (a: string, b: string) => number;
};
let sortOptions: SortOption[] = [];
class TableSort{
    // common var
    static version: string = '1.0.0';
    static instance: TableSort[] = [];
    table: HTMLElement;
    thead: boolean;
    options: any;
    current?: HTMLElement;
    col?: number;

    constructor(el: HTMLElement | string, options:any={}){
        el = Util.getElem(el) as HTMLElement;
        this.table = el;
        this.thead = false;
        // this.sortOptions = [];
        if (!(this instanceof TableSort)) return new TableSort(el,options);
        if (!el||!(el instanceof HTMLTableElement)) throw new Error('Element must be a table');
        
        this.init(el,options,TableSort.instance.length);
        TableSort.instance.push(this);
        if (TableSort.instance.length === 1) reportInfo('TableSort is loaded, version:' + TableSort.version);
    }

    init(el:HTMLElement,options:any,id:number){
        
        let that = this;
        let firstRow: HTMLTableRowElement | NodeListOf<HTMLElement> | null = null;
        let defaultSort: HTMLElement | null = null;
        let i : number;
        let cell: HTMLElement | undefined;
        let getHead: HTMLElement|null;
        that.table = el;
        that.thead = false;
        that.options = options;
        
        
        if (el instanceof HTMLTableElement && el.rows.length >0) {
            if (el.tHead && el.tHead.rows.length>0){
                for (i = 0 ; i < el.tHead.rows.length;i++){
                    if (el.tHead.rows[i].getAttribute('data-sort-method')=== 'thead'){
                        firstRow = el.tHead.rows[i];
                        break;
                    }
                }
                if(!firstRow){
                    firstRow = el.tHead.rows[el.tHead.rows.length - 1];
                }
                that.thead = true;
            } else{
                firstRow = el.rows[0];
            }
        }
        getHead = el.querySelector('.table-head .table-column');
        if (getHead && !firstRow){
            firstRow = getHead as HTMLTableRowElement;
            that.thead = true;

        }
        if (!firstRow) return;

        let onClick = function(this:HTMLElement){
            if (that.current && that.current !== this) {
                that.current.removeAttribute('aria-sort');
            }
            that.current = this;
            that.sortTable(this);
        };

        // 假設 firstRow 和 defaultSort 已宣告在作用域中
        firstRow = Util.getElem('.table-sort', 'all', firstRow) as NodeListOf<HTMLElement>;
        // 檢查 firstRow 是否不為 null
        if (firstRow) {
            firstRow.forEach((value: HTMLElement) => {
                value.setAttribute('role', 'columnheader');
        
                if (value.getAttribute('data-sort-method') !== 'none') {
                    value.tabIndex = 0; // 注意這裡是 tabIndex，而不是 tabindex
                    value.addEventListener('click', onClick, false);
            
                    if (value.getAttribute('data-sort-default') !== null) {
                        defaultSort = value;
                    }
                }
            });
        }

        

        if (defaultSort){
            that.current = defaultSort;
            that.sortTable(defaultSort);
        }

        sortOptions.push({
            name:'date',
            pattern:function (item:string){
                return (
                    item.search(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.?\,?\s*/i) !== -1 ||
                    item.search(/\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/) !== -1 ||
                    item.search(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) !== -1
                ) && !isNaN(parseDate(item));
            },
            sort: function(a:string,b:string) : number {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return parseDate(b) - parseDate(a);
            }
        });
    }

    sortTable(header:HTMLTableCellElement, update?:boolean):void {
        let that = this;
        let columnKey = header.getAttribute('data-sort-column-key');
        let column : number = header.cellIndex ;
        let sortFunction = caseInsensitiveSort;
        let item = '';
        let items:string[] = [];
        let i = that.thead ? 0 : 1;
        let sortMethod = header.getAttribute('data-sort-method');
        let sortOrder = header.getAttribute('aria-sort');
        
        let getSort: NodeListOf<HTMLElement> | HTMLElement | null;
        let getBody: NodeListOf<HTMLElement> | null;
        // For flexbox
        if (column === undefined || column === null) {
            const index = Util.getChildIndex(header);
            column = index !== false ? index : -1; // 若 index 為 false，設置 column 為 -1 或其他預設值
        }

        that.table.dispatchEvent(createEvent('beforeSort'));
        
        //If updating an existing sort, direction should remain unchanged.
        if (!update) {
            if (sortOrder === 'ascending') {
                sortOrder = 'descending';
            } else if (sortOrder === 'descending') {
                sortOrder = 'ascending';
            } else {
                sortOrder = that.options.descending ? 'descending' : 'ascending';
            }
            header.setAttribute('aria-sort', sortOrder);
        }

        //Get total row inside table-body
        let getRow = Util.getElem('.table-body .table-row:not(.no-sort)', 'all', that.table) as HTMLElement[];
        if (getRow.length < 2) return;

        //If we force a sort method, it is not necessary to check rows
        if (!sortMethod) {
            let cell: HTMLElement;
            while (items.length < 3 && i < getRow.length) {
                if (columnKey){
                    cell = getCellByKey(getRow[i],columnKey);
                }
                else{
                    cell = Util.getElem('.table-sort, .table-no-sort','all',getRow[i]);
                    cell = cell[column];
                }
            }
            if (!items) return;
        }

        for (let i = 0; i < sortOptions.length; i++) {
            let q:SortOption = sortOptions[i];
            
            if (sortMethod) {
                if (q.name === sortMethod) {
                    sortFunction = q.sort;
                    break;
                }
            } else if (items.every(q.pattern)) {
                sortFunction = q.sort;
                break;
            }
        }
        that.col = column;

        getBody = Util.getElem('.table-body', 'all', that.table);
        for(let i = 0; i<getBody.length;i++){
            let newRows = [];
            let noSorts = {};
            let j;
            let totalRows :number = 0;
            let noSortsSoFar:number = 0;
            getRow = Util.getElem('.table-row:not(.no-sort)', 'all', getBody[i]);
            if (getRow.length < 2) continue;
            for (j = 0; j < getRow.length; j++) {
                let cell;

                item = getRow[j];
                getSort = Util.getElem('.table-sort, .table-no-sort', 'all', item);
                if (item.getAttribute('data-sort-method') === 'none') {
                    //keep no-sorts in separate list to be able to insert
                    //them back at their original position later
                    noSorts[totalRows] = item;
                } else {
                    if (columnKey) {
                        cell = getCellByKey(getSort, columnKey);
                    } else {
                        cell = getSort;
                        cell = cell[column];
                    }
                    //Save the index for stable sorting
                    newRows.push({
                        tr: item,
                        td: cell ? getInnerText(cell) : '',
                        index: totalRows
                    });
                }
                totalRows++;
            }
            //Before we append should we reverse the new array or not?
            //If we reverse, the sort needs to be `anti-stable` so that
            //the double negatives cancel out
            if (sortOrder === 'descending') {
                newRows.sort(stabilize(sortFunction, true));
            } else {
                newRows.sort(stabilize(sortFunction, false));
                newRows.reverse();
            }
            //append rows that already exist rather than creating new ones
            for (j = 0; j < totalRows; j++) {
                if (noSorts[j]) {
                    //We have a no-sort row for this position, insert it here.
                    item = noSorts[j];
                    noSortsSoFar++;
                } else {
                    item = newRows[j - noSortsSoFar].tr;
                }
                //appendChild(x) moves x if already present somewhere else in the DOM
                getBody[i].appendChild(item);
            }
        }
        that.table.dispatchEvent(createEvent('afterSort'));

    }

    refresh():void {
        if (this.current !== undefined) {
            this.sortTable(this.current, true);
        }
    }
}


