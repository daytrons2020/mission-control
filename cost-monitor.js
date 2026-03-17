#!/usr/bin/env node
/**
 * Cost Monitor - Track and optimize AI usage costs
 * 
 * Goals:
 * 1. Keep dashboard updates FREE (local file reads only)
 * 2. Minimize LLM API calls
 * 3. Alert when approaching budget
 * 4. Auto-switch to MLX when costs spike
 */

const fs = require('fs');
const path = require('path');

const COSTS = {
  mlx: 0,
  'kimi-code': 0.02,
  kimi: 0.02,
  minimax: 0.015,
  nano: 0.005
};

const BUDGETS = {
  daily: 1.00,
  weekly: 7.00,
  monthly: 30.00
};

class CostMonitor {
  constructor() {
    this.dataFile = path.join(__dirname, 'cost-data.json');
    this.data = this.loadData();
  }

  loadData() {
    try {
      return JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
    } catch {
      return {
        daily: {},
        sessions: [],
        totalSpent: 0,
        alerts: []
      };
    }
  }

  saveData() {
    fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2));
  }

  /**
   * Track a new session cost
   */
  trackSession(model, agent, task) {
    const cost = COSTS[model] || 0.02;
    const session = {
      id: `sess_${Date.now()}`,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      model,
      agent,
      task: task.substring(0, 100),
      cost
    };

    this.data.sessions.push(session);
    this.data.totalSpent += cost;

    // Track by day
    const today = session.date;
    if (!this.data.daily[today]) {
      this.data.daily[today] = { cost: 0, sessions: 0 };
    }
    this.data.daily[today].cost += cost;
    this.data.daily[today].sessions++;

    this.saveData();
    this.checkBudget();

    return session;
  }

  /**
   * Get today's cost
   */
  getTodayCost() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.daily[today]?.cost || 0;
  }

  /**
   * Get this week's cost
   */
  getWeekCost() {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return this.data.sessions
      .filter(s => s.timestamp > weekAgo)
      .reduce((sum, s) => sum + s.cost, 0);
  }

  /**
   * Get this month's cost
   */
  getMonthCost() {
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return this.data.sessions
      .filter(s => s.timestamp > monthAgo)
      .reduce((sum, s) => sum + s.cost, 0);
  }

  /**
   * Check budget and alert if needed
   */
  checkBudget() {
    const today = this.getTodayCost();
    const week = this.getWeekCost();
    const month = this.getMonthCost();

    const alerts = [];

    if (today > BUDGETS.daily * 0.8) {
      alerts.push({
        level: 'warning',
        message: `Daily budget 80% used: $${today.toFixed(2)}/$${BUDGETS.daily}`,
        action: 'Switch to MLX for remaining tasks'
      });
    }

    if (today > BUDGETS.daily) {
      alerts.push({
        level: 'critical',
        message: `DAILY BUDGET EXCEEDED: $${today.toFixed(2)}`,
        action: 'STOP all paid API calls immediately'
      });
    }

    if (week > BUDGETS.weekly * 0.9) {
      alerts.push({
        level: 'warning',
        message: `Weekly budget 90% used: $${week.toFixed(2)}/$${BUDGETS.weekly}`,
        action: 'Review usage patterns'
      });
    }

    this.data.alerts = alerts;
    this.saveData();

    return alerts;
  }

  /**
   * Get cost optimization recommendations
   */
  getRecommendations() {
    const today = this.getTodayCost();
    const week = this.getWeekCost();
    const recs = [];

    // Analyze today's usage
    const todaySessions = this.data.sessions.filter(
      s => s.date === new Date().toISOString().split('T')[0]
    );

    const paidSessions = todaySessions.filter(s => s.cost > 0);
    const mlxSessions = todaySessions.filter(s => s.cost === 0);

    const paidRatio = todaySessions.length > 0 
      ? paidSessions.length / todaySessions.length 
      : 0;

    if (paidRatio > 0.3) {
      recs.push({
        type: 'optimize',
        message: `${(paidRatio * 100).toFixed(0)}% tasks using paid models`,
        action: 'Enable MLX-first cascade routing'
      });
    }

    if (today > 0.5) {
      recs.push({
        type: 'budget',
        message: `Daily cost $${today} exceeds $0.50 target`,
        action: 'Review task complexity assignments'
      });
    }

    // Find expensive agents
    const agentCosts = {};
    todaySessions.forEach(s => {
      agentCosts[s.agent] = (agentCosts[s.agent] || 0) + s.cost;
    });

    const expensiveAgent = Object.entries(agentCosts)
      .sort((a, b) => b[1] - a[1])[0];

    if (expensiveAgent && expensiveAgent[1] > 0.1) {
      recs.push({
        type: 'agent',
        message: `${expensiveAgent[0]} cost $${expensiveAgent[1].toFixed(2)} today`,
        action: 'Consider MLX for this agent\'s tasks'
      });
    }

    return recs;
  }

  /**
   * Generate cost report
   */
  generateReport() {
    const today = this.getTodayCost();
    const week = this.getWeekCost();
    const month = this.getMonthCost();
    const alerts = this.checkBudget();
    const recs = this.getRecommendations();

    return {
      timestamp: new Date().toISOString(),
      costs: {
        today: { value: today, budget: BUDGETS.daily, percent: (today / BUDGETS.daily * 100).toFixed(1) },
        week: { value: week, budget: BUDGETS.weekly, percent: (week / BUDGETS.weekly * 100).toFixed(1) },
        month: { value: month, budget: BUDGETS.monthly, percent: (month / BUDGETS.monthly * 100).toFixed(1) },
        total: this.data.totalSpent
      },
      counts: {
        totalSessions: this.data.sessions.length,
        todaySessions: this.data.daily[new Date().toISOString().split('T')[0]]?.sessions || 0
      },
      alerts,
      recommendations: recs,
      status: today > BUDGETS.daily ? 'OVER_BUDGET' : week > BUDGETS.weekly * 0.9 ? 'WARNING' : 'OK'
    };
  }

  /**
   * Print report to console
   */
  printReport() {
    const report = this.generateReport();

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║              💰 COST MONITOR REPORT                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 USAGE:');
    console.log(`  Today:  $${report.costs.today.value.toFixed(2)} / $${report.costs.today.budget} (${report.costs.today.percent}%)`);
    console.log(`  Week:   $${report.costs.week.value.toFixed(2)} / $${report.costs.week.budget} (${report.costs.week.percent}%)`);
    console.log(`  Month:  $${report.costs.month.value.toFixed(2)} / $${report.costs.month.budget} (${report.costs.month.percent}%)`);
    console.log(`  Total:  $${report.costs.total.toFixed(2)}`);

    console.log('\n📝 SESSIONS:');
    console.log(`  Today: ${report.counts.todaySessions} | Total: ${report.counts.totalSessions}`);

    if (report.alerts.length > 0) {
      console.log('\n🚨 ALERTS:');
      report.alerts.forEach(alert => {
        const icon = alert.level === 'critical' ? '🔴' : '🟡';
        console.log(`  ${icon} ${alert.message}`);
        console.log(`     → ${alert.action}`);
      });
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec.message}`);
        console.log(`    → ${rec.action}`);
      });
    }

    console.log('\n📈 STATUS:', report.status);
    console.log('\n✅ Dashboard data updates: FREE (local files)');
    console.log('✅ Only LLM tasks incur costs\n');

    return report;
  }
}

// Demo
if (require.main === module) {
  const monitor = new CostMonitor();
  monitor.printReport();
}

module.exports = CostMonitor;
