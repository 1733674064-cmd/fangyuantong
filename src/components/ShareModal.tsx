import React, { useState } from 'react';
import { X, Share2, Copy, Check, Users, ShieldCheck, Database, ArrowRight, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, sharedUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">分享工作台给同事与朋友</h2>
              <p className="text-xs text-slate-500">免安装免注册 · 浏览器打开即用 · 独立本地保存</p>
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
        <div className="p-6 space-y-5 text-xs text-slate-600">
          {/* Link Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              公开访问与分享专属链接
            </label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-300 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
              <input
                type="text"
                readOnly
                value={sharedUrl}
                className="flex-1 bg-transparent text-xs text-slate-800 font-mono outline-none px-2 truncate selection:bg-indigo-100"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制到剪贴板！' : '复制链接'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              提示：同事收到链接后，直接在微信聊天、电脑微信或任意浏览器（Chrome / Edge / 手机自带浏览器）中点击即可直接打开。
            </p>
          </div>

          {/* How data storage works */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>数据如何保存？同事录入的数据会丢失吗？</span>
            </h4>

            <div className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  1
                </span>
                <div>
                  <strong className="text-slate-900 block">每人独立的永久本地数据库：</strong>
                  每个同事打开该链接后，系统会自动在他各自的电脑或手机浏览器本地（LocalStorage）建立专属数据库。他在上面录入、修改、删除的房源和客源，即使刷新网页、关闭浏览器或重新开机，**都会完好自动保存**！
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  2
                </span>
                <div>
                  <strong className="text-slate-900 block">数据私密隔离，互不冲突：</strong>
                  同事录入或修改的数据保存在他自己的设备中，不会影响或打乱您现有的房源客源库，保护各自业务隐私。
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                  3
                </span>
                <div>
                  <strong className="text-slate-900 block">如何团队协同共享房源？</strong>
                  如果您想把整理好的房源同步给同事，在右上角点击 **「导入/导出备份」➔「一键导出」**，把 JSON 备份文件发在微信群，同事点击「追加合并导入」即可在 1 秒内同步您的房源库！
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <a
            href={sharedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
          >
            <span>在新窗口打开预览</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
