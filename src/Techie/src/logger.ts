/**
 * logger.ts — Techie Structured Logging System
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export enum LogCategory {
  AUTH = 'AUTH',
  SECURITY = 'SECURITY',
  API = 'API',
  SYSTEM = 'SYSTEM',
  GAMING = 'GAMING',
}

function formatLog(entry: LogEntry): string {
  const colors: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: '\x1b[36m',
    [LogLevel.INFO]: '\x1b[32m',
    [LogLevel.WARN]: '\x1b[33m',
    [LogLevel.ERROR]: '\x1b[31m',
  };
  const catColors: Record<LogCategory, string> = {
    [LogCategory.AUTH]: '\x1b[35m',
    [LogCategory.SECURITY]: '\x1b[31m',
    [LogCategory.API]: '\x1b[36m',
    [LogCategory.SYSTEM]: '\x1b[33m',
    [LogCategory.GAMING]: '\x1b[32m',
  };
  return `[${entry.timestamp}] ${colors[entry.level]}${entry.level}\x1b[0m ${catColors[entry.category]}[${entry.category}]\x1b[0m ${entry.userId ? `[${entry.userId}] ` : ''}${entry.message}`;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
}

export const logger = {
  auth(message: string, context?: Record<string, unknown>, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: LogCategory.AUTH,
      message,
      context,
      userId,
    };
    console.log(formatLog(entry));
  },

  security(message: string, context?: Record<string, unknown>, userId?: string | null) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category: LogCategory.SECURITY,
      message,
      context,
      userId: userId || undefined,
    };
    console.warn(formatLog(entry));
  },

  api(message: string, context?: Record<string, unknown>, userId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: LogCategory.API,
      message,
      context,
      userId,
    };
    console.log(formatLog(entry));
  },

  system(message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      category: LogCategory.SYSTEM,
      message,
      context,
    };
    console.error(formatLog(entry));
  },

  gaming(message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category: LogCategory.GAMING,
      message,
      context,
    };
    console.log(formatLog(entry));
  },

  error(message: string, error: Error, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      category: LogCategory.SYSTEM,
      message,
      context: { ...context, error: error.message },
    };
    console.error(formatLog(entry));
  },
};