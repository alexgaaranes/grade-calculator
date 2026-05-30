import React, { useRef, useState } from 'react';
import { Award, BookOpen, TrendingUp, AlertTriangle, CheckCircle, Download, RefreshCw, GraduationCap } from 'lucide-react';
import { calculateGWA, calculateTotalUnits, getHonorsStatus } from '../utils/gradeUtils';
import * as htmlToImage from 'html-to-image';

export default function DashboardView({ semesters, studentInfo }) {
  const gwa = calculateGWA(semesters);
  const totalUnits = calculateTotalUnits(semesters);
  const honors = getHonorsStatus(gwa, semesters);
  
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const requiredUnits = studentInfo.curriculumUnits || 142;
  const progressPercent = Math.min(100, Math.round((totalUnits / requiredUnits) * 100));
  const strokeDashVal = gwa > 0 ? ((5.0 - gwa) / 4.0) * 282.6 : 0; 

  const handleSaveImage = async () => {
    if (!exportRef.current) return;
    setIsExporting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await htmlToImage.toPng(exportRef.current, {
        backgroundColor: '#121212',
        quality: 1.0,
        pixelRatio: 3,
        width: 400,
        height: 500,
      });
      
      const link = document.createElement('a');
      link.download = `Tres-Hold-Card-${studentInfo.name.split(',')[0] || 'Student'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to generate image.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container">
      {/* Action Header */}
      <div className="flex-between mb-4" style={{ padding: '0 4px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Tres-Hold</h2>
        <button 
          className="btn btn-primary" 
          onClick={handleSaveImage}
          disabled={isExporting}
          style={{ width: 'auto', padding: '0 16px', fontSize: '0.75rem', height: '32px' }}
        >
          {isExporting ? <RefreshCw size={14} className="spinner" /> : <Download size={14} />} 
          {isExporting ? 'Generating...' : 'Save as Image'}
        </button>
      </div>

      {/* 1. Visible Dashboard UI */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #1DB954 0%, #191414 100%)', 
        border: 'none', 
        color: '#fff',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0' }}>{studentInfo.name}</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem', fontWeight: 600, margin: 0 }}>SAIS ID: {studentInfo.studentNumber}</p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.75rem', margin: '4px 0 0 0' }}>{studentInfo.program}</p>
        </div>
      </div>

      <div className="card text-center">
        <div className="gwa-circle-container">
          <svg className="gwa-circle-svg" viewBox="0 0 100 100">
            <circle className="gwa-circle-bg" cx="50" cy="50" r="45" />
            <circle className="gwa-circle-progress" cx="50" cy="50" r="45" strokeDasharray="282.7" strokeDashoffset={282.7 - strokeDashVal} />
          </svg>
          <div className="gwa-circle-text">
            <span className="gwa-score">{gwa > 0 ? gwa.toFixed(4) : 'N/A'}</span>
            <span className="gwa-label">Overall GWA</span>
          </div>
        </div>
        <div className="mt-4">
          <span className={`badge badge-${honors.color}`}>{honors.title}</span>
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-2">
          <div className="d-flex align-center gap-2">
            <BookOpen size={16} className="text-success" />
            <h4 style={{ fontSize: '0.85rem' }}>Curriculum Progress</h4>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{totalUnits} / {requiredUnits} u</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', backgroundColor: 'var(--primary-color)', width: `${progressPercent}%` }} />
        </div>
      </div>

      {honors.warnings && honors.warnings.length > 0 && (
        <div className="card" style={{ backgroundColor: 'rgba(226, 33, 52, 0.08)' }}>
          <div className="d-flex align-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-error" />
            <h4 style={{ fontSize: '0.85rem', color: 'var(--color-error)' }}>Warnings</h4>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '0.75rem', color: 'var(--text-main)', textAlign: 'left' }}>
            {honors.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
          </ul>
        </div>
      )}

      {/* 2. HIDDEN EXPORT CARD (Minimalist, No Labels) */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div 
          ref={exportRef} 
          style={{ 
            width: '400px', 
            height: '500px', 
            background: '#121212', 
            padding: '50px 40px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'var(--font-sans)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative background branding */}
          <div style={{ position: 'absolute', top: '5%', right: '-15%', opacity: 0.04 }}>
            <GraduationCap size={350} color="white" />
          </div>
          <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', opacity: 0.2 }}>
             <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.5em', color: '#1DB954' }}>TRES-HOLD</span>
          </div>

          {/* GWA Centerpiece - High Impact, No Label */}
          <div style={{ position: 'relative', textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ 
              fontSize: '5rem', 
              fontWeight: 900, 
              color: '#1DB954', 
              lineHeight: 1, 
              margin: '0',
              textShadow: '0 0 30px rgba(29, 185, 84, 0.4)'
            }}>
              {gwa > 0 ? gwa.toFixed(4) : 'N/A'}
            </div>
          </div>

          {/* Student Info Block - Minimalist (Values Only) */}
          <div style={{ width: '100%', textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{studentInfo.name}</div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: '#B3B3B3', maxWidth: '300px', margin: '0 auto' }}>{studentInfo.program}</div>
            </div>

            <div>
              <div style={{ marginTop: '12px' }}>
                <span style={{ 
                  backgroundColor: honors.color === 'gold' ? '#F59B23' : (honors.color === 'primary' ? '#1DB954' : '#535353'),
                  color: honors.color === 'secondary' ? 'white' : 'black',
                  padding: '10px 32px',
                  borderRadius: '2px',
                  fontSize: '18px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                  {honors.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
