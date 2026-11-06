import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  Tag,
  CheckCheck,
} from 'lucide-react';
import { markNotificationRead } from '../services/firestoreService';
import type { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onNavigateToProjects?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onNavigateToProjects,
}) => {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const filtered = notifications.filter((n) => (filterUnreadOnly ? !n.read : true));

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const notif of unread) {
      await markNotificationRead(notif.id);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task_assigned':
        return <CheckCircle2 className="w-4 h-4 text-[#7654C7]" />;
      case 'status_changed':
        return <Clock className="w-4 h-4 text-[#5925DC]" />;
      case 'mention':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'deadline':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#30205D]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5F4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterUnreadOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              !filterUnreadOnly
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Todas ({notifications.length})
          </button>
          <button
            onClick={() => setFilterUnreadOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterUnreadOnly
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Não Lidas ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-1.5 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-lg border border-[#DDD7E9] transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Marcar Todas como Lidas</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#EAE5F4] shadow-xs">
            <Bell className="w-12 h-12 text-[#958FA5] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1E1638]">Nenhuma notificação encontrada</h3>
            <p className="text-xs text-[#5A5370] mt-1 max-w-sm mx-auto">
              Você está em dia com todas as atualizações de tarefas e projetos.
            </p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-3 ${
                notif.read
                  ? 'bg-white border-[#EAE5F4]'
                  : 'bg-[#F4EFFE]/40 border-[#DDD0FC]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white border border-[#DDD7E9] shrink-0 mt-0.5">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#1E1638]">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#7654C7]" />
                    )}
                  </div>
                  <p className="text-xs text-[#5A5370] mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-[#958FA5] mt-1.5 block font-medium">
                    {new Date(notif.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={() => markNotificationRead(notif.id)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#7654C7] hover:bg-white rounded-lg transition border border-transparent hover:border-[#DDD7E9]"
                >
                  Marcar como lida
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
