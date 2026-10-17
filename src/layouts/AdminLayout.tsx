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
  Sparkles,
} from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { adminApi } from '../api/admin';
import { BrandMark } from '../components/layout/BrandMark';
import { PagePreloader } from '../components/common/PagePreloader';
import { useAuth } from '../store/auth-context';
import brandLogo from '../assets/kshitija creation.jpg';
import { registerAdminPush } from '../push/adminPush';

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
    registerAdminPush().catch(() => undefined);
  }, []);

  const { data: unviewedData } = useQuery({
    queryKey: ['admin', 'unviewed-orders-count'],
    queryFn: adminApi.getUnviewedOrdersCount,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const unviewedCount = unviewedData?.count ?? 0;

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
    <div className="min-h-screen bg-canvas flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-beige/80 bg-surface/90 backdrop-blur-xl shadow-xs">
        <div className="site-container flex h-18 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="grid size-10 place-items-center rounded-full text-muted hover:bg-rose/30 hover:text-maroon lg:hidden"
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
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-maroon/10 border border-maroon/20 px-3 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-maroon">
                <Sparkles className="size-2.5 text-gold" /> Admin Atelier
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-ink">{admin?.name || 'Administrator'}</p>
              <p className="text-[0.68rem] text-muted font-mono">{admin?.email || 'admin@kshitijascreations.local'}</p>
            </div>
            <Link
              className="inline-flex items-center gap-1.5 rounded-full border border-beige/80 bg-canvas/70 px-3.5 py-1.5 text-xs font-bold text-ink hover:border-gold hover:text-maroon transition-all shadow-xs"
              target="_blank"
              to="/"
            >
              <span>View Store</span>
              <ExternalLink aria-hidden="true" className="size-3 text-muted" />
            </Link>
            <button
              aria-label="Log out of admin session"
              className="inline-flex items-center gap-1.5 rounded-full border border-maroon/20 bg-rose/20 px-3.5 py-1.5 text-xs font-bold text-maroon hover:bg-maroon hover:text-white transition-all shadow-xs"
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
        <aside className="hidden lg:block rounded-4xl border border-beige/80 bg-surface/90 p-5 shadow-soft sticky top-26">
          <nav aria-label="Admin desktop navigation" className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  aria-label={item.name}
                  className={({ isActive }) =>
                    `flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive
                        ? 'bg-maroon text-white shadow-sm'
                        : 'text-ink/80 hover:bg-rose/40 hover:text-maroon'
                    }`
                  }
                  end={item.end}
                  key={item.to}
                  to={item.to}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon aria-hidden="true" className="size-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'Orders' && unviewedCount > 0 && (
                        <span
                          aria-hidden="true"
                          className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[0.68rem] font-bold tracking-normal shadow-xs transition-colors ${
                            isActive
                              ? 'bg-white text-maroon'
                              : 'bg-[#D93848] text-white'
                          }`}
                        >
                          {unviewedCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
            <div className="pt-4 border-t border-beige/70 mt-4">
              <Link
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted hover:bg-rose/30 hover:text-maroon transition-colors"
                target="_blank"
                to="/"
              >
                <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
                <span>Storefront</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              aria-label="Admin mobile navigation"
              aria-modal="true"
              className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-surface p-6 shadow-2xl flex flex-col justify-between border-r border-beige"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
            >
              <div>
                <div className="flex items-center justify-between border-b border-beige/80 pb-4">
                  <div className="flex items-center gap-2">
                    <BrandMark />
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

                <div className="py-4 border-b border-beige/60">
                  <p className="text-xs font-bold text-ink">{admin?.name || 'Administrator'}</p>
                  <p className="text-[0.68rem] text-muted font-mono">{admin?.email}</p>
                </div>

                <nav className="mt-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        aria-label={item.name}
                        className={({ isActive }) =>
                          `flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                            isActive
                              ? 'bg-maroon text-white'
                              : 'text-ink hover:bg-rose/20 hover:text-maroon'
                          }`
                        }
                        end={item.end}
                        key={item.to}
                        to={item.to}
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-3">
                              <Icon aria-hidden="true" className="size-4 shrink-0" />
                              <span>{item.name}</span>
                            </div>
                            {item.name === 'Orders' && unviewedCount > 0 && (
                              <span
                                aria-hidden="true"
                                className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[0.68rem] font-bold tracking-normal shadow-xs transition-colors ${
                                  isActive
                                    ? 'bg-white text-maroon'
                                    : 'bg-[#D93848] text-white'
                                }`}
                              >
                                {unviewedCount}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>
              </div>

              <button
                className="button-secondary w-full justify-center text-xs font-bold mt-6"
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
          <Suspense
            fallback={
              <PagePreloader
                fullscreen={false}
                label="Loading atelier section"
                themeLine="Opening private Artisan Atelier studio..."
              />
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
