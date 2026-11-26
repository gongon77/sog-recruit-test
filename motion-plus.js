/* =========================================================
   motion-plus.js
   求人サイト全ページ共通の動き。motion-plus.css とセットで使う。
   文面・金額は変えず、表示の演出だけを加える。
   ページごとの違いは下の PAGES にまとめている。
   ========================================================= */
(() => {
  'use strict';

  if (new URLSearchParams(location.search).get('design') === '1') return;

  const root = document.documentElement;
  const page = document.body.dataset.page || '';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrow = window.matchMedia('(max-width: 640px)').matches;
  root.classList.add('mp');

  /* ---------- ページごとの設定 ---------- */
  const PAGES = {
    experienced: {
      heading: '.top-a-hero__copy h1',
      headingLine: true,
      heroImg: '.top-a-hero__media img',
      heroBox: '.top-a-hero__visual',
      layerIn: '.top-a-hero__media',
      sparkleX: [4, 96],
      before: ['.top-a-hero__copy .top-a-kicker'],
      after: ['.top-a-hero__lead', '.top-a-hero__reward', '.top-a-hero__actions', '.top-a-hero__guide', '.top-hero-jump__button']
    },
    beginner: {
      heading: '.b-hero-copy h1',
      heroImg: '.b-hero-photo',
      heroBox: '.b-hero-visual',
      layerAfter: '.b-hero-photo',
      sparkleX: [44, 97],
      before: ['.b-hero-copy .b-eyebrow', '.b-hero-kicker'],
      after: ['.b-hero-lead', '.b-hero-signature', '.b-guide--hero', '.b-hero-actions', '.b-quicklinks a']
    },
    staff: {
      heading: '.staff-hero-copy h1',
      layerPrepend: '.staff-hero',
      sparkleX: [3, 97],
      before: ['.staff-hero-copy .staff-eyebrow', '.staff-hero-intro'],
      after: ['.staff-hero-copy > :not(h1):not(.staff-eyebrow):not(.staff-hero-intro)', '.staff-welcome']
    },
    simulator: {
      heading: '.sim-intro h1'
    }
  };
  const config = PAGES[page] || {};

  /* 写真が幕のように現れる */
  const WIPE = [
    // 経験者TOP
    '.ev-monochrome img', '.ev-more-photo img', '.simulation-case__photo img', '.top-a-promise__photo img',
    '.waiting-photo-grid figure img', '.ev-support-photo img', '.e-help-support-photo img', '.e-contact-logo-window img',
    // 未経験・Wワーク
    '.b-editorial-photo img', '.b-service-still img', '.b-lifestyle-photo img', '.b-support-photo img',
    '.b-case-photo img', '.b-reward-poster img', '.gallery-main img',
    // スタッフ紹介
    '.staff-photo-art'
  ];
  /* 中の要素が一つずつ現れる */
  const STAGGER = [
    '.ev-concerns-art__list', '.ev-support-points', '.simulation-timeline',
    '.b-service-no-list ul', '.b-reward-posters', '.b-schedule-list',
    '.staff-profile-message', '.staff-profile-copy'
  ];
  /* 金の飾り線 */
  const LINES = [
    '.ev-ornament', '.e-rule', '.ev-support-rule', '.e-help-ornament', '.simulation-stories__rule',
    '.b-ornament', '.staff-ornament'
  ];
  /* 金額のカウントアップ */
  const COUNTS = [
    '.top-a-hero__reward strong', '.simulation-calculation__total strong', '.b-case-calculation > div > strong'
  ];

  /* ---------- 読み進みライン＋ヘッダーの影＋写真の奥行き ---------- */
  const header = document.querySelector('.site-header');
  const heroImg = config.heroImg && document.querySelector(config.heroImg);
  const heroBox = config.heroBox && document.querySelector(config.heroBox);
  heroImg?.classList.add('mp-hero-img');

  const progress = document.createElement('div');
  progress.className = 'mp-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty('--mp-progress', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    header?.classList.toggle('mp-scrolled', y > 12);
    if (!reduceMotion && heroImg && heroBox) {
      const h = heroBox.offsetHeight;
      // 拡大した余白（上下約3%）を超えない範囲で動かす
      if (y < h * 1.2) heroImg.style.setProperty('--mp-hero-shift', `${Math.min(y * 0.1, h * 0.028).toFixed(1)}px`);
    }
  };
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();

  if (reduceMotion) return;

  // 隠した状態（clip-path）の要素は「見えていない」と判定されるため、
  // byParent=true のときは親要素が画面に入ったかで判定する
  const onView = (elements, callback, options = { threshold: 0.15 }, byParent = false) => {
    if (!('IntersectionObserver' in window)) { elements.forEach(callback); return; }
    const owners = new Map();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        (owners.get(entry.target) || []).forEach(callback);
      });
    }, options);
    elements.forEach(el => {
      const target = byParent && el.parentElement ? el.parentElement : el;
      if (!owners.has(target)) { owners.set(target, []); observer.observe(target); }
      owners.get(target).push(el);
    });
  };

  /* ---------- 最初の画面：見出しを一文字ずつ ---------- */
  let headingEnd = 0.4;
  const heading = config.heading && document.querySelector(config.heading);
  if (heading) {
    const label = heading.textContent.replace(/\s+/g, ' ').trim();
    const chars = [];
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent.replace(/\s+/g, ' ');
          if (!text.trim()) return;
          const fragment = document.createDocumentFragment();
          [...text].forEach(char => {
            if (char === ' ') { fragment.append(' '); return; }
            // 句読点や「？」は前の文字とくっつけ、行頭に来ないようにする
            if (/[、。，．,.？！?!）」』】〕…‥ー〜～♪]/.test(char) && chars.length) {
              chars[chars.length - 1].textContent += char;
              return;
            }
            const span = document.createElement('span');
            span.className = 'mp-char';
            span.setAttribute('aria-hidden', 'true');
            span.textContent = char;
            chars.push(span);
            fragment.append(span);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(heading);
    heading.setAttribute('aria-label', label); // 読み上げは元の一文のまま
    const start = 0.5;
    const step = Math.min(0.055, 1.2 / Math.max(chars.length, 1));
    chars.forEach((span, i) => span.style.animationDelay = `${(start + i * step).toFixed(3)}s`);
    headingEnd = start + chars.length * step;
    if (config.headingLine) heading.classList.add('mp-heading-line');
    heading.style.setProperty('--mp-heading-end', `${(headingEnd + 0.35).toFixed(2)}s`);
  }

  /* 見出しの前後の要素も順番に */
  const rise = (selectors, base, gap) => {
    let n = 0;
    (selectors || []).forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.classList.add('mp-rise');
        el.style.setProperty('--mp-rise-delay', `${(base + n * gap).toFixed(2)}s`);
        n += 1;
      });
    });
  };
  rise(config.before, 0.2, 0.12);
  rise(config.after, headingEnd + 0.15, 0.13);

  /* 光の流れときらめき */
  const layerHost = (config.layerIn && document.querySelector(config.layerIn))
    || (config.layerAfter && document.querySelector(config.layerAfter))
    || (config.layerPrepend && document.querySelector(config.layerPrepend));
  if (layerHost) {
    const layer = document.createElement('div');
    layer.className = 'mp-hero-layer';
    layer.setAttribute('aria-hidden', 'true');
    const sweep = document.createElement('span');
    sweep.className = 'mp-sweep';
    layer.append(sweep);
    const [minX, maxX] = config.sparkleX || [4, 96];
    const dots = [
      [.05, 22, 5, 4.2, 0.4], [.14, 64, 4, 5.1, 2.2], [.22, 38, 6, 3.8, 1.1], [.31, 78, 3, 4.6, 3.0],
      [.40, 18, 4, 5.4, 0.9], [.47, 56, 5, 4.0, 2.6], [.55, 30, 3, 4.8, 1.7], [.62, 84, 6, 5.6, 0.2],
      [.70, 14, 4, 4.4, 3.4], [.78, 48, 3, 5.0, 1.4], [.86, 70, 5, 4.1, 2.0], [.94, 26, 4, 5.3, 0.7],
      [.10, 88, 3, 4.9, 1.9], [.52, 8, 4, 4.3, 2.9]
    ];
    dots.slice(0, narrow ? 8 : dots.length).forEach(([t, y, s, d, delay]) => {
      const dot = document.createElement('span');
      dot.className = 'mp-sparkle';
      const x = minX + (maxX - minX) * t;
      dot.style.cssText = `--x:${x.toFixed(1)}%;--y:${y}%;--s:${s}px;--d:${d}s;--delay:${delay}s`;
      layer.append(dot);
    });
    if (config.layerIn) layerHost.append(layer);
    else if (config.layerAfter) layerHost.after(layer);
    else { layerHost.classList.add('mp-has-layer'); layerHost.prepend(layer); }
  }

  /* ---------- スクロールで現れる演出 ---------- */
  const wipes = [...document.querySelectorAll(WIPE.join(','))];
  wipes.forEach(el => el.classList.add('mp-wipe'));
  document.querySelectorAll('.waiting-photo-grid, .b-reward-posters').forEach(group => {
    group.querySelectorAll('.mp-wipe').forEach((el, i) => el.style.setProperty('--i', i));
  });
  onView(wipes, el => el.classList.add('mp-in'), { threshold: 0, rootMargin: '0px 0px -12% 0px' }, true);

  const lists = [...document.querySelectorAll(STAGGER.join(','))];
  lists.forEach(list => {
    [...list.children].forEach((child, i) => {
      if (child.matches('h4, br')) return;
      child.classList.add('mp-stagger');
      child.style.setProperty('--i', i);
    });
  });
  onView(lists, el => el.classList.add('mp-in'), { threshold: 0, rootMargin: '0px 0px -12% 0px' });

  const lines = [...document.querySelectorAll(LINES.join(','))];
  lines.forEach(line => line.classList.add('mp-draw'));
  onView(lines, el => el.classList.add('is-drawn'), { threshold: 0, rootMargin: '0px 0px -8% 0px' }, true);

  /* ---------- 金額のカウントアップ ---------- */
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const counters = [];
  document.querySelectorAll(COUNTS.join(',')).forEach(strong => {
    const textNode = [...strong.childNodes].find(n => n.nodeType === Node.TEXT_NODE && /\d/.test(n.textContent));
    if (!textNode) return;
    const original = textNode.textContent;
    const value = Number(original.replace(/[^\d]/g, ''));
    if (!value) return;
    const span = document.createElement('span');
    span.className = 'mp-count';
    span.textContent = original;
    textNode.replaceWith(span);
    strong.__mp = { span, original, value };
    counters.push(strong);
  });
  onView(counters, strong => {
    const { span, original, value } = strong.__mp;
    // 最終の幅で固定し、数字が増えても周りが動かないようにする
    span.style.minWidth = `${span.getBoundingClientRect().width}px`;
    span.textContent = '0';
    const inHero = strong.closest('.top-a-hero');
    setTimeout(() => {
      const start = performance.now();
      const duration = 1600;
      const step = now => {
        const t = Math.min(1, (now - start) / duration);
        span.textContent = (Math.round(value * easeOut(t) / 1000) * 1000).toLocaleString('ja-JP');
        if (t < 1) requestAnimationFrame(step);
        else span.textContent = original; // 最後は必ず元の表記に戻す
      };
      requestAnimationFrame(step);
    }, inHero ? (headingEnd + 0.5) * 1000 : 350);
  }, { threshold: 0, rootMargin: '0px 0px -15% 0px' });

  /* ---------- 報酬シミュレーター：結果が変わったら光る ---------- */
  const result = document.getElementById('result-month');
  if (result) {
    const box = result.closest('.sim-result') || result;
    let timer = 0;
    new MutationObserver(() => {
      // 数字が動いている間は光り続け、止まったらゆっくり消える
      box.classList.add('mp-bump');
      clearTimeout(timer);
      timer = setTimeout(() => box.classList.remove('mp-bump'), 700);
    }).observe(result, { childList: true, characterData: true, subtree: true });
  }
})();
