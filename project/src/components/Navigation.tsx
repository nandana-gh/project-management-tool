import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  FolderOpen, 
  Activity, 
  BarChart3, 
  Users, 
  Settings
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { state } = useApp();
  const userRole = state.auth.user?.role;

  const canAccessProjects = userRole === 'ADMIN' || userRole === 'PM' || userRole === 'DPD';
  const canAccessActivities = true; // Everyone can access activities
  const canAccessReports = true; // Everyone can access reports
  const canAccessUsers = userRole === 'ADMIN';

  const navigationItems = [
    {
      id: 'project-selection',
      label: 'Available Projects',
      icon: FolderOpen,
      show: true // Everyone can see available projects
    },
    {
      id: 'projects',
      label: 'Manage Projects',
      icon: Settings,
      show: canAccessProjects
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
      show: canAccessActivities
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      show: canAccessReports
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      show: canAccessUsers
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-r border-gray-200">
      <div className="h-full px-3 py-4">
        <ul className="space-y-2">
          {navigationItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}