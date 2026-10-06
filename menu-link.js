/* HQ's compact four-week SMS link. Public campaign context only: decoding
   does not establish customer eligibility or grant any credit. Keep the
   byte format aligned with intake/return_links.py in HavnClub-HQ. */
(function (root) {
  'use strict';
  var match = (root.location.pathname || '').match(/^\/(?:sd\/)?c\/([A-Za-z0-9_-]{14})\/?$/);
  if (!match) return;
  try {
    var raw = root.atob(match[1].replace(/-/g,'+').replace(/_/g,'/') + '==');
    if (raw.length !== 10 || root.btoa(raw).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'') !== match[1]) return;
    var flags = raw.charCodeAt(0);
    var kinds = ['menu_blast','reminder_1','reminder_2'];
    var kind = (flags >> 3) & 3;
    if ((flags & 0xe0) !== 0x80 || kind >= kinds.length || raw.charCodeAt(3) > 15) return;
    var days = (raw.charCodeAt(1) << 8) | raw.charCodeAt(2);
    var start = new Date(Date.UTC(2000,0,1) + days * 86400000);
    if (start.getUTCDay() !== 0) return;
    var campaign = '';
    for (var n=3; n<10; n++) campaign += raw.charCodeAt(n).toString(16).padStart(2,'0');
    root.HAVN_SHORT_MENU = {
      campaign: campaign.slice(1), kind: kinds[kind], city: flags & 4 ? 'sd' : 'dc',
      offer: {start:start.toISOString().slice(0,10),week:(flags & 3)+1}
    };
  } catch (e) { /* Malformed compact paths never enable an offer. */ }
})(window);
