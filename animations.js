(() => {
  'use strict';
  const designMode = new URLSearchParams(location.search).get('design') === '1';
  if (designMode) {
    document.documentElement.classList.add('design-mode');
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.reveal, .intro-reveal');
  if (!targets.length) return;
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px 70px 0px', threshold: .04 });
  targets.forEach(target => observer.observe(target));
})();
