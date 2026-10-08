import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  Plus,
  Filter,
  Users,
  Edit2,
  Trash2,
  Copy,
  Check,
  CheckCircle,
  Eye,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { Property, TransactionType, PropertyStatus } from '../types';
import { DISTRICT_OPTIONS } from '../utils/mockData';

interface PropertyListProps {
  properties: Property[];
  onOpenAddProperty: () => void;
  onOpenBeikeSync?: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onBatchDeleteProperties: (ids: string[]) => void;
  onUpdateStatus: (id: string, status: PropertyStatus) => void;
  onBatchUpdateStatus: (ids: string[], status: PropertyStatus) => void;
  onReverseMatch: (property: Property) => void;
  onSelectPropertyToMatch: (property: Property) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onOpenAddProperty,
  onOpenBeikeSync,
  onEditProperty,
  onDeleteProperty,
  onBatchDeleteProperties,
  onUpdateStatus,
  onBatchUpdateStatus,
  onReverseMatch,
  onSelectPropertyToMatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [roomFilter, setRoomFilter] = useState<number | 'all'>('all');
  const [onlyBeikeFilter, setOnlyBeikeFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table'
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion confirm state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (onlyBeikeFilter && !p.isBeikeSynced && !p.beikeHouseCode) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (districtFilter !== 'all' && !p.district.includes(districtFilter)) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (roomFilter !== 'all' && p.rooms !== roomFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inComm = p.community.toLowerCase().includes(q);
        const inDist = p.district.toLowerCase().includes(q);
        const inOwner = p.ownerName.toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inComm && !inDist && !inOwner && !inTags) return false;
      }
      return true;
    });
  }, [properties, onlyBeikeFilter, typeFilter, districtFilter, statusFilter, roomFilter, searchQuery]);

  // Selection helpers
  const isAllSelected =
    filteredProperties.length > 0 &&
    filteredProperties.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all currently filtered
      const filteredIdSet = new Set(filteredProperties.map((p) => p.id));
      setSelectedIds(selectedIds.filter((id) => !filteredIdSet.has(id)));
    } else {
      // Select all currently filtered
      const newSelected = new Set([...selectedIds, ...filteredProperties.map((p) => p.id)]);
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

  const handleCopyListing = async (p: Property) => {
    const priceUnit = p.type === 'sale' ? '万' : '元/月';
    const text = `【${p.community}】${p.title}
💰 报价：${p.price}${priceUnit}（${p.rooms}室${p.livingRooms}厅${p.bathrooms}卫，建面${p.area}㎡）
📍 位置：${p.district} ${p.address || ''}
🚇 交通：${p.subwayDistance || '配套成熟'}
🌟 核心亮点：${p.highlights}
🔑 看房联系：专属房管经纪人 随时带看`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const confirmSingleDelete = () => {
    if (deleteTargetId) {
      onDeleteProperty(deleteTargetId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  const confirmBatchDelete = () => {
    onBatchDeleteProperties(selectedIds);
    setSelectedIds([]);
    setIsBatchDeleting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Banner & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <span>房源资产管理库</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              (共录入 {properties.length} 套房源，在售/在租 {properties.filter((p) => p.status === 'active').length} 套)
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            支持单选/全选批量管理、一键批量修改租售状态、批量删除以及“以房找客”反向挖掘。
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="表格紧凑视图"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="卡片网格视图"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {onOpenBeikeSync && (
            <button
              onClick={onOpenBeikeSync}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-blue-600" />
              <span>贝壳A+同步</span>
            </button>
          )}

          <button
            onClick={onOpenAddProperty}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ 录入新房源</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索小区、房源标题、商圈、特色标签、业主姓名..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {/* Quick Segmented Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Type Segment */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  typeFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部类型
              </button>
              <button
                onClick={() => setTypeFilter('sale')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  typeFilter === 'sale' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                二手买卖
              </button>
              <button
                onClick={() => setTypeFilter('rent')}
                className={`px-3 py-1 font-medium rounded-md transition-colors ${
                  typeFilter === 'rent' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                房屋租赁
              </button>
            </div>

            {/* Status Segment */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                全部状态
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                在售/在租
              </button>
              <button
                onClick={() => setStatusFilter('reserved')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === 'reserved' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                已预定
              </button>
              <button
                onClick={() => setStatusFilter('deal')}
                className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                  statusFilter === 'deal' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600'
                }`}
              >
                已成交
              </button>
            </div>
          </div>
        </div>

        {/* Second row filters: District and Rooms + Select All button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">区域:</span>
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="py-1 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="all">全部区域</option>
                {DISTRICT_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">居室:</span>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="py-1 px-2.5 rounded-md border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
              >
                <option value="all">不限户型</option>
                <option value="1">1 室</option>
                <option value="2">2 室</option>
                <option value="3">3 室</option>
                <option value="4">4 室及以上</option>
              </select>
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
              <span>{isAllSelected ? '取消全选' : `全选当前房源 (${filteredProperties.length})`}</span>
            </button>

            {/* Only Beike Filter Button */}
            <button
              onClick={() => setOnlyBeikeFilter(!onlyBeikeFilter)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                onlyBeikeFilter
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Link2 className="w-3 h-3 text-blue-500" />
              <span>仅看贝壳同步 ({properties.filter((p) => p.isBeikeSynced || p.beikeHouseCode).length})</span>
            </button>
          </div>

          <span className="text-slate-400 font-mono">
            已筛选出 <span className="font-semibold text-slate-800 font-mono">{filteredProperties.length}</span> 套房源
            {selectedIds.length > 0 && (
              <span className="ml-2 text-indigo-600 font-bold">
                (已勾选 {selectedIds.length} 套)
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
              已选中 <span className="font-mono text-indigo-300 font-bold text-sm">{selectedIds.length}</span> 套房源
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
            {/* Batch Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-indigo-800/90 px-3 py-1.5 rounded-lg border border-indigo-700">
              <span className="text-indigo-200 font-medium">批量修改状态为:</span>
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    onBatchUpdateStatus(selectedIds, e.target.value as PropertyStatus);
                    setSelectedIds([]);
                  }
                }}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="" disabled className="text-slate-900">选择状态...</option>
                <option value="active" className="text-slate-900">在售 / 在租 (有效展示)</option>
                <option value="reserved" className="text-slate-900">已收意向定金 (已预定)</option>
                <option value="deal" className="text-slate-900">已签约成交 (结单)</option>
                <option value="offline" className="text-slate-900">暂缓 / 已下架</option>
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

      {/* Main Content View */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">未检索到匹配房源</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            您可以尝试更换搜索关键词或重置筛选条件，或者直接录入一套新房源。
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('all');
              setDistrictFilter('all');
              setStatusFilter('all');
              setRoomFilter('all');
            }}
            className="mt-4 px-4 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-medium"
          >
            重置所有筛选
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* High Density Table View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
                  {/* Select All Checkbox Column */}
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="全选 / 取消全选"
                    />
                  </th>
                  <th className="py-3 px-4 font-semibold">房源/小区</th>
                  <th className="py-3 px-3 font-semibold">类型</th>
                  <th className="py-3 px-3 font-semibold">户型/面积</th>
                  <th className="py-3 px-3 font-semibold">朝向/楼层</th>
                  <th className="py-3 px-3 font-semibold text-right">挂牌价格</th>
                  <th className="py-3 px-3 font-semibold text-right">折合单价</th>
                  <th className="py-3 px-3 font-semibold">状态</th>
                  <th className="py-3 px-3 font-semibold">业主/底价</th>
                  <th className="py-3 px-4 font-semibold text-right">管理操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((p) => {
                  const priceUnit = p.type === 'sale' ? '万' : '元/月';
                  const isChecked = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Title & Community */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          {p.images && p.images.length > 0 ? (
                            <img
                              src={p.images[0]}
                              alt={p.community}
                              className="w-10 h-8 rounded object-cover border border-slate-200 shrink-0"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900 line-clamp-1">{p.title}</span>
                              {(p.isBeikeSynced || p.beikeHouseCode) && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-1 rounded shrink-0">
                                  贝壳ACN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-medium text-indigo-700">{p.community}</span>
                              <span className="text-slate-300">·</span>
                              <span>{p.district}</span>
                              {p.beikeHouseCode && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="font-mono text-[10px] text-blue-600 font-medium">#{p.beikeHouseCode}</span>
                                </>
                              )}
                              {p.beikeUrl && (
                                <a
                                  href={p.beikeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="在贝壳官网核对"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <ExternalLink className="w-2.5 h-2.5 inline" />
                                </a>
                              )}
                              {p.images && p.images.length > 0 && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded font-medium">
                                  {p.images.length}图
                                </span>
                              )}
                              {p.subwayDistance && (
                                <>
                                  <span className="text-slate-300">·</span>
                                  <span className="truncate max-w-[120px]">{p.subwayDistance}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                            p.type === 'sale'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {p.type === 'sale' ? '出售' : '出租'}
                        </span>
                      </td>

                      {/* Layout & Area */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {p.rooms}室{p.livingRooms}厅{p.bathrooms}卫
                        </div>
                        <div className="text-slate-500 font-mono tabular-nums">{p.area} ㎡</div>
                      </td>

                      {/* Floor & Orientation */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-slate-700">{p.orientation}</div>
                        <div className="text-slate-400 text-[11px]">
                          {p.floor === 'low' ? '低楼层' : p.floor === 'middle' ? '中楼层' : '高楼层'}
                          /共{p.totalFloors}层
                          {p.hasElevator ? ' (梯)' : ''}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <span className="text-sm font-bold text-rose-600 font-mono tabular-nums">
                          {p.price}
                        </span>
                        <span className="text-slate-500 ml-0.5">{priceUnit}</span>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono tabular-nums text-slate-600">
                        {p.type === 'sale' && p.unitPrice ? (
                          `¥${p.unitPrice.toLocaleString()}`
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={p.status}
                          onChange={(e) => onUpdateStatus(p.id, e.target.value as PropertyStatus)}
                          className={`text-[11px] font-medium px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                            p.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.status === 'reserved'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : p.status === 'deal'
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="active">在售/在租</option>
                          <option value="reserved">已预定</option>
                          <option value="deal">已成交</option>
                          <option value="offline">已下架</option>
                        </select>
                      </td>

                      {/* Owner & MinPrice */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="text-slate-800">{p.ownerName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{p.ownerPhone}</div>
                        {p.minPrice && (
                          <div className="text-[10px] text-indigo-600 font-mono">
                            底价: {p.minPrice}{priceUnit}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reverse match button */}
                          <button
                            onClick={() => onReverseMatch(p)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors flex items-center gap-1"
                            title="快速查看哪些客户契合这套房"
                          >
                            <Users className="w-3 h-3" />
                            <span>以房找客</span>
                          </button>

                          {/* Copy WeChat Card */}
                          <button
                            onClick={() => handleCopyListing(p)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                            title="复制微信房源推文"
                          >
                            {copiedId === p.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditProperty(p)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="编辑房源"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTargetId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="删除房源"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((p) => {
            const priceUnit = p.type === 'sale' ? '万' : '元/月';
            const isChecked = selectedIds.includes(p.id);

            return (
              <div
                key={p.id}
                className={`bg-white border rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between ${
                  isChecked ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(p.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                          p.type === 'sale' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.type === 'sale' ? '二手买卖' : '房屋租赁'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold font-mono text-rose-600 tabular-nums">
                        {p.price}
                      </span>
                      <span className="text-xs text-slate-500">{priceUnit}</span>
                    </div>
                  </div>

                  {/* Property Cover Image if available */}
                  {p.images && p.images.length > 0 && (
                    <div className="relative aspect-16/9 rounded-lg overflow-hidden mb-3 border border-slate-200 bg-slate-100">
                      <img
                        src={p.images[0]}
                        alt={p.community}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 right-1.5 bg-slate-950/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-xs font-mono">
                        {p.images.length} 张照片
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                    {(p.isBeikeSynced || p.beikeHouseCode) && (
                      <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-200 font-bold px-1.5 py-0.2 rounded shrink-0">
                        贝壳ACN
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 mb-3 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-700">{p.community}</span>
                    <span className="text-slate-300">·</span>
                    <span>{p.district}</span>
                    {p.beikeHouseCode && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-[10px] text-blue-600 font-medium">#{p.beikeHouseCode}</span>
                      </>
                    )}
                    {p.beikeUrl && (
                      <a
                        href={p.beikeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="在贝壳官网核对"
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg mb-3">
                    <div>
                      <span className="text-slate-400 block">户型与面积</span>
                      <span className="font-medium text-slate-800">
                        {p.rooms}室{p.livingRooms}厅 · {p.area}㎡
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">朝向与电梯</span>
                      <span className="font-medium text-slate-800">
                        {p.orientation} · {p.hasElevator ? '有电梯' : '步梯'}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {p.highlights}
                  </div>

                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 mb-4">
                    {p.tags.slice(0, 4).map((t, idx) => (
                      <span key={idx}>
                        {t}
                        {idx < Math.min(p.tags.length, 4) - 1 && <span className="text-slate-300 ml-1">·</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onReverseMatch(p)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>以房找客</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyListing(p)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                      title="复制微信推房文案"
                    >
                      {copiedId === p.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onEditProperty(p)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                      title="编辑"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                      title="删除"
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
            <h3 className="text-base font-bold text-slate-900 mb-1">确定要删除该房源吗？</h3>
            <p className="text-xs text-slate-500 mb-6">
              删除后该房源将无法参与智能匹配，此操作不可撤销。
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
              批量删除选中的 <span className="text-rose-600 font-mono">{selectedIds.length}</span> 套房源？
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              您已选中了 {selectedIds.length} 套房源。确认删除后，这些房源将从系统及智能匹配库中全部永久移除，无法恢复。
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
