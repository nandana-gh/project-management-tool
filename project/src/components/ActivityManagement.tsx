import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, ProjectProgress } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Cpu,
  Zap
} from 'lucide-react';
import { 
  fpgaProjectActivities,
  fpgaSubsystemActivities,
  processorProjectActivities,
  processorSubsystemActivities
} from '../data/initialData';

export function ActivityManagement() {
  const { state, dispatch } = useApp();
  const [selectedType, setSelectedType] = useState<'FPGA' | 'PROCESSOR'>('FPGA');
  const [selectedAssociation, setSelectedAssociation] = useState<'PROJECT' | 'SUBSYSTEM'>('PROJECT');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [newActivity, setNewActivity] = useState({ name: '' });
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('');

  const userRole = state.auth.user?.role;
  const canAdd = userRole === 'PM' || userRole === 'ENGINEER';
  const canEdit = userRole === 'ADMIN' || userRole === 'PM' || userRole === 'ENGINEER';
  const canDelete = userRole === 'ADMIN';

  const getActivitiesForSelection = () => {
    if (selectedType === 'FPGA') {
      return selectedAssociation === 'PROJECT' ? fpgaProjectActivities : fpgaSubsystemActivities;
    } else {
      return selectedAssociation === 'PROJECT' ? processorProjectActivities : processorSubsystemActivities;
    }
  };

  const getActivityProgress = (activityId: string, projectId: string, subsystemId: string) => {
    return state.progress.find(p => 
      p.activityId === activityId && 
      p.projectId === projectId && 
      p.subsystemId === subsystemId
    );
  };

  const handleStatusUpdate = (activityId: string, projectId: string, subsystemId: string, newStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') => {
    const progress: ProjectProgress = {
      projectId,
      subsystemId,
      activityId,
      userId: state.auth.user?.id || '',
      status: newStatus,
      completionDate: newStatus === 'COMPLETED' ? new Date() : undefined
    };

    dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
  };

  const handleAddActivity = () => {
    if (newActivity.name) {
      const activity: Activity = {
        id: uuidv4(),
        name: newActivity.name,
        type: selectedType,
        associatedWith: selectedAssociation
      };
      dispatch({ type: 'ADD_ACTIVITY', payload: activity });
      setNewActivity({ name: '' });
      setShowAddActivity(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Activity Management</h2>
            {canAdd && (
              <button
                onClick={() => setShowAddActivity(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Activity Type Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Activity Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedType('FPGA')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedType === 'FPGA'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">FPGA Based Software</h4>
                  <p className="text-sm text-gray-600 mt-1">Field-Programmable Gate Array</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedType('PROCESSOR')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedType === 'PROCESSOR'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Cpu className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium">Processor Based Software</h4>
                  <p className="text-sm text-gray-600 mt-1">General Purpose Processor</p>
                </div>
              </button>
            </div>
          </div>

          {/* Association Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Association</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedAssociation('PROJECT')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAssociation === 'PROJECT'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-medium">Project Activities</h4>
                  <p className="text-sm text-gray-600 mt-1">Project-level activities</p>
                </div>
              </button>

              <button
                onClick={() => setSelectedAssociation('SUBSYSTEM')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedAssociation === 'SUBSYSTEM'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-medium">Subsystem Activities</h4>
                  <p className="text-sm text-gray-600 mt-1">Subsystem-level activities</p>
                </div>
              </button>
            </div>
          </div>

          {/* Add Activity Form */}
          {showAddActivity && canAdd && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Activity</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Name
                  </label>
                  <input
                    type="text"
                    value={newActivity.name}
                    onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter activity name"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleAddActivity}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={() => setShowAddActivity(false)}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Project and Subsystem Selection */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a project</option>
                {state.projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Subsystem
              </label>
              <select
                value={selectedSubsystem}
                onChange={(e) => setSelectedSubsystem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a subsystem</option>
                {state.subsystems.map(subsystem => (
                  <option key={subsystem.id} value={subsystem.id}>{subsystem.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Activities List */}
          {selectedProject && selectedSubsystem && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedType} {selectedAssociation} Activities
              </h3>
              
              <div className="grid gap-4">
                {getActivitiesForSelection().map((activity) => {
                  const progress = getActivityProgress(activity.id, selectedProject, selectedSubsystem);
                  const status = progress?.status || 'NOT_STARTED';
                  
                  return (
                    <div key={activity.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(status)}
                            <h4 className="font-medium text-gray-900">{activity.name}</h4>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                              {status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {activity.type} • {activity.associatedWith}
                            </span>
                          </div>
                          
                          {progress?.completionDate && (
                            <p className="text-sm text-gray-600">
                              Completed: {new Date(progress.completionDate).toLocaleDateString()}
                            </p>
                          )}
                          
                          {progress?.startDate && (
                            <p className="text-sm text-gray-600">
                              Started: {new Date(progress.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {status === 'NOT_STARTED' && (
                            <input
                              type="date"
                              placeholder="Start Date"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusUpdate(
                                    activity.id,
                                    selectedProject,
                                    selectedSubsystem,
                                    'IN_PROGRESS'
                                  );
                                }
                              }}
                            />
                          )}
                          
                          <select
                            value={status}
                            disabled={userRole === 'DPD'}
                            onChange={(e) => handleStatusUpdate(
                              activity.id,
                              selectedProject,
                              selectedSubsystem,
                              e.target.value as 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
                            )}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="NOT_STARTED">Not Started</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                          
                          {canDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this activity?')) {
                                  dispatch({ type: 'DELETE_ACTIVITY', payload: activity.id });
                                }
                              }}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm transition-colors"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}