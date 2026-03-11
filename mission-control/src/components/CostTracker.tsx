import { useState, useEffect, useCallback } from 'react';
import { DollarSign, AlertTriangle, Settings, TrendingUp, Wallet } from 'lucide-react';

interface CostData {
  dailyBudget: number;
  currentSpend: number;
  lastResetDate: string;
  spendHistory: { date: string; amount: number }[];
}

const STORAGE_KEY = 'mission-control-cost-tracker';
const DEFAULT_BUDGET = 2.0;

const THRESHOLDS = {
  warning: 0.5,  // 50% - Yellow
  danger: 0.75,  // 75% - Orange
  critical: 0.9, // 90% - Red
};

export function useCostTracker() {
  const [costData, setCostData] = useState<CostData>({
    dailyBudget: DEFAULT_BUDGET,
    currentSpend: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    spendHistory: [],
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const today = new Date().toISOString().split('T')[0];
        
        // Reset if it's a new day
        if (parsed.lastResetDate !== today) {
          const newData: CostData = {
            dailyBudget: parsed.dailyBudget || DEFAULT_BUDGET,
            currentSpend: 0,
            lastResetDate: today,
            spendHistory: [
              ...(parsed.spendHistory || []),
              { date: parsed.lastResetDate, amount: parsed.currentSpend || 0 }
            ].slice(-30), // Keep last 30 days
          };
          setCostData(newData);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        } else {
          setCostData({
            ...parsed,
            dailyBudget: parsed.dailyBudget || DEFAULT_BUDGET,
            currentSpend: parsed.currentSpend || 0,
          });
        }
      } catch (e) {
        console.error('Failed to parse cost data:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(costData));
    }
  }, [costData, isLoaded]);

  const addSpend = useCallback((amount: number) => {
    setCostData(prev => ({
      ...prev,
      currentSpend: prev.currentSpend + amount,
    }));
  }, []);

  const setDailyBudget = useCallback((budget: number) => {
    setCostData(prev => ({
      ...prev,
      dailyBudget: Math.max(0.1, budget),
    }));
  }, []);

  const resetDailySpend = useCallback(() => {
    setCostData(prev => ({
      ...prev,
      currentSpend: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
    }));
  }, []);

  const percentage = costData.dailyBudget > 0 
    ? (costData.currentSpend / costData.dailyBudget) 
    : 0;

  const getAlertLevel = useCallback(() => {
    if (percentage >= THRESHOLDS.critical) return 'critical';
    if (percentage >= THRESHOLDS.danger) return 'danger';
    if (percentage >= THRESHOLDS.warning) return 'warning';
    return 'normal';
  }, [percentage]);

  const remaining = Math.max(0, costData.dailyBudget - costData.currentSpend);

  return {
    ...costData,
    percentage,
    remaining,
    alertLevel: getAlertLevel(),
    addSpend,
    setDailyBudget,
    resetDailySpend,
    isLoaded,
  };
}

interface CostTrackerProps {
  compact?: boolean;
}

export function CostTracker({ compact = false }: CostTrackerProps) {
  const {
    dailyBudget,
    currentSpend,
    percentage,
    remaining,
    alertLevel,
    setDailyBudget,
    resetDailySpend,
    isLoaded,
  } = useCostTracker();
  
  const [showSettings, setShowSettings] = useState(false);
  const [budgetInput, setBudgetInput] = useState(dailyBudget.toFixed(2));

  useEffect(() => {
    setBudgetInput(dailyBudget.toFixed(2));
  }, [dailyBudget, showSettings]);

  if (!isLoaded) return null;

  const getAlertColors = () => {
    switch (alertLevel) {
      case 'critical':
        return {
          bg: 'bg-rose-500/20',
          border: 'border-rose-500/50',
          text: 'text-rose-400',
          bar: 'bg-rose-500',
          glow: 'shadow-rose-500/30',
          icon: 'text-rose-400',
        };
      case 'danger':
        return {
          bg: 'bg-orange-500/20',
          border: 'border-orange-500/50',
          text: 'text-orange-400',
          bar: 'bg-orange-500',
          glow: 'shadow-orange-500/30',
          icon: 'text-orange-400',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          bar: 'bg-yellow-500',
          glow: 'shadow-yellow-500/30',
          icon: 'text-yellow-400',
        };
      default:
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500/50',
          text: 'text-emerald-400',
          bar: 'bg-emerald-500',
          glow: 'shadow-emerald-500/30',
          icon: 'text-emerald-400',
        };
    }
  };

  const colors = getAlertColors();

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = parseFloat(budgetInput);
    if (!isNaN(newBudget) && newBudget > 0) {
      setDailyBudget(newBudget);
      setShowSettings(false);
    }
  };

  if (compact) {
    return (
      <div className={`glass-panel rounded-xl p-3 ${alertLevel !== 'normal' ? colors.border : ''} border`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center ${colors.icon}`}>
            {alertLevel !== 'normal' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Wallet className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-400">Daily Budget</span>
              <span className={`text-sm font-semibold ${colors.text}`}>
                ${currentSpend.toFixed(2)} / ${dailyBudget.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bar} transition-all duration-500 ${alertLevel !== 'normal' ? 'animate-pulse' : ''}`}
                style={{ width: `${Math.min(percentage * 100, 100)}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Budget Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {showSettings && (
          <form onSubmit={handleBudgetSubmit} className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="flex-1 glass-input rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                placeholder="Daily budget"
              />
            </div>
            <button
              type="submit"
              className="glass-button-primary rounded-lg px-3 py-1.5 text-sm text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={resetDailySpend}
              className="glass-button rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white"
            >
              Reset
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className={`glass-panel rounded-2xl p-6 ${alertLevel !== 'normal' ? colors.border + ' border-2' : ''} ${alertLevel !== 'normal' ? colors.glow : ''} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.icon} ${alertLevel !== 'normal' ? 'animate-pulse' : ''}`}>
            {alertLevel !== 'normal' ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <TrendingUp className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Cost Tracker</h2>
            <p className="text-slate-400 text-sm">
              {alertLevel === 'critical' && '⚠️ Critical: Budget nearly exhausted!'}
              {alertLevel === 'danger' && '⚡ Warning: Approaching budget limit'}
              {alertLevel === 'warning' && '💡 Notice: Over 50% of budget used'}
              {alertLevel === 'normal' && '✅ Within budget'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="glass-button rounded-lg p-2 text-slate-400 hover:text-white transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Daily Spend</span>
          <span className={`text-sm font-semibold ${colors.text}`}>
            {Math.round(percentage * 100)}% used
          </span>
        </div>
        <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} transition-all duration-500 relative ${alertLevel !== 'normal' ? 'animate-pulse' : ''}`}
            style={{ width: `${Math.min(percentage * 100, 100)}%` }}
          >
            {percentage > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>
        </div>
        {/* Threshold markers */}
        <div className="relative h-4 mt-1">
          <div className="absolute left-[50%] top-0 -translate-x-1/2">
            <div className="w-0.5 h-2 bg-yellow-500/50" />
          </div>
          <div className="absolute left-[75%] top-0 -translate-x-1/2">
            <div className="w-0.5 h-2 bg-orange-500/50" />
          </div>
          <div className="absolute left-[90%] top-0 -translate-x-1/2">
            <div className="w-0.5 h-2 bg-rose-500/50" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Budget</div>
          <div className="text-xl font-bold text-white">${dailyBudget.toFixed(2)}</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Spent</div>
          <div className={`text-xl font-bold ${colors.text}`}>${currentSpend.toFixed(2)}</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Remaining</div>
          <div className="text-xl font-bold text-emerald-400">${remaining.toFixed(2)}</div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <form onSubmit={handleBudgetSubmit} className="border-t border-slate-700/50 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-2">
                Daily Budget (USD)
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="flex-1 glass-input rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  placeholder="2.00"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="glass-button-primary rounded-xl px-4 py-2 text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={resetDailySpend}
                className="glass-button rounded-xl px-4 py-2 text-slate-400 hover:text-white"
              >
                Reset Today
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Alert Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-700/30 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-slate-400">50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-slate-400">75%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-rose-500" />
          <span className="text-slate-400">90%</span>
        </div>
      </div>
    </div>
  );
}

export default CostTracker;
