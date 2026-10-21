export interface SystemStats {
  cpuPercent: number;
  cpuModel: string;
  cpuCores: number;
  totalMemBytes: number;
  freeMemBytes: number;
  usedMemBytes: number;
  memPercent: number;
  uptimeSeconds: number;
  platform: string;
  hostname: string;
}

export interface ElectronAPI {
  minimize: () => void;
  close: () => void;
  setAlwaysOnTop: (flag: boolean) => Promise<boolean>;
  getAlwaysOnTop: () => Promise<boolean>;
  setWindowSize: (width: number, height: number) => Promise<boolean>;
  getSystemStats: () => Promise<SystemStats>;
  isDesktop?: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
