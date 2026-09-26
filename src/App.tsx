import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Heart, Play, X } from '@phosphor-icons/react';
import { birthday } from './content';
import { VideoPlayer } from './VideoPlayer';

const Cake = lazy(() => import('./Cake'));
const storageKey = 'nine-slices-watched-v1';

function readWatched(): string[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(stored)
      ? stored.filter((id): id is string => typeof id === 'string' && birthday.slices.some(slice => slice.id === id))
      : [];
  } catch {
    return [];
  }
}

function flavorPosition(index: number) {
  const a = Math.PI / 2 - index * (Math.PI * 2 / 9);
  const x = .5 + .29 * Math.cos(a);
  const y = .5 - .29 * Math.sin(a);
  const size = 3.2;
  const p = (n: number) => `${((n - .5 / size) / (1 - 1 / size)) * 100}%`;
  return { backgroundPosition: `${p(x)} ${p(y)}` };
}

export default function App() {
  const [stage, setStage] = useState<'intro' | 'cake'>('intro');
  const [transition, setTransition] = useState<'idle' | 'cover' | 'uncover'>('idle');
  const [noteOpen, setNoteOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [watched, setWatched] = useState<string[]>(readWatched);
  const [reduced, setReduced] = useState(false);
  const [small, setSmall] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const noteOpener = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const sliceRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const active = birthday.slices.find(slice => slice.id === selected);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const width = matchMedia('(max-width: 900px)');
    const update = () => { setReduced(motion.matches); setSmall(width.matches); };
    update();
    motion.addEventListener('change', update);
    width.addEventListener('change', update);
    return () => {
      motion.removeEventListener('change', update);
      width.removeEventListener('change', update);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(watched)); }
    catch { /* The presentation still works if storage is disabled. */ }
  }, [watched]);

  useEffect(() => { if (active || noteOpen) closeRef.current?.focus(); }, [active, noteOpen]);

  useEffect(() => {
    const panel = dialogRef.current;
    if ((!active && !noteOpen) || !panel || reduced) return;
    const motion = panel.animate(
      [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
      { duration: 460, easing: 'cubic-bezier(.16, 1, .3, 1)' },
    );
    return () => motion.cancel();
  }, [active, noteOpen, reduced]);

  function changeStage(next: 'intro' | 'cake') {
    if (next === stage || transition !== 'idle') return;
    setSelected(null);
    setNoteOpen(false);
    if (reduced) { setStage(next); return; }
    setTransition('cover');
    timers.current.push(setTimeout(() => {
      setStage(next);
      setTransition('uncover');
    }, 480));
    timers.current.push(setTimeout(() => setTransition('idle'), 1080));
  }

  function closePanel() {
    const lastId = selected;
    setSelected(null);
    setNoteOpen(false);
    requestAnimationFrame(() => {
      if (lastId) sliceRefs.current[lastId]?.focus();
      else noteOpener.current?.focus();
    });
  }

  function openNote() {
    noteOpener.current = document.activeElement as HTMLElement;
    setNoteOpen(true);
  }

  useEffect(() => {
    if (!noteOpen && !active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); closePanel(); }
      if (e.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, video[controls]');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [active, noteOpen]);

  const obscured = !!active || noteOpen;
  return (
    <div className="experience">
      <header className="site-header" inert={obscured}>
        <button className="wordmark" onClick={() => changeStage('intro')} aria-label="Nine slices, return to the beginning">nine slices<span aria-hidden="true">✳</span></button>
        <span className="header-center">A birthday, told by the people who love you</span>
        <button className="header-action" onClick={openNote}>A message from me <Play size={13} weight="fill" aria-hidden="true" /></button>
      </header>

      {stage === 'intro' ? (
        <main className="landing" inert={obscured}>
          <div className="landing-photo" aria-hidden="true" />
          <div className="landing-vignette" aria-hidden="true" />
          <div className="landing-copy">
            <span className="overline">Made for you, with love</span>
            <h1>One cake.<br /><em>Nine stories.</em><br />All yours.</h1>
            <p>Each of your friends chose a slice that reminded them of you. Pick one and hear why.</p>
            <div className="landing-actions">
              <button className="primary-button" onClick={() => changeStage('cake')}>Explore your cake <ArrowRight size={20} aria-hidden="true" /></button>
              <button className="secondary-button" onClick={openNote}><Play size={16} weight="fill" aria-hidden="true" /> Watch my message</button>
            </div>
          </div>
          <div className="landing-corner">Tonight is yours <Heart size={17} weight="light" aria-hidden="true" /></div>
        </main>
      ) : (
        <main className={`cake-page ${active ? 'has-selection' : ''}`}>
          <div className="scene" inert={obscured}>
            <div className="scene-background" aria-hidden="true" />
            <div className="scene-topline">
              <button className="scene-back" onClick={() => changeStage('intro')}><ArrowLeft size={18} aria-hidden="true" /> Back to the beginning</button>
              <span>Choose whichever slice you like</span>
            </div>
            <div className="cake-spotlight">
              <Suspense fallback={<div className="scene-loading">Preparing your cake…</div>}>
                <Cake selected={selected} onSelect={setSelected} reduced={reduced} />
              </Suspense>
            </div>
            <div className="scene-bottomline"><span>Drag to turn the cake. Click a slice to hear its story.</span><span>{watched.length} of 9 stories watched</span></div>
          </div>

          <section className="flavor-section" aria-label="Choose a cake slice" inert={obscured}>
            <div className="flavor-heading"><div><span className="overline">The nine slices</span><h2>Where will you begin?</h2></div><button className="quiet-button" onClick={() => setWatched([])}>Reset watched stories</button></div>
            <div className="flavor-list">
              {birthday.slices.map((slice, index) => (
                <button key={slice.id} ref={node => { sliceRefs.current[slice.id] = node; }} className={`flavor-card ${selected === slice.id ? 'selected' : ''}`} onClick={() => setSelected(slice.id)} aria-pressed={selected === slice.id}>
                  <span className="flavor-photo" style={flavorPosition(index)} aria-hidden="true" />
                  <span className="flavor-info"><strong>{slice.flavor}</strong></span>
                  <span className="flavor-action">{watched.includes(slice.id) ? <Check size={19} aria-label="Watched" /> : <ArrowUpRight size={20} aria-hidden="true" />}</span>
                </button>
              ))}
            </div>
          </section>
        </main>
      )}

      {obscured && <>
        <div className="dialog-scrim" onClick={closePanel} aria-hidden="true" />
        <aside className={`story-panel ${noteOpen ? 'opening-note' : ''}`} ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="story-heading">
          <div className="panel-header"><span>{noteOpen ? 'Before the cake' : 'One of nine stories'}</span><button ref={closeRef} className="panel-close" onClick={closePanel} aria-label="Close video"><X size={23} aria-hidden="true" /></button></div>
          {noteOpen ? <><h2 id="story-heading">A few words from me.</h2><p className="panel-description">A birthday message, just for you.</p><VideoPlayer src={birthday.intro.video} poster={birthday.intro.poster} placeholderCover="/images/candlelit-table.webp" label="Your birthday dedication" /><button className="panel-next" onClick={() => { setNoteOpen(false); changeStage('cake'); }}>Explore your cake <ArrowRight size={18} aria-hidden="true" /></button></> : active && <><h2 id="story-heading">{active.flavor}</h2><p className="panel-description">Chosen by <strong>{active.friend}</strong>, for you.</p><VideoPlayer key={active.id} src={active.video} poster={active.poster} label={`${active.friend}: ${active.flavor}`} onEnded={() => setWatched(current => current.includes(active.id) ? current : [...current, active.id])} /><p className="panel-ending">Some stories are best told over cake.</p>{watched.includes(active.id) && <p className="watched-note"><Check size={16} aria-hidden="true" /> Watched. You can come back anytime.</p>}</>}
        </aside>
      </>}
      {transition !== 'idle' && <div className={`scene-curtain ${transition}`} aria-hidden="true"><span>nine slices</span></div>}
      {small && <div className="laptop-hint" role="status">This birthday experience is made for a laptop screen.</div>}
    </div>
  );
}
