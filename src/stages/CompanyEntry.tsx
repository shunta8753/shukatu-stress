import { useState } from 'react';
import { useGame } from '../game/GameContext';
import { validateKana, validateName } from '../game/validators';
import Modal from '../components/Modal';

type Status = 'open' | 'closed' | 'limited' | 'soon';
interface Course {
  name: string;
  status: Status;
  note: string;
  tags: string[];
}

const COURSES: Course[] = [
  { name: '総合職（事務系）〔本選考〕', status: 'closed', note: '受付終了（2/28締切）', tags: ['文系'] },
  { name: '総合職（技術系）〔本選考〕', status: 'limited', note: '5days実践型インターンシップ参加者限定', tags: ['理系'] },
  { name: 'エリア総合職（関東）', status: 'soon', note: '3月下旬公開予定', tags: ['文系', '理系'] },
  { name: 'エリア総合職（関西）', status: 'soon', note: '公開時期未定', tags: ['文系', '理系'] },
  { name: 'グローバルビジネスコース', status: 'limited', note: 'TOEIC 900点以上の方限定', tags: ['文系'] },
  { name: 'デジタルイノベーションコース', status: 'limited', note: '冬季インターン参加者限定', tags: ['理系'] },
  { name: 'DX推進コース', status: 'closed', note: '早期選考にて募集終了', tags: ['文系', '理系'] },
  { name: 'DX推進コース（デジタル枠）', status: 'closed', note: '早期選考にて募集終了', tags: ['理系'] },
  { name: 'データサイエンティストコース', status: 'limited', note: '研究室推薦の方のみ', tags: ['理系'] },
  { name: 'ビジネスプロデューサーコース', status: 'limited', note: 'リクルーター面談経由の方のみ', tags: ['文系'] },
  { name: '戦略企画コース', status: 'closed', note: '採用予定数：若干名（0名の可能性があります）', tags: ['文系'] },
  { name: '共創デザインコース', status: 'soon', note: '4月上旬公開予定', tags: ['文系', '理系'] },
  { name: '未来共創フロンティアコース', status: 'limited', note: 'コース内容・勤務地・職種は入社後に決定します', tags: ['文系', '理系'] },
  { name: '総合職（オープンコース）〔本選考〕', status: 'open', note: '受付中', tags: ['文系', '理系'] },
  { name: '総合職（オープンコース）〔本選考〕（第2クール）', status: 'soon', note: '第1クールの結果次第で公開', tags: ['文系', '理系'] },
];

const INTERNS = [
  ['1day仕事体験（オンライン）', '満席'],
  ['1day仕事体験（対面・本社）', '満席'],
  ['1day仕事体験（オンライン・対面ハイブリッド）', '満席'],
  ['3daysワークショップ「DXで未来を共創する」', '受付終了'],
  ['5days実践型インターンシップ【早期選考直結※】', '受付終了（※直結するとは限りません）'],
  ['Winter Internship 2027', '受付終了'],
  ['Winter Internship 2027（追加開催）', '受付終了'],
  ['Spring Internship 2027', 'キャンセル待ち 412人'],
  ['オープン・カンパニー（業界研究セミナー）', '満席'],
  ['社員座談会（若手社員編）', '満席'],
  ['社員座談会（若手社員編・第2弾）', '満席'],
  ['内定者とカジュアルに話そう！（選考には一切関係ありません）', '満席'],
];

const STATUS_LABEL: Record<Status, string> = { open: '受付中', closed: '受付終了', limited: '対象者限定', soon: '公開前' };

const YEARS = Array.from({ length: 71 }, (_, i) => 1940 + i);

type Flow = null | 'pre' | 'mypage' | 'issued';

export default function CompanyEntry() {
  const { go, complete, addStress, toast } = useGame();
  const [tab, setTab] = useState<'course' | 'intern'>('course');
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [flow, setFlow] = useState<Flow>(null);
  const [form, setForm] = useState({ name: '', kana: '', year: '', month: '', day: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const courses = onlyOpen ? COURSES.filter((c) => c.status === 'open') : COURSES;

  const clickBlocked = (c: Course) => {
    toast(`このコースはエントリーできません（${c.note}）`, 'warn');
    addStress(1, 'エントリーできないコース');
  };

  const submitMypage = () => {
    const err =
      validateName(form.name) ??
      validateKana(form.kana) ??
      (!form.year || !form.month || !form.day ? '生年月日を選択してください。' : null);
    if (err) {
      setFormError(err);
      addStress(3, '企業マイページの入力エラー', true);
      return;
    }
    setFlow('issued');
  };

  return (
    <div className="page">
      <p className="breadcrumb">マイページ ＞ 企業を探す ＞ 東都インテグレート株式会社</p>

      <div className="company-head card">
        <div className="company-logo">TI</div>
        <div>
          <p className="company-industry">情報・通信／コンサルティング／商社（総合）／メーカー</p>
          <h1 className="company-name">東都インテグレート株式会社</h1>
          <p className="company-catch">人と技術で、未来を共創する。</p>
        </div>
        <ul className="company-meta">
          <li>本社：東京都</li>
          <li>従業員数：12,480名（連結）</li>
          <li>採用予定数：若干名〜100名</li>
        </ul>
      </div>

      <div className="tabs">
        <button className={tab === 'course' ? 'on' : ''} onClick={() => setTab('course')}>
          募集コース（{COURSES.length}）
        </button>
        <button className={tab === 'intern' ? 'on' : ''} onClick={() => setTab('intern')}>
          インターン・仕事体験（{INTERNS.length}）
        </button>
        <button onClick={() => toast('説明会はすべて満席です', 'warn')}>説明会（0）</button>
      </div>

      {tab === 'course' ? (
        <div className="card">
          <div className="filter-row">
            <label className="check">
              <input type="checkbox" checked={onlyOpen} onChange={() => setOnlyOpen(!onlyOpen)} />
              受付中のコースのみ表示
            </label>
            <span className="tiny-note">該当：{courses.length}件</span>
          </div>
          <ul className="course-list">
            {courses.map((c) => (
              <li key={c.name} className={`course ${c.status}`}>
                <div>
                  <span className={`course-status ${c.status}`}>{STATUS_LABEL[c.status]}</span>
                  <span className="course-tags">{c.tags.join('・')}</span>
                  <p className="course-name">{c.name}</p>
                  <p className="course-note">{c.note}</p>
                </div>
                {c.status === 'open' ? (
                  <button className="btn btn-entry" onClick={() => setFlow('pre')}>
                    エントリー
                  </button>
                ) : (
                  <button className="btn btn-disabled" onClick={() => clickBlocked(c)}>
                    エントリー不可
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card">
          <ul className="course-list">
            {INTERNS.map(([name, st]) => (
              <li key={name} className="course closed">
                <div>
                  <span className="course-status closed">{st.startsWith('キャンセル') ? 'キャンセル待ち' : '受付終了'}</span>
                  <p className="course-name">{name}</p>
                  <p className="course-note">{st}</p>
                </div>
                <button
                  className="btn btn-disabled"
                  onClick={() => {
                    toast('このプログラムは受付を終了しました', 'warn');
                    addStress(1, '全部埋まっているインターン');
                  }}
                >
                  受付終了
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {flow === 'pre' && (
        <Modal title="エントリーの前に" onClose={() => setFlow(null)}>
          <p>
            本コースへのエントリーには、事前に<strong>プレエントリー</strong>が必要です。
          </p>
          <p className="tiny-note">※プレエントリーとエントリーは異なります。※エントリーはまだ完了していません。</p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                addStress(2, 'プレエントリーとエントリーの違いが分からない');
                setFlow('mypage');
              }}
            >
              プレエントリーする
            </button>
          </div>
        </Modal>
      )}

      {flow === 'mypage' && (
        <Modal title="東都インテグレート 採用マイページ 新規登録" onClose={() => setFlow(null)}>
          <p className="notice">
            エントリーには<strong>企業独自の採用マイページ</strong>への登録が必要です。
            <br />
            <span className="tiny-note">※まいにちナビのご登録情報は引き継がれません。お手数ですが再度ご入力ください。</span>
          </p>
          {formError && <div className="error-box small">{formError}</div>}
          <div className="form compact">
            <div className="form-row">
              <label>
                氏名<span className="req">必須</span>
              </label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例）就活　太郎" />
            </div>
            <div className="form-row">
              <label>
                フリガナ<span className="req">必須</span>
              </label>
              <input value={form.kana} onChange={(e) => setForm({ ...form, kana: e.target.value })} placeholder="例）シュウカツ　タロウ" />
            </div>
            <div className="form-row">
              <label>
                生年月日<span className="req">必須</span>
              </label>
              <div className="birth">
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                  <option value="">----</option>
                  {YEARS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
                年
                <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
                  <option value="">--</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i}>{i + 1}</option>
                  ))}
                </select>
                月
                <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                  <option value="">--</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i}>{i + 1}</option>
                  ))}
                </select>
                日
              </div>
            </div>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={submitMypage}>
              登録してエントリーへ進む
            </button>
          </div>
        </Modal>
      )}

      {flow === 'issued' && (
        <Modal title="採用マイページ登録完了">
          <p>採用マイページへの登録が完了しました。</p>
          <table className="confirm-table">
            <tbody>
              <tr><th>採用マイページID</th><td>TI28-00419827-A</td></tr>
              <tr><th>初期パスワード</th><td>後日<strong>郵送</strong>にてお送りします</td></tr>
            </tbody>
          </table>
          <p className="tiny-note">※IDは再発行できません。必ずお控えください。（画面のスクリーンショットは禁止されています）</p>
          <div className="btn-row">
            <button
              className="btn btn-entry"
              onClick={() => {
                complete('entry');
                addStress(2, '企業ごとにマイページ登録');
                toast('エントリーが完了しました（あなたのエントリー数：1社／28卒平均：32.4社）');
                go('dashboard');
              }}
            >
              エントリーを完了する
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
