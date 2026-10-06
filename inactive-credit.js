/* Assigned four-week offer only. This describes the weekly credit contract;
   customer eligibility, claims and credit balances remain owned by HQ. */
(function (root) {
  'use strict';
  var offer = root.HAVN_FOUR_WEEK;
  if (!offer || root.HAVN_MENU_MODE !== 'in') return;
  var week = offer.week;
  var first = week === 1;
  document.body.classList.add('four-week-menu');
  document.title = first ? 'Your $100 in weekly credits — Havn Club' : 'Week ' + week + ' of your Havn credits';
  var title = document.getElementById('m-head-title');
  title.innerHTML = first ? 'Your $100.<br><em>Four weeks of Havn.</em>' : 'Week ' + week + ' of four.<br><em>$25 this week.</em>';
  title.insertAdjacentHTML('beforebegin', '<p class="credit-eyebrow">A welcome back from Chef J</p>');
  title.insertAdjacentHTML('afterend', '<p class="credit-promise">' + (first
    ? 'Four $25 credits. <strong>Place an order this week to claim them all.</strong>'
    : 'Your four-week offer continues. <strong>This week’s $25 credit applies automatically to your order.</strong>') + '</p>');
  var ribbon = document.querySelector('.m-ribbon');
  ribbon.setAttribute('aria-label', 'Week ' + week + ' of four: 25 dollars credit this week on orders of five or more meals');
  ribbon.innerHTML = '<p class="credit-current-label">This week · Credit ' + week + ' of 4</p>' +
    '<p class="credit-current-amount">$25 <span>toward this order</span></p>' +
    '<p class="credit-current-terms">Applied automatically on orders of 5+ meals</p>';
  var plan = document.createElement('div');
  plan.className = 'credit-plan';
  plan.innerHTML = '<h2 class="credit-plan-heading">Your four weekly credits</h2>';
  var list = document.createElement('ol');
  list.className = 'credit-weeks';
  for (var n = 1; n <= 4; n++) {
    var date = new Date(offer.start + 'T12:00:00Z');
    date.setUTCDate(date.getUTCDate() + (n - 1) * 7);
    var li = document.createElement('li');
    li.className = n === week ? 'credit-week current' : n < week ? 'credit-week past' : 'credit-week';
    if (n === week) li.setAttribute('aria-current', 'step');
    li.innerHTML = '<span class="credit-week-label">Week ' + n + '</span><strong>$25</strong>' +
      '<time datetime="' + date.toISOString().slice(0, 10) + '">' + date.toLocaleDateString('en-US', {month:'short',day:'numeric',timeZone:'UTC'}) + '</time>' +
      '<span class="credit-week-status">' + (n === week ? 'This week' : n < week ? 'Week ended' : 'Next weeks') + '</span>';
    list.appendChild(li);
  }
  plan.appendChild(list);
  var remaining = (4 - week) * 25;
  plan.insertAdjacentHTML('beforeend', '<ul class="credit-terms"><li>' + (first
    ? 'Order this week and the other three $25 credits will be added automatically, one each week.'
    : remaining ? '$' + remaining + ' in credits follows over the next ' + (4 - week) + ' ' + (week === 3 ? 'week' : 'weeks') + ', $25 at a time.'
    : 'This is the last week of your four-week offer.') + '</li>' +
    '<li><strong>One credit expires each week, whether you use it or not.</strong></li>' +
    '<li>Unused credits don’t roll over.</li>' +
    '<li>The $100 is spread across four weeks, not taken off one order.</li></ul>' +
    '<a class="credit-choose" href="#m-menu">' + (first ? 'Choose my meals & claim my credits' : 'Choose my meals for this week') + '<span aria-hidden="true">↓</span></a>');
  ribbon.insertAdjacentElement('afterend', plan);
  var receipt = document.querySelector('#m-sheet .m-receipt');
  var sheet = document.getElementById('m-sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('tabindex', '-1');
  receipt.insertAdjacentHTML('afterend', '<p class="credit-receipt-note">' + (first
    ? 'This order claims all four weekly credits. Only this week’s $25 credit is deducted here, on orders of 5+ meals. The next three are added weekly.'
    : 'Only week ' + week + '’s $25 credit is deducted here, on orders of 5+ meals. Unused weekly credits don’t roll over.') + '</p>');
})(window);
