export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  strengths: string[];
  contextWindow: number;
  speed: 'fast' | 'medium' | 'slow';
  cost: 'free' | 'low' | 'medium' | 'high' | 'variable';
  isLocal?: boolean;
  isRecommended?: boolean;
  recommendationReason?: string;
}

export interface ModelSelectorProps {
  selectedModel: string | null;
  onSelectModel: (modelId: string) => void;
  prompt?: string;
  className?: string;
}

export interface ModelRecommendation {
  modelId: string;
  confidence: number;
  reason: string;
}

export type TaskType = 
  | 'coding'
  | 'writing'
  | 'analysis'
  | 'creative'
  | 'chat'
  | 'math'
  | 'translation'
  | 'summarization'
  | 'general';

export interface TaskPattern {
  type: TaskType;
  keywords: string[];
  recommendedModels: string[];
}