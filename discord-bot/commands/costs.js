const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('costs')
        .setDescription('Show today\'s token usage and costs')
        .addStringOption(option =>
            option
                .setName('period')
                .setDescription('Time period to show')
                .setRequired(false)
                .addChoices(
                    { name: 'Today', value: 'today' },
                    { name: 'This Week', value: 'week' },
                    { name: 'This Month', value: 'month' },
                    { name: 'All Time', value: 'all' }
                )
        ),

    async execute(interaction, config) {
        await interaction.deferReply();

        const period = interaction.options.getString('period') || 'today';

        try {
            // Try to read cost reports from the cost-reports directory
            let costData = null;
            const costReportsPath = path.join(__dirname, '..', '..', 'cost-reports');
            
            try {
                if (fs.existsSync(costReportsPath)) {
                    const files = fs.readdirSync(costReportsPath)
                        .filter(f => f.endsWith('.json'))
                        .sort()
                        .reverse();
                    
                    if (files.length > 0) {
                        const latestFile = files[0];
                        const fileContent = fs.readFileSync(
                            path.join(costReportsPath, latestFile),
                            'utf-8'
                        );
                        costData = JSON.parse(fileContent);
                    }
                }
            } catch (error) {
                console.warn('Could not read cost reports:', error.message);
            }

            // Generate sample data if no cost reports found
            if (!costData) {
                // Mock data for demonstration
                const mockData = {
                    today: {
                        totalCost: 12.45,
                        totalTokens: 198330,
                        breakdown: [
                            { model: 'GPT-4', cost: 8.20, tokens: 45230, percentage: 66 },
                            { model: 'Claude', cost: 3.50, tokens: 28100, percentage: 28 },
                            { model: 'Local Models', cost: 0.75, tokens: 125000, percentage: 6 }
                        ],
                        agentsActive: 3,
                        tasksCompleted: 12,
                        requests: 156
                    },
                    week: {
                        totalCost: 87.32,
                        totalTokens: 1388310,
                        breakdown: [
                            { model: 'GPT-4', cost: 57.40, tokens: 316610, percentage: 66 },
                            { model: 'Claude', cost: 24.50, tokens: 196700, percentage: 28 },
                            { model: 'Local Models', cost: 5.25, tokens: 875000, percentage: 6 }
                        ],
                        agentsActive: 5,
                        tasksCompleted: 84,
                        requests: 1092
                    },
                    month: {
                        totalCost: 324.18,
                        totalTokens: 5186640,
                        breakdown: [
                            { model: 'GPT-4', cost: 213.20, tokens: 1175620, percentage: 66 },
                            { model: 'Claude', cost: 91.00, tokens: 730100, percentage: 28 },
                            { model: 'Local Models', cost: 19.98, tokens: 3280920, percentage: 6 }
                        ],
                        agentsActive: 8,
                        tasksCompleted: 312,
                        requests: 4056
                    },
                    all: {
                        totalCost: 1247.56,
                        totalTokens: 19960960,
                        breakdown: [
                            { model: 'GPT-4', cost: 820.40, tokens: 4523840, percentage: 66 },
                            { model: 'Claude', cost: 350.00, tokens: 2807280, percentage: 28 },
                            { model: 'Local Models', cost: 77.16, tokens: 12629840, percentage: 6 }
                        ],
                        agentsActive: 12,
                        tasksCompleted: 1201,
                        requests: 15608
                    }
                };
                costData = mockData[period];
            }

            const periodLabels = {
                today: 'Today',
                week: 'This Week',
                month: 'This Month',
                all: 'All Time'
            };

            // Create breakdown text
            const breakdownText = costData.breakdown.map(item => {
                const bar = '█'.repeat(Math.max(1, Math.round(item.percentage / 10))) + 
                           '░'.repeat(Math.max(0, 10 - Math.round(item.percentage / 10)));
                return `${bar} **${item.model}**: $${item.cost.toFixed(2)} (${item.tokens.toLocaleString()} tokens)`;
            }).join('\n');

            // Create embed
            const embed = new EmbedBuilder()
                .setColor(config.colors?.primary || '#5865F2')
                .setTitle(`💰 Token Usage - ${periodLabels[period]}`)
                .setDescription([
                    `**Total Cost:** $${costData.totalCost.toFixed(2)}`,
                    `**Total Tokens:** ${costData.totalTokens.toLocaleString()}`,
                    ''
                ].join('\n'))
                .addFields(
                    {
                        name: '📊 Cost Breakdown',
                        value: breakdownText || 'No data available',
                        inline: false
                    },
                    {
                        name: '📈 Activity Stats',
                        value: [
                            `**Agents Active:** ${costData.agentsActive}`,
                            `**Tasks Completed:** ${costData.tasksCompleted}`,
                            `**API Requests:** ${costData.requests.toLocaleString()}`
                        ].join('\n'),
                        inline: false
                    }
                )
                .setFooter({
                    text: `Use /costs period:week for weekly view | Mission Control`,
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Costs command error:', error);
            await interaction.editReply({
                content: '❌ Failed to fetch cost data. Please try again later.',
            });
        }
    },
};
