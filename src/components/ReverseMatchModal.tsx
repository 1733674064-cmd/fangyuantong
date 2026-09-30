import React from 'react';
import { X, Users, Sparkles, MessageSquare, Phone, ArrowUpRight } from 'lucide-react';
import { Property, Client, MatchResult } from '../types';
import { matchAllClientsForProperty } from '../utils/matchingEngine';

interface ReverseMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
  clients: Client[];
  onOpenPitch: (match: MatchResult) => void;
}

export const ReverseMatchModal: React.FC<ReverseMatchModalProps> = ({
  isOpen,
  onClose,
  property,
  clients,
  onOpenPitch,
}) => {
  if (!isOpen || !property) return null;

  const matchedResults = matchAllClientsForProperty(property, clients);
  const priceUnit = property.type === 'sale' ? '万' : '元/月';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                以房找客 · 潜在买家/租客智能挖掘
              </h2>
              <p className="text-xs text-slate-500">
                当前房源：{property.community} · {property.rooms}室{property.livingRooms}厅 · 挂牌 {property.price}{priceUnit}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Match List */}
        <div className="overflow-y-auto p-6 space-y-3.5 flex-1">
          {matchedResults.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">暂无意向匹配的客户</p>
              <p className="text-xs text-slate-500 mt-1">
                当前库中暂无寻找【{property.type === 'sale' ? '买房' : '租房'}】且预算偏好匹配的客户
              </p>
            </div>
          ) : (
            matchedResults.map((result) => {
              const { client, score, matchLevel, pros, cons } = result;
              return (
                <div
                  key={client.id}
                  className="p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{client.name}</span>
                        <span className="text-xs text-slate-500">
                          {client.clientType === 'first_home'
                            ? '刚需首套'
                            : client.clientType === 'upgrade'
                            ? '改善置换'
                            : client.clientType === 'tenant'
                            ? '租客'
                            : '投资客'}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-mono tabular-nums text-slate-600">
                          预算 {client.minBudget}~{client.maxBudget}
                          {client.targetType === 'sale' ? '万' : '元/月'}
                        </span>
                        {client.urgency === 'urgent' && (
                          <span className="text-xs text-rose-600 font-medium">🔥 紧迫</span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mb-2">
                        <span>意向区域: {client.preferredDistricts.join('/') || '不限'}</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span>意向居室: {client.preferredRooms.join('/')}室</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span>联系: {client.phone}</span>
                      </div>

                      {/* Pros & Cons */}
                      <div className="space-y-1 mb-2">
                        {pros.slice(0, 2).map((pro, idx) => (
                          <div key={idx} className="text-xs text-emerald-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>{pro}</span>
                          </div>
                        ))}
                        {cons.slice(0, 1).map((con, idx) => (
                          <div key={idx} className="text-xs text-amber-700 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>

                      {client.familyNotes && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                          "{client.familyNotes}"
                        </p>
                      )}
                    </div>

                    {/* Score and Action */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span
                          className={`text-2xl font-bold font-mono tabular-nums ${
                            matchLevel === 'perfect'
                              ? 'text-indigo-600'
                              : matchLevel === 'high'
                              ? 'text-emerald-600'
                              : 'text-slate-600'
                          }`}
                        >
                          {score}
                        </span>
                        <span className="text-xs text-slate-400 ml-0.5">分</span>
                        <div className="text-[11px] font-medium text-slate-500">
                          {matchLevel === 'perfect'
                            ? '极度契合'
                            : matchLevel === 'high'
                            ? '高度匹配'
                            : '部分吻合'}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenPitch(result);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>一键推房话术</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl text-xs text-slate-500">
          <span>共找到 {matchedResults.length} 位同属性买家/租客</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
