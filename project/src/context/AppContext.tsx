import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, User, Project, Subsystem, Activity, ProjectProgress, ProjectSubsystemMapping } from '../types';
import { initialUsers, initialProjects, initialSubsystems, initialActivities, initialProgress } from '../data/initialData';

// Load state from localStorage
const loadStateFromStorage = (): Partial<AppState> => {
  try {
    const savedState = localStorage.getItem('projectManagementState');
    return savedState ? JSON.parse(savedState) : {};
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return {};
  }
};

// Save state to localStorage
const saveStateToStorage = (state: AppState) => {
  try {
    localStorage.setItem('projectManagementState', JSON.stringify({
      projects: state.projects,
      subsystems: state.subsystems,
      activities: state.activities,
      progress: state.progress,
      projectSubsystemMappings: state.projectSubsystemMappings,
      users: state.users
    }));
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const savedState = loadStateFromStorage();
const initialState: AppState = {
  auth: {
    user: null,
    isAuthenticated: false
  },
  projects: savedState.projects || initialProjects,
  subsystems: savedState.subsystems || initialSubsystems,
  activities: savedState.activities || initialActivities,
  progress: savedState.progress || [],
  projectSubsystemMappings: savedState.projectSubsystemMappings || [],
  users: savedState.users || initialUsers
};

function appReducer(state: AppState, action: any): AppState {
  const newState = (() => {
    switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        auth: {
          user: action.payload,
          isAuthenticated: true
        }
      };
    
    case 'LOGOUT':
      return {
        ...state,
        auth: {
          user: null,
          isAuthenticated: false
        }
      };
    
    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload]
      };
    
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        )
      };
    
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload)
      };
    
    case 'ADD_SUBSYSTEM':
      return {
        ...state,
        subsystems: [...state.subsystems, action.payload]
      };
    
    case 'UPDATE_SUBSYSTEM':
      return {
        ...state,
        subsystems: state.subsystems.map(s => 
          s.id === action.payload.id ? action.payload : s
        )
      };
    
    case 'DELETE_SUBSYSTEM':
      return {
        ...state,
        subsystems: state.subsystems.filter(s => s.id !== action.payload)
      };
    
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [...state.activities, action.payload]
      };
    
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map(a => 
          a.id === action.payload.id ? action.payload : a
        )
      };
    
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter(a => a.id !== action.payload)
      };
    
    case 'UPDATE_PROGRESS':
      const existingProgress = state.progress.find(p => 
        p.projectId === action.payload.projectId &&
        p.subsystemId === action.payload.subsystemId &&
        p.activityId === action.payload.activityId &&
        p.userId === action.payload.userId
      );
      
      // Auto-set start date when status changes to IN_PROGRESS
      if (action.payload.status === 'IN_PROGRESS' && !action.payload.startDate) {
        action.payload.startDate = new Date();
      }
      
      // Auto-set completion date when status changes to COMPLETED
      if (action.payload.status === 'COMPLETED' && !action.payload.completionDate) {
        action.payload.completionDate = new Date();
      }
      
      if (existingProgress) {
        return {
          ...state,
          progress: state.progress.map(p =>
            p.projectId === action.payload.projectId &&
            p.subsystemId === action.payload.subsystemId &&
            p.activityId === action.payload.activityId
              ? action.payload
              : p
          )
        };
      } else {
        return {
          ...state,
          progress: [...state.progress, action.payload]
        };
      }
    
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => 
          u.id === action.payload.id ? action.payload : u
        )
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload)
      };
    
    case 'MAP_SUBSYSTEM_TO_PROJECT':
      const existingMapping = state.projectSubsystemMappings.find(m => 
        m.projectId === action.payload.projectId
      );
      
      if (existingMapping) {
        return {
          ...state,
          projectSubsystemMappings: state.projectSubsystemMappings.map(m =>
            m.projectId === action.payload.projectId ? action.payload : m
          )
        };
      } else {
        return {
          ...state,
          projectSubsystemMappings: [...state.projectSubsystemMappings, action.payload]
        };
      }
    
    default:
      return state;
    }
  })();
  
  // Save to localStorage after each state change (except login/logout)
  if (action.type !== 'LOGIN' && action.type !== 'LOGOUT') {
    saveStateToStorage(newState);
  }
  
  return newState;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}