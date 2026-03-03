import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, User, AlertCircle, Trash2, Plus } from 'lucide-react';
import type { ScheduleShift, StaffMember, ShiftType } from '../types';

interface ScheduleBuilderProps {
  schedule: ScheduleShift[];
  staff: StaffMember[];
  availability: { staffId: string; date: string; isAvailable: boolean }[];
  onAddShift: (shift: Omit<ScheduleShift, 'id'>) => void;
  onDeleteShift: (id: string) => void;
  onClearSchedule: () => void;
}

const shiftTypeLabels: Record<ShiftType, string> = {
  day: 'Day (7AM-3PM)',
  evening: 'Evening (3PM-11PM)',
  night: 'Night (11PM-7AM)',
  weekend: 'Weekend'
};

export function ScheduleBuilder({ 
  schedule, 
  staff, 
  availability, 
  onAddShift, 
  onDeleteShift, 
  onClearSchedule 
}: ScheduleBuilderProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedShiftType, setSelectedShiftType] = useState<ShiftType>('day');
  const [selectedStaffId, setSelectedStaffId] = useState('');

  const weekStart = startOfWeek(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getShiftsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return schedule.filter(s => s.date === dateStr);
  };

  const getStaffName = (staffId: string) => {
    const member = staff.find(s => s.id === staffId);
    return member?.name || 'Unknown';
  };

  const isStaffAvailable = (staffId: string, date: string) => {
    const entry = availability.find(a => a.staffId === staffId && a.date === date);
    return !entry || entry.isAvailable;
  };

  const handleAddShift = () => {
    if (!selectedStaffId) return;
    
    onAddShift({
      date: selectedDate,
      shiftType: selectedShiftType,
      staffId: selectedStaffId,
      department: staff.find(s => s.id === selectedStaffId)?.department || ''
    });
    
    setShowAddForm(false);
    setSelectedStaffId('');
  };

  const coverageStats = useMemo(() => {
    const totalShifts = schedule.length;
    const totalRequired = 7 * 3 * 2; // 7 days, 3 shifts, 2 staff per shift
    return {
      totalShifts,
      coverage: Math.round((totalShifts / totalRequired) * 100)
    };
  }, [schedule]);

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Schedule Builder</h2>
            <p className="text-sm text-gray-500">
              Week of {format(weekStart, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{coverageStats.coverage}%</div>
              <div className="text-xs text-gray-500">Coverage</div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add Shift
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-800 mb-3">Add Shift</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select
                  value={selectedShiftType}
                  onChange={(e) => setSelectedShiftType(e.target.value as ShiftType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.entries(shiftTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select staff...</option>
                  {staff.filter(s => s.isActive).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {!isStaffAvailable(s.id, selectedDate) && '(Unavailable)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddShift}
                disabled={!selectedStaffId}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Shift
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="divide-y">
        {weekDays.map(day => {
          const dayShifts = getShiftsForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={day.toISOString()} className={`p-4 ${isToday ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-800">
                    {format(day, 'EEEE, MMM d')}
                  </span>
                  {isToday && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Today</span>}
                </div>
                <span className="text-sm text-gray-500">{dayShifts.length} shifts</span>
              </div>

              {dayShifts.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No shifts scheduled</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {dayShifts.map(shift => (
                    <div 
                      key={shift.id} 
                      className="flex items-center gap-2 p-2 bg-white rounded border"
                    >
                      <Clock className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{shiftTypeLabels[shift.shiftType]}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span className="truncate">{getStaffName(shift.staffId)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteShift(shift.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {schedule.length > 0 && (
        <div className="p-4 border-t">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear the entire schedule?')) {
                onClearSchedule();
              }
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Clear Schedule
          </button>
        </div>
      )}
    </div>
  );
}
