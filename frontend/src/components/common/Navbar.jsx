import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  MdSearch, MdShoppingBag, MdFavoriteBorder, MdPerson,
  MdMenu, MdClose, MdLogout, MdDashboard, MdKeyboardArrowDown,
} from 'react-icons/md';

const navLinks = [
  { to: '/',     label: 'Home',  end: true },
  { to: '/shop', label: 'Shop' },
];

export default function Navbar() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);
  const cartItems  = useSelector((s) => s.cart.items);
  const cartCount  = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userRef   = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300
          ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-nav' : 'bg-white'}`}
      >
        <div className="container-app">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="font-display text-2xl text-primary font-bold tracking-tight">
              Shop<span className="text-accent">Lux</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-sans font-medium transition-all
                     ${isActive ? 'text-accent bg-accent/5' : 'text-primary/70 hover:text-primary hover:bg-surface-dark'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 100); }}
                className="btn-ghost p-2 rounded-lg"
                aria-label="Search"
              >
                <MdSearch size={22} />
              </button>

              {/* Wishlist */}
              {user && (
                <Link to="/wishlist" className="btn-ghost p-2 rounded-lg" aria-label="Wishlist">
                  <MdFavoriteBorder size={22} />
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="btn-ghost p-2 rounded-lg relative" aria-label="Cart">
                <MdShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-surface-dark transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-primary max-w-[80px] truncate">
                      {user.name}
                    </span>
                    <MdKeyboardArrowDown size={16} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-cardHov border border-black/5 py-1 animate-fade-in">
                      <Link to="/profile"  onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-surface-alt transition-colors"><MdPerson size={16} /> Profile</Link>
                      <Link to="/orders"   onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-surface-alt transition-colors"><MdShoppingBag size={16} /> My Orders</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin"  onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent hover:bg-surface-alt transition-colors"><MdDashboard size={16} /> Admin Panel</Link>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <MdLogout size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-primary ml-1 py-2 px-4 text-sm">
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden btn-ghost p-2 rounded-lg ml-1"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-slide-up">
            <nav className="container-app py-4 flex flex-col gap-1">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'text-accent bg-accent/5' : 'text-primary hover:bg-surface-dark'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <form onSubmit={handleSearch} className="w-full max-w-2xl animate-slide-up">
            <div className="relative">
              <MdSearch size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands…"
                className="w-full pl-12 pr-16 py-4 text-lg rounded-2xl border-0 shadow-cardHov focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-accent py-2 px-4 text-sm">
                Search
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
