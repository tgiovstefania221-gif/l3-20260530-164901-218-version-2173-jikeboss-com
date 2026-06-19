(function () {
    window.initMoviePlayer = function (videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video || !sourceUrl) {
            return;
        }

        var shell = video.closest('.video-player');
        var overlay = shell ? shell.querySelector('.player-overlay') : null;
        var started = false;
        var hls = null;

        function attachSource() {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }

            video.src = sourceUrl;
        }

        function playMovie() {
            if (!started) {
                started = true;
                attachSource();
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', playMovie);
        }

        video.addEventListener('click', function () {
            if (!started) {
                playMovie();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
