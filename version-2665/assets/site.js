(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var index = 0;
    var setSlide = function (next) {
      slides[index].classList.remove('is-active');
      if (dots[index]) dots[index].classList.remove('is-active');
      index = next;
      slides[index].classList.add('is-active');
      if (dots[index]) dots[index].classList.add('is-active');
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
      });
    });
    setInterval(function () {
      setSlide((index + 1) % slides.length);
    }, 5200);
  }

  var searchInput = document.querySelector('.movie-search');
  var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var applyFilters = function () {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var haystack = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.genre, card.dataset.type].join(' ').toLowerCase();
      var ok = !q || haystack.indexOf(q) !== -1;
      selects.forEach(function (select) {
        var key = select.getAttribute('data-filter');
        if (select.value && card.dataset[key] !== select.value) ok = false;
      });
      card.style.display = ok ? '' : 'none';
    });
  };
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  selects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('.play-button');
    var src = wrap.getAttribute('data-src');
    if (!video || !src) return;
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
    var play = function () {
      var action = video.paused ? video.play() : video.pause();
      if (action && typeof action.catch === 'function') action.catch(function () {});
    };
    if (button) button.addEventListener('click', play);
    video.addEventListener('click', play);
    video.addEventListener('play', function () {
      wrap.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      wrap.classList.remove('is-playing');
    });
  });

  var searchForm = document.querySelector('[data-search-form]');
  if (searchForm) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = searchForm.querySelector('input');
      var q = input ? input.value.trim() : '';
      if (q) location.href = './search.html?q=' + encodeURIComponent(q);
    });
  }

  var searchPage = document.querySelector('[data-search-page]');
  if (searchPage && Array.isArray(window.SITE_MOVIES)) {
    var params = new URLSearchParams(location.search);
    var input = searchPage.querySelector('input');
    var box = document.getElementById('search-results');
    var render = function () {
      var q = input.value.trim().toLowerCase();
      var rows = window.SITE_MOVIES.filter(function (item) {
        return !q || [item.title, item.region, item.year, item.genre, item.type].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);
      if (!rows.length) {
        box.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        return;
      }
      box.innerHTML = rows.map(function (item) {
        return '<article class="movie-card" data-card>' +
          '<a class="poster" href="' + item.url + '"><img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy"><span class="badge">' + item.type + '</span></a>' +
          '<div class="card-body"><a class="card-title" href="' + item.url + '">' + item.title + '</a>' +
          '<p>' + item.one + '</p><div class="card-meta"><span>' + item.region + '</span><span>' + item.year + '</span></div></div></article>';
      }).join('');
    };
    input.value = params.get('q') || '';
    input.addEventListener('input', render);
    searchPage.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    render();
  }
})();
