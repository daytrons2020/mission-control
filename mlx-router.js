#!/usr/bin/env node
/**
 * MLX Cost Router - Routes tasks to optimal model
 * Priority: MLX (FREE) > Kimi-Code (You) > Kimi 2.5 > Minimax
 */

// Task types and their optimal models
const ROUTING_RULES = {
  // FREE - MLX (deepseek-14b) - 75% of tasks
  'code_generation': { 
    model: 'mlx', 
    provider: 'mlx_14b/deepseek-14b',
    reason: 'Code tasks work well with MLX (FREE)' 
  },
  'simple_analysis': { 
    model: 'mlx', 
    provider: 'mlx_14b/deepseek-14b',
    reason: 'Basic analysis on MLX (FREE)' 
  },
  'data_processing': { 
    model: 'mlx', 
    provider: 'mlx_14b/deepseek-14b',
    reason: 'Data tasks on MLX (FREE)' 
  },
  'testing': { 
    model: 'mlx', 
    provider: 'mlx_14b/deepseek-14b',
    reason: 'Test generation on MLX (FREE)' 
  },
  
  // PAID - Kimi-Code (You) - Code specialist (12%)
  'complex_code': { 
    model: 'kimi-code', 
    provider: 'kimi-code-v1',
    reason: 'Complex code needs Kimi-Code (You)' 
  },
  'debugging': { 
    model: 'kimi-code', 
    provider: 'kimi-code-v1',
    reason: 'Debugging needs Kimi-Code (You)' 
  },
  'refactoring': { 
    model: 'kimi-code', 
    provider: 'kimi-code-v1',
    reason: 'Refactoring with Kimi-Code (You)' 
  },
  'architecture': { 
    model: 'kimi-code', 
    provider: 'kimi-code-v1',
    reason: 'Architecture needs Kimi-Code (You)' 
  },
  
  // PAID - Kimi 2.5 - General reasoning (8%)
  'research': { 
    model: 'kimi', 
    provider: 'moonshot/kimi-k2.5',
    reason: 'Research tasks use Kimi 2.5' 
  },
  'planning': { 
    model: 'kimi', 
    provider: 'moonshot/kimi-k2.5',
    reason: 'Strategic planning with Kimi 2.5' 
  },
  'complex_reasoning': { 
    model: 'kimi', 
    provider: 'moonshot/kimi-k2.5',
    reason: 'Deep reasoning needs Kimi 2.5' 
  },
  
  // PAID - Minimax - Image & Chinese (5%)
  'image_generation': {
    model: 'minimax',
    provider: 'minimax/MiniMax-M2.5',
    reason: 'Images use Minimax'
  },
  'chinese_text': {
    model: 'minimax',
    provider: 'minimax/MiniMax-M2.5',
    reason: 'Chinese text uses Minimax'
  },
  'multimodal': {
    model: 'minimax',
    provider: 'minimax/MiniMax-M2.5',
    reason: 'Multimodal tasks use Minimax'
  }
};

// Keywords for routing
const KEYWORDS = {
  mlx: ['simple', 'basic', 'create', 'add', 'implement', 'generate', 'write', 'code', 'function', 'component'],
  kimiCode: ['debug', 'fix', 'error', 'refactor', 'optimize', 'architecture', 'design pattern', 'complex code', 'best practice', 'review'],
  kimi: ['research', 'analyze', 'study', 'plan', 'strategy', 'reasoning', 'complex', 'investigate'],
  minimax: ['image', 'picture', 'photo', 'generate image', 'chinese', '中文', 'multimodal', 'visual']
};

// Cost per task (approximate)
const COSTS = {
  'mlx': 0,
  'kimi-code': 0.02,
  'kimi': 0.02,
  'minimax': 0.015  // Slightly cheaper
};

/**
 * Route a task to the optimal model
 */
function routeTask(taskName, taskDescription = '') {
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  // 1. Check for Minimax keywords (image/Chinese) - 5%
  for (const keyword of KEYWORDS.minimax) {
    if (text.includes(keyword)) {
      return {
        model: 'minimax',
        provider: 'minimax/MiniMax-M2.5',
        name: 'Minimax',
        emoji: '🎭',
        reason: `Contains "${keyword}" - needs Minimax`,
        estimatedCost: COSTS.minimax
      };
    }
  }
  
  // 2. Check for Kimi-Code keywords (code specialist) - 12%
  for (const keyword of KEYWORDS.kimiCode) {
    if (text.includes(keyword)) {
      return {
        model: 'kimi-code',
        provider: 'kimi-code-v1',
        name: 'Kimi-Code (You)',
        emoji: '💻',
        reason: `Contains "${keyword}" - needs code specialist`,
        estimatedCost: COSTS['kimi-code']
      };
    }
  }
  
  // 3. Check for Kimi 2.5 keywords (reasoning) - 8%
  for (const keyword of KEYWORDS.kimi) {
    if (text.includes(keyword)) {
      return {
        model: 'kimi',
        provider: 'moonshot/kimi-k2.5',
        name: 'Kimi 2.5',
        emoji: '🎯',
        reason: `Contains "${keyword}" - needs reasoning`,
        estimatedCost: COSTS.kimi
      };
    }
  }
  
  // 4. Default to MLX (FREE) - 75%
  return {
    model: 'mlx',
    provider: 'mlx_14b/deepseek-14b',
    name: 'MLX (Local)',
    emoji: '🍎',
    reason: 'Standard task - use free MLX',
    estimatedCost: COSTS.mlx
  };
}

/**
 * Calculate potential savings
 */
function calculateSavings(tasks) {
  let counts = { mlx: 0, 'kimi-code': 0, kimi: 0, minimax: 0 };
  
  tasks.forEach(task => {
    const route = routeTask(task.name, task.description);
    counts[route.model]++;
  });
  
  const total = tasks.length || 1;
  
  // Calculate costs
  const mlxCost = counts.mlx * COSTS.mlx;  // = 0
  const kimiCodeCost = counts['kimi-code'] * COSTS['kimi-code'];
  const kimiCost = counts.kimi * COSTS.kimi;
  const minimaxCost = counts.minimax * COSTS.minimax;
  
  const totalCost = mlxCost + kimiCodeCost + kimiCost + minimaxCost;
  
  // Savings vs using only Kimi
  const savings = (counts.mlx * 0.02).toFixed(2);
  
  return {
    mlxTasks: counts.mlx,
    kimiCodeTasks: counts['kimi-code'],
    kimiTasks: counts.kimi,
    minimaxTasks: counts.minimax,
    mlxPercent: Math.round((counts.mlx / total) * 100),
    kimiCodePercent: Math.round((counts['kimi-code'] / total) * 100),
    kimiPercent: Math.round((counts.kimi / total) * 100),
    minimaxPercent: Math.round((counts.minimax / total) * 100),
    totalCost: `$${totalCost.toFixed(2)}`,
    estimatedSavings: `$${savings}`
  };
}

module.exports = { routeTask, calculateSavings, ROUTING_RULES, COSTS };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎯 MLX Cost Router - 4-Tier Optimization');
    console.log('');
    console.log('Usage: node mlx-router.js "task name" "task description"');
    console.log('');
    console.log('Routing Strategy:');
    console.log('  🍎 MLX (75%)        - FREE  - Simple code, generation');
    console.log('  💻 Kimi-Code (12%)   - $0.02 - Complex code, debugging');
    console.log('  🎯 Kimi 2.5 (8%)     - $0.02 - Research, reasoning');
    console.log('  🎭 Minimax (5%)      - $0.015 - Images, Chinese text');
    console.log('');
    console.log('Examples:');
    console.log('  node mlx-router.js "Create login form"');
    console.log('  node mlx-router.js "Debug memory leak"');
    console.log('  node mlx-router.js "Generate hero image"');
    console.log('  node mlx-router.js "Translate to Chinese"');
    process.exit(0);
  }
  
  const taskName = args[0];
  const taskDesc = args[1] || '';
  
  const route = routeTask(taskName, taskDesc);
  
  const costLabel = route.estimatedCost === 0 ? 'FREE 🟢' : `$${route.estimatedCost} 🟡`;
  
  console.log('');
  console.log('🎯 Task Routing');
  console.log('-'.repeat(50));
  console.log(`Task: ${taskName}`);
  console.log(`Model: ${route.emoji} ${route.name}`);
  console.log(`Provider: ${route.provider}`);
  console.log(`Reason: ${route.reason}`);
  console.log(`Est. Cost: ${costLabel}`);
  console.log('');
}
