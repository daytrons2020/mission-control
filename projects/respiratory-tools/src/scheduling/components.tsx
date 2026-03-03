/**
 * Staff Scheduling Components
 * 
 * React components for mobile-first availability submission
 */

import React, { useState, useEffect } from 'react';

// Types
export interface StaffMember {
  id: string;
  name: string;
  role: 'RT' | 'RRT' | 'Lead' | 'Supervisor';
  fte: number;
}

export interface ShiftAvailability {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  date: Date;
  dayShift: boolean;
  eveningShift: boolean;
  nightShift: boolean;
  unavailable: boolean;
}

export interface AvailabilitySubmission {
  staffId: string;
  weekStarting: Date;
  availability: ShiftAvailability[];
  notes: string;
  submittedAt: Date;
}

// Availability Calendar Component
export const AvailabilityCalendar: React.FC<{
  staffId: string;
  onSubmit: (submission: AvailabilitySubmission) => void;
}> = ({ staffId, onSubmit }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [availability, setAvailability] = useState<ShiftAvailability[]>([]);
  const [notes, setNotes] = useState('');

  // Generate week dates
  useEffect(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7); // Monday

    const days: ShiftAvailability[] = [];
    const dayNames: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = 
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      days.push({
        day: dayNames[i],
        date,
        dayShift: false,
        eveningShift: false,
        nightShift: false,
        unavailable: false
      });
    }

    setAvailability(days);
  }, [weekOffset]);

  const toggleShift = (index: number, shift: 'day' | 'evening' | 'night') => {
    setAvailability(prev => {
      const updated = [...prev];
      const day = updated[index];
      
      if (shift === 'day') day.dayShift = !day.dayShift;
      if (shift === 'evening') day.eveningShift = !day.eveningShift;
      if (shift === 'night') day.nightShift = !day.nightShift;
      
      // Clear unavailable if any shift selected
      if (day.dayShift || day.eveningShift || day.nightShift) {
        day.unavailable = false;
      }
      
      return updated;
    });
  };

  const toggleUnavailable = (index: number) => {
    setAvailability(prev => {
      const updated = [...prev];
      const day = updated[index];
      day.unavailable = !day.unavailable;
      
      if (day.unavailable) {
        day.dayShift = false;
        day.eveningShift = false;
        day.nightShift = false;
      }
      
      return updated;
    });
  };

  const handleSubmit = () => {
    const submission: AvailabilitySubmission = {
      staffId,
      weekStarting: availability[0]?.date || new Date(),
      availability,
      notes,
      submittedAt: new Date()
    };
    onSubmit(submission);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="availability-calendar">
      <div className="week-nav">
        <button onClick={() => setWeekOffset(w => w - 1)}>← Prev Week</button>
        <span>Week of {formatDate(availability[0]?.date || new Date())}</span>
        <button onClick={() => setWeekOffset(w => w + 1)}>Next Week →</button>
      </div>

      <div className="days-grid">
        {availability.map((day, index) => (
          <div 
            key={day.day} 
            className={`day-card ${day.unavailable ? 'unavailable' : ''}`}
          >
            <div className="day-header">
              <strong>{day.day}</strong>
              <span>{formatDate(day.date)}</span>
            </div>

            <div className="shift-toggles">
              <button
                className={day.dayShift ? 'active' : ''}
                onClick={() => toggleShift(index, 'day')}
                disabled={day.unavailable}
              >
                Day
              </button>
              <button
                className={day.eveningShift ? 'active' : ''}
                onClick={() => toggleShift(index, 'evening')}
                disabled={day.unavailable}
              >
                Evening
              </button>
              <button
                className={day.nightShift ? 'active' : ''}
                onClick={() => toggleShift(index, 'night')}
                disabled={day.unavailable}
              >
                Night
              </button>
            </div>

            <button
              className={`unavailable-toggle ${day.unavailable ? 'active' : ''}`}
              onClick={() => toggleUnavailable(index)}
            >
              {day.unavailable ? '✓ Unavailable' : 'Mark Unavailable'}
            </button>
          </div>
        ))}
      </div>

      <div className="notes-section">
        <label>Notes:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requests or notes..."
        />
      </div>

      <button className="submit-btn" onClick={handleSubmit}>
        Submit Availability
      </button>
    </div>
  );
};

// Schedule View Component
export const ScheduleView: React.FC<{
  staffId: string;
  assignments: ShiftAssignment[];
}> = ({ staffId, assignments }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getShiftColor = (type: string) => {
    switch (type) {
      case 'day': return '#4CAF50';
      case 'evening': return '#FF9800';
      case 'night': return '#3F51B5';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="schedule-view">
      <div className="view-toggle">
        <button 
          className={viewMode === 'week' ? 'active' : ''}
          onClick={() => setViewMode('week')}
        >
          Week
        </button>
        <button 
          className={viewMode === 'month' ? 'active' : ''}
          onClick={() => setViewMode('month')}
        >
          Month
        </button>
      </div>

      <div className="assignments-list">
        {assignments.length === 0 ? (
          <p className="no-assignments">No shifts scheduled</p>
        ) : (
          assignments.map(assignment => (
            <div 
              key={assignment.id}
              className="assignment-card"
              style={{ borderLeftColor: getShiftColor(assignment.type) }}
            >
              <div className="assignment-date">
                {assignment.date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="assignment-shift">
                <span 
                  className="shift-badge"
                  style={{ backgroundColor: getShiftColor(assignment.type) }}
                >
                  {assignment.type}
                </span>
                <span className="shift-time">
                  {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                </span>
              </div>
              <div className={`assignment-status ${assignment.status}`}>
                {assignment.status}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Shift Assignment type
interface ShiftAssignment {
  id: string;
  date: Date;
  type: 'day' | 'evening' | 'night';
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'swapped' | 'call-off';
}

// Staff Login Component
export const StaffLogin: React.FC<{
  staffList: StaffMember[];
  onLogin: (staff: StaffMember) => void;
}> = ({ staffList, onLogin }) => {
  const [pin, setPin] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const handleLogin = () => {
    // Simple PIN validation - in production, use proper auth
    if (selectedStaff && pin.length >= 4) {
      onLogin(selectedStaff);
    }
  };

  return (
    <div className="staff-login">
      <h2>Staff Login</h2>
      
      <div className="staff-select">
        <label>Select your name:</label>
        <select 
          value={selectedStaff?.id || ''}
          onChange={(e) => {
            const staff = staffList.find(s => s.id === e.target.value);
            setSelectedStaff(staff || null);
          }}
        >
          <option value="">-- Select --</option>
          {staffList.map(staff => (
            <option key={staff.id} value={staff.id}>
              {staff.name} ({staff.role})
            </option>
          ))}
        </select>
      </div>

      <div className="pin-entry">
        <label>Enter PIN:</label>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="####"
        />
      </div>

      <button 
        className="login-btn"
        onClick={handleLogin}
        disabled={!selectedStaff || pin.length < 4}
      >
        Login
      </button>
    </div>
  );
};

// Export all components
export default {
  AvailabilityCalendar,
  ScheduleView,
  StaffLogin
};
