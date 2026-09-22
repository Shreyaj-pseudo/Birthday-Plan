import { useEffect, useRef, useState } from 'react';
import { Play, FilmSlate } from '@phosphor-icons/react';
export function VideoPlayer({ src, poster, placeholderCover, label, onEnded }: { src: string; poster?: string; placeholderCover?: string; label: string; onEnded?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  useEffect(() => { const video = ref.current; return () => { video?.pause(); }; }, [src, failed]);
  return <div className="video-frame">
    {src && !failed ? <video ref={ref} src={src} poster={poster} controls playsInline preload="metadata" aria-label={label} onEnded={onEnded} onError={() => setFailed(true)} /> : <div className={`video-placeholder ${placeholderCover && !failed ? 'has-cover' : ''}`}>
      {placeholderCover && !failed && <img className="placeholder-cover" src={placeholderCover} alt="A birthday candle, dessert plate, and blue ribbon on linen" fetchPriority="high" width={1200} height={900} />}
      <div className="placeholder-copy"><span className="placeholder-play" aria-hidden="true">{failed ? <FilmSlate size={28} weight="light" /> : <Play size={26} weight="light" />}</span><p>{failed ? 'This video couldn’t be opened' : 'A little message, coming soon'}</p><span>{failed ? 'Check the local video file and try again.' : 'Your video will live right here.'}</span><small>{failed ? 'VIDEO UNAVAILABLE' : 'VIDEO PLACEHOLDER'}</small>{failed && <button className="text-button" onClick={() => setFailed(false)}>Try again</button>}</div>
    </div>}
  </div>;
}
