import { useEffect, useState } from 'react';
import { ChromaFlow, FilmGrain, FlutedGlass, Shader, Swirl } from 'shaders/react';

export default function HomeHeroCanvas() {
  const [ready, setReady] = useState(false);
  useEffect(() => { const frame = requestAnimationFrame(() => setReady(true)); return () => cancelAnimationFrame(frame); }, []);
  return (
    <div className={`home-hero-shader${ready ? ' is-ready' : ''}`} aria-hidden="true">
      <Shader>
        <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
        <ChromaFlow baseColor="#ffffff" downColor="#ff5f03" leftColor="#ff5f03" rightColor="#ff5f03" upColor="#ff5f03" momentum={13} radius={3.5} />
        <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.12} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
        <FilmGrain strength={0.05} />
      </Shader>
    </div>
  );
}
