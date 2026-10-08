import React, { useState } from 'react';
import {
  X,
  Link as LinkIcon,
  Sparkles,
  Check,
  Building2,
  Copy,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Database,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { Property } from '../types';
import { parseBeikeShareContent, BEIKE_SAMPLE_SNIPPETS } from '../utils/beikeParser';

interface BeikeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProperty: (property: Property) => void;
}

export const BeikeSyncModal: React.FC<BeikeSyncModalProps> = ({
  isOpen,
  onClose,
  onSaveProperty,
}) => {
  const [activeTab, setActiveTab] = useState<'parse' | 'openapi'>('parse');
  const [inputContent, setInputContent] = useState('');
  const [parsedData, setParsedData] = useState<Partial<Property> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // OpenAPI Config States
  const [appKey, setAppKey] = useState(() => localStorage.getItem('beike_app_key') || '');
  const [appSecret, setAppSecret] = useState(() => localStorage.getItem('beike_app_secret') || '');
  const [storeCode, setStoreCode] = useState(() => localStorage.getItem('beike_store_code') || '');
  const [apiSaveMsg, setApiSaveMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = (textToParse?: string) => {
    const raw = textToParse || inputContent;
    if (!raw.trim()) {
      setParseError('请先粘贴贝壳找房 App 或 A+ 系统的房源分享文本或链接');
      setParsedData(null);
      return;
    }

    setParseError(null);
    const res = parseBeikeShareContent(raw);
    if (res.success && res.data) {
      setParsedData(res.data);
      setSuccessNotice(`成功解析贝壳房源【${res.data.community || '优质房源'}】！`);
      setTimeout(() => setSuccessNotice(null), 3000);
    } else {
      setParseError(res.message || '解析失败，请检查输入格式');
      setParsedData(null);
    }
  };

  const handleUseSample = (snippet: string) => {
    setInputContent(snippet);
    handleParse(snippet);
  };

  const handleSaveToDatabase = () => {
    if (!parsedData) return;

    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const newProperty: Property = {
      id: `prop-beike-${Date.now()}`,
      title: parsedData.title || `【贝壳ACN】${parsedData.community || '精选房源'}`,
      community: parsedData.community || '未知名小区',
      district: parsedData.district || '香洲区',
      type: parsedData.type || 'sale',
      price: parsedData.price || 300,
      unitPrice: parsedData.unitPrice,
      rooms: parsedData.rooms || 3,
      livingRooms: parsedData.livingRooms || 2,
      bathrooms: parsedData.bathrooms || 1,
      area: parsedData.area || 89,
      floor: parsedData.floor || 'middle',
      totalFloors: parsedData.totalFloors || 28,
      hasElevator: parsedData.hasElevator ?? true,
      orientation: parsedData.orientation || '南北通透',
      decoration: 'refined',
      tags: parsedData.tags || ['贝壳同步', 'ACN真房源'],
      highlights: parsedData.highlights || '贝壳ACN加盟合作真房源，随时看房。',
      ownerName: 'A+系统维护经纪人',
      ownerPhone: '详见A+内部系统',
      status: 'active',
      isBeikeSynced: true,
      beikeHouseCode: parsedData.beikeHouseCode,
      beikeUrl: parsedData.beikeUrl,
      lastSyncedAt: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    onSaveProperty(newProperty);
    onClose();
  };

  const handleSaveApiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('beike_app_key', appKey.trim());
    localStorage.setItem('beike_app_secret', appSecret.trim());
    localStorage.setItem('beike_store_code', storeCode.trim());
    setApiSaveMsg('✅ 贝壳 A+ OpenAPI 密钥配置已安全保存在本地！');
    setTimeout(() => setApiSaveMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200 overflow-hidden max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  贝壳找房 / A+ 系统实时同步中心
                </h2>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-1.5 py-0.5 rounded">
                  ACN加盟店专属
                </span>
              </div>
              <p className="text-xs text-slate-500">
                支持 A+ 分享链接一键智能解析、房源状态实时追踪与官方 OpenAPI 对接
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('parse')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'parse'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>贝壳 / A+ 链接口令极速解析</span>
          </button>
          <button
            onClick={() => setActiveTab('openapi')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'openapi'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>贝壳开放平台 (OpenAPI) 接口配置</span>
          </button>
        </div>

        {/* Tab 1: Parse & Sync */}
        {activeTab === 'parse' && (
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {/* Input area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800">
                  粘贴贝壳 App / A+ 复制的房源链接或分享文本：
                </label>
                <span className="text-[11px] text-slate-400">
                  手机A+点「分享」复制即可直接粘贴
                </span>
              </div>
              <textarea
                rows={3}
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="例如：【贝壳找房】我在贝壳看到一套好房【中海银海湾 3室2厅 138平米 520万】https://zh.ke.com/ershoufang/105108291845.html"
                className="w-full p-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 font-mono"
              />
            </div>

            {/* Quick Sample Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-[11px]">快速测试示例：</span>
              {BEIKE_SAMPLE_SNIPPETS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleUseSample(sample.snippet)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] transition-colors border border-slate-200 cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Action Parse Button */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleParse()}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>立即一键智能解析并提取字段</span>
              </button>
            </div>

            {/* Notifications */}
            {parseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{parseError}</span>
              </div>
            )}

            {successNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Parsed Preview Card */}
            {parsedData && (
              <div className="p-4 bg-slate-50 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {parsedData.community}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-semibold">
                      {parsedData.type === 'sale' ? '二手买卖' : '房屋租赁'}
                    </span>
                    {parsedData.beikeHouseCode && (
                      <span className="text-slate-400 font-mono text-[11px]">
                        编码: {parsedData.beikeHouseCode}
                      </span>
                    )}
                  </div>
                  {parsedData.beikeUrl && (
                    <a
                      href={parsedData.beikeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>在贝壳官网核对</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block">挂牌价格</span>
                    <span className="font-bold text-rose-600 text-sm font-mono">
                      {parsedData.price} {parsedData.type === 'sale' ? '万' : '元/月'}
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block">户型格局</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {parsedData.rooms}室{parsedData.livingRooms}厅{parsedData.bathrooms}卫
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block">建筑面积</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">
                      {parsedData.area} ㎡
                    </span>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block">朝向与楼层</span>
                    <span className="font-medium text-slate-800">
                      {parsedData.orientation} · {parsedData.floor === 'high' ? '高层' : '中低层'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-slate-400 text-[11px]">自动打标签：</span>
                  {parsedData.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Final Save Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveToDatabase}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>确认无误，一键录入到本系统房源库！</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: OpenAPI Settings */}
        {activeTab === 'openapi' && (
          <form onSubmit={handleSaveApiConfig} className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>贝壳 ACN A+ 开放平台 (OpenAPI) 开发者对接说明</span>
              </div>
              <p className="text-blue-700 leading-relaxed text-[11px]">
                因为您的门店是贝壳 ACN 加盟合作店，如果您拥有门店 A+ 系统管理员账号，您可在贝壳开放平台（open.ke.com）申请企业级接口权限。配置完成后，系统可通过官方底层协议定时自动拉取您门店在盘的真实房源。
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  贝壳开放平台 AppKey
                </label>
                <input
                  type="text"
                  value={appKey}
                  onChange={(e) => setAppKey(e.target.value)}
                  placeholder="例如：beike_open_app_xxxxxx"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  贝壳开放平台 AppSecret
                </label>
                <input
                  type="password"
                  value={appSecret}
                  onChange={(e) => setAppSecret(e.target.value)}
                  placeholder="请输入您的 AppSecret 密钥"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  门店加盟机构编码 (Store Code)
                </label>
                <input
                  type="text"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  placeholder="例如：ZH_ACN_STORE_00892"
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {apiSaveMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                {apiSaveMsg}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                保存 API 配置
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
