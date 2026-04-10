import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  MdDashboard, MdInventory, MdShoppingBag,
  MdPeople, MdCategory, MdLogout,
} from 'react-icons/md';

const links = [
  { to: '/admin',            label: 'Dashboard',  Icon: MdDashboard,   end: true },
  { to: '/admin/products',   label: 'Products',   Icon: MdInventory },
  { to: '/admin/orders',     label: 'Orders',     Icon: MdShoppingBag },
  { to: '/admin/users',      label: 'Users',      Icon: MdPeople },
  { to: '/admin/categories', label: 'Categories', Icon: MdCategory },
];

export default function AdminLayout() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-surface-alt overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-primary flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="font-display text-white text-xl font-semibold">ShopLux</h1>
          <p className="text-white/40 text-xs mt-0.5 font-sans">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all
                 ${isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-tight">{user?.name}</p>
              <p className="text-white/40 text-xs">Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-white/10 transition-all"
          >
            <MdLogout size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-8 py-4">
          <h2 className="font-display text-primary text-lg font-semibold">Admin Dashboard</h2>
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
