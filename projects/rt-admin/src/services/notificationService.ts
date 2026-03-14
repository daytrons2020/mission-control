/**
 * Notification Service for Mission Control
 * Handles polling, storage, and management of notifications
 */

export type NotificationType = 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info' 
  | 'task_completed'
  | 'cron_failed'
  | 'agent_spawned'
  | 'agent_completed'
  | 'budget_alert'
  | 'system_error'
  | 'daily_summary';

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  source?: string;
  metadata?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationFilter {
  types?: NotificationType[];
  severity?: NotificationSeverity[];
  read?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface BudgetAlertData {
  threshold: 50 | 80 | 100;
  currentSpend: number;
  budgetLimit: number;
  percentage: number;
}

export interface CronJobData {
  jobName: string;
  schedule: string;
  error: string;
  exitCode?: number;
}

export interface AgentData {
  agentId: string;
  agentName: string;
  task: string;
  parentSession?: string;
}

export interface TaskData {
  taskId: string;
  taskName: string;
  completedBy: string;
  duration?: number;
}

const STORAGE_KEY = 'mc_notifications';
const MAX_NOTIFICATIONS = 100;
const POLL_INTERVAL = 30000; // 30 seconds

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadFromStorage();
    this.startPolling();
  }

  // Storage Management
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
        // Sort by timestamp descending
        this.notifications.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
      this.notifications = [];
    }
  }

  private saveToStorage(): void {
    try {
      // Keep only the most recent MAX_NOTIFICATIONS
      const toStore = this.notifications.slice(0, MAX_NOTIFICATIONS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  // Polling
  private startPolling(): void {
    this.poll(); // Initial poll
    this.pollTimer = setInterval(() => this.poll(), POLL_INTERVAL);
  }

  public stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async poll(): Promise<void> {
    try {
      // In a real implementation, this would fetch from an API endpoint
      // For now, we'll simulate with OpenClaw integration points
      await this.fetchNewNotifications();
    } catch (error) {
      console.error('Notification poll failed:', error);
    }
  }

  private async fetchNewNotifications(): Promise<void> {
    // This is where you would integrate with OpenClaw's backend
    // For example:
    // const response = await fetch('/api/notifications?since=' + this.lastPollTime);
    // const newNotifications = await response.json();
    // newNotifications.forEach(n => this.addNotification(n));
    
    // Placeholder for OpenClaw integration
    // In production, this connects to the OpenClaw notification stream
  }

  // Notification CRUD
  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notifyListeners();
    
    return newNotification;
  }

  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  public markAsUnread(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = false;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearAll(): void {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  public clearRead(): void {
    this.notifications = this.notifications.filter(n => !n.read);
    this.saveToStorage();
    this.notifyListeners();
  }

  // Getters
  public getAll(): Notification[] {
    return [...this.notifications];
  }

  public getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public getFiltered(filter: NotificationFilter): Notification[] {
    return this.notifications.filter(n => {
      if (filter.types && !filter.types.includes(n.type)) return false;
      if (filter.severity && !filter.severity.includes(n.severity)) return false;
      if (filter.read !== undefined && n.read !== filter.read) return false;
      if (filter.startDate && new Date(n.timestamp) < new Date(filter.startDate)) return false;
      if (filter.endDate && new Date(n.timestamp) > new Date(filter.endDate)) return false;
      return true;
    });
  }

  public getById(id: string): Notification | undefined {
    return this.notifications.find(n => n.id === id);
  }

  // Listeners
  public subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.add(callback);
    callback(this.notifications); // Initial call
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.notifications));
  }

  // Helpers
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // OpenClaw Integration Helpers
  public notifyTaskCompleted(data: TaskData): Notification {
    return this.addNotification({
      type: 'task_completed',
      severity: 'low',
      title: '✅ Task Completed',
      message: `${data.taskName} was completed by ${data.completedBy}`,
      metadata: data,
    });
  }

  public notifyCronFailed(data: CronJobData): Notification {
    return this.addNotification({
      type: 'cron_failed',
      severity: 'high',
      title: '⚠️ Cron Job Failed',
      message: `Job "${data.jobName}" failed with error: ${data.error}`,
      metadata: data,
    });
  }

  public notifyAgentSpawned(data: AgentData): Notification {
    return this.addNotification({
      type: 'agent_spawned',
      severity: 'low',
      title: '🤖 Agent Spawned',
      message: `Agent "${data.agentName}" started task: ${data.task}`,
      metadata: data,
    });
  }

  public notifyAgentCompleted(data: AgentData & { success: boolean; result?: string }): Notification {
    return this.addNotification({
      type: 'agent_completed',
      severity: data.success ? 'low' : 'medium',
      title: data.success ? '🤖 Agent Completed' : '🤖 Agent Failed',
      message: data.success 
        ? `Agent "${data.agentName}" completed task: ${data.task}`
        : `Agent "${data.agentName}" failed task: ${data.task}`,
      metadata: data,
    });
  }

  public notifyBudgetAlert(data: BudgetAlertData): Notification {
    const severity: NotificationSeverity = 
      data.threshold === 100 ? 'critical' :
      data.threshold === 80 ? 'high' : 'medium';
    
    return this.addNotification({
      type: 'budget_alert',
      severity,
      title: '💰 Budget Alert',
      message: `Budget at ${data.threshold}%: $${data.currentSpend.toFixed(2)} of $${data.budgetLimit.toFixed(2)}`,
      metadata: data,
    });
  }

  public notifySystemError(error: Error, source?: string): Notification {
    return this.addNotification({
      type: 'system_error',
      severity: 'critical',
      title: '🔴 System Error',
      message: error.message,
      source,
      metadata: { stack: error.stack },
    });
  }

  public notifyDailySummary(summary: { 
    tasksCompleted: number; 
    agentsSpawned: number; 
    errors: number;
    budgetUsed: number;
  }): Notification {
    return this.addNotification({
      type: 'daily_summary',
      severity: 'low',
      title: '📊 Daily Summary',
      message: `${summary.tasksCompleted} tasks, ${summary.agentsSpawned} agents, ${summary.errors} errors`,
      metadata: summary,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// React Hook for notifications
import { useState, useEffect } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead: (id: string) => notificationService.markAsRead(id),
    markAllAsRead: () => notificationService.markAllAsRead(),
    markAsUnread: (id: string) => notificationService.markAsUnread(id),
    deleteNotification: (id: string) => notificationService.deleteNotification(id),
    clearAll: () => notificationService.clearAll(),
    clearRead: () => notificationService.clearRead(),
    addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => 
      notificationService.addNotification(n),
  };
}

export default notificationService;
