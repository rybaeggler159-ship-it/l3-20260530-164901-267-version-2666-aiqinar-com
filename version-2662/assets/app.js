(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');
  if (navButton && navMenu) {
    navButton.addEventListener('click', function () {
      navMenu.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = setInterval(next, 5200);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    var nextButton = hero.querySelector('[data-hero-next]');
    var prevButton = hero.querySelector('[data-hero-prev]');
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        next();
        start();
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-year'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-type')
    ].join(' ').toLowerCase();
  }

  function applyFilter() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = cardText(card);
      var matchesText = !keyword || text.indexOf(keyword) !== -1;
      var matchesFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
    });
  }

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      activeFilter = button.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });

  var shell = document.querySelector('[data-stream]');
  if (shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-player-button]');
    var stream = shell.getAttribute('data-stream');
    var ready = false;

    function bind() {
      if (ready || !video || !stream) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
        return;
      }
      video.src = stream;
      ready = true;
    }

    function play() {
      bind();
      if (cover) cover.classList.add('is-hidden');
      var result = video.play();
      if (result && result.catch) result.catch(function () {});
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!ready) play();
    });
  }
})();
