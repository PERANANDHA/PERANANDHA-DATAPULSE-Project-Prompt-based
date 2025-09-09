
import * as XLSX from 'xlsx';
import { ResultAnalysis, StudentRecord, gradePointMap } from '../types';

// Function to download Excel report
const downloadExcelReport = (analysis: ResultAnalysis, records: StudentRecord[]): void => {
  const blob = generateExcelData(analysis, records);
  
  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'result-analysis-report.xlsx';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Generate Excel data for reports
const generateExcelData = (analysis: ResultAnalysis, records: StudentRecord[]): Blob => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Helper function to add a sheet to the workbook
  const addSheet = (data: any[][], name: string, header: string[]) => {
    const ws = XLSX.utils.aoa_to_sheet([header, ...data]);
    
    // Set column widths
    const cols = header.map(() => ({ wch: 20 })); // Set width for each column
    ws['!cols'] = cols;
    
    XLSX.utils.book_append_sheet(workbook, ws, name);
  };
  
  // College Information
  const collegeInfoData = [
    ["College Name", "K. S. Rangasamy College of Technology"],
    ["Department", "Computer Science and Engineering"],
    ["Batch", "2023-2027"],
    ["Year/Semester", "II/III"],
    ["Section", "A&B"],
  ];
  
  // Performance Summary Data
  const performanceData = [
    ["Total Students", analysis.totalStudents],
    ["Average SGPA", analysis.averageCGPA.toFixed(2)],
    ["Highest SGPA", analysis.highestSGPA.toFixed(2)],
    ["Lowest SGPA", analysis.lowestSGPA.toFixed(2)],
  ];

  // Add file information if multiple files were used
  if (analysis.fileCount && analysis.fileCount > 1 && analysis.filesProcessed) {
    performanceData.push(["Number of Files Processed", analysis.fileCount]);
    
    // Add individual file analysis
    if (analysis.fileWiseAnalysis) {
      Object.entries(analysis.fileWiseAnalysis).forEach(([fileName, fileData]) => {
        performanceData.push([`${fileName} Average SGPA`, fileData.averageSGPA.toFixed(2)]);
        performanceData.push([`${fileName} Students`, fileData.students]);
        if (fileData.semesterName) {
          performanceData.push([`${fileName} Semester`, fileData.semesterName]);
        }
      });
    }
    
    // Add CGPA data if available
    if (analysis.cgpaAnalysis) {
      performanceData.push(["Average CGPA", analysis.cgpaAnalysis.averageCGPA.toFixed(2)]);
      performanceData.push(["Highest CGPA", analysis.cgpaAnalysis.highestCGPA.toFixed(2)]);
      performanceData.push(["Lowest CGPA", analysis.cgpaAnalysis.lowestCGPA.toFixed(2)]);
    }
  }

  // Get unique subjects, prioritizing the order specified in orderedSubjects
  let uniqueSubjects: string[] = [];
  
  // First, add subjects in the specified order (if available)
  if (analysis.orderedSubjects && analysis.orderedSubjects.length > 0) {
    console.log("Using ordered subjects for report:", analysis.orderedSubjects.join(', '));
    uniqueSubjects = [...analysis.orderedSubjects];
    
    // Then add any remaining subjects that might not be in the ordered list
    const allSubjects = [...new Set(records.map(record => record.SCODE))];
    allSubjects.forEach(subject => {
      if (!uniqueSubjects.includes(subject)) {
        uniqueSubjects.push(subject);
      }
    });
  } else {
    // If no order is specified, use the default set
    uniqueSubjects = [...new Set(records.map(record => record.SCODE))];
  }
  
  console.log("Final subject order for report:", uniqueSubjects.join(', '));
  
  // Subject-wise Performance Data (End Semester Result Analysis)
  const subjectPerformanceHeader = ["S.No", "Subject Code", "Subject Name", "Faculty Name", "Dept", "App", "Absent", "Fail", "WH", "Passed", "% of pass", "Highest Grade", "No. of students"];
  const subjectPerformanceData = uniqueSubjects.map((subject, index) => {
    const subjectRecords = records.filter(record => record.SCODE === subject);
    const totalStudents = subjectRecords.length;
    const passedStudents = subjectRecords.filter(record => record.GR !== 'U').length;
    const failedStudents = totalStudents - passedStudents;
    const passPercentage = (passedStudents / totalStudents) * 100;
    
    // Find subject name and faculty name if available
    const sampleRecord = subjectRecords[0];
    const subjectName = sampleRecord?.subjectName || `Subject ${index + 1}`;
    const facultyName = sampleRecord?.facultyName || '';
    
    // Find the highest grade
    const grades = subjectRecords.map(record => record.GR);
    const highestGrade = grades.sort((a, b) => (gradePointMap[b] || 0) - (gradePointMap[a] || 0))[0];
    
    // Count students with highest grade
    const studentsWithHighestGrade = subjectRecords.filter(record => record.GR === highestGrade).length;
    
    return [
      index + 1,
      subject,
      subjectName,
      facultyName,
      "CSE", // Department - now hardcoded to CSE since we no longer track department
      totalStudents,
      "Nil", // Absent
      failedStudents || "Nil", 
      1, // WH
      passedStudents,
      passPercentage.toFixed(1),
      highestGrade,
      studentsWithHighestGrade
    ];
  });

  // Grade Distribution Data
  const gradeDistributionHeader = ["Grade", "Count", "Percentage"];
  const gradeDistributionData = analysis.gradeDistribution.map(grade => [
    grade.name,
    grade.count,
    analysis.totalGrades > 0 ? ((grade.count / analysis.totalGrades) * 100).toFixed(2) + "%" : "0%"
  ]);

  // Top Performers Data
  const topPerformersHeader = ["S.No", "Name of the student", "SGPA"];
  const topPerformersData = analysis.topPerformers.map((student, index) => [
    index + 1,
    student.id,
    student.sgpa.toFixed(2)
  ]);

  // CGPA Top Performers if available
  let cgpaTopPerformersData: any[][] = [];
  if (analysis.cgpaAnalysis && analysis.cgpaAnalysis.studentCGPAs) {
    cgpaTopPerformersData = analysis.cgpaAnalysis.studentCGPAs
      .sort((a, b) => b.cgpa - a.cgpa)
      .slice(0, 5)
      .map((student, index) => [
        index + 1,
        student.id,
        student.cgpa.toFixed(2)
      ]);
  }

  // Classification Data
  const currentSemesterData = [
    ["Distinction", 40, "First class", "WOA", 65, "WA", 3, "Second class", "WOA", 5, "WA", 16, "Fail", 18, "% of pass", 71.6]
  ];

  // Category and Grade Point data
  const categoryData = [
    ["Category", "Grade Point"],
    ["1. Distinction", ">= 8.5 and no history of arrears"],
    ["2. First class", ">= 6.5"],
    ["3. Second class", "< 6.5"]
  ];

  // Add sheets for each analysis
  addSheet(collegeInfoData, "College Information", ["Field", "Value"]);
  addSheet(performanceData, "Performance Summary", ["Metric", "Value"]);
  addSheet(subjectPerformanceData, "End Semester Result Analysis", subjectPerformanceHeader);
  addSheet(gradeDistributionData, "Grade Distribution", gradeDistributionHeader);
  addSheet(topPerformersData, "Rank in this semester", topPerformersHeader);
  
  // Add CGPA rankings if multiple files
  if (cgpaTopPerformersData.length > 0) {
    addSheet(cgpaTopPerformersData, "Rank up to this semester", ["S.No", "Name of the student", "CGPA"]);
  }
  
  addSheet(currentSemesterData, "Classification", ["Current semester", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
  addSheet(categoryData, "Categories", ["Category", "Grade Point"]);
  
  // Student-wise SGPA Details Data
  const studentSgpaDetailsHeader = ["Registration Number", "SGPA", "Status"];
  const studentSgpaDetailsData = analysis.studentSgpaDetails?.map(student => [
    student.id,
    student.sgpa.toFixed(2),
    student.hasArrears ? 'Has Arrears' : (student.sgpa < 6.5 ? 'SGPA below 6.5' : 'Good Standing')
  ]) || [];
  
  // CGPA details if available
  let cgpaDetailsData: any[][] = [];
  if (analysis.cgpaAnalysis && analysis.cgpaAnalysis.studentCGPAs) {
    cgpaDetailsData = analysis.cgpaAnalysis.studentCGPAs.map(student => [
      student.id,
      student.cgpa.toFixed(2)
    ]);
  }

  addSheet(studentSgpaDetailsData, "Student SGPA Details", studentSgpaDetailsHeader);
  
  // Add CGPA details if multiple files were processed
  if (cgpaDetailsData.length > 0) {
    addSheet(cgpaDetailsData, "Student CGPA Details", ["Registration Number", "CGPA"]);
  }
  
  // Add file details to the workbook if multiple files were processed
  if (analysis.fileCount && analysis.fileCount > 1 && analysis.filesProcessed) {
    const fileDetailsHeader = ["File Name", "Record Count", "Semester"];
    const fileDetailsData = analysis.filesProcessed.map(fileName => {
      const fileRecordCount = records.filter(record => record.fileSource === fileName).length;
      const semester = records.find(record => record.fileSource === fileName)?.SEM || 'Unknown';
      return [fileName, fileRecordCount, semester];
    });
    addSheet(fileDetailsData, "File Details", fileDetailsHeader);
  }

  // Convert the workbook to a binary string and create a Blob
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  
  // Convert binary string to ArrayBuffer
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF;
  }
  
  // Create and return Blob
  return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

// Export the functions once at the end of the file
export { downloadExcelReport, generateExcelData };
