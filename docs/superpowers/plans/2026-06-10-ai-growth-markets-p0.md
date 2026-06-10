# AI Growth Markets P0 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 上线"AI 创造侧公共账本"网站 v1：The Number + 事件账本 + 新职业词典 + 方法论页，中英双语，数据全开放，CI 校验，GitHub Pages 公网可访问。

**Architecture:** 仓库即数据库（JSON in repo = 开放数据集），纯静态站点（无框架无构建）从 JSON 实时渲染，The Number 由前端按计数规则实时计算保证与账本逐行一致；零依赖 Node 校验器在本地与 CI 双重把关数据纪律。

**Tech Stack:** Vanilla HTML/CSS/JS · Node 22+（仅 `node:test` 与零依赖脚本）· GitHub Actions · GitHub Pages

**Spec:** `docs/superpowers/specs/2026-06-10-ai-growth-markets-design.md`（本计划唯一依据，冲突时以 spec 为准）

---

## 文件结构总览

| 路径 | 职责 |
|------|------|
| `data/schema/*.schema.json` | 4 个实体的 JSON Schema（机读文档 + 校验依据） |
| `data/events.json` | 事件账本（核心新增） |
| `data/occupations.json` | 新职业词典（由 opportunities.json 的 6 条 role 升级） |
| `data/markets.json` | 增量市场（6 条 market 沿用拆双语） |
| `data/sources.json` | 信源登记表（collector 扫描清单） |
| `scripts/validate.mjs` | 零依赖数据校验器（本地 + CI 共用） |
| `tests/validate.test.mjs` + `tests/fixtures/` | 校验器测试 |
| `agents/collector.md` | 采集 agent 提示词规范 |
| `docs/methodology.md` | 计数规则/入选标准/纠错政策 |
| `web/index.html` `web/style.css` `web/app.js` `web/i18n.js` | 主站 |
| `web/methodology.html` | 方法论页 |
| `.github/workflows/validate.yml` `pages.yml` | CI 校验 + Pages 部署 |
| 删除：`data/opportunities.json` | 拆分后移除（上线前破坏性变更，spec §8 允许） |

执行约定：直接提交 `main`（个人仓库、未上线、与既有提交习惯一致）；每个 Task 至少一个 commit；commit message 末尾带 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`。

---

### Task 1: 数据校验器（TDD）

**Files:**
- Create: `data/schema/event.schema.json`、`data/schema/occupation.schema.json`、`data/schema/market.schema.json`、`data/schema/source.schema.json`
- Create: `scripts/validate.mjs`
- Test: `tests/validate.test.mjs`、`tests/fixtures/valid/*.json`、`tests/fixtures/invalid/*.json`

- [x] **Step 1.1: 写四个 Schema 文件**

`data/schema/event.schema.json`：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Event",
  "type": "object",
  "required": ["id", "date", "company_or_body", "region", "kind", "source", "confidence", "counted", "status"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9][a-z0-9-]+$" },
    "date": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "company_or_body": { "type": "string", "minLength": 1 },
    "region": { "type": "string", "pattern": "^([A-Z]{2}|Global)$" },
    "kind": { "enum": ["hiring_commitment", "team_formation", "official_listing", "report_datapoint"] },
    "jobs_count": { "type": ["integer", "null"], "minimum": 1 },
    "jobs_type_zh": { "type": "string" },
    "jobs_type_en": { "type": "string" },
    "occupation_ids": { "type": "array", "items": { "type": "string" } },
    "market_ids": { "type": "array", "items": { "type": "string" } },
    "source": {
      "type": "object",
      "required": ["url", "publisher", "date"],
      "properties": {
        "url": { "type": "string", "pattern": "^https?://" },
        "publisher": { "type": "string", "minLength": 1 },
        "date": { "type": "string", "pattern": "^\\d{4}-\\d{2}(-\\d{2})?$" },
        "quote_zh": { "type": "string" },
        "quote_en": { "type": "string" }
      }
    },
    "confidence": { "enum": ["company_stated", "report_estimated"] },
    "counted": { "type": "boolean" },
    "status": { "enum": ["draft", "verified", "published"] },
    "notes_zh": { "type": "string" }
  }
}
```

`data/schema/occupation.schema.json`：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Occupation",
  "type": "object",
  "required": ["id", "name_zh", "name_en", "domain", "maturity", "summary_zh", "summary_en", "why_new_zh", "skills"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9][a-z0-9-]+$" },
    "name_zh": { "type": "string", "minLength": 1 },
    "name_en": { "type": "string", "minLength": 1 },
    "aka": { "type": "array", "items": { "type": "string" } },
    "domain": { "enum": ["infrastructure", "data", "product", "safety", "governance", "creative", "enablement"] },
    "maturity": { "enum": ["emerging", "growing", "established"] },
    "summary_zh": { "type": "string", "minLength": 1 },
    "summary_en": { "type": "string", "minLength": 1 },
    "why_new_zh": { "type": "string", "minLength": 1 },
    "why_new_en": { "type": "string" },
    "first_seen": {
      "type": ["object", "null"],
      "required": ["date", "source_url"],
      "properties": {
        "date": { "type": "string", "pattern": "^\\d{4}-\\d{2}$" },
        "source_url": { "type": "string", "pattern": "^https?://" }
      }
    },
    "official_recognition": { "type": ["string", "null"] },
    "salary_band": {
      "type": ["object", "null"],
      "required": ["region", "low", "high", "currency", "period", "source_url"],
      "properties": {
        "region": { "type": "string" }, "low": { "type": "number" }, "high": { "type": "number" },
        "currency": { "type": "string" }, "period": { "enum": ["year", "month"] },
        "source_url": { "type": "string", "pattern": "^https?://" }
      }
    },
    "human_angle_zh": { "type": "string" },
    "human_angle_en": { "type": "string" },
    "skills": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "examples": { "type": "array", "items": { "type": "string" } },
    "event_ids": { "type": "array", "items": { "type": "string" } },
    "sources": { "type": "array", "items": { "type": "string", "pattern": "^https?://" } }
  }
}
```

`data/schema/market.schema.json`：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Market",
  "type": "object",
  "required": ["id", "name_zh", "name_en", "domain", "maturity", "summary_zh", "summary_en", "why_new_zh"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9][a-z0-9-]+$" },
    "name_zh": { "type": "string", "minLength": 1 },
    "name_en": { "type": "string", "minLength": 1 },
    "domain": { "enum": ["infrastructure", "data", "product", "safety", "governance", "creative", "enablement"] },
    "maturity": { "enum": ["emerging", "growing", "established"] },
    "summary_zh": { "type": "string", "minLength": 1 },
    "summary_en": { "type": "string", "minLength": 1 },
    "why_new_zh": { "type": "string", "minLength": 1 },
    "why_new_en": { "type": "string" },
    "skills": { "type": "array", "items": { "type": "string" } },
    "examples": { "type": "array", "items": { "type": "string" } },
    "event_ids": { "type": "array", "items": { "type": "string" } },
    "sources": { "type": "array", "items": { "type": "string", "pattern": "^https?://" } }
  }
}
```

`data/schema/source.schema.json`：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Source",
  "type": "object",
  "required": ["id", "name", "url", "cadence", "lang", "what_to_look_for_zh"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9][a-z0-9-]+$" },
    "name": { "type": "string", "minLength": 1 },
    "url": { "type": "string", "pattern": "^https?://" },
    "cadence": { "enum": ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly", "biennial", "event_driven"] },
    "lang": { "enum": ["zh", "en"] },
    "what_to_look_for_zh": { "type": "string", "minLength": 1 },
    "last_checked": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" }
  }
}
```

- [x] **Step 1.2: 写失败测试**

`tests/validate.test.mjs`（零依赖，`node:test`；校验器从 `DATA_DIR` 环境变量读数据目录）：

```js
// ============================================================
// 校验器测试：对 fixtures/valid 应通过，对 fixtures/invalid 应报错
// ============================================================
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (dataDir) => {
  try {
    const out = execFileSync("node", [path.join(root, "scripts/validate.mjs")], {
      env: { ...process.env, DATA_DIR: dataDir }, encoding: "utf8",
    });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout) + String(e.stderr) };
  }
};

test("valid fixtures 通过且输出 The Number", () => {
  const r = run(path.join(root, "tests/fixtures/valid"));
  assert.equal(r.code, 0);
  assert.match(r.out, /The Number = 500/);
});

test("invalid fixtures 全部规则被命中", () => {
  const r = run(path.join(root, "tests/fixtures/invalid"));
  assert.equal(r.code, 1);
  for (const rule of ["R1", "R2", "R3", "R4", "R5"]) assert.match(r.out, new RegExp(rule));
});
```

`tests/fixtures/valid/` 下放四个最小合法文件（events.json 含 1 条 counted=true/jobs_count=500/company_stated/hiring_commitment/published 事件 + 1 条 report_datapoint/counted=false；occupations.json、markets.json 各 1 条最小合法记录，事件的 occupation_ids 指向它；sources.json 1 条）。`tests/fixtures/invalid/` 下放触发 R1（重复 id）、R2（缺 source.url）、R3（counted=true 但 confidence=report_estimated）、R4（report_datapoint 且 counted=true）、R5（occupation_ids 指向不存在的 id）的文件。fixture 即测试数据，照规则反向构造即可。

- [x] **Step 1.3: 跑测试确认失败**

```bash
cd "/Users/limitless/Desktop/Projects/AI Growth Market" && node --test tests/
```
预期：FAIL（`scripts/validate.mjs` 不存在）。

- [x] **Step 1.4: 实现校验器**

`scripts/validate.mjs`（零依赖，不引入通用 JSON Schema 引擎，手写规则与 schema 文件语义一致）：

```js
#!/usr/bin/env node
// ============================================================
// AI Growth Markets 数据校验器（零依赖）
// 规则编号与报错绑定，CI 与本地共用：
//   R1 id 唯一            R2 必填字段/枚举/格式
//   R3 counted 计数纪律    R4 report_datapoint 永不计数
//   R5 引用完整性          R6 排序无关，渲染时处理
// ============================================================
import { readFileSync } from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.DATA_DIR || "data";
const errors = [];
const err = (rule, msg) => errors.push(`[${rule}] ${msg}`);
const load = (f) => JSON.parse(readFileSync(path.join(DATA_DIR, f), "utf8"));

const events = load("events.json");
const occupations = load("occupations.json");
const markets = load("markets.json");
const sources = load("sources.json");

// ---------- R1: id 唯一 ----------
for (const [name, arr] of [["events", events], ["occupations", occupations], ["markets", markets], ["sources", sources]]) {
  const seen = new Set();
  for (const item of arr) {
    if (!item.id || !/^[a-z0-9][a-z0-9-]+$/.test(item.id)) err("R2", `${name}: 非法 id "${item.id}"`);
    if (seen.has(item.id)) err("R1", `${name}: 重复 id "${item.id}"`);
    seen.add(item.id);
  }
}

// ---------- R2: 事件必填/枚举/格式 ----------
const KINDS = ["hiring_commitment", "team_formation", "official_listing", "report_datapoint"];
const CONF = ["company_stated", "report_estimated"];
const STATUS = ["draft", "verified", "published"];
for (const e of events) {
  const where = `events/${e.id}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) err("R2", `${where}: date 非法`);
  if (!e.company_or_body) err("R2", `${where}: 缺 company_or_body`);
  if (!/^([A-Z]{2}|Global)$/.test(e.region || "")) err("R2", `${where}: region 非法`);
  if (!KINDS.includes(e.kind)) err("R2", `${where}: kind 非法`);
  if (!CONF.includes(e.confidence)) err("R2", `${where}: confidence 非法`);
  if (!STATUS.includes(e.status)) err("R2", `${where}: status 非法`);
  if (typeof e.counted !== "boolean") err("R2", `${where}: counted 必须为布尔`);
  if (!e.source || !/^https?:\/\//.test(e.source.url || "")) err("R2", `${where}: 缺合法 source.url`);
  if (!e.source?.publisher) err("R2", `${where}: 缺 source.publisher`);
  if (e.jobs_count !== null && e.jobs_count !== undefined && (!Number.isInteger(e.jobs_count) || e.jobs_count < 1))
    err("R2", `${where}: jobs_count 必须为正整数或 null`);

  // ---------- R3: 计数纪律（spec §5） ----------
  if (e.counted === true) {
    if (!Number.isInteger(e.jobs_count) || e.jobs_count < 1) err("R3", `${where}: counted 但无合法 jobs_count`);
    if (e.confidence !== "company_stated") err("R3", `${where}: counted 但 confidence 非 company_stated`);
    if (!["hiring_commitment", "team_formation"].includes(e.kind)) err("R3", `${where}: counted 但 kind 不可计数`);
  }
  // ---------- R4: 机构口径永不入账 ----------
  if (e.kind === "report_datapoint" && e.counted === true) err("R4", `${where}: report_datapoint 不得 counted`);
}

// ---------- R2: 职业/市场/信源必填 ----------
const DOMAINS = ["infrastructure", "data", "product", "safety", "governance", "creative", "enablement"];
const MATURITY = ["emerging", "growing", "established"];
for (const [name, arr, extra] of [["occupations", occupations, true], ["markets", markets, false]]) {
  for (const o of arr) {
    const where = `${name}/${o.id}`;
    for (const f of ["name_zh", "name_en", "summary_zh", "summary_en", "why_new_zh"])
      if (!o[f]) err("R2", `${where}: 缺 ${f}`);
    if (!DOMAINS.includes(o.domain)) err("R2", `${where}: domain 非法`);
    if (!MATURITY.includes(o.maturity)) err("R2", `${where}: maturity 非法`);
    if (extra && o.first_seen && !(/^\d{4}-\d{2}$/.test(o.first_seen.date) && /^https?:\/\//.test(o.first_seen.source_url)))
      err("R2", `${where}: first_seen 非法`);
  }
}
const CADENCE = ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly", "biennial", "event_driven"];
for (const s of sources) {
  if (!s.name || !/^https?:\/\//.test(s.url || "")) err("R2", `sources/${s.id}: 缺 name/url`);
  if (!CADENCE.includes(s.cadence)) err("R2", `sources/${s.id}: cadence 非法`);
  if (!["zh", "en"].includes(s.lang)) err("R2", `sources/${s.id}: lang 非法`);
  if (!s.what_to_look_for_zh) err("R2", `sources/${s.id}: 缺 what_to_look_for_zh`);
}

// ---------- R5: 引用完整性 ----------
const occIds = new Set(occupations.map((o) => o.id));
const mktIds = new Set(markets.map((m) => m.id));
const evtIds = new Set(events.map((e) => e.id));
for (const e of events) {
  for (const oid of e.occupation_ids || []) if (!occIds.has(oid)) err("R5", `events/${e.id}: occupation_id "${oid}" 不存在`);
  for (const mid of e.market_ids || []) if (!mktIds.has(mid)) err("R5", `events/${e.id}: market_id "${mid}" 不存在`);
}
for (const o of [...occupations, ...markets])
  for (const eid of o.event_ids || []) if (!evtIds.has(eid)) err("R5", `${o.id}: event_id "${eid}" 不存在`);

// ---------- 汇总 ----------
const theNumber = events
  .filter((e) => e.status === "published" && e.counted === true)
  .reduce((s, e) => s + e.jobs_count, 0);

if (errors.length) {
  console.error(`✗ 校验失败，${errors.length} 个问题：`);
  for (const m of errors) console.error("  " + m);
  process.exit(1);
}
console.log(`✓ 校验通过：${events.length} 事件 / ${occupations.length} 职业 / ${markets.length} 市场 / ${sources.length} 信源`);
console.log(`✓ The Number = ${theNumber}`);
```

- [x] **Step 1.5: 跑测试确认通过**

```bash
node --test tests/
```
预期：PASS（2 个测试）。

- [x] **Step 1.6: Commit**

```bash
git add data/schema scripts tests && git commit -m "feat: 数据模型 Schema 与零依赖校验器（R1-R5 数据纪律）"
```

---

### Task 2: 数据迁移——opportunities.json 拆分升级

**Files:**
- Create: `data/occupations.json`（6 条 role 升级）、`data/markets.json`（6 条 market 拆双语）
- Delete: `data/opportunities.json`

- [x] **Step 2.1: 写 occupations.json**

由现有 6 条 `type: "role"` 记录改造：字段改名 `summary→summary_zh`、`whyNew→why_new_zh`、`name` 拆 `name_zh`/`name_en`；新增 `summary_en`、`why_new_en`（实施时按 zh 翻译）、`aka`、`first_seen`、`official_recognition`、`salary_band: null`、`human_angle_zh/_en`、`event_ids: []`。英文名与已知考据：

| id | name_en | first_seen | official_recognition |
|----|---------|------------|----------------------|
| prompt-engineer | Prompt Engineer | null（P1 回补考据） | null |
| ai-evaluation-engineer | AI Evaluation Engineer | null | null |
| ai-red-teamer | AI Red Teamer | null | null |
| ai-product-manager | AI Product Manager | null | null |
| ai-trainer-annotator | AI Trainer / Data Annotation Specialist | `{"date":"2020-02","source_url":"https://www.mohrss.gov.cn/SYrlzyhshbzb/dongtaixinwen/buneiyaowen/202004/t20200430_367110.html"}` | "人社部第二批新职业（2020-02）：人工智能训练师" |
| ai-compliance-officer | AI Governance & Compliance Officer | null | null |

`human_angle_zh` 每条写 2~3 句"这个职业的人每天在做什么"（基于 summary 展开，写实不煽情）；`human_angle_en` 为其英译。`drift-bottles` 时代的 `signals` 字段并入 `summary` 语境后丢弃（spec §4.2 未保留该字段）。

- [x] **Step 2.2: 写 markets.json**

6 条 `type: "market"` 同法拆双语（`name_zh/name_en/summary_zh/summary_en/why_new_zh/why_new_en`），保留 `skills`、`examples`、`sources`，新增 `event_ids: []`，丢弃 `type` 与 `signals`。

- [x] **Step 2.3: 删除旧文件并跑校验**

```bash
git rm data/opportunities.json
DATA_DIR=data node scripts/validate.mjs
```
预期：`✓ 校验通过：0 事件 / 6 职业 / 6 市场 / 0 信源`——注意此时 events.json/sources.json 还不存在会报错，先写空数组文件：`echo '[]' > data/events.json && echo '[]' > data/sources.json`。

- [x] **Step 2.4: Commit**

```bash
git add -A data && git commit -m "feat: opportunities 拆分为 occupations/markets，双语化+词典字段升级"
```

---

### Task 3: 信源登记表 sources.json

**Files:**
- Modify: `data/sources.json`

- [x] **Step 3.1: 录入首批信源（两份调研报告全部信源，32 条）**

每条按 schema 写全 `id/name/url/cadence/lang/what_to_look_for_zh/last_checked:"2026-06-10"`。清单（id ｜ cadence ｜ lang ｜ url 取调研报告核实过的链接）：

全球轨（en）：`anthropic-economic-index`(quarterly) `stanford-hai-ai-index`(yearly) `wef-future-of-jobs`(biennial) `indeed-hiring-lab-ai-tracker`(daily, github.com/hiring-lab/ai-tracker) `linkedin-economic-graph`(yearly) `linkedin-jobs-on-the-rise`(yearly) `layoffs-fyi`(daily，P2 净账本用) `oecd-ai-wips`(event_driven) `imf-ai-preparedness-index`(yearly) `umd-linkup-ai-maps`(monthly) `yale-budget-lab-ai-tracker`(monthly) `pwc-ai-jobs-barometer`(yearly) `ilo-ai-observatory`(event_driven) `census-btos-ai`(biweekly) `fed-ai-adoption-notes`(event_driven) `openai-economic-blog`(event_driven) `bloomberry-blog`(event_driven) `ai-eating-the-world`(weekly) `goldman-sachs-ai-insights`(event_driven) `piie-realtime-econ`(event_driven)

中国轨（zh）：`mohrss-new-occupations`(yearly, 人社部职业上新) `mohrss-xzy-platform`(event_driven, 新职业在线学习平台) `caict-ai-reports`(yearly, 信通院) `gov-ai-plus-policy`(event_driven, "人工智能+"行动) `boss-zhipin-reports`(yearly) `zhilian-reports`(yearly) `liepin-reports`(quarterly) `maimai-gaopin-reports`(quarterly) `cier-index`(quarterly) `qbitai-think-tank`(event_driven) `jazzyear-reports`(event_driven) `tencent-research`(monthly) `ali-research`(event_driven) `aicpb-rankings`(monthly, AI 产品榜)

`what_to_look_for_zh` 一句话写明该信源能产出哪类事件（如 linkedin-economic-graph："年度报告中的 AI 岗位创造总量数字 → report_datapoint"）。

- [x] **Step 3.2: 校验 + Commit**

```bash
DATA_DIR=data node scripts/validate.mjs   # 预期 ✓ 34 信源（32+任何补充）
git add data/sources.json && git commit -m "feat: 信源登记表首批 30+ 信源（全球+中国双轨）"
```

---

### Task 4: 种子账本批次一（机构口径 + 官方认定，counted 全部 false）

**Files:**
- Modify: `data/events.json`

- [x] **Step 4.1: 录入 18 条种子事件**

全部来自调研报告已核实链接。事件表（id ｜ date ｜ kind ｜ body ｜ region ｜ jobs_count ｜ source.url）：

| # | id | date | kind | body / region | count | url |
|---|----|------|------|---------------|-------|-----|
| 1 | `2026-01-linkedin-1300k-ai-jobs` | 2026-01-20 | report_datapoint | LinkedIn / Global | null | economicgraph.linkedin.com 报告 PDF（调研报告链接） |
| 2 | `2026-01-linkedin-600k-datacenter` | 2026-01-20 | report_datapoint | LinkedIn / Global | null | 同上（WEF 转载页亦可） |
| 3 | `2025-01-wef-future-of-jobs-net78m` | 2025-01-07 | report_datapoint | World Economic Forum / Global | null | weforum.org/publications/the-future-of-jobs-report-2025/ |
| 4 | `2026-01-boss-zhipin-ai-741pct` | 2026-01-23 | report_datapoint | BOSS直聘 / CN | null | 央广网报道链接 |
| 5 | `2025-12-maimai-ai-543pct` | 2025-12-12 | report_datapoint | 脉脉高聘 / CN | null | 新浪科技链接 |
| 6 | `2025-10-zhilian-ai-pm-144pct` | 2025-10-24 | report_datapoint | 智联招聘 / CN | null | 21经济网链接 |
| 7 | `2026-02-liepin-ai-salary-premium` | 2026-02-05 | report_datapoint | 猎聘 / CN | null | 新浪科技链接 |
| 8 | `2025-05-pwc-ai-jobs-up-75pct` | 2025-05-06 | report_datapoint | PwC / Global | null | pwc.com AI Jobs Barometer |
| 9 | `2026-01-indeed-ai-mentions-5pct` | 2026-01-22 | report_datapoint | Indeed Hiring Lab / US | null | hiringlab.org 2026-01-22 文章 |
| 10 | `2026-05-umd-aimaps-30594-monthly` | 2026-05-31 | report_datapoint | UMD-LinkUp AI Maps / US | null | aimaps.ai |
| 11 | `2026-03-cier-llm-jobs-32x` | 2026-03-31 | report_datapoint | 中国人民大学 CIER / CN | null | 新浪财经链接 |
| 12 | `2025-12-caict-ai-industry-1200b` | 2025-12-15 | report_datapoint | 中国信通院 / CN | null | 新华网链接 |
| 13 | `2026-01-imf-sdn-new-jobs-skills` | 2026-01-09 | report_datapoint | IMF / Global | null | imf.org SDN/2026/001 |
| 14 | `2026-04-stanford-aiindex-skill-share` | 2026-04-15 | report_datapoint | Stanford HAI / Global | null | hai.stanford.edu 2026 经济章 |
| 15 | `2020-02-mohrss-batch2-ai-trainer` | 2020-02-25 | official_listing | 人社部 / CN | null | mohrss.gov.cn 链接 |
| 16 | `2024-07-mohrss-batch6-genai-operator` | 2024-07-31 | official_listing | 人社部 / CN | null | 一财/网信办链接 |
| 17 | `2025-07-mohrss-batch7-genai-tester` | 2025-07-22 | official_listing | 人社部 / CN | null | 新华网链接 |
| 18 | `2025-09-openai-jobs-platform` | 2025-09-04 | hiring_commitment | OpenAI / US | null | openai.com/index/expanding-economic-opportunity-with-ai/ |

通用字段：`confidence: "report_estimated"`（15-17 官方认定与 18 用 `company_stated`）、`counted: false`（批次一全部不计数；18 无具体岗位数所以也不计数）、`status: "published"`、`quote_zh/quote_en` 摘原文关键句（中文源配英译标 `(translated)`，英文源配中译）、关联 `occupation_ids`（如 15→`["ai-trainer-annotator"]`）。具体 URL 一律从调研报告原文复制，禁止凭记忆改写。

- [x] **Step 4.2: 反向回填关联 + 校验 + Commit**

occupations.json 中 `ai-trainer-annotator.event_ids` 加 `"2020-02-mohrss-batch2-ai-trainer"`，其余职业/市场按语义回填（没有就留空）。

```bash
DATA_DIR=data node scripts/validate.mjs   # 预期 ✓ 18 事件，The Number = 0
git add data && git commit -m "feat: 种子账本批次一——18 条机构口径与官方认定事件（全部带来源）"
```

---

### Task 5: collector 规范 + 首跑采集（让 The Number > 0）

**Files:**
- Create: `agents/collector.md`
- Modify: `data/events.json`、`data/sources.json`(last_checked)

- [x] **Step 5.1: 写 collector.md**

内容骨架（写全文，不留 TBD）：

```markdown
# Collector Agent 规范

## 使命
扫描 data/sources.json 中的信源与公开新闻，产出符合 event.schema.json 的候选事件草稿（status: draft），
经人工终审后发布。只记"来源自己说的"，不做推断。

## 入选标准
1. 来源明确把新增岗位/团队/职业归因于 AI（原文含 AI/人工智能/大模型等限定）
2. 必须有可公开访问的 URL（拒收仅付费墙来源）
3. company_stated 优先；机构估算一律 report_datapoint + counted:false
4. counted:true 仅当：公司/政府亲口宣布 + 明确岗位数 + hiring_commitment/team_formation

## 搜索配方（每次运行至少跑全一组）
- en: "company announces" + ("AI jobs" | "new AI roles" | "AI team hiring") + 本月
- en: "data center" + ("construction jobs" | "operations jobs") + AI + announcement
- zh: 「宣布」+（「AI 岗位」|「AI 招聘」|「新增就业」）+ 近30天
- 财报电话会：earnings call transcript + "hiring for AI"
- 政府：白宫/国务院/地方政府 AI 投资带就业承诺公告

## 产出格式
每条候选 = 一个完整 event JSON 对象 + 一行理由（为何可信、口径是什么）。
查重：against data/events.json 全量 id 与同公司同月事件。
URL 必须实际访问验证可达且内容与 quote 一致。

## 质量红线
- quote 必须是原文逐字（中文源给原句，英文源给原句）
- 数字口径写进 notes_zh（如"含承包商"/"五年累计"）
- 不确定就降级：拿不准 company_stated 时标 report_estimated + counted:false
```

- [x] **Step 5.2: 首跑采集（执行者亲自跑，目标 ≥5 条 counted 事件）**

按 collector.md 的搜索配方执行 WebSearch：重点搜 2025H2-2026H1 的公司/政府 AI 招聘承诺硬数字（数据中心建设运维、AI 实验室扩张、制造业 AI 产线、主权 AI 基建等都是高产区）。每条候选：访问 URL 验证可达 + quote 逐字核对 + 按 schema 写入 events.json（`status: "published"`，counted 按红线判定）。同时把用到的信源 `last_checked` 更新为执行日。

验收：`DATA_DIR=data node scripts/validate.mjs` 输出 `The Number ≥ 10000`（5 条以上带数字的承诺，数据中心类单条常为千~万级；若实际采集低于此值，如实保留真实数字，不凑数）。

- [x] **Step 5.3: Commit**

```bash
git add agents data && git commit -m "feat: collector 采集规范 + 首跑——首批 counted 事件入账，The Number 上线"
```

---

### Task 6: 方法论文档 + 研究框架 v2

**Files:**
- Create: `docs/methodology.md`
- Modify: `docs/research-framework.md`

- [x] **Step 6.1: 写 methodology.md**

章节与内容（全文照 spec §5/§4.1.1 展开，此处为必含要点）：
1. **The Number 计数规则**——spec §5 五条件逐条列出 + "保守下限"定位声明
2. **入选标准**——"只记来源自己说的"原则 + kind 四枚举定义 + 排除项（无来源、纯付费墙、传言）
3. **双轨展示原则**——账本累加 vs 机构口径对照，永不混加，附 1 的事件示例
4. **纠错政策**——GitHub Issue 模板入口、确认错误后修正并在更正日志留痕（git 历史公开）
5. **如何引用**——格式：`AI Growth Markets, "事件标题", 检索于 YYYY-MM-DD, <URL>`；数据许可 CC BY 4.0
6. **已知局限**——承诺≠到岗（P2 做回访核查）、覆盖偏差（英文中文信源为主）、AI-washing 风险声明

- [x] **Step 6.2: research-framework.md v2**

改三处：① 数据模型一节替换为指向 `data/schema/` 的四实体说明；② 增加"事件账本方法论见 methodology.md"链接；③ 删除已废弃的 opportunities.json 字段表。保留分类维度（domain/maturity 枚举继续有效）。

- [x] **Step 6.3: Commit**

```bash
git add docs && git commit -m "docs: 计数方法论与研究框架 v2"
```

---

### Task 7: 网站 v1

**Files:**
- Rewrite: `web/index.html`；Create: `web/style.css`、`web/app.js`、`web/i18n.js`、`web/methodology.html`

- [x] **Step 7.1: i18n.js——语言机制**

```js
// ============================================================
// 双语机制：UI 文案查字典，数据字段按后缀取值
// ============================================================
export const LANG_KEY = "agm-lang";
export const getLang = () =>
  localStorage.getItem(LANG_KEY) || (navigator.language?.startsWith("zh") ? "zh" : "en");
export const setLang = (l) => { localStorage.setItem(LANG_KEY, l); location.reload(); };
// 数据字段：summary_zh / summary_en → t(obj, "summary")
export const t = (obj, field, lang) => obj[`${field}_${lang}`] || obj[`${field}_zh`] || obj[`${field}_en`] || "";

export const UI = {
  zh: {
    tagline: "AI 正在创造哪些新工作？每一行都有来源。",
    theNumberLabel: "账本已记录的 AI 创造岗位（可逐行核查的保守下限）",
    refStrip: "机构口径对照（参照系，不与账本相加）",
    ledger: "事件账本", dictionary: "新职业词典", markets: "增量市场",
    methodology: "方法论", download: "下载数据", cite: "如何引用", lastUpdated: "最后更新",
    filterAll: "全部", countedOnly: "只看入账事件", source: "来源", firstSeen: "首次出现",
    official: "官方认定", humanAngle: "这行的人每天在做什么",
    kinds: { hiring_commitment: "招聘承诺", team_formation: "新建团队", official_listing: "官方认定", report_datapoint: "机构口径" },
  },
  en: {
    tagline: "What is AI creating? Every row has a source.",
    theNumberLabel: "AI-created jobs on the ledger (a verifiable, conservative floor)",
    refStrip: "Institutional benchmarks (reference only — never added to our ledger)",
    ledger: "The Ledger", dictionary: "New-Job Dictionary", markets: "Growth Markets",
    methodology: "Methodology", download: "Download data", cite: "Cite us", lastUpdated: "Last updated",
    filterAll: "All", countedOnly: "Counted only", source: "Source", firstSeen: "First seen",
    official: "Official recognition", humanAngle: "A day in this job",
    kinds: { hiring_commitment: "Hiring commitment", team_formation: "Team formation", official_listing: "Official listing", report_datapoint: "Report datapoint" },
  },
};
```

- [x] **Step 7.2: app.js——数据加载与渲染核心**

关键逻辑（完整实现按此扩展，渲染函数逐段拼 DOM）：

```js
// ============================================================
// 数据加载：Pages 部署时 data/ 被拷入站点根，本地预览回退 ../data/
// ============================================================
async function loadJSON(name) {
  for (const base of ["data/", "../data/"]) {
    try { const r = await fetch(base + name, { cache: "no-store" }); if (r.ok) return r.json(); } catch {}
  }
  throw new Error(`无法加载 ${name}`);
}
const [events, occupations, markets] = await Promise.all(
  ["events.json", "occupations.json", "markets.json"].map(loadJSON));

// ---------- The Number：与 validate.mjs 同一规则，永远逐行可对 ----------
const published = events.filter((e) => e.status === "published");
const theNumber = published.filter((e) => e.counted).reduce((s, e) => s + e.jobs_count, 0);

// ---------- 渲染序列 ----------
// renderHero(theNumber, lastUpdated=max(e.date))
// renderRefStrip(published.filter(e => e.kind === "report_datapoint").slice 精选)
// renderLedger(published 按 date desc, 筛选器: kind/region/countedOnly)
//   行展开 = quote + publisher + 原文链接 + notes
// renderDictionary(occupations: 卡片 + 展开面板含 first_seen/official_recognition/human_angle/关联事件)
// renderMarkets(markets: 简化卡片)
```

The Number 数字格式：`toLocaleString()`（如 12,400），hero 副行始终带"保守下限"定位语，杜绝表演式计数。

- [x] **Step 7.3: index.html + style.css**

结构：`<header>`(品牌 + 语言切换钮) → Hero(The Number) → 参照条 → 三个 tab 区（账本表 / 词典卡片网格 / 市场卡片）→ footer（方法论链接 + 数据下载 data/*.json 直链 + 引用格式 + GitHub 仓库/纠错 Issue 链接 + CC BY 4.0）。样式沿用现有暗色观察站体系（从旧 index.html 的 `:root` 变量起步：`--bg:#0b0f19` 系），表格行 hover 展开、卡片网格复用旧 `.card` 样式语言；新增 `--counted:#7ee0c0` 强调入账行。移动端单列。中文字体栈保留 `Noto Sans SC`。

- [x] **Step 7.4: methodology.html**

静态页：把 docs/methodology.md 的内容手工转为 HTML 章节（不引 md 渲染库，保持零依赖），顶部同款 header，可切语言（正文 v1 先中文为主、关键规则双语）。

- [x] **Step 7.5: 本地验证**

```bash
cd "/Users/limitless/Desktop/Projects/AI Growth Market" && python3 -m http.server 8800
```
浏览器检查 `http://localhost:8800/web/`：① The Number 与 validate.mjs 输出一致；② 账本行展开可见 quote 与来源链接；③ 语言切换全 UI 生效且 localStorage 记忆；④ 筛选器工作；⑤ 移动宽度（375px）不破版。用 browse/preview 工具截图留证。

- [x] **Step 7.6: Commit**

```bash
git add web && git commit -m "feat: 网站 v1——The Number/事件账本/新职业词典/方法论页，中英双语"
```

---

### Task 8: CI——数据校验 + Pages 部署

**Files:**
- Create: `.github/workflows/validate.yml`、`.github/workflows/pages.yml`

- [x] **Step 8.1: validate.yml**

```yaml
name: validate-data
on:
  push: { branches: [main] }
  pull_request:
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: node scripts/validate.mjs
      - run: node --test tests/
```

- [x] **Step 8.2: pages.yml**

```yaml
name: deploy-pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - uses: actions/checkout@v4
      - name: Assemble site            # ── web/ 为站点根，数据拷入 data/ ──
        run: |
          mkdir -p _site
          cp -r web/* _site/
          cp -r data _site/data
          touch _site/.nojekyll
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [x] **Step 8.3: Commit**

```bash
git add .github && git commit -m "ci: 数据校验与 GitHub Pages 部署工作流"
```

---

### Task 9: README + 上线

**Files:**
- Rewrite: `README.md`

- [x] **Step 9.1: 重写 README（双语门面）**

结构：中文在前英文在后。① 一句话定位 + 线上地址徽章；② The Number 是什么/怎么算（链 methodology）；③ 三层产品结构表；④ 数据下载与引用格式（CC BY 4.0）；⑤ 贡献指南（提交事件 = 复制 event 模板开 PR，CI 自动校验；纠错走 Issue）；⑥ Roadmap（P0 ✅ → P1 定时采集 → P2 净账本 → P3 市场看板 → P4 社区）；⑦ 项目方法论与 spec/plan 文档索引。

- [x] **Step 9.2: 推送 + 启用 Pages**

```bash
git add README.md && git commit -m "docs: README v1——项目门面与贡献指南"
git push origin main
gh api -X POST "repos/Limitless2023/ai-growth-markets/pages" -f build_type=workflow 2>&1 || \
gh api -X PUT  "repos/Limitless2023/ai-growth-markets/pages" -f build_type=workflow
gh run watch --repo Limitless2023/ai-growth-markets $(gh run list --repo Limitless2023/ai-growth-markets --workflow deploy-pages --limit 1 --json databaseId --jq '.[0].databaseId')
```

- [x] **Step 9.3: 线上验证（P0 完成判据，spec §9）**

逐项核对：① `https://limitless2023.github.io/ai-growth-markets/` 公网可访问；② The Number 显示且与 `node scripts/validate.mjs` 本地输出一致；③ 随机抽 3 行事件点开来源链接全部可达；④ 语言切换正常；⑤ `…/data/events.json` 可直接下载；⑥ Actions 两个 workflow 全绿。任何一项不过即修复后重新验证，全过才算 P0 完成。

---

## Plan 自检记录

1. **Spec 覆盖**：§3 三层产品→Task 7；§4 数据模型→Task 1/2/3/4；§5 计数→Task 1(R3/R4)+7.2 同规则双实现；§6 管线（P0 范围=collector 规范+手动首跑）→Task 5；§7 产品形态→Task 7；§8 架构/目录→全部 Task 对应；§9 P0 完成判据→Task 9.3 逐项核对；§12 非目标未被引入。无缺口。
2. **占位符扫描**：无 TBD/TODO；内容创作型步骤（双语条目、README）均给定字段级清单+示例+来源约束，属完整创作指令而非占位。
3. **类型一致性**：`counted/jobs_count/confidence` 规则在 schema(Task1)、validate.mjs(Task1)、app.js(Task7.2) 三处口径一致（published+counted→Σjobs_count）；字段后缀 `_zh/_en` 全计划统一；`DATA_DIR` 环境变量测试与脚本一致。
