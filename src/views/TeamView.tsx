import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Briefcase,
  Building2,
  Mail,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { setUserProfile, logActivity } from '../services/firestoreService';
import type { UserProfile, UserRole, Department, Task } from '../types';

interface TeamViewProps {
  users: UserProfile[];
  departments: Department[];
  tasks: Task[];
}

export const TeamView: React.FC<TeamViewProps> = ({ users, departments, tasks }) => {
  const { isAdmin, currentUser, userProfile: myProfile, createMemberProfile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Member Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('colaborador');
  const [department, setDepartment] = useState(departments[0]?.name || 'Tecnologia');
  const [position, setPosition] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRole('colaborador');
    setDepartment(departments[0]?.name || 'Tecnologia');
    setPosition('');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setDepartment(user.department || departments[0]?.name || 'Tecnologia');
    setPosition(user.position || '');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setModalError('Nome e e-mail são obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      setModalError(null);

      if (editingUserId) {
        // Update existing profile
        await setUserProfile(editingUserId, {
          name: name.trim(),
          role,
          department,
          position: position.trim(),
        });
        await logActivity({
          userId: currentUser?.uid || 'admin',
          userName: myProfile?.name || 'Administrador',
          action: 'atualizou os dados do colaborador',
          details: name.trim(),
        });
      } else {
        // Create new member profile
        await createMemberProfile({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          department,
          position: position.trim() || 'Colaborador',
        });
        await logActivity({
          userId: currentUser?.uid || 'admin',
          userName: myProfile?.name || 'Administrador',
          action: 'cadastrou um novo colaborador no sistema',
          details: `${name.trim()} (${email.trim()})`,
        });
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setModalError(err?.message || 'Erro ao salvar colaborador.');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (deptFilter !== 'all' && u.department !== deptFilter) return false;
    if (searchTerm) {
      const match =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.position?.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#EAE5F4] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              roleFilter === 'all'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Todos ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              roleFilter === 'admin'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Administradores
          </button>
          <button
            onClick={() => setRoleFilter('gestor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              roleFilter === 'gestor'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Gestores
          </button>
          <button
            onClick={() => setRoleFilter('colaborador')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              roleFilter === 'colaborador'
                ? 'bg-[#30205D] text-white shadow-xs'
                : 'bg-[#F5F3FA] text-[#5A5370] hover:text-[#1E1638]'
            }`}
          >
            Colaboradores
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Department selector */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F5F3FA] border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
          >
            <option value="all">Todos os Departamentos</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Search bar */}
          <div className="relative w-full md:w-56">
            <Search className="w-3.5 h-3.5 text-[#958FA5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F5F3FA] border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7]"
            />
          </div>

          {/* Admin Add Member Button */}
          {isAdmin && (
            <button
              onClick={openAddModal}
              className="px-3.5 py-1.5 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar Colaborador</span>
            </button>
          )}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-[#EAE5F4] shadow-xs">
            <Users className="w-12 h-12 text-[#958FA5] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1E1638]">Nenhum colaborador encontrado</h3>
            <p className="text-xs text-[#5A5370] mt-1 max-w-sm mx-auto">
              Ajuste seus filtros ou adicione novos membros à empresa.
            </p>
            {isAdmin && (
              <button
                onClick={openAddModal}
                className="mt-4 px-4 py-2 bg-[#30205D] text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-[#4C3882] transition"
              >
                Cadastrar Primeiro Colaborador
              </button>
            )}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const userAssignedTasks = tasks.filter((t) => t.assigneeIds?.includes(user.id));
            const completedCount = userAssignedTasks.filter((t) => t.status === 'done').length;

            return (
              <div
                key={user.id}
                className="bg-white rounded-2xl p-5 border border-[#EAE5F4] hover:border-[#7654C7]/40 shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#7654C7] text-white font-bold flex items-center justify-center text-lg overflow-hidden shrink-0 shadow-sm shadow-[#7654C7]/20">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#1E1638] truncate">{user.name}</h4>
                        <p className="text-xs text-[#5A5370] truncate">{user.position || 'Colaborador'}</p>
                        <div className="mt-1">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => openEditModal(user)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#7654C7] bg-[#7654C7]/10 hover:bg-[#7654C7] hover:text-white rounded-lg transition flex items-center gap-1 shrink-0"
                        title="Alterar Nível de Acesso (Administrador / Gestor / Colaborador)"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Nível</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 py-3 border-t border-[#F5F3FA] text-xs">
                    <div className="flex items-center gap-2 text-[#5A5370]">
                      <Mail className="w-3.5 h-3.5 text-[#958FA5]" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#5A5370]">
                      <Building2 className="w-3.5 h-3.5 text-[#958FA5]" />
                      <span>{user.department || 'Geral'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Task Counter */}
                <div className="pt-3 border-t border-[#F5F3FA] flex items-center justify-between text-xs">
                  <span className="text-[#958FA5]">Tarefas Atribuídas:</span>
                  <span className="font-bold text-[#1E1638]">
                    {completedCount}/{userAssignedTasks.length} concluídas
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#EAE5F4] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5F4]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#7654C7]/10 rounded-xl text-[#7654C7]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E1638]">
                    {editingUserId ? 'Editar Colaborador' : 'Novo Colaborador'}
                  </h3>
                  <p className="text-xs text-[#5A5370]">Defina o cargo, departamento e nível de acesso</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#958FA5] hover:text-[#1E1638] hover:bg-[#F5F3FA] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                  E-mail Corporativo *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUserId}
                  placeholder="carlos.silva@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7] disabled:bg-[#F5F3FA] disabled:text-[#958FA5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                    Nível de Acesso *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                  >
                    <option value="colaborador">Colaborador</option>
                    <option value="gestor">Gestor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                    Departamento *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
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

              <div>
                <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                  Cargo / Função
                </label>
                <input
                  type="text"
                  placeholder="Ex: Desenvolvedor Frontend Sênior"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE5F4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A5370] hover:bg-[#F5F3FA] rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#30205D] hover:bg-[#4C3882] rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingUserId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
