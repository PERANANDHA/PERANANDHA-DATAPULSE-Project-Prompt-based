
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResultAnalysis } from '@/utils/excelProcessor';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface StudentSGPATableProps {
  analysis: ResultAnalysis;
  calculationMode: 'sgpa' | 'cgpa' | null;
  useCumulativeData?: boolean; // New prop to determine which dataset to use
}

const StudentSGPATable: React.FC<StudentSGPATableProps> = ({ 
  analysis, 
  calculationMode,
  useCumulativeData = false // Default to current semester data
}) => {
  const isCgpaMode = calculationMode === 'cgpa';
  
  // For CGPA mode, we need to handle rank tables differently
  let topStudentsData = [];
  let tableTitle = "";
  let tableDescription = "";
  
  if (isCgpaMode) {
    if (useCumulativeData && analysis.cgpaAnalysis?.toppersList) {
      // This is the "Rank up to this semester" table in CGPA mode - use CGPA data
      // Include data from all semesters but exclude arrear subjects (already handled in the data)
      topStudentsData = analysis.cgpaAnalysis.toppersList.slice(0, 3).map((student, index) => ({
        rank: index + 1,
        id: student.id,
        value: student.cgpa,
        isCGPA: true
      }));
      tableTitle = 'Student CGPA Rank Analysis';
      tableDescription = 'Top 3 students by Cumulative Grade Point Average';
    } else {
      // This is the "Rank in this semester" table in CGPA mode - use SGPA data from current semester only
      // Check if we have studentSgpaDetails (should have current semester SGPA)
      if (analysis.studentSgpaDetails && analysis.studentSgpaDetails.length > 0) {
        // Filter out students with arrear data (already handled during processing)
        const currentSemesterStudents = [...analysis.studentSgpaDetails];
        currentSemesterStudents.sort((a, b) => b.sgpa - a.sgpa);
        
        topStudentsData = currentSemesterStudents.slice(0, 3).map((student, index) => ({
          rank: index + 1,
          id: student.id,
          value: student.sgpa,
          isCGPA: false
        }));
        tableTitle = 'Student SGPA Rank Analysis';
        tableDescription = 'Top 3 students by Semester Grade Point Average (Current Semester)';
      } else {
        console.warn("No SGPA details found for current semester in CGPA mode");
        topStudentsData = [];
        tableTitle = 'Student SGPA Rank Analysis';
        tableDescription = 'Top 3 students by Semester Grade Point Average (Current Semester)';
      }
    }
  } else {
    // Simple SGPA mode - use SGPA data
    const currentSemesterStudents = [...(analysis.studentSgpaDetails || [])];
    currentSemesterStudents.sort((a, b) => b.sgpa - a.sgpa);
    
    topStudentsData = currentSemesterStudents.slice(0, 3).map((student, index) => ({
      rank: index + 1,
      id: student.id,
      value: student.sgpa,
      isCGPA: false
    }));
    tableTitle = 'Student SGPA Rank Analysis';
    tableDescription = 'Top 3 students by Semester Grade Point Average';
  }

  // Debug logging for troubleshooting
  console.log(`StudentSGPATable - Mode: ${calculationMode}, useCumulativeData: ${useCumulativeData}`);
  console.log("Top students data:", topStudentsData);

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-center">
          {tableTitle}
        </CardTitle>
        <CardDescription className="text-center">
          {tableDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto w-full flex justify-center">
          <div style={{ width: '100%', maxWidth: '900px' }}>
            {/* Updated border class to match the thicker style */}
            <Table className="border-2 border-gray-400">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: '100px' }}>Rank</TableHead>
                  <TableHead style={{ width: '450px' }}>Name of the student</TableHead>
                  <TableHead style={{ width: '100px' }}>
                    {useCumulativeData ? 'CGPA' : 'SGPA'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudentsData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="text-center">
                      <Badge variant={student.rank === 1 ? "default" : (student.rank === 2 ? "secondary" : "outline")} 
                             className={student.rank === 1 ? "bg-amber-500" : 
                                       (student.rank === 2 ? "bg-slate-400" : "bg-amber-700/30")}>
                        {student.rank}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{student.id}</TableCell>
                    <TableCell className="text-center">{student.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentSGPATable;
