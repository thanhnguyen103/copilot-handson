// NotificationService: Handles task reminders, due date alerts, and task management notifications
// This is a basic in-app/email notification service. Integrate with email/SMS/push as needed.

import nodemailer from 'nodemailer';

export interface Notification {
  userId: number;
  type: 'reminder' | 'due_soon' | 'overdue' | 'task_update';
  message: string;
  taskId?: number;
  email?: string;
}

export class NotificationService {
  private transporter;

  constructor() {
    // Configure nodemailer (for email notifications)
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'user',
        pass: process.env.SMTP_PASS || 'pass',
      },
    });
  }

  // Send a notification (in-app or email)
  async sendNotification(notification: Notification): Promise<void> {
    // In-app: Save to DB or push to websocket (not implemented here)
    // Email: Send via nodemailer if email is provided
    if (notification.email) {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@example.com',
        to: notification.email,
        subject: this.getSubject(notification.type),
        text: notification.message,
      });
    }
    // Optionally: log or store notification
  }

  // Helper to generate notification subject
  getSubject(type: Notification['type']): string {
    switch (type) {
      case 'reminder': return 'Task Reminder';
      case 'due_soon': return 'Task Due Soon';
      case 'overdue': return 'Task Overdue';
      case 'task_update': return 'Task Update';
      default: return 'Task Notification';
    }
  }

  // Send reminder for a specific task
  async sendTaskReminder(userId: number, email: string, taskTitle: string, dueDate: Date): Promise<void> {
    const message = `Reminder: Your task "${taskTitle}" is due on ${dueDate.toLocaleDateString()}.`;
    await this.sendNotification({ userId, type: 'reminder', message, email });
  }

  // Send due soon alert
  async sendDueSoonAlert(userId: number, email: string, taskTitle: string, dueDate: Date): Promise<void> {
    const message = `Alert: Your task "${taskTitle}" is due soon (${dueDate.toLocaleDateString()}).`;
    await this.sendNotification({ userId, type: 'due_soon', message, email });
  }

  // Send overdue alert
  async sendOverdueAlert(userId: number, email: string, taskTitle: string, dueDate: Date): Promise<void> {
    const message = `Overdue: Your task "${taskTitle}" was due on ${dueDate.toLocaleDateString()}. Please take action.`;
    await this.sendNotification({ userId, type: 'overdue', message, email });
  }

  // Send generic task management notification
  async sendTaskUpdate(userId: number, email: string, message: string): Promise<void> {
    await this.sendNotification({ userId, type: 'task_update', message, email });
  }
}
