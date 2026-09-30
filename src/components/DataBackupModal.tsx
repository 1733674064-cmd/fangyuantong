import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileText,
  Copy,
  Check,
  AlertCircle,
  HelpCircle,
  Layers,
  RefreshCw,
  FolderInput,
} from 'lucide-react';
import { getSampleImportTemplate } from '../utils/storage';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (jsonString: string, mode: 'replace' | 'merge') => { success: boolean; message: string };
  onExport: () => void;
  onReset: () => void;
  propertiesCount: number;
  clientsCount: number;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onExport,
  onReset,
  propertiesCount,
  clientsCount,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'import' | 'export' | 'template'>('import');
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [pastedJson, setPastedJson] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [importError, setImportError] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setImportError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
    };
    reader.onerror = () => {
      setImportError('文件读取失败，请重试');
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    const textToImport = fileContent.trim() || pastedJson.trim();
    if (!textToImport) {
      setImportError('请先上传 .json 文件或在下方文本框中粘贴 JSON 数据内容');
      return;
    }

    const result = onImport(textToImport, importMode);
    if (result.success) {
      onClose();
    } else {
      setImportError(result.message);
    }
  };

  const handleDownloadTemplate = () => {
    const template = getSampleImportTemplate();
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '房客通_标准导入模板.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(getSampleImportTemplate());
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FolderInput className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">数据导入与备份中心</h2>
              <p className="text-xs text-slate-500">
                支持跨设备数据同步、批量批量导入房客资料与一键安全备份
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

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 gap-6 text-xs">
          <button
            onClick={() => setActiveSubTab('import')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'import'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>导入房源与客源</span>
          </button>
          <button
            onClick={() => setActiveSubTab('export')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'export'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出备份 ({propertiesCount}房 / {clientsCount}客)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('template')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'template'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>导入格式模板与说明</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {activeSubTab === 'import' && (
            <div className="space-y-4">
              {/* How it works info */}
              <div className="p-3.5 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-slate-700 leading-relaxed">
                  <div className="font-semibold text-indigo-900">导入功能使用步骤：</div>
                  <div>1. 选取您之前导出的备份文件（格式为 <code>.json</code>），或照着模板填好的数据文件；</div>
                  <div>2. 选择【追加合并】或【全量覆盖】模式；</div>
                  <div>3. 点击“立即执行导入”，系统将自动解析并在 1 秒内完成入库。</div>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  导入处理方式：
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportMode('merge')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      importMode === 'merge'
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>追加合并（推荐）</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      保留当前已有的房源和客户，将导入的新内容智能合并追加进去，绝不丢失现有数据。
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      importMode === 'replace'
                        ? 'border-rose-600 bg-rose-50/40 text-rose-900 ring-1 ring-rose-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <RefreshCw className="w-4 h-4 text-rose-600" />
                      <span>全量覆盖导入</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      清空当前工作台中的所有旧房客，完全替换为导入文件里的全新数据。
                    </p>
                  </button>
                </div>
              </div>

              {/* Upload file box */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  方式一：选择本地备份文件 (.json)
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-5 text-center transition-colors bg-slate-50/50">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-slate-700 font-medium">
                    {selectedFileName ? (
                      <span className="text-indigo-600 font-bold">{selectedFileName}</span>
                    ) : (
                      <span>点击选择文件，或将 .json 备份文件拖曳至此</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    仅支持标准 JSON 备份数据文件
                  </p>
                  <label className="mt-3 inline-block px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold cursor-pointer shadow-2xs">
                    浏览文件...
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Paste JSON box */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  方式二：或者直接粘贴 JSON 数据文本
                </label>
                <textarea
                  rows={4}
                  value={pastedJson}
                  onChange={(e) => {
                    setPastedJson(e.target.value);
                    setImportError('');
                  }}
                  placeholder="在此直接粘贴包含 properties 和 clients 数组的 JSON 代码文本..."
                  className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              {/* Error message */}
              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 text-sm block mb-1">
                  当前工作台资产备份
                </span>
                <p className="text-slate-500 leading-relaxed mb-4">
                  导出后将生成一个标准的 <code>.json</code> 文件，包含您当前维护的全部 {propertiesCount} 套房源参数与 {clientsCount} 位客户需求画像。您可以妥善保存在电脑或微信收藏中，随时在新设备上导入恢复。
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>立即下载备份文件 (.json)</span>
                  </button>

                  <button
                    onClick={onReset}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>重置为精选示例数据</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'template' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">标准导入数据模板 (JSON)</span>
                  <span className="text-[11px] text-slate-500">
                    您可以下载模板文件，照着数据结构批量添加您的真实房客信息后导入
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyTemplate}
                    className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 rounded-md font-semibold text-slate-700"
                  >
                    {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTemplate ? '已复制' : '复制代码'}</span>
                  </button>

                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载模板文件</span>
                  </button>
                </div>
              </div>

              <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono overflow-x-auto max-h-[360px] leading-relaxed">
                {getSampleImportTemplate()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl">
          <div className="text-slate-500 text-[11px]">
            当前库存：房源 {propertiesCount} 套 · 客源 {clientsCount} 人
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>

            {activeSubTab === 'import' && (
              <button
                onClick={handleExecuteImport}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>立即执行导入</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
