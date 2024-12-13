import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useHabitStore } from './habitStore';
import { useLeaderboardStore } from './leaderboardStore';
import { format, subDays, parseISO } from 'date-fns';

// Types for security monitoring
export interface SecurityLog {
  id: string;
  type: 'auth' | 'access' | 'system' | 'data' | 'admin';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  ip?: string;
  location?: string;
  userId?: string;
  metadata?: Record<string, any>;
  actionType?: string;
  status: 'detected' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
}

export interface SystemHealth {
  serverStatus: 'healthy' | 'warning' | 'error';
  databaseLoad: number;
  storageUsage: number;
  memoryUsage: number;
  lastUpdated: string;
  metrics: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

export interface AdminState {
  securityLogs: SecurityLog[];
  systemHealth: SystemHealth;
  realtimeMonitoring: boolean;
  monitoringInterval: number;
}

export interface AdminActions {
  addSecurityLog: (log: Omit<SecurityLog, 'id'>) => void;
  updateSecurityLog: (id: string, updates: Partial<SecurityLog>) => void;
  clearSecurityLogs: () => void;
  updateSystemHealth: () => void;
  startRealtimeMonitoring: () => void;
  stopRealtimeMonitoring: () => void;
  getSecurityMetrics: () => {
    totalIncidents: number;
    criticalIncidents: number;
    resolvedIncidents: number;
    averageResolutionTime: number;
  };
  getSystemMetrics: () => {
    uptime: number;
    loadAverage: number[];
    memoryUsage: {
      total: number;
      used: number;
      free: number;
    };
    diskUsage: {
      total: number;
      used: number;
      free: number;
    };
  };
}

let monitoringInterval: NodeJS.Timeout | null = null;

export const useAdminStore = create<AdminState & AdminActions>()(
  persist(
    (set, get) => ({
      securityLogs: [],
      systemHealth: {
        serverStatus: 'healthy',
        databaseLoad: 0,
        storageUsage: 0,
        memoryUsage: 0,
        lastUpdated: new Date().toISOString(),
        metrics: {
          requestsPerMinute: 0,
          averageResponseTime: 0,
          errorRate: 0,
          activeConnections: 0
        }
      },
      realtimeMonitoring: false,
      monitoringInterval: 5000,

      addSecurityLog: (log) => {
        const newLog: SecurityLog = {
          ...log,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          status: 'detected'
        };

        set((state) => ({
          securityLogs: [newLog, ...state.securityLogs].slice(0, 1000) // Keep last 1000 logs
        }));

        // Trigger notifications for high severity incidents
        if (log.severity === 'high' || log.severity === 'critical') {
          // Implement notification system here
          console.warn('High severity security incident:', log);
        }
      },

      updateSecurityLog: (id, updates) => {
        set((state) => ({
          securityLogs: state.securityLogs.map((log) =>
            log.id === id ? { ...log, ...updates } : log
          )
        }));
      },

      clearSecurityLogs: () => {
        set({ securityLogs: [] });
      },

      updateSystemHealth: () => {
        const generateMetrics = () => ({
          requestsPerMinute: Math.floor(Math.random() * 1000),
          averageResponseTime: Math.random() * 100,
          errorRate: Math.random() * 2,
          activeConnections: Math.floor(Math.random() * 500)
        });

        const metrics = generateMetrics();
        const health: SystemHealth = {
          serverStatus: metrics.errorRate > 1 ? 'error' : metrics.errorRate > 0.5 ? 'warning' : 'healthy',
          databaseLoad: Math.floor(Math.random() * 100),
          storageUsage: Math.floor(Math.random() * 100),
          memoryUsage: Math.floor(Math.random() * 100),
          lastUpdated: new Date().toISOString(),
          metrics
        };

        set({ systemHealth: health });

        // Log critical system events
        if (health.serverStatus === 'error') {
          get().addSecurityLog({
            type: 'system',
            severity: 'critical',
            message: 'System health critical: High error rate detected',
            status: 'detected',
            metadata: { metrics }
          });
        }
      },

      startRealtimeMonitoring: () => {
        if (monitoringInterval) return;

        set({ realtimeMonitoring: true });
        
        const monitor = () => {
          get().updateSystemHealth();
          // Monitor for suspicious activities
          const authStore = useAuthStore.getState();
          const recentLogins = authStore.getRecentLogins?.() || [];
          
          // Check for multiple failed login attempts
          const failedLogins = recentLogins.filter(l => l.status === 'failed');
          if (failedLogins.length >= 3) {
            get().addSecurityLog({
              type: 'auth',
              severity: 'high',
              message: 'Multiple failed login attempts detected',
              status: 'detected',
              metadata: { attempts: failedLogins.length }
            });
          }
        };

        monitor(); // Initial check
        monitoringInterval = setInterval(monitor, get().monitoringInterval);
      },

      stopRealtimeMonitoring: () => {
        if (monitoringInterval) {
          clearInterval(monitoringInterval);
          monitoringInterval = null;
        }
        set({ realtimeMonitoring: false });
      },

      getSecurityMetrics: () => {
        const logs = get().securityLogs;
        const now = new Date();
        const resolvedLogs = logs.filter(log => log.status === 'resolved');
        
        const resolutionTimes = resolvedLogs.map(log => {
          const created = new Date(log.timestamp);
          const resolved = new Date(log.resolution || now);
          return (resolved.getTime() - created.getTime()) / (1000 * 60); // minutes
        });

        return {
          totalIncidents: logs.length,
          criticalIncidents: logs.filter(log => log.severity === 'critical').length,
          resolvedIncidents: resolvedLogs.length,
          averageResolutionTime: resolutionTimes.length ? 
            resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 
            0
        };
      },

      getSystemMetrics: () => {
        // Simulate system metrics
        return {
          uptime: Math.floor(Math.random() * 30 * 24 * 60 * 60), // Up to 30 days in seconds
          loadAverage: [
            Math.random() * 2,
            Math.random() * 1.5,
            Math.random() * 1
          ],
          memoryUsage: {
            total: 16384, // 16GB in MB
            used: Math.floor(Math.random() * 16384),
            free: Math.floor(Math.random() * 16384)
          },
          diskUsage: {
            total: 512000, // 512GB in MB
            used: Math.floor(Math.random() * 512000),
            free: Math.floor(Math.random() * 512000)
          }
        };
      }
    }),
    {
      name: 'admin-storage',
      onRehydrateStorage: () => (state) => {
        // Start monitoring on rehydration if it was previously enabled
        if (state?.realtimeMonitoring) {
          state.startRealtimeMonitoring();
        }
      }
    }
  )
);