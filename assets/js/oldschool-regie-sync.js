(function () {
  const params = new URLSearchParams(window.location.search);
  const enabledRaw = params.get('regie');
  if (enabledRaw === '0' || enabledRaw === 'false') return;

  const apiUrl = params.get('regieApi') || '/api/regie-control';
  const pollMs = Math.max(700, Number(params.get('regiePoll')) || 1500);
  const sceneName = params.get('regieScene') || 'oldschool-starting';

  let since = 0;
  let timer = null;
  let failures = 0;

  function emitStatus(status, extra) {
    document.dispatchEvent(new CustomEvent('oldschool-regie-status', {
      detail: Object.assign({ status: status, scene: sceneName }, extra || {})
    }));
  }

  function emitCommand(command) {
    if (!command || command.scene !== sceneName) return;
    document.dispatchEvent(new CustomEvent('oldschool-regie-command', { detail: command }));
  }

  async function poll() {
    try {
      const url = apiUrl + '?since=' + encodeURIComponent(String(since)) + '&_=' + Date.now();
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();

      if (!data || !data.success) {
        throw new Error((data && data.message) || 'Regie-API Fehler');
      }

      failures = 0;
      since = Number.isFinite(Number(data.revision)) ? Number(data.revision) : since;

      if (data.changed && data.command) {
        emitCommand(data.command);
      }

      emitStatus('connected', {
        revision: data.revision,
        secureMode: Boolean(data.secureMode)
      });
    } catch (err) {
      failures += 1;
      emitStatus('error', { message: err.message || String(err), failures: failures });
    } finally {
      const backoff = failures > 0 ? Math.min(6000, pollMs + failures * 500) : pollMs;
      timer = setTimeout(poll, backoff);
    }
  }

  emitStatus('connecting');
  poll();

  window.addEventListener('beforeunload', function () {
    if (timer) clearTimeout(timer);
  });
})();
