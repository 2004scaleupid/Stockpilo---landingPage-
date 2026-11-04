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
    // Data for the three pinned events, taken from the in-app event view (Nov 3)
    // Shared market readout for the three events (session of Nov 2)
    var AFF = ['XOM','Exxon Mobil Corp.','−4.05%'];
    var RO = [['BNO · BRENT','65.95','−7.62%'],['USO · WTI','156.87','−7.08%'],['XLE · ENERGY','67.25','−3.96%'],['UUP · DOLLAR','28.96','−0.14%']];
    var SINCE = ['XLE','−3.96%','Last session · Nov 2'];
    var SPARK = [16,15,15,14,14,13,12,12,11,10,9,8,7,6,5];
    var SEC = [['Discret.',2.4],['Financials',1.9],['Staples',1.6],['Industrials',1.4],['Info Tech',-2.9],['Energy',-4.0]];
    var EVENTS = [
      { tag:'GEOPOLITICS', src:'wsj.com · Nov 3', risk:'HIGH RISK', high:true, region:'UNITED STATES · IRAN',
        title:'Oil Prices Rebound as U.S. Strikes on Iran Renew Supply Concerns',
        pin:'Oil prices rebound as…',
        bg:'Oil is bought and sold on one world market, so a supply problem in one country changes the price everywhere. Fuel costs for drivers, airlines and shipping companies follow the price of crude oil.',
        why:'The Wall Street Journal reports that oil prices rose as fresh U.S. strikes on Iran occurred. Dated Brent (EIA), the main global oil price, was $123.1 a barrel on Oct 27.',
        noteB:'XOM closed down 4.05% in the last session.', watch:'Coming up: the weekly US crude oil stockpile report from the EIA on Nov 4.', noteG:'Energy stocks like XOM are among the most sensitive to changes in the oil price.', next:'NEXT · CPI NOV 10 · FOMC DEC 9', a:['CPI','FOMC'],
        aff:AFF, ro:RO, since:SINCE, spark:SPARK, sec:SEC },
      { tag:'GEOPOLITICS', src:'cnbc.com · Nov 3', risk:'HIGH RISK', high:true, region:'SAUDI ARABIA',
        title:'Aramco\u2019s profit rises as refining margins strengthen amid Iran war',
        pin:'Aramco\u2019s profit rises…',
        bg:'Oil is bought and sold on one world market, so a supply problem in one country changes the price everywhere. Fuel costs for drivers, airlines and shipping companies follow the price of crude oil.',
        why:'CNBC reports that Aramco\u2019s adjusted net income rose 9% to $31.2 billion in the third quarter, with downstream earnings up 234%.',
        noteB:'XOM closed down 4.05% in the last session.', watch:'Coming up: the weekly US crude oil stockpile report from the EIA on Nov 4.', noteG:'Energy stocks like XOM are among the most sensitive to changes in the oil price.', next:'NEXT · CPI NOV 10 · FOMC DEC 9', a:['CPI','FOMC'],
        aff:AFF, ro:RO, since:SINCE, spark:SPARK, sec:SEC },
      { tag:'GEOPOLITICS', src:'reuters.com · Nov 3', risk:'HIGH RISK', high:true, region:'EUROPE',
        title:'Europe stocks set to fall as US-Iran tensions fuel oil rebound',
        pin:'Europe stocks set to fall…',
        bg:'Oil is bought and sold on one world market, so a supply problem in one country changes the price everywhere. Fuel costs for drivers, airlines and shipping companies follow the price of crude oil.',
        why:'Reuters reports that US-Iran tensions are causing a rebound in oil prices. Dated Brent (EIA), the main global oil price, was $123.1 a barrel on Oct 27.',
        noteB:'XOM closed down 4.05% in the last session.', watch:'Coming up: the weekly US crude oil stockpile report from the EIA on Nov 4.', noteG:'Energy stocks like XOM are among the most sensitive to changes in the oil price.', next:'NEXT · CPI NOV 10 · FOMC DEC 9', a:['CPI','FOMC'],
        aff:AFF, ro:RO, since:SINCE, spark:SPARK, sec:SEC }
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
