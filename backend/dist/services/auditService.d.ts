export declare const auditService: {
    log(userId: string, action: string, description: string): Promise<void>;
    getLogs(limit?: number, offset?: number): Promise<any[]>;
};
//# sourceMappingURL=auditService.d.ts.map