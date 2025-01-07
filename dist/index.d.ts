declare class TableSort {
    static version: string;
    static instance: TableSort[];
    table: HTMLElement;
    thead: boolean;
    options: any;
    current?: HTMLElement;
    col?: number;
    constructor(el: HTMLElement | string, options?: any);
    init(el: HTMLTableElement, options: any, id: number): void;
    sortTable(header: HTMLElement, update?: boolean): void;
    refresh(): void;
}

export { TableSort };
