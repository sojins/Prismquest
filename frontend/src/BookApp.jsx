import React from 'react';
import { mascots } from './data/mascots';

const profileArt = '/assets/characters/mascot-profile-cards-v1.png';

export default function BookApp() {
  return (
    <main className="app-shell book-shell">
      <header className="hero book-hero">
        <div>
          <p className="eyebrow">Book of Friends</p>
          <h1>친구 도감</h1>
          <p>푸딩이와 찡찡이의 공식 프로필과 대사를 모아봅니다.</p>
        </div>
        <a className="hero-link" href="/">퀘스트로 돌아가기</a>
      </header>

      <section className="panel profile-art-panel">
        <img src={profileArt} alt="푸딩이와 찡찡이 공식 프로필 카드" />
      </section>

      <section className="book-grid">
        {mascots.map((mascot) => (
          <article className={`book-card ${mascot.tone}`} key={mascot.id}>
            <div className="book-card-head">
              <span className="book-emoji">{mascot.emoji}</span>
              <div>
                <small>{mascot.role}</small>
                <h2>{mascot.name}</h2>
              </div>
            </div>
            <div className="quote-list">
              {mascot.lines.map((line) => <p key={line}>“{line}”</p>)}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
