import React from 'react';
import UserManagement from '../../components/admin/UserManagement';

export const AdminEmployeesPage = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 sm:p-6 md:p-8 font-sans selection:bg-[#0562ff] selection:text-white">
      <div className="max-w-7xl mx-auto">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminEmployeesPage;
