/**
 * Executes a SQL query, converting PostgreSQL-style $1,$2 params to SQLite ?
 * Returns a pg-compatible result: { rows: any[], rowCount: number }
 */
export declare const query: (text: string, params?: any[]) => Promise<{
    rows: any[];
    rowCount: number;
}>;
export declare const getClient: () => Promise<{
    query: (text: string, params?: any[]) => Promise<{
        rows: any[];
        rowCount: number;
    }>;
    release: () => void;
}>;
export declare const beginTransaction: () => Promise<void>;
export declare const commitTransaction: () => Promise<void>;
export declare const rollbackTransaction: () => Promise<void>;
declare const pool: {
    query: (text: string, params?: any[]) => Promise<{
        rows: any[];
        rowCount: number;
    }>;
    connect: () => Promise<{
        query: (text: string, params?: any[]) => Promise<{
            rows: any[];
            rowCount: number;
        }>;
        release: () => void;
    }>;
    on: () => void;
};
export default pool;
//# sourceMappingURL=database.d.ts.map