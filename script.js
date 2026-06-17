// =========================================================
// MAXINE ISAAC — PORTFOLIO  (light + bold-colour system)
// vanilla, no frameworks. Same outcomes as Framer Motion patterns:
//   - reveal w/ auto-stagger
//   - word-by-word hero entrance
//   - magnetic buttons
//   - marquee pause on hover (CSS)
//   - View Transitions API for cross-page fades (CSS)
//   - nav scroll state · active nav · year · SGT clock · newsletter · chip fade
// All respects prefers-reduced-motion via CSS guards.
// =========================================================
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Word-by-word hero headline entrance ----- //
  // Recursively splits text nodes into <span class="word"> while leaving
  // existing inline elements (<em>, <br>) intact.
  var hero = document.querySelector('.hero');
  var heroTitle = hero && hero.querySelector('.hero__title');
  if (heroTitle && !reduced) {
    var index = { i: 0 };
    (function splitWords(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); }
            else {
              var span = document.createElement('span');
              span.className = 'word';
              span.textContent = p;
              span.style.transitionDelay = (index.i * 55) + 'ms';
              index.i += 1;
              frag.appendChild(span);
            }
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          splitWords(child);
        }
      });
    })(heroTitle);
    // Trigger reveal on next frame so the initial styles are applied.
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });
  } else if (hero) {
    hero.classList.add('is-ready');
  }

  // ----- Auto-stagger reveal for grids/lists -----
  var STAGGER = [
    { container: '.paths',        child: '.path',         step: 80 },
    { container: '.index',        child: '.index__row',   step: 75 },
    { container: '.facts',        child: '.fact',         step: 70 },
    { container: '.desk__list',   child: '.desk__item',   step: 55 },
    { container: '.service-grid', child: '.service-card', step: 90 },
    { container: '.quotes',       child: '.quote-card',   step: 110 },
    { container: '.cover',        child: '.cover__visual,.cover__body', step: 120 }
  ];
  STAGGER.forEach(function (cfg) {
    document.querySelectorAll(cfg.container).forEach(function (el) {
      el.classList.remove('reveal'); el.classList.remove('in');
      var kids = el.querySelectorAll(cfg.child);
      Array.prototype.forEach.call(kids, function (child, i) {
        child.classList.add('reveal');
        child.style.transitionDelay = (i * cfg.step) + 'ms';
      });
    });
  });

  // ----- Scroll reveal -----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ----- Magnetic buttons (subtle mouse-follow) ----- //
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.style.transition = (btn.style.transition || '') + ', transform 0.25s cubic-bezier(0.22,1,0.36,1)';
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (x * 0.18) + 'px, ' + (y * 0.18) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // ----- Nav scroll state -----
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 16); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ----- Active nav link -----
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var isCase = ['uje', 'doki', 'nike', 'starbucks', 'aikiforest'].some(function (s) { return path.indexOf(s) === 0; });
  var isWritingArticle = path.indexOf('writing-') === 0;
  document.querySelectorAll('.nav__links a').forEach(function (a) {
    var target = (a.getAttribute('href') || '').split('/').pop();
    if (target === path
        || (isCase && target === 'work.html')
        || (isWritingArticle && target === 'writing.html')) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  });

  // ----- Year + live Singapore clock -----
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  var clocks = document.querySelectorAll('[data-clock]');
  if (clocks.length) {
    var tick = function () {
      var t;
      try { t = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Singapore', hour12: false }); }
      catch (e) { t = new Date().toLocaleTimeString('en-GB', { hour12: false }); }
      clocks.forEach(function (el) { el.textContent = t + ' SGT'; });
    };
    tick(); setInterval(tick, 1000);
  }

  // ----- Newsletter (front-end only) -----
  var form = document.querySelector('.subscribe__form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input'); var btn = form.querySelector('button');
      if (!input || !btn) return;
      if (!input.value || input.value.indexOf('@') === -1) { input.focus(); return; }
      btn.textContent = '✓ Added'; btn.style.color = 'var(--ink)'; input.value = '';
    });
  }

  // ----- Sample newsletter lightbox (scrollable full-image overlay) -----
  var lightbox = document.getElementById('lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    var lbImg = lightbox.querySelector('.lightbox__img');
    var lbClose = lightbox.querySelector('.lightbox__close');
    var lbScroll = lightbox.querySelector('.lightbox__scroll');
    var closeLB = function () { if (lightbox.open) lightbox.close(); };
    document.querySelectorAll('.samples__btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.getAttribute('data-src');
        var alt = btn.getAttribute('data-alt') || '';
        if (!src || !lbImg) return;
        lbImg.setAttribute('src', src);
        lbImg.setAttribute('alt', alt);
        lightbox.showModal();
        document.body.classList.add('lightbox-open');
        if (lbScroll) lbScroll.scrollTop = 0;
      });
    });
    if (lbClose) lbClose.addEventListener('click', closeLB);
    if (lbScroll) {
      lbScroll.addEventListener('click', function (e) {
        if (e.target === lbScroll) closeLB();
      });
    }
    lightbox.addEventListener('close', function () {
      document.body.classList.remove('lightbox-open');
      if (lbImg) lbImg.setAttribute('src', '');
    });
  }

  // ----- Chip fade near footer -----
  var footer = document.querySelector('.foot');
  if (footer && 'IntersectionObserver' in window) {
    var fo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { document.body.classList.toggle('at-foot', e.isIntersecting); });
    }, { rootMargin: '0px 0px -10% 0px' });
    fo.observe(footer);
  }
})();
