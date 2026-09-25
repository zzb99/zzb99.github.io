export interface MediaCredit {
  id: string;
  series: string;
  episode: string;
  credit: string;
  year: string;
  sourceLabel: string;
  href: string;
  summary: string;
}

export interface PublicSource {
  id: string;
  title: string;
  publisher: string;
  summary: string;
  href: string;
  kind: 'profile' | 'project' | 'award';
}

// Credits reproduce the role printed on each program team's own page. They
// describe participation in one episode, not authorship of the entire series.
export const programCredits: readonly MediaCredit[] = [
  {
    id: 'quality-china',
    series: '品质中国',
    episode: '吴文标：心之所向，行之所住',
    credit: '后期',
    year: '2023',
    sourceLabel: '《品质中国》节目组 · 本期制作团队',
    href: 'https://www.cctvpzzg.com/article.aspx?nid=15866',
    summary: '该期节目页面的制作团队名单中，张智博署名为“后期”。',
  },
  {
    id: 'climbers',
    series: '攀登者',
    episode: '韩哲：法之为器，法之为光',
    credit: '剪辑师',
    year: '2026',
    sourceLabel: '《攀登者》节目组 · 本期制作团队',
    href: 'https://www.cctvpdz.cn/newsdetail.aspx?nid=17514&sid=473',
    summary: '该期节目页面的制作团队名单中，张智博署名为“剪辑师”。',
  },
  {
    id: 'perspectives',
    series: '见解',
    episode: '范国栋：德义相承，烹饪新篇',
    credit: '后期',
    year: '2026',
    sourceLabel: '《见解》节目组 · 本期制作团队',
    href: 'https://www.cctvjianjie.com/news-details.aspx?cid=498&nid=17425',
    summary: '该期节目页面的制作团队名单中，张智博署名为“后期”。',
  },
];

// An external index is useful for discovery; only original institutional pages
// are used here as evidence for project membership and a team-level award.
export const publicSources: readonly PublicSource[] = [
  {
    id: 'postal-school',
    title: '供件达人——快递分拣智能供件先锋',
    publisher: '石家庄邮电职业技术学院',
    summary: '学校项目介绍列出项目团队成员及技术路线；张智博在团队名单中。',
    href: 'https://www.sjzpc.edu.cn/info/2681/69221.htm',
    kind: 'project',
  },
  {
    id: 'panxiu-school',
    title: '“锦绣前程”——土族盘绣的古艺新生',
    publisher: '石家庄邮电职业技术学院',
    summary: '学校项目介绍列出团队成员与项目背景；张智博在团队名单中。',
    href: 'https://www.sjzpc.edu.cn/info/2681/69201.htm',
    kind: 'project',
  },
  {
    id: 'panxiu-award-school',
    title: '“锦绣前程”获 2024 中国国际大学生创新大赛铜奖',
    publisher: '石家庄邮电职业技术学院',
    summary: '学校发布的团队项目获奖记录。个人参与关系见上方学校项目介绍。',
    href: 'https://www.sjzpc.edu.cn/info/1971/66021.htm',
    kind: 'award',
  },
  {
    id: 'baidu-baike',
    title: '张智博 · 百度百科条目',
    publisher: '百度百科',
    summary: '供读者查看外部人物资料索引。条目内容可能更新，具体成果以原始来源为准。',
    href: 'https://baike.baidu.com/item/%E5%BC%A0%E6%99%BA%E5%8D%9A/68284301',
    kind: 'profile',
  },
];
