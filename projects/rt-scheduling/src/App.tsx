import { useState, useEffect } from 'react';
import { Download, User, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';

// 28-day availability entry: '' | '6' | '18'
type AvailabilityEntry = '' | '6' | '18';

const DAYS = 28;

function App() {
  const [staffName, setStaffName] = useState('');
  const [availability, setAvailability] = useState<AvailabilityEntry[]>(Array(DAYS).fill(''));
  const [startDate, setStartDate] = useState('');

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('rt-availability');
    if (saved) {
      const data = JSON.parse(saved);
      setStaffName(data.name || '');
      setAvailability(data.availability || Array(DAYS).fill(''));
      setStartDate(data.startDate || '');
    }
  }, []);

  // Save on change
  useEffect(() => {
    localStorage.setItem('rt-availability', JSON.stringify({
      name: staffName,
      availability,
      startDate
    }));
  }, [staffName, availability, startDate]);

  const handleCellChange = (index: number, value: string) => {
    // Only allow 6, 18, or empty
    const cleanValue = value.replace(/[^618]/g, '');
    const finalValue = cleanValue === '6' || cleanValue === '18' ? cleanValue : '';
    
    const newAvailability = [...availability];
    newAvailability[index] = finalValue as AvailabilityEntry;
    setAvailability(newAvailability);
  };

  const generateDates = (): string[] => {
    if (!startDate) return Array(DAYS).fill('');
    
    const dates: string[] = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < DAYS; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return dates;
  };

  const exportToExcel = () => {
    const dates = generateDates();
    
    // Create data in your layout format
    const data = [
      ['Staff Name', staffName],
      ['Period Start', startDate],
      [],
      ['Day', 'Date', 'Availability (6 or 18)'],
      ...availability.map((avail, index) => [
        `Day ${index + 1}`,
        dates[index] || '',
        avail || ''
      ])
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // Day
      { wch: 15 }, // Date
      { wch: 25 }  // Availability
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Availability');
    
    // Download
    const fileName = `RT-Availability-${staffName.replace(/\s+/g, '-')}-${startDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const clearAll = () => {
    if (confirm('Clear all availability entries?')) {
      setAvailability(Array(DAYS).fill(''));
    }
  };

  const dates = generateDates();
  const filledCount = availability.filter(a => a !== '').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">RT Availability</h1>
              <p className="text-sm text-blue-100">28-Day Schedule Entry</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Staff Info */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="w-5 h-5" />
            <h2 className="font-semibold">Staff Information</h2>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Period Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">How to Enter Availability</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Enter <strong>6</strong> if available for 6am shift</li>
            <li>• Enter <strong>18</strong> if available for 6pm shift</li>
            <li>• Leave blank if not available</li>
            <li>• Fill all 28 days, then export to Excel</li>
          </ul>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Days Filled</span>
            <span className="text-lg font-semibold text-blue-600">
              {filledCount} / {DAYS}
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(filledCount / DAYS) * 100}%` }}
            />
          </div>
        </div>

        {/* 28-Day Grid */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-semibold text-gray-800 mb-4">28-Day Availability</h2>
          
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            
            {availability.map((avail, index) => (
              <div key={index} className="relative">
                <div className={`
                  border rounded-lg p-2 text-center
                  ${avail === '6' ? 'bg-green-50 border-green-300' : ''}
                  ${avail === '18' ? 'bg-blue-50 border-blue-300' : ''}
                  ${avail === '' ? 'bg-white border-gray-200' : ''}
                `}>
                  <div className="text-xs text-gray-400 mb-1">
                    {dates[index] || `Day ${index + 1}`}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={avail}
                    onChange={(e) => handleCellChange(index, e.target.value)}
                    placeholder="-"
                    maxLength={2}
                    className={`
                      w-full text-center font-bold text-lg
                      bg-transparent border-none outline-none
                      ${avail === '6' ? 'text-green-700' : ''}
                      ${avail === '18' ? 'text-blue-700' : ''}
                      ${avail === '' ? 'text-gray-300' : ''}
                    `}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border border-green-300 rounded" />
            <span>6 (6am shift)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded" />
            <span>18 (6pm shift)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded" />
            <span>Not available</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={exportToExcel}
            disabled={!staffName || !startDate || filledCount === 0}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
          
          <button
            onClick={clearAll}
            className="w-full py-2 px-4 text-gray-500 hover:text-gray-700 text-sm"
          >
            Clear All Entries
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-8">
          Data saves automatically to this device
        </p>
      </main>
    </div>
  );
}

export default App;
