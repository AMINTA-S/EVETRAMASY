import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const trafficController: {
    getEventTrafficZones(req: Request, res: Response): Promise<void>;
    createTrafficZone(req: AuthRequest, res: Response): Promise<void>;
    updateTrafficZone(req: AuthRequest, res: Response): Promise<void>;
    getTrafficRisk(req: Request, res: Response): Promise<void>;
    getEventAlerts(req: Request, res: Response): Promise<void>;
    getEventGates(req: Request, res: Response): Promise<void>;
    createGate(req: AuthRequest, res: Response): Promise<void>;
    updateGate(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=trafficController.d.ts.map