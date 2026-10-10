import { useGame } from '../game/GameContext';
import { OINORI_COMPANIES } from './Oinori';

function titleFor(stress: number) {
  if (stress >= 130) return { title: '伝説のお祈られマスター', comment: 'あなたの今後のご活躍を、全人類がお祈りしています。' };
  if (stress >= 100) return { title: 'お祈られ上級者', comment: 'ストレスゲージが振り切れました。今日はもう寝ましょう。' };
  if (stress >= 70) return { title: '量産型就活生', comment: '理不尽に耐え抜きました。それでもお祈りです。' };
  return { title: '鋼メンタル就活生（お祈り済み）', comment: '動じないあなたも、もれなくお祈りされました。' };
}

export default function Result() {
  const { state, reset } = useGame();
  const elapsed = Math.round(((state.finishedAt ?? Date.now()) - state.startedAt) / 1000);
  const oinori = OINORI_COMPANIES.length + 1;
  const { title, comment } = titleFor(state.stress);

  // 同じラベルを合算して上位5件
  const breakdown = Object.entries(
    state.events.reduce<Record<string, number>>((acc, e) => {
      acc[e.label] = (acc[e.label] ?? 0) + e.amount;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const shareText = `【まいにちナビ2028】就活ストレス指数 ${state.stress}％、お祈り ${oinori}社、称号「${title}」でした。\nエントリーは1社です。\n#就活ストレスシミュレーター #まいにちナビ2028`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(
    window.location.href.split('#')[0],
  )}`;

  return (
    <div className="page narrow">
      <div className="card result">
        <p className="result-kicker">2028年卒 就職活動 結果報告</p>
        <p className="result-status">全落ち</p>
        <p className="result-title">
          称号：<strong>{title}</strong>
        </p>
        <p className="result-comment">{comment}</p>

        <div className="result-stats">
          <div>
            <span className="rs-num stress-red">{state.stress}%</span>
            <span className="rs-label">就活ストレス指数</span>
          </div>
          <div>
            <span className="rs-num">{oinori}社</span>
            <span className="rs-label">お祈り（うちエントリー1社）</span>
          </div>
          <div>
            <span className="rs-num">
              {Math.floor(elapsed / 60)}分{elapsed % 60}秒
            </span>
            <span className="rs-label">プレイ時間</span>
          </div>
          <div>
            <span className="rs-num">{state.errors}回</span>
            <span className="rs-label">エラー・失敗</span>
          </div>
          <div>
            <span className="rs-num">{state.chars.toLocaleString()}字</span>
            <span className="rs-label">ESの文字数</span>
          </div>
          <div>
            <span className="rs-num">0社</span>
            <span className="rs-label">内定</span>
          </div>
        </div>

        <h2 className="result-sub">ストレスの内訳 ワースト5</h2>
        <ol className="breakdown">
          {breakdown.map(([label, amount]) => (
            <li key={label}>
              <span>{label}</span>
              <span className="bd-amount">+{amount}%</span>
            </li>
          ))}
        </ol>

        <div className="result-actions">
          <a className="btn btn-x btn-lg" href={shareUrl} target="_blank" rel="noopener noreferrer">
            𝕏 で結果をシェアする
          </a>
          <button className="btn btn-secondary btn-lg" onClick={reset}>
            もう一度就活する（2029年卒として）
          </button>
        </div>
        <p className="tiny-note center">
          ※このサイトはフィクションです。実在の就活生の皆さんの今後のご活躍を、心よりお祈り申し上げます（いい意味で）。
        </p>
      </div>
    </div>
  );
}
