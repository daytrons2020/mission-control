# Task Routing Logic - How Jobs Are Assigned

## Overview

The system uses **keyword-based routing** to determine which AI model handles each task. It checks the task name and description for specific keywords, then routes to the appropriate model.

## Routing Priority (Top to Bottom)

```
Task Input (Name + Description)
        ↓
[1] Check for Minimax keywords (image/chinese)
        ↓ Match? → 🎭 Minimax ($0.015)
        ↓ No match
[2] Check for Kimi-Code keywords (debug/fix)
        ↓ Match? → 💻 Kimi-Code (You) ($0.02)
        ↓ No match
[3] Check for Kimi 2.5 keywords (research/plan)
        ↓ Match? → 🎯 Kimi 2.5 ($0.02)
        ↓ No match
[4] Default → 🍎 MLX (FREE)
```

## Keyword Matching

### 🎭 Minimax (Checked FIRST - Priority 1)
**Keywords:** `image`, `picture`, `photo`, `generate image`, `chinese`, `中文`, `multimodal`, `visual`

**Examples that route to Minimax:**
- "Generate hero image for website"
- "Create product photo"
- "Translate to Chinese"
- "中文内容"
- "Visual design"

---

### 💻 Kimi-Code (You) (Checked SECOND - Priority 2)
**Keywords:** `debug`, `fix`, `error`, `refactor`, `optimize`, `architecture`, `design pattern`, `complex code`, `best practice`, `review`

**Examples that route to Kimi-Code:**
- "Debug memory leak"
- "Fix API error"
- "Refactor authentication"
- "Optimize database queries"
- "Design system architecture"
- "Code review for PR"

---

### 🎯 Kimi 2.5 (Checked THIRD - Priority 3)
**Keywords:** `research`, `analyze`, `study`, `plan`, `strategy`, `reasoning`, `complex`, `investigate`

**Examples that route to Kimi 2.5:**
- "Research market trends"
- "Analyze competitor data"
- "Study user behavior"
- "Plan launch strategy"
- "Complex business logic"

---

### 🍎 MLX (DEFAULT - Priority 4)
**Keywords:** `simple`, `basic`, `create`, `add`, `implement`, `generate`, `write`, `code`, `function`, `component`

**Examples that route to MLX:**
- "Create login form"
- "Add user profile page"
- "Implement search feature"
- "Generate API response"
- "Write documentation"

**Also defaults here if NO keywords match:**
- "Update styling"
- "Change button color"
- "Move files"

---

## How It Works (Step by Step)

### Example 1: "Debug memory leak in API"
```
Step 1: Check Minimax keywords
  "debug memory leak in api" contains "debug"? NO
  
Step 2: Check Kimi-Code keywords
  "debug memory leak in api" contains "debug"? YES
  
Result: 💻 Kimi-Code (You) - $0.02
Reason: Contains "debug" - needs code specialist
```

### Example 2: "Generate hero image"
```
Step 1: Check Minimax keywords
  "generate hero image" contains "image"? YES
  
Result: 🎭 Minimax - $0.015
Reason: Contains "image" - needs Minimax
```

### Example 3: "Create login form"
```
Step 1: Check Minimax keywords
  "create login form" - NO MATCH
  
Step 2: Check Kimi-Code keywords
  "create login form" - NO MATCH
  
Step 3: Check Kimi 2.5 keywords
  "create login form" - NO MATCH
  
Step 4: Default to MLX
  "create login form" contains "create"? YES (in MLX list)
  
Result: 🍎 MLX (Local) - FREE
Reason: Standard task - use free MLX
```

### Example 4: "Research competitor pricing"
```
Step 1: Check Minimax keywords - NO
Step 2: Check Kimi-Code keywords - NO
Step 3: Check Kimi 2.5 keywords
  "research competitor pricing" contains "research"? YES
  
Result: 🎯 Kimi 2.5 - $0.02
Reason: Contains "research" - needs reasoning
```

---

## Key Rules

1. **FIRST MATCH WINS** - Once a keyword matches, routing stops
   - "Debug image loading" → 💻 Kimi-Code (not Minimax) because "debug" is checked before "image"

2. **Case Insensitive** - All matching is lowercase
   - "DEBUG", "Debug", "debug" all match

3. **Partial Matches** - Any substring counts
   - "debugging" matches "debug"
   - "optimization" matches "optimize"

4. **Defaults to FREE** - If nothing matches, MLX gets it (costs $0)

---

## Why This Order?

| Priority | Model | Why First? |
|----------|-------|------------|
| 1st | Minimax | Images/Chinese are unique - no other model can do these |
| 2nd | Kimi-Code | Complex code is expensive - we want to catch "debug" early |
| 3rd | Kimi 2.5 | Reasoning tasks are distinct from code |
| 4th | MLX | Catches everything else for FREE |

---

## Code Implementation

```javascript
function routeTask(taskName, taskDescription = '') {
  // Combine name + description, lowercase
  const text = (taskName + ' ' + taskDescription).toLowerCase();
  
  // 1. Check Minimax (images/Chinese)
  if (hasMinimaxKeyword(text)) return minimaxRoute;
  
  // 2. Check Kimi-Code (complex code)
  if (hasKimiCodeKeyword(text)) return kimiCodeRoute;
  
  // 3. Check Kimi 2.5 (reasoning)
  if (hasKimiKeyword(text)) return kimiRoute;
  
  // 4. Default to MLX (FREE)
  return mlxRoute;
}
```

---

## Test Examples

| Task | Routed To | Why |
|------|-----------|-----|
| "Create button" | 🍎 MLX | Simple task |
| "Debug crash" | 💻 Kimi-Code | Contains "debug" |
| "Generate image" | 🎭 Minimax | Contains "image" |
| "Research users" | 🎯 Kimi 2.5 | Contains "research" |
| "Optimize query" | 💻 Kimi-Code | Contains "optimize" |
| "中文翻译" | 🎭 Minimax | Contains "中文" |
| "Fix bug" | 💻 Kimi-Code | Contains "fix" |
| "Plan roadmap" | 🎯 Kimi 2.5 | Contains "plan" |

---

## Manual Override

You can manually specify the model when adding a task:

```javascript
// In agent-orchestrator-mlx.js
const task = {
  name: "Complex debugging",
  description: "Hard bug to fix",
  forceModel: "kimi-code"  // Override routing
};
```

Or via CLI:
```bash
# Force specific model
node agent-orchestrator-mlx.js plan --model mlx
node agent-orchestrator-mlx.js plan --model kimi-code
```
