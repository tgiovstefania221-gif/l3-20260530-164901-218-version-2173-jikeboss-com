document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-video-url]')).forEach(function (box) {
        var video = box.querySelector('video');
        var trigger = box.querySelector('.play-trigger');
        var url = box.getAttribute('data-video-url');
        var ready = false;

        function prepare() {
            if (ready || !video || !url) {
                return;
            }

            ready = true;

            if (window.Hls && Hls.isSupported()) {
                var hls = new Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        if (trigger) {
            trigger.addEventListener('click', function () {
                prepare();
                box.classList.add('is-playing');
                video.play().catch(function () {});
            });
        }

        if (video) {
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0) {
                    box.classList.remove('is-playing');
                }
            });
        }
    });
});
