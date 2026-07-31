// Laedt tmi.js. Frueher ueber externe CDN-Links (cdn.jsdelivr.net/unpkg.com)
// versucht - Root-Cause-Analyse ergab, dass das npm-Paket tmi.js@1.8.5 laut
// eigenem "files"-Feld in package.json GAR KEINEN gebauten Browser-Bundle
// veroeffentlicht (nur lib/+index.js, reiner Node-CommonJS-Quellcode). Die
// bisher verwendeten CDN-Pfade (.../185/tmi.min.js, .../dist/tmi.min.js)
// existierten dadurch auf keinem CDN, das den npm-Tarball spiegelt - das
// erklaert rueckwirkend saemtliche bisherigen "Chat funktioniert nicht"-
// Meldungen im ganzen Projekt, unabhaengig von WebView oder CDN-Anbieter.
//
// Fix: der Browser-Bundle wird jetzt einmalig lokal aus dem npm-Paket
// gebaut (browserify + babelify, exakt nach tmi.js' eigenem
// "build:browserify"-Skript) und als assets/js/tmi.min.js im Repo
// mitgeliefert (MIT-Lizenz, siehe tmi.min.js.LICENSE) - same-origin, keine
// externe CDN-Abhaengigkeit mehr fuer den Normalfall. Die alten CDN-URLs
// bleiben als letzter Notfall-Fallback bestehen, falls die lokale Datei aus
// irgendeinem Grund fehlt.
(function () {
  var SOURCES = [
    '/assets/js/tmi.min.js',
    'https://cdn.jsdelivr.net/npm/tmi.js@1.8.5/185/tmi.min.js',
    'https://unpkg.com/tmi.js@1.8.5/185/tmi.min.js'
  ];

  window.loadTmiWithFallback = function (onReady, onFailed) {
    var i = 0;
    function tryNext() {
      if (typeof tmi !== 'undefined') { onReady(); return; }
      if (i >= SOURCES.length) { onFailed(); return; }
      var url = SOURCES[i++];
      var script = document.createElement('script');
      script.src = url;
      script.onload = function () {
        if (typeof tmi !== 'undefined') onReady();
        else tryNext();
      };
      script.onerror = tryNext;
      document.head.appendChild(script);
    }
    tryNext();
  };
})();
