export const projectImageAlt: Record<string, string> = {
  'hotel-new-media-growth': '酒店客房内的手机拍摄支架、补光镜和内容创作桌面',
  'shentong-market-expansion': '快递分拣传送带上连续运输的纸箱',
  'automotive-lead-growth': '汽车展厅中用于广告投放展示的银色 SUV',
  'warehouse-intelligent-robot': '仓储环境中用于搬运与分拣的智能机器人设备',
  'executive-ip-planning': '用于企业负责人个人 IP 内容策划的会议与创作场景',
  'ecommerce-growth': '淘宝、拼多多和抖音多平台电商运营数据展示',
  'housekeeping-geo': '晋中家政服务网站与本地搜索优化页面展示',
  'postal-sorting-robot': '邮政包裹智能分拣机器人机械臂测试现场',
  jingjie: '净界酒店可更换一次性内胆烧水壶产品设计',
  'panxiu-archive': '土族盘绣纹样数字化采集与 NFC 互动展示',
  'xianyu-feishu-tool': '闲鱼商品信息整理并同步至飞书的工具界面',
};

export const getProjectImageAlt = (slug: string, title: string) => projectImageAlt[slug] ?? `${title}项目封面`;
