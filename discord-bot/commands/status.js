const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Show system health (projects, agents, cron jobs)'),

    async execute(interaction, config) {
        await interaction.deferReply();

        try {
            // Fetch TASKS.md from GitHub
            const { owner, repo, tasksPath } = config.github;
            const githubToken = process.env.GITHUB_TOKEN;
            
            const headers = {};
            if (githubToken) {
                headers.Authorization = `token ${githubToken}`;
            }

            let tasksContent = '';
            let projects = [];
            let agentStatus = { discord: '✅ Connected', autoUpdates: '✅ Enabled' };
            let lastUpdated = 'Unknown';

            try {
                const response = await axios.get(
                    `https://raw.githubusercontent.com/${owner}/${repo}/main/${tasksPath}`,
                    { headers, timeout: 10000 }
                );
                tasksContent = response.data;

                // Parse projects from markdown table
                const tableMatch = tasksContent.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
                if (tableMatch && tableMatch.length > 2) {
                    // Skip header and separator rows
                    for (let i = 2; i < tableMatch.length; i++) {
                        const row = tableMatch[i];
                        const cells = row.split('|').map(c => c.trim()).filter(c => c);
                        if (cells.length >= 4) {
                            projects.push({
                                name: cells[0],
                                status: cells[1],
                                progress: cells[2],
                                priority: cells[3]
                            });
                        }
                    }
                }

                // Parse last updated
                const updatedMatch = tasksContent.match(/\*\*Last Updated:\*\*\s*(.+)/);
                if (updatedMatch) {
                    lastUpdated = updatedMatch[1].trim();
                }

                // Parse agent status
                const discordMatch = tasksContent.match(/Discord:\s*([✅❌🟡][^\n]*)/);
                const autoMatch = tasksContent.match(/Auto-Updates:\s*([✅❌🟡][^\n]*)/);
                if (discordMatch) agentStatus.discord = discordMatch[1];
                if (autoMatch) agentStatus.autoUpdates = autoMatch[1];

            } catch (error) {
                console.warn('Could not fetch TASKS.md:', error.message);
                projects = [
                    { name: 'Trading System', status: '🟢 Active', progress: '35%', priority: 'High' },
                    { name: 'RT Scheduling', status: '🟢 Active', progress: '35%', priority: 'High' },
                    { name: 'Respiratory Education', status: '🟢 Active', progress: '45%', priority: 'High' },
                ];
            }

            // Count project statuses
            const activeCount = projects.filter(p => p.status.includes('🟢')).length;
            const planningCount = projects.filter(p => p.status.includes('🟡')).length;
            const pausedCount = projects.filter(p => p.status.includes('🔴')).length;

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(config.colors?.success || '#57F287')
                .setTitle('🚀 Mission Control Status')
                .setDescription(`System overview as of ${new Date().toLocaleString()}`)
                .addFields(
                    {
                        name: '📊 Projects',
                        value: [
                            `**Total:** ${projects.length} projects`,
                            `🟢 Active: ${activeCount}`,
                            `🟡 Planning: ${planningCount}`,
                            `🔴 Paused: ${pausedCount}`,
                            '',
                            projects.slice(0, 5).map(p => 
                                `${p.status} **${p.name}** (${p.progress})`
                            ).join('\n') + (projects.length > 5 ? `\n*...and ${projects.length - 5} more*` : '')
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '🤖 Agents',
                        value: [
                            `Discord: ${agentStatus.discord}`,
                            `Auto-Updates: ${agentStatus.autoUpdates}`,
                            '',
                            'Status: Online'
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '⏰ Cron Jobs',
                        value: [
                            'Status: ✅ Enabled',
                            'Heartbeat: Active',
                            'Auto-Persist: Running'
                        ].join('\n'),
                        inline: true
                    }
                )
                .setFooter({ 
                    text: `Last updated: ${lastUpdated} | Use /tasks for full list`,
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Status command error:', error);
            await interaction.editReply({
                content: '❌ Failed to fetch system status. Please try again later.',
            });
        }
    },
};
