import React, { useState, useEffect } from 'react';
import { UserPlus, Search, X, CheckSquare, Square, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';
import { userService } from '../../services/userService';

export const AddMembersModal = ({
  isOpen,
  onClose,
  onAddMembers,
  currentMemberIds = [],
  submitting = false,
  errorMessage = null,
}) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  // Fetch active employee accounts
  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setSelectedIds([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchEmployees = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      // Fetch only active employees
      const res = await userService.getUsers({
        role: 'employee',
        status: 'active',
        limit: 100,
      });

      if (res.success && res.data) {
        setEmployees(res.data.users || []);
      }
    } catch (err) {
      setFetchError(err.message || 'Failed to fetch employees list');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filter employees matching search query and not already members
  const filteredEmployees = employees.filter((emp) => {
    const empId = emp._id || emp.id;
    const isAlreadyMember = currentMemberIds.some(
      (mId) => mId?.toString() === empId?.toString()
    );
    if (isAlreadyMember) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q)
    );
  });

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const availableIds = filteredEmployees.map((e) => e._id || e.id);
    const allSelected = availableIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !availableIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...availableIds])]);
    }
  };

  const handleAddSubmit = () => {
    if (selectedIds.length === 0) return;
    onAddMembers(selectedIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
      <div className="bg-white border border-slate-200 rounded-none max-w-lg w-full p-6 space-y-4 shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <h3 className="text-lg font-bold font-montserrat text-slate-900 flex items-center gap-2.5">
            <UserPlus className="w-5 h-5 text-[#0562ff]" /> Add Employees to Group
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Alert */}
        {(errorMessage || fetchError) && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage || fetchError}</span>
          </div>
        )}

        {/* Search & Select Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 text-slate-900 text-xs font-medium rounded-none border border-slate-300 focus:border-[#0562ff] focus:outline-none"
            />
          </div>

          {filteredEmployees.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer whitespace-nowrap"
            >
              Select All
            </button>
          )}
        </div>

        {/* Employees List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-200 min-h-[220px]">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0562ff] mb-2" />
              Loading employee roster...
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium px-4">
              {searchQuery ? 'No employees match your search.' : 'All active employees are already members of this group.'}
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const empId = emp._id || emp.id;
              const isSelected = selectedIds.includes(empId);
              return (
                <div
                  key={empId}
                  onClick={() => toggleSelect(empId)}
                  className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`text-slate-700 cursor-pointer focus:outline-none`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#0562ff]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{emp.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{emp.email}</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 uppercase">
                    Employee
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs">
          <div className="font-bold text-slate-600">
            {selectedIds.length} employee{selectedIds.length !== 1 ? 's' : ''} selected
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddSubmit}
              disabled={selectedIds.length === 0 || submitting}
              className="px-5 py-2 bg-[#0562ff] hover:bg-blue-700 text-white font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Adding...' : `Add Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddMembersModal;
