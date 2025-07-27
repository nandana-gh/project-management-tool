import { User, Project, Subsystem, Activity } from '../types';

export const initialUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    createdAt: new Date()
  },
  {
    id: '2',
    username: 'pm1',
    password: 'pm123',
    role: 'PM',
    createdAt: new Date()
  },
  {
    id: '3',
    username: 'dpd1',
    password: 'dpd123',
    role: 'DPD',
    createdAt: new Date()
  },
  {
    id: '4',
    username: 'eng1',
    password: 'eng123',
    role: 'ENGINEER',
    createdAt: new Date()
  }
];

// Sample projects for demonstration
export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Satellite Communication System',
    programType: 'Communication',
    createdBy: '2', // PM user
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'proj-2',
    name: 'Earth Observation Mission',
    programType: 'Remote Sensing',
    createdBy: '3', // DPD user
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'proj-3',
    name: 'Space Weather Monitoring',
    programType: 'Scientific',
    createdBy: '2', // PM user
    createdAt: new Date('2024-02-15')
  }
];

export const initialSubsystems: Subsystem[] = [
  { id: '1', name: 'POWER', createdAt: new Date() },
  { id: '2', name: 'TM', createdAt: new Date() },
  { id: '3', name: 'TC', createdAt: new Date() },
  { id: '4', name: 'AOCE', createdAt: new Date() },
  { id: '5', name: 'OBC', createdAt: new Date() }
];

export const programTypes = [
  'Remote Sensing',
  'Communication',
  'Scientific',
  'Safety Critical'
];

export const fpgaProjectActivities: Activity[] = [
  { id: 'fpga-proj-1', name: 'PDR', type: 'FPGA', associatedWith: 'PROJECT', createdAt: new Date() },
  { id: 'fpga-proj-2', name: 'CDR', type: 'FPGA', associatedWith: 'PROJECT', createdAt: new Date() }
];

export const fpgaSubsystemActivities: Activity[] = [
  { id: 'fpga-sub-1', name: 'FRR', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-2', name: 'SRR', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-3', name: 'SDR', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-4', name: 'CI', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-5', name: 'DB', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-6', name: 'SILS', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-7', name: 'Designer Level Test Case Audit', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-8', name: 'Configuration Review Board', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'fpga-sub-9', name: 'Clearance for PROM fusing', type: 'FPGA', associatedWith: 'SUBSYSTEM', createdAt: new Date() }
];

export const processorProjectActivities: Activity[] = [
  { id: 'proc-proj-1', name: 'PDR', type: 'PROCESSOR', associatedWith: 'PROJECT', createdAt: new Date() },
  { id: 'proc-proj-2', name: 'CDR', type: 'PROCESSOR', associatedWith: 'PROJECT', createdAt: new Date() },
  { id: 'proc-proj-3', name: 'Standing Review Committee', type: 'PROCESSOR', associatedWith: 'PROJECT', createdAt: new Date() },
  { id: 'proc-proj-4', name: 'IPAB Review', type: 'PROCESSOR', associatedWith: 'PROJECT', createdAt: new Date() },
  { id: 'proc-proj-5', name: 'PSR', type: 'PROCESSOR', associatedWith: 'PROJECT', createdAt: new Date() }
];

export const processorSubsystemActivities: Activity[] = [
  { id: 'proc-sub-1', name: 'FRS', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-2', name: 'FDR', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-3', name: 'CI', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-4', name: 'DB', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-5', name: 'Simulation Result Audit', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-6', name: 'Synthesis Log Check', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-7', name: 'Static Timing Analysis', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-8', name: 'Place and Roots Log Check', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-9', name: 'Post Layout Simulation Audit', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() },
  { id: 'proc-sub-10', name: 'CMRB', type: 'PROCESSOR', associatedWith: 'SUBSYSTEM', createdAt: new Date() }
];

export const initialActivities: Activity[] = [
  ...fpgaProjectActivities,
  ...fpgaSubsystemActivities,
  ...processorProjectActivities,
  ...processorSubsystemActivities
];

// Sample progress data with start and completion dates for Gantt chart demonstration
export const initialProgress = [
  {
    id: 'progress-1',
    projectId: 'proj-1',
    subsystemId: '1',
    activityId: 'fpga-proj-1',
    userId: '4',
    status: 'COMPLETED' as const,
    startDate: new Date('2024-01-15'),
    completionDate: new Date('2024-01-25'),
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'progress-2',
    projectId: 'proj-1',
    subsystemId: '1',
    activityId: 'fpga-proj-2',
    userId: '4',
    status: 'COMPLETED' as const,
    startDate: new Date('2024-01-26'),
    completionDate: new Date('2024-02-10'),
    createdAt: new Date('2024-01-26')
  },
  {
    id: 'progress-3',
    projectId: 'proj-2',
    subsystemId: '2',
    activityId: 'fpga-sub-1',
    userId: '4',
    status: 'COMPLETED' as const,
    startDate: new Date('2024-02-01'),
    completionDate: new Date('2024-02-08'),
    createdAt: new Date('2024-02-01')
  },
  {
    id: 'progress-4',
    projectId: 'proj-2',
    subsystemId: '2',
    activityId: 'fpga-sub-2',
    userId: '4',
    status: 'COMPLETED' as const,
    startDate: new Date('2024-02-09'),
    completionDate: new Date('2024-02-20'),
    createdAt: new Date('2024-02-09')
  },
  {
    id: 'progress-5',
    projectId: 'proj-3',
    subsystemId: '3',
    activityId: 'proc-proj-1',
    userId: '4',
    status: 'COMPLETED' as const,
    startDate: new Date('2024-02-15'),
    completionDate: new Date('2024-03-01'),
    createdAt: new Date('2024-02-15')
  },
  {
    id: 'progress-6',
    projectId: 'proj-1',
    subsystemId: '1',
    activityId: 'fpga-sub-3',
    userId: '4',
    status: 'IN_PROGRESS' as const,
    startDate: new Date('2024-02-25'),
    createdAt: new Date('2024-02-25')
  }
]