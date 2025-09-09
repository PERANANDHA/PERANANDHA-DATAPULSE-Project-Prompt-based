
import React, { useRef, memo } from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';
import { ResultAnalysis, StudentRecord } from '@/utils/excelProcessor';
import AnalysisOverview from './AnalysisOverview';
import SubjectAnalysis from './SubjectAnalysis';
import StudentPerformance from './StudentPerformance';
import StudentSGPATable from './StudentSGPATable';
import ReportDownloader from './ReportDownloader';

interface ResultsDisplayProps {
  analysis: ResultAnalysis | null;
  studentRecords: StudentRecord[];
  calculationMode: 'sgpa' | 'cgpa' | null;
}

// Memoize the components to prevent unnecessary re-renders
const MemoizedAnalysisOverview = memo(AnalysisOverview);
const MemoizedSubjectAnalysis = memo(SubjectAnalysis);
const MemoizedStudentPerformance = memo(StudentPerformance);
const MemoizedStudentSGPATable = memo(StudentSGPATable);
const MemoizedReportDownloader = memo(ReportDownloader);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  analysis, 
  studentRecords,
  calculationMode
}) => {
  const dashboardRef = useRef<HTMLDivElement>(null);

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">No data available. Please upload Excel file(s).</p>
      </div>
    );
  }

  // For CGPA mode, ensure we log important data for debugging
  if (calculationMode === 'cgpa') {
    console.log(`ResultsDisplay - CGPA mode active`);
    if (analysis.currentSemesterFile) {
      console.log(`Current semester file: ${analysis.currentSemesterFile}`);
      
      // Check if student details are present
      if (analysis.studentSgpaDetails && analysis.studentSgpaDetails.length > 0) {
        console.log(`Found ${analysis.studentSgpaDetails.length} students with SGPA details`);
        console.log(`Sample SGPA: ${analysis.studentSgpaDetails[0].id} - ${analysis.studentSgpaDetails[0].sgpa}`);
      } else {
        console.warn('No student SGPA details found!');
      }
    } else {
      console.warn('No current semester file identified in CGPA mode!');
    }
  }
  
  // Log ordered subjects if available
  if (analysis.orderedSubjects && analysis.orderedSubjects.length > 0) {
    console.log("ResultsDisplay - Ordered subjects:", analysis.orderedSubjects.join(" -> "));
  } else {
    console.log("ResultsDisplay - No subject order specified");
  }

  // Log arrear history information for debugging
  if (analysis.studentArrearHistory) {
    console.log(`ResultsDisplay - Found arrear history for ${analysis.studentArrearHistory.length} students`);
    
    const totalCurrentArrears = analysis.studentArrearHistory.reduce(
      (sum, student) => sum + student.currentArrears.length, 0
    );
    
    const totalClearedArrears = analysis.studentArrearHistory.reduce(
      (sum, student) => sum + student.clearedArrears.length, 0
    );
    
    console.log(`Total current arrears: ${totalCurrentArrears}, Total cleared arrears: ${totalClearedArrears}`);
  } else {
    console.log("ResultsDisplay - No arrear history data available");
  }

  // For CGPA mode, determine if we're showing the current semester subjects
  const showSubjectAnalysis = calculationMode === 'sgpa' || 
    (calculationMode === 'cgpa' && analysis.currentSemesterFile);

  // If in CGPA mode with multiple files, get the semester name for display
  let semesterLabel = 'Semester';
  if (calculationMode === 'cgpa' && analysis.currentSemesterFile && analysis.fileWiseAnalysis) {
    const currentFileAnalysis = analysis.fileWiseAnalysis[analysis.currentSemesterFile];
    if (currentFileAnalysis && currentFileAnalysis.semesterName) {
      semesterLabel = `Semester ${currentFileAnalysis.semesterName}`;
    }
  }

  return (
    <motion.div 
      id="dashboard-content"
      ref={dashboardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 bg-white p-6 rounded-lg shadow-md flex flex-col items-center w-full max-w-[1200px] mx-auto"
    >
      <div className="mb-4 text-center w-full">
        <h2 className="text-xl font-semibold">
          {calculationMode === 'sgpa' ? 'SGPA Analysis Results' : 'CGPA Analysis Results'}
        </h2>
        <p className="text-muted-foreground">
          {calculationMode === 'sgpa' 
            ? 'Semester Grade Point Average analysis for the uploaded semester data'
            : `Cumulative Grade Point Average analysis across multiple semesters (Current: ${semesterLabel})`}
        </p>
      </div>
      
      <div className="w-full flex justify-center">
        <MemoizedAnalysisOverview analysis={analysis} calculationMode={calculationMode} />
      </div>
      
      {/* Show subject analysis in SGPA mode or for the current semester in CGPA mode */}
      {showSubjectAnalysis && (
        <div className="w-full flex justify-center">
          <MemoizedSubjectAnalysis 
            analysis={analysis} 
            title={calculationMode === 'cgpa' ? `Current ${semesterLabel} Subject Performance` : undefined}
          />
        </div>
      )}
      
      <div className="w-full flex justify-center">
        <MemoizedStudentPerformance analysis={analysis} calculationMode={calculationMode} />
      </div>
      
      <div className="w-full flex justify-center">
        <MemoizedStudentSGPATable analysis={analysis} calculationMode={calculationMode} />
      </div>
      
      <div className="w-full flex justify-center">
        <MemoizedReportDownloader analysis={analysis} studentRecords={studentRecords} calculationMode={calculationMode} />
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;
