
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ResultAnalysis } from '@/utils/excelProcessor';

interface StudentPerformanceProps {
  analysis: ResultAnalysis;
  calculationMode?: 'sgpa' | 'cgpa';
  useCumulativeData?: boolean; // New prop to determine which dataset to use
}

// Define types for student performance data
interface SgpaStudent {
  id: string;
  value: number;
  label: string;
  grade?: string;
}

interface CgpaStudent {
  id: string;
  value: number;
  label: string;
}

const StudentPerformance: React.FC<StudentPerformanceProps> = ({ 
  analysis,
  calculationMode = 'sgpa',
  useCumulativeData = false // Default to current semester data
}) => {
  // Use cumulative data when explicitly asked or in CGPA mode
  // For Individual Student Performance, in CGPA mode we always use cumulative data
  const shouldUseCumulativeData = useCumulativeData || calculationMode === 'cgpa';

  // Generate top performers data based on the mode
  const topStudents: (SgpaStudent | CgpaStudent)[] = shouldUseCumulativeData && analysis.cgpaAnalysis?.toppersList 
    ? analysis.cgpaAnalysis.toppersList.slice(0, 6).map(student => ({
        id: student.id,
        value: student.cgpa,
        label: 'CGPA'
      }))
    : analysis.topPerformers.map(student => ({
        id: student.id,
        value: student.sgpa,
        label: 'SGPA',
        grade: student.grade
      }));

  // Generate needs improvement data based on the mode
  const needsImprovementData = shouldUseCumulativeData && analysis.cgpaAnalysis
    ? analysis.cgpaAnalysis.studentCGPAs
        .filter(student => student.cgpa < 6.5)
        .slice(0, 6)
        .map(student => ({
          id: student.id,
          value: student.cgpa,
          label: 'CGPA'
        }))
    : analysis.needsImprovement.slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full" style={{ maxWidth: '800px', width: '100%' }}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">
            Top Performers
          </CardTitle>
          <CardDescription className="text-center">
            {shouldUseCumulativeData 
              ? 'Students with highest CGPA across all semesters' 
              : 'Students with highest SGPA in the semester'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="font-medium">{student.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{student.value.toFixed(2)}</span>
                  {'grade' in student && student.grade && (
                    <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                      {student.grade}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-center">Needs Improvement</CardTitle>
          <CardDescription className="text-center">
            {shouldUseCumulativeData
              ? 'Students with low CGPA across all semesters'
              : 'Students with low SGPA or arrears'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shouldUseCumulativeData
              ? needsImprovementData.map((student, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 max-w-[60%]">
                      <p className="font-medium truncate">{student.id}</p>
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                        {student.value.toFixed(2)} {student.label}
                      </Badge>
                    </div>
                  </div>
                ))
              : analysis.needsImprovement.slice(0, 6).map((student, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 max-w-[60%]">
                      <p className="font-medium truncate">{student.id}</p>
                      {student.subjects && (
                        <p className="text-xs text-muted-foreground truncate">
                          Arrears: {student.subjects}
                        </p>
                      )}
                    </div>
                    <div>
                      <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
                        {student.sgpa.toFixed(2)} SGPA
                      </Badge>
                    </div>
                  </div>
                ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPerformance;
