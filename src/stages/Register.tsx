import { useState } from 'react';
import { useGame } from '../game/GameContext';
import { validateKana, validateName } from '../game/validators';
import type { Persona } from '../game/personas';
import PersonaPicker from '../components/PersonaPicker';

const UNIVERSITIES = [
  '青葉大学', '青葉学院大学', '桜ヶ丘大学', '緑川大学', '東都大学', '東都学院大学', '東都工科大学',
  '東都国際大学', '東都文理大学', '西都大学', '北都大学', '南都学院大学', '港南大学', '山手大学',
  '城北大学', '城南大学', '城西大学', '城東大学', '中央学園大学', '新都市大学',
];

const PW_RULES = [
  { hint: '8文字以上', test: (p: string) => p.length >= 8, msg: 'パスワードは8文字以上で入力してください。' },
  {
    hint: '英大文字・英小文字・数字をすべて含む',
    test: (p: string) => /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p),
    msg: 'パスワードには英大文字・英小文字・数字をすべて含めてください。',
  },
  {
    hint: '記号（# $ % &）を1文字以上含む',
    test: (p: string) => /[#$%&]/.test(p),
    msg: 'パスワードには記号を1文字以上含めてください。',
  },
  {
    hint: '使用可能な記号は # $ % & のみ',
    test: (p: string) => /^[A-Za-z0-9#$%&]+$/.test(p),
    msg: 'パスワードに使用できない文字が含まれています（使用可能な記号：# $ % &）。',
  },
];

const OPT_INS = [
  'まいにちナビからのお知らせメール（毎日配信）を受け取る',
  'まいにちナビ提携企業からのスカウトを受け取る',
  '提携企業からのお電話でのご案内を受け取る（平日・土日祝 8:00〜22:00）',
  'パートナー企業（約3,800社）への登録情報の提供に同意する',
  'おすすめ企業の説明会に自動で予約する',
];

type Phase = 'form' | 'confirm' | 'mail';

export default function Register() {
  const { state, go, addStress, setName, setMeta, toast } = useGame();
  const [phase, setPhase] = useState<Phase>('form');
  const [f, setF] = useState({ name: '', kana: '', tel: '', email: '', email2: '', password: '' });
  const [univQuery, setUnivQuery] = useState('');
  const [univ, setUniv] = useState('');
  const [univOther, setUnivOther] = useState(false);
  const [agree, setAgree] = useState(false);
  const [optIns, setOptIns] = useState(OPT_INS.map(() => true));
  const [error, setError] = useState<string | null>(null);
  const [pwRevealed, setPwRevealed] = useState(0);

  const quickFill = (p: Persona) => {
    setF({ name: p.name, kana: p.kana, tel: p.tel, email: p.email, email2: p.email, password: p.password });
    setUniv(p.univ);
    setUnivOther(p.univOther);
    setUnivQuery('');
    setAgree(true);
    setOptIns(OPT_INS.map(() => true));
    setError(null);
    setMeta('persona', p.id);
    toast(`「${p.label}」の内容を入力しました（※お知らせ配信はすべて「受け取る」になっています）`);
  };

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const univMatches = univQuery.trim()
    ? UNIVERSITIES.filter((u) => u.includes(univQuery.trim()) && u !== univ).slice(0, 6)
    : [];

  const validate = (): string | null => {
    const n = validateName(f.name);
    if (n) return n;
    const k = validateKana(f.kana);
    if (k) return k;
    if (!univ.trim()) return '学校名を選択してください。一覧にない場合は「その他」を選択し、正式名称を入力してください。';
    if (!f.tel) return '電話番号を入力してください。';
    if (/[-ー－‐]/.test(f.tel)) return '電話番号はハイフンなしで入力してください。';
    if (/[０-９]/.test(f.tel)) return '電話番号は半角数字で入力してください。';
    if (!/^\d{10,11}$/.test(f.tel)) return '電話番号は10桁または11桁の半角数字で入力してください。';
    if (!f.email) return 'メールアドレスを入力してください。';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return 'メールアドレスの形式が正しくありません。';
    if (f.email !== f.email2) return 'メールアドレス（確認用）が一致しません。';
    for (let i = 0; i < PW_RULES.length; i++) {
      if (!PW_RULES[i].test(f.password)) {
        setPwRevealed((r) => Math.max(r, i + 1));
        return PW_RULES[i].msg;
      }
    }
    if (!agree) return '利用規約（全38条）および個人情報の取り扱いに同意してください。';
    return null;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (err) {
      setError(err);
      addStress(3, '会員登録の入力エラー', true);
      return;
    }
    setError(null);
    setPhase('confirm');
  };

  if (phase === 'mail') {
    return (
      <div className="page narrow">
        <div className="card center">
          <h1 className="page-title">仮登録が完了しました</h1>
          <p>
            ご登録のメールアドレス（{f.email}）宛に<strong>本登録用URL</strong>をお送りしました。
            <br />
            メールに記載のURLから本登録を完了してください。
          </p>
          <p className="tiny-note">
            ※URLの有効期限は30分です。※メールが届かない場合は迷惑メールフォルダをご確認ください。
            ※それでも届かない場合は、最初からやり直してください。
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              setName(f.name);
              addStress(2, 'まさかの本登録メール');
              toast('本登録が完了しました。ようこそ、まいにちナビ2028へ！');
              go('dashboard');
            }}
          >
            メール内のURLをクリックする（したことにする）
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'confirm') {
    return (
      <div className="page narrow">
        <div className="steps">
          <span>1. 情報入力</span>
          <span className="on">2. 入力内容の確認</span>
          <span>3. 仮登録完了</span>
        </div>
        <div className="card">
          <h1 className="page-title">入力内容の確認</h1>
          <table className="confirm-table">
            <tbody>
              <tr><th>氏名</th><td>{f.name}</td></tr>
              <tr><th>フリガナ</th><td>{f.kana}</td></tr>
              <tr><th>学校名</th><td>{univ}</td></tr>
              <tr><th>電話番号</th><td>{f.tel}</td></tr>
              <tr><th>メールアドレス</th><td>{f.email}</td></tr>
              <tr><th>パスワード</th><td>{'●'.repeat(f.password.length)}</td></tr>
              <tr>
                <th>お知らせ設定</th>
                <td>{optIns.filter(Boolean).length}件の配信を希望する</td>
              </tr>
            </tbody>
          </table>
          <div className="btn-row">
            <button className="btn btn-secondary" onClick={() => setPhase('form')}>
              修正する
            </button>
            <button className="btn btn-primary" onClick={() => setPhase('mail')}>
              登録する
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <div className="hero-register">
        <p className="hero-sub">2028年3月卒業予定の方へ</p>
        <h1>まいにちナビ2028 会員登録</h1>
        <p>登録はカンタン3分！あなたの就活をまいにち応援します。</p>
      </div>
      <div className="steps">
        <span className="on">1. 情報入力</span>
        <span>2. 入力内容の確認</span>
        <span>3. 仮登録完了</span>
      </div>

      <PersonaPicker
        title="かんたん入力：キャラを選ぶとワンクリックで全項目が入力されます"
        note="※入力後、下の「入力内容を確認する」を押してください。自分で入力することもできます（おすすめしません）。"
        selected={state.meta.persona}
        onPick={quickFill}
      />

      {error && (
        <div className="error-box" role="alert">
          <strong>入力内容に誤りがあります。</strong>
          <p>{error}</p>
        </div>
      )}

      <form className="card form" onSubmit={submit} noValidate>
        <div className="form-row">
          <label>
            氏名<span className="req">必須</span>
          </label>
          <input value={f.name} onChange={set('name')} placeholder="例）就活　太郎" autoComplete="off" />
          <p className="help">姓と名の間に全角スペースを入れてください</p>
        </div>
        <div className="form-row">
          <label>
            フリガナ<span className="req">必須</span>
          </label>
          <input value={f.kana} onChange={set('kana')} placeholder="例）シュウカツ　タロウ" autoComplete="off" />
          <p className="help">全角カタカナ</p>
        </div>
        <div className="form-row">
          <label>
            学校名<span className="req">必須</span>
          </label>
          {univ && !univOther ? (
            <div className="selected-univ">
              {univ}
              <button
                type="button"
                className="link"
                onClick={() => {
                  setUniv('');
                  setUnivQuery('');
                }}
              >
                変更
              </button>
            </div>
          ) : univOther ? (
            <>
              <input value={univ} onChange={(e) => setUniv(e.target.value)} placeholder="学校名を正式名称で入力（例：〇〇大学）" />
              <button type="button" className="link" onClick={() => { setUnivOther(false); setUniv(''); }}>
                一覧から選択し直す
              </button>
            </>
          ) : (
            <>
              <input value={univQuery} onChange={(e) => setUnivQuery(e.target.value)} placeholder="学校名で検索" />
              {univQuery.trim() && (
                <ul className="suggest">
                  {univMatches.length === 0 && <li className="suggest-empty">該当する学校が見つかりません</li>}
                  {univMatches.map((u) => (
                    <li key={u}>
                      <button type="button" onClick={() => setUniv(u)}>
                        {u}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setUnivOther(true);
                        setUniv('');
                        addStress(1, '自分の大学が検索に出てこない');
                      }}
                    >
                      その他（一覧にない場合はこちら）
                    </button>
                  </li>
                </ul>
              )}
            </>
          )}
        </div>
        <div className="form-row">
          <label>
            電話番号<span className="req">必須</span>
          </label>
          <input value={f.tel} onChange={set('tel')} placeholder="例）09012345678" inputMode="numeric" />
          <p className="help">半角数字・ハイフンなし</p>
        </div>
        <div className="form-row">
          <label>
            メールアドレス<span className="req">必須</span>
          </label>
          <input value={f.email} onChange={set('email')} placeholder="例）shukatsu@example.com" type="email" />
          <p className="help">携帯キャリアのアドレスはメールが届かない場合があります</p>
        </div>
        <div className="form-row">
          <label>
            メールアドレス（確認用）<span className="req">必須</span>
          </label>
          <input
            value={f.email2}
            onChange={set('email2')}
            type="email"
            onPaste={(e) => {
              e.preventDefault();
              toast('確認用メールアドレスは貼り付けできません。手入力してください。', 'warn');
              addStress(2, '確認用メールアドレスの貼り付け禁止');
            }}
          />
        </div>
        <div className="form-row">
          <label>
            パスワード<span className="req">必須</span>
          </label>
          <input value={f.password} onChange={set('password')} type="password" autoComplete="new-password" />
          <p className="help">
            半角英数字
            {PW_RULES.slice(0, pwRevealed).map((r) => (
              <span key={r.hint} className="pw-rule">／{r.hint}</span>
            ))}
          </p>
        </div>

        <div className="form-row">
          <label>お知らせ設定</label>
          <div className="checks">
            {OPT_INS.map((o, i) => (
              <label key={o} className="check">
                <input
                  type="checkbox"
                  checked={optIns[i]}
                  onChange={() => setOptIns((arr) => arr.map((v, j) => (j === i ? !v : v)))}
                />
                {o}
              </label>
            ))}
          </div>
        </div>

        <div className="terms">
          <label className="check">
            <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
            <span>
              <span className="link-like">利用規約（全38条）</span>および
              <span className="link-like">個人情報の取り扱い</span>に同意する
            </span>
          </label>
        </div>

        <button className="btn btn-primary btn-lg btn-block" type="submit">
          入力内容を確認する
        </button>
      </form>
    </div>
  );
}
