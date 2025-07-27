import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { BarChart3, PieChart, Calendar, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Reports() {
  const { state } = useApp();
  const [reportType, setReportType] = useState<'project-activity' | 'subsystem-activity' | 'gantt'>('project-activity');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedSubsystems, setSelectedSubsystems] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  const getProjectActivityData = () => {
    const projectsToAnalyze = selectedProjects.length > 0 ? selectedProjects : state.projects.map(p => p.id);
    const activitiesToAnalyze = selectedActivities.length > 0 ? selectedActivities : state.activities.map(a => a.id);

    if (projectsToAnalyze.length === 1 && activitiesToAnalyze.length > 1) {
      // Pie chart: One project, multiple activities
      const project = state.projects.find(p => p.id === projectsToAnalyze[0]);
      const data = {
        labels: activitiesToAnalyze.map(activityId => {
          const activity = state.activities.find(a => a.id === activityId);
          return activity?.name || '';
        }),
        datasets: [{
          data: activitiesToAnalyze.map(activityId => {
            const completedCount = state.progress.filter(p => 
              p.projectId === projectsToAnalyze[0] && 
              p.activityId === activityId && 
              p.status === 'COMPLETED'
            ).length;
            return completedCount;
          }),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ]
        }]
      };
      return { type: 'pie', data, title: `${project?.name} - Activity Progress` };
    } else if (projectsToAnalyze.length > 1 && activitiesToAnalyze.length === 1) {
      // Pie chart: Multiple projects, one activity
      const activity = state.activities.find(a => a.id === activitiesToAnalyze[0]);
      const data = {
        labels: projectsToAnalyze.map(projectId => {
          const project = state.projects.find(p => p.id === projectId);
          return project?.name || '';
        }),
        datasets: [{
          data: projectsToAnalyze.map(projectId => {
            const completedCount = state.progress.filter(p => 
              p.projectId === projectId && 
              p.activityId === activitiesToAnalyze[0] && 
              p.status === 'COMPLETED'
            ).length;
            return completedCount;
          }),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ]
        }]
      };
      return { type: 'pie', data, title: `${activity?.name} - Project Progress` };
    } else {
      // Bar chart: Multiple projects, multiple activities
      const data = {
        labels: projectsToAnalyze.map(projectId => {
          const project = state.projects.find(p => p.id === projectId);
          return project?.name || '';
        }),
        datasets: [{
          label: 'Completion Percentage',
          data: projectsToAnalyze.map(projectId => {
            const totalActivities = activitiesToAnalyze.length;
            const completedActivities = activitiesToAnalyze.filter(activityId => 
              state.progress.some(p => 
                p.projectId === projectId && 
                p.activityId === activityId && 
                p.status === 'COMPLETED'
              )
            ).length;
            return totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
          }),
          backgroundColor: '#36A2EB'
        }]
      };
      return { type: 'bar', data, title: 'Project vs Activity Progress' };
    }
  };

  const getSubsystemActivityData = () => {
    const subsystemsToAnalyze = selectedSubsystems.length > 0 ? selectedSubsystems : state.subsystems.map(s => s.id);
    const activitiesToAnalyze = selectedActivities.length > 0 ? selectedActivities : state.activities.map(a => a.id);

    if (subsystemsToAnalyze.length === 1 && activitiesToAnalyze.length > 1) {
      // Pie chart: One subsystem, multiple activities
      const subsystem = state.subsystems.find(s => s.id === subsystemsToAnalyze[0]);
      const data = {
        labels: activitiesToAnalyze.map(activityId => {
          const activity = state.activities.find(a => a.id === activityId);
          return activity?.name || '';
        }),
        datasets: [{
          data: activitiesToAnalyze.map(activityId => {
            const completedCount = state.progress.filter(p => 
              p.subsystemId === subsystemsToAnalyze[0] && 
              p.activityId === activityId && 
              p.status === 'COMPLETED'
            ).length;
            return completedCount;
          }),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ]
        }]
      };
      return { type: 'pie', data, title: `${subsystem?.name} - Activity Progress` };
    } else if (subsystemsToAnalyze.length > 1 && activitiesToAnalyze.length === 1) {
      // Pie chart: Multiple subsystems, one activity
      const activity = state.activities.find(a => a.id === activitiesToAnalyze[0]);
      const data = {
        labels: subsystemsToAnalyze.map(subsystemId => {
          const subsystem = state.subsystems.find(s => s.id === subsystemId);
          return subsystem?.name || '';
        }),
        datasets: [{
          data: subsystemsToAnalyze.map(subsystemId => {
            const completedCount = state.progress.filter(p => 
              p.subsystemId === subsystemId && 
              p.activityId === activitiesToAnalyze[0] && 
              p.status === 'COMPLETED'
            ).length;
            return completedCount;
          }),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ]
        }]
      };
      return { type: 'pie', data, title: `${activity?.name} - Subsystem Progress` };
    } else {
      // Bar chart: Multiple subsystems, multiple activities
      const data = {
        labels: subsystemsToAnalyze.map(subsystemId => {
          const subsystem = state.subsystems.find(s => s.id === subsystemId);
          return subsystem?.name || '';
        }),
        datasets: [{
          label: 'Completion Percentage',
          data: subsystemsToAnalyze.map(subsystemId => {
            const totalActivities = activitiesToAnalyze.length;
            const completedActivities = activitiesToAnalyze.filter(activityId => 
              state.progress.some(p => 
                p.subsystemId === subsystemId && 
                p.activityId === activityId && 
                p.status === 'COMPLETED'
              )
            ).length;
            return totalActivities > 0 ? (completedActivities / totalActivities) * 100 : 0;
          }),
          backgroundColor: '#4BC0C0'
        }]
      };
      return { type: 'bar', data, title: 'Subsystem vs Activity Progress' };
    }
  };

  const getGanttData = () => {
    const projectsToAnalyze = selectedProjects.length > 0 ? selectedProjects : state.projects.map(p => p.id);
    
    const completedActivities = state.progress
      .filter(p => p.status === 'COMPLETED' && p.completionDate && projectsToAnalyze.includes(p.projectId))
      .sort((a, b) => new Date(a.completionDate!).getTime() - new Date(b.completionDate!).getTime());

    const notStartedActivities = state.progress
      .filter(p => p.status === 'NOT_STARTED' && projectsToAnalyze.includes(p.projectId));

    return { completedActivities, notStartedActivities };
  };

  const handleProjectSelection = (projectId: string) => {
    if (projectId === 'all') {
      setSelectedProjects(selectedProjects.length === state.projects.length ? [] : state.projects.map(p => p.id));
    } else {
      setSelectedProjects(prev => 
        prev.includes(projectId) 
          ? prev.filter(id => id !== projectId)
          : [...prev, projectId]
      );
    }
  };

  const handleSubsystemSelection = (subsystemId: string) => {
    if (subsystemId === 'all') {
      setSelectedSubsystems(selectedSubsystems.length === state.subsystems.length ? [] : state.subsystems.map(s => s.id));
    } else {
      setSelectedSubsystems(prev => 
        prev.includes(subsystemId) 
          ? prev.filter(id => id !== subsystemId)
          : [...prev, subsystemId]
      );
    }
  };

  const handleActivitySelection = (activityId: string) => {
    if (activityId === 'all') {
      setSelectedActivities(selectedActivities.length === state.activities.length ? [] : state.activities.map(a => a.id));
    } else {
      setSelectedActivities(prev => 
        prev.includes(activityId) 
          ? prev.filter(id => id !== activityId)
          : [...prev, activityId]
      );
    }
  };

  const renderChart = () => {
    let chartData;
    
    if (reportType === 'project-activity') {
      chartData = getProjectActivityData();
    } else if (reportType === 'subsystem-activity') {
      chartData = getSubsystemActivityData();
    } else {
      return renderGanttChart();
    }

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: chartData.title,
        },
      },
      scales: chartData.type === 'bar' ? {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value: any) {
              return value + '%';
            }
          }
        }
      } : undefined
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="h-96">
          {chartData.type === 'pie' ? (
            <Pie data={chartData.data} options={options} />
          ) : (
            <Bar data={chartData.data} options={options} />
          )}
        </div>
      </div>
    );
  };

  const renderGanttChart = () => {
    const { completedActivities, notStartedActivities } = getGanttData();
    
    // Show all completed activities, even without start dates
    const activitiesWithDates = completedActivities.filter(p => p.completionDate);
    
    if (activitiesWithDates.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt Chart - Project Timeline</h3>
          <div className="text-center py-8 text-gray-500">
            No completed activities available.
          </div>
        </div>
      );
    }
    
    // Calculate timeline bounds from completion dates
    const completionDates = activitiesWithDates.map(p => new Date(p.completionDate!));
    const minDate = new Date(Math.min(...completionDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...completionDates.map(d => d.getTime())));
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Sort activities by completion date
    const sortedActivities = activitiesWithDates
      .sort((a, b) => new Date(a.completionDate!).getTime() - new Date(b.completionDate!).getTime());

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt Chart - Project Timeline</h3>
        
        {/* Timeline Header */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Start: {format(minDate, 'MMM dd, yyyy')}</span>
            <span>End: {format(maxDate, 'MMM dd, yyyy')}</span>
            <span>Total Duration: {totalDays} days</span>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Gantt Chart Visualization */}
          <div className="space-y-3">
            {sortedActivities.map((progress, index) => {
              const project = state.projects.find(p => p.id === progress.projectId);
              const activity = state.activities.find(a => a.id === progress.activityId);
              const subsystem = state.subsystems.find(s => s.id === progress.subsystemId);
              
              // Use start date if available, otherwise estimate 7 days before completion
              const startDate = progress.startDate ? new Date(progress.startDate) : new Date(new Date(progress.completionDate!).getTime() - 7 * 24 * 60 * 60 * 1000);
              const endDate = new Date(progress.completionDate!);
              
              // Calculate position and width as percentages
              const startOffset = ((startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
              const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              const barWidth = (duration / totalDays) * 100;
              
              return (
                <div key={index} className="relative">
                  <div className="flex items-center mb-2">
                    <div className="w-64 pr-4">
                      <div className="font-medium text-sm text-gray-900 truncate">{activity?.name}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {project?.name} • {subsystem?.name}
                      </div>
                    </div>
                    <div className="flex-1 relative h-8 bg-gray-100 rounded">
                      <div
                        className="absolute h-6 bg-gradient-to-r from-green-400 to-green-600 rounded shadow-sm top-1"
                        style={{
                          left: `${startOffset}%`,
                          width: `${Math.max(barWidth, 2)}%`
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs text-white font-medium">
                            {duration}d
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-32 pl-4 text-xs text-gray-600">
                      <div>{format(startDate, 'MMM dd')}</div>
                      <div>{format(endDate, 'MMM dd')}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Not Started Activities */}
          {notStartedActivities.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-700 mb-4">Pending Activities</h4>
              <div className="grid gap-2">
                {notStartedActivities.map((progress, index) => {
                  const project = state.projects.find(p => p.id === progress.projectId);
                  const activity = state.activities.find(a => a.id === progress.activityId);
                  const subsystem = state.subsystems.find(s => s.id === progress.subsystemId);
                  
                  return (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border-l-4 border-gray-400">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity?.name}</div>
                        <div className="text-sm text-gray-600">
                          {project?.name} • {subsystem?.name}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-300 rounded-full mr-2"></div>
                        <span className="text-sm text-gray-500">Not Started</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOldGanttChart = () => {
    const { completedActivities, notStartedActivities } = getGanttData();

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt Chart - Project Timeline</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-green-700 mb-2">Completed Activities</h4>
            <div className="space-y-2">
              {completedActivities.map((progress, index) => {
                const project = state.projects.find(p => p.id === progress.projectId);
                const activity = state.activities.find(a => a.id === progress.activityId);
                const subsystem = state.subsystems.find(s => s.id === progress.subsystemId);
                
                return (
                  <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity?.name}</div>
                      <div className="text-sm text-gray-600">
                        {project?.name} • {subsystem?.name}
                      </div>
                    </div>
                    <div className="text-sm text-green-700">
                      {progress.completionDate ? format(new Date(progress.completionDate), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Not Started Activities</h4>
            <div className="space-y-2">
              {notStartedActivities.map((progress, index) => {
                const project = state.projects.find(p => p.id === progress.projectId);
                const activity = state.activities.find(a => a.id === progress.activityId);
                const subsystem = state.subsystems.find(s => s.id === progress.subsystemId);
                
                return (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{activity?.name}</div>
                      <div className="text-sm text-gray-600">
                        {project?.name} • {subsystem?.name}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Not Started
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setReportType('project-activity')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'project-activity'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h4 className="font-medium">Project vs Activity</h4>
                <p className="text-sm text-gray-600 mt-1">Analyze project progress</p>
              </div>
            </button>

            <button
              onClick={() => setReportType('subsystem-activity')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'subsystem-activity'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <PieChart className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h4 className="font-medium">Subsystem vs Activity</h4>
                <p className="text-sm text-gray-600 mt-1">Analyze subsystem progress</p>
              </div>
            </button>

            <button
              onClick={() => setReportType('gantt')}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'gantt'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h4 className="font-medium">Gantt Chart</h4>
                <p className="text-sm text-gray-600 mt-1">Timeline view</p>
              </div>
            </button>
          </div>
        </div>

        {/* Selection Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Project Selection */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Projects</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProjects.length === state.projects.length}
                    onChange={() => handleProjectSelection('all')}
                    className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-indigo-600">Select All</span>
                </label>
                {state.projects.map(project => (
                  <label key={project.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleProjectSelection(project.id)}
                      className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-900">{project.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subsystem Selection */}
            {reportType === 'subsystem-activity' && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Subsystems</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedSubsystems.length === state.subsystems.length}
                      onChange={() => handleSubsystemSelection('all')}
                      className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-indigo-600">Select All</span>
                  </label>
                  {state.subsystems.map(subsystem => (
                    <label key={subsystem.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSubsystems.includes(subsystem.id)}
                        onChange={() => handleSubsystemSelection(subsystem.id)}
                        className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">{subsystem.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Selection */}
            {reportType !== 'gantt' && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Activities</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedActivities.length === state.activities.length}
                      onChange={() => handleActivitySelection('all')}
                      className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-indigo-600">Select All</span>
                  </label>
                  {state.activities.map(activity => (
                    <label key={activity.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity.id)}
                        onChange={() => handleActivitySelection(activity.id)}
                        className="mr-2 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-900">{activity.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart Display */}
        {renderChart()}
      </div>
    </div>
  );
}