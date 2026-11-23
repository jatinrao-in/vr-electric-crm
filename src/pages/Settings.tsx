import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  UserPlus, 
  Save, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ROLE_LABELS } from '../lib/constants';
import { createTeamMemberSecondary } from '../lib/teamAuth';

export const Settings: React.FC = () => {
  const { settings, updateSettings, users, updateUserStatus, updateUserRole } = useCRM();
  const { currentUser } = useAuth();

  const [scooterModels, setScooterModels] = useState<string[]>(settings.scooterModels);
  const [budgetRanges, setBudgetRanges] = useState<string[]>(settings.budgetRanges);
  const [purposes, setPurposes] = useState<string[]>(settings.purposes);
  const [callOutcomes, setCallOutcomes] = useState<string[]>(settings.callOutcomes);

  const [newModel, setNewModel] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [newPurpose, setNewPurpose] = useState('');
  const [newOutcome, setNewOutcome] = useState('');

  // Create Team Member State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('salesman');
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [createUserError, setCreateUserError] = useState<string | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Guard: Exclusive master_admin (info.raojatin@gmail.com) only
  if (currentUser?.email?.toLowerCase() !== 'info.raojatin@gmail.com') {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-red-200 text-red-600 font-bold text-sm">
        Access Denied. Only the Master Admin (info.raojatin@gmail.com) can manage staff accounts and master configurations.
      </div>
    );
  }

  const handleSaveSettings = async () => {
    await updateSettings({
      scooterModels,
      budgetRanges,
      purposes,
      callOutcomes,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateUserError(null);

    if (!userName.trim() || !userEmail.trim() || !userPassword.trim()) {
      setCreateUserError('Name, Email, and Password are required.');
      return;
    }

    if (userPassword.length < 6) {
      setCreateUserError('Password must be at least 6 characters.');
      return;
    }

    if ((userRole as string) === 'master_admin' || (userRole as string) === 'super_admin') {
      setCreateUserError('Cannot create another Master Admin. Only info.raojatin@gmail.com is permitted as Master Admin.');
      return;
    }

    setCreateUserLoading(true);

    const res = await createTeamMemberSecondary({
      name: userName.trim(),
      email: userEmail.trim(),
      password: userPassword,
      phone: userPhone.trim(),
      role: userRole,
    });

    setCreateUserLoading(false);

    if (res.success) {
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserPhone('');
      setUserRole('salesman');
      setIsAddUserOpen(false);
    } else {
      setCreateUserError(res.error || 'Failed to create user account.');
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#0A3D91]" /> Team & Master Settings
        </h1>

        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 text-[#1B662C] text-xs font-bold rounded-lg flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-[#1B662C]" />
          <span>Master configuration saved to Cloud Firestore!</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. MASTER ADMIN USER PROVISIONING */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-subtle overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Authorized Team Members ({users.length})
            </span>
            <span className="text-[11px] text-slate-400">
              Provisioned staff logins with strict role gates
            </span>
          </div>

          <button
            onClick={() => setIsAddUserOpen(true)}
            className="px-3 py-1.5 bg-[#0A3D91] hover:bg-[#062463] text-white text-xs font-bold rounded-lg min-h-[38px] flex items-center gap-1.5 shadow-subtle"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Team Member</span>
          </button>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {users.map((u) => {
            const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.salesman;
            return (
              <div key={u.uid} className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs block">{u.name}</span>
                    <span className="text-[11px] text-slate-400 tabular-nums">{u.email}</span>
                  </div>
                  <span 
                    className="text-[10px] font-bold px-2 py-0.5 rounded border"
                    style={{ backgroundColor: roleInfo.badgeBg, color: roleInfo.color, borderColor: roleInfo.border }}
                  >
                    {roleInfo.title}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">{u.phone ||'No phone'}</span>
                  {u.email.toLowerCase() !== 'info.raojatin@gmail.com' ? (
                    <button
                      onClick={() => updateUserStatus(u.uid, !u.isActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold min-h-[44px] flex items-center ${
                        u.isActive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-[#1B662C]'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#0A3D91] font-bold">Master Admin</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const roleInfo = ROLE_LABELS[u.role] || ROLE_LABELS.salesman;
                return (
                  <tr key={u.uid} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{u.email}</td>
                    <td className="px-4 py-3 text-slate-500 tabular-nums">{u.phone ||'—'}</td>
                    <td className="px-4 py-3">
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold border"
                        style={{ backgroundColor: roleInfo.badgeBg, color: roleInfo.color, borderColor: roleInfo.border }}
                      >
                        {roleInfo.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-50 text-[#1B662C]' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.email.toLowerCase() !== 'info.raojatin@gmail.com' ? (
                        <button
                          onClick={() => updateUserStatus(u.uid, !u.isActive)}
                          className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-red-600 transition-colors"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#0A3D91] font-bold">Master</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. MASTER DROPDOWNS CONFIGURATION */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Models */}
        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Scooter Models</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Model name..."
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border rounded-lg min-h-[44px]"
            />
            <button
              onClick={() => {
                if (newModel.trim()) {
                  setScooterModels([...scooterModels, newModel.trim()]);
                  setNewModel('');
                }
              }}
              className="px-3 bg-[#0A3D91] text-white text-xs font-bold rounded-lg min-h-[44px]"
            >
              Add
            </button>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {scooterModels.map((m, idx) => (
              <div key={idx} className="flex justify-between p-2 rounded bg-slate-50 text-xs">
                <span>{m}</span>
                <button onClick={() => setScooterModels(scooterModels.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets */}
        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Budget Ranges</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Budget range..."
              value={newBudget}
              onChange={(e) => setNewBudget(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border rounded-lg min-h-[44px]"
            />
            <button
              onClick={() => {
                if (newBudget.trim()) {
                  setBudgetRanges([...budgetRanges, newBudget.trim()]);
                  setNewBudget('');
                }
              }}
              className="px-3 bg-[#0A3D91] text-white text-xs font-bold rounded-lg min-h-[44px]"
            >
              Add
            </button>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {budgetRanges.map((b, idx) => (
              <div key={idx} className="flex justify-between p-2 rounded bg-slate-50 text-xs">
                <span>{b}</span>
                <button onClick={() => setBudgetRanges(budgetRanges.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CREATE TEAM MEMBER MODAL (Secondary Firebase App) */}
      {/* ============================================================ */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddUserOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-4 sm:p-6 z-10 space-y-3.5 animate-slide-up sm:animate-in shadow-sheet sm:shadow-large">
            <div className="border-b pb-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Create Team Member</h3>
              <p className="text-[11px] text-slate-400">Created via secondary Auth without logging you out</p>
            </div>

            {createUserError && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createUserError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@vrelectric.in"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Password (min 6 chars) *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg min-h-[44px] tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Permission Gate *</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border rounded-lg min-h-[44px] font-semibold"
                >
                  <option value="salesman">Sales Executive (Scoped to own leads & calls)</option>
                  <option value="manager">Operations Manager (Lead ops & assignment)</option>
                  <option value="owner">Showroom Owner (Sales & walk-ins entry + overview)</option>
                  <option value="ads_manager">Meta Ads Specialist (Ads tracker)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsAddUserOpen(false)} 
                  className="px-3.5 py-2 border rounded-lg min-h-[44px] font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createUserLoading}
                  className="px-4 py-2 bg-[#0A3D91] hover:bg-[#062463] text-white font-bold rounded-lg min-h-[44px] shadow-subtle disabled:opacity-50"
                >
                  {createUserLoading ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
