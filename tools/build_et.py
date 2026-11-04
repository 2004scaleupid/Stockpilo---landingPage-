"""Build et/index.html from index.html by exact string replacement.
Run from the project root after changing index.html:  python3 tools/build_et.py .
Every pair must match at least once, otherwise the build fails loudly."""
import sys, os

root = sys.argv[1]
src = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
s = src

DESC_EN = "Stockpilo is an AI stock market dashboard for retail investors: a daily market recap, news explained, earnings, Congress trades and world events in one view."
DESC_ET = "Stockpilo on AI-põhine aktsiaturu töölaud jaeinvestoritele: igapäevane turuülevaade, selgitatud uudised, tulemusteadaanded, USA Kongressi tehingud ja maailmasündmused ühes vaates."
TITLE_EN = "Stockpilo — Invest smarter. Know why before you buy."
TITLE_ET = "Stockpilo — Investeeri targemalt. Tea, miks, enne kui ostad."

R = [
  # ── <head> ──
  ('<html lang="en">', '<html lang="et">'),
  ("location.pathname === '/'", "location.pathname === '/et/'"),
  (TITLE_EN, TITLE_ET),
  ('"description": "' + DESC_EN, '"description": "' + DESC_ET),
  ('content="' + DESC_EN, 'content="' + DESC_ET),
  ('<link rel="canonical" href="https://stockpilo.com/">', '<link rel="canonical" href="https://stockpilo.com/et/">'),
  ('<meta property="og:url" content="https://stockpilo.com/">', '<meta property="og:url" content="https://stockpilo.com/et/">\n  <meta property="og:locale" content="et_EE">'),
  # relative asset paths → absolute (page lives in /et/)
  ('href="css/', 'href="/css/'),
  ('src="js/', 'src="/js/'),
  ('src="brand_assets/', 'src="/brand_assets/'),
  ('poster="brand_assets/', 'poster="/brand_assets/'),

  # ── Header ──
  ('<a href="/" style="display:flex;align-items:center;padding:6px;', '<a href="/et/" style="display:flex;align-items:center;padding:6px;'),
  ('<li><a href="#features">Features</a></li>', '<li><a href="#features">Funktsioonid</a></li>'),
  ('<li><a href="#pricing">Pricing</a></li>', '<li><a href="#pricing">Hinnad</a></li>'),
  ('<li><a href="#about">About</a></li>', '<li><a href="#about">Meist</a></li>'),
  ('<span class="lang-opt is-on" aria-current="true">EN</span><a class="lang-opt" href="/et/" hreflang="et" lang="et" aria-label="Eesti keeles">ET</a>',
   '<a class="lang-opt" href="/" hreflang="en" lang="en" aria-label="In English">EN</a><span class="lang-opt is-on" aria-current="true">ET</span>'),
  ('data-app-link>Log in</a>', 'data-app-link>Logi sisse</a>'),
  ('data-app-link style="width:100%;justify-content:center;">Log in</a>', 'data-app-link style="width:100%;justify-content:center;">Logi sisse</a>'),
  ('<span class="btn-label">Get Started</span>', '<span class="btn-label">Alusta</span>'),
  ('aria-label="Toggle menu"', 'aria-label="Ava või sulge menüü"'),
  ('class="mobile-nav-link">Features</a>', 'class="mobile-nav-link">Funktsioonid</a>'),
  ('class="mobile-nav-link">Pricing</a>', 'class="mobile-nav-link">Hinnad</a>'),
  ('class="mobile-nav-link">About</a>', 'class="mobile-nav-link">Meist</a>'),
  ('class="mobile-nav-link">FAQs</a>', 'class="mobile-nav-link">KKK</a>'),
  ('<li><a href="/blog.html">Blog</a></li>', '<li><a href="/blog.html">Blogi</a></li>'),
  ('class="mobile-nav-link">Blog</a>', 'class="mobile-nav-link">Blogi</a>'),
  ('class="footer-link" data-magnetic>Blog</a>', 'class="footer-link" data-magnetic>Blogi</a>'),
  ('<a href="/et/" class="mobile-nav-link" hreflang="et" lang="et">Eesti keeles</a>',
   '<a href="/" class="mobile-nav-link" hreflang="en" lang="en">In English</a>'),

  # ── Hero ──
  ('aria-label="Invest smarter. Know why before you buy."', 'aria-label="Investeeri targemalt. Tea, miks, enne kui ostad."'),
  ('Invest <span class="hero-word" aria-live="polite">smarter</span>.<br>\n        Know <span style="color:#2d6be4;">why</span> before you buy.',
   'Investeeri <span class="hero-word" aria-live="polite">targemalt</span>.<br>\n        Tea, <span style="color:#2d6be4;">miks</span>, enne kui ostad.'),
  ("Investing is complex enough. Your tools shouldn't be. Track every stock you follow from one clean dashboard — powerful insights, zero noise.",
   "Investeerimine on niigi keeruline. Sinu tööriistad ei pea olema. Jälgi kõiki oma aktsiaid ühest selgest töölauast — sisukas analüüs, null müra."),
  ('id="hero-cta">7-Day Free Trial</a>', 'id="hero-cta">7 päeva tasuta</a>'),
  ('alt="Stockpilo stock detail view for AAPL with intraday chart, key stats and news"',
   'alt="Stockpilo aktsia detailvaade: AAPL päevasisese graafiku, põhinäitajate ja uudistega"'),

  # ── Features (text column; the app mock itself stays in English like the real app) ──
  ('opacity:.8;">Features</div>', 'opacity:.8;">Funktsioonid</div>'),
  ('<span class="shiny-text">See Stockpilo in action</span>', '<span class="shiny-text">Vaata Stockpilot töös</span>'),
  ('Your stocks, the market and the news, all in one place. This short video shows how it works.',
   'Sinu aktsiad, turg ja uudised, kõik ühes kohas. See lühike video näitab, kuidas see käib.'),

  # ── About ──
  ('text-transform:uppercase;">We are</span>', 'text-transform:uppercase;">Me oleme</span>'),
  ('text-transform:uppercase;">We will</span>', 'text-transform:uppercase;">Meie eesmärk</span>'),

  # ── Why Stockpilo ──
  ('<span class="why-eyebrow-sq"></span>Why Stockpilo</div>', '<span class="why-eyebrow-sq"></span>Miks Stockpilo</div>'),
  ("Your portfolio is complex. Your dashboard shouldn't be.", "Sinu portfell on keeruline. Sinu töölaud ei pea olema."),
  ('<span class="why-rail-label">Daily Brief</span>', '<span class="why-rail-label">Päeva ülevaade</span>'),
  ('<span class="why-rail-label">AI News</span>', '<span class="why-rail-label">AI uudised</span>'),
  ('<span class="why-rail-label">Congress Trades</span>', '<span class="why-rail-label">Kongressi tehingud</span>'),
  ('<span class="why-rail-label">Geopolitics</span>', '<span class="why-rail-label">Geopoliitika</span>'),
  ('<span class="why-rail-label">Earnings</span>', '<span class="why-rail-label">Tulemused</span>'),
  ('<span class="why-rail-label">Market Snapshot</span>', '<span class="why-rail-label">Turu ülevaade</span>'),

  ("Yesterday's market, in two minutes", "Eilne turg kahe minutiga"),
  ("Every morning, a plain-English recap of the last trading day: what the market did, what drove it, and how your stocks moved.",
   "Igal hommikul lihtne kokkuvõte eelmisest kauplemispäevast: mida turg tegi, mis seda liigutas ja kuidas sinu aktsiad liikusid."),
  ("The S&amp;P 500's day, and how it compares to a typical one", "S&amp;P 500 päev ja kuidas see tavalise päevaga võrreldes paistab"),
  ("The story behind the move, linked to the news", "Liikumise taust koos lingiga uudistele"),
  ("Which sectors led, which lagged, and your stocks that stood out", "Millised sektorid vedasid, millised jäid maha ja millised sinu aktsiad silma paistsid"),
  ('alt="Pilo Daily Recap: your watchlist and the S&amp;P 500 last session, sector moves and the story behind the day"',
   'alt="Pilo päeva kokkuvõte: sinu jälgimisnimekiri ja S&amp;P 500 eelmisel kauplemispäeval, sektorite liikumised ja päeva taust"'),

  ("News for your stocks, summarised", "Sinu aktsiate uudised kokkuvõtlikult"),
  ("Stories for your watchlist, sectors and top gainers. Hover over any article for an instant Stockpilo AI summary.",
   "Uudised sinu jälgimisnimekirja, sektorite ja suurimate tõusjate kohta. Vii kursor artikli kohale ja Stockpilo AI teeb kohe kokkuvõtte."),
  ("Tagged with the tickers each story mentions", "Iga uudis on märgitud seal mainitud tickeritega"),
  ("Estimated impact on every headline", "Iga pealkirja juures hinnanguline mõju"),
  ('aria-label="News feed with a top story and watchlist headlines tagged by ticker and estimated impact"',
   'aria-label="Uudistevoog peauudise ja jälgimisnimekirja pealkirjadega, märgitud tickeri ja hinnangulise mõjuga"'),

  ("See what Congress is trading", "Vaata, millega USA Kongress kaupleb"),
  ("The latest stock disclosures from Senate and House members, with a link to every filing.",
   "Senati ja Esindajatekoja liikmete viimased aktsiatehingute avalikustamised koos lingiga igale dokumendile."),
  ("Filter by chamber, purchases or sales", "Filtreeri koja, ostude või müükide järgi"),
  ("Traded → disclosed dates and amount ranges", "Tehingu → avalikustamise kuupäevad ja summavahemikud"),
  ("Filings in stocks on your watchlist", "Tehingud sinu jälgimisnimekirja aktsiatega"),
  ('aria-label="Latest Congress disclosures with member, asset, type, amount range and filing dates"',
   'aria-label="Kongressi viimased avalikustamised: liige, vara, tehingu tüüp, summavahemik ja kuupäevad"'),

  ("World events on a live globe", "Maailmasündmused reaalajas gloobusel"),
  ("Market-relevant world events pinned to a 3D globe, with the top three ranked by impact.",
   "Turgu mõjutavad maailmasündmused 3D-gloobusel, kolm olulisemat mõju järgi järjestatud."),
  ("<li>Impact level, time and source for every event</li>", "<li>Iga sündmuse juures mõju tase, aeg ja allikas</li>"),
  ('<li>"Also notable" for everything else</li>', '<li>„Veel tähelepanuväärset“ kõige muu jaoks</li>'),
  ('aria-label="Geopolitical Events globe with the top three high-impact events listed"',
   'aria-label="Geopoliitiliste sündmuste gloobus kolme suurima mõjuga sündmusega"'),

  ("One calendar for everything that moves the market", "Üks kalender kõige jaoks, mis turgu liigutab"),
  ("Earnings from the 20 largest US companies and your watchlist, plus key economic reports from the US, euro area, UK, Japan and China.",
   "20 suurima USA ettevõtte ja sinu jälgimisnimekirja tulemused ning olulisemad majandusraportid USA-st, euroalalt, Suurbritanniast, Jaapanist ja Hiinast."),
  ("Themes: Space, Energy, Military, Technology, Semiconductors, Health care", "Teemad: kosmos, energia, kaitsetööstus, tehnoloogia, pooljuhid, tervishoid"),
  ("EPS estimate and last quarter's result", "EPS-i prognoos ja eelmise kvartali tulemus"),
  ('aria-label="Earnings calendar with company earnings and economic reports such as CPI, PMI and the jobs report"',
   'aria-label="Tulemuste kalender ettevõtete tulemuste ja majandusraportitega, nagu CPI, PMI ja tööturu raport"'),

  ("Risks, scored and charted", "Riskid hinnatud ja graafikul"),
  ("Geopolitical, macro and rotation risks with a level and probability, next to the charts behind them.",
   "Geopoliitilised, makro- ja rotatsiooniriskid koos taseme ja tõenäosusega ning nende taga olevate graafikutega."),
  ("VIX over 90 days with calm and fear thresholds", "VIX 90 päeva lõikes koos rahu- ja hirmulävedega"),
  ("CPI vs. Core vs. Breakeven inflation, from FRED", "CPI vs. baasinflatsioon vs. tasakaaluinflatsioon (FRED)"),
  ('aria-label="What Could Move Markets: risk cards for geopolitical and macro events, above inflation charts"',
   'aria-label="Mis võib turge liigutada: geopoliitiliste ja makrosündmuste riskikaardid inflatsioonigraafikute kohal"'),

  ("The whole market at a glance", "Kogu turg ühe pilguga"),
  ("Indices, volatility, gold, oil and Treasuries side by side, each with its recent history, so you can see where the market stands in seconds.",
   "Indeksid, volatiilsus, kuld, nafta ja USA riigivõlakirjad kõrvuti koos hiljutise ajalooga, nii et näed sekunditega, kus turg seisab."),
  ("Today's change and change over 30 days", "Tänane muutus ja muutus 30 päeva jooksul"),
  ("Search — SPX, gold, Treasury…", "Otsing — SPX, kuld, võlakirjad…"),
  ('aria-label="Market Snapshot: biggest move this week, index and rates tiles with three-month history"',
   'aria-label="Turu ülevaade: nädala suurim liikumine, indeksite ja intresside kaardid kolme kuu ajalooga"'),

  # ── Testimonials / bento ──
  ("Why investors are switching", "Miks investorid Stockpilole üle tulevad"),
  ("Everything you check every morning, in one place. No noise — just clarity.", "Kõik, mida igal hommikul vaatad, ühes kohas. Ilma mürata — lihtsalt selgus."),
  ('<span class="sb-pill">One dashboard</span>', '<span class="sb-pill">Üks töölaud</span>'),
  ('<p class="sb-big-sub">tools in one place</p>', '<p class="sb-big-sub">tööriista ühes kohas</p>'),
  ("Daily Brief, news, earnings, Congress trades, geopolitical events, Risk Lab and your portfolio — one clean view instead of ten tabs.",
   "Päeva ülevaade, uudised, tulemused, Kongressi tehingud, geopoliitilised sündmused, Risk Lab ja sinu portfell — üks selge vaade kümne vahelehe asemel."),
  ('<span class="why-eyebrow-sq"></span>Why switch</div>', '<span class="why-eyebrow-sq"></span>Miks üle tulla</div>'),
  ('aria-label="Included tools"', 'aria-label="Sisalduvad tööriistad"'),
  ('<li><span>☀</span>Daily Brief</li>', '<li><span>☀</span>Päeva ülevaade</li>'),
  ('<li><span>◧</span>News</li>', '<li><span>◧</span>Uudised</li>'),
  ('<li><span>▤</span>Earnings</li>', '<li><span>▤</span>Tulemused</li>'),
  ('<li><span>⚖</span>Congress</li>', '<li><span>⚖</span>Kongress</li>'),
  ('<li><span>◍</span>Globe</li>', '<li><span>◍</span>Gloobus</li>'),
  ('<li><span>◔</span>Portfolio</li>', '<li><span>◔</span>Portfell</li>'),
  ('<li class="sb-tool-more">+ more</li>', '<li class="sb-tool-more">+ veel</li>'),
  ('<p class="sb-mid">Why, not just what</p>', '<p class="sb-mid">Miks, mitte ainult mis</p>'),
  ("Every big move on your list, explained with the news behind it.", "Iga suur liikumine sinu nimekirjas, selgitatud selle taga olevate uudistega."),
  ('<span class="sb-ai-chg">+6.2%</span>', '<span class="sb-ai-chg">+6,2%</span>'),
  ('<p>Beat earnings estimates and raised guidance. <em>3 sources</em></p>', '<p>Tulemus ületas ootusi ja ettevõte tõstis prognoosi. <em>3 allikat</em></p>'),
  ('<small>days free</small>', '<small>päeva tasuta</small>'),
  ('<li>No credit card</li>', '<li>Krediitkaarti pole vaja</li>'),
  ('<li>Cancel any time</li>', '<li>Loobu igal ajal</li>'),
  ('class="sb-cta">Start free <svg', 'class="sb-cta">Alusta tasuta <svg'),

  # ── Pricing ──
  ('white-space:nowrap;">Pricing</h2>', 'white-space:nowrap;">Hinnad</h2>'),
  ('data-period="monthly">Monthly</button>', 'data-period="monthly">Kuupõhine</button>'),
  ('        Yearly <span class="plan-toggle-badge">', '        Aastapõhine <span class="plan-toggle-badge">'),
  ('<div class="plan-desc">Free for 7 days — no credit card needed. Try everything before you decide.</div>',
   '<div class="plan-desc">7 päeva tasuta — krediitkaarti pole vaja. Proovi kõike enne, kui otsustad.</div>'),
  ('<div class="plan-price">Free</div>', '<div class="plan-price">Tasuta</div>'),
  ("What's included:", "Sisaldab:"),
  ('</svg>Market Snapshot</div>', '</svg>Turu ülevaade</div>'),
  ('</svg>Top Gainers &amp; Losers</div>', '</svg>Suurimad tõusjad ja langejad</div>'),
  ('</svg>5 AI queries per day</div>', '</svg>5 AI päringut päevas</div>'),
  ('</svg>7-day full access trial</div>', '</svg>7-päevane täisligipääsuga prooviperiood</div>'),
  ('data-magnetic>Start free trial <svg', 'data-magnetic>Alusta tasuta prooviperioodi <svg'),
  ('<span class="plan-popular">POPULAR</span>', '<span class="plan-popular">POPULAARNE</span>'),
  ('Everything you need to invest smarter — no limits, no noise.', 'Kõik, mida vajad targemaks investeerimiseks — ilma piirangute ja mürata.'),
  ('id="plan-price-period">/mo</span>', 'id="plan-price-period">/kuu</span>'),
  ('</svg>Full market suite unlocked</div>', '</svg>Kõik turutööriistad avatud</div>'),
  ('</svg>Portfolio Tracker</div>', '</svg>Portfelli jälgija</div>'),
  ('</svg>Unlimited AI queries</div>', '</svg>Piiramatult AI päringuid</div>'),
  ('</svg>Smart Alerts</div>', '</svg>Nutikad hoiatused</div>'),
  ('</svg>Priority support &amp; updates</div>', '</svg>Eelisjärjekorras tugi ja uuendused</div>'),
  ('class="plan-cta-featured" data-magnetic>Get Started <svg', 'class="plan-cta-featured" data-magnetic>Alusta <svg'),
  ('      Cancel any time · No credit card required\n', '      Loobu igal ajal · Krediitkaarti pole vaja\n'),

  # ── Floating icons CTA ──
  ('<span class="shiny-text-fi">No need to jump<br>between sites.</span>', '<span class="shiny-text-fi">Pole vaja hüpata<br>lehtede vahel.</span>'),
  ("Stockpilo brings it all together — real-time market data, AI-powered insights, and portfolio tracking in one place.",
   "Stockpilo toob kõik kokku — reaalajas turuandmed, AI-põhine analüüs ja portfelli jälgimine ühes kohas."),
  ('data-magnetic>7-Day Free Trial</a>', 'data-magnetic>7 päeva tasuta</a>'),

  # ── Footer ──
  ('<a href="/" class="logo-wordmark" id="footer-logo"', '<a href="/et/" class="logo-wordmark" id="footer-logo"'),
  ('© 2026 Stockpilo. All rights reserved.', '© 2026 Stockpilo. Kõik õigused kaitstud.'),
  ('Market data for information only. Not investment advice.', 'Turuandmed on ainult informatiivsed. Ei ole investeerimisnõustamine.'),
  ('<h3 class="footer-section-label">Product</h3>', '<h3 class="footer-section-label">Toode</h3>'),
  ('class="footer-link" data-magnetic>Features</a>', 'class="footer-link" data-magnetic>Funktsioonid</a>'),
  ('class="footer-link" data-magnetic>Pricing</a>', 'class="footer-link" data-magnetic>Hinnad</a>'),
  ('class="footer-link" data-magnetic>Why Stockpilo</a>', 'class="footer-link" data-magnetic>Miks Stockpilo</a>'),
  ('<a href="/" class="footer-link" data-magnetic>Integration</a>', '<a href="/et/" class="footer-link" data-magnetic>Integratsioonid</a>'),
  ('<h3 class="footer-section-label">Company</h3>', '<h3 class="footer-section-label">Ettevõte</h3>'),
  ('class="footer-link" data-magnetic>FAQs</a>', 'class="footer-link" data-magnetic>KKK</a>'),
  ('class="footer-link" data-magnetic>About Us</a>', 'class="footer-link" data-magnetic>Meist</a>'),
  ('class="footer-link" data-magnetic>Privacy Policy</a>', 'class="footer-link" data-magnetic>Privaatsuspoliitika</a>'),
  ('class="footer-link" data-magnetic>Terms of Services</a>', 'class="footer-link" data-magnetic>Kasutustingimused</a>'),
  ('<h3 class="footer-section-label">Resources</h3>', '<h3 class="footer-section-label">Ressursid</h3>'),
  ('class="footer-link" data-magnetic>Changelog</a>', 'class="footer-link" data-magnetic>Muudatuste logi</a>'),
  ('class="footer-link" data-magnetic>Help</a>', 'class="footer-link" data-magnetic>Abi</a>'),
  ('<h3 class="footer-section-label">Social Links</h3>', '<h3 class="footer-section-label">Sotsiaalmeedia</h3>'),

  # ── Cookie banner ──
  ('letter-spacing:-.01em;">Cookie Notice</span>', 'letter-spacing:-.01em;">Küpsiste teade</span>'),
  ('    We use Google reCAPTCHA to protect against bots. This loads a third-party script that may set cookies (',
   '    Kasutame robotite vastu kaitseks Google reCAPTCHA-t. See laadib kolmanda osapoole skripti, mis võib seada küpsiseid ('),
  ('). We have no analytics or tracking pixels. <a href="/privacy.html" style="color:#2d6be4;text-decoration:none;">Privacy Policy</a>.',
   '). Me ei kasuta analüütikat ega jälgimispiksleid. <a href="/privacy.html" style="color:#2d6be4;text-decoration:none;">Privaatsuspoliitika</a>.'),
  ('">Decline</button>', '">Keeldu</button>'),
  ('">Accept</button>', '">Nõustu</button>'),
]

missing = []
for a, b in R:
    if a not in s:
        missing.append(a)
    s = s.replace(a, b)
if missing:
    print('NOT FOUND:'); [print('  ', m[:100]) for m in missing]; sys.exit(1)

os.makedirs(os.path.join(root, 'et'), exist_ok=True)
open(os.path.join(root, 'et', 'index.html'), 'w', encoding='utf-8').write(s)
print('ok', len(R), 'replacements')
