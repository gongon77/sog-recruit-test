(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'メニューを開く');
      }
    });
  }

  const dialog = document.getElementById('demo-dialog');
  const messageBox = document.getElementById('dialog-message');
  const closeButton = document.getElementById('dialog-close');
  const copyButton = document.getElementById('dialog-copy');
  let lastTrigger = null;

  const copyText = async value => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const temp = document.createElement('textarea');
    temp.value = value;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    const copied = document.execCommand('copy');
    temp.remove();
    if (!copied) throw new Error('コピーに失敗しました');
  };
  window.SOG_COPY_TEXT = copyText;

  document.querySelectorAll('[data-line]').forEach(button => {
    button.addEventListener('click', () => {
      window.SOG_CONFIG.track('line_click');
      lastTrigger = button;
      const dynamic = button.hasAttribute('data-dynamic-message') && window.SOG_SIM_MESSAGE;
      messageBox.textContent = dynamic || window.SOG_CONFIG.pageMessages[document.body.dataset.page] || 'SOGの求人について相談したいです。';
      if (!window.SOG_CONFIG.demoMode && window.SOG_CONFIG.lineUrl) {
        try {
          const destination = new URL(window.SOG_CONFIG.lineUrl);
          if (destination.protocol !== 'https:') throw new Error('HTTPSのURLが必要です');
          const params = window.SOG_CONFIG.pageParams[document.body.dataset.page] || {};
          Object.entries(params).forEach(([key, value]) => destination.searchParams.set(key, value));
          window.location.assign(destination.toString());
          return;
        } catch {
          messageBox.textContent = '応募先URLの設定を確認してください。送信は行われません。';
        }
      }
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
      closeButton.focus();
    });
  });
  if (dialog) {
    closeButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => lastTrigger?.focus());
    copyButton.addEventListener('click', async () => {
      try { await copyText(messageBox.textContent); copyButton.textContent = 'コピーしました'; }
      catch { copyButton.textContent = 'コピーできませんでした'; }
      setTimeout(() => { copyButton.textContent = '相談文をコピー'; }, 2500);
    });
  }
  document.querySelectorAll('[data-beginner-link]').forEach(link => {
    link.addEventListener('click', () => window.SOG_CONFIG.track('beginner_link_click'));
  });

  const gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    const image = gallery.querySelector('#gallery-image');
    const thumbs = Array.from(gallery.querySelectorAll('[data-gallery-thumb]'));
    let selected = 0;
    let transitionTimer = 0;
    const show = index => {
      selected = (index + thumbs.length) % thumbs.length;
      const thumb = thumbs[selected];
      clearTimeout(transitionTimer);
      image.classList.add('is-fading');
      transitionTimer = setTimeout(() => {
        image.src = thumb.dataset.src;
        image.alt = thumb.dataset.alt;
        thumbs.forEach((item, i) => item.setAttribute('aria-current', String(i === selected)));
        image.classList.remove('is-fading');
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160);
    };
    thumbs.forEach((thumb, i) => thumb.addEventListener('click', () => show(i)));
    gallery.querySelector('[data-gallery-prev]').addEventListener('click', () => show(selected - 1));
    gallery.querySelector('[data-gallery-next]').addEventListener('click', () => show(selected + 1));
  }
})();
