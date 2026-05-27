import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { calculateGWA, calculateTotalUnits, calculateRequiredAverage, DEFAULT_STUDENT_INFO } from '../utils/gradeUtils';

export default function WhatIfView({ semesters, studentInfo }) {
  // Local cloned state for what-if simulation
  const [simSemesters, setSimSemesters] = useState([]);
  
  // Target calculator state
  const [targetGwaInput, setTargetGwaInput] = useState('1.45'); // Magna Cum Laude default
  const [customTargetGwa, setCustomTargetGwa] = useState('');
  const [remainingUnits, setRemainingUnits] = useState(30);

  // Initialize/Reset simulation semesters
  const resetSimulation = () => {
    // Deep clone the semesters prop
    const cloned = JSON.parse(JSON.stringify(semesters));
    setSimSemesters(cloned);
  };

  useEffect(() => {
    resetSimulation();
  }, [semesters]);

  const handleUpdateGrade = (semId, courseId, newGrade) => {
    let parsedGrade = newGrade;
    if (newGrade !== 'INC' && newGrade !== 'DRP') {
      parsedGrade = parseFloat(newGrade);
    }
    
    setSimSemesters(prev => prev.map(sem => {
      if (sem.id !== semId) return sem;
      return {
        ...sem,
        courses: sem.courses.map(c => {
          if (c.id !== courseId) return c;
          return { ...c, grade: parsedGrade };
        })
      };
    }));
  };

  const handleAddHypotheticalCourse = (semId) => {
    const code = `HYPO-${Math.floor(100 + Math.random() * 900)}`;
    const newCourse = {
      id: `hypo-c-${Date.now()}`,
      code,
      title: "Simulated Course",
      grade: 1.5,
      units: 3,
      excludeFromGWA: false,
      isHypothetical: true
    };

    setSimSemesters(prev => prev.map(sem => {
      if (sem.id !== semId) return sem;
      return {
        ...sem,
        courses: [...sem.courses, newCourse]
      };
    }));
  };

  const handleAddHypotheticalSemester = () => {
    const semId = `hypo-sem-${Date.now()}`;
    const newSem = {
      id: semId,
      name: `Simulated Future Semester`,
      isHypothetical: true,
      courses: [
        { id: `hypo-c-1-${Date.now()}`, code: "GE CLASS", title: "General Education", grade: 1.5, units: 3, excludeFromGWA: false },
        { id: `hypo-c-2-${Date.now()}`, code: "MAJOR CLASS", title: "Major Elective", grade: 1.75, units: 3, excludeFromGWA: false }
      ]
    };

    setSimSemesters(prev => [...prev, newSem]);
  };

  const handleRemoveCourse = (semId, courseId) => {
    setSimSemesters(prev => prev.map(sem => {
      if (sem.id !== semId) return sem;
      return {
        ...sem,
        courses: sem.courses.filter(c => c.id !== courseId)
      };
    }));
  };

  // Calculations
  const currentGwa = calculateGWA(semesters);
  const currentGwaUnits = semesters.reduce((acc, sem) => 
    acc + sem.courses.reduce((sum, c) => sum + (!c.excludeFromGWA && !isNaN(c.grade) && c.grade !== null ? c.units : 0), 0)
  , 0);

  const simGwa = calculateGWA(simSemesters);
  
  const targetGwa = parseFloat(targetGwaInput === 'custom' ? customTargetGwa : targetGwaInput) || 1.75;
  const neededAverage = calculateRequiredAverage(currentGwa, currentGwaUnits, targetGwa, remainingUnits);

  const validGrades = ['1.0', '1.25', '1.5', '1.75', '2.0', '2.25', '2.5', '2.75', '3.0', '4.0', '5.0'];

  // Formatting target average display
  const renderTargetResult = () => {
    if (neededAverage === null || isNaN(neededAverage)) return null;
    
    // In UP, lower numbers are better
    if (neededAverage < 1.0) {
      return (
        <div className="card text-center" style={{ backgroundColor: 'rgba(226, 33, 52, 0.08)', padding: '20px' }}>
          <AlertCircle size={24} className="text-error" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ color: 'var(--color-error)', fontSize: '1rem', fontWeight: 700 }}>Mathematically Unachievable</h4>
          <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
            To reach a GWA of <strong>{targetGwa.toFixed(2)}</strong> with <strong>{remainingUnits}</strong> units left, you would need an average grade of <strong>{neededAverage.toFixed(4)}</strong>, which is better than the highest possible grade (1.00).
          </p>
        </div>
      );
    } else if (neededAverage > 5.0) {
      return (
        <div className="card text-center" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)', padding: '20px' }}>
          <Sparkles size={24} className="text-success" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ color: 'var(--color-success)', fontSize: '1rem', fontWeight: 700 }}>Target Guaranteed!</h4>
          <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
            You are mathematically guaranteed to reach your target GWA of <strong>{targetGwa.toFixed(2)}</strong>. You can average a grade of <strong>{neededAverage.toFixed(4)}</strong> (which is below a failing grade of 5.0) and still achieve your goal.
          </p>
        </div>
      );
    } else {
      const isDifficult = neededAverage < 1.5;
      const statusColor = isDifficult ? 'var(--color-warning)' : 'var(--color-success)';
      const bgOpacityClass = isDifficult ? 'rgba(245, 155, 35, 0.08)' : 'rgba(29, 185, 84, 0.1)';

      return (
        <div className="card text-center" style={{ backgroundColor: bgOpacityClass, padding: '20px' }}>
          <h4 style={{ color: statusColor, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Required Grade Average</h4>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', margin: '8px 0', fontFamily: 'var(--font-heading)' }}>
            {neededAverage.toFixed(4)}
          </div>
          <p style={{ fontSize: '0.8rem' }}>
            You need to average a grade of <strong>{neededAverage.toFixed(2)}</strong> or better (lower numerical value) in your remaining <strong>{remainingUnits}</strong> units to hit your target GWA of <strong>{targetGwa.toFixed(2)}</strong>.
          </p>
          {isDifficult && (
            <p style={{ fontSize: '0.72rem', color: 'var(--color-warning)', marginTop: '8px', fontWeight: 500 }}>
              *This requires a high academic standing (average grade better than 1.50).
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="container">
      {/* Comparative Banner */}
      <div className="card text-center" style={{ position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Current GWA</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {currentGwa > 0 ? currentGwa.toFixed(4) : 'N/A'}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 600 }}>What-If GWA</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }}>
              {simGwa > 0 ? simGwa.toFixed(4) : 'N/A'}
            </div>
          </div>
        </div>

        <button 
          className="btn btn-outline" 
          onClick={resetSimulation}
          style={{ width: 'auto', padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', margin: '14px auto 0 auto', height: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={12} /> Reset Predictor
        </button>
      </div>

      {/* Target Honors Calculator Panel */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} className="text-warning" /> Honors Goal Predictor
        </h3>
        
        <div className="form-group">
          <label className="form-label">Target Latin Honors GWA</label>
          <select 
            className="form-control" 
            value={targetGwaInput} 
            onChange={(e) => setTargetGwaInput(e.target.value)}
          >
            <option value="1.20">Summa Cum Laude (1.20 or better)</option>
            <option value="1.45">Magna Cum Laude (1.45 or better)</option>
            <option value="1.75">Cum Laude (1.75 or better)</option>
            <option value="2.00">Target GWA of 2.00</option>
            <option value="custom">Custom Target GWA</option>
          </select>
        </div>

        {targetGwaInput === 'custom' && (
          <div className="form-group">
            <label className="form-label">Custom Target GWA</label>
            <input 
              type="number" 
              step="0.01" 
              min="1.00" 
              max="5.00" 
              className="form-control" 
              placeholder="e.g. 1.50"
              value={customTargetGwa}
              onChange={(e) => setCustomTargetGwa(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Remaining Units to Take ({remainingUnits} units)</label>
          <input 
            type="range" 
            min="1" 
            max="120" 
            className="range-slider"
            value={remainingUnits}
            onChange={(e) => setRemainingUnits(parseInt(e.target.value) || 1)}
          />
          <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-4px' }}>
            <span>1 unit</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{remainingUnits} units left</span>
            <span>120 units</span>
          </div>
        </div>
      </div>

      {/* Target Result display */}
      {renderTargetResult()}

      {/* Interactive Simulated Grade List */}
      <div className="flex-between mb-2 mt-4">
        <h3 style={{ fontSize: '1rem' }}>Simulated Semesters</h3>
        <button 
          className="btn btn-outline" 
          onClick={handleAddHypotheticalSemester}
          style={{ width: 'auto', padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
        >
          <Plus size={12} /> Add Sim Sem
        </button>
      </div>

      {simSemesters.map(sem => (
        <div key={sem.id} className="card" style={{ padding: '14px', marginBottom: '12px' }}>
          <div className="flex-between" style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: sem.isHypothetical ? 'var(--secondary-color)' : 'var(--text-main)' }}>
              {sem.name} {sem.isHypothetical && "(Hypothetical)"}
            </span>
            <button 
              className="btn btn-outline" 
              onClick={() => handleAddHypotheticalCourse(sem.id)}
              style={{ width: 'auto', padding: '4px 8px', fontSize: '0.7rem', borderRadius: '6px', height: '24px' }}
            >
              <Plus size={10} /> Course
            </button>
          </div>

          {sem.courses.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>No courses to simulate</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sem.courses.map(course => (
                <div key={course.id} className="flex-between" style={{ fontSize: '0.82rem', padding: '4px 0' }}>
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{course.code}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: '6px' }}>({course.units} u)</span>
                    {course.excludeFromGWA && <span className="badge badge-primary" style={{ fontSize: '0.6rem', padding: '2px 6px', marginLeft: '6px' }}>Non-GWA</span>}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      className="form-control"
                      value={String(course.grade)}
                      onChange={(e) => handleUpdateGrade(sem.id, course.id, e.target.value)}
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: '70px', height: '28px', borderRadius: '6px' }}
                      disabled={course.excludeFromGWA}
                    >
                      {validGrades.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                      <option value="INC">INC</option>
                      <option value="DRP">DRP</option>
                    </select>
                    {course.isHypothetical && (
                      <button 
                        onClick={() => handleRemoveCourse(sem.id, course.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
