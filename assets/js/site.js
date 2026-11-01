/* miloszsobczak.pl — small, dependency-free enhancements.
   Everything here is progressive: the site reads fine without JS. */
(function () {
    'use strict';

    var root = document.documentElement;

    /* ---------- theme toggle (initial theme is set inline in <head>) ---------- */
    var toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        var current = function () {
            var set = root.getAttribute('data-theme');
            if (set) return set;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };
        var label = function () {
            toggle.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        };
        label();
        toggle.addEventListener('click', function () {
            var next = current() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
            label();
        });
    }

    /* ---------- local time in Wrocław (contact) ---------- */
    var clock = document.querySelector('[data-clock]');
    if (clock) {
        var out = clock.querySelector('time');
        var fmt = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Warsaw', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        });
        var tick = function () { out.textContent = fmt.format(new Date()); };
        tick();
        clock.hidden = false;
        setInterval(tick, 30000);
    }

    /* ---------- copy e-mail (button only exists for JS users) ---------- */
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        if (!navigator.clipboard) return;
        var original = btn.textContent;
        btn.hidden = false;
        btn.addEventListener('click', function () {
            navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
                btn.textContent = 'Copied';
                setTimeout(function () { btn.textContent = original; }, 1800);
            }, function () {});
        });
    });

    /* ---------- print resume (button only exists for JS users) ---------- */
    document.querySelectorAll('[data-print]').forEach(function (btn) {
        btn.hidden = false;
        btn.addEventListener('click', function () { window.print(); });
    });
})();
