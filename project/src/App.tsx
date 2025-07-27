import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ProjectManagement } from './components/ProjectManagement';
import { ProjectSelection } from './components/ProjectSelection';
import { ActivityManagement } from './components/ActivityManagement';
import { Reports } from './components/Reports';
import { UserManagement } from './components/UserManagement';

function AppContent() {
  const { state } = useApp();
  const [currentView, setCurrentView] = useState('project-selection');

  if (!state.auth.isAuthenticated) {
    return <Login />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'project-selection':
        return <ProjectSelection />;
      case 'projects':
        return <ProjectManagement />;
      case 'activities':
        return <ActivityManagement />;
      case 'reports':
        return <Reports />;
      case 'users':
        return <UserManagement />;
      default:
        return <ProjectManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <div className="w-64 bg-white shadow-sm">
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
        </div>
        <main className="flex-1">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;