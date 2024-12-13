import { format } from 'date-fns';
import { useAdminStore } from '../store/adminStore';

export type SecurityLogSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SecurityLogType = 'auth' | 'access' | 'system' | 'data' | 'admin';

export interface SecurityLogMetadata {
  ip?: string;
  userAgent?: string;
  location?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  errorCode?: string;
  [key: string]: any;
}

export interface SecurityLogOptions {
  severity: SecurityLogSeverity;
  type: SecurityLogType;
  userId?: string;
  metadata?: SecurityLogMetadata;
}

class SecurityLogger {
  private static instance: SecurityLogger;
  private geoLocationCache: Map<string, Promise<any>> = new Map();

  private constructor() {}

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  async log(message: string, options: SecurityLogOptions): Promise<void> {
    const { addSecurityLog } = useAdminStore.getState();

    // Enrich metadata with geolocation if IP is provided
    if (options.metadata?.ip && !options.metadata.location) {
      options.metadata.location = await this.getLocationFromIP(options.metadata.ip);
    }

    // Enrich metadata with browser info
    if (typeof window !== 'undefined') {
      options.metadata = {
        ...options.metadata,
        userAgent: window.navigator.userAgent,
        platform: window.navigator.platform,
        language: window.navigator.language,
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      };
    }

    // Add the log entry
    addSecurityLog({
      type: options.type,
      severity: options.severity,
      message,
      userId: options.userId,
      metadata: options.metadata,
      timestamp: new Date().toISOString(),
      status: 'detected',
    });

    // Trigger notifications for high severity events
    if (options.severity === 'high' || options.severity === 'critical') {
      this.notifySecurityTeam(message, options);
    }
  }

  private async getLocationFromIP(ip: string): Promise<string> {
    if (!this.geoLocationCache.has(ip)) {
      this.geoLocationCache.set(ip, fetch(`https://ipapi.co/${ip}/json/`)
        .then(res => res.json())
        .then(data => `${data.city}, ${data.country_name}`)
        .catch(() => 'Unknown Location')
      );
    }
    return this.geoLocationCache.get(ip)!;
  }

  private notifySecurityTeam(message: string, options: SecurityLogOptions): void {
    // In a real application, this would integrate with your notification system
    console.warn('High severity security event:', {
      message,
      severity: options.severity,
      type: options.type,
      metadata: options.metadata,
    });

    // You could also trigger desktop notifications
    if (Notification.permission === 'granted') {
      new Notification('Security Alert', {
        body: `${options.severity.toUpperCase()}: ${message}`,
        icon: '/security-alert.png',
        tag: 'security-alert',
      });
    }
  }

  // Helper methods for common security events
  logAuthAttempt(success: boolean, userId: string, ip: string): void {
    const severity = success ? 'low' : 'medium';
    const message = success 
      ? `Successful login for user ${userId}`
      : `Failed login attempt for user ${userId}`;

    this.log(message, {
      type: 'auth',
      severity,
      userId,
      metadata: { ip, success }
    });
  }

  logAccessAttempt(resource: string, userId: string, allowed: boolean): void {
    const severity = allowed ? 'low' : 'high';
    const message = allowed
      ? `Access granted to ${resource} for user ${userId}`
      : `Unauthorized access attempt to ${resource} by user ${userId}`;

    this.log(message, {
      type: 'access',
      severity,
      userId,
      metadata: { resource, allowed }
    });
  }

  logSystemEvent(message: string, severity: SecurityLogSeverity, metadata?: SecurityLogMetadata): void {
    this.log(message, {
      type: 'system',
      severity,
      metadata
    });
  }

  logDataEvent(operation: string, userId: string, resource: string, success: boolean): void {
    const severity = success ? 'low' : 'high';
    const message = `${operation} operation on ${resource} by user ${userId} ${success ? 'succeeded' : 'failed'}`;

    this.log(message, {
      type: 'data',
      severity,
      userId,
      metadata: { operation, resource, success }
    });
  }

  logAdminAction(userId: string, action: string, target: string): void {
    this.log(`Admin action: ${action} on ${target} by user ${userId}`, {
      type: 'admin',
      severity: 'medium',
      userId,
      metadata: { action, target }
    });
  }
}

export const securityLogger = SecurityLogger.getInstance();