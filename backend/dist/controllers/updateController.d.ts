import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const updateController: {
    getEventUpdates(req: Request, res: Response): Promise<void>;
    createUpdate(req: AuthRequest, res: Response): Promise<void>;
    getNotifications(req: AuthRequest, res: Response): Promise<void>;
    markRead(req: AuthRequest, res: Response): Promise<void>;
    markAllRead(req: AuthRequest, res: Response): Promise<void>;
    getForecast(req: Request, res: Response): Promise<void>;
    startSimulation(req: AuthRequest, res: Response): Promise<void>;
    stopSimulation(req: AuthRequest, res: Response): Promise<void>;
    getSimulationStatus(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=updateController.d.ts.map