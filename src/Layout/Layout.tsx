import { LangToggle } from '@/components/LangToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { logout } from '@/store/authSlice';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Bell,
  ChevronDown,
  Folder,
  LayoutDashboard,
  List,
  LogOut,
  Search,
  ShoppingCart,
  Tag,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/orders',    icon: List,            key: 'nav.orders' },
  { to: '/products',  icon: Tag,             key: 'nav.products' },
  { to: '/other',     icon: Folder,          key: 'nav.settings' },
  { to: '/users',     icon: Users,           key: null, label: 'Users' },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { profile } = useProfile();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.userName || 'Admin'
    : 'Admin';

  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <SidebarProvider
      defaultOpen
      style={{ '--sidebar-width': '13.5rem', '--sidebar-width-icon': '3.25rem' } as React.CSSProperties}
      className="h-screen overflow-hidden"
    >
      {/* ── SIDEBAR ── */}
      <Sidebar collapsible="icon" className="border-r-0 bg-[#1a202c] [&>[data-slot=sidebar]]:bg-[#1a202c]">

        {/* Logo */}
        <SidebarHeader className="h-14 px-3 border-b border-white/[0.06]">
          <div className="flex h-full items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-500/15">
              <ShoppingCart size={14} className="text-indigo-400" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white truncate group-data-[collapsible=icon]:hidden">
              fast<span className="text-indigo-400">cart</span>
            </span>
          </div>
        </SidebarHeader>

        {/* Nav */}
        <SidebarContent className="px-2 py-2.5">
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {NAV_ITEMS.map(({ to, icon: Icon, key, label }) => {
                  const itemLabel = key ? t(key) : (label as string);
                  return (
                    <SidebarMenuItem key={to}>
                      <NavLink to={to} className="w-full">
                        {({ isActive }) => (
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={itemLabel}
                            size="default"
                            className={cn(
                              'rounded-lg [&_svg]:size-4',
                              isActive
                                ? 'bg-white/10 text-white hover:bg-white/12 hover:text-white'
                                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200'
                            )}
                          >
                            <Icon strokeWidth={1.75} />
                            <span className="text-[13px] font-medium">{itemLabel}</span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Logout */}
        <SidebarFooter className="px-2 py-2.5 border-t border-white/[0.06]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={t('nav.logout')}
                onClick={handleLogout}
                className="rounded-lg [&_svg]:size-4 text-zinc-500 hover:bg-white/[0.06] hover:text-red-400"
              >
                <LogOut strokeWidth={1.75} />
                <span className="text-[13px] font-medium">{t('nav.logout')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* ── MAIN AREA ── */}
      <SidebarInset className="flex flex-col h-screen overflow-hidden bg-gray-50/50 dark:bg-zinc-950">

        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-2.5">
            <SidebarTrigger className="h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors" />
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search..."
                className="h-8 w-52 rounded-md border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <LangToggle />
            <ThemeToggle />

            <button className="relative rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-900" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-0.5 pl-0.5 pr-2 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
              >
                {profile?.imageUrl ? (
                  <img src={profile.imageUrl} alt={displayName} className="h-6.5 w-6.5 rounded-full object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {initials}
                  </div>
                )}
                <span className="hidden sm:block text-[13px] font-medium text-gray-900 dark:text-white leading-none">{displayName}</span>
                <ChevronDown size={11} className="text-gray-400" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-md dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                    <div className="px-3.5 py-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5 truncate">{profile?.email || ''}</p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-zinc-800" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3.5 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} strokeWidth={2} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
