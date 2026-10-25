import { query } from '../config/database';

export interface ForecastPoint {
  time: string;
  vehicleCount: number;
  parkingUtilization: number;
  trafficScore: number;
}

export const forecastService = {
  async generateForecast(eventId: string): Promise<ForecastPoint[]> {
    const eventRes = await query(
      `SELECT e.*, COALESCE(SUM(pz.capacity), 0) as total_parking
       FROM events e
       LEFT JOIN parking_zones pz ON pz.event_id = e.id
       WHERE e.id = $1
       GROUP BY e.id`,
      [eventId]
    );
    if (!eventRes.rows[0]) return [];
    const event = eventRes.rows[0];
    const estimatedVehicles = parseInt(event.estimated_vehicle_count) || 1000;
    const totalParking = parseInt(event.total_parking) || Math.max(estimatedVehicles, 1);

    const reservationsRes = await query(
      "SELECT COUNT(*) as count FROM reservations WHERE event_id = $1 AND status != 'CANCELLED'",
      [eventId]
    );
    const currentReservations = parseInt(reservationsRes.rows[0].count);
    const reservationRate = estimatedVehicles > 0 ? currentReservations / estimatedVehicles : 0;

    const eventStart = new Date(`${event.date}T${event.start_time}`);

    const curve = [
      { offset: -120, pct: 0.05 },
      { offset: -90,  pct: 0.15 },
      { offset: -60,  pct: 0.35 },
      { offset: -30,  pct: 0.60 },
      { offset: 0,    pct: 0.80 },
      { offset: 30,   pct: 0.90 },
      { offset: 60,   pct: 0.95 },
      { offset: 90,   pct: 0.85 },
      { offset: 120,  pct: 0.65 },
      { offset: 150,  pct: 0.40 },
      { offset: 180,  pct: 0.20 },
    ];

    return curve.map(point => {
      const t = new Date(eventStart.getTime() + point.offset * 60000);
      const vehicles = Math.round(estimatedVehicles * point.pct * (0.8 + reservationRate * 0.2));
      const utilization = Math.round(Math.min((vehicles / totalParking) * 100, 100));
      const trafficScore = Math.round(point.pct * 85);
      return {
        time: t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        vehicleCount: vehicles,
        parkingUtilization: utilization,
        trafficScore
      };
    });
  }
};
