import axios from 'axios';
import { User, Project, Subsystem, Activity, ProjectProgress, ProjectSubsystemMapping } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string, role: string) => {
    const response = await api.post('/auth/login', { username, password, role });
    const { access_token, user } = response.data;
    localStorage.setItem('access_token', access_token);
    return { user, access_token };
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
  },
};

// Users API
export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  
  create: async (user: { username: string; password: string; role: string }): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
  },
  
  update: async (userId: string, updates: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${userId}`, updates);
    return response.data;
  },
  
  delete: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data;
  },
  
  create: async (project: { project_name: string; program_type: string; description?: string }): Promise<Project> => {
    const response = await api.post('/projects', project);
    return response.data;
  },
  
  update: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${projectId}`, updates);
    return response.data;
  },
  
  delete: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`);
  },
};

// Subsystems API
export const subsystemsAPI = {
  getAll: async (): Promise<Subsystem[]> => {
    const response = await api.get('/subsystems');
    return response.data;
  },
  
  create: async (subsystem: { subsystem_name: string; description?: string }): Promise<Subsystem> => {
    const response = await api.post('/subsystems', subsystem);
    return response.data;
  },
  
  update: async (subsystemId: string, updates: Partial<Subsystem>): Promise<Subsystem> => {
    const response = await api.put(`/subsystems/${subsystemId}`, updates);
    return response.data;
  },
  
  delete: async (subsystemId: string): Promise<void> => {
    await api.delete(`/subsystems/${subsystemId}`);
  },
};

// Activities API
export const activitiesAPI = {
  getAll: async (activityType?: string, associatedWith?: string): Promise<Activity[]> => {
    const params = new URLSearchParams();
    if (activityType) params.append('activity_type', activityType);
    if (associatedWith) params.append('associated_with', associatedWith);
    
    const response = await api.get(`/activities?${params.toString()}`);
    return response.data;
  },
  
  create: async (activity: { activity_name: string; activity_type: string; associated_with: string; description?: string }): Promise<Activity> => {
    const response = await api.post('/activities', activity);
    return response.data;
  },
  
  update: async (activityId: string, updates: Partial<Activity>): Promise<Activity> => {
    const response = await api.put(`/activities/${activityId}`, updates);
    return response.data;
  },
  
  delete: async (activityId: string): Promise<void> => {
    await api.delete(`/activities/${activityId}`);
  },
};

// Project Subsystem Mappings API
export const mappingsAPI = {
  getAll: async (): Promise<ProjectSubsystemMapping[]> => {
    const response = await api.get('/project-subsystem-mappings');
    return response.data;
  },
  
  create: async (mapping: { project_id: string; subsystem_id: string }): Promise<ProjectSubsystemMapping> => {
    const response = await api.post('/project-subsystem-mappings', mapping);
    return response.data;
  },
};

// Project Progress API
export const progressAPI = {
  getAll: async (): Promise<ProjectProgress[]> => {
    const response = await api.get('/project-progress');
    return response.data;
  },
  
  createOrUpdate: async (progress: { project_id: string; subsystem_id: string; activity_id: string; status: string; notes?: string }): Promise<ProjectProgress> => {
    const response = await api.post('/project-progress', progress);
    return response.data;
  },
};

// Reports API
export const reportsAPI = {
  getProjectActivityReport: async (filters: { project_ids?: string[]; activity_ids?: string[] }) => {
    const response = await api.post('/reports/project-activity', filters);
    return response.data;
  },
  
  getSubsystemActivityReport: async (filters: { subsystem_ids?: string[]; activity_ids?: string[] }) => {
    const response = await api.post('/reports/subsystem-activity', filters);
    return response.data;
  },
  
  getGanttReport: async (filters: { project_ids?: string[] }) => {
    const response = await api.post('/reports/gantt', filters);
    return response.data;
  },
};