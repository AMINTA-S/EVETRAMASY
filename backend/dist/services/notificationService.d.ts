export declare const notificationService: {
    createNotification(userId: string, title: string, message: string, type: string): Promise<void>;
    getUserNotifications(userId: string): Promise<any[]>;
    markRead(notificationId: string, userId: string): Promise<void>;
    markAllRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
};
//# sourceMappingURL=notificationService.d.ts.map