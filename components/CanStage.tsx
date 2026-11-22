'use client';
import type { CanRefs } from '../lib/useStoryEngine';
import { callouts } from '../lib/sceneConfig';

/**
 * The single, persistent product render. It is never unmounted or reset
 * between chapters; the engine only rewrites transforms on these nodes.
 *
 *   .can-layer   fixed viewport layer between back plates and front plates
 *   .can-intro   load entrance only (opacity / y)
 *   .can-rig     pose translate + scale (optical centre = box centre)
 *   .can-shadow  pre-baked silhouette shadow, offset in screen space
 *   .can-body    pose rotation; holds the image, sheen and label callouts
 */
export default function CanStage({ refs }: { refs: CanRefs }) {
  return (
    <div className="can-layer">
      <div className="can-intro" ref={refs.intro} data-intro-can>
        <div className="can-rig" ref={refs.rig}>
          <div className="can-shadow" ref={refs.shadow} aria-hidden="true" />
          <div className="can-body" ref={refs.body}>
            <picture>
              <source srcSet="/revel-can.webp" type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="can-image"
                src="/revel-can.png"
                width={666}
                height={1254}
                alt="REVEL Red Berry sparkling drink: a red aluminium can with a silver lid, red pull tab and cold condensation. The label reads REVEL, Sparkling Drink, Red Berry, Natural Flavour, Zero Sugar, 355 mL (12 fl oz)."
                fetchPriority="high"
                decoding="async"
                draggable={false}
              />
            </picture>
            <span className="can-sheen" aria-hidden="true" />
            <ul className="can-callouts" aria-hidden="true">
              {callouts.map((c, i) => (
                <li key={c.text} style={{ top: `${c.at * 100}%`, ['--i' as string]: i }}>
                  <i />
                  <span>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
