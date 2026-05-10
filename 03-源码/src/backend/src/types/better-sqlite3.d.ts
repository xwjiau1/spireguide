declare module 'better-sqlite3' {
  class Database {
    constructor(filename: string, options?: any);
    prepare(sql: string): Statement;
    exec(sql: string): void;
    pragma(source: string, options?: any): any;
    close(): void;
    transaction(fn: Function): Function;
  }

  class Statement {
    run(...params: any[]): { lastInsertRowid: number; changes: number };
    get(...params: any[]): any;
    all(...params: any[]): any[];
    iterate(...params: any[]): IterableIterator<any>;
    pluck(toggleState?: boolean): this;
    expand(toggleState?: boolean): this;
    raw(toggleState?: boolean): this;
    bind(...params: any[]): this;
    columns(): any[];
    safeIntegers(toggleState?: boolean): this;
  }

  export default Database;
}
