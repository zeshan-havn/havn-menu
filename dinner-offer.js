/* Older non-ordering leads only. This browser describes a promotion; it never
   grants credit or establishes customer eligibility. HQ must verify those facts
   before accepting the order. See the separate comms implementation handoff. */
(function (root) {
  'use strict';
  if (root.HAVN_MENU_VARIANT !== 'dinner') return;
  var body = document.body;
  body.classList.add('dinner-welcome');
  document.title = 'A dinner from Chef J — Havn Club';
  var title = document.getElementById('m-head-title');
  title.innerHTML = 'One dinner now.<br><em>Your next one on me.</em>';
  var intro = document.createElement('div');
  intro.className = 'dinner-intro';
  intro.innerHTML = '<p class="dinner-note">A personal invitation from Chef J</p>' +
    '<p class="dinner-promise">Choose any meal for <strong>$25</strong>. Earn <strong>$25 credit on your next order</strong> for a free meal.</p>' +
    '<p class="dinner-terms">Start with one meal. No order minimum. If you don\'t like, keep the glass as a gift.</p>' +
    '<a class="dinner-choose" href="#m-menu">Choose my dinner <span aria-hidden="true">&darr;</span></a>';
  title.insertAdjacentElement('afterend', intro);
  var ribbon = document.querySelector('.m-ribbon');
  ribbon.insertAdjacentHTML('beforebegin', '<p class="dinner-alternative">Make it a full week?</p>');
  ribbon.querySelector('.m-ribbon-note').textContent = 'Get the welcome offer this week, plus $25 credit for your next order.';
  var howto = document.getElementById('m-howto');
  howto.hidden = false;
  howto.querySelector('.m-howto-steps li span').textContent = 'Choose any meal. One is enough to get started.';
  var cutoff = document.getElementById('m-howto-cutoff');
  cutoff.textContent = 'Order by Friday at 8pm ' + (root.HAVN_MENU_CITY === 'SD' ? 'Pacific' : 'Eastern') + ' for delivery Sunday or Monday.';
  document.querySelector('.m-bar-build-title').textContent = 'Choose your dinner';
  var progress = document.createElement('div');
  progress.className = 'dinner-progress';
  progress.id = 'dinner-progress';
  progress.hidden = true;
  progress.setAttribute('role', 'status');
  progress.setAttribute('aria-live', 'polite');
  document.getElementById('m-bar').insertAdjacentElement('afterbegin', progress);
  var sheet = document.getElementById('m-sheet');
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('tabindex', '-1');

  function eligible(cart) { return cart.meals >= 1; }
  function message(cart) {
    if (!cart.meals) return 'Choose at least one meal. Breakfast and extras can be added to your dinner.';
    if (cart.meals === 1) return 'Your dinner is ready. Or add 4 more meals for $20 off this order.';
    if (cart.meals < 5) return 'Your order is ready. Add ' + (5 - cart.meals) + ' more ' + (cart.meals === 4 ? 'meal' : 'meals') + ' for $20 off this order.';
    if (cart.meals < 7) return '$20 off this order, plus $25 credit next time. Add ' + (7 - cart.meals) + ' more ' + (cart.meals === 6 ? 'meal' : 'meals') + ' for $40 off.';
    return '$40 welcome discount applied to this order, plus $25 credit next time.';
  }
  root.HAVN_DINNER = {
    eligible: eligible,
    ready: function (cart) { return cart.meals >= 1; },
    message: message,
    orderLabel: function (cart) { return cart.meals === 1 ? 'Chef J dinner offer: one meal' : 'Chef J dinner offer: regular welcome'; },
    render: function (cart) {
      progress.hidden = !cart.meals && !cart.sides && !cart.addons;
      progress.textContent = message(cart);
    }
  };
})(window);
