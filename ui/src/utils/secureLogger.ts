/**
 * Secure Logging Utility
 * 
 * Provides controlled logging with security features:
 * - Level-based filtering (ERROR, WARN, INFO, DEBUG)
 * - Automatic sensitive data redaction
 * - Production mode filtering
 * - Safe error serialization
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class SecureLogger {
  private currentLevel: LogLevel;
  private isProduction: boolean;

  constructor() {
    // Determine environment - production builds should have minimal logging
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Set logging level based on environment
    this.currentLevel = this.isProduction ? LogLevel.WARN : LogLevel.DEBUG;
  }

  /**
   * Patterns for sensitive data that should be redacted
   */
  private static readonly SENSITIVE_PATTERNS = [
    // API Keys and tokens
    /['\"]?(?:api[_-]?key|apikey|access[_-]?token|auth[_-]?token|bearer|jwt)['\"]?\s*[=:]\s*['\"]?([^'"\s,}]+)/gi,
    
    // Passwords and secrets
    /['\"]?(?:password|passwd|pwd|secret|credential)['\"]?\s*[=:]\s*['\"]?([^'"\s,}]+)/gi,
    
    // Authorization headers
    /authorization\s*[=:]\s*['\"]?([^'"\s,}]+)/gi,
    
    // Encrypted data (base64-like strings > 20 chars)
    /['\"]([A-Za-z0-9+/]{20,}={0,2})['"]/g,
    
    // URLs with credentials
    /(https?:\/\/[^:]+:)[^@]+(@[^/]+)/gi
  ];

  /**
   * Redact sensitive information from log messages and objects
   */
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.redactSensitiveStrings(data);
    }
    
    if (data instanceof Error) {
      return {
        name: data.name,
        message: this.redactSensitiveStrings(data.message),
        stack: this.isProduction ? '[REDACTED]' : this.redactSensitiveStrings(data.stack || '')
      };
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Redact sensitive keys entirely
        if (this.isSensitiveKey(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Check if a key name suggests sensitive data
   */
  private isSensitiveKey(key: string): boolean {
    const sensitiveKeys = [
      'apikey', 'api_key', 'apiKey',
      'password', 'passwd', 'pwd',
      'secret', 'token', 'auth', 'authorization',
      'credential', 'key', 'bearer', 'jwt',
      'encrypted', 'cipher', 'hash'
    ];
    
    const lowerKey = key.toLowerCase();
    return sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
  }

  /**
   * Redact sensitive patterns from strings
   */
  private redactSensitiveStrings(text: string): string {
    let result = text;
    
    SecureLogger.SENSITIVE_PATTERNS.forEach(pattern => {
      result = result.replace(pattern, (match, ...groups) => {
        // Keep the prefix, redact the sensitive part
        return match.replace(groups[0], '[REDACTED]');
      });
    });
    
    return result;
  }

  /**
   * Format log message with context
   */
  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString().substring(11, 23); // HH:mm:ss.sss
    const component = context?.component ? `[${context.component}] ` : '';
    const action = context?.action ? `${context.action}: ` : '';
    
    return `${timestamp} ${level} ${component}${action}${message}`;
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, levelName: string, message: string, data?: any, context?: LogContext): void {
    // Skip if level is below current threshold
    if (level > this.currentLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(levelName, message, context);
    const sanitizedData = data !== undefined ? this.sanitizeData(data) : undefined;

    // Use appropriate console method
    const consoleMethod = level === LogLevel.ERROR ? console.error :
                         level === LogLevel.WARN ? console.warn :
                         console.log;

    if (sanitizedData !== undefined) {
      consoleMethod(formattedMessage, sanitizedData);
    } else {
      consoleMethod(formattedMessage);
    }
  }

  /**
   * Public logging methods
   */
  error(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data, context);
  }

  warn(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.WARN, 'WARN', message, data, context);
  }

  info(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.INFO, 'INFO', message, data, context);
  }

  debug(message: string, data?: any, context?: LogContext): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data, context);
  }

  /**
   * Security-specific logging
   */
  security(message: string, data?: any, context?: LogContext): void {
    // Security events are always logged (unless in production with sensitive data)
    const securityContext = { ...context, component: 'SECURITY' };
    this.log(LogLevel.WARN, 'SECURITY', message, data, securityContext);
  }

  /**
   * Set logging level dynamically
   */
  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  /**
   * Get current logging level
   */
  getLevel(): LogLevel {
    return this.currentLevel;
  }
}

// Create singleton instance
const logger = new SecureLogger();

export { logger, LogContext };
export default logger;