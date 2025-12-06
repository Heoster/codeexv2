type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  modality?: string;
  model?: string;
  latency?: number;
}

export class Logger {
  private static logs: LogEntry[] = [];
  private static readonly MAX_LOGS = 1000;

  static log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      console[level](message, data);
    }
  }

  static logRequest(modality: string, model: string, input: any): string {
    const requestId = Math.random().toString(36).substr(2, 9);
    this.log('info', `Request started: ${requestId}`, {
      modality,
      model,
      inputType: typeof input,
      requestId
    });
    return requestId;
  }

  static logResponse(requestId: string, success: boolean, latency: number, error?: any): void {
    this.log(success ? 'info' : 'error', `Request completed: ${requestId}`, {
      requestId,
      success,
      latency,
      error: error?.message
    });
  }

  static getStats(): { totalRequests: number; avgLatency: number; errorRate: number } {
    const requests = this.logs.filter(log => log.message.includes('Request completed'));
    const errors = requests.filter(log => log.level === 'error');
    const latencies = requests.map(log => log.data?.latency).filter(Boolean);
    
    return {
      totalRequests: requests.length,
      avgLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
      errorRate: requests.length > 0 ? errors.length / requests.length : 0
    };
  }

  static debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  static info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  static warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  static error(message: string, data?: any): void {
    this.log('error', message, data);
  }
}