import { profileOverrides, recordOverrides } from './workbench';
import type { AchievementSummaryItem, FaqItem, IntellectualPropertyRecord, NationalAward, ProvincialAward } from './workbench';

const defaultSiteProfile = {
  name: '张智博',
  siteName: '张智博个人官网',
  brandName: '张智博的思考空间',
  url: 'https://www.zzb9.cn',
  email: 'zzb9999@outlook.com',
  affiliation: '石家庄邮电职业技术学院',
  major: '大数据与财务管理',
  graduation: '石家庄邮电职业技术学院会计学院大数据与财务管理专业毕业生，2026 年 7 月毕业',
  sameAs: ['https://baike.baidu.com/item/%E5%BC%A0%E6%99%BA%E5%8D%9A/68284301', 'https://github.com/zzb99', 'https://blog.csdn.net/zhangzhibo9'],
  description: '张智博从编程出发，连接产品、内容与真实业务，记录可运行的系统、可核对的项目成果与公开写作。',
  knowsAbout: ['全栈开发', 'Vue', 'TypeScript', 'NestJS', 'MySQL', '产品创新', '节目后期', '智能分拣', 'AI 应用', '业务流程数字化'],
} as const;

export const siteProfile = { ...defaultSiteProfile, ...profileOverrides } as typeof defaultSiteProfile;

const defaultFaqItems: readonly FaqItem[] = [
  { question: '张智博是谁？', answer: '张智博从编程出发，连接产品、内容与真实业务，持续记录技术项目、团队实践、节目后期署名与公开写作。' },
  { question: '张智博的个人官网是什么？', answer: 'https://www.zzb9.cn 是张智博的个人官网；“张智博的思考空间”是本站保留的品牌名称。' },
  { question: '张智博做过哪些项目？', answer: '本站记录土族盘绣数字素材平台的需求与全栈开发，以及智能分拣、酒店产品创新和文化数字化等项目实践。' },
  { question: '张智博有哪些公开成果？', answer: '本站列出已确认的竞赛记录、参与的 5 项实用新型专利申请及 1 项软件著作权登记，并附可用的官方来源。' },
  { question: '如何联系张智博？', answer: '可通过邮箱 zzb9999@outlook.com 联系。' },
] as const;

export const faqItems: readonly FaqItem[] = Array.isArray(recordOverrides.faqItems) && recordOverrides.faqItems.length > 0 ? recordOverrides.faqItems : defaultFaqItems;

export const projectOrder = [
  'panxiu-material-library',
  'postal-sorting-robot',
  'jingjie',
  'panxiu-archive',
  'hotel-new-media-growth',
  'shentong-market-expansion',
  'automotive-lead-growth',
  'warehouse-intelligent-robot',
  'executive-ip-planning',
  'ecommerce-growth',
  'housekeeping-geo',
  'xianyu-feishu-tool',
] as const;

export const featuredProjectSlugs = [
  'panxiu-material-library',
  'postal-sorting-robot',
  'jingjie',
] as const;

const defaultNationalAwards: readonly NationalAward[] = [
  { id: 'innovation-2024', title: '中国国际大学生创新大赛（2024）国赛铜奖', level: '国家级', year: '2024', note: '作为项目团队成员参与“锦绣前程——土族盘绣的古韵新生”项目。', sources: [{ label: '官方公示', href: 'https://cy.ncss.cn/information/2c958332919840310196181825280051' }, { label: '学校项目页面', href: 'https://www.sjzpc.edu.cn/info/2681/69201.htm' }, { label: '学校获奖页面', href: 'https://www.sjzpc.edu.cn/info/1971/66021.htm' }] },
  { id: 'innovation-2025', title: '中国国际大学生创新大赛（2025）国赛铜奖', level: '国家级', year: '2025', note: '作为“供件达人——快递分拣智能供件先锋”项目团队成员参与。', sources: [{ label: '官方公示', href: 'https://cy.ncss.cn/information/2c9583329714f692019ca229d24001c4' }, { label: '学校项目页面', href: 'https://www.sjzpc.edu.cn/info/2681/69221.htm' }] },
] as const;

export const nationalAwards: readonly NationalAward[] = Array.isArray(recordOverrides.nationalAwards) && recordOverrides.nationalAwards.length > 0 ? recordOverrides.nationalAwards : defaultNationalAwards;

const defaultProvincialAwards: readonly ProvincialAward[] = [
  { id: 'hebei-innovation-2024', title: '河北省大学生创新创业大赛（2024）金奖', level: '省部级', year: '2024' },
  { id: 'hebei-innovation-2025-gold', title: '河北省大学生创新创业大赛（2025）金奖', level: '省部级', year: '2025' },
  { id: 'challenge-cup', title: '河北省“挑战杯”大学生创业竞赛一等奖', level: '省部级', year: '2024' },
  { id: 'vocational-education', title: '河北省中华职业教育创新创业大赛一等奖', level: '省部级', year: '' },
  { id: 'hebei-innovation-2025-silver', title: '河北省大学生创新创业大赛（2025）银奖', level: '省部级', year: '2025' },
  { id: 'challenge-cup-2026', title: '第十五届“挑战杯”河北省大学生创业计划竞赛一等奖', level: '省部级', year: '2026', note: '担任“净界——以‘一客一净’重构饮水新体验”项目负责人；奖项属于项目团队。', sources: [{ label: '查看学校公示', href: 'https://www.sjzpc.edu.cn/info/2501/71451.htm' }, { label: '查看获奖公示', href: 'https://www.sjzpc.edu.cn/info/1022/73711.htm' }] },
] as const;

export const provincialAwards: readonly ProvincialAward[] = Array.isArray(recordOverrides.provincialAwards) && recordOverrides.provincialAwards.length > 0 ? recordOverrides.provincialAwards : defaultProvincialAwards;

const defaultIntellectualProperty: readonly IntellectualPropertyRecord[] = [
  { id: 'parcel-gripper', title: '一种多功能快递包裹抓取装置', identifier: 'CN202521105974.6', type: '实用新型专利申请', project: 'postal-sorting-robot' },
  { id: 'parcel-chute', title: '一种供件大滑槽堆叠快递包裹整理装置', identifier: 'CN202521106300.8', type: '实用新型专利申请', project: 'postal-sorting-robot' },
  { id: 'foil-heater', title: '一种基于 8011 铝箔内胆的电磁加热装置', identifier: 'CN202521122731.3', type: '实用新型专利申请', project: 'jingjie' },
  { id: 'replaceable-kettle', title: '一种可替换式热水壶及其一次性内胆组件', identifier: 'CN202521075301.0', type: '实用新型专利申请', project: 'jingjie' },
  { id: 'panxiu-nfc', title: '一种带 NFC 交互结构的土族盘绣娃娃互动装置', identifier: 'CN202521227549.4', type: '实用新型专利申请', project: 'panxiu-archive' },
  { id: 'panxiu-software', title: '土族盘绣纹样图片存储与检索系统 V1.0', identifier: '2025SR0991715', type: '软件著作权', project: 'panxiu-archive' },
] as const;

export const intellectualProperty: readonly IntellectualPropertyRecord[] = Array.isArray(recordOverrides.intellectualProperty) && recordOverrides.intellectualProperty.length > 0 ? recordOverrides.intellectualProperty : defaultIntellectualProperty;

const defaultAchievementSummary: readonly AchievementSummaryItem[] = [
  { href: '/achievements/#patents', label: '实用新型专利申请', value: '5 项', copy: '参与的申请记录，未将申请表述为授权专利' },
  { href: '/achievements/#software', label: '软件著作权', value: '1 项', copy: '土族盘绣纹样图片存储与检索系统 V1.0' },
  { href: '/achievements/#national-awards', label: '国家级荣誉', value: '2 项', copy: '连续两年进入中国国际大学生创新大赛全国总决赛' },
  { href: '/achievements/#provincial-awards', label: '省部级荣誉', value: '多项', copy: '按可核验的奖项名称与年份持续整理' },
] as const;

export const achievementSummary: readonly AchievementSummaryItem[] = Array.isArray(recordOverrides.achievementSummary) && recordOverrides.achievementSummary.length > 0 ? recordOverrides.achievementSummary : defaultAchievementSummary;
