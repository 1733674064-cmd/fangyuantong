import { Property, Client } from '../types';
import { INITIAL_PROPERTIES, INITIAL_CLIENTS } from './mockData';

const STORAGE_KEY_PROPERTIES = 'estate_match_properties_zhuhai_v3';
const STORAGE_KEY_CLIENTS = 'estate_match_clients_zhuhai_v3';
const STORAGE_KEY_INITIALIZED = 'estate_match_initialized_zhuhai_v3';

// Check if localStorage is working and not blocked by browser sandbox
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__estate_storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

export function loadProperties(): Property[] {
  try {
    // If user has initialized, trust whatever is in storage, even if []
    const isInit = localStorage.getItem(STORAGE_KEY_INITIALIZED);
    const raw = localStorage.getItem(STORAGE_KEY_PROPERTIES);

    if (isInit === 'true' && raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed; // Returns parsed data even if it has 0 items (user deleted all)
        }
      } catch (err) {
        console.error('Failed to parse stored properties:', err);
      }
    }

    // First time opening the workbench: initialize demo data
    saveProperties(INITIAL_PROPERTIES);
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    return INITIAL_PROPERTIES;
  } catch (e) {
    console.error('Failed to load properties from storage:', e);
    return INITIAL_PROPERTIES;
  }
}

export function saveProperties(properties: Property[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(properties));
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    return true;
  } catch (e) {
    console.error('Failed to save properties to storage:', e);
    return false;
  }
}

export function loadClients(): Client[] {
  try {
    const isInit = localStorage.getItem(STORAGE_KEY_INITIALIZED);
    const raw = localStorage.getItem(STORAGE_KEY_CLIENTS);

    if (isInit === 'true' && raw !== null) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed; // Returns parsed data even if it has 0 items
        }
      } catch (err) {
        console.error('Failed to parse stored clients:', err);
      }
    }

    // First time opening the workbench: initialize demo data
    saveClients(INITIAL_CLIENTS);
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    return INITIAL_CLIENTS;
  } catch (e) {
    console.error('Failed to load clients from storage:', e);
    return INITIAL_CLIENTS;
  }
}

export function saveClients(clients: Client[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
    return true;
  } catch (e) {
    console.error('Failed to save clients to storage:', e);
    return false;
  }
}

export function resetDemoData(): { properties: Property[]; clients: Client[] } {
  saveProperties(INITIAL_PROPERTIES);
  saveClients(INITIAL_CLIENTS);
  localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
  return { properties: INITIAL_PROPERTIES, clients: INITIAL_CLIENTS };
}

export function exportDataAsJSON(): string {
  const data = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    properties: loadProperties(),
    clients: loadClients(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJSON(
  jsonString: string,
  mode: 'replace' | 'merge' = 'replace'
): { success: boolean; message: string; propertiesCount?: number; clientsCount?: number } {
  try {
    const parsed = JSON.parse(jsonString);
    const newProps = parsed.properties && Array.isArray(parsed.properties) ? parsed.properties : [];
    const newClients = parsed.clients && Array.isArray(parsed.clients) ? parsed.clients : [];

    if (newProps.length === 0 && newClients.length === 0) {
      return { success: false, message: '导入内容中未检测到有效的房源或客源数据，请检查文件格式。' };
    }

    let finalProps: Property[] = [];
    let finalClients: Client[] = [];

    if (mode === 'merge') {
      const currentProps = loadProperties();
      const currentClients = loadClients();

      const existingPropIds = new Set(currentProps.map((p) => p.id));
      const filteredNewProps = newProps.map((p: any) => ({
        ...p,
        id: existingPropIds.has(p.id)
          ? `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          : p.id || `prop-${Date.now()}`,
      }));

      const existingClientIds = new Set(currentClients.map((c) => c.id));
      const filteredNewClients = newClients.map((c: any) => ({
        ...c,
        id: existingClientIds.has(c.id)
          ? `client-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
          : c.id || `client-${Date.now()}`,
      }));

      finalProps = [...filteredNewProps, ...currentProps];
      finalClients = [...filteredNewClients, ...currentClients];
    } else {
      finalProps = newProps;
      finalClients = newClients;
    }

    saveProperties(finalProps);
    saveClients(finalClients);

    return {
      success: true,
      message:
        mode === 'merge'
          ? `成功合并追加 ${newProps.length} 套新房源与 ${newClients.length} 位新客户数据！`
          : `成功覆盖导入 ${finalProps.length} 套房源与 ${finalClients.length} 位客户数据！`,
      propertiesCount: finalProps.length,
      clientsCount: finalClients.length,
    };
  } catch (e) {
    return { success: false, message: 'JSON数据解析失败：请确保内容为有效的标准 JSON 格式。' };
  }
}

export function getSampleImportTemplate(): string {
  const sample = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    description: '房客通标准导入模板',
    properties: [
      {
        id: 'prop-custom-001',
        title: '示例：华发新城 3室2厅 南北通透 精装',
        community: '华发新城',
        district: '香洲区 / 南湾',
        type: 'sale',
        price: 240,
        unitPrice: 26966,
        rooms: 3,
        livingRooms: 2,
        bathrooms: 1,
        area: 89,
        floor: 'middle',
        totalFloors: 26,
        hasElevator: true,
        orientation: '南北通透',
        decoration: 'refined',
        tags: ['成熟大盘', '带电梯', '华发物业'],
        highlights: '采光好，户型方正，近华发商都。',
        ownerName: '李先生',
        ownerPhone: '138-0000-0000',
        minPrice: 230,
        status: 'active',
        createdAt: '2026-09-30 10:00',
        updatedAt: '2026-09-30 10:00',
      },
    ],
    clients: [
      {
        id: 'client-custom-001',
        name: '示例：周先生',
        phone: '139-1111-2222',
        wechat: 'wx_sample',
        clientType: 'first_home',
        targetType: 'sale',
        minBudget: 200,
        maxBudget: 260,
        preferredDistricts: ['香洲区'],
        preferredRooms: [3],
        minArea: 80,
        keyRequirements: ['带电梯', '纯南向'],
        urgency: 'urgent',
        familyNotes: '买首套婚房，需要带电梯。',
        stage: 'matched',
        createdAt: '2026-09-30 10:00',
        updatedAt: '2026-09-30 10:00',
      },
    ],
  };
  return JSON.stringify(sample, null, 2);
}
