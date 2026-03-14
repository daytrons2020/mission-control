const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
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

if (!TOKEN || TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Error: Bot token not configured!');
    console.error('Please set your bot token in config.json or DISCORD_TOKEN environment variable.');
    process.exit(1);
}

// Create client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Store commands in a collection
client.commands = new Collection();

// Load commands from commands directory
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

console.log(`📁 Loading ${commandFiles.length} commands...`);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
        console.log(`  ✅ Loaded: /${command.data.name}`);
    } else {
        console.log(`  ⚠️  Skipped: ${file} (missing data or execute)`);
    }
}

// Ready event
client.once(Events.ClientReady, () => {
    console.log(`\n🚀 Mission Control Bot is online!`);
    console.log(`   Logged in as: ${client.user.tag}`);
    console.log(`   Client ID: ${client.user.id}`);
    console.log(`   Servers: ${client.guilds.cache.size}`);
    console.log(`\n💡 Use /status, /project, /tasks, /costs, or /spawn commands`);
    console.log('─'.repeat(50));
});

// Handle interactions (slash commands)
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ Command not found: ${interaction.commandName}`);
        return;
    }

    try {
        console.log(`📨 Command received: /${interaction.commandName} from ${interaction.user.tag}`);
        await command.execute(interaction, config);
    } catch (error) {
        console.error(`❌ Error executing /${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: '❌ An error occurred while executing this command. Please try again later.',
            ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// Handle errors
client.on(Events.Error, (error) => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Login to Discord
console.log('🔌 Connecting to Discord...\n');
client.login(TOKEN);
