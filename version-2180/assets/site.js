(function () {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-movie-search]'));
    searchInputs.forEach(function (input) {
        var scopeSelector = input.getAttribute('data-scope') || 'body';
        var scope = document.querySelector(scopeSelector) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('hidden-card', value && text.indexOf(value) === -1);
            });
        });
    });
})();
