(function() {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function() {
            menu.classList.toggle('open');
        });
    }

    function initHeroCarousel() {
        var root = document.querySelector('.hero-carousel');
        if (!root) {
            return;
        }
        var slides = selectAll('.hero-slide', root);
        var dots = selectAll('.hero-dot', root);
        var prev = root.querySelector('.hero-arrow.prev');
        var next = root.querySelector('.hero-arrow.next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function() {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearchScopes() {
        selectAll('[data-search-scope]').forEach(function(scope) {
            var input = scope.querySelector('.search-input');
            var clearButton = scope.querySelector('.clear-search');
            var cards = selectAll('.movie-card', scope);
            var empty = scope.querySelector('.no-result');
            if (!input || !cards.length) {
                return;
            }

            function normalize(value) {
                return (value || '').toLowerCase().replace(/\s+/g, '');
            }

            function filterCards() {
                var query = normalize(input.value);
                var visible = 0;
                cards.forEach(function(card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-region'),
                        card.textContent
                    ].join(' '));
                    var matched = !query || text.indexOf(query) !== -1;
                    card.classList.toggle('hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            input.addEventListener('input', filterCards);
            if (clearButton) {
                clearButton.addEventListener('click', function() {
                    input.value = '';
                    filterCards();
                    input.focus();
                });
            }
        });
    }

    window.setupPlayer = function(source) {
        var video = document.querySelector('.movie-player');
        var cover = document.querySelector('.player-cover');
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
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
                return new Promise(function(resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                        resolve();
                    });
                });
            }
            video.src = source;
            return Promise.resolve();
        }

        function play() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            load().then(function() {
                var action = video.play();
                if (action && action.catch) {
                    action.catch(function() {});
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function() {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function() {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initHeroCarousel();
        initSearchScopes();
    });
}());
