import { TASKS, useGame, type Screen } from '../game/GameContext';
import Modal from '../components/Modal';

const NEWS = [
  { tag: '重要', text: '【28卒】3月1日、エントリー受付開始！今すぐエントリーしよう' },
  { tag: '特集', text: '今からでも間に合う！早期選考特集（※ほぼ締め切りました）' },
  { tag: 'お知らせ', text: 'システムメンテナンスのお知らせ（毎週金曜 18:00〜翌月曜 9:00）' },
  { tag: 'コラム', text: '面接官はここを見ている！第一印象は入室前の0.2秒で決まる' },
  { tag: 'コラム', text: '内定者の96%が実践していた「ガクチカ」の作り方' },
];

export default function Dashboard() {
  const { state, go, toast, addStress, setFlag } = useGame();
  const nextTask = TASKS.find((t) => !state.done.includes(t.id));
  const showSurvey = !state.flags.surveyClosed;

  const closeSurvey = () => {
    setFlag('surveyClosed');
    addStress(2, '必須アンケート（所要15分）の出現');
  };

  return (
    <div className="page dashboard">
      <div className="dash-grid">
        <aside className="dash-side">
          <div className="card profile">
            <div className="avatar">👤</div>
            <p className="profile-name">{state.userName} さん</p>
            <p className="profile-sub">2028年3月卒業予定</p>
            <div className="profile-rate">
              <span>プロフィール入力率</span>
              <div className="rate-track">
                <div className="rate-fill" style={{ width: '62%' }} />
              </div>
              <span className="rate-num">62%</span>
            </div>
            <button
              className="btn btn-secondary btn-block"
              onClick={() => {
                toast('プロフィールを入力しても入力率は62%のままです', 'warn');
                addStress(1, '上がらないプロフィール入力率');
              }}
            >
              プロフィールを入力する
            </button>
          </div>
          <div className="card stats">
            <div>
              <span className="stat-num">{state.done.includes('entry') ? 1 : 0}</span>
              <span className="stat-label">エントリー</span>
            </div>
            <div>
              <span className="stat-num">32.4</span>
              <span className="stat-label">28卒平均</span>
            </div>
          </div>
        </aside>

        <section className="dash-main">
          <div className="card">
            <h2 className="card-title">
              やることリスト <span className="count-badge">{TASKS.length - state.done.length}</span>
            </h2>
            <ul className="task-list">
              {TASKS.map((t, i) => {
                const done = state.done.includes(t.id);
                const isNext = nextTask?.id === t.id;
                return (
                  <li key={t.id} className={`task ${done ? 'done' : isNext ? 'next' : 'locked'}`}>
                    <span className="task-no">{i + 1}</span>
                    <div className="task-body">
                      <p className="task-title">{t.title}</p>
                      <p className="task-desc">
                        {t.desc}　<span className="deadline">締切：{t.deadline}</span>
                      </p>
                    </div>
                    {done ? (
                      <span className="task-status done">完了</span>
                    ) : isNext ? (
                      <button className="btn btn-entry" onClick={() => go(t.id as Screen)}>
                        {t.id === 'interview' ? '面接に参加する' : '進む'}
                      </button>
                    ) : (
                      <span className="task-status locked">🔒 未公開</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card">
            <h2 className="card-title">お知らせ</h2>
            <ul className="news-list">
              {NEWS.map((n) => (
                <li key={n.text}>
                  <span className={`news-tag ${n.tag === '重要' ? 'important' : ''}`}>{n.tag}</span>
                  {n.text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="dash-side">
          <div className="card deadline-card">
            <p className="deadline-num">48</p>
            <p>締切が近い企業</p>
            <p className="tiny-note">うち本日締切 31件</p>
          </div>
          <div className="card recommend">
            <p className="recommend-head">あなたへのおすすめ企業</p>
            <p className="recommend-num">1,284<span>社</span></p>
            <p className="tiny-note">※条件：28卒であること</p>
          </div>
          <div className="banner">
            <p>【PR】まだ間に合う！</p>
            <p className="banner-big">早期選考特集</p>
            <p className="banner-small">※ほぼ間に合いません</p>
          </div>
        </aside>
      </div>

      {showSurvey && (
        <Modal title="【必須】就職活動状況アンケート" onClose={closeSurvey} tinyClose>
          <p>
            まいにちナビをご利用いただきありがとうございます。
            <br />
            より良いサービス提供のため、アンケートにご協力ください。
          </p>
          <p className="survey-meta">
            設問数：<strong>87問</strong>　所要時間：<strong>約15分</strong>
          </p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                toast('アンケートは現在メンテナンス中です', 'warn');
                closeSurvey();
              }}
            >
              回答する
            </button>
          </div>
          <p className="tiny-note right">
            <button className="link tiny-link" onClick={closeSurvey}>
              回答しない（非推奨）
            </button>
          </p>
        </Modal>
      )}
    </div>
  );
}
