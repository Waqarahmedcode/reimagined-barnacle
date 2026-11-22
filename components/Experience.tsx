'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import CanStage from './CanStage';
import { MenuOverlay, ProgressMeter, SiteHeader } from './SiteChrome';
import { Colours, Details, Feeling, Finale, Flavour, Meet, Opening } from './Scenes';
import { scenes } from '../lib/sceneConfig';
import { useStoryEngine, type CanRefs } from '../lib/useStoryEngine';

export default function Experience() {
  const rig = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const can = useMemo<CanRefs>(() => ({ rig, body, shadow, intro }), []);

  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareLabel, setShareLabel] = useState('Share the moment');

  const onActive = useCallback((i: number) => {
    setActive(i);
    document.documentElement.dataset.theme = scenes[i].theme;
  }, []);

  const { scrollToTarget } = useStoryEngine({ can, meter, onActive, onScrolled: setScrolled });

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const go = useCallback((t: string | number) => { setMenuOpen(false); scrollToTarget(t); }, [scrollToTarget]);

  const share = useCallback(async () => {
    const data = { title: 'REVEL® Red Berry', text: 'Make it a REVEL moment.', url: window.location.href.split('#')[0] };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(data.url);
      setShareLabel('Link copied');
    } catch {
      setShareLabel('Copy the address bar link');
    }
    window.setTimeout(() => setShareLabel('Share the moment'), 2600);
  }, []);

  return (
    <>
      <a className="skip-link" href="#opening-title">Skip to content</a>
      <SiteHeader menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((v) => !v)} go={go} />
      <MenuOverlay open={menuOpen} active={active} onClose={closeMenu} go={go} />
      <ProgressMeter meterRef={meter} active={active} go={go} />
      <p className={`scroll-cue ${scrolled ? 'scroll-cue--dim' : ''}`} aria-hidden="true">
        <span className="scroll-cue__line" />Scroll to explore<span className="scroll-cue__arrow">↓</span>
      </p>
      <div className="paper-grain" aria-hidden="true" />

      <main className={`story ${menuOpen ? 'story--menu' : ''}`}>
        <CanStage refs={can} />
        <Opening />
        <Meet />
        <Details />
        <Feeling />
        <Flavour />
        <Colours />
        <Finale onReplay={() => go(0)} onDetails={() => go('details')} onShare={share} shareLabel={shareLabel} />
      </main>

      <footer className="site-footer">
        <div className="site-footer__top"><span>REVEL® / Sparkling red berry</span><span>An experiment in good taste. Est. 2026.</span></div>
        <div className="site-footer__main">
          <div>
            <span className="kicker">After all that scrolling…</span>
            <h2>Still<br />thirsty<span>?</span></h2>
          </div>
          <div className="site-footer__right">
            <div className="site-footer__star" aria-hidden="true">✳</div>
            <p>A little more fun. A little more flavour. A lot more personality.</p>
            <button type="button" className="btn btn--line-light" onClick={() => go(0)}>Back to the top <span aria-hidden="true">↑</span></button>
          </div>
        </div>
        <div className="site-footer__bottom"><span>© 2026 REVEL / Concept brand</span><span>Made to be seen, not to blend in.</span><span>Designed for the scroll ✳</span></div>
      </footer>
    </>
  );
}
