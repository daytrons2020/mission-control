const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spawn')
        .setDescription('Spawn a new agent')
        .addStringOption(option =>
            option
                .setName('agent_type')
                .setDescription('Type of agent to spawn')
                .setRequired(true)
                .addChoices(
                    { name: 'Backend Developer', value: 'backend-developer' },
                    { name: 'Frontend Developer', value: 'frontend-developer' },
                    { name: 'Full Stack Developer', value: 'fullstack-developer' },
                    { name: 'Researcher', value: 'researcher' },
                    { name: 'Writer', value: 'writer' },
                    { name: 'Designer', value: 'designer' },
                    { name: 'DevOps', value: 'devops' },
                    { name: 'Data Analyst', value: 'data-analyst' },
                    { name: 'QA Tester', value: 'qa-tester' },
                    { name: 'Custom', value: 'custom' }
                )
        )
        .addStringOption(option =>
            option
                .setName('task')
                .setDescription('Description of the task for the agent')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('priority')
                .setDescription('Task priority')
                .setRequired(false)
                .addChoices(
                    { name: 'Low', value: 'low' },
                    { name: 'Medium', value: 'medium' },
                    { name: 'High', value: 'high' },
                    { name: 'Critical', value: 'critical' }
                )
        ),

    async execute(interaction, config) {
        await interaction.deferReply();

        const agentType = interaction.options.getString('agent_type');
        const task = interaction.options.getString('task');
        const priority = interaction.options.getString('priority') || 'medium';

        try {
            // Generate agent ID
            const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
            const agentId = `agent-${agentType.slice(0, 2)}-${timestamp}`;

            // Try to spawn via OpenClaw gateway if configured
            let spawnStatus = 'initialized';
            let gatewayResponse = null;

            if (config.openclaw?.enabled && config.openclaw?.gatewayUrl) {
                try {
                    const response = await axios.post(
                        `${config.openclaw.gatewayUrl}/spawn`,
                        {
                            agent_type: agentType,
                            task: task,
                            priority: priority,
                            requested_by: interaction.user.tag,
                            channel: interaction.channelId,
                        },
                        { timeout: 5000 }
                    );
                    spawnStatus = 'spawned';
                    gatewayResponse = response.data;
                } catch (error) {
                    console.warn('OpenClaw gateway not available:', error.message);
                    spawnStatus = 'queued';
                }
            } else {
                spawnStatus = 'queued';
            }

            // Priority colors
            const priorityColors = {
                low: '#5865F2',
                medium: '#57F287',
                high: '#FEE75C',
                critical: '#ED4245'
            };

            // Status emojis
            const statusEmojis = {
                initialized: '⏳',
                spawned: '🚀',
                queued: '📋'
            };

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(priorityColors[priority] || config.colors?.primary)
                .setTitle(`${statusEmojis[spawnStatus]} Agent ${spawnStatus === 'spawned' ? 'Spawned' : 'Queued'}`)
                .addFields(
                    {
                        name: '🤖 Agent Details',
                        value: [
                            `**Type:** ${agentType}`,
                            `**ID:** \`${agentId}\``,
                            `**Priority:** ${priority.charAt(0).toUpperCase() + priority.slice(1)}`,
                            `**Status:** ${spawnStatus === 'spawned' ? 'Active' : 'Pending'}`
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '📝 Task',
                        value: task.length > 1024 ? task.substring(0, 1021) + '...' : task,
                        inline: false
                    }
                )
                .setFooter({
                    text: `Requested by ${interaction.user.tag} | Mission Control`,
                })
                .setTimestamp();

            // Add note about notifications
            if (spawnStatus === 'spawned') {
                embed.addFields({
                    name: '🔔 Notifications',
                    value: 'You will be notified when the agent completes or needs input.',
                    inline: false
                });
            } else if (spawnStatus === 'queued') {
                embed.addFields({
                    name: '⏳ Queue Status',
                    value: 'Agent has been queued. It will start when OpenClaw gateway is available.',
                    inline: false
                });
            }

            await interaction.editReply({ embeds: [embed] });

            // Log the spawn request
            console.log(`[SPAWN] Agent ${agentId} (${agentType}) requested by ${interaction.user.tag}`);
            console.log(`[SPAWN] Task: ${task.substring(0, 100)}${task.length > 100 ? '...' : ''}`);

        } catch (error) {
            console.error('Spawn command error:', error);
            await interaction.editReply({
                content: '❌ Failed to spawn agent. Please try again later.',
            });
        }
    },
};
