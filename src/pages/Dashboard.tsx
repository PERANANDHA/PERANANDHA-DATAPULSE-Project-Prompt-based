
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, BarChart4, Loader, FileSpreadsheet, Calculator } from 'lucide-react';
import { 
  analyzeResults, 
  type StudentRecord,
  type ResultAnalysis
} from '@/utils/excelProcessor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import SubjectCreditInput from '@/components/SubjectCreditInput';
import ProfileButton from "@/components/ui/ProfileButton";
import FileUploader from '@/components/dashboard/FileUploader';
import ResultsDisplay from '@/components/dashboard/ResultsDisplay';

interface SubjectCredit {
  subjectCode: string;
  creditValue: number;
  subjectName?: string;
  facultyName?: string;
  isArrear?: boolean; // When true, indicates this subject is explicitly marked as a current semester subject
}

interface ProfileInfo {
  name: string;
  email: string;
  role: string;
  department: string;
  college: string;
}

type CalculationMode = 'sgpa' | 'cgpa';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('mode');
  const [calculationMode, setCalculationMode] = useState<CalculationMode | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultsAvailable, setResultsAvailable] = useState(false);
  const [studentRecords, setStudentRecords] = useState<StudentRecord[]>([]);
  const [resultAnalysis, setResultAnalysis] = useState<ResultAnalysis | null>(null);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [subjectCredits, setSubjectCredits] = useState<SubjectCredit[]>([]);
  const [orderedSubjects, setOrderedSubjects] = useState<string[]>([]);
  const [creditsAssigned, setCreditsAssigned] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const profileInfo: ProfileInfo = {
    name: "Dr. S. Rajasekaran",
    email: "rajasekaran.s@ksrct.ac.in",
    role: "Associate Professor",
    department: "Computer Science and Engineering",
    college: "K. S. Rangasamy College of Technology"
  };

  const handleSelectMode = (mode: CalculationMode) => {
    setCalculationMode(mode);
    setActiveTab('upload');
    toast({
      title: `${mode.toUpperCase()} Calculation Mode Selected`,
      description: mode === 'sgpa' 
        ? "You can upload a single Excel file for SGPA calculation." 
        : "You can upload multiple Excel files (up to 10) for CGPA calculation.",
    });
  };

  const handleRecordsUploaded = (records: StudentRecord[], subjects: string[]) => {
    setStudentRecords(records);
    setUniqueSubjects(subjects);
    setResultsAvailable(false);
    setResultAnalysis(null);
    setSubjectCredits([]);
    setOrderedSubjects([]);
    setCreditsAssigned(false);
    setIsUploading(false);
  };

  const handleCreditAssigned = (credits: SubjectCredit[], subjectOrder: string[]) => {
    setSubjectCredits(credits);
    setOrderedSubjects(subjectOrder);
    setCreditsAssigned(true);
    
    console.log(`Credits assigned: ${credits.length} subjects`);
    console.log(`Ordered subjects: ${subjectOrder.length} subjects in specific order`);
    
    // Enhanced logging for debugging
    console.log("======= CREDIT ASSIGNMENT DETAILS =======");
    const withSubjectNames = credits.filter(c => c.subjectName && c.subjectName.trim() !== '');
    const withFacultyNames = credits.filter(c => c.facultyName && c.facultyName.trim() !== '');
    
    console.log(`Subjects with names: ${withSubjectNames.length}/${credits.length}`);
    console.log(`Subjects with faculty names: ${withFacultyNames.length}/${credits.length}`);
    
    if (withSubjectNames.length > 0) {
      console.log("Sample subject names:", 
        withSubjectNames.slice(0, 3).map(c => `${c.subjectCode}: "${c.subjectName}"`).join(', ')
      );
    }
    
    if (withFacultyNames.length > 0) {
      console.log("Sample faculty names:", 
        withFacultyNames.slice(0, 3).map(c => `${c.subjectCode}: "${c.facultyName}"`).join(', ')
      );
    }
    
    // Log the order of subjects if specified
    if (subjectOrder.length > 0) {
      console.log("Ordered subjects:", subjectOrder.join(' -> '));
    }
    
    console.log("=========================================");
    
    analyzeData(credits, subjectOrder);
  };

  const analyzeData = async (credits: SubjectCredit[], subjectOrder: string[]) => {
    if (!studentRecords.length) {
      toast({
        variant: "destructive",
        title: "No data to analyze",
        description: "Please upload an Excel file first.",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const subjectCodesToProcess = credits.map(credit => credit.subjectCode);
      
      // Enhanced logging for debugging
      console.log("======= ANALYZE DATA =======");
      console.log(`Processing ${studentRecords.length} student records with ${credits.length} subject credits`);
      console.log(`Subject order specified: ${subjectOrder.length > 0 ? 'Yes' : 'No'}`);
      
      const recordsWithCredits = studentRecords.map(record => {
        const creditInfo = credits.find(c => c.subjectCode === record.SCODE);
        
        if (creditInfo) {
          // Log subjects marked as current semester
          if (creditInfo.isArrear) {
            console.log(`Subject ${record.SCODE} marked as current semester for student ${record.REGNO}`);
          }
          
          return {
            ...record,
            creditValue: creditInfo.creditValue,
            subjectName: creditInfo.subjectName || '',
            facultyName: creditInfo.facultyName || '',
            isArrear: creditInfo.isArrear || false // Pass the arrear flag
          };
        }
        
        return {
          ...record,
          creditValue: 3,
          subjectName: '',
          facultyName: '',
          isArrear: false
        };
      });
      
      // Logging for debug
      const recordsWithSubjectNames = recordsWithCredits.filter(r => r.subjectName && r.subjectName.trim() !== '');
      const recordsWithFacultyNames = recordsWithCredits.filter(r => r.facultyName && r.facultyName.trim() !== '');
      
      console.log(`Records with subject names: ${recordsWithSubjectNames.length}/${recordsWithCredits.length}`);
      console.log(`Records with faculty names: ${recordsWithFacultyNames.length}/${recordsWithCredits.length}`);
      
      // Log how many records are marked as current semester
      const currentSemesterRecords = recordsWithCredits.filter(record => record.isArrear);
      console.log(`Total ${currentSemesterRecords.length} records marked as current semester out of ${recordsWithCredits.length}`);
      
      console.log(`Applied credits to ${recordsWithCredits.length} records`);
      const recordsWithPositiveCredits = recordsWithCredits.filter(r => r.creditValue && r.creditValue > 0);
      console.log(`Records with positive credits: ${recordsWithPositiveCredits.length} out of ${recordsWithCredits.length}`);
      console.log("============================");
      
      const analysis = analyzeResults(recordsWithCredits, subjectCodesToProcess);
      
      // Add the ordered subjects to the analysis
      analysis.orderedSubjects = subjectOrder.length > 0 ? subjectOrder : undefined;
      
      setResultAnalysis(analysis);
      
      // Store the processed records for later use in report generation
      setStudentRecords(recordsWithCredits);
      
      setIsAnalyzing(false);
      setResultsAvailable(true);
      setActiveTab('results');
      
      toast({
        title: "Analysis complete!",
        description: `Your ${calculationMode?.toUpperCase()} results are now available for review.`
      });
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "There was a problem analyzing your data. Please try again.",
      });
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logging out",
      description: "You have been successfully logged out.",
    });
    
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleResetCalculation = () => {
    setCalculationMode(null);
    setActiveTab('mode');
    setStudentRecords([]);
    setUniqueSubjects([]);
    setResultsAvailable(false);
    setResultAnalysis(null);
    setSubjectCredits([]);
    setOrderedSubjects([]);
    setCreditsAssigned(false);
  };

  return (
    <div className="min-h-screen login-pattern">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c8d5fc43-569a-4b7e-9366-09b681f0e06f.png" 
              alt="College Logo" 
              className="h-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <ProfileButton />
          </div>
        </div>
      </header>

      <main className="flex-grow py-6 px-4 sm:p-6 lg:p-8">
        <div className="container-centered">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Class Advisor Dashboard</h2>
                <p className="text-muted-foreground">
                  {calculationMode 
                    ? `${calculationMode.toUpperCase()} Calculation and Analysis` 
                    : "Select calculation mode to begin"}
                </p>
              </div>
              <TabsList>
                {calculationMode && (
                  <>
                    <TabsTrigger value="mode" onClick={handleResetCalculation} className="flex items-center gap-1">
                      <Calculator className="h-4 w-4" />
                      <span className="hidden sm:inline">Select Mode</span>
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-1">
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </TabsTrigger>
                    <TabsTrigger value="results" disabled={!resultsAvailable} className="flex items-center gap-1">
                      <BarChart4 className="h-4 w-4" />
                      <span className="hidden sm:inline">Results</span>
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <TabsContent value="mode" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Calculate SGPA
                    </CardTitle>
                    <CardDescription>
                      Upload a single Excel sheet to calculate Semester Grade Point Average (SGPA)
                      for a specific semester.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleSelectMode('sgpa')}
                      className="w-full"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Select SGPA Mode
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5" />
                      Calculate CGPA
                    </CardTitle>
                    <CardDescription>
                      Upload multiple Excel sheets (up to 10) to calculate Cumulative Grade Point Average (CGPA)
                      across multiple semesters.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handleSelectMode('cgpa')}
                      className="w-full"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Select CGPA Mode
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <FileUploader 
                  onRecordsUploaded={handleRecordsUploaded}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                  calculationMode={calculationMode}
                />

                <SubjectCreditInput 
                  onCreditAssigned={handleCreditAssigned}
                  uploadedSubjects={uniqueSubjects}
                  isProcessing={isAnalyzing}
                />
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              <ResultsDisplay 
                analysis={resultAnalysis} 
                studentRecords={studentRecords.filter(record => 
                  subjectCredits.some(credit => credit.subjectCode === record.SCODE)
                )}
                calculationMode={calculationMode} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p className="text-lg">{profileInfo.name}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-lg">{profileInfo.email}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
              <p className="text-lg">{profileInfo.role}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Department</h3>
              <p className="text-lg">{profileInfo.department}</p>
            </div>
            <div className="flex flex-col space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">College</h3>
              <p className="text-lg">{profileInfo.college}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
