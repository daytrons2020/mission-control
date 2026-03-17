/**
 * MLX Smart Router - Hybrid Cascade Strategy
 * 
 * Philosophy: Try MLX first (it's FREE!), only escalate if needed
 * 
 * Strategy:
 * 1. Quick pre-filter: Skip MLX for tasks it definitely can't do (images, Chinese)
 * 2. MLX attempts everything else
 * 3. Analyze MLX response - escalate if confidence is low
 * 4. Track savings vs upfront paid routing
 */

// Model costs per task
const COSTS = {
  mlx: 0,
  'kimi-code': 0.02,
  kimi: 0.02,
  minimax: 0.015
};

// Tasks MLX definitely CANNOT do (skip the attempt)
const MLX_IMPOSSIBLE = {
  minimax: ['image', 'picture', 'photo', 'generate image', 'chinese', '中文', 'multimodal', 'visual', 'create image', 'draw']
};

// Tasks MLX might STRUGGLE with (will try, likely escalate)
const MLX_CHALLENGING = {
  'kimi-code': ['debug', 'fix', 'error', 'refactor', 'optimize', 'architecture', 'complex code', 'memory leak', 'performance'],
  kimi: ['research', 'analyze', 'study', 'plan', 'strategy', 'reasoning', 'investigate', 'market analysis', 'deep dive']
};

/**
 * Analyze task and determine routing strategy
 */
function analyzeTask(taskName, taskDescription = '') {
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  // Check 1: MLX-impossible tasks (skip MLX entirely)
  for (const keyword of MLX_IMPOSSIBLE.minimax) {
    if (text.includes(keyword)) {
      return {
        strategy: 'direct',
        model: 'minimax',
        provider: 'minimax/MiniMax-M2.5',
        name: 'Minimax',
        emoji: '🎭',
        cost: COSTS.minimax,
        reason: `Contains "${keyword}" - MLX can't handle this`,
        skipMLX: true,
        difficulty: 'impossible-for-mlx'
      };
    }
  }
  
  // Check 2: MLX-challenging tasks (will try, likely escalate)
  for (const keyword of MLX_CHALLENGING['kimi-code']) {
    if (text.includes(keyword)) {
      return {
        strategy: 'mlx-with-likely-escalation',
        model: 'mlx',
        provider: 'mlx_14b/deepseek-14b',
        name: 'MLX (Local)',
        emoji: '🍎',
        cost: 0,
        likelyEscalation: {
          model: 'kimi-code',
          name: 'Kimi-Code (You)',
          emoji: '💻',
          cost: COSTS['kimi-code']
        },
        reason: `Complex code task - MLX will try, Kimi-Code on standby`,
        skipMLX: false,
        difficulty: 'hard'
      };
    }
  }
  
  for (const keyword of MLX_CHALLENGING.kimi) {
    if (text.includes(keyword)) {
      return {
        strategy: 'mlx-with-likely-escalation',
        model: 'mlx',
        provider: 'mlx_14b/deepseek-14b',
        name: 'MLX (Local)',
        emoji: '🍎',
        cost: 0,
        likelyEscalation: {
          model: 'kimi',
          name: 'Kimi 2.5',
          emoji: '🎯',
          cost: COSTS.kimi
        },
        reason: `Reasoning task - MLX will try, Kimi on standby`,
        skipMLX: false,
        difficulty: 'medium'
      };
    }
  }
  
  // Default: MLX should handle this easily
  return {
    strategy: 'mlx-first',
    model: 'mlx',
    provider: 'mlx_14b/deepseek-14b',
    name: 'MLX (Local)',
    emoji: '🍎',
    cost: 0,
    reason: 'MLX should handle this easily',
    skipMLX: false,
    difficulty: 'easy'
  };
}

/**
 * Route task using hybrid cascade strategy
 */
function routeTask(taskName, taskDescription = '') {
  const analysis = analyzeTask(taskName, taskDescription);
  
  // Build the route result
  return {
    ...analysis,
    estimatedCost: analysis.cost,
    routing: analysis.skipMLX ? 'direct' : 'cascade',
    steps: analysis.skipMLX 
      ? [`1. Direct → ${analysis.name}`]
      : [
          `1. Try MLX first (FREE)`,
          analysis.likelyEscalation 
            ? `2. If MLX struggles → ${analysis.likelyEscalation.name} ($${analysis.likelyEscalation.cost})`
            : `2. MLX handles it ✓`
        ]
  };
}

/**
 * Calculate potential savings vs old keyword-based routing
 */
function calculateSavings(tasks) {
  // Old keyword-based routing (upfront prediction)
  const oldCosts = tasks.map(t => {
    const oldRoute = oldKeywordRoute(t.name, t.description);
    return oldRoute.cost;
  });
  const oldTotal = oldCosts.reduce((a, b) => a + b, 0);
  
  // New cascade routing (MLX first)
  const newRoutes = tasks.map(t => routeTask(t.name, t.description));
  const newTotal = newRoutes.reduce((sum, r) => {
    // For cascade, we optimistically estimate 50% escalation rate for hard tasks
    if (r.strategy === 'mlx-with-likely-escalation') {
      return sum + (r.likelyEscalation.cost * 0.5); // 50% need escalation
    }
    return sum + r.cost;
  }, 0);
  
  return {
    oldTotal: oldTotal.toFixed(2),
    newTotal: newTotal.toFixed(2),
    savings: (oldTotal - newTotal).toFixed(2),
    percent: ((1 - newTotal/oldTotal) * 100).toFixed(0)
  };
}

/**
 * Legacy keyword-based routing (for comparison)
 */
function oldKeywordRoute(taskName, taskDescription) {
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  const keywords = {
    minimax: ['image', 'picture', 'photo', 'chinese', '中文', 'multimodal', 'visual'],
    'kimi-code': ['debug', 'fix', 'error', 'refactor', 'optimize', 'architecture', 'design pattern', 'complex code'],
    kimi: ['research', 'analyze', 'study', 'plan', 'strategy', 'reasoning', 'complex']
  };
  
  for (const kw of keywords.minimax) if (text.includes(kw)) return { model: 'minimax', cost: 0.015 };
  for (const kw of keywords['kimi-code']) if (text.includes(kw)) return { model: 'kimi-code', cost: 0.02 };
  for (const kw of keywords.kimi) if (text.includes(kw)) return { model: 'kimi', cost: 0.02 };
  
  return { model: 'mlx', cost: 0 };
}

/**
 * Demo function
 */
function demo() {
  const testTasks = [
    { name: 'Create login button', description: 'Simple HTML/CSS component' },
    { name: 'Debug memory leak', description: 'Production debugging needed' },
    { name: 'Generate hero image', description: 'Website banner' },
    { name: 'Research competitors', description: 'Market analysis' },
    { name: 'Add navigation', description: 'Simple menu component' },
    { name: 'Optimize database', description: 'Query performance' },
    { name: 'Translate to Chinese', description: 'Internationalization' },
    { name: 'Fix CSS bug', description: 'Layout issue on mobile' }
  ];
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     MLX Smart Router - Hybrid Cascade Strategy             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('Philosophy: Try MLX first (FREE!), escalate only if needed\n');
  
  testTasks.forEach((task, i) => {
    const result = routeTask(task.name, task.description);
    console.log(`${i+1}. ${task.name}`);
    console.log(`   Strategy: ${result.strategy}`);
    console.log(`   Route: ${result.emoji} ${result.name}`);
    console.log(`   ${result.reason}`);
    if (result.likelyEscalation) {
      console.log(`   Fallback: ${result.likelyEscalation.emoji} ${result.likelyEscalation.name} ($${result.likelyEscalation.cost})`);
    }
    console.log(`   Cost: $${result.estimatedCost}\n`);
  });
  
  const savings = calculateSavings(testTasks);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              OLD vs NEW ROUTING COMPARISON                 ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Keyword-based (old): $${savings.oldTotal}                            ║`);
  console.log(`║  MLX Cascade (new):   $${savings.newTotal}                            ║`);
  console.log(`╠════════════════════════════════════════════════════════════╣`);
  console.log(`║  💰 SAVINGS: $${savings.savings} (${savings.percent}%)                           ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Run demo if called directly
if (require.main === module) {
  demo();
}

module.exports = { routeTask, analyzeTask, calculateSavings };
