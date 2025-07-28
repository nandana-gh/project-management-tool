@@ .. @@
 export interface User {
-  id: string; // user_id in database
+  user_id: string; // user_id in database
   username: string;
   password: string;
   role: UserRole;
-  createdAt?: Date;
+  created_at?: string;
 }

 export interface Project {
-  id: string; // project_id in database
-  name: string; // project_name in database
-  programType: string; // program_type in database
-  createdBy: string; // created_by in database (foreign key to users.user_id)
-  createdAt: Date; // created_at in database
+  project_id: string; // project_id in database
+  project_name: string; // project_name in database
+  program_type: string; // program_type in database
+  description?: string;
+  created_by: string; // created_by in database (foreign key to users.user_id)
+  created_at: string; // created_at in database
 }

 export interface Subsystem {
-  id: string; // subsystem_id in database
-  name: string; // subsystem_name in database
-  createdAt?: Date;
+  subsystem_id: string; // subsystem_id in database
+  subsystem_name: string; // subsystem_name in database
+  description?: string;
+  created_at?: string;
 }

 export interface Activity {
-  id: string; // activity_id in database
-  name: string; // activity_name in database
+  activity_id: string; // activity_id in database
+  activity_name: string; // activity_name in database
   type: 'FPGA' | 'PROCESSOR'; // activity_type in database
   associatedWith: 'PROJECT' | 'SUBSYSTEM'; // associated_with in database
-  createdAt?: Date;
+  description?: string;
+  created_at?: string;
 }

 export interface ProjectProgress {
-  id?: string; // progress_id in database (auto-generated)
-  projectId: string; // project_id in database (foreign key)
-  subsystemId: string; // subsystem_id in database (foreign key)
-  activityId: string; // activity_id in database (foreign key)
-  userId: string; // user_id in database (foreign key)
+  progress_id?: string; // progress_id in database (auto-generated)
+  project_id: string; // project_id in database (foreign key)
+  subsystem_id: string; // subsystem_id in database (foreign key)
+  activity_id: string; // activity_id in database (foreign key)
+  user_id: string; // user_id in database (foreign key)
   status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
-  startDate?: Date; // start_date in database
-  completionDate?: Date; // completion_date in database
-  createdAt?: Date;
-  updatedAt?: Date;
+  start_date?: string; // start_date in database
+  completion_date?: string; // completion_date in database
+  notes?: string;
+  created_at?: string;
+  updated_at?: string;
 }

 export interface ProjectSubsystemMapping {
-  id?: string; // mapping_id in database
-  projectId: string; // project_id in database (foreign key)
-  subsystemId: string; // subsystem_id in database (foreign key)
-  assignedBy?: string; // assigned_by in database (foreign key to users.user_id)
-  createdAt?: Date;
+  mapping_id?: string; // mapping_id in database
+  project_id: string; // project_id in database (foreign key)
+  subsystem_id: string; // subsystem_id in database (foreign key)
+  assigned_by?: string; // assigned_by in database (foreign key to users.user_id)
+  assigned_at?: string;
+  created_at?: string;
 }