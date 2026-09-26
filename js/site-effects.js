(function() {
  const CONSENT_KEY = 'stockpilo_cookie_consent';
  const banner = document.getElementById('cookie-banner');
  const btnAccept  = document.getElementById('cookie-accept');
  const btnDecline = document.getElementById('cookie-decline');

  if (!banner || localStorage.getItem(CONSENT_KEY)) return;

  // Show banner after short delay
  setTimeout(() => {
    banner.style.pointerEvents = 'auto';
    banner.style.transform = 'translateX(-50%) translateY(0)';
    banner.style.opacity   = '1';
  }, 1200);

  function dismiss(choice) {
    localStorage.setItem(CONSENT_KEY, choice);
    banner.style.transform = 'translateX(-50%) translateY(120px)';
    banner.style.opacity   = '0';
    banner.style.pointerEvents = 'none';
    setTimeout(() => banner.remove(), 500);
  }

  btnAccept.addEventListener('click', () => dismiss('accepted'));
  btnDecline.addEventListener('click', () => dismiss('declined'));

  btnAccept.addEventListener('mouseenter', () => {
    btnAccept.style.transform = 'translateY(-1px)';
    btnAccept.style.boxShadow = '0 6px 20px rgba(45,107,228,.6)';
  });
  btnAccept.addEventListener('mouseleave', () => {
    btnAccept.style.transform = '';
    btnAccept.style.boxShadow = '0 4px 16px rgba(45,107,228,.4)';
  });
  btnDecline.addEventListener('mouseenter', () => { btnDecline.style.color = 'rgba(255,255,255,.75)'; });
  btnDecline.addEventListener('mouseleave', () => { btnDecline.style.color = 'rgba(255,255,255,.4)'; });
})();

  // ── SplittingText (Clear The Noise) ───────────────
  (function () {
    const container = document.getElementById('clear-noise-text');
    if (!container) return;

    const words = ['Clear', 'The', 'Noise.'];
    const els = words.map(w => {
      const span = document.createElement('span');
      span.textContent = w;
      span.style.cssText =
        'display:inline-block;opacity:0;transform:translateX(150px);' +
        'will-change:transform,opacity;';
      container.appendChild(span);
      return span;
    });

    window.addEventListener('aboutTaglineReveal', function handler() {
      window.removeEventListener('aboutTaglineReveal', handler);
      els.forEach((el, i) => {
        setTimeout(() => {
          el.style.transition = 'transform 0.7s ease-out, opacity 0.7s ease-out';
          el.style.transform  = 'translateX(0)';
          el.style.opacity    = '1';
        }, i * 200);
      });
    });
  })();

  // ── FallingText (H2 + tagline, simultaneous) ──────
  (function () {
    const h2     = document.getElementById('about-h2');
    const tagline = document.getElementById('about-tagline');
    if (!h2) return;

    window.addEventListener('aboutTypewriterDone', function handler() {
      window.removeEventListener('aboutTypewriterDone', handler);
      if (window.Matter) runFall();
      else {
        const t = setInterval(() => { if (window.Matter) { clearInterval(t); runFall(); } }, 50);
      }
    });

    // Generic: measure elements, return data array + fixed overlay divs/imgs
    function measure(domEls) {
      return domEls.map(source => {
        const r   = source.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return null;
        const cs  = window.getComputedStyle(source);
        const isImg = source.tagName === 'IMG';
        const d = {
          cx: r.left + r.width / 2,
          cy: r.top  + r.height / 2,
          w:  r.width,
          h:  r.height,
          isImg,
          src:        isImg ? source.src : null,
          text:       isImg ? null : source.textContent,
          color:      cs.color,
          fontSize:   cs.fontSize,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily,
        };
        return d;
      }).filter(Boolean);
    }

    function makeOverlays(data) {
      return data.map(d => {
        const el = d.isImg ? document.createElement('img') : document.createElement('div');
        if (d.isImg) {
          el.src = d.src;
          el.style.cssText =
            'position:fixed;pointer-events:none;z-index:9999;' +
            'transform-origin:center center;will-change:transform;object-fit:contain;' +
            `left:${d.cx - d.w/2}px;top:${d.cy - d.h/2}px;` +
            `width:${d.w}px;height:${d.h}px;opacity:0.75;`;
        } else {
          el.textContent = d.text;
          el.style.cssText =
            'position:fixed;pointer-events:none;z-index:9999;user-select:none;' +
            'display:flex;align-items:center;justify-content:center;' +
            'transform-origin:center center;will-change:transform;' +
            `left:${d.cx - d.w/2}px;top:${d.cy - d.h/2}px;` +
            `width:${d.w}px;height:${d.h}px;` +
            `color:${d.color};font-size:${d.fontSize};` +
            `font-weight:${d.fontWeight};font-family:${d.fontFamily};`;
        }
        document.body.appendChild(el);
        return el;
      });
    }

    function wrapWords(node) {
      if (node.nodeType === 3) {
        const parts = node.textContent.split(/(\s+)/);
        const frag  = document.createDocumentFragment();
        parts.forEach(p => {
          if (/\S/.test(p)) {
            const s = document.createElement('span');
            s.dataset.fw = '1'; s.style.display = 'inline-block'; s.textContent = p;
            frag.appendChild(s);
          } else if (p) frag.appendChild(document.createTextNode(p));
        });
        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        Array.from(node.childNodes).forEach(wrapWords);
      }
    }

    function runFall() {
      const { Engine, Bodies, Body, World, Runner } = Matter;

      // ── H2 elements ──────────────────────────────
      const textEl    = document.getElementById('about-tt-text');
      const savedHTML = h2.innerHTML;
      if (textEl) wrapWords(textEl);
      const h2Data = measure(Array.from(h2.querySelectorAll('[data-fw]')));
      h2.innerHTML = savedHTML;
      h2.style.visibility = 'hidden';

      // ── Tagline elements ──────────────────────────
      // Collect visible leaf elements: text spans + logo img
      const taglineEls = tagline
        ? Array.from(tagline.querySelectorAll('span, img')).filter(el => {
            const r = el.getBoundingClientRect();
            return r.width > 1 && r.height > 1;
          })
        : [];
      const tagData = measure(taglineEls);
      if (tagline) tagline.style.visibility = 'hidden';

      // ── All data + overlays ───────────────────────
      const allData = [...h2Data, ...tagData];
      const allEls  = makeOverlays(allData);

      // ── Physics ───────────────────────────────────
      const engine = Engine.create({ gravity: { x: 0, y: 0.8 } });
      const bodies = allData.map(d => {
        const b = Bodies.rectangle(d.cx, d.cy, d.w, d.h, {
          restitution: 0.6, frictionAir: 0.02, friction: 0.3,
        });
        Body.setVelocity(b, { x: (Math.random() - 0.5) * 5, y: Math.random() * -2 });
        Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.1);
        return b;
      });
      const ground = Bodies.rectangle(
        window.innerWidth / 2, window.innerHeight + 40, window.innerWidth * 3, 60,
        { isStatic: true }
      );
      World.add(engine.world, [...bodies, ground]);
      const runner = Runner.create();
      Runner.run(runner, engine);

      let raf;
      (function tick() {
        bodies.forEach((b, i) => {
          const dx = b.position.x - allData[i].cx;
          const dy = b.position.y - allData[i].cy;
          allEls[i].style.transform = `translate(${dx}px,${dy}px) rotate(${b.angle}rad)`;
        });
        raf = requestAnimationFrame(tick);
      })();

      setTimeout(() => {
        cancelAnimationFrame(raf);
        Runner.stop(runner);
        allEls.forEach(el => { el.style.transition = 'opacity 0.4s ease'; el.style.opacity = '0'; });
        setTimeout(() => {
          allEls.forEach(el => el.remove());
          h2.style.visibility = '';
          if (tagline) tagline.style.visibility = '';
        }, 400);
      }, 1200);
    }
  })();

  // ── SVG Annotations (hero H1) ─────────────────────
  (function () {
    const NS = 'http://www.w3.org/2000/svg';
    const COLOR = '#3b7ff5';

    function makeSvg(w, h) {
      const s = document.createElementNS(NS, 'svg');
      s.setAttribute('width', w);
      s.setAttribute('height', h);
      s.setAttribute('viewBox', `0 0 ${w} ${h}`);
      s.setAttribute('fill', 'none');
      s.style.cssText = 'position:absolute;pointer-events:none;z-index:10;overflow:visible;';
      return s;
    }

    function makePath(d, delay) {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', d);
      p.setAttribute('stroke', COLOR);
      p.setAttribute('stroke-width', '2.5');
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      p.style.strokeDasharray = '1000';
      p.style.strokeDashoffset = '1000';
      p._delay = delay || 0;
      return p;
    }

    function wrapInline(el) {
      const wrap = document.createElement('span');
      wrap.style.cssText = 'position:relative;display:inline-block;';
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      return wrap;
    }

    // ── Ring around .hero-word ──────────────────────
    const heroWord = document.querySelector('#hero-section .hero-word');
    let ringPath = null;

    if (heroWord) {
      const wrap = wrapInline(heroWord);

      requestAnimationFrame(() => {
        const tw = wrap.offsetWidth;
        const th = wrap.offsetHeight;
        const px = 28, py = 10;
        const W = tw + px * 2;
        const H = th + py * 2;

        const svg = makeSvg(W, H);
        svg.style.left = `-${px}px`;
        svg.style.top  = `-${py}px`;
        svg.style.transform = 'rotate(-5deg)';
        svg.style.transformOrigin = '50% 50%';

        // Wobbly hand-drawn ellipse path
        const cx = W / 2, cy = H / 2;
        const rx = W / 2 - 1, ry = H / 2 - 1;
        const k = 0.552;
        const d = [
          `M ${cx + 3} ${cy - ry - 1}`,
          `C ${cx + rx * k + 4} ${cy - ry - 2}, ${cx + rx + 2} ${cy - ry * k - 2}, ${cx + rx + 1} ${cy + 1}`,
          `C ${cx + rx + 2} ${cy + ry * k + 3}, ${cx + rx * k - 1} ${cy + ry + 2}, ${cx - 2} ${cy + ry + 1}`,
          `C ${cx - rx * k - 3} ${cy + ry + 2}, ${cx - rx - 2} ${cy + ry * k - 1}, ${cx - rx - 1} ${cy - 1}`,
          `C ${cx - rx - 1} ${cy - ry * k - 2}, ${cx - rx * k + 2} ${cy - ry - 2}, ${cx + 3} ${cy - ry - 1}`,
          'Z'
        ].join(' ');

        ringPath = makePath(d, 0);
        svg.appendChild(ringPath);
        wrap.appendChild(svg);
      });
    }

    // ── Wavy underline under "why" ──────────────────
    const whySpan = Array.from(
      document.querySelectorAll('#hero-section h1 span')
    ).find(s => s.textContent.trim() === 'why');
    let wavePath = null;

    if (whySpan) {
      const wrap = wrapInline(whySpan);

      requestAnimationFrame(() => {
        const tw = wrap.offsetWidth;
        const W = tw + 12;
        const H = 12;

        const svg = makeSvg(W, H);
        svg.style.left = '-6px';
        svg.style.top  = `${wrap.offsetHeight + 2}px`;

        // Wavy path
        const amp = 2.5, segs = 3;
        const segW = W / segs;
        let d = `M 0 ${H / 2}`;
        for (let i = 0; i < segs; i++) {
          const x0 = i * segW;
          d += ` C ${x0 + segW * 0.25} ${H / 2 - amp}, ${x0 + segW * 0.75} ${H / 2 + amp}, ${x0 + segW} ${H / 2}`;
        }

        wavePath = makePath(d, 200);
        svg.appendChild(wavePath);
        wrap.appendChild(svg);
      });
    }

    // ── IntersectionObserver — trigger both ─────────
    const heroSection = document.getElementById('hero-section');
    if (!heroSection) return;

    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();

      [ringPath, wavePath].forEach(path => {
        if (!path) return;
        setTimeout(() => {
          path.style.transition = 'stroke-dashoffset 1s ease-out';
          path.style.strokeDashoffset = '0';
        }, path._delay);
      });
    }, { threshold: 0.5 });

    obs.observe(heroSection);
  })();

  // ── #why : rail active-state via IntersectionObserver (no ScrollTrigger) ──
  // A thin band at viewport center (rootMargin -45%/-45%) → the block crossing
  // it marks its rail item active. Deliberately avoids the fragile pin/rAF
  // pattern; no ScrollTrigger, no refresh().
  (function() {
    var section = document.getElementById('why');
    if (!section) return;
    var blocks = Array.prototype.slice.call(section.querySelectorAll('.why-block'));
    var items  = Array.prototype.slice.call(section.querySelectorAll('.why-rail-item'));
    if (!blocks.length || !items.length) return;

    function setActive(idx) {
      items.forEach(function(it, i) { it.classList.toggle('is-active', i === idx); });
    }

    if (!('IntersectionObserver' in window)) { setActive(0); return; }

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          var idx = parseInt(e.target.getAttribute('data-block'), 10);
          if (!isNaN(idx)) setActive(idx);
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    blocks.forEach(function(b) { io.observe(b); });
  })();

  // ── #why : entrance (fade/rise/scale) + scroll parallax (no ScrollTrigger) ──
  // Entrance via IntersectionObserver(threshold .2). Parallax via rAF + passive
  // scroll (ticking-throttled): the card drifts slower (±26px) than its animated
  // .why-bg (±70px) → depth. Both disabled under reduced-motion and <900px.
  (function() {
    var section = document.getElementById('why');
    if (!section) return;
    var blocks = Array.prototype.slice.call(section.querySelectorAll('.why-block'));
    if (!blocks.length) return;

    // Entrance — reveal each block once when ~20% enters.
    if ('IntersectionObserver' in window) {
      var eio = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) { e.target.classList.add('in'); eio.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      blocks.forEach(function(b) { eio.observe(b); });
    } else {
      blocks.forEach(function(b) { b.classList.add('in'); });
    }

    // Parallax — skip under reduced-motion or narrow (mobile) viewports.
    var mqReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mqNarrow = window.matchMedia && window.matchMedia('(max-width: 900px)');
    function parallaxEnabled() { return !mqReduce && !(mqNarrow && mqNarrow.matches); }

    var layers = blocks.map(function(b) {
      return { block: b, card: b.querySelector('.csc'), bg: b.querySelector('.why-bg') };
    });
    var ticking = false;
    function apply() {
      ticking = false;
      if (!parallaxEnabled()) return;
      var vh = window.innerHeight;
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i];
        var r = L.block.getBoundingClientRect();
        if (r.bottom < -80 || r.top > vh + 80) continue; // only process near viewport
        var p = (r.top + r.height / 2 - vh / 2) / vh; // ~[-1,1]
        if (p > 1) p = 1; else if (p < -1) p = -1;
        if (L.card) L.card.style.transform = 'translate3d(0,' + (-p * 26).toFixed(1) + 'px,0)';
        if (L.bg)   L.bg.style.transform   = 'translate3d(0,' + (-p * 70).toFixed(1) + 'px,0)';
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }
    function clearTransforms() {
      layers.forEach(function(L) { if (L.card) L.card.style.transform = ''; if (L.bg) L.bg.style.transform = ''; });
    }
    function sync() { if (parallaxEnabled()) apply(); else clearTransforms(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    sync();
  })();

  // ── #why : "ethereal shadow" drift — nudge the shared SVG filter's baseFrequency ──
  // Lightweight: ONE feTurbulence, one rAF, no WebGL. Runs only while #why is on
  // screen (IntersectionObserver) and never under reduced-motion (filter stays static).
  (function() {
    var turb = document.querySelector('#ethereal-shadow feTurbulence');
    var why = document.getElementById('why');
    if (!turb || !why) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Perf: animating baseFrequency re-renders the blur+displacement filter on every panel each
    // frame (the main source of scroll jank here). The warp stays static; the parallax still moves it.
    return;

    var raf = null, t = 0;
    function tick() {
      t += 0.006; // ~17s per breath cycle at 60fps
      var bx = (0.010 + Math.sin(t) * 0.0035).toFixed(4);
      var by = (0.011 + Math.sin(t * 0.73 + 1.3) * 0.0035).toFixed(4); // out-of-phase → organic drift
      turb.setAttribute('baseFrequency', bx + ' ' + by);
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!raf) raf = requestAnimationFrame(tick); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) { if (e.isIntersecting) start(); else stop(); });
      }, { rootMargin: '160px 0px 160px 0px' });
      io.observe(why);
    } else { start(); }
  })();

  // ── #about → #why : scroll-drawn connecting line (own passive + rAF listener) ──
  // A single blue glowing SVG weave revealed via stroke-dashoffset tied to scroll
  // progress. The span lives ENTIRELY in normal-scroll space: it starts ~160px past
  // the #about pin-release seam and ends at the last #why card, so it never slides
  // against the pinned/fixed #about content. Fully independent of the #about pin,
  // the #why parallax, and the rail IntersectionObserver. No GSAP, no ScrollTrigger.
  (function() {
    var why = document.getElementById('why');
    if (!why) return;
    var blocks = Array.prototype.slice.call(why.querySelectorAll('.why-block'));
    if (!blocks.length) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var START_GAP = 24; // px below the #about tagline where the line begins (small, no buffer)

    var NS = 'http://www.w3.org/2000/svg';
    var layer = document.createElement('div');
    layer.id = 'aw-line-layer';
    layer.setAttribute('aria-hidden', 'true');
    var svg = document.createElementNS(NS, 'svg');
    var path = document.createElementNS(NS, 'path');
    path.id = 'aw-line-path';
    svg.appendChild(path);
    layer.appendChild(svg);
    why.insertBefore(layer, why.firstChild); // first child + z-index:0 → behind content

    var spanTop = 0, spanH = 0, len = 0, seamDoc = 0;

    // Vertical weave: returns to the centre column each segment, bowing left/right.
    function buildPath(W, H) {
      var cx = W * 0.42;                       // centre near the card column (left-of-centre)
      var amp = Math.min(W * 0.075, 88);       // weave amplitude, capped
      var waves = Math.max(3, Math.round(H / 430));
      var seg = H / waves;
      var d = 'M ' + cx.toFixed(1) + ' 0';
      var dir = 1;
      for (var i = 0; i < waves; i++) {
        var y0 = seg * i, y1 = seg * (i + 1);
        d += ' C ' + (cx + dir * amp).toFixed(1) + ' ' + (y0 + seg * 0.34).toFixed(1)
           + ' ' + (cx + dir * amp).toFixed(1) + ' ' + (y0 + seg * 0.66).toFixed(1)
           + ' ' + cx.toFixed(1) + ' ' + y1.toFixed(1);
        dir = -dir;
      }
      return d;
    }

    function draw() {
      if (!len) return;
      if (reduce) { path.style.strokeDashoffset = '0'; return; } // fully drawn, static
      var vh = window.innerHeight;
      // The tip leads ~half a viewport ahead so it ARRIVES at each card as it is framed
      // (stretches the draw over more scroll), but never so far that drawing would begin
      // above the pin-release seam (which would slide against the frozen #about content).
      var lead = Math.min(vh * 0.5, (spanTop - seamDoc) - 40);
      if (lead < 0) lead = 0;
      var prog = (window.scrollY + lead - spanTop) / spanH;
      if (prog < 0) prog = 0; else if (prog > 1) prog = 1;
      path.style.strokeDashoffset = (len * (1 - prog)).toFixed(1);
    }

    function layout() {
      if (getComputedStyle(layer).display === 'none') return; // hidden <900px — skip work
      var whyTopDoc = why.getBoundingClientRect().top + window.scrollY;
      var last = blocks[blocks.length - 1];
      var spanBottomDoc = last.getBoundingClientRect().bottom + window.scrollY; // precise last-card bottom

      // Anchor the start to the #about tagline's RELEASED resting position. The tagline
      // is pinned, so its live doc-Y varies with scroll; but its offset WITHIN the stage
      // is fixed, and the stage rests against #why — so released bottom = seam + that offset.
      var stage = document.getElementById('about-stage');
      var tagline = document.getElementById('about-tagline');
      if (stage && tagline) {
        var stageH = stage.offsetHeight;
        seamDoc = whyTopDoc - stageH; // pin-release doc-Y (= aboutTop + PIN)
        var tagBottomInStage = tagline.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
        spanTop = seamDoc + tagBottomInStage + START_GAP;
        if (spanTop < seamDoc + 40) spanTop = seamDoc + 40; // safety: never above the seam
      } else {
        spanTop = whyTopDoc - 200; seamDoc = spanTop - 40;
      }

      spanH = Math.max(1, spanBottomDoc - spanTop);
      var W = why.clientWidth;
      layer.style.top = (spanTop - whyTopDoc) + 'px'; // relative to #why → up into the #about tail
      layer.style.height = spanH + 'px';
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + spanH);
      path.setAttribute('d', buildPath(W, spanH));
      len = path.getTotalLength();
      path.style.strokeDasharray = len.toFixed(1);
      path.style.strokeDashoffset = reduce ? '0' : len.toFixed(1);
      draw();
    }

    // Own throttled scroll listener — independent of every existing handler.
    var ticking = false;
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(function() { ticking = false; draw(); }); }
    }
    if (!reduce) window.addEventListener('scroll', onScroll, { passive: true });

    var rtick = false;
    window.addEventListener('resize', function() {
      if (!rtick) { rtick = true; requestAnimationFrame(function() { rtick = false; layout(); }); }
    }, { passive: true });

    // Build once layout has settled. Re-measure after late shifts (GSAP pin-spacer,
    // fonts, images) since the span depends on the pinned #about's reserved height.
    if (document.readyState === 'complete') layout(); else window.addEventListener('load', layout);
    setTimeout(layout, 400);
    setTimeout(layout, 1400);
  })();

  // ── Extra line segments: Features, Testimonials, Pricing ─────────────
  // Extends the same glowing weave earlier (right after the Hero, at Features)
  // and further (through Testimonials and Pricing, ending right where the FI
  // section starts). Each section gets its own independent segment — same
  // visual style, own scroll-driven reveal — so it reads as one continuous
  // line resuming section by section (with a gap while the pinned Mission
  // animation covers the screen, same as before).
  (function() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var NS = 'http://www.w3.org/2000/svg';

    function buildPath(W, H) {
      var cx = W * 0.42;
      var amp = Math.min(W * 0.075, 88);
      var waves = Math.max(2, Math.round(H / 430));
      var seg = H / waves;
      var d = 'M ' + cx.toFixed(1) + ' 0';
      var dir = 1;
      for (var i = 0; i < waves; i++) {
        var y0 = seg * i, y1 = seg * (i + 1);
        d += ' C ' + (cx + dir * amp).toFixed(1) + ' ' + (y0 + seg * 0.34).toFixed(1)
           + ' ' + (cx + dir * amp).toFixed(1) + ' ' + (y0 + seg * 0.66).toFixed(1)
           + ' ' + cx.toFixed(1) + ' ' + y1.toFixed(1);
        dir = -dir;
      }
      return d;
    }

    function createLineSegment(container, topPad, bottomPad) {
      if (!container) return;

      var layer = document.createElement('div');
      layer.className = 'aw-line-seg';
      layer.setAttribute('aria-hidden', 'true');
      var svg = document.createElementNS(NS, 'svg');
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'aw-line-seg-path');
      svg.appendChild(path);
      layer.appendChild(svg);
      container.insertBefore(layer, container.firstChild);

      var spanTop = 0, spanH = 0, len = 0;

      function draw() {
        if (!len) return;
        if (reduce) { path.style.strokeDashoffset = '0'; return; }
        var lead = window.innerHeight * 0.4;
        var prog = (window.scrollY + lead - spanTop) / spanH;
        if (prog < 0) prog = 0; else if (prog > 1) prog = 1;
        path.style.strokeDashoffset = (len * (1 - prog)).toFixed(1);
      }

      function layout() {
        if (getComputedStyle(layer).display === 'none') return;
        var rect = container.getBoundingClientRect();
        var containerTopDoc = rect.top + window.scrollY;
        spanTop = containerTopDoc + topPad;
        var spanBottomDoc = containerTopDoc + container.offsetHeight - bottomPad;
        spanH = Math.max(1, spanBottomDoc - spanTop);
        var W = container.clientWidth;
        layer.style.top = topPad + 'px';
        layer.style.height = spanH + 'px';
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + spanH);
        path.setAttribute('d', buildPath(W, spanH));
        len = path.getTotalLength();
        path.style.strokeDasharray = len.toFixed(1);
        path.style.strokeDashoffset = reduce ? '0' : len.toFixed(1);
        draw();
      }

      var ticking = false;
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(function() { ticking = false; draw(); }); }
      }
      if (!reduce) window.addEventListener('scroll', onScroll, { passive: true });

      var rtick = false;
      window.addEventListener('resize', function() {
        if (!rtick) { rtick = true; requestAnimationFrame(function() { rtick = false; layout(); }); }
      }, { passive: true });

      if (document.readyState === 'complete') layout(); else window.addEventListener('load', layout);
      setTimeout(layout, 400);
      setTimeout(layout, 1400);
    }

    createLineSegment(document.getElementById('features'), 110, 110);
  })();

  // ── Hero parallax: mockup cards drift apart at different speeds, headline
  // lifts away, as the Hero scrolls past — into Features underneath. Plain
  // scrubbed scroll-tracking (no pin), so it never locks/auto-scrolls the page.
  (function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const hero = document.getElementById('hero-section');
    const content = document.getElementById('hero-content');
    const center = hero && hero.querySelector('.hero-mock-center');
    const left   = hero && hero.querySelector('.hero-mock-side-l');
    const right  = hero && hero.querySelector('.hero-mock-side-r');
    if (!hero || !center || !left || !right) return;

    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Re-declare the side cards' resting perspective/rotation/scale through GSAP
    // (instead of leaving them as a static CSS transform) so animating y afterward
    // doesn't clobber the 3D tilt they already have.
    gsap.set(left,  { transformPerspective: 1200, rotationY: 14,  scale: 0.9, transformOrigin: 'right center' });
    gsap.set(right, { transformPerspective: 1200, rotationY: -14, scale: 0.9, transformOrigin: 'left center' });

    gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.3 },
    })
      .to(content, { opacity: 0, y: -60, ease: 'none' }, 0)
      .to(center,  { y: 70,  ease: 'none' }, 0)
      .to(left,    { y: 110, ease: 'none' }, 0)
      .to(right,   { y: 110, ease: 'none' }, 0);
  })();

  // ── Section entrance animations (GSAP ScrollTrigger) ────────────────
  (function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    function revealSection(trigger, targets, opts) {
      var els = typeof targets === 'string'
        ? Array.from(document.querySelectorAll(targets))
        : targets;
      if (!els.length) return;
      gsap.fromTo(els,
        { opacity: 0, y: opts && opts.y != null ? opts.y : 44 },
        {
          opacity: 1, y: 0,
          duration: opts && opts.dur ? opts.dur : 0.75,
          ease: 'power2.out',
          stagger: opts && opts.stagger ? opts.stagger : 0.1,
          scrollTrigger: {
            trigger: document.querySelector(trigger),
            start: 'top 82%',
            once: true,
          },
        }
      );
    }

    // #why has no entrance reveal by design — its rail active-state is driven by
    // a self-contained IntersectionObserver (no ScrollTrigger), content appears
    // on natural scroll.

    // Testimonials heading
    revealSection('#testimonials', '#testimonials h2, #testimonials > div > p', { stagger: 0.1 });

    // Pricing already uses .reveal IntersectionObserver — no extra animation needed

    // fi-section heading + button
    revealSection('.fi-section', '.fi-section .fi-title, .fi-section .fi-btn', { stagger: 0.12, y: 36 });
  })();
