#!/usr/bin/env node
/**
 * MLX Cost Router - Routes tasks to optimal model
 * Priority: MLX (FREE) > Kimi-Code (You) > Kimi 2.5
 */

// Task types and their optimal models
const ROUTING_RULES = {
  // FREE - MLX (deepseek-14b) - 80% of tasks
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
  
  // PAID - Kimi-Code (You) - Code specialist (15% of tasks)
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
  
  // PAID - Kimi 2.5 - General reasoning (5% of tasks)
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
  }
};

// Keywords for routing
const KEYWORDS = {
  mlx: ['simple', 'basic', 'create', 'add', 'implement', 'generate', 'write'],
  kimiCode: ['debug', 'fix', 'error', 'refactor', 'optimize', 'architecture', 'design pattern', 'complex code', 'best practice'],
  kimi: ['research', 'analyze', 'study', 'plan', 'strategy', 'reasoning', 'complex']
};

/**
 * Route a task to the optimal model
 */
function routeTask(taskName, taskDescription = '') {
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  // 1. Check for Kimi-Code keywords (code specialist) - 15%
  for (const keyword of KEYWORDS.kimiCode) {
    if (text.includes(keyword)) {
      return {
        model: 'kimi-code',
        provider: 'kimi-code-v1',
        name: 'Kimi-Code (You)',
        emoji: '💻',
        reason: `Contains "${keyword}" - needs code specialist`,
        estimatedCost: 0.02
      };
    }
  }
  
  // 2. Check for Kimi 2.5 keywords (general reasoning) - 5%
  for (const keyword of KEYWORDS.kimi) {
    if (text.includes(keyword)) {
      return {
        model: 'kimi',
        provider: 'moonshot/kimi-k2.5',
        name: 'Kimi 2.5',
        emoji: '🎯',
        reason: `Contains "${keyword}" - needs reasoning`,
        estimatedCost: 0.02
      };
    }
  }
  
  // 3. Default to MLX (FREE) - 80%
  return {
    model: 'mlx',
    provider: 'mlx_14b/deepseek-14b',
    name: 'MLX (Local)',
    emoji: '🍎',
    reason: 'Standard task - use free MLX',
    estimatedCost: 0
  };
}

/**
 * Calculate potential savings
 */
function calculateSavings(tasks) {
  let mlxCount = 0;
  let kimiCodeCount = 0;
  let kimiCount = 0;
  
  tasks.forEach(task => {
    const route = routeTask(task.name, task.description);
    if (route.model === 'mlx') mlxCount++;
    else if (route.model === 'kimi-code') kimiCodeCount++;
    else kimiCount++;
  });
  
  const total = tasks.length || 1;
  const mlxPercent = Math.round((mlxCount / total) * 100);
  const kimiCodePercent = Math.round((kimiCodeCount / total) * 100);
  const kimiPercent = Math.round((kimiCount / total) * 100);
  
  // Cost calculation
  const mlxCost = 0; // FREE
  const kimiCodeCost = kimiCodeCount * 0.02;
  const kimiCost = kimiCount * 0.02;
  const totalCost = kimiCodeCost + kimiCost;
  
  // Savings vs using only Kimi
  const savings = (mlxCount * 0.02).toFixed(2);
  
  return {
    mlxTasks: mlxCount,
    kimiCodeTasks: kimiCodeCount,
    kimiTasks: kimiCount,
    mlxPercent,
    kimiCodePercent,
    kimiPercent,
    totalCost: `$${totalCost.toFixed(2)}`,
    estimatedSavings: `$${savings}`
  };
}

module.exports = { routeTask, calculateSavings, ROUTING_RULES };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎯 MLX Cost Router - 3-Tier Optimization');
    console.log('');
    console.log('Usage: node mlx-router.js "task name" "task description"');
    console.log('');
    console.log('Routing Strategy:');
    console.log('  🍎 MLX (80%) - FREE - Simple code, generation, analysis');
    console.log('  💻 Kimi-Code (15%) - $0.02 - Complex code, debugging, architecture');
    console.log('  🎯 Kimi 2.5 (5%) - $0.02 - Research, planning, reasoning');
    console.log('');
    console.log('Examples:');
    console.log('  node mlx-router.js "Create login form"');
    console.log('  node mlx-router.js "Debug memory leak"');
    console.log('  node mlx-router.js "Research market trends"');
    process.exit(0);
  }
  
  const taskName = args[0];
  const taskDesc = args[1] || '';
  
  const route = routeTask(taskName, taskDesc);
  
  console.log('');
  console.log('🎯 Task Routing');
  console.log('-'.repeat(50));
  console.log(`Task: ${taskName}`);
  console.log(`Model: ${route.emoji} ${route.name}`);
  console.log(`Provider: ${route.provider}`);
  console.log(`Reason: ${route.reason}`);
  console.log(`Est. Cost: ${route.estimatedCost === 0 ? 'FREE 🟢' : '$' + route.estimatedCost + ' 🟡'}`);
  console.log('');
}
