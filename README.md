# AI 新工作账本 · The AI Jobs Ledger

> **AI 创造侧的公共账本** —— AI 正在创造哪些新工作、新职业、新市场？每一行都有来源。
> *The public ledger of what AI is creating — new jobs, new roles, new markets. Every row has a source.*

🌐 **线上访问**：https://limitless2023.github.io/ai-growth-markets/

[![validate-data](https://github.com/Limitless2023/ai-growth-markets/actions/workflows/validate.yml/badge.svg)](https://github.com/Limitless2023/ai-growth-markets/actions/workflows/validate.yml)
[![deploy-pages](https://github.com/Limitless2023/ai-growth-markets/actions/workflows/pages.yml/badge.svg)](https://github.com/Limitless2023/ai-growth-markets/actions/workflows/pages.yml)
[![License: CC BY 4.0](https://img.shields.io/badge/data-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

---

## 这是什么

关于"AI 抢走多少工作"，全网有 layoffs.fyi 和至少六个追踪站；关于"AI **创造**了多少工作"，只有每年达沃斯发一次的 PDF。这个项目补上缺的那半句话：

| 层 | 名称 | 是什么 |
|----|------|--------|
| 头条层 | **The Number** | 账本中所有「当事方亲口宣布、带明确数字」的 AI 岗位承诺之和——**可逐行核查的保守下限** |
| 引擎层 | **事件账本** | 逐条记录"谁、在什么时候、宣布了什么"，每行带来源链接与原文引述 |
| 灵魂层 | **新职业词典** | AI 催生的新职业的物种档案：首现时间、官方认定、"做这行的人每天在干什么" |

**The Number 怎么算、什么能入账、什么永不入账** → 见 [方法论](docs/methodology.md)（核心规则：只计 `company_stated`，机构估算永远只做参照系，两轨永不相加）。

## 数据下载 · Open Data

数据即仓库，许可 **CC BY 4.0**（自由使用，须署名）：

- [`data/events.json`](data/events.json) — 事件账本
- [`data/occupations.json`](data/occupations.json) — 新职业词典
- [`data/markets.json`](data/markets.json) — 增量市场
- [`data/sources.json`](data/sources.json) — 信源登记表（34+ 信源，全球+中国双轨）

**引用格式**：

> AI Growth Markets, "<事件标题或 The Number>", retrieved YYYY-MM-DD, https://limitless2023.github.io/ai-growth-markets/

## 如何贡献 · Contributing

**提交新事件**：复制 [`data/schema/event.schema.json`](data/schema/event.schema.json) 约定的格式，向 `data/events.json` 追加记录并开 PR。硬性要求（CI 自动校验 + 人工终审）：

1. `source.url` 必填且公开可访问，`quote` 忠实原文
2. 只记"来源自己说的"——AI 归因必须是来源说的，不是你推断的
3. 机构估算一律 `report_datapoint` + `counted: false`
4. 本地自检：`node scripts/validate.mjs`

**纠错**：发现来源失效/数字不符/归因错误 → [提 Issue](https://github.com/Limitless2023/ai-growth-markets/issues)，指明事件 `id`。核实即改，git 历史公开留痕。

采集自动化规范见 [`agents/collector.md`](agents/collector.md)——本项目由 AI agent 采集草稿、人工终审发布（**永不全自动发布**）。

## Roadmap

- [x] **P0** — 数据模型 + 种子账本 + 网站 v1（The Number / 账本 / 词典）+ CI + 上线
- [ ] **P1** — collector 定时化、周更节奏、一键引用、SEO
- [ ] **P2** — 净账本（创造 vs 替代对置）、月度趋势简报、AI-washing 回访核查
- [ ] **P3** — 增量市场看板（融资/规模/招聘指标）
- [ ] **P4** — 社区共建、多语扩展

## 项目文档

- [方法论 · Methodology](docs/methodology.md) — 计数规则/入选标准/纠错政策
- [研究框架 · Research Framework](docs/research-framework.md) — 分类维度与数据结构
- [设计文档 · Design Spec](docs/superpowers/specs/2026-06-10-ai-growth-markets-design.md)
- [实施计划 · P0 Plan](docs/superpowers/plans/2026-06-10-ai-growth-markets-p0.md)

本地开发：`python3 -m http.server 8800` → 打开 `http://localhost:8800/web/`；数据校验：`node scripts/validate.mjs`；测试：`node --test tests/*.test.mjs`。

---

*维护：[@Limitless2023](https://github.com/Limitless2023) · 数据为公开来源的事件级聚合，使用前请核对原始来源。*
