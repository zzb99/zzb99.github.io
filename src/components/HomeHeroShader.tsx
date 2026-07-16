import { lazy, Suspense, useEffect, useState } from 'react';

const HomeHeroCanvas = lazy(() => import('./HomeHeroCanvas'));

export default function HomeHeroShader() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPowerMobile = window.innerWidth < 768 && (navigator.hardwareConcurrency ?? 8) <= 4;
    if (reduceMotion || lowPowerMobile) return;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      setEnabled(true);
    };
    const timer = window.setTimeout(start, 12_000);
    window.addEventListener('pointermove', start, { once: true, passive: true });
    window.addEventListener('pointerdown', start, { once: true, passive: true });
    window.addEventListener('keydown', start, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', start);
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
    };
  }, []);

  if (!enabled) return null;
  return <Suspense fallback={null}><HomeHeroCanvas /></Suspense>;
}
