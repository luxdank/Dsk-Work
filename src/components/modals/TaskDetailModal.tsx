import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Flag,
  User,
  CheckSquare,
  MessageSquare,
  Trash2,
  Clock,
  Send,
  Plus,
  AlertCircle,
  Tag,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  updateTask,
  deleteTask,
  subscribeChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  subscribeComments,
  addComment,
  logActivity,
  createNotification,
} from '../../services/firestoreService';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import type {
  Task,
  Column,
  UserProfile,
  ChecklistItem,
  Comment,
  TaskPriority,
  TaskStatus,
} from '../../types';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  users: UserProfile[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  columns,
  users,
}) => {
  const { currentUser, userProfile, isManager } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [columnId, setColumnId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Checklist state
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setColumnId(task.columnId);
      setDueDate(task.dueDate || '');
      setAssigneeIds(task.assigneeIds || []);
      setIsEditing(false);
    }
  }, [task]);

  // Subscribe to checklists
  useEffect(() => {
    if (!task) return;
    const unsub = subscribeChecklist(task.id, (items) => {
      setChecklist(items);
    });
    return () => unsub();
  }, [task?.id]);

  // Subscribe to comments
  useEffect(() => {
    if (!task) return;
    const unsub = subscribeComments(task.id, (comms) => {
      setComments(comms);
    });
    return () => unsub();
  }, [task?.id]);

  if (!isOpen || !task) return null;

  const handleSaveDetails = async () => {
    try {
      setSaving(true);
      const taskUpdate: Partial<Task> = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        columnId,
        assigneeIds,
      };
      if (dueDate && dueDate.trim()) {
        taskUpdate.dueDate = dueDate.trim();
      }

      await updateTask(task.id, taskUpdate);

      await logActivity({
        projectId: task.projectId,
        taskId: task.id,
        userId: currentUser?.uid || 'user',
        userName: userProfile?.name || 'Colaborador',
        action: 'atualizou os detalhes da tarefa',
        details: title.trim(),
      });

      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const [statusError, setStatusError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    // Rule: Só quem pode mover o card para concluído são os níveis "Gestor" e "Administrador"
    if (newStatus === 'done' && !isManager) {
      setStatusError('Apenas Gestores e Administradores podem concluir tarefas.');
      setTimeout(() => setStatusError(null), 3500);
      return;
    }

    setStatus(newStatus);
    // Find column matching title or keep current
    const matchingCol = columns.find(
      (c) =>
        (newStatus === 'backlog' && c.title.toLowerCase().includes('backlog')) ||
        (newStatus === 'todo' && c.title.toLowerCase().includes('fazer')) ||
        (newStatus === 'in_progress' && c.title.toLowerCase().includes('andamento')) ||
        (newStatus === 'review' && c.title.toLowerCase().includes('revis')) ||
        (newStatus === 'done' && c.title.toLowerCase().includes('conclu'))
    );

    const targetColId = matchingCol ? matchingCol.id : columnId;
    if (matchingCol) setColumnId(matchingCol.id);

    await updateTask(task.id, {
      status: newStatus,
      columnId: targetColId,
    });

    await logActivity({
      projectId: task.projectId,
      taskId: task.id,
      userId: currentUser?.uid || 'user',
      userName: userProfile?.name || 'Colaborador',
      action: 'alterou o status da tarefa para',
      details: newStatus,
    });
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    await addChecklistItem(task.id, newChecklistText.trim(), checklist.length);
    setNewChecklistText('');
  };

  const handleToggleChecklist = async (item: ChecklistItem) => {
    await toggleChecklistItem(item.id, !item.completed, task.id, checklist);
  };

  const handleDeleteChecklist = async (item: ChecklistItem) => {
    const remaining = checklist.filter((i) => i.id !== item.id);
    await deleteChecklistItem(item.id, task.id, remaining);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSendingComment(true);
      await addComment({
        taskId: task.id,
        projectId: task.projectId,
        userId: currentUser?.uid || 'user',
        userName: userProfile?.name || currentUser?.displayName || 'Colaborador',
        userAvatar: userProfile?.photoUrl || currentUser?.photoURL || '',
        content: commentText.trim(),
      });

      // Notify task assignees
      for (const assigneeId of task.assigneeIds || []) {
        if (assigneeId !== currentUser?.uid) {
          await createNotification({
            userId: assigneeId,
            title: 'Novo comentário na tarefa',
            message: `${userProfile?.name || 'Um colaborador'} comentou na tarefa "${task.title}".`,
            type: 'mention',
            read: false,
            link: task.projectId,
          });
        }
      }

      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm('Tem certeza de que deseja excluir permanentemente esta tarefa?')) return;
    try {
      setDeleting(true);
      await deleteTask(task.id);
      await logActivity({
        projectId: task.projectId,
        userId: currentUser?.uid || 'user',
        userName: userProfile?.name || 'Colaborador',
        action: 'excluiu a tarefa',
        details: task.title,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const [claiming, setClaiming] = useState(false);

  const toggleAssignee = (userId: string) => {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const isCurrentAssigned = Boolean(currentUser?.uid && assigneeIds.includes(currentUser.uid));

  const handleClaimTask = async () => {
    if (!currentUser?.uid) return;
    try {
      setClaiming(true);
      const updatedAssignees = Array.from(new Set([...assigneeIds, currentUser.uid]));
      setAssigneeIds(updatedAssignees);
      await updateTask(task.id, { assigneeIds: updatedAssignees });
      await logActivity({
        projectId: task.projectId,
        taskId: task.id,
        userId: currentUser.uid,
        userName: userProfile?.name || 'Colaborador',
        action: 'assumiu a responsabilidade pela tarefa',
        details: task.title,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const handleReleaseTask = async () => {
    if (!currentUser?.uid) return;
    try {
      setClaiming(true);
      const updatedAssignees = assigneeIds.filter((id) => id !== currentUser.uid);
      setAssigneeIds(updatedAssignees);
      await updateTask(task.id, { assigneeIds: updatedAssignees });
      await logActivity({
        projectId: task.projectId,
        taskId: task.id,
        userId: currentUser.uid,
        userName: userProfile?.name || 'Colaborador',
        action: 'deixou a responsabilidade da tarefa',
        details: task.title,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setClaiming(false);
    }
  };

  const completedChecklistCount = checklist.filter((i) => i.completed).length;
  const checklistPercentage =
    checklist.length > 0 ? Math.round((completedChecklistCount / checklist.length) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 border border-[#EAE5F4] shadow-2xl my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EAE5F4] gap-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-base font-bold text-[#1E1638] border border-[#DDD7E9] rounded-lg focus:outline-none focus:border-[#7654C7]"
              />
            ) : (
              <div className="flex items-center gap-2.5 flex-wrap">
                <StatusBadge status={status} />
                <PriorityBadge priority={priority} />
                <h3 className="text-lg font-bold text-[#1E1638] tracking-tight">{title}</h3>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isManager && (
              <button
                onClick={handleDeleteTask}
                disabled={deleting}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                title="Excluir Tarefa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#958FA5] hover:text-[#1E1638] hover:bg-[#F5F3FA] rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1">
          {/* Status Quick Switcher */}
          {statusError && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
              <span>{statusError}</span>
              <button
                onClick={() => setStatusError(null)}
                className="text-amber-700 hover:text-amber-900 text-xs ml-2"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-[#5A5370] text-xs shrink-0 mr-1">Status:</span>
            {(['backlog', 'todo', 'in_progress', 'review', 'done'] as TaskStatus[]).map((s) => {
              const isDoneDisabled = s === 'done' && !isManager;
              return (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  title={
                    isDoneDisabled
                      ? 'Apenas Gestores e Administradores podem concluir tarefas'
                      : undefined
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                    status === s
                      ? 'ring-2 ring-[#7654C7] ring-offset-1 opacity-100 font-bold'
                      : isDoneDisabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <StatusBadge status={s} />
                </button>
              );
            })}
          </div>

          {/* Details Row: Due Date, Priority, Column */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#F5F3FA] rounded-xl border border-[#DDD7E9] text-xs">
            <div>
              <span className="text-[#958FA5] block mb-1 font-medium">Prazo de Entrega:</span>
              <div className="flex items-center gap-2 text-[#1E1638] font-semibold">
                <Calendar className="w-3.5 h-3.5 text-[#7654C7]" />
                {isEditing ? (
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="p-1 bg-white border border-[#DDD7E9] rounded text-xs"
                  />
                ) : (
                  <span>{dueDate ? new Date(dueDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem prazo'}</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[#958FA5] block mb-1 font-medium">Prioridade:</span>
              {isEditing ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="p-1 bg-white border border-[#DDD7E9] rounded text-xs"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              ) : (
                <PriorityBadge priority={priority} />
              )}
            </div>

            <div>
              <span className="text-[#958FA5] block mb-1 font-medium">Coluna no Quadro:</span>
              {isEditing ? (
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className="p-1 bg-white border border-[#DDD7E9] rounded text-xs w-full"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-[#1E1638]">
                  {columns.find((c) => c.id === columnId)?.title || 'Quadro Padrão'}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5370]">
                Descrição da Demanda
              </h4>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-medium text-[#7654C7] hover:underline"
                >
                  Editar
                </button>
              ) : (
                <button
                  onClick={handleSaveDetails}
                  disabled={saving}
                  className="text-xs font-semibold px-2.5 py-1 bg-[#30205D] text-white rounded-md hover:bg-[#4C3882] transition"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              )}
            </div>

            {isEditing ? (
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Insira as instruções e especificações da demanda..."
                className="w-full p-3 text-xs bg-white border border-[#DDD7E9] rounded-xl text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
              />
            ) : (
              <p className="text-xs text-[#1E1638] leading-relaxed whitespace-pre-wrap bg-white p-3.5 rounded-xl border border-[#EAE5F4]">
                {description || <span className="text-[#958FA5] italic">Nenhuma descrição adicionada.</span>}
              </p>
            )}
          </div>

          {/* Assignees */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5370] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#7654C7]" />
                <span>Colaboradores Designados ({assigneeIds.length})</span>
              </h4>

              {/* Botão para o colaborador assumir ou deixar a tarefa */}
              {isCurrentAssigned ? (
                <button
                  type="button"
                  onClick={handleReleaseTask}
                  disabled={claiming}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                  title="Remover sua atribuição desta tarefa"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>{claiming ? 'Atualizando...' : 'Deixar Tarefa'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClaimTask}
                  disabled={claiming}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-[#7654C7] hover:bg-[#6442b5] rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
                  title="Tornar-se responsável por esta tarefa"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{claiming ? 'Assumindo...' : 'Assumir Tarefa'}</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {assigneeIds.map((id) => {
                const u = users.find((usr) => usr.id === id);
                return (
                  <div
                    key={id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#DDD7E9] text-xs font-medium text-[#1E1638]"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#7654C7] text-white text-[10px] font-bold flex items-center justify-center">
                      {u?.name?.charAt(0) || 'U'}
                    </div>
                    <span>{u?.name || 'Membro'}</span>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => toggleAssignee(id)}
                        className="text-[#958FA5] hover:text-rose-500 ml-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
              {assigneeIds.length === 0 && (
                <span className="text-xs text-[#958FA5] italic">Nenhum colaborador atribuído ainda.</span>
              )}
            </div>

            {isEditing && (
              <div className="mt-2 p-2 bg-[#F5F3FA] rounded-xl border border-[#DDD7E9] flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {users.map((u) => {
                  const isAssigned = assigneeIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleAssignee(u.id)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
                        isAssigned
                          ? 'bg-[#30205D] text-white'
                          : 'bg-white text-[#5A5370] hover:bg-slate-100 border border-[#DDD7E9]'
                      }`}
                    >
                      {u.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Checklist Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5370] flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-[#7654C7]" />
                <span>Checklist de Tarefas ({completedChecklistCount}/{checklist.length})</span>
              </h4>
              <span className="text-xs font-semibold text-[#7654C7]">{checklistPercentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#DDD7E9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7654C7] transition-all duration-300"
                style={{ width: `${checklistPercentage}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5 pt-1">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#EAE5F4] hover:border-[#DDD7E9] text-xs transition"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item)}
                      className="w-4 h-4 rounded text-[#7654C7] focus:ring-[#7654C7] border-slate-300 cursor-pointer"
                    />
                    <span className={item.completed ? 'line-through text-[#958FA5]' : 'text-[#1E1638]'}>
                      {item.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteChecklist(item)}
                    className="p-1 text-[#958FA5] hover:text-rose-500 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add checklist item */}
            <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Adicionar item ao checklist..."
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7]"
              />
              <button
                type="submit"
                disabled={!newChecklistText.trim()}
                className="px-3 py-1.5 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-lg border border-[#DDD7E9] transition flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </form>
          </div>

          {/* Comments Timeline Section */}
          <div className="space-y-3 pt-2 border-t border-[#EAE5F4]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5370] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#7654C7]" />
              <span>Discussão & Comentários ({comments.length})</span>
            </h4>

            {/* Comments list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-[#958FA5] italic py-2">
                  Nenhum comentário registrado. Inicie a conversa abaixo.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-3 bg-white rounded-xl border border-[#EAE5F4] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#7654C7] text-white text-[10px] font-bold flex items-center justify-center">
                          {c.userName?.charAt(0) || 'U'}
                        </div>
                        <span className="font-bold text-[#1E1638]">{c.userName}</span>
                      </div>
                      <span className="text-[10px] text-[#958FA5]">
                        {new Date(c.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[#5A5370] pl-7 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Send comment form */}
            <form onSubmit={handleSendComment} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Escreva um comentário ou feedback da entrega..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7]"
              />
              <button
                type="submit"
                disabled={sendingComment || !commentText.trim()}
                className="px-4 py-2 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#EAE5F4] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#1E1638] font-semibold text-xs rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
