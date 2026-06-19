(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    if (slides.length > 1) {
      startHero();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-card-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var type = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');
    var keyword = normalize(input && input.value);
    var yearValue = normalize(year && year.value);
    var typeValue = normalize(type && type.value);
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' '));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
      var matchesType = !typeValue || normalize(card.dataset.type) === typeValue;
      var isVisible = matchesKeyword && matchesYear && matchesType;

      card.hidden = !isVisible;

      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (empty) {
      empty.hidden = visibleCount !== 0;
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var controls = scope.querySelectorAll('[data-card-filter], [data-year-filter], [data-type-filter]');

    Array.prototype.slice.call(controls).forEach(function (control) {
      control.addEventListener('input', function () {
        applyFilters(scope);
      });
      control.addEventListener('change', function () {
        applyFilters(scope);
      });
    });

    var queryInput = scope.querySelector('[data-query-sync]');
    if (queryInput) {
      var params = new URLSearchParams(location.search);
      var initial = params.get('q');
      if (initial) {
        queryInput.value = initial;
        applyFilters(scope);
      }
    }
  });
})();
