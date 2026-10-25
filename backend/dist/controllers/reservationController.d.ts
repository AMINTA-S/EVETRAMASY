import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const reservationController: {
    createReservation(req: AuthRequest, res: Response): Promise<void>;
    getMyReservations(req: AuthRequest, res: Response): Promise<void>;
    getReservationById(req: AuthRequest, res: Response): Promise<void>;
    cancelReservation(req: AuthRequest, res: Response): Promise<void>;
    getQRCode(req: AuthRequest, res: Response): Promise<void>;
    verifyQR(req: AuthRequest, res: Response): Promise<void>;
    getEventReservations(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=reservationController.d.ts.map