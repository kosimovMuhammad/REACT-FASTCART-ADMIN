import { LangToggle } from '@/components/LangToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { logout } from '@/store/authSlice';
import {
  Bell,
  ChevronDown,
  Folder,
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Tag,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/orders', label: t('nav.orders'), icon: List, badge: 16 },
    { to: '/products', label: t('nav.products'), icon: Tag },
    { to: '/other', label: t('nav.settings'), icon: Folder },
  ];

  const { profile } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
      profile.userName ||
      'Admin'
    : 'Admin';

  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex', 'h-screen', 'w-full', 'bg-[#161b26]', 'text-gray-900', 'dark:bg-zinc-950', 'dark:text-gray-100', 'overflow-hidden', 'font-sans')}>
      {sidebarOpen && (
        <div
          className={cn('fixed', 'inset-0', 'z-40', 'bg-black/50', 'backdrop-blur-sm', 'lg:hidden')}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#1a202c] border-r border-white/5 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className={cn('flex', 'h-16', 'items-center', 'justify-between', 'px-6', 'border-b', 'border-white/5')}>
          <div className={cn('flex', 'items-center', 'gap-2', 'text-indigo-400')}>
            <ShoppingCart size={22} />
            <span className={cn('text-xl', 'font-bold', 'tracking-tight', 'text-white')}>
              fast<span className="text-indigo-400">cart</span>
            </span>
          </div>
          <button
            className={cn('rounded-md', 'p-1', 'hover:bg-white/10', 'lg:hidden', 'text-gray-400')}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className={cn('flex-1', 'overflow-y-auto', 'p-4', 'space-y-2')}>
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-[10px] px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#586380] shadow-lg shadow-black/10' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              {({ isActive }) => (
                <>
                  <div className={cn('flex', 'items-center', 'gap-4')}>
                    <span className={isActive ? 'text-[#586380]' : 'text-gray-400'}>
                      <Icon size={20} className="stroke-[2]" />
                    </span>
                    <span className={isActive ? 'font-medium' : ''}>{label}</span>
                  </div>
                  
                  {badge && (
                    <span
                      className={`flex h-[22px] min-w-[28px] items-center justify-center rounded-full px-1.5 text-xs font-bold tracking-tight ${
                        isActive
                          ? 'bg-[#121620] text-white' 
                          : 'bg-[#0f1422] text-gray-400'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cn('border-t', 'border-white/5', 'p-4')}>
          <button
            className={cn('flex', 'w-full', 'items-center', 'gap-3', 'rounded-lg', 'px-4', 'py-3', 'text-sm', 'font-medium', 'text-gray-400', 'hover:bg-white/5', 'hover:text-red-400', 'transition-colors')}
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      <div className={cn('flex', 'flex-1', 'flex-col', 'min-w-0', 'overflow-hidden', 'bg-gray-50', 'dark:bg-zinc-900')}>
        <header className={cn('flex', 'h-16', 'shrink-0', 'items-center', 'justify-between', 'border-b', 'border-gray-200', 'bg-white', 'px-4', 'sm:px-6', 'dark:border-zinc-800', 'dark:bg-zinc-900', 'shadow-sm', 'z-10')}>
          <div className={cn('flex', 'items-center', 'gap-4')}>
            <button
              className={cn('rounded-md', 'p-2', 'text-gray-500', 'hover:bg-gray-100', 'dark:text-zinc-400', 'dark:hover:bg-zinc-800', 'lg:hidden')}
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className={cn('hidden', 'sm:flex', 'items-center', 'relative')}>
              <Search className={cn('absolute', 'left-3', 'top-1/2', '-translate-y-1/2', 'h-4', 'w-4', 'text-gray-400')} />
              <input
                type="text"
                placeholder="Search..."
                className={cn('h-9', 'w-64', 'rounded-md', 'border', 'border-gray-300', 'bg-gray-50', 'pl-9', 'pr-4', 'text-sm', 'outline-none', 'transition-all', 'focus:border-indigo-500', 'focus:ring-1', 'focus:ring-indigo-500', 'dark:border-zinc-700', 'dark:bg-zinc-950', 'dark:text-white', 'dark:focus:border-indigo-400', 'dark:focus:ring-indigo-400')}
              />
            </div>
          </div>

          <div className={cn('flex', 'items-center', 'gap-2', 'sm:gap-4')}>
            <LangToggle />
            <ThemeToggle />
            
            <button className={cn('relative', 'rounded-md', 'p-2', 'text-gray-500', 'hover:bg-gray-100', 'dark:text-zinc-400', 'dark:hover:bg-zinc-800', 'transition-colors')}>
              <Bell size={20} />
              <span className={cn('absolute', 'right-2', 'top-2', 'h-2', 'w-2', 'rounded-full', 'bg-red-500', 'ring-2', 'ring-white', 'dark:ring-zinc-900')} />
            </button>

            <div className={cn('relative', 'ml-2')}>
              <button
                className={cn('flex', 'items-center', 'gap-2', 'rounded-full', 'border', 'border-gray-200', 'bg-white', 'p-1', 'pr-2', 'hover:bg-gray-50', 'dark:border-zinc-700', 'dark:bg-zinc-900', 'dark:hover:bg-zinc-800', 'transition-all', 'focus:outline-none', 'focus:ring-2', 'focus:ring-indigo-500')}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                {profile?.imageUrl ? (
                  <img
                    src={profile.imageUrl}
                    alt={displayName}
                    className={cn('h-8', 'w-8', 'rounded-full', 'object-cover')}
                  />
                ) : (
                  <div className={cn('flex', 'h-8', 'w-8', 'items-center', 'justify-center', 'rounded-full', 'bg-indigo-100', 'text-sm', 'font-medium', 'text-indigo-700', 'dark:bg-indigo-900', 'dark:text-indigo-300')}>
                    {initials}
                  </div>
                )}
                <div className={cn('hidden', 'text-left', 'sm:block')}>
                  <p className={cn('text-sm', 'font-medium', 'leading-none', 'text-gray-900', 'dark:text-white')}>{displayName}</p>
                </div>
                <ChevronDown size={14} className={cn('text-gray-500', 'dark:text-zinc-400', 'ml-1')} />
              </button>

              {profileMenuOpen && (
                <>
                  <div className={cn('fixed', 'inset-0', 'z-10')} onClick={() => setProfileMenuOpen(false)} />
                  <div className={cn('absolute', 'right-0', 'top-full', 'z-20', 'mt-2', 'w-56', 'origin-top-right', 'rounded-md', 'border', 'border-gray-200', 'bg-white', 'shadow-lg', 'ring-1', 'ring-black/5', 'dark:border-zinc-800', 'dark:bg-zinc-900')}>
                    <div className={cn('px-4', 'py-3')}>
                      <p className={cn('text-sm', 'font-medium', 'text-gray-900', 'dark:text-white')}>{displayName}</p>
                      <p className={cn('truncate', 'text-xs', 'text-gray-500', 'dark:text-zinc-400', 'mt-1')}>{profile?.email || 'admin@fastcart.com'}</p>
                    </div>
                    <div className={cn('border-t', 'border-gray-100', 'dark:border-zinc-800')} />
                    <button
                      className={cn('flex', 'w-full', 'items-center', 'gap-2', 'px-4', 'py-2', 'text-sm', 'text-red-600', 'hover:bg-red-50', 'dark:text-red-400', 'dark:hover:bg-red-500/10')}
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className={cn('flex-1', 'overflow-y-auto', 'bg-gray-50/50', 'p-4', 'sm:p-6', 'dark:bg-zinc-950/50')}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}