(function () {
  const STORAGE_KEY = 'dangsxr_oldschool_music_v1';
  const params = new URLSearchParams(window.location.search);

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function stripExtension(name) {
    return String(name || '').replace(/\.[a-z0-9]{2,6}$/i, '').trim();
  }

  function inferTitleFromSource(source, sourceLabel) {
    const cleanLabel = stripExtension(sourceLabel);
    if (cleanLabel) return cleanLabel;

    if (!source) return 'Unbenannter Track';

    const sourceText = String(source);
    if (sourceText.startsWith('data:')) return 'Lokale Datei';
    if (sourceText.startsWith('blob:')) return 'Lokale Datei';

    try {
      const url = new URL(sourceText, window.location.href);
      const pathPart = url.pathname.split('/').filter(Boolean).pop() || '';
      const decoded = stripExtension(decodeURIComponent(pathPart));
      if (decoded) return decoded.replace(/[-_]+/g, ' ').trim() || 'Unbenannter Track';
      return url.hostname;
    } catch (err) {
      return 'Unbenannter Track';
    }
  }

  function parseBool(value, fallback) {
    if (value === null || value === undefined || value === '') return fallback;
    const normalized = String(value).toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
  }

  function readStoredConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return parsed;
    } catch (err) {
      return {};
    }
  }

  function saveConfig(config) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (err) {
      // ignore storage write errors
    }
  }

  if (parseBool(params.get('musicClear'), false)) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      // ignore storage clear errors
    }
  }

  const stored = readStoredConfig();

  const musicParam = params.get('music');
  const titleParam = params.get('musicTitle');
  const source = (musicParam && musicParam.trim()) || (stored.source && String(stored.source).trim()) || '';
  const title = (titleParam && titleParam.trim()) || (stored.title && String(stored.title).trim()) || '';

  const defaultVolume = Number.isFinite(Number(stored.volume)) ? Number(stored.volume) : 0.12;
  const volumeParam = params.get('musicVol');
  const volume = clamp(
    volumeParam !== null ? Number(volumeParam) / 100 : defaultVolume,
    0,
    1
  );

  const loop = parseBool(params.get('musicLoop'), stored.loop !== false);
  const autoplay = parseBool(params.get('musicAutoplay'), true);
  const muted = parseBool(params.get('musicMuted'), stored.muted === true);
  const showUi = parseBool(params.get('musicUi'), true);
  const showControls = parseBool(params.get('musicControls'), false);

  const config = {
    source,
    title,
    volume,
    loop,
    muted
  };

  saveConfig(config);

  const style = document.createElement('style');
  style.textContent = [
    '.oldschool-music-player {',
    '  position: fixed;',
    '  left: 50%;',
    '  bottom: 14px;',
    '  transform: translateX(-50%);',
    '  z-index: 120;',
    '  width: min(760px, calc(100vw - 28px));',
    '  border-radius: 10px;',
    '  border: 2px solid rgba(229,229,229,0.92);',
    '  background: linear-gradient(180deg, rgba(10,10,10,0.92), rgba(0,0,0,0.88));',
    '  color: #e5e5e5;',
    "  font-family: 'Barlow Condensed', sans-serif;",
    '  box-shadow: 0 14px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(200,16,46,0.45);',
    '  backdrop-filter: blur(6px);',
    '  overflow: hidden;',
    '}',
    '.oldschool-music-player.hidden-ui { display: none; }',
    '.oldschool-music-top {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 12px;',
    '  min-height: 42px;',
    '  padding: 8px 12px;',
    '  border-bottom: 1px solid rgba(255,255,255,0.14);',
    '}',
    '.oldschool-music-top::before {',
    '  content: "";',
    '  width: 8px;',
    '  height: 8px;',
    '  border-radius: 50%;',
    '  background: #c8102e;',
    '  box-shadow: 0 0 10px rgba(200,16,46,0.85);',
    '  flex: none;',
    '}',
    '.oldschool-music-meta {',
    '  min-width: 120px;',
    '  flex: none;',
    '}',
    '.oldschool-music-label {',
    '  font-size: 11px;',
    '  letter-spacing: 1.8px;',
    '  opacity: 0.82;',
    '  white-space: nowrap;',
    '  text-transform: uppercase;',
    '}',
    '.oldschool-music-marquee {',
    '  position: relative;',
    '  overflow: hidden;',
    '  flex: 1;',
    '  min-width: 0;',
    '}',
    '.oldschool-music-title-track {',
    '  display: inline-flex;',
    '  align-items: center;',
    '  gap: 36px;',
    '  min-width: 100%;',
    '}',
    '.oldschool-music-title-track.scrolling {',
    '  animation: oldschoolMusicMarquee 16s linear infinite;',
    '}',
    '.oldschool-music-title-part {',
    '  font-family: "Permanent Marker", "Barlow Condensed", sans-serif;',
    '  font-size: 18px;',
    '  line-height: 1.1;',
    '  font-weight: 700;',
    '  white-space: nowrap;',
    '  color: #ffffff;',
    '  text-shadow: 2px 2px 0 rgba(140,10,31,0.9);',
    '}',
    '@keyframes oldschoolMusicMarquee {',
    '  0% { transform: translateX(0); }',
    '  100% { transform: translateX(-50%); }',
    '}',
    '.oldschool-music-status {',
    '  font-size: 11px;',
    '  letter-spacing: 1px;',
    '  opacity: 0.86;',
    '  white-space: nowrap;',
    '  text-transform: uppercase;',
    '  flex: none;',
    '}',
    '.oldschool-music-status.ok { color: #e5e5e5; }',
    '.oldschool-music-status.warn { color: #c8102e; }',
    '.oldschool-music-controls-wrap {',
    '  display: none;',
    '  padding: 8px 12px 10px;',
    '  background: rgba(0,0,0,0.35);',
    '}',
    '.oldschool-music-player.controls-visible .oldschool-music-controls-wrap {',
    '  display: block;',
    '}',
    '.oldschool-music-controls {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '}',
    '.oldschool-music-btn {',
    '  border: 1px solid rgba(255,255,255,0.68);',
    '  color: #f2f2f2;',
    '  background: rgba(200,16,46,0.24);',
    '  font: inherit;',
    '  font-size: 12px;',
    '  padding: 4px 10px;',
    '  border-radius: 6px;',
    '  cursor: pointer;',
    '}',
    '.oldschool-music-btn:hover { background: rgba(200,16,46,0.36); }',
    '.oldschool-music-volume {',
    '  flex: 1;',
    '  accent-color: #c8102e;',
    '}',
    '.oldschool-music-hint {',
    '  margin-top: 5px;',
    '  font-size: 10px;',
    '  opacity: 0.66;',
    '}',
    '@media (max-width: 680px) {',
    '  .oldschool-music-title-part { font-size: 16px; }',
    '  .oldschool-music-status { font-size: 10px; }',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  const audio = document.createElement('audio');
  audio.preload = 'none';
  audio.loop = loop;
  audio.muted = muted;
  audio.volume = volume;
  if (source) {
    audio.src = source;
  }

  const player = document.createElement('div');
  player.className = 'oldschool-music-player' + (showUi ? '' : ' hidden-ui') + (showControls ? ' controls-visible' : '');

  player.innerHTML = [
    '<div class="oldschool-music-top">',
    '  <div class="oldschool-music-meta">',
    '    <div class="oldschool-music-label">Now Playing</div>',
    '  </div>',
    '  <div class="oldschool-music-marquee" id="oldschoolMusicMarquee">',
    '    <div class="oldschool-music-title-track" id="oldschoolMusicTitleTrack">',
    '      <span class="oldschool-music-title-part" id="oldschoolMusicTitleA"></span>',
    '      <span class="oldschool-music-title-part" id="oldschoolMusicTitleB" aria-hidden="true"></span>',
    '    </div>',
    '  </div>',
    '  <div class="oldschool-music-status" id="oldschoolMusicStatus">Bereit</div>',
    '</div>',
    '<div class="oldschool-music-controls-wrap">',
    '  <div class="oldschool-music-controls">',
    '    <button type="button" class="oldschool-music-btn" id="oldschoolMusicToggle">Play</button>',
    '    <button type="button" class="oldschool-music-btn" id="oldschoolMusicMute">Mute</button>',
    '    <input type="range" class="oldschool-music-volume" id="oldschoolMusicVolume" min="0" max="100" step="1">',
    '  </div>',
    '  <div class="oldschool-music-hint">',
    '    URL: ?music=...&musicTitle=...&musicVol=12&musicControls=1',
    '  </div>',
    '</div>',
  ].join('');

  player.appendChild(audio);
  document.body.appendChild(player);

  const titleAEl = document.getElementById('oldschoolMusicTitleA');
  const titleBEl = document.getElementById('oldschoolMusicTitleB');
  const titleTrackEl = document.getElementById('oldschoolMusicTitleTrack');
  const marqueeEl = document.getElementById('oldschoolMusicMarquee');
  const statusEl = document.getElementById('oldschoolMusicStatus');
  const toggleBtn = document.getElementById('oldschoolMusicToggle');
  const muteBtn = document.getElementById('oldschoolMusicMute');
  const volumeInput = document.getElementById('oldschoolMusicVolume');

  function updateTitle(nextTitle) {
    titleAEl.textContent = nextTitle;
    titleBEl.textContent = nextTitle;
    setTimeout(setupTitleMarquee, 0);
  }

  const initialTitle = title || inferTitleFromSource(source, stored.sourceLabel || '');
  updateTitle(initialTitle);
  volumeInput.value = String(Math.round(volume * 100));

  function setupTitleMarquee() {
    titleTrackEl.classList.remove('scrolling');
    titleBEl.style.display = 'none';
    const needsScroll = titleAEl.scrollWidth > marqueeEl.clientWidth;
    if (needsScroll) {
      titleBEl.style.display = '';
      titleTrackEl.classList.add('scrolling');
    }
  }
  window.addEventListener('resize', setupTitleMarquee);
  setTimeout(setupTitleMarquee, 0);

  function updateButtons() {
    toggleBtn.textContent = audio.paused ? 'Play' : 'Pause';
    muteBtn.textContent = audio.muted ? 'Unmute' : 'Mute';
  }

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.classList.remove('ok', 'warn');
    statusEl.classList.add(kind || 'ok');
  }

  function persistState() {
    config.volume = audio.volume;
    config.muted = audio.muted;
    saveConfig(config);
  }

  function setVolumePercent(value) {
    const normalized = clamp(Number(value) / 100, 0, 1);
    audio.volume = normalized;
    volumeInput.value = String(Math.round(normalized * 100));
    persistState();
  }

  function setMuted(value) {
    audio.muted = Boolean(value);
    persistState();
    updateButtons();
  }

  function setTrack(nextSource, nextTitle, autoplayRequested, sourceLabel) {
    const cleanSource = (nextSource || '').trim();
    if (!cleanSource) {
      setStatus('Keine Musik-URL', 'warn');
      return Promise.resolve(false);
    }

    audio.src = cleanSource;
    config.source = cleanSource;

    const cleanTitle = (nextTitle || '').trim() || inferTitleFromSource(cleanSource, sourceLabel || '');
    config.title = cleanTitle;
    config.sourceLabel = sourceLabel || config.sourceLabel || '';
    updateTitle(cleanTitle);
    saveConfig(config);

    if (!autoplayRequested) {
      setStatus('Track bereit', 'ok');
      return Promise.resolve(true);
    }

    return audio.play().then(function () {
      setStatus('Läuft', 'ok');
      updateButtons();
      return true;
    }).catch(function () {
      setStatus('Start blockiert', 'warn');
      updateButtons();
      return false;
    });
  }

  toggleBtn.addEventListener('click', function () {
    if (!audio.src) {
      setStatus('Keine Musik-URL');
      return;
    }

    if (audio.paused) {
      audio.play().then(function () {
        setStatus('Läuft', 'ok');
        updateButtons();
      }).catch(function () {
        setStatus('Start blockiert', 'warn');
      });
    } else {
      audio.pause();
      setStatus('Pausiert', 'ok');
      updateButtons();
    }
  });

  muteBtn.addEventListener('click', function () {
    audio.muted = !audio.muted;
    persistState();
    updateButtons();
  });

  volumeInput.addEventListener('input', function () {
    setVolumePercent(volumeInput.value);
  });

  audio.addEventListener('playing', function () {
    setStatus('Läuft', 'ok');
    updateButtons();
  });

  audio.addEventListener('pause', function () {
    setStatus('Pausiert', 'ok');
    updateButtons();
  });

  audio.addEventListener('error', function () {
    setStatus('Fehler beim Laden', 'warn');
  });

  updateButtons();

  if (!source) {
    setStatus('Keine Musik-URL', 'warn');
  } else {
    if (autoplay) {
      audio.play().then(function () {
        setStatus('Läuft', 'ok');
        updateButtons();
      }).catch(function () {
        setStatus('Autoplay blockiert', 'warn');
        updateButtons();
      });
    } else {
      setStatus('Bereit', 'ok');
    }
  }

  function applyRegieCommand(command) {
    if (!command || !command.action) return;
    const action = command.action;
    const payload = command.payload || {};

    if (action === 'music.play') {
      if (audio.paused) {
        audio.play().then(function () {
          setStatus('Läuft', 'ok');
          updateButtons();
        }).catch(function () {
          setStatus('Start blockiert', 'warn');
          updateButtons();
        });
      }
      return;
    }

    if (action === 'music.pause') {
      if (!audio.paused) {
        audio.pause();
      }
      return;
    }

    if (action === 'music.toggle') {
      toggleBtn.click();
      return;
    }

    if (action === 'music.mute') {
      setMuted(true);
      return;
    }

    if (action === 'music.unmute') {
      setMuted(false);
      return;
    }

    if (action === 'music.volume.set') {
      setVolumePercent(payload.value);
      return;
    }

    if (action === 'music.volume.up' || action === 'music.volume.down') {
      const step = Math.max(1, Number(payload.step) || 5);
      const current = Math.round(audio.volume * 100);
      const delta = action === 'music.volume.up' ? step : -step;
      setVolumePercent(current + delta);
      return;
    }

    if (action === 'music.track.set') {
      setTrack(payload.source, payload.title, Boolean(payload.autoplay), payload.sourceLabel || payload.fileName || '');
      return;
    }
  }

  document.addEventListener('oldschool-regie-command', function (event) {
    applyRegieCommand(event.detail);
  });

  window.oldschoolMusicController = {
    play: function () { return audio.play(); },
    pause: function () { audio.pause(); },
    toggle: function () { toggleBtn.click(); },
    setMuted: setMuted,
    setVolumePercent: setVolumePercent,
    setTrack: setTrack,
    applyRegieCommand: applyRegieCommand,
    getState: function () {
      return {
        source: config.source || '',
        title: config.title || '',
        volume: Math.round(audio.volume * 100),
        muted: audio.muted,
        paused: audio.paused
      };
    }
  };
})();
