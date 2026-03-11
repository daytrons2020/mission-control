# 2nd Brain Module - Integrated

## Overview
Central knowledge hub integrated into Mission Control. Access memories, documents, tasks, and insights.

## Location
`workspace/modules/second-brain/`

## Components

### 1. Memory Browser
- Read from `workspace/memory/`
- Search and filter
- Timeline view

### 2. Document Viewer
- Read context files (AGENTS.md, TOOLS.md, etc.)
- Skills library
- Edit in-place

### 3. Task Dashboard
- Cron job status
- Agent tasks
- Todo items

### 4. Knowledge Graph (Future)
- Visual connections
- Topic clusters

## Data Sources
```typescript
const DATA_SOURCES = {
  memories: 'workspace/memory/*.md',
  documents: 'workspace/*.md',
  skills: 'skills/*/SKILL.md',
  agents: 'agents/*/progress.md',
  tasks: 'cron jobs + agent tasks'
}
```

## Quick Access
- Discord: `/brain` command
- Mission Control: Dashboard widget

## Files
- `dashboard.tsx` - Main 2nd Brain view
- `memory-browser.tsx` - Memory files
- `document-viewer.tsx` - Context files
- `task-list.tsx` - Tasks and jobs
- `search.tsx` - Global search
