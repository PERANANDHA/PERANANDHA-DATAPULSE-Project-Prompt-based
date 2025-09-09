
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Download, Loader, File, FileText } from 'lucide-react';
import { ResultAnalysis, StudentRecord, downloadWordReport, downloadPdfReport } from '@/utils/excelProcessor';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface ReportDownloaderProps {
  analysis: ResultAnalysis | null;
  studentRecords: StudentRecord[];
  calculationMode: 'sgpa' | 'cgpa' | null;
}

const ReportDownloader: React.FC<ReportDownloaderProps> = ({ analysis, studentRecords, calculationMode }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [departmentCode, setDepartmentCode] = useState('CSE');
  const [departmentFullName, setDepartmentFullName] = useState('Computer Science and Engineering');
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'word' | 'pdf' | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();
  
  const handleDownloadReport = useCallback(async (format: 'word' | 'pdf') => {
    if (!analysis || !studentRecords.length) {
      toast({
        variant: "destructive",
        title: "No data available",
        description: "Please upload and analyze data before downloading a report.",
      });
      return;
    }
    
    if (!isDownloading) {
      setSelectedFormat(format);
      setIsDepartmentDialogOpen(true);
      setDownloadProgress(0);
    }
  }, [analysis, studentRecords, isDownloading, toast]);

  const startProgressSimulation = useCallback(() => {
    setDownloadProgress(0);
    const timer = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 90) {
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 150);
    
    return timer;
  }, []);

  const handleConfirmDepartment = useCallback(async () => {
    if (isDownloading) return;
    
    setIsDepartmentDialogOpen(false);
    setIsDownloading(true);
    
    const progressInterval = startProgressSimulation();
    
    try {
      if (analysis) {
        const headerImagePath = "/lovable-uploads/e199a42b-b04e-4918-8bb4-48f3583e7928.png";
        const mode = calculationMode || 'sgpa';
        const options = {
          logoImagePath: headerImagePath,
          department: departmentCode,
          departmentFullName: departmentFullName,
          calculationMode: mode
        };
        
        if (selectedFormat === 'word') {
          // Add a small delay before download to ensure UI updates
          setTimeout(async () => {
            await downloadWordReport(analysis, studentRecords, options);
            
            clearInterval(progressInterval);
            setDownloadProgress(100);
            
            setTimeout(() => {
              toast({
                title: "Report downloaded",
                description: `Your analysis report has been downloaded as WORD.`,
              });
              
              setIsDownloading(false);
              setDownloadProgress(0);
              setSelectedFormat(null);
            }, 300);
          }, 100);
        } else if (selectedFormat === 'pdf') {
          // Add a small delay before download to ensure UI updates
          setTimeout(async () => {
            await downloadPdfReport(analysis, studentRecords, options);
            
            clearInterval(progressInterval);
            setDownloadProgress(100);
            
            setTimeout(() => {
              toast({
                title: "Report downloaded",
                description: `Your analysis report has been downloaded as PDF.`,
              });
              
              setIsDownloading(false);
              setDownloadProgress(0);
              setSelectedFormat(null);
            }, 300);
          }, 100);
        }
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "There was a problem generating your report. Please try again.",
      });
      
      setIsDownloading(false);
      setDownloadProgress(0);
      setSelectedFormat(null);
    }
  }, [analysis, studentRecords, departmentCode, departmentFullName, calculationMode, selectedFormat, toast, startProgressSimulation, isDownloading]);

  return (
    <>
      <div className="flex flex-col gap-2">
        {isDownloading && (
          <div className="w-full mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Generating report</span>
              <span>{Math.round(downloadProgress)}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        )}
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isDownloading}>
                {isDownloading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownloadReport('pdf')}>
                <File className="h-4 w-4 mr-2" />
                <span>Download as PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownloadReport('word')}>
                <FileText className="h-4 w-4 mr-2" />
                <span>Download as Word</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Dialog open={isDepartmentDialogOpen && !isDownloading} onOpenChange={setIsDepartmentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Department Information</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label htmlFor="department-full-name" className="text-sm font-medium mb-2 block">
                Enter Department Full Name
              </label>
              <Input
                id="department-full-name"
                value={departmentFullName}
                onChange={(e) => setDepartmentFullName(e.target.value)}
                placeholder="e.g. Computer Science and Engineering"
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">
                This will be used in the College Information table.
              </p>
            </div>
            
            <div>
              <label htmlFor="department-code" className="text-sm font-medium mb-2 block">
                Enter Department Code (short form)
              </label>
              <Input
                id="department-code"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                placeholder="e.g. CSE"
                className="mb-2"
                maxLength={5}
              />
              <p className="text-sm text-muted-foreground">
                This will be used in the End Semester Result Analysis table.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepartmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDepartment}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportDownloader;
