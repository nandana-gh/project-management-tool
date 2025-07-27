export type UserRole = 'ADMIN' | 'PM' | 'DPD' | 'ENGINEER';

export interface User {
  id: string; // user_id in database
  username: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
}

export interface Project {
  id: string; // project_id in database
  name: string; // project_name in database
  programType: string; // program_type in database
  createdBy: string; // created_by in database (foreign key to users.user_id)
  createdAt: Date; // created_at in database
}

export interface Subsystem {
  id: string; // subsystem_id in database
  name: string; // subsystem_name in database
  createdAt?: Date;
}

export interface Activity {
  id: string; // activity_id in database
  name: string; // activity_name in database
  type: 'FPGA' | 'PROCESSOR'; // activity_type in database
  associatedWith: 'PROJECT' | 'SUBSYSTEM'; // associated_with in database
  createdAt?: Date;
}

export interface ProjectProgress {
  id?: string; // progress_id in database (auto-generated)
  projectId: string; // project_id in database (foreign key)
  subsystemId: string; // subsystem_id in database (foreign key)
  activityId: string; // activity_id in database (foreign key)
  userId: string; // user_id in database (foreign key)
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  startDate?: Date; // start_date in database
  completionDate?: Date; // completion_date in database
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProjectSubsystemMapping {
  id?: string; // mapping_id in database
  projectId: string; // project_id in database (foreign key)
  subsystemId: string; // subsystem_id in database (foreign key)
  assignedBy?: string; // assigned_by in database (foreign key to users.user_id)
  createdAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  projects: Project[];
  subsystems: Subsystem[];
  activities: Activity[];
  progress: ProjectProgress[];
  projectSubsystemMappings: ProjectSubsystemMapping[];
  users: User[];
}