import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Filter,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { updateTask, logActivity } from '../services/firestoreService';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import type { Task, Project, TaskStatus } from '../types';

interface MyTasksViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onOpenNewTaskModal,
  searchQuery,
  setSearchQuery,
}) => {
  const { currentUser, userProfile } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use the external searchQuery if provided, otherwise fallback to local searchTerm
  const currentSearch = (searchQuery !== undefined ? searchQuery : searchTerm);
  const activeSearch = currentSearch.trim().toLowerCase();

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    if (setSearchQuery) {
      setSearchQuery(val);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    if (setSearchQuery) {
      setSearchQuery('');
    }
  };

  // Filter tasks assigned to logged-in user
  const userTasks = tasks.filter((t) =>
    currentUser?.uid ? t.assigneeIds?.includes(currentUser.uid) : false
  );

  const filtered = userTasks.filter((t) => {
    if (filterStatus === 'pending' && t.status === 'done') return false;
    if (filterStatus === 'done' && t.status !== 'done') return false;
    if (filterStatus === 'in_progress' && t.status !== 'in_progress' && t.status !== 'review')
      return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;

    // Filter by title or description using the searchQuery state
    if (activeSearch) {
      const titleMatch = t.title ? t.title.toLowerCase().includes(activeSearch) : false;
      const descMatch = t.description ? t.description.toLowerCase().includes(activeSearch) : false;
      const tagMatch = t.tags ? t.tags.some((tag) => tag.toLowerCase().includes(activeSearch)) : false;
      if (!titleMatch && !descMatch && !tagMatch) return false;
    }
    return true;
  });

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const handleToggleDone = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const newStatus: TaskStatus = task.status === 'done' ? 'in_progress' : 'done';
    await updateTask(task.id, { status: newStatus });
    await logActivity({
      projectId: task.projectId,
      taskId: task.id,
      userId: currentUser?.uid || 'user',
      userName: userProfile?.name || 'Colaborador',
      action: newStatus === 'done' ? 'concluiu a tarefa' : 'reabriu a tarefa',
      details: task.title,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5F4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterStatus === 'all'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Todas ({userTasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterStatus === 'pending'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Pendentes ({userTasks.filter((t) => t.status !== 'done').length})
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterStatus === 'in_progress'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Em Andamento ({userTasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length})
          </button>
          <button
            onClick={() => setFilterStatus('done')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filterStatus === 'done'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Concluídas ({userTasks.filter((t) => t.status === 'done').length})
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F5F3FA] border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>

          {/* Search bar inside view (bound to searchQuery state) */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título ou descrição..."
              value={currentSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-[#F5F3FA] border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7]"
            />
            {currentSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#958FA5] hover:text-[#1E1638] rounded transition"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE5F4] shadow-xs">
            <CheckSquare className="w-12 h-12 text-[#958FA5] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1E1638]">
              {activeSearch
                ? `Nenhuma tarefa encontrada para "${currentSearch}"`
                : 'Nenhuma tarefa encontrada'}
            </h3>
            <p className="text-xs text-[#5A5370] mt-1 max-w-sm mx-auto">
              {activeSearch
                ? 'Tente utilizar outros termos na busca por título ou descrição da tarefa.'
                : 'Você não possui tarefas correspondentes aos filtros selecionados.'}
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              {activeSearch && (
                <button
                  onClick={handleClearSearch}
                  className="px-3.5 py-2 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-lg border border-[#DDD7E9] transition"
                >
                  Limpar Busca
                </button>
              )}
              <button
                onClick={onOpenNewTaskModal}
                className="px-4 py-2 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-xs transition"
              >
                Criar Nova Tarefa
              </button>
            </div>
          </div>
        ) : (
          filtered.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const isOverdue =
              task.status !== 'done' &&
              task.dueDate &&
              new Date(task.dueDate + 'T00:00:00') < now;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="bg-white rounded-xl p-4 border border-[#EAE5F4] hover:border-[#7654C7]/40 shadow-xs transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  {/* Complete Button */}
                  <button
                    onClick={(e) => handleToggleDone(e, task)}
                    title={task.status === 'done' ? 'Marcar como não concluída' : 'Concluir tarefa'}
                    className={`mt-0.5 sm:mt-0 p-1.5 rounded-lg border transition shrink-0 ${
                      task.status === 'done'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'border-[#DDD7E9] text-transparent hover:text-emerald-500 hover:border-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <span className="text-[11px] font-semibold text-[#7654C7] bg-[#7654C7]/10 px-2 py-0.5 rounded">
                        {project?.name || 'Projeto'}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold text-[#1E1638] truncate ${
                        task.status === 'done' ? 'line-through text-[#958FA5]' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-[#5A5370] line-clamp-1 mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Metadata */}
                <div className="flex items-center gap-4 shrink-0 sm:pl-3 border-t sm:border-t-0 border-[#F5F3FA] pt-2 sm:pt-0">
                  {task.checklistTotal ? (
                    <div className="flex items-center gap-1.5 text-xs text-[#5A5370]">
                      <CheckSquare className="w-3.5 h-3.5 text-[#7654C7]" />
                      <span>
                        {task.checklistCompleted || 0}/{task.checklistTotal}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#958FA5]" />
                    <span
                      className={
                        isOverdue
                          ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-bold'
                          : 'text-[#5A5370]'
                      }
                    >
                      {task.dueDate
                        ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')
                        : 'Sem prazo'}
                    </span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#958FA5] hidden sm:block" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
