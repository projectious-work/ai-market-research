const data = JSON.parse(document.getElementById('market-data').textContent);

// Reference model / jurisdiction / workload selection used to be tab-local
// state in one document. Each Signal Room section is now its own page, so
// the selection is persisted across navigations: the URL query string wins
// (shareable, reproducible links), falling back to localStorage, falling
// back to the built-in defaults.
const SR_STORAGE_KEY = 'signal-room-controls';
function readStoredControls() {
  try { return JSON.parse(localStorage.getItem(SR_STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function writeStoredControls(next) {
  try { localStorage.setItem(SR_STORAGE_KEY, JSON.stringify(next)); } catch {}
}
function persistControls() {
  writeStoredControls({ ref: currentRef, jurisdiction: currentJurisdiction, workload: currentWorkload });
  const params = new URLSearchParams(location.search);
  params.set('ref', currentRef);
  params.set('jurisdiction', currentJurisdiction);
  params.set('workload', currentWorkload);
  history.replaceState(null, '', `${location.pathname}?${params.toString()}${location.hash}`);
}

const urlParams = new URLSearchParams(location.search);
const storedControls = readStoredControls();
let currentRef = urlParams.get('ref') || storedControls.ref || data.meta.reference_default;
let currentJurisdiction = urlParams.get('jurisdiction') || storedControls.jurisdiction || 'all';
let currentWorkload = urlParams.get('workload') || storedControls.workload || data.quota_burn_matrix.default_workload || 'mixed';

// Cache-aware burn helpers
function workloadHitRate() {
  const preset = data.quota_burn_matrix.workload_presets?.[currentWorkload];
  return preset ? preset.cache_hit_rate : 0;
}

// Effective burn factor for a given cache_discount and current workload hit rate.
// Returns multiplier applied to raw burn: (1-hit) × 1 + hit × discount.
// For cold (hit=0): always 1.0. For warm with Anthropic (hit=0.7, disc=0.1): 0.37×.
// For warm with DeepSeek (hit=0.7, disc=0.0083): 0.306× — barely paying for cache hits.
function cacheBurnFactor(modelId) {
  const model = data.models.find(m => m.id === modelId);
  if (!model || typeof model.cache_discount !== 'number') return 1.0;
  const hit = workloadHitRate();
  return (1 - hit) * 1.0 + hit * model.cache_discount;
}

// ---------- INIT ----------
function init() {
  const generatedAt = document.getElementById('generated-at');
  if (generatedAt) {
    generatedAt.textContent =
      `AS OF ${new Date(data.meta.generated_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}`;
  }

  // Reference model selector. May be absent on a page that doesn't render
  // the controls bar (none currently, but kept defensive).
  const refSel = document.getElementById('ref-model');
  if (refSel) {
    data.models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      if (m.id === currentRef) opt.selected = true;
      refSel.appendChild(opt);
    });
    // A stale ref (old localStorage/URL value after a roster change) matches
    // no option; fall back to the default so the variable and the visible
    // selection never disagree.
    if (!data.models.some(m => m.id === currentRef)) {
      currentRef = data.meta.reference_default;
      refSel.value = currentRef;
    }
    refSel.addEventListener('change', e => { currentRef = e.target.value; persistControls(); renderAll(); });
  }

  const jurisdictionSel = document.getElementById('filter-jurisdiction');
  if (jurisdictionSel) {
    jurisdictionSel.value = currentJurisdiction;
    jurisdictionSel.addEventListener('change', e => {
      currentJurisdiction = e.target.value; persistControls(); renderAll();
    });
  }

  // Workload preset selector
  const workloadSel = document.getElementById('filter-workload');
  if (workloadSel) {
    workloadSel.value = currentWorkload;
    workloadSel.addEventListener('change', e => {
      currentWorkload = e.target.value; persistControls(); renderAll();
    });
  }

  // Tabs — only present in the monolithic single-file build (dist/dashboard.html);
  // querySelectorAll returns an empty list on a split Signal Room page, so this
  // is a no-op there.
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).scrollIntoView({behavior:'smooth',block:'start'});
    });
  });

  // Filter bars
  document.querySelectorAll('[data-model-filter]').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('[data-model-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderModels(btn.dataset.modelFilter);
    });
  });
  document.querySelectorAll('[data-hw-filter]').forEach(btn => {
    btn.addEventListener('click', e => {
      document.querySelectorAll('[data-hw-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderSelfHosting(btn.dataset.hwFilter);
    });
  });

  renderAll();
}

function renderAll() {
  renderDashboard();
  renderCurrentRoster();
  renderModels(document.querySelector('[data-model-filter].active')?.dataset.modelFilter || 'current');
  renderBurnMatrix();
  renderSubs();
  renderPolicy();
  renderHarnesses();
  renderSelfHosting(document.querySelector('[data-hw-filter].active')?.dataset.hwFilter || 'all');
  renderHardware();
  renderHostingPrices();
  renderFrameworks();
  renderStrategy();
  renderCapabilityRadar();
  renderSources();
  // Fill section-source strips after section bodies are populated.
  document.querySelectorAll('[data-section-sources]').forEach(el => {
    el.innerHTML = sectionSources(el.dataset.sectionSources);
  });
  renderModelAnalytics();
  renderDecisionMatrix();
  enhanceLargeTables();
}

// ---------- CITATION HELPERS ----------
// data.sources = [{n, category, title, url}]
// data.provider_sources = {"Anthropic": [1, 2], ...}
// data.section_sources = {"models": [...], "harnesses": [...], ...}
function cite(...nums) {
  const flat = nums.flat().filter(n => n != null);
  if (!flat.length) return '';
  const seen = new Set();
  const unique = flat.filter(n => !seen.has(n) && seen.add(n));
  const inner = unique.map(n =>
    `<a href="#src-${n}" title="Source ${n}">${n}</a>`).join(',');
  return `<sup class="cite">${inner}</sup>`;
}
function provCite(provider) {
  const map = (data.provider_sources || {});
  return cite(map[provider] || []);
}
function sectionSources(sectionKey) {
  const map = (data.section_sources || {});
  const nums = map[sectionKey] || [];
  if (!nums.length) return '';
  return `<div class="section-sources">Sources: ${cite(nums)}</div>`;
}

// ---------- HELPERS ----------
function getRefModel() { return data.models.find(m => m.id === currentRef); }
function qualityPct(model) {
  return referenceQualityPct(model);
}
function localQualityPct(localModel) {
  return referenceQualityPct(localModel);
}
function jurisdictionMatch(j) {
  if (currentJurisdiction === 'all') return true;
  if (currentJurisdiction === 'not-China') return j !== 'China';
  return j === currentJurisdiction;
}
function qbar(pct) {
  if (pct === null || pct === undefined) return '<span class="sublabel" title="No overlapping quality evidence with the selected reference">Insufficient comparable evidence</span>';
  const cls = pct > 100 ? 'qbar-fill over' : 'qbar-fill';
  const w = Math.min(pct, 120);
  return `<div class="qbar"><div class="qbar-track"><div class="${cls}" style="width:${w}%"></div></div><div class="qbar-num">${pct}%</div></div>`;
}
function pill(provider) {
  const slug = provider.toLowerCase().replace(/[^a-z]/g, '');
  return `<span class="pill pill-${slug}">${provider}</span>`;
}
function fmtPrice(n) { return n === null || n === undefined ? '—' : '$' + n.toFixed(2); }
function dash(v) { return v === null || v === undefined ? '<span style="color:var(--text-faint);">—</span>' : v; }
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function inlineExecutiveMarkup(value) {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}
function executiveBullets(value) {
  const points = Array.isArray(value) ? value : String(value || '').split(/(?:\n+|(?<=[.!?])\s+(?=[A-Z0-9]))/);
  return `<ul class="executive-points">${points.filter(Boolean).map(p => `<li>${inlineExecutiveMarkup(p)}</li>`).join('')}</ul>`;
}
function statMiniTrend(history) {
  if (!Array.isArray(history) || history.length < 2) return '';
  const values=history.map(point=>Number(point.value));
  if(values.some(value=>!Number.isFinite(value)))return '';
  const w=220,h=34,p=2,min=Math.min(...values),max=Math.max(...values),range=max-min||1;
  const x=index=>p+index*(w-p*2)/Math.max(1,values.length-1);
  const y=value=>h-p-(value-min)*(h-p*2)/range;
  const points=values.map((value,index)=>`${x(index).toFixed(1)},${y(value).toFixed(1)}`).join(' ');
  const first=new Date(history[0].date||history[0].month);
  const last=new Date(history[history.length-1].date||history[history.length-1].month);
  const label=date=>Number.isNaN(date.getTime())?'':date.toLocaleDateString('en-GB',{month:'short',year:'2-digit'});
  return `<div class="stat-mini-trend"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polygon class="area" points="${p},${h-p} ${points} ${w-p},${h-p}"/><polyline class="line" points="${points}"/></svg><div class="stat-mini-timeline"><span>${label(first)}</span><span>${label(last)}</span></div></div>`;
}

function statStackedTrend(config) {
  const history=config?.history||[],series=config?.series||[];
  if(history.length<2||series.length<2)return '';
  const totals=history.map(point=>series.reduce((sum,item)=>sum+(Number(point[item.key])||0),0));
  const w=220,h=44,p=2,max=Math.max(1,...totals);
  const x=index=>p+index*(w-p*2)/Math.max(1,history.length-1);
  const y=value=>h-p-value*(h-p*2)/max;
  let cumulative=history.map(()=>0);
  const layers=series.map(item=>{
    const lower=cumulative.slice();
    const upper=history.map((point,index)=>lower[index]+(Number(point[item.key])||0));
    cumulative=upper;
    const polygon=upper.map((value,index)=>`${x(index).toFixed(1)},${y(value).toFixed(1)}`)
      .concat(lower.map((value,index)=>`${x(index).toFixed(1)},${y(value).toFixed(1)}`).reverse()).join(' ');
    return `<polygon points="${polygon}" fill="${escapeHtml(item.color)}" fill-opacity=".72" stroke="${escapeHtml(item.color)}" stroke-width="1"><title>${escapeHtml(item.label)}</title></polygon>`;
  }).join('');
  const first=new Date(history[0].date),last=new Date(history[history.length-1].date);
  const label=date=>date.toLocaleDateString('en-GB',{month:'short',year:'2-digit'});
  const latest=history[history.length-1];
  const legend=series.map(item=>`<span><i style="background:${escapeHtml(item.color)}"></i>${escapeHtml(item.label)} ${Number(latest[item.key])||0}</span>`).join('');
  const aria=series.map(item=>`${item.label} ${Number(latest[item.key])||0}`).join(', ');
  return `<div class="stat-mini-trend" title="${escapeHtml(config.note||'')}"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Stacked roster history; latest total ${totals[totals.length-1]}: ${escapeHtml(aria)}">${layers}</svg><div class="stat-mini-timeline"><span>${label(first)}</span><span>${label(last)}</span></div><div class="stat-stack-legend">${legend}</div></div>`;
}

function isOpenWeightModel(model) {
  return /mit|apache|open[- ]weight|open model/i.test(model?.license||'');
}
function bestOpenWeightModel() {
  return data.models.filter(isOpenWeightModel)
    .map(model=>({model,anchor:fableQualityAnchor(model)}))
    .filter(item=>Number.isFinite(item.anchor))
    .sort((a,b)=>b.anchor-a.anchor)[0]?.model||null;
}
function dynamicHeadlineStat(stat) {
  if(stat.id!=='best_open_pct')return stat;
  const ref=getRefModel(),best=bestOpenWeightModel();
  const bestAnchor=fableQualityAnchor(best),refAnchor=fableQualityAnchor(ref);
  const value=Number.isFinite(bestAnchor)&&Number.isFinite(refAnchor)&&refAnchor>0
    ? Math.round(bestAnchor/refAnchor*1000)/10 : null;
  return {...stat,
    label:`Best open-weight vs ${ref?.name||'selected reference'}`,
    value:value===null?'—':value,
    delta:value===null?'Insufficient comparable evidence for the selected reference':`${best.name}; rebased from the documented Fable-anchored comparison`,
    delta_dir:value===null?'neutral':stat.delta_dir,
  };
}
function referenceRelativeSignal(signal) {
  if(signal.id!=='open_weight_quality')return signal;
  const ref=getRefModel(),refAnchor=fableQualityAnchor(ref),best=bestOpenWeightModel();
  if(!Number.isFinite(refAnchor)||refAnchor<=0)return {...signal,
    label:`Open-weight quality vs ${ref?.name||'selected reference'}`,
    explanation:'No comparable quality anchor is available for the selected reference.',
    history:[],current:null,
  };
  const rebase=value=>Math.round(Number(value)*1000/refAnchor)/10;
  return {...signal,
    label:`Open-weight quality vs ${ref.name}`,
    explanation:`Best open-weight model relative to ${ref.name}. The stored Fable-anchored series is rebased when the reference changes; ${best?.name||'the current leader'} supplies the latest point.`,
    current:rebase(signal.current),
    history:(signal.history||[]).map(point=>({...point,value:rebase(point.value)})),
  };
}

// ---------- DASHBOARD ----------
function renderDashboard() {
  const grid = document.getElementById('dash-grid');
  if (!grid) return;
  grid.innerHTML = '';

  // Headline
  const headline = document.createElement('div');
  headline.className = 'dash-headline';
  const ref = getRefModel();
  headline.innerHTML = `
    <h2>Where the market stands · ${new Date(data.meta.generated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</h2>
    <p>Reference model: <strong>${ref ? ref.name : '—'}</strong>. Profile: ${data.meta.user_profile || 'market-wide engineering research'}.</p>
  `;
  grid.appendChild(headline);

  // Stat tiles
  const signals=Object.fromEntries((data.report_metrics?.market_signals||[]).map(referenceRelativeSignal).map(signal=>[signal.id,signal]));
  data.headline_stats.forEach(rawStat => {
    const s=dynamicHeadlineStat(rawStat);
    const tile = document.createElement('div');
    tile.className = 'stat-tile';
    const trend=s.trend||(s.signal_id&&signals[s.signal_id]?.history)||null;
    tile.innerHTML = `
      <div class="label">${s.label}</div>
      <div class="value">${s.value}<span class="unit">${s.unit || ''}</span></div>
      <div class="delta ${s.delta_dir}">${s.delta || ''}</div>
      ${s.stacked_trend?statStackedTrend(s.stacked_trend):statMiniTrend(trend)}
    `;
    grid.appendChild(tile);
  });

  // Trend sparklines
  const trendSect = document.createElement('div');
  trendSect.className = 'dash-section full';
  trendSect.innerHTML = `<h3>Market signals</h3><p>Each panel shows the full recorded history. The latest value is shown at right; change is measured from the first observation, so direction and time window are explicit.</p><div class="signal-grid" id="spark-row"></div>`;
  grid.appendChild(trendSect);

  const metricSignals = (data.report_metrics?.market_signals || []).map(referenceRelativeSignal);
  const signalTrends = metricSignals.length
    ? Object.fromEntries(metricSignals.map(signal => [signal.id, {
        label: signal.label,
        unit: signal.unit,
        description: signal.explanation,
        history: signal.history,
        history_note: signal.history_note,
      }]))
    : Object.assign({}, data.trends || {});
  if (!Object.keys(signalTrends).some(k => /speed|throughput/i.test(k + ' ' + (signalTrends[k].label || '')))) {
    const speedModels = data.models.filter(m => Number.isFinite(Number(m.tok_per_sec)) && m.released).sort((a,b)=>String(a.released).localeCompare(String(b.released)));
    if (speedModels.length) signalTrends.output_speed = {label:'Frontier output speed',unit:'tok/s',description:'Fastest measured output throughput among models available by each release point; higher is better.',history:speedModels.slice(-8).map(m=>({month:m.released,value:Number(m.tok_per_sec)}))};
  }
  Object.entries(signalTrends).forEach(([key, t]) => {
    const card = document.createElement('div');
    card.className = 'signal-card';
    if(!Array.isArray(t.history)||!t.history.length){
      card.innerHTML=`<header><h4>${escapeHtml(t.label)}</h4><span class="signal-value">—</span></header><p>${escapeHtml(t.description||'Insufficient comparable evidence for the selected reference.')}</p>`;
      document.getElementById('spark-row').appendChild(card);
      return;
    }
    const last = t.history[t.history.length - 1].value;
    const first = t.history[0].value;
    const change = last - first;
    const firstLabel = t.history[0]?.month || t.history[0]?.date || 'first';
    const lastLabel = t.history[t.history.length - 1]?.month || t.history[t.history.length - 1]?.date || 'latest';
    card.innerHTML = `<header><h4>${t.label}</h4><span class="signal-value">${last}${t.unit ? ' '+t.unit : ''}</span></header>
      <p>${t.description || t.explanation || signalExplanation(key,t.label)} <strong>${change >= 0 ? '+' : ''}${change.toFixed(1)}</strong> from ${firstLabel} to ${lastLabel}.${t.history_note ? ` <em>${escapeHtml(t.history_note)}</em>` : ''}</p>
      ${trendChart(t.history, t.unit || '')}`;
    document.getElementById('spark-row') ? document.getElementById('spark-row').appendChild(card) : trendSect.querySelector('.spark-row').appendChild(card);
  });

  // Action items
  const ac = document.createElement('div');
  ac.className = 'dash-section full';
  ac.innerHTML = `<h3>Executive action agenda</h3><p>Generic next-phase actions for leaders steering an AI transformation portfolio.</p><ul class="action-list">` +
    data.actions.map(actionItemMarkup).join('') + `</ul>`;
  grid.appendChild(ac);
}

function actionItemMarkup(value) {
  const match = String(value).match(/^(P\d)\s*·\s*(.+)$/);
  if (!match) return `<li><span>${escapeHtml(value)}</span></li>`;
  return `<li><span class="action-priority">${escapeHtml(match[1])}</span><span>${escapeHtml(match[2])}</span></li>`;
}

function signalExplanation(key, label) {
  const name=(key+' '+label).toLowerCase();
  if(/open.*opus|quality.*gap/.test(name)) return 'Percentage-point benchmark gap between the strongest open-weight model and the selected frontier reference; closer to zero means the open frontier is catching up.';
  if(/price|cost/.test(name)) return 'Median output price per million tokens across current frontier models; lower values indicate cheaper production inference.';
  if(/release|models.*month/.test(name)) return 'Count of notable model releases recorded in each month; this measures market cadence, not the total model inventory.';
  if(/speed|throughput|tok/.test(name)) return 'Fastest measured output throughput among models available at each observation; tokens per second is an operational latency proxy and higher is better.';
  return `Recorded movement in ${String(label).toLowerCase()}; values use the unit shown beside the latest observation.`;
}

function trendChart(history, unit) {
  if (!Array.isArray(history) || !history.length) return '<p>No history recorded.</p>';
  const parsed=history.map((point,index)=>{const date=new Date(point.date||point.month);return {...point,index,date}}).filter(point=>!Number.isNaN(point.date.getTime()));
  if(!parsed.length)return '<p>No dated history recorded.</p>';
  const years=[...new Set(parsed.map(point=>point.date.getUTCFullYear()))].sort();
  const w=Math.max(520,years.length*520),h=160,l=38,r=14,t=10,b=45, vals=parsed.map(d=>Number(d.value)).filter(Number.isFinite);
  if (!vals.length) return '<p>No numeric history recorded.</p>';
  const min=Math.min(...vals),max=Math.max(...vals),range=max-min||1;
  const slots=years.length*12;
  const slot=point=>years.indexOf(point.date.getUTCFullYear())*12+point.date.getUTCMonth();
  const xSlot=value=>l+value*(w-l-r)/Math.max(1,slots-1), y=v=>t+(max-v)*(h-t-b)/range;
  const pts=parsed.map(point=>`${xSlot(slot(point))},${y(Number(point.value))}`).join(' ');
  const area=`${l},${h-b} ${pts} ${xSlot(slot(parsed[parsed.length-1]))},${h-b}`;
  const monthLabels=years.map((year,yearIndex)=>Array.from({length:12},(_,month)=>`<text x="${xSlot(yearIndex*12+month)}" y="${h-b+16}" text-anchor="middle">${month+1}</text>`).join('')).join('');
  const yearLabels=years.map((year,index)=>`<text x="${xSlot(index*12+5.5)}" y="${h-5}" text-anchor="middle" font-weight="700">${year}</text>`).join('');
  const separators=years.slice(1).map((_,index)=>`<line class="grid" x1="${xSlot((index+1)*12-.5)}" y1="${t}" x2="${xSlot((index+1)*12-.5)}" y2="${h-b+20}"/>`).join('');
  return `<svg class="trend-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Monthly trend from ${min} to ${max} ${escapeHtml(unit)}"><line class="grid" x1="${l}" y1="${t}" x2="${w-r}" y2="${t}"/><line class="grid" x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}"/>${separators}<text x="${l-4}" y="${t+3}" text-anchor="end">${max}</text><text x="${l-4}" y="${h-b+3}" text-anchor="end">${min}</text><polygon class="area" points="${area}"/><polyline class="line" points="${pts}"/>${parsed.map(point=>`<circle class="dot" cx="${xSlot(slot(point))}" cy="${y(Number(point.value))}" r="3"><title>${escapeHtml(point.date.toISOString().slice(0,10))}: ${point.value}${unit?' '+unit:''}</title></circle>`).join('')}${monthLabels}${yearLabels}</svg>`;
}

function sparkline(history) {
  const w = 220, h = 40, pad = 2;
  const values = history.map(p => p.value);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const lastX = pad + (values.length - 1) * stepX;
  const lastY = h - pad - ((values[values.length - 1] - min) / range) * (h - pad * 2);
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="1.5" stroke-linejoin="round"/>
    <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="2.5" fill="var(--accent)"/>
  </svg>`;
}

// ---------- MODELS ----------
function renderCurrentRoster() {
  const table = document.getElementById('current-roster-table');
  const roster = data.model_roster?.models || [];
  if (!table) return;
  table.tBodies[0].innerHTML = roster.map(model => {
    const source = escapeHtml(model.source || '#');
    const linked = value => `<a href="${source}" target="_blank" rel="noopener">${escapeHtml(value || 'Not published')}</a>`;
    const levels = Array.isArray(model.levels) && model.levels.length
      ? model.levels.join(', ') : 'No configurable levels';
    return `<tr>
      <td class="model-name">${linked(model.name)}<span class="sublabel">${escapeHtml(model.family || model.license || '')}</span></td>
      <td>${linked(model.provider)}</td>
      <td>${escapeHtml(model.scope || 'core')}</td>
      <td>${escapeHtml(model.status || 'unknown')}</td>
      <td>${escapeHtml(model.control || 'fixed')}<span class="sublabel">Default: ${escapeHtml(model.default_level || 'provider default')}</span></td>
      <td>${escapeHtml(levels)}</td>
      <td>${escapeHtml(model.speed_band || 'unknown')}</td>
      <td>${linked(model.speed_note || 'Comparable evidence not published')}</td>
      <td class="mono">${linked(model.price || 'Pricing not published')}</td>
      <td class="mono">${escapeHtml(model.context || 'Not published')}</td>
      <td>${escapeHtml(model.region || 'Global')}</td>
      <td>${linked(model.availability || model.caveat || 'See primary evidence')}</td>
    </tr>`;
  }).join('');
}

function renderModels(filter) {
  const theadEl = document.querySelector('#models-table thead');
  const tbody = document.querySelector('#models-table tbody');
  if (!theadEl || !tbody) return;
  const schema = benchmarkSchema();
  const refName=getRefModel()?.name||'selected reference';
  theadEl.innerHTML = `<tr>
    <th>Model</th><th>Provider</th><th>Quality vs ${escapeHtml(refName)}</th>
    ${schema.map(b=>`<th class="tnum benchmark-col" title="${escapeHtml(b.description||'')}">${benchmarkHeader(b.label,b.max)}</th>`).join('')}
    <th class="tnum">Input<span class="sublabel">$/Mtok</span></th><th class="tnum">Output<span class="sublabel">$/Mtok</span></th><th class="tnum">Cache<span class="sublabel">$/Mtok</span></th><th>Context</th><th class="tnum" title="Fixed end-to-end task-rate index. Fable 5 is always 100; this column is not rebased by the reference selector.">Fixed task-speed index<span class="sublabel">Fable 5 = 100</span></th><th>Released</th>
    <th class="tnum">Speed score<span class="sublabel">0–100</span></th><th class="tnum">Cost efficiency<span class="sublabel">0–100</span></th></tr>`;
  tbody.innerHTML = '';
  let models = data.models.filter(m => jurisdictionMatch(m.jurisdiction));
  if (filter === 'current') models = models.filter(m => m.tier !== 'legacy');
  else if (filter === 'frontier') models = models.filter(m => m.tier === 'frontier');
  else if (filter === 'fast') models = models.filter(m => m.tier === 'fast');
  else if (filter === 'legacy') models = models.filter(m => m.tier === 'legacy' || m.tier === 'frontier' || m.tier === 'fast');
  // 'all' = no filter

  models.forEach(m => {
    const scores = modelScores(m);
    const metrics = reportMetric(m.id);
    const tr = document.createElement('tr');
    tr.dataset.modelId = m.id;
    if (m.tier === 'legacy') tr.style.opacity = '0.55';
    tr.innerHTML = `
      <td class="model-name">${m.name}<span class="sublabel">${m.license} · ${m.jurisdiction}${m.tier === 'legacy' ? ' · legacy' : ''}</span></td>
      <td>${pill(m.provider)}${provCite(m.provider)}</td>
      <td>${qbar(referenceQualityPct(m))}</td>
      ${schema.map(b=>heatMetricCell(benchmarkValue(m,b.key),b.max,'quality','benchmark-col')).join('')}
      <td class="tnum mono">${fmtPrice(metrics?.api_input ?? m.api_in)}</td>
      <td class="tnum mono">${fmtPrice(metrics?.api_output ?? m.api_out)}</td>
      <td class="tnum mono" style="color:var(--text-dim);">${fmtPrice(metrics?.api_cached_input ?? m.api_cache_hit)}</td>
      <td class="mono">${m.context_label}</td>
      ${heatMetricCell(metrics?.task_speed_index, Math.max(1,...(data.report_metrics?.model_metrics||[]).map(metric=>Number(metric.task_speed_index)||0)), 'speed')}
      <td class="mono" style="color:var(--text-dim); font-size:0.75rem;">${m.released}</td>
      ${heatMetricCell(scores.speed,100,'speed')}
      ${heatMetricCell(scores.cost,100,'cost')}
    `;
    tbody.appendChild(tr);
  });
}

function benchmarkSchema() {
  const normalized = data.report_metrics?.benchmarks;
  if (Array.isArray(normalized)) return normalized.map(b=>({
    key:b.id,label:b.label,max:Number(b.max_value)||100,
    description:[b.unit,b.note].filter(Boolean).join(' · ')
  }));
  const configured = data.benchmark_schema || data.benchmarks;
  if (Array.isArray(configured)) return configured.map(b=>({key:b.key||b.id,label:b.label||b.name,max:Number(b.max_value||b.max)||100,description:b.description}));
  return [
    {key:'swe_pro',label:'SWE-Pro',max:100},{key:'swe_verified',label:'SWE-Ver',max:100},
    {key:'livecodebench',label:'LCB',max:100},{key:'aime',label:'AIME',max:100}
  ];
}
function benchmarkHeader(label,max) {
  const words=String(label).replace(/([/-])/g,'$1 ').split(/\s+/).filter(Boolean);
  const lines=[];
  words.forEach(word=>{
    const last=lines[lines.length-1]||'';
    if(last && (last+' '+word).length<=11)lines[lines.length-1]=last+' '+word;
    else lines.push(word);
  });
  return `<span class="benchmark-head">${lines.map(line=>`<span>${escapeHtml(line)}</span>`).join('')}<span class="sublabel">max ${max}</span></span>`;
}
function finiteNumber(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : null;
}
function benchmarkValue(model,key) {
  const metric=reportMetric(model.id);
  const normalized=finiteNumber(metric?.benchmarks?.[key]);
  if(normalized!==null)return normalized;
  const legacy={swe_bench_pro:'swe_pro',swe_bench_verified:'swe_verified',livecodebench:'livecodebench',aime:'aime'};
  return finiteNumber(model[legacy[key]||key]);
}
function reportMetric(modelId) {
  return data.report_metrics?.model_metrics?.find(metric=>metric.model_id===modelId) || null;
}
function modelScoreContext() {
  const current=data.models.filter(m=>m.tier!=='legacy');
  const costs=current.map(m=>reportMetric(m.id)?.blended_price ?? ((Number(m.api_in)||0)+(Number(m.api_out)||0))).filter(v=>v>0);
  return {maxSpeed:Math.max(1,...current.map(m=>Number(reportMetric(m.id)?.task_speed_index ?? m.tok_per_sec)||0)),minCost:costs.length?Math.min(...costs):1};
}
function modelScores(m) {
  const normalized=reportMetric(m.id);
  const ctx=modelScoreContext();
  const quality=referenceQualityPct(m);
  const maxTok=Math.max(1,...data.models.map(model=>Number(model.tok_per_sec)||0));
  const normalizedSpeed=finiteNumber(normalized?.speed_score),throughput=finiteNumber(m.tok_per_sec);
  const speed=normalizedSpeed!==null?normalizedSpeed:(throughput!==null?Math.min(100,Math.sqrt(throughput/maxTok)*100):null);
  const blended=(Number(m.api_in)||0)+(Number(m.api_out)||0);
  const normalizedCost=finiteNumber(normalized?.cost_score);
  const cost=normalizedCost!==null?normalizedCost:(blended>0?Math.min(100,ctx.minCost/blended*100):null);
  return {quality,speed,cost,maxSpeed:ctx.maxSpeed};
}
function fableQualityAnchor(model) {
  if(!model)return null;
  const explicit=finiteNumber(model.quality_vs_fable);
  if(explicit!==null)return explicit;
  const metric=reportMetric(model.id);
  const metricExplicit=finiteNumber(metric?.quality_vs_fable);
  if(metricExplicit!==null)return metricExplicit;
  const fableMetric=reportMetric('fable-5');
  const score=finiteNumber(metric?.quality_score),fableScore=finiteNumber(fableMetric?.quality_score);
  if(score!==null&&fableScore!==null&&fableScore>0)return score/fableScore*100;
  const fable=data.models.find(candidate=>candidate.id==='fable-5');
  const swe=finiteNumber(model.swe_pro),fableSwe=finiteNumber(fable?.swe_pro);
  if(swe!==null&&fableSwe!==null&&fableSwe>0)return swe/fableSwe*100;
  return null;
}
function referenceQualityPct(m) {
  const q=fableQualityAnchor(m),rq=fableQualityAnchor(getRefModel());
  return Number.isFinite(q)&&Number.isFinite(rq)&&rq>0?Math.round(q/rq*100):null;
}
function heatMetricCell(value,max,kind,extraClass='') {
  const n=finiteNumber(value),ratio=n!==null&&max?Math.max(0,Math.min(1,n/max)):0;
  return `<td class="tnum mono metric-cell ${kind==='cost'?'cost':''} ${kind==='speed'?'speed-cell':''} ${extraClass}" style="--heat:${(n===null?0:.06+ratio*.25).toFixed(2)}">${n!==null?(kind==='quality'||kind==='speed'||kind==='cost'?n.toFixed(1):n):'—'}</td>`;
}

function providerColor(provider) {
  const colors={
    Anthropic:'#d46f4c',OpenAI:'#16866f',Google:'#3d78c5',xAI:'#5c6673',Meta:'#3264b8',
    'Moonshot AI':'#d04f63',DeepSeek:'#5475c8','Alibaba Qwen':'#d88a32','Z.ai':'#7b62b3',MiniMax:'#a765b8'
  };
  return colors[provider]||'#8a8f96';
}
function bubbleLabelKey(rows,summary) {
  return `<div class="bubble-key" aria-label="Numbered model key">${rows.map((d,index)=>{
    const color=providerColor(d.m.provider),details=summary(d);
    return `<div class="bubble-key-item" data-bubble-index="${index}" tabindex="0" aria-label="Highlight ${escapeHtml(d.m.name)}: ${escapeHtml(details)}"><span class="bubble-key-index" style="--bubble-color:${color}">${index+1}</span><span><strong>${escapeHtml(d.m.name)}</strong><small>${escapeHtml(details)}</small></span></div>`;
  }).join('')}</div>`;
}
function bindBubbleInteractions(panel) {
  const marks=Array.from(panel.querySelectorAll('.bubble-mark'));
  const items=Array.from(panel.querySelectorAll('.bubble-key-item'));
  const readout=panel.querySelector('.bubble-readout');
  const setActive=index=>{
    panel.classList.add('bubble-active');
    marks.forEach((mark,i)=>mark.classList.toggle('active',i===index));
    items.forEach((item,i)=>item.classList.toggle('active',i===index));
    if(readout)readout.textContent=marks[index]?.dataset.label||'';
  };
  const clear=()=>{
    panel.classList.remove('bubble-active');
    marks.forEach(mark=>mark.classList.remove('active'));
    items.forEach(item=>item.classList.remove('active'));
    if(readout)readout.textContent='Hover or focus a bubble or key entry to isolate it.';
  };
  [...marks,...items].forEach(element=>{
    const index=Number(element.dataset.bubbleIndex);
    element.addEventListener('mouseenter',()=>setActive(index));
    element.addEventListener('focus',()=>setActive(index));
    element.addEventListener('mouseleave',clear);
    element.addEventListener('blur',clear);
  });
}

function renderModelAnalytics() {
  const host=document.getElementById('model-analytics'); if(!host)return;
  const refName=getRefModel()?.name||'selected reference';
  const candidates=data.models.filter(m=>m.tier!=='legacy'&&jurisdictionMatch(m.jurisdiction)).map(m=>({m,...modelScores(m)}));
  const rows=candidates.filter(r=>[r.quality,r.speed,r.cost].every(Number.isFinite));
  const incomplete=candidates.filter(r=>![r.quality,r.speed,r.cost].every(Number.isFinite));
  if(!rows.length){host.innerHTML='';return;}
  const w=1050,h=570,l=95,r=35,t=35,b=78;
  const x=v=>l+v*(w-l-r)/100, y=v=>h-b-v*(h-t-b)/100;
  const points=rows.map((d,index)=>({id:index,name:d.m.name,cx:x(d.speed),cy:y(d.cost),radius:5+Math.sqrt(Math.max(10,Math.min(125,d.quality))/125)*15}));
  const bubbles=rows.map((d,index)=>{const point=points[index],color=providerColor(d.m.provider),description=`${d.m.name}: speed score ${d.speed.toFixed(1)}, cost efficiency ${d.cost.toFixed(1)}, quality versus reference ${d.quality.toFixed(0)}%`;return `<g class="bubble-mark" data-bubble-index="${index}" data-label="${escapeHtml(description)}" tabindex="0" role="img" aria-label="${escapeHtml(description)}"><circle class="bubble-circle" cx="${point.cx}" cy="${point.cy}" r="${point.radius}" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="1.5"><title>${escapeHtml(description)}</title></circle><text class="bubble-index" x="${point.cx}" y="${point.cy+3}" text-anchor="middle">${index+1}</text></g>`}).join('');
  const grid=[0,25,50,75,100].map(v=>`<line class="grid" x1="${x(v)}" y1="${t}" x2="${x(v)}" y2="${h-b}"/><line class="grid" x1="${l}" y1="${y(v)}" x2="${w-r}" y2="${y(v)}"/><text x="${x(v)}" y="${h-b+18}" text-anchor="middle">${v}</text><text x="${l-8}" y="${y(v)+3}" text-anchor="end">${v}</text>`).join('');
  const key=bubbleLabelKey(rows,d=>`Speed ${d.speed.toFixed(1)} · cost ${d.cost.toFixed(1)} · quality ${d.quality.toFixed(0)}%`);
  const pending=incomplete.length?`<div class="bubble-key" aria-label="Models without complete comparable chart evidence"><div class="bubble-key-item"><span class="bubble-key-index" style="--bubble-color:var(--text-faint)">○</span><span><strong>Incomplete comparable evidence</strong><small>Not assigned a synthetic chart position</small></span></div>${incomplete.map(d=>`<div class="bubble-key-item"><span class="bubble-key-index" style="--bubble-color:${providerColor(d.m.provider)}">○</span><span><strong>${escapeHtml(d.m.name)}</strong><small>${['quality','speed','cost'].filter(k=>!Number.isFinite(d[k])).join(', ')} unknown</small></span></div>`).join('')}</div>`:'';
  const bubble=`<div class="analytics-panel"><h3>Speed × cost efficiency</h3><p>Right and up is better. Bubble area encodes quality vs ${escapeHtml(refName)}; provider color distinguishes the major labs. Models lacking comparable axes remain listed below instead of receiving invented zero scores.</p><div class="bubble-readout" aria-live="polite">Hover or focus a bubble or key entry to isolate it.</div><svg class="analytics-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Bubble chart comparing speed, cost efficiency and quality versus ${escapeHtml(refName)}">${grid}<line class="axis" x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}"/><line class="axis" x1="${l}" y1="${t}" x2="${l}" y2="${h-b}"/>${bubbles}<text x="${(l+w-r)/2}" y="${h-18}" text-anchor="middle">SPEED SCORE →</text><text transform="translate(22 ${(t+h-b)/2}) rotate(-90)" text-anchor="middle">COST EFFICIENCY →</text></svg>${key}${pending}</div>`;
  const cells=rows.sort((a,b)=>b.quality-a.quality).map(d=>`<div class="model">${escapeHtml(d.m.name)}</div>${['quality','speed','cost'].map(k=>`<div style="background:rgba(${k==='cost'?'224,82,50':'76,150,122'},${.08+d[k]/100*.32})">${d[k].toFixed(1)}</div>`).join('')}`).join('');
  host.innerHTML=bubble+`<div class="analytics-panel"><h3>Quality, speed and cost heat map</h3><p>Rows are ordered by quality vs ${escapeHtml(refName)}. No synthetic overall compound is applied.</p><div class="heatmap-grid"><div class="head">Model</div><div class="head">Quality vs ${escapeHtml(refName)}</div><div class="head">Speed</div><div class="head">Cost</div>${cells}</div></div>`;
  bindBubbleInteractions(host.querySelector('.analytics-panel'));
}

function burnBarClass(v) {
  if (v === null || v === undefined) return '';
  if (v < 0.5) return 'bm-burn-low';
  if (v < 1.5) return 'bm-burn-mid';
  if (v < 3.0) return 'bm-burn-high';
  return 'bm-burn-xhigh';
}

function qualBarClass(q) {
  if (q === null || q === undefined) return '';
  if (q < 70) return 'bm-qual-poor';
  if (q < 85) return 'bm-qual-mid';
  if (q < 95) return 'bm-qual-good';
  return 'bm-qual-best';
}

function fmtBurn(v) {
  if (v === null || v === undefined) return '<span class="nodata">—</span>';
  if (v < 0.1) return v.toFixed(3) + '×';
  if (v < 1) return v.toFixed(2) + '×';
  if (v < 10) return v.toFixed(2) + '×';
  return v.toFixed(1) + '×';
}

function modelById(id) { return data.models.find(m => m.id === id); }

// Find a model's row in any of the three matrices and return it
function findBurnRow(modelId) {
  const matrix = data.quota_burn_matrix;
  if (!matrix) return null;
  for (const block of [matrix.openai_matrix, matrix.anthropic_matrix, matrix.google_matrix]) {
    const row = block.find(r => r.model_id === modelId);
    if (row) return row;
  }
  return null;
}

// The absolute burn value (in unit-anchor units) for the reference cell.
// Used as the divisor for every displayed burn ratio in the matrix.
// Reference effort defaults to 'medium'; for models without medium, we fall back
// in this priority order: medium -> high -> low -> any defined value.
// Reference unit is also discounted by the reference model's cache factor,
// so ratios stay relative under the current workload preset.
function referenceBurnUnit() {
  const ref = getRefModel();
  if (!ref) return 1.0;
  const row = findBurnRow(ref.id);
  if (!row) return 1.0;
  const candidates = ['medium', 'high', 'low', 'xhigh', 'max', 'minimal', 'off', 'on-budget'];
  for (const k of candidates) {
    if (row[k] !== null && row[k] !== undefined && typeof row[k] === 'number') {
      return row[k] * cacheBurnFactor(ref.id);
    }
  }
  return 1.0;
}

// Compute the cell quality % for a given model + effort, against the current reference
function cellQuality(modelId, effort) {
  const model = modelById(modelId);
  const ref = getRefModel();
  if (!model || !ref) return null;
  if (model.id === ref.id) return 100;
  const base = referenceQualityPct(model);
  if (!Number.isFinite(base)) return null;
  const factors = data.quota_burn_matrix.effort_quality_factors || {};
  const factor = factors[effort] !== undefined ? factors[effort] : 1.0;
  const medium = factors.medium || 1.0;
  return Math.round(base * factor / medium);
}

// Build the inner content of a single matrix cell using E2 encoding.
// `absoluteBurn` is the stored value (in unit-anchor units, gpt-5.5 medium = 1.00).
// We multiply by cacheBurnFactor (workload-dependent) then divide by referenceBurnUnit().
function renderBmCell(absoluteBurn, modelId, effort, opts) {
  opts = opts || {};
  if (absoluteBurn === null || absoluteBurn === undefined) {
    return `<td style="text-align:center; color:var(--text-faint);">—</td>`;
  }
  const refUnit = referenceBurnUnit();
  const cacheFactor = cacheBurnFactor(modelId);
  const burn = (absoluteBurn * cacheFactor) / refUnit;
  const quality = cellQuality(modelId, effort);
  // Burn bar: linear scale, clamped at 3.0× (anything above saturates)
  const burnPct = Math.min(burn / 3.0, 1.0) * 100;
  const qualPct = quality === null ? 0 : Math.min(quality, 100);
  const baselineFlag = (modelId === getRefModel()?.id && (effort === 'medium' || (effort === 'high' && !findBurnRow(modelId)?.medium))) ? 'baseline-cell-flag' : '';
  const noteAttr = opts.note ? ` title="${opts.note.replace(/"/g, '&quot;')}"` : '';
  return `<td class="bm-cell ${baselineFlag}"${noteAttr} data-model-id="${modelId}" data-effort="${effort}">
    <div class="bm-cell-numbers">
      <span class="burn-num">${fmtBurn(burn)}</span>
      <span class="qual-num">${quality === null ? '—' : quality + '%'}</span>
    </div>
    <div class="bm-bar-track"><div class="bm-bar-fill ${burnBarClass(burn)}" style="width:${burnPct.toFixed(0)}%;"></div></div>
    <div class="bm-bar-track"><div class="bm-bar-fill ${qualBarClass(quality)}" style="width:${qualPct.toFixed(0)}%;"></div></div>
  </td>`;
}

function renderBurnMatrix() {
  const matrix = data.quota_burn_matrix;
  if (!matrix) return;
  const c = document.getElementById('burn-matrix-container');
  if (!c) return;
  const ref = getRefModel();

  const workload = data.quota_burn_matrix.workload_presets?.[currentWorkload];
  const workloadLabel = workload ? workload.label : currentWorkload;
  const workloadNote = workload ? workload.description : '';
  const baselineLine = `<p style="margin-bottom:0.75rem; font-size:0.85rem; color:var(--text-dim);"><strong style="color:var(--accent);">Baseline:</strong> ${ref ? ref.name : 'reference'} at medium effort = 1.00× burn under <strong>${workloadLabel}</strong>. <span style="color:var(--text-faint);">Quality % computed against ${ref ? ref.name : 'reference'}. Switch reference or workload above to recompute.</span></p>
  <p style="margin-bottom:0.75rem; font-size:0.78rem; color:var(--text-faint); font-style:italic; font-family:var(--serif);">${workloadNote}</p>`;

  // Legend
  const legendBlock = `
    <div style="display:flex; gap:1.25rem; margin-bottom:1rem; padding:0.6rem 0.85rem; background:var(--bg-elev); border:1px dashed var(--border); font-size:0.7rem; color:var(--text-dim); flex-wrap:wrap;">
      <span><strong style="color:var(--text); font-family:var(--mono); letter-spacing:0.06em; text-transform:uppercase; font-size:0.62rem; margin-right:0.4rem;">Cell layout:</strong> top number = burn, right number = quality, top bar = burn (scale 0–3×), bottom bar = quality (0–100%)</span>
    </div>
    <div style="display:flex; gap:0.5rem; margin-bottom:1rem; flex-wrap:wrap; font-size:0.68rem; color:var(--text-dim);">
      <span style="margin-right:0.5rem;"><strong style="color:var(--text); font-family:var(--mono); letter-spacing:0.06em; text-transform:uppercase; font-size:0.6rem;">Burn:</strong></span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#4ade80; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>&lt;0.5×</span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#fbbf24; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>0.5–1.5×</span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#c04424; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>1.5–3×</span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#ef4444; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>&gt;3×</span>
      <span style="margin-left:1rem;"><strong style="color:var(--text); font-family:var(--mono); letter-spacing:0.06em; text-transform:uppercase; font-size:0.6rem;">Quality:</strong></span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#ef4444; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>&lt;70%</span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#fbbf24; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>70–85%</span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#84cc16; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>85–95%</span>
      <span><span style="display:inline-block; width:10px; height:10px; background:#22c55e; border-radius:1px; vertical-align:-1px; margin-right:3px;"></span>≥95%</span>
    </div>
  `;

  // OpenAI block
  const oaiCols = ['minimal', 'low', 'medium', 'high', 'xhigh'];
  let oaiRows = matrix.openai_matrix.map(row => {
    const m = modelById(row.model_id);
    const isLegacy = m?.tier === 'legacy';
    const cells = oaiCols.map(eff => renderBmCell(row[eff], row.model_id, eff, { note: row.note })).join('');
    const noteCell = row.note ? `<td class="burn-cell-note" style="text-align:left;">${row.note}</td>` : '<td></td>';
    return `<tr class="${isLegacy ? 'legacy-row' : ''} ${m?.id === getRefModel()?.id ? 'ref-row' : ''}" data-model-id="${row.model_id}"><td class="bm-model-cell">${m?.name || row.model_id}</td>${cells}${noteCell}</tr>`;
  }).join('');

  const oaiBlock = `
    <div class="burn-matrix-block">
      <h4>OpenAI · effort levels (Codex /effort)</h4>
      <div class="sub-note">Baseline cell outlined. Reasoning tokens count as output. Multipliers from community benchmarks (±20%).</div>
      <table class="burn-matrix-table">
        <thead><tr>
          <th>Model</th>
          <th>minimal</th><th>low</th><th>medium</th><th>high</th><th>xhigh</th>
          <th style="text-align:left;">Note</th>
        </tr></thead>
        <tbody>${oaiRows}</tbody>
      </table>
    </div>
  `;

  // Anthropic block
  const anthCols = ['low', 'medium', 'high', 'xhigh', 'max'];
  let anthRows = matrix.anthropic_matrix.map(row => {
    const m = modelById(row.model_id);
    const cells = anthCols.map(eff => renderBmCell(row[eff], row.model_id, eff, { note: row.note })).join('');
    const noteCell = row.note ? `<td class="burn-cell-note" style="text-align:left;">${row.note}</td>` : '<td></td>';
    return `<tr class="${m?.id === getRefModel()?.id ? 'ref-row' : ''}" data-model-id="${row.model_id}"><td class="bm-model-cell">${m?.name || row.model_id}</td>${cells}${noteCell}</tr>`;
  }).join('');

  const anthBlock = `
    <div class="burn-matrix-block">
      <h4>Anthropic · effort levels (Claude Code /effort)</h4>
      <div class="sub-note">Adaptive thinking via /effort. Same vocabulary as OpenAI plus a 'max' tier on top. Opus 4.7 default is xhigh; Sonnet 4.6 default is high. Haiku has no effort control (fixed-rate).</div>
      <table class="burn-matrix-table">
        <thead><tr>
          <th>Model</th>
          <th>low</th><th>medium</th><th>high</th><th>xhigh</th><th>max</th>
          <th style="text-align:left;">Note</th>
        </tr></thead>
        <tbody>${anthRows}</tbody>
      </table>
    </div>
  `;

  // Google block
  const gglCols = ['off', 'low', 'medium', 'high'];
  let gglRows = matrix.google_matrix.map(row => {
    const m = modelById(row.model_id);
    const cells = gglCols.map(eff => renderBmCell(row[eff], row.model_id, eff)).join('');
    return `<tr class="${m?.id === getRefModel()?.id ? 'ref-row' : ''}" data-model-id="${row.model_id}"><td class="bm-model-cell">${m?.name || row.model_id}</td>${cells}</tr>`;
  }).join('');

  const gglBlock = `
    <div class="burn-matrix-block">
      <h4>Google · thinking budget tiers</h4>
      <div class="sub-note">Gemini uses a thinking budget set by the developer. Tiers are approximate mappings.</div>
      <table class="burn-matrix-table">
        <thead><tr>
          <th>Model</th>
          <th>off</th><th>low budget</th><th>medium budget</th><th>high budget</th>
        </tr></thead>
        <tbody>${gglRows}</tbody>
      </table>
    </div>
  `;

  // Stacking multipliers
  const chips = matrix.stacking_multipliers.map(s =>
    `<span class="chip">${s.name}: <strong style="color:var(--text); font-family:var(--mono); font-size:0.75rem; text-transform:none; letter-spacing:0; margin:0;">×${typeof s.multiplier === 'number' ? s.multiplier.toFixed(1) : s.multiplier}</strong></span>`
  ).join('');
  const stackBlock = `<div class="burn-stack-chips"><strong>Stacking:</strong>${chips}</div>`;

  // Non-reasoning note
  const flatBlock = `
    <div class="burn-matrix-block" style="margin-top:1rem;">
      <h4>No effort control · fixed burn per model</h4>
      <div class="sub-note">${matrix.non_reasoning_note}</div>
    </div>
  `;

  // Methodology note
  const methodology = `<p style="margin-top:1rem; font-size:0.75rem; color:var(--text-faint); font-style:italic; font-family:var(--serif);">${matrix.methodology}</p>`;
  const qualMethodology = matrix.quality_methodology ? `<p style="margin-top:0.4rem; font-size:0.75rem; color:var(--text-faint); font-style:italic; font-family:var(--serif);">${matrix.quality_methodology}</p>` : '';

  // Efficiency leaders panel
  const efficiencyBlock = `
    <div class="eff-leaders" id="eff-leaders-panel">
      <h4>Efficiency leaders · top 10 across all models × efforts</h4>
      <div class="sub-note">Lowest burn-per-quality-point. Filter by minimum quality to surface combinations that meet your floor.</div>
      <div class="eff-controls">
        <span>Min quality:</span>
        <select id="eff-min-quality">
          <option value="0">No floor</option>
          <option value="70">≥ 70%</option>
          <option value="80" selected>≥ 80%</option>
          <option value="90">≥ 90%</option>
          <option value="95">≥ 95%</option>
          <option value="100">≥ 100%</option>
        </select>
        <span style="margin-left:0.75rem;">Provider:</span>
        <select id="eff-provider-filter">
          <option value="all" selected>All</option>
          <option value="OpenAI">OpenAI only</option>
          <option value="Anthropic">Anthropic only</option>
          <option value="Google">Google only</option>
        </select>
        <span style="margin-left:0.75rem;">Include legacy:</span>
        <select id="eff-legacy">
          <option value="no" selected>No</option>
          <option value="yes">Yes</option>
        </select>
      </div>
      <div id="eff-leaders-table"></div>
    </div>
  `;

  c.innerHTML = baselineLine + legendBlock + oaiBlock + anthBlock + gglBlock + stackBlock + flatBlock + methodology + qualMethodology + efficiencyBlock + bmTooltipEl();

  // Wire up the efficiency leaders controls
  document.getElementById('eff-min-quality').addEventListener('change', renderEfficiencyLeaders);
  document.getElementById('eff-provider-filter').addEventListener('change', renderEfficiencyLeaders);
  document.getElementById('eff-legacy').addEventListener('change', renderEfficiencyLeaders);
  renderEfficiencyLeaders();
  wireBurnVariantPicker();
  applyBurnVariant();
}


let currentBurnVariant = 'default'; // 'default' | 'A' | 'B' | 'C'

function burnVariantPicker() {
  return `<div class="bm-variant-picker">
    <strong>PROTOTYPE</strong> · capability view (effort-adjusted):
    <button data-bm-variant="default">Default</button>
    <button data-bm-variant="A">A · Per-cell mini-radar</button>
    <button data-bm-variant="B">B · Per-cell efficiency badge</button>
    <button data-bm-variant="C">C · Hover radar tooltip</button>
    <button data-bm-variant="D">D · Per-row effort envelope</button>
  </div>`;
}

function renderCapabilityLegend() {
  // Renders the "How to read the capability radar" panel for 04 Strategy.
  // Demo radar uses GPT-5.5 Pro (or first non-reference frontier) as
  // primary so the cyan reference overlay is visible.
  const ref = getRefModel();
  if (!ref || !data.capabilities) return '';
  const axes = data.capabilities.axes;
  // Pick a contrasting model as the example primary
  const example = data.models.find(m => m.id !== ref.id && m.tier === 'frontier' && m.capability_levels)
                || data.models.find(m => m.capability_levels && m.id !== ref.id)
                || ref;

  // Per-axis level rubric — all 5 bands for every axis
  const rubricRows = axes.map(a => {
    const labels = (data.capabilities.level_labels || {})[a.key] || {};
    const sens = a.effort_sensitivity != null ? a.effort_sensitivity.toFixed(2) : '?';
    return `<tr>
      <td class="ax-name"><strong>${a.short}</strong><span>${a.label}</span></td>
      ${[1,2,3,4,5].map(b => {
        const range = `${(b-1)*10+1}–${b*10}`;
        return `<td><span class="rng">${range}</span><span class="nm">${labels[String(b)] || '—'}</span></td>`;
      }).join('')}
      <td class="ax-sens" title="effort sensitivity: how much this axis improves with reasoning effort (0 = not at all, 1 = full linear)">${sens}</td>
    </tr>`;
  }).join('');

  return `
    <div class="cap-legend">
      <h3 class="cap-legend-title">How to read the capability radar</h3>
      <div class="cap-legend-grid">
        <div class="cap-legend-figure">
          ${renderMiniRadar(example, 280, { ref, showLabels: true, showSpokes: true, allRings: true, r: 0.34, labelOffset: 22 })}
          <div class="cap-legend-figure-caption">
            <span><span class="swatch swatch-primary"></span>${example.name} <em>(example primary)</em></span>
            <span><span class="swatch swatch-overlay"></span>${ref.name} <em>(reference — dashed cyan, set via top-right dropdown)</em></span>
          </div>
        </div>
        <div class="cap-legend-text">
          <p>Each radar shows 6 capability axes. The rubric runs <strong>1–50</strong> with the named bands below; the <strong style="color:var(--accent);">emphasized amber ring at 50</strong> marks the current rubric frontier. The radar's <strong>outer ring at 60</strong> is the visual cap, and the <strong>51–60 zone</strong> is the <em>effort-boost band</em> — values that fall there are not directly rated, they're derived: a model with a ceiling at 50 pushed above its medium-effort baseline by extra reasoning effort. The <strong style="color:var(--accent);">solid amber polygon</strong> is the primary model at the selected effort; the <strong style="color:var(--accent-cool);">dashed cyan polygon</strong> is the reference (set via the Reference dropdown top-right of the page).</p>
          <p><strong>Effort calculus.</strong> Each axis's rating is the model's capability <em>at medium effort</em>, matching the burn matrix's selected-reference baseline. The radar's <code>radar_effort_factor[medium] = 1.00</code> so primary equals reference at medium for the same model. Lower efforts shrink the polygon by each axis's <code>effort_sensitivity</code>; <strong>higher efforts grow it and may extend the polygon vertex past the outer level-50 ring</strong> — the ring is a rubric marker, not a hard cap, and a polygon outside it means the model is performing above its medium-effort baseline thanks to extra reasoning. Coding / Reasoning / Agentic respond strongly to effort; Knowledge / Multimodal barely.</p>
        </div>
      </div>
      <table class="cap-legend-rubric">
        <thead><tr>
          <th>Axis</th>
          <th>1–10 <span class="sub">level 1</span></th>
          <th>11–20 <span class="sub">level 2</span></th>
          <th>21–30 <span class="sub">level 3</span></th>
          <th>31–40 <span class="sub">level 4</span></th>
          <th>41–50 <span class="sub">level 5 · rubric ceiling</span></th>
          <th title="effort sensitivity">sens.</th>
        </tr></thead>
        <tbody>${rubricRows}</tbody>
        <tfoot><tr>
          <td colspan="7" class="boost-band-row"><strong>51–60 ·</strong> effort-boost band — never rated directly; only reached when extra reasoning pushes a ceiling-rated model above its medium-effort baseline. Vertices in this band are drawn with a red blip (accent-hot) to signal "above-baseline boost".</td>
        </tr></tfoot>
      </table>
    </div>
  `;
}


function bmTooltipEl() {
  return `<div id="bm-radar-tooltip"></div>`;
}

function wireBurnVariantPicker() {
  const c = document.getElementById('burn-matrix-container');
  if (!c) return;
  // Variant C is the always-on default; A/B/D code retained but unwired.
  currentBurnVariant = 'C';
}

function bandIndex(level) {
  if (level == null) return null;
  return Math.max(1, Math.min(5, Math.ceil(level / 10)));
}
function bandName(axisKey, level) {
  const band = bandIndex(level);
  if (band == null) return '';
  return ((data.capabilities.level_labels || {})[axisKey] || {})[String(band)] || '';
}

function effortFactor(effort) {
  const ref = (data.capabilities && data.capabilities.radar_effort_factors) || (data.quota_burn_matrix && data.quota_burn_matrix.effort_quality_factors) || {};
  return ref[effort] != null ? ref[effort] : 1.0;
}

function effectiveLevel(model, axisKey, effort) {
  const ceiling = ((model && model.capability_levels) || {})[axisKey];
  if (ceiling == null) return null;
  if (!effort || effort === 'max') return ceiling;
  const axisDef = (data.capabilities && data.capabilities.axes || []).find(a => a.key === axisKey);
  const sens = (axisDef && axisDef.effort_sensitivity != null) ? axisDef.effort_sensitivity : 0.3;
  const f = effortFactor(effort);
  const eff = ceiling * (1 - sens * (1 - f));
  return Math.max(0, eff);
}

function effectiveLevels(model, effort) {
  if (!model || !model.capability_levels || !data.capabilities) return null;
  const out = {};
  for (const a of data.capabilities.axes) {
    out[a.key] = effectiveLevel(model, a.key, effort);
  }
  return out;
}

function compositeFromLevels(levels, weights) {
  if (!levels || !data.capabilities) return null;
  let num = 0, den = 0;
  for (const a of data.capabilities.axes) {
    const v = levels[a.key];
    if (v == null) continue;
    const w = (weights && weights[a.key] != null) ? weights[a.key] : 1;
    num += w * v;
    den += w * 50;
  }
  return den > 0 ? num / den : null;
}

function renderMiniRadar(model, size, opts) {
  // opts: { effort?, ref?, levels?, refLevels?, showLabels?, showShortLabels?, r?, envelope?, zoomComparison? }
  size = size || 60; opts = opts || {};
  if (!model && !opts.levels) return '';
  if (!data.capabilities) return '';
  const axes = data.capabilities.axes;
  const cx = size / 2, cy = size / 2;
  const r = size * (opts.r || 0.42);
  const RUBRIC_MAX = 50;  // emphasized "current frontier" ring; 51–60 is the effort-boost band
  const startAngle = -Math.PI / 2;

  // Resolve primary + reference level sets
  const primaryLevels = opts.levels
    || (opts.effort ? effectiveLevels(model, opts.effort) : (model && model.capability_levels));
  // Reference is ALWAYS at ceiling (fixed visual anchor across all
  // radars + all efforts + all pages). Effort only scales the primary.
  const refLevels = opts.refLevels
    || (opts.ref ? opts.ref.capability_levels : null);
  const comparisonValues=[...Object.values(primaryLevels||{}),...Object.values(refLevels||{})].map(Number).filter(Number.isFinite);
  const domainMin=opts.zoomComparison&&comparisonValues.length?Math.max(0,Math.floor((Math.min(...comparisonValues)-5)/5)*5):0;
  const max=opts.zoomComparison&&comparisonValues.length?Math.max(domainMin+10,Math.ceil((Math.max(...comparisonValues)+5)/5)*5):60;
  const domainRange=max-domainMin;

  function ptsFromLevels(lvls) {
    if (!lvls) return null;
    return axes.map((a, i) => {
      const v = lvls[a.key];
      if (v == null) return null;
      const t = (v-domainMin) / domainRange;
      const ang = startAngle + (2 * Math.PI * i / axes.length);
      return { x: cx + r * t * Math.cos(ang), y: cy + r * t * Math.sin(ang) };
    });
  }
  const polyStr = (p) => (p || []).filter(q => q).map(q => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');

  // When labels are shown, widen the viewBox so perimeter text isn't clipped.
  // Caller can override via opts.labelPad for tighter packing in small containers.
  const labelPad = opts.labelPad != null ? opts.labelPad : ((opts.showLabels || opts.showShortLabels) ? Math.max(60, size * 0.30) : 0);
  const labelColor = opts.labelColor || '#142438';
  const captionColor = opts.captionColor || '#5c6f82';
  const vbX = -labelPad;
  const vbW = size + labelPad * 2;
  const w = opts.width || (size + labelPad * 2);
  const h = opts.height || size;
  let svg = `<svg viewBox="${vbX} 0 ${vbW} ${h}" xmlns="http://www.w3.org/2000/svg" class="mini-radar-svg" width="${w}" height="${h}" style="overflow:visible;">`;
  // Outer ring (level 5)
  const outerRing = axes.map((_, i) => {
    const ang = startAngle + (2 * Math.PI * i / axes.length);
    return `${(cx + r * Math.cos(ang)).toFixed(1)},${(cy + r * Math.sin(ang)).toFixed(1)}`;
  }).join(' ');
  // Outer ring at visual max (60) — drawn faintest
  svg += `<polygon points="${outerRing}" fill="none" stroke="#adb2ba" stroke-width="0.5" />`;
  // Inner rings at rubric levels. For small radars draw 20 + 40 + 50; for large radars draw all 10/20/30/40/50.
  const ringLevels = opts.zoomComparison
    ? [0.25,0.5,0.75].map(portion=>domainMin+domainRange*portion)
    : (opts.allRings ? [10, 20, 30, 40] : [20, 40]);
  for (const lvl of ringLevels) {
    const rr = r * (lvl-domainMin) / domainRange;
    const ring = axes.map((_, i) => {
      const ang = startAngle + (2 * Math.PI * i / axes.length);
      return `${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`;
    }).join(' ');
    svg += `<polygon points="${ring}" fill="none" stroke="#dadce0" stroke-width="0.3" />`;
  }
  // The 50 ring — emphasized (current rubric frontier)
  if (RUBRIC_MAX >= domainMin && RUBRIC_MAX <= max) {
    const rr = r * (RUBRIC_MAX-domainMin) / domainRange;
    const ring = axes.map((_, i) => {
      const ang = startAngle + (2 * Math.PI * i / axes.length);
      return `${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`;
    }).join(' ');
    svg += `<polygon points="${ring}" fill="none" stroke="#e05232" stroke-width="${size > 100 ? 1.0 : 0.8}" stroke-opacity="0.55" />`;
  }
  // Spokes (for larger / legend radars)
  if (opts.showSpokes) {
    axes.forEach((_, i) => {
      const ang = startAngle + (2 * Math.PI * i / axes.length);
      svg += `<line x1="${cx}" y1="${cy}" x2="${(cx + r * Math.cos(ang)).toFixed(1)}" y2="${(cy + r * Math.sin(ang)).toFixed(1)}" stroke="#dadce0" stroke-width="0.3" />`;
    });
  }

  // Envelope mode: multiple polygons from levelSets[]
  if (opts.envelope && opts.levelSets) {
    opts.levelSets.forEach((entry, idx) => {
      const pts = ptsFromLevels(entry.levels);
      if (!pts) return;
      const fillOp = entry.fillOpacity != null ? entry.fillOpacity : (0.06 + idx * 0.04);
      const strokeOp = entry.strokeOpacity != null ? entry.strokeOpacity : (0.4 + idx * 0.12);
      svg += `<polygon points="${polyStr(pts)}" fill="${entry.color || '#e05232'}" fill-opacity="${fillOp.toFixed(2)}" stroke="${entry.color || '#e05232'}" stroke-width="${entry.strokeWidth || 1}" stroke-opacity="${strokeOp.toFixed(2)}" stroke-linejoin="round" />`;
    });
  } else {
    // Reference overlay (drawn behind primary)
    const refPts = ptsFromLevels(refLevels);
    if (refPts) {
      svg += `<polygon points="${polyStr(refPts)}" fill="#3a5a82" fill-opacity="0.07" stroke="#3a5a82" stroke-width="${size > 100 ? 1.2 : 0.9}" stroke-dasharray="${size > 100 ? '3 3' : '2 2'}" />`;
    }
    // Primary polygon
    const pts = ptsFromLevels(primaryLevels);
    if (pts && polyStr(pts)) {
      svg += `<polygon points="${polyStr(pts)}" fill="#e05232" fill-opacity="${size > 100 ? 0.18 : 0.28}" stroke="#e05232" stroke-width="${size > 100 ? 1.6 : 1.2}" stroke-linejoin="round" />`;
      if (size >= 50) {
        pts.forEach((p, i) => {
          if (!p) return;
          const v = primaryLevels[axes[i].key];
          const boosted = v != null && v > max;
          const rDot = boosted ? (size > 100 ? 3.5 : 2.2) : (size > 100 ? 2.5 : 1.6);
          const fill = boosted ? '#c04424' : '#e05232';
          const stroke = boosted ? '#e05232' : '#ffffff';
          const sw = boosted ? (size > 100 ? 1.3 : 0.9) : (size > 100 ? 1 : 0.6);
          svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rDot}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`;
        });
      }
    }
  }

  // Labels at perimeter (for legend / large radars only)
  if (opts.showLabels || opts.showShortLabels) {
    axes.forEach((a, i) => {
      const ang = startAngle + (2 * Math.PI * i / axes.length);
      const lx = cx + (r + (opts.labelOffset || 16)) * Math.cos(ang);
      const ly = cy + (r + (opts.labelOffset || 16)) * Math.sin(ang);
      let anchor = 'middle';
      if (lx < cx - 3) anchor = 'end';
      else if (lx > cx + 3) anchor = 'start';
      const txt = opts.showLabels ? a.label.toUpperCase() : a.short.toUpperCase();
      const fs = opts.showLabels ? 9 : 8;
      svg += `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="${anchor}" fill="${labelColor}" font-family="IBM Plex Mono, monospace" font-size="${fs}" font-weight="600" letter-spacing="0.08em">${txt}</text>`;
    });
  }

  if(opts.zoomComparison){
    svg += `<text x="${cx}" y="${size-3}" text-anchor="middle" fill="${captionColor}" font-family="IBM Plex Mono, monospace" font-size="8">ZOOMED AXIS ${domainMin}–${max}</text>`;
  }

  svg += '</svg>';
  return svg;
}


function applyBurnVariant() {
  const c = document.getElementById('burn-matrix-container');
  if (!c) return;
  if (currentBurnVariant === 'A') applyBurnVariantA(c);
  else if (currentBurnVariant === 'B') applyBurnVariantB(c);
  else if (currentBurnVariant === 'C') applyBurnVariantC(c);
  else if (currentBurnVariant === 'D') applyBurnVariantD(c);
}

function applyBurnVariantA(container) {
  // Per-CELL mini-radar (effort-adjusted) with reference overlay.
  const ref = getRefModel();
  container.querySelectorAll('.bm-cell[data-model-id]').forEach(td => {
    if (td.querySelector('.bm-cell-radar')) return;
    const m = modelById(td.dataset.modelId);
    if (!m || !m.capability_levels) return;
    const effort = td.dataset.effort;
    const wrap = document.createElement('div');
    wrap.className = 'bm-cell-radar';
    wrap.innerHTML = renderMiniRadar(m, 40, { effort, ref, r: 0.40 });
    td.appendChild(wrap);
  });
}

function applyBurnVariantB(container) {
  // Per-row composite + per-cell efficiency badge (effort-adjusted).
  const weights = focusWeights();
  // Per-row label gets ceiling composite + ceiling sparkline (one-time)
  container.querySelectorAll('tbody tr[data-model-id]').forEach(tr => {
    const modelCell = tr.querySelector('.bm-model-cell');
    const m = modelById(tr.dataset.modelId);
    if (modelCell && m && m.capability_levels && !modelCell.querySelector('.bm-row-spark')) {
      const ceilingComp = compositeFromLevels(m.capability_levels, weights);
      const compSpan = document.createElement('span');
      compSpan.style.cssText = 'display:block; font-family:var(--serif); font-style:italic; font-size:0.85rem; color:var(--accent); margin-top:2px;';
      compSpan.title = 'ceiling composite (model peak)';
      compSpan.textContent = fmtComposite(ceilingComp);
      modelCell.appendChild(compSpan);
      const spark = document.createElement('div');
      spark.className = 'bm-row-spark';
      spark.title = data.capabilities.axes.map(a => `${a.short}=${m.capability_levels[a.key] != null ? m.capability_levels[a.key] : '—'}`).join(' · ');
      spark.innerHTML = data.capabilities.axes.map(a => {
        const v = m.capability_levels[a.key];
        return `<span data-level="${v == null ? 'null' : v}"></span>`;
      }).join('');
      modelCell.appendChild(spark);
    }
  });
  // Per-cell efficiency badge: (quality% × effort-adjusted composite) / burn
  container.querySelectorAll('.bm-cell[data-model-id]').forEach(td => {
    if (td.querySelector('.bm-eff-badge')) return;
    const m = modelById(td.dataset.modelId);
    const effort = td.dataset.effort;
    const burnText = (td.querySelector('.burn-num') || {}).textContent || '';
    const qualText = (td.querySelector('.qual-num') || {}).textContent || '';
    const burn = parseFloat(burnText.replace('×', ''));
    const qual = parseFloat(qualText.replace('%', ''));
    if (!isFinite(burn) || burn <= 0 || !isFinite(qual)) return;
    const effLvls = effectiveLevels(m, effort);
    const comp = compositeFromLevels(effLvls, weights);
    if (comp == null) return;
    const eff = ((qual / 100) * comp) / burn;
    let band = 'poor';
    if (eff >= 0.9) band = 'great';
    else if (eff >= 0.6) band = 'good';
    else if (eff >= 0.35) band = 'ok';
    const badge = document.createElement('span');
    badge.className = 'bm-eff-badge';
    badge.dataset.eff = band;
    badge.title = `efficiency = (quality% × effort-adjusted composite ${fmtComposite(comp)}) / burn ${burnText} = ${eff.toFixed(2)}`;
    badge.textContent = `η ${eff.toFixed(2)}`;
    td.appendChild(badge);
  });
}

function applyBurnVariantC(container) {
  // Hover tooltip — effort-adjusted radar with reference overlay.
  const tip = document.getElementById('bm-radar-tooltip');
  if (!tip) return;
  const weights = focusWeights();
  const ref = getRefModel();
  container.querySelectorAll('.bm-cell[data-model-id]').forEach(td => {
    td.classList.add('has-radar-hover');
    td.addEventListener('mouseenter', () => {
      const m = modelById(td.dataset.modelId);
      const effort = td.dataset.effort;
      if (!m || !m.capability_levels) { tip.classList.remove('visible'); return; }
      const effLvls = effectiveLevels(m, effort);
      const comparisonRefLevels=m.id===ref?.id?effLvls:ref?.capability_levels;
      const comp = compositeFromLevels(effLvls, weights);
      const compCeil = compositeFromLevels(m.capability_levels, weights);
      const axes = data.capabilities.axes;
      const axesClockwise = axes.map(a => a.label).join(' · ');
      tip.innerHTML = `
        <div class="name">${m.name} <span class="effort-tag">@ ${effort}</span></div>
        <div class="composite">${fmtComposite(comp)} <span class="ceil">/ ceiling ${fmtComposite(compCeil)}</span></div>
        <div class="axes-clockwise"><span>Axes (clockwise from top):</span> ${axesClockwise}</div>
        ${renderMiniRadar(m, 230, { effort, ref, refLevels:comparisonRefLevels, showLabels: true, allRings: true, zoomComparison: true, r: 0.31, labelOffset: 14, labelPad: 88, labelColor: '#26364b', captionColor: '#546a82' })}
        <div class="legend-swatch-row">
          <span><span class="sw-primary"></span>this model @ ${effort}</span>
          <span><span class="sw-overlay"></span>${ref ? ref.name : 'reference'} (${m.id===ref?.id?'same-effort baseline':'capability ceiling'})</span>
        </div>
        <table class="axes-tbl">
          <thead><tr><th>axis</th><th>ceil</th><th>@${effort}</th><th>ref</th><th title="effort-adjusted value ÷ reference ceiling">% ref</th></tr></thead>
          <tbody>${axes.map(a => {
            const ceil = m.capability_levels[a.key];
            const adj  = effLvls ? effLvls[a.key] : null;
            const refV = comparisonRefLevels ? comparisonRefLevels[a.key] : null;
            const pct=adj!=null&&refV?adj/refV*100:null;
            return `<tr><td>${a.label}</td><td class="num">${ceil != null ? ceil : '—'}</td><td class="num">${adj != null ? adj.toFixed(1) : '—'}</td><td class="num refnum">${refV != null ? refV : '—'}</td><td class="num pct">${pct!=null?pct.toFixed(0)+'%':'—'}</td></tr>`;
          }).join('')}</tbody>
        </table>
      `;
      tip.classList.add('visible');
    });
    td.addEventListener('mousemove', (e) => {
      const pad = 14;
      let x = e.clientX + pad;
      let y = e.clientY + pad;
      const rect = tip.getBoundingClientRect();
      if (x + rect.width > window.innerWidth) x = e.clientX - rect.width - pad;
      if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - pad;
      tip.style.left = x + 'px';
      tip.style.top  = y + 'px';
    });
    td.addEventListener('mouseleave', () => tip.classList.remove('visible'));
  });
}

function applyBurnVariantD(container) {
  // Per-row effort envelope: one radar per row showing 4-5 polygons,
  // one per effort level, with intensifying opacity (lighter = lower
  // effort, brighter = max effort). Reference shape drawn as backdrop.
  const ref = getRefModel();
  const tables = container.querySelectorAll('.burn-matrix-table');
  // Map each table to its effort columns (in render order)
  const tableEffortCols = new Map();
  tables.forEach(tbl => {
    const ths = Array.from(tbl.querySelectorAll('thead th'))
      .map(th => th.textContent.trim().toLowerCase())
      .slice(1); // skip model col
    // OpenAI: minimal/low/medium/high/xhigh, Anthropic: low/medium/high/xhigh/max, Google: off/low budget/medium budget/high budget
    const effortMap = ths.map(h => {
      if (h === 'off') return null;
      if (h.includes('low')) return 'low';
      if (h.includes('medium')) return 'medium';
      if (h.includes('high')) return 'high';
      if (h.includes('xhigh')) return 'xhigh';
      if (h === 'minimal') return 'minimal';
      if (h === 'max') return 'max';
      return null;
    }).filter(Boolean);
    tableEffortCols.set(tbl, effortMap);
  });

  tables.forEach(tbl => {
    const efforts = tableEffortCols.get(tbl) || [];
    // Header
    const headRow = tbl.querySelector('thead tr');
    if (headRow && !headRow.querySelector('.bm-cap-col')) {
      const th = document.createElement('th');
      th.className = 'bm-cap-col';
      th.textContent = 'ENVELOPE';
      headRow.insertBefore(th, headRow.firstChild);
    }
    tbl.querySelectorAll('tbody tr').forEach(tr => {
      if (tr.querySelector('.bm-cap-cell')) return;
      const m = modelById(tr.dataset.modelId);
      const td = document.createElement('td');
      td.className = 'bm-cap-cell';
      if (!m || !m.capability_levels) {
        td.innerHTML = '<span style="color:var(--text-faint); font-size:0.65rem;">no rating</span>';
      } else {
        // Build levelSets: one per effort, palette from cool to warm
        const palette = ['#3a5a82', '#7490b2', '#f0a48c', '#e05232', '#c04424'];
        const levelSets = efforts.map((eff, idx) => {
          const color = palette[Math.min(idx, palette.length - 1)];
          return {
            levels: effectiveLevels(m, eff),
            color,
            fillOpacity: 0.04,
            strokeOpacity: 0.45 + idx * 0.10,
            strokeWidth: 1,
          };
        }).filter(ls => ls.levels);
        // Reference baseline (medium effort) drawn first as faint backdrop via showLabels=false standard polygon
        const refMediumLvls = ref ? effectiveLevels(ref, 'medium') : null;
        td.innerHTML = `<div class="mini-radar-wrap">${renderMiniRadar(m, 64, { envelope: true, levelSets, refLevels: refMediumLvls, r: 0.40 })}</div>`;
      }
      tr.insertBefore(td, tr.firstChild);
    });
  });
}



function renderEfficiencyLeaders() {
  const matrix = data.quota_burn_matrix;
  if (!matrix) return;
  const tableEl = document.getElementById('eff-leaders-table');
  if (!tableEl) return;

  const minQuality = parseInt(document.getElementById('eff-min-quality').value, 10);
  const providerFilter = document.getElementById('eff-provider-filter').value;
  const includeLegacy = document.getElementById('eff-legacy').value === 'yes';

  const refUnit = referenceBurnUnit();

  // Build a flat list of {modelId, effort, displayedBurn, quality, efficiency, provider, tier}
  const cells = [];
  const sources = [
    { matrix: matrix.openai_matrix, efforts: ['minimal', 'low', 'medium', 'high', 'xhigh'] },
    { matrix: matrix.anthropic_matrix, efforts: ['low', 'medium', 'high', 'xhigh', 'max'] },
    { matrix: matrix.google_matrix, efforts: ['off', 'low', 'medium', 'high'] }
  ];
  sources.forEach(src => {
    src.matrix.forEach(row => {
      const m = modelById(row.model_id);
      if (!m) return;
      src.efforts.forEach(eff => {
        const absoluteBurn = row[eff];
        if (absoluteBurn === null || absoluteBurn === undefined) return;
        const quality = cellQuality(row.model_id, eff);
        if (quality === null) return;
        const cacheFactor = cacheBurnFactor(row.model_id);
        const displayedBurn = (absoluteBurn * cacheFactor) / refUnit;
        cells.push({
          modelId: row.model_id,
          modelName: m.name,
          provider: m.provider,
          tier: m.tier,
          effort: eff,
          burn: displayedBurn,
          quality: quality,
          efficiency: displayedBurn / (quality / 100)
        });
      });
    });
  });

  // Apply filters
  let filtered = cells.filter(c => c.quality >= minQuality);
  if (providerFilter !== 'all') filtered = filtered.filter(c => c.provider === providerFilter);
  if (!includeLegacy) filtered = filtered.filter(c => c.tier !== 'legacy');
  if (currentJurisdiction !== 'all') {
    filtered = filtered.filter(c => {
      const m = modelById(c.modelId);
      return jurisdictionMatch(m.jurisdiction);
    });
  }

  // Sort by efficiency ascending (lower = better)
  filtered.sort((a, b) => a.efficiency - b.efficiency);
  const top = filtered.slice(0, 10);

  if (top.length === 0) {
    tableEl.innerHTML = '<p style="color:var(--text-faint); font-style:italic; padding:1rem 0;">No combinations match the current filters.</p>';
    return;
  }

  const rows = top.map((c, i) => {
    const rank = i + 1;
    const rankClass = rank <= 3 ? 'eff-rank top3' : 'eff-rank';
    const effClass = c.efficiency < 1.0 ? 'eff-score' : (c.efficiency < 2.0 ? 'eff-score mid' : 'eff-score poor');
    return `<tr>
      <td><span class="${rankClass}">${rank}</span></td>
      <td class="eff-model">${c.modelName}</td>
      <td><span class="pill pill-${c.provider.toLowerCase().replace(/[^a-z]/g,'')}">${c.provider}</span></td>
      <td><span class="eff-effort">${c.effort}</span></td>
      <td>${fmtBurn(c.burn)}</td>
      <td>${c.quality}%</td>
      <td><span class="${effClass}">${c.efficiency.toFixed(2)}</span></td>
    </tr>`;
  }).join('');

  const ref = getRefModel();
  const refNote = ref ? `<p style="font-size:0.7rem; color:var(--text-faint); margin-top:0.5rem; font-style:italic; font-family:var(--serif);">Burn shown as × of ${ref.name} medium · efficiency = burn ÷ (quality/100), lower is better</p>` : '';

  tableEl.innerHTML = `
    <table class="eff-table">
      <thead><tr>
        <th style="width:36px;">#</th>
        <th>Model</th>
        <th>Provider</th>
        <th>Effort</th>
        <th>Burn</th>
        <th>Quality</th>
        <th>Burn/Quality</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>${refNote}
  `;
}

function renderSubs() {
  const tbody = document.querySelector('#subs-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.subscriptions.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${pill(s.provider)}${provCite(s.provider)}</td>
        <td class="model-name">${s.tier}</td>
        <td class="tnum mono">${s.price_usd === null ? '—' : '$' + s.price_usd}</td>
        <td>${s.limits}</td>
        <td>${s.models}</td>
        <td style="color:var(--text-dim);">${s.features}</td>
      </tr>
    `;
  });
}

function renderPolicy() {
  const tbody = document.querySelector('#policy-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.agent_policies.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${pill(p.provider)}${provCite(p.provider)}</td>
        <td>${p.subscription_automated}</td>
        <td>${p.enforcement}${p.cite ? cite(p.cite) : ''}</td>
        <td>${p.first_party_exception}</td>
        <td>${p.api_required_for_automation ? '<span style="color:var(--accent-hot);">Yes</span>' : '<span style="color:var(--green);">No</span>'}</td>
      </tr>
    `;
  });
}

// ---------- HARNESSES ----------
function fmtBool(v) {
  if (v === true) return '<span class="feature-yes">●</span>';
  if (v === false) return '<span class="feature-no">○</span>';
  if (v === 'passthrough') return '<span class="feature-partial">↗</span>';
  return '<span style="color:var(--text-faint);">—</span>';
}

function renderHarnesses() {
  const tbody = document.querySelector('#harnesses-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.harnesses.forEach(h => {
    tbody.innerHTML += `
      <tr>
        <td class="model-name" style="text-align:left;">${h.name}${h.cite ? cite(h.cite) : ''}</td>
        <td style="text-align:left;">${h.vendor}</td>
        <td class="mono" style="font-size:0.72rem;">${h.category}</td>
        <td>${fmtBool(h.mcp)}</td>
        <td>${fmtBool(h.skills)}</td>
        <td>${fmtBool(h.hooks)}</td>
        <td>${fmtBool(h.subagents)}</td>
        <td>${fmtBool(h.voice)}</td>
        <td>${fmtBool(h.remote)}</td>
        <td>${fmtBool(h.computer_use)}</td>
        <td>${fmtBool(h.lsp)}</td>
        <td class="mono" style="font-size:0.7rem;">${h.memory}</td>
        <td class="tnum mono">${dash(h.swe_pro)}</td>
        <td class="mono" style="font-size:0.72rem;">${h.pricing}</td>
      </tr>
    `;
  });

  const profilesDiv = document.getElementById('harness-profiles');
  profilesDiv.innerHTML = data.harnesses.map(h => `
    <details>
      <summary><strong>${h.name}</strong> · ${h.vendor} · ${h.license}</summary>
      <div class="detail-body">
        <p><strong>Sweet spot:</strong> ${h.sweet_spot}</p>
        <p style="margin-top:0.5rem;"><strong>Where it stumbles:</strong> ${h.stumbles}</p>
        <p style="margin-top:0.5rem; color:var(--text-faint); font-size:0.78rem;">Providers: ${Array.isArray(h.providers) ? h.providers.join(', ') : h.providers}</p>
      </div>
    </details>
  `).join('');
}

// ---------- SELF-HOSTING ----------
function renderSelfHosting(hwFilter) {
  const hardware = data.self_hosting.hardware_options.filter(hw => hw.show_in_fit !== false).filter(hw => {
    if (hwFilter === 'cloud') return hw.type === 'cloud';
    if (hwFilter === 'local') return hw.type === 'local';
    return true;
  });

  const thead = document.querySelector('#self-host-table thead');
  const tbody = document.querySelector('#self-host-table tbody');
  if (!thead || !tbody) return;
  thead.innerHTML = `<tr><th>Model</th><th>Quality vs ${escapeHtml(getRefModel()?.name||'selected reference')}</th>` +
    hardware.map(hw => `<th style="text-align:center;">${hw.name}<br><span style="font-weight:400; color:var(--text-faint); font-size:0.65rem;">${hw.vram_gb}GB</span></th>`).join('') +
    '</tr>';

  tbody.innerHTML = '';
  data.self_hosting.models
    .filter(m => jurisdictionMatch(m.jurisdiction))
    .forEach(m => {
      let row = `<td class="model-name">${m.name}<span class="sublabel">${m.license} · ${m.jurisdiction} · ${m.params_total}B (${m.params_active}B active)</span></td>`;
      row += `<td>${qbar(localQualityPct(m))}</td>`;
      hardware.forEach(hw => {
        const fit = m.fits[hw.id];
        if (!fit || !fit.quant) {
          row += `<td style="text-align:center; color:var(--text-faint);">—</td>`;
        } else {
          const details = [
            Number.isFinite(Number(fit.vram_used)) ? `${fit.vram_used} GB` : null,
            Number.isFinite(Number(fit.tok_per_sec)) ? `${fit.tok_per_sec} t/s` : null,
          ].filter(Boolean);
          const speed = Number(fit.tok_per_sec);
          const heat = Number.isFinite(speed) ? Math.min(0.34, 0.06 + speed / 600) : 0;
          row += `<td style="text-align:center;">
            <div class="mono" style="font-size:0.78rem;"><strong>${fit.quant}</strong></div>
            <div class="mono" style="font-size:0.7rem; color:var(--text-dim); background:rgba(76,150,122,${heat.toFixed(2)});">${details.length ? details.join(' · ') : 'Compatible · estimate pending'}</div>
          </td>`;
        }
      });
      tbody.innerHTML += `<tr>${row}</tr>`;
    });
}

function renderHardware() {
  const tbody = document.querySelector('#hardware-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.self_hosting.hardware_options.forEach(hw => {
    tbody.innerHTML += `
      <tr>
        <td class="model-name">${hw.name}</td>
        <td><span class="pill pill-${hw.type === 'cloud' ? 'opensource' : 'mistral'}">${hw.type}</span></td>
        <td class="tnum mono">${hw.vram_gb} GB</td>
        <td class="mono" style="font-size:0.78rem;">${hw.cost_label}</td>
        <td style="color:var(--text-dim);">${hw.notes}</td>
      </tr>
    `;
  });
}

function hostingCurrency(currency) {
  return {USD:'$',EUR:'€',CHF:'CHF '}[currency] || `${currency} `;
}

function hostingTrend(offer) {
  const history = offer.history || [];
  if (history.length < 2) {
    const label = history.length ? `Baseline ${history[0].date}` : 'Dynamic price · query provider';
    return `<span class="hosting-baseline">${escapeHtml(label)}</span>`;
  }
  const first = history[0], last = history[history.length - 1];
  const delta = (last.value / first.value - 1) * 100;
  const sign = delta > 0 ? '+' : '';
  return `<div class="hosting-trend">${sparkline(history)}<span>${escapeHtml(first.date)} → ${escapeHtml(last.date)} · <strong>${sign}${delta.toFixed(0)}%</strong></span></div>`;
}

function renderHostingPrices() {
  const tbody = document.querySelector('#hosting-price-table tbody');
  if (!tbody) return;
  const tracker = data.report_metrics?.hosting_prices;
  if (!tracker?.offers?.length) {
    tbody.innerHTML = '<tr><td colspan="7">No dated hosting prices recorded.</td></tr>';
    return;
  }
  tbody.innerHTML = tracker.offers.map(offer => {
    const prefix = hostingCurrency(offer.currency);
    const hourly = finiteNumber(offer.normalized_hourly);
    const monthly = finiteNumber(offer.monthly_equivalent);
    return `<tr>
      <td class="model-name">${escapeHtml(offer.provider)}${cite(offer.source_n)}<span class="sublabel">${escapeHtml(offer.configuration)} · checked ${escapeHtml(offer.checked)}</span></td>
      <td class="tnum mono">${offer.vram_gb} GB</td>
      <td>${escapeHtml(offer.billing)}<span class="sublabel">${escapeHtml(offer.region)} · ${escapeHtml(offer.price_basis)}</span></td>
      <td class="mono">${escapeHtml(offer.current_price_label)}</td>
      <td class="tnum mono">${hourly === null ? '—' : `${prefix}${hourly.toFixed(2)}/hr`}</td>
      <td class="tnum mono">${monthly === null ? '—' : `${prefix}${monthly.toLocaleString(undefined,{minimumFractionDigits:0,maximumFractionDigits:0})}`}</td>
      <td>${hostingTrend(offer)}</td>
    </tr>`;
  }).join('');
}

function renderFrameworks() {
  const tbody = document.querySelector('#frameworks-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.self_hosting.frameworks.forEach(f => {
    tbody.innerHTML += `
      <tr>
        <td class="model-name">${f.name}</td>
        <td>${f.best_for}</td>
        <td style="color:var(--text-dim);">${f.notes}</td>
      </tr>
    `;
  });
}

// ---------- STRATEGY ----------
function renderTaskFitTable(providerFilter) {
  if (!data.strategy.task_fit) return '';
  const tf = data.strategy.task_fit;
  const refUnit = referenceBurnUnit();

  // Map a model+effort to a display burn × ratio (derived from the matrix)
  function burnFor(modelId, effort) {
    if (!modelId) return null;
    const row = findBurnRow(modelId);
    if (!row) return null;
    // For models without effort control, the only defined effort is what we use.
    // For Anthropic Haiku (medium-only), effort='medium' uses row.medium.
    let key = effort;
    if (!key || row[key] === null || row[key] === undefined) {
      // Fall back to any defined effort
      for (const k of ['medium','high','low','xhigh','max','minimal','off','on-budget']) {
        if (typeof row[k] === 'number') { key = k; break; }
      }
    }
    if (typeof row[key] !== 'number') return null;
    return (row[key] * cacheBurnFactor(modelId)) / refUnit;
  }

  const allProviders = [
    { key: 'anthropic',   label: 'Anthropic',   pillProvider: 'Anthropic' },
    { key: 'openai',      label: 'OpenAI',      pillProvider: 'OpenAI' },
    { key: 'google',      label: 'Google',      pillProvider: 'Google' },
    { key: 'self_hosted', label: 'Self-hosted', pillProvider: 'opensource' }
  ];
  const visibleProviders = providerFilter === 'all'
    ? allProviders
    : allProviders.filter(p => p.key === providerFilter);

  const headerCells = visibleProviders.map(p =>
    `<th><span class="col-provider">${p.label}</span></th>`
  ).join('');

  const bodyRows = tf.rows.map((row, rowIdx) => {
    const taskCell = `<td>
      <div class="taskfit-task">${row.task}</div>
      <div class="taskfit-task-desc">${row.description}</div>
    </td>`;

    const providerCells = visibleProviders.map(p => {
      const rec = row.recommendations[p.key];
      const ru = row.runner_up_per_provider?.[p.key] || [];

      if (!rec || !rec.model_id) {
        const emptyRationale = rec?.rationale ? `<span class="taskfit-rationale">${rec.rationale}</span>` : '';
        return `<td class="taskfit-cell-empty">— not recommended${emptyRationale}</td>`;
      }

      const model = modelById(rec.model_id);
      const modelName = model ? model.name : rec.model_id;
      const effortBadge = rec.effort ? `<span class="taskfit-effort">${rec.effort}</span>` : '';
      const burn = burnFor(rec.model_id, rec.effort);
      const burnDisplay = burn !== null ? `<span class="taskfit-burn">${fmtBurn(burn)}</span>` : '';
      const runnerupBlock = ru.length > 0
        ? `<div class="taskfit-runnerups">
             <div class="ru-label">also considered</div>
             <ul>${ru.map(r => `<li>${r}</li>`).join('')}</ul>
           </div>`
        : '';
      const expandHint = ru.length > 0 ? `<div class="taskfit-expand-hint">${ru.length} runner-up${ru.length === 1 ? '' : 's'} · click</div>` : '';

      return `<td class="taskfit-cell" data-row="${rowIdx}" data-provider="${p.key}">
        <span class="taskfit-model">${modelName}</span>
        <div>${effortBadge}${burnDisplay}</div>
        <span class="taskfit-rationale">${rec.rationale}</span>
        ${expandHint}
        ${runnerupBlock}
      </td>`;
    }).join('');

    return `<tr>${taskCell}${providerCells}</tr>`;
  }).join('');

  return `
    <h2 class="sect-head" style="margin-top:2rem;">Task-fit recommendations</h2>
    <p class="sect-sub">${tf.description}</p>
    <div class="taskfit-controls">
      <span>Provider:</span>
      <button class="taskfit-filter active" data-tf-provider="all">All</button>
      <button class="taskfit-filter" data-tf-provider="anthropic">Anthropic</button>
      <button class="taskfit-filter" data-tf-provider="openai">OpenAI</button>
      <button class="taskfit-filter" data-tf-provider="google">Google</button>
      <button class="taskfit-filter" data-tf-provider="self_hosted">Self-hosted</button>
    </div>
    <div class="table-wrap">
      <table class="taskfit-table">
        <thead><tr><th class="task-col">Task</th>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `;
}

function renderStrategy() {
  const s = data.strategy;
  const div = document.getElementById('strategy-content');
  if (!div) return;
  const monthly = Number.isFinite(Number(s.current_recommendation.monthly_usd))
    ? `~$${Number(s.current_recommendation.monthly_usd)}/mo`
    : 'Workload-based cost';
  div.innerHTML = `
    <h2 class="sect-head">${s.current_recommendation.label}</h2>
    <p class="sect-sub">${monthly}</p>
    <div class="strat-grid">
      <div class="strat-card">
        <h3>Recommended stack</h3>
        <div class="price">${monthly}</div>
        <ul>${s.current_recommendation.components.map(c => `<li>${c}</li>`).join('')}</ul>
        <p style="margin-top:1rem;">${s.current_recommendation.rationale}</p>
      </div>
      <div class="strat-card alt">
        <h3>Routing strategy</h3>
        <div class="price">70 / 25 / 5 split</div>
        <ul>${s.routing.map(r => `<li><strong>${r.tier}</strong>: ${r.use_for}<br><span style="color:var(--text-dim);">→ ${r.preferred} (${r.cost_label})</span></li>`).join('')}</ul>
      </div>
    </div>

    <h2 class="sect-head" style="margin-top:2rem;">Alternatives considered</h2>
    <div class="strat-grid">
      ${s.alternatives.map(alt => `
        <div class="strat-card alt">
          <h3>${alt.label}</h3>
          <div class="price">~$${alt.monthly_usd}/mo</div>
          <p>${alt.rationale}</p>
          <p style="margin-top:0.6rem; color:var(--accent); font-style:italic; font-family:var(--serif);">Verdict: ${alt.verdict}</p>
        </div>
      `).join('')}
    </div>

    <h2 class="sect-head" style="margin-top:2rem;">Open questions</h2>
    <div class="strat-card warn" style="grid-column:span 2;">
      <ul>${s.open_questions.map(q => `<li>${q}</li>`).join('')}</ul>
    </div>
  `;

}

// ---------- CAPABILITY RADAR ----------
let currentFocus   = (data.capabilities && data.capabilities.default_focus) || 'balanced';
let currentCompare = ''; // model id to overlay onto the primary (empty = no overlay)
let currentRadarPrimary = ''; // empty → use reference model

function focusWeights() {
  const presets = (data.capabilities && data.capabilities.focus_presets) || {};
  return presets[currentFocus] || presets['balanced'] || {};
}

function composite(model, weights) {
  if (!model || !model.capability_levels || !data.capabilities) return null;
  let num = 0, den = 0;
  for (const a of data.capabilities.axes) {
    const v = model.capability_levels[a.key];
    if (v == null) continue;
    const w = (weights && weights[a.key] != null) ? weights[a.key] : 1;
    num += w * v;
    den += w * 50;
  }
  return den > 0 ? num / den : null;
}

function fmtComposite(v) {
  if (v == null) return '—';
  return (v * 100).toFixed(1) + '%';
}

function renderRadarSVG(model, overlay, opts = {}) {
  // "Editorial instrument" radar: inline fill/stroke fallbacks on every
  // shape so it renders correctly even before CSS loads. CSS layer adds
  // hover transitions, focused-axis glow, etc.
  if (!data.capabilities) return '';
  const axes = data.capabilities.axes;
  const size = opts.size || 460;
  const cx = size / 2, cy = size / 2;
  const r  = size * 0.33;
  const max = 50;
  const startAngle = -Math.PI / 2;
  const weights = focusWeights();

  // Theme palette (inlined so the SVG is self-sufficient).
  const C = {
    bg:        '#ffffff',
    ring:      '#dadce0',
    ringOuter: '#adb2ba',
    primary:   '#e05232',
    overlay:   '#3a5a82',
    hot:       '#c04424',
    text:      '#142438',
    faint:     '#5c6f82',
  };

  const axisDef = axes.map((a, i) => {
    const ang = startAngle + (2 * Math.PI * i / axes.length);
    const cos = Math.cos(ang), sin = Math.sin(ang);
    return {
      key: a.key, label: a.label, short: a.short, cos, sin,
      x:  cx + r * cos,         y:  cy + r * sin,
      lx: cx + (r + 28) * cos,  ly: cy + (r + 28) * sin,
    };
  });

  function ptsFor(m) {
    if (!m || !m.capability_levels) return null;
    return axes.map((a, i) => {
      const v = m.capability_levels[a.key];
      if (v == null) return null;
      const t = v / max;
      return { x: cx + r * t * axisDef[i].cos, y: cy + r * t * axisDef[i].sin, v };
    });
  }
  const polyStr = p => (p || []).filter(q => q).map(q => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' ');

  let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">`;

  // Backdrop circle (subtle readout halo)
  svg += `<circle cx="${cx}" cy="${cy}" r="${(r * 1.04).toFixed(1)}" fill="#f8f9fb" stroke="none" />`;

  // Concentric hex graticule rings at rubric milestones 10/20/30/40/50/60.
  // The 50 ring is emphasized (rubric frontier); 60 is the outer visual cap.
  for (const lvl of [10, 20, 30, 40, 50, 60]) {
    const rr = r * lvl / max;
    const ring = axes.map((_, i) => {
      const ang = startAngle + (2 * Math.PI * i / axes.length);
      return `${(cx + rr * Math.cos(ang)).toFixed(1)},${(cy + rr * Math.sin(ang)).toFixed(1)}`;
    }).join(' ');
    if (lvl === 50) {
      svg += `<polygon points="${ring}" fill="none" stroke="${C.primary}" stroke-width="1.2" stroke-opacity="0.55" />`;
    } else if (lvl === 60) {
      svg += `<polygon points="${ring}" fill="none" stroke="${C.ringOuter}" stroke-width="1" />`;
    } else {
      svg += `<polygon points="${ring}" fill="none" stroke="${C.ring}" stroke-width="0.5" />`;
    }
  }

  // Spokes from center to each axis vertex
  axisDef.forEach(p => {
    const focused = (weights[p.key] || 1) > 1;
    svg += `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${focused ? C.hot : C.ring}" stroke-width="${focused ? 1.2 : 0.5}" />`;
  });

  // Level tick numbers (1..5) along the top axis
  const tickAxis = axisDef[0];
  for (let lvl = 1; lvl <= max; lvl++) {
    const rr = r * lvl / max;
    const tx = cx + rr * tickAxis.cos + 5;
    const ty = cy + rr * tickAxis.sin + 3;
    svg += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" fill="${C.faint}" font-family="IBM Plex Mono, monospace" font-size="8">${lvl}</text>`;
  }

  // Overlay (comparison) polygon — drawn behind primary
  const overlayPts = ptsFor(overlay);
  if (overlayPts) {
    svg += `<polygon points="${polyStr(overlayPts)}" fill="${C.overlay}" fill-opacity="0.08" stroke="${C.overlay}" stroke-width="1.2" stroke-dasharray="3 3" />`;
  }

  // Primary polygon
  const primaryPts = ptsFor(model);
  if (primaryPts) {
    svg += `<polygon points="${polyStr(primaryPts)}" fill="${C.primary}" fill-opacity="0.16" stroke="${C.primary}" stroke-width="1.8" stroke-linejoin="round" />`;
    if (overlayPts) {
      overlayPts.forEach(p => {
        if (p) svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="${C.overlay}" stroke="${C.bg}" stroke-width="1" />`;
      });
    }
    primaryPts.forEach(p => {
      if (p) svg += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.8" fill="${C.primary}" stroke="${C.bg}" stroke-width="1.5"><title>level ${p.v}</title></circle>`;
    });
  }

  // Axis labels (short uppercase) + sublabel = current level name for primary
  const labels = (data.capabilities.level_labels || {});
  axisDef.forEach(p => {
    let anchor = 'middle';
    if (p.lx < cx - 5) anchor = 'end';
    else if (p.lx > cx + 5) anchor = 'start';
    svg += `<text x="${p.lx.toFixed(1)}" y="${(p.ly + 3).toFixed(1)}" text-anchor="${anchor}" fill="${C.text}" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="500" letter-spacing="0.1em">${p.short.toUpperCase()}</text>`;
    const v = (model && model.capability_levels || {})[p.key];
    const sub = bandName(p.key, v);
    if (sub) {
      svg += `<text x="${p.lx.toFixed(1)}" y="${(p.ly + 16).toFixed(1)}" text-anchor="${anchor}" fill="${C.faint}" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="0.08em">${sub.toUpperCase()}</text>`;
    }
  });

  svg += '</svg>';
  return svg;
}

function renderAxisMini(model) {
  if (!data.capabilities) return '';
  const axes = data.capabilities.axes;
  return '<span class="radar-axis-mini">' +
    axes.map(a => {
      const v = (model.capability_levels || {})[a.key];
      const band = bandIndex(v);
      const lvl = band == null ? 'null' : String(band);
      const display = v == null ? '—' : Math.round(v);
      return `<span data-level="${lvl}" title="${a.label}: ${display} (${bandName(a.key, v)})">${display}</span>`;
    }).join('') + '</span>';
}

function renderCapabilityRadar() {
  const div = document.getElementById('capability-radar-content');
  if (!div || !data.capabilities) return;
  const refModel = getRefModel();
  if (!refModel) { div.innerHTML = '<p class="sect-sub">No reference model selected.</p>'; return; }

  const weights = focusWeights();
  const rated = data.models.filter(m => m.capability_levels && m.tier !== 'legacy');
  if (!currentRadarPrimary) {
    const others = rated.filter(m => m.id !== refModel.id)
                        .map(m => [m, composite(m, weights)])
                        .filter(x => x[1] != null)
                        .sort((a, b) => b[1] - a[1]);
    currentRadarPrimary = (others[0] && others[0][0].id) || refModel.id;
  }
  const primary = modelById(currentRadarPrimary) || refModel;
  const overlay = (currentCompare && modelById(currentCompare)) || refModel;

  const presets = Object.keys(data.capabilities.focus_presets || {balanced:{}});
  const focusOpts = presets.map(k => `<option value="${k}"${k===currentFocus?' selected':''}>${k.replace(/-/g, ' ')}</option>`).join('');
  const modelOpts = m => rated.map(x => `<option value="${x.id}"${x.id===m.id?' selected':''}>${x.name}</option>`).join('');

  const compPrimary = composite(primary, weights);
  const compRef     = composite(refModel, weights);
  const compOverlay = composite(overlay, weights);
  const ratio = (compPrimary != null && compRef) ? (compPrimary / compRef) : null;
  const focusDisplay = currentFocus.replace(/-/g, ' ');

  const board = rated.map(m => ({
    m,
    comp: composite(m, weights),
    ratio: composite(m, weights) != null && compRef ? composite(m, weights) / compRef : null,
  })).filter(x => x.comp != null)
     .sort((a, b) => b.comp - a.comp);

  div.innerHTML = renderCapabilityLegend() + `
    <div class="radar-controls">
      <span class="radar-chip">Focus
        <select id="radar-focus">${focusOpts}</select>
      </span>
      <span class="radar-chip">Primary
        <select id="radar-primary">${modelOpts(primary)}</select>
      </span>
      <span class="radar-chip">Overlay
        <select id="radar-compare">
          <option value="">${refModel.name} · reference</option>
          ${rated.filter(x => x.id !== refModel.id)
                 .map(x => `<option value="${x.id}"${x.id===currentCompare?' selected':''}>${x.name}</option>`).join('')}
        </select>
      </span>
    </div>

    <div class="radar-layout">
      <div class="radar-shell">
        <div class="radar-figure">
          ${renderRadarSVG(primary, overlay)}
          <div class="radar-center-readout">
            <div class="composite">${fmtComposite(compPrimary)}</div>
            <div class="composite-label">composite · ${focusDisplay}</div>
            <div class="model-tag">${primary.name}</div>
          </div>
        </div>
      </div>

      <aside class="radar-meta">
        <dl>
          <div>
            <dt>Primary</dt>
            <dd><span class="swatch primary"></span>${primary.name}</dd>
          </div>
          <div>
            <dt>Composite</dt>
            <dd class="big">${fmtComposite(compPrimary)}</dd>
          </div>
          ${ratio != null ? `
          <div>
            <dt>vs reference (${refModel.name})</dt>
            <dd style="color:var(--accent);">${(ratio*100).toFixed(0)}%</dd>
          </div>` : ''}
          <hr>
          <div>
            <dt>Overlay</dt>
            <dd><span class="swatch overlay"></span>${overlay.name}${overlay.id===refModel.id?' · ref':''}</dd>
          </div>
          <div>
            <dt>Overlay composite</dt>
            <dd>${fmtComposite(compOverlay)}</dd>
          </div>
          <hr>
          <div>
            <dt>Focus weighting</dt>
            <dd>${focusDisplay}</dd>
          </div>
        </dl>
      </aside>
    </div>

    <div class="radar-leaderboard">
      <h3>Leaderboard · ${focusDisplay}</h3>
      <table>
        <thead><tr>
          <th>#</th><th>Model</th><th>Provider</th>
          <th>Code · R&amp;A · K&amp;R · Comms · MM · Agent</th>
          <th class="tnum">Composite</th><th class="tnum">vs ${escapeHtml(refModel.name)}</th>
        </tr></thead>
        <tbody>
          ${board.map((row, i) => `
            <tr class="${row.m.id===primary.id?'is-primary':''} ${row.m.id===refModel.id?'is-ref':''}" data-pick-model="${row.m.id}">
              <td class="rank">${String(i+1).padStart(2,'0')}</td>
              <td>${row.m.name}</td>
              <td style="color:var(--text-dim); font-size:0.78rem;">${row.m.provider}</td>
              <td>${renderAxisMini(row.m)}</td>
              <td class="tnum">${fmtComposite(row.comp)}</td>
              <td class="tnum" style="color:${row.ratio>=1?'var(--accent)':'var(--text-dim)'};">${row.ratio != null ? (row.ratio*100).toFixed(0)+'%' : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  div.querySelector('#radar-focus').addEventListener('change', e => {
    currentFocus = e.target.value; renderCapabilityRadar();
  });
  div.querySelector('#radar-primary').addEventListener('change', e => {
    currentRadarPrimary = e.target.value; renderCapabilityRadar();
  });
  div.querySelector('#radar-compare').addEventListener('change', e => {
    currentCompare = e.target.value; renderCapabilityRadar();
  });
  div.querySelectorAll('[data-pick-model]').forEach(tr => {
    tr.addEventListener('click', () => {
      currentRadarPrimary = tr.dataset.pickModel;
      renderCapabilityRadar();
    });
  });
}

function renderDecisionMatrix() {
  const host=document.getElementById('capability-radar-content');
  if(!host||!data.capabilities)return;
  const board=host.querySelector('.radar-leaderboard table');
  if(board && !board.dataset.compoundExtended){
    board.dataset.compoundExtended='1';
    const head=board.querySelector('thead tr');
    [`Quality vs ${getRefModel()?.name||'selected reference'}`,'Speed','Cost'].forEach(label=>{const th=document.createElement('th');th.className='tnum';th.textContent=label;head.appendChild(th)});
    board.querySelectorAll('tbody tr[data-pick-model]').forEach(tr=>{
      const s=modelScores(modelById(tr.dataset.pickModel));
      ['quality','speed','cost'].forEach(k=>{const td=document.createElement('td');td.className='tnum metric-cell '+(k==='cost'?'cost':'');td.style.setProperty('--heat',(.06+(s[k]||0)/100*.25).toFixed(2));td.textContent=s[k]==null?'—':s[k].toFixed(1);tr.appendChild(td)});
    });
  }
  let panel=host.querySelector('#decision-matrix');
  if(!panel){panel=document.createElement('div');panel.id='decision-matrix';panel.className='analytics-panel';host.appendChild(panel)}
  const weights=focusWeights();
  const candidates=data.models.filter(m=>m.capability_levels&&m.tier!=='legacy'&&jurisdictionMatch(m.jurisdiction)).map(m=>{
    const sc=modelScores(m),cap=composite(m,weights); const market=[sc.quality,sc.speed,sc.cost].filter(Number.isFinite);
    return {m,cap:cap==null?null:cap*100,market:market.length===3?market.reduce((a,b)=>a+b,0)/market.length:null};
  });
  const rows=candidates.filter(d=>Number.isFinite(d.cap)&&Number.isFinite(d.market));
  const incomplete=candidates.filter(d=>Number.isFinite(d.cap)&&!Number.isFinite(d.market));
  const w=1200,h=600,l=115,r=40,t=40,b=85,maxMarket=110,x=v=>l+Math.max(0,Math.min(maxMarket,v))*(w-l-r)/maxMarket,y=v=>h-b-v*(h-t-b)/100;
  const xTicks=[0,25,50,75,100],yTicks=[0,25,50,75,100];
  const grid=xTicks.map(v=>`<line class="grid" x1="${x(v)}" y1="${t}" x2="${x(v)}" y2="${h-b}"/><text x="${x(v)}" y="${h-b+20}" text-anchor="middle">${v}</text>`).join('')+yTicks.map(v=>`<line class="grid" x1="${l}" y1="${y(v)}" x2="${w-r}" y2="${y(v)}"/><text x="${l-10}" y="${y(v)+3}" text-anchor="end">${v}</text>`).join('');
  const points=rows.map((d,index)=>({id:index,name:d.m.name,cx:x(d.market),cy:y(d.cap),radius:6}));
  const marks=rows.map((d,index)=>{const point=points[index],color=providerColor(d.m.provider),description=`${d.m.name}: capability ${d.cap.toFixed(1)}, quality speed and cost mean ${d.market.toFixed(1)}`;return `<g class="bubble-mark" data-bubble-index="${index}" data-label="${escapeHtml(description)}" tabindex="0" role="img" aria-label="${escapeHtml(description)}"><circle class="bubble-circle" cx="${point.cx}" cy="${point.cy}" r="9" fill="${color}" fill-opacity=".82" stroke="#fff" stroke-width="1.5"><title>${escapeHtml(description)}</title></circle><text class="bubble-index" x="${point.cx}" y="${point.cy+3}" text-anchor="middle">${index+1}</text></g>`}).join('');
  const key=bubbleLabelKey(rows,d=>`Capability ${d.cap.toFixed(1)} · market ${d.market.toFixed(1)}`);
  const refName=getRefModel()?.name||'selected reference';
  const pending=incomplete.length?`<div class="bubble-key" aria-label="Models without complete comparable market evidence"><div class="bubble-key-item"><span class="bubble-key-index" style="--bubble-color:var(--text-faint)">○</span><span><strong>Capability scored; market position pending</strong><small>No synthetic horizontal position assigned</small></span></div>${incomplete.map(d=>`<div class="bubble-key-item"><span class="bubble-key-index" style="--bubble-color:${providerColor(d.m.provider)}">○</span><span><strong>${escapeHtml(d.m.name)}</strong><small>Capability ${d.cap.toFixed(1)} · comparable quality/speed/cost incomplete</small></span></div>`).join('')}</div>`:'';
  panel.innerHTML=`<h3>Capability × market position</h3><p>The vertical axis is the focus-weighted six-category capability score. The horizontal axis averages quality vs ${escapeHtml(refName)}, speed, and cost efficiency. Models without all three comparable market inputs remain explicitly listed below.</p><div class="bubble-readout" aria-live="polite">Hover or focus a bubble or key entry to isolate it.</div><svg class="analytics-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Matrix comparing capability and market scores relative to ${escapeHtml(refName)}">${grid}<line x1="${x(50)}" y1="${t}" x2="${x(50)}" y2="${h-b}" stroke="#c9c6bf" stroke-dasharray="4 4"/><line x1="${l}" y1="${y(50)}" x2="${w-r}" y2="${y(50)}" stroke="#c9c6bf" stroke-dasharray="4 4"/>${marks}<text x="${(l+w-r)/2}" y="${h-22}" text-anchor="middle">MEAN OF QUALITY VS ${escapeHtml(refName.toUpperCase())} + SPEED + COST →</text><text transform="translate(22 ${(t+h-b)/2}) rotate(-90)" text-anchor="middle">6-CATEGORY CAPABILITY SCORE →</text></svg>${key}${pending}`;
  bindBubbleInteractions(panel);
}

function enhanceLargeTables() {
  document.querySelectorAll('table').forEach(table=>{
    const rows=table.tBodies[0]?.rows.length||0;
    if(rows<5)return;
    if(!table.dataset.tools){
      table.dataset.tools='1';
      const tools=document.createElement('div');tools.className='table-tools';
      tools.innerHTML=`<input type="search" aria-label="Search table" placeholder="Search ${escapeHtml(table.id||'table')}…"><select aria-label="Filter column"><option value="">All columns</option>${Array.from(table.tHead?.rows[0]?.cells||[]).map((th,i)=>`<option value="${i}">${escapeHtml(th.textContent.trim())}</option>`).join('')}</select><input type="search" aria-label="Filter value" placeholder="Filter value…">`;
      const wrap=table.closest('.table-wrap')||table.parentElement;wrap.parentElement.insertBefore(tools,wrap);
      const apply=()=>{const q=tools.children[0].value.toLowerCase(),col=tools.children[1].value,f=tools.children[2].value.toLowerCase();Array.from(table.tBodies[0]?.rows||[]).forEach(tr=>{const all=tr.textContent.toLowerCase(),specific=col===''?all:(tr.cells[Number(col)]?.textContent||'').toLowerCase();tr.hidden=!(all.includes(q)&&specific.includes(f))})};
      tools.querySelectorAll('input,select').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',apply));
    }
    Array.from(table.tHead?.rows[0]?.cells||[]).forEach((th,index)=>{
      if(th.dataset.sortBound)return; th.dataset.sortBound='1';th.dataset.sort='';th.tabIndex=0;
      const sort=()=>{const dir=th.dataset.sortDir==='asc'?'desc':'asc';Array.from(th.parentElement.cells).forEach(x=>delete x.dataset.sortDir);th.dataset.sortDir=dir;const body=table.tBodies[0];Array.from(body.rows).sort((a,b)=>{const av=a.cells[index]?.textContent.trim()||'',bv=b.cells[index]?.textContent.trim()||'',an=parseFloat(av.replace(/[^0-9.-]/g,'')),bn=parseFloat(bv.replace(/[^0-9.-]/g,''));const cmp=Number.isFinite(an)&&Number.isFinite(bn)?an-bn:av.localeCompare(bv,undefined,{numeric:true});return dir==='asc'?cmp:-cmp}).forEach(row=>body.appendChild(row))};
      th.addEventListener('click',sort);th.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();sort()}});
    });
  });
  colorHardwareSpeed(); linkProviderRemarks();
}

function colorHardwareSpeed() {
  const table=document.getElementById('self-host-table');if(!table)return;
  const cells=[];table.querySelectorAll('tbody td').forEach(td=>{const match=td.textContent.match(/([\d.]+)\s*t\/s/i);if(match)cells.push([td,Number(match[1])])});
  const max=Math.max(1,...cells.map(x=>x[1]));cells.forEach(([td,v])=>{td.classList.add('speed-cell');td.style.setProperty('--heat',(.05+v/max*.3).toFixed(2));td.title=`Estimated output speed: ${v} tokens/second`});
}
function linkProviderRemarks() {
  const urls={OpenAI:'https://openai.com/api/pricing/',Anthropic:'https://www.anthropic.com/pricing',Google:'https://ai.google.dev/gemini-api/docs/pricing',Mistral:'https://mistral.ai/pricing',DeepSeek:'https://api-docs.deepseek.com/quick_start/pricing'};
  document.querySelectorAll('td').forEach(td=>{if(!/see (?:the )?provider/i.test(td.textContent)||td.querySelector('a'))return;const rowText=td.parentElement?.textContent||'';const provider=Object.keys(urls).find(p=>rowText.includes(p));if(provider)td.innerHTML=td.innerHTML.replace(/see (?:the )?provider/ig,`<a href="${urls[provider]}" target="_blank" rel="noopener">see ${provider}</a>`)});
}

// ---------- SOURCES TAB ----------
function renderSources() {
  const div = document.getElementById('sources-content');
  if (!div) return;
  const sources = (data.sources || []).slice().sort((a, b) => a.n - b.n);
  if (!sources.length) {
    div.innerHTML = '<h2 class="sect-head">Sources</h2><p class="sect-sub">No sources recorded yet.</p>';
    return;
  }
  // Group by category, preserving first-seen order.
  const byCat = new Map();
  sources.forEach(s => {
    const cat = s.category || 'Other';
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(s);
  });
  const groups = Array.from(byCat.entries()).map(([cat, items]) => `
    <div class="sources-cat">
      <h3>${cat}</h3>
      <ol class="sources-list">
        ${items.map(s => `
          <li id="src-${s.n}">
            <span class="sn">${s.n}</span>
            <span>
              <a href="${s.url}" target="_blank" rel="noopener">${s.title || s.url}</a>
              ${s.note ? `<span style="color:var(--text-dim); display:block; font-size:0.78rem; margin-top:0.15rem;">${s.note}</span>` : ''}
              <span class="src-url">${s.url}</span>
            </span>
          </li>
        `).join('')}
      </ol>
    </div>
  `).join('');
  div.innerHTML = `
    <h2 class="sect-head">Sources</h2>
    <p class="sect-sub">Every superscript number in this dashboard links to an entry below. Sources are grouped by category. Last verified: ${new Date(data.meta.generated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.</p>
    <div class="sources-grid">${groups}</div>
  `;
}

// ---------- BOOT ----------
init();
