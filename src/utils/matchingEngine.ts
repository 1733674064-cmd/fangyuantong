import { Property, Client, MatchResult, MatchScoreBreakdown } from '../types';

export function calculateMatchScore(property: Property, client: Client): MatchResult {
  // 1. Transaction Type Check
  const typeMatch = property.type === client.targetType;
  if (!typeMatch) {
    const emptyBreakdown: MatchScoreBreakdown = {
      typeMatch: false,
      budgetScore: 0,
      roomScore: 0,
      locationScore: 0,
      tagScore: 0,
      bonusPenalty: 0,
      totalScore: 0,
    };
    return {
      property,
      client,
      score: 0,
      breakdown: emptyBreakdown,
      matchLevel: 'low',
      pros: [],
      cons: [`交易类型不符：客户需要${client.targetType === 'sale' ? '买房' : '租房'}，该房源为${property.type === 'sale' ? '出售' : '出租'}`],
      recommendationPitch: '',
    };
  }

  const pros: string[] = [];
  const cons: string[] = [];

  // 2. Budget Scoring (0 - 35)
  let budgetScore = 0;
  const price = property.price;
  const minB = client.minBudget;
  const maxB = client.maxBudget;
  const unit = property.type === 'sale' ? '万' : '元/月';

  if (price >= minB && price <= maxB) {
    budgetScore = 32;
    // Under max budget gives high cost-performance bonus
    const saving = maxB - price;
    if (saving > 0) {
      budgetScore = 35;
      pros.push(`价格极具性价比：总价 ${price}${unit}，低于客户预算上限 ${saving}${unit}`);
    } else {
      pros.push(`价格完全吻合：总价 ${price}${unit}，精准卡在客户预算内`);
    }
  } else if (price > maxB) {
    const overPercent = ((price - maxB) / maxB) * 100;
    if (overPercent <= 5) {
      budgetScore = 24;
      cons.push(`总价略超预算 ${price - maxB}${unit}（超${overPercent.toFixed(1)}%），但业主心理底价可能有谈判空间`);
    } else if (overPercent <= 12) {
      budgetScore = 15;
      cons.push(`总价超出客户预算上限 ${price - maxB}${unit}（超${overPercent.toFixed(1)}%），需重点沟通预算弹性`);
    } else if (overPercent <= 20) {
      budgetScore = 8;
      cons.push(`总价明显偏高（超预算上限 ${(price - maxB).toFixed(0)}${unit}）`);
    } else {
      budgetScore = 0;
      cons.push(`价格严重超标（超出上限 ${overPercent.toFixed(0)}%）`);
    }
  } else {
    // Below min budget
    const underPercent = ((minB - price) / minB) * 100;
    if (underPercent <= 15) {
      budgetScore = 30;
      pros.push(`大幅低于客户起步预算，资金负担极其轻松`);
    } else {
      budgetScore = 22;
      cons.push(`价格远低于客户预算，需核实客户是否对品质有更高要求`);
    }
  }

  // 3. Room & Layout Scoring (0 - 25)
  let roomScore = 0;
  const preferredRooms = client.preferredRooms || [];
  if (preferredRooms.length === 0) {
    roomScore = 20;
    pros.push(`户型为 ${property.rooms}室${property.livingRooms}厅，实用空间充裕`);
  } else if (preferredRooms.includes(property.rooms)) {
    roomScore = 25;
    pros.push(`户型精准匹配：需求包含 ${property.rooms}室，房源为 ${property.rooms}室${property.livingRooms}厅${property.bathrooms}卫`);
  } else {
    const minDiff = Math.min(...preferredRooms.map((r) => Math.abs(r - property.rooms)));
    if (minDiff === 1) {
      roomScore = 14;
      cons.push(`户型相差1居室（客户意向 ${preferredRooms.join('/')}室，实际为 ${property.rooms}室）`);
    } else {
      roomScore = 5;
      cons.push(`居室数差异较大（意向 ${preferredRooms.join('/')}室，实际为 ${property.rooms}室）`);
    }
  }

  if (client.minArea && property.area >= client.minArea) {
    pros.push(`面积符合预期：建筑面积 ${property.area}㎡（客户期望 ≥${client.minArea}㎡）`);
  } else if (client.minArea && property.area < client.minArea) {
    cons.push(`面积略小：建面 ${property.area}㎡，低于客户期望值 ${client.minArea}㎡`);
  }

  // 4. District / Location Scoring (0 - 20)
  let locationScore = 0;
  const preferredDistricts = client.preferredDistricts || [];
  if (preferredDistricts.length === 0) {
    locationScore = 16;
    pros.push(`位于 ${property.district}，周边配套齐全`);
  } else {
    const isMatchedDistrict = preferredDistricts.some(
      (d) => property.district.includes(d) || (property.address && property.address.includes(d))
    );
    if (isMatchedDistrict) {
      locationScore = 20;
      pros.push(`区域完全符合：位于客户意向片区【${property.district}】`);
    } else {
      locationScore = 6;
      cons.push(`不在客户首选区域列表内（客户意向：${preferredDistricts.join('、')}）`);
    }
  }

  // 5. Feature & Tag Scoring (0 - 20)
  let tagScore = 0;
  const clientReqs = client.keyRequirements || [];
  if (clientReqs.length === 0) {
    tagScore = 15;
  } else {
    let matchedTagCount = 0;
    const matchedTagNames: string[] = [];

    clientReqs.forEach((req) => {
      // Check in tags
      const inTags = property.tags.some((t) => t.includes(req) || req.includes(t));
      const inHighlights = property.highlights.includes(req);
      const isElevator = req.includes('电梯') && property.hasElevator;
      const isSubway = req.includes('地铁') && (property.tags.includes('近地铁') || !!property.subwayDistance);
      const isSchool = req.includes('学区') && (property.tags.includes('优质学区') || property.highlights.includes('学区') || property.highlights.includes('学位'));

      if (inTags || inHighlights || isElevator || isSubway || isSchool) {
        matchedTagCount++;
        matchedTagNames.push(req);
      }
    });

    const ratio = matchedTagCount / clientReqs.length;
    tagScore = Math.round(ratio * 20);

    if (matchedTagNames.length > 0) {
      pros.push(`契合客户核心诉求：命中【${matchedTagNames.join('、')}】`);
    }

    const missedTags = clientReqs.filter((r) => !matchedTagNames.includes(r));
    if (missedTags.length > 0) {
      cons.push(`暂未满足诉求：缺少【${missedTags.join('、')}】`);
    }
  }

  // 6. Bonus / Penalty (-5 to +5)
  let bonusPenalty = 0;
  if (property.status === 'active') {
    bonusPenalty += 2;
  } else if (property.status === 'reserved') {
    bonusPenalty -= 5;
    cons.push('注意：该房源当前处于【已预定】状态，需与业主确认是否仍可看');
  }

  // Check familyNotes synergy
  const familyNotes = (client.familyNotes || '').toLowerCase();
  if (familyNotes.includes('老人') || familyNotes.includes('长辈')) {
    if (property.hasElevator) {
      bonusPenalty += 2;
      pros.push('配备电梯，非常适合家中老人日常上下楼出行');
    } else {
      bonusPenalty -= 3;
      cons.push('客户家庭有老人，该房源无电梯可能不便');
    }
  }

  if (familyNotes.includes('小孩') || familyNotes.includes('孩子') || familyNotes.includes('学')) {
    if (property.tags.includes('优质学区') || property.highlights.includes('名校') || property.highlights.includes('学位')) {
      bonusPenalty += 2;
      pros.push('对口优质学区/幼儿园，契合孩子就读教育规划');
    }
  }

  if (familyNotes.includes('车') || familyNotes.includes('自驾')) {
    if (property.tags.includes('带车位') || property.highlights.includes('车位')) {
      bonusPenalty += 1;
      pros.push('包含或配有停车位，满足家庭自驾通勤');
    }
  }

  const rawScore = budgetScore + roomScore + locationScore + tagScore + bonusPenalty;
  const totalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const breakdown: MatchScoreBreakdown = {
    typeMatch: true,
    budgetScore,
    roomScore,
    locationScore,
    tagScore,
    bonusPenalty,
    totalScore,
  };

  let matchLevel: 'perfect' | 'high' | 'medium' | 'low' = 'low';
  if (totalScore >= 85) matchLevel = 'perfect';
  else if (totalScore >= 72) matchLevel = 'high';
  else if (totalScore >= 55) matchLevel = 'medium';

  // Generate Personalized WeChat Pitch
  const recommendationPitch = generateRecommendationPitch(property, client, pros, cons, totalScore);

  return {
    property,
    client,
    score: totalScore,
    breakdown,
    matchLevel,
    pros,
    cons,
    recommendationPitch,
  };
}

function generateRecommendationPitch(
  property: Property,
  client: Client,
  pros: string[],
  _cons: string[],
  score: number
): string {
  const priceUnit = property.type === 'sale' ? '万' : '元/月';
  const actionWord = property.type === 'sale' ? '买房' : '租房';

  let greeting = `${client.name}，您好！`;
  let opener = `根据您前两天的${actionWord}需求，我刚才在房源库里为您做了一轮深度智能匹配，淘到了一套特别契合您要求的房子（综合匹配度高达 ${score}%）：`;

  let highlightBullets = [
    `📍 【小区位置】${property.community}（${property.district}），${property.subwayDistance || '交通配套便利'}`,
    `🏠 【户型面积】${property.rooms}室${property.livingRooms}厅${property.bathrooms}卫，建筑面积 ${property.area}㎡，${property.orientation}朝向`,
    `💰 【挂牌价格】${property.price}${priceUnit}（${property.type === 'sale' ? `折合单价约${property.unitPrice || Math.round((property.price * 10000) / property.area)}元/㎡` : '随时可拎包入住'}）`,
    `✨ 【核心契合点】${property.highlights}`,
  ];

  let specialFit = '';
  if (pros.length > 0) {
    specialFit = `\n💡 为什么特别推荐给您：\n${pros.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
  }

  let closing = `\n这套房子业主诚意度很高，看房比较方便。您看这周找个时间，我帮您提前约好业主实地带您看下？`;

  return `${greeting}\n\n${opener}\n\n${highlightBullets.join('\n')}${specialFit}\n${closing}`;
}

export function matchAllPropertiesForClient(client: Client, properties: Property[]): MatchResult[] {
  return properties
    .map((p) => calculateMatchScore(p, client))
    .filter((res) => res.breakdown.typeMatch)
    .sort((a, b) => b.score - a.score);
}

export function matchAllClientsForProperty(property: Property, clients: Client[]): MatchResult[] {
  return clients
    .map((c) => calculateMatchScore(property, c))
    .filter((res) => res.breakdown.typeMatch)
    .sort((a, b) => b.score - a.score);
}
