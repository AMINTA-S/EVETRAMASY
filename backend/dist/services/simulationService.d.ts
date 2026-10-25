export declare const simulationService: {
    startSimulation(eventId: string): Promise<void>;
    stopSimulation(eventId: string): void;
    isRunning(eventId: string): boolean;
    getSteps(): {
        minuteOffset: number;
        trafficStatus: string;
        trafficScore: number;
        parkingFillPct: number;
        label: string;
    }[];
};
//# sourceMappingURL=simulationService.d.ts.map