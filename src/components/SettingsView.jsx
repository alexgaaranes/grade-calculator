import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, LogOut, Zap, AlertCircle } from 'lucide-react';
import { parseAmisGrades } from '../utils/gradeUtils';
import { fetchAmisGrades, fetchAmisAuthUser, extractToken } from '../utils/amisFetch';

export default function SettingsView({ 
  semesters, 
  setSemesters, 
  studentInfo, 
  setStudentInfo, 
  theme, 
  setTheme 
}) {
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState(false);
  
  const [capturedToken, setCapturedToken] = useState(null);
  const [capturedSessionId, setCapturedSessionId] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [localUnits, setLocalUnits] = useState(studentInfo.curriculumUnits);

  useEffect(() => {
    setLocalUnits(studentInfo.curriculumUnits);
  }, [studentInfo.curriculumUnits]);

  // Load captured state for Refresh
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['amis_captured_token', 'amis_captured_session_id'], (result) => {
        if (result.amis_captured_token) setCapturedToken(result.amis_captured_token);
        if (result.amis_captured_session_id) setCapturedSessionId(result.amis_captured_session_id);
      });
    }
  }, []);

  const handleSyncFromAmis = async () => {
    if (!capturedToken) {
      setFetchError('No active AMIS session detected.');
      return;
    }

    setIsFetching(true);
    setFetchError('');
    setFetchSuccess(false);

    try {
      const token = extractToken(capturedToken);

      // 1. Fetch Grades
      const gradeData = await fetchAmisGrades(token, capturedSessionId);
      const parsedSems = parseAmisGrades(gradeData);
      
      if (parsedSems.length === 0) {
        throw new Error("No academic semester records found.");
      }

      // 2. Fetch Profile from Auth User endpoint
      let authUser = {};
      try {
        const authResponse = await fetchAmisAuthUser(token, capturedSessionId);
        authUser = authResponse.user || authResponse || {};
      } catch (e) {
        console.warn("Failed to fetch profile info:", e);
      }

      const info = {
        name: authUser.formatted_name || authUser.full_name || gradeData.student_name || studentInfo.name,
        studentNumber: gradeData.student_no || authUser.sais_id || authUser.student_no || studentInfo.studentNumber,
        program: gradeData.curriculum_name || authUser.program?.name || studentInfo.program,
        college: gradeData.college_name || authUser.college?.name || studentInfo.college,
        curriculumUnits: studentInfo.curriculumUnits
      };

      setStudentInfo(info);
      setSemesters(parsedSems);
      setFetchSuccess(true);
    } catch (err) {
      console.error(err);
      setFetchError(err.message || 'Sync failed.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleDisconnect = () => {
    if (window.confirm("Disconnect from AMIS and clear all records?")) {
      setSemesters([]);
      setStudentInfo({ name: '', studentNumber: '', program: '', curriculumUnits: 142 });
      
      chrome.storage.local.remove([
        'grades_semesters', 
        'grades_student_info', 
        'amis_token', 
        'amis_session_id',
        'amis_captured_token',
        'amis_captured_session_id'
      ]);
    }
  };

  const handleSaveUnits = () => {
    setStudentInfo({ ...studentInfo, curriculumUnits: parseInt(localUnits) || 142 });
    setEditMode(false);
  };

  return (
    <div className="container">
      {/* Sync Control */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} className="text-success" /> AMIS Integration
        </h3>
        
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Your data is synced via AMIS session capture.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSyncFromAmis} 
            disabled={isFetching || !capturedToken}
          >
            {isFetching ? <RefreshCw size={16} className="spinner" /> : <RefreshCw size={16} />} 
            {isFetching ? 'Syncing...' : 'Refresh Data from AMIS'}
          </button>

          {!capturedToken && (
            <p style={{ fontSize: '0.7rem', color: 'var(--color-warning)', textAlign: 'center' }}>
              No active session. Open AMIS portal to enable refresh.
            </p>
          )}

          <button className="btn btn-outline" onClick={handleDisconnect} style={{ borderColor: 'var(--color-error)', color: 'var(--color-error)' }}>
            Disconnect Account
          </button>
        </div>

        {fetchSuccess && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '12px', textAlign: 'center', fontWeight: '500' }}>
            Data refreshed successfully!
          </p>
        )}

        {fetchError && (
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(226, 33, 52, 0.08)', marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-error)', display: 'flex', gap: '8px' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <div><strong>Error:</strong> {fetchError}</div>
          </div>
        )}
      </div>

      {/* Student Profile Info */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1rem', margin: 0 }}>Student Profile</h3>
          {!editMode ? (
            <button 
              className="btn btn-outline" 
              style={{ width: 'auto', height: '24px', padding: '0 8px', fontSize: '0.65rem' }}
              onClick={() => setEditMode(true)}
            >
              Edit Units
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              style={{ width: 'auto', height: '24px', padding: '0 8px', fontSize: '0.65rem' }}
              onClick={handleSaveUnits}
            >
              <Save size={10} /> Save
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label className="form-label">Full Name</label>
            <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '500' }}>{studentInfo.name || 'Not set'}</div>
          </div>
          <div>
            <label className="form-label">SAIS ID</label>
            <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{studentInfo.studentNumber || 'Not set'}</div>
          </div>
          <div>
            <label className="form-label">Academic Program</label>
            <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{studentInfo.program || 'Not set'}</div>
          </div>
          <div>
            <label className="form-label">Total Curriculum Units</label>
            {editMode ? (
              <input 
                type="number" 
                className="form-control" 
                value={localUnits} 
                onChange={(e) => setLocalUnits(e.target.value)}
                style={{ height: '32px', fontSize: '0.9rem' }}
              />
            ) : (
              <div style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{studentInfo.curriculumUnits} units</div>
            )}
            <p style={{ fontSize: '0.65rem', color: 'var(--neutral)', marginTop: '4px' }}>
              *Check your official POS (Plan of Study) to verify your total required units.
            </p>
          </div>
        </div>
      </div>

      {/* App Version Info */}
      <div className="text-center mt-4">
        <p style={{ fontSize: '0.7rem', color: 'var(--neutral)' }}>
          Tres-Hold Extension v1.0.0<br/>
          Built for UPLB Students
        </p>
      </div>
    </div>
  );
}
