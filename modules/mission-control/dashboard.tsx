import React from 'react';
import { Brain, Search, Plus } from 'lucide-react';
import SecondBrainDashboard from '../modules/second-brain/dashboard';

export default function MissionControlDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Mission Control</h1>
              <p className="text-sm text-gray-500">2nd Brain Integrated</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <QuickStat title="Active Agents" value="9" status="online" />
          <QuickStat title="Cron Jobs" value="12" status="running" />
          <QuickStat title="Memories" value="8" status="good" />
          <QuickStat title="Tasks Today" value="3" status="pending" />
        </div>

        {/* 2nd Brain Module */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              2nd Brain
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                Memories
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                Documents
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">
                Tasks
              </button>
            </div>
          </div>
          <SecondBrainDashboard />
        </div>

        {/* AI Insights Section */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            AI Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              type="pattern"
              title="Activity Pattern"
              content="Most productive hours: 2-4 PM. Consider scheduling complex tasks then."
            />
            <InsightCard
              type="reminder"
              title="Task Reminder"
              content="3 cron jobs have been failing for 24+ hours. Check Hourly Cost Report."
            />
            <InsightCard
              type="suggestion"
              title="Optimization"
              content="Ollama keep-warm using 270K tokens/hour. Switch to bash cron to save costs."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickStat({ title, value, status }: { title: string; value: string; status: string }) {
  const statusColors: Record<string, string> = {
    online: 'bg-green-100 text-green-700',
    running: 'bg-blue-100 text-blue-700',
    good: 'bg-purple-100 text-purple-700',
    pending: 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-2xl font-bold">{value}</p>
        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function InsightCard({ type, title, content }: { type: string; title: string; content: string }) {
  const typeColors: Record<string, string> = {
    pattern: 'border-blue-200 bg-blue-50',
    reminder: 'border-yellow-200 bg-yellow-50',
    suggestion: 'border-green-200 bg-green-50'
  };

  return (
    <div className={`rounded-lg border p-4 ${typeColors[type]}`}>
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-700">{content}</p>
    </div>
  );
}
