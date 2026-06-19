
(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  const player = document.querySelector('[data-hls-player]');
  if (player) {
    const src = player.dataset.src;
    const fallback = document.querySelector('[data-player-fallback]');

    function init() {
      if (!src) {
        if (fallback) fallback.style.display = 'grid';
        return;
      }
      if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = src;
        if (fallback) fallback.style.display = 'none';
        return;
      }
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(player);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          if (fallback) fallback.style.display = 'none';
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          console.warn('HLS error', data);
          if (fallback) fallback.style.display = 'grid';
        });
        return;
      }
      if (fallback) fallback.style.display = 'grid';
    }

    if (window.Hls) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.onload = init;
      script.onerror = function () {
        if (fallback) fallback.style.display = 'grid';
      };
      document.head.appendChild(script);
    }

    const playBtn = document.querySelector('[data-play-btn]');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        player.play().catch(() => {});
      });
    }
  }
})();
