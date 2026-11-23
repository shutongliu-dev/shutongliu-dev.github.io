(function () {
  function legacyCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.top = '-1000px';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(field);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        if (!legacyCopy(text)) throw new Error('copy failed');
      });
    }
    return legacyCopy(text) ? Promise.resolve() : Promise.reject(new Error('copy failed'));
  }

  document.querySelectorAll('[data-vm-copy]').forEach(function (button) {
    var card = button.closest('.vm-cite');
    var code = card && card.querySelector('pre');
    if (!code) return;

    var label = button.textContent;
    var reset = null;

    button.addEventListener('click', function () {
      var text = code.textContent.replace(/\s+$/, '') + '\n';

      function flash(message, state) {
        button.textContent = message;
        button.dataset.state = state;
        window.clearTimeout(reset);
        reset = window.setTimeout(function () {
          button.textContent = label;
          delete button.dataset.state;
        }, 1800);
      }

      copyText(text).then(function () {
        flash('Copied', 'copied');
      }, function () {
        flash('Copy failed', 'error');
      });
    });
  });
})();
