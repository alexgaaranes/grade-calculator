import React, { useState, useEffect } from 'react';
import { LayoutDashboard, GraduationCap, Sparkles, Settings } from 'lucide-react';
import './App.css';
import DashboardView from './components/DashboardView';
import GradesView from './components/GradesView';
import WhatIfView from './components/WhatIfView';
import SettingsView from './components/SettingsView';
import ConnectView from './components/ConnectView';

function App() {
  // Load initial state from LocalStorage or default to empty for session gate
  const [semesters, setSemesters] = useState(() => {
    const saved = localStorage.getItem('grades_semesters');
    return saved ? JSON.parse(saved) : [];
  });

  const [studentInfo, setStudentInfo] = useState(() => {
    const saved = localStorage.getItem('grades_student_info');
    return saved ? JSON.parse(saved) : { name: '', studentNumber: '', program: '', curriculumUnits: 142 };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Theme state forced to dark for Green Deck
  const [theme, setTheme] = useState('dark');

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('grades_semesters', JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem('grades_student_info', JSON.stringify(studentInfo));
  }, [studentInfo]);

  useEffect(() => {
    localStorage.setItem('grades_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // If there are no semesters, show the Connect screen to collect credentials/JSON first
  if (semesters.length === 0) {
    return (
      <main style={{ width: '100%' }}>
        <ConnectView setSemesters={setSemesters} setStudentInfo={setStudentInfo} />
      </main>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView semesters={semesters} studentInfo={studentInfo} />;
      case 'grades':
        return <GradesView semesters={semesters} setSemesters={setSemesters} />;
      case 'what-if':
        return <WhatIfView semesters={semesters} studentInfo={studentInfo} />;
      case 'settings':
        return <SettingsView 
          semesters={semesters} 
          setSemesters={setSemesters} 
          studentInfo={studentInfo} 
          setStudentInfo={setStudentInfo}
          theme={theme}
          setTheme={setTheme}
        />;
      default:
        return <DashboardView semesters={semesters} studentInfo={studentInfo} />;
    }
  };

  return (
    <>
      {/* Main View Container */}
      <main style={{ width: '100%' }}>
        {renderActiveView()}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span className="nav-label">Dashboard</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          <GraduationCap size={20} />
          <span className="nav-label">Grades</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'what-if' ? 'active' : ''}`}
          onClick={() => setActiveTab('what-if')}
        >
          <Sparkles size={20} />
          <span className="nav-label">What-If</span>
        </button>

        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          <span className="nav-label">Settings</span>
        </button>
      </nav>
    </>
  );
}

export default App;
