// #why cards: real screen recordings. Only the card on top plays, from the start;
// with reduced motion nothing autoplays and the play button is the only way in.
(function () {
  var section = document.getElementById('why');
  if (!section) return;

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var L = document.documentElement.lang === 'et'
    ? { pause: 'Peata video', play: 'Esita video' }
    : { pause: 'Pause video', play: 'Play video' };
  var ICON_PAUSE = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx=".8" fill="currentColor"/><rect x="7" y="1.5" width="3" height="9" rx=".8" fill="currentColor"/></svg>';
  var ICON_PLAY = '<svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M3 1.6v8.8a.6.6 0 0 0 .9.5l7-4.4a.6.6 0 0 0 0-1l-7-4.4a.6.6 0 0 0-.9.5z" fill="currentColor"/></svg>';

  var paused = REDUCE; // shared: pausing one card doesn't leave the next one autoplaying
  var cards = [];
  var current = null;
  var seen = {};

  function sync() {
    cards.forEach(function (c) {
      c.btn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
      c.btn.setAttribute('aria-label', paused ? L.play : L.pause);
      if (c === current && !paused) c.video.play().catch(function () {});
      else c.video.pause();
    });
  }

  section.querySelectorAll('.why-block').forEach(function (block) {
    var video = block.querySelector('.why-video');
    if (!video) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'why-vbtn';
    btn.addEventListener('click', function () { paused = !paused; sync(); });
    video.parentNode.appendChild(btn);
    cards.push({ block: block, video: video, btn: btn, idx: block.getAttribute('data-block') });
  });

  // Cards are sticky, so covered ones still "intersect": the top one is the last
  // card whose top has crossed 45% of the viewport.
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { seen[e.target.getAttribute('data-block')] = e.isIntersecting; });
    var top = null;
    cards.forEach(function (c) { if (seen[c.idx]) top = c; });
    if (top === current) return;
    current = top;
    if (current) {
      current.video.preload = 'auto';
      try { current.video.currentTime = 0; } catch (e) {}
    }
    sync();
  }, { rootMargin: '0px 0px -55% 0px', threshold: 0 });

  cards.forEach(function (c) { io.observe(c.block); });
  sync();
})();
