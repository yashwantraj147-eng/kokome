import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, StickyNote, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { audioEngine } from '../utils/audioEngine';

interface QuestItem {
  id: string;
  text: string;
  completed: boolean;
  rewardXp: number;
}

const DEFAULT_QUESTS: QuestItem[] = [
  { id: '1', text: 'Hydrate: Drink a refreshing glass of water 💧', completed: false, rewardXp: 5 },
  { id: '2', text: 'Complete at least 1 deep focus sprint 🍅', completed: false, rewardXp: 10 },
  { id: '3', text: 'Stretch wrists, neck, and shoulder blades 🧘', completed: false, rewardXp: 5 }
];

export const QuestPad: React.FC = () => {
  const [quests, setQuests] = useState<QuestItem[]>(() => {
    const saved = localStorage.getItem('kokome_quests');
    return saved ? JSON.parse(saved) : DEFAULT_QUESTS;
  });

  const [newQuestText, setNewQuestText] = useState('');
  const [scratchpad, setScratchpad] = useState<string>(() => {
    return localStorage.getItem('kokome_scratchpad') || '### 📝 Kokome Quick Scratchpad\n- [ ] Review sprint checklist\n- Notes & ideas here...';
  });

  useEffect(() => {
    localStorage.setItem('kokome_quests', JSON.stringify(quests));
  }, [quests]);

  useEffect(() => {
    localStorage.setItem('kokome_scratchpad', scratchpad);
  }, [scratchpad]);

  const toggleQuest = (id: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextState = !q.completed;
          if (nextState) {
            audioEngine.playQuestCompleteSound();
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
            // Boost affection
            const curAff = Number(localStorage.getItem('kokome_affection') || '15');
            localStorage.setItem('kokome_affection', (curAff + q.rewardXp).toString());
          } else {
            audioEngine.playClickSound();
          }
          return { ...q, completed: nextState };
        }
        return q;
      })
    );
  };

  const addQuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestText.trim()) return;

    audioEngine.playClickSound();
    const item: QuestItem = {
      id: Date.now().toString(),
      text: newQuestText.trim(),
      completed: false,
      rewardXp: 5
    };

    setQuests((prev) => [...prev, item]);
    setNewQuestText('');
  };

  const deleteQuest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playClickSound();
    setQuests((prev) => prev.filter((q) => q.id !== id));
  };

  const completedCount = quests.filter((q) => q.completed).length;

  return (
    <div className="questpad-container">
      {/* Daily Quests Section */}
      <div className="quest-section-card">
        <div className="quest-header">
          <div className="quest-title-wrap">
            <Award size={16} className="quest-icon" />
            <h3 className="quest-title">Daily Companion Quests</h3>
          </div>
          <span className="quest-counter">
            {completedCount}/{quests.length} Done
          </span>
        </div>

        {/* Quest List */}
        <div className="quest-list">
          {quests.map((q) => (
            <div
              key={q.id}
              className={`quest-item-row ${q.completed ? 'completed' : ''}`}
              onClick={() => toggleQuest(q.id)}
            >
              <button className="quest-checkbox-btn">
                {q.completed ? (
                  <CheckSquare size={17} className="checked-icon" />
                ) : (
                  <Square size={17} className="unchecked-icon" />
                )}
              </button>
              <span className="quest-item-text">{q.text}</span>
              <button
                className="quest-delete-btn"
                onClick={(e) => deleteQuest(q.id, e)}
                title="Delete Quest"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Quest Form */}
        <form onSubmit={addQuest} className="add-quest-form">
          <input
            type="text"
            placeholder="Add new quest or micro-goal..."
            value={newQuestText}
            onChange={(e) => setNewQuestText(e.target.value)}
            className="add-quest-input"
            maxLength={60}
          />
          <button type="submit" className="add-quest-btn" title="Add Quest">
            <Plus size={16} />
          </button>
        </form>
      </div>

      {/* Floating Scratchpad */}
      <div className="scratchpad-section-card">
        <div className="scratchpad-header">
          <div className="scratchpad-title-wrap">
            <StickyNote size={15} className="note-icon" />
            <h4 className="scratchpad-title">Instant Scratchpad</h4>
          </div>
          <span className="autosave-tag">
            <Sparkles size={11} /> Auto-saved
          </span>
        </div>
        <textarea
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Paste snippets, scratch notes, quick ideas here..."
          className="scratchpad-textarea"
          rows={5}
        />
      </div>
    </div>
  );
};
