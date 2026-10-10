import { useEffect, useState } from 'react';
import { useGame } from '../game/GameContext';

const STEPS = [
  { day: 1, text: '新着メッセージ：スカウト 41件（選考結果：0件）' },
  { day: 3, text: '新着メッセージ：スカウト 163件（選考結果：0件）' },
  { day: 7, text: '「1週間以内にご連絡します」の期限です。新着：スカウト 288件（選考結果：0件）', stress: 5 },
  { day: 10, text: 'まだ連絡はありません。SNSで「東都 一次 通過」と検索してしまう。', stress: 5 },
  { day: 14, text: '新着メッセージが1件あります。' },
];

export default function Waiting() {
  const { go, addStress } = useGame();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (i >= STEPS.length - 1) return;
    const t = window.setTimeout(() => {
      const next = STEPS[i + 1];
      if (next.stress) addStress(next.stress, next.day === 7 ? '1週間以内に連絡が来ない' : '通過者のSNS報告を見てしまう');
      setI(i + 1);
    }, 1800);
    return () => window.clearTimeout(t);
  }, [i, addStress]);

  const last = i === STEPS.length - 1;

  return (
    <div className="page narrow">
      <div className="card">
        <h1 className="page-title">選考状況</h1>
        <table className="confirm-table">
          <tbody>
            <tr><th>企業名</th><td>東都インテグレート株式会社</td></tr>
            <tr><th>選考段階</th><td>一次面接</td></tr>
            <tr>
              <th>ステータス</th>
              <td>
                <span className="status-pill">選考結果待ち</span>
              </td>
            </tr>
          </tbody>
        </table>

        <ul className="wait-log">
          {STEPS.slice(0, i + 1).map((s) => (
            <li key={s.day}>
              <span className="wait-day">面接から{s.day}日後</span>
              {s.text}
            </li>
          ))}
        </ul>

        {last && (
          <button className="notify-card" onClick={() => go('oinori')}>
            <span className="notify-new">NEW</span>
            <span>
              <strong>【東都インテグレート株式会社】選考結果のご連絡</strong>
              <span className="tiny-note">タップしてメッセージを開く</span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
