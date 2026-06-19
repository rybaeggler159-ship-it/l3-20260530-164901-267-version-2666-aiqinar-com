(() => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const mobileButton = $('[data-mobile-toggle]');
    const mobileLinks = $('[data-mobile-links]');
    if (mobileButton && mobileLinks) {
        mobileButton.addEventListener('click', () => {
            mobileLinks.classList.toggle('is-open');
        });
    }

    const searchForms = $$('[data-search-form]');
    searchForms.forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = $('[data-search-input]', form);
            const query = input ? input.value.trim() : '';
            const prefix = form.getAttribute('data-prefix') || '';
            const url = prefix + 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
            window.location.href = url;
        });
    });

    const lead = $('[data-lead-slider]');
    if (lead) {
        const slides = $$('[data-lead-slide]', lead);
        const dots = $$('[data-lead-dot]', lead);
        const prev = $('[data-lead-prev]', lead);
        const next = $('[data-lead-next]', lead);
        let active = 0;
        const show = (index) => {
            active = (index + slides.length) % slides.length;
            slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === active));
            dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === active));
        };
        if (slides.length > 0) {
            prev && prev.addEventListener('click', () => show(active - 1));
            next && next.addEventListener('click', () => show(active + 1));
            dots.forEach((dot, idx) => dot.addEventListener('click', () => show(idx)));
            setInterval(() => show(active + 1), 5200);
            show(0);
        }
    }

    const searchPage = $('[data-search-page]');
    if (searchPage) {
        const input = $('[data-search-page-input]', searchPage);
        const cards = $$('[data-card]', searchPage);
        const empty = $('[data-empty-result]', searchPage);
        const params = new URLSearchParams(window.location.search);
        const apply = () => {
            const value = (input ? input.value : '').trim().toLowerCase();
            let visible = 0;
            cards.forEach((card) => {
                const haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
                const hit = !value || haystack.includes(value);
                card.style.display = hit ? '' : 'none';
                if (hit) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        };
        if (input) {
            input.value = params.get('q') || '';
            input.addEventListener('input', apply);
            apply();
        }
    }

    const stages = $$('[data-player]');
    const attachStream = (stage) => {
        const video = $('video', stage);
        const button = $('[data-play-button]', stage);
        const stream = stage.getAttribute('data-stream');
        let ready = false;
        const start = () => {
            if (!video || !stream) {
                return;
            }
            stage.classList.add('is-playing');
            if (!ready) {
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                        video.play().catch(() => {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(() => {});
                }
                ready = true;
            } else {
                video.play().catch(() => {});
            }
        };
        if (button) {
            button.addEventListener('click', start);
        }
        if (video) {
            video.addEventListener('play', () => stage.classList.add('is-playing'));
        }
    };
    stages.forEach(attachStream);
})();
