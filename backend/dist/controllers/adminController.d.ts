import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const adminController: {
    getUsers(req: AuthRequest, res: Response): Promise<void>;
    updateUserStatus(req: AuthRequest, res: Response): Promise<void>;
    getAllEvents(req: AuthRequest, res: Response): Promise<void>;
    approveEvent(req: AuthRequest, res: Response): Promise<void>;
    rejectEvent(req: AuthRequest, res: Response): Promise<void>;
    getAnalytics(req: AuthRequest, res: Response): Promise<void>;
    getAuditLogs(req: AuthRequest, res: Response): Promise<void>;
    getFines(req: AuthRequest, res: Response): Promise<void>;
    getFineSettings(req: AuthRequest, res: Response): Promise<void>;
    updateFineSettings(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=adminController.d.ts.map