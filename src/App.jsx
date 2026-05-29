import React, { useState, useEffect } from 'react';
import { LayoutDashboard, GraduationCap, Sparkles, Settings } from 'lucide-react';
import './App.css';
import DashboardView from './components/DashboardView';
import GradesView from './components/GradesView';
import WhatIfView from './components/WhatIfView';
import SettingsView from './components/SettingsView';
import ConnectView from './components/ConnectView';

function App() {
  const [semesters, setSemesters] = useState([]);
  const [studentInfo, setStudentInfo] = useState({ name: '', studentNumber: '', program: '', curriculumUnits: 142 });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [isLoaded, setIsLoaded] = useState(false);
  const [simSemesters, setSimSemesters] = useState([]);

  // Load initial state from chrome.storage.local or fallback to LocalStorage
  useEffect(() => {
    const loadData = async () => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['grades_semesters', 'grades_student_info', 'grades_theme'], (result) => {
          if (result.grades_semesters) setSemesters(result.grades_semesters);
          if (result.grades_student_info) setStudentInfo(result.grades_student_info);
          if (result.grades_theme) setTheme(result.grades_theme);
          setIsLoaded(true);
        });
      } else {
        const savedSemesters = localStorage.getItem('grades_semesters');
        const savedInfo = localStorage.getItem('grades_student_info');
        const savedTheme = localStorage.getItem('grades_theme');
        
        if (savedSemesters) setSemesters(JSON.parse(savedSemesters));
        if (savedInfo) setStudentInfo(JSON.parse(savedInfo));
        if (savedTheme) setTheme(savedTheme);
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Sync state changes with storage
  useEffect(() => {
    if (!isLoaded) return;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ grades_semesters: semesters });
    } else {
      localStorage.setItem('grades_semesters', JSON.stringify(semesters));
    }
  }, [semesters, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ grades_student_info: studentInfo });
    } else {
      localStorage.setItem('grades_student_info', JSON.stringify(studentInfo));
    }
  }, [studentInfo, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ grades_theme: theme });
    } else {
      localStorage.setItem('grades_theme', theme);
    }
  }, [theme, isLoaded]);

  // Show nothing until state is loaded from storage
  if (!isLoaded) return null;

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
        return <WhatIfView 
          semesters={semesters} 
          studentInfo={studentInfo} 
          simSemesters={simSemesters}
          setSimSemesters={setSimSemesters}
        />;
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
