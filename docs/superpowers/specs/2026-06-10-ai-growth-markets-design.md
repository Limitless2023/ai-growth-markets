# AI Growth Markets · 项目设计文档

- **日期**：2026-06-10
- **状态**：已批准（用户在设计呈现第一批确认后给予充分授权）
- **仓库**：https://github.com/Limitless2023/ai-growth-markets
- **本文性质**：brainstorming 产出的项目级 spec，是后续实施计划的唯一依据

---

## 0. 一句话定位

> **AI 创造侧的公共账本** —— AI 正在创造哪些新工作、新职业、新市场，每一行都有来源。

英文表述：*The public ledger of what AI is creating — new jobs, new roles, new markets. Every row has a source.*

## 1. 背景与机会（竞品调研结论摘要，2026-06-10）

调研覆盖全球与中文世界两条线（两个独立 research agent，30+ 信源逐项核实），核心结论：

1. **生态位真空已核实**：「持续更新 + 公众可访问 + 交互式 + 追踪 AI *创造侧*」在全球范围内不存在成型项目。最接近的 UMD-LinkUp AI Maps 仅覆盖美国、只认"需要 AI 技能的职位"、零传播工程。
2. **替代侧严重内卷**：layoffs.fyi + 至少 6 个 AI 裁员追踪站 + 2 个匿名实时计数器；AI 归因口径混乱（20%~55%），媒体已在讨论 AI-washing。
3. **需求已验证、供给为零**：LinkedIn「AI 已创造 130 万新岗位」被全网引用，但该数字每年只随达沃斯 PDF 更新一次。媒体写稿都在手工拼接"创造 vs 裁员"两边数字——创造侧的标配引用源空缺。
4. **中文世界零竞争**：不存在任何持续更新的网站型追踪项目（全是一次性 PDF）；GitHub 检索"AI 新职业"为 0 个仓库。
5. **原材料免费可机读**：Indeed 日更 CSV、美国普查局 BTOS 双周 AI 采用率、Anthropic 开放数据集、人社部七批 110 个新职业、信通院 1.2 万亿口径等——缺的只是组装者。
6. **时间窗口**：参照替代侧演化周期，"创造侧的 layoffs.fyi 时刻"预计在 12 个月内被占走。

**layoffs.fyi 胜利公式**（本项目的形态范本）：单一页面 + 单一数字 + 每行带来源 + 免费可引用 + 先发占位。

## 2. 核心决策（已与用户逐项确认）

| # | 决策点 | 选择 | 理由 |
|---|--------|------|------|
| 1 | 核心受众 | **公共观察站**（媒体/研究者/大众），可引用性是核心资产 | 最贴合"所有人都可看、观察、跟踪"与"AI 与人的关系"的愿景 |
| 2 | 更新机制 | **Agent 采集 + 人工终审**（PR 流） | 可信度与可持续的平衡点；"AI 项目用 AI 运营"的叙事 |
| 3 | 首发切入口 | **A 事件账本为引擎 + C 新职业词典为灵魂**；B 净账本 → P2；D 市场看板 → P3 | A 方法论最防攻击且与更新机制咬合；C 承载人文叙事 |
| 4 | 语言与口径 | **中英双语、全球 + 中国双轨** | 双向套利：官方中文数据出海（英文稀缺）+ 国际追踪汉化持续化（中文零竞争） |
| 5 | 命名 | 仓库保留 `ai-growth-markets`；产品名候选 `aihires.fyi` / `newjobs.fyi` / `created.fyi`（实施期查验域名后定）；中文品牌「AI 新工作账本」 | `.fyi` 域名家族故意继承 layoffs.fyi 认知血统 |

## 3. 产品结构（三层）

| 层 | 名称 | 作用 |
|----|------|------|
| 头条层 | **The Number** | 持续累加的大数字："账本已记录 AI 创造 X 个岗位"——媒体引用钩子 |
| 引擎层 | **事件账本 (Ledger)** | 逐条记录"某公司/某政策宣布因 AI 新增岗位"，每行带来源链接 + 原文引述 |
| 灵魂层 | **新职业词典 (Dictionary)** | 新职业的"物种档案"：首现时间、定义、技能、薪资带、官方认证、"做这行的人每天在干什么" |

"AI 与人的关系"视角落点：词典的 `human_angle` 字段 + 事件流自动滋养词典（账本里反复出现的岗位类型沉淀为新词条）。

## 4. 数据模型

所有数据为仓库内 JSON 文件，**开放数据是默认属性**（CC BY 4.0，要求署名引用）。文本字段采用 `*_zh` / `*_en` 平行键。

### 4.1 Event 事件（`data/events.json`）——账本行

```jsonc
{
  "id": "2026-06-acme-agent-ops-500",        // 唯一，kebab-case，含年月-主体-语义
  "date": "2026-06-08",                       // 来源发布日期
  "company_or_body": "Acme Corp",             // 公司或机构/政府名
  "region": "US",                             // ISO 国家码 或 "Global"
  "kind": "hiring_commitment",                // 见 4.1.1
  "jobs_count": 500,                          // 可为 null（有事件无数字）
  "jobs_type_zh": "Agent 运维工程师",
  "jobs_type_en": "Agent Operations Engineer",
  "occupation_ids": ["agent-ops"],            // 关联词典（可空）
  "market_ids": [],                           // 关联市场（可空）
  "source": {
    "url": "https://...",                     // 必填
    "publisher": "Reuters",
    "date": "2026-06-08",
    "quote_zh": "原文关键句中译",
    "quote_en": "Exact quote from source"
  },
  "confidence": "company_stated",             // company_stated | report_estimated
  "counted": true,                            // 是否计入 The Number，见 §5
  "status": "published",                      // draft | verified | published
  "notes_zh": ""                              // 口径备注（如统计区间）
}
```

#### 4.1.1 kind 枚举

- `hiring_commitment` — 公司/政府公开宣布因 AI 新增 N 个岗位或新建团队的招聘承诺
- `team_formation` — 新设 AI 相关部门/团队（可无具体数字）
- `official_listing` — 官方新职业认定（如人社部批次收录某职业）
- `report_datapoint` — 机构报告中的创造侧数据点（LinkedIn 1.3M 等），**永不计入 The Number**，仅入参照系

**入选纪律：只记"来源自己说的"。** 把"什么算 AI 创造的岗位"的定义争议外包给来源——账本记录的是"谁在什么时候宣布了什么"，这是方法论防攻击的关键。

### 4.2 Occupation 新职业（`data/occupations.json`）——词典条目

在现有字段（id/name/domain/maturity/summary/whyNew/signals/skills/examples/sources）基础上拆双语并新增：

| 新增字段 | 说明 |
|----------|------|
| `first_seen` | `{ "date": "YYYY-MM", "source_url": "..." }` 该职业名可考的最早出现——"物种发生时间线" |
| `aka` | 别名数组（中英混合） |
| `salary_band` | `{ "region", "low", "high", "currency", "period", "source_url" }`，可为 null |
| `official_recognition` | 如 `"人社部第六批（2024-07）：生成式人工智能系统应用员"`，可为 null |
| `human_angle_zh/_en` | 一段"做这行的人每天在干什么"——人文叙事落点 |
| `event_ids` | 关联账本事件（账本滋养词典） |

### 4.3 Market 增量市场（`data/markets.json`）

现有 6 条 market 数据沿用原模型（拆双语），P3 前不扩展指标。

### 4.4 Source 信源登记表（`data/sources.json`）——collector agent 的扫描清单

```jsonc
{
  "id": "linkedin-economic-graph",
  "name": "LinkedIn Economic Graph",
  "url": "https://economicgraph.linkedin.com/",
  "cadence": "yearly",          // daily | weekly | monthly | quarterly | yearly | event_driven
  "lang": "en",
  "what_to_look_for_zh": "年度劳动力市场报告中的 AI 岗位创造数字",
  "last_checked": "2026-06-10"
}
```

首批信源直接从两份调研报告提炼（30+ 个，含全球与中文两轨）。

### 4.5 JSON Schema 校验（`data/schema/*.schema.json`）

CI 强制：来源 URL 必填且为合法 URL、id 唯一、日期合法、枚举值合法、`counted: true` 时 `jobs_count` 必须为正整数且 `confidence` 为 `company_stated`。

## 5. 计数方法论（The Number）

**The Number = Σ jobs_count，取自满足以下全部条件的事件：**

1. `status == "published"`
2. `counted == true`
3. `confidence == "company_stated"`（机构估算永不入账）
4. `kind ∈ { hiring_commitment, team_formation }`
5. `jobs_count` 为明确正整数（无数字的事件入账本但不入计数）

设计含义：**The Number 是"可逐行核查的保守下限"**，与 LinkedIn 1.3M 等机构口径分轨展示、永不混加。"我们的数字小，但每一个都能点开看到来源原文"——这是与所有转载号的核心差异，也是防双重计算的结构性保证。

方法论页（`docs/methodology.md` → 站点页面）公开：计数规则全文、入选/排除标准、纠错政策（发现错误 → GitHub Issue → 修正并在 git 历史留痕）、引用格式。

## 6. 更新管线

```
data/sources.json（信源登记表）
   │  collector agent（日扫快源 / 周扫慢源 / 事件驱动）
   ▼
候选事件草稿（自动开 GitHub PR，status: draft，附来源引述）
   │  人工终审：改 / 删 / 通过 ≈ 每天 10 分钟 PR review
   ▼
merge（status → published）→ Pages 自动重建 → The Number 自动更新
   │
   └─ 月度：agent 汇总当月账本 → 趋势简报（传播素材，P2 起）
```

- **审核流 = GitHub PR 流**：全部修订历史公开，本身就是可信度资产。
- **断更保护**：agent 持续产草稿，维护者缺席只造成待审积压而非项目死亡。
- **P0 阶段**：collector 以 `agents/collector.md` 提示词规范 + 手动触发跑通；定时化（scheduled agent / GitHub Action cron）在 P1 落地。

## 7. 产品形态（网站 v1）

纯静态、中英切换（默认按浏览器语言，手动切换存 localStorage）：

1. **主页**
   - Hero：The Number 大数字 + "每一行都有来源 / Every row has a source" + 最后更新日期
   - 机构口径对照条：LinkedIn 1.3M、WEF 净增 7800 万（2030 预测）、人社部 110 个新职业——标注"参照系，不与账本混加"
   - 事件账本表：可排序/筛选（日期、地区、kind、是否计数），每行展开见原文引述与来源链接
   - 新职业词典区：卡片网格（沿用现有暗色观察站视觉），卡片展开见首现时间线、官方认证、human_angle
   - 数据下载（JSON/CSV）+ 纠错入口（GitHub Issue）+ "如何引用我们"
2. **方法论页**：§5 全文 + 信源清单 + 纠错政策
3. 部署：GitHub Pages（免费、支持后续自定义域名）

视觉语言：沿用现有暗色系观察站风格，实施阶段用 frontend-design 技能精修；不引入框架。

## 8. 技术架构与目录结构

原则：**零运维、零成本、开放优先**——独立维护者可长期持续。

```
ai-growth-markets/
├── README.md                        # 项目门面（双语）
├── docs/
│   ├── methodology.md               # 计数规则/入选标准/纠错政策（站点方法论页源头）
│   ├── research-framework.md        # 研究框架 v2（升级现有文档）
│   └── superpowers/specs/           # 设计文档（本文）
├── data/
│   ├── events.json                  # 事件账本（核心新增）
│   ├── occupations.json             # 新职业词典（由现有 6 条 role 升级）
│   ├── markets.json                 # 增量市场（现有 6 条 market 沿用）
│   ├── sources.json                 # 信源登记表（调研报告 30+ 信源入库）
│   └── schema/                      # JSON Schema
├── agents/
│   └── collector.md                 # 采集 agent 提示词规范
├── scripts/
│   └── validate.mjs                 # 数据校验（Node 零依赖，本地 + CI 共用）
├── web/
│   └── index.html                   # 静态站（含方法论页路由或独立 html）
└── .github/workflows/
    ├── validate.yml                 # PR 数据校验
    └── pages.yml                    # GitHub Pages 部署
```

技术取舍：无框架无构建步骤（贡献门槛为零）；The Number 由前端从 events.json 实时计算（数字与账本永远逐行对得上）；`opportunities.json` 拆分为 occupations/markets 后删除（上线前破坏性变更可接受）。

## 9. 演进路线

| 阶段 | 内容 | 完成判据 |
|------|------|----------|
| **P0（本次实施）** | 数据模型重构、种子账本（调研报告中可溯源数据点 + 首轮采集，目标 ≥20 条事件）、词典 v0（6 条升级 + first_seen 补全）、网站 v1、校验 CI、Pages 上线、README/贡献指南 | 站点公网可访问，The Number 可逐行核查，CI 绿 |
| **P1（上线后 2~4 周）** | collector 定时化、周更节奏、一键复制引用、SEO/AEO 基础 | 连续 4 周每周有新增已发布事件 |
| **P2** | 净账本（对置替代侧，引用现成 tracker 并注明口径）、月度趋势简报、AI-washing 回访核查 | 净值页上线 + 第一期简报发出 |
| **P3** | 增量市场看板（融资/规模/招聘三类代理指标） | 市场页上线 |
| **P4** | 社区 PR 共建规范激活、多语扩展 | 首个外部贡献 PR 合并 |

## 10. 风险与对策

| 风险 | 对策 |
|------|------|
| 定义争议（什么算"AI 创造"） | 只记来源原话；confidence 区分口径；方法论页全文公开；The Number 只计 company_stated |
| 双重计算 | 账本累加与机构口径分轨展示，结构上不可能混加（report_datapoint 永不 counted） |
| AI-washing（企业夸大 AI 招聘） | 事件保留"承诺 vs 后续核实"语义（P2 增加回访核查状态），核查本身成为独家内容 |
| 断更 | agent 草稿队列 + PR 终审流；数据全开放，最坏情况社区可 fork 续命 |
| 平台下场（LinkedIn/Indeed 做官方仪表盘） | 调研结论：其数据资产逻辑决定更可能继续年度 PDF；我们以先发占位 + 跨源中立聚合差异化 |
| 可信度事故 | 每行带原文 quote；纠错政策 + git 修订历史公开；发现错误公开更正 |

## 11. 成功标准（"现象级"的可操作定义）

1. 头条数字/账本被媒体或机构报告引用，成为创造侧的标配引用源（北极星：外部引用次数）
2. 数据至少周更，站点有持续回访理由
3. 开放数据集被研究者/开发者 fork 或复用
4. 中文世界检索"AI 新职业"类查询时本站进入首屏（SEO/AEO 空位收割）

## 12. 非目标（YAGNI，v1 明确不做）

- 不做账号系统、评论区、任何后端/数据库
- 不做"实时跳动"的表演式计数器（数字必须真实对应账本行）
- 不做付费墙（免费引用是占位策略的一部分）
- 不做全自动发布（人工终审是可信度底线）
- 不在 v1 做替代侧数据（P2 净账本时引入，且只引用现成 tracker）
