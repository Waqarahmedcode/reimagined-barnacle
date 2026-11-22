'use client';
import { useEffect, useRef, type RefObject } from 'react';
import { scenes } from '../lib/sceneConfig';

type Nav = (target: string | number) => void;

export function SiteHeader({ menuOpen, onToggleMenu, go }: { menuOpen: boolean; onToggleMenu: () => void; go: Nav }) {
  return (
    <header className="site-header">
      <a className="brand" href="#opening" onClick={(e) => { e.preventDefault(); go(0); }} aria-label="REVEL, back to the start">
        REVEL<sup>®</sup><span className="brand__sub">Est. MMXXVI</span>
      </a>
      <span className="site-header__center" aria-hidden="true">The original red berry feeling <span className="star">✳</span> Issue Nº 001</span>
      <div className="site-header__actions">
        <a className="btn btn--line site-header__explore" href="#flavour" onClick={(e) => { e.preventDefault(); go('flavour'); }}>
          Explore the flavour <span aria-hidden="true">↗</span>
        </a>
        <button type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="site-menu" onClick={onToggleMenu}>
          {menuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
      </div>
    </header>
  );
}

export function MenuOverlay({ open, active, onClose, go }: { open: boolean; active: number; onClose: () => void; go: Nav }) {
  const ref = useRef<HTMLElement>(null);

  // Focus management: move focus into the menu on open, Escape closes, Tab stays inside.
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
    root?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); toggle?.focus(); }
      if (e.key !== 'Tab' || !root) return;
      const items = [toggle, ...Array.from(root.querySelectorAll<HTMLElement>('a'))].filter(Boolean) as HTMLElement[];
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <nav id="site-menu" ref={ref} className={`menu ${open ? 'menu--open' : ''}`} aria-label="Chapters" inert={!open}>
      <p className="menu__top">The REVEL index / 2026</p>
      <ol>
        {scenes.map((s, i) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={i === active ? 'step' : undefined} onClick={(e) => { e.preventDefault(); onClose(); go(s.id); }}>
              <span>{s.number}</span>{s.label}<b aria-hidden="true">↗</b>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Desktop: vertical track with chapter ticks. Compact: horizontal track (scaleX). */
export function ProgressMeter({ meterRef, active, go }: { meterRef: RefObject<HTMLDivElement | null>; active: number; go: Nav }) {
  return (
    <div className="meter" ref={meterRef}>
      <span className="meter__num" aria-hidden="true">01</span>
      <div className="meter__track">
        <div className="meter__fill" />
        <ol className="meter__ticks">
          {scenes.map((s, i) => (
            <li key={s.id} style={{ ['--at' as string]: i / (scenes.length - 1) }}>
              <button type="button" aria-label={`Go to chapter ${s.number}, ${s.label}`} aria-current={i === active ? 'step' : undefined} onClick={() => go(s.id)} />
            </li>
          ))}
        </ol>
      </div>
      <span className="meter__num" aria-hidden="true">{scenes[scenes.length - 1].number}</span>
    </div>
  );
}
