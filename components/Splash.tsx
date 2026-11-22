import { makeSplash } from '../lib/splash';

/** Irregular ink splash with a short note set inside it. */
export default function Splash({ seed, tone, title, children, className, rot = -16, phase = 'hold', at }: {
  seed: number; tone: 'red' | 'ink'; title: string; children: React.ReactNode; className?: string; rot?: number; phase?: string; at: string;
}) {
  const s = makeSplash(seed);
  return (
    <div className={`splash splash--${tone} ${className ?? ''}`} data-reveal="bloom" data-phase={phase} data-at={at} data-rot={rot}>
      <svg viewBox="35 35 130 130" aria-hidden="true" className="splash__shape">
        <path d={s.body} />
        {s.drops.map((d, i) => <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />)}
      </svg>
      <div className="splash__text">
        <span className="splash__mark" aria-hidden="true">✳</span>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </div>
  );
}
