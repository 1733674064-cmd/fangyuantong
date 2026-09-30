import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  Building2,
  Users,
  BarChart3,
  Plus,
  Upload,
  Share2,
  Menu,
  X,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'match' | 'properties' | 'clients' | 'dashboard';
  setActiveTab: (tab: 'match' | 'properties' | 'clients' | 'dashboard') => void;
  onOpenAddProperty: () => void;
  onOpenAddClient: () => void;
  onOpenBackupModal: () => void;
  onOpenShareModal: () => void;
  propertiesCount: number;
  clientsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddProperty,
  onOpenAddClient,
  onOpenBackupModal,
  onOpenShareModal,
  propertiesCount,
  clientsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Zone 1: Brand Logo & Title */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                    房客通
                  </span>
                  <span className="hidden sm:inline text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    珠海中介版
                  </span>
                </div>
                <span className="hidden md:block text-[11px] text-slate-500 font-medium">
                  琴澳高新全域房客智能秒配 · 多端实时同步
                </span>
              </div>
            </div>

            {/* Zone 2: Desktop & Tablet Nav Tabs (hidden on mobile) */}
            <nav className="hidden md:flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveTab('match')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'match'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>智能匹配</span>
              </button>

              <button
                onClick={() => setActiveTab('properties')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'properties'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>房源库 ({propertiesCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('clients')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'clients'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>客源库 ({clientsCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>供需看板</span>
              </button>
            </nav>

            {/* Zone 3: Quick Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Share Button */}
              <button
                onClick={onOpenShareModal}
                title="分享工作台给同事使用"
                className="px-2 sm:px-2.5 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-indigo-200 shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">分享给同事</span>
                <span className="sm:hidden text-[11px]">分享</span>
              </button>

              {/* Backup & Import (Desktop & Tablet) */}
              <div className="hidden lg:flex items-center border-r border-slate-200 pr-2 mr-0.5">
                <button
                  onClick={onOpenBackupModal}
                  title="导入数据或导出备份"
                  className="px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>备份/导入</span>
                </button>
              </div>

              {/* Add Property Button */}
              <button
                onClick={onOpenAddProperty}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">录入房源</span>
                <span className="sm:hidden text-[11px]">加房源</span>
              </button>

              {/* Add Client Button */}
              <button
                onClick={onOpenAddClient}
                className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">录入客户</span>
                <span className="sm:hidden text-[11px]">加客源</span>
              </button>

              {/* Mobile More Options Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
                title="更多菜单"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Panel for secondary actions */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              快捷工具与数据管理
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBackupModal();
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-medium cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>导入 / 导出备份</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenShareModal();
                }}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-medium cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>分享给同事使用</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Floating / Fixed Bottom Navigation Bar (Phone-friendly, Thumb-reach) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setActiveTab('match')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'match' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">智能匹配</span>
        </button>

        <button
          onClick={() => setActiveTab('properties')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'properties' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Building2 className="w-5 h-5 mb-0.5" />
            {propertiesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-mono font-bold px-1 rounded-full">
                {propertiesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">房源库</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'clients' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5 mb-0.5" />
            {clientsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-indigo-600 text-white text-[9px] font-mono font-bold px-1 rounded-full">
                {clientsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">客源档案</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">供需看板</span>
        </button>
      </div>
    </>
  );
};
