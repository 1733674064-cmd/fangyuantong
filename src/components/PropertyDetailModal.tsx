import React from 'react';
import { X, Building2, Copy, Check, Users, Edit2, Phone, MapPin, Tag } from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  onEdit: (property: Property) => void;
  onReverseMatch: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  isOpen,
  onClose,
  property,
  onEdit,
  onReverseMatch,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !property) return null;

  const priceUnit = property.type === 'sale' ? '万' : '元/月';

  const handleCopy = async () => {
    const text = `【${property.community}】${property.title}
💰 报价：${property.price}${priceUnit}（${property.rooms}室${property.livingRooms}厅${property.bathrooms}卫，建面${property.area}㎡）
📍 位置：${property.district} ${property.address || ''}
🚇 交通：${property.subwayDistance || '交通便利'}
🌟 核心卖点：${property.highlights}
🔑 专属经纪人随时带看`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900 line-clamp-1">
              {property.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
          {/* Photos Gallery (if available) */}
          {property.images && property.images.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>房源实勘照片 / 户型图</span>
                <span className="text-slate-400 font-mono text-[11px]">({property.images.length}张)</span>
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {property.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group"
                    onClick={() => window.open(img, '_blank')}
                  >
                    <img src={img} alt={`实勘图 ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium">
                      点击放大
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price & Status Banner */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs text-slate-400 block">挂牌价格</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-rose-600 tabular-nums">
                  {property.price}
                </span>
                <span className="text-xs font-medium text-slate-500">{priceUnit}</span>
                {property.type === 'sale' && property.unitPrice && (
                  <span className="text-xs text-slate-400 font-mono ml-2">
                    (单价: ¥{property.unitPrice.toLocaleString()}/㎡)
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">房源状态</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded inline-block mt-0.5 ${
                  property.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : property.status === 'reserved'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {property.status === 'active'
                  ? '在售 / 在租'
                  : property.status === 'reserved'
                  ? '已收意向定金'
                  : property.status === 'deal'
                  ? '已成交'
                  : '已下架'}
              </span>
            </div>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1">户型格局</span>
              <span className="font-semibold text-slate-900">
                {property.rooms}室{property.livingRooms}厅{property.bathrooms}卫
              </span>
            </div>

            <div className="p-2.5 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1">建筑面积</span>
              <span className="font-semibold text-slate-900 font-mono tabular-nums">
                {property.area} ㎡
              </span>
            </div>

            <div className="p-2.5 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1">朝向与装修</span>
              <span className="font-semibold text-slate-900">
                {property.orientation} · {property.decoration === 'refined' ? '精装' : property.decoration === 'luxury' ? '豪装' : '简装'}
              </span>
            </div>

            <div className="p-2.5 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block mb-1">楼层与电梯</span>
              <span className="font-semibold text-slate-900">
                {property.floor === 'low' ? '低楼层' : property.floor === 'middle' ? '中楼层' : '高楼层'}
                /共{property.totalFloors}层 ({property.hasElevator ? '有梯' : '步梯'})
              </span>
            </div>
          </div>

          {/* Location & Subway */}
          <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-900">{property.community}</span>
              <span className="text-slate-300">·</span>
              <span>{property.district}</span>
              {property.address && <span className="text-slate-500">（{property.address}）</span>}
            </div>
            {property.subwayDistance && (
              <div className="pl-5 text-slate-500">🚇 {property.subwayDistance}</div>
            )}
          </div>

          {/* Selling Points */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">核心卖点</span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {property.highlights}
            </p>
          </div>

          {/* Tags */}
          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1.5">特色标签</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {property.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Internal Owner Info (Confidential for Agent) */}
          <div className="p-3.5 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs space-y-1">
            <div className="font-semibold text-indigo-900 flex items-center justify-between">
              <span>中介内部私密信息 (业主联系与底价)</span>
              {property.minPrice && (
                <span className="font-mono text-rose-600 font-bold">
                  业主底价: {property.minPrice} {priceUnit}
                </span>
              )}
            </div>
            <div className="text-slate-600 flex items-center gap-3">
              <span>业主: {property.ownerName}</span>
              <span className="font-mono">电话: {property.ownerPhone}</span>
            </div>
            {property.notes && (
              <div className="text-slate-500 italic mt-1">带看备注: "{property.notes}"</div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>已复制微信卡片</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>复制房源推文</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onReverseMatch(property);
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>以房找客</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(property);
              }}
              className="flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>编辑房源</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
