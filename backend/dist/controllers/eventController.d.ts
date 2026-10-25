import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const eventController: {
    getPublicEvents(req: Request, res: Response): Promise<void>;
    getEventById(req: Request, res: Response): Promise<void>;
    createEvent(req: AuthRequest, res: Response): Promise<void>;
    updateEvent(req: AuthRequest, res: Response): Promise<void>;
    getManagerEvents(req: AuthRequest, res: Response): Promise<void>;
    getEventStats(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=eventController.d.ts.map