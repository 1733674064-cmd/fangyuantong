/**
 * 贝壳找房 / 链家 / ACN (A+系统) 房源链接与分享口令智能解析器
 */

import { Property, TransactionType, DecorationType } from '../types';

export interface ParsedBeikeResult {
  success: boolean;
  message?: string;
  data?: Partial<Property>;
  rawSnippet?: string;
}

// 珠海主要商圈与行政区对应字典
const ZHUHAI_COMMUNITY_DISTRICT_MAP: Record<string, string> = {
  '华发首府': '横琴新区',
  '横琴金融岛': '横琴新区',
  '华发琴澳新城': '十字门/保税区',
  '中海名钻': '横琴新区',
  '中冶逸璟公馆': '横琴新区',
  '保利国际广场': '横琴新区',
  '中海银海湾': '香洲区',
  '格力广场': '香洲区',
  '华发世纪城': '南湾/前山',
  '华发新城': '南湾/前山',
  '华发四季': '新香洲',
  '仁恒滨海半岛': '高新区',
  '仁恒星园': '新香洲',
  '万科海愉半岛': '吉大',
  '九洲绿城翠湖香山': '高新区',
  '招商依云水岸': '斗门区',
  '金湾航空新城': '金湾区',
  '保利香缤': '金湾区',
};

/**
 * 核心解析引擎：提取贝壳/A+分享文本或链接
 */
export function parseBeikeShareContent(rawInput: string): ParsedBeikeResult {
  const text = rawInput.trim();
  if (!text) {
    return { success: false, message: '请输入或粘贴贝壳分享内容或链接' };
  }

  const result: Partial<Property> = {
    isBeikeSynced: true,
    lastSyncedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  // 1. 提取贝壳房源编码 (HouseCode: 普遍为 12 位纯数字，通常以 1051 或 107 开头)
  const codeInUrlMatch = text.match(/(?:ershoufang|zufang|house)\/(\d{10,14})\.html/i);
  const codeDirectMatch = text.match(/(?:房源编码|房源编号|房源ID|HouseCode)[：:\s]*(\d{10,14})/i);
  const any12DigitMatch = text.match(/\b(10\d{10})\b/);

  let houseCode: string | undefined = undefined;
  if (codeInUrlMatch) {
    houseCode = codeInUrlMatch[1];
  } else if (codeDirectMatch) {
    houseCode = codeDirectMatch[1];
  } else if (any12DigitMatch) {
    houseCode = any12DigitMatch[1];
  }

  if (houseCode) {
    result.beikeHouseCode = houseCode;
  }

  // 2. 提取并保留原始贝壳链接
  const urlMatch = text.match(/https?:\/\/[^\s，。！？【】]+/i);
  if (urlMatch) {
    result.beikeUrl = urlMatch[0];
  } else if (houseCode) {
    // 根据交易类型构建标准贝壳链接
    const isRent = text.includes('租') || text.includes('元/月');
    result.beikeUrl = `https://zh.ke.com/${isRent ? 'zufang' : 'ershoufang'}/${houseCode}.html`;
  }

  // 3. 判断租售类型
  let type: TransactionType = 'sale';
  if (text.includes('租') || text.includes('元/月') || text.includes('zufang')) {
    type = 'rent';
  }
  result.type = type;

  // 4. 提取价格
  if (type === 'sale') {
    // 售价：通常为 "520万" 或 "520 万元" 或 "报价520万"
    const priceMatch = text.match(/(?:报价|总价|挂牌价)?\s*(\d+(?:\.\d+)?)\s*(?:万|万元)/);
    if (priceMatch) {
      result.price = parseFloat(priceMatch[1]);
    }
  } else {
    // 租金：通常为 "3500元/月" 或 "3500/月" 或 "3500元"
    const rentMatch = text.match(/(\d{3,6})\s*(?:元\/月|\/月|元)/);
    if (rentMatch) {
      result.price = parseInt(rentMatch[1], 10);
    }
  }

  // 5. 提取建筑面积 ㎡ / 平米
  const areaMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:平米|㎡|平方|平|平米)/);
  if (areaMatch) {
    result.area = parseFloat(areaMatch[1]);
  }

  // 6. 提取户型室、厅、卫
  // 如 "3室2厅", "3室2厅2卫", "3房2厅", "4室1厅"
  const roomMatch = text.match(/(\d+)\s*(?:室|房)\s*(\d+)?\s*(?:厅)?\s*(\d+)?\s*(?:卫)?/);
  if (roomMatch) {
    result.rooms = parseInt(roomMatch[1], 10);
    result.livingRooms = roomMatch[2] ? parseInt(roomMatch[2], 10) : 1;
    result.bathrooms = roomMatch[3] ? parseInt(roomMatch[3], 10) : 1;
  } else {
    // 单独找 "X室"
    const singleRoomMatch = text.match(/(\d+)\s*(?:室|房)/);
    if (singleRoomMatch) {
      result.rooms = parseInt(singleRoomMatch[1], 10);
      result.livingRooms = 1;
      result.bathrooms = 1;
    }
  }

  // 7. 提取小区名称
  // 贝壳口令通常格式：【中海银海湾 3室2厅 138平米 520万】
  let community = '';
  const bracketMatch = text.match(/【([^】]+)】/g);
  if (bracketMatch) {
    for (const b of bracketMatch) {
      const clean = b.replace(/[【】]/g, '').trim();
      // 跳过 "贝壳找房", "A+房源", "好房推荐" 等通用前缀
      if (clean.includes('贝壳') || clean.includes('A+') || clean.includes('推荐') || clean.includes('链家')) {
        continue;
      }
      // 提取括号里首个词汇（通常为小区名）
      const parts = clean.split(/[\s,，]+/);
      if (parts[0] && parts[0].length >= 2 && !/^\d+$/.test(parts[0])) {
        community = parts[0];
        break;
      }
    }
  }

  if (!community) {
    // 正则尝试匹配小区名关键词，如 "华发四季", "中海名钻" 等
    for (const knownComm of Object.keys(ZHUHAI_COMMUNITY_DISTRICT_MAP)) {
      if (text.includes(knownComm)) {
        community = knownComm;
        break;
      }
    }
  }

  if (!community) {
    // 尝试匹配 "在[小区名]看到" 或 "[小区名] X室X厅"
    const commPattern = /([A-Za-z\u4e00-\u9fa5]{2,10}(?:花园|名钻|广场|首府|四季|湾|公馆|半岛|翠湖|华府|国际|新城|一期|二期|三期|家园|雅苑|水岸))\b/;
    const m = text.match(commPattern);
    if (m) {
      community = m[1];
    }
  }

  if (community) {
    result.community = community;
  }

  // 8. 智能匹配行政区
  if (community && ZHUHAI_COMMUNITY_DISTRICT_MAP[community]) {
    result.district = ZHUHAI_COMMUNITY_DISTRICT_MAP[community];
  } else {
    // 检查文字中是否有珠海具体行政区
    const districts = ['横琴新区', '香洲区', '高新区', '金湾区', '斗门区', '十字门', '南湾', '新香洲', '吉大', '拱北'];
    for (const d of districts) {
      if (text.includes(d)) {
        result.district = d.includes('十字门') || d.includes('南湾') || d.includes('新香洲') || d.includes('吉大') || d.includes('拱北') ? '香洲区' : d;
        break;
      }
    }
  }

  // 9. 提取朝向
  const orientations = ['南北通透', '纯南向', '东南向', '西南向', '东向', '西向', '北向'];
  for (const ori of orientations) {
    if (text.includes(ori)) {
      result.orientation = ori;
      break;
    }
  }

  // 10. 提取楼层与电梯
  if (text.includes('高楼层') || text.includes('高层')) {
    result.floor = 'high';
  } else if (text.includes('低楼层') || text.includes('低层')) {
    result.floor = 'low';
  } else {
    result.floor = 'middle';
  }

  const floorTotalMatch = text.match(/共\s*(\d+)\s*层/);
  if (floorTotalMatch) {
    result.totalFloors = parseInt(floorTotalMatch[1], 10);
  }

  result.hasElevator = !text.includes('步梯') && !text.includes('无电梯');

  // 11. 提取标签与亮点
  const tags: string[] = ['贝壳同步', 'ACN真实在售'];
  if (text.includes('满五唯一') || text.includes('满五')) tags.push('满五唯一');
  if (text.includes('近地铁') || text.includes('地铁')) tags.push('近地铁');
  if (text.includes('精装') || text.includes('豪装')) tags.push('精装好房');
  if (text.includes('南北通透')) tags.push('南北通透');
  if (text.includes('随时看房') || text.includes('有钥匙')) tags.push('随时看房');
  if (text.includes('海景')) tags.push('一线海景');

  result.tags = Array.from(new Set(tags));

  // 12. 自动生成标题
  if (result.community) {
    const roomStr = result.rooms ? `${result.rooms}室${result.livingRooms || 1}厅` : '';
    const areaStr = result.area ? `${result.area}㎡` : '';
    const priceStr = result.price ? `${result.price}${type === 'sale' ? '万' : '元/月'}` : '';
    result.title = `【贝壳ACN】${result.community} ${roomStr} ${areaStr} ${priceStr}`.trim();
  }

  // 13. 计算单价
  if (type === 'sale' && result.price && result.area) {
    result.unitPrice = Math.round((result.price * 10000) / result.area);
  }

  // 14. 核心亮点描述
  result.highlights = `该房源来自贝壳找房/A+系统真实同步（编码:${houseCode || '在线挂牌'}），${result.orientation || '采光充沛'}，看房随时预约，支持A+协同带看。`;

  return {
    success: true,
    data: result,
    rawSnippet: text,
  };
}

/**
 * 示例数据，供经纪人一键体验贝壳同步效果
 */
export const BEIKE_SAMPLE_SNIPPETS = [
  {
    label: '中海银海湾（二手买卖）',
    snippet: '【贝壳找房】我在贝壳看到一套好房【中海银海湾 3室2厅 138.5平米 520万】，南北通透一线海景高楼层，快来看看：https://zh.ke.com/ershoufang/105108291845.html 房源编码：105108291845',
  },
  {
    label: '华发首府（横琴高端买卖）',
    snippet: '【A+内部好房】华发首府 4室2厅2卫 129平米 报价480万 满五唯一 楼王位置 南北通透 有钥匙随时看房 房源编码: 105119283719',
  },
  {
    label: '华发新城（品质租房）',
    snippet: '【贝壳找房】华发新城二期 2室1厅 68平米 3600元/月 精装修家具齐全家电配套完善：https://zh.ke.com/zufang/105102918234.html',
  },
];
