import React from 'react';
import { Menu, Plus, Search, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenNewTaskModal?: () => void;
  onOpenNewProjectModal?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadCount?: number;
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  searchQuery,
  setSearchQuery,
  unreadCount = 0,
  onOpenNotifications,
}) => {
  const { isManager, userProfile } = useAuth();

  const titleMap: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Painel Geral',
      subtitle: 'Visão consolidada de projetos, indicadores e entregas',
    },
    'my-tasks': {
      title: 'Meus Trabalhos',
      subtitle: 'Tarefas atribuídas sob sua responsabilidade direta',
    },
    projects: {
      title: 'Projetos & Quadros',
      subtitle: 'Gerencie fluxos e etapas das demandas corporativas',
    },
    team: {
      title: 'Equipe & Departamentos',
      subtitle: 'Colaboradores, cargos e níveis de acesso ao DK Work',
    },
    calendar: {
      title: 'Calendário de Entregas',
      subtitle: 'Prazos contratuais e marcos programados',
    },
    reports: {
      title: 'Métricas & Relatórios',
      subtitle: 'Taxas de conclusão, produtividade e alocação',
    },
    notifications: {
      title: 'Central de Notificações',
      subtitle: 'Atualizações de status, prazos e menções de equipe',
    },
    settings: {
      title: 'Configurações do Sistema',
      subtitle: 'Gestão de departamentos, parâmetros da empresa e perfil',
    },
  };

  const currentInfo = titleMap[activeTab] || titleMap.dashboard;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#EAE5F4] px-4 md:px-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#5A5370] hover:text-[#1E1638] hover:bg-[#F5F3FA] rounded-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg md:text-xl font-bold text-[#1E1638] tracking-tight">
            {currentInfo.title}
          </h1>
          <p className="hidden sm:block text-xs text-[#5A5370]">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F3FA] text-[#1E1638] placeholder-[#958FA5] rounded-lg border border-[#DDD7E9] focus:outline-none focus:border-[#7654C7] focus:ring-2 focus:ring-[#7654C7]/20 transition"
          />
        </div>

        {/* Action Button */}
        {isManager && onOpenNewProjectModal && (
          <button
            onClick={onOpenNewProjectModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-lg border border-[#DDD7E9] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        )}

        {onOpenNewTaskModal && (
          <button
            onClick={onOpenNewTaskModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-xs transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Tarefa</span>
          </button>
        )}

        {/* Notifications Icon shortcut */}
        {onOpenNotifications && (
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-[#5A5370] hover:text-[#30205D] hover:bg-[#F5F3FA] rounded-lg transition"
            title="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EC4899] ring-2 ring-white" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
