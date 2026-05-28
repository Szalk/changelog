/* ── changelog-checker.js ─────────────────────────────────────
   Használat (a combined.changelog.js UTÁN illeszd be):
     <script src="combined.changelog.js?app=SLUG&v=VERSION"></script>
     <script src="changelog-checker.js"></script>

   Paraméterek a combined.changelog.js src URL-jéből olvasódnak:
     ?app=  — alkalmazás slug
     ?v=    — az alkalmazás jelenlegi verziója (YYMMDD)
───────────────────────────────────────────────────────────── */
(function () {
  // A combined.changelog.js script tag megkeresése a src alapján
  const clScript = Array.from(document.querySelectorAll('script[src]'))
    .find(s => s.src.includes('.changelog.js'));

  if (!clScript) return;

  const params  = new URLSearchParams(clScript.src.split('?')[1] || '');
  const slug    = params.get('app');
  const current = params.get('v');

  if (!slug || !current) return;

  // CHANGELOG_COMBINED vagy egyedi CHANGELOG_<SLUG> objektum keresése
  const src = (typeof CHANGELOG_COMBINED !== 'undefined')
    ? CHANGELOG_COMBINED
    : window['CHANGELOG_' + slug.toUpperCase().replace(/-/g, '_')];

  if (!src) return;

  const appData = src.apps ? src.apps[slug] : src;
  if (!appData) return;

  const latest = appData.meta && appData.meta.latestVersion;
  if (!latest || latest <= current) return;

  const seenKey = 'cl_seen_' + slug;
  if (localStorage.getItem(seenKey) === latest) return;

  // Értesítés megjelenítése
  const banner = document.createElement('div');
  banner.id = 'cl-update-banner';
  banner.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9999',
    'background:#dc3545', 'color:#fff', 'padding:10px 20px',
    'display:flex', 'align-items:center', 'justify-content:center', 'gap:12px',
    'font-size:14px', 'font-weight:600', 'font-family:sans-serif',
    'box-shadow:0 -2px 12px rgba(0,0,0,.4)'
  ].join(';');

  banner.innerHTML = `
    <span>⚠ Frissítés elérhető: <strong>${latest}</strong> verzió (jelenlegi: ${current})</span>
    <button onclick="localStorage.setItem('${seenKey}','${latest}');this.closest('#cl-update-banner').remove();"
      style="background:#fff;color:#dc3545;border:none;border-radius:4px;padding:4px 12px;font-weight:700;cursor:pointer;">
      Bezárás
    </button>`;

  document.body.appendChild(banner);
})();
