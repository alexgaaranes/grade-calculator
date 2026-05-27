import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Edit, Calendar } from 'lucide-react';
import { calculateGWA } from '../utils/gradeUtils';

export default function GradesView({ semesters, setSemesters }) {
  const [expandedSems, setExpandedSems] = useState({
    [semesters[0]?.id || '']: true // Expand first semester by default
  });

  // State for Add/Edit Course Bottom Sheet
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSemId, setActiveSemId] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null); // null if adding, course object if editing
  
  // Course Form State
  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseGrade, setCourseGrade] = useState('1.0');
  const [courseUnits, setCourseUnits] = useState(3);
  const [courseExclude, setCourseExclude] = useState(false);

  // State for Add Semester Modal
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [semYear, setSemYear] = useState('2025-2026');
  const [semTerm, setSemTerm] = useState('1st Semester');

  const toggleSemester = (id) => {
    setExpandedSems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleOpenAddCourse = (semId) => {
    setActiveSemId(semId);
    setEditingCourse(null);
    setCourseCode('');
    setCourseTitle('');
    setCourseGrade('1.0');
    setCourseUnits(3);
    setCourseExclude(false);
    setIsSheetOpen(true);
  };

  const handleOpenEditCourse = (semId, course) => {
    setActiveSemId(semId);
    setEditingCourse(course);
    setCourseCode(course.code);
    setCourseTitle(course.title);
    setCourseGrade(String(course.grade));
    setCourseUnits(course.units);
    setCourseExclude(course.excludeFromGWA);
    setIsSheetOpen(true);
  };

  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!courseCode.trim()) return;

    // Check if grade is numeric or custom (DRP/INC)
    let finalGrade = courseGrade;
    if (courseGrade !== 'DRP' && courseGrade !== 'INC') {
      finalGrade = parseFloat(courseGrade);
    }

    const newOrUpdatedCourse = {
      id: editingCourse ? editingCourse.id : `c-${Date.now()}`,
      code: courseCode.trim().toUpperCase(),
      title: courseTitle.trim(),
      grade: finalGrade,
      units: parseFloat(courseUnits),
      excludeFromGWA: courseExclude
    };

    setSemesters(prevSems => {
      return prevSems.map(sem => {
        if (sem.id !== activeSemId) return sem;
        
        let updatedCourses;
        if (editingCourse) {
          // Editing existing course
          updatedCourses = sem.courses.map(c => c.id === editingCourse.id ? newOrUpdatedCourse : c);
        } else {
          // Adding new course
          updatedCourses = [...sem.courses, newOrUpdatedCourse];
        }

        return { ...sem, courses: updatedCourses };
      });
    });

    setIsSheetOpen(false);
  };

  const handleDeleteCourse = (semId, courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    
    setSemesters(prevSems => {
      return prevSems.map(sem => {
        if (sem.id !== semId) return sem;
        return {
          ...sem,
          courses: sem.courses.filter(c => c.id !== courseId)
        };
      });
    });
  };

  const handleAddSemester = (e) => {
    e.preventDefault();
    const semId = `sem-${Date.now()}`;
    const semName = `A.Y. ${semYear}, ${semTerm}`;

    setSemesters(prev => [
      ...prev,
      {
        id: semId,
        name: semName,
        courses: []
      }
    ]);
    
    setExpandedSems(prev => ({ ...prev, [semId]: true }));
    setIsSemModalOpen(false);
  };

  const handleDeleteSemester = (semId, semName) => {
    if (!window.confirm(`Are you sure you want to delete the entire ${semName} and all its courses?`)) return;
    
    setSemesters(prev => prev.filter(sem => sem.id !== semId));
  };

  const toggleExcludeCourse = (semId, courseId) => {
    setSemesters(prevSems => {
      return prevSems.map(sem => {
        if (sem.id !== semId) return sem;
        return {
          ...sem,
          courses: sem.courses.map(c => {
            if (c.id !== courseId) return c;
            return { ...c, excludeFromGWA: !c.excludeFromGWA };
          })
        };
      });
    });
  };

  // Helper to get semester specific GWA
  const getSemesterGWA = (sem) => {
    const semGwa = calculateGWA([sem]);
    return semGwa > 0 ? semGwa.toFixed(4) : 'N/A';
  };

  const validGrades = ['1.0', '1.25', '1.5', '1.75', '2.0', '2.25', '2.5', '2.75', '3.0', '4.0', '5.0', 'INC', 'DRP'];

  return (
    <div className="container">
      <div className="flex-between mb-4">
        <h2 style={{ fontSize: '1.25rem' }}>Academic Record</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setIsSemModalOpen(true)}
          style={{ width: 'auto', padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px' }}
        >
          <Calendar size={14} /> Add Semester
        </button>
      </div>

      {semesters.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px 20px' }}>
          <p>No semesters found.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '10px' }}>
            Go to the Settings tab to fetch your grades from AMIS, or click "Add Semester" to build your record manually.
          </p>
        </div>
      ) : (
        semesters.map(sem => {
          const isOpen = !!expandedSems[sem.id];
          return (
            <div key={sem.id} style={{ marginBottom: '16px' }}>
              <div className="semester-header" onClick={() => toggleSemester(sem.id)}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{sem.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', textAlign: 'left' }}>
                    Sem GWA: <strong className="text-success">{getSemesterGWA(sem)}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {isOpen && (
                <div className="card" style={{ padding: '0', borderRadius: '12px', overflow: 'hidden', marginTop: '-4px', borderTop: 'none', borderTopLeftRadius: '0', borderTopRightRadius: '0' }}>
                  {sem.courses.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem' }}>No courses in this semester yet.</p>
                    </div>
                  ) : (
                    <div>
                      {/* Table Header */}
                      <div className="course-item" style={{ borderBottom: '2px solid var(--border-color)', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        <span>Course</span>
                        <span className="text-center">Units</span>
                        <span className="text-center">Grade</span>
                        <span className="text-center">GWA?</span>
                      </div>

                      {/* Course Row */}
                      {sem.courses.map(course => (
                        <div key={course.id} className="course-item">
                          <div onClick={() => handleOpenEditCourse(sem.id, course)} style={{ cursor: 'pointer' }}>
                            <div className="course-code">{course.code}</div>
                            <div className="course-title">{course.title || 'No Title'}</div>
                          </div>
                          <div className="course-units">{course.units} u</div>
                          <div className="course-grade" style={{ color: course.excludeFromGWA ? 'var(--text-muted)' : 'var(--primary-color)' }}>
                            {course.grade !== null ? course.grade : 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <input 
                              type="checkbox" 
                              className="exclude-checkbox" 
                              checked={!course.excludeFromGWA} 
                              onChange={() => toggleExcludeCourse(sem.id, course.id)}
                              title={course.excludeFromGWA ? "Exclude from GWA" : "Include in GWA"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions inside semester card */}
                  <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleOpenAddCourse(sem.id)}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }}
                    >
                      <Plus size={14} /> Add Course
                    </button>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleDeleteSemester(sem.id, sem.name)}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px', color: 'var(--color-error)', borderColor: 'var(--border-color)' }}
                    >
                      <Trash2 size={14} /> Delete Sem
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Add / Edit Course Drawer (Bottom Sheet) */}
      {isSheetOpen && (
        <div className="modal-overlay" onClick={() => setIsSheetOpen(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <div className="sheet-header">
              <h3 style={{ fontSize: '1.2rem' }}>{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
            </div>
            
            <form onSubmit={handleSaveCourse}>
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. CMSC 150" 
                  value={courseCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCourseCode(val);
                    // Auto-exclude PE/NSTP courses
                    const upper = val.trim().toUpperCase();
                    if (upper.startsWith("PE") || upper.startsWith("HK") || upper.startsWith("NSTP")) {
                      setCourseExclude(true);
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Scientific Computing" 
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Units</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    className="form-control" 
                    value={courseUnits}
                    onChange={(e) => setCourseUnits(parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select 
                    className="form-control"
                    value={courseGrade}
                    onChange={(e) => setCourseGrade(e.target.value)}
                  >
                    {validGrades.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '2px' }}>Exclude from GWA</label>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Required for PE, NSTP, and non-credit courses.</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={courseExclude} 
                    onChange={(e) => setCourseExclude(e.target.checked)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                {editingCourse && (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      handleDeleteCourse(activeSemId, editingCourse.id);
                      setIsSheetOpen(false);
                    }}
                    style={{ flex: 1 }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Semester Dialog Modal */}
      {isSemModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSemModalOpen(false)} style={{ alignItems: 'center', padding: '16px' }}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '380px', marginBottom: '0', padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Add Semester</h3>
            <form onSubmit={handleAddSemester}>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 2025-2026" 
                  value={semYear}
                  onChange={(e) => setSemYear(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Term</label>
                <select 
                  className="form-control"
                  value={semTerm}
                  onChange={(e) => setSemTerm(e.target.value)}
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Midyear Term">Midyear Term</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsSemModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
