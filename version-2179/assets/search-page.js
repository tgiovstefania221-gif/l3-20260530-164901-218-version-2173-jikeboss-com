
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function normalize(v) { return (v || '').toLowerCase().trim(); }
function populate(select, values) {
  if (!select) return;
  values.forEach(v => {
    if (!v) return;
    if (select.querySelector(`option[value="${CSS.escape(v)}"]`)) return;
    const option = document.createElement('option');
    option.value = v;
    option.textContent = v;
    select.appendChild(option);
  });
}
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

const root = qs('[data-search-page]');
if (root && window.MOVIES_DATA) {
  const input = qs('[data-search-input]', root);
  const regionSelect = qs('[data-search-region]', root);
  const typeSelect = qs('[data-search-type]', root);
  const yearSelect = qs('[data-search-year]', root);
  const results = qs('[data-search-results]', root);
  const summary = qs('[data-search-summary]', root);

  const regions = [...new Set(window.MOVIES_DATA.map(x => x.region).filter(Boolean))].sort();
  const types = [...new Set(window.MOVIES_DATA.map(x => x.type).filter(Boolean))].sort();
  const years = [...new Set(window.MOVIES_DATA.map(x => x.year).filter(Boolean))].sort().reverse();
  populate(regionSelect, regions);
  populate(typeSelect, types);
  populate(yearSelect, years);

  const params = new URLSearchParams(window.location.search);
  if (params.get('q')) input.value = params.get('q');

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
    results.innerHTML = filtered.slice(0, 120).map(cardHtml).join('') || '<div class="muted">暂无匹配结果。</div>';
  }
  input && input.addEventListener('input', apply);
  [regionSelect, typeSelect, yearSelect].forEach(el => el && el.addEventListener('change', apply));
  apply();
}
