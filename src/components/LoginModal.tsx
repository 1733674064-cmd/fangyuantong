import React, { useState } from 'react';
import {
  X,
  Lock,
  User,
  Key,
  Check,
  AlertCircle,
  Shield,
  Sparkles,
  UserPlus,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { AppUser } from '../types';
import { loginUser, getTeamUsers, addColleague } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState<string | null>(null);

  if (!isOpen) return null;

  const users = getTeamUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('请输入账号和密码');
      return;
    }

    const res = loginUser(username, password);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setError(res.message || '账号或密码错误');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError('请完整填写同事姓名、登录账号和密码');
      return;
    }

    if (regPassword.trim().length < 4) {
      setRegError('密码长度至少为 4 位');
      return;
    }

    const res = addColleague({
      name: regName.trim(),
      username: regUsername.trim(),
      password: regPassword.trim(),
      phone: regPhone.trim(),
      role: 'agent', // 新同事注册默认为经纪人角色
    });

    if (res.success && res.user) {
      // 注册成功后直接自动登录
      onLoginSuccess(res.user);
      onClose();
    } else {
      setRegError(res.message || '创建账户失败');
    }
  };

  const handleQuickSelect = (u: AppUser) => {
    setUsername(u.username);
    setPassword('123456');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              {tab === 'login' ? <Lock className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {tab === 'login' ? '同事工作台登录' : '创建新同事账户'}
              </h2>
              <p className="text-xs text-slate-500">
                {tab === 'login'
                  ? '登录后仅显示您个人专属的私有房客源'
                  : '创建独立账号后即可开始录入与管理您的私有数据'}
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

        {/* Tab Switcher: 登录 VS 注册 */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            已有账号登录
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setRegError(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ➕ 创建新账户 (注册)
          </button>
        </div>

        {/* Tab 1: Login Form */}
        {tab === 'login' && (
          <div>
            {/* Quick Account Fill Pills */}
            <div className="p-4 bg-indigo-50/50 border-b border-indigo-100/70 text-xs">
              <div className="flex items-center gap-1 font-semibold text-indigo-900 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>快捷填入测试账号（默认密码123456）：</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 text-indigo-900 font-medium transition-all text-[11px] shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <span>{u.role === 'admin' ? '👑' : '💼'}</span>
                    <span>{u.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({u.username})</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  账号 / 手机号
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="例如：admin 或 agent1"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  登录密码
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码（默认 123456）"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>立即登录工作台</span>
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold cursor-pointer hover:underline inline-flex items-center gap-1"
                >
                  <span>还没有账号？点击此处免费创建新账户</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                同事姓名 / 称呼 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="例如：小赵 / 王经纪"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                登录账号 (用户名/手机号) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="例如：zhao / 13800138000"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                设置登录密码 <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="请输入至少 4 位登录密码"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                联系手机号 (选填)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="例如：13812345678"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            {regError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{regError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                <Check className="w-4 h-4" />
                <span>立即创建并登录我的专属工作台</span>
              </button>
            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-slate-500 hover:text-slate-800 text-xs cursor-pointer hover:underline"
              >
                已有账号？返回登录 ➔
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
