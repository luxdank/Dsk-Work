import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import type { Task, Project } from '../types';

interface CalendarViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, projects, onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Calculate days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Build grid days
  const calendarDays: Array<{ day: number; dateString: string; isCurrentMonth: boolean }> = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    calendarDays.push({
      day: d,
      dateString: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    calendarDays.push({
      day: d,
      dateString: `${year}-${monthStr}-${dayStr}`,
      isCurrentMonth: true,
    });
  }

  // Next month padding to complete 35 or 42 cells
  const remaining = (7 - (calendarDays.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      day: d,
      dateString: `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  const todayString = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5F4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#7654C7]/10 text-[#7654C7] rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1E1638] tracking-tight">
              {monthNames[month]} de {year}
            </h2>
            <p className="text-xs text-[#5A5370]">Mapeamento cronológico de entregas e prazos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={today}
            className="px-3 py-1.5 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-lg border border-[#DDD7E9] transition"
          >
            Hoje
          </button>
          <div className="flex items-center gap-1 border border-[#DDD7E9] rounded-lg p-0.5 bg-[#F5F3FA]">
            <button
              onClick={prevMonth}
              className="p-1 hover:bg-white rounded text-[#5A5370] hover:text-[#1E1638] transition"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 hover:bg-white rounded text-[#5A5370] hover:text-[#1E1638] transition"
              title="Próximo Mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-[#EAE5F4] shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#EAE5F4] bg-[#F5F3FA]/70 text-center">
          {daysOfWeek.map((day, idx) => (
            <div key={idx} className="py-2.5 text-xs font-bold text-[#5A5370] uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#EAE5F4]">
          {calendarDays.map((cell, idx) => {
            const dayTasks = tasks.filter((t) => t.dueDate === cell.dateString);
            const isToday = cell.dateString === todayString;

            return (
              <div
                key={idx}
                className={`min-h-[110px] p-2 flex flex-col justify-between transition ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-[#FAF8FF]/40 text-[#958FA5]'
                } ${isToday ? 'bg-[#7654C7]/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-[#30205D] text-white shadow-xs'
                        : cell.isCurrentMonth
                        ? 'text-[#1E1638]'
                        : 'text-[#958FA5]'
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-[#7654C7]">
                      {dayTasks.length} entrega(s)
                    </span>
                  )}
                </div>

                {/* Tasks pills */}
                <div className="space-y-1 my-1 overflow-y-auto max-h-20">
                  {dayTasks.slice(0, 3).map((task) => {
                    const isDone = task.status === 'done';
                    return (
                      <button
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition ${
                          isDone
                            ? 'bg-emerald-50 text-emerald-700 line-through'
                            : 'bg-[#7654C7]/10 text-[#30205D] hover:bg-[#7654C7]/20 font-semibold'
                        }`}
                        title={task.title}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isDone ? 'bg-emerald-500' : 'bg-[#7654C7]'
                          }`}
                        />
                        <span className="truncate">{task.title}</span>
                      </button>
                    );
                  })}
                  {dayTasks.length > 3 && (
                    <p className="text-[9px] text-[#958FA5] font-semibold text-center">
                      +{dayTasks.length - 3} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
