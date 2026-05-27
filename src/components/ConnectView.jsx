import React, { useState } from 'react';
import { RefreshCw, Link2, FileText, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { parseAmisGrades } from '../utils/gradeUtils';
import { extractCredentialsFromUrl, fetchAmisGrades } from '../utils/amisFetch';

export default function ConnectView({ setSemesters, setStudentInfo }) {
  // URL input state
  const [amisUrl, setAmisUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Paste JSON states
  const [pastedJson, setPastedJson] = useState('');
  const [pasteError, setPasteError] = useState('');
  
  // Tab toggle (fetch vs paste)
  const [activeMode, setActiveMode] = useState('fetch'); // 'fetch' or 'paste'

  const applyGradeData = (data) => {
    const parsedSems = parseAmisGrades(data);
    
    if (parsedSems.length === 0) {
      throw new Error("No academic semester records found in the response data.");
    }

    const defaultInfo = {
      name: data.student_name || data.name || "UPLB Student",
      studentNumber: data.student_number || data.student_no || "202X-XXXXX",
      program: data.curriculum || data.course || "B.S. Computer Science",
      college: "College of Arts and Sciences (CAS)",
      curriculumUnits: 142
    };

    setStudentInfo(defaultInfo);
    setSemesters(parsedSems);
  };

  const handleFetchFromAmis = async () => {
    if (!amisUrl.trim()) {
      setFetchError('Please paste your AMIS URL or Bearer token.');
      return;
    }

    setIsFetching(true);
    setFetchError('');

    try {
      const { token } = extractCredentialsFromUrl(amisUrl);

      // Save token for convenience
      localStorage.setItem('amis_token', token);

      const data = await fetchAmisGrades(token);
      applyGradeData(data);
    } catch (err) {
      console.error(err);
      setFetchError(err.message || 'Connection failed. Your token may have expired — log into AMIS again to get a fresh URL.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleImportJson = () => {
    setPasteError('');
    if (!pastedJson.trim()) {
      setPasteError('JSON text box is empty.');
      return;
    }

    try {
      const parsedData = JSON.parse(pastedJson);
      applyGradeData(parsedData);
    } catch (err) {
      setPasteError(err.message || 'Invalid JSON format. Please verify the copied text.');
    }
  };

  // Optional function to bypass with mock data
  const handleLoadDemo = () => {
    const defaultInfo = {
      name: "ELIXIR S. COLOGNE",
      studentNumber: "2023-45678",
      program: "B.S. Computer Science",
      college: "College of Arts and Sciences (CAS)",
      curriculumUnits: 142
    };

    const mockSemesters = [
      {
        id: "2023-1",
        name: "A.Y. 2023-2024, 1st Semester",
        courses: [
          { id: "c-1", code: "CMSC 11", title: "Introduction to Computer Science", grade: 1.0, units: 3, excludeFromGWA: false },
          { id: "c-2", code: "MATH 27", title: "Analytic Geometry & Calculus I", grade: 1.0, units: 3, excludeFromGWA: false },
          { id: "c-3", code: "KAS 1", title: "Kasaysayan ng Pilipinas", grade: 1.0, units: 3, excludeFromGWA: false },
          { id: "c-4", code: "COMM 10", title: "Critical Perspectives in Communication", grade: 1.0, units: 3, excludeFromGWA: false },
          { id: "c-5", code: "PHYS 51", title: "General Physics I", grade: 1.25, units: 3, excludeFromGWA: false },
          { id: "c-6", code: "PHYS 51.1", title: "General Physics I Laboratory", grade: 1.0, units: 1, excludeFromGWA: false },
          { id: "c-7", code: "HK 11", title: "Wellness and Motor Behavior", grade: 1.25, units: 2, excludeFromGWA: true },
          { id: "c-8", code: "NSTP 1", title: "National Service Training Program I", grade: 1.25, units: 3, excludeFromGWA: true }
        ]
      }
    ];

    setStudentInfo(defaultInfo);
    setSemesters(mockSemesters);
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
          <Link2 size={26} color="#FFFFFF" />
        </div>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>UPLB Grade Calculator</h1>
        <p style={{ fontSize: '0.8rem', maxWidth: '320px', margin: '0 auto' }}>
          Connect your UPLB AMIS account to compute your General Weighted Average and Latin honors standing.
        </p>
      </div>

      {/* Mode Switch Pills */}
      <div className="pill-group" style={{ justifyContent: 'center', marginBottom: '24px' }}>
        <button 
          className={`pill-item ${activeMode === 'fetch' ? 'active' : ''}`}
          onClick={() => setActiveMode('fetch')}
        >
          AMIS Link
        </button>
        <button 
          className={`pill-item ${activeMode === 'paste' ? 'active' : ''}`}
          onClick={() => setActiveMode('paste')}
        >
          JSON Payload
        </button>
      </div>

      {activeMode === 'fetch' ? (
        /* Direct Fetch via AMIS URL */
        <div className="card">
          <h3 style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link2 size={14} className="text-success" /> Paste your AMIS URL
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Copy the full URL from your browser address bar after logging into AMIS.
          </p>

          <div className="form-group">
            <label className="form-label">AMIS URL or Bearer Token</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="https://amis.uplb.edu.ph/personal-information/?token=..."
              value={amisUrl}
              onChange={(e) => setAmisUrl(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
            />
          </div>

          <button 
            className="btn btn-primary mt-2" 
            onClick={handleFetchFromAmis} 
            disabled={isFetching}
          >
            {isFetching ? <RefreshCw size={16} className="spinner" /> : <ChevronRight size={16} />} 
            {isFetching ? 'Fetching records...' : 'Fetch and Connect'}
          </button>

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
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Error:</strong> {fetchError}</div>
            </div>
          )}
        </div>
      ) : (
        /* Copy Paste JSON Layout */
        <div className="card">
          <h3 style={{ fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Paste AMIS JSON Data
          </h3>
          <p style={{ fontSize: '0.75rem', marginBottom: '14px' }}>
            Copy the full JSON response from the grades API stream and load it manually below.
          </p>

          <div className="form-group">
            <textarea 
              className="form-control" 
              rows="6" 
              placeholder='{"student_number": "202X-XXXXX", "grades": [...] }'
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', resize: 'vertical' }}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
            />
          </div>

          <button className="btn btn-primary mt-2" onClick={handleImportJson}>
            <FileText size={16} /> Import JSON Data
          </button>

          {pasteError && (
            <div style={{ 
              padding: '12px', 
              borderRadius: '6px', 
              backgroundColor: 'rgba(226, 33, 52, 0.08)', 
              marginTop: '14px', 
              fontSize: '0.75rem', 
              color: 'var(--color-error)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div><strong>Import Error:</strong> {pasteError}</div>
            </div>
          )}
        </div>
      )}

      {/* How-to Guide Card */}
      <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
        <h4 style={{ fontSize: '12px', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} className="text-success" /> How to connect
        </h4>
        <ol style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>Log in to <strong>amis.uplb.edu.ph</strong> in your browser.</li>
          <li>Once logged in, <strong>copy the full URL</strong> from the address bar.</li>
          <li>It will look like this:</li>
        </ol>

        <div style={{ 
          backgroundColor: 'var(--bg-app)', 
          borderRadius: '4px', 
          padding: '8px 10px', 
          fontSize: '10px', 
          fontFamily: 'var(--font-mono)', 
          overflowX: 'auto', 
          marginTop: '10px', 
          whiteSpace: 'nowrap',
          textAlign: 'left',
          border: '1px solid var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          https://amis.uplb.edu.ph/.../?<span style={{ color: 'var(--primary-color)' }}>token=10442313%7Cyifp...</span>&session_id=...
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Paste that entire URL into the <strong>AMIS Link</strong> field above. The token is automatically extracted and used to fetch your grades.
        </p>
        <p style={{ fontSize: '0.68rem', color: 'var(--secondary-color)', marginTop: '6px' }}>
          Tokens expire after your AMIS session ends. If fetching fails, log in to AMIS again to get a fresh URL.
        </p>
      </div>

      {/* Optional Demo Button */}
      <div className="text-center mt-2">
        <button 
          onClick={handleLoadDemo} 
          style={{ background: 'none', border: 'none', color: 'var(--neutral)', fontSize: '0.75rem', textDecoration: 'underline', cursor: 'pointer' }}
        >
          Explore with simulated sandbox data
        </button>
      </div>
    </div>
  );
}
