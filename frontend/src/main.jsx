import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const initialMissions = [
  { id: 1, title: '수학 20분', points: 2, done: false },
  { id: 2, title: '영어 20분', points: 2, done: false },
  { id: 3, title: '독서 15분', points: 1, done: false },
  { id: 4, title: '방 정리', points: 1, done: false },
  { id: 5, title: '내일 준비물 챙기기', points: 1, done: false }
];

const rewards = [
  { points: 10, name: '아이프리 1판' },
  { points: 25, name: '아이프리 2판' },
  { points: 50, name: '용산 원정권' }
];

function App() {
  const [missions, setMissions] = useState(initialMissions);
  const [points] = useState(18);
  const earnedToday = useMemo(
    () => missions.filter((m) => m.done).reduce((sum, m) => sum + m.points, 0),
    [missions]
  );

  const toggleMission = (id) => {
    setMissions((items) =>
      items.map((item) => item.id === id ? { ...item, done: !item.done } : item)
    );
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">오늘의 프리즘 미션</p>
          <h1>Prism Quest</h1>
          <p>작은 습관을 모아 원하는 보상을 열어보자.</p>
        </div>
        <div className="score-card">
          <span>보유 포인트</span>
          <strong>{points + earnedToday} P</strong>
          <small>오늘 +{earnedToday} P</small>
        </div>
      </header>

      <section className="panel">
        <div className="section-heading">
          <h2>오늘의 미션</h2>
          <span>{missions.filter((m) => m.done).length}/{missions.length} 완료</span>
        </div>
        <div className="mission-list">
          {missions.map((mission) => (
            <button
              key={mission.id}
              className={`mission ${mission.done ? 'done' : ''}`}
              onClick={() => toggleMission(mission.id)}
            >
              <span className="check">{mission.done ? '✓' : '○'}</span>
              <span className="mission-title">{mission.title}</span>
              <span className="points">+{mission.points}P</span>
            </button>
          ))}
        </div>
        <button className="primary">부모님께 승인 요청</button>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>보상 상점</h2>
          <span>차감은 부모 승인 후</span>
        </div>
        <div className="reward-grid">
          {rewards.map((reward) => (
            <article className="reward-card" key={reward.points}>
              <strong>{reward.name}</strong>
              <span>{reward.points} P</span>
              <button disabled={points + earnedToday < reward.points}>
                {points + earnedToday >= reward.points ? '사용 요청' : '포인트 부족'}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
