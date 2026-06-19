
import { H as Hls } from './hls.js';

function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (!toggle || !mobileNav) return;

  const update = (open) => {
    mobileNav.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => {
    const isOpen = !mobileNav.hidden;
    update(!isOpen);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => update(false));
  });
}

function initFilterScopes() {
  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const input = scope.querySelector('[data-filter-input]');
    const select = scope.querySelector('[data-sort-select]');
    const target = scope.querySelector('[data-sort-target]');
    const empty = scope.querySelector('[data-empty-state]');
    if (!target) return;

    const allCards = Array.from(target.querySelectorAll('[data-card]'));
    const defaultOrder = Array.from(allCards);

    const apply = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const mode = select?.value || 'score-desc';

      let cards = defaultOrder.slice();

      if (q) {
        cards = cards.filter((card) => {
          const keywords = (card.dataset.keywords || '').toLowerCase();
          return keywords.includes(q);
        });
      }

      cards.sort((a, b) => {
        const yearA = Number(a.dataset.year || 0);
        const yearB = Number(b.dataset.year || 0);
        const scoreA = Number(a.dataset.score || 0);
        const scoreB = Number(b.dataset.score || 0);
        const titleA = (a.dataset.title || '').localeCompare((b.dataset.title || ''), 'zh-Hans-CN');
        switch (mode) {
          case 'year-asc':
            return yearA - yearB || scoreB - scoreA || titleA;
          case 'title-asc':
            return titleA || scoreB - scoreA || yearB - yearA;
          case 'score-asc':
            return scoreA - scoreB || yearB - yearA || titleA;
          case 'score-desc':
          default:
            return scoreB - scoreA || yearB - yearA || titleA;
        }
      });

      defaultOrder.forEach((card) => {
        card.hidden = true;
      });

      cards.forEach((card) => {
        card.hidden = false;
        target.appendChild(card);
      });

      if (empty) empty.hidden = cards.length !== 0;
    };

    input?.addEventListener('input', apply);
    select?.addEventListener('change', apply);
    apply();
  });
}

function initPlayer() {
  document.querySelectorAll('[data-player-shell]').forEach((shell) => {
    const video = shell.querySelector('[data-player-video]');
    const overlay = shell.querySelector('[data-player-overlay]');
    const playBtn = shell.querySelector('[data-player-play]');
    const src = video?.dataset.hlsSrc;
    if (!video || !src) return;

    let hls = null;
    let ready = false;

    const mountHls = () => {
      if (ready) return;
      ready = true;

      if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data?.fatal) return;
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls?.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls?.recoverMediaError();
          } else {
            hls?.destroy();
            hls = null;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        const msg = shell.querySelector('[data-player-message]');
        if (msg) msg.hidden = false;
      }
    };

    const play = async () => {
      mountHls();
      try {
        if (overlay) overlay.hidden = true;
        if (playBtn) playBtn.hidden = true;
        video.controls = true;
        await video.play();
      } catch (err) {
        video.controls = true;
      }
    };

    playBtn?.addEventListener('click', play);
    overlay?.addEventListener('click', play);
    video.addEventListener('click', play);

    shell.querySelectorAll('[data-player-action="play"]').forEach((btn) => {
      btn.addEventListener('click', play);
    });
  });
}

function initBackToTop() {
  const btn = document.querySelector('[data-backtotop]');
  if (!btn) return;
  const toggle = () => {
    btn.classList.toggle('show', window.scrollY > 420);
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFilterScopes();
  initPlayer();
  initBackToTop();
});
