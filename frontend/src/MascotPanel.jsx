import React, { useMemo } from 'react';
import { mascots, pickMascotMessage } from './data/mascots';

export default function MascotPanel({ points = 0, completed = 0 }) {
  const featured = useMemo(
    () => pickMascotMessage(points * 31 + completed * 17 + new Date().getDate()),
    [points, completed]
  );

  return (
    <section className={`mascot-panel ${featured.tone}`}>
      <div className="mascot-featured">
        <div className="mascot-avatar" aria-hidden="true">{featured.emoji}</div>
        <div>
          <p className="mascot-kicker">오늘의 NPC</p>
          <h2>{featured.name} · {featured.role}</h2>
          <blockquote>“{featured.line}”</blockquote>
        </div>
      </div>

      <div className="mascot-roster" aria-label="친구 도감 미리보기">
        {mascots.map((mascot) => (
          <article key={mascot.id} className={`mascot-chip ${mascot.id === featured.id ? 'active' : ''}`}>
            <span aria-hidden="true">{mascot.emoji}</span>
            <div>
              <strong>{mascot.name}</strong>
              <small>{mascot.role}</small>
            </div>
          </article>
        ))}
        <a className="book-link" href="/book.html">친구 도감 열기 →</a>
      </div>
    </section>
  );
}
