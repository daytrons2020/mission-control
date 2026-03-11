import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Server, 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Cpu,
  MemoryStick
} from 'lucide-react';

// Types
interface BotStatus {
  online: boolean;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  uptime: number; // in seconds
  ping: number; // in ms
  guilds: number;
  users: number;
  commands: number;
  memory: number; // in MB
  cpu: number; // percentage
  lastRestart: string;
  version: string;
}

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  subtitle?: string;
}

// Utility functions
const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatMemory = (mb: number): string => {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${mb.toFixed(0)} MB`;
};

// Status Card Component
const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  icon, 
  status = 'neutral',
  subtitle 
}) => {
  const statusColors = {
    success: 'border-green-500/50 bg-green-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    error: 'border-red-500/50 bg-red-500/10',
    neutral: 'border-slate-700 bg-slate-800/50'
  };

  const iconColors = {
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
    neutral: 'text-slate-400'
  };

  return (
    <div className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${statusColors[status]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-lg p-2 ${iconColors[status]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
export const DiscordBotDashboard: React.FC = () => {
  // Fetch bot status (mock data for now)
  const { data: botStatus, isLoading, error } = useQuery<BotStatus>({
    queryKey: ['bot-status'],
    queryFn: async () => {
      // Replace with actual API call
      // const response = await fetch('/api/bot/status');
      // return response.json();
      
      // Mock data for demonstration
      return {
        online: true,
        status: 'online',
        uptime: 86400 + 3600 * 4 + 120, // 1 day, 4 hours, 2 minutes
        ping: 42,
        guilds: 15,
        users: 3420,
        commands: 24,
        memory: 128.5,
        cpu: 3.2,
        lastRestart: new Date(Date.now() - (86400 + 3600 * 4 + 120) * 1000).toISOString(),
        version: '1.2.3'
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-red-500/50 bg-red-500/10 p-8">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h3 className="text-lg font-semibold text-red-400">Failed to load bot status</h3>
        <p className="text-sm text-slate-400">Please check your connection and try again.</p>
      </div>
    );
  }

  if (!botStatus) return null;

  const statusConfig = {
    online: { icon: CheckCircle2, color: 'text-green-400', label: 'Online' },
    idle: { icon: Clock, color: 'text-yellow-400', label: 'Idle' },
    dnd: { icon: XCircle, color: 'text-red-400', label: 'Do Not Disturb' },
    offline: { icon: XCircle, color: 'text-slate-400', label: 'Offline' }
  };

  const currentStatus = statusConfig[botStatus.status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Discord Bot Dashboard</h1>
          <p className="mt-1 text-slate-400">Monitor your bot's health and performance</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2">
          <StatusIcon className={`h-5 w-5 ${currentStatus.color}`} />
          <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
          <span className="text-slate-500">•</span>
          <span className="text-sm text-slate-400">v{botStatus.version}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Uptime"
          value={formatUptime(botStatus.uptime)}
          subtitle={`Last restart: ${new Date(botStatus.lastRestart).toLocaleString()}`}
          icon={<Clock className="h-5 w-5" />}
          status={botStatus.online ? 'success' : 'error'}
        />
        
        <StatusCard
          title="Latency"
          value={`${botStatus.ping}ms`}
          subtitle="API response time"
          icon={<Activity className="h-5 w-5" />}
          status={botStatus.ping < 100 ? 'success' : botStatus.ping < 200 ? 'warning' : 'error'}
        />
        
        <StatusCard
          title="Servers"
          value={botStatus.guilds}
          subtitle="Connected guilds"
          icon={<Server className="h-5 w-5" />}
          status="neutral"
        />
        
        <StatusCard
          title="Users"
          value={botStatus.users.toLocaleString()}
          subtitle="Total members"
          icon={<Users className="h-5 w-5" />}
          status="neutral"
        />
      </div>

      {/* System Metrics */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Memory Usage"
          value={formatMemory(botStatus.memory)}
          subtitle="RAM consumption"
          icon={<MemoryStick className="h-5 w-5" />}
          status={botStatus.memory < 512 ? 'success' : botStatus.memory < 1024 ? 'warning' : 'error'}
        />
        
        <StatusCard
          title="CPU Usage"
          value={`${botStatus.cpu}%`}
          subtitle="Processor load"
          icon={<Cpu className="h-5 w-5" />}
          status={botStatus.cpu < 50 ? 'success' : botStatus.cpu < 80 ? 'warning' : 'error'}
        />
        
        <StatusCard
          title="Commands"
          value={botStatus.commands}
          subtitle="Available slash commands"
          icon={<Activity className="h-5 w-5" />}
          status="neutral"
        />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>Auto-refreshes every 30 seconds • Mission Control Platform</p>
      </div>
    </div>
  );
};

export default DiscordBotDashboard;
