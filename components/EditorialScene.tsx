import type { ReactNode } from 'react';
import type { Scene } from '../lib/sceneConfig';

/**
 * One chapter: a tall section holding two sticky 100svh plates.
 *   back  — background, giant display type, splashes, imagery (paints BEHIND the can)
 *   front — readable copy, cards, CTAs (paints ABOVE the can; never covered by it)
 * The fixed can layer sits between the two in the root stacking order.
 */
export default function EditorialScene({ scene, back, front, labelledBy }: { scene: Scene; back: ReactNode; front: ReactNode; labelledBy: string }) {
  return (
    <section
      id={scene.id}
      className={`scene scene--${scene.id} theme-${scene.theme}`}
      data-scene={scene.id}
      aria-labelledby={labelledBy}
      style={{ ['--h-wide' as string]: `${scene.height.wide}svh`, ['--h-compact' as string]: `${scene.height.compact}svh` }}
    >
      <div className="plate plate--back" data-frame>
        <Registration />
        {back}
      </div>
      <div className="plate plate--front">
        <div className="folio">
          <span>{scene.number} — {scene.label}</span>
          <span>REVEL® / Issue Nº 001</span>
        </div>
        {front}
      </div>
    </section>
  );
}

/** Printer's registration marks in the plate corners. */
function Registration() {
  const mark = (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
  return (
    <div className="registration" aria-hidden="true">
      <span>{mark}</span>
      <span>{mark}</span>
    </div>
  );
}

/** Display headline split into masked lines for the clip-reveal. */
export function Lines({ lines, as: Tag = 'h2', id, className, reveal = 'lines', phase, at }: {
  lines: ReactNode[]; as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'; id?: string; className?: string; reveal?: 'lines' | 'intro'; phase?: string; at?: string;
}) {
  return (
    <Tag id={id} className={className} data-reveal={reveal} data-phase={phase} data-at={at}>
      {lines.map((l, i) => (
        <span className="ln" key={i}>
          <span className="ln-i">{l}</span>
          {/* keeps words apart in the accessible name ("A little louder.") */}
          {i < lines.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
