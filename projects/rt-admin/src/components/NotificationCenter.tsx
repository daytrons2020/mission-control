import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Bot,
  Calendar,
  DollarSign,
  Zap
} from 'lucide-react';
import { useNotifications, Notification, NotificationType, NotificationSeverity } from '../services/notificationService';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  error: <AlertCircle className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  task_completed: <CheckCircle className="w-4 h-4" />,
  cron_failed: <AlertTriangle className="w-4 h-4" />,
  agent_spawned: <Bot className="w-4 h-4" />,
  agent_completed: <Bot className="w-4 h-4" />,
  budget_alert: <DollarSign className="w-4 h-4" />,
  system_error: <AlertCircle className="w-4 h-4" />,
  daily_summary: <Calendar className="w-4 h-4" />,
};

const severityColors: Record<NotificationSeverity, { bg: string; border: string; text: string; icon: string }> = {
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'text-blue-500',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: 'text-yellow-500',
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    icon: 'text-orange-500',
  },
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: 'text-red-500',
  },
};

const typeLabels: Record<NotificationType, string> = {
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
  task_completed: 'Task Completed',
  cron_failed: 'Cron Failed',
  agent_spawned: 'Agent Spawned',
  agent_completed: 'Agent Completed',
  budget_alert: 'Budget Alert',
  system_error: 'System Error',
  daily_summary: 'Daily Summary',
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
}

function NotificationItem({ notification, onMarkAsRead, onMarkAsUnread, onDelete }: NotificationItemProps) {
  const colors = severityColors[notification.severity];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative p-3 border-b border-gray-100 transition-all duration-200 ${
        notification.read ? 'bg-white' : colors.bg
      } hover:bg-gray-50`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 mt-0.5 ${colors.icon}`}>
          {typeIcons[notification.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : colors.text}`}>
              {notification.title}
            </p>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatTimestamp(notification.timestamp)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          
          {/* Type Badge */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-1.5 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
              {typeLabels[notification.type]}
            </span>
            
            {/* Action Button if present */}
            {notification.actionUrl && notification.actionLabel && (
              <a
                href={notification.actionUrl}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {notification.actionLabel}
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex flex-col gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {notification.read ? (
            <button
              onClick={() => onMarkAsUnread(notification.id)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Mark as unread"
            >
              <Zap className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onMarkAsRead(notification.id)}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Mark as read"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => onDelete(notification.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Unread Indicator */}
      {!notification.read && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${colors.bg.replace('bg-', 'bg-').replace('50', '500')}`} />
      )}
    </div>
  );
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    markAsUnread,
    deleteNotification,
    clearAll,
    clearRead,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-blue-700 text-white' 
            : 'text-blue-100 hover:bg-blue-700 hover:text-white'
        }`}
        aria-label="Notifications"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-blue-600 animate-in fade-in zoom-in duration-200">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Actions Bar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-200">
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearRead}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                  title="Clear read notifications"
                >
                  Clear read
                </button>
                <button
                  onClick={clearAll}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Clear all notifications"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {filter === 'unread' 
                    ? 'You\'re all caught up!' 
                    : 'Notifications from OpenClaw will appear here'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-400">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
