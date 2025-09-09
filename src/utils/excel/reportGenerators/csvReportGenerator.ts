
import { ResultAnalysis, StudentRecord } from '../types';

// Function to download CSV report
export const downloadCSVReport = (analysis: ResultAnalysis, records: StudentRecord[]): void => {
  try {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Registration Number,SGPA,Status\n";
    
    // Add student data
    analysis.studentSgpaDetails?.forEach(student => {
      const status = student.hasArrears ? 'Has Arrears' : (student.sgpa < 6.5 ? 'SGPA below 6.5' : 'Good Standing');
      csvContent += `${student.id},${student.sgpa.toFixed(2)},${status}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'result-analysis-report.csv');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating CSV report:', error);
  }
};
