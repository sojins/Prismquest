import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ParentApp from './ParentApp';
import MascotPanel from './MascotPanel';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

const rewards = [
  { points: 10, name: '아이프리 1판' },
  { points: 25, name: '아이프리 2판' },
  { points: 50, name: '용산 원정권' }
];

const statusLabel = {
  pending: '승인 대기',
  approved: '승인 완료',
  rejected: '다시 도전'
};

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}/${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? '요청을 처리하지 못했습니다.');
  }
  return payload;
}

function App() {
  const [state, setState] = useState({ points: 0, missions: [], ledger: [] });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadState = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const next = await api('state.php');
      setState(next);
      setSelected([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const selectableMissions = useMemo(
    () => state.missions.filter((mission) => !['pending', 'approved'].includes(mission.status)),
    [state.missions]
  );

  const approvedCount = useMemo(
    () => state.missions.filter((mission) => mission.status === 'approved').length,
    [state.missions]
  );

  const selectedPoints = useMemo(
    () => state.missions
      .filter((mission) => selected.includes(mission.id))
      .reduce((sum, mission) => sum + mission.points, 0),
    [selected, state.missions]
  );

  const toggleMission = (mission) => {
    if (['pending', 'approved'].includes(mission.status)) return;
    setMessage('');
    setSelected((items) =>
      items.includes(mission.id)
        ? items.filter((id) => id !== mission.id)
        : [...items, mission.id]
    );
  };

  const requestApproval = async () => {
    if (selected.length === 0) {
      setError('완료한 미션을 하나 이상 선택해 주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await api('request-mission.php', {
        method: 'POST',
        body: JSON.stringify({ mission_ids: selected })
      });
      const count = result.created_request_ids?.length ?? 0;
      setMessage(`${count}개 미션을 부모님께 보냈어요.`);
      await loadState();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <main className="app-shell"><section className="panel status-panel">프리즘 미션을 불러오는 중...</section></main>;
  }

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
          <strong>{state.points} P</strong>
          <small>선택한 미션 +{selectedPoints} P</small>
        </div>
      </header>

      <MascotPanel points={state.points} completed={approvedCount} />

      {error && <div className="notice error-notice">{error}</div>}
      {message && <div className="notice success-notice">{message}</div>}

      <section className="panel">
        <div className="section-heading">
          <h2>오늘의 미션</h2>
          <a className="parent-link" href="/parent">부모 승인</a>
        </div>
        <div className="mission-list">
          {state.missions.map((mission) => {
            const isSelected = selected.includes(mission.id);
            const isLocked = ['pending', 'approved'].includes(mission.status);
            return (
              <button
                key={mission.id}
                className={`mission ${isSelected ? 'done' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => toggleMission(mission)}
                disabled={isLocked}
              >
                <span className="check">
                  {mission.status === 'approved' ? '★' : mission.status === 'pending' ? '…' : isSelected ? '✓' : '○'}
                </span>
                <span className="mission-title">
                  {mission.title}
                  {mission.status && <small className={`status ${mission.status}`}>{statusLabel[mission.status]}</small>}
                </span>
                <span className="points">+{mission.points}P</span>
              </button>
            );
          })}
        </div>
        <button className="primary" onClick={requestApproval} disabled={submitting || selected.length === 0}>
          {submitting ? '전송 중...' : `부모님께 승인 요청 (${selected.length})`}
        </button>
        <button className="text-button" onClick={loadState}>새로고침</button>
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
              <button disabled={state.points < reward.points}>
                {state.points >= reward.points ? '곧 사용 가능' : '포인트 부족'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel ledger-panel">
        <div className="section-heading">
          <h2>최근 포인트 기록</h2>
          <span>{state.ledger.length}건</span>
        </div>
        {state.ledger.length === 0 ? (
          <p className="empty">아직 적립 기록이 없어요.</p>
        ) : (
          <ul className="ledger-list">
            {state.ledger.map((entry) => (
              <li key={entry.id}>
                <span>{entry.reason}</span>
                <strong className={entry.amount >= 0 ? 'positive' : 'negative'}>
                  {entry.amount >= 0 ? '+' : ''}{entry.amount}P
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(window.location.pathname.startsWith('/parent') ? <ParentApp /> : <App />);
