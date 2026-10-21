(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  if (menuButton && nav) {
    const mobile = window.matchMedia('(max-width: 760px)');
    const drawer = document.createElement('aside');
    const drawerLinks = document.createElement('nav');
    const eyebrow = document.createElement('p');
    const signature = document.createElement('p');
    drawer.id = 'mobile-menu-panel';
    drawer.className = 'site-menu-drawer';
    drawer.setAttribute('aria-hidden', 'true');
    drawer.inert = true;
    drawerLinks.className = 'site-menu-drawer__links';
    drawerLinks.setAttribute('aria-label', 'モバイルメニュー');
    nav.querySelectorAll('a').forEach(link => drawerLinks.append(link.cloneNode(true)));
    eyebrow.className = 'site-menu-drawer__eyebrow';
    eyebrow.textContent = 'MENU / SUPER OTONA GIRLS';
    signature.className = 'site-menu-drawer__signature';
    signature.textContent = 'RECRUIT / OSAKA';
    drawer.append(eyebrow, drawerLinks, signature);
    document.body.append(drawer);
    menuButton.setAttribute('aria-controls', drawer.id);

    const pageContent = [
      document.querySelector('main'),
      document.querySelector('.site-footer'),
      document.querySelector('.mobile-cta'),
      document.querySelector('.site-header .brand'),
      document.querySelector('.site-header .header-cta')
    ].filter(Boolean);
    const drawerItems = [...drawerLinks.querySelectorAll('a')];
    const isOpen = () => menuButton.getAttribute('aria-expanded') === 'true';
    const setMenuOpen = open => {
      const next = Boolean(open && mobile.matches);
      if (!next && drawer.contains(document.activeElement)) {
        (mobile.matches ? menuButton : nav.querySelector('a'))?.focus({ preventScroll: true });
      }
      menuButton.setAttribute('aria-expanded', String(next));
      menuButton.setAttribute('aria-label', next ? 'メニューを閉じる' : 'メニューを開く');
      drawer.setAttribute('aria-hidden', String(!next));
      drawer.inert = !next;
      pageContent.forEach(element => { element.inert = next; });
      document.documentElement.classList.toggle('menu-open', next);
      document.body.classList.toggle('menu-open', next);
      if (next) requestAnimationFrame(() => drawerItems[0]?.focus({ preventScroll: true }));
    };

    menuButton.addEventListener('click', () => setMenuOpen(!isOpen()));
    drawerLinks.addEventListener('click', event => {
      if (event.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('pointerdown', event => {
      if (isOpen() && !drawer.contains(event.target) && !menuButton.contains(event.target)) setMenuOpen(false);
    });
    document.addEventListener('keydown', event => {
      if (!isOpen()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenuOpen(false);
      } else if (event.key === 'Tab') {
        const focusable = [menuButton, ...drawerItems];
        const current = focusable.indexOf(document.activeElement);
        const direction = event.shiftKey ? -1 : 1;
        event.preventDefault();
        const next = current < 0
          ? (event.shiftKey ? focusable.length - 1 : 0)
          : (current + direction + focusable.length) % focusable.length;
        focusable[next].focus();
      }
    });
    window.addEventListener('resize', () => { if (!mobile.matches && isOpen()) setMenuOpen(false); });
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

  // Offer a route back to the beginning only when the visitor reaches the page end.
  if (document.querySelector('.site-footer')) {
    const backToTop = document.createElement('button');
    backToTop.type = 'button';
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'ページの先頭へ戻る');
    backToTop.setAttribute('aria-hidden', 'true');
    backToTop.inert = true;
    backToTop.tabIndex = -1;
    backToTop.innerHTML = '<span aria-hidden="true">↑</span><span>上に戻る</span>';
    document.body.append(backToTop);

    let frame = 0;
    const updateBackToTop = () => {
      frame = 0;
      const pageHeight = document.documentElement.scrollHeight;
      const nearEnd = window.scrollY > 0 &&
        window.scrollY + window.innerHeight >= pageHeight - Math.max(120, window.innerHeight * .16);
      backToTop.classList.toggle('is-visible', nearEnd);
      backToTop.setAttribute('aria-hidden', String(!nearEnd));
      backToTop.inert = !nearEnd;
      backToTop.tabIndex = nearEnd ? 0 : -1;
    };
    const scheduleBackToTop = () => {
      if (!frame) frame = requestAnimationFrame(updateBackToTop);
    };
    window.addEventListener('scroll', scheduleBackToTop, { passive: true });
    window.addEventListener('resize', scheduleBackToTop);
    window.addEventListener('load', scheduleBackToTop);
    scheduleBackToTop();
    backToTop.addEventListener('click', () => {
      document.querySelector('.site-header .brand')?.focus({ preventScroll: true });
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    });
  }
})();
