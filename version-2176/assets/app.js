(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var next = hero.querySelector('[data-hero-next]');
    var prev = hero.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startHero();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  var scope = document.querySelector('.filter-scope');
  var searchInput = document.querySelector('.card-search');
  var yearFilter = document.querySelector('.year-filter');

  if (searchInput && searchInput.classList.contains('auto-query')) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      searchInput.value = query;
    }
  }

  function applyFilters() {
    if (!scope) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-item'));
    var keyword = normalize(searchInput ? searchInput.value : '');
    var year = yearFilter ? yearFilter.value : '';

    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      card.classList.toggle('is-hidden-card', !(matchedKeyword && matchedYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', applyFilters);
  }

  applyFilters();

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-library]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-library', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachVideo(video, url) {
    if (!video || !url) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video.hlsInstance) {
        video.hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hlsInstance = hls;
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(function () {});
      return;
    }

    video.src = url;
    video.play().catch(function () {});
  }

  Array.prototype.slice.call(document.querySelectorAll('.play-overlay')).forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.player-card');
      var video = card ? card.querySelector('video') : null;
      var url = button.getAttribute('data-video');
      button.classList.add('is-hidden');
      loadHlsLibrary(function () {
        attachVideo(video, url);
      });
    });
  });
})();
