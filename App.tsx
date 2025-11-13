import React, { useState, useEffect } from 'react';
import { useKanbanStore } from './hooks/useKanbanStore';
import Login from './components/Login';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';

type View = 'board' | 'dashboard' | 'admin';

const App: React.FC = () => {
  const { state } = useKanbanStore();
  const [currentView, setCurrentView] = useState<View>('board');
  const { loggedInUser } = state;


  if (!loggedInUser) {
    return <Login />;
  }
  
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'admin':
        return <AdminPanel />;
      case 'board':
      default:
        return <KanbanBoard />;
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-grow p-4 sm:p-6 overflow-x-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;