import { useEffect, useRef, useState } from 'react';
import { useGame } from '../game/GameContext';
import Modal from '../components/Modal';

const REAL_SECONDS = 36; // 実時間での総再生時間
const SHOWN_SECONDS = 45 * 60; // 表示上の総再生時間（45分）
const TICK_MS = 100;
const QUIZ_AT = 0.48;
const STALL_AT = 0.99;

const SCRIPT: { at: number; slide: string; sub: string }[] = [
  { at: 0, slide: 'WELCOME', sub: '皆さん、こんにちは。東都インテグレート 代表取締役社長の東都です。' },
  { at: 0.07, slide: 'WELCOME', sub: '本日はお忙しい中、ご視聴いただき誠にありがとうございます。' },
  { at: 0.14, slide: 'VUCA', sub: '現代は、VUCAとも呼ばれる、変化の激しい時代です。' },
  { at: 0.22, slide: '人', sub: '弊社が何より大切にしているのは「人」です。' },
  { at: 0.31, slide: '挑戦', sub: 'そして、何より大切にしているのが「挑戦」です。' },
  { at: 0.4, slide: '変化', sub: 'さらに、何より大切にしているのが「変化を恐れないこと」です。' },
  { at: 0.5, slide: '裁量', sub: '弊社では、若手のうちから大きな裁量を持って働くことができます。' },
  { at: 0.58, slide: '風通し', sub: '社長室のドアはいつでも開いています。物理的に、ドアがありません。' },
  { at: 0.66, slide: '福利厚生', sub: '（※ここから人事部長による福利厚生の説明が17分間続きます）' },
  { at: 0.8, slide: '共創', sub: 'アットホームな職場で、一緒に未来を共創しましょう。' },
  { at: 0.9, slide: 'THANK YOU', sub: '皆さんとお会いできることを、心より楽しみにしています。' },
];

const QUIZ_OPTIONS = ['人', '挑戦', '変化を恐れないこと', '上記すべて'];

function fmt(sec: number) {
  const s = Math.floor(sec);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

type Phase = 'video' | 'quiz' | 'sending' | 'error' | 'survey';

export default function Seminar() {
  const { go, complete, addStress, toast } = useGame();
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const [phase, setPhase] = useState<Phase>('video');
  const [retried, setRetried] = useState(false);
  const [satisfaction, setSatisfaction] = useState('');
  const [surveyError, setSurveyError] = useState(false);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  // 再生
  useEffect(() => {
    if (!playing || phase !== 'video') return;
    const step = TICK_MS / 1000 / REAL_SECONDS;
    const t = window.setInterval(() => {
      setProgress((p) => Math.min(p + step, quizDone ? STALL_AT : QUIZ_AT));
    }, TICK_MS);
    return () => window.clearInterval(t);
  }, [playing, phase, quizDone]);

  // 確認テスト / 99%で停止
  useEffect(() => {
    if (phase !== 'video') return;
    if (!quizDone && progress >= QUIZ_AT) {
      setPlaying(false);
      setPhase('quiz');
    } else if (quizDone && progress >= STALL_AT) {
      setPlaying(false);
      setPhase('sending');
    }
  }, [progress, quizDone, phase]);

  // 視聴データ送信 → 1回目は必ず失敗
  useEffect(() => {
    if (phase !== 'sending') return;
    const t = window.setTimeout(() => {
      if (retried) {
        setProgress(1);
        setPhase('survey');
      } else {
        setPhase('error');
        addStress(6, '説明会動画が99%で止まる', true);
      }
    }, 3500);
    return () => window.clearTimeout(t);
  }, [phase, retried, addStress]);

  // タブ離脱で一時停止
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && playingRef.current) {
        setPlaying(false);
        toast('画面から離れたため、再生を一時停止しました', 'warn');
        addStress(2, '別タブを開いたら一時停止');
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [toast, addStress]);

  const current = [...SCRIPT].reverse().find((s) => progress >= s.at) ?? SCRIPT[0];

  const answerQuiz = (opt: string) => {
    if (opt === '上記すべて') {
      toast('正解です。視聴を再開します');
      setQuizDone(true);
      setPhase('video');
      setPlaying(true);
    } else {
      toast('不正解です。10分前から再視聴してください', 'error');
      addStress(5, '確認テスト不正解で10分巻き戻し', true);
      setProgress((p) => Math.max(p - 10 / 45, 0));
      setPhase('video');
      setPlaying(true);
    }
  };

  const blocked = (msg: string) => {
    toast(msg, 'warn');
    addStress(1, '早送り・倍速ができない');
  };

  return (
    <div className="page">
      <p className="breadcrumb">マイページ ＞ 説明会・イベント ＞ 東都インテグレート Web会社説明会</p>
      <div className="card">
        <h1 className="page-title">【28卒向け】東都インテグレート 会社説明会（録画配信）</h1>
        <p className="tiny-note">
          ※本動画の視聴はエントリーシート提出の必須条件です。※早送り・スキップ・倍速再生はできません。※視聴中に画面を離れると一時停止します。
        </p>

        <div className="player">
          <div className="player-screen">
            <div className="slide">
              <span className="slide-logo">TOTO INTEGRATE</span>
              <span className="slide-word">{current.slide}</span>
            </div>
            <div className="presenter">
              <div className="presenter-head" />
              <div className="presenter-body" />
              <span className="presenter-name">代表取締役社長</span>
            </div>
            <p className="subtitle">{current.sub}</p>
            {!playing && phase === 'video' && (
              <button className="big-play" onClick={() => setPlaying(true)} aria-label="再生">
                ▶
              </button>
            )}
            {phase === 'sending' && (
              <div className="player-overlay">
                <div className="spinner" />
                <p>視聴データを送信しています…</p>
              </div>
            )}
          </div>
          <div className="player-controls">
            <button
              onClick={() => setPlaying(!playing)}
              disabled={phase !== 'video'}
              aria-label={playing ? '一時停止' : '再生'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <div className="seek" onClick={() => blocked('早送り・スキップはできません')}>
              <div className="seek-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <span className="time">
              {fmt(progress * SHOWN_SECONDS)} / {fmt(SHOWN_SECONDS)}
            </span>
            <button onClick={() => blocked('倍速再生は無効に設定されています')}>1.0x</button>
            <button onClick={() => blocked('全画面表示は利用できません')}>⛶</button>
          </div>
        </div>
        <p className="watch-rate">
          視聴率：<strong>{Math.floor(progress * 100)}%</strong>（100%で視聴完了となります）
        </p>
      </div>

      {phase === 'quiz' && (
        <Modal title="確認テスト（視聴を続けるには回答が必要です）">
          <p>
            Q. 社長が<strong>「何より大切にしている」</strong>と話していたものはどれですか？
          </p>
          <div className="option-list">
            {QUIZ_OPTIONS.map((o) => (
              <button key={o} className="btn btn-option" onClick={() => answerQuiz(o)}>
                {o}
              </button>
            ))}
          </div>
          <p className="tiny-note">※不正解の場合、10分前から再視聴となります。</p>
        </Modal>
      )}

      {phase === 'error' && (
        <Modal title="エラー" tone="error">
          <p>
            通信エラーが発生しました。（エラーコード：ERR_VIEW_0099）
            <br />
            視聴完了が確認できませんでした。再試行してください。
          </p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                setRetried(true);
                setPhase('sending');
              }}
            >
              再試行
            </button>
          </div>
        </Modal>
      )}

      {phase === 'survey' && (
        <Modal title="視聴完了アンケート（必須）">
          <p>視聴お疲れさまでした。アンケートへの回答をもって視聴完了となります。</p>
          <p className="q-label">Q1. 本説明会の満足度をお聞かせください</p>
          <div className="radio-row">
            {['大変満足', '満足', 'ふつう', '不満', '大変不満'].map((s) => (
              <label key={s} className="check">
                <input type="radio" name="sat" checked={satisfaction === s} onChange={() => setSatisfaction(s)} />
                {s}
              </label>
            ))}
          </div>
          {surveyError && <p className="field-error">満足度を選択してください。</p>}
          <p className="tiny-note">※回答内容は選考には一切影響しません（たぶん）。</p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!satisfaction) {
                  setSurveyError(true);
                  return;
                }
                if (satisfaction === '不満' || satisfaction === '大変不満') {
                  toast('貴重なご意見ありがとうございます（人事部に共有されました）', 'warn');
                  addStress(3, '正直にアンケートに答えてしまった');
                }
                complete('seminar');
                toast('説明会の視聴が完了しました');
                go('dashboard');
              }}
            >
              回答して視聴を完了する
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
