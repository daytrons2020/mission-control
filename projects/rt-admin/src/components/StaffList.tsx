import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, User, Mail, Briefcase, ToggleRight, ToggleLeft } from 'lucide-react';
import type { StaffMember } from '../types';

interface StaffListProps {
  staff: StaffMember[];
  onAddStaff: (staff: Omit<StaffMember, 'id'>) => void;
  onUpdateStaff: (id: string, updates: Partial<StaffMember>) => void;
  onDeleteStaff: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function StaffList({ staff, onAddStaff, onUpdateStaff, onDeleteStaff, onToggleActive }: StaffListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const staffData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as StaffMember['role'],
      department: formData.get('department') as string,
      hireDate: formData.get('hireDate') as string,
      maxHoursPerWeek: parseInt(formData.get('maxHoursPerWeek') as string, 10),
      preferredShifts: (formData.getAll('preferredShifts') as string[]),
      unavailableDays: [],
      isActive: true
    };

    if (editingStaff) {
      onUpdateStaff(editingStaff.id, staffData);
      setEditingStaff(null);
    } else {
      onAddStaff(staffData);
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Staff Roster</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {(showAddForm || editingStaff) && (
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">
            {editingStaff ? 'Edit Staff' : 'Add New Staff'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  defaultValue={editingStaff?.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingStaff?.email}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={editingStaff?.role || 'RT'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RT">RT</option>
                  <option value="Lead">Lead</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  name="department"
                  defaultValue={editingStaff?.department}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                <input
                  name="hireDate"
                  type="date"
                  defaultValue={editingStaff?.hireDate}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Hours/Week</label>
                <input
                  name="maxHoursPerWeek"
                  type="number"
                  defaultValue={editingStaff?.maxHoursPerWeek || 40}
                  min="1"
                  max="80"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Shifts</label>
              <div className="flex gap-3">
                {['day', 'evening', 'night', 'weekend'].map(shift => (
                  <label key={shift} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="preferredShifts"
                      value={shift}
                      defaultChecked={editingStaff?.preferredShifts.includes(shift)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{shift}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingStaff ? 'Update' : 'Add'} Staff
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingStaff(null);
                }}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="max-h-96 overflow-y-auto">
        {filteredStaff.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No staff members found.</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredStaff.map(member => (
              <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <User className={`w-5 h-5 ${member.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{member.name}</span>
                        {!member.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Inactive</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Briefcase className="w-3 h-3" />
                        {member.role} • {member.department}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleActive(member.id)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title={member.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {member.isActive 
                        ? <ToggleRight className="w-5 h-5 text-green-600" /> 
                        : <ToggleLeft className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                    <button
                      onClick={() => setEditingStaff(member)}
                      className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this staff member?')) {
                          onDeleteStaff(member.id);
                        }
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
