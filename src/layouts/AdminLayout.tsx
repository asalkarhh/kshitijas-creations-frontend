import {
  ExternalLink,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Tags,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { BrandMark } from '../components/layout/BrandMark';
import { useAuth } from '../store/auth-context';

const navItems = [
  { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Categories', to: '/admin/categories', icon: Tags, end: false },
  { name: 'Products', to: '/admin/products', icon: Package, end: false },
  { name: 'Banners', to: '/admin/banners', icon: ImageIcon, end: false },
  { name: 'Orders', to: '/admin/orders', icon: ShoppingCart, end: false },
];

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-beige bg-surface/95 backdrop-blur shadow-xs">
        <div className="site-container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="grid size-10 place-items-center rounded-full text-muted hover:bg-rose/20 hover:text-maroon lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
            >
              {mobileMenuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <BrandMark />
              <span className="hidden sm:inline-block rounded-full bg-maroon/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-maroon">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-ink">{admin?.name || 'Administrator'}</p>
              <p className="text-[0.7rem] text-muted">{admin?.email || 'admin@kshitijascreations.com'}</p>
            </div>
            <Link
              className="button-secondary hidden md:inline-flex items-center gap-1.5 py-1.5 px-3 text-xs"
              target="_blank"
              to="/"
            >
              <span>View Website</span>
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </Link>
            <button
              aria-label="Log out of admin session"
              className="inline-flex items-center gap-1.5 rounded-full border border-maroon/20 bg-rose/10 px-3 py-1.5 text-xs font-semibold text-maroon hover:bg-rose/30 transition-colors"
              onClick={logout}
              type="button"
            >
              <LogOut aria-hidden="true" className="size-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="site-container flex-1 py-8 grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block rounded-3xl border border-beige bg-surface p-5 shadow-soft sticky top-24">
          <nav aria-label="Admin desktop navigation" className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-maroon text-white shadow-sm'
                        : 'text-ink hover:bg-rose/20 hover:text-maroon'
                    }`
                  }
                  end={item.end}
                  key={item.to}
                  to={item.to}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <div className="pt-4 border-t border-beige mt-4">
              <Link
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted hover:bg-rose/20 hover:text-maroon transition-colors"
                target="_blank"
                to="/"
              >
                <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
                <span>View Public Store</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              aria-label="Admin mobile navigation"
              aria-modal="true"
              className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-surface p-6 shadow-xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              <div>
                <div className="flex items-center justify-between border-b border-beige pb-4">
                  <div className="flex items-center gap-2">
                    <BrandMark />
                    <span className="rounded-full bg-maroon/10 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-maroon">
                      Admin
                    </span>
                  </div>
                  <button
                    aria-label="Close mobile navigation"
                    className="grid size-9 place-items-center rounded-full text-muted hover:bg-rose/20"
                    onClick={() => setMobileMenuOpen(false)}
                    type="button"
                  >
                    <X aria-hidden="true" className="size-5" />
                  </button>
                </div>

                <div className="py-4 border-b border-beige">
                  <p className="text-xs font-semibold text-ink">{admin?.name || 'Administrator'}</p>
                  <p className="text-[0.7rem] text-muted">{admin?.email}</p>
                </div>

                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                            isActive
                              ? 'bg-maroon text-white'
                              : 'text-ink hover:bg-rose/20 hover:text-maroon'
                          }`
                        }
                        end={item.end}
                        key={item.to}
                        to={item.to}
                      >
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                  <Link
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted hover:bg-rose/20 hover:text-maroon"
                    target="_blank"
                    to="/"
                  >
                    <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
                    <span>View Public Store</span>
                  </Link>
                </nav>
              </div>

              <button
                className="button-secondary w-full justify-center text-sm mt-6"
                onClick={logout}
                type="button"
              >
                <LogOut aria-hidden="true" className="size-4" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
