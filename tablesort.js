/* Common */
TableSort.version = '1.0.0';
TableSort.instance = [];

/* Util */
const Util = {
    getElem(ele, mode, parent) {
        if (typeof ele === 'object') {
            return ele;
        } else if (mode === undefined && parent === undefined) {
            return (isNaN(ele * 1)) ? document.querySelector(ele) : document.getElementById(ele);
        } else if (mode === 'all' || mode === null) {
            return (parent === undefined) ? document.querySelectorAll(ele) : parent.querySelectorAll(ele);
        } else if (typeof mode === 'object' && parent === undefined) {
            return mode.querySelector(ele);
        }
    },
    getChildIndex(node) {
        if (node.parentNode !== undefined) {
            return Array.prototype.indexOf.call(node.parentNode.children, node);
        }
        return false;
    }
};

function TableSort(el, options = {}) {
    el = Util.getElem(el);
    if (!(this instanceof TableSort)) return new TableSort(el, options);
    if (!el) throw new Error('Element must be a table');
    this.init(el, options, TableSort.instance.length);
    TableSort.instance.push(this);

    if (TableSort.instance.length === 1) reportInfo('TableSort is loaded, version:' + TableSort.version);
}

let sortOptions = [];

//Report info in console
let reportInfo = function(vars, showType = false) {
    if (showType === true) {
        console.log('Data Type : ' + typeof vars, '\nValue : ' + vars);
    } else {
        console.log(vars);
    }
}

let createEvent = function(name) {
    let evt;
    if (typeof window.CustomEvent === 'function') {
        evt = new CustomEvent(name);
    } else {
        evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(name, false, false, undefined);
    }
    return evt;
}

let getInnerText = function(el) {
    return el.getAttribute('data-sort') || el.textContent || el.innerText || '';
};

//Default sort method if no better sort method is found
let caseInsensitiveSort = function(a, b) {
    a = a.trim().toLowerCase();
    b = b.trim().toLowerCase();

    if (a === b) return 0;
    if (a < b) return 1;

    return -1;
};

let getCellByKey = function(cells, key) {
    return [].slice.call(cells).find(function(cell) {
        return cell.getAttribute('data-sort-column-key') === key;
    });
};

//Stable sort function
//If two elements are equal under the original sort function,
//then there relative order is reversed
let stabilize = function(sort, antiStabilize) {
    return function(a, b) {
        let unstableResult = sort(a.td, b.td);
        if (unstableResult === 0) {
            if (antiStabilize) return b.index - a.index;
            return a.index - b.index;
        }
        return unstableResult;
    };
};

let parseDate = function(date) {
    date = date.replace(/\-/g, '/');
    reportInfo(date)
    //Format before getTime
    date = date.replace(/(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})/, '$1-$2-$3');
    return new Date(date).getTime() || -1;
};

TableSort.extend = function(name, pattern, sort) {
    if (typeof pattern !== 'function' || typeof sort !== 'function') {
        throw new Error('Pattern and sort must be a function');
    }
    sortOptions.push({
        name: name,
        pattern: pattern,
        sort: sort
    });
};

TableSort.prototype = {
    init: function(el, options, id) {
        let that = this,
            firstRow,
            defaultSort,
            i,
            cell,
            getHead;

        that.table = el;
        that.thead = false;
        that.options = options;

        if (el.rows && el.rows.length > 0) {
            if (el.tHead && el.tHead.rows.length > 0) {
                for (i = 0; i < el.tHead.rows.length; i++) {
                    if (el.tHead.rows[i].getAttribute('data-sort-method') === 'thead') {
                        firstRow = el.tHead.rows[i];
                        break;
                    }
                }
                if (!firstRow) {
                    firstRow = el.tHead.rows[el.tHead.rows.length - 1];
                }
                that.thead = true;
            } else {
                firstRow = el.rows[0];
            }
        }
        getHead = el.querySelector('.table-head .table-column');
        if (getHead && !firstRow) {
            firstRow = getHead;
            that.thead = true;
        }
        if (!firstRow) return;

        let onClick = function() {
            if (that.current && that.current !== this) {
                that.current.removeAttribute('aria-sort');
            }
            that.current = this;
            that.sortTable(this);
        };

        //Assume first row is the header and attach a click handler to each.
        firstRow = Util.getElem('.table-sort', 'all', firstRow);
        firstRow.forEach(function(value) {
            value.setAttribute('role', 'columnheader');
            if (value.getAttribute('data-sort-method') !== 'none') {
                value.tabindex = 0;
                value.addEventListener('click', onClick, false);
                if (value.getAttribute('data-sort-default') !== null) {
                    defaultSort = value;
                }
            }
        });

        if (defaultSort) {
            that.current = defaultSort;
            that.sortTable(defaultSort);
        }

        //Add date-sorting function
        sortOptions.push({
            name: 'date',
            pattern: function(item) {
                return (
                    item.search(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.?\,?\s*/i) !== -1 ||
                    item.search(/\d{2,4}[\/\-]\d{1,2}[\/\-]\d{1,2}/) !== -1 ||
                    item.search(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) !== -1
                ) && !isNaN(parseDate(item));
            },
            sort: function(a, b) {
                a = a.toLowerCase();
                b = b.toLowerCase();
                return parseDate(b) - parseDate(a);
            }
        });
    },

    sortTable: function(header, update) {
        let that = this,
            columnKey = header.getAttribute('data-sort-column-key'),
            column = header.cellIndex,
            sortFunction = caseInsensitiveSort,
            item = '',
            items = [],
            i = that.thead ? 0 : 1,
            sortMethod = header.getAttribute('data-sort-method'),
            sortOrder = header.getAttribute('aria-sort'),
            getRow,
            getSort,
            getBody;

        //For flexbox
        if (!column) {
            column = Util.getChildIndex(header);
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
        getRow = Util.getElem('.table-body .table-row:not(.no-sort)', 'all', that.table);
        if (getRow.length < 2) return;

        //If we force a sort method, it is not necessary to check rows
        if (!sortMethod) {
            let cell;
            while (items.length < 3 && i < getRow.length) {
                if (columnKey) {
                    cell = getCellByKey(getRow[i], columnKey);
                } else {
                    cell = Util.getElem('.table-sort, .table-no-sort', 'all', getRow[i]);
                    cell = cell[column];
                }
                //Treat missing cells as empty cells
                item = cell ? getInnerText(cell) : '';
                item = item.trim();
                if (item.length > 0) {
                    items.push(item);
                }
                i++;
            }
            if (!items) return;
        }

        for (i = 0; i < sortOptions.length; i++) {
            item = sortOptions[i];
            if (sortMethod) {
                if (item.name === sortMethod) {
                    sortFunction = item.sort;
                    break;
                }
            } else if (items.every(item.pattern)) {
                sortFunction = item.sort;
                break;
            }
        }

        that.col = column;

        //Core logic of sorting
        getBody = Util.getElem('.table-body', 'all', that.table);
        for (i = 0; i < getBody.length; i++) {
            let newRows = [],
                noSorts = {},
                j,
                totalRows = 0,
                noSortsSoFar = 0;

            //that.table.hasAttribute('sort-by');
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
    },

    refresh: function() {
        if (this.current !== undefined) {
            this.sortTable(this.current, true);
        }
    }
};
