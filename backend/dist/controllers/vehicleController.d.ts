import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const vehicleController: {
    getMyVehicles(req: AuthRequest, res: Response): Promise<void>;
    addVehicle(req: AuthRequest, res: Response): Promise<void>;
    updateVehicle(req: AuthRequest, res: Response): Promise<void>;
    deleteVehicle(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=vehicleController.d.ts.map