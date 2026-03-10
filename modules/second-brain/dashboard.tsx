import React, { useState, useEffect } from 'react';
import { Search, BookOpen, CheckSquare, Users, Brain } from 'lucide-react';

interface Stats {
  memories: number;
  documents: number;
  tasks: number;
  agents: number;
}

export default function SecondBrainDashboard() {
  const [stats, setStats] = useState<Stats>({ memories: 0, documents: 0, tasks: 0, agents: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Load stats from file system
    loadStats();
  }, []);

  const loadStats = async () => {
    // This will be populated by reading actual files
    setStats({
      memories: 8,  // From workspace/memory/
      documents: 6, // AGENTS.md, TOOLS.md, USER.md, MEMORY.md, HEARTBEAT.md, SOUL.md
      tasks: 12,    // Cron jobs
      agents: 9     // Configured agents
    });

    setRecentActivity([
      { type: 'memory', title: 'Daily Notes 2026-03-09', time: '2 hours ago' },
      { type: 'task', title: 'Afternoon Check Completed', time: '3 hours ago' },
      { type: 'agent', title: 'Frontend Developer Task Done', time: '5 hours ago' },
    ]);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-8 h-8 text-blue-500" />
          2nd Brain
        </h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search everything..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Memories"
          count={stats.memories}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          title="Documents"
          count={stats.documents}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          icon={<CheckSquare className="w-6 h-6" />}
          title="Tasks"
          count={stats.tasks}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          title="Agents"
          count={stats.agents}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <ActivityIcon type={item.type} />
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          title="Browse Memories"
          description="View all memory files and daily notes"
          action={() => {}}
        />
        <QuickAction
          title="View Documents"
          description="Access context files and skills"
          action={() => {}}
        />
        <QuickAction
          title="Check Tasks"
          description="Review cron jobs and agent tasks"
          action={() => {}}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, count, color }: { icon: React.ReactNode; title: string; count: number; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-2xl font-bold">{count}</p>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    memory: <BookOpen className="w-5 h-5 text-purple-500" />,
    task: <CheckSquare className="w-5 h-5 text-green-500" />,
    agent: <Users className="w-5 h-5 text-orange-500" />,
  };
  return <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">{icons[type]}</div>;
}

function QuickAction({ title, description, action }: { title: string; description: string; action: () => void }) {
  return (
    <button
      onClick={action}
      className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow border border-transparent hover:border-blue-200"
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </button>
  );
}
