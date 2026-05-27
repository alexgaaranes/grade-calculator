import React, { useState } from 'react';
import { Save, RefreshCw, Link2, FileText, Trash2 } from 'lucide-react';
import { parseAmisGrades } from '../utils/gradeUtils';
import { extractCredentialsFromUrl, fetchAmisGrades } from '../utils/amisFetch';

export default function SettingsView({ 
  semesters, 
  setSemesters, 
  studentInfo, 
  setStudentInfo, 
  theme, 
  setTheme 
}) {
  // Local Form states
  const [name, setName] = useState(studentInfo.name);
  const [studentNumber, setStudentNumber] = useState(studentInfo.studentNumber);
  const [program, setProgram] = useState(studentInfo.program);
  const [curriculumUnits, setCurriculumUnits] = useState(studentInfo.curriculumUnits);

  // Fetch via URL states
  const [amisUrl, setAmisUrl] = useState(localStorage.getItem('amis_token') || '');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState(false);

  // Paste JSON states
  const [pastedJson, setPastedJson] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...studentInfo,
      name,
      studentNumber,
      program,
      curriculumUnits: parseInt(curriculumUnits) || 142
    };
    setStudentInfo(updated);
    alert('Profile updated successfully!');
  };

  const handleFetchFromAmis = async () => {
    if (!amisUrl.trim()) {
      setFetchError('Please paste your AMIS URL or Bearer token.');
      return;
    }

    setIsFetching(true);
    setFetchError('');
    setFetchSuccess(false);

    try {
      const { token } = extractCredentialsFromUrl(amisUrl);
      localStorage.setItem('amis_token', token);

      const data = await fetchAmisGrades(token);
      const parsedSems = parseAmisGrades(data);
      
      if (parsedSems.length === 0) {
        throw new Error("No academic records found in the response.");
      }

      setSemesters(parsedSems);
      setFetchSuccess(true);
      setFetchError('');
    } catch (err) {
      console.error(err);
      setFetchError(err.message || 'Failed to fetch grades. Your token may have expired — log into AMIS again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleImportJson = () => {
    setPasteError('');
    setPasteSuccess(false);
    
    if (!pastedJson.trim()) {
      setPasteError('JSON box is empty.');
      return;
    }

    try {
      const parsedData = JSON.parse(pastedJson);
      const parsedSems = parseAmisGrades(parsedData);
      
      if (parsedSems.length === 0) {
        throw new Error("Parsed successfully but no semester grades records were detected.");
      }

      setSemesters(parsedSems);
      setPasteSuccess(true);
      setPastedJson('');
    } catch (err) {
      setPasteError(err.message || 'Invalid JSON format. Please verify the copied content.');
    }
  };

  const handleResetData = () => {
    if (window.confirm("This will erase all current records and log you out. Do you wish to proceed?")) {
      setSemesters([]);
      setStudentInfo({ name: '', studentNumber: '', program: '', curriculumUnits: 142 });
      setAmisUrl('');
      localStorage.removeItem('amis_token');
      localStorage.removeItem('grades_semesters');
      localStorage.removeItem('grades_student_info');
      alert('Application reset. All data cleared.');
    }
  };

  return (
    <div className="container">

      {/* API Fetcher via AMIS URL */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link2 size={16} className="text-success" /> Refresh from AMIS
        </h3>
        
        <p style={{ fontSize: '0.75rem', marginBottom: '16px' }}>
          Paste the full URL from your AMIS browser address bar to re-fetch your latest grades.
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
          className="btn btn-primary mt-4" 
          onClick={handleFetchFromAmis} 
          disabled={isFetching}
        >
          {isFetching ? <RefreshCw size={16} className="spinner" /> : <RefreshCw size={16} />} 
          {isFetching ? 'Fetching data...' : 'Fetch Grades from AMIS'}
        </button>

        {fetchSuccess && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
            Successfully synced grades from AMIS! Check Dashboard.
          </p>
        )}

        {fetchError && (
          <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'rgba(226, 33, 52, 0.08)', marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-error)' }}>
            <strong>Error:</strong> {fetchError}
          </div>
        )}
      </div>

      {/* Manual JSON Copy-Paste fallback */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} className="text-warning" /> Import via Console Script
        </h3>
        
        <p style={{ fontSize: '0.75rem', marginBottom: '10px' }}>
          If URL-based fetching fails, run this in your browser console while logged into AMIS:
        </p>

        <div style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', overflowX: 'auto', textAlign: 'left', marginBottom: '14px', whiteSpace: 'pre' }}>
{`fetch("https://api-amis.uplb.edu.ph/api/students/grades?summarize=true", {
  credentials: "include"
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data)))`}
        </div>

        <p style={{ fontSize: '0.75rem', marginBottom: '10px' }}>
          Copy the logged output, paste it below, and click Import.
        </p>

        <div className="form-group">
          <textarea 
            className="form-control" 
            rows="4" 
            placeholder='Paste AMIS JSON output here...' 
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', resize: 'vertical' }}
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
          />
        </div>

        <button className="btn btn-outline mt-2" onClick={handleImportJson}>
          Load Pasted JSON Data
        </button>

        {pasteSuccess && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
            Successfully imported grade payload!
          </p>
        )}

        {pasteError && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-error)', marginTop: '10px', textAlign: 'center', fontWeight: '500' }}>
            {pasteError}
          </p>
        )}
      </div>

      {/* Student Profile Settings */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Student Profile</h3>
        <form onSubmit={handleSaveProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Student Number</label>
            <input 
              type="text" 
              className="form-control" 
              value={studentNumber} 
              onChange={(e) => setStudentNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Academic Program</label>
            <input 
              type="text" 
              className="form-control" 
              value={program} 
              onChange={(e) => setProgram(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Curriculum Units Required</label>
            <input 
              type="number" 
              className="form-control" 
              value={curriculumUnits} 
              onChange={(e) => setCurriculumUnits(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary mt-2">
            <Save size={16} /> Save Changes
          </button>
        </form>
      </div>

      {/* Factory Reset Data */}
      <div className="card" style={{ backgroundColor: 'rgba(226, 33, 52, 0.08)' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--color-error)' }}>Danger Zone</h3>
        <p style={{ fontSize: '0.75rem', marginBottom: '14px' }}>
          Erase all student records from local storage.
        </p>
        <button className="btn btn-danger" onClick={handleResetData}>
          <Trash2 size={16} /> Clear All Local Data
        </button>
      </div>
    </div>
  );
}
