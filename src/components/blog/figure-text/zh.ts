import { INLINE_PRICES as P, type FigureDict, type Fmt } from "./types";

const zh = (f: Fmt): FigureDict => ({
  inShort: "简要回答",
  figures: {
    "ivf-prices": {
      title: "曼谷公布的试管婴儿（IVF/ICSI）套餐价格，2026年10月",
      caption: "来源：各机构自行公布的价格，核查于2026年10月14日。Jetanin 和 Bumrungrad 未公布套餐价格。各套餐包含的项目不同，请比较分项报价，而不是宣传价格。",
      notes: [
        "4 种 ICSI 套餐",
        "IVF/ICSI，仅限当地居民",
        "ICSI 套餐",
        "境外患者套餐 A",
        "套餐 B，含 PGT-A + 冷冻",
      ],
    },
    "surgery-prices": {
      title: "曼谷公布的整形手术价格，2026年10月",
      caption: "来源：Bangkok Hospital 和 Yanhee 公布的价格，核查于2026年10月14日。Bangkok Hospital 的隆胸价格不含假体；Yanhee 的价格含指定假体。Bumrungrad 和 Kamol 未公布价格。",
      notes: [
        "隆鼻，从假体到肋软骨移植",
        "隆鼻，从局部麻醉到鼻中隔手术",
        "隆胸，含假体",
        "隆胸，不含假体",
        "眼睑手术，上睑或下睑",
        "眼睑手术，上睑或下睑",
      ],
    },
    "physio-prices": {
      title: "曼谷公布的物理治疗单次价格，2026年10月",
      caption: "来源：各诊所自己的价目表，核查于2026年10月14日。医院（Vejthani、Bumrungrad、MedPark、Samitivej、BNH、Bangkok Hospital）未公布单次价格。",
      notes: ["每次", "60 至 120 分钟", "60 至 120 分钟"],
    },
    "hospital-vs-centre": {
      title: "选专科生殖中心，还是医院内的生殖中心？",
      caption: "ThailandClinics 编辑总结，2026年10月。请向您自己的医生确认，您的病史是否需要医院作为后盾。",
      cols: [
        { tag: "专科生殖中心", points: [
          "只做生殖医学",
          "实验室工作量集中在试管婴儿",
          "套餐价格通常较低",
          "团队较小，了解您的情况",
        ], foot: "适合大多数身体健康的患者" },
        { tag: "医院内的生殖中心", points: [
          "其他所有专科都在同一栋楼里",
          "院内设有重症监护",
          "医院定价",
          "适合病史复杂的患者",
        ], foot: "适合有其他疾病或卵巢过度刺激综合征（OHSS）风险较高的患者" },
      ],
    },
    "like-for-like-quote": {
      title: "请每家机构按同一个周期报价",
      caption: "同样的询价，才能让宣传价格具有可比性。请发给您候选名单上的每一家机构。",
      steps: [
        { title: "促排卵", body: "含药物，并注明剂量上限" },
        { title: "取卵 + ICSI", body: "麻醉及胚胎培养至第 5 天" },
        { title: "PGT-A", body: "最多 4 个胚胎的价格，含活检" },
        { title: "冷冻 + 保存", body: "全部胚胎，第一年保存费" },
        { title: "冻胚移植", body: "内膜准备及一次移植" },
        { title: "不含项目", body: "所有不包含的项目，书面列明" },
      ],
    },
    "pgt-types": {
      title: "PGT 的三种类型",
      caption: "PGT 即胚胎植入前遗传学检测：在移植前对试管婴儿胚胎进行的实验室检测。是否需要，由您和您的生殖科医生决定。",
      cols: [
        { tag: "PGT-A", title: "非整倍体", points: [
          "检查胚胎染色体数目是否异常",
          "最常见的检测",
          "通常建议 37 岁起，或反复流产、多次移植失败后考虑",
        ] },
        { tag: "PGT-M", title: "单基因病", points: [
          "检测一种已知的遗传病，例如地中海贫血",
          "实验室通常要先为您的家庭建立检测方法",
          "整个流程会多出几周",
        ] },
        { tag: "PGT-SR", title: "染色体结构重排", points: [
          "适用于一方携带易位或倒位的夫妇",
          "提供的诊所较少",
          "在曼谷：MedPark 和 VFC 列出此项",
        ] },
      ],
    },
    "pgt-timeline": {
      title: "PGT 周期的流程",
      caption: "典型顺序。时间因诊所和检测而异：PGT-M 可能需要更久。",
      steps: [
        { title: "试管婴儿 + 取卵", body: "先促排卵，再取卵并受精" },
        { title: "培养至第 5–6 天", body: "胚胎发育到囊胚阶段" },
        { title: "活检", body: "从每个胚胎外层取出少量细胞" },
        { title: "冷冻", body: "每个做过活检的胚胎都会冷冻" },
        { title: "检测结果", body: "通常需要 1–3 周" },
        { title: "冻胚移植", body: "在之后的周期中，移植已检测的胚胎" },
      ],
    },
    "pgt-checklist": {
      title: "ThailandClinics PGT 7 项核查清单",
      caption: "对每家诊所都做同样的七项核查，并要求书面答复。",
      steps: [
        { title: "PGT 类型", body: "是否提供您需要的检测？" },
        { title: "检测地点", body: "自有实验室，还是外送？" },
        { title: "实验室", body: "延时成像、双人核对（witnessing）、ISO 15189、ESHRE" },
        { title: "活检", body: "由谁操作，做得多不多？" },
        { title: "每个胚胎的价格", body: "活检、检测、冷冻、保存" },
        { title: "成功率数据", body: "按年龄统计的每次 PGT 胚胎移植活产率" },
        { title: "泰国法律", body: "不允许选择性别；仅限医疗用途" },
      ],
    },
    "surgery-hospital-vs-clinic": {
      title: "选整形专科医院，还是综合医院？",
      caption: "ThailandClinics 编辑总结，2026年10月。凡是全身麻醉的手术，请确认该机构持有手术资质。",
      cols: [
        { tag: "整形专科医院", points: [
          "每天都做整形手术", "价格通常较低", "可按姓名挑选外科医生", "院内其他专科较少",
        ], foot: "适合按价格或医生来选择的健康患者" },
        { tag: "私立综合医院", points: [
          "所有专科和重症监护都在院内", "公布了套餐价格（Bangkok Hospital）", "价格较高", "适合病史复杂的患者",
        ], foot: "适合患有其他疾病的患者" },
      ],
    },
    "surgery-quote": {
      title: "请每家医院按同一台手术报价",
      caption: "同样的询价，才能让整形手术报价具有可比性。",
      steps: [
        { title: "外科医生", body: "全名及泰国医学委员会（Medical Council）执业证号" },
        { title: "术式", body: "具体是哪种手术，开放式还是闭合式" },
        { title: "假体", body: "品牌、尺寸和型号，计入价格" },
        { title: "住院", body: "包含几晚，以及房型" },
        { title: "术后随访", body: "复查、拆线、塑身衣" },
        { title: "并发症", body: "修复手术或再次住院由谁付费" },
      ],
    },
    "aesthetic-safety-checklist": {
      title: "ThailandClinics 医美安全 6 项核查",
      caption: "在曼谷做任何肉毒素或填充注射之前，请把这六项都核查一遍。",
      steps: [
        { title: "诊所执照", body: "招牌上有 11 位编号，店内有执照证书" },
        { title: "医生执照", body: "全名，已在泰国医学委员会（Medical Council）核实" },
        { title: "泰国 FDA 注册", body: "肉毒素注册号以“1C”开头" },
        { title: "密封药瓶", body: "当着您的面开封；拍下标签" },
        { title: "价格合理", body: "不会远低于所有持证诊所" },
        { title: "术后跟进", body: "出了问题该联系谁" },
      ],
    },
    "vial-check": {
      title: "盒子和药瓶上要检查什么",
      caption: "治疗开始前，请要求查看产品。持证诊所不会介意。",
      steps: [
        { title: "密封", body: "盒子和药瓶均未开封，当着您的面打开" },
        { title: "品牌", body: "与报价中的品牌一致" },
        { title: "泰国注册", body: "盒子上的注册号，例如 1C …" },
        { title: "批号 + 有效期", body: "批号，以及尚未到期的有效期" },
        { title: "查询", body: "在泰国 FDA 产品查询系统中搜索该品牌" },
      ],
    },
    "aesthetic-red-flags": {
      title: "医美诊所的危险信号",
      caption: "以下每一项都曾出现在泰国的执法案件中。出现任何一项，就该离开。",
      cols: [
        { tag: "地点", title: "场所不对", points: [
          "在公寓、住宅、酒店房间或美容院里治疗", "招牌上没有执照编号", "只能通过社交媒体私信预约",
        ] },
        { tag: "人员", title: "注射者不对", points: [
          "不肯提供全名或执照编号", "广告中只用昵称", "由美容师或护士单独注射",
        ] },
        { tag: "产品", title: "产品不对", points: [
          "不肯给您看密封的药瓶", "品牌不在泰国 FDA 数据库中", "价格远低于所有持证诊所",
        ] },
      ],
    },
    "physio-hospital-vs-clinic": {
      title: "选物理治疗诊所，还是医院康复中心？",
      caption: "ThailandClinics 编辑总结，2026年10月。术后在哪里做康复，请听从您的外科医生的建议。",
      cols: [
        { tag: "专科物理治疗诊所", points: [
          "公布单次价格", "每次 60 分钟以上", "通常每次都是同一位物理治疗师", "无需转诊",
        ], foot: "适合腰背、颈部、运动损伤及大多数术后康复" },
        { tag: "医院康复中心", points: [
          "院内有康复科医生", "机器人步态训练、水疗", "医院价格，常另加医生诊费", "可能需要先看医生",
        ], foot: "适合中风、脊髓损伤和复杂手术后康复" },
      ],
    },
    "physio-first-visit": {
      title: "第一次物理治疗要带什么",
      caption: "带上这些，可以省下一次治疗，也方便物理治疗师制定方案。",
      steps: [
        { title: "您的病情经过", body: "什么时候开始，什么会让它好转或加重" },
        { title: "影像 + 报告", body: "核磁共振、X 光或超声报告（如有）" },
        { title: "手术资料", body: "手术记录及外科医生的康复方案" },
        { title: "您的目标", body: "重新跑步、睡个好觉、抱起孩子" },
        { title: "衣着", body: "短裤或便于活动的宽松衣服" },
      ],
    },
    "postop-checklist": {
      title: "ThailandClinics 术后康复 6 项核查",
      caption: "第一次治疗前，向每家康复机构问同样的六个问题。",
      steps: [
        { title: "持证物理治疗师", body: "泰国物理治疗委员会（Physical Therapy Council）执照" },
        { title: "外科医生的方案", body: "严格遵循，必要时与医生沟通" },
        { title: "分阶段计划", body: "进入每个阶段的标准" },
        { title: "设备", body: "按需配备健身房、泳池或肌力测试" },
        { title: "日程", body: "每个阶段的就诊次数，以及居家练习" },
        { title: "价格清楚", body: "单次价格、套餐、退款" },
      ],
    },
    "surgeon-handover": {
      title: "您的康复诊所需要外科医生提供什么",
      caption: "出院前，请向外科医生团队索取以下资料。",
      steps: [
        { title: "手术记录", body: "做了什么，以及使用的移植物或植入物" },
        { title: "负重", body: "腿能承受多少重量，从什么时候开始" },
        { title: "活动限制", body: "关节活动度限制及注意事项" },
        { title: "支具或辅具", body: "支具设置、拐杖、使用多久" },
        { title: "复诊日期", body: "什么时候再见外科医生" },
      ],
    },
    "rehab-milestones": {
      title: "术后典型的康复里程碑",
      caption: "来源：AAOS OrthoInfo 及 NHS 患者指南。仅为典型范围；您的具体时间表由外科医生和物理治疗师制定。",
      cols: [
        { tag: "前交叉韧带重建", title: "6–12 个月恢复运动", points: [
          "术后立即开始物理治疗", "能否恢复运动，取决于是否通过肌力和功能测试", "而不只看时间",
        ] },
        { tag: "膝关节置换", title: "数月", points: [
          "约 3–6 周恢复日常活动（AAOS）", "约 6 周后可不用辅具行走（NHS）", "完全康复可能需要数月或更久",
        ] },
        { tag: "髋关节置换", title: "数月", points: [
          "约 3–6 周恢复轻度活动（AAOS）", "大约前 6 周需注意动作限制", "完全康复需要数月（NHS）",
        ] },
      ],
    },
    "meditation-costs": {
      title: "曼谷公布的冥想与疗愈课程费用，2026年10月",
      caption: "来源：各中心自行公布的价格，核查于2026年10月20日。Wat Mahathat Section 5 靠捐款运作；Buddhadasa Indapanno Archives 未公布费用。Saksit 的费用包含书籍、证书和午餐。",
      notes: [
        "随到随学，建议捐款",
        "1 天内观（vipassana）体验课",
        "2 天入门课程",
        "2 天 Pranic Healing 1 级课程，全包",
      ],
    },
    "meditation-vs-healing": {
      title: "寺庙冥想、开放小组，还是疗愈课程？",
      caption: "ThailandClinics 编辑总结，2026年10月。这三种都是辅助性练习，不是医疗。",
      cols: [
        { tag: "寺庙冥想", points: [
          "内观与正念", "以捐款为主", "有着装要求", "仅特定日子用英语",
        ], foot: "适合初学者和旅行者" },
        { tag: "开放小组", points: [
          "每周课程或私人教学", "英语授课", `捐款至 ${f.baht(P.houseOfDhammaTwoDayTo)}`, "House of Dhamma 需提前预约",
        ], foot: "适合想养成习惯的外籍人士" },
        { tag: "疗愈课程", points: [
          "Pranic Healing 分级授课", "每门课程颁发证书", `公布的入门费用为 ${f.num(P.saksitLevel1)} 泰铢`, "后续级别有先修要求",
        ], foot: "适合想学会一种练习的人" },
      ],
    },
    "meditation-before-you-go": {
      title: "出发前请确认这五件事",
      caption: "寺庙的时间安排会在佛教节日前后变动。出发前请通过电话或邮件确认。",
      steps: [
        { title: "语言", body: "这节课用英语授课吗？" },
        { title: "时间", body: "今天的时间，而不是去年的" },
        { title: "预约", body: "直接前往、报名，还是付订金" },
        { title: "费用", body: "捐款、收费，以及包含哪些内容" },
        { title: "着装", body: "遮住肩膀和膝盖" },
      ],
    },
  },
});

export default zh;
