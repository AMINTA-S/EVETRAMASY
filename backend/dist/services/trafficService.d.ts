export interface TrafficRiskResult {
    score: number;
    level: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
    breakdown: Record<string, number>;
}
export declare const trafficService: {
    calculateTrafficRisk(eventId: string): Promise<TrafficRiskResult>;
    updateTrafficZone(zoneId: string, status: string, score: number): Promise<void>;
    getTrafficStatusScore(status: string): Promise<number>;
};
//# sourceMappingURL=trafficService.d.ts.map