# 研究框架 · Research Framework（v2）

本文档定义 **AI Growth Markets** 项目的研究范围、分类标准与数据结构。计数规则、入选标准与纠错政策见 [`methodology.md`](methodology.md)。

## 1. 核心问题

> 随着 AI（尤其是生成式 AI 与 Agent）的发展，**哪些全新的岗位和增量市场正在出现**？谁在何时宣布了什么？

我们关注**创造侧**——原本不存在、或因 AI 才被显著放大的机会；替代侧（裁员/自动化）仅在路线图 P2 的净账本中以引用现成追踪源的方式出现。

## 2. 数据结构（四实体）

数据全部为仓库内 JSON，Schema 见 [`data/schema/`](../data/schema/)：

| 实体 | 文件 | 角色 |
|------|------|------|
| **Event 事件** | `data/events.json` | 账本行：谁在何时宣布了什么，每行带来源（引擎层） |
| **Occupation 新职业** | `data/occupations.json` | 物种档案：首现时间、官方认定、"做这行的人每天在干什么"（灵魂层） |
| **Market 增量市场** | `data/markets.json` | 因 AI 新生/被放大的商业品类（P3 扩展指标） |
| **Source 信源** | `data/sources.json` | collector agent 的扫描清单与更新节奏 |

事件滋养词典：账本中反复出现的岗位类型沉淀为新职业条目，事件与职业/市场通过 `occupation_ids` / `market_ids` / `event_ids` 双向关联（校验器强制引用完整性）。

## 3. 分类维度

### 3.1 主题领域 (domain)

- `infrastructure` — 算力、推理、向量库、MLOps
- `data` — 数据标注、合成数据、数据飞轮
- `product` — AI 应用层、Agent、Copilot 产品
- `safety` — 对齐、红队、AI 安全、内容检测
- `governance` — 合规、法律、伦理、审计
- `creative` — 内容创作、设计、营销
- `enablement` — 培训、咨询、布道、教育

### 3.2 成熟度 (maturity)

- `emerging` — 刚出现，定义尚不清晰
- `growing` — 需求明显上升，开始标准化
- `established` — 已形成稳定职位/品类

### 3.3 事件类型 (kind) 与计数

见 [`methodology.md`](methodology.md) §1-§2：`hiring_commitment` / `team_formation` 满足五条件可入账，`official_listing` / `report_datapoint` 永不入账。

## 4. 信源体系

[`data/sources.json`](../data/sources.json) 维护 34+ 信源（全球轨 + 中国轨），按更新节奏（日/周/双周/月/季/年/事件驱动）编排扫描计划；采集执行规范见 [`agents/collector.md`](../agents/collector.md)。

引用纪律：官方数据（人社部、信通院、统计局、Census）可自由引用作为底座；招聘平台数据为私有口径，引用须注明统计基数且不可互相加和。

## 5. 分析输出（路线图）

1. **The Number + 事件账本**（P0，已上线）——创造侧的可引用账本
2. **趋势简报**（P2）——月度汇总账本增量与口径变化
3. **净账本**（P2）——对置创造与替代（替代侧引用现成追踪源）
4. **增量市场看板**（P3）——融资/规模/招聘三类代理指标
