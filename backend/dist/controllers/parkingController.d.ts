import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const parkingController: {
    getEventParkingZones(req: Request, res: Response): Promise<void>;
    createParkingZone(req: AuthRequest, res: Response): Promise<void>;
    updateParkingZone(req: AuthRequest, res: Response): Promise<void>;
    getRecommendations(req: Request, res: Response): Promise<void>;
    getRouteRecommendation(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=parkingController.d.ts.map