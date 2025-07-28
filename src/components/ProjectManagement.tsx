@@ .. @@
 import React, { useState } from 'react';
 import { useApp } from '../context/AppContext';
 import { Plus, Edit, Trash2, Save, X, Link } from 'lucide-react';
-import { v4 as uuidv4 } from 'uuid';
 import { Project, Subsystem, ProjectSubsystemMapping } from '../types';
-import { programTypes } from '../data/initialData';
+import { projectsAPI, subsystemsAPI, mappingsAPI } from '../services/api';

+const programTypes = [
+  'Remote Sensing',
+  'Communication',
+  'Scientific',
+  'Safety Critical'
+];
+
 export function ProjectManagement() {
-  const { state, dispatch } = useApp();
+  const { state, dispatch, loadData } = useApp();
   const [showAddProject, setShowAddProject] = useState(false);
   const [showAddSubsystem, setShowAddSubsystem] = useState(false);
   const [editingProject, setEditingProject] = useState<string | null>(null);
@@ -20,30 +27,32 @@
   const canAssignSubsystem = userRole === 'PM' || userRole === 'DPD';

-  const handleAddProject = () => {
+  const handleAddProject = async () => {
     if (newProject.name && newProject.programType && newProject.subsystemId) {
-      const project: Project = {
-        id: uuidv4(),
-        name: newProject.name,
-        programType: newProject.programType,
-        createdBy: state.auth.user?.id || '',
-        createdAt: new Date()
-      };
-      dispatch({ type: 'ADD_PROJECT', payload: project });
-      
-      // Automatically create the subsystem mapping
-      const mapping: ProjectSubsystemMapping = {
-        projectId: project.id,
-        subsystemId: newProject.subsystemId,
-        assignedBy: state.auth.user?.id || '',
-        createdAt: new Date()
-      };
-      dispatch({ type: 'MAP_SUBSYSTEM_TO_PROJECT', payload: mapping });
-      
-      setNewProject({ name: '', programType: '', subsystemId: '' });
-      setCustomProgram('');
-      setShowAddProject(false);
+      try {
+        const project = await projectsAPI.create({
+          project_name: newProject.name,
+          program_type: newProject.programType === 'custom' ? customProgram : newProject.programType,
+          description: ''
+        });
+        
+        // Automatically create the subsystem mapping
+        await mappingsAPI.create({
+          project_id: project.project_id,
+          subsystem_id: newProject.subsystemId
+        });
+        
+        await loadData();
+        setNewProject({ name: '', programType: '', subsystemId: '' });
+        setCustomProgram('');
+        setShowAddProject(false);
+      } catch (error) {
+        console.error('Error creating project:', error);
+      }
     }
   };

-  const handleAddSubsystem = () => {
+  const handleAddSubsystem = async () => {
     if (newSubsystem.name) {
-      const subsystem: Subsystem = {
-        id: uuidv4(),
-        name: newSubsystem.name,
-        createdAt: new Date()
-      };
-      dispatch({ type: 'ADD_SUBSYSTEM', payload: subsystem });
-      setNewSubsystem({ name: '' });
-      setShowAddSubsystem(false);
+      try {
+        await subsystemsAPI.create({
+          subsystem_name: newSubsystem.name,
+          description: ''
+        });
+        await loadData();
+        setNewSubsystem({ name: '' });
+        setShowAddSubsystem(false);
+      } catch (error) {
+        console.error('Error creating subsystem:', error);
+      }
     }
   };

-  const handleUpdateProject = (project: Project) => {
-    dispatch({ type: 'UPDATE_PROJECT', payload: project });
-    setEditingProject(null);
+  const handleUpdateProject = async (project: Project) => {
+    try {
+      await projectsAPI.update(project.project_id, {
+        project_name: project.project_name,
+        program_type: project.program_type,
+        description: project.description
+      });
+      await loadData();
+      setEditingProject(null);
+    } catch (error) {
+      console.error('Error updating project:', error);
+    }
   };

-  const handleUpdateSubsystem = (subsystem: Subsystem) => {
-    dispatch({ type: 'UPDATE_SUBSYSTEM', payload: subsystem });
-    setEditingSubsystem(null);
+  const handleUpdateSubsystem = async (subsystem: Subsystem) => {
+    try {
+      await subsystemsAPI.update(subsystem.subsystem_id, {
+        subsystem_name: subsystem.subsystem_name,
+        description: subsystem.description
+      });
+      await loadData();
+      setEditingSubsystem(null);
+    } catch (error) {
+      console.error('Error updating subsystem:', error);
+    }
   };

-  const handleDeleteProject = (projectId: string) => {
+  const handleDeleteProject = async (projectId: string) => {
     if (window.confirm('Are you sure you want to delete this project?')) {
-      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
+      try {
+        await projectsAPI.delete(projectId);
+        await loadData();
+      } catch (error) {
+        console.error('Error deleting project:', error);
+      }
     }
   };

-  const handleDeleteSubsystem = (subsystemId: string) => {
+  const handleDeleteSubsystem = async (subsystemId: string) => {
     if (window.confirm('Are you sure you want to delete this subsystem?')) {
-      dispatch({ type: 'DELETE_SUBSYSTEM', payload: subsystemId });
+      try {
+        await subsystemsAPI.delete(subsystemId);
+        await loadData();
+      } catch (error) {
+        console.error('Error deleting subsystem:', error);
+      }
     }
   };

   const getSubsystemForProject = (projectId: string) => {
-    const mapping = state.projectSubsystemMappings.find(m => m.projectId === projectId);
+    const mapping = state.projectSubsystemMappings.find(m => m.project_id === projectId);
     if (mapping) {
-      return state.subsystems.find(s => s.id === mapping.subsystemId);
+      return state.subsystems.find(s => s.subsystem_id === mapping.subsystem_id);
     }
     return null;
   };

-  const handleSubsystemReassignment = (projectId: string, newSubsystemId: string) => {
+  const handleSubsystemReassignment = async (projectId: string, newSubsystemId: string) => {
     if (newSubsystemId) {
-      const mapping: ProjectSubsystemMapping = {
-        projectId: projectId,
-        subsystemId: newSubsystemId,
-        assignedBy: state.auth.user?.id || '',
-        createdAt: new Date()
-      };
-      dispatch({ type: 'MAP_SUBSYSTEM_TO_PROJECT', payload: mapping });
+      try {
+        await mappingsAPI.create({
+          project_id: projectId,
+          subsystem_id: newSubsystemId
+        });
+        await loadData();
+      } catch (error) {
+        console.error('Error reassigning subsystem:', error);
+      }
     }
   };

@@ .. @@
             <div className="space-y-4">
               {state.projects.map((project) => {
-                const assignedSubsystem = getSubsystemForProject(project.id);
-                const creator = state.users.find(u => u.id === project.createdBy);
+                const assignedSubsystem = getSubsystemForProject(project.project_id);
+                const creator = state.users.find(u => u.user_id === project.created_by);
                 
-                return (
-                  <div key={project.id} className="p-4 border border-gray-200 rounded-lg">
-                    {editingProject === project.id ? (
+                return (
+                  <div key={project.project_id} className="p-4 border border-gray-200 rounded-lg">
+                    {editingProject === project.project_id ? (
                       <EditProjectForm
                         project={project}
                         onSave={handleUpdateProject}
-                        onCancel={() => setEditingProject(null)}
+                        onCancel={() => setEditingProject(null)}
                       />
                     ) : (
                       <div className="space-y-3">
                         <div className="flex justify-between items-start">
                           <div className="flex-1">
-                            <h3 className="font-medium text-gray-900">{project.name}</h3>
-                            <p className="text-sm text-gray-600">{project.programType}</p>
+                            <h3 className="font-medium text-gray-900">{project.project_name}</h3>
+                            <p className="text-sm text-gray-600">{project.program_type}</p>
                             <div className="flex items-center mt-2">
                               <Link className="w-4 h-4 text-indigo-500 mr-2" />
                               <span className="text-sm font-medium text-indigo-700">
-                                Subsystem: {assignedSubsystem?.name || 'Not assigned'}
+                                Subsystem: {assignedSubsystem?.subsystem_name || 'Not assigned'}
                               </span>
                             </div>
                             <p className="text-xs text-gray-500 mt-1">
-                              Created by: {creator?.username} • {new Date(project.createdAt).toLocaleDateString()}
+                              Created by: {creator?.username} • {new Date(project.created_at).toLocaleDateString()}
                             </p>
                           </div>
                           {canEdit && (
                             <div className="flex gap-2">
                               <button
-                                onClick={() => setEditingProject(project.id)}
+                                onClick={() => setEditingProject(project.project_id)}
                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                               >
                                 <Edit className="w-4 h-4" />
                               </button>
                               {canDelete && (
                                 <button
-                                  onClick={() => handleDeleteProject(project.id)}
+                                  onClick={() => handleDeleteProject(project.project_id)}
                                   className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                 >
                                   <Trash2 className="w-4 h-4" />
@@ -244,12 +271,12 @@
                             </label>
                             <select
-                              value={assignedSubsystem?.id || ''}
-                              onChange={(e) => handleSubsystemReassignment(project.id, e.target.value)}
+                              value={assignedSubsystem?.subsystem_id || ''}
+                              onChange={(e) => handleSubsystemReassignment(project.project_id, e.target.value)}
                               className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                             >
                               <option value="">Select subsystem</option>
-                              {state.subsystems.map(subsystem => (
-                                <option key={subsystem.id} value={subsystem.id}>{subsystem.name}</option>
+                              {state.subsystems.map(subsystem => (
+                                <option key={subsystem.subsystem_id} value={subsystem.subsystem_id}>{subsystem.subsystem_name}</option>
                               ))}
                             </select>
                           </div>
@@ -300,10 +327,10 @@

             <div className="space-y-4">
               {state.subsystems.map((subsystem) => (
-                <div key={subsystem.id} className="p-4 border border-gray-200 rounded-lg">
-                  {editingSubsystem === subsystem.id ? (
+                <div key={subsystem.subsystem_id} className="p-4 border border-gray-200 rounded-lg">
+                  {editingSubsystem === subsystem.subsystem_id ? (
                     <EditSubsystemForm
                       subsystem={subsystem}
                       onSave={handleUpdateSubsystem}
-                      onCancel={() => setEditingSubsystem(null)}
+                      onCancel={() => setEditingSubsystem(null)}
                     />
                   ) : (
                     <div className="flex justify-between items-center">
@@ -311,8 +338,8 @@
                         <h3 className="font-medium text-gray-900">{subsystem.name}</h3>
                         <p className="text-xs text-gray-500 mt-1">
-                          {state.projectSubsystemMappings.filter(m => m.subsystemId === subsystem.id).length} projects assigned
+                          {state.projectSubsystemMappings.filter(m => m.subsystem_id === subsystem.subsystem_id).length} projects assigned
                         </p>
                       </div>
                       {canEdit && (
                         <div className="flex gap-2">
                           <button
-                            onClick={() => setEditingSubsystem(subsystem.id)}
+                            onClick={() => setEditingSubsystem(subsystem.subsystem_id)}
                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                           >
                             <Edit className="w-4 h-4" />
                           </button>
                           {canDelete && (
                             <button
-                              onClick={() => handleDeleteSubsystem(subsystem.id)}
+                              onClick={() => handleDeleteSubsystem(subsystem.subsystem_id)}
                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             >
                               <Trash2 className="w-4 h-4" />
@@ -344,8 +371,8 @@
 function EditProjectForm({ project, onSave, onCancel }: {
   project: Project;
   onSave: (project: Project) => void;
   onCancel: () => void;
 }) {
-  const [name, setName] = useState(project.name);
-  const [programType, setProgramType] = useState(project.programType);
+  const [name, setName] = useState(project.project_name);
+  const [programType, setProgramType] = useState(project.program_type);

   const handleSave = () => {
-    onSave({ ...project, name, programType });
+    onSave({ ...project, project_name: name, program_type: programType });
   };

@@ .. @@
 function EditSubsystemForm({ subsystem, onSave, onCancel }: {
   subsystem: Subsystem;
   onSave: (subsystem: Subsystem) => void;
   onCancel: () => void;
 }) {
-  const [name, setName] = useState(subsystem.name);
+  const [name, setName] = useState(subsystem.subsystem_name);

   const handleSave = () => {
-    onSave({ ...subsystem, name });
+    onSave({ ...subsystem, subsystem_name: name });
   };