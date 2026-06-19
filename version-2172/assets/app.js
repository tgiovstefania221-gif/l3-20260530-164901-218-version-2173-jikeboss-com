document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var index = 0;

    function showSlide(next) {
        if (!slides.length) {
            return;
        }

        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === index);
        });
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            showSlide(i);
        });
    });

    if (slides.length > 1) {
        showSlide(0);
        setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
        return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var query = document.querySelector('[data-filter-query]');
    var region = document.querySelector('[data-filter-region]');
    var type = document.querySelector('[data-filter-type]');
    var year = document.querySelector('[data-filter-year]');
    var reset = document.querySelector('[data-filter-reset]');
    var empty = document.querySelector('.empty-state');
    var params = new URLSearchParams(window.location.search);

    if (query && params.get('q')) {
        query.value = params.get('q');
    }

    function fillSelect(select, attr) {
        if (!select) {
            return;
        }

        var values = cards.map(function (card) {
            return card.getAttribute(attr) || '';
        }).filter(Boolean).filter(function (value, i, arr) {
            return arr.indexOf(value) === i;
        }).slice(0, 120);

        values.sort(function (a, b) {
            return a.localeCompare(b, 'zh-Hans-CN');
        });

        values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    fillSelect(region, 'data-region');
    fillSelect(type, 'data-type');
    fillSelect(year, 'data-year');

    function applyFilter() {
        var q = query ? query.value.trim().toLowerCase() : '';
        var r = region ? region.value : '';
        var t = type ? type.value : '';
        var y = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre')
            ].join(' ').toLowerCase();

            var ok = true;
            ok = ok && (!q || haystack.indexOf(q) !== -1);
            ok = ok && (!r || card.getAttribute('data-region') === r);
            ok = ok && (!t || card.getAttribute('data-type') === t);
            ok = ok && (!y || card.getAttribute('data-year') === y);
            card.style.display = ok ? '' : 'none';
            if (ok) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    [query, region, type, year].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilter);
            control.addEventListener('change', applyFilter);
        }
    });

    if (reset) {
        reset.addEventListener('click', function () {
            if (query) {
                query.value = '';
            }
            if (region) {
                region.value = '';
            }
            if (type) {
                type.value = '';
            }
            if (year) {
                year.value = '';
            }
            applyFilter();
        });
    }

    applyFilter();
});
