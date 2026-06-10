#!/usr/bin/env node
// ============================================================
// AI Growth Markets 数据校验器（零依赖）
// 规则编号与报错绑定，CI 与本地共用：
//   R1 id 唯一            R2 必填字段/枚举/格式
//   R3 counted 计数纪律    R4 report_datapoint 永不计数
//   R5 引用完整性
// 用法：DATA_DIR=data node scripts/validate.mjs
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

// ---------- R1: id 唯一 + 基础 id 格式 ----------
for (const [name, arr] of [
  ["events", events],
  ["occupations", occupations],
  ["markets", markets],
  ["sources", sources],
]) {
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
  if (
    e.jobs_count !== null &&
    e.jobs_count !== undefined &&
    (!Number.isInteger(e.jobs_count) || e.jobs_count < 1)
  )
    err("R2", `${where}: jobs_count 必须为正整数或 null`);

  // ---------- R3: 计数纪律（spec §5 五条件） ----------
  if (e.counted === true) {
    if (!Number.isInteger(e.jobs_count) || e.jobs_count < 1) err("R3", `${where}: counted 但无合法 jobs_count`);
    if (e.confidence !== "company_stated") err("R3", `${where}: counted 但 confidence 非 company_stated`);
    if (!["hiring_commitment", "team_formation"].includes(e.kind)) err("R3", `${where}: counted 但 kind 不可计数`);
  }
  // ---------- R4: 机构口径永不入账 ----------
  if (e.kind === "report_datapoint" && e.counted === true) err("R4", `${where}: report_datapoint 不得 counted`);
}

// ---------- R2: 职业/市场必填 ----------
const DOMAINS = ["infrastructure", "data", "product", "safety", "governance", "creative", "enablement"];
const MATURITY = ["emerging", "growing", "established"];
for (const [name, arr, isOcc] of [
  ["occupations", occupations, true],
  ["markets", markets, false],
]) {
  for (const o of arr) {
    const where = `${name}/${o.id}`;
    for (const f of ["name_zh", "name_en", "summary_zh", "summary_en", "why_new_zh"])
      if (!o[f]) err("R2", `${where}: 缺 ${f}`);
    if (!DOMAINS.includes(o.domain)) err("R2", `${where}: domain 非法`);
    if (!MATURITY.includes(o.maturity)) err("R2", `${where}: maturity 非法`);
    if (
      isOcc &&
      o.first_seen &&
      !(/^\d{4}-\d{2}$/.test(o.first_seen.date || "") && /^https?:\/\//.test(o.first_seen.source_url || ""))
    )
      err("R2", `${where}: first_seen 非法`);
  }
}

// ---------- R2: 信源必填 ----------
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
  for (const oid of e.occupation_ids || [])
    if (!occIds.has(oid)) err("R5", `events/${e.id}: occupation_id "${oid}" 不存在`);
  for (const mid of e.market_ids || [])
    if (!mktIds.has(mid)) err("R5", `events/${e.id}: market_id "${mid}" 不存在`);
}
for (const o of [...occupations, ...markets])
  for (const eid of o.event_ids || [])
    if (!evtIds.has(eid)) err("R5", `${o.id}: event_id "${eid}" 不存在`);

// ---------- 汇总：The Number 与渲染端同一规则 ----------
const theNumber = events
  .filter((e) => e.status === "published" && e.counted === true)
  .reduce((s, e) => s + e.jobs_count, 0);

if (errors.length) {
  console.error(`✗ 校验失败，${errors.length} 个问题：`);
  for (const m of errors) console.error("  " + m);
  process.exit(1);
}
console.log(
  `✓ 校验通过：${events.length} 事件 / ${occupations.length} 职业 / ${markets.length} 市场 / ${sources.length} 信源`
);
console.log(`✓ The Number = ${theNumber}`);
