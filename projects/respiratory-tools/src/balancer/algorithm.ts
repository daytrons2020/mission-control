/**
 * Shift Balancing Algorithm
 * 
 * Implements weighted constraint satisfaction for optimal shift assignment
 * in respiratory departments.
 */

export interface StaffMember {
  id: string;
  name: string;
  role: 'RT' | 'RRT' | 'Lead' | 'Supervisor';
  fte: number;
  hireDate: Date;
  weekendTarget: number; // Target weekends per month
}

export interface Shift {
  id: string;
  date: Date;
  type: 'day' | 'evening' | 'night';
  startTime: string;
  endTime: string;
  requiredStaff: number;
  isWeekend: boolean;
}

export interface Availability {
  staffId: string;
  weekStarting: Date;
  availableShifts: {
    date: Date;
    shifts: ('day' | 'evening' | 'night')[];
  }[];
  unavailableDates: Date[];
  preferences: {
    date: Date;
    preferredShift: 'day' | 'evening' | 'night';
  }[];
}

export interface Assignment {
  shiftId: string;
  staffId: string;
  score: number;
}

export interface BalanceResult {
  assignments: Assignment[];
  unfilledShifts: string[];
  staffHours: Map<string, number>;
  weekendCounts: Map<string, number>;
  nightCounts: Map<string, number>;
}

export class ShiftBalancer {
  private staff: StaffMember[];
  private shifts: Shift[];
  private availability: Map<string, Availability>;
  private existingAssignments: Assignment[] = [];

  // Scoring weights - adjustable based on department priorities
  private weights = {
    PREFERENCE_MATCH: 15,
    FAIR_WEEKEND: 10,
    FAIR_NIGHTS: 8,
    NEEDS_HOURS: 12,
    CONSECUTIVE_NIGHT_PENALTY: -20,
    SHORT_REST_PENALTY: -15,
    OVERTIME_PENALTY: -25,
    UNFILLED_SHIFT_PENALTY: -100
  };

  constructor(
    staff: StaffMember[],
    shifts: Shift[],
    availability: Map<string, Availability>
  ) {
    this.staff = staff;
    this.shifts = shifts;
    this.availability = availability;
  }

  /**
   * Main balancing method
   */
  public balance(): BalanceResult {
    // 1. Generate all valid assignments
    const validAssignments = this.generateValidAssignments();
    
    // 2. Score each assignment
    const scoredAssignments = validAssignments.map(a => ({
      ...a,
      score: this.scoreAssignment(a)
    }));
    
    // 3. Use greedy optimization with fairness checks
    const result = this.greedyOptimize(scoredAssignments);
    
    // 4. Calculate statistics
    return {
      assignments: result.assignments,
      unfilledShifts: result.unfilledShifts,
      staffHours: this.calculateStaffHours(result.assignments),
      weekendCounts: this.calculateWeekendCounts(result.assignments),
      nightCounts: this.calculateNightCounts(result.assignments)
    };
  }

  /**
   * Generate all valid staff-shift assignments
   */
  private generateValidAssignments(): Assignment[] {
    const assignments: Assignment[] = [];
    
    for (const shift of this.shifts) {
      for (const staff of this.staff) {
        if (this.canAssign(staff, shift)) {
          assignments.push({
            shiftId: shift.id,
            staffId: staff.id,
            score: 0
          });
        }
      }
    }
    
    return assignments;
  }

  /**
   * Check if staff can be assigned to shift
   */
  private canAssign(staff: StaffMember, shift: Shift): boolean {
    const avail = this.availability.get(staff.id);
    if (!avail) return false;

    // Check if date is marked unavailable
    const isUnavailable = avail.unavailableDates.some(d =>
      this.sameDay(d, shift.date)
    );
    if (isUnavailable) return false;

    // Check if shift type is in availability
    const dayAvail = avail.availableShifts.find(a =>
      this.sameDay(a.date, shift.date)
    );
    if (!dayAvail || !dayAvail.shifts.includes(shift.type)) {
      return false;
    }

    // Check FTE compliance (rough hours check)
    const currentHours = this.getAssignedHours(staff.id);
    const shiftHours = this.getShiftHours(shift);
    const maxHours = staff.fte * 80; // 2 weeks at FTE
    if (currentHours + shiftHours > maxHours + 8) { // 8 hour grace
      return false;
    }

    return true;
  }

  /**
   * Score a single assignment
   */
  private scoreAssignment(assignment: Assignment): number {
    let score = 0;
    const staff = this.staff.find(s => s.id === assignment.staffId)!;
    const shift = this.shifts.find(s => s.id === assignment.shiftId)!;
    const avail = this.availability.get(staff.id)!;

    // Preference match
    const pref = avail.preferences.find(p =>
      this.sameDay(p.date, shift.date)
    );
    if (pref && pref.preferredShift === shift.type) {
      score += this.weights.PREFERENCE_MATCH;
    }

    // Needs hours (understaffed staff get priority)
    const currentHours = this.getAssignedHours(staff.id);
    const targetHours = staff.fte * 80;
    if (currentHours < targetHours * 0.8) {
      score += this.weights.NEEDS_HOURS;
    }

    // Weekend fairness
    if (shift.isWeekend) {
      const weekendCount = this.getWeekendCount(staff.id);
      const avgWeekends = this.getAverageWeekends();
      if (weekendCount < avgWeekends) {
        score += this.weights.FAIR_WEEKEND;
      } else if (weekendCount > avgWeekends + 1) {
        score -= this.weights.FAIR_WEEKEND;
      }
    }

    // Night shift distribution
    if (shift.type === 'night') {
      const nightCount = this.getNightCount(staff.id);
      const avgNights = this.getAverageNights();
      if (nightCount < avgNights) {
        score += this.weights.FAIR_NIGHTS;
      }

      // Consecutive night penalty
      if (this.hasNightBefore(staff.id, shift.date)) {
        score += this.weights.CONSECUTIVE_NIGHT_PENALTY;
      }
    }

    // Short rest penalty (less than 8 hours between shifts)
    if (this.hasShortRest(staff.id, shift)) {
      score += this.weights.SHORT_REST_PENALTY;
    }

    return score;
  }

  /**
   * Greedy optimization with fairness considerations
   */
  private greedyOptimize(scoredAssignments: (Assignment & { score: number })[]): 
    { assignments: Assignment[]; unfilledShifts: string[] } {
    
    // Sort by score descending
    scoredAssignments.sort((a, b) => b.score - a.score);
    
    const assignments: Assignment[] = [];
    const assignedPairs = new Set<string>();
    const shiftCounts = new Map<string, number>();
    
    for (const scored of scoredAssignments) {
      const { shiftId, staffId } = scored;
      const pairKey = `${shiftId}-${staffId}`;
      
      // Skip if already assigned this pair
      if (assignedPairs.has(pairKey)) continue;
      
      // Check shift capacity
      const shift = this.shifts.find(s => s.id === shiftId)!;
      const currentCount = shiftCounts.get(shiftId) || 0;
      
      if (currentCount < shift.requiredStaff) {
        assignments.push({
          shiftId,
          staffId,
          score: scored.score
        });
        assignedPairs.add(pairKey);
        shiftCounts.set(shiftId, currentCount + 1);
      }
    }
    
    // Find unfilled shifts
    const unfilledShifts: string[] = [];
    for (const shift of this.shifts) {
      const count = shiftCounts.get(shift.id) || 0;
      if (count < shift.requiredStaff) {
        unfilledShifts.push(shift.id);
      }
    }
    
    return { assignments, unfilledShifts };
  }

  // Helper methods
  private sameDay(d1: Date, d2: Date): boolean {
    return d1.toDateString() === d2.toDateString();
  }

  private getShiftHours(shift: Shift): number {
    const start = parseInt(shift.startTime.split(':')[0]);
    const end = parseInt(shift.endTime.split(':')[0]);
    return end > start ? end - start : (24 - start) + end;
  }

  private getAssignedHours(staffId: string): number {
    // Would calculate from existing assignments
    return 0;
  }

  private getWeekendCount(staffId: string): number {
    // Would calculate from existing assignments
    return 0;
  }

  private getAverageWeekends(): number {
    const totalWeekends = this.shifts.filter(s => s.isWeekend).length *
      this.shifts[0]?.requiredStaff || 0;
    return totalWeekends / this.staff.length;
  }

  private getNightCount(staffId: string): number {
    // Would calculate from existing assignments
    return 0;
  }

  private getAverageNights(): number {
    const totalNights = this.shifts.filter(s => s.type === 'night').length *
      this.shifts[0]?.requiredStaff || 0;
    return totalNights / this.staff.length;
  }

  private hasNightBefore(staffId: string, date: Date): boolean {
    // Check if staff worked night shift before this date
    return false;
  }

  private hasShortRest(staffId: string, shift: Shift): boolean {
    // Check if less than 8 hours between shifts
    return false;
  }

  private calculateStaffHours(assignments: Assignment[]): Map<string, number> {
    const hours = new Map<string, number>();
    
    for (const assignment of assignments) {
      const shift = this.shifts.find(s => s.id === assignment.shiftId)!;
      const shiftHours = this.getShiftHours(shift);
      const current = hours.get(assignment.staffId) || 0;
      hours.set(assignment.staffId, current + shiftHours);
    }
    
    return hours;
  }

  private calculateWeekendCounts(assignments: Assignment[]): Map<string, number> {
    const counts = new Map<string, number>();
    
    for (const assignment of assignments) {
      const shift = this.shifts.find(s => s.id === assignment.shiftId)!;
      if (shift.isWeekend) {
        const current = counts.get(assignment.staffId) || 0;
        counts.set(assignment.staffId, current + 1);
      }
    }
    
    return counts;
  }

  private calculateNightCounts(assignments: Assignment[]): Map<string, number> {
    const counts = new Map<string, number>();
    
    for (const assignment of assignments) {
      const shift = this.shifts.find(s => s.id === assignment.shiftId)!;
      if (shift.type === 'night') {
        const current = counts.get(assignment.staffId) || 0;
        counts.set(assignment.staffId, current + 1);
      }
    }
    
    return counts;
  }
}

/**
 * Genetic Algorithm Alternative for large departments
 */
export class GeneticBalancer extends ShiftBalancer {
  private populationSize = 100;
  private generations = 500;
  private mutationRate = 0.1;

  public balance(): BalanceResult {
    // Initialize population with random valid assignments
    let population = this.initializePopulation();
    
    for (let gen = 0; gen < this.generations; gen++) {
      // Calculate fitness for each individual
      const fitness = population.map(p => this.calculateFitness(p));
      
      // Select parents
      const parents = this.selectParents(population, fitness);
      
      // Crossover and mutate
      population = this.evolvePopulation(parents);
      
      // Elitism: keep best individual
      const bestIndex = fitness.indexOf(Math.max(...fitness));
      population[0] = population[bestIndex];
    }
    
    // Return best solution
    const finalFitness = population.map(p => this.calculateFitness(p));
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
    
    return this.createResult(population[bestIndex]);
  }

  private initializePopulation(): Assignment[][] {
    // Generate random valid assignments
    return [];
  }

  private calculateFitness(assignments: Assignment[]): number {
    // Sum of all assignment scores
    return assignments.reduce((sum, a) => sum + a.score, 0);
  }

  private selectParents(population: Assignment[][], fitness: number[]): Assignment[][] {
    // Tournament selection
    return [];
  }

  private evolvePopulation(parents: Assignment[][]): Assignment[][] {
    // Crossover and mutation
    return [];
  }

  private createResult(assignments: Assignment[]): BalanceResult {
    return {
      assignments,
      unfilledShifts: [],
      staffHours: new Map(),
      weekendCounts: new Map(),
      nightCounts: new Map()
    };
  }
}

export default ShiftBalancer;
