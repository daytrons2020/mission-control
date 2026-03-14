# Mission Control Notification Center

A comprehensive notification system for the Mission Control dashboard that integrates with OpenClaw for real-time alerts.

## Features

- 🔔 **Bell Icon with Badge**: Shows unread notification count
- 📋 **Dropdown Panel**: Slide-down panel with recent notifications
- 🎨 **Color-Coded by Severity**: Visual distinction for different alert levels
- ⏰ **Timestamps**: Relative time display (e.g., "5m ago")
- ✅ **Action Buttons**: Mark as read/unread, delete, clear all

## Notification Types

| Type | Icon | Severity | Description |
|------|------|----------|-------------|
| ✅ Task Completed | CheckCircle | Low | Task finished successfully |
| ⚠️ Cron Job Failed | AlertTriangle | High | Scheduled job failed |
| 🤖 Agent Spawned | Bot | Low | New agent started |
| 🤖 Agent Completed | Bot | Low/Medium | Agent finished (success/fail) |
| 💰 Budget Alert | DollarSign | Medium/High/Critical | Budget thresholds (50%/80%/100%) |
| 🔴 System Error | AlertCircle | Critical | System-level errors |
| 📊 Daily Summary | Calendar | Low | Daily activity summary |

## Files Created

### Core Service
- `src/services/notificationService.ts` - Main notification service with:
  - Local storage persistence
  - Polling mechanism for new notifications
  - CRUD operations (add, mark read/unread, delete, clear)
  - React hook: `useNotifications()`
  - Helper methods for OpenClaw events

### OpenClaw Integration
- `src/services/openClawIntegration.ts` - Integration module with:
  - Event type definitions
  - Event handlers for each notification type
  - WebSocket connection manager (placeholder)
  - Demo/test functions

### UI Components
- `src/components/NotificationCenter.tsx` - Main notification bell component:
  - Bell icon with animated badge
  - Slide-down notification panel
  - Filter tabs (All/Unread)
  - Action buttons
  - Empty state

- `src/components/NotificationDemoPanel.tsx` - Development tool:
  - Floating demo panel
  - Buttons to trigger each notification type
  - "Run Full Demo" button
  - Clear all notifications

### Integration
- Updated `src/App.tsx`:
  - Added NotificationCenter to header
  - Added NotificationDemoPanel (dev only)
  - Initialized notification service

## Usage

### Basic Usage in Components

```tsx
import { useNotifications } from './services/notificationService';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  );
}
```

### Triggering Notifications from OpenClaw

```tsx
import { simulateOpenClawEvent } from './services/openClawIntegration';

// Task completed
simulateOpenClawEvent('task:complete', {
  taskId: 'task-123',
  taskName: 'Daily Backup',
  completedBy: 'Backup Agent',
  duration: 120,
});

// Budget alert
simulateOpenClawEvent('budget:threshold', {
  threshold: 80,
  currentSpend: 42.00,
  budgetLimit: 50.00,
  percentage: 84,
});
```

### Using Helper Methods

```tsx
import { notificationService } from './services/notificationService';

// Direct notification creation
notificationService.addNotification({
  type: 'info',
  severity: 'medium',
  title: 'Custom Notification',
  message: 'Something happened!',
});

// Pre-built helpers
notificationService.notifyTaskCompleted({
  taskId: 't1',
  taskName: 'My Task',
  completedBy: 'Agent',
});

notificationService.notifyBudgetAlert({
  threshold: 80,
  currentSpend: 40,
  budgetLimit: 50,
  percentage: 80,
});
```

## Storage

Notifications are persisted to `localStorage` under the key `mc_notifications`.
- Maximum 100 notifications stored
- Oldest notifications are pruned automatically
- Unread state is preserved across sessions

## Polling

The service polls for new notifications every 30 seconds (configurable).
In production, this would connect to an OpenClaw WebSocket or SSE endpoint.

## Development

The `NotificationDemoPanel` component is available in development mode to test all notification types. Click the bell icon in the bottom-right corner to open it.

## Future Enhancements

- WebSocket/SSE real-time connection to OpenClaw
- Push notifications for critical alerts
- Email notifications for budget/system errors
- Notification preferences/settings
- Grouping by date/source
- Search/filter by type
