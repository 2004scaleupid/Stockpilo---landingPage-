  // ── Features: Stockpilo app mock — Geopolitical Events ───────────
  (function() {
    var app = document.getElementById('sp-app');
    if (!app) return;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var evs = Array.prototype.slice.call(app.querySelectorAll('.sp-ev'));
    var pins = Array.prototype.slice.call(app.querySelectorAll('.sp-pin'));
    var lbl = document.getElementById('sp-lbl');
    var cur = 0, timer = 0;

    function select(i) {
      cur = i;
      evs.forEach(function(e, k) { e.classList.toggle('is-on', k === i); });
      pins.forEach(function(p, k) { p.classList.toggle('is-on', k === i); });
      var p = pins[i], e = evs[i];
      lbl.style.left = p.style.left; lbl.style.top = p.style.top;
      lbl.innerHTML = '<small>' + e.querySelector('.sp-ev-m').textContent + '</small>' + e.querySelector('.sp-ev-h').textContent;
    }
    function auto() { clearInterval(timer); if (!reduce && !isOpen) timer = setInterval(function() { select((cur + 1) % evs.length); }, 3200); }
    evs.forEach(function(e, i) {
      e.addEventListener('mouseenter', function() { clearInterval(timer); select(i); });
      e.addEventListener('focus', function() { clearInterval(timer); select(i); });
      e.addEventListener('click', function(ev) { open(i, ev.detail === 0); });
      e.addEventListener('mouseleave', auto);
    });
    app.querySelectorAll('.sp-ic').forEach(function(b) {
      b.addEventListener('click', function() { app.querySelectorAll('.sp-ic').forEach(function(o) { o.classList.toggle('is-on', o === b); }); });
    });

    // ── Event detail ────────────────────────────────
    // Illustrative data for the three pinned events (mock of the in-app event view)
    var EVENTS = [
      { tag:'ENERGY', src:'cnbc.com · Sep 25', risk:'HIGH RISK', high:true, region:'RUSSIA',
        title:'Oil rises amid worries of Russian supply disruption',
        pin:'Oil rises amid worries…',
        bg:'Russia is one of the world’s largest oil exporters. Attacks on its refineries and ports can take barrels off the market within days.',
        why:'Traders priced in fewer Russian barrels after new strikes on export terminals. Since the headline, Brent is up 1.8% and XLE (an energy fund) is up 1.1%.',
        noteB:'XOM is up 1.4% today.',
        watch:'Coming up: the weekly EIA crude inventory report on Oct 1.',
        noteG:'Higher oil helps producers but raises fuel costs for airlines.',
        next:'NEXT · EIA OCT 1 · OPEC+ OCT 5', a:['EIA','OPEC+'],
        aff:['XOM','Exxon Mobil Corp.','+1.42%'],
        ro:[['BRENT','71.42','+1.84%'],['WTI','67.90','+1.91%'],['XLE · ENERGY ETF','94.36','+1.12%'],['USD/RUB','82.40','+0.31%']],
        since:['XLE','+1.12%','From Sep 24 20:10 ET'], spark:[4,3,5,4,7,6,9,8,11,10,13,12,15,14,16],
        sec:[['Energy',1.42],['Materials',0.51],['Industrials',0.22],['Info Tech',-0.14],['Discret.',-0.38],['Utilities',-0.61]] },
      { tag:'MARKETS', src:'invezz.com · Sep 24', risk:'HIGH RISK', high:true, region:'MIDDLE EAST',
        title:'Dow closes 360 points higher as ceasefire hopes lift stocks',
        pin:'Dow closes 360 points…',
        bg:'Conflict in the Middle East puts oil shipping lanes at risk, which pushes up energy prices and weighs on stocks broadly.',
        why:'Reports of progress in ceasefire talks eased fears of a wider conflict. The Dow closed up 360 points (+0.8%) and SPY is up 0.6% since the headline.',
        noteB:'DAL is up 3.1% today.',
        watch:'Coming up: the September jobs report on Oct 2.',
        noteG:'Airlines like DAL gain when fuel prices fall.',
        next:'NEXT · JOBS OCT 2 · CPI OCT 14', a:['JOBS','CPI'],
        aff:['DAL','Delta Air Lines','+3.08%'],
        ro:[['DIA · DOW ETF','462.18','+0.81%'],['SPY','668.40','+0.62%'],['BRENT','69.10','−1.20%'],['GOLD','4,298.6','−0.38%']],
        since:['SPY','+0.61%','From Sep 24 09:30 ET'], spark:[3,5,4,6,5,8,7,9,11,10,12,13,12,14,15],
        sec:[['Industrials',1.08],['Financials',0.91],['Discret.',0.72],['Info Tech',0.48],['Utilities',-0.21],['Energy',-0.98]] },
      { tag:'GEOPOLITICS', src:'reuters.com · Sep 25', risk:'MEDIUM RISK', high:false, region:'CHINA',
        title:'China expands export control list to more US firms',
        pin:'China expands export c…',
        bg:'Most advanced chips are made in Taiwan and South Korea, using tools and rare earths from a handful of countries. Governments decide who can buy them.',
        why:'Beijing added more US companies to its export control list, limiting their access to rare earths. Since the headline, SOXX (a chip-stock fund) is down 0.9%.',
        noteB:'MP is up 6.2% today.',
        watch:'Coming up: the US trade balance report on Oct 7.',
        noteG:'Rare-earth miners like MP gain when China limits supply.',
        next:'NEXT · CPI OCT 14 · FOMC OCT 28', a:['CPI','FOMC'],
        aff:['MP','MP Materials Corp.','+6.21%'],
        ro:[['TSM','450.61','−0.12%'],['SOXX · SEMIS ETF','572.68','−0.94%'],['USD/CNY','7.1125','+0.13%'],['GOLD','4,321.2','+0.54%']],
        since:['SOXX','−0.94%','From Sep 25 04:12 ET'], spark:[14,15,13,14,12,13,11,12,10,11,9,10,8,9,8],
        sec:[['Materials',0.95],['Industrials',0.41],['Health Care',0.33],['Staples',0.18],['Info Tech',-0.64],['Telecom',-0.90]] }
    ];
    var dt = document.getElementById('sp-dt'), bar = document.getElementById('sp-dt-bar'), closeBtn = document.getElementById('sp-dt-x');
    var isOpen = false, openTimer = 0, visible = false, hovering = false, lastFocus = null;
    var f = {}; dt.querySelectorAll('[data-f]').forEach(function(el) { f[el.getAttribute('data-f')] = el; });
    var dpins = Array.prototype.slice.call(dt.querySelectorAll('.sp-dpin'));
    var tdots = Array.prototype.slice.call(dt.querySelectorAll('button.sp-tl-d'));
    function sign(v) { return v.charAt(0) === '+' ? 'sp-up' : 'sp-dn'; }
    function spark(pts, up) {
      var max = Math.max.apply(null, pts), min = Math.min.apply(null, pts), d = '';
      pts.forEach(function(p, k) { d += (k ? 'L' : 'M') + (k / (pts.length - 1) * 100).toFixed(1) + ' ' + (22 - (p - min) / (max - min || 1) * 20).toFixed(1); });
      return '<svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="' + d + '" fill="none" stroke="' + (up ? '#34d399' : '#f87171') + '" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>';
    }
    function fill(i) {
      var e = EVENTS[i];
      ['tag','src','region','title','bg','why','noteB','watch','noteG','next'].forEach(function(k) { f[k].textContent = e[k]; });
      f.risk.textContent = e.risk; f.risk.classList.toggle('is-high', e.high);
      f.pinLbl.textContent = e.pin; f.pinLbl.style.left = dpins[i].style.left; f.pinLbl.style.top = dpins[i].style.top;
      f.a1.textContent = e.a[0]; f.a2.textContent = e.a[1];
      f.pos.textContent = (i + 1) + ' / ' + EVENTS.length;
      f.aff.innerHTML = '<i>' + e.aff[0] + '</i><b>' + e.aff[0] + '</b><span>' + e.aff[1] + '</span><em class="' + sign(e.aff[2]) + '">' + e.aff[2] + '</em>';
      f.ro.innerHTML = e.ro.map(function(r) { return '<div><small>' + r[0] + '</small><b>' + r[1] + '</b><span class="' + sign(r[2]) + '">' + r[2] + '</span></div>'; }).join('');
      f.sinceLab.textContent = 'SINCE HEADLINE · ' + e.since[0];
      f.since.innerHTML = '<div><b class="' + sign(e.since[1]) + '">' + e.since[1] + '</b><small>' + e.since[2] + '</small></div>' + spark(e.spark, e.since[1].charAt(0) === '+');
      var mx = Math.max.apply(null, e.sec.map(function(s) { return Math.abs(s[1]); }));
      f.sec.innerHTML = e.sec.map(function(s) {
        var up = s[1] >= 0;
        return '<div class="sp-sec-r"><span>' + s[0] + '</span><span class="sp-sec-t"><i class="' + (up ? 'up' : 'dn') + '" data-w="' + (Math.abs(s[1]) / mx * 50).toFixed(1) + '%"></i></span><em class="' + (up ? 'sp-up' : 'sp-dn') + '">' + (up ? '+' : '−') + Math.abs(s[1]).toFixed(2) + '%</em></div>';
      }).join('');
      dpins.forEach(function(p, k) { p.classList.toggle('is-on', k === i); });
      tdots.forEach(function(d) { d.classList.toggle('is-on', +d.getAttribute('data-ev') === i); });
      // grow the sector bars after layout so the width transition runs
      requestAnimationFrame(function() { requestAnimationFrame(function() {
        f.sec.querySelectorAll('i').forEach(function(b) { b.style.width = b.getAttribute('data-w'); });
      }); });
    }
    function runBar() {
      bar.classList.remove('run'); void bar.offsetWidth;
      if (!reduce) bar.classList.add('run');
    }
    function open(i, focusIt) {
      clearTimeout(openTimer); clearInterval(timer);
      select(i); fill(i); runBar();
      if (!isOpen) {
        isOpen = true;
        lastFocus = document.activeElement;
        dt.classList.add('is-open'); dt.removeAttribute('inert'); dt.setAttribute('aria-hidden', 'false');
      }
      if (focusIt) closeBtn.focus({ preventScroll: true });
    }
    function close(advance) {
      if (!isOpen) return;
      var hadFocus = dt.contains(document.activeElement);
      isOpen = false;
      bar.classList.remove('run');
      dt.classList.remove('is-open'); dt.setAttribute('inert', ''); dt.setAttribute('aria-hidden', 'true');
      if (advance) select((cur + 1) % evs.length);
      if (hadFocus) (lastFocus && app.contains(lastFocus) ? lastFocus : evs[cur]).focus({ preventScroll: true });
      auto(); schedule();
    }
    function go(d) { open((cur + d + EVENTS.length) % EVENTS.length, false); }
    // Auto cycle: 15 s on the list, then the current event opens for 15 s (the progress bar), then back and on to the next
    function schedule() {
      clearTimeout(openTimer);
      if (reduce || isOpen || !visible || hovering) return;
      openTimer = setTimeout(function() { open(cur, false); }, 15000);
    }
    bar.addEventListener('animationend', function() { close(true); });
    closeBtn.addEventListener('click', function() { close(false); });
    document.getElementById('sp-dt-prev').addEventListener('click', function() { go(-1); });
    document.getElementById('sp-dt-next').addEventListener('click', function() { go(1); });
    dpins.concat(tdots).forEach(function(b) { b.addEventListener('click', function() { open(+b.getAttribute('data-ev'), false); }); });
    dt.addEventListener('keydown', function(ev) {
      if (ev.key === 'Escape') { ev.stopPropagation(); close(false); }
      else if (ev.key === 'ArrowRight') go(1);
      else if (ev.key === 'ArrowLeft') go(-1);
    });
    // Clicking the globe opens the nearest pinned event
    document.getElementById('sp-globe').addEventListener('click', function(ev) {
      var best = cur, bd = 1e9;
      pins.forEach(function(p, k) {
        var b = p.getBoundingClientRect(), dx = b.left + b.width / 2 - ev.clientX, dy = b.top + b.height / 2 - ev.clientY, dd = dx * dx + dy * dy;
        if (dd < bd) { bd = dd; best = k; }
      });
      open(bd < 60 * 60 ? best : cur, false);
    });
    // Pause the auto cycle while the pointer is on the app or it is off-screen
    app.addEventListener('mouseenter', function() { hovering = true; clearTimeout(openTimer); });
    app.addEventListener('mouseleave', function() { hovering = false; schedule(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(en) {
        visible = en[0].isIntersecting;
        app.classList.toggle('is-off', !visible);
        schedule();
      }, { threshold: 0.35 }).observe(app);
    } else { visible = true; schedule(); }
    auto();

    // Pointer: slight 3D tilt of the whole app + globe drifts the other way (depth)
    if (!reduce && window.matchMedia('(hover: hover) and (min-width: 1100px)').matches) {
      var stage = app.parentElement, globe = document.getElementById('sp-globe-img'), raf = 0, tx = 0, ty = 0;
      var rest = 'rotateX(5deg) rotateY(-7deg)';
      app.style.transform = rest;
      stage.addEventListener('mousemove', function(ev) {
        var b = stage.getBoundingClientRect();
        tx = (ev.clientX - b.left) / b.width - 0.5; ty = (ev.clientY - b.top) / b.height - 0.5;
        if (!raf) raf = requestAnimationFrame(function() {
          raf = 0;
          app.style.transform = 'rotateX(' + (-ty * 6).toFixed(2) + 'deg) rotateY(' + (tx * 8).toFixed(2) + 'deg)';
          globe.style.transform = 'translate3d(' + (-tx * 18).toFixed(1) + 'px,' + (-ty * 12).toFixed(1) + 'px,0)';
        });
      });
      stage.addEventListener('mouseleave', function() { app.style.transform = rest; globe.style.transform = ''; });
    }
  })();
