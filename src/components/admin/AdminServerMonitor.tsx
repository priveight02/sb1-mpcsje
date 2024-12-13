import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Activity,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

interface ServerMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  activeConnections: number;
  requestsPerSecond: number;
  errors: {
    count: number;
    rate: number;
  };
}

export const AdminServerMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<ServerMetrics>({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 25,
    uptime: 15 * 24 * 60 * 60, // 15 days in seconds
    activeConnections: 128,
    requestsPerSecond: 45,
    errors: {
      count: 12,
      rate: 0.05
    }
  });

  const [historicalData, setHistoricalData] = useState({
    labels: Array.from({ length: 30 }, (_, i) => format(new Date(Date.now() - i * 60000), 'HH:mm')).reverse(),
    datasets: [
      {
        label: 'CPU Usage',
        data: Array.from({ length: 30 }, () => Math.random() * 100),
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4
      },
      {
        label: 'Memory Usage',
        data: Array.from({ length: 30 }, () => Math.random() * 100),
        borderColor: 'rgb(16, 185, 129)',
        tension: 0.4
      }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.min(100, Math.max(0, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.min(100, Math.max(0, prev.network + (Math.random() - 0.5) * 15)),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 10)),
        requestsPerSecond: Math.max(0, prev.requestsPerSecond + Math.floor((Math.random() - 0.5) * 5))
      }));

      // Update historical data
      setHistoricalData(prev => ({
        labels: [...prev.labels.slice(1), format(new Date(), 'HH:mm')],
        datasets: prev.datasets.map(dataset => ({
          ...dataset,
          data: [...dataset.data.slice(1), Math.random() * 100]
        }))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (value: number) => {
    if (value >= 90) return 'text-red-500';
    if (value >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Server Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium text-white">CPU Usage</h3>
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.cpu)}`}>
            {Math.round(metrics.cpu)}%
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.cpu >= 90 ? 'bg-red-500' :
                metrics.cpu >= 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${metrics.cpu}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="w-5 h-5 text-green-400" />
            <h3 className="font-medium text-white">Memory Usage</h3>
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.memory)}`}>
            {Math.round(metrics.memory)}%
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.memory >= 90 ? 'bg-red-500' :
                metrics.memory >= 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${metrics.memory}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium text-white">Network Usage</h3>
          </div>
          <div className={`text-2xl font-bold ${getStatusColor(metrics.network)}`}>
            {Math.round(metrics.network)}%
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.network >= 90 ? 'bg-red-500' :
                metrics.network >= 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${metrics.network}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h3 className="font-medium text-white">Uptime</h3>
          </div>
          <div className="text-xl font-bold text-white">
            {formatUptime(metrics.uptime)}
          </div>
        </motion.div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">System Load</h3>
          <div className="h-64">
            <Line
              data={historicalData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                  }
                },
                plugins: {
                  legend: {
                    labels: { color: 'rgba(255, 255, 255, 0.7)' }
                  }
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-xl p-6"
        >
          <h3 className="text-lg font-medium text-white mb-4">Active Connections</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                {metrics.activeConnections}
              </div>
              <div className="text-sm text-gray-400">Current Connections</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">
                {metrics.requestsPerSecond}
              </div>
              <div className="text-sm text-gray-400">Requests/Second</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Server Events */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-medium text-white mb-4">Recent Events</h3>
        <div className="space-y-3">
          {[
            { type: 'success', message: 'Server backup completed successfully', time: '2 minutes ago' },
            { type: 'warning', message: 'High memory usage detected', time: '15 minutes ago' },
            { type: 'error', message: 'Failed to process request', time: '1 hour ago' },
          ].map((event, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg"
            >
              {event.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {event.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              {event.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
              <div className="flex-1">
                <p className="text-white">{event.message}</p>
                <p className="text-sm text-gray-400">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};