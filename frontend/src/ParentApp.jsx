import React, { useCallback, useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

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

export default function ParentApp() {
  const [pending, setPending] = useState({ points: 0, mission_requests: [] });
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPending(await api('pending.php'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const pendingPoints = useMemo(
    () => pending.mission_requests.reduce((sum, item) => sum + item.points, 0),
    [pending.mission_requests]
  );

  const decide = async (requestId, decision) => {
    if (!pin.trim()) {
      setError('부모 PIN을 입력해 주세요.');
      return;
    }

    setProcessingId(requestId);
    setMessage('');
    setError('');
    try {
      const result = await api('decide-mission.php', {
        method: 'POST',
        body: JSON.stringify({ request_id: requestId, decision, pin })
      });
      setMessage(decision === 'approved'
        ? `승인했습니다. 현재 ${result.points}P예요.`
        : '요청을 거절했습니다.');
      await loadPending();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <main className="app-shell parent-shell">
      <header className="hero parent-hero">
        <div>
          <p className="eyebrow">부모 전용</p>
          <h1>승인 센터</h1>
          <p>완료한 미션을 확인하고 포인트를 지급합니다.</p>
        </div>
        <div className="score-card">
          <span>현재 포인트</span>
          <strong>{pending.points} P</strong>
          <small>승인 대기 +{pendingPoints} P</small>
        </div>
      </header>

      {error && <div className="notice error-notice">{error}</div>}
      {message && <div className="notice success-notice">{message}</div>}

      <section className="panel pin-panel">
        <div className="section-heading">
          <h2>부모 PIN</h2>
          <a href="/" className="parent-link">아이 화면</a>
        </div>
        <input
          className="pin-input"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          placeholder="PIN 입력"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
        />
        <p className="helper">PIN은 승인 요청을 처리할 때만 서버로 전송됩니다.</p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <h2>승인 대기</h2>
          <span>{pending.mission_requests.length}건</span>
        </div>

        {loading ? (
          <p className="empty">승인 목록을 불러오는 중...</p>
        ) : pending.mission_requests.length === 0 ? (
          <div className="empty-state">
            <strong>대기 중인 미션이 없습니다.</strong>
            <span>아이가 요청하면 여기에 표시됩니다.</span>
          </div>
        ) : (
          <div className="approval-list">
            {pending.mission_requests.map((request) => (
              <article className="approval-card" key={request.id}>
                <div>
                  <strong>{request.title}</strong>
                  <span>{request.request_date} · +{request.points}P</span>
                </div>
                <div className="approval-actions">
                  <button
                    className="reject-button"
                    disabled={processingId === request.id}
                    onClick={() => decide(request.id, 'rejected')}
                  >
                    거절
                  </button>
                  <button
                    className="approve-button"
                    disabled={processingId === request.id}
                    onClick={() => decide(request.id, 'approved')}
                  >
                    {processingId === request.id ? '처리 중...' : '승인'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <button className="text-button" onClick={loadPending}>새로고침</button>
      </section>
    </main>
  );
}
