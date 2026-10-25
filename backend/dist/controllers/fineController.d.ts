import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const fineController: {
    /** GET /api/fines — CUSTOMER: get their fines */
    getMyFines(req: AuthRequest, res: Response): Promise<void>;
    /** PUT /api/fines/:id/pay — CUSTOMER: mark their fine as PAID (simulation) */
    payFine(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=fineController.d.ts.map