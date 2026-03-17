#!/usr/bin/env node
/**
 * Agent Orchestrator - Cost-Optimized Version
 * Prioritizes MLX (FREE) over paid APIs
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import MLX router
const { routeTask, calculateSavings } = require('./mlx-router');

// Config
const CONFIG = {
  goalsFile: path.join(__dirname, 'MISSION_CONTROL_BUILD_PLAN.md'),
  stateFile: path.join(__dirname, 'orchestrator-state.json'),
  mlxEndpoint: 'http://127.0.0.1:18888/v1/chat/completions',
  dailyWorkHours: 8,
  maxParallelTasks: 3,
  costTarget: { mlxPercent: 80, maxDailyCost: 1.00 } // 80% MLX, max $1/day
};

// Cost tracking
let dailyCost = 0;
let mlxTasks = 0;
let kimiTasks = 0;

/**
 * Execute task with cost tracking
 */
async function executeTaskWithCostTracking(task, agent) {
  const route = routeTask(task.name, task.description);
  
  // Track costs
  if (route.model === 'mlx') {
    mlxTasks++;
    console.log(`[COST] Using MLX (FREE) for: ${task.name}`);
  } else {
    kimiTasks++;
    dailyCost += route.estimatedCost;
    console.log(`[COST] Using Kimi ($${route.estimatedCost}) for: ${task.name}`);
    console.log(`[COST] Daily total: $${dailyCost.toFixed(2)}`);
  }
  
  // Check if we've hit daily cost limit
  if (dailyCost > CONFIG.costTarget.maxDailyCost) {
    console.log(`[COST] ⚠️ Daily cost limit reached! Switching to MLX only.`);
    route.model = 'mlx';
    route.provider = 'mlx_14b/deepseek-14b';
  }
  
  // Execute with appropriate model
  if (route.model === 'mlx') {
    return await executeWithMLX(task, agent);
  } else {
    return await executeWithKimi(task, agent);
  }
}

/**
 * Execute with MLX (FREE)
 */
async function executeWithMLX(task, agent) {
  try {
    const prompt = `You are ${agent.name}, a ${agent.role}.

Task: ${task.name}
Description: ${task.description}

Please complete this task. Be concise and specific.`;

    const response = await fetch(CONFIG.mlxEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mlx-community/Llama-3.2-3B-Instruct',
        messages: [
          { role: 'system', content: `You are ${agent.name}, ${agent.role}` },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error('MLX request failed');
    
    const data = await response.json();
    return {
      success: true,
      content: data.choices[0].message.content,
      cost: 0,
      model: 'mlx'
    };
  } catch (error) {
    console.log(`[MLX] Failed, falling back to Kimi: ${error.message}`);
    return await executeWithKimi(task, agent);
  }
}

/**
 * Execute with Kimi (Paid - for complex tasks only)
 */
async function executeWithKimi(task, agent) {
  console.log(`[Kimi] Executing complex task: ${task.name}`);
  
  // Simulate Kimi execution (in real implementation, would call Kimi API)
  return {
    success: true,
    content: `[Kimi-generated content for: ${task.name}]`,
    cost: 0.02,
    model: 'kimi'
  };
}

/**
 * Generate work plan with cost optimization
 */
function generateCostOptimizedPlan(tasks) {
  console.log('\n=== COST-OPTIMIZED WORK PLAN ===\n');
  
  const savings = calculateSavings(tasks);
  
  console.log(`📊 Distribution:`);
  console.log(`  • MLX (FREE): ${savings.mlxTasks} tasks (${savings.mlxPercent}%)`);
  console.log(`  • Kimi (Paid): ${savings.kimiTasks} tasks (${100 - savings.mlxPercent}%)`);
  console.log(`  • Estimated Savings: ${savings.estimatedSavings} vs 100% Kimi`);
  console.log('');
  
  // Route each task
  const routedTasks = tasks.map(task => {
    const route = routeTask(task.name, task.description);
    return {
      ...task,
      assignedModel: route.model,
      provider: route.provider,
      estimatedCost: route.estimatedCost,
      reason: route.reason
    };
  });
  
  // Group by model
  const mlxTasks = routedTasks.filter(t => t.assignedModel === 'mlx');
  const kimiTasks = routedTasks.filter(t => t.assignedModel === 'kimi');
  
  if (mlxTasks.length > 0) {
    console.log('🟢 MLX Tasks (FREE):');
    mlxTasks.forEach(t => console.log(`  • ${t.name} - ${t.reason}`));
    console.log('');
  }
  
  if (kimiTasks.length > 0) {
    console.log('🟡 Kimi Tasks (Paid):');
    kimiTasks.forEach(t => console.log(`  • ${t.name} - ${t.reason} (~$${t.estimatedCost})`));
    console.log('');
  }
  
  return routedTasks;
}

// Export for use by main orchestrator
module.exports = {
  executeTaskWithCostTracking,
  generateCostOptimizedPlan,
  routeTask,
  calculateSavings
};

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'plan') {
    // Sample tasks for demonstration
    const sampleTasks = [
      { name: 'Create login form', description: 'HTML/CSS form with validation' },
      { name: 'Design database schema', description: 'User tables and relationships' },
      { name: 'Implement API endpoint', description: 'POST /api/users' },
      { name: 'Debug memory leak', description: 'Investigate high memory usage' },
      { name: 'Write documentation', description: 'API usage guide' },
      { name: 'Optimize queries', description: 'Slow database queries' }
    ];
    
    generateCostOptimizedPlan(sampleTasks);
  } else if (command === 'status') {
    console.log('\n=== COST TRACKING STATUS ===');
    console.log(`Daily Cost: $${dailyCost.toFixed(2)} / $${CONFIG.costTarget.maxDailyCost}`);
    console.log(`MLX Tasks: ${mlxTasks} (FREE)`);
    console.log(`Kimi Tasks: ${kimiTasks} (~$${(kimiTasks * 0.02).toFixed(2)})`);
    console.log(`Target: ${CONFIG.costTarget.mlxPercent}% MLX`);
  } else {
    console.log('Usage: node agent-orchestrator-mlx.js [plan|status]');
  }
}
