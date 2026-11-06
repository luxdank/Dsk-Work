import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Building2, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createProject, logActivity } from '../../services/firestoreService';
import type { Department, UserProfile, Project } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  users: UserProfile[];
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  departments,
  users,
}) => {
  const { currentUser, userProfile } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setName('');
      setDescription('');
      setStartDate('');
      setDueDate('');
      setDepartment(departments[0]?.name || 'Tecnologia');
      setMemberIds(currentUser?.uid ? [currentUser.uid] : []);
    }
  }, [isOpen, departments, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do projeto é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const ownerId = currentUser?.uid || 'anonymous';
      const finalMemberIds = Array.from(new Set([...memberIds, ownerId]));

      const projectPayload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        description: description.trim(),
        department: department || departments[0]?.name || 'Geral',
        status: 'active',
        ownerId,
        memberIds: finalMemberIds,
      };
      if (startDate && startDate.trim()) projectPayload.startDate = startDate.trim();
      if (dueDate && dueDate.trim()) projectPayload.dueDate = dueDate.trim();

      const newProjectId = await createProject(projectPayload);

      await logActivity({
        projectId: newProjectId,
        userId: ownerId,
        userName: userProfile?.name || 'Administrador',
        action: 'criou o projeto',
        details: name.trim(),
      });

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Falha ao criar o projeto.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (userId: string) => {
    setMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#EAE5F4] shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5F4]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#7654C7]/10 rounded-xl text-[#7654C7]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1E1638]">Novo Projeto</h3>
              <p className="text-xs text-[#5A5370]">Crie um espaço de trabalho com quadro Kanban</p>
            </div>
          </div>
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
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1638] mb-1">
              Nome do Projeto *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Redesign Portal do Cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7E9] rounded-lg text-sm text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7] focus:ring-2 focus:ring-[#7654C7]/20 font-medium"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1638] mb-1">
              Departamento Responsável
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7] font-medium"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
                {departments.length === 0 && <option value="Geral">Geral</option>}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1638] mb-1">
              Descrição do Projeto
            </label>
            <textarea
              rows={3}
              placeholder="Objetivos, escopo e entregáveis principais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7] resize-none"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Data de Início
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Prazo Final
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
          </div>

          {/* Members Multi-select */}
          <div>
            <label className="block text-xs font-semibold text-[#1E1638] mb-1.5 flex items-center justify-between">
              <span>Membros do Projeto</span>
              <span className="text-[11px] text-[#958FA5]">
                {memberIds.length} selecionado(s)
              </span>
            </label>
            <div className="max-h-36 overflow-y-auto p-2 bg-[#F5F3FA] rounded-xl border border-[#DDD7E9] space-y-1">
              {users.map((u) => {
                const isSelected = memberIds.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleMember(u.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition ${
                      isSelected
                        ? 'bg-[#7654C7]/15 text-[#30205D] font-semibold border border-[#7654C7]/30'
                        : 'bg-white text-[#5A5370] hover:bg-slate-100 border border-[#EAE5F4]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#7654C7] text-white text-[10px] font-bold flex items-center justify-center">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <span>{u.name}</span>
                      <span className="text-[10px] text-[#958FA5]">({u.position || u.role})</span>
                    </div>
                    <span className="text-xs">{isSelected ? '✓ Adicionado' : '+ Incluir'}</span>
                  </button>
                );
              })}
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
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#30205D] hover:bg-[#4C3882] rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Criando Projeto...' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
