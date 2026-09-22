import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { birthday } from './content';
import { VideoPlayer } from './VideoPlayer';
import { ArrowUpRight, ArrowLeft, Check, X, Heart, Asterisk } from '@phosphor-icons/react';
const Cake = lazy(() => import('./Cake'));
const storageKey = 'nine-slices-watched-v1';
function readWatched(): string[] { try { const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string' && birthday.slices.some(s => s.id === id)) : []; } catch { return []; } }
export default function App() {
  const [stage, setStage] = useState<'intro'|'cake'>('intro');
  const [selected, setSelected] = useState<string|null>(null);
  const [watched, setWatched] = useState<string[]>(readWatched);
  const [reduced, setReduced] = useState(false);
  const [mobile, setMobile] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const sliceRefs = useRef<Record<string, HTMLButtonElement|null>>({});
  const active = birthday.slices.find(s => s.id === selected);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 767px)');
    const update = () => { setReduced(motion.matches); setMobile(narrow.matches); };
    update(); motion.addEventListener('change',update); narrow.addEventListener('change',update);
    return () => { motion.removeEventListener('change',update); narrow.removeEventListener('change',update); };
  },[]);
  useEffect(() => { try { localStorage.setItem(storageKey,JSON.stringify(watched)); } catch { /* Presentation still works without storage. */ } },[watched]);
  useEffect(() => { if (selected) closeRef.current?.focus(); },[selected]);
  useEffect(() => {
    if (!selected || !mobile) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  },[selected,mobile]);
  function close() { const id = selected; setSelected(null); if(id) requestAnimationFrame(() => sliceRefs.current[id]?.focus()); }
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'Tab' && mobile) {
        const elements = panelRef.current?.querySelectorAll<HTMLElement>('button, video[controls], [tabindex="0"]');
        if (!elements?.length) return;
        const first = elements[0]; const last = elements[elements.length-1];
        if(e.shiftKey && document.activeElement===first) { e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement===last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown',handle); return () => window.removeEventListener('keydown',handle);
  },[selected,mobile]);
  function explore() { setStage('cake'); requestAnimationFrame(() => titleRef.current?.focus()); }
  const backgroundInert = mobile && !!active;
  return (
    <div className={`app-shell ${stage === 'intro' ? 'showing-intro' : ''}`}>
      <header className="site-header" inert={backgroundInert}>
        <button className="wordmark" onClick={() => { setSelected(null); setStage('intro'); }}>
          nine slices<Asterisk className="wordmark-star" size={24} weight="light" aria-hidden="true" />
        </button>
        <span className="header-note">A birthday made of love</span>
        <span className="edition">For {birthday.recipient}<Heart size={17} weight="light" aria-hidden="true" /></span>
      </header>

      {stage === 'intro' ? (
        <main className="intro">
          <div className="intro-copy">
            <p className="eyebrow">Today is all about you</p>
            <h1>Happy birthday, my favorite person.</h1>
            <p className="intro-description">Your friends each chose a slice of cake for you. Here are their stories, gathered in one place.</p>
            <button className="primary-button" onClick={explore}>Explore your cake<ArrowUpRight size={21} aria-hidden="true" /></button>
          </div>
          <figure className="intro-film">
            <VideoPlayer src={birthday.intro.video} poster={birthday.intro.poster} placeholderCover="/images/birthday-table.webp" label="Your birthday dedication" />
            <figcaption className="film-caption"><span>But first, a few words from me.</span><Heart size={24} weight="light" aria-hidden="true" /></figcaption>
          </figure>
        </main>
      ) : (
        <main className={`cake-page ${active ? 'has-selection' : ''}`}>
          <div className="cake-heading" inert={backgroundInert}>
            <h1 ref={titleRef} tabIndex={-1}>Everyone brought a little love.</h1>
            <p>Nine friends. Nine slices.<br />Choose any flavor to hear why they picked it for you.</p>
            <button className="text-button intro-back" onClick={() => { setSelected(null); setStage('intro'); }}><ArrowLeft size={17} aria-hidden="true" />Your opening message</button>
          </div>
          <div className="experience-grid">
            <section className="cake-area" aria-label="Interactive birthday cake" inert={backgroundInert}>
              <Suspense fallback={<div className="scene-loading">Setting the table…</div>}><Cake selected={selected} onSelect={setSelected} reduced={reduced} /></Suspense>
            </section>
            {active && <>
              <div className="mobile-scrim" onClick={close} aria-hidden="true" />
              <aside ref={panelRef} className="message-panel" role={mobile ? 'dialog' : 'region'} aria-modal={mobile || undefined} aria-labelledby="message-heading">
                <div className="panel-top"><span>A message for you</span><button ref={closeRef} className="close-button" onClick={close} aria-label="Close video"><X size={21} aria-hidden="true" /></button></div>
                <h2 id="message-heading">{active.flavor}</h2>
                <p className="chosen-by">Chosen by <strong>{active.friend}</strong></p>
                <VideoPlayer key={active.id} src={active.video} poster={active.poster} label={`${active.friend}: ${active.flavor}`} onEnded={() => setWatched(w => w.includes(active.id) ? w : [...w, active.id])} />
                <p className="panel-note">Why this slice made them think of you.</p>
                {watched.includes(active.id) && <span className="watched-label"><Check size={16} aria-hidden="true" />Watched. Yours to replay anytime.</span>}
              </aside>
            </>}
          </div>

          <section className="slice-collection" aria-label="Choose a cake slice" inert={backgroundInert}>
            <div className="collection-heading"><h2>Which one first?</h2><span aria-live="polite">{watched.length} of 9 stories watched</span></div>
            <div className="slice-list">{birthday.slices.map(s => (
              <button key={s.id} ref={node => { sliceRefs.current[s.id] = node; }} className={`slice-button ${selected === s.id ? 'selected' : ''}`} onClick={() => setSelected(s.id)} aria-pressed={selected === s.id}>
                <span className="flavor-swatch" aria-hidden="true" style={{ background: `linear-gradient(to bottom, ${s.appearance.frosting} 0% 26%, ${s.appearance.sponge} 26% 44%, ${s.appearance.filling} 44% 54%, ${s.appearance.sponge} 54% 76%, ${s.appearance.filling} 76% 84%, ${s.appearance.sponge} 84%)` }} />
                <span className="slice-text"><strong>{s.flavor}</strong><small>{s.friend}</small></span>
                <span className="slice-arrow">{watched.includes(s.id) ? <Check size={17} aria-label="Watched" /> : <ArrowUpRight size={16} aria-hidden="true" />}</span>
              </button>
            ))}</div>
          </section>
        </main>
      )}
      <footer inert={backgroundInert}><span>With love, from all of us.</span>{stage === 'cake' && <button className="text-button" onClick={() => setWatched([])}>Reset watched stories</button>}</footer>
    </div>
  );
}
