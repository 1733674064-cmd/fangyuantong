import React, { useState } from 'react';
import { X, Lock, User, Key, Check, AlertCircle, Shield, Sparkles } from 'lucide-react';
import { AppUser } from '../types';
import { loginUser, getTeamUsers } from '../utils/auth';

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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                同事登录 / 切换工作账号
              </h2>
              <p className="text-xs text-slate-500">
                独立账号登录后仅显示您个人专属的私有房客源
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

        {/* Quick Account Fill Pills */}
        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100/70 text-xs">
          <div className="flex items-center gap-1 font-semibold text-indigo-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>快捷测试账号（点击一键填入，默认密码123456）：</span>
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

        {/* Login Form */}
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
        </form>
      </div>
    </div>
  );
};
