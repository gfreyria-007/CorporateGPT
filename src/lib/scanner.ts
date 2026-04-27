/**
 * src/lib/scanner.ts
 * ---------------------------------------------------------------
 * Neural Security Scanner for Corporate GPT.
 * Scans attachments and inputs for common exploits, malware patterns,
 * and malicious payloads.
 * ---------------------------------------------------------------
 */

export interface ScanResult {
  safe: boolean;
  threats: string[];
}

const MALICIOUS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/gim, // XSS
  /eval\s*\(/gi, // JS Execution
  /base64\s*,/gi, // Possible encoded payload
  /powershell/gi, // OS Command
  /rm\s+-rf/gi, // Destructive command
  /format\s+c:/gi, // Destructive command
  /chmod\s+777/gi, // Permission escalation
  /cat\s+\/etc\/passwd/gi, // Info leakage
  /curl\s+.*\s*\|\s*bash/gi, // Remote execution
  /\.exe\b|\.sh\b|\.bat\b/gi, // Executable extensions in text
  /ignore\s+previous\s+instructions/gi, // Prompt injection
  /you\s+are\s+now\s+a\s+.*without\s+restrictions/gi, // Jailbreak attempt
  /system\s+override/gi, // Injection
  /\[system\s*prompt\]/gi, // Injection
  /DAN\s+mode/gi, // Jailbreak
  /bypass\s+security/gi, // Intent detection
];

export const scanContent = (content: string): ScanResult => {
  const threats: string[] = [];

  // Check for malicious patterns
  for (const pattern of MALICIOUS_PATTERNS) {
    if (pattern.test(content)) {
      threats.push(`Pattern detected: ${pattern.toString()}`);
    }
  }

  // Check for suspicious length or entropy (basic)
  if (content.length > 100000) {
    // We can flag extremely large files for manual review or secondary scanning
  }

  return {
    safe: threats.length === 0,
    threats,
  };
};

/**
 * Scan a list of attachments
 */
export const scanAttachments = (attachments: { name: string; content: string }[]): ScanResult => {
  const allThreats: string[] = [];
  
  for (const doc of attachments) {
    const result = scanContent(doc.content);
    if (!result.safe) {
      allThreats.push(...result.threats.map(t => `[${doc.name}] ${t}`));
    }
    
    // Scan filename too
    const nameResult = scanContent(doc.name);
    if (!nameResult.safe) {
       allThreats.push(...nameResult.threats.map(t => `[Filename: ${doc.name}] ${t}`));
    }
  }

  return {
    safe: allThreats.length === 0,
    threats: allThreats,
  };
};
