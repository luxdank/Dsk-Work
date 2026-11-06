import React from 'react';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  ArrowRight,
  Plus,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { ProjectTasksChartWidget } from '../components/widgets/ProjectTasksChartWidget';
import type { Project, Task } from '../types';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  onSelectProject: (projectId: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewProjectModal: () => void;
  onSelectTask: (task: Task) => void;
  onNavigateToProjects: () => void;
  onNavigateToMyTasks: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  tasks,
  onSelectProject,
  onOpenNewTaskModal,
  onOpenNewProjectModal,
  onSelectTask,
  onNavigateToProjects,
  onNavigateToMyTasks,
}) => {
  const { currentUser, userProfile, isManager } = useAuth();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Compute real metrics
  const activeProjects = projects.filter((p) => p.status === 'active');
  const pendingTasks = tasks.filter((t) => t.status === 'backlog' || t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress' || t.status === 'review');
  const completedTasks = tasks.filter((t) => t.status === 'done');

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const due = new Date(t.dueDate + 'T00:00:00');
    return due < now;
  });

  // My tasks
  const myTasks = tasks.filter((t) =>
    currentUser?.uid ? t.assigneeIds?.includes(currentUser.uid) : false
  );
  const myPendingTasks = myTasks.filter((t) => t.status !== 'done');

  // Upcoming deliverables (tasks due in next 14 days)
  const upcomingDeliverables = tasks
    .filter((t) => t.status !== 'done' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  // Recent projects
  const recentProjects = [...projects].slice(0, 4);

  const kpis = [
    {
      title: 'Projetos Ativos',
      value: activeProjects.length,
      icon: FolderKanban,
      color: 'text-[#30205D] bg-[#7654C7]/10',
      description: 'Espaços de trabalho em execução',
      onClick: onNavigateToProjects,
    },
    {
      title: 'Tarefas Pendentes',
      value: pendingTasks.length,
      icon: Clock,
      color: 'text-[#3730A3] bg-[#EEF2FF]',
      description: 'Backlog e A Fazer',
    },
    {
      title: 'Em Andamento',
      value: inProgressTasks.length,
      icon: TrendingUp,
      color: 'text-[#5925DC] bg-[#F4EFFE]',
      description: 'Sendo executadas agora',
    },
    {
      title: 'Tarefas Concluídas',
      value: completedTasks.length,
      icon: CheckCircle2,
      color: 'text-[#027A48] bg-[#ECFDF3]',
      description: 'Entregues com sucesso',
    },
    {
      title: 'Tarefas Atrasadas',
      value: overdueTasks.length,
      icon: AlertTriangle,
      color: 'text-[#B54708] bg-[#FEF6EE]',
      description: 'Prazo estipulado expirado',
    },
    {
      title: 'Minhas Tarefas',
      value: myPendingTasks.length,
      icon: UserCheck,
      color: 'text-[#30205D] bg-[#F5F3FA]',
      description: 'Demandas sob sua guarda',
      onClick: onNavigateToMyTasks,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#7654C7] uppercase tracking-wider">
            Visão Geral da Empresa
          </span>
          <h2 className="text-xl md:text-2xl font-bold text-[#1E1638] tracking-tight mt-0.5">
            Olá, {userProfile?.name?.split(' ')[0] || 'Colaborador'}!
          </h2>
          <p className="text-xs md:text-sm text-[#5A5370] mt-1">
            Aqui está o status em tempo real das demandas, projetos e entregas do DK Work.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isManager && (
            <button
              onClick={onOpenNewProjectModal}
              className="px-3.5 py-2 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-xl border border-[#DDD7E9] transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>
          )}
          <button
            onClick={onOpenNewTaskModal}
            className="px-4 py-2 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Tarefa</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={kpi.onClick}
              className={`bg-white rounded-2xl p-4 border border-[#EAE5F4] shadow-xs hover:border-[#7654C7]/40 transition flex flex-col justify-between ${
                kpi.onClick ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#5A5370] line-clamp-1">{kpi.title}</span>
                <div className={`p-1.5 rounded-lg ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-[#1E1638] tracking-tight">
                  {kpi.value}
                </span>
                <p className="text-[10px] text-[#958FA5] mt-1 line-clamp-1">{kpi.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Widget Gráfico de Tarefas Concluídas vs Pendentes por Projeto */}
      <ProjectTasksChartWidget
        projects={projects}
        tasks={tasks}
        onSelectProject={onSelectProject}
      />

      {/* Two Column Layout: Upcoming Deliverables & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Entregas */}
        <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7654C7]" />
              <h3 className="text-sm font-bold text-[#1E1638]">Próximas Entregas</h3>
            </div>
            <button
              onClick={onNavigateToMyTasks}
              className="text-xs font-semibold text-[#7654C7] hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5">
            {upcomingDeliverables.length === 0 ? (
              <div className="text-center py-10 bg-[#F5F3FA] rounded-xl border border-dashed border-[#DDD7E9]">
                <Clock className="w-8 h-8 text-[#958FA5] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#5A5370]">Nenhuma entrega com prazo próximo.</p>
                <p className="text-[11px] text-[#958FA5] mt-0.5">Cadastre prazos nas tarefas para acompanhar marcos.</p>
              </div>
            ) : (
              upcomingDeliverables.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const isOverdue =
                  task.dueDate && new Date(task.dueDate + 'T00:00:00') < now;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3 rounded-xl border border-[#EAE5F4] hover:border-[#7654C7]/40 hover:bg-[#F5F3FA]/60 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        <span className="text-[10px] text-[#958FA5] truncate">
                          {project?.name || 'Projeto'}
                        </span>
                      </div>
                      <p className="font-semibold text-[#1E1638] truncate">{task.title}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`font-semibold inline-block px-2 py-0.5 rounded text-[11px] ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-700 font-bold'
                            : 'text-[#5A5370]'
                        }`}
                      >
                        {task.dueDate
                          ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')
                          : 'Sem data'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Projetos Recentes */}
        <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#30205D]" />
              <h3 className="text-sm font-bold text-[#1E1638]">Projetos Recentes</h3>
            </div>
            <button
              onClick={onNavigateToProjects}
              className="text-xs font-semibold text-[#7654C7] hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5">
            {recentProjects.length === 0 ? (
              <div className="text-center py-10 bg-[#F5F3FA] rounded-xl border border-dashed border-[#DDD7E9]">
                <FolderKanban className="w-8 h-8 text-[#958FA5] mx-auto mb-2" />
                <p className="text-xs font-medium text-[#5A5370]">Nenhum projeto cadastrado ainda.</p>
                {isManager && (
                  <button
                    onClick={onOpenNewProjectModal}
                    className="mt-3 px-3 py-1.5 bg-[#30205D] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#4C3882] transition"
                  >
                    Criar Primeiro Projeto
                  </button>
                )}
              </div>
            ) : (
              recentProjects.map((project) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id);
                const doneCount = projectTasks.filter((t) => t.status === 'done').length;
                const progress =
                  projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => onSelectProject(project.id)}
                    className="p-3.5 rounded-xl border border-[#EAE5F4] hover:border-[#7654C7]/40 hover:bg-[#F5F3FA]/60 transition cursor-pointer flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7654C7]/10 text-[#7654C7] uppercase">
                          {project.department || 'Geral'}
                        </span>
                        <h4 className="text-xs font-bold text-[#1E1638] truncate">{project.name}</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-[#5A5370]">
                        {doneCount}/{projectTasks.length} concluídas ({progress}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[#EAE5F4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#7654C7] to-[#30205D] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
