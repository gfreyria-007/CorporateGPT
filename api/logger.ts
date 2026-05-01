/**
 * api/logger.ts — Structured Logging System
 * 
 * Provides consistent logging across all API endpoints.
 * Categories:
 *   - AUDIT: User actions for compliance (login, logout, data access)
 *   - SECURITY: Auth failures, forbidden content, rate limits, suspicious activity
 *   - API: Request metrics, response times, model usage, token consumption
 *   - SYSTEM: Errors, warnings, infrastructure issues
 * 
 * Format: [TIMESTAMP] [LEVEL] [CATEGORY] [Context] Message
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum LogCategory {
  AUDIT = 'AUDIT',
  SECURITY = 'SECURITY',
  API = 'API',
  SYSTEM = 'SYSTEM',
  QUOTA = 'QUOTA',
  PAYMENT = 'PAYMENT',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  ip?: string;
}

function formatLogLevel(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '\x1b[36m',   // Cyan
    [LogLevel.INFO]: '\x1b[32m',    // Green
    [LogLevel.WARN]: '\x1b[33m',    // Yellow
    [LogLevel.ERROR]: '\x1b[31m',   // Red
  };
  return `${colors[level]}${level}\x1b[0m`;
}

function formatCategory(category: LogCategory): string {
  const colors: Record<LogCategory, string> = {
    [LogCategory.AUDIT]: '\x1b[35m',     // Magenta
    [LogCategory.SECURITY]: '\x1b[31m',  // Red
    [LogCategory.API]: '\x1b[36m',       // Cyan
    [LogCategory.SYSTEM]: '\x1b[33m',    // Yellow
    [LogCategory.QUOTA]: '\x1b[34m',     // Blue
    [LogCategory.PAYMENT]: '\x1b[32m',   // Green
  };
  return `${colors[category]}[${category}]\x1b[0m`;
}

function createLogEntry(
  level: LogLevel,
  category: LogCategory,
  message: string,
  context?: Record<string, unknown>,
  userId?: string
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    context,
    userId,
  };
}

function formatEntry(entry: LogEntry): string {
  const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
  const userStr = entry.userId ? ` | user:${entry.userId}` : '';
  return `[${entry.timestamp}] ${formatLogLevel(entry.level)} ${formatCategory(entry.category)}${userStr} ${entry.message}${contextStr}`;
}

export const logger = {
  audit(message: string, context?: Record<string, unknown>, userId?: string) {
    const entry = createLogEntry(LogLevel.INFO, LogCategory.AUDIT, message, context, userId);
    console.log(formatEntry(entry));
  },

  security(message: string, context?: Record<string, unknown>, userId?: string | null) {
    const entry = createLogEntry(LogLevel.WARN, LogCategory.SECURITY, message, context, userId || undefined);
    console.warn(formatEntry(entry));
  },

  api(message: string, context?: Record<string, unknown>, userId?: string) {
    const entry = createLogEntry(LogLevel.INFO, LogCategory.API, message, context, userId);
    console.log(formatEntry(entry));
  },

  system(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry(LogLevel.ERROR, LogCategory.SYSTEM, message, context);
    console.error(formatEntry(entry));
  },

  quota(message: string, context?: Record<string, unknown>, userId?: string) {
    const entry = createLogEntry(LogLevel.INFO, LogCategory.QUOTA, message, context, userId);
    console.log(formatEntry(entry));
  },

  payment(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry(LogLevel.INFO, LogCategory.PAYMENT, message, context);
    console.log(formatEntry(entry));
  },

  error(message: string, error: Error, context?: Record<string, unknown>) {
    const entry = createLogEntry(
      LogLevel.ERROR,
      LogCategory.SYSTEM,
      message,
      { ...context, error: error.message, stack: error.stack }
    );
    console.error(formatEntry(entry));
  },

  debug(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry(LogLevel.DEBUG, LogCategory.SYSTEM, message, context);
    console.log(formatEntry(entry));
  },
};

// Helper to extract user ID from request
export function extractUserIdFromRequest(req: { 
  headers: { [key: string]: string | string[] | undefined }; 
  body?: { userId?: string };
}): { userId: string | null; ip: string } {
  let userId: string | null = null;
  
  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    try {
      const idToken = authHeader.substring(7);
      const decoded = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      userId = decoded.uid || decoded.user_id || null;
    } catch {
      userId = req.body?.userId || null;
    }
  } else {
    userId = req.body?.userId || null;
  }

  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const realIp = req.headers['x-real-ip'];
  const realIpStr = Array.isArray(realIp) ? realIp[0] : realIp;
  const ip = forwardedIp ? forwardedIp.split(',')[0].trim() : realIpStr || 'unknown';

  return { userId, ip };
}