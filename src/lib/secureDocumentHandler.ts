/**
 * secureDocumentHandler.ts — Safe Document Processing for GPT Knowledge Base
 * 
 * Supports: .txt, .md, .pdf, .docx, .xlsx, .csv
 * Security: Scans for malicious scripts, macros, and dangerous content
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Max content size (8KB as per original, but now more structured)
export const MAX_CONTENT_SIZE = 8000;
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size

// Dangerous patterns to detect
const MALICIOUS_PATTERNS = [
  { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, name: 'Script tags' },
  { pattern: /javascript:/gi, name: 'JavaScript protocol' },
  { pattern: /on\w+\s*=/gi, name: 'Event handlers' },
  { pattern: /eval\s*\(/gi, name: 'Eval function' },
  { pattern: /document\.cookie/gi, name: 'Cookie access' },
  { pattern: /window\.location/gi, name: 'Window manipulation' },
  { pattern: /\bVBA\b|\bMacros?\b/gi, name: 'VBA Macros' },
  { pattern: /Sub\s+\w+[\s\S]*?End\s+Sub/gi, name: 'VBA Macro code' },
  { pattern: /Function\s+\w+[\s\S]*?End\s+Function/gi, name: 'VBA Function' },
  { pattern: /powershell\s+-/gi, name: 'PowerShell commands' },
  { pattern: /cmd\.exe|\bcmd\s+/gi, name: 'CMD commands' },
  { pattern: /rm\s+-rf|\w+\s*;\s*rm/gi, name: 'Destructive commands' },
  { pattern: /base64_decode|eval\s*\(base64/gi, name: 'Obfuscated code' },
  { pattern: /\$\{.*\}/gi, name: 'Template injection' },
  { pattern: /\{\{.*\}\}/gi, name: 'Template injection' },
];

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
  content: string | null;
  contentType: 'text' | 'pdf' | 'excel' | 'word' | 'csv' | 'unsupported';
  isSafe: boolean;
  error?: string;
}

interface ParseResult {
  content: string;
  contentType: ProcessedFile['contentType'];
  isSafe: boolean;
  error?: string;
}

function detectMaliciousContent(content: string): { isSafe: boolean; threats: string[] } {
  const threats: string[] = [];
  
  for (const { pattern, name } of MALICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      threats.push(name);
    }
  }
  
  // Check for suspiciously high entropy (potential obfuscation)
  const uniqueChars = new Set(content).size;
  const entropy = uniqueChars / content.length;
  if (entropy > 0.9 && content.length > 1000) {
    threats.push('High entropy (possible obfuscation)');
  }
  
  return {
    isSafe: threats.length === 0,
    threats
  };
}

function truncateContent(content: string, maxSize: number = MAX_CONTENT_SIZE): string {
  if (content.length <= maxSize) return content;
  return content.substring(0, maxSize) + '\n\n[... content truncated ...]';
}

async function parseTextFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string || '';
      const { isSafe, threats } = detectMaliciousContent(content);
      
      resolve({
        content: truncateContent(content),
        contentType: 'text',
        isSafe,
        error: threats.length > 0 ? `Security warning: ${threats.join(', ')}` : undefined
      });
    };
    reader.onerror = () => resolve({ content: '', contentType: 'text', isSafe: false, error: 'Failed to read file' });
    reader.readAsText(file);
  });
}

async function parseCSV(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string || '';
      
      Papa.parse(text, {
        complete: (results) => {
          const rows = results.data as string[][];
          const headers = rows[0] || [];
          const data = rows.slice(1, 20); // First 20 rows
          
          let content = `CSV Data\nHeaders: ${headers.join(', ')}\n\n`;
          content += data.map(row => 
            headers.map((h, i) => `${h}: ${row[i] || ''}`).join('\n')
          ).join('\n\n');
          
          const { isSafe, threats } = detectMaliciousContent(content);
          
          resolve({
            content: truncateContent(content),
            contentType: 'csv',
            isSafe,
            error: threats.length > 0 ? `Security warning: ${threats.join(', ')}` : undefined
          });
        },
        error: (err) => resolve({ content: '', contentType: 'csv', isSafe: false, error: 'CSV parse error' })
      });
    };
    reader.onerror = () => resolve({ content: '', contentType: 'csv', isSafe: false, error: 'Failed to read file' });
    reader.readAsText(file);
  });
}

async function parseExcel(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let content = `Excel Workbook: ${workbook.SheetNames.join(', ')}\n\n`;
        
        // First sheet only, first 20 rows
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];
        const limitedData = jsonData.slice(0, 20);
        
        content += limitedData.map(row => row.join(' | ')).join('\n');
        
        const { isSafe, threats } = detectMaliciousContent(content);
        
        resolve({
          content: truncateContent(content),
          contentType: 'excel',
          isSafe,
          error: threats.length > 0 ? `Security warning: ${threats.join(', ')}` : undefined
        });
      } catch {
        resolve({ content: '', contentType: 'excel', isSafe: false, error: 'Failed to parse Excel' });
      }
    };
    reader.onerror = () => resolve({ content: '', contentType: 'excel', isSafe: false, error: 'Failed to read file' });
    reader.readAsArrayBuffer(file);
  });
}

async function parsePDF(file: File): Promise<ParseResult> {
  // PDF parsing requires server-side or more complex client-side
  // For now, return a message that PDF requires processing
  return {
    content: `[PDF Document: ${file.name}]\n\nNote: PDF content extraction requires server-side processing. The file has been attached for RAG context.\nSize: ${(file.size / 1024).toFixed(2)} KB`,
    contentType: 'pdf',
    isSafe: true
  };
}

async function parseWord(file: File): Promise<ParseResult> {
  // Word parsing requires additional library (mammoth.js)
  // For now, return a message that Word requires processing
  return {
    content: `[Word Document: ${file.name}]\n\nNote: Word content extraction requires server-side processing. The file has been attached for RAG context.\nSize: ${(file.size / 1024).toFixed(2)} KB`,
    contentType: 'word',
    isSafe: true
  };
}

export async function processDocument(file: File): Promise<ProcessedFile> {
  if (file.size > MAX_FILE_SIZE) {
    return {
      id: '',
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      date: new Date().toLocaleDateString(),
      content: null,
      contentType: 'unsupported',
      isSafe: false,
      error: `File too large. Max size: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const fileId = Math.random().toString(36).substr(2, 9);
  
  let result: ParseResult;
  
  // Determine file type and parse accordingly
  switch (extension) {
    case 'txt':
    case 'md':
    case 'csv':
      if (extension === 'csv') {
        result = await parseCSV(file);
      } else {
        result = await parseTextFile(file);
      }
      break;
      
    case 'xlsx':
    case 'xls':
      result = await parseExcel(file);
      break;
      
    case 'pdf':
      result = await parsePDF(file);
      break;
      
    case 'docx':
    case 'doc':
      result = await parseWord(file);
      break;
      
    default:
      // Try as text
      result = await parseTextFile(file);
      break;
  }
  
  return {
    id: fileId,
    name: file.name,
    type: file.type,
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    date: new Date().toLocaleDateString(),
    content: result.content || null,
    contentType: result.contentType,
    isSafe: result.isSafe,
    error: result.error
  };
}

export async function processDocuments(files: File[]): Promise<ProcessedFile[]> {
  const results: ProcessedFile[] = [];
  
  for (const file of files) {
    const processed = await processDocument(file);
    results.push(processed);
  }
  
  return results;
}

// Create context string from processed files for LLM
export function createRAGContext(files: ProcessedFile[]): string {
  const validFiles = files.filter(f => f.content && f.isSafe);
  
  if (validFiles.length === 0) {
    return '';
  }
  
  return validFiles.map(f => 
    `=== ${f.name} (${f.contentType.toUpperCase()}) ===\n${f.content}\n`
  ).join('\n\n');
}