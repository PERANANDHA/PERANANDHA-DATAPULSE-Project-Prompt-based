
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from '@/hooks/use-toast';

interface SubjectCredit {
  subjectCode: string;
  creditValue: number;
  subjectName?: string;
  facultyName?: string;
  isArrear?: boolean;
}

interface SubjectCreditInputProps {
  uploadedSubjects: string[];
  onCreditAssigned: (credits: SubjectCredit[], orderedSubjects: string[]) => void;
  isProcessing: boolean;
}

const SubjectCreditInput: React.FC<SubjectCreditInputProps> = ({
  uploadedSubjects,
  onCreditAssigned,
  isProcessing
}) => {
  const [subjectCredits, setSubjectCredits] = useState<SubjectCredit[]>([]);
  const [orderedSubjects, setOrderedSubjects] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  // Initialize or reset subject credits when uploaded subjects change
  useEffect(() => {
    if (uploadedSubjects.length > 0) {
      const initialCredits = uploadedSubjects.map(subject => ({
        subjectCode: subject,
        creditValue: 3,
        subjectName: '',
        facultyName: '',
        isArrear: false
      }));
      setSubjectCredits(initialCredits);
      setOrderedSubjects([]); // Reset ordered subjects when new files are uploaded
      validateInputs(initialCredits);
      
      console.log("Initialized subject credits:", initialCredits);
    } else {
      setSubjectCredits([]);
      setOrderedSubjects([]);
      setIsValid(false);
    }
  }, [uploadedSubjects]);

  const handleCreditChange = (subjectCode: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1 || numValue > 10) {
      return; // Don't update if invalid
    }
    
    const updatedCredits = subjectCredits.map(credit => 
      credit.subjectCode === subjectCode ? {
        ...credit,
        creditValue: numValue
      } : credit
    );
    
    setSubjectCredits(updatedCredits);
    validateInputs(updatedCredits);
    console.log(`Credit value updated for ${subjectCode}: ${numValue}`);
  };

  const handleSubjectNameChange = (subjectCode: string, name: string) => {
    const updatedCredits = subjectCredits.map(credit => 
      credit.subjectCode === subjectCode ? {
        ...credit,
        subjectName: name
      } : credit
    );
    
    setSubjectCredits(updatedCredits);
    validateInputs(updatedCredits);
    console.log(`Subject name updated for ${subjectCode}: ${name}`);
  };

  const handleFacultyNameChange = (subjectCode: string, name: string) => {
    const updatedCredits = subjectCredits.map(credit => 
      credit.subjectCode === subjectCode ? {
        ...credit,
        facultyName: name
      } : credit
    );
    
    setSubjectCredits(updatedCredits);
    validateInputs(updatedCredits);
    console.log(`Faculty name updated for ${subjectCode}: ${name}`);
  };

  const handleToggleArrear = (subjectCode: string) => {
    // Update the subject credits
    const updatedCredits = subjectCredits.map(credit => 
      credit.subjectCode === subjectCode ? {
        ...credit,
        isArrear: !credit.isArrear
      } : credit
    );
    
    setSubjectCredits(updatedCredits);
    validateInputs(updatedCredits);
    
    const subject = updatedCredits.find(credit => credit.subjectCode === subjectCode);
    if (subject) {
      // Update the ordered subjects list
      if (subject.isArrear) {
        // Add to ordered subjects if it's now marked as current and not already in the list
        if (!orderedSubjects.includes(subjectCode)) {
          setOrderedSubjects([...orderedSubjects, subjectCode]);
          console.log(`Subject ${subjectCode} added to ordered subjects list at position ${orderedSubjects.length + 1}`);
        }
      } else {
        // Remove from ordered subjects if it's unmarked
        const newOrderedSubjects = orderedSubjects.filter(code => code !== subjectCode);
        setOrderedSubjects(newOrderedSubjects);
        console.log(`Subject ${subjectCode} removed from ordered subjects list`);
      }
      
      toast({
        title: subject.isArrear ? "Subject marked as Current Semester" : "Subject unmarked from Current Semester",
        description: `Subject ${subjectCode} has been ${subject.isArrear ? "marked as" : "removed from"} current semester subjects.`
      });
      console.log(`Subject ${subjectCode} is now ${subject.isArrear ? 'marked' : 'unmarked'} as current semester`);
    }
  };

  const handleRemoveSubject = (subjectCode: string) => {
    const updatedCredits = subjectCredits.filter(credit => credit.subjectCode !== subjectCode);
    setSubjectCredits(updatedCredits);
    
    // Also remove from ordered subjects if present
    const newOrderedSubjects = orderedSubjects.filter(code => code !== subjectCode);
    setOrderedSubjects(newOrderedSubjects);
    
    validateInputs(updatedCredits);
    
    toast({
      title: "Subject removed",
      description: `Subject ${subjectCode} has been removed from the list.`
    });
    console.log(`Subject ${subjectCode} removed from the list`);
  };

  const validateInputs = (credits: SubjectCredit[]) => {
    // Check if all credits are assigned with valid values
    const allValid = credits.length > 0 && credits.every(credit => 
      credit.creditValue >= 1 && credit.creditValue <= 10
    );

    // Log validation status
    console.log(`Input validation: ${allValid ? 'VALID' : 'INVALID'}`);
    
    // Log which subjects are marked as current semester
    const currentSemesterSubjects = credits.filter(credit => credit.isArrear);
    if (currentSemesterSubjects.length > 0) {
      console.log(`${currentSemesterSubjects.length} subjects marked as current semester: ${currentSemesterSubjects.map(s => s.subjectCode).join(', ')}`);
    }
    
    // Debug log subject and faculty names
    const withSubjectNames = credits.filter(c => c.subjectName && c.subjectName.trim() !== '');
    if (withSubjectNames.length > 0) {
      console.log(`Subjects with names (${withSubjectNames.length}):`, withSubjectNames.map(c => `${c.subjectCode}: "${c.subjectName}"`).join(', '));
    }
    
    const withFacultyNames = credits.filter(c => c.facultyName && c.facultyName.trim() !== '');
    if (withFacultyNames.length > 0) {
      console.log(`Subjects with faculty names (${withFacultyNames.length}):`, withFacultyNames.map(c => `${c.subjectCode}: "${c.facultyName}"`).join(', '));
    }
    
    // Log ordered subjects
    if (orderedSubjects.length > 0) {
      console.log(`Ordered subjects (${orderedSubjects.length}):`, orderedSubjects.join(', '));
    }
    
    setIsValid(allValid);
    return allValid;
  };

  const handleSubmit = () => {
    if (!validateInputs(subjectCredits)) {
      toast({
        variant: "destructive",
        title: "Invalid credit values",
        description: "Please ensure all subjects have valid credit values (1-10)."
      });
      return;
    }
    
    // Create a deep copy of the credits to ensure we're passing a fresh object
    const creditsToSubmit = JSON.parse(JSON.stringify(subjectCredits));
    
    // Log the data being submitted
    console.log("======= SUBMITTING SUBJECT CREDITS =======");
    console.log("Total subjects:", creditsToSubmit.length);
    
    // Debug log for subject and faculty names
    const subjectNameCount = creditsToSubmit.filter((c: SubjectCredit) => c.subjectName && c.subjectName.trim() !== '').length;
    const facultyNameCount = creditsToSubmit.filter((c: SubjectCredit) => c.facultyName && c.facultyName.trim() !== '').length;
    
    console.log(`Subject names included: ${subjectNameCount}/${creditsToSubmit.length}`);
    console.log(`Faculty names included: ${facultyNameCount}/${creditsToSubmit.length}`);
    
    // Log ordered subjects
    console.log(`Ordered current semester subjects: ${orderedSubjects.length}`);
    console.log(`Order: ${orderedSubjects.join(' -> ')}`);
    
    // Log each subject's data for debugging
    creditsToSubmit.forEach((credit: SubjectCredit, index: number) => {
      const order = orderedSubjects.indexOf(credit.subjectCode) > -1 ? 
                    `Order: ${orderedSubjects.indexOf(credit.subjectCode) + 1}` : 'Not ordered';
      console.log(`Subject ${index + 1}: Code=${credit.subjectCode}, Credits=${credit.creditValue}, Name="${credit.subjectName || 'Not set'}", Faculty="${credit.facultyName || 'Not set'}", Current Semester=${credit.isArrear ? 'Yes' : 'No'}, ${order}`);
    });
    
    console.log("======= END SUBMITTING =======");
    
    onCreditAssigned(creditsToSubmit, [...orderedSubjects]);
    
    toast({
      title: "Credit values assigned",
      description: "Subject credits have been successfully assigned."
    });
  };

  if (uploadedSubjects.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2 shadow-md overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle>Subject Credits</CardTitle>
          <CardDescription>
            Please upload an Excel file first to assign subject credits.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle>Assign Subject Details</CardTitle>
        <CardDescription>
          Specify credit values (1-10), subject names and faculty names for each subject code found in the uploaded file(s).
          Mark subjects as Current Semester in the order you want them to appear in reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Container with increased width to ensure all buttons are visible */}
        <div className="rounded-md border-2 border-gray-400 overflow-x-auto mt-2 w-full">
          <div className="min-w-[1100px]">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead style={{ minWidth: '120px' }}>Subject Code</TableHead>
                  <TableHead style={{ minWidth: '100px' }}>Credit Value</TableHead>
                  <TableHead style={{ minWidth: '200px' }}>Subject Name</TableHead>
                  <TableHead style={{ minWidth: '200px' }}>Faculty Name</TableHead>
                  <TableHead style={{ minWidth: '220px' }}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjectCredits.map(subject => {
                  const orderIndex = orderedSubjects.indexOf(subject.subjectCode);
                  return (
                    <TableRow key={subject.subjectCode} className={subject.isArrear ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                      <TableCell className="font-medium">
                        {subject.subjectCode}
                        {subject.isArrear && (
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="ml-2 bg-green-600">CS</Badge>
                            {orderIndex > -1 && <Badge variant="outline">{orderIndex + 1}</Badge>}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          min={1} 
                          max={10} 
                          value={subject.creditValue} 
                          onChange={e => handleCreditChange(subject.subjectCode, e.target.value)} 
                          className="w-20 mx-auto text-center" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="text" 
                          placeholder="Enter subject name" 
                          value={subject.subjectName || ''} 
                          onChange={e => handleSubjectNameChange(subject.subjectCode, e.target.value)} 
                          className="w-full mx-auto" 
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="text" 
                          placeholder="Enter faculty name" 
                          value={subject.facultyName || ''} 
                          onChange={e => handleFacultyNameChange(subject.subjectCode, e.target.value)} 
                          className="w-full mx-auto" 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant={subject.isArrear ? "secondary" : "outline"} 
                            size="sm" 
                            onClick={() => handleToggleArrear(subject.subjectCode)} 
                            className={subject.isArrear ? "bg-green-600 hover:bg-green-700 text-white" : "bg-zinc-300 hover:bg-zinc-200 text-green-600"}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {subject.isArrear ? `Current Semester ✓${orderIndex > -1 ? ` (${orderIndex + 1})` : ''}` : "Mark as Current"}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleRemoveSubject(subject.subjectCode)} 
                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isProcessing} 
            className="w-full sm:w-auto"
          >
            {isProcessing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : 'Assign Details & Process Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectCreditInput;
