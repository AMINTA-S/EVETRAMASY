import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const authController: {
    register(req: Request, res: Response): Promise<void>;
    login(req: Request, res: Response): Promise<void>;
    me(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=authController.d.ts.map