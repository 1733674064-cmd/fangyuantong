import React from 'react';
import { X, ArrowRight, Check, Minus } from 'lucide-react';
import { Property, Client } from '../types';
import { calculateMatchScore } from '../utils/matchingEngine';

interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: Property[];
  activeClient?: Client | null;
  onRemoveProperty: (id: string) => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  isOpen,
  onClose,
  properties,
  activeClient,
  onRemoveProperty,
}) => {
  if (!isOpen || properties.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              多套房源深度横向比对
            </h2>
            <p className="text-xs text-slate-500">
              当前比对 {properties.length} 套房源
              {activeClient && ` · 针对客户【${activeClient.name}】需求画像综合分析`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto p-6 flex-1">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3 px-3 w-32 font-semibold text-slate-600 bg-slate-50 rounded-l-md">
                  对比项目
                </th>
                {properties.map((prop) => (
                  <th key={prop.id} className="py-3 px-4 min-w-[240px] font-semibold text-slate-900">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 line-clamp-1">
                        {prop.community}
                      </span>
                      <button
                        onClick={() => onRemoveProperty(prop.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                        title="从比对中移除"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-slate-500 font-normal">{prop.district}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Match Score Row (if client active) */}
              {activeClient && (
                <tr className="bg-indigo-50/50">
                  <td className="py-3 px-3 font-semibold text-indigo-900">对客户匹配得分</td>
                  {properties.map((prop) => {
                    const res = calculateMatchScore(prop, activeClient);
                    return (
                      <td key={prop.id} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-indigo-700 font-mono tabular-nums">
                            {res.score}
                          </span>
                          <span className="text-xs text-indigo-600 font-medium">
                            / 100分 ({res.matchLevel === 'perfect' ? '极度契合' : res.matchLevel === 'high' ? '高度匹配' : '一般'})
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )}

              {/* Total Price */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">挂牌总价/租金</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">
                    <span className="text-base font-bold text-rose-600 font-mono tabular-nums">
                      {prop.price}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      {prop.type === 'sale' ? '万元' : '元/月'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Unit Price */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">折合单价</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 font-mono tabular-nums text-slate-700">
                    {prop.type === 'sale' && prop.unitPrice ? (
                      `¥${prop.unitPrice.toLocaleString()} /㎡`
                    ) : (
                      '—'
                    )}
                  </td>
                ))}
              </tr>

              {/* Layout & Area */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">户型格局</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 font-medium text-slate-800">
                    {prop.rooms}室{prop.livingRooms}厅{prop.bathrooms}卫
                  </td>
                ))}
              </tr>

              {/* Area */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">建筑面积</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 font-mono tabular-nums text-slate-800">
                    {prop.area} ㎡
                  </td>
                ))}
              </tr>

              {/* Floor & Elevator */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">楼层与电梯</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-800">
                        {prop.floor === 'low' ? '低楼层' : prop.floor === 'middle' ? '中楼层' : '高楼层'}
                        /共{prop.totalFloors}层
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className={prop.hasElevator ? 'text-emerald-700 font-medium' : 'text-amber-700'}>
                        {prop.hasElevator ? '配备电梯' : '步梯'}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Orientation & Decoration */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">朝向 / 装修</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-slate-700">
                    {prop.orientation} · {prop.decoration === 'refined' ? '精装' : prop.decoration === 'luxury' ? '豪装' : '简装'}
                  </td>
                ))}
              </tr>

              {/* Subway & Transit */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">地铁距离</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-slate-700">
                    {prop.subwayDistance || '步行约500米以内'}
                  </td>
                ))}
              </tr>

              {/* Highlights */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">核心卖点</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4 text-slate-600 leading-relaxed">
                    {prop.highlights}
                  </td>
                ))}
              </tr>

              {/* Tags */}
              <tr>
                <td className="py-3 px-3 font-medium text-slate-600 bg-slate-50/50">特色标签</td>
                {properties.map((prop) => (
                  <td key={prop.id} className="py-3 px-4">
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-1">
                      {prop.tags.map((t, idx) => (
                        <span key={idx}>
                          {t}
                          {idx < prop.tags.length - 1 && <span className="text-slate-300 ml-1">·</span>}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
          >
            完成比对并关闭
          </button>
        </div>
      </div>
    </div>
  );
};
