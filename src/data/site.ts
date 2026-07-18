export const siteProfile = {
  name: '张智博',
  siteName: '张智博个人官网',
  brandName: '张智博的思考空间',
  url: 'https://www.zzb9.cn',
  email: 'zzb9999@outlook.com',
  wechat: '15631124118',
  affiliation: '石家庄邮电职业技术学院',
  major: '大数据与财务管理',
  sameAs: ['https://github.com/zzb99'],
  description: '张智博的个人网站，记录人工智能、GEO、电商运营、产品创新、智能机器人、市场增长与文化数字化项目，以及相关思考和阶段成果。',
  knowsAbout: ['人工智能', 'GEO', '电商运营', '新媒体运营', '市场增长', '产品创新', '智能机器人', '文化数字化', '项目管理', '内容策略'],
} as const;

export const faqItems = [
  { question: '张智博是谁？', answer: '张智博关注 AI 应用、产品创新与增长实践，持续记录项目推进、阶段成果与方法复盘。' },
  { question: '张智博的个人官网是什么？', answer: 'https://www.zzb9.cn 是张智博的个人官网；“张智博的思考空间”是本站保留的品牌名称。' },
  { question: '张智博做过哪些项目？', answer: '本站收录酒店新媒体增长、市场开拓、电商运营、广告投放、智能机器人、文化数字化等项目档案。' },
  { question: '张智博有哪些公开成果？', answer: '本站目前公开列出两项中国国际大学生创新大赛全国总决赛铜奖、五项实用新型专利及一项软件著作权。' },
  { question: '如何联系张智博？', answer: '可通过邮箱 zzb9999@outlook.com 联系。' },
] as const;

export const projectOrder = [
  'hotel-new-media-growth',
  'shentong-market-expansion',
  'automotive-lead-growth',
  'warehouse-intelligent-robot',
  'executive-ip-planning',
  'ecommerce-growth',
  'housekeeping-geo',
  'postal-sorting-robot',
  'jingjie',
  'panxiu-archive',
  'xianyu-feishu-tool',
] as const;

export const featuredProjectSlugs = [
  'hotel-new-media-growth',
  'shentong-market-expansion',
  'automotive-lead-growth',
  'warehouse-intelligent-robot',
  'executive-ip-planning',
  'postal-sorting-robot',
] as const;

export const nationalAwards = [
  { id: 'innovation-2024', title: '中国国际大学生创新大赛（2024）全国总决赛铜奖', level: '国家级', year: '2024' },
  { id: 'innovation-2025', title: '中国国际大学生创新大赛（2025）全国总决赛铜奖', level: '国家级', year: '2025' },
] as const;

export const provincialAwards = [
  { id: 'hebei-innovation-2024', title: '河北省大学生创新创业大赛（2024）金奖', level: '省部级', year: '2024' },
  { id: 'hebei-innovation-2025-gold', title: '河北省大学生创新创业大赛（2025）金奖', level: '省部级', year: '2025' },
  { id: 'challenge-cup', title: '河北省“挑战杯”大学生创业竞赛一等奖', level: '省部级', year: '' },
  { id: 'vocational-education', title: '河北省中华职业教育创新创业大赛一等奖', level: '省部级', year: '' },
  { id: 'hebei-innovation-2025-silver', title: '河北省大学生创新创业大赛（2025）银奖', level: '省部级', year: '2025' },
] as const;

export const intellectualProperty = [
  { id: 'parcel-gripper', title: '一种多功能快递包裹抓取装置', identifier: 'CN202521105974.6', type: '实用新型专利', project: 'postal-sorting-robot' },
  { id: 'parcel-chute', title: '一种供件大滑槽堆叠快递包裹整理装置', identifier: 'CN202521106300.8', type: '实用新型专利', project: 'postal-sorting-robot' },
  { id: 'foil-heater', title: '一种基于 8011 铝箔内胆的电磁加热装置', identifier: 'CN202521122731.3', type: '实用新型专利', project: 'jingjie' },
  { id: 'replaceable-kettle', title: '一种可替换式热水壶及其一次性内胆组件', identifier: 'CN202521075301.0', type: '实用新型专利', project: 'jingjie' },
  { id: 'panxiu-nfc', title: '一种带 NFC 交互结构的土族盘绣娃娃互动装置', identifier: 'CN202521227549.4', type: '实用新型专利', project: 'panxiu-archive' },
  { id: 'panxiu-software', title: '土族盘绣纹样图片存储与检索系统 V1.0', identifier: '2025SR0991715', type: '软件著作权', project: 'panxiu-archive' },
] as const;

export const achievementSummary = [
  { href: '/achievements/#patents', label: '已公开实用新型专利', value: '5 项', copy: '页面仅列出可公开核验的专利明细' },
  { href: '/achievements/#software', label: '软件著作权', value: '1 项', copy: '土族盘绣纹样图片存储与检索系统 V1.0' },
  { href: '/achievements/#national-awards', label: '国家级荣誉', value: '2 项', copy: '连续两年进入中国国际大学生创新大赛全国总决赛' },
  { href: '/achievements/#provincial-awards', label: '省部级荣誉', value: '多项', copy: '按可核验的奖项名称与年份持续整理' },
] as const;
