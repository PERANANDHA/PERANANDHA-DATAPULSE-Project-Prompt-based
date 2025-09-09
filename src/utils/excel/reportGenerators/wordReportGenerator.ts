import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ImageRun, VerticalAlign, VerticalMergeType } from 'docx';
import { ResultAnalysis, StudentRecord, gradePointMap } from '../types';
import { calculateSGPA, calculateCGPA, getCurrentSemesterSGPAData } from '../gradeUtils';

interface WordReportOptions {
  logoImagePath?: string;
  department?: string;
  departmentFullName?: string;
  calculationMode: 'sgpa' | 'cgpa';
}

export const downloadWordReport = async (
  analysis: ResultAnalysis, 
  records: StudentRecord[],
  options: WordReportOptions
): Promise<void> => {
  // Log important debug information
  console.log("======= WORD REPORT GENERATION =======");
  console.log(`Total records passed to report: ${records.length}`);
  
  // Check which records have subject/faculty names
  const recordsWithSubjectNames = records.filter(r => r.subjectName && r.subjectName.trim() !== '');
  const recordsWithFacultyNames = records.filter(r => r.facultyName && r.facultyName.trim() !== '');
  
  console.log(`Records with subject names: ${recordsWithSubjectNames.length}/${records.length}`);
  console.log(`Records with faculty names: ${recordsWithFacultyNames.length}/${records.length}`);
  
  // Sample some records to verify data
  if (recordsWithSubjectNames.length > 0) {
    console.log("Sample records with subject names:", 
      recordsWithSubjectNames.slice(0, 3).map(r => 
        `${r.SCODE}: "${r.subjectName}"`
      )
    );
  }
  
  if (recordsWithFacultyNames.length > 0) {
    console.log("Sample records with faculty names:", 
      recordsWithFacultyNames.slice(0, 3).map(r => 
        `${r.SCODE}: "${r.facultyName}"`
      )
    );
  }
  
  // Check if we need to recalculate averageCGPA and averageSGPA for current semester subjects
  console.log("Report generation - checking for current semester subjects...");
  
  // Log the current values
  if (options.calculationMode === 'sgpa') {
    console.log(`Average SGPA in report: ${analysis.averageCGPA}`);
  } else if (analysis.cgpaAnalysis) {
    console.log(`Average CGPA in report: ${analysis.cgpaAnalysis.averageCGPA}`);
  }
  
  // Prepare document
  const doc = await createWordDocument(analysis, records, options);
  
  // Save the document
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = options.calculationMode === 'sgpa' 
    ? 'sgpa-analysis-report.docx' 
    : 'cgpa-analysis-report.docx';
  
  console.log("Word document ready for download!");
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  console.log("======= END WORD REPORT GENERATION =======");
};

const createWordDocument = async (
  analysis: ResultAnalysis, 
  records: StudentRecord[],
  options: WordReportOptions
): Promise<Document> => {
  // Destructure options with defaults
  const { 
    logoImagePath = "/lovable-uploads/e199a42b-b04e-4918-8bb4-48f3583e7928.png",
    department = "CSE",
    departmentFullName = "Computer Science and Engineering",
    calculationMode
  } = options;
  
  // Create sections for the document
  const sections = [];
  
  // Process header image
  let headerImage;
  
  try {
    if (logoImagePath) {
      const response = await fetch(logoImagePath);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      headerImage = new ImageRun({
        data: arrayBuffer,
        transformation: {
          width: 40,  // Further reduced from 50 to 40 to make it even more compact
          height: 40,  // Further reduced from 50 to 40 to match
        },
      });
    }
  } catch (error) {
    console.error("Error loading logo image:", error);
    // Continue without the image if there's an error
  }
  
  // IMPROVED: Header table with further optimized layout and spacing
  const headerTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
    // UPDATED: Column widths adjusted to make the header more compact
    columnWidths: [800, 7000, 2200],  // Reduced logo column, increased middle column
    rows: [
      new TableRow({
        children: [
          // First cell - Logo - Further optimized
          new TableCell({
            width: {
              size: 8,  // Reduced from 10 to 8 to match the plan
              type: WidthType.PERCENTAGE,
            },
            children: headerImage 
              ? [new Paragraph({ 
                  alignment: AlignmentType.CENTER,
                  children: [headerImage] 
                })]
              : [new Paragraph("Logo")],
            verticalAlign: VerticalAlign.CENTER,
            margins: {
              top: 60,   // Reduced from 80 to 60
              bottom: 60, // Reduced from 80 to 60
              left: 80,   // Reduced from 100 to 80
              right: 80    // Reduced from 100 to 80
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          // Middle cell - College name - Adjusted width to balance smaller logo cell
          new TableCell({
            width: {
              size: 69,  // Increased from 67 to 69 to balance smaller logo cell
              type: WidthType.PERCENTAGE,
            },
            children: [
              // First line - College name part 1
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 80,  // Reduced from 100 to 80
                },
                children: [
                  new TextRun({
                    text: "K.S. RANGASAMY COLLEGE OF TECHNOLOGY,",
                    bold: true,
                    size: 24,  // Reduced from 26 to 24
                  }),
                ],
              }),
              // Second line - College name part 2
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: {
                  after: 80,  // Reduced from 100 to 80
                },
                children: [
                  new TextRun({
                    text: "TIRUCHENGODE - 637 215",
                    bold: true,
                    size: 24,  // Reduced from 26 to 24
                  }),
                ],
              }),
              // Third line - Affiliation text
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "(An Autonomous Institute Affiliated to Anna University, Chennai)",
                    bold: false,
                    size: 18,  // Reduced from 20 to 18
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: {
              top: 120,  // Reduced from 140 to 120
              bottom: 120, // Reduced from 140 to 120
              left: 80,  // Reduced from 120 to 80
              right: 80   // Reduced from 120 to 80
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          // Last cell - RESULT ANALYSIS - Slightly adjusted
          new TableCell({
            width: {
              size: 23,  // Unchanged
              type: WidthType.PERCENTAGE,
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "RESULT ANALYSIS",
                    bold: true,
                    size: 22,  // Reduced from 24 to 22
                  }),
                ],
              }),
            ],
            verticalAlign: VerticalAlign.CENTER,
            margins: {
              top: 80,  // Reduced from 100 to 80
              bottom: 80, // Reduced from 125 to 80
              left: 80,  // Reduced from 120 to 80
              right: 80   // Reduced from 120 to 80
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
        ],
      }),
    ],
  });
  
  sections.push(headerTable);
  
  // Add less space after header
  sections.push(
    new Paragraph({
      spacing: {
        after: 150, // Reduced from 200 to 150
      },
    })
  );
  
  // College Information Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "College Information",
          bold: true,
          size: 28,
          color: "2E3192",
        }),
      ],
      spacing: {
        after: 100,
      },
    }),
  );
  
  // Determine current semester data for CGPA mode
  let currentSemesterRecords = records;
  let semesterLabel = '';
  let fileCount = 0;
  let calculationModeDisplay = calculationMode === 'sgpa' ? "SGPA (Semester Grade Point Average)" : "CGPA (Cumulative Grade Point Average)";
  
  if (analysis.fileCount) {
    fileCount = analysis.fileCount;
  }
  
  if (calculationMode === 'cgpa' && analysis.fileCount && analysis.fileCount > 1) {
    // Use the current semester file determined by the analyzer (highest semester)
    const currentSemFile = analysis.currentSemesterFile || '';
    
    if (currentSemFile) {
      currentSemesterRecords = records.filter(record => record.fileSource === currentSemFile);
      
      // Get semester number from the current semester file
      if (currentSemesterRecords.length > 0) {
        semesterLabel = currentSemesterRecords[0].SEM || '';
      }
    }
  }
  
  // College Information Table
  const collegeInfoTableRows = [
    createTableRow(["College Name", "K. S. Rangasamy College of Technology"]),
    createTableRow(["Department", departmentFullName]),
    createTableRow(["Total Students", analysis.totalStudents.toString()]),
  ];
  
  // Add file count for CGPA mode
  if (calculationMode === 'cgpa' && fileCount > 0) {
    collegeInfoTableRows.push(
      createTableRow(["Files Processed", fileCount.toString()])
    );
  }
  
  // Add calculation mode
  collegeInfoTableRows.push(
    createTableRow(["Calculation Mode", calculationModeDisplay])
  );
  
  const collegeInfoTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    columnWidths: [3000, 6500], // Adjusted for better spacing and fixed width
    rows: collegeInfoTableRows,
  });
  
  sections.push(collegeInfoTable);
  
  // Add space 
  sections.push(
    new Paragraph({
      spacing: {
        after: 200,
      },
    })
  );
  
  // Performance Summary Section
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Performance Summary",
          bold: true,
          size: 28,
          color: "2E3192",
        }),
      ],
      spacing: {
        after: 100,
      },
    }),
  );
  
  // MODIFIED: Performance Text paragraphs with correct values for SGPA/CGPA mode
  const performanceParagraphs = [];
  
  if (calculationMode === 'sgpa') {
    // For SGPA mode
    performanceParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Average SGPA: ", bold: false, size: 28 }),
          new TextRun({ text: analysis.averageCGPA.toFixed(2), size: 28 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Highest SGPA: ", bold: false, size: 28 }),
          new TextRun({ text: analysis.highestSGPA.toFixed(2), size: 28 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Lowest SGPA: ", bold: false, size: 28 }),
          new TextRun({ text: analysis.lowestSGPA.toFixed(2), size: 28 }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Pass Percentage: ", bold: false, size: 28 }),
          new TextRun({ text: analysis.singleFileClassification.passPercentage.toFixed(2) + "%", size: 28 }),
        ],
      }),
    );
  } else {
    // For CGPA mode - MODIFIED to use correct CGPA values
    if (analysis.cgpaAnalysis) {
      performanceParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Average CGPA: ", bold: false, size: 28 }),
            new TextRun({ text: analysis.cgpaAnalysis.averageCGPA.toFixed(2), size: 28 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Highest CGPA: ", bold: false, size: 28 }),
            new TextRun({ text: analysis.cgpaAnalysis.highestCGPA.toFixed(2), size: 28 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Lowest CGPA: ", bold: false, size: 28 }),
            new TextRun({ text: analysis.cgpaAnalysis.lowestCGPA.toFixed(2), size: 28 }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Pass Percentage: ", bold: false, size: 28 }),
            new TextRun({ text: analysis.multipleFileClassification.passPercentage.toFixed(2) + "%", size: 28 }),
          ],
        }),
      );
    }
  }
  
  // Add performance paragraphs
  sections.push(...performanceParagraphs);
  
  // File Analysis section for CGPA mode
  if (calculationMode === 'cgpa' && analysis.fileWiseAnalysis) {
    sections.push(
      new Paragraph({
        spacing: {
          before: 200,
          after: 100,
        },
        children: [
          new TextRun({
            text: "File Analysis",
            bold: true,
            size: 28,
            color: "2E3192",
          }),
        ],
      }),
    );
    
    // Create file analysis table
    const fileAnalysisTableRows = [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("File Name"),
          createHeaderCell("Students"),
          createHeaderCell("Average SGPA"),
          createHeaderCell("Semester"),
          createHeaderCell("Note"),
        ],
      }),
    ];
    
    // Process each file
    if (analysis.filesProcessed && analysis.fileWiseAnalysis) {
      analysis.filesProcessed.forEach(fileName => {
        const fileAnalysis = analysis.fileWiseAnalysis![fileName];
        if (fileAnalysis) {
          const isCurrentSemester = fileName === analysis.currentSemesterFile;
          fileAnalysisTableRows.push(
            new TableRow({
              children: [
                createTableCell(fileName),
                createTableCell(fileAnalysis.students.toString()),
                createTableCell(fileAnalysis.averageSGPA.toFixed(2)),
                createTableCell(fileAnalysis.semesterName || ""),
                createTableCell(isCurrentSemester ? "Current Semester" : "Previous Semester"),
              ],
            })
          );
        }
      });
    }
    
    const fileAnalysisTable = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      columnWidths: [2400, 1300, 1300, 1300, 1800], // Adjusted for consistent width totaling 6.4 inches
      rows: fileAnalysisTableRows,
    });
    
    sections.push(fileAnalysisTable);
  }
  
  // End Semester Result Analysis Section - MODIFIED: Using actual subject data with faculty names
  // MODIFIED: Setting the table to 100% width instead of 125% to fix the extension issue
  if (calculationMode === 'sgpa' || (calculationMode === 'cgpa' && currentSemesterRecords.length > 0)) {
    // Check if we have subjects explicitly marked as current semester
    const explicitlyMarkedSubjects = currentSemesterRecords.filter(record => record.isArrear === true);
    
    // Log how many explicitly marked subjects we have
    console.log(`Found ${explicitlyMarkedSubjects.length} records explicitly marked as current semester`);
    
    // IMPORTANT FIX: Use explicitly marked current semester subjects if available, otherwise use non-arrear
    const recordsForEndSemesterAnalysis = explicitlyMarkedSubjects.length > 0 
      ? explicitlyMarkedSubjects 
      : currentSemesterRecords.filter(record => !record.isArrear);
    
    console.log(`End Semester Analysis: Using ${recordsForEndSemesterAnalysis.length} records out of ${currentSemesterRecords.length} total`);
    
    // Use ordered subjects list if available, otherwise create from records
    let uniqueSubjects: string[] = [];
    
    // First, add subjects in the specified order (if available)
    if (analysis.orderedSubjects && analysis.orderedSubjects.length > 0) {
      console.log("Using ordered subjects for Word report:", analysis.orderedSubjects.join(', '));
      uniqueSubjects = [...analysis.orderedSubjects];
      
      // Then add any remaining subjects that might not be in the ordered list
      const allSubjects = [...new Set(recordsForEndSemesterAnalysis.map(record => record.SCODE))];
      allSubjects.forEach(subject => {
        if (!uniqueSubjects.includes(subject)) {
          uniqueSubjects.push(subject);
        }
      });
    } else {
      // If no order is specified, use the default set
      uniqueSubjects = [...new Set(recordsForEndSemesterAnalysis.map(record => record.SCODE))];
    }
    
    // Log the unique subjects we'll be processing
    console.log(`Processing ${uniqueSubjects.length} unique subject codes for the End Semester table`);
    
    sections.push(
      new Paragraph({
        spacing: {
          before: 200,
          after: 100,
        },
        children: [
          new TextRun({
            text: "End Semester Result Analysis",
            bold: true,
            size: 28,
            color: "2E3192",
          }),
        ],
      }),
    );
    
    // For debugging, let's examine the records being used for the table
    uniqueSubjects.forEach(subjectCode => {
      const subjectRecords = recordsForEndSemesterAnalysis.filter(r => r.SCODE === subjectCode);
      const subjectName = subjectRecords[0]?.subjectName || "";
      const facultyName = subjectRecords[0]?.facultyName || "";
      console.log(`Subject ${subjectCode}: Name="${subjectName}", Faculty="${facultyName}", Records=${subjectRecords.length}`);
    });
    
    // Subject Analysis Table - MODIFIED: Changed width to 115% as requested
    const subjectRows = [
      new TableRow({
        tableHeader: true,
        children: [
          createHeaderCell("S.No", { alignment: 'CENTER' }),
          createHeaderCell("Subject Code", { alignment: 'CENTER' }),
          createHeaderCell("Subject Name", { alignment: 'CENTER' }),
          createHeaderCell("Faculty Name", { alignment: 'CENTER' }),
          createHeaderCell("Dept", { alignment: 'CENTER' }),
          createHeaderCell("App", { alignment: 'CENTER' }),
          createHeaderCell("Ab", { alignment: 'CENTER' }),
          createHeaderCell("Fail", { alignment: 'CENTER' }),
          createHeaderCell("WH", { alignment: 'CENTER' }),
          createHeaderCell("Passed", { alignment: 'CENTER' }),
          createHeaderCell("% of pass", { alignment: 'CENTER' }),
          createHeaderCell("Highest Grade", { alignment: 'CENTER' }),
          createHeaderCell("No. of students", { alignment: 'CENTER' }),
        ],
      }),
    ];
    
    // Adding actual subject data with faculty names
    uniqueSubjects.forEach((subject, index) => {
      // Keep consistent with our earlier approach and only use records for this subject that are part of the current semester analysis
      const explicitlyMarkedRecords = currentSemesterRecords.filter(
        record => record.SCODE === subject && record.isArrear === true
      );
      
      // Use explicitly marked records if available, otherwise use non-arrear records
      const subjectRecords = explicitlyMarkedRecords.length > 0
        ? explicitlyMarkedRecords
        : currentSemesterRecords.filter(record => record.SCODE === subject && !record.isArrear);
      const totalStudents = subjectRecords.length;
      const passedStudents = subjectRecords.filter(record => record.GR !== 'U').length;
      const failedStudents = subjectRecords.filter(record => record.GR === 'U').length;
      const passPercentage = totalStudents > 0 ? (passedStudents / totalStudents) * 100 : 0;
      
      // Find the highest grade
      const grades = subjectRecords.map(record => record.GR);
      const validGrades = grades.filter(grade => grade in gradePointMap);
      const highestGrade = validGrades.length > 0 
        ? validGrades.sort((a, b) => (gradePointMap[b] || 0) - (gradePointMap[a] || 0))[0] 
        : '';
      
      // Count students with highest grade
      const studentsWithHighestGrade = highestGrade 
        ? subjectRecords.filter(record => record.GR === highestGrade).length 
        : 0;
      
      // Find a record with subject name and faculty name
      const recordWithInfo = subjectRecords.find(record => record.subjectName || record.facultyName);
      
      // Get subject name and faculty name
      let subjectName = "";
      let facultyName = "";
      
      if (recordWithInfo) {
        subjectName = recordWithInfo.subjectName || "";
        facultyName = recordWithInfo.facultyName || "";
      }
      
      subjectRows.push(
        new TableRow({
          children: [
            createTableCell((index + 1).toString(), false, { alignment: 'CENTER' }),
            createTableCell(subject, false, { alignment: 'CENTER' }),
            createTableCell(subjectName, false, { alignment: 'CENTER' }),
            createTableCell(facultyName, false, { alignment: 'CENTER' }),
            createTableCell(department, false, { alignment: 'CENTER' }),
            createTableCell(totalStudents.toString(), false, { alignment: 'CENTER' }),
            createTableCell("0", false, { alignment: 'CENTER' }),
            createTableCell(failedStudents.toString(), false, { alignment: 'CENTER' }),
            createTableCell("0", false, { alignment: 'CENTER' }),
            createTableCell(passedStudents.toString(), false, { alignment: 'CENTER' }),
            createTableCell(passPercentage.toFixed(1), false, { alignment: 'CENTER' }),
            createTableCell(highestGrade, false, { alignment: 'CENTER' }),
            createTableCell(studentsWithHighestGrade.toString(), false, { alignment: 'CENTER' }),
          ],
        })
      );
    });
    
    // MODIFIED: Changed table width to 115% as requested by user
    const subjectAnalysisTable = new Table({
      width: {
        size: 115,  // Changed from 100% to 115% as requested to match the image
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
      // MODIFIED: Adjusted column width proportions to fit within 115% width
      columnWidths: [
        380,   // S.No (slight increase from 350)
        750,   // Subject Code (slight increase from 700)
        1500,  // Subject Name (increase from 1400 to give more space)
        1500,  // Faculty Name (increase from 1400 to give more space)
        380,   // Dept (slight increase from 350)
        380,   // App (slight increase from 350)
        280,   // Ab (slight increase from 250)
        380,   // Fail (slight increase from 350)
        280,   // WH (slight increase from 250)
        480,   // Passed (slight increase from 450)
        530,   // % of pass (slight increase from 500)
        580,   // Highest Grade (slight increase from 550)
        630    // No. of students (slight increase from 600)
      ],
      rows: subjectRows,
    });
    
    sections.push(subjectAnalysisTable);
  }
  
  // Classification Section - MODIFIED to match exactly the provided image with proper spacing
  sections.push(
    new Paragraph({
      spacing: {
        before: 200,
        after: 100,
      },
      children: [
        new TextRun({
          text: "Classification",
          bold: true,
          size: 28,
          color: "2E3192",
        }),
      ],
    }),
  );
  
  // Classification Table - Improved alignment and consistent appearance
  const classificationTable = new Table({
    width: {
      size: 100, // FIXED: Changed from 108.7 to 100 for better Word compatibility
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    // More precise column widths for better alignment
    columnWidths: [460, 460, 460, 460, 460, 300, 400, 460, 460, 460, 460, 460, 300, 400],
    rows: [
      // First row: Current semester | Upto this semester
      new TableRow({
        children: [
          createTableCell("Current semester", true, { 
            colspan: 7, 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("Upto this semester", true, { 
            colspan: 7, 
            alignment: 'CENTER',
            bold: true
          }),
        ],
      }),
      // Second row: Headers with spans
      new TableRow({
        children: [
          createTableCell("Distinction", true, { 
            rowspan: 2, 
            alignment: 'CENTER',
            bold: true,
            verticalMerge: VerticalMergeType.RESTART  // FIXED: Using enum instead of string
          }),
          createTableCell("First class", true, { 
            colspan: 2, 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("Second class", true, { 
            colspan: 2, 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("Fail", true, { 
            rowspan: 2, 
            alignment: 'CENTER',
            bold: true,
            verticalMerge: VerticalMergeType.RESTART  // FIXED: Using enum instead of string
          }),
          createTableCell("% of pass", true, { 
            rowspan: 2, 
            alignment: 'CENTER',
            bold: true,
            verticalMerge: VerticalMergeType.RESTART  // FIXED: Using enum instead of string
          }),
          createTableCell("Distinction", true, { 
            rowspan: 2, 
            alignment: 'CENTER',
            bold: true,
            verticalMerge: VerticalMergeType.RESTART  // FIXED: Using enum instead of string
          }),
          createTableCell("First class", true, { 
            colspan: 2, 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("Second class", true, { 
            colspan: 2, 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("Fail", true, { 
            rowspan: 2, 
            alignment: 'CENTER',
            bold: true,
            verticalMerge: VerticalMergeType.RESTART  // FIXED: Using enum instead of string
          }),
          createTableCell("% of pass", true, { 
            rowspan: 2, 
            alignment: 'CENTER',
            bold: true,
            verticalMerge: VerticalMergeType.RESTART  // FIXED: Using enum instead of string
          }),
        ],
      }),
      // Third row: WOA/WA headers
      new TableRow({
        children: [
          // Skip Distinction cell (handled by rowspan above)
          createTableCell("WOA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("WA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("WOA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("WA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          // Skip Fail cell (handled by rowspan above)
          // Skip % of pass cell (handled by rowspan above)
          // Skip Distinction cell (handled by rowspan above)
          createTableCell("WOA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("WA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("WOA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          createTableCell("WA", true, { 
            alignment: 'CENTER',
            bold: true
          }),
          // Skip Fail cell (handled by rowspan above)
          // Skip % of pass cell (handled by rowspan above)
        ],
      }),
      // Fourth row: Data values
      new TableRow({
        children: [
          // Current semester data
          createTableCell(analysis.singleFileClassification.distinction.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.singleFileClassification.firstClassWOA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.singleFileClassification.firstClassWA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.singleFileClassification.secondClassWOA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.singleFileClassification.secondClassWA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.singleFileClassification.fail.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.singleFileClassification.passPercentage.toFixed(1), false, { 
            alignment: 'CENTER' 
          }),
          // Cumulative data (up to this semester)
          createTableCell(analysis.multipleFileClassification.distinction.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.multipleFileClassification.firstClassWOA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.multipleFileClassification.firstClassWA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.multipleFileClassification.secondClassWOA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.multipleFileClassification.secondClassWA.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.multipleFileClassification.fail.toString(), false, { 
            alignment: 'CENTER' 
          }),
          createTableCell(analysis.multipleFileClassification.passPercentage.toFixed(1), false, { 
            alignment: 'CENTER' 
          }),
        ],
      }),
    ],
  });
  
  sections.push(classificationTable);
  
  // Rank Analysis Section - FIXED to properly display top three students with correct SGPA data
  sections.push(
    new Paragraph({
      spacing: {
        before: 200,
        after: 100,
      },
      children: [
        new TextRun({
          text: "Rank Analysis",
          bold: true,
          size: 28,
          color: "2E3192",
        }),
      ],
    }),
  );
  
  // FIXED: Get current semester student data with SGPA for the "Rank in This Semester" table
  // Get data directly from studentSgpaDetails which has been fixed in analyzer.ts
  let topCurrentSemesterStudents = [];
  let topCumulativeStudents = [];
  
  // For current semester, always use SGPA data
  if (analysis.studentSgpaDetails && analysis.studentSgpaDetails.length > 0) {
    // Use the pre-calculated SGPA data which is now correctly calculated in analyzer.ts
    const sortedStudentsByCurrentSGPA = [...analysis.studentSgpaDetails].sort((a, b) => b.sgpa - a.sgpa);
    topCurrentSemesterStudents = sortedStudentsByCurrentSGPA.slice(0, 3).map((student, index) => ({
      rank: index + 1,
      id: student.id,
      value: student.sgpa
    }));
    
    console.log("Top current semester students for Rank table:", topCurrentSemesterStudents);
  }
  
  // For cumulative data, use CGPA data if available (CGPA mode only)
  if (calculationMode === 'cgpa' && analysis.cgpaAnalysis && analysis.cgpaAnalysis.toppersList) {
    topCumulativeStudents = analysis.cgpaAnalysis.toppersList.slice(0, 3).map((student, index) => ({
      rank: index + 1,
      id: student.id,
      value: student.cgpa
    }));
    
    console.log("Top cumulative students for Rank table:", topCumulativeStudents);
  } else {
    // In SGPA mode, just use the same data for both tables
    topCumulativeStudents = topCurrentSemesterStudents;
  }
  
  // Create table headers for Rank Analysis
  const rankRows = [
    new TableRow({
      children: [
        createTableCell("Rank in this semester", true, { colspan: 3, alignment: 'CENTER' }),
        createTableCell("Rank up to this semester", true, { colspan: 3, alignment: 'CENTER' }),
      ],
    }),
    new TableRow({
      children: [
        createHeaderCell("RANK"),
        createHeaderCell("Name of the student"),
        createHeaderCell("SGPA"),
        createHeaderCell("RANK"),
        createHeaderCell("Name of the student"),
        createHeaderCell(calculationMode === 'cgpa' ? "CGPA" : "SGPA"),
      ],
    }),
  ];
  
  // Add data rows for top 3 ranks
  for (let i = 0; i < 3; i++) {
    const rank = i + 1;
    
    // Current semester student data (ensure we have data)
    const semesterStudent = topCurrentSemesterStudents[i] || { id: "", value: 0 };
    
    // Cumulative student data (ensure we have data)
    const cumulativeStudent = topCumulativeStudents[i] || { id: "", value: 0 };
    
    rankRows.push(
      new TableRow({
        children: [
          createTableCell(rank.toString()),
          createTableCell(semesterStudent.id),
          createTableCell(semesterStudent.value.toFixed(2)),
          createTableCell(rank.toString()),
          createTableCell(cumulativeStudent.id),
          createTableCell(cumulativeStudent.value.toFixed(2)),
        ],
      })
    );
  }
  
  // Create and add rank table to sections
  const rankTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    columnWidths: [800, 2000, 1000, 800, 2000, 1000],
    rows: rankRows,
  });
  
  sections.push(rankTable);
  
  // Individual Student Performance Section - ADDED FOR BOTH SGPA AND CGPA MODE
  sections.push(
    new Paragraph({
      spacing: {
        before: 200,
        after: 100,
      },
      children: [
        new TextRun({
          text: "Individual Student Performance",
          bold: true,
          size: 28,
          color: "2E3192",
        }),
      ],
    }),
  );
  
  // Get appropriate student data based on mode
  let studentPerformanceData = [];
  
  if (calculationMode === 'sgpa' && analysis.studentSgpaDetails) {
    // For SGPA mode, use the SGPA data
    studentPerformanceData = [...analysis.studentSgpaDetails]
      .sort((a, b) => b.sgpa - a.sgpa)
      .map(student => ({
        id: student.id,
        gpValue: student.sgpa,
        hasArrears: student.hasArrears
      }));
  } else if (calculationMode === 'cgpa' && analysis.cgpaAnalysis) {
    // For CGPA mode, use the CGPA data
    studentPerformanceData = [...analysis.cgpaAnalysis.studentCGPAs]
      .sort((a, b) => b.cgpa - a.cgpa)
      .map(student => {
        // For CGPA mode, we need to check if the student has arrears in any semester
        const hasArrears = records.some(record => 
          record.REGNO === student.id && record.GR === 'U'
        );
        
        return {
          id: student.id,
          gpValue: student.cgpa,
          hasArrears
        };
      });
  }
  
  // Build the table rows for Individual Student Performance
  const studentPerformanceRows = [
    new TableRow({
      children: [
        createHeaderCell("S.No"),
        createHeaderCell("Register Number"),
        createHeaderCell(calculationMode === 'sgpa' ? "SGPA" : "CGPA"),
        createHeaderCell("Status"),
      ],
    }),
  ];
  
  // Add student rows
  studentPerformanceData.forEach((student, index) => {
    // Determine status based on GP value and arrears
    let status = "";
    
    if (student.hasArrears) {
      // Students with arrears
      if (student.gpValue >= 6.5) {
        status = "First Class With Arrears"; // Changed from "First Class" to "First Class With Arrears"
      } else if (student.gpValue >= 5.0) {
        status = "Second Class with Arrears";
      } else {
        status = "Has Arrears";
      }
    } else {
      // Students without arrears
      if (student.gpValue >= 8.5) {
        status = "Distinction";
      } else if (student.gpValue >= 6.5) {
        status = "First Class";
      } else {
        status = "Second Class";
      }
    }
    
    studentPerformanceRows.push(
      new TableRow({
        children: [
          createTableCell((index + 1).toString()),
          createTableCell(student.id),
          createTableCell(student.gpValue.toFixed(2)),
          createTableCell(status),
        ],
      })
    );
  });
  
  const studentPerformanceTable = new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
    columnWidths: [1000, 2800, 1400, 3400],
    rows: studentPerformanceRows,
  });
  
  sections.push(studentPerformanceTable);
  
  // Individual arrear details removed as per requirement.

  // Arrear history summary removed as per requirement.
  
  // Signature section
  sections.push(
    new Paragraph({
      children: [new TextRun("")],
      spacing: {
        before: 500,
      },
    }),
    new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      columnWidths: [2000, 2000, 2000, 2000],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  text: "CLASS ADVISOR",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 25,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  text: "HOD/CSE",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 25,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  text: "DEAN ACADEMICS",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 25,
                type: WidthType.PERCENTAGE,
              },
            }),
            new TableCell({
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({
                  text: "PRINCIPAL",
                  alignment: AlignmentType.CENTER,
                }),
              ],
              width: {
                size: 25,
                type: WidthType.PERCENTAGE,
              },
            }),
          ],
        }),
      ],
    })
  );
  
  return new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });
};

// Helper function for creating table cells with better alignment and text control
function createTableCell(
  text: string, 
  isHeader = false,
  options: {
    colspan?: number;
    rowspan?: number;
    alignment?: keyof typeof AlignmentType;
    rightIndent?: number;
    bold?: boolean;
    verticalMerge?: VerticalMergeType;
  } = {}
): TableCell {
  const { colspan, rowspan, alignment = 'CENTER', rightIndent = 0, bold = isHeader, verticalMerge } = options;
  
  // Enhanced border definitions for better Word compatibility
  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 1 },
    bottom: { style: BorderStyle.SINGLE, size: 1 },
    left: { style: BorderStyle.SINGLE, size: 1 },
    right: { style: BorderStyle.SINGLE, size: 1 },
  };
  
  return new TableCell({
    children: [
      new Paragraph({
        alignment: alignment ? AlignmentType[alignment] : AlignmentType.CENTER,
        indent: { right: rightIndent },
        children: [
          new TextRun({
            text,
            bold: bold,
            size: 20,
          }),
        ],
      }),
    ],
    columnSpan: colspan,
    rowSpan: rowspan,
    // Updated margins for perfect text centering
    margins: {
      top: 80,
      bottom: 80,
      left: 80,
      right: 80
    },
    verticalAlign: VerticalAlign.CENTER,
    verticalMerge: verticalMerge,
    borders: cellBorders, // Explicit border styling for all cells
  });
}

function createHeaderCell(
  text: string,
  options: {
    colspan?: number;
    rowspan?: number;
    alignment?: keyof typeof AlignmentType;
    rightIndent?: number;
  } = {}
): TableCell {
  return createTableCell(text, true, {
    ...options,
    alignment: options.alignment || 'CENTER',
    rightIndent: options.rightIndent ?? 0,
  });
}

// Helper function for simple table rows with enhanced border styling
const createTableRow = (cells: string[], isHeader = false): TableRow => {
  return new TableRow({
    children: cells.map(text => 
      new TableCell({
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            indent: { right: -0.06 },
            children: [
              new TextRun({
                text,
                bold: isHeader,
                size: 20,
              }),
            ],
          }),
        ],
        margins: {
          top: 80,
          bottom: 80,
          left: 100,
          right: 100
        },
        verticalAlign: VerticalAlign.CENTER,
      })
    ),
  });
};

// NEW Helper function for arrear summary table rows (left aligned category)
const createSummaryTableRow = (category: string, count: string): TableRow => {
  return new TableRow({
    children: [
      new TableCell({ // Category cell - left aligned
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT, // Align text to the left
            indent: { left: 100 }, // Add some left indent for padding
            children: [
              new TextRun({
                text: category,
                bold: false,
                size: 20,
              }),
            ],
          }),
        ],
        margins: {
          top: 80,
          bottom: 80,
          left: 100,
          right: 100
        },
        verticalAlign: VerticalAlign.CENTER,
      }),
      new TableCell({ // Count cell - center aligned
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: count,
                bold: false,
                size: 20,
              }),
            ],
          }),
        ],
        margins: {
          top: 80,
          bottom: 80,
          left: 100,
          right: 100
        },
        verticalAlign: VerticalAlign.CENTER,
      })
    ],
  });
};
