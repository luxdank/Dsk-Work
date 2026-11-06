import React, { useState } from 'react';
import {
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  User,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginView: React.FC = () => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'first_access'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recovery modal state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (mode === 'first_access') {
        if (password.length < 6) {
          setError('A senha deve ter no mínimo 6 caracteres.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email.trim(), password, name.trim() || undefined);
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      const code = err?.code;
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (code === 'auth/email-already-in-use') {
        setError('Este e-mail já possui cadastro. Utilize a aba "Entrar".');
      } else if (code === 'auth/weak-password') {
        setError('A senha deve conter no mínimo 6 caracteres.');
      } else if (code === 'auth/too-many-requests') {
        setError('Muitas tentativas sem sucesso. Tente novamente em alguns instantes.');
      } else if (code === 'auth/operation-not-allowed') {
        setError(
          'O provedor E-mail/Senha não está ativado no Firebase Console. Utilize a "Conta Google Corporativa" para entrar.'
        );
      } else {
        setError(err?.message || 'Falha na autenticação. Verifique os dados informados.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar login com o Google.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetError('Informe seu e-mail corporativo.');
      return;
    }

    try {
      setResetLoading(true);
      setResetError(null);
      await resetPassword(resetEmail.trim());
      setResetSuccess(true);
    } catch (err: any) {
      setResetError('Não foi possível enviar o e-mail de recuperação. Verifique o endereço.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-[#7654C7]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#30205D]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl shadow-[#30205D]/10 border border-[#EAE5F4] mb-3 transform hover:scale-105 transition">
            <img
              src="/assets/aistudio/Logo_tecnol_gico_Dsk_Work_em_azul_e_roxo_56a1e2ae.png"
              alt="DK Work"
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-sm text-[#5A5370] font-medium">
            Gerenciamento profissional de projetos e tarefas
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-[#30205D]/5 border border-[#EAE5F4] p-8">
          {/* Tabs: Entrar vs Primeiro Acesso */}
          <div className="flex rounded-xl bg-[#F5F3FA] p-1 border border-[#EAE5F4] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'login'
                  ? 'bg-white text-[#30205D] shadow-xs'
                  : 'text-[#5A5370] hover:text-[#1E1638]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('first_access');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                mode === 'first_access'
                  ? 'bg-white text-[#30205D] shadow-xs'
                  : 'text-[#5A5370] hover:text-[#1E1638]'
              }`}
            >
              Primeiro Acesso
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#1E1638]">
              {mode === 'login' ? 'Acesse sua conta' : 'Ativação de Conta'}
            </h2>
            <p className="text-xs text-[#5A5370] mt-1">
              {mode === 'login'
                ? 'Insira suas credenciais corporativas para entrar na plataforma.'
                : 'Defina suas credenciais de acesso corporativo.'}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field in first access mode */}
            {mode === 'first_access' && (
              <div>
                <label className="block text-xs font-semibold text-[#1E1638] mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#958FA5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Seu Nome Completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD7E9] rounded-lg text-sm text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7] focus:ring-3 focus:ring-[#7654C7]/15 transition"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#1E1638] mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#958FA5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD7E9] rounded-lg text-sm text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7] focus:ring-3 focus:ring-[#7654C7]/15 transition"
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#1E1638]">
                  Senha
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetModal(true);
                      setResetEmail(email);
                      setResetSuccess(false);
                      setResetError(null);
                    }}
                    className="text-xs font-medium text-[#7654C7] hover:text-[#30205D] transition"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#958FA5] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-[#DDD7E9] rounded-lg text-sm text-[#1E1638] placeholder-[#958FA5] focus:outline-none focus:border-[#7654C7] focus:ring-3 focus:ring-[#7654C7]/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#958FA5] hover:text-[#5A5370] transition p-0.5"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-[#30205D] hover:bg-[#4C3882] disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-md shadow-[#30205D]/20 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Entrar no DK Work' : 'Ativar Acesso'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE5F4]" />
            </div>
            <span className="relative bg-white px-3 text-xs text-[#958FA5] uppercase tracking-wider font-medium">
              Ou acesse com
            </span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#F5F3FA] border border-[#DDD7E9] text-[#1E1638] text-sm font-semibold rounded-lg transition flex items-center justify-center gap-2.5 shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Conta Google Corporativa</span>
          </button>

          {/* Registration Notice */}
          <div className="mt-6 pt-5 border-t border-[#EAE5F4] flex items-start gap-2.5 text-[11px] text-[#5A5370]">
            <ShieldAlert className="w-4 h-4 text-[#7654C7] shrink-0 mt-0.5" />
            <p>
              <strong>Controle de Acesso:</strong> Plataforma corporativa fechada. Se for seu primeiro acesso ao sistema, utilize a aba "Primeiro Acesso" ou acesse com sua conta Google.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-[#958FA5] mt-6">
          DK Work &bull; Ambiente Seguro e Protegido
        </p>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#EAE5F4] shadow-2xl">
            <h3 className="text-lg font-bold text-[#1E1638] mb-1">
              Recuperação de Senha
            </h3>
            <p className="text-xs text-[#5A5370] mb-4">
              Informe seu e-mail cadastrado para receber instruções de redefinição de senha.
            </p>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  E-mail de recuperação enviado!
                </div>
                <p>
                  Verifique sua caixa de entrada (e pasta de spam) para redefinir sua senha.
                </p>
                <button
                  onClick={() => setShowResetModal(false)}
                  className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                {resetError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {resetError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-[#1E1638] mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7E9] rounded-lg text-sm text-[#1E1638] focus:outline-none focus:border-[#7654C7] focus:ring-2 focus:ring-[#7654C7]/20"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#5A5370] hover:bg-[#F5F3FA] rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#30205D] hover:bg-[#4C3882] rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    {resetLoading ? 'Enviando...' : 'Enviar Instruções'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
