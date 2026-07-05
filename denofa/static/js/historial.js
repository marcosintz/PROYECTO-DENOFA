// denofa/static/js/historial.js
import { formatDate } from './utils.js';

const VERDICT_PILL_MAP = {
  'CONFIABLE':               'verdict-pill--reliable',
  'DUDOSO':                  'verdict-pill--dubious',
  'PROBABLE DESINFORMACIÓN': 'verdict-pill--disinfo',
};

const SVG_CLOCK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const SVG_DOC   = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

function loadHistory() {
  const el = document.getElementById('analyses-data');
  if (el) {
    try {
      return JSON.parse(el.textContent);
    } catch (e) {
      console.error('Error parsing analyses data:', e);
    }
  }
  return [];
}

function renderCard(item) {
  let reliable = 0, dubious = 0, disinfo = 0;
  if (item.snippets && item.snippets.length > 0) {
    item.snippets.forEach(frag => {
      if (frag.status === 'reliable') reliable++;
      else if (frag.status === 'dubious') dubious++;
      else if (frag.status === 'disinfo') disinfo++;
    });
  }

  const total = reliable + dubious + disinfo;
  let reliablePct = 0, dubiousPct = 0, disinfoPct = 0;
  if (total > 0) {
    reliablePct = Math.round((reliable / total) * 100);
    dubiousPct  = Math.round((dubious  / total) * 100);
    disinfoPct  = Math.round((disinfo  / total) * 100);
  }

  // Etiqueta de tipo de entrada
  const INPUT_LABEL = { text: 'Consulta manual', url: 'Enlace web', image: 'Captura de pantalla' };
  const inputLabel = INPUT_LABEL[item.input_type] || 'Consulta manual';

  // Config según veredicto
  const VERDICT_CFG = {
    reliable: { icon: '✓', word: 'Confiable',       borderColor: 'var(--color-reliable)' },
    dubious:  { icon: '?', word: 'Dudoso',           borderColor: 'var(--color-dubious)'  },
    disinfo:  { icon: '✕', word: 'Desinformación',   borderColor: 'var(--color-disinfo)'  },
  };
  const cfg = VERDICT_CFG[item.verdict] || VERDICT_CFG.reliable;

  return `
    <li>
      <div data-href="/detalle/${item.id}/"
         class="history-card"
         role="button"
         tabindex="0"
         aria-label="Ver detalle del análisis"
         style="border-left: 4px solid ${cfg.borderColor};">

        <div class="hc-grid">

          <!-- COL 1: identidad -->
          <div class="hc-col hc-col--info">
            <div class="hc-meta-row">
              <span class="hc-verdict-pill hc-verdict-pill--${item.verdict}">
                <span class="hc-verdict-pill__icon">${cfg.icon}</span>
                ${item.verdictLabel}
              </span>
              <span class="hc-time-label">
                ${SVG_CLOCK}
                ${formatDate(item.timestamp)}
              </span>
            </div>
            <p class="hc-excerpt-text">${item.excerpt}</p>
            <span class="hc-input-type">${inputLabel}</span>
          </div>

          <!-- COL 2: resultado -->
          <div class="hc-col hc-col--result">
            <span class="hc-result-header">Resultado del análisis</span>
            <div class="hc-score-block">
              <span class="hc-score-pct hc-score-pct--${item.verdict}">${item.score}%</span>
              <span class="hc-score-word hc-score-word--${item.verdict}">${cfg.word}</span>
            </div>
            <div class="hc-bar hc-bar--thick">
              ${reliablePct > 0 ? `<div class="hc-bar__seg hc-bar__seg--reliable" style="width:${reliablePct}%" title="${reliablePct}% confiable"></div>` : ''}
              ${dubiousPct  > 0 ? `<div class="hc-bar__seg hc-bar__seg--dubious"  style="width:${dubiousPct}%"  title="${dubiousPct}% dudoso"></div>`   : ''}
              ${disinfoPct  > 0 ? `<div class="hc-bar__seg hc-bar__seg--disinfo"  style="width:${disinfoPct}%"  title="${disinfoPct}% falso"></div>`    : ''}
              ${total === 0     ? `<div class="hc-bar__seg hc-bar__seg--empty"    style="width:100%"></div>`                                           : ''}
            </div>
            <div class="hc-pct-row">
              <div class="hc-pct-item">
                <span class="hc-pct-num hc-pct-num--reliable">${reliablePct}%</span>
                <span class="hc-pct-lbl">Confiable</span>
              </div>
              <div class="hc-pct-item">
                <span class="hc-pct-num hc-pct-num--dubious">${dubiousPct}%</span>
                <span class="hc-pct-lbl">Dudoso</span>
              </div>
              <div class="hc-pct-item">
                <span class="hc-pct-num hc-pct-num--disinfo">${disinfoPct}%</span>
                <span class="hc-pct-lbl">Falso</span>
              </div>
            </div>
          </div>

          <!-- COL 3: fragmentos + CTA -->
          <div class="hc-col hc-col--frags">
            <div class="hc-frags-hd">
              <span class="hc-frags-title">Fragmentos analizados</span>
              <span class="hc-frags-total">${SVG_DOC} ${total} fragmentos</span>
            </div>
            <div class="hc-frags-list">
              <div class="hc-frag-row">
                <span class="hc-frag-icon hc-frag-icon--reliable">✓</span>
                <span class="hc-frag-lbl">Confiables</span>
                <span class="hc-frag-badge hc-frag-badge--reliable">${reliable}</span>
              </div>
              <div class="hc-frag-row">
                <span class="hc-frag-icon hc-frag-icon--dubious">?</span>
                <span class="hc-frag-lbl">Sospechosos</span>
                <span class="hc-frag-badge hc-frag-badge--dubious">${dubious}</span>
              </div>
              <div class="hc-frag-row">
                <span class="hc-frag-icon hc-frag-icon--disinfo">✕</span>
                <span class="hc-frag-lbl">Falsos</span>
                <span class="hc-frag-badge hc-frag-badge--disinfo">${disinfo}</span>
              </div>
            </div>
            <a href="/detalle/${item.id}/"
               class="btn btn--primary hc-cta"
               aria-label="Ver análisis completo"
               onclick="event.stopPropagation()">
              Ver análisis completo →
            </a>
          </div>

        </div>
      </div>
    </li>
  `;
}

function renderHistory(items) {
  const container = document.getElementById('history-list');
  const emptyState = document.getElementById('empty-state');
  if (!container) return;

  if (items.length === 0) {
    if (emptyState) emptyState.style.display = 'list-item';
    Array.from(container.children).forEach(child => {
      if (child.id !== 'empty-state') child.remove();
    });
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const cardsHtml = items.map(item => {
    let verdictClassModifier = 'reliable';
    if (VERDICT_PILL_MAP[item.verdict]) {
      verdictClassModifier = VERDICT_PILL_MAP[item.verdict].replace('verdict-pill--', '');
    }
    const adaptedItem = {
      ...item,
      verdict: verdictClassModifier,
      verdictLabel: item.verdict,
      timestamp: item.date
    };
    return renderCard(adaptedItem);
  }).join('');

  container.innerHTML = (emptyState ? emptyState.outerHTML : '') + cardsHtml;

  const newEmptyState = document.getElementById('empty-state');
  if (newEmptyState) newEmptyState.style.display = 'none';

  const detailLinks = container.querySelectorAll('.history-card');
  detailLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Obtener el ID desde el data-href
      const href = link.getAttribute('data-href');
      if (!href) return;
      const parts = href.split('/');
      const id = parts[parts.length - 2];
      if (id) {
        sessionStorage.setItem('currentAnalysisId', id);
        sessionStorage.setItem('returnUrl', window.location.pathname);
        window.location.href = `/detalle/${id}/`;
      }
    });
  });
}

function initClearButton() {
  const btn = document.getElementById('btn-clear');
  if (!btn) return;

  const modal = document.getElementById('modal-confirm-clear');
  const btnCancel = document.getElementById('modal-cancel');
  const btnConfirm = document.getElementById('modal-confirm');

  if (!modal || !btnCancel || !btnConfirm) return;

  btn.addEventListener('click', () => {
    modal.style.display = 'flex';
  });

  btnCancel.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  btnConfirm.addEventListener('click', () => {
    modal.style.display = 'none';

    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1] || '';

    fetch('/historial/limpiar/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrfToken
      }
    })
    .then(res => {
      if (res.ok) {
        renderHistory([]);
      } else {
        alert('Error al limpiar el historial de la sesión');
      }
    })
    .catch(err => {
      console.error('Error:', err);
      alert('Error al conectar con el servidor.');
    });
  });
}

// ── Filtros combinados (client-side) ─────────────────────────────────────────
function initFilters(allItems) {
  const searchInput  = document.getElementById('historial-search');
  const verdictSel   = document.getElementById('filter-verdict');
  const dateSel      = document.getElementById('filter-date');

  function datePassFilter(item, range) {
    if (!range) return true;
    const itemDate = new Date(item.date);
    if (isNaN(itemDate)) return true;
    const diffMs   = Date.now() - itemDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (range === '1d')  return diffDays <= 1;
    if (range === '7d')  return diffDays <= 7;
    if (range === '30d') return diffDays <= 30;
    return true;
  }

  function apply() {
    const q = searchInput?.value.trim().toLowerCase() || '';
    const v = verdictSel?.value  || '';
    const d = dateSel?.value     || '';

    const filtered = allItems.filter(item => {
      const matchQ = !q ||
        (item.excerpt || '').toLowerCase().includes(q) ||
        (item.verdict || '').toLowerCase().includes(q);
      const matchV = !v || item.verdict === v;
      const matchD = datePassFilter(item, d);
      return matchQ && matchV && matchD;
    });
    renderHistory(filtered);
  }

  searchInput?.addEventListener('input', apply);
  verdictSel?.addEventListener('change', apply);
  dateSel?.addEventListener('change', apply);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('history-list')) {
    const items = loadHistory();
    renderHistory(items);
    initClearButton();
    initFilters(items);
  }
});
