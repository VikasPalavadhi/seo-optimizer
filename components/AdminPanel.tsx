
import React, { useState, useEffect } from 'react';
import { USERS_CONFIG, UserConfig } from '../userConfig';
import { BRAND_PROFILES } from '../constants';

interface AdminPanelProps {
  currentUser: string;
  onBack: () => void;
}

const STORAGE_KEY = 'seo_tool_users_override';

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onBack }) => {
  const [users, setUsers] = useState<UserConfig[]>([]);
  const [editingUser, setEditingUser] = useState<UserConfig | null>(null);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load users from localStorage or default config
  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEY);
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch {
        setUsers([...USERS_CONFIG]);
      }
    } else {
      setUsers([...USERS_CONFIG]);
    }
  }, []);

  const getEntityNames = (entityIds: string[]): string[] => {
    return entityIds.map(id => {
      const profile = BRAND_PROFILES.find(p => p.id === id);
      return profile?.name || id;
    });
  };

  const handleSaveUser = (updatedUser: UserConfig) => {
    const updatedUsers = users.map(u =>
      u.username.toLowerCase() === updatedUser.username.toLowerCase() ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
    setEditingUser(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const toggleEntityAccess = (entityId: string) => {
    if (!editingUser) return;
    const hasEntity = editingUser.entities.includes(entityId);
    const newEntities = hasEntity
      ? editingUser.entities.filter(e => e !== entityId)
      : [...editingUser.entities, entityId];
    setEditingUser({ ...editingUser, entities: newEntities });
  };

  const toggleAdminStatus = () => {
    if (!editingUser) return;
    setEditingUser({ ...editingUser, isAdmin: !editingUser.isAdmin });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 sm:p-3 hover:bg-white rounded-xl transition-all text-slate-600 active:scale-90"
              title="Back to App"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Admin <span className="text-indigo-600">Panel</span>
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage users and entity access</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-lg animate-in fade-in">
                Changes saved
              </span>
            )}
            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">{currentUser.charAt(0).toUpperCase()}</span>
              </div>
              <span className="font-semibold text-slate-700 text-sm">{currentUser}</span>
            </div>
          </div>
        </header>

        {/* Users Table */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">User Management</h2>
            <p className="text-sm text-slate-500 mt-1">Click Edit to modify user access permissions</p>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Password</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Entity Access</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-bold text-slate-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-600">
                          {showPassword === user.username ? user.password : '••••••••••••'}
                        </span>
                        <button
                          onClick={() => setShowPassword(showPassword === user.username ? null : user.username)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {showPassword === user.username ? (
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {getEntityNames(user.entities).map((entity, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg"
                          >
                            {entity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        user.isAdmin
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setEditingUser({ ...user })}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {users.map((user, index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{user.username}</span>
                      <span className={`text-xs font-bold ${user.isAdmin ? 'text-purple-600' : 'text-slate-500'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingUser({ ...user })}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                  >
                    Edit
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entity Access</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {getEntityNames(user.entities).map((entity, i) => (
                      <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entity Overview */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Available Entities</h2>
            <p className="text-sm text-slate-500 mt-1">Brand profiles available for SEO optimization</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BRAND_PROFILES.map((profile) => (
                <div
                  key={profile.id}
                  className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                      style={{ backgroundColor: profile.primaryColor }}
                    >
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{profile.name}</h3>
                      <p className="text-xs text-slate-500">{profile.id}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 truncate">{profile.domain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Changes Are Saved Locally</p>
              <p className="text-xs text-emerald-700 mt-1">
                User access modifications are stored in your browser. Changes will persist across sessions on this device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">{editingUser.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Edit User</h3>
                    <p className="text-sm text-slate-500 font-medium">{editingUser.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Admin Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-slate-900">Admin Access</p>
                  <p className="text-xs text-slate-500">Can access /admin panel</p>
                </div>
                <button
                  onClick={toggleAdminStatus}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    editingUser.isAdmin ? 'bg-purple-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    editingUser.isAdmin ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Entity Access */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-700">Entity Access</p>
                <div className="grid grid-cols-1 gap-2">
                  {BRAND_PROFILES.map((profile) => {
                    const hasAccess = editingUser.entities.includes(profile.id);
                    return (
                      <button
                        key={profile.id}
                        onClick={() => toggleEntityAccess(profile.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                          hasAccess
                            ? 'border-indigo-400 bg-indigo-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow"
                            style={{ backgroundColor: profile.primaryColor }}
                          >
                            {profile.name.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{profile.name}</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          hasAccess ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                        }`}>
                          {hasAccess && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveUser(editingUser)}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
