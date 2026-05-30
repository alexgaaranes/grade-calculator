// Default mock grades extracted from the user's grades.py script
// grades = [1, 1, 1, 1, 1.25, 1, 1.25, 1.25, 1.75, 1.75, 1.25, 1, 1, 1, 1.25, 1.25, 1.25, 1, 1, 1, 2, 1.5, 1.25, 1.25, 1, 2, 1.5, 1.75, 1.75, 1.25, 1.5, 1.25]
const RAW_GRADES = [
  1.0, 1.0, 1.0, 1.0, 1.25, 1.0, 1.25, 1.25, 
  1.75, 1.75, 1.25, 1.0, 1.0, 1.0, 1.25, 1.25, 
  1.25, 1.0, 1.0, 1.0, 2.0, 1.5, 1.25, 1.25, 
  1.0, 2.0, 1.5, 1.75, 1.75, 1.25, 1.5, 1.25
];

export const DEFAULT_STUDENT_INFO = {
  name: "ELIXIR S. COLOGNE",
  studentNumber: "2023-45678",
  program: "B.S. Computer Science",
  college: "College of Arts and Sciences (CAS)",
  campus: "UP Los Baños",
  curriculumUnits: 142 // Total units required for BS CS
};

export const DEFAULT_SEMESTERS = [
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
      { id: "c-7", code: "HK 11", title: "Wellness and Motor Behavior", grade: 1.25, units: 2, excludeFromGWA: true }, // PE is excluded from GWA
      { id: "c-8", code: "NSTP 1", title: "National Service Training Program I", grade: 1.25, units: 3, excludeFromGWA: true } // NSTP is excluded
    ]
  },
  {
    id: "2023-2",
    name: "A.Y. 2023-2024, 2nd Semester",
    courses: [
      { id: "c-9", code: "CMSC 21", title: "Computer Organization and Assembly Language", grade: 1.75, units: 3, excludeFromGWA: false },
      { id: "c-10", code: "CMSC 56", title: "Discrete Mathematical Structures in CS I", grade: 1.75, units: 3, excludeFromGWA: false },
      { id: "c-11", code: "MATH 28", title: "Analytic Geometry & Calculus II", grade: 1.25, units: 3, excludeFromGWA: false },
      { id: "c-12", code: "STAT 1", title: "Elementary Statistics", grade: 1.0, units: 3, excludeFromGWA: false },
      { id: "c-13", code: "ARTS 1", title: "Critical Perspectives in the Arts", grade: 1.0, units: 3, excludeFromGWA: false },
      { id: "c-14", code: "HIST 1", title: "Philippine History", grade: 1.0, units: 3, excludeFromGWA: false },
      { id: "c-15", code: "HK 12", title: "Basic Swimming", grade: 1.25, units: 2, excludeFromGWA: true },
      { id: "c-16", code: "NSTP 2", title: "National Service Training Program II", grade: 1.25, units: 3, excludeFromGWA: true }
    ]
  },
  {
    id: "2024-1",
    name: "A.Y. 2024-2025, 1st Semester",
    courses: [
      { id: "c-17", code: "CMSC 22", title: "Object-Oriented Programming", grade: 1.25, units: 3, excludeFromGWA: false },
      { id: "c-18", code: "CMSC 57", title: "Discrete Mathematical Structures in CS II", grade: 1.0, units: 3, excludeFromGWA: false },
      { id: "c-19", code: "MATH 101", title: "Elementary Linear Algebra", grade: 1.0, units: 3, excludeFromGWA: false },
      { id: "c-20", code: "GE Plan", title: "Science, Technology & Society", grade: 1.0, units: 3, excludeFromGWA: false },
      { id: "c-21", code: "CMSC 123", title: "Data Structures", grade: 2.0, units: 3, excludeFromGWA: false },
      { id: "c-22", code: "ETHICS 1", title: "Ethics and Moral Reasoning in Everyday Life", grade: 1.5, units: 3, excludeFromGWA: false },
      { id: "c-23", code: "HK 13", title: "Aerobics", grade: 1.25, units: 2, excludeFromGWA: true },
      { id: "c-24", code: "CMSC 150", title: "Scientific Computing", grade: 1.25, units: 3, excludeFromGWA: false }
    ]
  },
  {
    id: "2024-2",
    name: "A.Y. 2024-2025, 2nd Semester",
    courses: [
      { id: "c-25", code: "CMSC 124", title: "Design and Implementation of Programming Languages", grade: 1.0, units: 3, excludeFromGWA: false },
      { id: "c-26", code: "CMSC 125", title: "Operating Systems", grade: 2.0, units: 3, excludeFromGWA: false },
      { id: "c-27", code: "CMSC 131", title: "Introduction to Computer Systems", grade: 1.5, units: 3, excludeFromGWA: false },
      { id: "c-28", code: "CMSC 141", title: "Formal Languages and Automata Theory", grade: 1.75, units: 3, excludeFromGWA: false },
      { id: "c-29", code: "SOSC 3", title: "Gender and Sexuality", grade: 1.75, units: 3, excludeFromGWA: false },
      { id: "c-30", code: "PI 10", title: "The Life and Works of Jose Rizal", grade: 1.25, units: 3, excludeFromGWA: false },
      { id: "c-31", code: "CMSC 137", title: "Data Communication and Networking", grade: 1.5, units: 3, excludeFromGWA: false },
      { id: "c-32", code: "CMSC 127", title: "File Processing and Database Systems", grade: 1.25, units: 3, excludeFromGWA: false }
    ]
  }
];

// Helper to determine if a course is HK or NSTP
export const shouldAutoExclude = (code) => {
  if (!code) return false;
  const upper = code.toUpperCase();
  // UPLB officially uses HK (Human Kinetics) for physical education
  return upper.startsWith("HK") || upper.startsWith("PE") || upper.startsWith("NSTP") || upper.startsWith("KASHP");
};

// Calculate GWA
export const calculateGWA = (semesters) => {
  let totalGradePoints = 0;
  let totalGwaUnits = 0;

  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      // Exclude courses marked for exclusion, and ignore incomplete/dropped grades
      if (!course.excludeFromGWA && !isNaN(course.grade) && course.grade !== null) {
        // Only count valid numerical grades (1.0 to 3.0, and 5.0)
        const gradeVal = parseFloat(course.grade);
        if (gradeVal >= 1.0 && gradeVal <= 5.0) {
          totalGradePoints += gradeVal * course.units;
          totalGwaUnits += course.units;
        }
      }
    });
  });

  return totalGwaUnits > 0 ? (totalGradePoints / totalGwaUnits) : 0;
};

// Calculate total units (including HK/NSTP that are passed)
export const calculateTotalUnits = (semesters) => {
  let totalUnits = 0;
  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      // If student passed (1.0 to 3.0) or it's a pass/fail grade
      if (course.grade !== null && !isNaN(course.grade)) {
        const gradeVal = parseFloat(course.grade);
        if (gradeVal <= 3.00) {
          totalUnits += course.units;
        }
      }
    });
  });
  return totalUnits;
};

// Check for Latin Honors eligibility and details
// UPLB rules: 
// - Summa: GWA <= 1.20
// - Magna: GWA <= 1.45
// - Cum Laude: GWA <= 1.75
// - No grade of 5.00, DRP or unremoved INC in academic courses
export const getHonorsStatus = (gwa, semesters) => {
  if (gwa <= 0) return { title: "N/A", color: "muted", nextTarget: "Cum Laude", nextTargetGwa: 1.75, status: "No data" };
  
  let hasFailingGrade = false;
  let hasIncomplete = false;
  let hasDropped = false;

  semesters.forEach(sem => {
    sem.courses.forEach(course => {
      if (course.grade !== null) {
        const gradeStr = String(course.grade).toUpperCase();
        if (parseFloat(course.grade) === 5.0) hasFailingGrade = true;
        if (gradeStr.includes("INC")) hasIncomplete = true;
        if (gradeStr.includes("DRP")) hasDropped = true;
      }
    });
  });

  let honorsTitle = "No Honors";
  let badgeColor = "muted";
  let targetTitle = "";
  let targetGwa = 0;

  if (gwa <= 1.20) {
    honorsTitle = "Summa Cum Laude";
    badgeColor = "gold";
  } else if (gwa <= 1.45) {
    honorsTitle = "Magna Cum Laude";
    badgeColor = "primary";
    targetTitle = "Summa Cum Laude";
    targetGwa = 1.20;
  } else if (gwa <= 1.75) {
    honorsTitle = "Cum Laude";
    badgeColor = "secondary";
    targetTitle = "Magna Cum Laude";
    targetGwa = 1.45;
  } else {
    targetTitle = "Cum Laude";
    targetGwa = 1.75;
  }

  // Warnings if they have disqualified grades
  const warnings = [];
  if (hasFailingGrade) warnings.push("Has a grade of 5.00");
  if (hasIncomplete) warnings.push("Has an Incomplete (INC) grade");
  if (hasDropped) warnings.push("Has a Dropped (DRP) grade");

  const eligible = warnings.length === 0;

  return {
    title: honorsTitle,
    color: badgeColor,
    eligible,
    warnings,
    nextTarget: targetTitle,
    nextTargetGwa: targetGwa,
    diffToNext: targetGwa > 0 ? (gwa - targetGwa).toFixed(4) : null
  };
};

// Calculate average grade required in remaining units
export const calculateRequiredAverage = (currentGWA, currentUnits, targetGWA, remainingUnits) => {
  if (remainingUnits <= 0) return null;
  // GWA_target = (GWA_curr * U_curr + GWA_rem * U_rem) / (U_curr + U_rem)
  // GWA_rem * U_rem = GWA_target * (U_curr + U_rem) - GWA_curr * U_curr
  // GWA_rem = (GWA_target * (U_curr + U_rem) - GWA_curr * U_curr) / U_rem
  const targetPoints = targetGWA * (currentUnits + remainingUnits);
  const currentPoints = currentGWA * currentUnits;
  const neededAverage = (targetPoints - currentPoints) / remainingUnits;
  return neededAverage;
};

// Parse UPLB AMIS grades response stream
export const parseAmisGrades = (data) => {
  try {
    // ------------------------------------------------------------------
    // Real AMIS API structure (with ?summarize=true):
    //
    // {
    //   "student_grades": {
    //     "1231": {                          // term ID key
    //       "values": [                      // array of course grade records
    //         {
    //           "unit_taken": "3",           // string!
    //           "grade": "1.00",             // string!
    //           "course": {
    //             "course_code": "CMSC 12",
    //             "title": "Foundations of Computer Science"
    //           },
    //           "grade_term": {
    //             "term_id": 1231,
    //             "term": "First Semester",
    //             "ay": "2023-2024"
    //           }
    //         }, ...
    //       ],
    //       "units_taken": 21,
    //       "gwa": 1.12,
    //       "term": "First Semester 2023-2024"
    //     },
    //     "1232": { ... }
    //   }
    // }
    // ------------------------------------------------------------------

    // Handle the real AMIS structure: { student_grades: { ... } }
    if (data.student_grades && typeof data.student_grades === 'object') {
      const termEntries = Object.entries(data.student_grades);

      // Sort by term key numerically so semesters appear in chronological order
      termEntries.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

      return termEntries.map(([termKey, semData]) => {
        // Build a readable semester name from the term label or from grade_term
        const semName = semData.term 
          || `Term ${termKey}`;

        // Construct a display name like "A.Y. 2023-2024, First Semester"
        const firstCourse = semData.values?.[0];
        const ay = firstCourse?.grade_term?.ay;
        const termLabel = firstCourse?.grade_term?.term;
        const displayName = (ay && termLabel)
          ? `A.Y. ${ay}, ${termLabel}`
          : semName;

        const courses = (semData.values || []).map((record, idx) => {
          const code = record.course?.course_code || "UNKNOWN";
          const title = record.course?.title || record.course?.course_code_title || "";

          // Grade comes as a string like "1.00", "INC", "DRP", "P", "S"
          const gradeRaw = record.grade;
          let gradeParsed = null;
          if (gradeRaw !== undefined && gradeRaw !== null) {
            const floatGrade = parseFloat(gradeRaw);
            gradeParsed = isNaN(floatGrade) ? String(gradeRaw) : floatGrade;
          }

          // unit_taken is a string in the API
          const units = parseFloat(record.unit_taken) || 0;

          return {
            id: `amis-${termKey}-${idx}`,
            code,
            title: title.replace(/^\(GE\)\.\s*/, ''), // strip "(GE). " prefix for cleanliness
            grade: gradeParsed,
            units,
            excludeFromGWA: shouldAutoExclude(code) || record.status === 'DROPPED'
          };
        });

        return {
          id: termKey,
          name: displayName,
          courses
        };
      });
    }

    // ------------------------------------------------------------------
    // Fallback parsers for alternative AMIS layouts
    // ------------------------------------------------------------------

    // Legacy: { semesters: [ { name, courses: [...] } ] }
    if (data.semesters && Array.isArray(data.semesters)) {
      return data.semesters.map((s, idx) => ({
        id: s.id || `sem-${idx}`,
        name: s.name || s.term || s.school_year,
        courses: (s.courses || []).map((c, cidx) => ({
          id: c.id || `course-${idx}-${cidx}`,
          code: c.code || c.subject_code,
          title: c.title || c.subject_title || "",
          grade: parseFloat(c.grade) || c.grade,
          units: parseFloat(c.units) || 3,
          excludeFromGWA: c.exclude || shouldAutoExclude(c.code || c.subject_code)
        }))
      }));
    }

    // Legacy: flat array of records
    const records = Array.isArray(data) ? data : (data.grades || data.records || []);
    if (records.length === 0) {
      return [];
    }

    let semestersMap = {};
    records.forEach((record, index) => {
      const sy = record.school_year || record.academic_year || "Unknown A.Y.";
      const term = record.term || record.semester || "1st Semester";
      const semKey = `${sy}_${term}`;
      
      if (!semestersMap[semKey]) {
        semestersMap[semKey] = {
          id: semKey,
          name: `${sy}, ${term}`,
          courses: []
        };
      }
      
      const gradeRaw = record.grade;
      let gradeParsed = null;
      if (gradeRaw !== undefined && gradeRaw !== null) {
        const floatGrade = parseFloat(gradeRaw);
        gradeParsed = isNaN(floatGrade) ? String(gradeRaw) : floatGrade;
      }
      
      const code = record.subject_code || record.course_code || record.code || "UNKNOWN";
      const units = parseFloat(record.units || record.credit || 3);
      
      semestersMap[semKey].courses.push({
        id: `amis-${index}`,
        code,
        title: record.subject_title || record.course_title || record.title || "",
        grade: gradeParsed,
        units,
        excludeFromGWA: shouldAutoExclude(code) || !!record.exclude
      });
    });
    
    const parsed = Object.values(semestersMap);
    return parsed.sort((a, b) => a.id.localeCompare(b.id));
  } catch (err) {
    console.error("Error parsing AMIS Grades:", err);
    throw new Error("Invalid UPLB AMIS grades data format. Please make sure you copied the correct JSON response.");
  }
};
