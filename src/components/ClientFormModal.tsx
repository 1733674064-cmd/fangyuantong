import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, Plus, HeartHandshake } from 'lucide-react';
import { Client, TransactionType, ClientType, ClientUrgency, ClientStage } from '../types';
import { COMMON_TAGS, DISTRICT_OPTIONS } from '../utils/mockData';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  initialClient?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    phone: '',
    wechat: '',
    clientType: 'first_home',
    targetType: 'sale',
    minBudget: 200,
    maxBudget: 280,
    preferredDistricts: ['香洲区', '高新区'],
    preferredRooms: [3],
    minArea: 75,
    keyRequirements: ['带电梯', '纯南向'],
    urgency: 'urgent',
    familyNotes: '',
    stage: 'lead',
    notes: '',
  });

  const [customTag, setCustomTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialClient) {
      setFormData(initialClient);
    } else {
      setFormData({
        name: '',
        phone: '',
        wechat: '',
        clientType: 'first_home',
        targetType: 'sale',
        minBudget: 200,
        maxBudget: 280,
        preferredDistricts: ['香洲区', '高新区'],
        preferredRooms: [2, 3],
        minArea: 75,
        keyRequirements: ['带电梯', '纯南向'],
        urgency: 'urgent',
        familyNotes: '',
        stage: 'lead',
        notes: '',
      });
    }
    setErrors({});
  }, [initialClient, isOpen]);

  if (!isOpen) return null;

  const handleDistrictToggle = (district: string) => {
    const list = formData.preferredDistricts || [];
    if (list.includes(district)) {
      setFormData({ ...formData, preferredDistricts: list.filter((d) => d !== district) });
    } else {
      setFormData({ ...formData, preferredDistricts: [...list, district] });
    }
  };

  const handleRoomToggle = (room: number) => {
    const list = formData.preferredRooms || [];
    if (list.includes(room)) {
      setFormData({ ...formData, preferredRooms: list.filter((r) => r !== room) });
    } else {
      setFormData({ ...formData, preferredRooms: [...list, room].sort((a, b) => a - b) });
    }
  };

  const handleRequirementToggle = (tag: string) => {
    const list = formData.keyRequirements || [];
    if (list.includes(tag)) {
      setFormData({ ...formData, keyRequirements: list.filter((t) => t !== tag) });
    } else {
      setFormData({ ...formData, keyRequirements: [...list, tag] });
    }
  };

  const handleAddCustomRequirement = () => {
    if (!customTag.trim()) return;
    const tag = customTag.trim();
    const list = formData.keyRequirements || [];
    if (!list.includes(tag)) {
      setFormData({ ...formData, keyRequirements: [...list, tag] });
    }
    setCustomTag('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = '请输入客户称呼/姓名';
    if (!formData.phone?.trim()) newErrors.phone = '请输入联系方式';
    if (!formData.maxBudget || formData.maxBudget <= 0) newErrors.maxBudget = '请输入最高预算';
    if (
      formData.minBudget &&
      formData.maxBudget &&
      Number(formData.minBudget) > Number(formData.maxBudget)
    ) {
      newErrors.maxBudget = '最高预算不能小于最低预算';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const client: Client = {
      id: initialClient?.id || `client-${Date.now()}`,
      name: formData.name!.trim(),
      phone: formData.phone!.trim(),
      wechat: formData.wechat?.trim() || '',
      clientType: (formData.clientType || 'first_home') as ClientType,
      targetType: (formData.targetType || 'sale') as TransactionType,
      minBudget: Number(formData.minBudget) || 0,
      maxBudget: Number(formData.maxBudget) || 100,
      preferredDistricts: formData.preferredDistricts || [],
      preferredRooms: formData.preferredRooms || [2, 3],
      minArea: formData.minArea ? Number(formData.minArea) : undefined,
      keyRequirements: formData.keyRequirements || [],
      urgency: (formData.urgency || 'urgent') as ClientUrgency,
      familyNotes:
        formData.familyNotes?.trim() ||
        `${formData.name}的找房画像：关注${(formData.preferredRooms || []).join('/')}室，偏好${(formData.keyRequirements || []).join('、')}。`,
      stage: (formData.stage || 'lead') as ClientStage,
      notes: formData.notes?.trim() || '',
      createdAt: initialClient?.createdAt || nowStr,
      updatedAt: nowStr,
    };

    onSave(client);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">
              {initialClient ? '编辑客户画像' : '录入新客源需求'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                客户称呼/姓名 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如 张先生 & 李女士"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                手机电话 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="例如 138-0000-0000"
              />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">微信号</label>
              <input
                type="text"
                value={formData.wechat || ''}
                onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如 wx_user123"
              />
            </div>
          </div>

          {/* Section 2: Intent & Customer Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                需求类型 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const isRent = formData.targetType === 'rent';
                    setFormData({
                      ...formData,
                      targetType: 'sale',
                      minBudget: isRent ? 260 : formData.minBudget,
                      maxBudget: isRent ? 350 : formData.maxBudget,
                    });
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                    formData.targetType === 'sale'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  购房买家
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const isSale = formData.targetType === 'sale';
                    setFormData({
                      ...formData,
                      targetType: 'rent',
                      minBudget: isSale ? 2500 : formData.minBudget,
                      maxBudget: isSale ? 4500 : formData.maxBudget,
                    });
                  }}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                    formData.targetType === 'rent'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  租房租客
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">客户类型</label>
              <select
                value={formData.clientType || 'first_home'}
                onChange={(e) => setFormData({ ...formData, clientType: e.target.value as ClientType })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="first_home">刚需首套 (重视性价比/地铁)</option>
                <option value="upgrade">改善置换 (重视品质/学区/电梯)</option>
                <option value="tenant">租客 (上班便利/拎包住)</option>
                <option value="investor">投资买家 (租售比/核心地段)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">找房紧迫度</label>
              <select
                value={formData.urgency || 'urgent'}
                onChange={(e) =>
                  setFormData({ ...formData, urgency: e.target.value as ClientUrgency })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="urgent">🔥 紧急 (1周内看房签约)</option>
                <option value="medium">⚡ 较急 (1个月内有明确置业打算)</option>
                <option value="casual">🌱 正常关注 / 长期观望</option>
              </select>
            </div>
          </div>

          {/* Section 3: Budget Range & Min Area */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  最低预算 ({formData.targetType === 'sale' ? '万元' : '元/月'})
                </label>
                <input
                  type="number"
                  min="0"
                  step={formData.targetType === 'sale' ? '5' : '100'}
                  value={formData.minBudget || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, minBudget: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                  placeholder={formData.targetType === 'sale' ? '例如 250' : '例如 2500'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  最高预算 ({formData.targetType === 'sale' ? '万元' : '元/月'}){' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step={formData.targetType === 'sale' ? '5' : '100'}
                  value={formData.maxBudget || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, maxBudget: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                  placeholder={formData.targetType === 'sale' ? '例如 350' : '例如 4000'}
                />
                {errors.maxBudget && (
                  <p className="text-xs text-rose-500 mt-1">{errors.maxBudget}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  期望最小建筑面积 (㎡)
                </label>
                <input
                  type="number"
                  min="10"
                  value={formData.minArea || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, minArea: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono tabular-nums"
                  placeholder="例如 75 (不限可留空)"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Preferred Rooms & Districts */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              意向户型居室 (支持多选)
            </label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((room) => {
                const isSelected = (formData.preferredRooms || []).includes(room);
                return (
                  <button
                    key={room}
                    type="button"
                    onClick={() => handleRoomToggle(room)}
                    className={`px-3 py-1.5 text-xs rounded-md border font-medium transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {room} 室
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              意向区域 / 商圈 (支持多选)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {DISTRICT_OPTIONS.map((dist) => {
                const isSelected = (formData.preferredDistricts || []).includes(dist);
                return (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleDistrictToggle(dist)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {dist}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Core Requirements / Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              核心关注要求 (用于精准匹配权重得分)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((tag) => {
                const isSelected = (formData.keyRequirements || []).includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleRequirementToggle(tag)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomRequirement();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="输入个性化需求后回车..."
              />
              <button
                type="button"
                onClick={handleAddCustomRequirement}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>添加</span>
              </button>
            </div>
          </div>

          {/* Section 6: Family situation & Pain points */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />
              <label className="block text-xs font-semibold text-slate-700">
                客户家庭诉求与核心痛点备忘 (极大影响推房说服力)
              </label>
            </div>
            <textarea
              rows={2}
              value={formData.familyNotes || ''}
              onChange={(e) => setFormData({ ...formData, familyNotes: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如：夫妻俩在智慧城科技园上班，准备备孕需要电梯房晒衣服；家里老人有时过来住，膝盖不好不能走楼梯；首付已备齐，卡死350万上限。"
            />
          </div>

          {/* Section 7: Stage & Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">跟进跟进阶段</label>
              <select
                value={formData.stage || 'lead'}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as ClientStage })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
              >
                <option value="lead">新录入客源 (待配对)</option>
                <option value="matched">已智能配对房源 (待推送)</option>
                <option value="viewing">带看推进中</option>
                <option value="negotiating">意向谈判 / 磨价格</option>
                <option value="closed">已成交结单</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">中介跟进备忘</label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md"
                placeholder="例如 周六下午可约看 / 妻子意见占主导"
              />
            </div>
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            {initialClient ? '保存客户画像' : '确认录入客户'}
          </button>
        </div>
      </div>
    </div>
  );
};
