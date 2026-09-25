// Scroll motion is progressive enhancement; every section remains readable without JavaScript.
const hero = document.querySelector<HTMLElement>('.home-hero');
const chapters = Array.from(document.querySelectorAll<HTMLElement>('[data-capability]'));
const panels = Array.from(document.querySelectorAll<HTMLElement>('[data-capability-panel]'));
const counter = document.querySelector<HTMLElement>('[data-capability-count]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const render = () => {
  frame = 0;
  if (reducedMotion.matches) {
    hero?.style.removeProperty('--hero-progress');
    return;
  }
  if (hero) {
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty('--hero-progress', String(clamp(-bounds.top / bounds.height)));
  }
  if (window.innerWidth <= 900 || chapters.length === 0) return;
  const focusLine = window.innerHeight * .47;
  const activeIndex = chapters.reduce((closest, chapter, index) => {
    const bounds = chapter.getBoundingClientRect();
    const distance = Math.abs((bounds.top + bounds.bottom) / 2 - focusLine);
    const current = chapters[closest].getBoundingClientRect();
    const currentDistance = Math.abs((current.top + current.bottom) / 2 - focusLine);
    return distance < currentDistance ? index : closest;
  }, 0);
  const activeName = chapters[activeIndex].dataset.capability;
  panels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.capabilityPanel === activeName));
  chapters.forEach((chapter, index) => chapter.classList.toggle('is-active', index === activeIndex));
  if (counter) counter.textContent = String(activeIndex + 1).padStart(2, '0') + ' — 04';
};
const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
const revealTargets = Array.from(document.querySelectorAll<HTMLElement>('.home-section-heading, .home-work__item, .home-proof__featured, .home-media__list, .home-about'));
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) {
      target.classList.add('is-visible');
      revealObserver.unobserve(target);
    }
  });
}, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
if (!reducedMotion.matches) {
  revealTargets.forEach((element) => { element.classList.add('motion-reveal'); revealObserver.observe(element); });
}
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
window.addEventListener('pageshow', schedule);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    revealTargets.forEach((element) => element.classList.add('is-visible'));
    panels.forEach((panel, index) => panel.classList.toggle('is-active', index === 0));
  }
  schedule();
});
schedule();
