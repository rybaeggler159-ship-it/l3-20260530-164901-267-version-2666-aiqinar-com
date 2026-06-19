(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.js-filter-grid'));
    if (!grids.length) {
      return;
    }

    grids.forEach(function (grid) {
      var section = grid.closest('section') || document;
      var input = section.querySelector('.js-filter-input');
      var region = section.querySelector('.js-filter-region');
      var type = section.querySelector('.js-filter-type');
      var year = section.querySelector('.js-filter-year');
      var sort = section.querySelector('.js-filter-sort');
      var count = section.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-movie-card'));
      var originalOrder = cards.slice();

      function getText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.textContent
        ].join(' ').toLowerCase();
      }

      function applySort(visibleCards) {
        var mode = sort ? sort.value : 'default';
        var ordered = visibleCards.slice();
        if (mode === 'year-desc') {
          ordered.sort(function (a, b) {
            return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
          });
        } else if (mode === 'year-asc') {
          ordered.sort(function (a, b) {
            return Number(a.getAttribute('data-year')) - Number(b.getAttribute('data-year'));
          });
        } else if (mode === 'title') {
          ordered.sort(function (a, b) {
            return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
          });
        } else {
          ordered = originalOrder.filter(function (card) {
            return visibleCards.indexOf(card) !== -1;
          });
        }
        ordered.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      function update() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = [];

        cards.forEach(function (card) {
          var matchesKeyword = !keyword || getText(card).indexOf(keyword) !== -1;
          var matchesRegion = !regionValue || String(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
          var matchesType = !typeValue || String(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
          var matchesYear = !yearValue || String(card.getAttribute('data-year')) === yearValue;
          var shouldShow = matchesKeyword && matchesRegion && matchesType && matchesYear;
          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible.push(card);
          }
        });

        applySort(visible);
        if (count) {
          count.textContent = '当前显示 ' + visible.length + ' 部影片';
        }
      }

      [input, region, type, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });
    });
  }

  function initHlsPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      var status = shell.querySelector('[data-player-status]');
      var source = shell.getAttribute('data-video-src');
      var initialized = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initializeAndPlay() {
        if (!video || !source) {
          setStatus('未找到播放源');
          return;
        }

        if (initialized) {
          video.play().catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击播放按钮');
          });
          return;
        }

        initialized = true;
        setStatus('正在初始化播放源...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 60
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            shell.classList.add('is-playing');
            setStatus('播放源已就绪');
            video.play().catch(function () {
              setStatus('播放源已就绪，请点击视频控制栏播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源加载失败，请稍后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          shell.classList.add('is-playing');
          video.play().catch(function () {
            setStatus('播放源已就绪，请点击视频控制栏播放');
          });
        } else {
          video.src = source;
          shell.classList.add('is-playing');
          video.play().catch(function () {
            setStatus('当前浏览器可能需要 HLS 支持组件才能播放');
          });
        }
      }

      if (button) {
        button.addEventListener('click', initializeAndPlay);
      }

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          if (!video.ended) {
            return;
          }
          shell.classList.remove('is-playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHtml(movie.detail) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
      '    <div class="card-media">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy" onerror="this.style.opacity=\'0\';">',
      '      <span class="card-type">' + escapeHtml(movie.type) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '      </div>',
      '      <div class="card-tags">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var resultWrap = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    var searchInput = document.querySelector('[data-search-input]');

    if (!resultWrap || !window.SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    if (searchInput) {
      searchInput.value = query;
    }

    if (!query) {
      var starter = window.SEARCH_DATA.slice(0, 24);
      resultWrap.innerHTML = starter.map(renderSearchCard).join('');
      if (summary) {
        summary.textContent = '默认展示 24 部热门影片，可输入关键词继续检索。';
      }
      return;
    }

    var parts = query.toLowerCase().split(/\s+/).filter(Boolean);
    var results = window.SEARCH_DATA.filter(function (movie) {
      var haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return parts.every(function (part) {
        return haystack.indexOf(part) !== -1;
      });
    }).slice(0, 240);

    resultWrap.innerHTML = results.map(renderSearchCard).join('');
    if (summary) {
      summary.textContent = '关键词“' + query + '”共找到 ' + results.length + ' 条结果';
    }
  }

  initHeroSlider();
  initFilters();
  initHlsPlayers();
  initSearchPage();
})();
