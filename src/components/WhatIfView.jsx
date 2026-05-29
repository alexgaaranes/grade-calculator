import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { calculateGWA, calculateTotalUnits, calculateRequiredAverage } from '../utils/gradeUtils';

export default function WhatIfView({ semesters, studentInfo, simSemesters, setSimSemesters }) {
  // Target calculator state
  const [targetGwaInput, setTargetGwaInput] = useState('1.45'); // Magna Cum Laude default
  const [customTargetGwa, setCustomTargetGwa] = useState('');
  const [remainingUnits, setRemainingUnits] = useState(30);
  const [isAutoUnits, setIsAutoUnits] = useState(true);

  // Results state
  const [neededAverage, setNeededAverage] = useState(null);

  // Initialize simulation if empty (first visit or after reset)
  useEffect(() => {
    if (simSemesters.length === 0 && semesters.length > 0) {
      const cloned = JSON.parse(JSON.stringify(semesters));
      setSimSemesters(cloned);
    }
  }, [semesters]);

  // Reset simulation logic
  const resetSimulation = () => {
    const cloned = JSON.parse(JSON.stringify(semesters));
    setSimSemesters(cloned);
  };

  // Auto-calculate remaining units from curriculum
  useEffect(() => {
    if (isAutoUnits) {
      const currentTotalUnits = calculateTotalUnits(semesters);
      const curriculumTotal = studentInfo.curriculumUnits || 142;
      const left = Math.max(0, curriculumTotal - currentTotalUnits);
      setRemainingUnits(left);
    }
  }, [semesters, studentInfo, isAutoUnits]);

  // Core Recompute Logic
  const recomputeAchievability = () => {
    // 1. Calculate Actual Units (Current)
    const actualGwaUnits = semesters.reduce((acc, sem) => 
      acc + sem.courses.reduce((sum, c) => sum + (!c.excludeFromGWA && !isNaN(parseFloat(c.grade)) ? c.units : 0), 0)
    , 0);
    const actualGwa = calculateGWA(semesters);

    // 2. Calculate Simulation Units (Total of actual + simulated)
    const simGwaUnits = simSemesters.reduce((acc, sem) => 
      acc + sem.courses.reduce((sum, c) => sum + (!c.excludeFromGWA && !isNaN(parseFloat(c.grade)) ? c.units : 0), 0)
    , 0);
    const simGwa = calculateGWA(simSemesters);

    // 3. Determine the "True" remaining units (Curriculum Total - Current Simulation)
    const curriculumTotal = studentInfo.curriculumUnits || 142;
    const unassignedUnits = Math.max(0, curriculumTotal - simGwaUnits);
    
    // We update the slider/input if it's in auto mode
    if (isAutoUnits) {
      setRemainingUnits(unassignedUnits);
    }

    const targetGwa = parseFloat(targetGwaInput === 'custom' ? customTargetGwa : targetGwaInput) || 1.75;
    
    // Achievability calculation: 
    // "Given my simulated standing (simGwa over simGwaUnits), what do I need in the REST (remainingUnits)?"
    const avg = calculateRequiredAverage(simGwa, simGwaUnits, targetGwa, remainingUnits);
    setNeededAverage(avg);
  };

  // Recompute automatically on input changes
  useEffect(() => {
    recomputeAchievability();
  }, [simSemesters, targetGwaInput, customTargetGwa, remainingUnits]);

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

  const handleUpdateUnits = (semId, courseId, newUnits) => {
    const units = parseFloat(newUnits) || 0;
    setSimSemesters(prev => prev.map(sem => {
      if (sem.id !== semId) return sem;
      return {
        ...sem,
        courses: sem.courses.map(c => {
          if (c.id !== courseId) return c;
          return { ...c, units };
        })
      };
    }));
  };

  const handleAddHypotheticalCourse = (semId) => {
    const code = `SIM-${Math.floor(100 + Math.random() * 900)}`;
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
      name: `Simulated Future Sem`,
      isHypothetical: true,
      courses: [
        { id: `hypo-c-1-${Date.now()}`, code: "FUTURE 1", title: "Future Course", grade: 1.5, units: 3, excludeFromGWA: false, isHypothetical: true }
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

  const handleRemoveSemester = (semId) => {
    setSimSemesters(prev => prev.filter(sem => sem.id !== semId));
  };

  // Calculations for display
  const currentGwa = calculateGWA(semesters);
  const simGwa = calculateGWA(simSemesters);
  const targetGwaValue = parseFloat(targetGwaInput === 'custom' ? customTargetGwa : targetGwaInput) || 1.75;
  const validGrades = ['1.0', '1.25', '1.5', '1.75', '2.0', '2.25', '2.5', '2.75', '3.0', '4.0', '5.0'];

  const renderTargetResult = () => {
    if (neededAverage === null || isNaN(neededAverage)) return null;
    
    if (neededAverage < 1.0) {
      return (
        <div className="card text-center" style={{ backgroundColor: 'rgba(226, 33, 52, 0.08)', padding: '20px', border: '1px solid var(--color-error)' }}>
          <AlertCircle size={24} className="text-error" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ color: 'var(--color-error)', fontSize: '0.9rem', fontWeight: 700 }}>Mathematically Unachievable</h4>
          <p style={{ fontSize: '0.75rem', marginTop: '6px' }}>
            Even if you get perfect grades (1.0) in your remaining <strong>{remainingUnits}</strong> units, you cannot reach <strong>{targetGwaValue.toFixed(2)}</strong> from your current standing.
          </p>
        </div>
      );
    } else if (neededAverage > 5.0) {
      return (
        <div className="card text-center" style={{ backgroundColor: 'rgba(29, 185, 84, 0.1)', padding: '20px', border: '1px solid var(--primary-color)' }}>
          <Sparkles size={24} className="text-success" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ color: 'var(--color-success)', fontSize: '0.9rem', fontWeight: 700 }}>Goal Guaranteed!</h4>
          <p style={{ fontSize: '0.75rem', marginTop: '6px' }}>
            You are mathematically guaranteed to reach <strong>{targetGwaValue.toFixed(2)}</strong>. You can even fail all remaining <strong>{remainingUnits}</strong> units and still hit your goal.
          </p>
        </div>
      );
    } else {
      const isDifficult = neededAverage < 1.5;
      return (
        <div className="card text-center" style={{ backgroundColor: isDifficult ? 'rgba(245, 155, 35, 0.08)' : 'rgba(29, 185, 84, 0.1)', padding: '20px' }}>
          <h4 style={{ color: isDifficult ? 'var(--color-warning)' : 'var(--primary-color)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Required Grade Average</h4>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0' }}>
            {neededAverage.toFixed(4)}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Average grade needed in your remaining <strong>{remainingUnits}</strong> units to hit <strong>{targetGwaValue.toFixed(2)}</strong>.
          </p>
          {isDifficult && (
            <p style={{ fontSize: '0.7rem', color: 'var(--color-warning)', marginTop: '8px' }}>
              *This requires consistently high academic performance.
            </p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="container">
      {/* Comparative Banner */}
      <div className="card text-center">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actual GWA</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {currentGwa > 0 ? currentGwa.toFixed(4) : 'N/A'}
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary-color)', fontWeight: 600 }}>Simulated GWA</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '4px' }}>
              {simGwa > 0 ? simGwa.toFixed(4) : 'N/A'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
          <button 
            className="btn btn-primary" 
            onClick={recomputeAchievability}
            style={{ width: 'auto', padding: '0 16px', fontSize: '0.75rem', height: '32px' }}
          >
            <RefreshCw size={14} /> Recompute
          </button>
          <button 
            className="btn btn-outline" 
            onClick={resetSimulation}
            style={{ width: 'auto', padding: '0 16px', fontSize: '0.75rem', height: '32px' }}
          >
            Reset Sim
          </button>
        </div>
      </div>

      {/* Target Honors Calculator Panel */}
      <div className="card">
        <h3 style={{ fontSize: '0.95rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} className="text-warning" /> Honors Goal Predictor
        </h3>
        
        <div className="form-group">
          <label className="form-label">Target GWA</label>
          <select 
            className="form-control" 
            value={targetGwaInput} 
            onChange={(e) => setTargetGwaInput(e.target.value)}
          >
            <option value="1.20">Summa Cum Laude (1.20)</option>
            <option value="1.45">Magna Cum Laude (1.45)</option>
            <option value="1.75">Cum Laude (1.75)</option>
            <option value="2.00">Target 2.00</option>
            <option value="custom">Custom Value</option>
          </select>
        </div>

        {targetGwaInput === 'custom' && (
          <div className="form-group">
            <label className="form-label">Custom Target</label>
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
          <div className="flex-between mb-2">
            <label className="form-label" style={{ marginBottom: 0 }}>Remaining Units</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Auto-Sync</span>
              <label className="switch">
                <input type="checkbox" checked={isAutoUnits} onChange={(e) => setIsAutoUnits(e.target.checked)} />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          
          <input 
            type="range" 
            min="1" 
            max="120" 
            className="range-slider"
            value={remainingUnits}
            onChange={(e) => {
              setRemainingUnits(parseInt(e.target.value) || 1);
              setIsAutoUnits(false);
            }}
          />
          <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '-4px' }}>
            <span>1u</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{remainingUnits} units left</span>
            <span>120u</span>
          </div>
        </div>
      </div>

      {/* Target Result display */}
      {renderTargetResult()}

      {/* Logic Summary Card */}
      <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--secondary-color)' }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HelpCircle size={14} className="text-muted" /> How is this calculated?
        </h4>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Your <strong>Simulated Data</strong> grades are combined with your <strong>Actual GWA</strong>. 
          The predictor then calculates the grade average required in the remaining <strong>{remainingUnits} units</strong> 
          to reach your goal of <strong>{targetGwaValue.toFixed(2)}</strong>.
        </p>
      </div>

      {/* Interactive Simulated Grade List */}
      <div className="flex-between mb-2 mt-4" style={{ padding: '0 4px' }}>
        <h3 style={{ fontSize: '0.9rem' }}>Simulated Data</h3>
        <button 
          className="btn btn-outline" 
          onClick={handleAddHypotheticalSemester}
          style={{ width: 'auto', padding: '0 12px', fontSize: '0.7rem', height: '28px' }}
        >
          <Plus size={12} /> Add Sem
        </button>
      </div>

      {simSemesters.map(sem => (
        <div key={sem.id} className="card" style={{ padding: '12px', marginBottom: '12px', border: sem.isHypothetical ? '1px dashed var(--border-color)' : 'none' }}>
          <div className="flex-between" style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: sem.isHypothetical ? 'var(--primary-color)' : 'var(--text-main)' }}>
              {sem.name}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => handleAddHypotheticalCourse(sem.id)}
                style={{ width: 'auto', padding: '0 8px', fontSize: '0.65rem', height: '22px' }}
              >
                + Course
              </button>
              {sem.isHypothetical && (
                <button 
                  className="btn btn-outline" 
                  onClick={() => handleRemoveSemester(sem.id)}
                  style={{ width: 'auto', padding: '0 8px', fontSize: '0.65rem', height: '22px', color: 'var(--color-error)', borderColor: 'rgba(226,33,52,0.3)' }}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sem.courses.map(course => (
              <div key={course.id} className="flex-between" style={{ fontSize: '0.8rem' }}>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <span style={{ fontWeight: 600, color: course.isHypothetical ? 'var(--primary-color)' : 'var(--text-main)' }}>{course.code}</span>
                  {course.isHypothetical ? (
                    <input 
                      type="number"
                      className="form-control"
                      value={course.units}
                      onChange={(e) => handleUpdateUnits(sem.id, course.id, e.target.value)}
                      style={{ width: '38px', height: '22px', display: 'inline-block', marginLeft: '4px', fontSize: '0.7rem', padding: '0 4px', background: 'var(--bg-app)', border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '4px' }}>({course.units}u)</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <select
                    className="form-control"
                    value={typeof course.grade === 'number' ? (Number.isInteger(course.grade) ? course.grade.toFixed(1) : String(course.grade)) : String(course.grade)}
                    onChange={(e) => handleUpdateGrade(sem.id, course.id, e.target.value)}
                    style={{ padding: '0 4px', fontSize: '0.75rem', width: '64px', height: '26px' }}
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
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
