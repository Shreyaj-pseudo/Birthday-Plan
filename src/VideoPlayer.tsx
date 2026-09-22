import { useEffect, useRef, useState } from 'react';
export function VideoPlayer({ src, poster, label, onEnded }: { src: string; poster?: string; label: string; onEnded?: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  useEffect(() => { const video = ref.current; return () => { video?.pause(); }; }, [src, failed]);
  return <div className="video-frame">
    {src && !failed ? <video ref={ref} src={src} poster={poster} controls playsInline preload="metadata" aria-label={label} onEnded={onEnded} onError={() => setFailed(true)} /> : <div className="video-placeholder"><span className="placeholder-play" aria-hidden="true">▷</span><p>{failed ? 'This video couldn’t be opened' : 'A little message, coming soon'}</p><span>{failed ? 'Check the local video file and try again.' : 'Your video will live right here.'}</span><small>{failed ? 'VIDEO UNAVAILABLE' : 'VIDEO PLACEHOLDER'}</small>{failed && <button className="text-button" onClick={() => setFailed(false)}>Try again</button>}</div>}
  </div>;
}
