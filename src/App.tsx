/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MatchHub } from './components/MatchHub';
import { PropertyList } from './components/PropertyList';
import { ClientList } from './components/ClientList';
import { DashboardStats } from './components/DashboardStats';
import { PropertyFormModal } from './components/PropertyFormModal';
import { ClientFormModal } from './components/ClientFormModal';
import { PitchModal } from './components/PitchModal';
import { PropertyComparisonModal } from './components/PropertyComparisonModal';
import { ReverseMatchModal } from './components/ReverseMatchModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { DataBackupModal } from './components/DataBackupModal';
import { ShareModal } from './components/ShareModal';
import { Property, Client, MatchResult, PropertyStatus, ClientStage } from './types';
import {
  loadProperties,
  saveProperties,
  loadClients,
  saveClients,
  resetDemoData,
  exportDataAsJSON,
  importDataFromJSON,
} from './utils/storage';

// The public active URL for colleagues and friends
const SHARED_APP_URL = 'https://ais-dev-odpmx6jxvldfunmlcjodyw-227691466509.us-east1.run.app';

export default function App() {
  const [properties, setProperties] = useState<Property[]>(() => loadProperties());
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [activeTab, setActiveTab] = useState<'match' | 'properties' | 'clients' | 'dashboard'>('match');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(() => {
    const initialClients = loadClients();
    return initialClients.length > 0 ? initialClients[0].id : null;
  });

  // Storage availability
  const [storageBlocked, setStorageBlocked] = useState(false);

  // Modals state
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [pitchMatchResult, setPitchMatchResult] = useState<MatchResult | null>(null);
  const [comparisonProperties, setComparisonProperties] = useState<Property[]>([]);
  const [reverseMatchProperty, setReverseMatchProperty] = useState<Property | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  // Check storage accessibility on mount
  useEffect(() => {
    try {
      const testKey = '__storage_test_key__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
    } catch (e) {
      setStorageBlocked(true);
      console.warn('localStorage is blocked in this browser context:', e);
    }
  }, []);

  // Synchronize properties to localStorage whenever state changes
  useEffect(() => {
    saveProperties(properties);
  }, [properties]);

  // Synchronize clients to localStorage whenever state changes
  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  // 1. Property CRUD
  const handleSaveProperty = (property: Property) => {
    const exists = properties.some((p) => p.id === property.id);
    let updated: Property[];
    if (exists) {
      updated = properties.map((p) => (p.id === property.id ? property : p));
      showToast(`房源【${property.community}】更新成功`);
    } else {
      updated = [property, ...properties];
      showToast(`新房源【${property.community}】已成功录入`);
    }
    setProperties(updated);
    saveProperties(updated);
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
  };

  const handleDeleteProperty = (id: string) => {
    const target = properties.find((p) => p.id === id);
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    saveProperties(updated);
    // Also remove from comparison if present
    setComparisonProperties((prev) => prev.filter((p) => p.id !== id));
    showToast(`房源【${target?.community || ''}】已删除`, 'info');
  };

  const handleBatchDeleteProperties = (ids: string[]) => {
    const updated = properties.filter((p) => !ids.includes(p.id));
    setProperties(updated);
    saveProperties(updated);
    setComparisonProperties((prev) => prev.filter((p) => !ids.includes(p.id)));
    showToast(`成功批量删除 ${ids.length} 套房源`, 'info');
  };

  const handleUpdatePropertyStatus = (id: string, status: PropertyStatus) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, status } : p));
    setProperties(updated);
    saveProperties(updated);
    showToast('房源状态已更新');
  };

  const handleBatchUpdatePropertyStatus = (ids: string[], status: PropertyStatus) => {
    const updated = properties.map((p) => (ids.includes(p.id) ? { ...p, status } : p));
    setProperties(updated);
    saveProperties(updated);
    showToast(`已批量更新 ${ids.length} 套房源状态`);
  };

  // 2. Client CRUD
  const handleSaveClient = (client: Client) => {
    const exists = clients.some((c) => c.id === client.id);
    let updated: Client[];
    if (exists) {
      updated = clients.map((c) => (c.id === client.id ? client : c));
      showToast(`客户【${client.name}】画像更新成功`);
    } else {
      updated = [client, ...clients];
      showToast(`客户【${client.name}】已成功建档`);
      setSelectedClientId(client.id);
    }
    setClients(updated);
    saveClients(updated);
    setIsClientModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (id: string) => {
    const target = clients.find((c) => c.id === id);
    const updated = clients.filter((c) => c.id !== id);
    setClients(updated);
    saveClients(updated);
    if (selectedClientId === id) {
      setSelectedClientId(updated.length > 0 ? updated[0].id : null);
    }
    showToast(`客户【${target?.name || ''}】档案已移除`, 'info');
  };

  const handleBatchDeleteClients = (ids: string[]) => {
    const updated = clients.filter((c) => !ids.includes(c.id));
    setClients(updated);
    saveClients(updated);
    if (selectedClientId && ids.includes(selectedClientId)) {
      setSelectedClientId(updated.length > 0 ? updated[0].id : null);
    }
    showToast(`成功批量删除 ${ids.length} 位客户`, 'info');
  };

  const handleUpdateClientStage = (id: string, stage: ClientStage) => {
    const updated = clients.map((c) => (c.id === id ? { ...c, stage } : c));
    setClients(updated);
    saveClients(updated);
    showToast('客户跟进阶段已更新');
  };

  const handleBatchUpdateClientStage = (ids: string[], stage: ClientStage) => {
    const updated = clients.map((c) => (ids.includes(c.id) ? { ...c, stage } : c));
    setClients(updated);
    saveClients(updated);
    showToast(`已批量更新 ${ids.length} 位客户跟进阶段`);
  };

  // 3. Workflow shortcuts
  const handleStartMatching = (client: Client) => {
    setSelectedClientId(client.id);
    setActiveTab('match');
  };

  const handleStartMatchingById = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab('match');
  };

  const handleReverseMatch = (property: Property) => {
    setReverseMatchProperty(property);
  };

  const handleMarkViewingScheduled = (clientId: string, _propertyId: string) => {
    handleUpdateClientStage(clientId, 'viewing');
    showToast('已更新为【带看推进中】状态');
  };

  // 4. Data management
  const handleResetData = () => {
    if (window.confirm('确定要恢复为精选示范数据吗？当前新增的测试数据将被重置。')) {
      const reset = resetDemoData();
      setProperties(reset.properties);
      setClients(reset.clients);
      setSelectedClientId(reset.clients[0]?.id || null);
      showToast('已重置为精选示例房源与客源数据');
    }
  };

  const handleExportData = () => {
    const json = exportDataAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `房客通_数据备份_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('数据已导出为 JSON 备份文件');
  };

  const handleImportDataJson = (jsonString: string, mode: 'replace' | 'merge') => {
    const res = importDataFromJSON(jsonString, mode);
    if (res.success) {
      setProperties(loadProperties());
      const clis = loadClients();
      setClients(clis);
      if (clis.length > 0) setSelectedClientId(clis[0].id);
      showToast(res.message);
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  const activeClientForComparison = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddProperty={() => {
          setEditingProperty(null);
          setIsPropertyModalOpen(true);
        }}
        onOpenAddClient={() => {
          setEditingClient(null);
          setIsClientModalOpen(true);
        }}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        propertiesCount={properties.length}
        clientsCount={clients.length}
      />

      {storageBlocked && (
        <div className="bg-amber-600 text-white px-4 py-2.5 text-xs text-center font-medium flex items-center justify-center gap-2 shadow-sm">
          <span>⚠️ 提醒：当前浏览器窗口限制了本地存储（可能处于隐私模式），刷新后数据修改可能无法自动保存，建议使用正常窗口或在右上角点击「导出备份」。</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'match' && (
          <MatchHub
            clients={clients}
            properties={properties}
            selectedClientId={selectedClientId}
            onSelectClient={(id) => setSelectedClientId(id)}
            onOpenAddClient={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            onOpenPitch={(result) => setPitchMatchResult(result)}
            onOpenComparison={(props) => setComparisonProperties(props)}
            onViewProperty={(property) => setViewingProperty(property)}
            onUpdateClientStage={handleUpdateClientStage}
          />
        )}

        {activeTab === 'properties' && (
          <PropertyList
            properties={properties}
            onOpenAddProperty={() => {
              setEditingProperty(null);
              setIsPropertyModalOpen(true);
            }}
            onEditProperty={(property) => {
              setEditingProperty(property);
              setIsPropertyModalOpen(true);
            }}
            onDeleteProperty={handleDeleteProperty}
            onBatchDeleteProperties={handleBatchDeleteProperties}
            onUpdateStatus={handleUpdatePropertyStatus}
            onBatchUpdateStatus={handleBatchUpdatePropertyStatus}
            onReverseMatch={handleReverseMatch}
            onSelectPropertyToMatch={(property) => {
              handleReverseMatch(property);
            }}
          />
        )}

        {activeTab === 'clients' && (
          <ClientList
            clients={clients}
            onOpenAddClient={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
            onEditClient={(client) => {
              setEditingClient(client);
              setIsClientModalOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
            onBatchDeleteClients={handleBatchDeleteClients}
            onUpdateStage={handleUpdateClientStage}
            onBatchUpdateStage={handleBatchUpdateClientStage}
            onStartMatching={handleStartMatching}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardStats
            properties={properties}
            clients={clients}
            onSelectClientToMatch={handleStartMatchingById}
            onOpenAddProperty={() => {
              setEditingProperty(null);
              setIsPropertyModalOpen(true);
            }}
            onOpenAddClient={() => {
              setEditingClient(null);
              setIsClientModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce duration-300">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 border ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : toast.type === 'info'
                ? 'bg-slate-800 text-white border-slate-900'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* 1. Add / Edit Property Modal */}
      <PropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        initialProperty={editingProperty}
      />

      {/* 2. Add / Edit Client Modal */}
      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        initialClient={editingClient}
      />

      {/* 3. Pitch Modal (WeChat Recommendation Generator) */}
      <PitchModal
        isOpen={!!pitchMatchResult}
        onClose={() => setPitchMatchResult(null)}
        matchResult={pitchMatchResult}
        onMarkViewingScheduled={handleMarkViewingScheduled}
      />

      {/* 4. Side-by-Side Property Comparison Modal */}
      <PropertyComparisonModal
        isOpen={comparisonProperties.length > 0}
        onClose={() => setComparisonProperties([])}
        properties={comparisonProperties}
        activeClient={activeClientForComparison}
        onRemoveProperty={(id) => {
          setComparisonProperties((prev) => prev.filter((p) => p.id !== id));
        }}
      />

      {/* 5. Reverse Matching Modal (Given property, find clients) */}
      <ReverseMatchModal
        isOpen={!!reverseMatchProperty}
        onClose={() => setReverseMatchProperty(null)}
        property={reverseMatchProperty}
        clients={clients}
        onOpenPitch={(result) => setPitchMatchResult(result)}
      />

      {/* 6. View Property Details */}
      <PropertyDetailModal
        isOpen={!!viewingProperty}
        onClose={() => setViewingProperty(null)}
        property={viewingProperty}
        onEdit={(prop) => {
          setViewingProperty(null);
          setEditingProperty(prop);
          setIsPropertyModalOpen(true);
        }}
        onReverseMatch={(prop) => {
          setViewingProperty(null);
          handleReverseMatch(prop);
        }}
      />

      {/* 7. Data Backup & Import Modal */}
      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onImport={handleImportDataJson}
        onExport={handleExportData}
        onReset={handleResetData}
        propertiesCount={properties.length}
        clientsCount={clients.length}
      />

      {/* 8. Share With Colleagues Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        sharedUrl={SHARED_APP_URL}
      />
    </div>
  );
}
