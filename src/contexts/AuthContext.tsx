import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider, testConnection } from '../lib/firebase';
import {
  subscribeUserProfile,
  setUserProfile,
  subscribeAllUsers,
  initializeDefaultDepartments,
} from '../services/firestoreService';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isCollaborator: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  createMemberProfile: (data: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    position: string;
    photoUrl?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin bootstrap email from runtime environment
const BOOTSTRAP_ADMIN_EMAIL = 'lhgsdos@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Test server connectivity on startup as mandated by skill
  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);

      if (fbUser) {
        // Subscribe to user profile from Firestore
        unsubscribeProfile = subscribeUserProfile(fbUser.uid, async (profile) => {
          if (!profile) {
            // First time login for this user: auto-create initial profile
            const isBootstrappedAdmin =
              fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

            const initialRole: UserRole = isBootstrappedAdmin ? 'admin' : 'colaborador';
            const newProfile: Partial<UserProfile> = {
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Colaborador',
              email: fbUser.email || '',
              role: initialRole,
              department: isBootstrappedAdmin ? 'Administrativo' : 'Tecnologia',
              position: isBootstrappedAdmin ? 'Administrador Geral' : 'Colaborador',
              photoUrl: fbUser.photoURL || '',
              createdAt: new Date().toISOString(),
            };

            await setUserProfile(fbUser.uid, newProfile);
            // Also seed default departments if it's the admin
            if (isBootstrappedAdmin) {
              await initializeDefaultDepartments();
            }
          } else {
            // Check if bootstrap email should have admin rights enforced
            if (
              fbUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() &&
              profile.role !== 'admin'
            ) {
              await setUserProfile(fbUser.uid, { role: 'admin' });
            }
            setUserProfileState(profile);
          }
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }
        setUserProfileState(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      // If user doesn't exist yet, attempt automatic first-time registration
      if (
        error?.code === 'auth/invalid-credential' ||
        error?.code === 'auth/user-not-found'
      ) {
        try {
          await createUserWithEmailAndPassword(auth, email, pass);
          return;
        } catch (createError: any) {
          if (createError?.code === 'auth/email-already-in-use') {
            throw new Error('E-mail ou senha incorretos. Verifique suas credenciais.');
          }
          if (createError?.code === 'auth/operation-not-allowed') {
            throw new Error(
              'O provedor E-mail/Senha não está ativado no Firebase Console. Utilize a "Conta Google Corporativa" para entrar.'
            );
          }
          if (createError?.code === 'auth/weak-password') {
            throw new Error('A senha deve conter no mínimo 6 caracteres.');
          }
          throw error;
        }
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await setUserProfile(cred.user.uid, {
        name,
        email,
        role: email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'colaborador',
        department: 'Tecnologia',
        position: 'Colaborador',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const createMemberProfile = async (data: {
    id?: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    position: string;
    photoUrl?: string;
  }) => {
    const memberId = data.id || `member_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    await setUserProfile(memberId, {
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
      position: data.position,
      photoUrl: data.photoUrl || '',
      createdAt: new Date().toISOString(),
    });
  };

  const isAdmin =
    userProfile?.role === 'admin' ||
    currentUser?.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
  const isManager = isAdmin || userProfile?.role === 'gestor';
  const isCollaborator = !isAdmin && !isManager;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isAdmin,
        isManager,
        isCollaborator,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        createMemberProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
