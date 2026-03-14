const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load configuration
let config;
try {
    config = require('./config.local.json');
} catch {
    config = require('./config.json');
}

// Override with environment variables if present
const TOKEN = process.env.DISCORD_TOKEN || config.token;
const CLIENT_ID = process.env.CLIENT_ID || config.clientId;
const GUILD_ID = process.env.GUILD_ID || config.guildId;

if (!TOKEN || TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Error: Bot token not configured!');
    console.error('Please set your bot token in config.json or DISCORD_TOKEN environment variable.');
    process.exit(1);
}

if (!CLIENT_ID || CLIENT_ID === 'YOUR_CLIENT_ID_HERE') {
    console.error('❌ Error: Client ID not configured!');
    console.error('Please set your client ID in config.json or CLIENT_ID environment variable.');
    process.exit(1);
}

// Load commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`📁 Loading ${commandFiles.length} commands for deployment...\n`);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        console.log(`  ✅ Queued: /${command.data.name}`);
    } else {
        console.log(`  ⚠️  Skipped: ${file} (missing data or execute)`);
    }
}

// Create REST instance
const rest = new REST({ version: '10' }).setToken(TOKEN);

// Deploy commands
(async () => {
    try {
        console.log(`\n🚀 Deploying ${commands.length} slash commands...`);

        let data;

        if (GUILD_ID && GUILD_ID !== 'YOUR_GUILD_ID_HERE') {
            // Deploy to specific guild (faster, for testing)
            console.log(`   Target: Guild ${GUILD_ID}`);
            data = await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands },
            );
        } else {
            // Deploy globally (takes up to 1 hour to propagate)
            console.log('   Target: Global (all servers)');
            data = await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: commands },
            );
        }

        console.log(`\n✅ Successfully deployed ${data.length} commands!`);
        console.log('\n📋 Deployed commands:');
        data.forEach(cmd => {
            console.log(`   /${cmd.name} - ${cmd.description}`);
        });
        console.log('\n💡 Commands should appear in Discord within a few minutes.');
        if (!GUILD_ID || GUILD_ID === 'YOUR_GUILD_ID_HERE') {
            console.log('   (Global commands may take up to 1 hour to fully propagate)');
        }
    } catch (error) {
        console.error('\n❌ Error deploying commands:', error);
        process.exit(1);
    }
})();
