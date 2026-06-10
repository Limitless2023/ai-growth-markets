// ============================================================
// AI Growth Markets · 主站渲染
//   数据加载 → The Number → 参照条 → 账本/词典/市场三个 tab
//   The Number 与 scripts/validate.mjs 同一规则，永远逐行可对
// ============================================================
import { getLang, setLang, t, UI } from "./i18n.js";

const lang = getLang();
const ui = UI[lang];
const $ = (sel) => document.querySelector(sel);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ---------- 数据加载：Pages 部署时 data/ 在站点根，本地预览回退 ../data/ ----------
async function loadJSON(name) {
  for (const base of ["data/", "../data/"]) {
    try {
      const r = await fetch(base + name, { cache: "no-store" });
      if (r.ok) return r.json();
    } catch {}
  }
  throw new Error(`Failed to load ${name}`);
}

const [events, occupations, markets] = await Promise.all(
  ["events.json", "occupations.json", "markets.json"].map(loadJSON)
);

// ============================================================
// The Number —— 计数规则见 docs/methodology.md §1
// ============================================================
const published = events
  .filter((e) => e.status === "published")
  .sort((a, b) => b.date.localeCompare(a.date));
const theNumber = published.filter((e) => e.counted).reduce((s, e) => s + e.jobs_count, 0);
const lastUpdated = published.length ? published[0].date : "—";

// ---------- 参照条置顶项（展示层策展，数据以事件行为准） ----------
const REF_PINNED = [
  "2026-01-linkedin-1300k-ai-jobs",
  "2025-01-wef-future-of-jobs-net78m",
  "2025-07-mohrss-batch7-genai-tester",
];

// ============================================================
// 渲染：Hero
// ============================================================
function renderHero() {
  $("#brand").textContent = ui.brand;
  $("#tagline").textContent = ui.tagline;
  $("#the-number").textContent = theNumber.toLocaleString(lang === "zh" ? "zh-CN" : "en-US");
  $("#number-label").textContent = ui.theNumberLabel;
  $("#number-sub").textContent = ui.theNumberSub;
  $("#last-updated").textContent = `${ui.lastUpdated} ${lastUpdated}`;
  const langBtn = $("#lang-toggle");
  langBtn.textContent = lang === "zh" ? "EN" : "中文";
  langBtn.onclick = () => setLang(lang === "zh" ? "en" : "zh");
  $("#methodology-link").textContent = ui.methodology;
}

// ============================================================
// 渲染：机构口径参照条
// ============================================================
function renderRefStrip() {
  $("#ref-label").textContent = ui.refStrip;
  const items = REF_PINNED.map((id) => published.find((e) => e.id === id)).filter(Boolean);
  $("#ref-items").innerHTML = items
    .map((e) => {
      const big = e.jobs_count
        ? e.jobs_count.toLocaleString(lang === "zh" ? "zh-CN" : "en-US")
        : "—";
      return `<a class="ref-item" href="${esc(e.source.url)}" target="_blank" rel="noopener">
        <b>${big}</b>
        <span>${esc(t(e, "jobs_type", lang))}</span>
        <small>${esc(e.company_or_body)} · ${e.date.slice(0, 7)}</small>
      </a>`;
    })
    .join("");
}

// ============================================================
// 渲染：事件账本（筛选 + 行展开）
// ============================================================
let kindFilter = "all";
let regionFilter = "all";
let countedOnly = false;

function ledgerRows() {
  return published.filter(
    (e) =>
      (kindFilter === "all" || e.kind === kindFilter) &&
      (regionFilter === "all" || e.region === regionFilter) &&
      (!countedOnly || e.counted)
  );
}

function renderLedgerFilters() {
  const kinds = ["all", "hiring_commitment", "team_formation", "official_listing", "report_datapoint"];
  $("#kind-filters").innerHTML = kinds
    .map(
      (k) =>
        `<button class="chip ${k === kindFilter ? "active" : ""}" data-kind="${k}">
          ${k === "all" ? ui.filterAllKinds : ui.kinds[k]}</button>`
    )
    .join("");
  const regions = ["all", ...new Set(published.map((e) => e.region))];
  $("#region-filters").innerHTML =
    regions
      .map(
        (r) =>
          `<button class="chip ${r === regionFilter ? "active" : ""}" data-region="${r}">
            ${r === "all" ? ui.filterAllRegions : ui.regions[r] || r}</button>`
      )
      .join("") +
    `<button class="chip toggle ${countedOnly ? "active" : ""}" id="counted-toggle">✓ ${ui.countedOnly}</button>`;

  document.querySelectorAll("[data-kind]").forEach((b) => (b.onclick = () => { kindFilter = b.dataset.kind; renderLedger(); }));
  document.querySelectorAll("[data-region]").forEach((b) => (b.onclick = () => { regionFilter = b.dataset.region; renderLedger(); }));
  $("#counted-toggle").onclick = () => { countedOnly = !countedOnly; renderLedger(); };
}

function renderLedger() {
  renderLedgerFilters();
  const rows = ledgerRows();
  $("#ledger-count").textContent = `${rows.length} ${ui.eventsCount}`;
  if (!rows.length) {
    $("#ledger-body").innerHTML = `<tr><td colspan="5" class="empty">${ui.empty}</td></tr>`;
    return;
  }
  $("#ledger-body").innerHTML = rows
    .map((e) => {
      const count = e.jobs_count ? e.jobs_count.toLocaleString(lang === "zh" ? "zh-CN" : "en-US") : "—";
      const badge = e.counted
        ? `<span class="badge counted">✓ ${ui.counted}</span>`
        : `<span class="badge ref">${ui.notCounted}</span>`;
      return `
      <tr class="row" data-id="${esc(e.id)}">
        <td class="nowrap">${e.date}</td>
        <td>${esc(e.company_or_body)}</td>
        <td>
          <span class="kind k-${e.kind}">${ui.kinds[e.kind]}</span>
          ${esc(t(e, "jobs_type", lang))} ${badge}
        </td>
        <td class="num">${count}</td>
        <td class="nowrap">${ui.regions[e.region] || e.region}</td>
      </tr>
      <tr class="detail" data-detail="${esc(e.id)}" hidden>
        <td colspan="5">
          <blockquote>${esc(t(e.source, "quote", lang) || e.source.quote_en || e.source.quote_zh || "")}</blockquote>
          ${e.notes_zh && lang === "zh" ? `<p class="notes">📌 ${esc(e.notes_zh)}</p>` : ""}
          <p class="src">
            ${ui.source}: <a href="${esc(e.source.url)}" target="_blank" rel="noopener">${esc(e.source.publisher)}</a>
            · ${esc(e.source.date)}
          </p>
        </td>
      </tr>`;
    })
    .join("");
  document.querySelectorAll("tr.row").forEach((tr) => {
    tr.onclick = () => {
      const d = document.querySelector(`[data-detail="${tr.dataset.id}"]`);
      if (d) d.hidden = !d.hidden;
    };
  });
}

// ============================================================
// 渲染：新职业词典
// ============================================================
function renderDictionary() {
  $("#dict-count").textContent = `${occupations.length} ${ui.occupationsCount}`;
  $("#dict-grid").innerHTML = occupations
    .map((o) => {
      const firstSeen = o.first_seen
        ? `<div class="meta">🕐 ${ui.firstSeen}: <a href="${esc(o.first_seen.source_url)}" target="_blank" rel="noopener">${o.first_seen.date}</a></div>`
        : "";
      const official = o.official_recognition
        ? `<div class="meta official">🏛 ${esc(o.official_recognition)}</div>`
        : "";
      const human = t(o, "human_angle", lang)
        ? `<div class="human"><b>${ui.humanAngle}</b><p>${esc(t(o, "human_angle", lang))}</p></div>`
        : "";
      return `
      <div class="card">
        <div class="card-top">
          <h3>${esc(t(o, "name", lang))}</h3>
          <span class="badge maturity">${ui.maturity[o.maturity]}</span>
        </div>
        <div class="badges"><span class="badge domain">${ui.domains[o.domain]}</span></div>
        <p class="summary">${esc(t(o, "summary", lang))}</p>
        <p class="why">${esc(t(o, "why_new", lang))}</p>
        ${firstSeen}${official}${human}
        <div class="skills">${(o.skills || []).map((s) => `<span class="skill">${esc(s)}</span>`).join("")}</div>
      </div>`;
    })
    .join("");
}

// ============================================================
// 渲染：增量市场
// ============================================================
function renderMarkets() {
  $("#mkt-count").textContent = `${markets.length} ${ui.marketsCount}`;
  $("#mkt-grid").innerHTML = markets
    .map(
      (m) => `
      <div class="card">
        <div class="card-top">
          <h3>${esc(t(m, "name", lang))}</h3>
          <span class="badge maturity">${ui.maturity[m.maturity]}</span>
        </div>
        <div class="badges"><span class="badge domain">${ui.domains[m.domain]}</span></div>
        <p class="summary">${esc(t(m, "summary", lang))}</p>
        <p class="why">${esc(t(m, "why_new", lang))}</p>
        <div class="skills">${(m.skills || []).map((s) => `<span class="skill">${esc(s)}</span>`).join("")}</div>
      </div>`
    )
    .join("");
}

// ============================================================
// Tabs + Footer
// ============================================================
function renderTabs() {
  const tabs = [
    ["ledger", ui.tabLedger],
    ["dict", ui.tabDictionary],
    ["mkt", ui.tabMarkets],
  ];
  $("#tabs").innerHTML = tabs
    .map(([id, label], i) => `<button class="tab ${i === 0 ? "active" : ""}" data-tab="${id}">${label}</button>`)
    .join("");
  document.querySelectorAll("[data-tab]").forEach((b) => {
    b.onclick = () => {
      document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      ["ledger", "dict", "mkt"].forEach((id) => ($("#panel-" + id).hidden = id !== b.dataset.tab));
    };
  });
}

function renderFooter() {
  $("#dl-label").textContent = ui.download + ":";
  $("#cite-label").textContent = ui.cite;
  $("#footer-note").textContent = ui.footerNote;
  $("#gh-link").textContent = ui.github;
  $("#issue-link").textContent = ui.correction;
  const citation = `AI Growth Markets, retrieved ${new Date().toISOString().slice(0, 10)}, ${location.origin + location.pathname}`;
  $("#cite-text").textContent = citation;
  $("#cite-btn").textContent = ui.citeCopy;
  $("#cite-btn").onclick = async () => {
    await navigator.clipboard.writeText(citation);
    $("#cite-btn").textContent = ui.citeCopied;
    setTimeout(() => ($("#cite-btn").textContent = ui.citeCopy), 1500);
  };
}

// ---------- 启动 ----------
document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
renderHero();
renderRefStrip();
renderTabs();
renderLedger();
renderDictionary();
renderMarkets();
renderFooter();
