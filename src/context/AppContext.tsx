@@ .. @@
 import React, { createContext, useContext, useReducer, ReactNode } from 'react';
 import { AppState, User, Project, Subsystem, Activity, ProjectProgress, ProjectSubsystemMapping } from '../types';
-import { initialUsers, initialProjects, initialSubsystems, initialActivities, initialProgress } from '../data/initialData';
+import { authAPI, usersAPI, projectsAPI, subsystemsAPI, activitiesAPI, mappingsAPI, progressAPI } from '../services/api';

-// Load state from localStorage
-const loadStateFromStorage = (): Partial<AppState> => {
-  try {
-    const savedState = localStorage.getItem('projectManagementState');
-    return savedState ? JSON.parse(savedState) : {};
-  } catch (error) {
-    console.error('Error loading state from localStorage:', error);
-    return {};
-  }
-};
-
-// Save state to localStorage
-const saveStateToStorage = (state: AppState) => {
-  try {
-    localStorage.setItem('projectManagementState', JSON.stringify({
-      projects: state.projects,
-      subsystems: state.subsystems,
-      activities: state.activities,
-      progress: state.progress,
-      projectSubsystemMappings: state.projectSubsystemMappings,
-      users: state.users
-    }));
-  } catch (error) {
-    console.error('Error saving state to localStorage:', error);
-  }
-};
-
 interface AppContextType {
   state: AppState;
   dispatch: React.Dispatch<any>;
+  loadData: () => Promise<void>;
 }

 const AppContext = createContext<AppContextType | undefined>(undefined);

-const savedState = loadStateFromStorage();
 const initialState: AppState = {
   auth: {
     user: null,
     isAuthenticated: false
   },
-  projects: savedState.projects || initialProjects,
-  subsystems: savedState.subsystems || initialSubsystems,
-  activities: savedState.activities || initialActivities,
-  progress: savedState.progress || [],
-  projectSubsystemMappings: savedState.projectSubsystemMappings || [],
-  users: savedState.users || initialUsers
+  projects: [],
+  subsystems: [],
+  activities: [],
+  progress: [],
+  projectSubsystemMappings: [],
+  users: []
 };

 function appReducer(state: AppState, action: any): AppState {
-  const newState = (() => {
-    switch (action.type) {
+  switch (action.type) {
+    case 'SET_LOADING':
+      return { ...state, loading: action.payload };
+      
+    case 'LOAD_DATA':
+      return {
+        ...state,
+        projects: action.payload.projects || [],
+        subsystems: action.payload.subsystems || [],
+        activities: action.payload.activities || [],
+        progress: action.payload.progress || [],
+        projectSubsystemMappings: action.payload.mappings || [],
+        users: action.payload.users || []
+      };
+      
     case 'LOGIN':
       return {
         ...state,
@@ -89,7 +58,7 @@
     
     case 'ADD_PROJECT':
       return {
         ...state,
         projects: [...state.projects, action.payload]
       };
     
@@ -185,21 +154,11 @@
     
     default:
       return state;
-    }
-  })();
-  
-  // Save to localStorage after each state change (except login/logout)
-  if (action.type !== 'LOGIN' && action.type !== 'LOGOUT') {
-    saveStateToStorage(newState);
   }
-  
-  return newState;
 }

 export function AppProvider({ children }: { children: ReactNode }) {
   const [state, dispatch] = useReducer(appReducer, initialState);
+  
+  const loadData = async () => {
+    try {
+      const [projects, subsystems, activities, progress, mappings, users] = await Promise.all([
+        projectsAPI.getAll(),
+        subsystemsAPI.getAll(),
+        activitiesAPI.getAll(),
+        progressAPI.getAll(),
+        mappingsAPI.getAll(),
+        state.auth.user?.role === 'ADMIN' ? usersAPI.getAll() : Promise.resolve([])
+      ]);
+      
+      dispatch({
+        type: 'LOAD_DATA',
+        payload: { projects, subsystems, activities, progress, mappings, users }
+      });
+    } catch (error) {
+      console.error('Error loading data:', error);
+    }
+  };
   
   return (
-    <AppContext.Provider value={{ state, dispatch }}>
+    <AppContext.Provider value={{ state, dispatch, loadData }}>
       {children}
     </AppContext.Provider>
   );
@@ -213,4 +172,4 @@
   }
   return context;
 }