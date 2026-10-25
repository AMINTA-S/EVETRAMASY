export declare const parkingService: {
    updateOccupancy(zoneId: string, delta: number): Promise<void>;
    reserveSpot(zoneId: string): Promise<boolean>;
    releaseReservation(zoneId: string): Promise<void>;
    getQueueEstimate(zoneId: string): Promise<{
        queueLength: number;
        waitMinutes: number;
    }>;
};
//# sourceMappingURL=parkingService.d.ts.map