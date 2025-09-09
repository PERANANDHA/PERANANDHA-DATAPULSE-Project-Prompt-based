
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ResultAnalysis } from '@/utils/excelProcessor';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  Legend 
} from 'recharts';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface AnalysisOverviewProps {
  analysis: ResultAnalysis;
  calculationMode: 'sgpa' | 'cgpa' | null;
}

const AnalysisOverview: React.FC<AnalysisOverviewProps> = ({ analysis, calculationMode }) => {
  const isCgpaMode = calculationMode === 'cgpa';
  const hasCgpaData = analysis.cgpaAnalysis && isCgpaMode;
  
  return (
    <>
      {analysis.fileCount && analysis.fileCount > 1 && analysis.filesProcessed && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Files Processed</CardTitle>
            <CardDescription>Combined analysis from {analysis.fileCount} files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.filesProcessed.map((fileName, index) => (
                <Badge key={index} variant="outline" className="px-2 py-1">
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  {fileName}
                </Badge>
              ))}
            </div>
            
            {hasCgpaData && (
              <div className="mt-4 p-4 bg-slate-50 rounded-md">
                <h3 className="text-sm font-semibold mb-2">CGPA Analysis</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Average CGPA</p>
                    <p className="font-semibold">{analysis.cgpaAnalysis.averageCGPA.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Highest CGPA</p>
                    <p className="font-semibold">{analysis.cgpaAnalysis.highestCGPA.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lowest CGPA</p>
                    <p className="font-semibold">{analysis.cgpaAnalysis.lowestCGPA.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pass Rate</CardTitle>
            <CardDescription>Overall course completion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <Pie
                    data={analysis.passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    labelLine={true}
                  >
                    {analysis.passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']} />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-2 border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.passFailData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.value.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Only show grade distribution in SGPA mode */}
        {!isCgpaMode && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Grade Distribution</CardTitle>
              <CardDescription>Count of grades across all subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={analysis.gradeDistribution}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value: any) => [`${value} students`, 'Count']}
                      labelFormatter={(label) => `Grade: ${label}`}
                    />
                    <Legend verticalAlign="top" />
                    <Bar dataKey="count" name="Students">
                      {analysis.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-2 border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grade</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.gradeDistribution.map((grade, index) => {
                      const percentage = analysis.totalGrades > 0 
                        ? ((grade.count / analysis.totalGrades) * 100).toFixed(1) 
                        : "0.0";
                        
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{grade.name}</TableCell>
                          <TableCell>{grade.count}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance Summary</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Show CGPA or SGPA based on mode */}
              {isCgpaMode && hasCgpaData ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average CGPA</span>
                    <span className="text-lg font-semibold">{analysis.cgpaAnalysis.averageCGPA.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Highest CGPA</span>
                    <span className="text-lg font-semibold">{analysis.cgpaAnalysis.highestCGPA.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lowest CGPA</span>
                    <span className="text-lg font-semibold">{analysis.cgpaAnalysis.lowestCGPA.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average SGPA</span>
                    <span className="text-lg font-semibold">{analysis.averageCGPA.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Highest SGPA</span>
                    <span className="text-lg font-semibold">{analysis.highestSGPA.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Lowest SGPA</span>
                    <span className="text-lg font-semibold">{analysis.lowestSGPA.toFixed(2)}</span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Students</span>
                <span className="text-lg font-semibold">{analysis.totalStudents}</span>
              </div>
              
              {hasCgpaData && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">Top CGPA Performers</h3>
                  <ul className="space-y-2">
                    {analysis.cgpaAnalysis.toppersList.slice(0, 3).map((student, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="text-sm">{student.id}</span>
                        <span className="text-sm font-medium">{student.cgpa.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AnalysisOverview;
