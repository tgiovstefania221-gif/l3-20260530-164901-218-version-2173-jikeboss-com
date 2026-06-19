
(function () {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function normalize(text) {
    return (text || '').toLowerCase().trim();
  }

  function readParams() {
    return new URLSearchParams(window.location.search);
  }

  function setNavState() {
    const nav = qs('[data-site-nav]');
    const toggle = qs('[data-menu-toggle]');
    if (!nav || !toggle) return;
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const search = qs('.nav-search');
      if (search) search.classList.toggle('open');
    });
  }

  function setHeroCarousel() {
    const wrap = qs('[data-hero-carousel]');
    if (!wrap) return;
    const slides = qsa('.hero-slide', wrap);
    const dotsWrap = qs('[data-hero-dots]', wrap);
    const prevBtn = qs('[data-hero-prev]', wrap);
    const nextBtn = qs('[data-hero-next]', wrap);
    if (!slides.length) return;

    const dots = slides.map((_, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `切换到第 ${idx + 1} 张`);
      btn.addEventListener('click', () => show(idx));
      dotsWrap && dotsWrap.appendChild(btn);
      return btn;
    });

    let active = 0;
    let timer = null;

    function show(idx) {
      active = (idx + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    }

    function run() {
      clearInterval(timer);
      timer = setInterval(() => show(active + 1), 6000);
    }

    prevBtn && prevBtn.addEventListener('click', () => { show(active - 1); run(); });
    nextBtn && nextBtn.addEventListener('click', () => { show(active + 1); run(); });
    wrap.addEventListener('mouseenter', () => clearInterval(timer));
    wrap.addEventListener('mouseleave', run);
    show(0);
    run();
  }

  function populateSelect(select, values) {
    if (!select) return;
    values.forEach((value) => {
      if (!value) return;
      if (select.querySelector(`option[value="${CSS.escape(value)}"]`)) return;
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function filterCards(root) {
    const searchInput = qs('[data-filter-search]', root);
    const regionSelect = qs('[data-filter-region]', root);
    const yearSelect = qs('[data-filter-year]', root);
    const cards = qsa('.movie-card', root);
    if (!cards.length) return;

    const regions = [...new Set(cards.map(card => card.dataset.region).filter(Boolean))].sort();
    const years = [...new Set(cards.map(card => card.dataset.year).filter(Boolean))].sort().reverse();
    populateSelect(regionSelect, regions);
    populateSelect(yearSelect, years);

    function apply() {
      const q = normalize(searchInput?.value);
      const region = regionSelect?.value || '';
      const year = yearSelect?.value || '';
      let visible = 0;
      cards.forEach(card => {
        const hay = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        const ok = (!q || hay.includes(q))
          && (!region || card.dataset.region === region)
          && (!year || card.dataset.year === year);
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });
      const summary = qs('[data-filter-summary]', root);
      if (summary) summary.textContent = `已显示 ${visible} 部影片`;
    }

    searchInput && searchInput.addEventListener('input', apply);
    regionSelect && regionSelect.addEventListener('change', apply);
    yearSelect && yearSelect.addEventListener('change', apply);
    apply();
  }

  function renderSearchPage() {
    const root = qs('[data-search-page]');
    if (!root || !window.MOVIES_DATA) return;
    const input = qs('[data-search-input]', root);
    const regionSelect = qs('[data-search-region]', root);
    const typeSelect = qs('[data-search-type]', root);
    const yearSelect = qs('[data-search-year]', root);
    const results = qs('[data-search-results]', root);
    const summary = qs('[data-search-summary]', root);
    if (!results) return;

    const params = readParams();
    const initialQuery = params.get('q') || '';
    if (input) input.value = initialQuery;

    const regions = [...new Set(window.MOVIES_DATA.map(x => x.region).filter(Boolean))].sort();
    const types = [...new Set(window.MOVIES_DATA.map(x => x.type).filter(Boolean))].sort();
    const years = [...new Set(window.MOVIES_DATA.map(x => x.year).filter(Boolean))].sort().reverse();
    populateSelect(regionSelect, regions);
    populateSelect(typeSelect, types);
    populateSelect(yearSelect, years);

    function cardHtml(item) {
      return `
        <a class="movie-card" href="movie/movie-${String(item.serial).padStart(4, '0')}.html"
           data-title="${item.title}" data-genre="${item.genre}" data-region="${item.region}"
           data-type="${item.type}" data-year="${item.year}" data-tags="${(item.tags || []).join(' ')}">
          <div class="poster" style="--tone-a:${item.toneA};--tone-b:${item.toneB};--tone-c:${item.toneC};">
            <div class="poster-topline">
              <span class="poster-badge">${item.year}</span>
              <span class="poster-badge ghost">${item.region}</span>
            </div>
            <div class="poster-center">
              <div class="poster-type">${item.type}</div>
              <div class="poster-title">${item.title}</div>
              <div class="poster-sub">${item.genre}</div>
            </div>
            <div class="poster-bottomline">${item.category || '精选'}</div>
          </div>
          <div class="card-body">
            <div class="card-meta"><span>${item.year}</span><span>${item.region}</span><span>${item.type}</span></div>
            <h3>${item.title}</h3>
            <p>${item.one_line}</p>
            <div class="tag-row">${(item.tags || []).slice(0, 3).map(t => `<span class="tag">${t}</span>`).join('')}</div>
          </div>
        </a>`;
    }

    function apply() {
      const q = normalize(input?.value);
      const region = regionSelect?.value || '';
      const type = typeSelect?.value || '';
      const year = yearSelect?.value || '';
      const filtered = window.MOVIES_DATA.filter(item => {
        const hay = normalize([
          item.title, item.region, item.type, item.genre, item.one_line,
          item.summary, item.review, (item.tags || []).join(' ')
        ].join(' '));
        return (!q || hay.includes(q)) && (!region || item.region === region) && (!type || item.type === type) && (!year || item.year === year);
      });
      if (summary) summary.textContent = `检索到 ${filtered.length} 部影片`;
      results.innerHTML = filtered.slice(0, 120).map(cardHtml).join('') || '<div class="muted">暂无匹配结果，请尝试其他关键词。</div>';
    }

    input && input.addEventListener('input', () => {
      const url = new URL(window.location.href);
      if (input.value.trim()) url.searchParams.set('q', input.value.trim());
      else url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
      apply();
    });
    [regionSelect, typeSelect, yearSelect].forEach(el => el && el.addEventListener('change', apply));
    apply();
  }

  function initBackToTop() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '↑';
    btn.className = 'btn';
    btn.style.position = 'fixed';
    btn.style.right = '18px';
    btn.style.bottom = '18px';
    btn.style.width = '48px';
    btn.style.height = '48px';
    btn.style.borderRadius = '50%';
    btn.style.zIndex = '90';
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    btn.style.boxShadow = 'var(--shadow)';
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(btn);
    window.addEventListener('scroll', () => {
      const visible = window.scrollY > 700;
      btn.style.opacity = visible ? '1' : '0';
      btn.style.pointerEvents = visible ? 'auto' : 'none';
    }, { passive: true });
  }

  function syncCards(rootSelector) {
    const root = qs(rootSelector);
    if (root) filterCards(root);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setNavState();
    setHeroCarousel();
    renderSearchPage();
    syncCards('[data-filter-root]');
    initBackToTop();
  });
})();
