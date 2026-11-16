// The hero fan behaves like a flywheel: it idles slowly, scrolling "pedals" it, then it coasts back down.
(function () {
  var blades = document.getElementById('blades');
  if (!blades) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var IDLE = 14;      // degrees per second
  var MAX = 900;
  var angle = 0, vel = IDLE, last = performance.now(), lastY = window.scrollY;

  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    vel = Math.min(MAX, vel + Math.abs(y - lastY) * 1.4);
    lastY = y;
  }, { passive: true });

  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    vel = IDLE + (vel - IDLE) * Math.exp(-dt / 1.5);
    angle = (angle + vel * dt) % 360;
    blades.setAttribute('transform', 'rotate(' + angle.toFixed(2) + ')');
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// "Request this" on a service row ticks the matching equipment in the form.
(function () {
  var form = document.getElementById('request-form');
  if (!form) return;

  document.querySelectorAll('[data-pick]').forEach(function (link) {
    link.addEventListener('click', function () {
      var box = form.querySelector('input[name="equipment"][value="' + link.dataset.pick + '"]');
      if (box) box.checked = true;
      if (link.dataset.paint) form.querySelector('#f-paint').checked = true;
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var error = document.getElementById('form-error');
    var name = form.elements.name.value.trim();
    var picked = Array.prototype.filter.call(form.querySelectorAll('input[name="equipment"]'), function (b) { return b.checked; })
      .map(function (b) { return b.value; });

    if (!name) { error.textContent = 'Add your name so Octavio knows who to reply to.'; form.elements.name.focus(); return; }
    if (!picked.length) { error.textContent = 'Pick at least one thing that needs work.'; return; }
    error.textContent = '';

    var lines = [
      'Name: ' + name,
      'Gym: ' + (form.elements.gym.value.trim() || 'Not given'),
      'Phone: ' + (form.elements.phone.value.trim() || 'Not given'),
      'Equipment: ' + picked.join(', '),
      'Painting: ' + (form.elements.paint.checked ? 'Yes' : 'No'),
      '',
      form.elements.notes.value.trim()
    ];
    window.location.href = 'mailto:octavio@fitmaintenancemiami.com'
      + '?subject=' + encodeURIComponent('Service request: ' + picked.join(', '))
      + '&body=' + encodeURIComponent(lines.join('\n'));
  });
})();

// Phone: show the call/request bar once the hero buttons scroll away, hide it while the form is on screen.
(function () {
  var bar = document.getElementById('quickbar');
  var hero = document.querySelector('.hero-actions');
  var form = document.getElementById('request-form');
  if (!bar || !hero || !form) return;
  function update() {
    var vh = window.innerHeight;
    var heroGone = hero.getBoundingClientRect().bottom < 0;
    var f = form.getBoundingClientRect();
    var formSeen = f.top < vh - 80 && f.bottom > 0;
    bar.classList.toggle('is-on', heroGone && !formSeen);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
