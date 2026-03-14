const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('project')
        .setDescription('Show specific project details from TASKS.md')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Project name (e.g., "Trading System", "RT Scheduling")')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction, config) {
        await interaction.deferReply();

        const projectName = interaction.options.getString('name');

        try {
            // Fetch TASKS.md from GitHub
            const { owner, repo, tasksPath } = config.github;
            const githubToken = process.env.GITHUB_TOKEN;
            
            const headers = {};
            if (githubToken) {
                headers.Authorization = `token ${githubToken}`;
            }

            let tasksContent = '';
            let projectInfo = null;

            try {
                const response = await axios.get(
                    `https://raw.githubusercontent.com/${owner}/${repo}/main/${tasksPath}`,
                    { headers, timeout: 10000 }
                );
                tasksContent = response.data;

                // Parse projects from markdown table
                const tableMatch = tasksContent.match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
                if (tableMatch && tableMatch.length > 2) {
                    for (let i = 2; i < tableMatch.length; i++) {
                        const row = tableMatch[i];
                        const cells = row.split('|').map(c => c.trim()).filter(c => c);
                        if (cells.length >= 4) {
                            const name = cells[0];
                            if (name.toLowerCase().includes(projectName.toLowerCase()) ||
                                projectName.toLowerCase().includes(name.toLowerCase())) {
                                projectInfo = {
                                    name: name,
                                    status: cells[1],
                                    progress: cells[2],
                                    priority: cells[3]
                                };
                                break;
                            }
                        }
                    }
                }

                // Look for detailed section about this project
                let details = [];
                let nextActions = [];
                
                // Try to find a section header matching the project name
                const sectionRegex = new RegExp(`##.*${projectInfo?.name || projectName}.*\\n([^#]*?)(?=##|$)`, 'i');
                const sectionMatch = tasksContent.match(sectionRegex);
                
                if (sectionMatch) {
                    const sectionContent = sectionMatch[1];
                    
                    // Extract bullet points
                    const bulletMatches = sectionContent.match(/[-*]\s*(.+)/g);
                    if (bulletMatches) {
                        details = bulletMatches.slice(0, 8).map(b => b.replace(/^[-*]\s*/, ''));
                    }
                }

                // Look for Next Actions section
                const nextActionsMatch = tasksContent.match(/##\s*Next Actions?\s*\n([^#]*)/i);
                if (nextActionsMatch) {
                    const actionLines = nextActionsMatch[1].match(/\d+\.\s*(.+)/g);
                    if (actionLines) {
                        nextActions = actionLines.slice(0, 5).map(a => a.replace(/^\d+\.\s*/, ''));
                    }
                }

                // If no specific project found, show generic info
                if (!projectInfo) {
                    projectInfo = {
                        name: projectName,
                        status: '🟡 Unknown',
                        progress: 'N/A',
                        priority: 'Unknown'
                    };
                }

                // Determine color based on status
                let color = config.colors?.info || '#5865F2';
                if (projectInfo.status.includes('🟢')) color = config.colors?.success || '#57F287';
                else if (projectInfo.status.includes('🟡')) color = config.colors?.warning || '#FEE75C';
                else if (projectInfo.status.includes('🔴')) color = config.colors?.danger || '#ED4245';

                // Create embed
                const embed = new EmbedBuilder()
                    .setColor(color)
                    .setTitle(`📊 ${projectInfo.name}`)
                    .setDescription([
                        `**Status:** ${projectInfo.status}`,
                        `**Progress:** ${projectInfo.progress}`,
                        `**Priority:** ${projectInfo.priority}`,
                    ].join('\n'));

                // Add recent updates if available
                if (details.length > 0) {
                    embed.addFields({
                        name: '📝 Recent Updates',
                        value: details.map(d => `• ${d}`).join('\n').substring(0, 1024),
                        inline: false
                    });
                }

                // Add next actions if available
                if (nextActions.length > 0) {
                    embed.addFields({
                        name: '🎯 Next Actions',
                        value: nextActions.map((a, i) => `${i + 1}. ${a}`).join('\n').substring(0, 1024),
                        inline: false
                    });
                }

                embed.setFooter({
                    text: `Use /tasks to see all projects | Data from GitHub`,
                });
                embed.setTimestamp();

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.warn('Could not fetch TASKS.md:', error.message);
                await interaction.editReply({
                    content: `❌ Could not fetch project details. Please check that "${projectName}" exists in TASKS.md.`,
                });
            }

        } catch (error) {
            console.error('Project command error:', error);
            await interaction.editReply({
                content: '❌ Failed to fetch project details. Please try again later.',
            });
        }
    },
};
