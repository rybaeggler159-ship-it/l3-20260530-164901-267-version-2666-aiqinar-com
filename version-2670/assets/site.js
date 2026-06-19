(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFiltering() {
    var input = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-empty-result]');

    if (!cards.length || (!input && !typeFilter && !yearFilter)) {
      return;
    }

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var type = normalize(typeFilter ? typeFilter.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var passYear = !year || normalize(card.getAttribute('data-year')) === year;
        var pass = passQuery && passType && passYear;

        card.classList.toggle('hidden-by-filter', !pass);
        if (pass) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video[data-stream]');
      var cover = shell.querySelector('.player-cover');

      if (!video) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      var started = false;
      var hlsInstance = null;

      function start() {
        if (!stream) {
          return;
        }

        if (started) {
          video.play().catch(function () {});
          return;
        }

        started = true;
        shell.classList.add('is-playing');
        video.setAttribute('controls', 'controls');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                hlsInstance.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                hlsInstance.destroy();
              }
            }
          });
        }
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFiltering();
    initPlayers();
  });
})();
