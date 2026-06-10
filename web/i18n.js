// ============================================================
// 双语机制
//   - UI 文案：查 UI 字典
//   - 数据字段：按后缀取值 t(obj, "summary") → obj.summary_zh / summary_en
// ============================================================
export const LANG_KEY = "agm-lang";

export const getLang = () =>
  localStorage.getItem(LANG_KEY) || (navigator.language?.startsWith("zh") ? "zh" : "en");

export const setLang = (l) => {
  localStorage.setItem(LANG_KEY, l);
  location.reload();
};

// ---------- 数据字段双语取值（缺翻译时回退另一语言） ----------
export const t = (obj, field, lang) =>
  obj[`${field}_${lang}`] || obj[`${field}_zh`] || obj[`${field}_en`] || "";

// ---------- UI 文案字典 ----------
export const UI = {
  zh: {
    brand: "AI 新工作账本",
    tagline: "AI 正在创造哪些新工作？每一行都有来源。",
    theNumberLabel: "账本已记录的 AI 创造岗位承诺",
    theNumberSub: "可逐行核查的保守下限 · 只计当事方亲口宣布的数字",
    refStrip: "机构口径对照 — 参照系，不与账本相加",
    tabLedger: "事件账本",
    tabDictionary: "新职业词典",
    tabMarkets: "增量市场",
    methodology: "方法论",
    download: "下载数据",
    cite: "如何引用",
    citeCopy: "复制引用",
    citeCopied: "已复制 ✓",
    lastUpdated: "最后更新",
    filterAllKinds: "全部类型",
    filterAllRegions: "全部地区",
    countedOnly: "只看入账事件",
    colDate: "日期",
    colBody: "主体",
    colWhat: "事件",
    colCount: "岗位数",
    colRegion: "地区",
    counted: "入账",
    notCounted: "参照",
    source: "来源",
    quote: "原文引述",
    notes: "口径备注",
    firstSeen: "首次出现",
    official: "官方认定",
    humanAngle: "做这行的人每天在干什么",
    relatedEvents: "相关账本事件",
    eventsCount: "条事件",
    occupationsCount: "个新职业",
    marketsCount: "个增量市场",
    empty: "没有匹配的记录",
    footerNote: "开放数据 · CC BY 4.0 · 引用须署名",
    correction: "纠错",
    github: "GitHub 仓库",
    kinds: {
      hiring_commitment: "招聘承诺",
      team_formation: "新建团队",
      official_listing: "官方认定",
      report_datapoint: "机构口径",
    },
    regions: { US: "美国", CN: "中国", Global: "全球" },
    maturity: { emerging: "萌芽", growing: "成长", established: "成熟" },
    domains: {
      infrastructure: "基础设施", data: "数据", product: "产品/应用",
      safety: "安全/对齐", governance: "治理/合规", creative: "创意内容", enablement: "教育/赋能",
    },
  },
  en: {
    brand: "The AI Jobs Ledger",
    tagline: "What is AI creating? Every row has a source.",
    theNumberLabel: "AI-created job commitments on the ledger",
    theNumberSub: "A verifiable, conservative floor — only first-party announced numbers",
    refStrip: "Institutional benchmarks — reference only, never added to our ledger",
    tabLedger: "The Ledger",
    tabDictionary: "New-Job Dictionary",
    tabMarkets: "Growth Markets",
    methodology: "Methodology",
    download: "Download data",
    cite: "Cite us",
    citeCopy: "Copy citation",
    citeCopied: "Copied ✓",
    lastUpdated: "Last updated",
    filterAllKinds: "All kinds",
    filterAllRegions: "All regions",
    countedOnly: "Counted only",
    colDate: "Date",
    colBody: "Who",
    colWhat: "Event",
    colCount: "Jobs",
    colRegion: "Region",
    counted: "Counted",
    notCounted: "Reference",
    source: "Source",
    quote: "Quote",
    notes: "Notes",
    firstSeen: "First seen",
    official: "Official recognition",
    humanAngle: "A day in this job",
    relatedEvents: "Related ledger events",
    eventsCount: "events",
    occupationsCount: "new occupations",
    marketsCount: "growth markets",
    empty: "No matching records",
    footerNote: "Open data · CC BY 4.0 · attribution required",
    correction: "Report an error",
    github: "GitHub repo",
    kinds: {
      hiring_commitment: "Hiring commitment",
      team_formation: "Team formation",
      official_listing: "Official listing",
      report_datapoint: "Report datapoint",
    },
    regions: { US: "United States", CN: "China", Global: "Global" },
    maturity: { emerging: "Emerging", growing: "Growing", established: "Established" },
    domains: {
      infrastructure: "Infrastructure", data: "Data", product: "Product",
      safety: "Safety", governance: "Governance", creative: "Creative", enablement: "Enablement",
    },
  },
};
