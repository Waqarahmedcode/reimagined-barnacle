import EditorialScene, { Lines } from './EditorialScene';
import Splash from './Splash';
import { labelFacts, scenes, swatches } from '../lib/sceneConfig';

const byId = (id: string) => scenes.find((s) => s.id === id)!;

/* 01 — THE OPENING ---------------------------------------------------------- */
export function Opening() {
  return (
    <EditorialScene
      scene={byId('opening')}
      labelledBy="opening-title"
      back={
        <>
          <p className="topline" data-intro-fade>
            <span>Est. in the moment</span>
            <span className="star">✳</span>
            <span>Made for every day</span>
          </p>
          <Lines as="h1" id="opening-title" className="display opening__title" reveal="intro" lines={['A little', <>louder<i className="dot">.</i></>]} />
          <div className="seal seal--opening" data-reveal="spin" data-phase="through" data-deg="140" aria-hidden="true">
            <SealRing id="ring-opening" text="REVEL · RED BERRY · ISSUE Nº 001 · EST. MMXXVI · " />
            <b>R</b>
          </div>
          <div className="opening__arc" aria-hidden="true" data-reveal="drift" data-phase="through" data-x="0,-6" data-y="0,10" />
        </>
      }
      front={
        <>
          <div className="opening__meta" data-intro-fade>
            <span className="red-rule" />
            <span>Sparkling<br />Red berry<br />355 mL of attitude</span>
          </div>
          <div className="opening__aside" data-intro-fade>
            <em>Life tastes better<br />a little louder.</em>
            <small>No ordinary sip.</small>
          </div>
        </>
      }
    />
  );
}

/* 02 — MEET THE CAN --------------------------------------------------------- */
export function Meet() {
  return (
    <EditorialScene
      scene={byId('meet')}
      labelledBy="meet-title"
      back={
        <>
          <Lines id="meet-title" className="display meet__title" lines={['Meet the', <>red berry<i className="dot">.</i></>]} />
          <p className="meet__vertical" aria-hidden="true">Not here to blend in ✳ Not here to blend in ✳</p>
        </>
      }
      front={
        <>
          <div className="meet__copy" data-reveal="up" data-phase="hold" data-at="0,0.45">
            <span className="kicker">The good kind of rebel</span>
            <h3>Some flavours <em>follow.</em><br />This one leads.</h3>
            <span className="rule" />
            <p>A red berry sparkling drink with an unmistakable personality, in a can that wears it on the outside. For the days that deserve a bigger feeling.</p>
          </div>
          <div className="stamp stamp--meet" data-reveal="bloom" data-phase="hold" data-at="0.15,0.55" data-rot="-30" aria-hidden="true">
            Bold<br />by<br />nature<span>✳</span>
          </div>
        </>
      }
    />
  );
}

/* 03 — THE DETAILS ---------------------------------------------------------- */
export function Details() {
  const [volume, ...rest] = labelFacts;
  return (
    <EditorialScene
      scene={byId('details')}
      labelledBy="details-title"
      back={
        <>
          <Lines id="details-title" className="display details__title" lines={['355 mL', 'of', <>attitude<i className="dot">.</i></>]} />
          <div className="details__grid" aria-hidden="true" data-reveal="drift" data-phase="through" data-x="0,0" data-y="-3,3" />
        </>
      }
      front={
        <aside className="spec-card" aria-label="What the label says">
          <div className="spec-card__frame" data-reveal="wipe-up" data-phase="hold" data-at="0,0.35" />
          <header data-reveal="up" data-phase="hold" data-at="0.05,0.35">
            <span className="kicker">Spec sheet Nº 03</span>
            <span className="kicker kicker--muted">As printed on the can</span>
          </header>
          <div className="spec-card__hero" data-reveal="up" data-phase="hold" data-at="0.1,0.4">
            <strong><span data-reveal="count" data-phase="hold" data-at="0.08,0.42" data-to="355">355</span><small>{volume.unit}</small></strong>
            <p>{volume.note}</p>
          </div>
          <dl data-reveal="up" data-phase="hold" data-at="0.2,0.55" data-stagger="0.18">
            {rest.map((f) => (
              <div key={f.key}>
                <dt>{f.key}</dt>
                <dd><b>{f.value}</b><span>{f.note}</span></dd>
              </div>
            ))}
          </dl>
          <span className="rule" data-reveal="rule" data-phase="hold" data-at="0.3,0.6" />
          <p className="spec-card__fine">Concept site. Product facts are limited to what the supplied can artwork shows.</p>
        </aside>
      }
    />
  );
}

/* 04 — THE FEELING ---------------------------------------------------------- */
export function Feeling() {
  return (
    <EditorialScene
      scene={byId('feeling')}
      labelledBy="feeling-title"
      back={
        <>
          <div className="halftone" aria-hidden="true" data-reveal="drift" data-phase="through" data-x="6,-8" data-y="-6,10" />
          <h2 id="feeling-title" className="display feeling__title">
            <span className="feeling__row" data-reveal="drift" data-phase="through" data-x="6,-6">
              <Lines as="span" lines={['The good kind']} />
            </span>
            <span className="feeling__row feeling__row--2" data-reveal="drift" data-phase="through" data-x="-8,5">
              <Lines as="span" lines={[<>of fizz<i className="dot">.</i></>]} />
            </span>
          </h2>
        </>
      }
      front={
        <>
          <figure className="inset inset--feeling">
            <div className="inset__img" data-reveal="wipe-up" data-phase="hold" data-at="0,0.4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/imagery/pour-glass.svg" width={800} height={600} loading="lazy" decoding="async" alt="Illustration of a red sparkling drink being poured over ice into a clear glass." />
            </div>
            <figcaption data-reveal="up" data-phase="hold" data-at="0.15,0.45">Fig. 1 — Pour it over ice.</figcaption>
          </figure>
          <div className="feeling__story" data-reveal="up" data-phase="hold" data-at="0.1,0.5" data-stagger="0.15">
            <span className="kicker">The mouthfeel, in brief</span>
            <p className="feeling__lede">Crack it open and it talks back.</p>
            <p>A lively sparkle that carries the red berry from the first sip to the last. Bright enough to wake you up, smooth enough to stay for another.</p>
            <p className="kicker kicker--muted">Best served cold. Always enjoyed loud.</p>
          </div>
        </>
      }
    />
  );
}

/* 05 — THE FLAVOUR ---------------------------------------------------------- */
export function Flavour() {
  return (
    <EditorialScene
      scene={byId('flavour')}
      labelledBy="flavour-title"
      back={
        <>
          <Lines id="flavour-title" className="display flavour__title" lines={['Bright.', 'Berry.', <>Bold<i className="dot">.</i></>]} />
          <figure className="inset inset--flavour" data-reveal="drift" data-phase="through" data-x="-14,6" data-y="10,-6">
            <div className="inset__img" data-reveal="wipe" data-phase="hold" data-at="0.3,0.7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/imagery/berry-ice-splash.svg" width={800} height={600} loading="lazy" decoding="async" alt="Illustration of red berries and ice cubes in a splash of red liquid." />
            </div>
          </figure>
        </>
      }
      front={
        <div className="splashes">
          <Splash seed={11} tone="red" title="Bright" className="splash--a" at="0,0.3" rot={-24}>
            First sip lands sharp and sunny.
          </Splash>
          <Splash seed={29} tone="ink" title="Berry" className="splash--b" at="0.15,0.45" rot={18}>
            Red berry, natural flavour. Front and centre.
          </Splash>
          <Splash seed={47} tone="red" title="Bold" className="splash--c" at="0.3,0.6" rot={-12}>
            A finish that doesn&rsquo;t whisper.
          </Splash>
        </div>
      }
    />
  );
}

/* 06 — THE COLOURS ---------------------------------------------------------- */
export function Colours() {
  return (
    <EditorialScene
      scene={byId('colours')}
      labelledBy="colours-title"
      back={
        <>
          <Lines id="colours-title" className="display colours__title" lines={['Four shades.', <><span className="outline">One</span> feeling<i className="dot">.</i></>]} />
          <div className="seal seal--colours" data-reveal="spin" data-phase="through" data-deg="-120" aria-hidden="true">
            <SealRing id="ring-colours" text="RED IS MORE THAN A COLOUR · RED IS MORE THAN A COLOUR · " />
            <b>R</b>
          </div>
        </>
      }
      front={
        <>
          <ul className="swatches" aria-label="The four REVEL reds" data-reveal="up" data-phase="hold" data-at="0,0.45" data-stagger="0.14">
            {swatches.map((s, i) => (
              <li key={s.hex}>
                <span className="swatch__chip" style={{ background: s.hex }} />
                <span className="swatch__meta">
                  <b>0{i + 1} {s.name}</b>
                  <code>{s.hex}</code>
                  <small>{s.note}</small>
                </span>
              </li>
            ))}
          </ul>
          <p className="colours__side" data-reveal="up" data-phase="hold" data-at="0.2,0.55">
            It&rsquo;s a mood.<br />It&rsquo;s a movement.<br />It&rsquo;s a whole damn feeling.
          </p>
        </>
      }
    />
  );
}

/* 07 — THE FINALE ----------------------------------------------------------- */
export function Finale({ onReplay, onDetails, onShare, shareLabel }: { onReplay: () => void; onDetails: () => void; onShare: () => void; shareLabel: string }) {
  return (
    <EditorialScene
      scene={byId('finale')}
      labelledBy="finale-title"
      back={
        <>
          <div className="finale__arch" aria-hidden="true" data-reveal="wipe-up" />
          <h2 id="finale-title" className="display finale__title">
            <Lines as="span" className="finale__l" lines={['Make it a']} />
            <Lines as="span" className="finale__r" lines={['Revel', <>moment<i className="dot">.</i></>]} />
          </h2>
        </>
      }
      front={
        <>
          <div className="finale__kicker" data-reveal="up" data-phase="hold" data-at="0,0.4">
            <em>Go on. Make a scene.</em>
            <p>Some moments deserve a little more colour.</p>
          </div>
          <div className="finale__cta" data-reveal="up" data-phase="hold" data-at="0.05,0.45">
            <button type="button" className="btn btn--solid" onClick={onShare}>{shareLabel} <span aria-hidden="true">↗</span></button>
            <button type="button" className="btn" onClick={onDetails}>Revisit the details</button>
            <button type="button" className="btn btn--ghost" onClick={onReplay}>Replay the story <span aria-hidden="true">↺</span></button>
          </div>
          <span className="seal seal--finale" aria-hidden="true">Revel<br />red<br />berry<b>✳</b></span>
        </>
      }
    />
  );
}

function SealRing({ text, id }: { text: string; id: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <defs><path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
      <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="1" />
      <text><textPath href={`#${id}`}>{text}</textPath></text>
    </svg>
  );
}
