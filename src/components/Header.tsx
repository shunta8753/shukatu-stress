import { useEffect, useState } from 'react';
import { DATE_OFFSETS, useGame, virtualDate } from '../game/GameContext';
import Modal from './Modal';

const SCOUT_COMPANIES = [
  '株式会社ネクストフューチャーパートナーズ',
  'グローバル共創ホールディングス株式会社',
  '株式会社みらいキャリアデザイン',
  '大和田システムズ株式会社',
  '株式会社ビヨンド・イノベーション',
  'あおば物産株式会社',
  '株式会社ワン・ステップ・ソリューションズ',
  '東亜総合サービス株式会社',
];

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function Header() {
  const { state, unread, go, toast, addStress } = useGame();
  const [, setTick] = useState(0);
  const [showMessages, setShowMessages] = useState(false);
  const [openScout, setOpenScout] = useState<string | null>(null);

  useEffect(() => {
    if (state.finishedAt) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, [state.finishedAt]);

  const registered = state.screen !== 'register';
  const elapsed = (state.finishedAt ?? Date.now()) - state.startedAt;
  const stressPct = Math.min(state.stress, 100);
  const stressLevel = state.stress >= 80 ? 'high' : state.stress >= 40 ? 'mid' : 'low';
  // 面接以降は予約した日付基準（結果待ちは面接の2週間後）
  const interviewOffset = Number(state.meta.interviewOffset ?? NaN);
  const dateOffset =
    state.screen === 'interview' && !Number.isNaN(interviewOffset)
      ? interviewOffset
      : ['waiting', 'oinori', 'result'].includes(state.screen) && !Number.isNaN(interviewOffset)
        ? interviewOffset + 14
        : DATE_OFFSETS[Math.min(state.done.length, DATE_OFFSETS.length - 1)];
  const inStage = !['dashboard', 'register', 'result'].includes(state.screen);

  const goHome = () => {
    if (!registered || state.screen === 'result') return;
    if (['waiting', 'oinori', 'interview'].includes(state.screen)) {
      toast('現在この操作は行えません', 'warn');
      return;
    }
    if (inStage) {
      toast('入力中の内容は破棄されました', 'warn');
      addStress(2, '入力内容の破棄');
    }
    go('dashboard');
  };

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="inner header-inner">
          <button className="logo" onClick={goHome} aria-label="マイページトップへ">
            <span className="logo-main">まいにちナビ</span>
            <span className="logo-year">2028</span>
          </button>
          {registered && (
            <nav className="header-nav">
              <button onClick={goHome}>マイページ</button>
              <button onClick={() => toast('現在、企業検索機能はメンテナンス中です（終了予定：未定）', 'warn')}>
                企業を探す
              </button>
              <button onClick={() => setShowMessages(true)} className="nav-msg">
                メッセージ
                <span className="badge">{unread > 999 ? '999+' : unread}</span>
              </button>
            </nav>
          )}
          {registered && state.userName && <div className="header-user">{state.userName} さん</div>}
        </div>
      </div>
      {registered && (
        <div className="status-bar">
          <div className="inner status-inner">
            <span className="status-date">📅 {virtualDate(dateOffset)}</span>
            <span className="stress">
              <span className="stress-label">就活ストレス</span>
              <span className="stress-track">
                <span className={`stress-fill ${stressLevel}`} style={{ width: `${stressPct}%` }} />
              </span>
              <span className={`stress-num ${stressLevel}`}>{state.stress}%</span>
            </span>
            <span className="status-time">⏱ {formatElapsed(elapsed)}</span>
          </div>
        </div>
      )}

      {showMessages && (
        <Modal
          title={`メッセージBOX（未読 ${unread > 999 ? '999+' : unread}件）`}
          onClose={() => {
            setShowMessages(false);
            setOpenScout(null);
          }}
        >
          {openScout ? (
            <div className="mail-body">
              <p className="mail-from">差出人：{openScout} 採用担当</p>
              <p>
                {state.userName || 'あなた'} 様<br />
                <br />
                突然のご連絡失礼いたします。{openScout}採用担当です。
                <br />
                {state.userName || 'あなた'}様のプロフィールを拝見し、
                <strong>ぜひ一度お話ししたい</strong>と思いご連絡いたしました。
                <br />
                特に、プロフィールに記載されている「（未入力）」というご経験に大変魅力を感じております。
                <br />
                <br />
                まずはお気軽に、<strong>説明会（2時間・参加必須）</strong>にご参加ください。
              </p>
              <p className="tiny-note">※本メッセージは条件に合致した28卒の皆様全員にお送りしています。</p>
              <button className="btn btn-secondary" onClick={() => setOpenScout(null)}>
                一覧に戻る
              </button>
            </div>
          ) : (
            <ul className="mail-list">
              {SCOUT_COMPANIES.map((c, i) => (
                <li key={c}>
                  <button
                    onClick={() => {
                      setOpenScout(c);
                      addStress(1, '中身のないスカウトメール');
                    }}
                  >
                    <span className="mail-tag">スカウト</span>
                    <span className="mail-subject">
                      【特別選考のご案内】{state.userName || 'あなた'}さんだけにお送りしています
                    </span>
                    <span className="mail-sender">{c}</span>
                    <span className="mail-date">{i < 3 ? '今日' : '昨日'}</span>
                  </button>
                </li>
              ))}
              <li className="mail-more">ほか {Math.max(unread - SCOUT_COMPANIES.length, 0)} 件のスカウト</li>
            </ul>
          )}
        </Modal>
      )}
    </header>
  );
}
