
import { gradePointMap, gradeColors, StudentRecord } from './types';

// Helper function to get color for a specific grade
export const getGradeColor = (grade: string): string => {
  return gradeColors[grade] || '#9ca3af'; // Default gray
};

// Helper function to format numbers to exactly 2 decimal places
export const formatTo2Decimals = (value: number): number => {
  return Number(value.toFixed(2));
};

// Helper function to get unique department codes from the records - Keeping for backward compatibility but not used
export const getUniqueDepartmentCodes = (records: StudentRecord[]): string[] => {
  return [...new Set(records.map(record => record.CNo))].filter(code => code);
};

// Calculate SGPA for a given student
export const calculateSGPA = (records: StudentRecord[], studentId: string): number => {
  // Get all records for this student, but exclude those not marked as current semester
  // The records passed to this function should already be filtered for explicit current semester subjects
  const studentRecords = records.filter(record => 
    record.REGNO === studentId
  );
  
  let totalCredits = 0;
  let weightedSum = 0;

  studentRecords.forEach(record => {
    if (record.GR in gradePointMap) {
      const gradePoint = gradePointMap[record.GR];
      const creditValue = record.creditValue || 0;

      weightedSum += gradePoint * creditValue;
      totalCredits += creditValue;
    }
  });

  // Log the detailed calculation for debugging
  console.log(`SGPA calculation for student ${studentId}: ${weightedSum} / ${totalCredits} = ${totalCredits === 0 ? 0 : weightedSum / totalCredits}`);
  
  // Ensure exactly 2 decimal places with proper rounding
  return totalCredits === 0 ? 0 : formatTo2Decimals(weightedSum / totalCredits);
};

// Calculate CGPA from multiple semesters (files)
export const calculateCGPA = (
  records: StudentRecord[], 
  studentId: string, 
  fileGroups: { [fileName: string]: StudentRecord[] }
): number => {
  const allSemesters = Object.keys(fileGroups);
  if (allSemesters.length <= 1) {
    // If only one semester, CGPA is the same as SGPA
    return calculateSGPA(records, studentId);
  }
  
  let totalCredits = 0;
  let totalWeightedSum = 0;
  
  // For each semester (file)
  allSemesters.forEach(semester => {
    const semesterRecords = fileGroups[semester];
    
    // Check if we have explicitly marked current semester subjects
    const markedCurrentSemesterRecords = semesterRecords.filter(record => 
      record.REGNO === studentId && record.isArrear === true
    );
    
    // Use explicitly marked subjects if available, otherwise use non-arrear subjects
    const studentSemRecords = markedCurrentSemesterRecords.length > 0
      ? markedCurrentSemesterRecords
      : semesterRecords.filter(record => 
          record.REGNO === studentId && !record.isArrear
        );
    
    console.log(`CGPA calculation for student ${studentId} in semester ${semester}: Using ${studentSemRecords.length} records`);
    
    // Calculate this semester's contribution
    let semCredits = 0;
    let semWeightedSum = 0;
    
    studentSemRecords.forEach(record => {
      if (record.GR in gradePointMap) {
        const gradePoint = gradePointMap[record.GR];
        const creditValue = record.creditValue || 0;
        
        semWeightedSum += gradePoint * creditValue;
        semCredits += creditValue;
      }
    });
    
    console.log(`Semester ${semester} contribution: ${semWeightedSum} grade points from ${semCredits} credits`);
    
    // Add to overall totals
    totalWeightedSum += semWeightedSum;
    totalCredits += semCredits;
  });
  
  const cgpa = totalCredits === 0 ? 0 : formatTo2Decimals(totalWeightedSum / totalCredits);
  console.log(`Final CGPA for student ${studentId}: ${cgpa} (${totalWeightedSum}/${totalCredits})`);
  
  // Ensure exactly 2 decimal places with proper rounding
  return cgpa;
};

// Check if student has arrears (U grade)
export const hasArrears = (records: StudentRecord[], studentId: string): boolean => {
  return records.filter(record => record.REGNO === studentId).some(record => record.GR === 'U');
};

// Get list of subjects where student has arrears
export const getSubjectsWithArrears = (records: StudentRecord[], studentId: string): string => {
  const arrearsSubjects = records.filter(record => record.REGNO === studentId && record.GR === 'U').map(record => record.SCODE);
  return arrearsSubjects.join(', ');
};

// Get student SGPA data specifically for the current semester
export const getCurrentSemesterSGPAData = (
  currentSemesterRecords: StudentRecord[]
): { id: string; sgpa: number }[] => {
  if (!currentSemesterRecords || currentSemesterRecords.length === 0) {
    console.warn("No current semester records provided to getCurrentSemesterSGPAData");
    return [];
  }

  console.log(`Raw records in getCurrentSemesterSGPAData: ${currentSemesterRecords.length}`);
  
  // Filter out arrear subjects
  const nonArrearRecords = currentSemesterRecords.filter(record => !record.isArrear);
  console.log(`Filtered out ${currentSemesterRecords.length - nonArrearRecords.length} arrear subjects`);
  
  // Check if credits are assigned properly
  const recordsWithCredits = nonArrearRecords.filter(r => r.creditValue && r.creditValue > 0);
  console.log(`Records with credits: ${recordsWithCredits.length} out of ${nonArrearRecords.length}`);
  
  if (recordsWithCredits.length === 0) {
    console.warn("WARNING: No records have credit values assigned! This will result in all SGPAs being 0.");
  }

  // Get unique student IDs from the current semester
  const studentIds = [...new Set(nonArrearRecords.map(record => record.REGNO))];
  
  console.log(`Computing SGPA for ${studentIds.length} students in current semester`);
  
  // Calculate SGPA for each student in the current semester
  const sgpaData = studentIds.map(id => {
    // Calculate SGPA using only the current semester records for this student
    const studentRecords = currentSemesterRecords.filter(record => record.REGNO === id);
    
    let totalCredits = 0;
    let weightedSum = 0;
    
    // Manual calculation to ensure we're only using current semester data
    studentRecords.forEach(record => {
      if (record.GR in gradePointMap) {
        const gradePoint = gradePointMap[record.GR];
        const creditValue = record.creditValue || 0;
        
        // Debug individual record credit values
        if (creditValue === 0) {
          console.log(`Student ${id}, Subject ${record.SCODE}: No credit value assigned`);
        }
        
        weightedSum += gradePoint * creditValue;
        totalCredits += creditValue;
      }
    });
    
    const sgpa = totalCredits === 0 ? 0 : formatTo2Decimals(weightedSum / totalCredits);
    
    console.log(`Student ${id}: SGPA = ${sgpa} (from ${studentRecords.length} records, ${totalCredits} credits)`);
    
    return {
      id,
      sgpa
    };
  });
  
  // Sort by SGPA in descending order
  const sortedData = sgpaData.sort((a, b) => b.sgpa - a.sgpa);
  
  // Log top students for debugging
  console.log(`Top current semester students: ${JSON.stringify(sortedData.slice(0, 3), null, 2)}`);
  
  return sortedData;
};
