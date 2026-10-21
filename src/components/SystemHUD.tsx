import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Clock, Activity, Laptop } from 'lucide-react';
import type { SystemStats } from '../types/electron';

interface SystemHUDProps {
  onCpuUpdate?: (cpu: number) => void;
}

export const SystemHUD: React.FC<SystemHUDProps> = ({ onCpuUpdate }) => {
  const [stats, setStats] = useState<SystemStats>({
    cpuPercent: 18,
    cpuModel: 'Intel/AMD High Performance Processor',
    cpuCores: 8,
    totalMemBytes: 16 * 1024 * 1024 * 1024,
    freeMemBytes: 7.2 * 1024 * 1024 * 1024,
    usedMemBytes: 8.8 * 1024 * 1024 * 1024,
    memPercent: 55,
    uptimeSeconds: 14200,
    platform: 'win32',
    hostname: 'DESKTOP-STATION'
  });
  const [isDesktopNative, setIsDesktopNative] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTelemetry = async () => {
      if (window.electronAPI && window.electronAPI.getSystemStats) {
        try {
          const liveStats = await window.electronAPI.getSystemStats();
          if (isMounted && liveStats) {
            setStats(liveStats);
            setIsDesktopNative(true);
            if (onCpuUpdate) onCpuUpdate(liveStats.cpuPercent);
          }
        } catch (e) {
          console.warn('Telemetry fetch error:', e);
        }
      } else {
        // Subtle simulated fluctuation for web browser preview mode
        if (isMounted) {
          setStats((prev) => {
            const jitter = Math.floor(Math.random() * 9) - 4;
            const newCpu = Math.max(8, Math.min(68, prev.cpuPercent + jitter));
            if (onCpuUpdate) onCpuUpdate(newCpu);
            return {
              ...prev,
              cpuPercent: newCpu,
              uptimeSeconds: prev.uptimeSeconds + 2
            };
          });
        }
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 1800);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [onCpuUpdate]);

  // Format memory
  const formatGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(1);
  const totalGb = formatGB(stats.totalMemBytes);
  const usedGb = formatGB(stats.usedMemBytes);

  // Format uptime
  const hours = Math.floor(stats.uptimeSeconds / 3600);
  const mins = Math.floor((stats.uptimeSeconds % 3600) / 60);

  // CPU badge color
  const getCpuColor = (cpu: number) => {
    if (cpu > 75) return 'var(--danger-color, #F43F5E)';
    if (cpu > 45) return 'var(--warning-color, #F59E0B)';
    return 'var(--success-color, #10B981)';
  };

  return (
    <div className="system-hud-card">
      <div className="hud-header">
        <div className="hud-title-wrap">
          <Activity size={16} className="hud-activity-icon" />
          <h3 className="hud-title">System Vitality Deck</h3>
        </div>
        <span className={`hud-badge ${isDesktopNative ? 'native' : 'simulated'}`}>
          {isDesktopNative ? '● LIVE NATIVE OS' : '○ SIMULATED HUD'}
        </span>
      </div>

      {/* Main Meters Grid */}
      <div className="hud-metrics-grid">
        {/* CPU Card */}
        <div className="hud-metric-box cpu-box">
          <div className="metric-header">
            <span className="metric-label">
              <Cpu size={14} /> CPU Load
            </span>
            <span
              className="metric-value-tag"
              style={{ color: getCpuColor(stats.cpuPercent) }}
            >
              {stats.cpuPercent}%
            </span>
          </div>

          <div className="metric-progress-bar-bg">
            <div
              className="metric-progress-bar-fill"
              style={{
                width: `${stats.cpuPercent}%`,
                backgroundColor: getCpuColor(stats.cpuPercent)
              }}
            />
          </div>

          <div className="metric-subtext">
            <span>{stats.cpuCores} Cores</span>
            <span className="truncate-text" title={stats.cpuModel}>
              {stats.cpuModel.split(' ')[0]} {stats.cpuModel.split(' ')[1] || ''}
            </span>
          </div>
        </div>

        {/* Memory Card */}
        <div className="hud-metric-box mem-box">
          <div className="metric-header">
            <span className="metric-label">
              <HardDrive size={14} /> RAM Usage
            </span>
            <span className="metric-value-tag">
              {stats.memPercent}%
            </span>
          </div>

          <div className="metric-progress-bar-bg">
            <div
              className="metric-progress-bar-fill mem-fill"
              style={{ width: `${stats.memPercent}%` }}
            />
          </div>

          <div className="metric-subtext">
            <span>{usedGb} GB used</span>
            <span>{totalGb} GB total</span>
          </div>
        </div>
      </div>

      {/* Secondary Hardware Info Row */}
      <div className="hud-info-strip">
        <div className="strip-item">
          <Clock size={13} className="strip-icon" />
          <span>Uptime: <strong>{hours}h {mins}m</strong></span>
        </div>
        <div className="strip-item">
          <Laptop size={13} className="strip-icon" />
          <span>Host: <strong>{stats.hostname || 'Local'}</strong></span>
        </div>
      </div>
    </div>
  );
};
