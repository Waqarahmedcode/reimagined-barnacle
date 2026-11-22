'use client';
/**
 * The one scroll pipeline for the whole page.
 *
 *   native scroll  ->  Lenis (the only smoothing; driven by gsap.ticker)
 *                  ->  ScrollTrigger.update
 *                  ->  (a) can pose via resolveStory()  (b) scrubbed reveal timelines
 *
 * There is no second interpolation loop: every visual is a pure function of
 * the (Lenis-smoothed) scroll position, so reverse scrolling, anchor jumps,
 * back/forward and resizes always land on the same state.
 *
 * Reduced motion: Lenis and all reveals are skipped, content is shown as-is,
 * and the can simply holds each chapter's resting pose (no travel).
 */
import { useCallback, useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { COMPACT_QUERY, scenes } from './sceneConfig';
import { poseTransforms, resolveStory, type StoryLayout } from './motion';

export type CanRefs = {
  rig: RefObject<HTMLDivElement | null>;
  body: RefObject<HTMLDivElement | null>;
  shadow: RefObject<HTMLDivElement | null>;
  intro: RefObject<HTMLDivElement | null>;
};

type Options = {
  can: CanRefs;
  meter: RefObject<HTMLDivElement | null>;
  onActive: (index: number) => void;
  onScrolled: (scrolled: boolean) => void;
};

export function useStoryEngine({ can, meter, onActive, onScrolled }: Options) {
  const lenisRef = useRef<Lenis | null>(null);
  const reducedRef = useRef(false);
  const callbacks = useRef({ onActive, onScrolled });
  callbacks.current = { onActive, onScrolled };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if ('scrollRestoration' in history) history.scrollRestoration = 'auto';

    const mm = gsap.matchMedia();
    mm.add(
      { reduce: '(prefers-reduced-motion: reduce)', motion: '(prefers-reduced-motion: no-preference)', compact: COMPACT_QUERY },
      (ctx) => {
        const { reduce, compact } = ctx.conditions as { reduce: boolean; compact: boolean };
        reducedRef.current = reduce;
        const mode = compact ? 'compact' : 'wide';
        document.documentElement.dataset.motion = reduce ? 'reduced' : 'full';

        // --- Smooth scroll (motion only) ---------------------------------
        let lenis: Lenis | null = null;
        let tick: ((time: number) => void) | null = null;
        if (!reduce) {
          lenis = new Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.9, touchMultiplier: 1.1 });
          lenis.on('scroll', ScrollTrigger.update);
          tick = (time: number) => lenis!.raf(time * 1000); // gsap ticker is in seconds, Lenis expects ms
          gsap.ticker.add(tick);
          gsap.ticker.lagSmoothing(0);
        }
        lenisRef.current = lenis;

        // --- Layout measurement --------------------------------------------
        const sections = scenes.map((s) => document.getElementById(s.id)!).filter(Boolean);
        const frameEl = document.querySelector<HTMLElement>('[data-frame]');
        const layout: StoryLayout = { tops: [], heights: [], frame: 1 };
        const measure = () => {
          layout.tops = sections.map((el) => el.getBoundingClientRect().top + window.scrollY);
          layout.heights = sections.map((el) => el.offsetHeight);
          layout.frame = frameEl?.offsetHeight || window.innerHeight;
        };

        // --- Can + chrome render -------------------------------------------
        let lastActive = -1;
        let lastScrolled: boolean | null = null;
        const render = () => {
          const y = window.scrollY;
          const state = resolveStory(y, scenes, layout, mode, reduce);
          const t = poseTransforms(state.pose, window.innerWidth, layout.frame, state.exitShift);
          if (can.rig.current) can.rig.current.style.transform = t.rig;
          if (can.body.current) {
            can.body.current.style.transform = t.body;
            can.body.current.style.setProperty('--sheen-x', t.sheen);
            // Sharp falloff so the callouts are gone before the next page turns in.
            const c = Math.min(1, Math.max(0, (state.pose.callouts - 0.6) / 0.4));
            can.body.current.style.setProperty('--callouts', (c * c * (3 - 2 * c)).toFixed(3));
          }
          if (can.shadow.current) {
            can.shadow.current.style.transform = t.shadow;
            can.shadow.current.style.opacity = t.shadowOpacity;
          }
          if (meter.current) meter.current.style.setProperty('--progress', state.progress.toFixed(4));
          if (state.active !== lastActive) {
            lastActive = state.active;
            callbacks.current.onActive(state.active);
          }
          const scrolled = y > 40;
          if (scrolled !== lastScrolled) {
            lastScrolled = scrolled;
            callbacks.current.onScrolled(scrolled);
          }
        };

        measure();
        render();
        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: render, onRefresh: () => { measure(); render(); } });
        if (reduce) {
          // Without Lenis, ScrollTrigger still listens to native scroll; render on it directly too.
          window.addEventListener('scroll', render, { passive: true });
        }

        // --- Reveals + intro (motion only) ----------------------------------
        // Flag readiness first: the CSS pre-hide must be gone before GSAP reads
        // computed transforms, or it gets baked into the tween as a pixel offset.
        document.documentElement.classList.add('engine-ready');
        if (!reduce) {
          registerReveals(layout, compact);
          playIntro(can.intro.current);
        } else {
          gsap.set('[data-reveal] , [data-reveal] .ln-i', { clearProps: 'all' });
        }

        return () => {
          window.removeEventListener('scroll', render);
          if (tick) gsap.ticker.remove(tick);
          lenis?.destroy();
          lenisRef.current = null;
        };
      },
    );

    return () => mm.revert();
  }, [can, meter]);

  /** Smoothly jump to a chapter (or the top / a pixel offset). */
  const scrollToTarget = useCallback((target: string | number) => {
    const el = typeof target === 'string' ? document.getElementById(target) : null;
    const y = typeof target === 'number' ? target : el ? el.getBoundingClientRect().top + window.scrollY : 0;
    const lenis = lenisRef.current;
    if (lenis) {
      const distance = Math.abs(y - window.scrollY) / Math.max(1, window.innerHeight);
      lenis.scrollTo(y, { duration: Math.min(2.6, 0.9 + distance * 0.18), easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  }, []);

  return { scrollToTarget };
}

/* ------------------------------------------------------------------------- */
/* Scroll-scrubbed reveal registry                                            */
/* ------------------------------------------------------------------------- */
/**
 * Elements opt in with data attributes (see EditorialScene / Scenes):
 *   data-reveal = lines | up | wipe | wipe-up | rule | bloom | count | drift | spin | intro
 *   data-phase  = enter (default; while the page turns in)
 *               | hold  (during the pinned stretch; window from data-at="a,b", fractions)
 *               | through (whole time the section is on screen)
 * All are fromTo tweens with scrub:true, so they are reversible by construction.
 */
function registerReveals(layout: StoryLayout, compact: boolean) {
  const els = gsap.utils.toArray<HTMLElement>('[data-reveal]');
  for (const el of els) {
    const type = el.dataset.reveal!;
    if (type === 'intro') continue;
    if (compact && el.dataset.wideOnly !== undefined) continue;
    const section = el.closest<HTMLElement>('[data-scene]') ?? el;
    const phase = el.dataset.phase ?? 'enter';
    const [a, b] = (el.dataset.at ?? '0,0.5').split(',').map(Number);

    const pin = () => Math.max(1, section.offsetHeight - layout.frame);
    const top = () => section.getBoundingClientRect().top + window.scrollY;
    const trigger: ScrollTrigger.Vars =
      phase === 'hold'
        ? { start: () => top() + a * pin(), end: () => top() + b * pin(), scrub: true, invalidateOnRefresh: true }
        : phase === 'through'
          ? { start: () => top() - layout.frame, end: () => top() + section.offsetHeight, scrub: true, invalidateOnRefresh: true }
          : { start: () => top() - layout.frame * 0.92, end: () => top() - layout.frame * 0.08, scrub: true, invalidateOnRefresh: true };

    const ease = el.dataset.ease ?? 'power2.out';
    const stagger = Number(el.dataset.stagger ?? 0.12);
    const base = { ease, scrollTrigger: trigger } as const;

    switch (type) {
      case 'lines':
        gsap.fromTo(el.querySelectorAll('.ln-i'), { yPercent: 112 }, { yPercent: 0, stagger, ...base });
        break;
      case 'up': {
        const targets = el.children.length ? el.children : el;
        gsap.fromTo(targets, { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger, ...base });
        break;
      }
      case 'wipe':
        gsap.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ...base, ease: 'power3.inOut' });
        break;
      case 'wipe-up':
        gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ...base, ease: 'power3.inOut' });
        break;
      case 'rule':
        gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', ...base, ease: 'power3.inOut' });
        break;
      case 'bloom':
        gsap.fromTo(
          el,
          { scale: 0.35, rotate: Number(el.dataset.rot ?? -16), autoAlpha: 0 },
          { scale: 1, rotate: 0, autoAlpha: 1, ...base, ease: 'back.out(1.4)' },
        );
        break;
      case 'count': {
        const to = Number(el.dataset.to ?? 0);
        const counter = { v: 0 };
        gsap.fromTo(counter, { v: 0 }, {
          v: to, ...base, ease: 'power1.out',
          onUpdate: () => { el.textContent = String(Math.round(counter.v)); },
        });
        break;
      }
      case 'drift': {
        const [x0, x1] = (el.dataset.x ?? '0,0').split(',').map(Number);
        const [y0, y1] = (el.dataset.y ?? '0,0').split(',').map(Number);
        gsap.fromTo(el, { xPercent: x0, yPercent: y0 }, { xPercent: x1, yPercent: y1, ...base, ease: 'none' });
        break;
      }
      case 'spin':
        gsap.fromTo(el, { rotate: 0 }, { rotate: Number(el.dataset.deg ?? 90), ...base, ease: 'none' });
        break;
    }
  }
}

/** One-off load entrance for the opening (time-based, plays once, not tied to scroll). */
function playIntro(canIntro: HTMLDivElement | null) {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.fromTo('.site-header', { yPercent: -100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.9 }, 0.05)
    .fromTo('[data-reveal="intro"] .ln-i', { yPercent: 112 }, { yPercent: 0, duration: 1.15, stagger: 0.11 }, 0.15);
  if (canIntro) tl.fromTo(canIntro, { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.5, ease: 'expo.out' }, 0.35);
  tl.fromTo('[data-intro-fade]', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 }, 0.75);
}
