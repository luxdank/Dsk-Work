import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  MoreHorizontal,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ChevronRight,
  MoveRight,
  MoveLeft,
  GripVertical,
  UserCheck,
  UserMinus,
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useAuth } from '../contexts/AuthContext';
import { updateTask, createColumn, logActivity } from '../services/firestoreService';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import type { Project, Column, Task, UserProfile, Department } from '../types';

interface ProjectsViewProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  columns: Column[];
  tasks: Task[];
  users: UserProfile[];
  departments: Department[];
  onOpenNewProjectModal: () => void;
  onOpenNewTaskModalWithContext: (projectId: string, columnId: string) => void;
  onSelectTask: (task: Task) => void;
}

// -------------------------------------------------------------
// Draggable Task Card Component
// -------------------------------------------------------------
interface DraggableTaskCardProps {
  task: Task;
  users: UserProfile[];
  currentUserId?: string;
  onSelectTask: (task: Task) => void;
  canMovePrev: boolean;
  canMoveNext: boolean;
  onMovePrev: () => void;
  onMoveNext: () => void;
  onClaimTask: (task: Task) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = ({
  task,
  users,
  currentUserId,
  onSelectTask,
  canMovePrev,
  canMoveNext,
  onMovePrev,
  onMoveNext,
  onClaimTask,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const isAssignedToMe = Boolean(currentUserId && task.assigneeIds?.includes(currentUserId));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelectTask(task)}
      className={`bg-white rounded-xl p-3.5 border border-[#EAE5F4] hover:border-[#7654C7]/50 shadow-xs hover:shadow-md transition cursor-grab active:cursor-grabbing group flex flex-col gap-2.5 touch-none select-none ${
        isDragging ? 'opacity-30 border-dashed border-[#7654C7]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className="text-[10px] font-medium text-[#5A5370] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#958FA5]" />
            {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
          </span>
        )}
      </div>

      <h4 className="text-xs font-bold text-[#1E1638] line-clamp-2">
        {task.title}
      </h4>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F5F3FA] text-[#5A5370]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Assignees, Quick Claim & Move Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F5F3FA]">
        <div className="flex items-center -space-x-1.5">
          {task.assigneeIds?.slice(0, 3).map((uid) => {
            const u = users.find((usr) => usr.id === uid);
            return (
              <div
                key={uid}
                className="w-5 h-5 rounded-full bg-[#7654C7] text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-white"
                title={u?.name}
              >
                {u?.name?.charAt(0) || 'U'}
              </div>
            );
          })}
          {task.checklistTotal ? (
            <span className="text-[10px] text-[#958FA5] pl-2 font-medium">
              {task.checklistCompleted || 0}/{task.checklistTotal} subitens
            </span>
          ) : null}
        </div>

        {/* Action icons: Quick Claim and Move Handles */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Claim Button */}
          {!isAssignedToMe && currentUserId && (
            <button
              type="button"
              onClick={() => onClaimTask(task)}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#7654C7] bg-[#7654C7]/10 hover:bg-[#7654C7] hover:text-white transition flex items-center gap-1"
              title="Assumir esta tarefa"
            >
              <UserCheck className="w-3 h-3" />
              <span>Assumir</span>
            </button>
          )}

          {isAssignedToMe && (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5"
              title="Você é o responsável por esta tarefa"
            >
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
              <span>Minha</span>
            </span>
          )}

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
            {canMovePrev && (
              <button
                type="button"
                onClick={onMovePrev}
                className="p-1 rounded text-[#958FA5] hover:text-[#30205D] hover:bg-[#F5F3FA]"
                title="Mover para coluna anterior"
              >
                <MoveLeft className="w-3.5 h-3.5" />
              </button>
            )}
            {canMoveNext && (
              <button
                type="button"
                onClick={onMoveNext}
                className="p-1 rounded text-[#958FA5] hover:text-[#30205D] hover:bg-[#F5F3FA]"
                title="Avançar para próxima coluna"
              >
                <MoveRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Floating Card Preview while dragging
// -------------------------------------------------------------
const TaskCardPreview: React.FC<{ task: Task; users: UserProfile[] }> = ({ task, users }) => (
  <div className="w-72 bg-white rounded-xl p-3.5 border-2 border-[#7654C7] shadow-2xl rotate-2 cursor-grabbing flex flex-col gap-2.5 pointer-events-none">
    <div className="flex items-center justify-between gap-2">
      <PriorityBadge priority={task.priority} />
      {task.dueDate && (
        <span className="text-[10px] font-medium text-[#5A5370] flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#958FA5]" />
          {new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}
        </span>
      )}
    </div>
    <h4 className="text-xs font-bold text-[#1E1638] line-clamp-2">
      {task.title}
    </h4>
  </div>
);

// -------------------------------------------------------------
// Droppable Kanban Column Container
// -------------------------------------------------------------
interface DroppableKanbanColumnProps {
  column: Column;
  tasks: Task[];
  users: UserProfile[];
  currentUserId?: string;
  onSelectTask: (task: Task) => void;
  onAddTask: () => void;
  canMovePrev: boolean;
  canMoveNext: boolean;
  onMoveTask: (task: Task, direction: 'prev' | 'next') => void;
  onClaimTask: (task: Task) => void;
}

const DroppableKanbanColumn: React.FC<DroppableKanbanColumnProps> = ({
  column,
  tasks,
  users,
  currentUserId,
  onSelectTask,
  onAddTask,
  canMovePrev,
  canMoveNext,
  onMoveTask,
  onClaimTask,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`w-72 sm:w-80 shrink-0 bg-[#F5F3FA] rounded-2xl p-3 border transition-all duration-200 flex flex-col max-h-[75vh] ${
        isOver
          ? 'border-[#7654C7] bg-[#F4EFFE]/70 ring-2 ring-[#7654C7]/20 shadow-sm'
          : 'border-[#EAE5F4]'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 px-1 border-b border-[#EAE5F4]">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold text-[#1E1638] uppercase tracking-wider">
            {column.title}
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#5A5370] border border-[#DDD7E9]">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onAddTask}
          className="p-1 rounded-md text-[#958FA5] hover:text-[#1E1638] hover:bg-white transition"
          title="Adicionar tarefa nesta coluna"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tasks in Column */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2.5 min-h-[140px]">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-[11px] text-[#958FA5] border border-dashed border-[#DDD7E9] rounded-xl bg-white/50">
            Arraste tarefas aqui
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              users={users}
              currentUserId={currentUserId}
              onSelectTask={onSelectTask}
              canMovePrev={canMovePrev}
              canMoveNext={canMoveNext}
              onMovePrev={() => onMoveTask(task, 'prev')}
              onMoveNext={() => onMoveTask(task, 'next')}
              onClaimTask={onClaimTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// ProjectsView Main Component
// -------------------------------------------------------------
export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  columns,
  tasks,
  users,
  departments,
  onOpenNewProjectModal,
  onOpenNewTaskModalWithContext,
  onSelectTask,
}) => {
  const { currentUser, userProfile, isManager } = useAuth();
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [activeDraggingTask, setActiveDraggingTask] = useState<Task | null>(null);

  // Configure drag sensors with a 5px activation distance so normal card clicks open the task modal
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // If a project is selected, render the Kanban Board!
  if (selectedProject) {
    const projectColumns = columns
      .filter((c) => c.projectId === selectedProject.id)
      .sort((a, b) => a.order - b.order);

    const projectTasks = tasks.filter((t) => t.projectId === selectedProject.id);

    const [permissionError, setPermissionError] = useState<string | null>(null);

    const handleMoveTaskColumn = async (task: Task, direction: 'prev' | 'next') => {
      const currentIndex = projectColumns.findIndex((c) => c.id === task.columnId);
      if (currentIndex === -1) return;

      const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      if (targetIndex < 0 || targetIndex >= projectColumns.length) return;

      const targetCol = projectColumns[targetIndex];
      // Infer task status from column title
      let targetStatus = task.status;
      const lower = targetCol.title.toLowerCase();
      if (lower.includes('backlog')) targetStatus = 'backlog';
      else if (lower.includes('fazer')) targetStatus = 'todo';
      else if (lower.includes('andamento')) targetStatus = 'in_progress';
      else if (lower.includes('revis')) targetStatus = 'review';
      else if (lower.includes('conclu')) targetStatus = 'done';

      // Rule: Só quem pode mover o card para concluído são os níveis "Gestor" e "Administrador"
      if (targetStatus === 'done' && !isManager) {
        setPermissionError('Apenas Gestores e Administradores têm permissão para concluir tarefas.');
        setTimeout(() => setPermissionError(null), 4000);
        return;
      }

      await updateTask(task.id, {
        columnId: targetCol.id,
        status: targetStatus,
      });

      await logActivity({
        projectId: selectedProject.id,
        taskId: task.id,
        userId: currentUser?.uid || 'user',
        userName: userProfile?.name || 'Colaborador',
        action: `moveu a tarefa para a coluna "${targetCol.title}"`,
        details: task.title,
      });
    };

    const handleDragStart = (event: DragStartEvent) => {
      const taskId = event.active.id as string;
      const task = projectTasks.find((t) => t.id === taskId);
      if (task) {
        setActiveDraggingTask(task);
      }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDraggingTask(null);

      if (!over) return;

      const taskId = active.id as string;
      const targetColumnId = over.id as string;

      const currentTask = projectTasks.find((t) => t.id === taskId);
      if (!currentTask || currentTask.columnId === targetColumnId) return;

      const targetCol = projectColumns.find((c) => c.id === targetColumnId);
      if (!targetCol) return;

      // Infer status from target column
      let targetStatus = currentTask.status;
      const lower = targetCol.title.toLowerCase();
      if (lower.includes('backlog')) targetStatus = 'backlog';
      else if (lower.includes('fazer')) targetStatus = 'todo';
      else if (lower.includes('andamento')) targetStatus = 'in_progress';
      else if (lower.includes('revis')) targetStatus = 'review';
      else if (lower.includes('conclu')) targetStatus = 'done';

      // Rule: Só quem pode mover o card para concluído são os níveis "Gestor" e "Administrador"
      if (targetStatus === 'done' && !isManager) {
        setPermissionError('Apenas Gestores e Administradores têm permissão para concluir tarefas.');
        setTimeout(() => setPermissionError(null), 4000);
        return;
      }

      // Update in Firestore
      await updateTask(taskId, {
        columnId: targetColumnId,
        status: targetStatus,
      });

      await logActivity({
        projectId: selectedProject.id,
        taskId,
        userId: currentUser?.uid || 'user',
        userName: userProfile?.name || 'Colaborador',
        action: `moveu a tarefa para a coluna "${targetCol.title}" via arrastar e soltar`,
        details: currentTask.title,
      });
    };

    const handleClaimTaskFromBoard = async (task: Task) => {
      if (!currentUser?.uid) return;
      try {
        const existing = task.assigneeIds || [];
        if (existing.includes(currentUser.uid)) return;
        const updated = [...existing, currentUser.uid];
        await updateTask(task.id, { assigneeIds: updated });
        await logActivity({
          projectId: selectedProject.id,
          taskId: task.id,
          userId: currentUser.uid,
          userName: userProfile?.name || 'Colaborador',
          action: 'assumiu a tarefa no quadro',
          details: task.title,
        });
      } catch (err) {
        console.error(err);
      }
    };

    const handleAddColumn = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newColumnTitle.trim()) return;
      await createColumn({
        projectId: selectedProject.id,
        boardId: 'default',
        title: newColumnTitle.trim(),
        order: projectColumns.length,
        color: '#EEF2FF',
      });
      setNewColumnTitle('');
      setShowAddColumn(false);
    };

    return (
      <div className="space-y-4">
        {permissionError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between font-semibold shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-amber-100 text-amber-700">⚠️</span>
              <span>{permissionError}</span>
            </div>
            <button
              onClick={() => setPermissionError(null)}
              className="text-amber-700 hover:text-amber-900 text-xs px-2 py-0.5"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Project Header Bar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-[#EAE5F4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-3">
            <button
              onClick={() => onSelectProject(null)}
              className="p-2 text-[#5A5370] hover:text-[#1E1638] hover:bg-[#F5F3FA] rounded-xl transition"
              title="Voltar aos Projetos"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7654C7]/10 text-[#7654C7] uppercase">
                  {selectedProject.department}
                </span>
                <span className="text-xs text-[#958FA5]">&bull;</span>
                <span className="text-xs text-[#5A5370] font-medium">
                  {projectTasks.length} tarefa(s)
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#1E1638] tracking-tight mt-0.5">
                {selectedProject.name}
              </h2>
              {selectedProject.description && (
                <p className="text-xs text-[#5A5370] mt-1 max-w-2xl">
                  {selectedProject.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isManager && (
              <button
                onClick={() => setShowAddColumn(true)}
                className="px-3 py-1.5 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-lg border border-[#DDD7E9] transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova Coluna</span>
              </button>
            )}
            <button
              onClick={() =>
                onOpenNewTaskModalWithContext(
                  selectedProject.id,
                  projectColumns[0]?.id || ''
                )
              }
              className="px-3.5 py-1.5 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Tarefa</span>
            </button>
          </div>
        </div>

        {/* Add Column Inline Modal */}
        {showAddColumn && (
          <div className="p-3 bg-white rounded-xl border border-[#7654C7]/30 shadow-sm flex items-center gap-2 max-w-sm">
            <input
              type="text"
              autoFocus
              placeholder="Nome da coluna (ex: Em Testes)"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-[#DDD7E9] rounded-lg focus:outline-none focus:border-[#7654C7]"
            />
            <button
              onClick={handleAddColumn}
              className="px-3 py-1.5 bg-[#30205D] text-white text-xs font-semibold rounded-lg hover:bg-[#4C3882]"
            >
              Salvar
            </button>
            <button
              onClick={() => setShowAddColumn(false)}
              className="px-2 py-1.5 text-xs text-[#5A5370] hover:text-[#1E1638]"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Kanban Board with DndContext */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start min-h-[550px]">
            {projectColumns.length === 0 ? (
              <div className="w-full text-center py-16 bg-white rounded-2xl border border-dashed border-[#DDD7E9]">
                <FolderKanban className="w-10 h-10 text-[#958FA5] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#1E1638]">Quadro sem colunas configuradas</p>
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="mt-3 px-4 py-2 bg-[#30205D] text-white text-xs font-semibold rounded-lg"
                >
                  Criar Primeira Coluna
                </button>
              </div>
            ) : (
              projectColumns.map((column, colIdx) => {
                const columnTasks = projectTasks.filter((t) => t.columnId === column.id);

                return (
                  <DroppableKanbanColumn
                    key={column.id}
                    column={column}
                    tasks={columnTasks}
                    users={users}
                    currentUserId={currentUser?.uid}
                    onSelectTask={onSelectTask}
                    onAddTask={() =>
                      onOpenNewTaskModalWithContext(selectedProject.id, column.id)
                    }
                    canMovePrev={colIdx > 0}
                    canMoveNext={colIdx < projectColumns.length - 1}
                    onMoveTask={handleMoveTaskColumn}
                    onClaimTask={handleClaimTaskFromBoard}
                  />
                );
              })
            )}
          </div>

          {/* Floating Drag Overlay */}
          <DragOverlay>
            {activeDraggingTask ? (
              <TaskCardPreview task={activeDraggingTask} users={users} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  }

  // Otherwise, render Projects Directory / Catalog!
  const filteredProjects = projects.filter((p) => {
    if (departmentFilter !== 'all' && p.department !== departmentFilter) return false;
    if (searchTerm) {
      const match =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Department Filters */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5F4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setDepartmentFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              departmentFilter === 'all'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Todos os Departamentos
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setDepartmentFilter(d.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                departmentFilter === d.name
                  ? 'bg-[#30205D] text-white shadow-xs'
                  : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F5F3FA] border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7]"
            />
          </div>

          {isManager && (
            <button
              onClick={onOpenNewProjectModal}
              className="px-3.5 py-1.5 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Projeto</span>
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-[#EAE5F4] shadow-xs">
            <FolderKanban className="w-12 h-12 text-[#958FA5] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1E1638]">Nenhum projeto encontrado</h3>
            <p className="text-xs text-[#5A5370] mt-1 max-w-sm mx-auto">
              Não existem projetos para os critérios selecionados.
            </p>
            {isManager && (
              <button
                onClick={onOpenNewProjectModal}
                className="mt-4 px-4 py-2 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-xs transition"
              >
                Criar Novo Projeto
              </button>
            )}
          </div>
        ) : (
          filteredProjects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const doneTasks = projectTasks.filter((t) => t.status === 'done');
            const progress =
              projectTasks.length > 0
                ? Math.round((doneTasks.length / projectTasks.length) * 100)
                : 0;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className="bg-white rounded-2xl p-5 border border-[#EAE5F4] hover:border-[#7654C7]/50 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#7654C7]/10 text-[#7654C7] uppercase">
                      {project.department}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        project.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {project.status === 'active' ? 'Ativo' : 'Concluído'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#1E1638] tracking-tight mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-[#5A5370] line-clamp-2 mb-4">
                    {project.description || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#F5F3FA]">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-[#5A5370]">Progresso</span>
                      <span className="text-[#1E1638]">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#EAE5F4] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-[#7654C7] to-[#30205D] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer details */}
                  <div className="flex items-center justify-between text-xs text-[#5A5370]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#958FA5]" />
                      <span className="text-[11px]">
                        {project.dueDate
                          ? new Date(project.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')
                          : 'Sem prazo'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-[#7654C7] text-xs">
                      <span>Abrir Quadro</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
