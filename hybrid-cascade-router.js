#!/usr/bin/env node
/**
 * Hybrid Cascade Router - Smart Pre-filtering + MLX First
 * 
 * Strategy:
 * 1. Quick keyword check for obvious cases (images → Minimax immediately)
 * 2. Try MLX for everything else (FREE)
 * 3. If MLX struggles, escalate to appropriate model
 */

// Cost per task
const COSTS = {
  mlx: 0,
  'kimi-code': 0.02,
  kimi: 0.02,
  minimax: 0.015
};

// Keywords that indicate a specific model is REQUIRED
// (Skip MLX for these - waste of time)
const REQUIRED_MODELS = {
  minimax: ['image', 'picture', 'photo', 'generate image', 'chinese', '中文', 'multimodal', 'visual', 'diagram'],
};

// Keywords that suggest MLX might struggle
// (MLX will try, but likely escalate)
const MLX_CHALLENGING = {
  'kimi-code': ['debug', 'fix', 'error', 'refactor', 'optimize', 'architecture', 'complex code', 'memory leak'],
  kimi: ['research', 'analyze', 'study', 'plan', 'strategy', 'reasoning', 'investigate', 'market analysis']
};

/**
 * Quick pre-filter - check if a specific model is REQUIRED
 */
function preFilter(taskName, taskDescription) {
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  // Check for Minimax-required tasks (images/Chinese)
  for (const keyword of REQUIRED_MODELS.minimax) {
    if (text.includes(keyword)) {
      return {
        skipMLX: true,
        targetModel: 'minimax',
        targetName: 'Minimax',
        emoji: '🎭',
        reason: `Contains "${keyword}" - Minimax required`,
        cost: COSTS.minimax
      };
    }
  }
  
  // No pre-filter match - MLX should try first
  return { skipMLX: false };
}

/**
 * Predict if MLX will struggle (for reporting only)
 */
function predictMLXDifficulty(taskName, taskDescription) {
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  let difficulty = 'easy';
  let likelyEscalation = null;
  
  // Check for code challenges
  for (const keyword of MLX_CHALLENGING['kimi-code']) {
    if (text.includes(keyword)) {
      difficulty = 'hard';
      likelyEscalation = {
        model: 'kimi-code',
        name: 'Kimi-Code (You)',
        emoji: '💻',
        confidence: 'high'
      };
      break;
    }
  }
  
  // Check for reasoning challenges
  if (!likelyEscalation) {
    for (const keyword of MLX_CHALLENGING.kimi) {
      if (text.includes(keyword)) {
        difficulty = 'medium';
        likelyEscalation = {
          model: 'kimi',
          name: 'Kimi 2.5',
          emoji: '🎯',
          confidence: 'medium'
        };
        break;
      }
    }
  }
  
  return { difficulty, likelyEscalation };
}

/**
 * Main routing function
 */
function routeTaskHybrid(taskName, taskDescription = '') {
  console.log(`\n📝 Task: "${taskName}"`);
  
  // Step 1: Pre-filter (quick keyword check)
  const preFilterResult = preFilter(taskName, taskDescription);
  
  if (preFilterResult.skipMLX) {
    console.log(`   ⚡ Direct routing: ${preFilterResult.emoji} ${preFilterResult.targetName}`);
    console.log(`   Reason: ${preFilterResult.reason}`);
    console.log(`   Cost: $${preFilterResult.cost} (skipped MLX - would fail anyway)`);
    
    return {
      strategy: 'direct',
      model: preFilterResult.targetModel,
      name: preFilterResult.targetName,
      emoji: preFilterResult.emoji,
      cost: preFilterResult.cost,
      reason: preFilterResult.reason,
      triedMLX: false
    };
  }
  
  // Step 2: MLX attempts the task (FREE)
  const prediction = predictMLXDifficulty(taskName, taskDescription);
  
  console.log(`   📊 MLX Difficulty Prediction: ${prediction.difficulty.toUpperCase()}`);
  
  if (prediction.likelyEscalation) {
    console.log(`   💡 Likely needs: ${prediction.likelyEscalation.emoji} ${prediction.likelyEscalation.name}`);
    console.log(`   🔄 Strategy: Try MLX first, escalate if needed`);
  } else {
    console.log(`   ✅ MLX should handle this easily`);
  }
  
  // Simulate MLX attempt
  const mlxSuccess = prediction.difficulty === 'easy';
  
  if (mlxSuccess) {
    console.log(`   ✅ MLX completed successfully (FREE)`);
    return {
      strategy: 'mlx-first',
      model: 'mlx',
      name: 'MLX (Local)',
      emoji: '🍎',
      cost: 0,
      triedMLX: true,
      escalated: false,
      reason: 'MLX handled it'
    };
  } else {
    // MLX would escalate
    const escalation = prediction.likelyEscalation || {
      model: 'kimi-code',
      name: 'Kimi-Code (You)',
      emoji: '💻'
    };
    
    console.log(`   ⚠️  MLX struggled, escalating...`);
    console.log(`   ↳ ${escalation.emoji} ${escalation.name} took over`);
    console.log(`   Cost: $${COSTS[escalation.model]}`);
    
    return {
      strategy: 'mlx-first-escalated',
      model: escalation.model,
      name: escalation.name,
      emoji: escalation.emoji,
      cost: COSTS[escalation.model],
      triedMLX: true,
      escalated: true,
      escalationReason: `MLX couldn't handle ${prediction.difficulty} task`,
      mlxWouldHaveFailed: true
    };
  }
}

/**
 * Demo function
 */
function demo() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Hybrid Cascade Router - Smart Pre-filter + MLX First   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\nRouting Strategy:');
  console.log('  1. Quick keyword check (images → Minimax immediately)');
  console.log('  2. Try MLX for everything else (FREE)');
  console.log('  3. Escalate if MLX struggles\n');
  
  const testTasks = [
    { name: 'Create login button', desc: 'Simple HTML/CSS' },
    { name: 'Debug memory leak', desc: 'Production debugging' },
    { name: 'Generate hero image', desc: 'Website banner' },
    { name: 'Research competitors', desc: 'Market analysis' },
    { name: 'Fix API error', desc: 'Backend debugging' },
    { name: 'Translate to Chinese', desc: 'Localization' },
    { name: 'Add user profile', desc: 'Simple feature' },
    { name: 'Optimize queries', desc: 'Database performance' }
  ];
  
  let stats = {
    direct: 0,
    mlxSuccess: 0,
    escalated: 0,
    totalCost: 0
  };
  
  for (const task of testTasks) {
    const result = routeTaskHybrid(task.name, task.desc);
    stats.totalCost += result.cost;
    
    if (result.strategy === 'direct') stats.direct++;
    else if (result.escalated) stats.escalated++;
    else stats.mlxSuccess++;
    
    console.log(`\n   📦 Result: ${result.emoji} ${result.name} | $${result.cost}`);
    console.log(`   📋 Strategy: ${result.strategy}`);
  }
  
  const totalTasks = testTasks.length;
  const freeTasks = stats.mlxSuccess + (stats.direct * 0); // Direct still costs money
  const freePercent = Math.round((stats.mlxSuccess / totalTasks) * 100);
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      SUMMARY                               ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Direct routing (Minimax): ${stats.direct} tasks                 ║`);
  console.log(`║  MLX Success (FREE):       ${stats.mlxSuccess} tasks (${freePercent}%)          ║`);
  console.log(`║  MLX → Escalated:          ${stats.escalated} tasks              ║`);
  console.log(`╠════════════════════════════════════════════════════════════╣`);
  console.log(`║  Total Cost: $${stats.totalCost.toFixed(2)}                               ║`);
  console.log(`║  Cost per task: $${(stats.totalCost / totalTasks).toFixed(3)}                         ║`);
  console.log(`║  Savings vs all paid: ~${(100 - (stats.totalCost / (totalTasks * 0.02)) * 100).toFixed(0)}%                    ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  console.log('\n💡 Key Insight:');
  console.log('   - Images/Chinese skip MLX (would fail anyway)');
  console.log('   - Simple tasks use MLX (FREE)');
  console.log('   - Complex tasks try MLX first, then escalate');
  console.log('   - Only pay when MLX actually needs help');
}

// Run demo
if (require.main === module) {
  demo();
}

module.exports = { routeTaskHybrid, preFilter, predictMLXDifficulty };
