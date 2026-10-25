export interface ForecastPoint {
    time: string;
    vehicleCount: number;
    parkingUtilization: number;
    trafficScore: number;
}
export declare const forecastService: {
    generateForecast(eventId: string): Promise<ForecastPoint[]>;
};
//# sourceMappingURL=forecastService.d.ts.map