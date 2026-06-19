(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video[data-video-source]');
    var button = player.querySelector('[data-play-button]');
    var hls = null;
    var loaded = false;

    if (!video || !button) {
      return;
    }

    function loadSource() {
      if (loaded) {
        return Promise.resolve();
      }

      var source = video.getAttribute('data-video-source');
      loaded = true;
      player.classList.add('is-ready');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return Promise.resolve();
      }

      video.src = source;
      return Promise.resolve();
    }

    function playVideo() {
      loadSource().then(function () {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            player.classList.remove('is-ready');
          });
        }
      });
    }

    button.addEventListener('click', playVideo);
    player.addEventListener('click', function (event) {
      if (event.target === video || event.target === player) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-ready');
    });

    video.addEventListener('error', function () {
      player.classList.remove('is-ready');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
})();
