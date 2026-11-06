import React from 'react';
import type { TaskPriority, TaskStatus, UserRole } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'status' | 'priority' | 'role' | 'default';
  status?: TaskStatus;
  priority?: TaskPriority;
  role?: UserRole;
}

export const StatusBadge: React.FC<{ status: TaskStatus; className?: string }> = ({ status, className = '' }) => {
  const configs: Record<TaskStatus, { label: string; bg: string; text: string; border: string }> = {
    backlog: {
      label: 'Backlog',
      bg: 'bg-[#ECEAF2]',
      text: 'text-[#5A5370]',
      border: 'border-[#DCD7E6]',
    },
    todo: {
      label: 'A Fazer',
      bg: 'bg-[#EEF2FF]',
      text: 'text-[#3730A3]',
      border: 'border-[#C7D2FE]',
    },
    in_progress: {
      label: 'Em Andamento',
      bg: 'bg-[#F4EFFE]',
      text: 'text-[#5925DC]',
      border: 'border-[#DDD0FC]',
    },
    review: {
      label: 'Em Revisão',
      bg: 'bg-[#FEF6EE]',
      text: 'text-[#B54708]',
      border: 'border-[#F9DBAF]',
    },
    done: {
      label: 'Concluído',
      bg: 'bg-[#ECFDF3]',
      text: 'text-[#027A48]',
      border: 'border-[#A6F4C5]',
    },
  };

  const c = configs[status] || configs.todo;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      {c.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  const configs: Record<TaskPriority, { label: string; bg: string; text: string; dot: string }> = {
    low: {
      label: 'Baixa',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      text: 'text-slate-700',
      dot: 'bg-slate-400',
    },
    medium: {
      label: 'Média',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
    },
    high: {
      label: 'Alta',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    urgent: {
      label: 'Urgente',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
    },
  };

  const c = configs[priority] || configs.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border ${c.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({ role, className = '' }) => {
  const configs: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
    admin: {
      label: 'Administrador',
      bg: 'bg-[#30205D] text-white',
      text: 'text-white',
      border: 'border-[#30205D]',
    },
    gestor: {
      label: 'Gestor',
      bg: 'bg-[#7654C7]/15 text-[#7654C7]',
      text: 'text-[#7654C7]',
      border: 'border-[#7654C7]/30',
    },
    colaborador: {
      label: 'Colaborador',
      bg: 'bg-slate-100 text-slate-700',
      text: 'text-slate-700',
      border: 'border-slate-200',
    },
  };

  const c = configs[role] || configs.colaborador;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${c.bg} ${c.border} ${className}`}
    >
      {c.label}
    </span>
  );
};
