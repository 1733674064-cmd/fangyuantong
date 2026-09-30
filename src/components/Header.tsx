import React from 'react';
import { Home, Sparkles, Building2, Users, BarChart3, Plus, RefreshCw, Download, Upload, Share2 } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                房客通 · 珠海房源分析工作台
              </span>
              <span className="text-xs text-slate-500 font-medium">
                珠海房产专属 · 琴澳高新全域房客极速匹配
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('match')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'match'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>智能匹配找房</span>
            </button>

            <button
              onClick={() => setActiveTab('properties')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'properties'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>房源管理库 ({propertiesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'clients'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>客源档案库 ({clientsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>供需分析看板</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {/* Share with colleagues button */}
            <button
              onClick={onOpenShareModal}
              title="分享工作台给同事使用"
              className="px-2.5 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-indigo-200 shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>分享给同事</span>
            </button>

            {/* Backup & Import modal trigger button */}
            <div className="hidden lg:flex items-center border-r border-slate-200 pr-2 mr-1">
              <button
                onClick={onOpenBackupModal}
                title="导入数据或导出备份"
                className="px-2.5 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>导入 / 导出备份</span>
              </button>
            </div>

            <button
              onClick={onOpenAddProperty}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>录入房源</span>
            </button>

            <button
              onClick={onOpenAddClient}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>录入客户</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-t border-slate-200 overflow-x-auto bg-slate-50 py-1.5 px-2 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('match')}
          className={`px-3 py-1 rounded whitespace-nowrap ${
            activeTab === 'match' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          智能匹配
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`px-3 py-1 rounded whitespace-nowrap ${
            activeTab === 'properties' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          房源 ({propertiesCount})
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-3 py-1 rounded whitespace-nowrap ${
            activeTab === 'clients' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          客源 ({clientsCount})
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1 rounded whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-600'
          }`}
        >
          供需看板
        </button>
      </div>
    </header>
  );
};
