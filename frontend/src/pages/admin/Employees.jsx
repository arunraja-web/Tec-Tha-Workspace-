import React from 'react';
import UserManagement from '../../components/admin/UserManagement';

export const AdminEmployeesPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        <UserManagement />
      </div>
    </div>
  );
};

export default AdminEmployeesPage;
