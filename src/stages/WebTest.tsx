import { useEffect, useState } from 'react';
import { useGame } from '../game/GameContext';

const ABILITY = [
  {
    q: 'ある商品を定価の2割引で販売したところ、原価の1割6分の利益が出た。原価が2,500円のとき、この商品の定価はいくらか。',
    options: ['3,450円', '3,625円', '3,700円', '3,825円'],
    loadMs: 0,
  },
  {
    q: 'P、Q、Rの3人が次のように発言した。\nP「Qは嘘をついている」\nQ「Rは嘘をついている」\nR「PもQも嘘をついている」\n正直者は誰か。',
    options: ['Pのみ', 'Qのみ', 'Rのみ', 'PとR'],
    loadMs: 0,
  },
  {
    q: '次の文の空欄に入る最も適切な語句を選べ。\n「就職活動においては、企業と学生の相互理解を深めるため、（　　　）が求められる。」',
    options: ['迅速な対応', '丁寧な説明', '双方の歩み寄り', '上記のいずれでもない'],
    loadMs: 5000, // 問題文の読み込みで制限時間の半分が消える
  },
];
const LIMIT = 10;

const PERSONALITY = [
  '人と話すのが好きだ',
  '一人で過ごす時間が好きだ',
  '人と話すのはあまり好きではない',
  '物事を慎重に進める方だと、周りから思われていると自分では思う',
  '「どちらかといえば」と聞かれるのは、どちらかといえば苦手だ',
  '人と話すのが好きだ',
];
const EXTRA = ['人と話すのが好きだ', '本当に、人と話すのが好きだ', '先ほどの回答に偽りはない'];
const SCALE = ['当てはまる', 'やや当てはまる', 'あまり当てはまらない', '当てはまらない'];

type Phase = 'intro' | 'ability' | 'personality' | 'checking' | 'extra' | 'done';

export default function WebTest() {
  const { go, complete, addStress, toast } = useGame();
  const [phase, setPhase] = useState<Phase>('intro');
  const [qi, setQi] = useState(0);
  const [left, setLeft] = useState(LIMIT);
  const [loading, setLoading] = useState(false);
  const [pi, setPi] = useState(0);

  // 能力検査タイマー（読み込み中も時間は減る）
  useEffect(() => {
    if (phase !== 'ability') return;
    const t = window.setInterval(() => setLeft((l) => l - 0.1), 100);
    return () => window.clearInterval(t);
  }, [phase, qi]);

  useEffect(() => {
    if (phase !== 'ability') return;
    const ms = ABILITY[qi].loadMs;
    if (!ms) return;
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [phase, qi]);

  const nextAbility = () => {
    if (qi + 1 < ABILITY.length) {
      setQi(qi + 1);
      setLeft(LIMIT);
    } else {
      setPhase('personality');
    }
  };

  useEffect(() => {
    if (phase === 'ability' && left <= 0) {
      toast('時間切れです。次の問題に進みます', 'error');
      addStress(4, 'Webテストの時間切れ', true);
      nextAbility();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  useEffect(() => {
    if (phase !== 'checking') return;
    const t = window.setTimeout(() => {
      setPhase('extra');
      setPi(0);
      toast('回答の一貫性が低いため、追加の質問に回答してください', 'warn');
      addStress(4, '性格検査「回答の一貫性が低い」');
    }, 2500);
    return () => window.clearTimeout(t);
  }, [phase, addStress, toast]);

  const answerPersonality = () => {
    const list = phase === 'personality' ? PERSONALITY : EXTRA;
    if (pi + 1 < list.length) {
      setPi(pi + 1);
    } else {
      setPhase(phase === 'personality' ? 'checking' : 'done');
    }
  };

  if (phase === 'intro') {
    return (
      <div className="page narrow">
        <div className="card test-card">
          <h1 className="page-title">適性検査（Webテスト）受検のご案内</h1>
          <table className="confirm-table">
            <tbody>
              <tr><th>検査内容</th><td>能力検査（言語・非言語）／性格検査</td></tr>
              <tr><th>所要時間</th><td>約65分</td></tr>
              <tr><th>受検期限</th><td>本日 23:59まで</td></tr>
            </tbody>
          </table>
          <ul className="es-rules">
            <li>電卓・筆記用具をご用意ください。</li>
            <li>受検を開始すると中断できません。中断した場合、再受検はできません。</li>
            <li>結果は企業に送信されます。受検者ご本人には開示されません。</li>
          </ul>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => setPhase('ability')}>
            受検を開始する
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'ability') {
    const q = ABILITY[qi];
    return (
      <div className="page narrow">
        <div className="card test-card">
          <div className="test-head">
            <span>能力検査　{qi + 1} / {ABILITY.length}</span>
            <span className={`test-left ${left < 4 ? 'danger' : ''}`}>残り {Math.max(left, 0).toFixed(1)} 秒</span>
          </div>
          <div className="test-bar">
            <div style={{ width: `${(Math.max(left, 0) / LIMIT) * 100}%` }} />
          </div>
          {loading ? (
            <div className="test-loading">
              <div className="spinner dark" />
              <p>問題文を読み込んでいます…</p>
              <p className="tiny-note">※読み込み中も制限時間は経過します</p>
            </div>
          ) : (
            <>
              <p className="test-q">{q.q}</p>
              <div className="option-list">
                {q.options.map((o) => (
                  <button key={o} className="btn btn-option" onClick={nextAbility}>
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'personality' || phase === 'extra') {
    const list = phase === 'personality' ? PERSONALITY : EXTRA;
    const shownNo = phase === 'personality' ? pi + 1 : 240 + pi + 1;
    return (
      <div className="page narrow">
        <div className="card test-card">
          <div className="test-head">
            <span>{phase === 'personality' ? '性格検査' : '性格検査（追加質問）'}</span>
            <span>
              {shownNo} / {phase === 'personality' ? 240 : 243}
            </span>
          </div>
          <div className="test-bar slow">
            <div style={{ width: `${(shownNo / 243) * 100}%` }} />
          </div>
          {phase === 'personality' && pi === PERSONALITY.length - 1 && (
            <p className="tiny-note">※体験版のため、7〜240問目は「当てはまる」を回答したものとみなします。</p>
          )}
          <p className="test-q">{list[pi]}</p>
          <div className="option-list">
            {SCALE.map((s) => (
              <button key={s} className="btn btn-option" onClick={answerPersonality}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'checking') {
    return (
      <div className="page narrow">
        <div className="card test-card center">
          <div className="spinner dark" />
          <p>回答の一貫性を確認しています…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <div className="card test-card center">
        <h1 className="page-title">受検が完了しました</h1>
        <p>検査結果は企業に送信されました。</p>
        <p className="tiny-note">※結果はご本人には開示されません。※他社の選考でも結果が使い回される場合があります。</p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            complete('webtest');
            go('dashboard');
          }}
        >
          マイページに戻る
        </button>
      </div>
    </div>
  );
}
