import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type Screen =
  | 'register'
  | 'dashboard'
  | 'entry'
  | 'seminar'
  | 'es'
  | 'webtest'
  | 'booking'
  | 'interview'
  | 'waiting'
  | 'oinori'
  | 'result';

export type TaskId = 'entry' | 'seminar' | 'es' | 'webtest' | 'booking' | 'interview';

export const TASKS: { id: TaskId; title: string; desc: string; deadline: string }[] = [
  { id: 'entry', title: '本選考にエントリーする', desc: '東都インテグレート株式会社', deadline: '本日 23:59' },
  { id: 'seminar', title: '会社説明会（動画）を視聴する', desc: '視聴必須・約45分', deadline: '本日 23:59' },
  { id: 'es', title: 'エントリーシートを提出する', desc: '設問3問', deadline: '本日 12:00' },
  { id: 'webtest', title: 'Webテストを受検する', desc: '能力検査・性格検査', deadline: '本日 23:59' },
  { id: 'booking', title: '一次面接を予約する', desc: '先着順', deadline: '枠が埋まり次第終了' },
  { id: 'interview', title: '一次面接を受ける', desc: 'オンライン', deadline: '予約日時' },
];

export interface StressEvent {
  label: string;
  amount: number;
}

interface State {
  screen: Screen;
  done: TaskId[];
  stress: number;
  events: StressEvent[];
  errors: number;
  chars: number;
  startedAt: number;
  finishedAt: number | null;
  userName: string;
  flags: Record<string, boolean>;
  meta: Record<string, string>;
}

type Action =
  | { type: 'go'; screen: Screen }
  | { type: 'complete'; task: TaskId }
  | { type: 'stress'; amount: number; label: string; error: boolean }
  | { type: 'chars'; n: number }
  | { type: 'setName'; name: string }
  | { type: 'flag'; key: string }
  | { type: 'meta'; key: string; value: string }
  | { type: 'finish' }
  | { type: 'reset' };

const initialState = (): State => ({
  screen: 'register',
  done: [],
  stress: 0,
  events: [],
  errors: 0,
  chars: 0,
  startedAt: Date.now(),
  finishedAt: null,
  userName: '',
  flags: {},
  meta: {},
});

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'go':
      return { ...state, screen: action.screen };
    case 'complete':
      return state.done.includes(action.task) ? state : { ...state, done: [...state.done, action.task] };
    case 'stress':
      return {
        ...state,
        stress: state.stress + action.amount,
        events: [...state.events, { label: action.label, amount: action.amount }],
        errors: state.errors + (action.error ? 1 : 0),
      };
    case 'chars':
      return { ...state, chars: state.chars + action.n };
    case 'setName':
      return { ...state, userName: action.name };
    case 'flag':
      return { ...state, flags: { ...state.flags, [action.key]: true } };
    case 'meta':
      return { ...state, meta: { ...state.meta, [action.key]: action.value } };
    case 'finish':
      return state.finishedAt ? state : { ...state, finishedAt: Date.now() };
    case 'reset':
      return initialState();
  }
}

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'warn' | 'error';
}

interface GameApi {
  state: State;
  unread: number;
  toasts: Toast[];
  go: (screen: Screen) => void;
  complete: (task: TaskId) => void;
  addStress: (amount: number, label: string, error?: boolean) => void;
  addChars: (n: number) => void;
  setName: (name: string) => void;
  setFlag: (key: string) => void;
  setMeta: (key: string, value: string) => void;
  finish: () => void;
  reset: () => void;
  toast: (text: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;
}

const GameContext = createContext<GameApi | null>(null);

const AMBIENT_TOASTS = [
  '【本日締切】早期選考エントリー受付中！あと3時間',
  'あなたにぴったりの企業が1,284社見つかりました',
  '【重要】プロフィールの入力率が62%です。今すぐ入力しましょう',
  '28卒の先輩の87%が3月中に50社以上エントリーしています',
  '【スカウト】あなたのプロフィールを拝見しました（他3,412名にも送信）',
  '【本日締切】まだ間に合う！冬のインターン追加募集',
  'エントリーシートの平均提出数は24社です。あなたは0社です',
];

// 非プレイ画面ではアンビエント演出を止める
const QUIET_SCREENS: Screen[] = ['register', 'oinori', 'result', 'interview'];

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [unread, setUnread] = useState(3);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (text: string, kind: Toast['kind'] = 'info') => {
      const id = nextId.current++;
      setToasts((ts) => [...ts.slice(-3), { id, text, kind }]);
      window.setTimeout(() => dismissToast(id), 4200);
    },
    [dismissToast],
  );

  const quiet = QUIET_SCREENS.includes(state.screen);

  // 未読メッセージが勝手に増えていく
  useEffect(() => {
    if (quiet) return;
    const t = window.setInterval(() => setUnread((u) => u + 1 + Math.floor(Math.random() * 6)), 3500);
    return () => window.clearInterval(t);
  }, [quiet]);

  // 定期的に煽り通知
  useEffect(() => {
    if (quiet) return;
    const t = window.setInterval(() => {
      toast(AMBIENT_TOASTS[Math.floor(Math.random() * AMBIENT_TOASTS.length)], 'info');
    }, 22000);
    return () => window.clearInterval(t);
  }, [quiet, toast]);

  // アクションは参照を固定しておく（タイマー系の useEffect が再実行されないように）
  const actions = useMemo<Omit<GameApi, 'state' | 'unread' | 'toasts'>>(
    () => ({
      go: (screen) => {
        dispatch({ type: 'go', screen });
        window.scrollTo({ top: 0 });
      },
      complete: (task) => dispatch({ type: 'complete', task }),
      addStress: (amount, label, error = false) => dispatch({ type: 'stress', amount, label, error }),
      addChars: (n) => dispatch({ type: 'chars', n }),
      setName: (name) => dispatch({ type: 'setName', name }),
      setFlag: (key) => dispatch({ type: 'flag', key }),
      setMeta: (key, value) => dispatch({ type: 'meta', key, value }),
      finish: () => dispatch({ type: 'finish' }),
      reset: () => {
        dispatch({ type: 'reset' });
        setUnread(3);
        window.scrollTo({ top: 0 });
      },
      toast,
      dismissToast,
    }),
    [toast, dismissToast],
  );

  const api = useMemo<GameApi>(() => ({ ...actions, state, unread, toasts }), [actions, state, unread, toasts]);

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

/** 2027年3月1日（就活解禁）からの経過日数を日付文字列に */
export function virtualDate(offsetDays: number): string {
  const d = new Date(2027, 2, 1 + offsetDays);
  const w = '日月火水木金土'[d.getDay()];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日(${w})`;
}

export function shortDate(offsetDays: number): string {
  const d = new Date(2027, 2, 1 + offsetDays);
  const w = '日月火水木金土'[d.getDay()];
  return `${d.getMonth() + 1}/${d.getDate()}(${w})`;
}

/** 進捗に応じた仮想日付のオフセット */
export const DATE_OFFSETS = [0, 6, 13, 20, 27, 33, 40];
