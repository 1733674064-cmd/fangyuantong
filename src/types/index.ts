export type TransactionType = 'sale' | 'rent';

export type PropertyStatus = 'active' | 'reserved' | 'deal' | 'offline';

export type DecorationType = 'rough' | 'simple' | 'refined' | 'luxury';

export type ClientStage = 'lead' | 'matched' | 'viewing' | 'negotiating' | 'closed';

export type ClientUrgency = 'urgent' | 'medium' | 'casual';

export type ClientType = 'first_home' | 'upgrade' | 'tenant' | 'investor';

export type UserRole = 'admin' | 'agent';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  community: string; // 小区名称
  district: string;  // 行政区/商圈
  type: TransactionType;
  price: number; // 售价(万元) 或 租金(元/月)
  unitPrice?: number; // 单价 (元/㎡)
  rooms: number; // 室
  livingRooms: number; // 厅
  bathrooms: number; // 卫
  area: number; // 建筑面积 ㎡
  floor: 'low' | 'middle' | 'high' | number; // 楼层描述
  totalFloors: number;
  hasElevator: boolean;
  orientation: string; // 朝向
  decoration: DecorationType;
  tags: string[]; // 标签: "近地铁", "带电梯", "优质学区", etc.
  highlights: string; // 核心卖点
  images?: string[]; // 房源实勘照片 / 户型图 base64 或 URL
  address?: string;
  subwayDistance?: string; // 距离地铁，如 "距2号线科技园站300米"
  ownerName: string;
  ownerPhone: string;
  minPrice?: number; // 业主底价心理预期 (私密参考)
  status: PropertyStatus;
  viewCount?: number;
  notes?: string;
  beikeHouseCode?: string; // 贝壳 / A+ 房源编码 (例如: 105108283921)
  beikeUrl?: string; // 贝壳原始房源网页链接或 A+ 分享地址
  isBeikeSynced?: boolean; // 标记是否同步自贝壳 A+
  lastSyncedAt?: string; // 最近同步或核验时间
  createdBy?: string; // 归属经纪人ID
  createdByName?: string; // 归属经纪人姓名
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  wechat?: string;
  clientType: ClientType;
  targetType: TransactionType;
  minBudget: number; // 最小预算 (万元 或 元/月)
  maxBudget: number; // 最大预算 (万元 或 元/月)
  preferredDistricts: string[]; // 意向区域/商圈
  preferredRooms: number[]; // 意向居室数，如 [2, 3]
  minArea?: number; // 最低面积
  keyRequirements: string[]; // 核心偏好标签，如 "近地铁", "电梯房", "学区"
  urgency: ClientUrgency;
  familyNotes: string; // 客户背景/家庭诉求备忘 (如家有老人、小孩上学)
  stage: ClientStage;
  notes?: string;
  createdBy?: string; // 归属经纪人ID
  createdByName?: string; // 归属经纪人姓名
  createdAt: string;
  updatedAt: string;
}

export interface MatchScoreBreakdown {
  typeMatch: boolean;
  budgetScore: number; // 0 - 35
  roomScore: number;   // 0 - 25
  locationScore: number; // 0 - 20
  tagScore: number;    // 0 - 20
  bonusPenalty: number; // -5 to +5
  totalScore: number;  // 0 - 100
}

export interface MatchResult {
  property: Property;
  client: Client;
  score: number;
  breakdown: MatchScoreBreakdown;
  matchLevel: 'perfect' | 'high' | 'medium' | 'low';
  pros: string[];
  cons: string[];
  recommendationPitch: string;
}
