import React, { useState } from 'react';
import { Bell, Play, Trash2, AlertCircle, CheckCircle, Bot, DollarSign, Calendar } from 'lucide-react';
import { runNotificationDemo, simulateOpenClawEvent } from '../services/openClawIntegration';
import { notificationService } from '../services/notificationService';

interface DemoButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

function DemoButton({ label, icon, onClick, variant = 'secondary' }: DemoButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger: 'bg-red-100 hover:bg-red-200 text-red-700',
    success: 'bg-green-100 hover:bg-green-200 text-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${variants[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}

export function NotificationDemoPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  const triggerTaskCompleted = () => {
    simulateOpenClawEvent('task:complete', {
      taskId: `task-${Date.now()}`,
      taskName: 'Sample Task',
      completedBy: 'Test Agent',
      duration: Math.floor(Math.random() * 300),
    });
  };

  const triggerCronFailed = () => {
    simulateOpenClawEvent('cron:error', {
      jobName: 'News Fetcher',
      schedule: '0 */6 * * *',
      error: 'Connection timeout after 30s',
      exitCode: 1,
    });
  };

  const triggerAgentSpawned = () => {
    simulateOpenClawEvent('agent:spawn', {
      agentId: `agent-${Date.now()}`,
      agentName: 'Data Processor',
      task: 'Processing batch data',
      parentSession: 'session-main',
    });
  };

  const triggerBudgetAlert50 = () => {
    simulateOpenClawEvent('budget:threshold', {
      threshold: 50,
      currentSpend: 26.50,
      budgetLimit: 50.00,
      percentage: 53,
    });
  };

  const triggerBudgetAlert80 = () => {
    simulateOpenClawEvent('budget:threshold', {
      threshold: 80,
      currentSpend: 42.00,
      budgetLimit: 50.00,
      percentage: 84,
    });
  };

  const triggerBudgetAlert100 = () => {
    simulateOpenClawEvent('budget:threshold', {
      threshold: 100,
      currentSpend: 52.00,
      budgetLimit: 50.00,
      percentage: 104,
    });
  };

  const triggerSystemError = () => {
    simulateOpenClawEvent('system:error', {
      message: 'Failed to connect to database: Connection refused',
      source: 'Database Service',
    });
  };

  const triggerDailySummary = () => {
    notificationService.notifyDailySummary({
      tasksCompleted: Math.floor(Math.random() * 20) + 5,
      agentsSpawned: Math.floor(Math.random() * 10) + 1,
      errors: Math.floor(Math.random() * 3),
      budgetUsed: Math.random() * 30,
    });
  };

  const clearAllNotifications = () => {
    notificationService.clearAll();
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        title="Open Notification Demo Panel"
      >
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Notification Demo</h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 mb-2">Click to trigger notifications:</p>
        
        <div className="grid grid-cols-2 gap-2">
          <DemoButton
            label="Task Done"
            icon={<CheckCircle className="w-4 h-4" />}
            onClick={triggerTaskCompleted}
            variant="success"
          />
          <DemoButton
            label="Cron Failed"
            icon={<AlertCircle className="w-4 h-4" />}
            onClick={triggerCronFailed}
            variant="danger"
          />
          <DemoButton
            label="Agent Spawn"
            icon={<Bot className="w-4 h-4" />}
            onClick={triggerAgentSpawned}
            variant="secondary"
          />
          <DemoButton
            label="Budget 50%"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={triggerBudgetAlert50}
            variant="secondary"
          />
          <DemoButton
            label="Budget 80%"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={triggerBudgetAlert80}
            variant="secondary"
          />
          <DemoButton
            label="Budget 100%"
            icon={<DollarSign className="w-4 h-4" />}
            onClick={triggerBudgetAlert100}
            variant="danger"
          />
          <DemoButton
            label="System Error"
            icon={<AlertCircle className="w-4 h-4" />}
            onClick={triggerSystemError}
            variant="danger"
          />
          <DemoButton
            label="Daily Summary"
            icon={<Calendar className="w-4 h-4" />}
            onClick={triggerDailySummary}
            variant="secondary"
          />
        </div>

        <div className="border-t border-gray-200 pt-2 mt-2">
          <DemoButton
            label="Run Full Demo"
            icon={<Play className="w-4 h-4" />}
            onClick={runNotificationDemo}
            variant="primary"
          />
        </div>

        <div className="border-t border-gray-200 pt-2 mt-2">
          <button
            onClick={clearAllNotifications}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full justify-center"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationDemoPanel;
