import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBadge } from '../common/Badge';

export type ActiveTab =
  | 'dashboard'
  | 'my-tasks'
  | 'projects'
  | 'team'
  | 'calendar'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  onClose: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  unreadCount = 0,
}) => {
  const { userProfile, currentUser, logout, isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-tasks' as ActiveTab, label: 'Meus Trabalhos', icon: CheckSquare },
    { id: 'projects' as ActiveTab, label: 'Projetos', icon: FolderKanban },
    { id: 'team' as ActiveTab, label: 'Equipe', icon: Users },
    { id: 'calendar' as ActiveTab, label: 'Calendário', icon: Calendar },
    { id: 'reports' as ActiveTab, label: 'Relatórios', icon: BarChart3 },
    {
      id: 'notifications' as ActiveTab,
      label: 'Notificações',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'settings' as ActiveTab, label: 'Configurações', icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#30205D] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#4C3882]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#7654C7] to-[#9989CC] flex items-center justify-center text-white font-bold shadow-md shadow-[#1B0748]/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                DK Work
              </span>
              <p className="text-[10px] text-[#A987FD] font-medium tracking-wide uppercase">
                Gestão Ágil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#A987FD] hover:text-white hover:bg-[#4C3882] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#7654C7] text-white shadow-sm shadow-[#1B0748]/20 font-semibold'
                    : 'text-[#DDD6ED] hover:bg-[#4C3882]/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-[#A987FD]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#EC4899] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[#4C3882]/50 bg-[#25174B]/60">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[#7654C7] text-white font-bold flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-[#7654C7]/40">
              {userProfile?.photoUrl ? (
                <img
                  src={userProfile.photoUrl}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {userProfile?.name?.charAt(0)?.toUpperCase() ||
                    currentUser?.email?.charAt(0)?.toUpperCase() ||
                    'U'}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {userProfile?.name || currentUser?.displayName || 'Usuário DK'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <RoleBadge role={userProfile?.role || 'colaborador'} />
              </div>
              <p className="text-[10px] text-[#A987FD] truncate mt-0.5">
                {userProfile?.department || 'Geral'}
              </p>
            </div>

            <button
              onClick={() => logout()}
              title="Encerrar Sessão"
              className="p-1.5 rounded-lg text-[#DDD6ED] hover:text-white hover:bg-rose-500/20 hover:text-rose-300 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
