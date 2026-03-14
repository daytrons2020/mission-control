import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, FileUp, FileDown, Menu, X } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { StaffList } from './components/StaffList';
import { ScheduleBuilder } from './components/ScheduleBuilder';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationDemoPanel } from './components/NotificationDemoPanel';
import { useStaffManagement, useScheduleManagement, useAvailabilityImport, useMetrics } from './hooks/useLocalStorage';
import { notificationService } from './services/notificationService';
import type { ScheduleImport } from './types';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'staff' | 'schedule' | 'import'>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const { staff, addStaff, updateStaff, deleteStaff, toggleStaffActive } = useStaffManagement();
  const { 
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
  } = useScheduleManagement();
  const { availability, importAvailability, getAvailabilityForStaff, getAvailabilityForDate } = useAvailabilityImport();
  const { calculateMetrics } = useMetrics(staff, schedule);

  const metrics = calculateMetrics();

  // Initialize notification service on mount
  useEffect(() => {
    // Polling is started automatically in the service constructor
    // Cleanup on unmount
    return () => {
      notificationService.stopPolling();
    };
  }, []);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: ScheduleImport = JSON.parse(e.target?.result as string);
        
        if (!data.availability || !Array.isArray(data.availability)) {
          throw new Error('Invalid import file format');
        }

        importAvailability(data);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
        setImportError(null);
      } catch (err) {
        setImportError('Failed to import file. Please ensure it is a valid export from the Scheduling app.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportToExcel = async () => {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    // Schedule sheet
    const scheduleSheet = workbook.addWorksheet('Schedule');
    scheduleSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Day', key: 'day', width: 12 },
      { header: 'Shift Type', key: 'shiftType', width: 15 },
      { header: 'Staff Name', key: 'staffName', width: 20 },
      { header: 'Department', key: 'department', width: 15 }
    ];

    const sortedShifts = [...schedule].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedShifts.forEach(shift => {
      const staffMember = staff.find(s => s.id === shift.staffId);
      const date = new Date(shift.date);
      scheduleSheet.addRow({
        date: shift.date,
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        shiftType: shift.shiftType,
        staffName: staffMember?.name || 'Unknown',
        department: shift.department
      });
    });

    // Staff sheet
    const staffSheet = workbook.addWorksheet('Staff');
    staffSheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Role', key: 'role', width: 12 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];

    staff.forEach(s => {
      staffSheet.addRow({
        name: s.name,
        email: s.email,
        role: s.role,
        department: s.department,
        status: s.isActive ? 'Active' : 'Inactive'
      });
    });

    // Availability sheet
    const availabilitySheet = workbook.addWorksheet('Availability');
    availabilitySheet.columns = [
      { header: 'Staff Name', key: 'staffName', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Available', key: 'isAvailable', width: 12 },
      { header: 'Shift Type', key: 'shiftType', width: 12 }
    ];

    availability.forEach(a => {
      const staffMember = staff.find(s => s.id === a.staffId);
      availabilitySheet.addRow({
        staffName: staffMember?.name || 'Unknown',
        date: a.date,
        isAvailable: a.isAvailable ? 'Yes' : 'No',
        shiftType: a.shiftType
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rt-schedule-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            staff={staff} 
            schedule={schedule} 
            metrics={metrics} 
          />
        );
      
      case 'staff':
        return (
          <StaffList
            staff={staff}
            onAddStaff={addStaff}
            onUpdateStaff={updateStaff}
            onDeleteStaff={deleteStaff}
            onToggleActive={toggleStaffActive}
          />
        );
      
      case 'schedule':
        return (
          <ScheduleBuilder
            schedule={schedule}
            staff={staff}
            availability={availability}
            onAddShift={addShift}
            onDeleteShift={deleteShift}
            onClearSchedule={clearSchedule}
          />
        );
      
      case 'import':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Import Availability</h2>
              <p className="text-gray-600 mb-4">
                Import availability data exported from the RT Scheduling app.
              </p>

              {importError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  Import successful!
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FileUp className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-gray-600">Click to select file or drag and drop</span>
                  <span className="text-sm text-gray-400 mt-1">JSON files only</span>
                </label>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Export to Excel</h2>
              <p className="text-gray-600 mb-4">
                Export the current schedule, staff list, and availability to an Excel file.
              </p>

              <button
                onClick={handleExportToExcel}
                className="flex items-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileDown className="w-5 h-5" />
                Download Excel File
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-semibold">RT Admin</h1>
                <p className="text-xs text-blue-100">Management Portal</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors md:hidden"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'staff', label: 'Staff', icon: Users },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'import', label: 'Import/Export', icon: FileUp }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as typeof currentView)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    currentView === item.id ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
              {/* Notification Center */}
              <div className="ml-2 pl-2 border-l border-blue-500">
                <NotificationCenter />
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <nav className="border-t border-blue-500 md:hidden">
            <div className="max-w-6xl mx-auto px-4 py-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'staff', label: 'Staff', icon: Users },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'import', label: 'Import/Export', icon: FileUp }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setCurrentView(item.id as typeof currentView); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentView === item.id ? 'bg-blue-700' : 'hover:bg-blue-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              {/* Mobile Notification Center */}
              <div className="border-t border-blue-500 mt-2 pt-2">
                <div className="px-4 py-2">
                  <NotificationCenter />
                </div>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Notification Demo Panel (Development Only) */}
      {import.meta.env.DEV && <NotificationDemoPanel />}
    </div>
  );
}

export default App;
