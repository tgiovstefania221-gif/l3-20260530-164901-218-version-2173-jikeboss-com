(function () {
  function mount(config) {
    var video = document.getElementById(config.elementId);
    if (!video) {
      return;
    }
    var frame = document.querySelector('[data-player-frame="' + config.elementId + '"]');
    var button = document.querySelector('[data-player-button="' + config.elementId + '"]');
    var started = false;
    var hls = null;

    function begin() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (frame) {
        frame.classList.add("is-playing");
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(config.src);
        hls.attachMedia(video);
      } else {
        video.src = config.src;
      }
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        begin();
      });
    }

    if (frame) {
      frame.addEventListener("click", function (event) {
        if (event.target === video || event.target.closest("button")) {
          return;
        }
        begin();
      });
    }

    video.addEventListener("click", function () {
      if (!started) {
        begin();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.StaticPlayer = {
    mount: mount
  };
})();
