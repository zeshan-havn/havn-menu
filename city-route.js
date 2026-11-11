/* Miami, Phoenix and Chicago customers who type or search menu.havnclub.com land
   on this DC/SoCal page and text their order to the DC/SD number (Nov 10 2026).
   On the bare root (/) or a bare week (/nov15) only, never on a DC/SD link with
   a city, offer or SMS segment:
   - a visitor whose last menu was a Havn OS city page (cities.js sets the
     havn_os_city cookie on Domain=havnclub.com) goes straight to that city page;
   - on the root, everyone else sees a one-line picker for those three cities.
   ?city=dcsd skips the redirect. */
(function (root) {
  'use strict';
  var CITIES = { miami: 'Miami', phoenix: 'Phoenix', chicago: 'Chicago' };
  var path = (root.location.pathname || '/').replace(/\/+$/, '');
  var bareRoot = path === '' || path === '/index.html';
  var bareWeek = /^\/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\d{1,2}$/i.test(path);
  if (!bareRoot && !bareWeek) return;
  var search = root.location.search || '';
  if (/[?&]city=dcsd\b/i.test(search)) return;
  var saved = '';
  try {
    var m = document.cookie.match(/(?:^|;)\s*havn_os_city\s*=\s*([^;]+)/);
    saved = m ? decodeURIComponent(m[1]).toLowerCase() : '';
  } catch (e) { /* ignore */ }
  if (Object.prototype.hasOwnProperty.call(CITIES, saved)) {
    root.location.replace((bareWeek ? path : '') + '/' + saved + search);
    return;
  }
  if (!bareRoot) return;
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
