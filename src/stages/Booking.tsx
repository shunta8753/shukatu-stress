import { useEffect, useMemo, useState } from 'react';
import { shortDate, useGame } from '../game/GameContext';
import Modal from '../components/Modal';

const DAY_OFFSETS = [34, 35, 36, 37, 38, 39, 40];
const BASE_TIMES = ['9:00', '10:30', '13:00', '14:30', '16:00', '17:30'];
const EXTRA_TIME = '7:30';

type Slot = 'open' | 'full' | 'none';

const isSunday = (offset: number) => new Date(2027, 2, 1 + offset).getDay() === 0;

function initialSlots(): Record<string, Slot> {
  const s: Record<string, Slot> = {};
  for (const d of DAY_OFFSETS) {
    for (const t of BASE_TIMES) {
      s[`${d}-${t}`] = isSunday(d) ? 'none' : Math.random() < 0.22 ? 'open' : 'full';
    }
  }
  // 最低6枠は空けておく
  const keys = Object.keys(s).filter((k) => s[k] === 'full');
  while (Object.values(s).filter((v) => v === 'open').length < 6 && keys.length) {
    s[keys.splice(Math.floor(Math.random() * keys.length), 1)[0]] = 'open';
  }
  return s;
}

export default function Booking() {
  const { go, complete, addStress, toast, setMeta } = useGame();
  const [slots, setSlots] = useState(initialSlots);
  const [times, setTimes] = useState(BASE_TIMES);
  const [attempts, setAttempts] = useState(0);
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [waitNo, setWaitNo] = useState(128);

  const openCount = useMemo(() => Object.values(slots).filter((v) => v === 'open').length, [slots]);

  // 目の前で枠が埋まっていく
  useEffect(() => {
    if (pending || confirmed || failed) return;
    const t = window.setInterval(() => {
      setSlots((s) => {
        const open = Object.keys(s).filter((k) => s[k] === 'open');
        if (!open.length) return s;
        const k = open[Math.floor(Math.random() * open.length)];
        return { ...s, [k]: 'full' };
      });
    }, attempts >= 2 ? 3200 : 1600);
    return () => window.clearInterval(t);
  }, [pending, confirmed, failed, attempts]);

  const label = (key: string) => {
    const [d, t] = key.split('-');
    return `${shortDate(Number(d))} ${t}〜`;
  };

  const pick = (key: string) => {
    if (pending) return;
    setPending(key);
    window.setTimeout(() => {
      setPending(null);
      if (attempts < 2) {
        setSlots((s) => ({ ...s, [key]: 'full' }));
        setAttempts((a) => a + 1);
        setFailed(true);
        addStress(6, '押した面接枠が「他の方が予約済み」', true);
      } else {
        setConfirmed(key);
      }
    }, 1300);
  };

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      if (attempts >= 2 && !times.includes(EXTRA_TIME)) {
        setTimes([EXTRA_TIME, ...BASE_TIMES]);
        setSlots((s) => {
          const next = { ...s };
          for (const d of DAY_OFFSETS) next[`${d}-${EXTRA_TIME}`] = isSunday(d) ? 'none' : 'full';
          next[`${DAY_OFFSETS[1]}-${EXTRA_TIME}`] = 'open';
          next[`${DAY_OFFSETS[4]}-${EXTRA_TIME}`] = 'open';
          return next;
        });
        toast('追加枠を公開しました（早朝枠）');
      } else {
        setSlots((s) => {
          const full = Object.keys(s).filter((k) => s[k] === 'full');
          const next = { ...s };
          for (let i = 0; i < 2 && full.length; i++) {
            next[full.splice(Math.floor(Math.random() * full.length), 1)[0]] = 'open';
          }
          return next;
        });
        toast('キャンセルにより空き枠が発生しました');
      }
      addStress(1, '面接枠のF5連打');
    }, 900);
  };

  return (
    <div className="page">
      <p className="breadcrumb">マイページ ＞ 東都インテグレート 採用マイページ ＞ 面接予約</p>
      <div className="card">
        <h1 className="page-title">一次面接 日程予約（オンライン）</h1>
        <p>
          ご希望の日時を選択してください。<strong>予約は先着順</strong>です。
        </p>
        <p className="tiny-note">※予約完了後の日程変更・キャンセルはできません。※学業を優先してください（ただし日程は変更できません）。</p>

        <div className="booking-toolbar">
          <span>
            予約可能な枠：<strong className={openCount <= 2 ? 'danger-text' : ''}>{openCount}</strong>件
          </span>
          <button className="btn btn-secondary" onClick={refresh} disabled={refreshing}>
            {refreshing ? '更新中…' : '⟳ 最新の情報に更新'}
          </button>
        </div>

        <div className="table-scroll">
          <table className="slot-table">
            <thead>
              <tr>
                <th />
                {DAY_OFFSETS.map((d) => (
                  <th key={d} className={isSunday(d) ? 'sun' : ''}>
                    {shortDate(d)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((t) => (
                <tr key={t}>
                  <th className={t === EXTRA_TIME ? 'extra' : ''}>{t}</th>
                  {DAY_OFFSETS.map((d) => {
                    const key = `${d}-${t}`;
                    const s = slots[key];
                    if (pending === key) {
                      return (
                        <td key={key} className="slot pending">
                          <span className="spinner small dark" />
                        </td>
                      );
                    }
                    return (
                      <td key={key} className={`slot ${s}`}>
                        {s === 'open' ? (
                          <button onClick={() => pick(key)} aria-label={`${label(key)}を予約`}>
                            ○
                          </button>
                        ) : s === 'full' ? (
                          '×'
                        ) : (
                          '－'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {openCount === 0 && !pending && (
          <div className="empty-slots">
            <p>現在、予約可能な枠はありません。</p>
            <p className="tiny-note">キャンセルが発生した場合、枠が再公開されることがあります。</p>
          </div>
        )}

        <div className="waitlist">
          <button
            className="btn btn-secondary"
            onClick={() => {
              const n = waitNo + 7 + Math.floor(Math.random() * 20);
              setWaitNo(n);
              toast(`キャンセル待ちに登録しました（現在 ${n} 番目）`, 'warn');
              addStress(2, '登録するたびに下がるキャンセル待ち順位');
            }}
          >
            キャンセル待ちに登録する
          </button>
          <span className="tiny-note">現在のキャンセル待ち：{waitNo}人</span>
        </div>
      </div>

      {failed && (
        <Modal title="予約できませんでした" tone="error">
          <p>
            選択された日時は、<strong>他の方が先に予約されました</strong>。
            <br />
            別の日時を選択してください。
          </p>
          {attempts >= 2 && <p className="tiny-note">ヒント：「最新の情報に更新」すると追加枠が公開されることがあります。</p>}
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => setFailed(false)}>
              日程選択に戻る
            </button>
          </div>
        </Modal>
      )}

      {confirmed && (
        <Modal title="予約が確定しました">
          <table className="confirm-table">
            <tbody>
              <tr><th>選考</th><td>一次面接（個人面接）</td></tr>
              <tr><th>日時</th><td>{label(confirmed)}</td></tr>
              <tr><th>形式</th><td>オンライン（URLは前日までにお送りします）</td></tr>
              <tr><th>服装</th><td>服装自由（スーツ推奨）</td></tr>
            </tbody>
          </table>
          <p className="tiny-note">※開始10分前には入室してください。※5分前に入室すると遅刻扱いとなる場合があります。</p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              onClick={() => {
                setMeta('interview', label(confirmed));
                setMeta('interviewOffset', confirmed.split('-')[0]);
                complete('booking');
                toast('面接の予約が完了しました');
                go('dashboard');
              }}
            >
              マイページに戻る
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
