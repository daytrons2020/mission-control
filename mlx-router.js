#!/usr/bin/env node
/**
 * MLX Cost Router - Routes tasks to MLX (free) or Kimi (paid) based on complexity
 */

// Task types and their recommended models
const ROUTING_RULES = {
  // FREE - MLX (deepseek-14b)
  'code_generation': { model: 'mlx', reason: 'Code tasks work well with MLX' },
  'documentation': { model: 'mlx', reason: 'Docs are fine with MLX' },
  'simple_analysis': { model: 'mlx', reason: 'Basic analysis on MLX' },
  'data_processing': { model: 'mlx', reason: 'Data tasks on MLX' },
  'refactoring': { model: 'mlx', reason: 'Refactoring with MLX' },
  'testing': { model: 'mlx', reason: 'Test generation on MLX' },
  
  // PAID - Kimi (for complex tasks only)
  'architecture_design': { model: 'kimi', reason: 'Complex architecture needs Kimi' },
  'debugging': { model: 'kimi', reason: 'Hard bugs need Kimi reasoning' },
  'complex_reasoning': { model: 'kimi', reason: 'Deep reasoning needs Kimi' },
  'research': { model: 'kimi', reason: 'Research tasks use Kimi' },
  'planning': { model: 'kimi', reason: 'Strategic planning with Kimi' },
  'code_review': { model: 'kimi', reason: 'Critical review uses Kimi' }
};

// Keywords that indicate complexity
const COMPLEXITY_KEYWORDS = {
  high: ['architect', 'design pattern', 'scale', 'performance', 'optimize', 'refactor', 'debug', 'fix', 'error', 'complex', 'algorithm'],
  medium: ['implement', 'create', 'build', 'update', 'modify', 'add', 'feature'],
  low: ['document', 'comment', 'format', 'style', 'rename', 'move']
};

/**
 * Route a task to the appropriate model based on content
 */
function routeTask(taskName, taskDescription = '') {
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  // Check for high complexity keywords -> Kimi
  for (const keyword of COMPLEXITY_KEYWORDS.high) {
    if (text.includes(keyword)) {
      return {
        model: 'kimi',
        provider: 'moonshot/kimi-k2.5',
        reason: `Contains "${keyword}" - complex task`,
        estimatedCost: 0.02
      };
    }
  }
  
  // Default to MLX for everything else
  return {
    model: 'mlx',
    provider: 'mlx_14b/deepseek-14b',
    reason: 'Standard task - use free MLX',
    estimatedCost: 0
  };
}

/**
 * Calculate potential savings
 */
function calculateSavings(tasks) {
  let mlxCount = 0;
  let kimiCount = 0;
  
  tasks.forEach(task => {
    const route = routeTask(task.name, task.description);
    if (route.model === 'mlx') mlxCount++;
    else kimiCount++;
  });
  
  const total = tasks.length;
  const mlxPercent = Math.round((mlxCount / total) * 100);
  const estimatedSavings = mlxCount * 0.01; // ~$0.01 per MLX task vs Kimi
  
  return {
    mlxTasks: mlxCount,
    kimiTasks: kimiCount,
    mlxPercent,
    estimatedSavings: `$${estimatedSavings.toFixed(2)}`
  };
}

module.exports = { routeTask, calculateSavings, ROUTING_RULES };

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('MLX Cost Router');
    console.log('Usage: node mlx-router.js "task name" "task description"');
    console.log('');
    console.log('Examples:');
    console.log('  node mlx-router.js "Create login form"');
    console.log('  node mlx-router.js "Design system architecture" "Scale to 1M users"');
    process.exit(0);
  }
  
  const taskName = args[0];
  const taskDesc = args[1] || '';
  
  const route = routeTask(taskName, taskDesc);
  
  console.log('');
  console.log('🎯 Task Routing');
  console.log('-'.repeat(50));
  console.log(`Task: ${taskName}`);
  console.log(`Model: ${route.model.toUpperCase()}`);
  console.log(`Provider: ${route.provider}`);
  console.log(`Reason: ${route.reason}`);
  console.log(`Est. Cost: ${route.estimatedCost === 0 ? 'FREE' : '$' + route.estimatedCost}`);
  console.log('');
}
