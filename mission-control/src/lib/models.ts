import { Model, TaskPattern, TaskType, ModelRecommendation } from '../types/models';

export const MODELS: Model[] = [
  {
    id: 'kimi',
    name: 'Kimi',
    provider: 'Moonshot AI',
    description: 'Long-context specialist with exceptional reasoning capabilities',
    icon: 'Moon',
    color: '#6366f1',
    features: ['200K context', 'Reasoning', 'Multilingual'],
    strengths: ['Long documents', 'Complex analysis', 'Research'],
    contextWindow: 200000,
    speed: 'medium',
    cost: 'medium',
  },
  {
    id: 'kimi-code',
    name: 'Kimi Code',
    provider: 'Moonshot AI',
    description: 'Code-optimized variant with enhanced programming capabilities',
    icon: 'Code2',
    color: '#8b5cf6',
    features: ['Code generation', 'Debugging', 'Architecture'],
    strengths: ['Programming', 'Code review', 'Technical design'],
    contextWindow: 200000,
    speed: 'medium',
    cost: 'medium',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    provider: 'MiniMax',
    description: 'Balanced performance with strong multilingual support',
    icon: 'Globe',
    color: '#10b981',
    features: ['Multilingual', 'Fast', 'Reliable'],
    strengths: ['Translation', 'General tasks', 'Chat'],
    contextWindow: 32000,
    speed: 'fast',
    cost: 'low',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    provider: 'OpenRouter',
    description: 'Universal gateway to hundreds of AI models',
    icon: 'Network',
    color: '#f59e0b',
    features: ['Multi-model', 'Fallbacks', 'Best price'],
    strengths: ['Flexibility', 'Cost optimization', 'Access'],
    contextWindow: 128000,
    speed: 'medium',
    cost: 'variable',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    provider: 'Local',
    description: 'Run models locally for privacy and offline access',
    icon: 'Cpu',
    color: '#06b6d4',
    features: ['Private', 'Offline', 'Customizable'],
    strengths: ['Privacy', 'No latency', 'Control'],
    contextWindow: 32768,
    speed: 'fast',
    cost: 'free',
    isLocal: true,
  },
  {
    id: 'grok',
    name: 'Grok',
    provider: 'xAI',
    description: 'Real-time knowledge with a witty personality',
    icon: 'Zap',
    color: '#ef4444',
    features: ['Real-time', 'Uncensored', 'X integration'],
    strengths: ['Current events', 'Creative writing', 'Humor'],
    contextWindow: 128000,
    speed: 'fast',
    cost: 'medium',
  },
  {
    id: 'nano',
    name: 'Nano',
    provider: 'Local',
    description: 'Lightweight on-device model for quick tasks',
    icon: 'Sparkles',
    color: '#ec4899',
    features: ['Instant', 'Private', 'Efficient'],
    strengths: ['Quick replies', 'Drafts', 'Summaries'],
    contextWindow: 8000,
    speed: 'fast',
    cost: 'free',
    isLocal: true,
  },
];

export const TASK_PATTERNS: TaskPattern[] = [
  {
    type: 'coding',
    keywords: ['code', 'program', 'function', 'bug', 'debug', 'error', 'syntax', 'api', 'database', 'server', 'client', 'react', 'javascript', 'python', 'typescript', 'html', 'css', 'sql', 'git', 'commit', 'pr', 'pull request'],
    recommendedModels: ['kimi-code', 'kimi', 'openrouter', 'ollama'],
  },
  {
    type: 'writing',
    keywords: ['write', 'essay', 'blog', 'article', 'story', 'draft', 'email', 'letter', 'content', 'copy', 'script', 'poem', 'creative'],
    recommendedModels: ['grok', 'kimi', 'minimax', 'nano'],
  },
  {
    type: 'analysis',
    keywords: ['analyze', 'research', 'study', 'report', 'data', 'statistics', 'compare', 'evaluate', 'review', 'assess', 'examine'],
    recommendedModels: ['kimi', 'kimi-code', 'openrouter', 'minimax'],
  },
  {
    type: 'creative',
    keywords: ['create', 'design', 'imagine', 'brainstorm', 'idea', 'concept', 'innovative', 'artistic', 'unique', 'original'],
    recommendedModels: ['grok', 'kimi', 'minimax', 'nano'],
  },
  {
    type: 'math',
    keywords: ['math', 'calculate', 'equation', 'formula', 'solve', 'computation', 'algebra', 'geometry', 'statistics', 'probability'],
    recommendedModels: ['kimi', 'kimi-code', 'openrouter'],
  },
  {
    type: 'translation',
    keywords: ['translate', 'translation', 'language', 'chinese', 'spanish', 'french', 'german', 'japanese', 'korean', 'russian', 'arabic', 'hindi'],
    recommendedModels: ['minimax', 'kimi', 'openrouter'],
  },
  {
    type: 'summarization',
    keywords: ['summarize', 'summary', 'tldr', 'brief', 'overview', 'condense', 'shorten', 'extract', 'key points'],
    recommendedModels: ['nano', 'kimi', 'minimax', 'ollama'],
  },
  {
    type: 'chat',
    keywords: ['chat', 'talk', 'conversation', 'discuss', 'opinion', 'thoughts', 'feelings', 'advice'],
    recommendedModels: ['grok', 'minimax', 'nano', 'kimi'],
  },
];

export function detectTaskType(prompt: string): TaskType {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const pattern of TASK_PATTERNS) {
    if (pattern.keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return pattern.type;
    }
  }
  
  return 'general';
}

export function getRecommendedModel(prompt: string): ModelRecommendation {
  const taskType = detectTaskType(prompt);
  
  // Find matching pattern
  const pattern = TASK_PATTERNS.find(p => p.type === taskType);
  
  if (!pattern || taskType === 'general') {
    // Default recommendation based on prompt length
    if (prompt.length > 50000) {
      return {
        modelId: 'kimi',
        confidence: 0.7,
        reason: 'Long context detected - Kimi handles large documents best',
      };
    }
    
    return {
      modelId: 'kimi',
      confidence: 0.5,
      reason: 'Balanced choice for general tasks',
    };
  }
  
  // Get the first recommended model for this task
  const recommendedModelId = pattern.recommendedModels[0];
  const model = MODELS.find(m => m.id === recommendedModelId);
  
  if (!model) {
    return {
      modelId: 'kimi',
      confidence: 0.5,
      reason: 'Balanced choice for general tasks',
    };
  }
  
  // Generate specific reason based on task type
  const reasons: Record<TaskType, string> = {
    coding: 'Code-optimized for programming tasks',
    writing: 'Excellent for creative writing',
    analysis: 'Strong analytical capabilities',
    creative: 'Great for brainstorming and ideas',
    math: 'Superior mathematical reasoning',
    translation: 'Multilingual specialist',
    summarization: 'Fast and efficient for summaries',
    chat: 'Conversational and engaging',
    general: 'Balanced all-rounder',
  };
  
  return {
    modelId: recommendedModelId,
    confidence: 0.85,
    reason: reasons[taskType],
  };
}

export function getModelById(id: string): Model | undefined {
  return MODELS.find(m => m.id === id);
}