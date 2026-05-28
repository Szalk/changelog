/* ── changelog-checker.js ─────────────────────────────────────
   Integrálás — csak ezt a 2 sort kell beilleszteni:

   <script src="combined.changelog.js?app=SLUG&v=VERSION"></script>
   <script src="changelog-checker.js?pass=PASSWORD&salt=SALT"></script>

   A combined.changelog.js-ből olvassa: ?app= és ?v=
   A saját src URL-jéből olvassa:        ?pass= és ?salt=

   Megjegyzés: ha a salt base64 értéke + jelet tartalmaz,
   azt %2B-ként kell URL-kódolni a script src-ben.
───────────────────────────────────────────────────────────── */
(function () {
  // Base64 biztonságos query parser — + jelet NEM alakítja szóközzé
  function parseQuery(url) {
    const qs = url.split('?')[1] || '';
    const result = {};
    qs.split('&').forEach(pair => {
      const idx = pair.indexOf('=');
      if (idx < 0) return;
      const k = decodeURIComponent(pair.slice(0, idx));
      const v = decodeURIComponent(pair.slice(idx + 1));
      result[k] = v;
    });
    return result;
  }

  // Saját (checker) script paraméterek: pass, salt
  const selfParams = parseQuery(document.currentScript.src);
  const PASS = selfParams['pass'] || 'changelog_manager_auto_unlock_secret_2026';
  const SALT = selfParams['salt'] || 'Y2hhbmdlbG9nXzIwMjYhIQ==';

  // combined.changelog.js script tag megkeresése: app, v
  const clScript = Array.from(document.querySelectorAll('script[src]'))
    .find(s => s.src.includes('.changelog.js') && !s.src.includes('changelog-checker'));
  if (!clScript) return;

  const clParams = parseQuery(clScript.src);
  const slug     = clParams['app'];
  const current  = clParams['v'];
  if (!slug || !current) return;

  // Changelog objektum keresése
  const clObj = (typeof CHANGELOG_COMBINED !== 'undefined')
    ? CHANGELOG_COMBINED
    : window['CHANGELOG_' + slug.toUpperCase().replace(/-/g, '_')];
  if (!clObj) return;

  const appData = clObj.apps ? clObj.apps[slug] : clObj;
  if (!appData) return;

  // Verzió összehasonlítás — meta.latestVersion nem titkosított
  const latest = appData.meta && appData.meta.latestVersion;
  if (!latest || latest <= current) return;

  const seenKey = 'cl_seen_' + slug;
  if (localStorage.getItem(seenKey) === latest) return;

  // Frissítési banner megjelenítése
  const banner = document.createElement('div');
  banner.id = 'cl-update-banner';
  banner.style.cssText = [
    'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:9999',
    'background:#dc3545', 'color:#fff', 'padding:10px 20px',
    'display:flex', 'align-items:center', 'justify-content:center', 'gap:12px',
    'font-size:14px', 'font-weight:600', 'font-family:sans-serif',
    'box-shadow:0 -2px 12px rgba(0,0,0,.4)'
  ].join(';');
  banner.innerHTML =
    `<span>⚠ Frissítés elérhető: <strong>${latest}</strong> verzió (jelenlegi: ${current})</span>` +
    `<button style="background:#fff;color:#dc3545;border:none;border-radius:4px;` +
    `padding:4px 12px;font-weight:700;cursor:pointer;"` +
    ` onclick="localStorage.setItem('${seenKey}','${latest}');` +
    `document.getElementById('cl-update-banner').remove();">Bezárás</button>`;

  document.body.appendChild(banner);
})();
