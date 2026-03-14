# Mission Control Discord Bot

A Discord bot for managing and monitoring automated agent systems through Mission Control.

## Features

- **System Health Monitoring** - Check status of projects, agents, and cron jobs
- **Project Management** - View project details directly from GitHub TASKS.md
- **Agent Spawning** - Spawn new agents on demand
- **Cost Tracking** - Monitor token usage and costs
- **Task Management** - List and track active tasks

## Setup

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name (e.g., "Mission Control")
3. Navigate to the "Bot" tab on the left
4. Click "Add Bot" and confirm
5. Under "Privileged Gateway Intents", enable:
   - **MESSAGE CONTENT INTENT**
   - **SERVER MEMBERS INTENT**
6. Click "Reset Token" and copy the new token (you'll need this)
7. Scroll down and disable "Public Bot" if you want it private

### 2. Invite Bot to Your Server

1. Go to "OAuth2" → "URL Generator" in the left sidebar
2. Under "Scopes", select **bot** and **applications.commands**
3. Under "Bot Permissions", select:
   - Send Messages
   - Read Messages/View Channels
   - Embed Links
   - Use Slash Commands
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

### 3. Configure the Bot

1. Copy `config.json` to `config.local.json` (or use environment variables)
2. Fill in your bot details:

```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_CLIENT_ID_HERE",
  "guildId": "YOUR_GUILD_ID_HERE"
}
```

**Where to find these values:**
- **Token**: From step 1.6 above (keep this secret!)
- **Client ID**: In "General Information" tab, under "Application ID"
- **Guild ID**: In Discord, right-click your server name with Developer Mode enabled

### 4. Install Dependencies

```bash
cd discord-bot
npm install
```

### 5. Deploy Slash Commands

```bash
npm run deploy-commands
```

This registers the slash commands with Discord (only needs to be done once, or when commands change).

### 6. Start the Bot

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Environment Variables (Optional)

Instead of using `config.json`, you can set these environment variables:

```bash
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
GITHUB_TOKEN=your_github_personal_access_token  # Optional, for higher rate limits
OPENCLAW_GATEWAY_URL=http://localhost:8080        # Optional
```

## Slash Commands

### `/status`
Show system health overview including projects, agents, and cron jobs.

**Example Response:**
```
🟢 Mission Control Status

Projects: 7 active
├── Trading System 🟢 Active (35%)
├── RT Scheduling 🟢 Active (35%)
├── Respiratory Education 🟢 Active (45%)
└── ...

Agents: 2 online
├── Discord: ✅ Connected
└── Auto-Updates: ✅ Enabled

Cron Jobs: Enabled
```

### `/project [name]`
Show detailed information about a specific project from TASKS.md.

**Parameters:**
- `name` (required): Project name (e.g., "Trading System", "RT Scheduling")

**Example:** `/project Trading System`

**Example Response:**
```
📊 Trading System
Status: 🟢 Active | Progress: 35% | Priority: High

Recent Updates:
✅ Real data integration guide
✅ Price API + data provider
✅ Combined server implementation
✅ Deployment guide

Next Actions:
1. Test Trading System with real data
2. Deploy backend server
```

### `/spawn [agent_type] [task]`
Spawn a new agent with a specific task.

**Parameters:**
- `agent_type` (required): Type of agent to spawn (e.g., "backend-developer", "frontend-developer", "researcher")
- `task` (required): Description of the task for the agent

**Example:** `/spawn backend-developer "Create API endpoint for user authentication"`

**Example Response:**
```
🤖 Agent Spawned Successfully!

Type: backend-developer
Task: Create API endpoint for user authentication
Agent ID: agent-bd-20240314-001
Status: Initializing...

You'll be notified when the agent completes or needs input.
```

### `/costs`
Show today's token usage and cost breakdown.

**Example Response:**
```
💰 Today's Token Usage

Total Cost: $12.45

Breakdown:
├── GPT-4: $8.20 (45,230 tokens)
├── Claude: $3.50 (28,100 tokens)
└── Local Models: $0.75 (125,000 tokens)

Agents Active: 3
Tasks Completed: 12
```

### `/tasks`
List all active tasks from TASKS.md.

**Example Response:**
```
📋 Active Tasks

High Priority:
├── 🟢 Trading System (35%) - Test with real data
├── 🟢 RT Scheduling (35%) - React UI development
├── 🟢 Respiratory Education (45%) - 4 PPTs + 13 diagrams
└── 🟢 Respiratory Tools (25%) - In progress

Medium Priority:
└── 🟡 Reselling Business (15%) - Planning phase

Low Priority:
├── 🟡 YouTube Empire (10%) - Planning phase
└── 🟡 Kids App (10%) - Planning phase
```

## Troubleshooting

### Commands not appearing?
- Make sure you ran `npm run deploy-commands`
- It can take up to 1 hour for global commands to sync
- For faster testing, use guild-specific commands (set GUILD_ID)

### Bot not responding?
- Check that the token is correct in `config.json`
- Ensure the bot has proper permissions in the server
- Check the console for error messages

### Rate limits?
- The bot implements rate limiting automatically
- For GitHub API, you can add a personal access token to increase limits

## Development

### Project Structure
```
discord-bot/
├── bot.js              # Main bot entry point
├── deploy-commands.js  # Deploy slash commands to Discord
├── config.json         # Configuration file
├── package.json        # Dependencies
├── commands/           # Individual command files
│   ├── status.js
│   ├── project.js
│   ├── spawn.js
│   ├── costs.js
│   └── tasks.js
└── README.md           # This file
```

### Adding New Commands

1. Create a new file in `commands/` directory
2. Export an object with `data` (SlashCommandBuilder) and `execute` function
3. Run `npm run deploy-commands` to register with Discord

Example:
```javascript
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mycommand')
        .setDescription('Description of my command'),
    async execute(interaction) {
        await interaction.reply('Hello!');
    },
};
```

## License

MIT
