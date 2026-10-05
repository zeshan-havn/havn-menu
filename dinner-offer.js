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
    '<p class="dinner-promise">Choose any meal for <strong>$25</strong>. Earn <strong>$25 credit on your next order</strong> after this dinner is paid.</p>' +
    '<p class="dinner-terms">Start with one meal. No order minimum. Your reusable glass container is yours to keep.</p>' +
    '<a class="dinner-choose" href="#m-menu">Choose my dinner <span aria-hidden="true">&darr;</span></a>';
  title.insertAdjacentElement('afterend', intro);
  var ribbon = document.querySelector('.m-ribbon');
  ribbon.insertAdjacentHTML('beforebegin', '<p class="dinner-alternative">Want a few dinners instead?</p>');
  ribbon.querySelector('.m-ribbon-note').textContent = 'Regular welcome discount on this order. Choose one offer.';
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
  var credit = document.createElement('p');
  credit.className = 'dinner-credit';
  credit.id = 'dinner-credit';
  credit.hidden = true;
  document.querySelector('#m-sheet .m-receipt').insertAdjacentElement('afterend', credit);

  function eligible(cart) { return cart.meals === 1 && !cart.discount; }
  function message(cart) {
    if (!cart.meals) return 'Choose at least one meal. Breakfast and extras can be added to your dinner.';
    if (eligible(cart)) return 'Your dinner is ready. Or add 4 more meals for $20 off this order.';
    if (cart.meals < 5) return 'Your order is ready. Add ' + (5 - cart.meals) + ' more meals for $20 off this order.';
    if (cart.meals < 7) return '$20 off this order. Add ' + (7 - cart.meals) + ' more ' + (cart.meals === 6 ? 'meal' : 'meals') + ' for $40 off.';
    return '$40 welcome discount applied to this order.';
  }
  root.HAVN_DINNER = {
    eligible: eligible,
    ready: function (cart) { return cart.meals >= 1; },
    message: message,
    orderLabel: function (cart) { return eligible(cart) ? 'Chef J dinner offer: one meal' : 'Chef J dinner offer: regular welcome'; },
    render: function (cart) {
      progress.hidden = !cart.meals && !cart.sides && !cart.addons;
      progress.textContent = message(cart);
      credit.hidden = !cart.meals;
      credit.textContent = eligible(cart)
        ? 'Next order: $25 credit activates after this dinner is paid. It applies to a later meal order, not today’s total.'
        : 'The one-meal next-order credit is a separate option. This cart uses the regular welcome offer at 5 or 7 meals.';
    }
  };
})(window);
