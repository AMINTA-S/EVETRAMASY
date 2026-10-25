export interface ParkingRecommendation {
    zoneId: string;
    zoneName: string;
    score: number;
    reasons: string[];
    available: number;
    capacity: number;
    utilization: number;
    estimatedWait: number;
    distance: string;
    entryGate: string;
    exitGate: string;
    trafficLevel: string;
}
export declare const recommendationService: {
    getRecommendedZones(eventId: string): Promise<ParkingRecommendation[]>;
    getRouteRecommendation(eventId: string, parkingZoneId: string): Promise<{
        event: any;
        venue: any;
        recommendedZone: any;
        entryGate: any;
        recommendedRoads: {
            road: string;
            status: string;
        }[];
        avoidRoads: {
            road: string;
            status: string;
            reason: string;
        }[];
        estimatedTravelTime: number;
        walkingDistance: any;
    }>;
};
//# sourceMappingURL=recommendationService.d.ts.map