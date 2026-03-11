import { useState, useMemo, useEffect } from 'react';
import { 
  Moon, 
  Code2, 
  Globe, 
  Network, 
  Cpu, 
  Zap, 
  Sparkles,
  ChevronDown,
  Star,
  Check,
  Bot,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { MODELS, getRecommendedModel, getModelById } from '../../lib/models';
import { Model, ModelSelectorProps } from '../../types/models';

const iconMap: Record<string, React.ElementType> = {
  Moon,
  Code2,
  Globe,
  Network,
  Cpu,
  Zap,
  Sparkles,
};

const speedLabels = {
  fast: 'Fast',
  medium: 'Balanced',
  slow: 'Thorough',
};

const costLabels = {
  free: 'Free',
  low: '$',
  medium: '$$',
  high: '$$$',
  variable: 'Varies',
};

export function ModelSelector({ 
  selectedModel, 
  onSelectModel, 
  prompt = '',
  className 
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  
  // Get recommendation based on prompt
  const recommendation = useMemo(() => {
    if (!prompt || prompt.length < 10) return null;
    return getRecommendedModel(prompt);
  }, [prompt]);
  
  // Auto-select recommended model if none selected
  useEffect(() => {
    if (recommendation && !selectedModel && recommendation.confidence > 0.8) {
      onSelectModel(recommendation.modelId);
    }
  }, [recommendation, selectedModel, onSelectModel]);
  
  const selectedModelData = selectedModel ? getModelById(selectedModel) : null;
  const displayModel = hoveredModel ? getModelById(hoveredModel) : selectedModelData;
  
  return (
    <div className={cn("relative", className)}>
      {/* Main Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "glass-panel flex items-center gap-3 px-4 py-3 rounded-xl",
          "hover:bg-white/10 transition-all duration-300",
          "min-w-[280px] group",
          isOpen && "bg-white/10 ring-2 ring-cyan-500/50"
        )}
      >
        <div className="relative">
          {selectedModelData ? (
            <ModelIcon model={selectedModelData} size="md" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white/60" />
            </div>
          )}
          {recommendation && recommendation.modelId === selectedModel && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
              <Star className="w-2.5 h-2.5 text-black" />
            </div>
          )}
        </div>
        
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-white">
            {selectedModelData ? selectedModelData.name : 'Select Model'}
          </div>
          <div className="text-xs text-white/50">
            {selectedModelData ? selectedModelData.provider : 'Choose AI for this task'}
          </div>
        </div>
        
        <ChevronDown className={cn(
          "w-5 h-5 text-white/50 transition-transform duration-300",
          isOpen && "rotate-180"
        )} />
      </button>
      
      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Model Grid */}
          <div className="absolute top-full left-0 mt-2 z-50 w-[600px]">
            <div className="glass-panel rounded-2xl p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                  Available Models
                </h3>
                {recommendation && (
                  <div className="flex items-center gap-2 text-xs text-amber-400">
                    <Star className="w-3 h-3" />
                    <span>AI Recommended</span>
                  </div>
                )}
              </div>
              
              {/* Model Cards Grid */}
              <div className="grid grid-cols-2 gap-3">
                {MODELS.map((model) => {
                  const isRecommended = recommendation?.modelId === model.id;
                  const isSelected = selectedModel === model.id;
                  
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setHoveredModel(model.id)}
                      onMouseLeave={() => setHoveredModel(null)}
                      className={cn(
                        "glass-card rounded-xl p-4 text-left relative overflow-hidden",
                        "transition-all duration-200",
                        isSelected && "ring-2 ring-cyan-400/50 bg-white/10",
                        isRecommended && !isSelected && "ring-1 ring-amber-400/50"
                      )}
                    >
                      {/* Recommended Badge */}
                      {isRecommended && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-amber-400/20 rounded-full">
                          <Star className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-medium text-amber-400">Recommended</span>
                        </div>
                      )}
                      
                      {/* Selected Check */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-cyan-400 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <ModelIcon model={model} size="sm" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm">
                              {model.name}
                            </span>
                            {model.isLocal && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-400 rounded">
                                Local
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-white/50 mt-1 line-clamp-2">
                            {model.description}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            <span className="px-1.5 py-0.5 text-[10px] bg-white/5 text-white/40 rounded">
                              {speedLabels[model.speed]}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-white/5 text-white/40 rounded">
                              {costLabels[model.cost]}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-white/5 text-white/40 rounded">
                              {(model.contextWindow / 1000).toFixed(0)}K ctx
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Recommendation Footer */}
              {recommendation && (
                <div className="mt-4 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-amber-400">
                        Recommended: {getModelById(recommendation.modelId)?.name}
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">
                        {recommendation.reason} ({Math.round(recommendation.confidence * 100)}% confidence)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Model Details Preview */}
      {displayModel && !isOpen && (
        <div className="mt-2 glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="text-white/70">Best for:</span>
            {displayModel.strengths.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

// Model Icon Component
function ModelIcon({ model, size = 'md' }: { model: Model; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = iconMap[model.icon] || Bot;
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  return (
    <div 
      className={cn(
        sizeClasses[size],
        "rounded-lg flex items-center justify-center flex-shrink-0"
      )}
      style={{ 
        backgroundColor: `${model.color}20`,
        boxShadow: `0 0 20px ${model.color}30`,
      }}
    >
      <Icon 
        className={iconSizes[size]} 
        style={{ color: model.color }}
      />
    </div>
  );
}

export default ModelSelector;