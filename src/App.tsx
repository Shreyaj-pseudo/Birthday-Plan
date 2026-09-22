import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { birthday } from './content';
import { VideoPlayer } from './VideoPlayer';
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
    const narrow = matchMedia('(max-width: 760px)');
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
  return <div className="app-shell">
    <header className="site-header" inert={backgroundInert}><button className="wordmark" onClick={() => {setSelected(null);setStage('intro');}}>nine slices<span className="wordmark-star">✳</span></button><span className="header-note">A BIRTHDAY MADE OF LOVE</span><span className="edition">No. 09 <span>—</span> For {birthday.recipient}</span></header>
    {stage === 'intro' ? <main className="intro">
      <div className="intro-copy"><div className="eyebrow"><span/> A LITTLE SOMETHING, JUST FOR YOU</div><h1>Some things are<br/>better <em>shared.</em></h1><p className="intro-description">Nine slices. Nine people who love you.<br/>And a little story behind every one.</p><div className="intro-signature"><span className="fine-rule"/>But first, a few words from me.</div><button className="primary-button" onClick={explore}>Explore your cake <span>↗</span></button><span className="small-note">Take your time. It’s all yours.</span></div>
      <div className="intro-film"><div className="film-topline"><span>01 / A PERSONAL DEDICATION</span><span>♡</span></div><VideoPlayer src={birthday.intro.video} poster={birthday.intro.poster} label="Your birthday dedication"/><div className="film-caption"><span>To my favorite person.</span><span className="caption-flower">✳</span></div></div>
      <div className="intro-bottom"><span>Made of cake, stories & a whole lot of love.</span><span>YOUR BIRTHDAY COLLECTION / 09 SLICES</span></div>
    </main> : <main className={`cake-page ${active ? 'has-selection' : ''}`}>
      <div className="cake-heading" inert={backgroundInert}><div><div className="eyebrow">THE BIRTHDAY COLLECTION</div><h1 ref={titleRef} tabIndex={-1}>A slice of <em>everyone.</em></h1><p>Different flavors. Different stories. All for you.</p></div><button className="text-button intro-back" onClick={() => { setSelected(null);setStage('intro'); }}>↖ Your opening message</button></div>
      <div className="experience-grid"><section className="cake-area" aria-label="Interactive birthday cake" inert={backgroundInert}><Suspense fallback={<div className="scene-loading">Setting the table…</div>}><Cake selected={selected} onSelect={setSelected} reduced={reduced}/></Suspense></section>
      {active && <><div className="mobile-scrim" onClick={close} aria-hidden="true"/><aside ref={panelRef} className="message-panel" role={mobile ? 'dialog' : 'region'} aria-modal={mobile || undefined} aria-labelledby="message-heading"><div className="panel-top"><span>A SLICE, A STORY</span><button ref={closeRef} className="close-button" onClick={close} aria-label="Close video">×</button></div><span className="slice-number">{String(birthday.slices.indexOf(active)+1).padStart(2,'0')} / 09</span><h2 id="message-heading">{active.flavor}</h2><p className="chosen-by">Chosen with love by <strong>{active.friend}</strong></p><VideoPlayer key={active.id} src={active.video} poster={active.poster} label={`${active.friend}: ${active.flavor}`} onEnded={() => setWatched(w => w.includes(active.id) ? w : [...w,active.id])}/><p className="panel-note">A little piece of their heart, picked just for you.</p>{watched.includes(active.id) && <span className="watched-label">✓ A memory to come back to</span>}</aside></>}
      </div>
      <section className="slice-collection" aria-label="Choose a cake slice" inert={backgroundInert}><div className="collection-heading"><span>CHOOSE YOUR SLICE</span><span aria-live="polite">{watched.length} of 9 stories watched</span></div><div className="slice-list">{birthday.slices.map((s,i) => <button key={s.id} ref={node => {sliceRefs.current[s.id]=node;}} className={`slice-button ${selected===s.id ? 'selected' : ''}`} onClick={() => setSelected(s.id)} aria-pressed={selected===s.id}><span className="slice-index">{watched.includes(s.id) ? '✓' : String(i+1).padStart(2,'0')}</span><span className="flavor-dot" style={{background:s.appearance.frosting,boxShadow:`inset 0 -5px 0 ${s.appearance.sponge}`}}/><span className="slice-text"><strong>{s.flavor}</strong><small>{s.friend}</small></span><span className="slice-arrow">↗</span></button>)}</div></section>
    </main>}
    <footer inert={backgroundInert}><span>One cake. So many reasons you’re loved.</span><span>{stage==='cake' ? <button className="text-button" onClick={() => setWatched([])}>Reset watched stories</button> : 'MADE JUST FOR YOU'}<span className="footer-star">✳</span></span></footer>
  </div>;
}
