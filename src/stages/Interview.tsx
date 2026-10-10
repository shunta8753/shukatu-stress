import { useEffect, useState } from 'react';
import { useGame } from '../game/GameContext';

const QUESTIONS = [
  {
    q: 'それでは、まず1分程度で自己紹介をお願いします。',
    options: ['大学名と氏名だけ簡潔に（10秒）', 'ガクチカを交えて1分ちょうどで話す', '緊張して3分話してしまう'],
    reply: 'はい、ありがとうございます。',
  },
  {
    q: '学生時代に力を入れたことを教えてください。',
    options: ['ESに書いた内容をそのまま話す', 'ESとは別のエピソードを話す', '「ESに書いた通りです」'],
    reply: 'なるほど……（カタカタ…）（メモを取る音）',
    glitch: true,
  },
  {
    q: 'では、あなたを動物に例えると何ですか？',
    options: ['犬（誰とでも仲良くなれる）', 'カメ（着実に進む）', 'ハシビロコウ（動かない）'],
    reply: '……なるほど。ユニークですね。',
  },
  {
    q: '最後に、何か質問はありますか？',
    options: ['特にありません', '御社の求める人物像を教えてください', '面接官の方のやりがいを教えてください'],
    reply: 'いい質問ですね。それは……人によりますね。',
  },
];

type Phase = 'waiting' | 'question' | 'reply' | 'glitch' | 'end';

export default function Interview() {
  const { state, go, complete, addStress } = useGame();
  const [phase, setPhase] = useState<Phase>('waiting');
  const [qi, setQi] = useState(0);

  useEffect(() => {
    if (phase === 'waiting') {
      const t = window.setTimeout(() => {
        addStress(3, '面接の待機室で放置');
        setPhase('question');
      }, 4500);
      return () => window.clearTimeout(t);
    }
    if (phase === 'glitch') {
      const t = window.setTimeout(() => setPhase('reply'), 2600);
      return () => window.clearTimeout(t);
    }
    if (phase === 'reply') {
      const t = window.setTimeout(() => {
        if (qi + 1 < QUESTIONS.length) {
          setQi(qi + 1);
          setPhase('question');
        } else {
          setPhase('end');
        }
      }, 1800);
      return () => window.clearTimeout(t);
    }
  }, [phase, qi, addStress]);

  const answer = () => {
    if (QUESTIONS[qi].glitch) {
      addStress(4, '面接中に回線が不安定に');
      setPhase('glitch');
    } else {
      setPhase('reply');
    }
  };

  const q = QUESTIONS[qi];
  const line =
    phase === 'waiting'
      ? ''
      : phase === 'end'
        ? '本日はありがとうございました。結果につきましては、1週間以内にご連絡いたします。'
        : phase === 'reply' || phase === 'glitch'
          ? q.reply
          : q.q;

  return (
    <div className="page">
      <div className="meeting">
        <div className="meeting-bar">
          <span>● 東都インテグレート 一次面接</span>
          <span>{state.meta.interview ?? ''}</span>
        </div>

        {phase === 'waiting' ? (
          <div className="meeting-waiting">
            <div className="spinner" />
            <p>ミーティングのホストが入室を許可するまで、しばらくお待ちください。</p>
            <p className="tiny-note light">（開始予定時刻を3分過ぎています）</p>
          </div>
        ) : (
          <div className="meeting-grid">
            <div className="tile">
              <div className="tile-avatar interviewer">面</div>
              <span className="tile-name">人事部 採用担当（主任）</span>
              {phase === 'glitch' && (
                <div className="glitch">
                  <p>⚠ インターネット接続が不安定です</p>
                  <p className="tiny-note light">再接続しています…</p>
                </div>
              )}
            </div>
            <div className="tile self">
              <div className="tile-avatar">あなた</div>
              <span className="tile-name">{state.userName}（あなた）</span>
            </div>
          </div>
        )}

        {line && (
          <div className="meeting-caption">
            <span className="caption-who">面接官：</span>
            {line}
          </div>
        )}

        <div className="meeting-answers">
          {phase === 'question' &&
            q.options.map((o) => (
              <button key={o} className="btn btn-option dark" onClick={answer}>
                {o}
              </button>
            ))}
          {phase === 'end' && (
            <button
              className="btn btn-danger"
              onClick={() => {
                complete('interview');
                go('waiting');
              }}
            >
              退出する
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
