const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tasks')
        .setDescription('List all active tasks from TASKS.md')
        .addStringOption(option =>
            option
                .setName('filter')
                .setDescription('Filter tasks by status or priority')
                .setRequired(false)
                .addChoices(
                    { name: 'Active Only', value: 'active' },
                    { name: 'Planning Phase', value: 'planning' },
                    { name: 'High Priority', value: 'high' },
                    { name: 'All Tasks', value: 'all' }
                )
        ),

    async execute(interaction, config) {
        await interaction.deferReply();

        const filter = interaction.options.getString('filter') || 'all';

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
            let nextActions = [];

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
                            projects.push({
                                name: cells[0],
                                status: cells[1],
                                progress: cells[2],
                                priority: cells[3]
                            });
                        }
                    }
                }

                // Parse next actions
                const nextActionsMatch = tasksContent.match(/##\s*Next Actions?\s*\n([^#]*)/i);
                if (nextActionsMatch) {
                    const actionLines = nextActionsMatch[1].match(/\d+\.\s*(.+)/g);
                    if (actionLines) {
                        nextActions = actionLines.map(a => ({
                            num: a.match(/^\d+/)[0],
                            text: a.replace(/^\d+\.\s*/, '')
                        }));
                    }
                }

            } catch (error) {
                console.warn('Could not fetch TASKS.md:', error.message);
                // Fallback data
                projects = [
                    { name: 'Trading System', status: '🟢 Active', progress: '35%', priority: 'High' },
                    { name: 'RT Scheduling', status: '🟢 Active', progress: '35%', priority: 'High' },
                    { name: 'Respiratory Education', status: '🟢 Active', progress: '45%', priority: 'High' },
                    { name: 'Respiratory Tools', status: '🟢 Active', progress: '25%', priority: 'High' },
                    { name: 'Reselling Business', status: '🟡 Planning', progress: '15%', priority: 'Medium' },
                    { name: 'YouTube Empire', status: '🟡 Planning', progress: '10%', priority: 'Low' },
                    { name: 'Kids App', status: '🟡 Planning', progress: '10%', priority: 'Low' },
                ];
            }

            // Apply filters
            let filteredProjects = projects;
            if (filter === 'active') {
                filteredProjects = projects.filter(p => p.status.includes('🟢'));
            } else if (filter === 'planning') {
                filteredProjects = projects.filter(p => p.status.includes('🟡'));
            } else if (filter === 'high') {
                filteredProjects = projects.filter(p => p.priority.toLowerCase() === 'high');
            }

            // Group by priority
            const highPriority = filteredProjects.filter(p => p.priority.toLowerCase() === 'high');
            const mediumPriority = filteredProjects.filter(p => p.priority.toLowerCase() === 'medium');
            const lowPriority = filteredProjects.filter(p => p.priority.toLowerCase() === 'low');

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(config.colors?.primary || '#5865F2')
                .setTitle('📋 Active Tasks')
                .setDescription(`Showing ${filteredProjects.length} of ${projects.length} projects`);

            // Add high priority field
            if (highPriority.length > 0) {
                embed.addFields({
                    name: '🔴 High Priority',
                    value: highPriority.map(p => 
                        `${p.status} **${p.name}** (${p.progress})`
                    ).join('\n').substring(0, 1024) || 'None',
                    inline: false
                });
            }

            // Add medium priority field
            if (mediumPriority.length > 0) {
                embed.addFields({
                    name: '🟡 Medium Priority',
                    value: mediumPriority.map(p => 
                        `${p.status} **${p.name}** (${p.progress})`
                    ).join('\n').substring(0, 1024) || 'None',
                    inline: false
                });
            }

            // Add low priority field
            if (lowPriority.length > 0) {
                embed.addFields({
                    name: '🟢 Low Priority',
                    value: lowPriority.map(p => 
                        `${p.status} **${p.name}** (${p.progress})`
                    ).join('\n').substring(0, 1024) || 'None',
                    inline: false
                });
            }

            // Add next actions if available and showing all or active
            if (nextActions.length > 0 && (filter === 'all' || filter === 'active')) {
                embed.addFields({
                    name: '🎯 Next Actions',
                    value: nextActions.slice(0, 5).map(a => `${a.num}. ${a.text}`).join('\n').substring(0, 1024),
                    inline: false
                });
            }

            // Add summary
            const activeCount = projects.filter(p => p.status.includes('🟢')).length;
            const planningCount = projects.filter(p => p.status.includes('🟡')).length;
            
            embed.addFields({
                name: '📊 Summary',
                value: [
                    `**Active:** ${activeCount} | **Planning:** ${planningCount} | **Total:** ${projects.length}`,
                    `Filter: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`
                ].join('\n'),
                inline: false
            });

            embed.setFooter({
                text: 'Use /project [name] for details | Data from GitHub TASKS.md',
            });
            embed.setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Tasks command error:', error);
            await interaction.editReply({
                content: '❌ Failed to fetch tasks. Please try again later.',
            });
        }
    },
};
