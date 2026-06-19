(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = qs('.menu-toggle');
        var panel = qs('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        restart();
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>'"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function setupGlobalSearch() {
        var inputs = qsa('.site-search');
        if (!inputs.length || !window.SEARCH_INDEX) {
            return;
        }
        inputs.forEach(function (input) {
            var box = qs('.search-results', input.parentElement);
            if (!box) {
                return;
            }
            input.addEventListener('input', function () {
                var query = input.value.trim().toLowerCase();
                if (!query) {
                    box.classList.remove('is-open');
                    box.innerHTML = '';
                    return;
                }
                var results = window.SEARCH_INDEX.filter(function (item) {
                    return item.search.indexOf(query) !== -1;
                }).slice(0, 8);
                if (!results.length) {
                    box.innerHTML = '<div class="empty-search">没有找到相关影片</div>';
                    box.classList.add('is-open');
                    return;
                }
                box.innerHTML = results.map(function (item) {
                    return '<a href="./' + encodeURI(item.file) + '">' +
                        '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
                        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</span></span>' +
                        '</a>';
                }).join('');
                box.classList.add('is-open');
            });
            document.addEventListener('click', function (event) {
                if (!input.parentElement.contains(event.target)) {
                    box.classList.remove('is-open');
                }
            });
        });
    }

    function setupLocalFilter() {
        var input = qs('.local-filter');
        var grid = qs('[data-local-grid]');
        if (!input || !grid) {
            return;
        }
        var cards = qsa('.movie-card', grid);
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-filter') || '').toLowerCase();
                card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
            });
        });
    }

    function setupPlayers() {
        qsa('.player-shell').forEach(function (player) {
            var video = qs('video', player);
            var overlay = qs('.play-overlay', player);
            var stream = player.getAttribute('data-stream');
            var hls = null;
            if (!video || !stream) {
                return;
            }

            function bindStream() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
                video.setAttribute('data-ready', '1');
            }

            function start() {
                bindStream();
                player.classList.add('is-playing');
                var play = video.play();
                if (play && typeof play.catch === 'function') {
                    play.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', start);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupGlobalSearch();
        setupLocalFilter();
        setupPlayers();
    });
})();
