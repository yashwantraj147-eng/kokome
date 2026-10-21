import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine';
import { Sparkles, Cat } from 'lucide-react';

export type MascotMood = 'idle' | 'focus' | 'happy' | 'petted' | 'break' | 'overheat';

interface KokomeMascotProps {
  mood: MascotMood;
  cpuPercent?: number;
  taskTitle?: string;
  isCompact?: boolean;
}

export const KokomeMascot: React.FC<KokomeMascotProps> = ({
  mood,
  cpuPercent = 12,
  taskTitle = '',
  isCompact = false
}) => {
  const [avatarStyle, setAvatarStyle] = useState<'cat' | 'spirit'>(() => {
    return (localStorage.getItem('kokome_avatar_style') as 'cat' | 'spirit') || 'cat';
  });

  const [affection, setAffection] = useState<number>(() => {
    return Number(localStorage.getItem('kokome_affection') || '15');
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const [speech, setSpeech] = useState<string>('Ready to conquer the day together!');
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic mood override if CPU is very high
  const activeMood: MascotMood = cpuPercent > 80 ? 'overheat' : (isInteracting ? 'petted' : mood);

  // Update speech bubble based on status & avatarStyle
  useEffect(() => {
    if (activeMood === 'overheat') {
      if (avatarStyle === 'cat') {
        setSpeech(`*fans paper frantically* CPU is at ${cpuPercent}%! My glasses are fogging up!`);
      } else {
        setSpeech(`Whoa! CPU is at ${cpuPercent}%! Fans are spinning!`);
      }
    } else if (activeMood === 'focus') {
      if (avatarStyle === 'cat') {
        setSpeech(taskTitle ? `*inspects paper closely* Focusing on "${taskTitle}"... Proceed!` : '*pushes glasses up nose* Deep study session initiated! 📄👓');
      } else {
        setSpeech(taskTitle ? `Focusing on: "${taskTitle}" ✨` : 'Deep focus zone active! Let’s crush it~ 🎧');
      }
    } else if (activeMood === 'break') {
      if (avatarStyle === 'cat') {
        setSpeech('According to this schedule, you have earned a cup of coffee and a cat nap! ☕');
      } else {
        setSpeech('Time to stretch, sip some water, and relax your eyes! 🍵');
      }
    } else if (activeMood === 'happy') {
      setSpeech('Yay! You are doing amazing! Keep going! 💖');
    } else {
      if (avatarStyle === 'cat') {
        const catQuotes = [
          '*adjusts reading glasses* Let me review your code... Looks Good To Meow.',
          'According to this official document, you are 100% certified awesome.',
          'Click me for a paw of approval and affection points!',
          'Focus now, zoomies later. That is the way of the cat.',
          'Keep your posture upright, human! I am observing your work.'
        ];
        setSpeech(catQuotes[Math.floor(Math.random() * catQuotes.length)]);
      } else {
        const idleQuotes = [
          'I am your faithful desktop companion! (๑˃̵ᴗ˂̵)و',
          'Headpat me anytime to boost affection!',
          'Stay hydrated and keep shining ✨',
          'Have you taken a deep breath today?',
          'Everything is better when we build together!'
        ];
        setSpeech(idleQuotes[Math.floor(Math.random() * idleQuotes.length)]);
      }
    }
  }, [activeMood, cpuPercent, taskTitle, avatarStyle]);

  const toggleAvatarStyle = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickSound();
    const nextStyle = avatarStyle === 'cat' ? 'spirit' : 'cat';
    setAvatarStyle(nextStyle);
    localStorage.setItem('kokome_avatar_style', nextStyle);
  };

  const handleHeadpat = (e: React.MouseEvent) => {
    const newAffection = affection + 1;
    setAffection(newAffection);
    localStorage.setItem('kokome_affection', newAffection.toString());

    setIsInteracting(true);
    audioEngine.playHeadpatSound(1 + (newAffection % 10) * 0.05);

    // Heart particle burst
    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? e.clientX - rect.left : 50;
    const y = rect ? e.clientY - rect.top : 50;

    const heartId = Date.now();
    setHearts((prev) => [...prev, { id: heartId, x, y }]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1200);

    // Level up milestone every 25 pats
    if (newAffection % 25 === 0) {
      audioEngine.playQuestCompleteSound();
      setSpeech(`Affection Level Up! Level ${Math.floor(newAffection / 25)} reached! 🎉`);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 }
      });
    } else {
      if (avatarStyle === 'cat') {
        const catPraise = [
          '*soft purr* The professor approves of your petting technique.',
          'Paw of excellence granted! (*^ω^*)',
          '*glasses jiggle* Very kind, human. Now back to greatness!',
          'Purrrrr~ Affection recorded in the logs!'
        ];
        setSpeech(catPraise[Math.floor(Math.random() * catPraise.length)]);
      } else {
        const petPraise = [
          'Hehe, thank you for the headpat! (*^▽^*)',
          '*happy purr* Kokome feels loved~ 💕',
          'Energy restored! You are the best!',
          'Purrrrr~ Let’s do our best today!'
        ];
        setSpeech(petPraise[Math.floor(Math.random() * petPraise.length)]);
      }
    }

    setTimeout(() => {
      setIsInteracting(false);
    }, 1400);
  };

  const mascotSize = isCompact ? 110 : 160;

  return (
    <div
      ref={containerRef}
      className={`mascot-container ${isCompact ? 'compact' : ''}`}
      onClick={handleHeadpat}
      title="Click Kokome to give headpats and love!"
    >
      {/* Floating Speech Bubble */}
      {!isCompact && (
        <div className="mascot-speech-bubble">
          <p>{speech}</p>
          <div className="speech-arrow" />
        </div>
      )}

      {/* Floating Heart Particles */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="floating-heart"
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
        >
          💖
        </span>
      ))}

      {/* Mascot Animated Character */}
      <div className={`mascot-avatar mood-${activeMood}`}>
        {avatarStyle === 'cat' ? (
          /* Professor Cat Avatar with Glasses and Paper */
          <div
            className={`cat-avatar-frame ${activeMood === 'focus' ? 'studying' : ''} ${isInteracting ? 'boop' : ''}`}
            style={{ width: mascotSize, height: mascotSize }}
          >
            <div className="cat-avatar-glow-ring" />
            <img
              src="/kokome-cat.jpg"
              alt="Professor Kokome Cat with Reading Glasses"
              className="cat-avatar-img"
            />
            {activeMood === 'focus' && (
              <span className="cat-status-badge studying-badge">
                👓 In Review
              </span>
            )}
            {activeMood === 'overheat' && (
              <span className="cat-status-badge hot-badge">
                🔥 Hot CPU
              </span>
            )}
          </div>
        ) : (
          /* Cyber Spirit SVG Mascot */
          <svg
            width={mascotSize}
            height={mascotSize}
            viewBox="0 0 160 160"
            className="mascot-svg"
          >
            <defs>
              <radialGradient id="bodyGlow" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="var(--mascot-color-highlight, #FFB5D8)" />
                <stop offset="55%" stopColor="var(--mascot-color-primary, #FF6EA7)" />
                <stop offset="100%" stopColor="var(--mascot-color-deep, #7E22CE)" />
              </radialGradient>

              <linearGradient id="earInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFF1F2" />
                <stop offset="100%" stopColor="#FDA4AF" />
              </linearGradient>

              <linearGradient id="headphoneGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>

              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <ellipse
              cx="80"
              cy="142"
              rx="46"
              ry="10"
              fill="rgba(0, 0, 0, 0.25)"
              className="mascot-shadow"
            />

            <g className="mascot-halo">
              <ellipse
                cx="80"
                cy="24"
                rx="32"
                ry="8"
                fill="none"
                stroke={activeMood === 'focus' ? '#38BDF8' : '#FDE047'}
                strokeWidth="4"
                opacity="0.85"
              />
            </g>

            <polygon
              points="36,54 48,16 66,42"
              fill="var(--mascot-color-primary, #FF6EA7)"
              className="mascot-ear left"
            />
            <polygon
              points="42,50 50,26 62,42"
              fill="url(#earInner)"
              className="mascot-ear-inner"
            />

            <polygon
              points="124,54 112,16 94,42"
              fill="var(--mascot-color-deep, #9333EA)"
              className="mascot-ear right"
            />
            <polygon
              points="118,50 110,26 98,42"
              fill="url(#earInner)"
              className="mascot-ear-inner"
            />

            <circle
              cx="80"
              cy="88"
              r="54"
              fill="url(#bodyGlow)"
              filter="url(#softGlow)"
              className="mascot-main-body"
            />

            <ellipse
              cx="52"
              cy="98"
              rx="8"
              ry="5"
              fill="#FB7185"
              opacity={activeMood === 'happy' || activeMood === 'petted' ? '0.9' : '0.55'}
              className="mascot-blush"
            />
            <ellipse
              cx="108"
              cy="98"
              rx="8"
              ry="5"
              fill="#FB7185"
              opacity={activeMood === 'happy' || activeMood === 'petted' ? '0.9' : '0.55'}
              className="mascot-blush"
            />

            {activeMood === 'petted' || activeMood === 'happy' ? (
              <g className="mascot-eyes-happy">
                <path
                  d="M 50 86 Q 58 76 66 86"
                  stroke="#FFFFFF"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 94 86 Q 102 76 110 86"
                  stroke="#FFFFFF"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            ) : activeMood === 'break' ? (
              <g className="mascot-eyes-sleepy">
                <line
                  x1="52"
                  y1="86"
                  x2="66"
                  y2="86"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <line
                  x1="94"
                  y1="86"
                  x2="108"
                  y2="86"
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <text x="114" y="66" fill="#A78BFA" fontSize="14" fontWeight="bold">
                  zZ
                </text>
              </g>
            ) : activeMood === 'overheat' ? (
              <g className="mascot-eyes-overheat">
                <circle cx="58" cy="85" r="7" fill="#FFFFFF" />
                <circle cx="58" cy="85" r="3.5" fill="#1E1B4B" />
                <circle cx="102" cy="85" r="7" fill="#FFFFFF" />
                <circle cx="102" cy="85" r="3.5" fill="#1E1B4B" />
                <path
                  d="M 124 72 Q 130 84 124 90 Q 118 84 124 72"
                  fill="#38BDF8"
                  opacity="0.9"
                />
              </g>
            ) : (
              <g className="mascot-eyes-standard">
                <ellipse cx="58" cy="85" rx="7.5" ry="10" fill="#1E1B4B" />
                <circle cx="56" cy="81" r="3.5" fill="#FFFFFF" />
                <circle cx="61" cy="88" r="1.8" fill="#FFFFFF" />

                <ellipse cx="102" cy="85" rx="7.5" ry="10" fill="#1E1B4B" />
                <circle cx="100" cy="81" r="3.5" fill="#FFFFFF" />
                <circle cx="105" cy="88" r="1.8" fill="#FFFFFF" />
              </g>
            )}

            {activeMood === 'overheat' ? (
              <ellipse cx="80" cy="100" rx="4" ry="6" fill="#1E1B4B" />
            ) : activeMood === 'happy' || activeMood === 'petted' ? (
              <path
                d="M 72 98 Q 80 108 88 98"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                fill="#FB7185"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M 73 96 Q 77 100 80 96 Q 83 100 87 96"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                fill="none"
                strokeLinecap="round"
              />
            )}

            {activeMood === 'focus' && (
              <g className="mascot-headphones">
                <path
                  d="M 32 82 C 32 30, 128 30, 128 82"
                  stroke="url(#headphoneGrad)"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                />
                <rect
                  x="24"
                  y="74"
                  width="14"
                  height="28"
                  rx="7"
                  fill="#38BDF8"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle cx="31" cy="88" r="3" fill="#FFFFFF" />

                <rect
                  x="122"
                  y="74"
                  width="14"
                  height="28"
                  rx="7"
                  fill="#C084FC"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle cx="129" cy="88" r="3" fill="#FFFFFF" />
              </g>
            )}

            <ellipse
              cx="64"
              cy="132"
              rx="9"
              ry="6"
              fill="var(--mascot-color-highlight, #FFB5D8)"
              className="mascot-paw"
            />
            <ellipse
              cx="96"
              cy="132"
              rx="9"
              ry="6"
              fill="var(--mascot-color-highlight, #FFB5D8)"
              className="mascot-paw"
            />
          </svg>
        )}
      </div>

      {/* Bottom Controls: Affection & Avatar Switcher */}
      <div className="mascot-bottom-row">
        <div className="mascot-affection-badge">
          <span className="heart-icon">💖</span>
          <span className="affection-level">Lv.{Math.floor(affection / 25) + 1}</span>
          <span className="affection-points">{affection % 25}/25 XP</span>
        </div>

        {!isCompact && (
          <button
            className="avatar-toggle-pill"
            onClick={toggleAvatarStyle}
            title={avatarStyle === 'cat' ? 'Switch to Cyber Spirit' : 'Switch to Professor Cat'}
          >
            {avatarStyle === 'cat' ? <Sparkles size={11} /> : <Cat size={11} />}
            <span>{avatarStyle === 'cat' ? 'Spirit Mode' : 'Cat Mode'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
