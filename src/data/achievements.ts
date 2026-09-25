import { intellectualProperty, nationalAwards, provincialAwards } from './site';
import type { SourceLink } from './workbench';

export interface AchievementRecord {
  id: string;
  year: string;
  title: string;
  kind: '团队奖项' | '实用新型专利申请' | '软件著作权登记';
  status: string;
  project: string;
  role: string;
  teamScope: string;
  summary: string;
  projectHref?: string;
  identifier?: string;
  sources: readonly SourceLink[];
}

type AwardContext = Pick<AchievementRecord, 'project' | 'role' | 'teamScope' | 'summary' | 'projectHref'>;

// Award names and source links come from the existing records. This context
// distinguishes the person's participation from the team's result.
const awardContext: Record<string, AwardContext> = {
  'innovation-2024': {
    project: '锦绣前程——土族盘绣的古韵新生',
    role: '项目团队成员；参与纹样数字化整理、产品策划与成果表达',
    teamScope: '国赛铜奖为项目团队成果。',
    summary: '以土族盘绣的纹样整理与当代表达为起点，参与文化产品和项目展示工作。',
    projectHref: '/projects/panxiu-archive/',
  },
  'innovation-2025': {
    project: '供件达人——快递分拣智能供件先锋',
    role: '项目团队成员；参与设备测试、验证记录与成果表达',
    teamScope: '国赛铜奖为项目团队成果；本页不将奖项归为个人独立获奖。',
    summary: '连续第二年参与进入中国国际大学生创新大赛全国总决赛的团队项目。',
    projectHref: '/projects/postal-sorting-robot/',
  },
  'hebei-innovation-2024': {
    project: '2024 年河北省创新创业参赛项目',
    role: '项目团队成员；具体分工待补公开材料',
    teamScope: '团队竞赛记录；公开来源待补。',
    summary: '个人履历中保留的省级竞赛记录，暂不作为已独立核实的重点成果展示。',
  },
  'hebei-innovation-2025-gold': {
    project: '2025 年河北省创新创业参赛项目',
    role: '项目团队成员；具体分工待补公开材料',
    teamScope: '团队竞赛记录；公开来源待补。',
    summary: '个人履历中保留的省级竞赛记录，暂不作为已独立核实的重点成果展示。',
  },
  'challenge-cup': {
    project: '2024 年河北省“挑战杯”参赛项目',
    role: '项目团队成员；具体分工待补公开材料',
    teamScope: '团队竞赛记录；公开来源待补。',
    summary: '个人履历中保留的省级竞赛记录，暂不作为已独立核实的重点成果展示。',
  },
  'vocational-education': {
    project: '河北省中华职业教育创新创业参赛项目',
    role: '项目团队成员；具体分工待补公开材料',
    teamScope: '团队竞赛记录；年份和公开来源待补。',
    summary: '个人履历中保留的省级竞赛记录，暂不作为已独立核实的重点成果展示。',
  },
  'hebei-innovation-2025-silver': {
    project: '2025 年河北省创新创业参赛项目',
    role: '项目团队成员；具体分工待补公开材料',
    teamScope: '团队竞赛记录；公开来源待补。',
    summary: '个人履历中保留的省级竞赛记录，暂不作为已独立核实的重点成果展示。',
  },
  'challenge-cup-2026': {
    project: '净界——以“一客一净”重构饮水新体验',
    role: '项目负责人；统筹产品方案、知识产权材料与竞赛表达',
    teamScope: '省级一等奖为净界项目团队成果；产品仍处研发与验证阶段。',
    summary: '围绕酒店客房饮水卫生的可感知问题，推进可替换内胆、封签与耗材补充机制的产品方案。',
    projectHref: '/projects/jingjie/',
  },
};

const patentContext: Record<string, Pick<AchievementRecord, 'project' | 'role' | 'teamScope'>> = {
  'postal-sorting-robot': {
    project: '供件达人——快递分拣智能供件先锋',
    role: '主导相关专利申请材料撰写，参与设备迭代验证',
    teamScope: '装置研发和项目整体成果归属于项目团队及合作单位；仅按申请记录展示。',
  },
  jingjie: {
    project: '净界——以“一客一净”重构饮水新体验',
    role: '作为项目负责人推进产品方案与知识产权材料',
    teamScope: '申请材料是项目团队阶段成果；未核验授权状态。',
  },
  'panxiu-archive': {
    project: '锦绣前程——土族盘绣的古韵新生',
    role: '参与文化产品策划与知识产权材料整理',
    teamScope: '装置设计及申请记录属于项目团队；未核验授权状态。',
  },
};

const awards: AchievementRecord[] = [...nationalAwards, ...provincialAwards].map((award) => {
  const context = awardContext[award.id] ?? {
    project: '项目团队参赛记录',
    role: '项目团队成员；个人分工待补',
    teamScope: '团队竞赛成果；公开来源待补。',
    summary: '个人履历记录，具体信息待核对。',
  };
  const sources = 'sources' in award && Array.isArray(award.sources) ? award.sources : [];
  return {
    id: award.id,
    year: award.year || '年份待核',
    title: award.title,
    kind: '团队奖项',
    status: sources.length > 0 ? '有公开来源的团队获奖记录' : '个人履历记录，公开来源待补',
    sources,
    ...context,
  };
});

const intellectualPropertyRecords: AchievementRecord[] = intellectualProperty.map((item) => {
  const context = patentContext[item.project] ?? {
    project: '相关项目',
    role: '参与相关材料整理',
    teamScope: '项目团队阶段成果。',
  };
  const software = item.type === '软件著作权';
  return {
    id: item.id,
    year: '2025',
    title: item.title,
    kind: software ? '软件著作权登记' : '实用新型专利申请',
    status: software ? '登记编号；公开证书链接待补' : '申请编号；未核验授权状态',
    project: context.project,
    role: software ? '参与土族盘绣纹样图片存储与检索系统的项目工作' : context.role,
    teamScope: software ? '登记信息对应项目团队的软件成果；本人具体开发范围以项目案例为准。' : context.teamScope,
    summary: software ? '与土族盘绣数字化项目相关的软件登记记录。' : '与项目实践相关的实用新型申请记录。',
    identifier: item.identifier,
    projectHref: `/projects/${item.project}/`,
    sources: [],
  };
});

export const achievementRecords: readonly AchievementRecord[] = [...awards, ...intellectualPropertyRecords];

const highlight = achievementRecords.find((record) => record.id === 'challenge-cup-2026')
  ?? achievementRecords.find((record) => record.kind === '团队奖项' && record.sources.length > 0)
  ?? achievementRecords[0];
if (!highlight) throw new Error('Featured achievement record is missing');
export const featuredAchievement: AchievementRecord = highlight;
