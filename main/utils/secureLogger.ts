/**
 * Secure Logger for Figma Plugin Main Thread
 * 
 * Simplified version for the main plugin thread with minimal dependencies
 */

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

class MainThreadLogger {
  private currentLevel: LogLevel = LogLevel.WARN; // Conservative default

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.redactSensitive(data);
    }
    
    if (data instanceof Error) {
      return {
        name: data.name,
        message: this.redactSensitive(data.message)
      };
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveKey(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = typeof value === 'object' ? '[OBJECT]' : String(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private isSensitiveKey(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return ['apikey', 'password', 'token', 'secret', 'auth', 'credential'].some(
      sensitive => lowerKey.includes(sensitive)
    );
  }

  private redactSensitive(text: string): string {
    return text.replace(
      /['\"]?(?:api[_-]?key|password|token|secret)['\"]?\s*[=:]\s*['\"]?([^'"\s,}]+)/gi,
      (match, group) => match.replace(group, '[REDACTED]')
    );
  }

  private log(level: LogLevel, levelName: string, message: string, data?: any): void {
    if (level > this.currentLevel) return;

    const sanitizedData = data !== undefined ? this.sanitizeData(data) : undefined;
    const formattedMessage = `[PLUGIN] ${levelName}: ${message}`;

    if (sanitizedData !== undefined) {
      console.log(formattedMessage, sanitizedData);
    } else {
      console.log(formattedMessage);
    }
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, 'ERROR', message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'WARN', message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, 'INFO', message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, 'DEBUG', message, data);
  }

  security(message: string, data?: any): void {
    this.log(LogLevel.WARN, 'SECURITY', message, data);
  }
}

const mainLogger = new MainThreadLogger();
export default mainLogger;