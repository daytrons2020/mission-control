/**
 * OpenClaw Integration Module for Mission Control Notifications
 * 
 * This module provides integration points between OpenClaw's agent system
 * and the Mission Control notification center.
 */

import { notificationService, Notification } from './notificationService';

// Event types that OpenClaw can emit
export type OpenClawEventType = 
  | 'cron:start'
  | 'cron:complete'
  | 'cron:error'
  | 'agent:spawn'
  | 'agent:complete'
  | 'agent:error'
  | 'task:complete'
  | 'task:error'
  | 'budget:threshold'
  | 'system:error';

export interface OpenClawEvent {
  type: OpenClawEventType;
  timestamp: string;
  data: any;
  sessionId?: string;
  agentId?: string;
}

// Event handler mapping
const eventHandlers: Record<OpenClawEventType, (data: any) => Notification | null> = {
  'cron:start': (_data) => null, // Silent - no notification for start
  
  'cron:complete': (data) => notificationService.addNotification({
    type: 'success',
    severity: 'low',
    title: '✅ Cron Job Completed',
    message: `Job "${data.jobName}" completed successfully`,
    source: data.source,
    metadata: data,
  }),
  
  'cron:error': (data) => notificationService.notifyCronFailed({
    jobName: data.jobName,
    schedule: data.schedule,
    error: data.error,
    exitCode: data.exitCode,
  }),
  
  'agent:spawn': (data) => notificationService.notifyAgentSpawned({
    agentId: data.agentId,
    agentName: data.agentName,
    task: data.task,
    parentSession: data.parentSession,
  }),
  
  'agent:complete': (data) => notificationService.notifyAgentCompleted({
    agentId: data.agentId,
    agentName: data.agentName,
    task: data.task,
    parentSession: data.parentSession,
    success: data.success ?? true,
    result: data.result,
  }),
  
  'agent:error': (data) => notificationService.notifyAgentCompleted({
    agentId: data.agentId,
    agentName: data.agentName,
    task: data.task,
    parentSession: data.parentSession,
    success: false,
    result: data.error,
  }),
  
  'task:complete': (data) => notificationService.notifyTaskCompleted({
    taskId: data.taskId,
    taskName: data.taskName,
    completedBy: data.completedBy,
    duration: data.duration,
  }),
  
  'task:error': (data) => notificationService.addNotification({
    type: 'error',
    severity: 'high',
    title: '❌ Task Failed',
    message: `Task "${data.taskName}" failed: ${data.error}`,
    source: data.source,
    metadata: data,
  }),
  
  'budget:threshold': (data) => notificationService.notifyBudgetAlert({
    threshold: data.threshold,
    currentSpend: data.currentSpend,
    budgetLimit: data.budgetLimit,
    percentage: data.percentage,
  }),
  
  'system:error': (data) => notificationService.notifySystemError(
    new Error(data.message || data.error || 'Unknown system error'),
    data.source
  ),
};

/**
 * Process an incoming OpenClaw event and create appropriate notification
 */
export function processOpenClawEvent(event: OpenClawEvent): Notification | null {
  const handler = eventHandlers[event.type];
  if (handler) {
    return handler(event.data);
  }
  return null;
}

/**
 * Simulate receiving events from OpenClaw
 * In production, this would connect to WebSocket or SSE endpoint
 */
export function simulateOpenClawEvent(type: OpenClawEventType, data: any): void {
  const event: OpenClawEvent = {
    type,
    timestamp: new Date().toISOString(),
    data,
  };
  processOpenClawEvent(event);
}

/**
 * Demo function to show various notification types
 * Call this from console or add a debug button to test
 */
export function runNotificationDemo(): void {
  const demoNotifications: Array<{ type: OpenClawEventType; data: any }> = [
    {
      type: 'task:complete',
      data: {
        taskId: 'task-001',
        taskName: 'Daily Backup',
        completedBy: 'Backup Agent',
        duration: 120,
      },
    },
    {
      type: 'cron:error',
      data: {
        jobName: 'News Fetcher',
        schedule: '0 */6 * * *',
        error: 'Connection timeout after 30s',
        exitCode: 1,
      },
    },
    {
      type: 'agent:spawn',
      data: {
        agentId: 'agent-123',
        agentName: 'Data Processor',
        task: 'Process daily reports',
        parentSession: 'session-456',
      },
    },
    {
      type: 'agent:complete',
      data: {
        agentId: 'agent-123',
        agentName: 'Data Processor',
        task: 'Process daily reports',
        success: true,
        result: 'Processed 42 records',
      },
    },
    {
      type: 'budget:threshold',
      data: {
        threshold: 50,
        currentSpend: 25.50,
        budgetLimit: 50.00,
        percentage: 51,
      },
    },
    {
      type: 'budget:threshold',
      data: {
        threshold: 80,
        currentSpend: 42.00,
        budgetLimit: 50.00,
        percentage: 84,
      },
    },
    {
      type: 'system:error',
      data: {
        message: 'Failed to connect to database',
        source: 'Database Service',
      },
    },
  ];

  // Show notifications with staggered timing
  demoNotifications.forEach((notif, index) => {
    setTimeout(() => {
      simulateOpenClawEvent(notif.type, notif.data);
    }, index * 500);
  });
}

/**
 * WebSocket/SSE connection manager for real-time notifications
 * Placeholder for production implementation
 */
export class OpenClawConnection {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(private url: string = 'ws://localhost:8080/ws/notifications') {}

  connect(): void {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[OpenClaw] Connected to notification stream');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          processOpenClawEvent(data);
        } catch (err) {
          console.error('[OpenClaw] Failed to parse event:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[OpenClaw] Disconnected from notification stream');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('[OpenClaw] WebSocket error:', error);
      };
    } catch (err) {
      console.error('[OpenClaw] Failed to connect:', err);
      this.attemptReconnect();
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[OpenClaw] Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('[OpenClaw] Max reconnection attempts reached');
    }
  }
}

// Export singleton connection instance
export const openClawConnection = new OpenClawConnection();

export default {
  processOpenClawEvent,
  simulateOpenClawEvent,
  runNotificationDemo,
  openClawConnection,
};
