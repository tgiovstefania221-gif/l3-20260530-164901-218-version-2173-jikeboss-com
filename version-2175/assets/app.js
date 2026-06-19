(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    startHero();
  }

  var searchInput = document.querySelector('[data-site-search]');
  if (searchInput) {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) searchInput.value = initial;

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function filterItems() {
      var keyword = normalize(searchInput.value);
      items.forEach(function (item) {
        var haystack = normalize(item.getAttribute('data-search') + ' ' + item.textContent);
        item.classList.toggle('is-hidden', Boolean(keyword) && haystack.indexOf(keyword) === -1);
      });
    }

    searchInput.addEventListener('input', filterItems);
    filterItems();
  }
})();

function setupMoviePlayer(streamUrl) {
  var video = document.getElementById('moviePlayer');
  var startButton = document.getElementById('playerStart');
  var hls = null;
  var prepared = false;

  function prepare() {
    if (!video || prepared) return;
    prepared = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    if (!video) return;
    prepare();
    if (startButton) startButton.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (startButton) {
    startButton.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    video.addEventListener('play', function () {
      if (startButton) startButton.classList.add('is-hidden');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') hls.destroy();
  });
}
