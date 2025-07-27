import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Edit, Trash2, Save, X, Link } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Project, Subsystem, ProjectSubsystemMapping } from '../types';
import { programTypes } from '../data/initialData';

export function ProjectManagement() {
  const { state, dispatch } = useApp();
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddSubsystem, setShowAddSubsystem] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingSubsystem, setEditingSubsystem] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({ name: '', programType: '', subsystemId: '' });
  const [newSubsystem, setNewSubsystem] = useState({ name: '' });
  const [customProgram, setCustomProgram] = useState('');

  const userRole = state.auth.user?.role;
  const canAdd = userRole === 'PM' || userRole === 'DPD';
  const canEdit = userRole === 'PM' || userRole === 'DPD';
  const canDelete = userRole === 'ADMIN';
  const canAssignSubsystem = userRole === 'PM' || userRole === 'DPD';

  const handleAddProject = () => {
    if (newProject.name && newProject.programType && newProject.subsystemId) {
      const project: Project = {
        id: uuidv4(),
        name: newProject.name,
        programType: newProject.programType,
        createdBy: state.auth.user?.id || '',
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_PROJECT', payload: project });
      
      // Automatically create the subsystem mapping
      const mapping: ProjectSubsystemMapping = {
        projectId: project.id,
        subsystemId: newProject.subsystemId,
        assignedBy: state.auth.user?.id || '',
        createdAt: new Date()
      };
      dispatch({ type: 'MAP_SUBSYSTEM_TO_PROJECT', payload: mapping });
      
      setNewProject({ name: '', programType: '', subsystemId: '' });
      setCustomProgram('');
      setShowAddProject(false);
    }
  };

  const handleAddSubsystem = () => {
    if (newSubsystem.name) {
      const subsystem: Subsystem = {
        id: uuidv4(),
        name: newSubsystem.name,
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_SUBSYSTEM', payload: subsystem });
      setNewSubsystem({ name: '' });
      setShowAddSubsystem(false);
    }
  };

  const handleUpdateProject = (project: Project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project });
    setEditingProject(null);
  };

  const handleUpdateSubsystem = (subsystem: Subsystem) => {
    dispatch({ type: 'UPDATE_SUBSYSTEM', payload: subsystem });
    setEditingSubsystem(null);
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    }
  };

  const handleDeleteSubsystem = (subsystemId: string) => {
    if (window.confirm('Are you sure you want to delete this subsystem?')) {
      dispatch({ type: 'DELETE_SUBSYSTEM', payload: subsystemId });
    }
  };

  const getSubsystemForProject = (projectId: string) => {
    const mapping = state.projectSubsystemMappings.find(m => m.projectId === projectId);
    if (mapping) {
      return state.subsystems.find(s => s.id === mapping.subsystemId);
    }
    return null;
  };

  const handleSubsystemReassignment = (projectId: string, newSubsystemId: string) => {
    if (newSubsystemId) {
      const mapping: ProjectSubsystemMapping = {
        projectId: projectId,
        subsystemId: newSubsystemId,
        assignedBy: state.auth.user?.id || '',
        createdAt: new Date()
      };
      dispatch({ type: 'MAP_SUBSYSTEM_TO_PROJECT', payload: mapping });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
              {canAdd && (
                <button
                  onClick={() => setShowAddProject(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {showAddProject && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Type *
                    </label>
                    <select
                      value={newProject.programType}
                      onChange={(e) => setNewProject({ ...newProject, programType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select program type</option>
                      {programTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                      <option value="custom">Add Custom</option>
                    </select>
                  </div>

                  {newProject.programType === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Custom Program Type *
                      </label>
                      <input
                        type="text"
                        value={customProgram}
                        onChange={(e) => {
                          setCustomProgram(e.target.value);
                          setNewProject({ ...newProject, programType: e.target.value });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter custom program type"
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign Subsystem *
                    </label>
                    <select
                      value={newProject.subsystemId}
                      onChange={(e) => setNewProject({ ...newProject, subsystemId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="">Select a subsystem</option>
                      {state.subsystems.map(subsystem => (
                        <option key={subsystem.id} value={subsystem.id}>{subsystem.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddProject}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddProject(false);
                        setNewProject({ name: '', programType: '', subsystemId: '' });
                        setCustomProgram('');
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {state.projects.map((project) => {
                const assignedSubsystem = getSubsystemForProject(project.id);
                const creator = state.users.find(u => u.id === project.createdBy);
                
                return (
                  <div key={project.id} className="p-4 border border-gray-200 rounded-lg">
                    {editingProject === project.id ? (
                      <EditProjectForm
                        project={project}
                        onSave={handleUpdateProject}
                        onCancel={() => setEditingProject(null)}
                      />
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600">{project.programType}</p>
                            <div className="flex items-center mt-2">
                              <Link className="w-4 h-4 text-indigo-500 mr-2" />
                              <span className="text-sm font-medium text-indigo-700">
                                Subsystem: {assignedSubsystem?.name || 'Not assigned'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Created by: {creator?.username} • {new Date(project.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {canEdit && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingProject(project.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Subsystem Reassignment Dropdown */}
                        {canAssignSubsystem && (
                          <div className="pt-3 border-t border-gray-100">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Reassign Subsystem:
                            </label>
                            <select
                              value={assignedSubsystem?.id || ''}
                              onChange={(e) => handleSubsystemReassignment(project.id, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select subsystem</option>
                              {state.subsystems.map(subsystem => (
                                <option key={subsystem.id} value={subsystem.id}>{subsystem.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subsystems Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Subsystems</h2>
              {canAdd && (
                <button
                  onClick={() => setShowAddSubsystem(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subsystem
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {showAddSubsystem && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Subsystem</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subsystem Name *
                    </label>
                    <input
                      type="text"
                      value={newSubsystem.name}
                      onChange={(e) => setNewSubsystem({ ...newSubsystem, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter subsystem name"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddSubsystem}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddSubsystem(false);
                        setNewSubsystem({ name: '' });
                      }}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {state.subsystems.map((subsystem) => (
                <div key={subsystem.id} className="p-4 border border-gray-200 rounded-lg">
                  {editingSubsystem === subsystem.id ? (
                    <EditSubsystemForm
                      subsystem={subsystem}
                      onSave={handleUpdateSubsystem}
                      onCancel={() => setEditingSubsystem(null)}
                    />
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{subsystem.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {state.projectSubsystemMappings.filter(m => m.subsystemId === subsystem.id).length} projects assigned
                        </p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingSubsystem(subsystem.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => handleDeleteSubsystem(subsystem.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProjectForm({ project, onSave, onCancel }: {
  project: Project;
  onSave: (project: Project) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [programType, setProgramType] = useState(project.programType);

  const handleSave = () => {
    onSave({ ...project, name, programType });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Program Type
        </label>
        <select
          value={programType}
          onChange={(e) => setProgramType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          {programTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
}

function EditSubsystemForm({ subsystem, onSave, onCancel }: {
  subsystem: Subsystem;
  onSave: (subsystem: Subsystem) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(subsystem.name);

  const handleSave = () => {
    onSave({ ...subsystem, name });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subsystem Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
}