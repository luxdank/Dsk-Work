/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { MyTasksView } from './views/MyTasksView';
import { ProjectsView } from './views/ProjectsView';
import { TeamView } from './views/TeamView';
import { CalendarView } from './views/CalendarView';
import { ReportsView } from './views/ReportsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { CreateProjectModal } from './components/modals/CreateProjectModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import {
  subscribeProjects,
  subscribeAllTasks,
  subscribeDepartments,
  subscribeAllUsers,
  subscribeColumns,
  subscribeNotifications,
} from './services/firestoreService';
import type {
  Project,
  Task,
  Department,
  UserProfile,
  Column,
  NotificationItem,
} from './types';
import { Layers } from 'lucide-react';

function AppContent() {
  const { currentUser, loading, userProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Project selection for Kanban view
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Firestore Real-Time Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals state
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [taskModalContext, setTaskModalContext] = useState<{
    projectId?: string;
    columnId?: string;
  }>({});
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Task | null>(null);

  // Subscriptions when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubProjects = subscribeProjects((projs) => setProjects(projs));
    const unsubTasks = subscribeAllTasks((tsks) => setTasks(tsks));
    const unsubDepts = subscribeDepartments((depts) => setDepartments(depts));
    const unsubUsers = subscribeAllUsers((usrs) => setUsers(usrs));
    const unsubNotifs = subscribeNotifications(currentUser.uid, (notifs) =>
      setNotifications(notifs)
    );

    return () => {
      unsubProjects();
      unsubTasks();
      unsubDepts();
      unsubUsers();
      unsubNotifs();
    };
  }, [currentUser]);

  // Subscribe to columns for selected project or active projects
  useEffect(() => {
    if (!currentUser) return;
    if (selectedProjectId) {
      const unsub = subscribeColumns(selectedProjectId, (cols) => {
        setColumns((prev) => [
          ...prev.filter((c) => c.projectId !== selectedProjectId),
          ...cols,
        ]);
      });
      return () => unsub();
    } else {
      // Subscribe to columns for all active projects
      const unsubs = projects.map((p) =>
        subscribeColumns(p.id, (cols) => {
          setColumns((prev) => [...prev.filter((c) => c.projectId !== p.id), ...cols]);
        })
      );
      return () => unsubs.forEach((unsub) => unsub());
    }
  }, [currentUser, selectedProjectId, projects.length]);

  // Keep selected task updated in real-time when it changes in Firestore
  useEffect(() => {
    if (selectedTaskDetail) {
      const updated = tasks.find((t) => t.id === selectedTaskDetail.id);
      if (updated) setSelectedTaskDetail(updated);
    }
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3FA] flex flex-col items-center justify-center p-4">
        <div className="p-4 rounded-2xl bg-white shadow-xl shadow-[#30205D]/10 border border-[#EAE5F4] mb-3 animate-pulse">
          <img
            src="/assets/aistudio/Logo_tecnol_gico_Dsk_Work_em_azul_e_roxo_56a1e2ae.png"
            alt="DK Work"
            className="h-12 w-auto object-contain"
          />
        </div>
        <p className="text-xs text-[#5A5370]">Carregando ambiente de trabalho...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView />;
  }

  const handleOpenNewTaskWithContext = (projectId: string, columnId: string) => {
    setTaskModalContext({ projectId, columnId });
    setIsNewTaskModalOpen(true);
  };

  const handleNavigateToProjects = () => {
    setSelectedProjectId(null);
    setActiveTab('projects');
  };

  const handleNavigateToMyTasks = () => {
    setActiveTab('my-tasks');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F5F3FA] flex text-[#1E1638]">
      {/* Lateral Fixed Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'projects') setSelectedProjectId(null);
          setActiveTab(tab);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        unreadCount={unreadNotificationsCount}
      />

      {/* Main Content Pane */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsSidebarOpen(true)}
          onOpenNewTaskModal={() => {
            setTaskModalContext({ projectId: selectedProjectId || undefined });
            setIsNewTaskModalOpen(true);
          }}
          onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          unreadCount={unreadNotificationsCount}
          onOpenNotifications={() => setActiveTab('notifications')}
        />

        {/* View Content Canvas */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              onSelectProject={(id) => {
                setSelectedProjectId(id);
                setActiveTab('projects');
              }}
              onOpenNewTaskModal={() => {
                setTaskModalContext({});
                setIsNewTaskModalOpen(true);
              }}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onNavigateToProjects={handleNavigateToProjects}
              onNavigateToMyTasks={handleNavigateToMyTasks}
            />
          )}

          {activeTab === 'my-tasks' && (
            <MyTasksView
              tasks={tasks}
              projects={projects}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
              onOpenNewTaskModal={() => {
                setTaskModalContext({});
                setIsNewTaskModalOpen(true);
              }}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              columns={columns}
              tasks={tasks}
              users={users}
              departments={departments}
              onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
              onOpenNewTaskModalWithContext={handleOpenNewTaskWithContext}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
            />
          )}

          {activeTab === 'team' && (
            <TeamView users={users} departments={departments} tasks={tasks} />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              projects={projects}
              onSelectTask={(task) => setSelectedTaskDetail(task)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              tasks={tasks}
              projects={projects}
              departments={departments}
              users={users}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onNavigateToProjects={handleNavigateToProjects}
            />
          )}

          {activeTab === 'settings' && <SettingsView departments={departments} />}
        </main>
      </div>

      {/* Global Modals */}
      <CreateTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => {
          setIsNewTaskModalOpen(false);
          setTaskModalContext({});
        }}
        projects={projects}
        columns={columns}
        users={users}
        defaultProjectId={taskModalContext.projectId}
        defaultColumnId={taskModalContext.columnId}
      />

      <CreateProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        departments={departments}
        users={users}
      />

      <TaskDetailModal
        task={selectedTaskDetail}
        isOpen={!!selectedTaskDetail}
        onClose={() => setSelectedTaskDetail(null)}
        columns={columns}
        users={users}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
