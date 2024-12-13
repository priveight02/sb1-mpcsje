import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Globe, Monitor, Clock, Eye, EyeOff, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface SessionInfo {
  ip: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
  };
  browser: string;
  device: string;
  lastActive: string;
  isCurrent: boolean;
  isSecure: boolean;
}

export const SecurityMonitoring: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [showIP, setShowIP] = useState(false);

  useEffect(() => {
    // Simulate fetching session info
    const fetchSessionInfo = async () => {
      // In a real app, this would be an API call
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      setCurrentSession({
        ip: data.ip || '192.168.1.1',
        location: {
          city: data.city || 'Unknown City',
          country: data.country_name || 'Unknown Country',
          countryCode: data.country_code || 'UN'
        },
        browser: getBrowserInfo(),
        device: getDeviceInfo(),
        lastActive: new Date().toISOString(),
        isCurrent: true,
        isSecure: window.location.protocol === 'https:'
      });
    };

    fetchSessionInfo().catch(console.error);
  }, []);

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android Device';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('Mac')) return 'Mac';
    return 'Unknown Device';
  };

  const blurIP = (ip: string) => {
    return showIP ? ip : ip.replace(/\d/g, '•');
  };

  if (!currentSession) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">Security Monitoring</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor your account activity and sessions
          </p>
        </div>
      </div>

      {/* Account Security Status */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="font-medium text-green-600 dark:text-green-400">
              Your Account is Secure
            </h4>
            <p className="text-sm text-green-600/90 dark:text-green-400/90 mt-1">
              No suspicious activity detected in your recent sessions
            </p>
          </div>
        </div>
      </div>

      {/* Current Session */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Current Session
          </h4>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-600 dark:text-green-400">Active Now</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Globe className="w-4 h-4" />
              <span>Location</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {currentSession.location.city}, {currentSession.location.country}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Monitor className="w-4 h-4" />
              <span>Device</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {currentSession.device}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>IP Address</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                {blurIP(currentSession.ip)}
              </p>
              <button
                onClick={() => setShowIP(!showIP)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showIP ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last Activity</span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {format(new Date(currentSession.lastActive), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-2">
              Security Recommendations
            </h4>
            <ul className="space-y-2 text-sm text-yellow-600/90 dark:text-yellow-500/90">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <span>Enable two-factor authentication for additional account security</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <span>Use a strong, unique password and change it regularly</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                <span>Review your account activity regularly for any suspicious behavior</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};