import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, CheckCircle2, Clock, Layers } from 'lucide-react';
import type { Project, Task } from '../../types';

interface ProjectTasksChartWidgetProps {
  projects: Project[];
  tasks: Task[];
  onSelectProject?: (projectId: string) => void;
}

export const ProjectTasksChartWidget: React.FC<ProjectTasksChartWidgetProps> = ({
  projects,
  tasks,
  onSelectProject,
}) => {
  // Aggregate tasks per project: completed ('done') vs pending (backlog, todo, in_progress, review)
  const data = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const completed = projectTasks.filter((t) => t.status === 'done').length;
    const pending = projectTasks.filter((t) => t.status !== 'done').length;

    // Truncate name for chart readability if needed
    const shortName =
      project.name.length > 16 ? `${project.name.slice(0, 14)}...` : project.name;

    return {
      id: project.id,
      name: shortName,
      fullName: project.name,
      department: project.department || 'Geral',
      concluidas: completed,
      pendentes: pending,
      total: projectTasks.length,
    };
  });

  const totalCompleted = tasks.filter((t) => t.status === 'done').length;
  const totalPending = tasks.filter((t) => t.status !== 'done').length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE5F4] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#7654C7]/10 text-[#7654C7] rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E1638]">
              Desempenho por Projeto (Concluídas vs. Pendentes)
            </h3>
            <p className="text-xs text-[#5A5370]">
              Comparativo de entregas e demandas em aberto em cada projeto ativo
            </p>
          </div>
        </div>

        {/* Global Summary Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ECFDF3] border border-emerald-200 text-[#027A48] font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalCompleted} Concluídas</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4EFFE] border border-[#DDD7E9] text-[#7654C7] font-bold">
            <Clock className="w-3.5 h-3.5 text-[#7654C7]" />
            <span>{totalPending} Pendentes</span>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="py-12 text-center text-xs text-[#958FA5] bg-[#F5F3FA] rounded-xl mt-4 border border-dashed border-[#DDD7E9]">
          <Layers className="w-8 h-8 text-[#958FA5] mx-auto mb-2" />
          <p className="font-semibold text-[#1E1638]">Nenhum projeto cadastrado no momento</p>
          <p className="text-[11px] text-[#5A5370] mt-0.5">
            Cadastre projetos e tarefas para visualizar as métricas comparativas em gráfico.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const clickedProject = state.activePayload[0].payload;
                  if (clickedProject?.id && onSelectProject) {
                    onSelectProject(clickedProject.id);
                  }
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE5F4" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#5A5370', fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: '#DDD7E9' }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#958FA5', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-[#EAE5F4] shadow-xl text-xs space-y-1.5">
                        <div className="font-bold text-[#1E1638] text-xs pb-1 border-b border-[#F5F3FA] flex items-center justify-between gap-3">
                          <span>{item.fullName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-[#7654C7]/10 text-[#7654C7] uppercase">
                            {item.department}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-700 font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#12B76A]" />
                            Concluídas:
                          </span>
                          <span className="font-bold">{item.concluidas}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-[#7654C7] font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm bg-[#7654C7]" />
                            Pendentes:
                          </span>
                          <span className="font-bold">{item.pendentes}</span>
                        </div>
                        <div className="pt-1 border-t border-[#F5F3FA] text-[10px] text-[#958FA5] flex justify-between">
                          <span>Total de Tarefas:</span>
                          <span className="font-bold text-[#1E1638]">{item.total}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 600 }}
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span className="text-xs text-[#5A5370] font-semibold">
                    {value === 'concluidas' ? 'Tarefas Concluídas' : 'Tarefas Pendentes'}
                  </span>
                )}
              />
              <Bar
                dataKey="concluidas"
                name="concluidas"
                fill="#12B76A"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="pendentes"
                name="pendentes"
                fill="#7654C7"
                radius={[6, 6, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
