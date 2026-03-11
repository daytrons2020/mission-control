import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Clock, Brain } from 'lucide-react';

interface Insight {
  id: string;
  type: 'pattern' | 'reminder' | 'suggestion' | 'anomaly';
  title: string;
  content: string;
  confidence: number;
  basedOn: string[];
  generatedAt: string;
}

export default function AIInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    // In real implementation, this would analyze data and generate insights
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'pattern',
        title: 'Peak Productivity Hours',
        content: 'Your most productive time is 2:00-4:00 PM. 78% of complex tasks are completed during this window. Consider scheduling difficult work then.',
        confidence: 0.85,
        basedOn: ['task logs', 'agent completion times', 'cron job history'],
        generatedAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'reminder',
        title: 'Failing Cron Jobs',
        content: 'Hourly Cost Report has failed 52 consecutive times. Morning Brief has 16+ hour timeouts. These need immediate attention.',
        confidence: 0.99,
        basedOn: ['cron status logs', 'error reports'],
        generatedAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'suggestion',
        title: 'Cost Optimization',
        content: 'Ollama keep-warm job using 270K tokens/hour ($0). Switch to bash cron to save API costs and improve reliability.',
        confidence: 0.92,
        basedOn: ['token usage logs', 'cron job analysis'],
        generatedAt: new Date().toISOString()
      },
      {
        id: '4',
        type: 'anomaly',
        title: 'Unusual Agent Activity',
        content: 'Frontend Developer agent ran for 39 minutes (normal: 2-5 min). May indicate task complexity or performance issue.',
        confidence: 0.75,
        basedOn: ['agent runtime logs', 'historical averages'],
        generatedAt: new Date().toISOString()
      },
      {
        id: '5',
        type: 'pattern',
        title: 'Memory Creation Trend',
        content: 'Memory file creation increased 300% this week. Good documentation habits forming. Consider reviewing for consolidation.',
        confidence: 0.88,
        basedOn: ['memory file timestamps', 'content analysis'],
        generatedAt: new Date().toISOString()
      }
    ];

    setInsights(mockInsights);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'reminder': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5 text-green-500" />;
      case 'anomaly': return <Brain className="w-5 h-5 text-purple-500" />;
      default: return <Lightbulb className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'pattern': return 'border-blue-200';
      case 'reminder': return 'border-yellow-200';
      case 'suggestion': return 'border-green-200';
      case 'anomaly': return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Analyzing data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-600" />
          AI Insights
        </h2>
        <button
          onClick={generateInsights}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {insights.map(insight => (
          <div
            key={insight.id}
            className={`bg-white rounded-lg border-l-4 ${getBorderColor(insight.type)} shadow-sm p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">{getIcon(insight.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{insight.title}</h3>
                  <span className="text-xs text-gray-500">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{insight.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Based on: {insight.basedOn.join(', ')}</span>
                  <span>•</span>
                  <span>{new Date(insight.generatedAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <StatBox label="Patterns" value={insights.filter(i => i.type === 'pattern').length} color="blue" />
        <StatBox label="Reminders" value={insights.filter(i => i.type === 'reminder').length} color="yellow" />
        <StatBox label="Suggestions" value={insights.filter(i => i.type === 'suggestion').length} color="green" />
        <StatBox label="Anomalies" value={insights.filter(i => i.type === 'anomaly').length} color="purple" />
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  return (
    <div className={`${colors[color]} rounded-lg p-3 text-center`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm">{label}</p>
    </div>
  );
}
