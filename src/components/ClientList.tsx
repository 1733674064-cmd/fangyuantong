import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Sparkles,
  Phone,
  MessageSquare,
  Edit2,
  Trash2,
  Calendar,
  Flame,
  CheckCircle2,
  ArrowRight,
  Filter,
  Columns,
  List,
  Clock,
  Check,
  TrendingUp,
  ChevronRight,
  RotateCcw,
  CheckSquare,
  Square,
  SlidersHorizontal,
} from 'lucide-react';
import { Client, ClientStage, ClientUrgency, TransactionType } from '../types';

interface ClientListProps {
  clients: Client[];
  onOpenAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onBatchDeleteClients: (ids: string[]) => void;
  onUpdateStage: (id: string, stage: ClientStage) => void;
  onBatchUpdateStage: (ids: string[], stage: ClientStage) => void;
  onStartMatching: (client: Client) => void;
}

// 4 core stages requested by the user
const KANBAN_STAGES: {
  id: ClientStage;
  label: string;
  iconName: string;
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  desc: string;
  nextStage?: ClientStage;
  nextLabel?: string;
}[] = [
  {
    id: 'matched',
    label: '待带看',
    iconName: 'Clock',
    color: 'indigo',
    badgeBg: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    borderColor: 'border-indigo-200',
    desc: '已配对房源 · 待约定看房日程',
    nextStage: 'viewing',
    nextLabel: '推进至带看中',
  },
  {
    id: 'viewing',
    label: '带看中',
    iconName: 'Calendar',
    color: 'blue',
    badgeBg: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    desc: '实地看房中 · 重点关注客户反馈',
    nextStage: 'negotiating',
    nextLabel: '推进至谈判中',
  },
  {
    id: 'negotiating',
    label: '谈判中',
    iconName: 'Flame',
    color: 'amber',
    badgeBg: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    desc: '意向明确 · 磨业主底价与付款方式',
    nextStage: 'closed',
    nextLabel: '达成成交结单',
  },
  {
    id: 'closed',
    label: '已成交',
    iconName: 'CheckCircle2',
    color: 'emerald',
    badgeBg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    desc: '买卖/租赁签约已完成 · 佣金入账',
  },
];

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onOpenAddClient,
  onEditClient,
  onDeleteClient,
  onBatchDeleteClients,
  onUpdateStage,
  onBatchUpdateStage,
  onStartMatching,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<'all' | TransactionType>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | ClientUrgency>('all');
  const [mobileActiveStage, setMobileActiveStage] = useState<'all' | ClientStage>('all');

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion confirm state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Group clients for the 4 Kanban stages
  const getEffectiveStage = (clientStage: ClientStage): ClientStage => {
    if (clientStage === 'lead') return 'matched';
    return clientStage;
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      if (targetTypeFilter !== 'all' && c.targetType !== targetTypeFilter) return false;
      if (urgencyFilter !== 'all' && c.urgency !== urgencyFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = c.name.toLowerCase().includes(q);
        const inPhone = c.phone.includes(q);
        const inDist = c.preferredDistricts.some((d) => d.toLowerCase().includes(q));
        const inReq = c.keyRequirements.some((r) => r.toLowerCase().includes(q));
        const inNotes = c.familyNotes.toLowerCase().includes(q);
        if (!inName && !inPhone && !inDist && !inReq && !inNotes) return false;
      }
      return true;
    });
  }, [clients, targetTypeFilter, urgencyFilter, searchQuery]);

  // Selection helpers
  const isAllSelected =
    filteredClients.length > 0 &&
    filteredClients.every((c) => selectedIds.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIdSet = new Set(filteredClients.map((c) => c.id));
      setSelectedIds(selectedIds.filter((id) => !filteredIdSet.has(id)));
    } else {
      const newSelected = new Set([...selectedIds, ...filteredClients.map((c) => c.id)]);
      setSelectedIds(Array.from(newSelected));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Stage distribution counts
  const stageStats = useMemo(() => {
    const stats: Record<string, { count: number; totalSaleBudget: number; totalRentBudget: number }> = {
      matched: { count: 0, totalSaleBudget: 0, totalRentBudget: 0 },
      viewing: { count: 0, totalSaleBudget: 0, totalRentBudget: 0 },
      negotiating: { count: 0, totalSaleBudget: 0, totalRentBudget: 0 },
      closed: { count: 0, totalSaleBudget: 0, totalRentBudget: 0 },
    };

    clients.forEach((c) => {
      const stage = getEffectiveStage(c.stage);
      if (stats[stage]) {
        stats[stage].count++;
        if (c.targetType === 'sale') {
          stats[stage].totalSaleBudget += c.maxBudget;
        } else {
          stats[stage].totalRentBudget += c.maxBudget;
        }
      }
    });

    return stats;
  }, [clients]);

  const confirmSingleDelete = () => {
    if (deleteTargetId) {
      onDeleteClient(deleteTargetId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const confirmBatchDelete = () => {
    onBatchDeleteClients(selectedIds);
    setSelectedIds([]);
    setIsBatchDeleting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header & View Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>客户业务跟进看板与档案</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              (共建档 {clients.length} 位客户，其中紧迫决策 {clients.filter((c) => c.urgency === 'urgent').length} 人)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            支持单选/全选批量流转跟进阶段、批量删除客户，以待带看、带看中、谈判中、已成交四大阶段驱动业务闭环。
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle: Kanban vs List */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>看板视图</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>列表卡片</span>
            </button>
          </div>

          <button
            onClick={onOpenAddClient}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ 录入新客户画像</span>
          </button>
        </div>
      </div>

      {/* 4-Stage Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KANBAN_STAGES.map((stage) => {
          const stat = stageStats[stage.id] || { count: 0, totalSaleBudget: 0, totalRentBudget: 0 };
          const percent = clients.length > 0 ? Math.round((stat.count / clients.length) * 100) : 0;

          return (
            <div
              key={stage.id}
              className={`bg-white border ${stage.borderColor} rounded-xl p-4 shadow-sm relative overflow-hidden`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 block mb-0.5">
                    {stage.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {stat.count}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">人</span>
                    <span className="text-[11px] font-mono text-slate-400 ml-1">
                      ({percent}%)
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${stage.badgeBg} ${stage.textColor}`}
                >
                  {stage.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3 mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    stage.id === 'matched'
                      ? 'bg-indigo-500'
                      : stage.id === 'viewing'
                      ? 'bg-blue-500'
                      : stage.id === 'negotiating'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-500 truncate">
                {stat.totalSaleBudget > 0 && `买家预算: ${stat.totalSaleBudget}万`}
                {stat.totalSaleBudget > 0 && stat.totalRentBudget > 0 && ' · '}
                {stat.totalRentBudget > 0 && `租金: ${stat.totalRentBudget}元/月`}
                {stat.totalSaleBudget === 0 && stat.totalRentBudget === 0 && '暂无预算数据'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar & Selection Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索客户姓名、手机、意向片区、核心关切..."
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              清空
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Target Type Filter */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md">
            <button
              onClick={() => setTargetTypeFilter('all')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                targetTypeFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600'
              }`}
            >
              全部客户
            </button>
            <button
              onClick={() => setTargetTypeFilter('sale')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                targetTypeFilter === 'sale'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600'
              }`}
            >
              买家
            </button>
            <button
              onClick={() => setTargetTypeFilter('rent')}
              className={`px-2.5 py-1 font-medium rounded transition-colors ${
                targetTypeFilter === 'rent'
                  ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                  : 'text-slate-600'
              }`}
            >
              租客
            </button>
          </div>

          {/* Urgency Filter */}
          <div className="flex items-center p-0.5 bg-slate-100 rounded-md">
            <button
              onClick={() => setUrgencyFilter('all')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                urgencyFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setUrgencyFilter('urgent')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                urgencyFilter === 'urgent'
                  ? 'bg-white text-rose-700 shadow-sm font-semibold'
                  : 'text-slate-600'
              }`}
            >
              🔥 紧迫
            </button>
            <button
              onClick={() => setUrgencyFilter('medium')}
              className={`px-2 py-1 font-medium rounded transition-colors ${
                urgencyFilter === 'medium'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600'
              }`}
            >
              ⚡ 较急
            </button>
          </div>

          {/* Select All Toggle Button */}
          <button
            onClick={toggleSelectAll}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors ${
              isAllSelected
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isAllSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{isAllSelected ? '取消全选' : `全选当前客户 (${filteredClients.length})`}</span>
          </button>

          <span className="text-slate-400 font-mono ml-1">
            共 {filteredClients.length} 位
            {selectedIds.length > 0 && (
              <span className="ml-1 text-indigo-600 font-bold">
                (已选 {selectedIds.length})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Batch Operations Bar (Visible when 1+ selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-900 text-white px-5 py-3 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-indigo-700 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold">
              已选中 <span className="font-mono text-indigo-300 font-bold text-sm">{selectedIds.length}</span> 位客户
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-xs text-indigo-200 hover:text-white underline underline-offset-2"
            >
              {isAllSelected ? '取消全选' : '全选当前筛选列表'}
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              清空勾选
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Batch Stage Movement Dropdown */}
            <div className="flex items-center gap-1.5 bg-indigo-800/90 px-3 py-1.5 rounded-lg border border-indigo-700">
              <span className="text-indigo-200 font-medium">批量流转阶段为:</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onBatchUpdateStage(selectedIds, e.target.value as ClientStage);
                    setSelectedIds([]);
                  }
                }}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="text-slate-900">选择目标阶段...</option>
                <option value="matched" className="text-slate-900">待带看 (已初配房源)</option>
                <option value="viewing" className="text-slate-900">带看中 (实地看房推进)</option>
                <option value="negotiating" className="text-slate-900">谈判中 (意向谈判磨底价)</option>
                <option value="closed" className="text-slate-900">已成交 (签约结单)</option>
              </select>
            </div>

            {/* Batch Delete Button */}
            <button
              onClick={() => setIsBatchDeleting(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>批量删除选中的 ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* View Mode 1: Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="space-y-3">
          {/* Mobile Stage Selector Tabs (Hidden on tablet/desktop) */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setMobileActiveStage('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                mobileActiveStage === 'all'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              全部阶段 ({filteredClients.length})
            </button>
            {KANBAN_STAGES.map((s) => {
              const count = filteredClients.filter(
                (c) => getEffectiveStage(c.stage) === s.id
              ).length;
              const isActive = mobileActiveStage === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setMobileActiveStage(s.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{s.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {KANBAN_STAGES.filter(
              (stage) => mobileActiveStage === 'all' || stage.id === mobileActiveStage
            ).map((stage) => {
            const columnClients = filteredClients.filter(
              (c) => getEffectiveStage(c.stage) === stage.id
            );

            return (
              <div
                key={stage.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col min-h-[550px]"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b border-slate-200 bg-white rounded-t-xl`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          stage.id === 'matched'
                            ? 'bg-indigo-500'
                            : stage.id === 'viewing'
                            ? 'bg-blue-500'
                            : stage.id === 'negotiating'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <h3 className="text-sm font-bold text-slate-900">{stage.label}</h3>
                    </div>

                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${stage.badgeBg} ${stage.textColor}`}
                    >
                      {columnClients.length}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{stage.desc}</p>
                </div>

                {/* Column Body / Client Cards */}
                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[750px]">
                  {columnClients.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-lg p-8 text-center bg-white/60">
                      <p className="text-xs text-slate-400">暂无处于【{stage.label}】的客户</p>
                    </div>
                  ) : (
                    columnClients.map((client) => {
                      const budgetUnit = client.targetType === 'sale' ? '万' : '元/月';
                      const isChecked = selectedIds.includes(client.id);

                      return (
                        <div
                          key={client.id}
                          className={`bg-white border rounded-xl p-3.5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 ${
                            isChecked ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' : 'border-slate-200'
                          }`}
                        >
                          <div>
                            {/* Card Top: Checkbox, Client Name & Type */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleSelectOne(client.id)}
                                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-0.5"
                                />
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                                      {client.name}
                                    </span>
                                    {client.urgency === 'urgent' && (
                                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1 py-0.2 rounded shrink-0">
                                        🔥急
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                    {client.phone}
                                  </div>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                                  client.targetType === 'sale'
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                {client.targetType === 'sale' ? '买房' : '租房'}
                              </span>
                            </div>

                            {/* Budget & Layout Specs */}
                            <div className="bg-slate-50 p-2 rounded-lg mt-2 text-[11px] space-y-0.5 border border-slate-100">
                              <div className="flex items-baseline justify-between font-mono">
                                <span className="text-slate-400">预算:</span>
                                <span className="font-bold text-slate-900">
                                  {client.minBudget}~{client.maxBudget} {budgetUnit}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="text-slate-400">户型:</span>
                                <span>{client.preferredRooms.join('/')}室</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-600 truncate">
                                <span className="text-slate-400">意向:</span>
                                <span className="truncate max-w-[120px]">
                                  {client.preferredDistricts.join('/') || '不限'}
                                </span>
                              </div>
                            </div>

                            {/* Key tags */}
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 mt-2">
                              {client.keyRequirements.slice(0, 3).map((r, idx) => (
                                <span key={idx} className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                  {r}
                                </span>
                              ))}
                            </div>

                            {/* Family Notes preview */}
                            {client.familyNotes && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-1.5 bg-slate-50/70 p-1.5 rounded">
                                "{client.familyNotes}"
                              </p>
                            )}
                          </div>

                          {/* Card Footer: Fast stage movement & matching */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            {/* Advance stage button */}
                            {stage.nextStage && stage.nextLabel && (
                              <button
                                onClick={() => onUpdateStage(client.id, stage.nextStage!)}
                                className="w-full flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                              >
                                <span>{stage.nextLabel}</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}

                            {/* Actions bar */}
                            <div className="flex items-center justify-between text-[11px]">
                              <button
                                onClick={() => onStartMatching(client)}
                                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>智能匹配</span>
                              </button>

                              <div className="flex items-center gap-1 text-slate-400">
                                <button
                                  onClick={() => onEditClient(client)}
                                  className="p-1 hover:text-indigo-600 rounded"
                                  title="编辑"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setDeleteTargetId(client.id)}
                                  className="p-1 hover:text-rose-600 rounded"
                                  title="删除"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      ) : (
        /* View Mode 2: Detailed Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.map((client) => {
            const budgetUnit = client.targetType === 'sale' ? '万' : '元/月';
            const isChecked = selectedIds.includes(client.id);

            return (
              <div
                key={client.id}
                className={`bg-white border rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between ${
                  isChecked ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Client Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(client.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">{client.name}</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {client.clientType === 'first_home'
                              ? '刚需首套'
                              : client.clientType === 'upgrade'
                              ? '改善置换'
                              : client.clientType === 'tenant'
                              ? '租客'
                              : '投资客'}
                          </span>
                          {client.urgency === 'urgent' && (
                            <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              🔥 紧迫
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 font-mono">
                          <span>📞 {client.phone}</span>
                          {client.wechat && <span>· 💬 {client.wechat}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Stage Selector */}
                    <div>
                      <select
                        value={getEffectiveStage(client.stage)}
                        onChange={(e) => onUpdateStage(client.id, e.target.value as ClientStage)}
                        className="text-xs font-semibold px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="matched">待带看</option>
                        <option value="viewing">带看中</option>
                        <option value="negotiating">谈判中</option>
                        <option value="closed">已成交</option>
                      </select>
                    </div>
                  </div>

                  {/* Budget & Layout Specifications */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-slate-400 block">
                        预算区间 ({client.targetType === 'sale' ? '买房' : '租房'})
                      </span>
                      <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                        {client.minBudget} ~ {client.maxBudget} {budgetUnit}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">意向居室 / 面积</span>
                      <span className="font-medium text-slate-800">
                        {client.preferredRooms.join('/')} 室
                        {client.minArea ? ` · ≥${client.minArea}㎡` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Preferred Districts & Key Tags */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-slate-400 shrink-0">意向片区:</span>
                      <span className="font-medium text-slate-800">
                        {client.preferredDistricts.join('、') || '不限区域'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-slate-600">
                      <span className="text-slate-400 shrink-0">核心关切:</span>
                      {client.keyRequirements.map((r, idx) => (
                        <span key={idx} className="text-indigo-700 font-medium">
                          {r}
                          {idx < client.keyRequirements.length - 1 && (
                            <span className="text-slate-300 ml-1">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Family Notes */}
                  {client.familyNotes && (
                    <div className="p-2.5 bg-slate-50 rounded text-xs text-slate-600 italic border border-slate-100 line-clamp-2">
                      "{client.familyNotes}"
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                  <button
                    onClick={() => onStartMatching(client)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>智能极速匹配房源</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                      title="编辑画像"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(client.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                      title="删除客户档案"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center border border-slate-200">
            <Trash2 className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">确定要删除该客户档案吗？</h3>
            <p className="text-xs text-slate-500 mb-6">
              删除后该客户的历史需求和匹配记录将被移除，此操作不可撤销。
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={confirmSingleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {isBatchDeleting && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              批量删除选中的 <span className="text-rose-600 font-mono">{selectedIds.length}</span> 位客户？
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              您已选中了 {selectedIds.length} 位客户档案。确认删除后，这些客户的画像与所有匹配跟进记录将被永久清除，无法恢复。
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsBatchDeleting(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={confirmBatchDelete}
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm"
              >
                确认批量删除 ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
