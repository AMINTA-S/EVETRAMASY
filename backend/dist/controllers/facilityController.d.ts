import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const facilityController: {
    /** POST /api/facilities — PARKING_OWNER creates a facility */
    create(req: AuthRequest, res: Response): Promise<void>;
    /** GET /api/facilities — Public: list all ACTIVE facilities */
    getAll(_req: Request, res: Response): Promise<void>;
    /** GET /api/facilities/my — PARKING_OWNER: list their own facilities */
    getMy(req: AuthRequest, res: Response): Promise<void>;
    /** PUT /api/facilities/:id — PARKING_OWNER: update name, address, hourly_rate */
    update(req: AuthRequest, res: Response): Promise<void>;
    /** POST /api/facilities/:id/sensor — API-key auth, update occupancy */
    sensorUpdate(req: Request, res: Response): Promise<void>;
    /** POST /api/facilities/:id/event-request — PARKING_OWNER: submit a request to join an event */
    createEventRequest(req: AuthRequest, res: Response): Promise<void>;
    /** GET /api/facilities/event-requests/my — PARKING_OWNER: get their own requests */
    getMyEventRequests(req: AuthRequest, res: Response): Promise<void>;
    /** GET /api/facilities/event-requests/:eventId — MANAGER/ADMIN: get all requests for an event */
    getEventRequests(req: AuthRequest, res: Response): Promise<void>;
    /** PUT /api/facilities/event-requests/:reqId/respond — MANAGER/ADMIN: approve or reject */
    respondToRequest(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=facilityController.d.ts.map