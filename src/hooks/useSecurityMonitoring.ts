import { useEffect, useCallback } from 'react';
import { useAdminStore } from '../store/adminStore';
import { securityLogger } from '../utils/securityLogger';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

export const useSecurityMonitoring = () => {
  const { user } = useAuthStore();
  const { updateSystemHealth } = useAdminStore();

  const monitorUserActivity = useCallback(() => {
    if (!user) return;

    // Monitor page navigation
    const handleNavigation = () => {
      securityLogger.logAccessAttempt(
        window.location.pathname,
        user.uid,
        true
      );
    };

    // Monitor network requests
    const handleFetch = () => {
      securityLogger.logSystemEvent(
        'Network request detected',
        'low',
        {
          url: window.location.href,
          timestamp: format(new Date(), 'HH:mm:ss'),
          userId: user.uid
        }
      );
    };

    // Monitor system health
    const monitorSystemHealth = () => {
      const memory = (performance as any).memory;
      const connection = (navigator as any).connection;

      updateSystemHealth({
        timestamp: new Date().toISOString(),
        metrics: {
          memory: memory ? {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
          } : undefined,
          network: connection ? {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          } : undefined,
        }
      });
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('fetch', handleFetch as any);
    
    const healthInterval = setInterval(monitorSystemHealth, 30000);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('fetch', handleFetch as any);
      clearInterval(healthInterval);
    };
  }, [user]);

  useEffect(() => {
    const cleanup = monitorUserActivity();
    return () => cleanup?.();
  }, [monitorUserActivity]);

  return {
    logUserAction: (action: string, target: string) => {
      if (!user) return;
      securityLogger.logAdminAction(user.uid, action, target);
    }
  };
};