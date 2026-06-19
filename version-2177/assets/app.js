(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
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

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function initSearchForms() {
        var forms = document.querySelectorAll("[data-search-form]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initCardFilters() {
        var scopes = document.querySelectorAll("[data-filter-scope]");
        scopes.forEach(function (scope) {
            var container = scope.querySelector(".movie-grid, .list-stack");
            var form = document.querySelector("[data-filter-form]");
            var search = form ? form.querySelector("[data-card-search]") : null;
            var sort = form ? form.querySelector("[data-card-sort]") : null;
            var empty = scope.querySelector("[data-empty-state]");
            if (!container) {
                return;
            }
            var cards = Array.prototype.slice.call(container.children);

            function textOf(card) {
                return [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-year") || "",
                    card.getAttribute("data-genre") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
            }

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var match = !query || textOf(card).indexOf(query) !== -1;
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            function reorder() {
                var value = sort ? sort.value : "default";
                var ordered = cards.slice();
                if (value === "views") {
                    ordered.sort(function (a, b) {
                        return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
                    });
                }
                if (value === "year") {
                    ordered.sort(function (a, b) {
                        return String(b.getAttribute("data-year") || "").localeCompare(String(a.getAttribute("data-year") || ""));
                    });
                }
                if (value === "title") {
                    ordered.sort(function (a, b) {
                        return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-CN");
                    });
                }
                ordered.forEach(function (card) {
                    container.appendChild(card);
                });
                cards = ordered;
                apply();
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            if (sort) {
                sort.addEventListener("change", reorder);
            }
            apply();
        });
    }

    function renderSearchCard(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + movie.url + "\" class=\"card-link\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<div class=\"card-poster\">",
            "<img src=\"./" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"card-duration\">" + escapeHtml(movie.duration) + "</span>",
            "</div>",
            "<div class=\"card-body\">",
            "<h3>" + escapeHtml(movie.title) + "</h3>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"card-meta\"><span>" + escapeHtml(movie.category) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initSearchPage() {
        var input = document.getElementById("search-page-input");
        var form = document.querySelector("[data-search-page-form]");
        var results = document.getElementById("search-results");
        var title = document.getElementById("search-result-title");
        var desc = document.getElementById("search-result-desc");
        var empty = document.getElementById("search-empty");
        if (!input || !form || !results || !window.SITE_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        input.value = params.get("q") || "";

        function render() {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                if (title) {
                    title.textContent = "精选内容";
                }
                if (desc) {
                    desc.textContent = "可直接输入关键词筛选全站影视内容。";
                }
                empty.classList.remove("is-visible");
                return;
            }
            var matched = window.SITE_MOVIES.filter(function (movie) {
                return movie.search.indexOf(query) !== -1;
            }).slice(0, 96);
            results.innerHTML = matched.map(renderSearchCard).join("");
            if (title) {
                title.textContent = "搜索结果";
            }
            if (desc) {
                desc.textContent = "关键词：“" + input.value.trim() + "”";
            }
            empty.classList.toggle("is-visible", matched.length === 0);
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var query = input.value.trim();
            var url = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
            window.history.replaceState({}, "", url);
            render();
        });
        input.addEventListener("input", render);
        render();
    }

    window.SitePlayer = {
        init: function (source) {
            var video = document.getElementById("movie-video");
            var button = document.getElementById("play-overlay");
            var hls = null;
            var attached = false;

            if (!video || !button || !source) {
                return;
            }

            function play() {
                button.classList.add("is-hidden");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }

            function attach() {
                if (attached) {
                    play();
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, play);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hls.recoverMediaError();
                            } else {
                                hls.destroy();
                                video.src = source;
                            }
                        }
                    });
                    return;
                }
                video.src = source;
                play();
            }

            button.addEventListener("click", attach);
            video.addEventListener("click", function () {
                if (video.paused) {
                    attach();
                }
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };

    ready(function () {
        initMenu();
        initHero();
        initSearchForms();
        initCardFilters();
        initSearchPage();
    });
})();
