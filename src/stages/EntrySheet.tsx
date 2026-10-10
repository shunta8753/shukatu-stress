import { useEffect, useState } from 'react';
import { useGame } from '../game/GameContext';
import { ES_TEMPLATES, countChars } from '../game/esTemplates';
import Modal from '../components/Modal';

const QUESTIONS = [
  { title: '学生時代に最も力を入れて取り組んだことを教えてください。', min: 400, max: 500 },
  { title: 'あなたの強みと、それを当社でどのように活かせるかを教えてください。', min: 270, max: 400 },
  { title: '数ある企業の中で、当社でなければならない理由を教えてください。', min: 150, max: 300 },
];

const SESSION_SECONDS = 180;

function checkAnswer(text: string, q: (typeof QUESTIONS)[number]): string | null {
  const n = countChars(text);
  if (!text.trim()) return '入力してください。';
  if (/[①-⑳㈱㈲№㍉㌔]/.test(text)) return '機種依存文字（①、②など）は使用できません。';
  if (/\p{Extended_Pictographic}/u.test(text)) return '絵文字は使用できません。';
  if (/御社/.test(text)) return '書き言葉では「御社」ではなく「貴社」を使用してください。';
  if (n < q.min) return `${q.min}文字以上で入力してください。（現在${n}文字）`;
  if (n > q.max) return `${q.max}文字以内で入力してください。（現在${n}文字）`;
  return null;
}

export default function EntrySheet() {
  const { go, complete, addStress, addChars, toast } = useGame();
  const [answers, setAnswers] = useState(['', '', '']);
  const [errors, setErrors] = useState<(string | null)[]>([null, null, null]);
  const [remain, setRemain] = useState(SESSION_SECONDS);
  const [expired, setExpired] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (expired || confirming) return;
    const t = window.setInterval(() => setRemain((r) => r - 1), 1000);
    return () => window.clearInterval(t);
  }, [expired, confirming]);

  useEffect(() => {
    if (remain <= 0 && !expired) {
      setExpired(true);
      addStress(12, 'セッション切れでES全消去', true);
    }
  }, [remain, expired, addStress]);

  const update = (i: number, v: string) => setAnswers((a) => a.map((x, j) => (j === i ? v : x)));

  const applyTemplate = (i: number) => {
    update(i, ES_TEMPLATES[i]);
    toast('例文を挿入しました（※同じ例文を使用している応募者：18,402人）');
  };

  const tempSave = () => {
    setRemain(SESSION_SECONDS);
    if (answers[2]) {
      update(2, '');
      addStress(6, '一時保存したら設問3が消えた');
    }
    toast('一時保存しました（※設問3は一時保存の対象外です）', 'warn');
  };

  const submit = () => {
    const errs = QUESTIONS.map((q, i) => checkAnswer(answers[i], q));
    setErrors(errs);
    if (errs.some(Boolean)) {
      addStress(4, 'ESの入力エラー', true);
      toast('入力内容にエラーがあります。各設問をご確認ください。', 'error');
      return;
    }
    setConfirming(true);
  };

  const mm = String(Math.max(Math.floor(remain / 60), 0)).padStart(2, '0');
  const ss = String(Math.max(remain % 60, 0)).padStart(2, '0');

  return (
    <div className="page">
      <p className="breadcrumb">マイページ ＞ 東都インテグレート 採用マイページ ＞ エントリーシート</p>
      <div className="warn-banner">⚠ ブラウザの「戻る」ボタンは使用しないでください。入力内容が失われる場合があります。</div>

      <div className={`session-timer ${remain <= 30 ? 'danger' : ''}`}>
        セッション有効期限：残り <strong>{mm}:{ss}</strong>
        <span className="tiny-note">（一時保存すると延長されます）</span>
      </div>

      <div className="card">
        <h1 className="page-title">エントリーシート（総合職・オープンコース）</h1>
        <ul className="es-rules">
          <li>改行は2文字としてカウントされます。</li>
          <li>機種依存文字・絵文字・半角カナは使用できません。</li>
          <li>提出後の修正はできません。</li>
        </ul>

        {QUESTIONS.map((q, i) => {
          const n = countChars(answers[i]);
          const bad = n > 0 && (n < q.min || n > q.max);
          return (
            <div className="es-q" key={i}>
              <p className="es-title">
                設問{i + 1}<span className="req">必須</span>
                {q.title}（{q.min}文字以上{q.max}文字以内）
              </p>
              <textarea
                value={answers[i]}
                onChange={(e) => update(i, e.target.value)}
                rows={8}
                placeholder="ここに入力してください"
              />
              <div className="es-foot">
                <button className="link" onClick={() => applyTemplate(i)}>
                  📄 例文を使用する
                </button>
                <span className={`char-count ${bad ? 'bad' : ''}`}>
                  {n} / {q.max}文字
                </span>
              </div>
              {errors[i] && <p className="field-error">{errors[i]}</p>}
            </div>
          );
        })}

        <div className="btn-row">
          <button className="btn btn-secondary" onClick={tempSave}>
            一時保存
          </button>
          <button className="btn btn-primary" onClick={submit}>
            確認して提出する
          </button>
        </div>
      </div>

      {expired && (
        <Modal title="セッションの有効期限切れ" tone="error">
          <p>
            一定時間操作がなかったため、セッションの有効期限が切れました。
            <br />
            <strong>入力内容は保存されていません。</strong>
          </p>
          <p className="tiny-note">※タイピング中も「操作」には含まれません。</p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                setAnswers(['', '', '']);
                setErrors([null, null, null]);
                setRemain(SESSION_SECONDS);
                setExpired(false);
              }}
            >
              再度ログインする
            </button>
          </div>
        </Modal>
      )}

      {confirming && (
        <Modal title="提出の確認" onClose={() => setConfirming(false)}>
          <p>
            提出後は<strong>一切の修正ができません</strong>。本当に提出しますか？
          </p>
          <p className="tiny-note">※誤字脱字は選考に影響する場合があります。※提出前に3回見直すことを推奨します。</p>
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={() => setConfirming(false)}>
              見直す
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                addChars(answers.reduce((s, a) => s + countChars(a), 0));
                complete('es');
                toast('エントリーシートを提出しました');
                go('dashboard');
              }}
            >
              提出する
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
