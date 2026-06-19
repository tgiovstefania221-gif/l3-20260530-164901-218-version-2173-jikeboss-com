(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('active');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        restartTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        restartTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        restartTimer();
      });
    }

    restartTimer();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function movieMatches(movie, query) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.genre,
      movie.category
    ].join(' ');

    return normalize(text).indexOf(query) !== -1;
  }

  function renderSuggest(container, input) {
    if (!container || !input || !window.SITE_MOVIES) {
      return;
    }

    var query = normalize(input.value);

    if (!query) {
      container.classList.remove('active');
      container.innerHTML = '';
      return;
    }

    var results = window.SITE_MOVIES.filter(function (movie) {
      return movieMatches(movie, query);
    }).slice(0, 6);

    if (!results.length) {
      container.classList.remove('active');
      container.innerHTML = '';
      return;
    }

    container.innerHTML = results.map(function (movie) {
      return '<a href="' + movie.url + '">' +
        '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '">' +
        '<span><strong>' + escapeHtml(movie.title) + '</strong>' +
        '<span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.genre) + '</span></span>' +
        '</a>';
    }).join('');
    container.classList.add('active');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    var input = form.querySelector('[data-search-input]');
    var suggest = form.querySelector('[data-search-suggest]');

    if (input && suggest) {
      input.addEventListener('input', function () {
        renderSuggest(suggest, input);
      });

      document.addEventListener('click', function (event) {
        if (!form.contains(event.target)) {
          suggest.classList.remove('active');
        }
      });
    }
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var section = scope.closest('section') || document;
    var input = scope.querySelector('[data-page-filter]');
    var year = scope.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card-list] article'));

    function applyFilter() {
      var query = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year')
        ].join(' '));
        var cardYear = card.getAttribute('data-year') || '';
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedYear = !selectedYear || cardYear === selectedYear;

        card.classList.toggle('is-filtered-out', !(matchedQuery && matchedYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (year) {
      year.addEventListener('change', applyFilter);
    }
  });

  var searchResults = document.getElementById('search-results');
  var searchTitle = document.querySelector('[data-search-title]');
  var pageSearchInput = document.querySelector('[data-search-page-input]');

  if (searchResults && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var pageQuery = normalize(params.get('q'));

    if (pageSearchInput && pageQuery) {
      pageSearchInput.value = params.get('q');
    }

    if (pageQuery) {
      var pageResults = window.SITE_MOVIES.filter(function (movie) {
        return movieMatches(movie, pageQuery);
      }).slice(0, 96);

      if (searchTitle) {
        searchTitle.textContent = '与“' + params.get('q') + '”相关';
      }

      searchResults.innerHTML = pageResults.map(function (movie) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + movie.url + '">' +
          '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="year-pill">' + escapeHtml(movie.year) + '</span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<div class="card-tags"><span>' + escapeHtml(movie.category) + '</span></div>' +
          '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>' +
          '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join('');

      if (!pageResults.length) {
        searchResults.innerHTML = '<div class="side-box"><h2>暂无匹配内容</h2><p>可以尝试更换片名、题材、年份或地区关键词。</p></div>';
      }
    }
  }
})();
