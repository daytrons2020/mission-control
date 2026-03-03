import { useMemo } from 'react';
import { Users, Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import type { StaffMember, ScheduleShift, StaffingMetrics } from '../types';

interface DashboardProps {
  staff: StaffMember[];
  schedule: ScheduleShift[];
  metrics: StaffingMetrics;
}

export function Dashboard({ staff, schedule, metrics }: DashboardProps) {
  const shiftDistribution = useMemo(() => {
    const distribution = { day: 0, evening: 0, night: 0, weekend: 0 };
    schedule.forEach(shift => {
      distribution[shift.shiftType]++;
    });
    return distribution;
  }, [schedule]);

  const staffHours = useMemo(() => {
    const hours: Record<string, number> = {};
    staff.forEach(s => hours[s.id] = 0);
    schedule.forEach(shift => {
      if (hours[shift.staffId] !== undefined) {
        hours[shift.staffId] += 8;
      }
    });
    return hours;
  }, [staff, schedule]);

  const overworkedStaff = useMemo(() => {
    return staff.filter(s => {
      const hours = staffHours[s.id] || 0;
      return hours > s.maxHoursPerWeek;
    });
  }, [staff, staffHours]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalStaff}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{metrics.activeStaff} active</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.shiftsThisWeek}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">shifts scheduled</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Coverage</p>
              <p className="text-2xl font-bold text-gray-800">{metrics.coveragePercentage}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all" 
              style={{ width: `${Math.min(100, metrics.coveragePercentage)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overtime</p>
              <p className="text-2xl font-bold text-gray-800">{overworkedStaff.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">staff over max hours</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Shift Distribution</h3>
          <div className="space-y-3">
            {Object.entries(shiftDistribution).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-gray-600">{type}</span>
                  <span className="font-medium">{count} shifts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${schedule.length > 0 ? (count / schedule.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Staff Hours This Week</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {staff.filter(s => s.isActive).map(s => {
              const hours = staffHours[s.id] || 0;
              const percentage = (hours / s.maxHoursPerWeek) * 100;
              const isOver = hours > s.maxHoursPerWeek;
              
              return (
                <div key={s.id} className="p-2 rounded-lg border">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <span className={isOver ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {hours} / {s.maxHoursPerWeek} hrs
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {overworkedStaff.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Overtime Alerts</span>
          </div>
          <p className="text-sm text-red-600">
            {overworkedStaff.map(s => s.name).join(', ')} {' '}
            {overworkedStaff.length === 1 ? 'is' : 'are'} scheduled over their maximum hours.
          </p>
        </div>
      )}
    </div>
  );
}
