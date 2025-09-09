
import React, { useState } from 'react';
import { FileSpreadsheet, Trash2, Upload, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { parseExcelFile, parseMultipleExcelFiles, StudentRecord } from '@/utils/excelProcessor';

interface FileUploaderProps {
  onRecordsUploaded: (records: StudentRecord[], subjects: string[]) => void;
  isUploading: boolean;
  setIsUploading: (status: boolean) => void;
  calculationMode: 'sgpa' | 'cgpa' | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onRecordsUploaded, 
  isUploading, 
  setIsUploading,
  calculationMode 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // For SGPA mode, only allow a single file
    if (calculationMode === 'sgpa' && (files.length > 0 || selectedFiles.length > 1)) {
      toast({
        variant: "destructive",
        title: "Only one file allowed",
        description: "SGPA calculation mode only allows a single Excel file.",
      });
      return;
    }
    
    // For CGPA mode, enforce the 10 file limit
    if (calculationMode === 'cgpa' && files.length + selectedFiles.length > 10) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: "You can upload a maximum of 10 Excel files at once for CGPA calculation.",
      });
      return;
    }
    
    const newFiles = Array.from(selectedFiles).filter(file => {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast({
          variant: "destructive",
          title: "Invalid file",
          description: `${file.name} is not a valid Excel file (.xlsx or .xls).`,
        });
        return false;
      }
      return true;
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No files selected",
        description: "Please select at least one Excel file to upload.",
      });
      return;
    }

    // For SGPA, ensure only one file is uploaded
    if (calculationMode === 'sgpa' && files.length > 1) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: "SGPA calculation mode only allows a single Excel file.",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      let records: StudentRecord[];
      
      if (files.length === 1) {
        records = await parseExcelFile(files[0]);
      } else {
        records = await parseMultipleExcelFiles(files);
      }
      
      // Get unique subjects
      const subjects = [...new Set(records.map(record => record.SCODE))];
      
      toast({
        title: "Files uploaded successfully!",
        description: `Parsed ${records.length} records from ${files.length} Excel file(s).`,
      });
      
      onRecordsUploaded(records, subjects);
      
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Processing failed",
        description: error instanceof Error ? error.message : "There was a problem processing your files. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getUploadDescription = () => {
    if (calculationMode === 'sgpa') {
      return "Upload a single Excel file containing student results data for SGPA analysis.";
    } else if (calculationMode === 'cgpa') {
      return "Upload up to 10 Excel files containing student results data for CGPA analysis.";
    }
    return "Upload Excel files containing student results data for analysis.";
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Upload Excel Files{calculationMode ? ` for ${calculationMode.toUpperCase()} Calculation` : ''}
        </CardTitle>
        <CardDescription>
          {getUploadDescription()} Each file should contain columns: SEM (Semester),
          REGNO (Registration Number), SCODE (Subject Code), and GR (Grade).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div 
            className="border-2 border-dashed border-input rounded-lg p-8 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              multiple={calculationMode === 'cgpa'}
            />
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">Drag and drop your files here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">
              {calculationMode === 'sgpa' 
                ? "Supports a single .xlsx or .xls file" 
                : "Supports multiple .xlsx and .xls files (max 10)"}
            </p>
            
            {files.length > 0 && (
              <div className="mt-4 p-2 bg-secondary rounded-md w-full max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">{files.length} file(s) selected</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFiles([]);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground mr-2">
                          {(file.size / 1024).toFixed(2)} KB
                        </span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || isUploading}
            className="w-full max-w-md"
          >
            {isUploading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length > 1 ? 'Files' : 'File'}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
