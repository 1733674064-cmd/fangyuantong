import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, MessageSquare, Send } from 'lucide-react';
import { MatchResult } from '../types';

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchResult: MatchResult | null;
  onMarkViewingScheduled?: (clientId: string, propertyId: string) => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({
  isOpen,
  onClose,
  matchResult,
  onMarkViewingScheduled,
}) => {
  const [tone, setTone] = useState<'standard' | 'warm' | 'urgent'>('standard');
  const [pitchText, setPitchText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!matchResult) return;
    const { property, client, score, pros } = matchResult;
    const priceUnit = property.type === 'sale' ? '万' : '元/月';
    const action = property.type === 'sale' ? '买房' : '租房';

    let text = '';
    if (tone === 'standard') {
      text = `${client.name}，您好！
根据您前两天的${action}需求，我刚才在房源库里为您做了一轮深度智能匹配，淘到了一套特别契合您要求的房子（综合匹配度高达 ${score}%）：

📍 【小区位置】${property.community}（${property.district}），${property.subwayDistance || '交通配套便利'}
🏠 【户型面积】${property.rooms}室${property.livingRooms}厅${property.bathrooms}卫，建筑面积 ${property.area}㎡，${property.orientation}朝向
💰 【挂牌价格】${property.price}${priceUnit}（${property.type === 'sale' ? `折合单价约${property.unitPrice || Math.round((property.price * 10000) / property.area)}元/㎡` : '随时可拎包入住'}）
✨ 【核心契合点】${property.highlights}
${pros.length > 0 ? `\n💡 为什么特别推荐给您：\n${pros.slice(0, 3).map((p, i) => `${i + 1}. ${p}`).join('\n')}` : ''}

这套房子业主诚意度很高，看房比较方便。您看这周找个时间，我帮您提前约好业主实地带您看下？`;
    } else if (tone === 'warm') {
      text = `${client.name}，打扰啦！
刚刚我们店里系统更新了一套新房源，我第一时间就想到您了！
您之前特意交代过家庭需求（${client.familyNotes.slice(0, 40)}...），这套【${property.community}】的${property.rooms}房真的太吻合了！

这套房子是${property.orientation}朝向，建面${property.area}㎡，采光和通风特别舒服；总价是${property.price}${priceUnit}，正好完全控制在您的预算内。${property.hasElevator ? '而且是高品质电梯房，平时出入特别省心。' : ''}

房子钥匙刚放我们店里，我今天正好在周边带看，您周末或者今晚下班后有空吗？我顺道带您先感受一下小区环境？`;
    } else {
      // urgent / bargain
      text = `【笋盘急推】${client.name}，紧急通知您一套高性价比房源！
【${property.community}】刚才业主急于置换诚意直降，现挂牌只要 ${property.price}${priceUnit}！
这套房建面 ${property.area}㎡做到了 ${property.rooms}室，对口 ${property.tags.includes('优质学区') ? '优质学位' : '成熟商圈'}，${property.subwayDistance || '近地铁'}。

综合评分我们系统打出了 ${score} 分的超高契合度！目前已经有好几组客户在咨询，预计这两天就会有定金意向。
您这几天如果方便，强烈建议尽快来实地看一眼，我帮您锁定优先看房名额！`;
    }

    setPitchText(text);
  }, [matchResult, tone]);

  if (!isOpen || !matchResult) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pitchText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleScheduleViewing = () => {
    if (onMarkViewingScheduled) {
      onMarkViewingScheduled(matchResult.client.id, matchResult.property.id);
    }
    handleCopy();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                专属微信推房话术生成
              </h2>
              <p className="text-xs text-slate-500">
                基于 {matchResult.client.name} 的画像诉求与 {matchResult.property.community} 的契合点自动编排
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tone Selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">话术语气风格：</span>
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setTone('standard')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  tone === 'standard' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                客观专业
              </button>
              <button
                type="button"
                onClick={() => setTone('warm')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  tone === 'warm' ? 'bg-white text-indigo-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                热情贴心
              </button>
              <button
                type="button"
                onClick={() => setTone('urgent')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  tone === 'urgent' ? 'bg-white text-rose-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                笋盘急推
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={11}
              value={pitchText}
              onChange={(e) => setPitchText(e.target.value)}
              className="w-full p-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>💡 提示：您可直接修改上方文字，点击复制后可在微信聊天窗直接粘贴发给客户</span>
            <span className="font-mono tabular-nums">{pitchText.length} 字</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            <span>客户微信: {matchResult.client.wechat || matchResult.client.phone}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
                copied
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>已复制到剪贴板！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>一键复制话术</span>
                </>
              )}
            </button>

            <button
              onClick={handleScheduleViewing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>复制并标记【预约带看】</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
