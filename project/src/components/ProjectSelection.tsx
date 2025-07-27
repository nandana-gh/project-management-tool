import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderOpen, Settings, CheckCircle } from 'lucide-react';

export function ProjectSelection() {
  const { state } = useApp();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('');

  const userRole = state.auth.user?.role;
  const userName = state.auth.user?.username;

  const getSubsystemForProject = (projectId: string) => {
    const mapping = state.projectSubsystemMappings.find(m => m.projectId === projectId);
    if (mapping) {
      return state.subsystems.find(s => s.id === mapping.subsystemId);
    }
    return null;
  };

  const getUserProgress = (projectId: string, subsystemId: string) => {
    return state.progress.filter(p => 
      p.projectId === projectId && 
      p.subsystemId === subsystemId && 
      p.userId === state.auth.user?.id
    );
  };

  const getProgressStats = (projectId: string, subsystemId: string) => {
    const userProgress = getUserProgress(projectId, subsystemId);
    const completed = userProgress.filter(p => p.status === 'COMPLETED').length;
    const inProgress = userProgress.filter(p => p.status === 'IN_PROGRESS').length;
    const total = userProgress.length;
    
    return { completed, inProgress, total };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FolderOpen className="w-6 h-6 text-indigo-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Available Projects</h2>
              <p className="text-sm text-gray-600 mt-1">
                Select a project to view and update your progress
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {state.projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Available</h3>
              <p className="text-gray-600">
                Projects will appear here once they are created by Project Managers or Deputy Project Directors.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {state.projects.map((project) => {
                const assignedSubsystem = getSubsystemForProject(project.id);
                const creator = state.users.find(u => u.id === project.createdBy);
                
                return (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {project.programType}
                          </span>
                          {assignedSubsystem && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Settings className="w-3 h-3 mr-1" />
                              {assignedSubsystem.name}
                            </span>
                          )}
                          <span>Created by: {creator?.username}</span>
                          <span>Date: {new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {assignedSubsystem ? (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                            <span className="font-medium text-gray-900">
                              ✅ Subsystem Assigned: {assignedSubsystem.name}
                            </span>
                          </div>
                          
                          {userRole === 'ENGINEER' && (
                            <div className="flex items-center text-sm">
                              {(() => {
                                const stats = getProgressStats(project.id, assignedSubsystem.id);
                                return (
                                  <div className="flex items-center space-x-4">
                                    <span className="text-green-600">
                                      <CheckCircle className="w-4 h-4 inline mr-1" />
                                      {stats.completed} completed
                                    </span>
                                    <span className="text-yellow-600">
                                      {stats.inProgress} in progress
                                    </span>
                                    <span className="text-gray-600">
                                      {stats.total} total activities
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>

                        {userRole === 'ENGINEER' && (
                          <div className="text-sm text-gray-600">
                            <p className="flex items-center">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                              You can update your progress on activities for this project-subsystem combination in the Activities section.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Settings className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700 font-medium">
                              ⚠️ No subsystem assigned to this project yet. 
                              {userRole === 'ADMIN' || userRole === 'ENGINEER' 
                                ? ' You can assign a subsystem in the Project Management section.'
                                : ' Please contact an administrator to assign a subsystem.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}