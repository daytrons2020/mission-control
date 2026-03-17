#!/usr/bin/env node
/**
 * Smart Cascade Router - MLX First, Escalate if Needed
 * 
 * Strategy:
 * 1. Try MLX first (FREE)
 * 2. Analyze MLX response for confidence/quality
 * 3. If MLX struggles → escalate to appropriate paid model
 * 4. Track escalations for cost monitoring
 */

const fetch = require('node-fetch');

// MLX Endpoint
const MLX_ENDPOINT = 'http://127.0.0.1:18888/v1/chat/completions';

// Cost tracking
const COSTS = {
  mlx: 0,           // FREE
  'kimi-code': 0.02,
  kimi: 0.02,
  minimax: 0.015
};

// Escalation keywords - if MLX response contains these, escalate
const ESCALATION_INDICATORS = {
  // MLX is unsure
  lowConfidence: [
    "i'm not sure",
    "i don't know",
    "cannot",
    "unable to",
    "don't have enough",
    "unclear",
    "ambiguous",
    "complex",
    "difficult"
  ],
  
  // Task type indicators in MLX response
  needsCodeSpecialist: [
    "debug",
    "error",
    "bug",
    "fix",
    "refactor",
    "architecture",
    "complex code"
  ],
  
  needsReasoning: [
    "research",
    "analyze",
    "study",
    "investigate",
    "strategy",
    "plan"
  ],
  
  needsImage: [
    "image",
    "picture",
    "photo",
    "visual",
    "generate image"
  ]
};

/**
 * Check if MLX response indicates need for escalation
 */
function analyzeMLXResponse(response, taskType) {
  const text = response.toLowerCase();
  
  // Check for low confidence indicators
  const isUnsure = ESCALATION_INDICATORS.lowConfidence.some(kw => text.includes(kw));
  
  if (!isUnsure) {
    return { shouldEscalate: false, reason: 'MLX confident' };
  }
  
  // Determine which model to escalate to
  if (ESCALATION_INDICATORS.needsCodeSpecialist.some(kw => text.includes(kw)) || 
      taskType.includes('code') || taskType.includes('debug')) {
    return { 
      shouldEscalate: true, 
      targetModel: 'kimi-code',
      targetName: 'Kimi-Code (You)',
      emoji: '💻',
      reason: 'MLX indicates complex code issue'
    };
  }
  
  if (ESCALATION_INDICATORS.needsReasoning.some(kw => text.includes(kw)) ||
      taskType.includes('research') || taskType.includes('analyze')) {
    return { 
      shouldEscalate: true, 
      targetModel: 'kimi',
      targetName: 'Kimi 2.5',
      emoji: '🎯',
      reason: 'MLX indicates need for reasoning'
    };
  }
  
  if (ESCALATION_INDICATORS.needsImage.some(kw => text.includes(kw))) {
    return { 
      shouldEscalate: true, 
      targetModel: 'minimax',
      targetName: 'Minimax',
      emoji: '🎭',
      reason: 'MLX indicates image/multimodal needed'
    };
  }
  
  // Default escalation - try Kimi-Code for general complexity
  return { 
    shouldEscalate: true, 
    targetModel: 'kimi-code',
    targetName: 'Kimi-Code (You)',
    emoji: '💻',
    reason: 'MLX unsure, escalating for quality'
  };
}

/**
 * Try MLX first (FREE)
 */
async function tryMLX(taskName, taskDescription) {
  try {
    const prompt = `Task: ${taskName}
Description: ${taskDescription}

Can you complete this task? If it's too complex or you need specialized capabilities (debugging, images, deep reasoning), say "I need escalation" and explain why.`;

    const response = await fetch(MLX_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mlx-community/Llama-3.2-3B-Instruct',
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Be honest about your limitations.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return { success: false, error: 'MLX request failed', needsEscalation: true };
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Check if MLX explicitly asks for escalation
    if (content.toLowerCase().includes('need escalation') || 
        content.toLowerCase().includes('cannot') ||
        content.toLowerCase().includes("i can't")) {
      return { 
        success: true, 
        content, 
        needsEscalation: true,
        reason: 'MLX requested escalation'
      };
    }
    
    // Analyze response quality
    const analysis = analyzeMLXResponse(content, taskName + ' ' + taskDescription);
    
    return {
      success: true,
      content,
      needsEscalation: analysis.shouldEscalate,
      escalationTarget: analysis.shouldEscalate ? {
        model: analysis.targetModel,
        name: analysis.targetName,
        emoji: analysis.emoji,
        reason: analysis.reason
      } : null,
      cost: 0
    };
    
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      needsEscalation: true,
      reason: 'MLX error'
    };
  }
}

/**
 * Escalate to paid model
 */
async function escalateToModel(taskName, taskDescription, targetModel) {
  // Simulate escalation (in real implementation, would call actual API)
  console.log(`    ↳ Escalating to ${targetModel.name}...`);
  
  return {
    success: true,
    content: `[${targetModel.name} generated response for: ${taskName}]`,
    model: targetModel.model,
    cost: COSTS[targetModel.model]
  };
}

/**
 * Smart Cascade Router - Main Function
 */
async function routeTaskSmart(taskName, taskDescription = '') {
  console.log(`\n📝 Task: "${taskName}"`);
  console.log('   Step 1: Trying MLX (FREE)...');
  
  // Step 1: Try MLX
  const mlxResult = await tryMLX(taskName, taskDescription);
  
  if (!mlxResult.needsEscalation && mlxResult.success) {
    console.log('   ✅ MLX handled it successfully (FREE)');
    return {
      model: 'mlx',
      name: 'MLX (Local)',
      emoji: '🍎',
      cost: 0,
      escalated: false,
      content: mlxResult.content
    };
  }
  
  // Step 2: Escalate if needed
  if (mlxResult.needsEscalation) {
    const target = mlxResult.escalationTarget || {
      model: 'kimi-code',
      name: 'Kimi-Code (You)',
      emoji: '💻'
    };
    
    console.log(`   ⚠️  MLX couldn't handle: ${mlxResult.reason || 'Quality check failed'}`);
    console.log(`   Step 2: Escalating to ${target.emoji} ${target.name}...`);
    
    const escalatedResult = await escalateToModel(taskName, taskDescription, target);
    
    console.log(`   ✅ ${target.name} completed task ($${escalatedResult.cost})`);
    
    return {
      model: target.model,
      name: target.name,
      emoji: target.emoji,
      cost: escalatedResult.cost,
      escalated: true,
      escalationReason: mlxResult.reason || target.reason,
      content: escalatedResult.content
    };
  }
  
  // MLX failed completely
  console.log('   ❌ MLX failed, escalating to Kimi-Code...');
  const fallback = await escalateToModel(taskName, taskDescription, {
    model: 'kimi-code',
    name: 'Kimi-Code (You)',
    emoji: '💻'
  });
  
  return {
    model: 'kimi-code',
    name: 'Kimi-Code (You)',
    emoji: '💻',
    cost: fallback.cost,
    escalated: true,
    escalationReason: 'MLX failure',
    content: fallback.content
  };
}

/**
 * Demo/Test Function
 */
async function demo() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Smart Cascade Router - MLX First, Escalate if Needed   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  const testTasks = [
    { name: 'Create login button', desc: 'Simple HTML button' },
    { name: 'Debug memory leak', desc: 'Complex debugging in production' },
    { name: 'Generate hero image', desc: 'Create website banner image' },
    { name: 'Research market trends', desc: 'Analyze competitor data' },
    { name: 'Optimize database', desc: 'Slow queries need optimization' }
  ];
  
  let totalCost = 0;
  let mlxCount = 0;
  let escalatedCount = 0;
  
  for (const task of testTasks) {
    const result = await routeTaskSmart(task.name, task.desc);
    totalCost += result.cost;
    if (result.escalated) escalatedCount++;
    else mlxCount++;
    
    console.log(`\n   Result: ${result.emoji} ${result.name} | Cost: $${result.cost}`);
    if (result.escalated) {
      console.log(`   Reason: ${result.escalationReason}`);
    }
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                      SUMMARY                               ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  MLX (FREE):     ${mlxCount} tasks                           ║`);
  console.log(`║  Escalated:      ${escalatedCount} tasks ($${totalCost.toFixed(2)})              ║`);
  console.log(`║  Total Cost:     $${totalCost.toFixed(2)}                              ║`);
  console.log(`║  Savings:        ~${((escalatedCount * 0.02 - totalCost) / (escalatedCount * 0.02) * 100).toFixed(0)}% vs all paid          ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Run demo if called directly
if (require.main === module) {
  demo().catch(console.error);
}

module.exports = { routeTaskSmart, tryMLX, analyzeMLXResponse };
