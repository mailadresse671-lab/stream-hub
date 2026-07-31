// Laedt tmi.js mit Fallback ueber mehrere CDNs. Hintergrund: alle Chat-
// Widgets luden tmi.js bisher ueber einen einzelnen fest verdrahteten
// <script src="cdn.jsdelivr.net/..."> -Tag - schlaegt dieser einzelne CDN-
// Request in der Streamlabs-Mobile-Android-WebView fehl (Diagnose in
// chat-vibes.html zeigte live "CDN-Fehler"), bleibt der komplette Chat
// (und darueber gekoppelte Funktionen wie die Avatar-Reaktion in
// overlay.html/in-game.html) tot, ohne dass ein zweiter Versuch ueber einen
// anderen Anbieter unternommen wird. Ruft onReady() auf, sobald tmi global
// verfuegbar ist, sonst onFailed() nachdem alle CDNs der Reihe nach
// gescheitert sind.
(function () {
  var CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/tmi.js@1.8.5/185/tmi.min.js',
    'https://unpkg.com/tmi.js@1.8.5/185/tmi.min.js'
  ];

  window.loadTmiWithFallback = function (onReady, onFailed) {
    var i = 0;
    function tryNext() {
      if (typeof tmi !== 'undefined') { onReady(); return; }
      if (i >= CDN_URLS.length) { onFailed(); return; }
      var url = CDN_URLS[i++];
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
