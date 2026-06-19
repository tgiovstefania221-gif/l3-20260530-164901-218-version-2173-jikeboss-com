(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function bindMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      document.body.classList.toggle("is-menu-open", open);
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dots button", hero);
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  function bindCatalogFilter() {
    var panel = document.querySelector("[data-catalog-filter]");
    var grid = document.getElementById("catalog-grid");
    if (!panel || !grid) {
      return;
    }
    var keyword = document.getElementById("catalog-keyword");
    var category = document.getElementById("catalog-category");
    var year = document.getElementById("catalog-year");
    var type = document.getElementById("catalog-type");
    var count = document.getElementById("catalog-count");
    var cards = selectAll(".video-card", grid);

    function apply() {
      var q = (keyword.value || "").trim().toLowerCase();
      var cat = category.value;
      var y = year.value;
      var t = type.value;
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.textContent
        ].join(" ").toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (cat && card.dataset.category !== cat) {
          ok = false;
        }
        if (y && card.dataset.year !== y) {
          ok = false;
        }
        if (t && card.dataset.type !== t) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      count.textContent = visible + " 部";
    }

    [keyword, category, year, type].forEach(function (node) {
      node.addEventListener("input", apply);
      node.addEventListener("change", apply);
    });
  }

  function cardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"video-card\">",
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"card-link\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
      "<div class=\"image-frame card-cover\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" class=\"cover-image\" loading=\"lazy\" onerror=\"this.closest('.image-frame').classList.add('is-missing'); this.remove();\">",
      "<span class=\"card-category\">" + escapeHtml(movie.category) + "</span>",
      "<span class=\"card-duration\">" + escapeHtml(movie.duration) + "</span>",
      "</div>",
      "<div class=\"card-body\">",
      "<h3>" + escapeHtml(movie.title) + "</h3>",
      "<p class=\"card-line\">" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"card-meta\"><span>★ " + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
      "<div class=\"card-tags\">" + tags + "</div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function bindSearchPage() {
    var results = document.getElementById("search-results");
    var summary = document.getElementById("search-summary");
    var input = document.getElementById("search-input");
    if (!results || !summary || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get("q") || "").trim();
    input.value = q;

    function render(query) {
      var keyword = query.trim().toLowerCase();
      if (!keyword) {
        results.innerHTML = "";
        summary.textContent = "请输入关键词开始搜索。";
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(" ")
        ].join(" ").toLowerCase().indexOf(keyword) !== -1;
      });
      summary.textContent = "找到 " + matched.length + " 部与“" + query + "”相关的影片。";
      results.innerHTML = matched.slice(0, 300).map(cardTemplate).join("");
    }

    input.addEventListener("input", function () {
      render(input.value);
    });
    render(q);
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindHero();
    bindCatalogFilter();
    bindSearchPage();
  });
})();
