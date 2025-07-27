import React from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, User, Settings } from 'lucide-react';

export function Header() {
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'PM': return 'bg-blue-100 text-blue-800';
      case 'DPD': return 'bg-green-100 text-green-800';
      case 'ENGINEER': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Project Management System</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {state.auth.user?.username}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(state.auth.user?.role || '')}`}>
                  {state.auth.user?.role === 'DPD' ? 'Deputy Project Director' : state.auth.user?.role}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}