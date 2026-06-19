
import Hls from './hls-vendor.js';

const HLS_FALLBACK = 'https://customer-7t103rn8rocxo5v6.cloudflarestream.com/1116997bf50b78f22bbfaced8975a021/manifest/video.m3u8';

function setup(video) {
  const shell = video.closest('.player-shell');
  const overlay = shell?.querySelector('.player-overlay');
  const src = video.dataset.hlsSrc || HLS_FALLBACK;
  let hls = null;

  const playAndReveal = () => {
    shell?.classList.add('is-playing');
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };

  if (overlay) overlay.addEventListener('click', playAndReveal);
  video.addEventListener('click', playAndReveal);
  video.addEventListener('play', () => shell?.classList.add('is-playing'));
  video.addEventListener('pause', () => shell?.classList.remove('is-playing'));
  video.addEventListener('loadedmetadata', () => shell?.classList.add('is-ready'));

  if (Hls && Hls.isSupported()) {
    hls = new Hls({
      lowLatencyMode: true,
      enableWorker: true,
      maxBufferLength: 30,
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      shell?.classList.add('is-ready');
    });
    hls.on(Hls.Events.ERROR, (_event, data) => {
      console.warn('HLS error:', data);
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = src;
  } else {
    video.src = src;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('video[data-hls-src]').forEach(setup);
});
