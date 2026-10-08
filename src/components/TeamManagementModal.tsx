import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Key,
  Trash2,
  Shield,
  Check,
  AlertCircle,
  Lock,
  Phone,
} from 'lucide-react';
import { AppUser } from '../types';
import {
  getTeamUsers,
  addColleague,
  deleteColleague,
  changePassword,
} from '../utils/auth';

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  onUsersUpdated: () => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<AppUser[]>(() => getTeamUsers());
  const [isAdding, setIsAdding] = useState(false);

  // Form states for new colleague
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('123456');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'agent'>('agent');
  const [formError, setFormError] = useState<string | null>(null);

  // Password edit state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPassVal, setEditPassVal] = useState('');

  if (!isOpen) return null;

  const refreshList = () => {
    const latest = getTeamUsers();
    setUsers(latest);
    onUsersUpdated();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) {
      setFormError('请填写姓名、登录账号和初始密码');
      return;
    }

    const res = addColleague({
      name: newName.trim(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      phone: newPhone.trim(),
      role: newRole,
    });

    if (res.success) {
      setNewName('');
      setNewUsername('');
      setNewPassword('123456');
      setNewPhone('');
      setFormError(null);
      setIsAdding(false);
      refreshList();
    } else {
      setFormError(res.message || '添加失败');
    }
  };

  const handleDelete = (userId: string, name: string) => {
    if (confirm(`确定要移除同事账号【${name}】吗？`)) {
      deleteColleague(userId);
      refreshList();
    }
  };

  const handleSavePassword = (userId: string) => {
    if (!editPassVal.trim()) return;
    changePassword(userId, editPassVal.trim());
    setEditingUserId(null);
    setEditPassVal('');
    refreshList();
    alert('密码修改成功！');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col border border-slate-200 overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                门店团队成员与账号管理
              </h2>
              <p className="text-xs text-slate-500">
                为每位同事创建独立账号密码，每个人只能查阅与管理自己录入的房客源
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

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          {/* Privilege explanation banner */}
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-xl flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-indigo-900">
                数据隔离保护机制说明
              </div>
              <p className="text-indigo-700 leading-relaxed text-[11px]">
                1. <strong>普通经纪人（同事）</strong>：登录后房源库和客源库仅展示自己录入的内容，充分保护私有客户隐私与成交归属。<br />
                2. <strong>店长（超级管理员）</strong>：拥有全盘视角，可在顶部随时切换「查看全店所有房源」或「仅看自己」。
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-sm">
              团队成员列表 ({users.length}人)
            </span>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAdding ? '收起表单' : '➕ 添加新同事账号'}</span>
            </button>
          </div>

          {/* Add Colleague Form */}
          {isAdding && (
            <form
              onSubmit={handleAdd}
              className="p-4 bg-slate-50 border border-indigo-200 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2"
            >
              <div className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>填写新同事账号信息</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    同事姓名 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：张经纪 / 小陈"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    登录账号 (用户名) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="例如：zhangsan / 13800138000"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    初始密码 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="默认 123456"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    联系电话 (选填)
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="手机号"
                    className="w-full p-2 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-1.5 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="pt-1 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors cursor-pointer text-xs"
                >
                  确认创建账号
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer text-xs"
                >
                  取消
                </button>
              </div>
            </form>
          )}

          {/* Members Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">姓名 / 称呼</th>
                  <th className="py-2.5 px-3">登录账号</th>
                  <th className="py-2.5 px-3">角色权限</th>
                  <th className="py-2.5 px-3">手机号</th>
                  <th className="py-2.5 px-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isEditingPass = editingUserId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                              当前自己
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 font-medium">
                        {u.username}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role === 'admin' ? '👑 店长管理员' : '💼 经纪人'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {u.phone || '—'}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isEditingPass ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                placeholder="输入新密码"
                                value={editPassVal}
                                onChange={(e) => setEditPassVal(e.target.value)}
                                className="w-24 p-1 rounded border border-indigo-300 font-mono text-xs"
                              />
                              <button
                                onClick={() => handleSavePassword(u.id)}
                                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                title="保存"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingUserId(null)}
                                className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                title="取消"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUserId(u.id);
                                setEditPassVal(u.password || '');
                              }}
                              className="text-indigo-600 hover:text-indigo-800 font-medium text-[11px] hover:underline cursor-pointer"
                            >
                              改密
                            </button>
                          )}

                          {u.id !== 'user-admin' && (
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 cursor-pointer"
                              title="移除此账号"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
