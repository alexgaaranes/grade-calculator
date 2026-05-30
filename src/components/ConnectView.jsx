import React, { useState, useEffect } from 'react';
import { RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { parseAmisGrades } from '../utils/gradeUtils';
import { extractToken, fetchAmisGrades, fetchAmisAuthUser } from '../utils/amisFetch';

export default function ConnectView({ setSemesters, setStudentInfo }) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  
  const [capturedToken, setCapturedToken] = useState(null);
  const [capturedSessionId, setCapturedSessionId] = useState(null);

  // Check for captured token & session ID in extension storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['amis_captured_token', 'amis_captured_session_id'], (result) => {
        if (result.amis_captured_token) setCapturedToken(result.amis_captured_token);
        if (result.amis_captured_session_id) setCapturedSessionId(result.amis_captured_session_id);
      });

      const handleStorageChange = (changes, area) => {
        if (area === 'local') {
          if (changes.amis_captured_token) setCapturedToken(changes.amis_captured_token.newValue);
          if (changes.amis_captured_session_id) setCapturedSessionId(changes.amis_captured_session_id.newValue);
        }
      };
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);

  const handleFetchWithToken = async (targetToken, targetSessionId) => {
    if (!targetToken) return;

    setIsFetching(true);
    setFetchError('');

    try {
      const token = extractToken(targetToken);

      // Save session info
      chrome.storage.local.set({ amis_token: token, amis_session_id: targetSessionId });

      // 1. Fetch Grades
      const gradeData = await fetchAmisGrades(token, targetSessionId);
      const parsedSems = parseAmisGrades(gradeData);
      
      if (parsedSems.length === 0) {
        throw new Error("No academic semester records found.");
      }

      // 2. Fetch Profile
      let authUser = {};
      try {
        const authResponse = await fetchAmisAuthUser(token, targetSessionId);
        authUser = authResponse.user || authResponse || {};
      } catch (e) {
        console.warn("Failed to fetch profile info:", e);
      }

      const info = {
        name: authUser.formatted_name || authUser.full_name || gradeData.student_name || "UPLB Student",
        studentNumber: gradeData.student_no || authUser.sais_id || authUser.student_no || "202X-XXXXX",
        program: gradeData.curriculum_name || authUser.program?.name || "B.S. Computer Science",
        college: gradeData.college_name || authUser.college?.name || "College of Arts and Sciences (CAS)",
        curriculumUnits: 142
      };

      setStudentInfo(info);
      setSemesters(parsedSems);
    } catch (err) {
      console.error(err);
      setFetchError(err.message || 'Sync failed.');
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {/* Header Splash */}
      <div className="text-center mb-4" style={{ marginTop: '20px' }}>
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary-color)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 16px auto',
          boxShadow: '0 4px 20px rgba(29, 185, 84, 0.4)'
        }}>
          <Zap size={26} color="#FFFFFF" />
        </div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Tres-Hold</h1>
        <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto' }}>
          Automatically sync your grades and student profile from the UPLB AMIS portal.
        </p>
      </div>

      <div className="card text-center" style={{ padding: '24px' }}>
        {capturedToken ? (
          <>
            <div style={{ 
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(29, 185, 84, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Zap size={24} className="text-success" />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>AMIS Sync Ready</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              We've detected an active session from your browser. Click below to import your data.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ height: '48px', fontSize: '16px' }}
              onClick={() => handleFetchWithToken(capturedToken, capturedSessionId)} 
              disabled={isFetching}
            >
              {isFetching ? <RefreshCw size={20} className="spinner" /> : <RefreshCw size={20} />} 
              {isFetching ? 'Syncing...' : 'Sync with AMIS'}
            </button>
          </>
        ) : (
          <>
            <div style={{ 
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(179, 179, 179, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <RefreshCw size={24} style={{ color: 'var(--neutral)' }} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--neutral)' }}>Waiting for AMIS...</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Please log in to the <a href="https://amis.uplb.edu.ph" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold' }}>AMIS Portal</a> in another tab to enable automatic syncing.
            </p>
            <div style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              backgroundColor: 'var(--bg-app)', 
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-color)'
            }}>
              The extension will automatically detect your session once you access your grades.
            </div>
          </>
        )}

        {fetchError && (
          <div style={{ 
            padding: '12px', 
            borderRadius: '6px', 
            backgroundColor: 'rgba(226, 33, 52, 0.08)', 
            marginTop: '14px', 
            fontSize: '0.75rem', 
            color: 'var(--color-error)',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            textAlign: 'left'
          }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div><strong>Sync Error:</strong> {fetchError}</div>
          </div>
        )}
      </div>

      {/* How-it-works footer */}
      <div style={{ textAlign: 'center', marginTop: 'auto', paddingBottom: '20px' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--neutral)' }}>
          Secured by Manifest V3 Network Sniffing. <br/>
          Your credentials never leave your browser.
        </p>
      </div>
    </div>
  );
}
