import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Loader2, Trash2, Search, Users as UsersIcon,
  AlertCircle, ChevronLeft, ChevronRight,
  Mail, Phone, X, Shield, UserCog, Save,
  Camera, Check, Plus, ShieldOff, RefreshCw, CalendarIcon,
} from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchUsers, deleteUser, clearDeleteError, getUserId,
  getUserById, updateUserProfile, fetchUserRoles,
  addRoleToUser, removeRoleFromUser,
  clearSelectedUser, clearUpdateError, clearRoleActionError,
  type User, type Role,
} from '@/store/usersSlice';
import { getImageUrl } from '@/store/productsSlice';
import DeleteModal from '@/components/modals/DeleteModal';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

/* ─── Avatar ─────────────────────────────────────────────── */
function UserAvatar({ name, imageUrl, size = 'md' }: {
  name: string; imageUrl?: string | null; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const cls = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg', xl: 'w-20 h-20 text-2xl' }[size];
  const src = imageUrl ? getImageUrl(imageUrl) : undefined;
  if (src) return <img src={src} alt={name} className={cn(cls, 'rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0')} />;
  return (
    <div className={cn(cls, 'rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 shrink-0')}>
      {initial}
    </div>
  );
}

/* ─── Pagination ──────────────────────────────────────────── */
function Pagination({ page, totalPages, loading, onPage }: {
  page: number; totalPages: number; loading: boolean; onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages: number[] = [];
  if (totalPages <= 5)         { for (let i = 1; i <= totalPages; i++) pages.push(i); }
  else if (page <= 3)          pages.push(1, 2, 3, 4, 5);
  else if (page >= totalPages - 2) { for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i); }
  else                         { for (let i = page - 2; i <= page + 2; i++) pages.push(i); }
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onPage(page - 1)} disabled={page <= 1 || loading}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={16} />
      </button>
      {pages.map(p => (
        <button key={p} onClick={() => onPage(p)}
          className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-colors',
            p === page ? 'bg-indigo-600 text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800')}>
          {p}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page >= totalPages || loading}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ─── Sidebar ─────────────────────────────────────────────── */
type SidebarTab = 'profile' | 'roles';

function UserSidebar({ onClose, onRetry, userGuid }: { onClose: () => void; onRetry: (id: string) => void; userGuid: string }) {
  const dispatch = useDispatch<AppDispatch>();
  const {
    selectedUser, selectedUserLoading, selectedUserError,
    roles, rolesLoading,
    updateLoading, updateError,
    roleActionLoading, roleActionError,
  } = useSelector((s: RootState) => s.users);

  // Load roles list when sidebar first opens so the Add Role dropdown has options
  useEffect(() => {
    dispatch(fetchUserRoles());
  }, [dispatch]);

  const [tab,          setTab]          = useState<SidebarTab>('profile');
  const [firstName,    setFirstName]    = useState('');
  const [lastName,     setLastName]     = useState('');
  const [email,        setEmail]        = useState('');
  const [phone,        setPhone]        = useState('');
  const [dob,          setDob]          = useState<Date | undefined>(undefined);
  const [calOpen,      setCalOpen]      = useState(false);
  const [imageFile,    setImageFile]    = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [savedOk,      setSavedOk]      = useState(false);
  const [addRoleId,    setAddRoleId]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedUser) return;
    setFirstName(selectedUser.firstName ?? '');
    setLastName(selectedUser.lastName ?? '');
    setEmail(selectedUser.email ?? '');
    setPhone(selectedUser.phoneNumber ?? '');
    const raw = selectedUser.dob ?? '';
    if (raw) {
      const parsed = parseISO(raw);
      setDob(isValid(parsed) ? parsed : undefined);
    } else {
      setDob(undefined);
    }
    setImageFile(null);
    setImagePreview(null);
    setSavedOk(false);
    setAddRoleId('');
    dispatch(clearUpdateError());
    dispatch(clearRoleActionError());
  }, [selectedUser?.id, dispatch]);


  // Always use the GUID from the users list — selectedUser.id is a numeric int, not the GUID
  const userId         = userGuid || (selectedUser ? String(selectedUser.id) : '');
  const displayName    = [selectedUser?.firstName, selectedUser?.lastName].filter(Boolean).join(' ') || selectedUser?.userName || '';
  const currentRoles   = selectedUser?.roles ?? [];
  // Fall back to SYSTEM_ROLES when the server hasn't returned any roles yet
  const effectiveRoles = roles.length > 0 ? roles : SYSTEM_ROLES;
  const availableToAdd = effectiveRoles.filter(r => !currentRoles.some(c => c.toLowerCase() === r.name.toLowerCase()));

  const handleImageChange = (f: File) => { setImageFile(f); setImagePreview(URL.createObjectURL(f)); };

  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    const fd = new FormData();

    if (imageFile) {
      fd.append('Image', imageFile);
    } else if (selectedUser.imageUrl) {
      try {
        const imgUrl = getImageUrl(selectedUser.imageUrl);
        if (imgUrl) {
          const r = await fetch(imgUrl);
          const blob = await r.blob();
          const fname = selectedUser.imageUrl.split('/').pop() ?? 'avatar.jpg';
          fd.append('Image', blob, fname);
        }
      } catch { /* ignore, let backend decide */ }
    }

    fd.append('FirstName',   firstName);
    fd.append('LastName',    lastName);
    fd.append('Email',       email);
    fd.append('PhoneNumber', phone);
    if (dob) fd.append('Dob', format(dob, 'yyyy-MM-dd'));
    const res = await dispatch(updateUserProfile(fd));
    if (updateUserProfile.fulfilled.match(res)) { setSavedOk(true); setTimeout(() => setSavedOk(false), 2500); }
  };

  const handleAddRole = async () => {
    if (!addRoleId || !userId) return;
    const res = await dispatch(addRoleToUser({ UserId: userId, RoleId: addRoleId }));
    if (addRoleToUser.fulfilled.match(res)) setAddRoleId('');
  };

  const handleRemoveRole = (roleName: string) => {
    if (!userId) return;
    // Find the role object to get its ID; fall back to the name if not in list
    const roleObj = roles.find(r => r.name.toLowerCase() === roleName.toLowerCase());
    dispatch(removeRoleFromUser({ UserId: userId, RoleId: roleObj?.id ?? roleName }));
  };

  return (
    <div className="w-80 shrink-0 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">User Detail</span>
        <button onClick={onClose}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Loading */}
      {selectedUserLoading && !selectedUser && (
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
            <span className="text-sm">Loading user...</span>
          </div>
        </div>
      )}

      {/* Error loading user */}
      {selectedUserError && !selectedUser && !selectedUserLoading && (
        <div className="flex flex-1 flex-col items-center justify-center py-12 px-5 gap-4 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Failed to load user</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{selectedUserError}</p>
          </div>
          <button
            onClick={() => onRetry(userId)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Content */}
      {selectedUser && (
        <>
          {/* Avatar block */}
          <div className="relative flex flex-col items-center pt-6 pb-4 px-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            {selectedUserLoading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center z-10 rounded-t-xl">
                <Loader2 size={20} className="animate-spin text-indigo-500" />
              </div>
            )}
            <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
              <UserAvatar name={displayName} imageUrl={imagePreview ?? selectedUser.imageUrl} size="xl" />
              <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera size={20} className="text-white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f); }} />
            </div>
            <p className="mt-3 font-bold text-zinc-900 dark:text-zinc-100 text-[15px] text-center">{displayName}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">@{selectedUser.userName}</p>
            {currentRoles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {currentRoles.map(r => (
                  <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                    <Shield size={9} /> {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800 shrink-0">
            {([['profile', UserCog, 'Profile'], ['roles', Shield, 'Roles']] as const).map(([t, Icon, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px',
                  tab === t
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300')}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">

            {/* ── PROFILE TAB ── */}
            {tab === 'profile' && (
              <div className="p-4 space-y-3">
                {updateError && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={13} className="mt-px shrink-0" /> {updateError}
                  </div>
                )}
                {([
                  ['First Name', firstName, setFirstName],
                  ['Last Name',  lastName,  setLastName],
                  ['Email',      email,     setEmail],
                  ['Phone',      phone,     setPhone],
                ] as [string, string, (v: string) => void][]).map(([label, val, set]) => (
                  <div key={label}>
                    <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">{label}</label>
                    <input type="text" value={val} onChange={(e) => set(e.target.value)}
                      className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all" />
                  </div>
                ))}

                {/* Date of Birth — Calendar picker */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">Date of Birth</label>
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <button type="button"
                        className={cn(
                          'w-full flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 text-left focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all',
                          !dob && 'text-zinc-400 dark:text-zinc-500'
                        )}>
                        <CalendarIcon size={14} className="shrink-0 text-zinc-400" />
                        <span className={dob ? 'text-zinc-900 dark:text-white' : ''}>
                          {dob ? format(dob, 'dd MMMM yyyy') : 'Select date…'}
                        </span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dob}
                        onSelect={(d) => { setDob(d); setCalOpen(false); }}
                        captionLayout="dropdown"
                        startMonth={new Date(1940, 0)}
                        endMonth={new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <button onClick={handleSaveProfile} disabled={updateLoading}
                  className={cn('w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors mt-1',
                    savedOk ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60')}>
                  {updateLoading ? <Loader2 size={14} className="animate-spin" />
                    : savedOk ? <><Check size={14} /> Saved!</>
                    : <><Save size={14} /> Save changes</>}
                </button>
                <div className="pt-2 space-y-1.5 border-t border-zinc-100 dark:border-zinc-800 mt-2">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400"><Mail size={11} /> {selectedUser.email || '—'}</div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400"><Phone size={11} /> {selectedUser.phoneNumber || '—'}</div>
                </div>
              </div>
            )}

            {/* ── ROLES TAB ── */}
            {tab === 'roles' && (
              <div className="p-4 space-y-4">

                {/* Role action error */}
                {roleActionError && (
                  <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-xs text-red-600 dark:text-red-400">
                    <AlertCircle size={13} className="mt-px shrink-0" />
                    <div>
                      <p className="font-semibold mb-0.5">Role operation failed</p>
                      <p>{roleActionError}</p>
                      <button onClick={() => dispatch(clearRoleActionError())}
                        className="mt-1.5 underline text-red-500 hover:text-red-700">Dismiss</button>
                    </div>
                  </div>
                )}

                {/* Current roles */}
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
                    Current Roles <span className="ml-1 text-zinc-300 dark:text-zinc-600 normal-case">({currentRoles.length})</span>
                  </p>
                  {currentRoles.length === 0 ? (
                    <div className="flex flex-col items-center py-5 text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <ShieldOff size={22} className="mb-1.5 opacity-40" />
                      <p className="text-xs">No roles assigned</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {currentRoles.map(role => (
                        <div key={role}
                          className="group flex items-center justify-between px-3 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-colors">
                          <div className="flex items-center gap-2">
                            <Shield size={13} className="text-indigo-500 shrink-0" />
                            <span className="text-[13px] font-semibold text-indigo-700 dark:text-indigo-300">{role}</span>
                          </div>
                          <button onClick={() => handleRemoveRole(role)} disabled={roleActionLoading}
                            title="Remove role"
                            className="p-1 rounded opacity-0 group-hover:opacity-100 text-indigo-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-40">
                            {roleActionLoading ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add role */}
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">Add Role</p>

                  {/* Add role UI */}
                  {rolesLoading && roles.length === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Loader2 size={13} className="animate-spin" /> Loading roles…
                    </div>
                  ) : availableToAdd.length === 0 ? (
                    <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg text-xs text-green-700 dark:text-green-400">
                      <Check size={13} /> All available roles assigned
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <select value={addRoleId} onChange={(e) => setAddRoleId(e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20">
                        <option value="">Select role...</option>
                        {availableToAdd.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      <button onClick={handleAddRole} disabled={!addRoleId || roleActionLoading}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0">
                        {roleActionLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* All system roles overview */}
                {roles.length > 0 && (
                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">All System Roles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {roles.map(r => {
                        const assigned = currentRoles.some(c => c.toLowerCase() === r.name.toLowerCase());
                        return (
                          <span key={r.id} className={cn('px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-colors',
                            assigned
                              ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700')}>
                            {assigned && <Check size={8} className="inline mr-0.5" />}
                            {r.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* Roles that always exist in the system (shown when API can't provide them) */
const SYSTEM_ROLES: Role[] = [
  { id: 'Admin',      name: 'Admin' },
  { id: 'User',       name: 'User' },
  { id: 'SuperAdmin', name: 'SuperAdmin' },
];

/* ─── Role Modal ──────────────────────────────────────────── */
function RoleModal({ user, fallbackRoles, onClose }: {
  user: User;
  fallbackRoles: Role[];
  onClose: () => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { roleActionLoading } = useSelector((s: RootState) => s.users);

  const [profileId,  setProfileId]  = useState<string>(getUserId(user));
  const [userName,   setUserName]   = useState<string>(user.userName);
  const [initRoles,  setInitRoles]  = useState<string[]>(user.roles ?? []);

  // Priority: fetched from API → from users list → hardcoded system roles
  const baseRoles = fallbackRoles.length > 0 ? fallbackRoles : SYSTEM_ROLES;
  const [allRoles,   setAllRoles]   = useState<Role[]>(baseRoles);
  const [selected,   setSelected]   = useState<Set<string>>(
    new Set((user.roles ?? []).map(r => r.toLowerCase()))
  );
  const [loadingInit, setLoadingInit] = useState(true);
  const [saveError,   setSaveError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      let pRoles: string[] = [];

      // Fetch user profile for accurate ID and role list
      const pRes = await dispatch(getUserById(getUserId(user)));
      if (!cancelled && getUserById.fulfilled.match(pRes)) {
        const profile = pRes.payload;
        const listId = getUserId(user);
        // profile.id is a numeric int — only use listId (GUID) or fall back to userName
        setProfileId(listId !== user.userName ? listId : (profile.userName ?? user.userName));
        setUserName(profile.userName ?? user.userName);
        pRoles = profile.roles ?? [];
        setInitRoles(pRoles);
        setSelected(new Set(pRoles.map(r => r.toLowerCase())));

        // Merge profile roles as temporary placeholders (id = name until real list loads)
        setAllRoles(prev => {
          const byName = new Map(prev.map(r => [r.name.toLowerCase(), r]));
          pRoles.forEach(name => {
            const key = name.toLowerCase();
            if (!byName.has(key)) byName.set(key, { id: name, name });
          });
          return Array.from(byName.values());
        });
      }

      // Fetch the authoritative roles list with real GUIDs
      const rRes = await dispatch(fetchUserRoles());
      if (!cancelled && fetchUserRoles.fulfilled.match(rRes) && rRes.payload.length > 0) {
        const rolesList = rRes.payload;

        // Resolve each profile role by BOTH name and ID against the roles list.
        // The API might return GUIDs in profile.roles instead of names — this handles both.
        const resolvedNames = pRoles.map(r => {
          const byId   = rolesList.find(rl => rl.id.toLowerCase()   === r.toLowerCase());
          const byName = rolesList.find(rl => rl.name.toLowerCase() === r.toLowerCase());
          return (byId ?? byName)?.name ?? r;
        });

        setInitRoles(resolvedNames);
        setSelected(new Set(resolvedNames.map(r => r.toLowerCase())));
        setAllRoles(rolesList);
      }

      if (!cancelled) setLoadingInit(false);
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const toggle = (role: Role) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(role.name.toLowerCase()) ? next.delete(role.name.toLowerCase()) : next.add(role.name.toLowerCase());
      return next;
    });
  };

  const handleSave = async () => {
    setSaveError(null);
    const original = new Set(initRoles.map(r => r.toLowerCase()));
    const toAdd    = allRoles.filter(r => selected.has(r.name.toLowerCase()) && !original.has(r.name.toLowerCase()));
    const toRemove = allRoles.filter(r => !selected.has(r.name.toLowerCase()) && original.has(r.name.toLowerCase()));

    for (const role of toAdd) {
      const res = await dispatch(addRoleToUser({ UserId: profileId, RoleId: role.id, UserName: userName }));
      if (addRoleToUser.rejected.match(res)) { setSaveError(res.payload as string); return; }
    }
    for (const role of toRemove) {
      const res = await dispatch(removeRoleFromUser({ UserId: profileId, RoleId: role.id, UserName: userName }));
      if (removeRoleFromUser.rejected.match(res)) { setSaveError(res.payload as string); return; }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Изменить роль</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">{user.userName}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">Выберите роль</p>

        {saveError && (
          <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle size={13} /> {saveError}
          </div>
        )}

        {loadingInit ? (
          <div className="flex items-center justify-center py-8 gap-2 text-zinc-400">
            <Loader2 size={18} className="animate-spin text-indigo-500" />
            <span className="text-sm">Loading roles…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-6">
            {allRoles.map(role => {
              const checked = selected.has(role.name.toLowerCase());
              return (
                <label key={role.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors select-none',
                    checked
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/40 dark:bg-indigo-500/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  )}>
                  <div className={cn(
                    'w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-colors',
                    checked ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300 dark:border-zinc-600'
                  )}>
                    {checked && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <input type="checkbox" className="hidden" checked={checked} onChange={() => toggle(role)} />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{role.name}</span>
                </label>
              );
            })}
            {allRoles.length === 0 && (
              <p className="text-xs text-zinc-400 text-center py-4">No roles available</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
            Отмена
          </button>
          <button onClick={handleSave} disabled={roleActionLoading || loadingInit}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {roleActionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    users, total, loading, error,
    deleteLoading, deleteError,
    roles,
    selectedUser, selectedUserLoading, selectedUserError,
  } = useSelector((s: RootState) => s.users);

  const [search,        setSearch]        = useState('');
  const [page,          setPage]          = useState(1);
  const [toDelete,      setToDelete]      = useState<User | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<User | null>(null);
  const [lastClickedId, setLastClickedId] = useState<string>('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number, q: string) =>
    dispatch(fetchUsers({ UserName: q || undefined, PageNumber: p, PageSize: PAGE_SIZE }));

  useEffect(() => { load(1, ''); }, []);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, val), 400);
  };

  const handlePage = (p: number) => { setPage(p); load(p, search); };

  const handleSelectUser = (user: User) => {
    const id = getUserId(user);
    setLastClickedId(id);
    if (selectedUser && String(selectedUser.id) === id) {
      dispatch(clearSelectedUser());
    } else {
      dispatch(getUserById(id));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const res = await dispatch(deleteUser(toDelete));
    if (deleteUser.fulfilled.match(res)) { setToDelete(null); load(page, search); }
  };

  const handleRetry = (id: string) => {
    const retryId = id || lastClickedId;
    if (retryId) dispatch(getUserById(retryId));
  };

  const sidebarOpen = !!selectedUser || selectedUserLoading || !!selectedUserError;
  const totalPages  = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex gap-5 h-full max-w-7xl mx-auto">

      {/* ── MAIN LIST ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Users</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{total} total users</p>
          </div>
        </div>

        <div className="relative w-72 mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Search by username..." value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all" />
        </div>

        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle size={15} /> {deleteError}
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-indigo-600 mb-3" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <AlertCircle size={28} className="text-red-500 mb-3" />
              <p className="text-red-600 dark:text-red-400 font-medium mb-3">{error}</p>
              <button onClick={() => load(1, search)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium dark:bg-red-500/10 dark:text-red-400">Retry</button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <UsersIcon size={36} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No users found</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">#</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide">User</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden md:table-cell">Email</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden lg:table-cell">Phone</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide hidden sm:table-cell">Roles</th>
                  <th className="px-5 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {users.map((user, idx) => {
                  const uid      = getUserId(user);
                  const isSelected = (selectedUser && String(selectedUser.id) === uid) ||
                                     (selectedUserLoading && lastClickedId === uid) ||
                                     (!!selectedUserError && lastClickedId === uid);
                  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.userName;
                  return (
                    <tr key={uid} onClick={() => handleSelectUser(user)}
                      className={cn('cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-500/10'
                          : 'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30')}>
                      <td className="px-5 py-3.5 text-zinc-400 dark:text-zinc-500 text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={fullName} imageUrl={user.imageUrl} size="sm" />
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[13px]">{fullName}</p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500">@{user.userName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 hidden md:table-cell text-[13px]">
                        {user.email ?? <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 dark:text-zinc-400 hidden lg:table-cell text-[13px]">
                        {user.phoneNumber ?? <span className="text-zinc-300 dark:text-zinc-600">—</span>}
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setRoleModalUser(user)}
                          className="flex flex-wrap gap-1 group">
                          {(user.roles ?? []).length > 0
                            ? (user.roles ?? []).map(r => (
                              <span key={r}
                                className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 group-hover:border-indigo-400 transition-colors">
                                {r}
                              </span>
                            ))
                            : <span className="text-xs text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-400 transition-colors">+ Add role</span>
                          }
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setToDelete(user); dispatch(clearDeleteError()); }}
                            disabled={deleteLoading}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 transition-colors">
                            {deleteLoading && toDelete && getUserId(toDelete) === uid
                              ? <Loader2 size={15} className="animate-spin" />
                              : <Trash2 size={15} strokeWidth={2} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between mt-4 px-1">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Page <span className="font-medium text-zinc-700 dark:text-zinc-300">{page}</span> of {totalPages} · {total} users
            </p>
            <Pagination page={page} totalPages={totalPages} loading={loading} onPage={handlePage} />
          </div>
        )}
      </div>

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <UserSidebar
          onClose={() => dispatch(clearSelectedUser())}
          onRetry={handleRetry}
          userGuid={lastClickedId}
        />
      )}

      {toDelete && (
        <DeleteModal
          productName={[toDelete.firstName, toDelete.lastName].filter(Boolean).join(' ') || toDelete.userName}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}

      {roleModalUser && (
        <RoleModal
          user={roleModalUser}
          fallbackRoles={roles}
          onClose={() => setRoleModalUser(null)}
        />
      )}
    </div>
  );
}
