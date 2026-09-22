// Progressive enhancement: the page stays fully readable without motion or JS.
const hero = document.querySelector<HTMLElement>('.hero--editorial');
if (hero) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = Array.from(document.querySelectorAll<HTMLElement>(
    '#selected-work .section-heading, .evidence__heading, .articles-preview .section-heading, .about-teaser, .faq-reference__heading',
  ));
  const cards = Array.from(document.querySelectorAll<HTMLElement>('#selected-work .project-card'));
  const visible = new Set<HTMLElement>();
  let frame = 0;
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const render = () => {
    frame = 0;
    if (preference.matches) return;
    const height = window.innerHeight;
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--hero-progress', String(clamp(-bounds.top / bounds.height)));
    visible.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const progress = clamp((height - rect.top) / (height * .7));
      element.style.setProperty('--entry-progress', String(progress));
    });
  };
  const schedule = () => {
    if (!frame && !preference.matches) frame = requestAnimationFrame(render);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const element = target as HTMLElement;
      if (isIntersecting) visible.add(element);
      else visible.delete(element);
    });
    schedule();
  }, { rootMargin: '80px' });
  targets.forEach((element) => { element.classList.add('motion-reveal'); observer.observe(element); });
  cards.forEach((element) => observer.observe(element));
  const reset = () => {
    if (preference.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      hero.style.removeProperty('--hero-progress');
      [...targets, ...cards].forEach((element) => element.style.removeProperty('--entry-progress'));
    } else schedule();
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  preference.addEventListener('change', reset);
  schedule();
}
