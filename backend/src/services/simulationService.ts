import { query } from '../config/database';
import { trafficService } from './trafficService';
import { notificationService } from './notificationService';

const activeSimulations = new Map<string, NodeJS.Timeout>();

const SIMULATION_STEPS = [
  { minuteOffset: 0,   trafficStatus: 'LOW',      trafficScore: 15, parkingFillPct: 0.35, label: 'Event day begins — light traffic' },
  { minuteOffset: 30,  trafficStatus: 'MODERATE', trafficScore: 40, parkingFillPct: 0.55, label: 'Traffic picking up — arrivals increasing' },
  { minuteOffset: 60,  trafficStatus: 'HIGH',     trafficScore: 70, parkingFillPct: 0.75, label: 'Heavy arrivals — expect delays' },
  { minuteOffset: 90,  trafficStatus: 'SEVERE',   trafficScore: 90, parkingFillPct: 0.90, label: 'Peak congestion — use alternative gates' },
  { minuteOffset: 120, trafficStatus: 'SEVERE',   trafficScore: 85, parkingFillPct: 0.95, label: 'Parking nearly full — limited spaces' },
  { minuteOffset: 150, trafficStatus: 'HIGH',     trafficScore: 65, parkingFillPct: 0.88, label: 'Departures begin — exit queues forming' },
  { minuteOffset: 180, trafficStatus: 'MODERATE', trafficScore: 40, parkingFillPct: 0.72, label: 'Traffic easing — steady departures' },
  { minuteOffset: 210, trafficStatus: 'LOW',      trafficScore: 20, parkingFillPct: 0.45, label: 'Event winding down — smooth flow' },
];

export const simulationService = {
  async startSimulation(eventId: string): Promise<void> {
    if (activeSimulations.has(eventId)) return;
    let stepIndex = 0;

    const runStep = async () => {
      if (stepIndex >= SIMULATION_STEPS.length) {
        this.stopSimulation(eventId);
        return;
      }
      const step = SIMULATION_STEPS[stepIndex];
      stepIndex++;

      try {
        const trafficZones = await query('SELECT id FROM traffic_zones WHERE event_id = $1', [eventId]);
        for (const zone of trafficZones.rows) {
          await trafficService.updateTrafficZone(zone.id, step.trafficStatus, step.trafficScore);
        }

        const parkingZones = await query('SELECT id, capacity FROM parking_zones WHERE event_id = $1', [eventId]);
        for (const zone of parkingZones.rows) {
          const newOccupied = Math.round(zone.capacity * step.parkingFillPct);
          const newAvailable = Math.max(0, zone.capacity - newOccupied);
          const status = newAvailable < zone.capacity * 0.05 ? 'FULL'
            : newAvailable < zone.capacity * 0.15 ? 'CRITICAL'
            : newAvailable < zone.capacity * 0.25 ? 'NEARLY_FULL'
            : 'AVAILABLE';
          await query(
            'UPDATE parking_zones SET occupied_count = $1, available_spaces = $2, status = $3 WHERE id = $4',
            [newOccupied, newAvailable, status, zone.id]
          );
        }

        await trafficService.calculateTrafficRisk(eventId);

        const reservationsRes = await query(
          "SELECT DISTINCT customer_id FROM reservations WHERE event_id = $1 AND status IN ('RESERVED', 'CHECKED_IN')",
          [eventId]
        );
        for (const row of reservationsRes.rows) {
          await notificationService.createNotification(
            row.customer_id,
            '📊 Event Update',
            `${step.label} — Traffic: ${step.trafficStatus}, Parking: ${Math.round(step.parkingFillPct * 100)}%`,
            'SIMULATION'
          );
        }
      } catch (err) {
        console.error('Simulation step error:', err);
      }
    };

    await runStep();
    const interval = setInterval(runStep, 12000); // Every 12 seconds for demo
    activeSimulations.set(eventId, interval);
  },

  stopSimulation(eventId: string): void {
    const interval = activeSimulations.get(eventId);
    if (interval) {
      clearInterval(interval);
      activeSimulations.delete(eventId);
    }
  },

  isRunning(eventId: string): boolean {
    return activeSimulations.has(eventId);
  },

  getSteps() {
    return SIMULATION_STEPS;
  }
};
