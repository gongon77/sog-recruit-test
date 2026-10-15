(() => {
  'use strict';

  const carousel = document.querySelector('[data-reward-carousel]');
  if (!carousel) return;

  const viewport = carousel.querySelector('.reward-reference-viewport');
  const status = carousel.querySelector('[data-reward-status]');
  const labels = ['お給料システム', '1日の報酬例', 'ブランドメッセージ'];
  let current = 0;

  const show = index => {
    current = (index + labels.length) % labels.length;
    viewport.style.setProperty('--reward-slide', current);
    status.textContent = `${current + 1} / ${labels.length} ${labels[current]}`;
    carousel.setAttribute('aria-label', `報酬デザイン・${current + 1}枚目：${labels[current]}`);
  };

  carousel.querySelector('[data-reward-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-reward-next]').addEventListener('click', () => show(current + 1));
  carousel.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
  });

  carousel.classList.add('is-ready');
})();
