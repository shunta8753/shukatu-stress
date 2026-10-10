import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  tone?: 'normal' | 'error';
  /** 閉じるボタンを極小にする嫌がらせ */
  tinyClose?: boolean;
}

export default function Modal({ title, children, footer, onClose, tone = 'normal', tinyClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`modal ${tone === 'error' ? 'modal-error' : ''}`}>
        <div className="modal-head">
          <span>{title}</span>
          {onClose && (
            <button className={`modal-close ${tinyClose ? 'tiny' : ''}`} onClick={onClose} aria-label="閉じる">
              ×
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
