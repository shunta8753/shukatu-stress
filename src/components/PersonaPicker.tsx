import { PERSONAS, type Persona } from '../game/personas';

interface Props {
  title: string;
  note?: string;
  selected?: string;
  onPick: (p: Persona) => void;
  compact?: boolean;
}

export default function PersonaPicker({ title, note, selected, onPick, compact }: Props) {
  return (
    <div className={`persona-picker ${compact ? 'compact' : ''}`}>
      <p className="persona-title">⚡ {title}</p>
      <div className="persona-list">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`persona persona-${p.id} ${selected === p.id ? 'on' : ''}`}
            onClick={() => onPick(p)}
          >
            <span className="persona-icon">{p.icon}</span>
            <span className="persona-text">
              <span className="persona-label">{p.label}</span>
              <span className="persona-name">{p.name}</span>
              {!compact && <span className="persona-catch">{p.catch}</span>}
            </span>
          </button>
        ))}
      </div>
      {note && <p className="tiny-note">{note}</p>}
    </div>
  );
}
