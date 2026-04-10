import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import { Spinner } from '../components/common/index';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);

  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = (e) => {
    e.preventDefault();
    dispatch(updateProfile(profile));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    setChangingPwd(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed successfully');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPwd(false);
    }
  };

  const tabs = ['profile', 'security'];

  return (
    <div className="container-app py-8 animate-fade-in max-w-2xl">
      <h1 className="section-title mb-6">My Account</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 card">
        <div className="w-16 h-16 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-primary text-lg">{user?.name}</p>
          <p className="text-muted text-sm">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-blue-50 text-blue-600'} capitalize`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-all
              ${activeTab === t ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-primary'}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="card p-6 space-y-4">
          <h2 className="font-semibold text-primary">Personal Information</h2>
          <div>
            <label className="text-xs font-medium text-primary/70 block mb-1.5">Full Name</label>
            <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="text-xs font-medium text-primary/70 block mb-1.5">Email</label>
            <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
            <p className="text-xs text-muted mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="text-xs font-medium text-primary/70 block mb-1.5">Phone Number</label>
            <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className="input" placeholder="+91 98765 43210" />
          </div>
          <button type="submit" disabled={loading} className="btn-accent py-2.5 px-6">
            {loading ? <Spinner size="sm" /> : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="card p-6 space-y-4">
          <h2 className="font-semibold text-primary">Change Password</h2>
          {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm New Password']].map(([key, label]) => (
            <div key={key}>
              <label className="text-xs font-medium text-primary/70 block mb-1.5">{label}</label>
              <input type="password" required value={pwdForm[key]}
                onChange={(e) => setPwdForm((p) => ({ ...p, [key]: e.target.value }))}
                className="input" placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={changingPwd} className="btn-accent py-2.5 px-6">
            {changingPwd ? <Spinner size="sm" /> : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
