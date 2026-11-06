import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, User, Tag, FolderKanban } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createTask, logActivity, createNotification } from '../../services/firestoreService';
import type { Project, Column, UserProfile, TaskPriority, TaskStatus, Task } from '../../types';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  columns: Column[];
  users: UserProfile[];
  defaultProjectId?: string;
  defaultColumnId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projects,
  columns,
  users,
  defaultProjectId,
  defaultColumnId,
}) => {
  const { currentUser, userProfile } = useAuth();

  const [projectId, setProjectId] = useState<string>('');
  const [columnId, setColumnId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync project and column whenever the modal opens or dependencies change
  useEffect(() => {
    if (isOpen) {
      setError(null);
      // Determine the target project: defaultProjectId, or current selection if valid, or first project in list
      let targetProject = defaultProjectId;
      if (!targetProject || !projects.some((p) => p.id === targetProject)) {
        if (projectId && projects.some((p) => p.id === projectId)) {
          targetProject = projectId;
        } else {
          targetProject = projects[0]?.id || '';
        }
      }
      setProjectId(targetProject);

      // Determine target column
      const projectCols = columns.filter((c) => c.projectId === targetProject);
      let targetCol = defaultColumnId;
      if (!targetCol || !projectCols.some((c) => c.id === targetCol)) {
        targetCol = projectCols[0]?.id || '';
      }
      setColumnId(targetCol);

      // If status matches column title
      if (targetCol) {
        const found = projectCols.find((c) => c.id === targetCol);
        if (found) {
          const l = found.title.toLowerCase();
          if (l.includes('backlog')) setStatus('backlog');
          else if (l.includes('fazer')) setStatus('todo');
          else if (l.includes('andamento')) setStatus('in_progress');
          else if (l.includes('revis')) setStatus('review');
          else if (l.includes('conclu')) setStatus('done');
        }
      }
    }
  }, [isOpen, defaultProjectId, defaultColumnId, projects, columns]);

  if (!isOpen) return null;

  // Filter columns for selected project
  const currentProject = projects.find((p) => p.id === projectId) || projects[0];
  const projectColumns = columns.filter(
    (c) => c.projectId === (projectId || currentProject?.id)
  );

  const handleProjectChange = (newProjectId: string) => {
    setProjectId(newProjectId);
    const cols = columns.filter((c) => c.projectId === newProjectId);
    if (cols.length > 0) {
      setColumnId(cols[0].id);
    } else {
      setColumnId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('O título da tarefa é obrigatório.');
      return;
    }

    // Defensive fallback: ensure projectId is resolved
    const finalProjectId = projectId || defaultProjectId || projects[0]?.id;
    if (!finalProjectId) {
      setError('Por favor, cadastre um projeto antes de criar uma tarefa.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetCol =
        projectColumns.find((c) => c.id === columnId) || projectColumns[0];
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        projectId: finalProjectId,
        boardId: 'default',
        columnId: targetCol?.id || 'default_col',
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        assigneeIds,
        tags,
        order: Date.now(),
        checklistTotal: 0,
        checklistCompleted: 0,
      };

      if (dueDate && dueDate.trim()) {
        taskData.dueDate = dueDate.trim();
      }

      const newTaskId = await createTask(taskData);

      // Audit log
      await logActivity({
        projectId: finalProjectId,
        taskId: newTaskId,
        userId: currentUser?.uid || 'system',
        userName: userProfile?.name || 'Usuário',
        action: 'criou a tarefa',
        details: title.trim(),
      });

      // Notify assignees
      for (const assigneeId of assigneeIds) {
        if (assigneeId !== currentUser?.uid) {
          await createNotification({
            userId: assigneeId,
            title: 'Nova tarefa atribuída',
            message: `Você foi designado para a tarefa: "${title.trim()}".`,
            type: 'task_assigned',
            read: false,
            link: finalProjectId,
          });
        }
      }

      // Reset fields
      setTitle('');
      setDescription('');
      setTagsInput('');
      setAssigneeIds([]);
      setDueDate('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Falha ao criar tarefa.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#EAE5F4] shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5F4]">
          <h3 className="text-lg font-bold text-[#1E1638]">Nova Tarefa</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#958FA5] hover:text-[#1E1638] hover:bg-[#F5F3FA] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Project & Column selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Projeto *
              </label>
              <div className="relative">
                <FolderKanban className="w-4 h-4 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  required
                  value={projectId || (projects[0]?.id ?? '')}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7] font-medium"
                >
                  {projects.length === 0 ? (
                    <option value="">Nenhum projeto disponível</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.department})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Coluna / Etapa
              </label>
              <select
                value={columnId || (projectColumns[0]?.id ?? '')}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7] font-medium"
              >
                {projectColumns.length === 0 ? (
                  <option value="default">Padrão (A Fazer)</option>
                ) : (
                  projectColumns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1638] mb-1">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Desenvolver fluxo de checkout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7E9] rounded-lg text-sm text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7] focus:ring-2 focus:ring-[#7654C7]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1638] mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Detalhes da demanda, critérios de aceitação e referências..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7] resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Prioridade
              </label>
              <div className="relative">
                <Flag className="w-3.5 h-3.5 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
              >
                <option value="backlog">Backlog</option>
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Andamento</option>
                <option value="review">Em Revisão</option>
                <option value="done">Concluído</option>
              </select>
            </div>
          </div>

          {/* Due date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Prazo de Entrega
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Etiquetas (separadas por vírgula)
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Design, Bug, Backend"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                />
              </div>
            </div>
          </div>

          {/* Assignees Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1638] mb-1.5">
              Atribuir Colaboradores
            </label>
            <div className="max-h-32 overflow-y-auto p-2 bg-[#F5F3FA] rounded-xl border border-[#DDD7E9] space-y-1">
              {users.length === 0 ? (
                <p className="text-xs text-[#958FA5] p-2 text-center">Nenhum colaborador encontrado.</p>
              ) : (
                users.map((u) => {
                  const isAssigned = assigneeIds.includes(u.id);
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => toggleAssignee(u.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                        isAssigned
                          ? 'bg-[#7654C7]/15 text-[#30205D] font-semibold border border-[#7654C7]/30'
                          : 'bg-white text-[#5A5370] hover:bg-slate-100 border border-[#EAE5F4]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#7654C7] text-white text-[10px] font-bold flex items-center justify-center">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span>{u.name}</span>
                        <span className="text-[10px] text-[#958FA5]">({u.department})</span>
                      </div>
                      <span className="text-xs">{isAssigned ? '✓ Selecionado' : '+ Adicionar'}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE5F4]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#5A5370] hover:bg-[#F5F3FA] rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || projects.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#30205D] hover:bg-[#4C3882] rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Salvando...' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
