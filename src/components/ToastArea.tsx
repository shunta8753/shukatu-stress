import { useGame } from '../game/GameContext';

export default function ToastArea() {
  const { toasts, dismissToast } = useGame();
  return (
    <div className="toast-area" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`} onClick={() => dismissToast(t.id)}>
          <span className="toast-icon">{t.kind === 'info' ? '🔔' : '⚠'}</span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
