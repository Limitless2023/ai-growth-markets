# 方法论 · Methodology

本页是 AI Growth Markets（AI 新工作账本）全部数据的计数规则、入选标准与纠错政策。**我们的可信度建立在这页之上。**

## 1. The Number 怎么算

**The Number = 账本中同时满足以下五个条件的事件的 `jobs_count` 之和：**

1. `status == "published"`（已经过人工终审发布）
2. `counted == true`
3. `confidence == "company_stated"`——**只计当事方亲口宣布的数字**，机构估算永不入账
4. `kind` 为 `hiring_commitment`（招聘承诺）或 `team_formation`（新建团队）
5. `jobs_count` 为明确的正整数（没有数字的事件入账本、不入计数）

**设计含义：The Number 是一个"可逐行核查的保守下限"，不是对全球 AI 岗位创造总量的估计。** 我们的数字比 LinkedIn 的 130 万小得多——但每一个都能点开看到来源原文。两种口径在站点上分轨展示、永不相加。

## 2. 入选标准：只记"来源自己说的"

账本记录的是 **"谁、在什么时候、宣布了什么"**，不是我们对"什么算 AI 创造的岗位"的判断——这个定义争议被有意外包给来源：

- ✅ 收录：来源原文明确把新增岗位/团队/职业归因于 AI
- ✅ 收录：官方新职业认定（如人社部批次）、机构报告中的创造侧数据点（仅作参照系）
- ❌ 拒收：无公开可访问来源、仅付费墙、传言或匿名爆料
- ❌ 拒收：来源没说 AI、由我们推断"应该和 AI 有关"的事件

四种事件类型（`kind`）：

| kind | 含义 | 可否入账 |
|------|------|----------|
| `hiring_commitment` | 公司/政府公开宣布因 AI 新增 N 个岗位 | ✅（满足五条件时） |
| `team_formation` | 新设 AI 相关部门/团队 | ✅（满足五条件时） |
| `official_listing` | 官方新职业认定 | ❌ 永不入账 |
| `report_datapoint` | 机构报告数据点 | ❌ 永不入账，仅入参照系 |

## 3. 双轨展示原则

- **账本轨**（我们的数字）：事件级、逐行带来源、保守下限
- **参照轨**（机构口径）：LinkedIn「130 万」、WEF「2030 净增 7800 万（预测）」、人社部「110 个新职业」等，标注为参照系

两轨**结构上不可能混加**：`report_datapoint` 在数据校验层就被禁止 `counted: true`（见 `scripts/validate.mjs` 规则 R4）。

各招聘平台数据（BOSS直聘 +74.1%、脉脉 +543% 等）统计基数互不相同，**不可互相比较或加和**，账本在每条 `notes_zh` 中注明口径。

## 4. 已知局限（诚实声明）

1. **承诺 ≠ 到岗**：账本记录的是公开承诺；企业可能夸大或不兑现（AI-washing 的反向形态）。回访核查机制在路线图 P2 中。
2. **覆盖偏差**：信源以中英文公开报道为主，其他语言区与不发新闻稿的中小企业被系统性低估——这也是"保守下限"定位的一部分。
3. **日期精度**：部分机构报告仅精确到月，账本按当月首日（月度统计取月末日）记录，并在 `notes_zh` 注明。
4. **建设期 vs 运营期**：数据中心类公告常混报建设临时岗与运营常驻岗，收录时分开记或取常驻岗，绝不取大数。

## 5. 纠错政策

发现任何错误（来源失效、数字与原文不符、归因错误）：

1. 在 GitHub 提 [Issue](https://github.com/Limitless2023/ai-growth-markets/issues)，指明事件 `id` 与问题
2. 核实属实即修正；所有修订通过 git 历史公开留痕
3. 重大更正（影响 The Number 的）在 README 更正日志中记录

## 6. 如何引用 · How to Cite

> AI Growth Markets, "<事件标题或 The Number>", retrieved YYYY-MM-DD, https://limitless2023.github.io/ai-growth-markets/

- 数据许可：**CC BY 4.0**——自由使用，须署名
- 原始数据直链：[`data/events.json`](../data/events.json) · [`data/occupations.json`](../data/occupations.json) · [`data/markets.json`](../data/markets.json) · [`data/sources.json`](../data/sources.json)

## 7. 更新管线

```
data/sources.json（34+ 信源登记表）
   → collector agent 定期扫描（规范见 agents/collector.md）
   → 候选事件草稿（status: draft，PR 形式）
   → 人工终审（终审清单见 collector.md §终审清单）
   → merge 发布 → 站点自动重建，The Number 自动更新
```

人工终审是可信度底线：本项目**永不全自动发布**。
