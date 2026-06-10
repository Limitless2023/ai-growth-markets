# 研究框架 · Research Framework

本文档定义 **AI Growth Markets** 项目的研究方法、分类标准和数据模型。目的是让数据的收集与分析保持一致、可核查、可复现。

## 1. 核心问题

> 随着 AI（尤其是生成式 AI 与 Agent）的发展，**哪些全新的岗位和增量市场正在出现**，它们的成熟度、规模和增长性如何？

我们关注的是「**增量**」——即原本不存在、或因 AI 才被显著放大的机会，而非单纯「被 AI 提效的存量岗位」。

## 2. 分类维度

### 2.1 类型 (type)
- `role` — 新岗位 / 职业角色
- `market` — 增量市场 / 商业品类

### 2.2 主题领域 (domain)
- `infrastructure` — 算力、推理、向量库、MLOps
- `data` — 数据标注、合成数据、数据飞轮
- `product` — AI 应用层、Agent、Copilot 产品
- `safety` — 对齐、红队、AI 安全、内容检测
- `governance` — 合规、法律、伦理、审计
- `creative` — 内容创作、设计、营销
- `enablement` — 培训、咨询、布道、教育

### 2.3 成熟度 (maturity)
- `emerging` — 刚出现，定义尚不清晰
- `growing` — 需求明显上升，开始标准化
- `established` — 已形成稳定职位/品类

## 3. 数据模型

`data/opportunities.json` 中每条记录的字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 唯一标识（kebab-case） |
| `name` | string | 名称（中/英） |
| `type` | enum | `role` \| `market` |
| `domain` | enum | 见 2.2 |
| `maturity` | enum | 见 2.3 |
| `summary` | string | 一句话描述这个机会是什么 |
| `whyNew` | string | 为什么它是 AI 带来的「增量」 |
| `signals` | string[] | 佐证信号：招聘量、融资、代表公司等 |
| `skills` | string[] | （岗位）所需关键技能 / （市场）关键能力 |
| `examples` | string[] | 代表公司 / 产品 / 职位 |
| `sources` | string[] | 来源链接（用于核查，可为空但鼓励填写） |

## 4. 数据来源建议

收集与核查时优先参考：
- 招聘平台趋势（LinkedIn、Indeed、Levels.fyi 的岗位数量与薪资）
- 融资数据库（Crunchbase、PitchBook 的品类融资额）
- 行业报告（咨询机构、风投基金的 AI 市场报告）
- 一手招聘 JD 与公司官网

> ⚠️ 注意：本项目早期数据为人工整理的种子样本，**具体数字需回到一手来源核验**，不要直接当作权威统计引用。

## 5. 分析输出

在数据积累到一定规模后，计划产出：
1. **岗位热度榜** — 按招聘量 / 增速排序的新岗位。
2. **增量市场地图** — 按市场规模与增长性二维分布。
3. **趋势简报** — 定期更新哪些方向在加速、哪些降温。
