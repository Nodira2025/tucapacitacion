const home = document.querySelector<HTMLElement>('.human-home');
if (home) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const control = home.querySelector<HTMLButtonElement>('.b-motion');
  let userPaused = false;
  try {
    userPaused = sessionStorage.getItem('tc-motion-paused') === 'true';
  } catch {}
  const animations = new Set<Animation>();
  const paused = () => preference.matches || userPaused;
  function syncMotion() {
    if (!home || !control) return;
    home.dataset.motion = paused() ? 'paused' : 'running';
    control.textContent = preference.matches
      ? 'Movimiento reducido'
      : userPaused
        ? '▶ Activar animaciones'
        : 'Ⅱ Pausar animaciones';
    control.setAttribute('aria-pressed', String(paused()));
    control.disabled = preference.matches;
    if (paused()) animations.forEach((animation) => animation.finish());
  }
  function reveal(element: Element, delay = 0) {
    if (paused()) return;
    const animation = element.animate(
      [
        { opacity: 0, transform: 'translateY(22px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 700, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' },
    );
    animations.add(animation);
    animation.finished
      .then(() => animations.delete(animation))
      .catch(() => animations.delete(animation));
  }
  if (control) {
    control.hidden = false;
    control.addEventListener('click', () => {
      userPaused = !userPaused;
      try {
        sessionStorage.setItem('tc-motion-paused', String(userPaused));
      } catch {}
      syncMotion();
    });
  }
  syncMotion();
  preference.addEventListener('change', syncMotion);
  home.querySelectorAll('[data-intro]').forEach((element, index) => reveal(element, index * 90));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    home.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
  }
}
