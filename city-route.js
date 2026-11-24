/* Cityless links use the DC menu. Offer the partner-city picker on the root. */
(function (root) {
  'use strict';
  var CITIES = { miami: 'Miami', phoenix: 'Phoenix', chicago: 'Chicago' };
  var path = (root.location.pathname || '/').replace(/\/+$/, '');
  var bareRoot = path === '' || path === '/index.html';
  if (!bareRoot || /[?&]city=dcsd\b/i.test(root.location.search || '')) return;
  function picker() {
    if (document.getElementById('havn-city-picker')) return;
    var bar = document.createElement('div');
    bar.id = 'havn-city-picker';
    bar.setAttribute('role', 'navigation');
    bar.setAttribute('aria-label', 'Choose your city');
    bar.style.cssText = 'margin:0 0 18px;padding:10px 14px;border:1px solid var(--hairline-light,#DCD5C9);border-radius:10px;' +
      'background:var(--paper,#FBF8F1);color:var(--charcoal,#1C1C1A);font:500 14px/1.45 var(--sans,system-ui,sans-serif)';
    var links = Object.keys(CITIES).map(function (slug) {
      return '<a href="/' + slug + '" style="color:var(--brass-ink,#7A6540);font-weight:700;text-decoration:underline;margin-left:8px">' + CITIES[slug] + '</a>';
    }).join('');
    bar.innerHTML = 'Ordering in Miami, Phoenix or Chicago? Your menu is here:' + links;
    var label = document.querySelector('.m-intro-label');
    if (label && label.parentNode) label.parentNode.insertBefore(bar, label);
    else document.body.insertBefore(bar, document.body.firstChild);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', picker);
  else picker();
})(window);
