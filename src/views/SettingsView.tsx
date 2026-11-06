import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  Sparkles,
  User,
  Shield,
  Save,
  Database,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  initializeDefaultDepartments,
  setUserProfile,
  logActivity,
} from '../services/firestoreService';
import { RoleBadge } from '../components/common/Badge';
import type { Department } from '../types';

interface SettingsViewProps {
  departments: Department[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({ departments }) => {
  const { currentUser, userProfile, isAdmin } = useAuth();

  // Profile Form state
  const [name, setName] = useState(userProfile?.name || '');
  const [position, setPosition] = useState(userProfile?.position || '');
  const [department, setDepartment] = useState(
    userProfile?.department || (departments[0]?.name ?? 'Tecnologia')
  );
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Sync state if userProfile updates
  React.useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setName(userProfile.name);
      if (userProfile.position) setPosition(userProfile.position);
      if (userProfile.department) setDepartment(userProfile.department);
    } else if (departments.length > 0 && !department) {
      setDepartment(departments[0].name);
    }
  }, [userProfile, departments]);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptColor, setDeptColor] = useState('#7654C7');
  const [savingDept, setSavingDept] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;

    try {
      setSavingProfile(true);
      await setUserProfile(currentUser.uid, {
        name: name.trim(),
        position: position.trim(),
        department: department.trim(),
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleOpenAddDept = () => {
    setEditingDeptId(null);
    setDeptName('');
    setDeptDesc('');
    setDeptColor('#7654C7');
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name);
    setDeptDesc(dept.description || '');
    setDeptColor(dept.color || '#7654C7');
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    try {
      setSavingDept(true);
      if (editingDeptId) {
        await updateDepartment(editingDeptId, {
          name: deptName.trim(),
          description: deptDesc.trim(),
          color: deptColor,
        });
      } else {
        await createDepartment({
          name: deptName.trim(),
          description: deptDesc.trim(),
          color: deptColor,
        });
      }
      setIsDeptModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDept(false);
    }
  };

  const handleDeleteDept = async (id: string, deptTitle: string) => {
    if (!confirm(`Tem certeza de que deseja remover o departamento "${deptTitle}"?`)) return;
    try {
      await deleteDepartment(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      await initializeDefaultDepartments();
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Profile Settings */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAE5F4]">
          <div className="p-2 bg-[#7654C7]/10 text-[#7654C7] rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E1638]">Perfil do Colaborador</h3>
            <p className="text-xs text-[#5A5370]">Suas informações cadastrais no DK Work</p>
          </div>
        </div>

        {profileSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Perfil atualizado com sucesso!
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="mt-4 space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                E-mail (Autenticado)
              </label>
              <input
                type="text"
                disabled
                value={currentUser?.email || ''}
                className="w-full px-3.5 py-2 bg-[#F5F3FA] border border-[#DDD7E9] rounded-lg text-xs text-[#958FA5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Cargo / Função
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Ex: Gestor de Projetos"
                className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                Equipe / Departamento
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
              >
                {departments.length === 0 ? (
                  <option value={department}>{department || 'Geral'}</option>
                ) : (
                  departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div>
              <span className="block text-xs font-semibold text-[#1E1638] mb-1">
                Nível de Acesso
              </span>
              <div>
                <RoleBadge role={userProfile?.role || 'colaborador'} />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? 'Salvando...' : 'Salvar Perfil'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Departments Management Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE5F4] gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#30205D]/10 text-[#30205D] rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1E1638]">Departamentos Corporativos</h3>
              <p className="text-xs text-[#5A5370]">
                Configure as áreas de negócio (Marketing, Comercial, Tecnologia, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {departments.length === 0 && (
              <button
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="px-3 py-1.5 bg-[#F5F3FA] hover:bg-[#ECE7F6] text-[#30205D] text-xs font-semibold rounded-lg border border-[#DDD7E9] transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#7654C7]" />
                <span>{seeding ? 'Inicializando...' : 'Inicializar Departamentos Padrão'}</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={handleOpenAddDept}
                className="px-3.5 py-1.5 bg-[#30205D] hover:bg-[#4C3882] text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Cadastrar Departamento</span>
              </button>
            )}
          </div>
        </div>

        {/* Departments List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
          {departments.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-[#F5F3FA] rounded-xl border border-dashed border-[#DDD7E9]">
              <Building2 className="w-8 h-8 text-[#958FA5] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#1E1638]">Nenhum departamento cadastrado</p>
              <p className="text-[11px] text-[#5A5370] mt-0.5">
                Clique em "Inicializar Departamentos Padrão" para carregar a estrutura inicial de 7 departamentos.
              </p>
              <button
                onClick={handleSeedDefaults}
                className="mt-3 px-3.5 py-1.5 bg-[#30205D] text-white text-xs font-semibold rounded-lg"
              >
                Inicializar Agora
              </button>
            </div>
          ) : (
            departments.map((dept) => (
              <div
                key={dept.id}
                className="p-4 rounded-xl border border-[#EAE5F4] bg-[#F5F3FA]/50 hover:bg-white hover:border-[#7654C7]/40 transition flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dept.color || '#7654C7' }}
                    />
                    <h4 className="text-xs font-bold text-[#1E1638] uppercase tracking-wide">
                      {dept.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#5A5370] leading-snug">
                    {dept.description || 'Sem descrição informada.'}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditDept(dept)}
                      className="p-1 text-[#958FA5] hover:text-[#30205D] rounded transition"
                      title="Editar Departamento"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDept(dept.id, dept.name)}
                      className="p-1 text-[#958FA5] hover:text-rose-500 rounded transition"
                      title="Excluir Departamento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* System & Architecture Info */}
      <div className="bg-white rounded-2xl p-6 border border-[#EAE5F4] shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[#EAE5F4]">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1E1638]">Status da Infraestrutura DK Work</h3>
            <p className="text-xs text-[#5A5370]">Conexão nativa Google AI Studio e Cloud Firestore</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4 text-xs">
          <div className="p-3 bg-[#F5F3FA] rounded-xl border border-[#DDD7E9]">
            <span className="text-[#958FA5] block font-medium">Autenticação:</span>
            <span className="font-bold text-[#027A48] flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Firebase Auth (Ativo)
            </span>
          </div>

          <div className="p-3 bg-[#F5F3FA] rounded-xl border border-[#DDD7E9]">
            <span className="text-[#958FA5] block font-medium">Banco de Dados:</span>
            <span className="font-bold text-[#027A48] flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cloud Firestore (Tempo Real)
            </span>
          </div>

          <div className="p-3 bg-[#F5F3FA] rounded-xl border border-[#DDD7E9]">
            <span className="text-[#958FA5] block font-medium">Segurança & Regras:</span>
            <span className="font-bold text-[#027A48] flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              RBAC Firestore Rules
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#EAE5F4] shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5F4]">
              <h3 className="text-lg font-bold text-[#1E1638]">
                {editingDeptId ? 'Editar Departamento' : 'Novo Departamento'}
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1.5 rounded-lg text-[#958FA5] hover:text-[#1E1638] hover:bg-[#F5F3FA] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                  Nome do Departamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Suporte Técnico"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                  Descrição das Atividades
                </label>
                <textarea
                  rows={3}
                  placeholder="Escopo de atuação do departamento..."
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#DDD7E9] rounded-lg text-xs text-[#1E1638] focus:outline-none focus:border-[#7654C7] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={deptColor}
                    onChange={(e) => setDeptColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-[#DDD7E9] p-0.5 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={deptColor}
                    onChange={(e) => setDeptColor(e.target.value)}
                    className="w-32 px-3 py-1.5 text-xs border border-[#DDD7E9] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE5F4]">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5A5370] hover:bg-[#F5F3FA] rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingDept}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#30205D] hover:bg-[#4C3882] rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {savingDept ? 'Salvando...' : editingDeptId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
