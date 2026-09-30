import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Building2,
  Users,
  Sparkles,
  Flame,
  ArrowRight,
  PieChart,
  CheckCircle,
} from 'lucide-react';
import { Property, Client } from '../types';
import { calculateMatchScore } from '../utils/matchingEngine';

interface DashboardStatsProps {
  properties: Property[];
  clients: Client[];
  onSelectClientToMatch: (clientId: string) => void;
  onOpenAddProperty: () => void;
  onOpenAddClient: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  properties,
  clients,
  onSelectClientToMatch,
  onOpenAddProperty,
  onOpenAddClient,
}) => {
  const activeProperties = properties.filter((p) => p.status === 'active');
  const saleProperties = activeProperties.filter((p) => p.type === 'sale');
  const rentProperties = activeProperties.filter((p) => p.type === 'rent');

  const buyersCount = clients.filter((c) => c.targetType === 'sale').length;
  const tenantsCount = clients.filter((c) => c.targetType === 'rent').length;
  const urgentClients = clients.filter((c) => c.urgency === 'urgent');

  // Compute urgent match pairs
  const urgentMatches = React.useMemo(() => {
    return urgentClients.map((client) => {
      const availableProps = properties.filter(
        (p) => p.type === client.targetType && p.status === 'active'
      );
      const scores = availableProps
        .map((p) => calculateMatchScore(p, client))
        .sort((a, b) => b.score - a.score);
      const topMatch = scores[0] || null;
      return { client, topMatch };
    });
  }, [urgentClients, properties]);

  // Room Supply vs Demand distribution
  const roomDemand = { 1: 0, 2: 0, 3: 0, 4: 0 };
  clients.forEach((c) => {
    c.preferredRooms.forEach((r) => {
      if (r <= 1) roomDemand[1]++;
      else if (r === 2) roomDemand[2]++;
      else if (r === 3) roomDemand[3]++;
      else roomDemand[4]++;
    });
  });

  const roomSupply = { 1: 0, 2: 0, 3: 0, 4: 0 };
  activeProperties.forEach((p) => {
    if (p.rooms <= 1) roomSupply[1]++;
    else if (p.rooms === 2) roomSupply[2]++;
    else if (p.rooms === 3) roomSupply[3]++;
    else roomSupply[4]++;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">在售在租房源</span>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {activeProperties.length}
              <span className="text-xs font-normal text-slate-400 ml-1">/ 总{properties.length}套</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              买卖 {saleProperties.length} 套 · 租赁 {rentProperties.length} 套
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">建档客户总数</span>
            <div className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
              {clients.length}
              <span className="text-xs font-normal text-slate-400 ml-1">位</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              买家 {buyersCount} 位 · 租客 {tenantsCount} 位
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">紧急跟进客源</span>
            <div className="text-2xl font-black text-rose-600 font-mono tabular-nums mt-1">
              {urgentClients.length}
              <span className="text-xs font-normal text-slate-400 ml-1">人 (1周内)</span>
            </div>
            <div className="text-xs text-rose-500 font-medium mt-1">
              亟待精准推房预约带看
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">已进入带看/谈判</span>
            <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums mt-1">
              {clients.filter((c) => c.stage === 'viewing' || c.stage === 'negotiating').length}
              <span className="text-xs font-normal text-slate-400 ml-1">组</span>
            </div>
            <div className="text-xs text-emerald-600 font-medium mt-1">
              准成交转化重点蓄水池
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4-Stage Business Pipeline Distribution Board */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>客户业务推进各阶段数量分布看板</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              监控意向客户从待带看、带看推进、商务谈判至最后签约成交的业务流转漏斗
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            全周期转化率: {clients.length > 0 ? ((clients.filter(c => c.stage === 'closed').length / clients.length) * 100).toFixed(0) : 0}% 成交结单
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'matched',
              label: '待带看',
              desc: '房源已匹配 · 待约定日程',
              clientsList: clients.filter((c) => c.stage === 'matched' || c.stage === 'lead'),
              color: 'indigo',
              border: 'border-indigo-200',
              bg: 'bg-indigo-50/50',
              badge: 'bg-indigo-50 text-indigo-700',
            },
            {
              id: 'viewing',
              label: '带看中',
              desc: '实地看房中 · 收集抗性',
              clientsList: clients.filter((c) => c.stage === 'viewing'),
              color: 'blue',
              border: 'border-blue-200',
              bg: 'bg-blue-50/50',
              badge: 'bg-blue-50 text-blue-700',
            },
            {
              id: 'negotiating',
              label: '谈判中',
              desc: '意向明确 · 磨业主底价',
              clientsList: clients.filter((c) => c.stage === 'negotiating'),
              color: 'amber',
              border: 'border-amber-200',
              bg: 'bg-amber-50/50',
              badge: 'bg-amber-50 text-amber-700',
            },
            {
              id: 'closed',
              label: '已成交',
              desc: '合同签约 · 佣金结算',
              clientsList: clients.filter((c) => c.stage === 'closed'),
              color: 'emerald',
              border: 'border-emerald-200',
              bg: 'bg-emerald-50/50',
              badge: 'bg-emerald-50 text-emerald-700',
            },
          ].map((col, index) => {
            const count = col.clientsList.length;
            const percent = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
            return (
              <div
                key={col.id}
                className={`p-4 rounded-xl border ${col.border} ${col.bg} flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{col.label}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${col.badge}`}>
                      {count} 人 ({percent}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">{col.desc}</p>

                  <div className="space-y-1.5">
                    {col.clientsList.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">暂无客户</span>
                    ) : (
                      col.clientsList.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => onSelectClientToMatch(c.id)}
                          className="bg-white p-2 rounded-lg border border-slate-200 text-xs hover:border-indigo-400 cursor-pointer transition-all shadow-2xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 line-clamp-1">{c.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {c.maxBudget}{c.targetType === 'sale' ? '万' : '元'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {c.preferredRooms.join('/')}室 · {c.preferredDistricts.join('/') || '全城'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>总客户占比</span>
                  <span className="font-bold text-slate-700">{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Urgent Action Board */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>紧急找房客户 · 顶级高契合房源推荐看板</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              系统实时根据急迫客户画像计算出当前库里匹配度最高的笋盘，建议优先电话跟进或发送微信。
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {urgentMatches.map(({ client, topMatch }) => (
            <div
              key={client.id}
              className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 transition-all bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{client.name}</span>
                  <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                    急购/急租
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    预算: {client.minBudget}~{client.maxBudget}
                    {client.targetType === 'sale' ? '万' : '元/月'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 line-clamp-1">
                  诉求: {client.preferredDistricts.join('/')} · {client.preferredRooms.join('/')}室 ·{' '}
                  {client.keyRequirements.join('、')}
                </div>
                {client.familyNotes && (
                  <div className="text-xs text-slate-400 mt-0.5 italic">
                    "{client.familyNotes.slice(0, 50)}..."
                  </div>
                )}
              </div>

              {/* Best Matched Property */}
              {topMatch ? (
                <div className="flex items-center gap-4 bg-white p-2.5 rounded-lg border border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
                  <div>
                    <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="text-indigo-600 font-bold font-mono">
                        {topMatch.score}分
                      </span>
                      <span>{topMatch.property.community}</span>
                      <span className="text-slate-400">({topMatch.property.rooms}室)</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      报价: {topMatch.property.price}
                      {topMatch.property.type === 'sale' ? '万' : '元/月'} ·{' '}
                      {topMatch.pros[0] || '核心诉求匹配'}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectClientToMatch(client.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm"
                  >
                    <span>智能工作台推进</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-400">当前库中暂无匹配房源</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Supply & Demand Distribution Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layout Supply vs Demand */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>户型供需对比 (客户需求 vs 在盘房源)</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            辅助经纪人判断哪个户型紧缺，以便有针对性地去拓展优质房源
          </p>

          <div className="space-y-4 text-xs">
            {[1, 2, 3, 4].map((rooms) => {
              const label = rooms === 4 ? '4室及以上' : `${rooms}室`;
              const demandCount = roomDemand[rooms as keyof typeof roomDemand] || 0;
              const supplyCount = roomSupply[rooms as keyof typeof roomSupply] || 0;
              const total = demandCount + supplyCount || 1;
              const demandPercent = Math.round((demandCount / total) * 100);
              const supplyPercent = Math.round((supplyCount / total) * 100);

              const isDeficit = demandCount > supplyCount;

              return (
                <div key={rooms} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-600 font-medium">客需: {demandCount}组</span>
                      <span className="text-emerald-600 font-medium">房源: {supplyCount}套</span>
                      {isDeficit && (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">
                          房源紧缺
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar */}
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${demandPercent}%` }}
                      className="bg-indigo-500 h-full"
                      title={`客户需求占比 ${demandPercent}%`}
                    />
                    <div
                      style={{ width: `${supplyPercent}%` }}
                      className="bg-emerald-400 h-full"
                      title={`房源库存占比 ${supplyPercent}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" /> 客户意向需求
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm" /> 现有库存房源
              </span>
            </div>
            <span>中介拓房指引</span>
          </div>
        </div>

        {/* Feature Tags Hotness */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>客户关注热度最高的核心卖点需求</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              当前客户建档中最常被勾选的硬性要求，推房话术应重点围绕这些卖点
            </p>

            <div className="space-y-2.5 text-xs">
              {[
                { tag: '近地铁 (通勤便利)', count: 5, total: 6, percent: 83 },
                { tag: '带电梯 (长辈/便利必备)', count: 5, total: 6, percent: 83 },
                { tag: '朝南/南北通透 (采光通风)', count: 4, total: 6, percent: 67 },
                { tag: '精装拎包入住 (省心低成本)', count: 3, total: 6, percent: 50 },
                { tag: '优质学区/名校学位 (孩子就学)', count: 2, total: 6, percent: 33 },
                { tag: '独立双卫/带车位 (品质改善)', count: 2, total: 6, percent: 33 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 font-medium">{item.tag}</span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {item.count}位客户关注 ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">拓客推房成交秘诀：电梯与地铁为首要促成因素</span>
            <button
              onClick={onOpenAddProperty}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              + 针对性录入新房源
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
