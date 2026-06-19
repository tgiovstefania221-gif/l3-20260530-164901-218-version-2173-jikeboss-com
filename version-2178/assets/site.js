(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      current = (next + slides.length) % slides.length;
      slides.forEach(function (slide, index) {
        slide.classList.toggle('active', index === current);
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.getElementById('movieSearch');
  var typeFilter = document.getElementById('typeFilter');
  var yearFilter = document.getElementById('yearFilter');
  var grid = document.querySelector('[data-search-grid]');

  if (searchInput && typeFilter && yearFilter && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function matchCard(card) {
      var keyword = normalize(searchInput.value);
      var typeValue = normalize(typeFilter.value);
      var yearValue = normalize(yearFilter.value);
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-tags')
      ].join(' '));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));

      return (!keyword || haystack.indexOf(keyword) !== -1) &&
        (!typeValue || cardType === typeValue) &&
        (!yearValue || cardYear === yearValue);
    }

    function runSearch() {
      cards.forEach(function (card) {
        card.style.display = matchCard(card) ? '' : 'none';
      });
    }

    searchInput.addEventListener('input', runSearch);
    typeFilter.addEventListener('change', runSearch);
    yearFilter.addEventListener('change', runSearch);
    window.movieSearchRun = runSearch;
  }
})();

function applyInitialSearch() {
  var input = document.getElementById('movieSearch');
  if (!input) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var keyword = params.get('q');
  if (keyword) {
    input.value = keyword;
  }

  if (window.movieSearchRun) {
    window.movieSearchRun();
  }
}

function initializeMoviePlayer(streamUrl, videoId, coverId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var attached = false;
  var hlsPlayer = null;

  if (!video) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsPlayer = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsPlayer.loadSource(streamUrl);
      hlsPlayer.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    attachStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsPlayer) {
      hlsPlayer.destroy();
    }
  });
}
