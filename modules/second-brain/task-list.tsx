import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, Play, Pause } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  type: 'cron' | 'agent' | 'todo';
  status: 'running' | 'completed' | 'failed' | 'pending';
  lastRun?: string;
  nextRun?: string;
  schedule?: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'cron' | 'agent' | 'todo'>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const mockTasks: Task[] = [
      { id: '1', name: 'Afternoon Check', type: 'cron', status: 'running', schedule: '2:00 PM daily', lastRun: '2026-03-09 14:00', nextRun: '2026-03-10 14:00' },
      { id: '2', name: 'Evening Work Block', type: 'cron', status: 'pending', schedule: '8:00 PM daily', nextRun: '2026-03-09 20:00' },
      { id: '3', name: 'Ollama Keep-Warm', type: 'cron', status: 'running', schedule: 'Every 3 min' },
      { id: '4', name: 'Frontend Developer - 2nd Brain', type: 'agent', status: 'completed', lastRun: '2026-03-09 19:57' },
      { id: '5', name: 'Integration Specialist - Discord Audit', type: 'agent', status: 'completed', lastRun: '2026-03-09 22:08' },
      { id: '6', name: 'Build Knowledge Graph', type: 'todo', status: 'pending' },
      { id: '7', name: 'Add Discord Bot Integration', type: 'todo', status: 'pending' },
    ];
    setTasks(mockTasks);
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.type === filter);

  const statusColors: Record<string, string> = {
    running: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-700'
  };

  const statusIcons: Record<string, React.ReactNode> = {
    running: <Play className="w-4 h-4" />,
    completed: <CheckSquare className="w-4 h-4" />,
    failed: <AlertCircle className="w-4 h-4" />,
    pending: <Pause className="w-4 h-4" />
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="w-6 h-6" />
          Tasks
        </h1>
        
        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'cron', 'agent', 'todo'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${filter === f ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatBox label="Running" count={tasks.filter(t => t.status === 'running').length} color="green" />
        <StatBox label="Completed" count={tasks.filter(t => t.status === 'completed').length} color="blue" />
        <StatBox label="Failed" count={tasks.filter(t => t.status === 'failed').length} color="red" />
        <StatBox label="Pending" count={tasks.filter(t => t.status === 'pending').length} color="gray" />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusColors[task.status]}`}>
                {statusIcons[task.status]}
                {task.status}
              </span>
              <div>
                <h3 className="font-medium">{task.name}</h3>
                <p className="text-sm text-gray-500">
                  {task.type === 'cron' && task.schedule && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.schedule}
                    </span>
                  )}
                  {task.lastRun && <span>Last run: {task.lastRun}</span>}
                </p>
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-500">
              {task.nextRun && <p>Next: {task.nextRun}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    red: 'bg-red-50 text-red-700',
    gray: 'bg-gray-50 text-gray-700'
  };
  
  return (
    <div className={`${colors[color]} rounded-lg p-4 text-center`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
