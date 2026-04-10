import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/common/index';
import { MdSearch, MdBlock, MdCheckCircle } from 'react-icons/md';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await api.get('/admin/users');
      setUsers(r.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleBlock = async (user) => {
    setUpdating(user._id);
    try {
      await api.put(`/admin/users/${user._id}`, { isBlocked: !user.isBlocked });
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked');
      setUsers((prev) =>
        prev.map((u) => u._id === user._id ? { ...u, isBlocked: !u.isBlocked } : u)
      );
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const handleRoleChange = async (userId, role) => {
    setUpdating(userId);
    try {
      await api.put(`/admin/users/${userId}`, { role });
      toast.success('Role updated');
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-primary">
          Users <span className="text-muted text-lg font-sans font-normal">({users.length})</span>
        </h1>
        {/* Search */}
        <div className="relative w-64">
          <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="input pl-9 py-2 text-sm"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-alt">
              <tr>
                {['User','Email','Role','Status','Joined','Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center"><Spinner /></td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">No users found</td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-surface-alt/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-primary">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{user.email}</td>
                    <td className="px-5 py-3.5">
                      {updating === user._id ? (
                        <Spinner size="sm" />
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-accent"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`badge text-xs ${user.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted text-xs">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleBlock(user)}
                        disabled={updating === user._id}
                        className={`btn-ghost p-1.5 text-sm ${user.isBlocked ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                        title={user.isBlocked ? 'Unblock user' : 'Block user'}
                      >
                        {user.isBlocked ? <MdCheckCircle size={18} /> : <MdBlock size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
