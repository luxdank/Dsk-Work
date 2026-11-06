import React from 'react';
import {
  BarChart3,
  PieChart,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Building2,
  Users,
} from 'lucide-react';
import type { Task, Project, Department, UserProfile } from '../types';

interface ReportsViewProps {
  tasks: Task[];
  projects: Project[];
  departments: Department[];
  users: UserProfile[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tasks,
  projects,
  departments,
  users,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === 'in_progress' || t.status === 'review'
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === 'backlog' || t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // By Priority
  const urgentCount = tasks.filter((t) => t.priority === 'urgent').length;
  const highCount = tasks.filter((t) => t.priority === 'high').length;
  const mediumCount = tasks.filter((t) => t.priority === 'medium').length;
  const lowCount = tasks.filter((t) => t.priority === 'low').length;

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#EAE5F4] shadow-xs">
          <span className="text-xs font-semibold text-[#5A5370]">Taxa de Conclusão Global</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#1E1638]">{completionRate}%</span>
            <span className="text-xs text-[#027A48] font-bold">
              {completedTasks}/{totalTasks} tarefas
            </span>
          </div>
          <div className="w-full h-2 bg-[#EAE5F4] rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-[#7654C7] to-[#027A48] transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#EAE5F4] shadow-xs">
          <span className="text-xs font-semibold text-[#5A5370]">Em Execução Ativa</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#5925DC]">{inProgressTasks}</span>
            <span className="text-xs text-[#5A5370]">tarefas em andamento</span>
          </div>
          <p className="text-[11px] text-[#958FA5] mt-2">Fluxo de produção contínuo</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#EAE5F4] shadow-xs">
          <span className="text-xs font-semibold text-[#5A5370]">Demandas na Fila</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#3730A3]">{pendingTasks}</span>
            <span className="text-xs text-[#5A5370]">backlog e a fazer</span>
          </div>
          <p className="text-[11px] text-[#958FA5] mt-2">Prontas para priorização</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#EAE5F4] shadow-xs">
          <span className="text-xs font-semibold text-[#5A5370]">Demandas Urgentes</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-rose-600">{urgentCount}</span>
            <span className="text-xs text-rose-600 font-semibold">críticas</span>
          </div>
          <p className="text-[11px] text-[#958FA5] mt-2">Requerem atenção prioritária</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-[#7654C7]" />
            <h3 className="text-base font-bold text-[#1E1638]">Distribuição por Status</h3>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'Concluído',
                count: completedTasks,
                color: 'bg-emerald-500',
                text: 'text-emerald-700',
              },
              {
                label: 'Em Andamento & Revisão',
                count: inProgressTasks,
                color: 'bg-[#7654C7]',
                text: 'text-[#7654C7]',
              },
              {
                label: 'A Fazer & Backlog',
                count: pendingTasks,
                color: 'bg-[#30205D]',
                text: 'text-[#30205D]',
              },
            ].map((st, i) => {
              const pct = totalTasks > 0 ? Math.round((st.count / totalTasks) * 100) : 0;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1E1638]">{st.label}</span>
                    <span className={st.text}>
                      {st.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F5F3FA] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${st.color} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-[#30205D]" />
            <h3 className="text-base font-bold text-[#1E1638]">Distribuição por Severidade</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Urgente', count: urgentCount, bar: 'bg-rose-500', text: 'text-rose-700' },
              { label: 'Alta', count: highCount, bar: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Média', count: mediumCount, bar: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Baixa', count: lowCount, bar: 'bg-slate-400', text: 'text-slate-700' },
            ].map((pr, i) => {
              const pct = totalTasks > 0 ? Math.round((pr.count / totalTasks) * 100) : 0;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1E1638]">{pr.label}</span>
                    <span className={pr.text}>
                      {pr.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F5F3FA] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pr.bar} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects by Department Overview */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-[#7654C7]" />
          <h3 className="text-base font-bold text-[#1E1638]">Atividades por Departamento</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {departments.map((dept) => {
            const deptProjects = projects.filter((p) => p.department === dept.name);
            const deptTasks = tasks.filter((t) => {
              const p = projects.find((proj) => proj.id === t.projectId);
              return p?.department === dept.name;
            });
            const doneDept = deptTasks.filter((t) => t.status === 'done').length;

            return (
              <div
                key={dept.id}
                className="p-4 rounded-xl bg-[#F5F3FA] border border-[#DDD7E9] flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#1E1638] uppercase tracking-wide">
                    {dept.name}
                  </h4>
                  <p className="text-[11px] text-[#5A5370] mt-0.5 line-clamp-1">
                    {dept.description || 'Sem descrição'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DDD7E9]/70 flex items-center justify-between text-xs">
                  <span className="text-[#5A5370]">{deptProjects.length} projeto(s)</span>
                  <span className="font-bold text-[#30205D]">
                    {doneDept}/{deptTasks.length} tarefas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
