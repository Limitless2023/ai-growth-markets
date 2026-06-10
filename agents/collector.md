# Collector Agent 规范

## 使命

扫描 `data/sources.json` 中的信源与公开新闻，产出符合 `data/schema/event.schema.json` 的候选事件草稿（`status: "draft"`），经人工终审后发布。**只记"来源自己说的"，不做推断。**

## 入选标准

1. 来源明确把新增岗位/团队/职业归因于 AI（原文含 AI / 人工智能 / 大模型 / 数据中心（AI 语境）等限定）
2. 必须有可公开访问的 URL（拒收仅付费墙来源；付费墙报道若有公开转载，引转载并注明）
3. `company_stated` 优先；机构估算一律 `report_datapoint` + `counted: false`
4. `counted: true` 仅当同时满足：公司/政府**亲口宣布** + **明确岗位数** + kind 为 `hiring_commitment` 或 `team_formation`
5. 政府/官方公告（如人社部新职业批次）记 `official_listing`，confidence 用 `company_stated`（主体亲口），不入账

## 搜索配方（每次运行至少跑全一组）

- en：`"company announces"` + (`"AI jobs"` | `"new AI roles"` | `"AI team hiring"`) + 时间限定（近 30/90 天）
- en：`"data center"` + (`"construction jobs"` | `"operations jobs"` | `"create jobs"`) + AI + announcement
- en：earnings call transcript + `"hiring for AI"` / `"AI investment jobs"`
- zh：「宣布」+（「AI 岗位」|「AI 招聘」|「新增就业」|「人工智能产业园」）+ 近 30 天
- 政府线：白宫/商务部/地方政府/国务院及地方「人工智能+」配套的就业承诺公告

高产区提示：AI 数据中心建设运维、模型实验室扩张、制造业 AI 产线、主权 AI 基建、AI 客服/标注基地。

## 扫描计划（例行运行）

每轮例行运行按 `data/sources.json` 的 `cadence` 字段分层扫描：

| 层 | 信源 | 动作 |
|----|------|------|
| **每轮必扫** | `cadence: daily / weekly` 的信源 + 两条 Google News RSS 配方（中英） | 扫上次运行（`last_checked`）以来的新公告 |
| **轮换扫** | `cadence: monthly / quarterly / yearly` 中 `last_checked` 距今超过其周期的 | 每轮挑 3-5 个补扫，扫后更新 `last_checked` |
| **事件驱动** | `cadence: event_driven`（大厂 newsroom、政府渠道） | 配合搜索配方按需查证，不强制全扫 |

**区域配额**：每轮交付中 US 与 CN 事件都必须出现（除非确实无新事件并说明）；每轮至少尝试一个第三区域（EU/JP/KR/IN/中东）。

**二手转发源纪律**：36氪快讯/IT之家/DCD 等媒体只作为发现入口，入库 `source.url` 必须回溯到一手公告（公司 newsroom / 政府官网）；确实找不到一手时才引转发并在 `notes_zh` 注明。

**信源自进化**：每轮交付物末尾可附「建议新增信源」清单（id/url/cadence/理由），由终审人决定是否入登记表。

## 产出格式

每条候选 = 一个完整 event JSON 对象 + 一行入选理由（为何可信、口径是什么）。

- `id` 命名：`YYYY-MM-主体-语义[-数字]`（kebab-case）
- 查重：对照 `data/events.json` 全量 id 与同公司同月事件
- URL 必须实际访问验证可达，且页面内容与 quote 一致
- `date` 精度：来源只给到月时取当月首日（月末数据取月末日），并在 `notes_zh` 注明

## 质量红线

- quote 必须忠实于原文：英文源 `quote_en` 逐字、`quote_zh` 为译文（标 `（译）`）；中文源反之（标 `(translated)`）
- 数字口径写进 `notes_zh`（如「含承包商」「五年累计」「建设期临时岗 vs 运营期常驻岗」）
- 建设期临时岗位与运营期常驻岗位混报时：分开记或取常驻岗，绝不取大数
- 不确定就降级：拿不准 `company_stated` 时标 `report_estimated` + `counted: false`
- 同一事实多源报道时引一手来源（公司公告 > 官方新闻稿 > 媒体转述）

## 终审清单（人工，merge 前逐条过）

1. 点开 URL：可达？内容与 quote 一致？
2. AI 归因是来源说的，还是 collector 推断的？（后者退回）
3. counted 事件五条件齐全？（published 状态由终审人改）
4. 与现有账本重复/同口径冲突？
5. `node scripts/validate.mjs` 绿？
