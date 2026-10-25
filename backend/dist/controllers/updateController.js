"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateController = void 0;
const database_1 = require("../config/database");
const notificationService_1 = require("../services/notificationService");
const forecastService_1 = require("../services/forecastService");
const simulationService_1 = require("../services/simulationService");
const makeId = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
});
exports.updateController = {
    async getEventUpdates(req, res) {
        try {
            const result = await (0, database_1.query)(`SELECT eu.*, u.name as manager_name FROM event_updates eu
         JOIN users u ON u.id=eu.manager_id
         WHERE eu.event_id=? ORDER BY eu.created_at DESC`, [req.params.eventId]);
            res.json(result.rows);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to get updates' });
        }
    },
    async createUpdate(req, res) {
        try {
            const { eventId } = req.params;
            const { title, message } = req.body;
            if (!title || !message) {
                res.status(400).json({ error: 'Title and message required' });
                return;
            }
            const updateId = makeId();
            await (0, database_1.query)('INSERT INTO event_updates (id,event_id,manager_id,title,message) VALUES (?,?,?,?,?)', [updateId, eventId, req.user.userId, title, message]);
            const attendees = await (0, database_1.query)("SELECT DISTINCT customer_id FROM reservations WHERE event_id=? AND status NOT IN ('CANCELLED','EXPIRED')", [eventId]);
            for (const row of attendees.rows) {
                await notificationService_1.notificationService.createNotification(row.customer_id, `📢 ${title}`, message, 'EVENT_UPDATE');
            }
            const update = await (0, database_1.query)('SELECT * FROM event_updates WHERE id=?', [updateId]);
            res.status(201).json(update.rows[0]);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to post update' });
        }
    },
    async getNotifications(req, res) {
        try {
            const notifs = await notificationService_1.notificationService.getUserNotifications(req.user.userId);
            const unread = await notificationService_1.notificationService.getUnreadCount(req.user.userId);
            res.json({ notifications: notifs, unreadCount: unread });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get notifications' });
        }
    },
    async markRead(req, res) {
        try {
            await notificationService_1.notificationService.markRead(req.params.id, req.user.userId);
            res.json({ message: 'Marked as read' });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to mark read' });
        }
    },
    async markAllRead(req, res) {
        try {
            await notificationService_1.notificationService.markAllRead(req.user.userId);
            res.json({ message: 'All marked as read' });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to mark all read' });
        }
    },
    async getForecast(req, res) {
        try {
            const forecast = await forecastService_1.forecastService.generateForecast(req.params.eventId);
            res.json(forecast);
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to generate forecast' });
        }
    },
    async startSimulation(req, res) {
        try {
            const { eventId } = req.params;
            if (simulationService_1.simulationService.isRunning(eventId)) {
                res.status(400).json({ error: 'Simulation already running' });
                return;
            }
            await simulationService_1.simulationService.startSimulation(eventId);
            res.json({ message: 'Simulation started', steps: simulationService_1.simulationService.getSteps() });
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to start simulation' });
        }
    },
    async stopSimulation(req, res) {
        try {
            simulationService_1.simulationService.stopSimulation(req.params.eventId);
            res.json({ message: 'Simulation stopped' });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to stop simulation' });
        }
    },
    async getSimulationStatus(req, res) {
        try {
            res.json({
                running: simulationService_1.simulationService.isRunning(req.params.eventId),
                steps: simulationService_1.simulationService.getSteps()
            });
        }
        catch (err) {
            res.status(500).json({ error: 'Failed to get status' });
        }
    }
};
//# sourceMappingURL=updateController.js.map