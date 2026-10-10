import { useEffect, useState } from 'react';
import { useGame } from '../game/GameContext';

export const OINORI_COMPANIES = [
  '日本ミライ銀行',
  '東亜総合商事株式会社',
  'あおば物産株式会社',
  '株式会社ネクストフューチャーパートナーズ',
  '大和田システムズ株式会社',
  'グローバル共創ホールディングス株式会社',
  '株式会社みらいキャリアデザイン',
  '西都製薬株式会社',
  'さくら不動産株式会社',
  '株式会社ビヨンド・イノベーション',
  '東都インテグレート株式会社（念のためもう一度）',
  '港南電機株式会社',
  '株式会社ワン・ステップ・ソリューションズ',
  '城北フードサービス株式会社',
  '緑川証券株式会社',
  '株式会社まいにちナビ（※エントリーしていません）',
  '山手コンサルティング株式会社',
  '北都ロジスティクス株式会社',
  '株式会社エントリーしていない社',
  '中央学園大学 キャリアセンター',
  '実家の近所のパン屋',
  '株式会社オイノリ総研',
  '東都インテグレート株式会社（念のためさらにもう一度）',
  'あなたの第一志望の会社',
  '株式会社サイレント（※連絡はありません）',
  '新都市ガス株式会社',
  '株式会社アットホーム・ワークス',
  '桜ヶ丘信用金庫',
  'まだ存在しない会社（2031年設立予定）',
  '東都インテグレート株式会社 社長（直筆）',
];

export default function Oinori() {
  const { state, go, finish, addStress } = useGame();
  const [flood, setFlood] = useState(0);
  const [started, setStarted] = useState(false);
  const name = state.userName || 'あなた';

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStarted(true);
      addStress(10, 'お祈りメール');
    }, 3500);
    return () => window.clearTimeout(t);
  }, [addStress]);

  useEffect(() => {
    if (!started || flood >= OINORI_COMPANIES.length) return;
    const t = window.setTimeout(() => setFlood((n) => n + 1), flood < 5 ? 450 : 140);
    return () => window.clearTimeout(t);
  }, [started, flood]);

  const total = 1 + flood;
  const allArrived = flood >= OINORI_COMPANIES.length;

  return (
    <div className="page oinori-page">
      <div className="mail-view card">
        <div className="mail-header">
          <p className="mail-subject-big">【東都インテグレート株式会社】選考結果のご連絡</p>
          <p className="mail-from">差出人：東都インテグレート株式会社 人事部 採用担当</p>
        </div>
        <div className="mail-text">
          <p>{name} 様</p>
          <p>
            この度は、数ある企業の中から弊社の採用選考にご応募いただき、誠にありがとうございました。
          </p>
          <p>
            慎重に選考を重ねました結果、誠に残念ではございますが、今回はご期待に沿いかねる結果となりました。
          </p>
          <p>
            多数のご応募をいただいた中で、ご期待に添えない結果となりましたことを、何卒ご了承くださいますようお願い申し上げます。
          </p>
          <p>
            末筆ではございますが、
            <span className="oinori-highlight">{name} 様の今後のより一層のご活躍を心よりお祈り申し上げます。</span>
          </p>
          <p className="mail-sign">
            東都インテグレート株式会社
            <br />
            人事部 採用担当
          </p>
          <p className="tiny-note">※本メールは送信専用です。選考に関するお問い合わせには一切お答えできません。</p>
        </div>
      </div>

      {started && (
        <div className="flood card">
          <div className="flood-head">
            <span>📩 新着メッセージ</span>
            <span className="flood-count">お祈り {total} 社</span>
          </div>
          <ul className="flood-list">
            {OINORI_COMPANIES.slice(0, flood)
              .map((c) => (
                <li key={c} className="flood-item">
                  <span className="mail-tag gray">選考結果</span>
                  <span className="flood-subject">選考結果のご連絡（今後のご活躍をお祈り申し上げます）</span>
                  <span className="flood-sender">{c}</span>
                </li>
              ))
              .reverse()}
          </ul>
          {allArrived && (
            <button
              className="btn btn-entry btn-lg btn-block"
              onClick={() => {
                finish();
                go('result');
              }}
            >
              就活の結果を見る
            </button>
          )}
        </div>
      )}
    </div>
  );
}
