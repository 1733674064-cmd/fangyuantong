import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Scale,
  Calendar,
  ChevronDown,
  Building,
  Tag,
  Flame,
  Plus,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Client, Property, MatchResult } from '../types';
import { matchAllPropertiesForClient } from '../utils/matchingEngine';

interface MatchHubProps {
  clients: Client[];
  properties: Property[];
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  onOpenAddClient: () => void;
  onOpenPitch: (result: MatchResult) => void;
  onOpenComparison: (properties: Property[]) => void;
  onViewProperty: (property: Property) => void;
  onUpdateClientStage: (clientId: string, stage: Client['stage']) => void;
}

export const MatchHub: React.FC<MatchHubProps> = ({
  clients,
  properties,
  selectedClientId,
  onSelectClient,
  onOpenAddClient,
  onOpenPitch,
  onOpenComparison,
  onViewProperty,
  onUpdateClientStage,
}) => {
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'priceAsc' | 'priceDesc' | 'areaDesc'>('score');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  // Active Client
  const activeClient = useMemo(() => {
    if (!selectedClientId && clients.length > 0) {
      return clients[0];
    }
    return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  }, [selectedClientId, clients]);

  // Filter clients for dropdown
  const filteredClients = useMemo(() => {
    if (!clientSearchQuery.trim()) return clients;
    const q = clientSearchQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.preferredDistricts.some((d) => d.includes(q))
    );
  }, [clients, clientSearchQuery]);

  // Compute matched properties for active client
  const matchedResults = useMemo(() => {
    if (!activeClient) return [];
    let results = matchAllPropertiesForClient(activeClient, properties);

    if (minScoreFilter > 0) {
      results = results.filter((r) => r.score >= minScoreFilter);
    }

    if (sortBy === 'priceAsc') {
      results = [...results].sort((a, b) => a.property.price - b.property.price);
    } else if (sortBy === 'priceDesc') {
      results = [...results].sort((a, b) => b.property.price - a.property.price);
    } else if (sortBy === 'areaDesc') {
      results = [...results].sort((a, b) => b.property.area - a.property.area);
    }

    return results;
  }, [activeClient, properties, sortBy, minScoreFilter]);

  const handleToggleCompare = (propertyId: string) => {
    if (selectedForCompare.includes(propertyId)) {
      setSelectedForCompare(selectedForCompare.filter((id) => id !== propertyId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('最多支持同时对比 3 套房源');
        return;
      }
      setSelectedForCompare([...selectedForCompare, propertyId]);
    }
  };

  const handleTriggerCompare = () => {
    const propsToCompare = properties.filter((p) => selectedForCompare.includes(p.id));
    onOpenComparison(propsToCompare);
  };

  if (clients.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">暂无已录入的客户档案</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          开始前，请先录入第一位客户的需求画像（预算区间、意向户型、区域及特殊诉求），系统将自动匹配最适合的房源。
        </p>
        <button
          onClick={onOpenAddClient}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          立即录入新客户画像
        </button>
      </div>
    );
  }

  const perfectMatchesCount = matchedResults.filter((r) => r.score >= 85).length;
  const highMatchesCount = matchedResults.filter((r) => r.score >= 72 && r.score < 85).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Client Selector & Overview Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Client Chooser */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              当前匹配分析客户：
            </span>
            <div className="relative flex-1 max-w-md">
              <select
                value={activeClient?.id}
                onChange={(e) => onSelectClient(e.target.value)}
                className="w-full pl-3 pr-8 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.targetType === 'sale' ? '买房' : '租房'} · 预算 {c.minBudget}~{c.maxBudget}
                    {c.targetType === 'sale' ? '万' : '元/月'} ({c.urgency === 'urgent' ? '🔥急' : '关注'})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onOpenAddClient}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>录入新客户</span>
            </button>
          </div>

          {/* Quick Stage Updater */}
          {activeClient && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">跟进阶段：</span>
              <select
                value={activeClient.stage}
                onChange={(e) => onUpdateClientStage(activeClient.id, e.target.value as Client['stage'])}
                className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="lead">新线索 (初次接触)</option>
                <option value="matched">已配对推荐</option>
                <option value="viewing">带看推进中</option>
                <option value="negotiating">意向谈判</option>
                <option value="closed">成交签约</option>
              </select>
            </div>
          )}
        </div>

        {/* Client Demand Snapshot */}
        {activeClient && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-1">预算区间 & 需求类型</span>
              <div className="font-bold text-slate-900 text-sm font-mono tabular-nums">
                {activeClient.minBudget} ~ {activeClient.maxBudget}{' '}
                {activeClient.targetType === 'sale' ? '万元' : '元/月'}
              </div>
              <div className="text-slate-500 mt-1">
                {activeClient.targetType === 'sale' ? '二手买卖' : '房屋租赁'} ·{' '}
                {activeClient.clientType === 'first_home'
                  ? '刚需首套'
                  : activeClient.clientType === 'upgrade'
                  ? '改善置换'
                  : activeClient.clientType === 'tenant'
                  ? '品质租客'
                  : '投资客'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-1">意向居室 & 意向片区</span>
              <div className="font-semibold text-slate-900 text-sm">
                {activeClient.preferredRooms.join(' / ')} 室
                {activeClient.minArea ? ` (≥${activeClient.minArea}㎡)` : ''}
              </div>
              <div className="text-slate-500 mt-1 truncate">
                {activeClient.preferredDistricts.join('、') || '不限区域'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-1">核心关切标签</span>
              <div className="flex flex-wrap items-center gap-1">
                {activeClient.keyRequirements.map((req, idx) => (
                  <span key={idx} className="text-slate-700 font-medium">
                    {req}
                    {idx < activeClient.keyRequirements.length - 1 && (
                      <span className="text-slate-300 ml-1">·</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="text-slate-500 mt-1 flex items-center gap-1">
                {activeClient.urgency === 'urgent' && (
                  <span className="text-rose-600 font-medium">🔥 1周内需做决策</span>
                )}
                {activeClient.urgency === 'medium' && <span>⚡ 1个月内重点推进</span>}
                {activeClient.urgency === 'casual' && <span>观望随缘</span>}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-400 block mb-1">客户背景备忘 (家庭诉求)</span>
              <p className="text-slate-700 italic line-clamp-2 leading-relaxed">
                "{activeClient.familyNotes || '暂无详细备忘'}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Matching Results Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>智能匹配房源推荐</span>
            <span className="text-xs font-normal text-slate-500">
              (共检索到 {matchedResults.length} 套可匹配房源，其中 {perfectMatchesCount} 套极度契合，{highMatchesCount} 套高度匹配)
            </span>
          </h2>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(parseInt(e.target.value))}
              className="py-1 px-2 text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="0">全部契合度</option>
              <option value="72">仅看高匹配 (≥72分)</option>
              <option value="85">仅看极度契合 (≥85分)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="text-slate-400 pl-1">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2 text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="score">综合匹配度从高到低</option>
              <option value="priceAsc">价格从低到高</option>
              <option value="priceDesc">价格从高到低</option>
              <option value="areaDesc">建筑面积从大到小</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matched Listings Cards Grid */}
      {matchedResults.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">
            暂未找到符合条件的房源
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            可能是因为该客户的预算、居室或区域条件较为苛刻，或者当前房源库中缺乏该类型的有效房源。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {matchedResults.map((result) => {
            const { property, score, breakdown, matchLevel, pros, cons } = result;
            const priceUnit = property.type === 'sale' ? '万' : '元/月';
            const isCompared = selectedForCompare.includes(property.id);

            return (
              <div
                key={property.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                  {/* Left: Property Overview */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => onViewProperty(property)}>
                        {property.title}
                      </span>
                      {property.status === 'reserved' && (
                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          已预定
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800">{property.community}</span>
                      <span className="text-slate-300">·</span>
                      <span>{property.district}</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-medium">
                        {property.rooms}室{property.livingRooms}厅{property.bathrooms}卫
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="font-mono tabular-nums">{property.area} ㎡</span>
                      <span className="text-slate-300">·</span>
                      <span>{property.orientation}</span>
                      <span className="text-slate-300">·</span>
                      <span>
                        {property.floor === 'low' ? '低楼层' : property.floor === 'middle' ? '中楼层' : '高楼层'}
                        /共{property.totalFloors}层
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className={property.hasElevator ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                        {property.hasElevator ? '电梯房' : '步梯'}
                      </span>
                    </div>

                    {property.subwayDistance && (
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <span>🚇 {property.subwayDistance}</span>
                      </div>
                    )}

                    {/* Pros & Cons bullets */}
                    <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="space-y-1">
                        {pros.slice(0, 3).map((pro, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1">
                        {cons.length > 0 ? (
                          cons.slice(0, 2).map((con, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-amber-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span>{con}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span>无明显短板，各维度高度均衡</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Price & Score Breakdown */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-48 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-mono tabular-nums text-rose-600">
                          {property.price}
                        </span>
                        <span className="text-xs font-medium text-slate-500">{priceUnit}</span>
                      </div>
                      {property.type === 'sale' && property.unitPrice && (
                        <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                          约 ¥{property.unitPrice.toLocaleString()} /㎡
                        </div>
                      )}
                    </div>

                    {/* Match Score Display */}
                    <div className="text-right mt-2">
                      <div className="flex items-center gap-1 justify-end">
                        <span
                          className={`text-2xl font-black font-mono tabular-nums ${
                            matchLevel === 'perfect'
                              ? 'text-indigo-600'
                              : matchLevel === 'high'
                              ? 'text-emerald-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {score}
                        </span>
                        <span className="text-xs text-slate-400">/100分</span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600">
                        {matchLevel === 'perfect'
                          ? '🌟 极度契合·力推'
                          : matchLevel === 'high'
                          ? '✅ 高度匹配'
                          : '备选参考'}
                      </div>
                      {/* Sub-scores */}
                      <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                        预算:{breakdown.budgetScore} 户型:{breakdown.roomScore} 区域:{breakdown.locationScore}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col items-center gap-2 w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0">
                    <button
                      onClick={() => onOpenPitch(result)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>推房微信话术</span>
                    </button>

                    <button
                      onClick={() => handleToggleCompare(property.id)}
                      className={`flex-1 lg:flex-none flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                        isCompared
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isCompared ? '已加对比' : '加入比对'}</span>
                    </button>

                    <button
                      onClick={() => onViewProperty(property)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                      title="查看完整房源档案"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Compare Toolbar */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-slate-700">
          <div className="text-xs">
            已选择 <span className="font-bold text-indigo-400 font-mono">{selectedForCompare.length}</span> 套房源
          </div>
          <button
            onClick={handleTriggerCompare}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>立即横向比对</span>
          </button>
          <button
            onClick={() => setSelectedForCompare([])}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            清空
          </button>
        </div>
      )}
    </div>
  );
};
