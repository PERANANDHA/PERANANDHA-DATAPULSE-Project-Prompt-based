
import * as XLSX from 'xlsx';
import { StudentRecord } from './types';

// Parse a single Excel file and return the records
export const parseExcelFile = async (file: File): Promise<StudentRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const records: StudentRecord[] = XLSX.utils.sheet_to_json(worksheet, { raw: true })
          .map((row: any) => ({
            CNo: String(row['CNo'] || ''),
            SEM: String(row['SEM'] || ''),
            REGNO: String(row['REGNO'] || ''),
            SCODE: String(row['SCODE'] || ''),
            GR: String(row['GR'] || ''),
            fileSource: file.name, // Add the source file name
          }));

        resolve(records);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

// Parse multiple Excel files
export const parseMultipleExcelFiles = async (files: File[]): Promise<StudentRecord[]> => {
  try {
    // Process each file and get their records
    const recordPromises = files.map(file => parseExcelFile(file));
    const recordArrays = await Promise.all(recordPromises);
    
    // Combine all records into a single array
    const combinedRecords = recordArrays.flat();
    
    return combinedRecords;
  } catch (error) {
    throw new Error(`Error processing multiple files: ${error}`);
  }
};
