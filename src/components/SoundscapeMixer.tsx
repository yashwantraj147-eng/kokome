import React, { useState } from 'react';
import { CloudRain, Flame, Disc, Radio, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

interface Channel {
  id: 'rain' | 'campfire' | 'vinyl' | 'drone';
  name: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
}

const CHANNELS: Channel[] = [
  {
    id: 'rain',
    name: 'Gentle Rain',
    icon: <CloudRain size={18} />,
    color: '#38BDF8',
    desc: 'Calming raindrops against glass'
  },
  {
    id: 'campfire',
    name: 'Cozy Hearth',
    icon: <Flame size={18} />,
    color: '#FB923C',
    desc: 'Warm embers and soft crackle'
  },
  {
    id: 'vinyl',
    name: 'Lo-Fi Cafe',
    icon: <Disc size={18} />,
    color: '#F472B6',
    desc: 'Analog warmth and subtle vinyl dust'
  },
  {
    id: 'drone',
    name: '432Hz Zen Drone',
    icon: <Radio size={18} />,
    color: '#A78BFA',
    desc: 'Harmonic sine wave focus resonance'
  }
];

export const SoundscapeMixer: React.FC = () => {
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    rain: 0,
    campfire: 0,
    vinyl: 0,
    drone: 0
  });

  const handleVolumeChange = (channelId: string, val: number) => {
    const updated = { ...volumes, [channelId]: val };
    setVolumes(updated);

    if (channelId === 'rain') audioEngine.setRainVolume(val);
    if (channelId === 'campfire') audioEngine.setCampfireVolume(val);
    if (channelId === 'vinyl') audioEngine.setVinylVolume(val);
    if (channelId === 'drone') audioEngine.setDroneVolume(val);
  };

  const applyPreset = (preset: { rain: number; campfire: number; vinyl: number; drone: number }) => {
    setVolumes(preset);
    audioEngine.setRainVolume(preset.rain);
    audioEngine.setCampfireVolume(preset.campfire);
    audioEngine.setVinylVolume(preset.vinyl);
    audioEngine.setDroneVolume(preset.drone);
    audioEngine.playClickSound();
  };

  const stopAll = () => {
    applyPreset({ rain: 0, campfire: 0, vinyl: 0, drone: 0 });
  };

  const isAnyPlaying = Object.values(volumes).some((v) => v > 0);

  return (
    <div className="soundscape-mixer-card">
      <div className="soundscape-header">
        <div className="soundscape-title-wrap">
          <Sparkles size={16} className="sparkle-icon" />
          <h3 className="soundscape-title">Ambient Sound Studio</h3>
        </div>
        {isAnyPlaying && (
          <button className="soundscape-mute-all" onClick={stopAll} title="Mute all soundscapes">
            <VolumeX size={14} />
            <span>Silence</span>
          </button>
        )}
      </div>

      <p className="soundscape-subtitle">
        Procedurally synthesized in real-time. Zero external audio downloads.
      </p>

      {/* Quick Sound Presets */}
      <div className="soundscape-presets">
        <button
          className="preset-chip"
          onClick={() => applyPreset({ rain: 0.65, campfire: 0, vinyl: 0.35, drone: 0 })}
        >
          🌧️ Rainy Cafe
        </button>
        <button
          className="preset-chip"
          onClick={() => applyPreset({ rain: 0.25, campfire: 0.7, vinyl: 0, drone: 0 })}
        >
          🔥 Cozy Cabin
        </button>
        <button
          className="preset-chip"
          onClick={() => applyPreset({ rain: 0.15, campfire: 0, vinyl: 0, drone: 0.75 })}
        >
          🧘 Zen Focus
        </button>
      </div>

      {/* Sliders */}
      <div className="soundscape-channels-list">
        {CHANNELS.map((ch) => {
          const val = volumes[ch.id];
          const isActive = val > 0;

          return (
            <div key={ch.id} className={`channel-row ${isActive ? 'active' : ''}`}>
              <div className="channel-icon-col" style={{ color: ch.color }}>
                {ch.icon}
              </div>

              <div className="channel-info-col">
                <div className="channel-meta">
                  <span className="channel-name">{ch.name}</span>
                  <span className="channel-percent">{Math.round(val * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={val}
                  onChange={(e) => handleVolumeChange(ch.id, parseFloat(e.target.value))}
                  className="channel-slider"
                  style={{
                    background: `linear-gradient(to right, ${ch.color} 0%, ${ch.color} ${val * 100}%, rgba(255,255,255,0.1) ${val * 100}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>

              <button
                className={`channel-toggle-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleVolumeChange(ch.id, isActive ? 0 : 0.5)}
                title={isActive ? 'Mute' : 'Play'}
              >
                {isActive ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
