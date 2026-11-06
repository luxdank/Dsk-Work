export type UserRole = 'admin' | 'gestor' | 'colaborador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  color?: string;
  leaderId?: string;
  createdAt: string;
}

export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  department: string;
  status: ProjectStatus;
  ownerId: string;
  memberIds: string[];
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  roleInProject: 'manager' | 'member' | 'viewer';
  joinedAt: string;
}

export interface Board {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  projectId: string;
  title: string;
  order: number;
  color?: string;
  createdAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  projectId: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeIds: string[];
  dueDate?: string;
  tags?: string[];
  order: number;
  checklistTotal?: number;
  checklistCompleted?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: string;
}

export type NotificationType = 'task_assigned' | 'status_changed' | 'mention' | 'deadline' | 'general';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  userName: string;
  action: string;
  details?: string;
  createdAt: string;
}
