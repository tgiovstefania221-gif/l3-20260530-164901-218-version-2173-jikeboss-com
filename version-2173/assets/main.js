
(function(){
  const slides = [...document.querySelectorAll('[data-hero-slide]')];
  const dots = [...document.querySelectorAll('[data-slide-dot]')];
  if (slides.length > 1) {
    let i = 0;
    const go = (n) => {
      slides[i].classList.remove('active');
      if (dots[i]) dots[i].classList.remove('active');
      i = n;
      slides[i].classList.add('active');
      if (dots[i]) dots[i].classList.add('active');
    };
    dots.forEach((dot, idx) => dot.addEventListener('click', () => go(idx)));
    setInterval(() => go((i + 1) % slides.length), 5000);
  }

  const input = document.querySelector('[data-filter-input]');
  const root = document.querySelector('[data-filter-root]');
  const sort = document.querySelector('[data-sort-select]');
  if (input && root) {
    const items = [...root.querySelectorAll('[data-filter-item]')];
    const apply = () => {
      const q = (input.value || '').trim().toLowerCase();
      const mode = sort ? sort.value : 'hot';
      const vis = items.filter(el => {
        const text = (el.dataset.keywords || el.textContent || '').toLowerCase();
        const ok = !q || text.includes(q);
        el.style.display = ok ? '' : 'none';
        return ok;
      });
      vis.sort((a,b) => {
        const ay = +a.dataset.year || 0, by = +b.dataset.year || 0;
        const ah = +a.dataset.hot || 0, bh = +b.dataset.hot || 0;
        const at = (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        if (mode === 'year') return by - ay || at;
        if (mode === 'title') return at;
        return bh - ah || by - ay || at;
      });
      vis.forEach(el => root.appendChild(el));
      const count = document.querySelector('[data-filter-count]');
      if (count) count.textContent = String(vis.length);
    };
    input.addEventListener('input', apply);
    if (sort) sort.addEventListener('change', apply);
    apply();
  }

  const tabBtns = [...document.querySelectorAll('[data-tab-btn]')];
  const panels = [...document.querySelectorAll('[data-tab-panel]')];
  if (tabBtns.length && panels.length) {
    const activate = (name) => {
      tabBtns.forEach(btn => btn.classList.toggle('active-pill', btn.dataset.tabBtn === name));
      panels.forEach(p => p.classList.toggle('active', p.dataset.tabPanel === name));
    };
    tabBtns.forEach(btn => btn.addEventListener('click', () => activate(btn.dataset.tabBtn)));
    activate(tabBtns[0].dataset.tabBtn);
  }

  const video = document.querySelector('video[data-hls-src]');
  if (video) {
    const hlsSrc = video.dataset.hlsSrc;
    const mp4Src = video.dataset.mp4Src;
    if (window.Hls && Hls.isSupported() && hlsSrc) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(hlsSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal && mp4Src) video.src = mp4Src;
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && hlsSrc) {
      video.src = hlsSrc;
    } else if (mp4Src) {
      video.src = mp4Src;
    }
  }

  const io = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) img.src = img.dataset.src;
        io.unobserve(img);
      }
    });
  }) : null;
  document.querySelectorAll('img[data-src]').forEach(img => io && io.observe(img));
})();
