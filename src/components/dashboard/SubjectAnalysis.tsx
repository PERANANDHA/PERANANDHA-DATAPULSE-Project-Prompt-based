
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResultAnalysis } from '@/utils/excelProcessor';

interface SubjectAnalysisProps {
  analysis: ResultAnalysis;
  title?: string; // Optional custom title
}

const SubjectAnalysis: React.FC<SubjectAnalysisProps> = ({ analysis, title }) => {
  return (
    <Card className="overflow-hidden w-full" style={{ maxWidth: '1000px' }}>
      <CardHeader>
        <CardTitle className="text-center">{title || 'Subject Performance Analysis'}</CardTitle>
        <CardDescription className="text-center">
          Analyzing pass/fail rates and grade distribution across all subjects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="flex justify-center w-full">
            <TabsTrigger value="performance">Pass/Fail Performance</TabsTrigger>
            <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
          </TabsList>
          <TabsContent value="performance" className="pt-4">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={analysis.subjectPerformance}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
                barSize={25}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="subject" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="pass" name="Pass %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fail" name="Fail %" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="grades" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(analysis.subjectGradeDistribution).map(([subject, grades]) => (
                <Card key={subject} className="overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm text-center">{subject}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={grades}
                        margin={{
                          top: 0,
                          right: 0,
                          left: 0,
                          bottom: 0,
                        }}
                        barSize={20}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [`${value} students`, 'Count']}
                          cursor={{ fillOpacity: 0.1 }}
                        />
                        <Bar dataKey="count" name="Students">
                          {grades.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubjectAnalysis;
