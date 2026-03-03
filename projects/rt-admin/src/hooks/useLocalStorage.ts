import { useState, useEffect, useCallback } from 'react';
import type { StaffMember, AvailabilityEntry, ScheduleShift, StaffingMetrics, ScheduleConstraints, BalancerWeights } from '../types';

const STAFF_KEY = 'rt_admin_staff';
const AVAILABILITY_KEY = 'rt_admin_availability';
const SCHEDULE_KEY = 'rt_admin_schedule';
const CONSTRAINTS_KEY = 'rt_admin_constraints';
const WEIGHTS_KEY = 'rt_admin_weights';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export function useStaffManagement() {
  const [staff, setStaff] = useLocalStorage<StaffMember[]>(STAFF_KEY, []);

  const addStaff = useCallback((member: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...member,
      id: crypto.randomUUID()
    };
    setStaff(prev => [...prev, newMember]);
    return newMember;
  }, [setStaff]);

  const updateStaff = useCallback((id: string, updates: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [setStaff]);

  const deleteStaff = useCallback((id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  }, [setStaff]);

  const toggleStaffActive = useCallback((id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  }, [setStaff]);

  return { staff, addStaff, updateStaff, deleteStaff, toggleStaffActive };
}

export function useScheduleManagement() {
  const [schedule, setSchedule] = useLocalStorage<ScheduleShift[]>(SCHEDULE_KEY, []);
  const [constraints, setConstraints] = useLocalStorage<ScheduleConstraints>(CONSTRAINTS_KEY, {
    minStaffPerShift: 2,
    maxConsecutiveDays: 5,
    minRestBetweenShifts: 8,
    weekendRotation: true,
    holidayRotation: false
  });
  const [weights, setWeights] = useLocalStorage<BalancerWeights>(WEIGHTS_KEY, {
    availabilityWeight: 0.4,
    preferenceWeight: 0.3,
    fairnessWeight: 0.2,
    seniorityWeight: 0.1
  });

  const addShift = useCallback((shift: Omit<ScheduleShift, 'id'>) => {
    const newShift: ScheduleShift = {
      ...shift,
      id: crypto.randomUUID()
    };
    setSchedule(prev => [...prev, newShift]);
    return newShift;
  }, [setSchedule]);

  const updateShift = useCallback((id: string, updates: Partial<ScheduleShift>) => {
    setSchedule(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [setSchedule]);

  const deleteShift = useCallback((id: string) => {
    setSchedule(prev => prev.filter(s => s.id !== id));
  }, [setSchedule]);

  const clearSchedule = useCallback(() => {
    setSchedule([]);
  }, [setSchedule]);

  const getShiftsForDate = useCallback((date: string) => {
    return schedule.filter(s => s.date === date);
  }, [schedule]);

  const getShiftsForStaff = useCallback((staffId: string) => {
    return schedule.filter(s => s.staffId === staffId);
  }, [schedule]);

  return {
    schedule,
    constraints,
    weights,
    setConstraints,
    setWeights,
    addShift,
    updateShift,
    deleteShift,
    clearSchedule,
    getShiftsForDate,
    getShiftsForStaff
  };
}

export function useAvailabilityImport() {
  const [availability, setAvailability] = useLocalStorage<AvailabilityEntry[]>(AVAILABILITY_KEY, []);

  const importAvailability = useCallback((data: { availability: AvailabilityEntry[] }) => {
    setAvailability(data.availability);
  }, [setAvailability]);

  const getAvailabilityForStaff = useCallback((staffId: string) => {
    return availability.filter(a => a.staffId === staffId);
  }, [availability]);

  const getAvailabilityForDate = useCallback((date: string) => {
    return availability.filter(a => a.date === date);
  }, [availability]);

  return { availability, importAvailability, getAvailabilityForStaff, getAvailabilityForDate };
}

export function useMetrics(staff: StaffMember[], schedule: ScheduleShift[]) {
  const calculateMetrics = useCallback((): StaffingMetrics => {
    const activeStaff = staff.filter(s => s.isActive);
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const shiftsThisWeek = schedule.filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate >= weekStart && shiftDate < weekEnd;
    });

    const totalRequiredShifts = 21 * (2); // 7 days * 3 shifts * min staff
    const coveragePercentage = Math.min(100, (shiftsThisWeek.length / totalRequiredShifts) * 100);

    return {
      totalStaff: staff.length,
      activeStaff: activeStaff.length,
      shiftsThisWeek: shiftsThisWeek.length,
      coveragePercentage: Math.round(coveragePercentage),
      overtimeHours: 0,
      pendingRequests: 0
    };
  }, [staff, schedule]);

  return { calculateMetrics };
}
