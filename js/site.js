  // ── Pricing toggle (Monthly / Yearly) ──────────────
  (function() {
    const toggle = document.getElementById('plan-toggle');
    const priceVal  = document.getElementById('plan-price-val');
    const pricePer  = document.getElementById('plan-price-period');
    if (!toggle) return;

    toggle.querySelectorAll('.plan-toggle-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        toggle.querySelectorAll('.plan-toggle-opt').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const yearly = btn.dataset.period === 'yearly';
        if (priceVal)  priceVal.textContent  = yearly ? '$10.43' : '$14.90';
        if (pricePer)  pricePer.textContent  = '/mo';
      });
    });
  })();

  // ── Hero → Features scroll transition (GSAP scrub) ──
  (function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const heroContent = document.getElementById('hero-content');
    const heroMockup  = document.getElementById('hero-mockup');
    const scrollNext  = document.getElementById('scroll-next');
    const featSection = document.getElementById('features');

    if (!heroContent || !featSection) return;

    // Features starts 80px below natural position — slides up into place.
    gsap.set(featSection, { y: 80 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: '+=680',
        scrub: 1.2,
      },
    });

    // ── Phase 1: hero content crushes and exits ──────────
    // scaleY compresses toward the bottom edge (origin: center bottom),
    // y pushes the block upward, opacity fades out.
    tl.to(heroContent, {
      opacity: 0,
      y: -64,
      scaleY: 0.84,
      transformOrigin: 'center bottom',
      ease: 'power2.in',
      duration: 0.62,
    }, 0);

    if (scrollNext) {
      tl.to(scrollNext, { opacity: 0, duration: 0.3, ease: 'power1.in' }, 0);
    }

    if (heroMockup) {
      tl.to(heroMockup, {
        y: -48,
        opacity: 0.15,
        ease: 'power1.in',
        duration: 0.62,
      }, 0);
    }

    // ── Phase 2: features slides up with back.out overshoot ─
    // Starts at 0.28 into the timeline so it overlaps the hero exit.
    // back.out(1.5) makes features briefly overshoot y:0 (go ~12px too far)
    // before settling — baked into the scroll position map via the ease curve.
    tl.to(featSection, {
      y: 0,
      ease: 'back.out(1.5)',
      duration: 0.72,
    }, 0.28);
  })();

  // ── Floating icons mouse repulsion (spring physics) ─
  (function() {
    const icons = document.querySelectorAll('#fi-section .fi-icon');
    if (!icons.length) return;

    // Use window listener (same as React component's useEffect pattern)
    // so repulsion doesn't cut out when cursor grazes outside section bounds
    window.addEventListener('mousemove', e => {
      icons.forEach(icon => {
        const rect  = icon.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const dist  = Math.hypot(e.clientX - cx, e.clientY - cy);

        if (dist < 150) {
          const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
          const force = (1 - dist / 150) * 50;
          // Use CSS `translate` property — independent of `transform`,
          // so fi-appear (scale) and fi-float animations are unaffected
          icon.style.translate = `${(-Math.cos(angle) * force).toFixed(2)}px ${(-Math.sin(angle) * force).toFixed(2)}px`;
        } else {
          icon.style.translate = '';
        }
      });
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      icons.forEach(icon => { icon.style.translate = ''; });
    });
  })();

  // ── HoverButton circle effect ──────────────────────
  document.querySelectorAll('.hover-btn').forEach(btn => {
    let listening = false;
    let lastAdded = 0;

    btn.addEventListener('pointerenter', () => { listening = true; });
    btn.addEventListener('pointerleave', () => { listening = false; });

    btn.addEventListener('pointermove', e => {
      if (!listening) return;
      const now = Date.now();
      if (now - lastAdded < 100) return;
      lastAdded = now;

      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / btn.offsetWidth) * 100;

      const circle = document.createElement('div');
      circle.className = 'hover-circle';
      circle.style.left = x + 'px';
      circle.style.top  = y + 'px';
      circle.style.background = `linear-gradient(to right, #a0d9f8 ${xPct}%, #2d6be4 ${xPct}%)`;
      btn.appendChild(circle);

      requestAnimationFrame(() => circle.classList.add('ci-in'));

      setTimeout(() => { circle.classList.remove('ci-in'); circle.classList.add('ci-out'); }, 1000);
      setTimeout(() => circle.remove(), 2200);
    });
  });

  // ── Tube-light navbar ──────────────────────────────
  (function initTubeNav() {
    const lamp  = document.getElementById('tube-lamp');
    const inner = document.getElementById('tube-inner');
    const tabs  = document.querySelectorAll('.tube-tab');

    function moveLamp(tab) {
      if (!lamp || !inner || !tab) return;
      const iRect = inner.getBoundingClientRect();
      const tRect = tab.getBoundingClientRect();
      lamp.style.left  = (tRect.left - iRect.left) + 'px';
      lamp.style.width = tRect.width + 'px';
    }

    function setActive(tab) {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      moveLamp(tab);
    }

    // Snap lamp to first active tab after fonts/layout settle
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        const first = document.querySelector('.tube-tab.active');
        if (first) { lamp.style.transition = 'none'; moveLamp(first); requestAnimationFrame(() => { lamp.style.transition = ''; }); }
      });
    });

    // Click handler
    tabs.forEach(tab => tab.addEventListener('click', () => setActive(tab)));

    // Scroll-based active section tracking
    const sectionMap = { 'features': 'features', 'pricing': 'pricing', 'about': 'about' };
    window.addEventListener('scroll', () => {
      const y = window.scrollY + 120;
      let hit = '';
      Object.entries(sectionMap).forEach(([id]) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) hit = id;
      });
      tabs.forEach(tab => {
        const sec = tab.dataset.section;
        const match = hit ? sec === hit : sec === '';
        if (match && !tab.classList.contains('active')) setActive(tab);
      });
    }, { passive: true });

    // Reposition on resize
    window.addEventListener('resize', () => {
      const active = document.querySelector('.tube-tab.active');
      if (active) { lamp.style.transition = 'none'; moveLamp(active); requestAnimationFrame(() => { lamp.style.transition = ''; }); }
    });
  })();

  // Scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // SectionWithMockup animations
  const swmIo = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('swm-in');
        swmIo.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.swm-item, .swm-bg1, .swm-card1, .swm-bg2, .swm-card2').forEach(el => swmIo.observe(el));

  // Footer animation
  const footerIo = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('footer-anim-in'); footerIo.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.footer-anim').forEach(el => footerIo.observe(el));

  // ── Mission: fade in → hold → exit (single pinned ScrollTrigger) ──
  // ONE timeline drives all phases via scrub; the pin (pinSpacing on) makes
  // #about own the full viewport so the next section cannot bleed in until
  // phase C has finished.
  // No ScrollTrigger.refresh() calls anywhere — natural recalculation only.
  (function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById('about');
    const stage   = document.getElementById('about-stage');
    const h2      = document.getElementById('about-h2');
    const tagline = document.getElementById('about-tagline');
    if (!section || !stage || !h2) return;

    const type2    = document.getElementById('about-type');       // Layer-2 overlay <h2>
    const type2Txt = document.getElementById('about-type-txt');   // text sink (cursor is a sibling)
    const SECOND   = 'We are eliminating the chaos of everyday investing.';
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Word tokens. Each word fades in independently; the highlight phrase
    // stays a single shiny token (comma glued on) so the assembled end-state
    // matches the typewriter output — "all in one place,".
    const tokens = [
      { t: 'Market' }, { t: 'data,' }, { t: 'AI' }, { t: 'insights,' },
      { t: 'portfolio' }, { t: 'tracking' }, { t: '—' },
      { t: 'all in one place,', hi: true },
      { t: 'so' }, { t: 'you' }, { t: 'can' }, { t: 'invest' },
      { t: 'with' }, { t: 'confidence.' },
    ];

    h2.innerHTML = tokens.map(tok =>
      '<span class="as-word' + (tok.hi ? ' shiny-text' : '') +
      '" style="display:inline-block;white-space:nowrap;will-change:transform,opacity;">' + tok.t + '</span>'
    ).join(' ');
    const words = gsap.utils.toArray('#about-h2 .as-word');

    // Reconstruct the full headline string + the highlight char-range straight
    // from the tokens, so Layer-2's render is byte-identical to Layer-1.
    let FULL = '', hiStart = 0, hiEnd = 0;
    tokens.forEach(function(tok, i) {
      if (i) FULL += ' ';
      if (tok.hi) hiStart = FULL.length;
      FULL += tok.t;
      if (tok.hi) hiEnd = FULL.length;
    });
    // Render the first n chars of FULL as the SAME inline-block word spans Layer-1
    // uses (highlight token keeps its shiny class + nowrap) → seamless swap, and
    // backspacing never reflows the earlier words (verified: 0px shift).
    function wspan(hi, txt) {
      return '<span class="as2-word' + (hi ? ' shiny-text' : '') +
        '" style="display:inline-block;white-space:nowrap;">' + txt + '</span>';
    }
    function renderHeadline(n) {
      n = Math.max(0, Math.min(FULL.length, Math.floor(n)));
      const parts = []; let acc = 0;
      for (let i = 0; i < tokens.length; i++) {
        const tk = tokens[i];
        if (acc < n) parts.push(wspan(tk.hi, tk.t.slice(0, n - acc)));
        acc += tk.t.length + 1; // +1 = the joining space
      }
      return parts.join(' ');
    }

    // Layer-1 (#about-h2) only exists to reserve the headline's height in normal
    // flow; it never becomes visible. All visible typing happens on Layer-2.
    gsap.set(words, { opacity: 0 });
    gsap.set(h2, { opacity: 0 });

    // Tagline is GSAP-driven; kill its CSS transition so scrubbing stays smooth.
    if (tagline) { tagline.style.transition = 'none'; gsap.set(tagline, { opacity: 0, y: 24 }); }

    // Reduced motion: final state = the SECOND line shown in the headline slot,
    // main hidden, no timeline, no cursor (cursor blink already killed via CSS).
    if (reduce) {
      gsap.set(words, { opacity: 0 });
      if (type2Txt) type2Txt.textContent = SECOND;
      if (type2) gsap.set(type2, { opacity: 1 });
      if (tagline) gsap.set(tagline, { opacity: 1, y: 0 });
      window.dispatchEvent(new CustomEvent('aboutTaglineReveal'));
      return;
    }
    // Layer-2 is visible from the start and starts empty — it types the FULL
    // headline itself in Phase A, so there is nothing to pre-fill.
    if (type2Txt) type2Txt.innerHTML = renderHeadline(0);
    if (type2) gsap.set(type2, { opacity: 1 });

    // Phases (virtual units), mapped onto the scroll pin at UNIT px/unit:
    //   A type the FULL headline from empty (slow) → HOLD → B1 backspace →
    //   B2 type the second line (half pre-filled, so B2 only has to type the
    //   back half) → C exit
    // C spans the full exit so the timeline's duration == TOTAL (its last tween
    // ends the timeline); ScrollTrigger maps PIN linearly onto that duration, so
    // PIN = TOTAL*UNIT keeps 547.6px/unit and lands the exit exactly at release.
    const A = 1.6, HOLD = 0.3, B1 = 0.60, B2 = 0.18, C = 0.55;
    const UNIT = 547.6, TOTAL = A + HOLD + B1 + B2 + C, PIN = Math.round(TOTAL * UNIT);
    const holdEnd = A + HOLD, b1End = holdEnd + B1, b2End = b1End + B2;
    let ctnFired = false;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=' + PIN,
        scrub: 1,
        pin: stage,
        anticipatePin: 1,
      },
    });

    // Phase A — type the FULL headline into Layer-2 from empty, scrubbed (chars
    // added on scroll), same mechanism as the B1 backspace below just inverted.
    const typeInP = { n: 0 };
    tl.to(typeInP, {
      n: FULL.length, duration: A, ease: 'none',
      onUpdate: function() { type2Txt.innerHTML = renderHeadline(typeInP.n); },
    }, 0);
    if (tagline) {
      tl.to(tagline, { opacity: 1, y: 0, ease: 'power2.out', duration: A * 0.3 }, A * 0.7);
      // Reveal the "Clear The Noise" sub-line once, when fully typed (idempotent;
      // its own listener self-removes, so re-crossing on reverse scrub is a no-op).
      tl.call(function() {
        if (!ctnFired) { ctnFired = true; window.dispatchEvent(new CustomEvent('aboutTaglineReveal')); }
      }, null, A * 0.92);
    }

    // Phase B1 — backspace-erase the headline, scrubbed (chars removed on scroll).
    const eraseP = { n: FULL.length };
    tl.to(eraseP, {
      n: 0, duration: B1, ease: 'none',
      onUpdate: function() { type2Txt.innerHTML = renderHeadline(eraseP.n); },
    }, holdEnd);

    // Phase B2 — type the second line IN THE SAME SLOT, scrubbed → full.
    // Starts already half-filled (only the back half is typed out) so the
    // swap doesn't take as long to read.
    const HALF = Math.floor(SECOND.length / 2);
    const typeP = { n: HALF };
    tl.to(typeP, {
      n: SECOND.length, duration: B2, ease: 'none',
      onUpdate: function() { type2Txt.textContent = SECOND.slice(0, Math.floor(typeP.n)); },
    }, b1End);

    // Phase C — exit: the visible content is now the single Layer-2 line, so it
    // fades out (with the tagline) rather than word-scattering. (Layer-1 words are
    // already invisible from the swap; there is nothing left to scatter.)
    tl.to(type2, { opacity: 0, y: -24, ease: 'power2.in', duration: C }, b2End);
    if (tagline) {
      tl.to(tagline, { opacity: 0, y: -24, ease: 'power2.in', duration: C }, b2End);
    }
  })();

  // ── Footer logo typewriter ─────────────────────────
  (function() {
    const logo    = document.getElementById('footer-logo');
    const cursor  = document.getElementById('footer-cursor');
    if (!logo || !cursor) return;

    const letters = Array.from(logo.querySelectorAll('.footer-logo-letter'));
    let played = false;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !played) {
        played = true;
        io.disconnect();

        const accent = logo.querySelector('.logo-p-accent');

        letters.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add('in');
            // Show accent dot together with the p letter
            if (el.classList.contains('logo-p') && accent) {
              accent.style.opacity = '1';
            }
            // Move cursor after this letter's parent (handle logo-p-wrap)
            const insertAfter = el.closest('.logo-p-wrap') || el;
            insertAfter.parentNode.insertBefore(cursor, insertAfter.nextSibling);
          }, i * 500);
        });

        // Hide cursor after last letter
        setTimeout(() => {
          cursor.classList.add('done');
        }, letters.length * 500 + 1200);
      }
    }, { threshold: 0.5 });

    io.observe(logo);
  })();

  // Hero word cycle (matches animated-hero component behaviour)
  const heroWords = ['smarter', 'faster', 'clearer', 'informed', 'bolder'];
  let heroIdx = 0;
  const heroWordEl = document.querySelector('.hero-word');

  function cycleHeroWord() {
    heroWordEl.classList.remove('wc-enter');
    heroWordEl.classList.add('wc-exit');

    heroWordEl.addEventListener('animationend', () => {
      heroWordEl.classList.remove('wc-exit');
      heroIdx = (heroIdx + 1) % heroWords.length;
      heroWordEl.textContent = heroWords[heroIdx];
      heroWordEl.classList.add('wc-enter');
      heroWordEl.addEventListener('animationend', () => {
        heroWordEl.classList.remove('wc-enter');
      }, { once: true });
    }, { once: true });
  }

  setInterval(cycleHeroWord, 2200);

  // ── CTA redirect ────────────────────────────────────
  (function() {
    const AUTH_URL = 'https://www.stockpiloapp.com/auth';
    const ALL_IDS  = ['hero-cta', 'hero-cta-nav', 'btn-trial-pricing', 'btn-trial-fi', 'btn-pro-pricing'];

    ALL_IDS.forEach(function(id) {
      var btn = document.getElementById(id);
      if (!btn) return;
      btn.href = AUTH_URL;
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = AUTH_URL;
      });
    });
  })();

  // ── Supabase + Stripe integration (disabled) ────────
  (function() {
    return; // redirects now handled above

    if (typeof window.supabase === 'undefined') return;

    const SUPABASE_URL  = 'https://knurwbloofzchsblzwnr.supabase.co';
    const ANON_KEY      = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudXJ3Ymxvb2Z6Y2hzYmx6d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODAyMjQsImV4cCI6MjA5Mzk1NjIyNH0.gla_wM2y8BAoDFE1C3KsX008RwBan8WIFcl_7DO5Too';
    // www, not the apex: stockpiloapp.com has no DNS record (only www resolves),
    // and the app's sign-in route is /auth — it has no /login (that is the 404 page).
    const APP_URL       = 'https://www.stockpiloapp.com';
    const LOGIN_URL     = APP_URL + '/auth';
    const DASHBOARD_URL = APP_URL + '/dashboard';

    const client = window.supabase.createClient(SUPABASE_URL, ANON_KEY);

    // All trial buttons + pro button IDs
    const TRIAL_IDS = ['hero-cta', 'btn-trial-pricing', 'btn-trial-fi'];
    const PRO_IDS   = ['btn-pro-pricing'];

    // ── Toast notification ──────────────────────────
    function toast(msg, type) {
      const el = document.createElement('div');
      el.style.cssText = [
        'position:fixed;bottom:88px;left:50%;transform:translateX(-50%) translateY(20px)',
        'z-index:999997;max-width:420px;width:calc(100vw - 48px)',
        'padding:14px 20px;border-radius:12px;font-family:Geist,sans-serif',
        'font-size:14px;font-weight:500;line-height:1.5',
        'opacity:0;transition:opacity .3s ease,transform .3s ease',
        type === 'error'
          ? 'background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5;'
          : 'background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.28);color:#6ee7b7;',
      ].join(';');
      el.textContent = msg;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateX(-50%) translateY(0)';
      });
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 400);
      }, 5000);
    }

    // ── Button helpers ──────────────────────────────
    function getBtn(id) { return document.getElementById(id); }

    function setLoading(id, loading) {
      const btn = getBtn(id);
      if (!btn) return;
      if (loading) {
        btn.dataset.origText = btn.innerHTML;
        btn.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="animation:spin .8s linear infinite"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5" stroke-dasharray="22" stroke-dashoffset="10"/></svg>Loading…</span>';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.65';
      } else {
        if (btn.dataset.origText) btn.innerHTML = btn.dataset.origText;
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
      }
    }

    function hideBtn(id) {
      const btn = getBtn(id);
      if (btn) { btn.style.display = 'none'; }
    }

    function setDashboardMode(id, label) {
      const btn = getBtn(id);
      if (!btn) return;
      btn.textContent = label || 'Go to Dashboard →';
      btn.href = DASHBOARD_URL;
      btn.style.opacity = '1';
      btn.style.pointerEvents = '';
    }

    // Inject spin keyframe once
    if (!document.getElementById('sp-spin-style')) {
      const s = document.createElement('style');
      s.id = 'sp-spin-style';
      s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(s);
    }

    // ── Main init ───────────────────────────────────
    async function init() {
      try {
        const { data: { session } } = await client.auth.getSession();

        if (!session) {
          // Not logged in: all buttons redirect to login
          [...TRIAL_IDS, ...PRO_IDS].forEach(id => {
            const btn = getBtn(id);
            if (btn) btn.href = LOGIN_URL;
          });
          return;
        }

        const token  = session.access_token;
        const userId = session.user.id;

        // Fetch profile
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?select=plan,trial_used,trial_active,trial_end_date,subscription_status,manual_premium&id=eq.${userId}`,
          { headers: { 'Authorization': `Bearer ${token}`, 'apikey': ANON_KEY } }
        );
        const rows = await res.json();
        const p = rows?.[0] || {};

        const hasPremium = p.plan === 'premium' || p.manual_premium === true || p.trial_active === true;
        const trialUsed  = p.trial_used === true;

        if (hasPremium) {
          // Already has access — send all buttons to dashboard
          TRIAL_IDS.forEach(id => setDashboardMode(id, 'Open Dashboard →'));
          PRO_IDS.forEach(id   => setDashboardMode(id, 'Open Dashboard →'));
          return;
        }

        if (trialUsed) {
          // Trial used, not premium — hide trial buttons, show only Pro
          TRIAL_IDS.forEach(hideBtn);
        } else {
          // No trial used — wire trial buttons
          TRIAL_IDS.forEach(id => wireTrial(id, token));
        }

        // Always wire pro button when not on premium
        PRO_IDS.forEach(id => wirePro(id, token));

      } catch (err) {
        console.error('[Stockpilo] Auth init error:', err);
      }
    }

    // ── Start free trial ────────────────────────────
    function wireTrial(id, token) {
      const btn = getBtn(id);
      if (!btn) return;

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        setLoading(id, true);

        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/start-trial`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await res.json();

          if (data.success) {
            toast('✓ Your 7-day free trial is now active! You have full access.', 'success');
            setTimeout(() => { window.location.href = DASHBOARD_URL; }, 1800);
          } else if (data.error === 'Trial already used') {
            toast('You have already used your free trial. Upgrade to Pro to continue.', 'error');
            setLoading(id, false);
            TRIAL_IDS.forEach(hideBtn);
          } else if (data.error === 'Not authenticated') {
            window.location.href = LOGIN_URL;
          } else {
            toast(data.error || 'Something went wrong. Please try again.', 'error');
            setLoading(id, false);
          }
        } catch (err) {
          toast('Network error. Please check your connection and try again.', 'error');
          setLoading(id, false);
        }
      });
    }

    // ── Create Stripe checkout ──────────────────────
    function wirePro(id, token) {
      const btn = getBtn(id);
      if (!btn) return;

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        setLoading(id, true);

        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ plan: 'premium' }),
          });
          const data = await res.json();

          if (data.url) {
            window.location.href = data.url;
          } else if (data.error === 'Not authenticated') {
            window.location.href = LOGIN_URL;
          } else {
            toast(data.error || 'Could not create checkout session. Please try again.', 'error');
            setLoading(id, false);
          }
        } catch (err) {
          toast('Network error. Please check your connection and try again.', 'error');
          setLoading(id, false);
        }
      });
    }

    init();
  })();

  // ── About section timeline reveal ─────────────────
  (function() {
    const root = document.getElementById('about-root');
    if (!root) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        // Fire all children with their individual delays
        root.querySelectorAll('.about-reveal').forEach(el => {
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(() => el.classList.add('about-in'), delay);
        });
        observer.disconnect();
      });
    }, { threshold: 0.15 });

    observer.observe(root);
  })();

  // ── Footer social icon repulsion ──────────────────
  (function() {
    const RADIUS = 90;
    const FORCE  = 44;
    const items  = document.querySelectorAll('.footer-social-li');
    if (!items.length) return;

    window.addEventListener('mousemove', e => {
      items.forEach(item => {
        const rect  = item.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const dist  = Math.hypot(e.clientX - cx, e.clientY - cy);

        if (dist < RADIUS) {
          const angle = Math.atan2(cy - e.clientY, cx - e.clientX);
          const f     = (1 - dist / RADIUS) * FORCE;
          item.style.transform = `translate(${(Math.cos(angle) * f).toFixed(2)}px, ${(Math.sin(angle) * f).toFixed(2)}px)`;
        } else {
          item.style.transform = '';
        }
      });
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      items.forEach(item => { item.style.transform = ''; });
    });
  })();



  // Perf: run a callback with true/false as an element enters/leaves the viewport
  window.spWhenVisible = function(el, cb, margin) {
    if (!el || !('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function(es) { cb(es[es.length - 1].isIntersecting); }, { rootMargin: margin || '100px' }).observe(el);
  };

  // ── DotField overlay ───────────────────────────────
  (function() {
    const canvas  = document.getElementById('dotfield-canvas');
    const glowEl  = document.getElementById('df-glow-circle');
    const container = document.getElementById('dotfield-container');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const TWO_PI = Math.PI * 2;

    const props = {
      dotRadius: 1.5, dotSpacing: 14, cursorRadius: 500,
      cursorForce: 0.1, bulgeOnly: true, bulgeStrength: 67,
      sparkle: false, waveAmplitude: 0,
      gradientFrom: 'rgba(168,85,247,0.35)', gradientTo: 'rgba(180,151,207,0.25)',
    };

    let dots = [];
    const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
    const size  = { w: 0, h: 0, offsetX: 0, offsetY: 0 };
    let glowOpacity = 0, engagement = 0, frameCount = 0;

    function buildDots(w, h) {
      const step = props.dotRadius + props.dotSpacing;
      const cols = Math.floor(w / step), rows = Math.floor(h / step);
      const padX = (w % step) / 2, padY = (h % step) / 2;
      dots = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          dots.push({ ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay });
        }
      }
    }

    function doResize() {
      const rect = (container || canvas.parentElement).getBoundingClientRect();
      const w = rect.width, h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.w = w; size.h = h;
      size.offsetX = rect.left + window.scrollX;
      size.offsetY = rect.top  + window.scrollY;
      buildDots(w, h);
    }

    let resizeTimer;
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(doResize, 100); });
    window.addEventListener('mousemove', e => {
      mouse.x = e.pageX - size.offsetX;
      mouse.y = e.pageY - size.offsetY;
    }, { passive: true });

    let running = false, onScreen = true, idle = 0;
    function kick() { idle = 0; if (!running && onScreen) { running = true; requestAnimationFrame(tick); } }
    window.addEventListener('mousemove', kick, { passive: true });
    spWhenVisible(container || canvas, v => { onScreen = v; if (v) kick(); });

    const speedInterval = setInterval(() => {
      if (!onScreen) return;
      const dx = mouse.prevX - mouse.x, dy = mouse.prevY - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      mouse.speed += (dist - mouse.speed) * 0.5;
      if (mouse.speed < 0.001) mouse.speed = 0;
      mouse.prevX = mouse.x; mouse.prevY = mouse.y;
    }, 20);

    function tick() {
      frameCount++;
      const { w, h } = size;
      const len = dots.length;
      const t = frameCount * 0.02;
      const targetEng = Math.min(mouse.speed / 5, 1);
      engagement += (targetEng - engagement) * 0.06;
      if (engagement < 0.001) engagement = 0;
      glowOpacity += (engagement - glowOpacity) * 0.08;

      if (glowEl) {
        glowEl.setAttribute('cx', mouse.x);
        glowEl.setAttribute('cy', mouse.y);
        glowEl.style.opacity = glowOpacity;
      }

      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, props.gradientFrom);
      grad.addColorStop(1, props.gradientTo);
      ctx.fillStyle = grad;

      const crSq = props.cursorRadius * props.cursorRadius;
      const rad  = props.dotRadius / 2;
      ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const d = dots[i];
        const dx = mouse.x - d.ax, dy = mouse.y - d.ay;
        const distSq = dx*dx + dy*dy;

        if (distSq < crSq && engagement > 0.01) {
          const dist = Math.sqrt(distSq);
          if (props.bulgeOnly) {
            const push = (1 - dist/props.cursorRadius) ** 2 * props.bulgeStrength * engagement;
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle)*push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle)*push - d.sy) * 0.15;
          } else {
            const angle = Math.atan2(dy, dx);
            const move = (500/dist) * (mouse.speed * props.cursorForce);
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (props.bulgeOnly) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!props.bulgeOnly) {
          d.vx *= 0.9; d.vy *= 0.9;
          d.x = d.ax + d.vx; d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        const drawX = d.sx, drawY = d.sy;
        ctx.moveTo(drawX + rad, drawY);
        ctx.arc(drawX, drawY, rad, 0, TWO_PI);
      }
      ctx.fill();
      // Dots only move near an active cursor: once everything has eased back, stop redrawing
      idle = (engagement === 0 && glowOpacity < 0.001) ? idle + 1 : 0;
      if (!onScreen || idle > 90) { running = false; return; }
      requestAnimationFrame(tick);
    }

    doResize();
    kick();
  })();

  // ── ColorBends hero background ─────────────────────
  (function() {
    const container = document.getElementById('colorbends-container');
    if (!container || typeof THREE === 'undefined') return;

    const MAX_COLORS = 8;
    const COLORS = ['#0b00c6'];
    const ROTATION=90,SPEED=0.25,SCALE=1.1,FREQUENCY=1;
    const WARP=1,MOUSE_INF=1,PARALLAX=0.65,NOISE=0.15;
    const ITERATIONS=1,INTENSITY=1.7,BAND_WIDTH=3;

    const frag=`#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;uniform float uTime;uniform float uSpeed;uniform vec2 uRot;
uniform int uColorCount;uniform vec3 uColors[MAX_COLORS];uniform int uTransparent;
uniform float uScale;uniform float uFrequency;uniform float uWarpStrength;
uniform vec2 uPointer;uniform float uMouseInfluence;uniform float uParallax;
uniform float uNoise;uniform int uIterations;uniform float uIntensity;uniform float uBandWidth;
varying vec2 vUv;
void main(){
  float t=uTime*uSpeed;vec2 p=vUv*2.0-1.0;
  p+=uPointer*uParallax*0.1;
  vec2 rp=vec2(p.x*uRot.x-p.y*uRot.y,p.x*uRot.y+p.y*uRot.x);
  vec2 q=vec2(rp.x*(uCanvas.x/uCanvas.y),rp.y);
  q/=max(uScale,0.0001);q/=0.5+0.2*dot(q,q);
  q+=0.2*cos(t)-7.56;
  q+=(uPointer-rp)*uMouseInfluence*0.2;
  for(int j=0;j<5;j++){
    if(j>=uIterations-1)break;
    vec2 rr=sin(1.5*(q.yx*uFrequency)+2.0*cos(q*uFrequency));
    q+=(rr-q)*0.15;
  }
  vec3 col=vec3(0.0);float a=1.0;
  if(uColorCount>0){
    vec2 s=q;vec3 sumCol=vec3(0.0);float cover=0.0;
    for(int i=0;i<MAX_COLORS;++i){
      if(i>=uColorCount)break;
      s-=0.01;
      vec2 r=sin(1.5*(s.yx*uFrequency)+2.0*cos(s*uFrequency));
      float m0=length(r+sin(5.0*r.y*uFrequency-3.0*t+float(i))/4.0);
      float kBelow=clamp(uWarpStrength,0.0,1.0);float kMix=pow(kBelow,0.3);
      float gain=1.0+max(uWarpStrength-1.0,0.0);
      vec2 warped=s+(r-s)*kBelow*gain;
      float m1=length(warped+sin(5.0*warped.y*uFrequency-3.0*t+float(i))/4.0);
      float m=mix(m0,m1,kMix);
      float w=1.0-exp(-uBandWidth/exp(uBandWidth*m));
      sumCol+=uColors[i]*w;cover=max(cover,w);
    }
    col=clamp(sumCol,0.0,1.0);a=uTransparent>0?cover:1.0;
  }
  col*=uIntensity;
  if(uNoise>0.0001){
    float n=fract(sin(dot(gl_FragCoord.xy+vec2(uTime),vec2(12.9898,78.233)))*43758.5453123);
    col+=(n-0.5)*uNoise;col=clamp(col,0.0,1.0);
  }
  gl_FragColor=vec4(uTransparent>0?col*a:col,a);
}`;

    const vert=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;

    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const geometry=new THREE.PlaneGeometry(2,2);

    function hex3(hex){const h=hex.replace('#','');return new THREE.Vector3(parseInt(h.slice(0,2),16)/255,parseInt(h.slice(2,4),16)/255,parseInt(h.slice(4,6),16)/255);}

    const uColorsArr=Array.from({length:MAX_COLORS},()=>new THREE.Vector3());
    COLORS.slice(0,MAX_COLORS).forEach((c,i)=>uColorsArr[i].copy(hex3(c)));
    const rad=ROTATION*Math.PI/180;

    const material=new THREE.ShaderMaterial({
      vertexShader:vert,fragmentShader:frag,
      uniforms:{
        uCanvas:{value:new THREE.Vector2(1,1)},uTime:{value:0},uSpeed:{value:SPEED},
        uRot:{value:new THREE.Vector2(Math.cos(rad),Math.sin(rad))},
        uColorCount:{value:COLORS.length},uColors:{value:uColorsArr},
        uTransparent:{value:1},uScale:{value:SCALE},uFrequency:{value:FREQUENCY},
        uWarpStrength:{value:WARP},uPointer:{value:new THREE.Vector2(0,0)},
        uMouseInfluence:{value:MOUSE_INF},uParallax:{value:PARALLAX},
        uNoise:{value:NOISE},uIterations:{value:ITERATIONS},
        uIntensity:{value:INTENSITY},uBandWidth:{value:BAND_WIDTH},
      },
      premultipliedAlpha:true,transparent:true,
    });

    scene.add(new THREE.Mesh(geometry,material));

    const renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(1); // soft gradient: 1x is visually identical and 4x cheaper on retina
    renderer.setClearColor(0x000000,0);
    Object.assign(renderer.domElement.style,{position:'absolute',inset:'0',width:'100%',height:'100%',display:'block'});
    container.appendChild(renderer.domElement);

    function resize(){const w=container.clientWidth||1,h=container.clientHeight||1;renderer.setSize(w,h,false);material.uniforms.uCanvas.value.set(w,h);}
    new ResizeObserver(resize).observe(container);
    resize();

    const ptr={t:new THREE.Vector2(),c:new THREE.Vector2()};
    window.addEventListener('pointermove',e=>{
      const r=container.getBoundingClientRect();
      ptr.t.set(((e.clientX-r.left)/(r.width||1))*2-1,-(((e.clientY-r.top)/(r.height||1))*2-1));
    },{passive:true});

    const clock=new THREE.Clock();
    let running=false,onScreen=true,odd=false;
    function loop(){
      if(!onScreen){running=false;clock.stop();return;}
      requestAnimationFrame(loop);
      if((odd=!odd))return; // slow-moving shader: 30fps is plenty
      const dt=clock.getDelta();
      material.uniforms.uTime.value=clock.elapsedTime;
      ptr.c.lerp(ptr.t,Math.min(1,dt*8));
      material.uniforms.uPointer.value.copy(ptr.c);
      renderer.render(scene,camera);
    }
    spWhenVisible(container,v=>{onScreen=v;if(v&&!running){running=true;clock.start();requestAnimationFrame(loop);}});
  })();

  // ── ASCIIText (removed) ────────────────────────────
  (function() {
    const container = document.getElementById('ascii-stockpilo');
    if (!container) return;

    Math.map = (n, a, b, c, d) => ((n-a)/(b-a))*(d-c)+c;
    const PX = window.devicePixelRatio || 1;

    const VERT = `
varying vec2 vUv; uniform float uTime; uniform float uEnableWaves;
void main(){vUv=uv;vec3 p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
    const FRAG = `
varying vec2 vUv; uniform float uTime; uniform sampler2D uTexture;
void main(){vec2 pos=vUv;
float r=texture2D(uTexture,pos+cos(uTime*2.-uTime+pos.x)*.01).r;
float g=texture2D(uTexture,pos+tan(uTime*.5+pos.x-uTime)*.01).g;
float b=texture2D(uTexture,pos-cos(uTime*2.+uTime+pos.y)*.01).b;
float a=texture2D(uTexture,pos).a;
gl_FragColor=vec4(r,g,b,a);}`;

    const CHARSET = " .'`^\",;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";

    // Build text canvas
    const txtCanvas = document.createElement('canvas');
    const txtCtx = txtCanvas.getContext('2d');
    const FONT = '600 200px "IBM Plex Mono", monospace';
    txtCtx.font = FONT;
    const m = txtCtx.measureText('StockPilo');
    txtCanvas.width  = Math.ceil(m.width) + 20;
    txtCanvas.height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + 20;
    function renderText() {
      txtCtx.clearRect(0,0,txtCanvas.width,txtCanvas.height);
      txtCtx.fillStyle = '#fdf9f3';
      txtCtx.font = FONT;
      const m2 = txtCtx.measureText('StockPilo');
      txtCtx.fillText('StockPilo', 10, 10 + m2.actualBoundingBoxAscent);
    }
    renderText();

    // Three.js scene
    const W = container.clientWidth || 400;
    const H = container.clientHeight || 80;
    const camera = new THREE.PerspectiveCamera(45, W/H, 1, 1000);
    camera.position.z = 30;
    const scene = new THREE.Scene();
    const texture = new THREE.CanvasTexture(txtCanvas);
    texture.minFilter = THREE.NearestFilter;
    const aspect = txtCanvas.width / txtCanvas.height;
    const bh = 8, bw = bh * aspect;
    const geo = new THREE.PlaneGeometry(bw, bh, 36, 36);
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true,
      uniforms: { uTime:{value:0}, uTexture:{value:texture}, uEnableWaves:{value:0} }
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // Renderer
    const renderer = new THREE.WebGLRenderer({antialias:false,alpha:true});
    renderer.setPixelRatio(1);
    renderer.setClearColor(0,0);

    // ASCII overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    const pre = document.createElement('pre');
    pre.style.cssText = `margin:0;padding:0;line-height:1em;position:absolute;left:0;top:0;z-index:9;
      font-family:"IBM Plex Mono",monospace;font-size:7px;mix-blend-mode:difference;
      background-image:radial-gradient(circle,#ff6188 0%,#fc9867 50%,#ffd866 100%);
      background-attachment:fixed;-webkit-text-fill-color:transparent;-webkit-background-clip:text;background-clip:text;`;
    const aCanvas = document.createElement('canvas');
    overlay.appendChild(pre);
    overlay.appendChild(aCanvas);
    container.appendChild(overlay);
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    const aCtx = aCanvas.getContext('2d');
    aCtx.imageSmoothingEnabled = false;

    let cols, rows, degRot = 0;
    const mouse = {x: W/2, y: H/2};

    function setSize(w, h) {
      camera.aspect = w/h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      aCtx.font = `7px "IBM Plex Mono",monospace`;
      const cw = aCtx.measureText('A').width;
      cols = Math.floor(w / cw);
      rows = Math.floor(h / 7);
      aCanvas.width = cols; aCanvas.height = rows;
      pre.style.fontSize = '7px';
    }
    setSize(W, H);

    document.addEventListener('mousemove', e => { mouse.x = e.clientX*PX; mouse.y = e.clientY*PX; });

    function asciify() {
      const w = aCanvas.width, h = aCanvas.height;
      aCtx.clearRect(0,0,w,h);
      aCtx.drawImage(renderer.domElement, 0,0, w, h);
      const data = aCtx.getImageData(0,0,w,h).data;
      let str = '';
      for (let y=0; y<h; y++) {
        for (let x=0; x<w; x++) {
          const i = (x + y*w)*4;
          if (data[i+3]===0){str+=' ';continue;}
          const gray=(0.3*data[i]+0.6*data[i+1]+0.1*data[i+2])/255;
          str += CHARSET[CHARSET.length - 1 - Math.floor((1-gray)*(CHARSET.length-1))];
        }
        str += '\n';
      }
      pre.textContent = str;
    }

    function hue() {
      const cx = W/2, cy = H/2;
      const deg = Math.atan2(mouse.y-cy, mouse.x-cx)*180/Math.PI;
      degRot += (deg-degRot)*0.075;
      overlay.style.filter = `hue-rotate(${degRot.toFixed(1)}deg)`;
    }

    new ResizeObserver(([e]) => {
      const {width:w,height:h} = e.contentRect;
      if(w>0&&h>0) setSize(w,h);
    }).observe(container);

    let mx=0, my=0;
    container.addEventListener('mousemove', e => {
      const r = container.getBoundingClientRect();
      mx = e.clientX - r.left; my = e.clientY - r.top;
    });

    (function loop() {
      const t = Date.now()*0.001;
      renderText(); texture.needsUpdate = true;
      mat.uniforms.uTime.value = Math.sin(t);
      const rx = Math.map(my, 0, H, 0.3, -0.3);
      const ry = Math.map(mx, 0, W, -0.3, 0.3);
      mesh.rotation.x += (rx-mesh.rotation.x)*0.05;
      mesh.rotation.y += (ry-mesh.rotation.y)*0.05;
      renderer.render(scene, camera);
      asciify(); hue();
      requestAnimationFrame(loop);
    })();
  })();

  // ── ElectricBorder (Pro card) ──────────────────────
  (function() {
    const canvas = document.getElementById('pro-eb-canvas');
    const wrap   = document.getElementById('pro-eb-wrap');
    if (!canvas || !wrap) return;

    // Use the inner plan-card as size reference (not the wrapper which includes canvas overflow)
    const card = wrap.querySelector('.plan-card-featured');
    if (!card) return;

    const ctx = canvas.getContext('2d');
    const SPEED = 0.3, CHAOS = 0.26, BORDER_RADIUS = 16;
    const OFFSET = 60, DISP = 60;
    const COLOR = '#1a0aa5';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0, time = 0, lastT = 0;

    function rand(x) { return ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1; }

    function noise2D(x, y) {
      const i = Math.floor(x), j = Math.floor(y);
      const fx = x - i, fy = y - j;
      const a = rand(i+j*57), b = rand(i+1+j*57);
      const c = rand(i+(j+1)*57), d = rand(i+1+(j+1)*57);
      const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy);
      return a*(1-ux)*(1-uy)+b*ux*(1-uy)+c*(1-ux)*uy+d*ux*uy;
    }

    function octNoise(x, t, seed) {
      let y=0, amp=CHAOS, freq=10;
      for (let i=0; i<10; i++) {
        if (i > 0) y += amp * noise2D(freq*x + seed*100, t*freq*0.3);
        freq *= 1.6; amp *= 0.7;
      }
      return y;
    }

    function corner(cx,cy,r,sa,al,p){ const a=sa+p*al; return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}; }

    function rectPoint(t,l,top,w,h,r) {
      const sw=w-2*r,sh=h-2*r,ca=Math.PI*r/2;
      const perim=2*sw+2*sh+4*ca;
      let d=t*perim,acc=0;
      if(d<=acc+sw){return{x:l+r+(d-acc)/sw*sw,y:top};} acc+=sw;
      if(d<=acc+ca){return corner(l+w-r,top+r,r,-Math.PI/2,Math.PI/2,(d-acc)/ca);} acc+=ca;
      if(d<=acc+sh){return{x:l+w,y:top+r+(d-acc)/sh*sh};} acc+=sh;
      if(d<=acc+ca){return corner(l+w-r,top+h-r,r,0,Math.PI/2,(d-acc)/ca);} acc+=ca;
      if(d<=acc+sw){return{x:l+w-r-(d-acc)/sw*sw,y:top+h};} acc+=sw;
      if(d<=acc+ca){return corner(l+r,top+h-r,r,Math.PI/2,Math.PI/2,(d-acc)/ca);} acc+=ca;
      if(d<=acc+sh){return{x:l,y:top+h-r-(d-acc)/sh*sh};} acc+=sh;
      return corner(l+r,top+r,r,Math.PI,Math.PI/2,(d-acc)/ca);
    }

    const canvasWrap = canvas.parentElement;

    function resize() {
      const cardRect = card.getBoundingClientRect();
      const wrapRect = canvasWrap.getBoundingClientRect();
      W = cardRect.width  + OFFSET*2;
      H = cardRect.height + OFFSET*2;
      canvas.width  = W*dpr; canvas.height = H*dpr;
      canvas.style.width     = W+'px';
      canvas.style.height    = H+'px';
      canvas.style.position  = 'absolute';
      canvas.style.transform = 'none';
      // Align canvas so (OFFSET,OFFSET) lands exactly on card top-left
      canvas.style.left = (cardRect.left - wrapRect.left - OFFSET) + 'px';
      canvas.style.top  = (cardRect.top  - wrapRect.top  - OFFSET) + 'px';
    }

    new ResizeObserver(resize).observe(card);
    resize();

    let ebOdd = false;
    function draw(now) {
      if ((ebOdd = !ebOdd) && ebOn) { requestAnimationFrame(draw); return; } // 30fps is enough for the wobble
      const dt = (now - lastT) / 1000;
      time += dt * SPEED;
      lastT = now;

      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.scale(dpr,dpr);
      ctx.strokeStyle = COLOR;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const l=OFFSET, top=OFFSET;
      const bw=W-2*OFFSET, bh=H-2*OFFSET;
      const r = Math.min(BORDER_RADIUS, Math.min(bw,bh)/2);
      const perim = 2*(bw+bh)+2*Math.PI*r;
      const samples = Math.floor(perim/5); // noise is low-frequency: 5px segments look identical, 2.5x less work

      ctx.beginPath();
      for (let i=0; i<=samples; i++) {
        const p = i/samples;
        const pt = rectPoint(p,l,top,bw,bh,r);
        const dx = octNoise(p*8, time, 0) * DISP;
        const dy = octNoise(p*8, time, 1) * DISP;
        i===0 ? ctx.moveTo(pt.x+dx,pt.y+dy) : ctx.lineTo(pt.x+dx,pt.y+dy);
      }
      ctx.closePath();
      ctx.stroke();
      if (!ebOn) { ebRun = false; return; }
      requestAnimationFrame(draw);
    }
    let ebOn = true, ebRun = false;
    spWhenVisible(card, v => { ebOn = v; if (v && !ebRun) { ebRun = true; requestAnimationFrame(t => { lastT = t; draw(t); }); } });
  })();

  // ── BorderGlow on cs-cards ─────────────────────────
  (function() {
    document.querySelectorAll('.cs-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2, cy = rect.height / 2;
        const dx = x - cx, dy = y - cy;
        // edge proximity
        const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
        const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
        const edge = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1) * 100;
        // cursor angle
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        card.style.setProperty('--edge-proximity', edge.toFixed(2));
        card.style.setProperty('--cursor-angle', angle.toFixed(2) + 'deg');
      });
    });
  })();

  // ── LogoLoop ───────────────────────────────────────
  (function() {
    const track = document.getElementById('logo-loop-track');
    const seq   = document.getElementById('logo-loop-seq');
    if (!track || !seq) return;

    // Duplicate sequence for seamless loop
    let copies = 0;
    function fillTrack() {
      const wrap = track.parentElement;
      const containerW = wrap ? wrap.clientWidth : window.innerWidth;
      const seqW = seq.scrollWidth;
      if (seqW === 0) return;
      const needed = Math.ceil(containerW / seqW) + 2;
      while (copies < needed) {
        const clone = seq.cloneNode(true);
        clone.removeAttribute('id');
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
        copies++;
      }
    }

    // Wait for images then fill
    const imgs = seq.querySelectorAll('img');
    let loaded = 0;
    const onLoad = () => { if (++loaded >= imgs.length) fillTrack(); };
    imgs.forEach(img => {
      if (img.complete) onLoad();
      else { img.addEventListener('load', onLoad); img.addEventListener('error', onLoad); }
    });
    if (imgs.length === 0) fillTrack();

    const SPEED = 80; // px/s
    let offset = 0, last = null, paused = false;

    track.addEventListener('mouseenter', () => paused = true);
    track.addEventListener('mouseleave', () => paused = false);

    let llOn = true, llRun = true;
    spWhenVisible(track, v => { llOn = v; if (v && !llRun) { llRun = true; last = null; requestAnimationFrame(loop); } });
    (function loop(ts) {
      if (!llOn) { llRun = false; return; }
      if (last !== null && !paused) {
        const dt = (ts - last) / 1000;
        offset += SPEED * dt;
        const seqW = seq.scrollWidth;
        if (seqW > 0) offset = offset % seqW;
        track.style.transform = `translate3d(${-offset}px,0,0)`;
      }
      last = ts;
      requestAnimationFrame(loop);
    })(0);

    window.addEventListener('resize', () => { copies = 0; track.querySelectorAll('[aria-hidden]').forEach(e=>e.remove()); fillTrack(); });
  })();

  // ── CardSwap ───────────────────────────────────────
  (function() {
    if (typeof gsap === 'undefined') return;
    const container = document.getElementById('card-swap-wrap');
    if (!container) return;

    const W = 380, H = 420, distX = 55, distY = 65, skew = 6, delay = 4000;
    container.style.width = W + 'px';
    container.style.height = H + 'px';

    const cards = Array.from(container.querySelectorAll('.cs-card'));
    const total = cards.length;
    cards.forEach(c => { c.style.width = W + 'px'; c.style.height = H + 'px'; });

    const makeSlot = i => ({ x: i*distX, y: -i*distY, z: -i*distX*1.5, zi: total-i });
    const place = (el, s) => gsap.set(el, { x:s.x, y:s.y, z:s.z, xPercent:-50, yPercent:-50, skewY:skew, transformOrigin:'center center', zIndex:s.zi, force3D:true });

    const order = cards.map((_,i) => i);
    cards.forEach((c,i) => place(c, makeSlot(i)));

    const cfg = { ease:'elastic.out(0.6,0.9)', durDrop:2, durMove:2, durReturn:2, overlap:0.9, retDelay:0.05 };

    function swap() {
      if (order.length < 2) return;
      const front = order[0], rest = order.slice(1);
      const elFront = cards[front];
      const tl = gsap.timeline();

      tl.to(elFront, { y:'+=500', duration:cfg.durDrop, ease:cfg.ease });
      tl.addLabel('promote', `-=${cfg.durDrop * cfg.overlap}`);

      rest.forEach((idx, i) => {
        const s = makeSlot(i);
        tl.set(cards[idx], { zIndex:s.zi }, 'promote');
        tl.to(cards[idx], { x:s.x, y:s.y, z:s.z, duration:cfg.durMove, ease:cfg.ease }, `promote+=${i*0.15}`);
      });

      const back = makeSlot(total - 1);
      tl.addLabel('return', `promote+=${cfg.durMove * cfg.retDelay}`);
      tl.call(() => gsap.set(elFront, { zIndex:back.zi }), undefined, 'return');
      tl.to(elFront, { x:back.x, y:back.y, z:back.z, duration:cfg.durReturn, ease:cfg.ease }, 'return');
      tl.call(() => { order.push(order.shift()); });
    }

    // RotatingText + subtext synced with cards
    const rtWords = ['Intelligence', 'Market data', 'AI Insights'];
    const rtSubs  = [
      'Get a tailored morning brief crafted by Stockpilo AI — macro signals, earnings alerts and watchlist moves, delivered before the market opens.',
      'See which stocks are moving and why. Live top gainers and losers updated every 15 seconds, with AI context on every significant price move.',
      'Every price spike gets an explanation. Stockpilo AI analyses earnings, news and analyst upgrades so you always know the reason behind the move.'
    ];
    const rtWrap = document.getElementById('rotating-word-wrap');
    const rtEl   = document.getElementById('rotating-word');
    const rtSub  = document.getElementById('rotating-sub');
    let rtIndex  = 0;

    // Hidden ruler to measure text width
    const rtRuler = document.createElement('span');
    Object.assign(rtRuler.style, {
      position:'absolute', visibility:'hidden', whiteSpace:'nowrap',
      fontFamily:'Geist,sans-serif', fontWeight:'700',
      fontSize: getComputedStyle(rtWrap.closest('h2')||document.body).fontSize || '36px',
      letterSpacing: getComputedStyle(rtWrap.closest('h2')||document.body).letterSpacing,
      boxSizing: 'content-box',
    });
    document.body.appendChild(rtRuler);

    function rtShow(text) {

      const existingChars = Array.from(rtEl.children);
      existingChars.forEach((c, i) => {
        c.style.animation = 'none';
        void c.offsetHeight;
        c.style.animation = `rtOut 0.25s cubic-bezier(.55,0,1,.45) ${i * 0.02}s both`;
      });
      const outDur = existingChars.length * 0.02 + 0.3;
      setTimeout(() => {
        rtEl.innerHTML = '';
        const chars = Array.from(text);
        chars.forEach((ch, i) => {
          const s = document.createElement('span');
          s.className = 'rt-char';
          if (ch === ' ') {
            s.innerHTML = '&nbsp;';
            s.style.minWidth = '0.28em';
          } else {
            s.textContent = ch;
          }
          s.style.animation = `rtIn 0.4s cubic-bezier(.34,1.56,.64,1) ${(chars.length-1-i)*0.025}s both`;
          rtEl.appendChild(s);
        });
      }, outDur * 1000);
    }

    function rtSubSwap(text) {
      if (!rtSub) return;
      rtSub.style.opacity = '0';
      setTimeout(() => { rtSub.textContent = text; rtSub.style.opacity = '1'; }, 300);
    }

    rtShow(rtWords[0]);

    function swapWithText() {
      swap();
      setTimeout(() => {
        rtIndex = (rtIndex + 1) % rtWords.length;
        rtShow(rtWords[rtIndex]);
        rtSubSwap(rtSubs[rtIndex]);
      }, 400);
    }

    swapWithText();
    setInterval(swapWithText, delay);
  })();

  // ── Fi-section logos scatter animation ─────────────
  (function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    const section = document.getElementById('fi-section');
    if (!section) return;
    const items = Array.from(section.querySelectorAll('.fi-icon'));
    if (!items.length) return;

    const offsets = [
      { x: -160, y: -120 }, { x: 80,   y: -150 }, { x: -140, y: 120 },
      { x: 150,  y: 100  }, { x: -60,  y: -160 }, { x: 120,  y: -80 },
      { x: -120, y: 80   }, { x: 160,  y: -120 }, { x: -80,  y: 140 },
      { x: 60,   y: 160  }, { x: 180,  y: 40   }, { x: -170, y: 20  },
    ];

    items.forEach((el, i) => {
      const off = offsets[i % offsets.length];
      gsap.set(el, { x: off.x, y: off.y, opacity: 0, scale: 0.7 });
    });

    gsap.to(items, {
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        end: 'top 10%',
        scrub: 1.4,
      },
      x: 0, y: 0, opacity: 1, scale: 1,
      ease: 'power2.out',
      stagger: 0.06,
    });
  })();

  // ── GooeyNav ───────────────────────────────────────
  (function () {
    const container  = document.getElementById('gooey-nav');
    const navUl      = document.getElementById('gooey-nav-ul');
    const filterEl   = document.getElementById('gnav-filter');
    const textEl     = document.getElementById('gnav-text');
    if (!container || !navUl || !filterEl || !textEl) return;

    const ANIMATION_TIME   = 600;
    const PARTICLE_COUNT   = 15;
    const PARTICLE_DIST    = [90, 10];
    const PARTICLE_R       = 100;
    const TIME_VARIANCE    = 300;
    const COLORS           = [1, 2, 3, 1, 2, 3, 1, 4];

    let activeIndex = -1;

    const noise = n => n / 2 - Math.random() * n;

    function getXY(distance, pointIndex, total) {
      const angle = ((360 + noise(8)) / total) * pointIndex * (Math.PI / 180);
      return [distance * Math.cos(angle), distance * Math.sin(angle)];
    }

    function createParticle(i, t) {
      const rotate = noise(PARTICLE_R / 10);
      return {
        start: getXY(PARTICLE_DIST[0], PARTICLE_COUNT - i, PARTICLE_COUNT),
        end:   getXY(PARTICLE_DIST[1] + noise(7), PARTICLE_COUNT - i, PARTICLE_COUNT),
        time:  t,
        scale: 1 + noise(0.2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotate: rotate > 0 ? (rotate + PARTICLE_R / 20) * 10 : (rotate - PARTICLE_R / 20) * 10,
      };
    }

    function makeParticles(el) {
      const bubbleTime = ANIMATION_TIME * 2 + TIME_VARIANCE;
      el.style.setProperty('--time', `${bubbleTime}ms`);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = ANIMATION_TIME * 2 + noise(TIME_VARIANCE * 2);
        const p = createParticle(i, t);
        el.classList.remove('active');
        setTimeout(() => {
          const particle = document.createElement('span');
          const point    = document.createElement('span');
          particle.classList.add('particle');
          particle.style.setProperty('--start-x', `${p.start[0]}px`);
          particle.style.setProperty('--start-y', `${p.start[1]}px`);
          particle.style.setProperty('--end-x',   `${p.end[0]}px`);
          particle.style.setProperty('--end-y',   `${p.end[1]}px`);
          particle.style.setProperty('--time',    `${p.time}ms`);
          particle.style.setProperty('--scale',   `${p.scale}`);
          particle.style.setProperty('--color',   `var(--color-${p.color}, white)`);
          particle.style.setProperty('--rotate',  `${p.rotate}deg`);
          point.classList.add('point');
          particle.appendChild(point);
          el.appendChild(particle);
          requestAnimationFrame(() => el.classList.add('active'));
          setTimeout(() => { try { el.removeChild(particle); } catch {} }, t);
        }, 30);
      }
    }

    function updateEffectPosition(li) {
      const cRect = container.getBoundingClientRect();
      const pos   = li.getBoundingClientRect();
      const styles = {
        left:   `${pos.x - cRect.x}px`,
        top:    `${pos.y - cRect.y}px`,
        width:  `${pos.width}px`,
        height: `${pos.height}px`,
      };
      Object.assign(filterEl.style, styles);
      Object.assign(textEl.style, styles);
      textEl.innerText = li.querySelector('a')?.innerText || '';
    }

    function activate(li, index) {
      if (activeIndex === index) return;
      activeIndex = index;

      navUl.querySelectorAll('li').forEach((el, i) => {
        el.classList.toggle('active', i === index);
      });

      updateEffectPosition(li);

      filterEl.querySelectorAll('.particle').forEach(p => filterEl.removeChild(p));

      textEl.classList.remove('active');
      void textEl.offsetWidth;
      textEl.classList.add('active');

      makeParticles(filterEl);
    }

    navUl.querySelectorAll('li').forEach((li, index) => {
      li.addEventListener('click', () => activate(li, index));
    });

    // Init position on first paint
    requestAnimationFrame(() => {
      const ro = new ResizeObserver(() => {
        const activeLi = navUl.querySelectorAll('li')[activeIndex];
        if (activeLi) updateEffectPosition(activeLi);
      });
      ro.observe(container);
    });
  })();

  // ── Header (efferd/header-2) ───────────────────────
  (function() {
    const header = document.getElementById('site-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconMenu = document.getElementById('icon-menu');
    const iconClose = document.getElementById('icon-close');

    // Scroll-based shrink with hysteresis
    const SCROLL_DOWN = 10, SCROLL_UP = 5;
    let wasScrolled = false;
    function updateHeader() {
      const y = window.scrollY;
      const shouldScroll = wasScrolled ? y > SCROLL_UP : y > SCROLL_DOWN;
      if (shouldScroll !== wasScrolled) {
        wasScrolled = shouldScroll;
        header.classList.toggle('scrolled', shouldScroll);
      }
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();

    // Show hamburger on mobile
    function syncHamburger() {
      mobileMenuBtn.style.display = window.innerWidth < 768 ? 'flex' : 'none';
    }
    syncHamburger();
    window.addEventListener('resize', syncHamburger);

    // Mobile menu open/close
    function openMenu() {
      mobileMenu.style.display = 'flex';
      mobileMenu.setAttribute('aria-hidden', 'false');
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
      iconMenu.style.display = 'none';
      iconClose.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      mobileMenu.style.display = 'none';
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      iconMenu.style.display = 'block';
      iconClose.style.display = 'none';
      document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.style.display === 'none' ? openMenu() : closeMenu();
    });
    document.getElementById('mobile-backdrop').addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  })();

  // ── WhisperText ────────────────────────────────────
  (function() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('[data-whisper]').forEach(el => {
      const delay    = parseFloat(el.dataset.delay    || 0.08);
      const duration = parseFloat(el.dataset.duration || 0.45);
      const x        = parseFloat(el.dataset.x        || -20);
      const y        = parseFloat(el.dataset.y        || 0);

      // Split text into word spans
      const text = el.textContent.trim();
      el.innerHTML = text
        .split(/\s+/)
        .map(w => `<span data-word style="display:inline-block;white-space:nowrap">${w}</span>`)
        .join(' ');

      const words = el.querySelectorAll('[data-word]');
      gsap.set(words, { opacity: 0, x, y });
      gsap.to(words, {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true,
        },
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        ease: 'power2.out',
        stagger: delay,
      });
    });
  })();
