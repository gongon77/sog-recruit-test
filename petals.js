(() => {
  'use strict';

  if (new URLSearchParams(location.search).get('design') === '1') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrowScreen = window.matchMedia('(max-width: 640px)');
  const petals = [
    [4, 12, 15, -3, 34, -12, 54], [12, 17, 19, -11, -43, 18, -68],
    [21, 10, 14, -7, 30, -20, 42], [29, 14, 21, -16, -35, 15, -51],
    [38, 9, 17, -5, 51, -17, 61], [48, 16, 23, -19, -50, 12, -71],
    [57, 11, 16, -12, 37, -25, 56], [66, 15, 20, -2, -34, 16, -49],
    [75, 9, 18, -14, 44, -11, 63], [84, 13, 22, -8, -42, 22, -62],
    [93, 17, 15, -4, 31, -20, 48], [7, 10, 24, -20, -39, 13, -55],
    [33, 12, 18, -13, 42, -16, 59], [71, 16, 25, -22, -48, 21, -70],
  ];
  let layer;

  function removePetals() {
    layer?.remove();
    layer = undefined;
  }

  function showPetals() {
    removePetals();
    if (reducedMotion.matches) return;

    layer = document.createElement('div');
    layer.className = 'floral-petals';
    layer.setAttribute('aria-hidden', 'true');
    const fragment = document.createDocumentFragment();
    const count = narrowScreen.matches ? 8 : petals.length;

    petals.slice(0, count).forEach(([left, size, duration, delay, sway, back, end]) => {
      const petal = document.createElement('span');
      petal.className = 'floral-petal';
      petal.style.setProperty('--petal-left', `${left}%`);
      petal.style.setProperty('--petal-size', `${size}px`);
      petal.style.setProperty('--petal-duration', `${duration}s`);
      petal.style.setProperty('--petal-delay', `${delay}s`);
      petal.style.setProperty('--petal-sway', `${sway}px`);
      petal.style.setProperty('--petal-back', `${back}px`);
      petal.style.setProperty('--petal-end', `${end}px`);
      fragment.append(petal);
    });

    layer.append(fragment);
    layer.classList.toggle('is-paused', document.hidden);
    document.body.append(layer);
  }

  showPetals();
  [reducedMotion, narrowScreen].forEach(query => {
    if (query.addEventListener) query.addEventListener('change', showPetals);
    else query.addListener(showPetals);
  });
  document.addEventListener('visibilitychange', () => {
    layer?.classList.toggle('is-paused', document.hidden);
  });
})();
