import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import type {
  Department,
  UserProfile,
  Project,
  Column,
  Task,
  ChecklistItem,
  Comment,
  NotificationItem,
  ActivityLog,
  TaskStatus,
} from '../types';

// Utility to strip undefined properties before sending to Firestore
export function cleanUndefined<T extends Record<string, any>>(data: T): Partial<T> {
  const result: any = {};
  for (const key of Object.keys(data)) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  return result;
}

// ==========================================
// DEPARTMENTS
// ==========================================
const DEFAULT_DEPARTMENTS = [
  { name: 'Marketing', description: 'Gestão de campanhas, branding e redes sociais', color: '#8B5CF6' },
  { name: 'Comercial', description: 'Vendas, negociações e prospecção de clientes', color: '#EC4899' },
  { name: 'Atendimento', description: 'Relacionamento com o cliente e pós-venda', color: '#3B82F6' },
  { name: 'Suporte Técnico', description: 'Resolução de chamados técnicos e dúvidas de usuários', color: '#06B6D4' },
  { name: 'Financeiro', description: 'Contabilidade, fluxo de caixa e faturamento', color: '#10B981' },
  { name: 'Tecnologia', description: 'Desenvolvimento de software, infraestrutura e inovação', color: '#6366F1' },
  { name: 'Administrativo', description: 'Operações internas, facilities e RH corporativo', color: '#F59E0B' },
];

export function subscribeDepartments(callback: (departments: Department[]) => void): () => void {
  const path = 'departments';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const departments: Department[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Department, 'id'>),
        }));
        callback(departments);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createDepartment(dept: Omit<Department, 'id' | 'createdAt'>): Promise<string> {
  const path = 'departments';
  try {
    const payload = cleanUndefined({
      ...dept,
      createdAt: new Date().toISOString(),
    });
    const docRef = await addDoc(collection(db, path), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateDepartment(id: string, dept: Partial<Department>): Promise<void> {
  const path = `departments/${id}`;
  try {
    const payload = cleanUndefined(dept);
    await updateDoc(doc(db, 'departments', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteDepartment(id: string): Promise<void> {
  const path = `departments/${id}`;
  try {
    await deleteDoc(doc(db, 'departments', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function initializeDefaultDepartments(): Promise<void> {
  const path = 'departments';
  try {
    const existing = await getDocs(collection(db, path));
    if (existing.empty) {
      for (const dept of DEFAULT_DEPARTMENTS) {
        await addDoc(collection(db, path), {
          ...dept,
          createdAt: new Date().toISOString(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// USERS & PROFILES
// ==========================================
export function subscribeUserProfile(userId: string, callback: (user: UserProfile | null) => void): () => void {
  const path = `users/${userId}`;
  try {
    return onSnapshot(
      doc(db, 'users', userId),
      (docSnap) => {
        if (docSnap.exists()) {
          callback({ id: docSnap.id, ...(docSnap.data() as Omit<UserProfile, 'id'>) });
        } else {
          callback(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeAllUsers(callback: (users: UserProfile[]) => void): () => void {
  const path = 'users';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const users: UserProfile[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<UserProfile, 'id'>),
        }));
        callback(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function setUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const payload = cleanUndefined({
      ...data,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'users', userId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// PROJECTS
// ==========================================
export function subscribeProjects(callback: (projects: Project[]) => void): () => void {
  const path = 'projects';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const projects: Project[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Project, 'id'>),
        }));
        callback(projects);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const path = 'projects';
  try {
    const payload = cleanUndefined({
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const docRef = await addDoc(collection(db, path), payload);
    // Create standard default board & columns for this project
    await initializeProjectKanban(docRef.id);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProject(id: string, projectData: Partial<Project>): Promise<void> {
  const path = `projects/${id}`;
  try {
    const payload = cleanUndefined({
      ...projectData,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'projects', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// COLUMNS & KANBAN
// ==========================================
const DEFAULT_COLUMNS = [
  { title: 'Backlog', order: 0, color: '#ECEAF2' },
  { title: 'A Fazer', order: 1, color: '#EEF2FF' },
  { title: 'Em Andamento', order: 2, color: '#F4EFFE' },
  { title: 'Em Revisão', order: 3, color: '#FEF6EE' },
  { title: 'Concluído', order: 4, color: '#ECFDF3' },
];

export async function initializeProjectKanban(projectId: string): Promise<void> {
  const path = 'columns';
  try {
    for (const col of DEFAULT_COLUMNS) {
      await addDoc(collection(db, path), {
        projectId,
        boardId: 'default',
        title: col.title,
        order: col.order,
        color: col.color,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeColumns(projectId: string, callback: (cols: Column[]) => void): () => void {
  const path = 'columns';
  try {
    const q = query(collection(db, path), where('projectId', '==', projectId));
    return onSnapshot(
      q,
      (snapshot) => {
        const columns: Column[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Column, 'id'>),
          }))
          .sort((a, b) => a.order - b.order);
        callback(columns);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createColumn(columnData: Omit<Column, 'id' | 'createdAt'>): Promise<string> {
  const path = 'columns';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...columnData,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateColumn(id: string, data: Partial<Column>): Promise<void> {
  const path = `columns/${id}`;
  try {
    await updateDoc(doc(db, 'columns', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteColumn(id: string): Promise<void> {
  const path = `columns/${id}`;
  try {
    await deleteDoc(doc(db, 'columns', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// TASKS
// ==========================================
export function subscribeTasksByProject(projectId: string, callback: (tasks: Task[]) => void): () => void {
  const path = 'tasks';
  try {
    const q = query(collection(db, path), where('projectId', '==', projectId));
    return onSnapshot(
      q,
      (snapshot) => {
        const tasks: Task[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Task, 'id'>),
          }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        callback(tasks);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeAllTasks(callback: (tasks: Task[]) => void): () => void {
  const path = 'tasks';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const tasks: Task[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Task, 'id'>),
        }));
        callback(tasks);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = 'tasks';
  try {
    const payload = cleanUndefined({
      ...taskData,
      checklistTotal: taskData.checklistTotal ?? 0,
      checklistCompleted: taskData.checklistCompleted ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const docRef = await addDoc(collection(db, path), payload);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTask(id: string, taskData: Partial<Task>): Promise<void> {
  const path = `tasks/${id}`;
  try {
    const payload = cleanUndefined({
      ...taskData,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'tasks', id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const path = `tasks/${id}`;
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// CHECKLISTS
// ==========================================
export function subscribeChecklist(taskId: string, callback: (items: ChecklistItem[]) => void): () => void {
  const path = 'checklists';
  try {
    const q = query(collection(db, path), where('taskId', '==', taskId));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ChecklistItem[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ChecklistItem, 'id'>),
          }))
          .sort((a, b) => a.order - b.order);
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addChecklistItem(taskId: string, title: string, currentTotal = 0): Promise<string> {
  const path = 'checklists';
  try {
    const docRef = await addDoc(collection(db, path), {
      taskId,
      title,
      completed: false,
      order: currentTotal,
      createdAt: new Date().toISOString(),
    });
    // Update task counters
    await updateDoc(doc(db, 'tasks', taskId), {
      checklistTotal: currentTotal + 1,
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleChecklistItem(
  itemId: string,
  completed: boolean,
  taskId: string,
  totalItems: ChecklistItem[]
): Promise<void> {
  const path = `checklists/${itemId}`;
  try {
    await updateDoc(doc(db, 'checklists', itemId), { completed });
    const completedCount = totalItems.filter((i) => (i.id === itemId ? completed : i.completed)).length;
    await updateDoc(doc(db, 'tasks', taskId), {
      checklistCompleted: completedCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteChecklistItem(itemId: string, taskId: string, remainingItems: ChecklistItem[]): Promise<void> {
  const path = `checklists/${itemId}`;
  try {
    await deleteDoc(doc(db, 'checklists', itemId));
    const newTotal = remainingItems.length;
    const newCompleted = remainingItems.filter((i) => i.completed).length;
    await updateDoc(doc(db, 'tasks', taskId), {
      checklistTotal: newTotal,
      checklistCompleted: newCompleted,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// COMMENTS
// ==========================================
export function subscribeComments(taskId: string, callback: (comments: Comment[]) => void): () => void {
  const path = 'comments';
  try {
    const q = query(collection(db, path), where('taskId', '==', taskId));
    return onSnapshot(
      q,
      (snapshot) => {
        const comments: Comment[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Comment, 'id'>),
          }))
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        callback(comments);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
  const path = 'comments';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...comment,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================
export function subscribeNotifications(userId: string, callback: (notifs: NotificationItem[]) => void): () => void {
  const path = 'notifications';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const notifs: NotificationItem[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<NotificationItem, 'id'>),
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(notifs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  const path = `notifications/${id}`;
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>): Promise<void> {
  const path = 'notifications';
  try {
    await addDoc(collection(db, path), {
      ...notif,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// ==========================================
// ACTIVITY LOGS
// ==========================================
export async function logActivity(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<void> {
  const path = 'activityLogs';
  try {
    await addDoc(collection(db, path), {
      ...log,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeActivityLogs(callback: (logs: ActivityLog[]) => void, limitCount = 30): () => void {
  const path = 'activityLogs';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const logs: ActivityLog[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ActivityLog, 'id'>),
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limitCount);
        callback(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
