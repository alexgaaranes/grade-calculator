import React from 'react';
import { Award, BookOpen, TrendingUp, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';
import { calculateGWA, calculateTotalUnits, getHonorsStatus } from '../utils/gradeUtils';

export default function DashboardView({ semesters, studentInfo }) {
  const gwa = calculateGWA(semesters);
  const totalUnits = calculateTotalUnits(semesters);
  const honors = getHonorsStatus(gwa, semesters);
  
  // Calculate percentage of curriculum units earned
  const requiredUnits = studentInfo.curriculumUnits || 142;
  const progressPercent = Math.min(100, Math.round((totalUnits / requiredUnits) * 100));

  // Map GWA (5.0 to 1.0) to stroke-dashoffset (0 to 100)
  // GWA of 1.0 is 100%, 5.0 is 0%.
  const strokeDashVal = gwa > 0 ? ((5.0 - gwa) / 4.0) * 282.6 : 0; 
  // 282.6 is the circumference of the circle (r=45, C=2*pi*r = 282.7)

  return (
    <div className="container">
      {/* Profile Header */}
      <div className="card text-center" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', border: 'none', color: '#fff' }}>
        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 500, opacity: 0.9 }}>{studentInfo.name}</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem', marginTop: '2px', fontWeight: 600 }}>SAIS ID: {studentInfo.studentNumber} • {studentInfo.program}</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', marginTop: '1px' }}>{studentInfo.college}</p>
      </div>

      {/* Main GWA Gauge */}
      <div className="card text-center" style={{ padding: '24px' }}>
        <div className="gwa-circle-container">
          <svg className="gwa-circle-svg" viewBox="0 0 100 100">
            <circle className="gwa-circle-bg" cx="50" cy="50" r="45" />
            <circle 
              className="gwa-circle-progress" 
              cx="50" 
              cy="50" 
              r="45" 
              strokeDasharray="282.7"
              strokeDashoffset={282.7 - strokeDashVal}
            />
          </svg>
          <div className="gwa-circle-text">
            <span className="gwa-score">{gwa > 0 ? gwa.toFixed(4) : 'N/A'}</span>
            <span className="gwa-label">Overall GWA</span>
          </div>
        </div>

        {/* Latin Honors Badge */}
        <div className="mt-4">
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            <span className={`badge badge-${honors.color}`} style={{ fontSize: '0.9rem', padding: '6px 14px', letterSpacing: '0.5px' }}>
              {honors.title}
            </span>
            {honors.eligible ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <CheckCircle size={12} className="text-success" /> Eligible for Graduation Honors
              </p>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontWeight: '500' }}>
                <AlertTriangle size={12} /> Disqualified from honors (see warnings)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Honors Target & GWA Goals */}
      {honors.nextTarget && (
        <div className="card">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(29, 185, 84, 0.1)' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary-color)' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>Target: {honors.nextTarget}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                You are <strong className="text-warning">{honors.diffToNext}</strong> grade points away from reaching the GWA threshold of <strong>{honors.nextTargetGwa.toFixed(2)}</strong>.
              </p>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                {/* Visual indicator of distance to next target */}
                <div 
                  style={{ 
                    height: '100%', 
                    backgroundColor: 'var(--primary-color)', 
                    width: `${Math.max(10, Math.min(95, (1 - (gwa - honors.nextTargetGwa)) * 100))}%` 
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Units Completed Progress */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <BookOpen size={16} className="text-success" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Curriculum Progress</h4>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{totalUnits} / {requiredUnits} units</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: 'var(--secondary-color)', 
              width: `${progressPercent}%`,
              transition: 'width 0.5s ease-out'
            }} 
          />
        </div>
        <p style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-muted)' }}>
          You have completed <strong>{progressPercent}%</strong> of the units required for graduation.
        </p>
      </div>

      {/* Warnings & Notices */}
      {honors.warnings && honors.warnings.length > 0 && (
        <div className="card" style={{ backgroundColor: 'rgba(226, 33, 52, 0.08)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <AlertTriangle size={18} className="text-error" />
            <h4 style={{ fontSize: '0.9rem', color: 'var(--color-error)' }}>Graduation Honors Warnings</h4>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: 'var(--text-main)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {honors.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
          <p style={{ fontSize: '0.72rem', marginTop: '8px', color: 'var(--text-muted)' }}>
            *UPLB rules state that candidates for graduation honors must not have failed, dropped, or incomplete academic courses on their transcript.
          </p>
        </div>
      )}
    </div>
  );
}
