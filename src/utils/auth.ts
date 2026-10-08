import { AppUser } from '../types';

const USERS_STORAGE_KEY = 'fyt_team_users';
const CURRENT_USER_KEY = 'fyt_current_user';

// 初始默认门店团队账号
export const INITIAL_TEAM_USERS: AppUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    password: '123456',
    name: '店长 (超级管理员)',
    role: 'admin',
    phone: '13800000001',
    createdAt: '2026-01-01',
  },
  {
    id: 'user-agent-1',
    username: 'agent1',
    password: '123456',
    name: '王经纪',
    role: 'agent',
    phone: '13800000002',
    createdAt: '2026-01-02',
  },
  {
    id: 'user-agent-2',
    username: 'agent2',
    password: '123456',
    name: '陈经纪',
    role: 'agent',
    phone: '13800000003',
    createdAt: '2026-01-03',
  },
];

/**
 * 获取所有团队账号
 */
export function getTeamUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_TEAM_USERS));
      return INITIAL_TEAM_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEAM_USERS;
  } catch (e) {
    console.error('Failed to get team users', e);
    return INITIAL_TEAM_USERS;
  }
}

/**
 * 保存团队账号列表
 */
export function saveTeamUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save team users', e);
  }
}

/**
 * 获取当前登录用户
 */
export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // 默认以 admin 自动登录，保证开箱即用，同时可随时退出切换
    const users = getTeamUsers();
    const defaultUser = users[0] || INITIAL_TEAM_USERS[0];
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  } catch (e) {
    console.error('Failed to get current user', e);
    return INITIAL_TEAM_USERS[0];
  }
}

/**
 * 账号密码登录
 */
export function loginUser(username: string, password: string): { success: boolean; user?: AppUser; message?: string } {
  const users = getTeamUsers();
  const trimmedUser = username.trim().toLowerCase();
  
  const found = users.find(
    (u) => (u.username.toLowerCase() === trimmedUser || u.phone === trimmedUser) && u.password === password.trim()
  );

  if (found) {
    const safeUser = { ...found };
    delete safeUser.password;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return { success: true, user: found };
  }

  return { success: false, message: '账号或密码不正确，请重新输入（默认密码为 123456）' };
}

/**
 * 退出登录
 */
export function logoutUser(): void {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {
    console.error('Failed to logout', e);
  }
}

/**
 * 创建新同事账号
 */
export function addColleague(newUser: Omit<AppUser, 'id' | 'createdAt'>): { success: boolean; message?: string; user?: AppUser } {
  const users = getTeamUsers();
  const trimmed = newUser.username.trim().toLowerCase();

  if (users.some((u) => u.username.toLowerCase() === trimmed)) {
    return { success: false, message: `账号名 "${newUser.username}" 已存在，请更换` };
  }

  const user: AppUser = {
    ...newUser,
    id: `user-${Date.now()}`,
    createdAt: new Date().toISOString().substring(0, 10),
  };

  const updated = [...users, user];
  saveTeamUsers(updated);
  return { success: true, user };
}

/**
 * 删除同事账号
 */
export function deleteColleague(userId: string): boolean {
  if (userId === 'user-admin') return false; // 管理员不能删除
  const users = getTeamUsers();
  const updated = users.filter((u) => u.id !== userId);
  saveTeamUsers(updated);
  return true;
}

/**
 * 修改密码
 */
export function changePassword(userId: string, newPass: string): boolean {
  const users = getTeamUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return false;
  users[index].password = newPass;
  saveTeamUsers(users);

  // 如果改的是当前用户，同步更新当前登录缓存
  const current = getCurrentUser();
  if (current && current.id === userId) {
    current.password = newPass;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));
  }
  return true;
}
