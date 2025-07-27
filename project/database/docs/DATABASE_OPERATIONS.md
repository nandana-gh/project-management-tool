# DATABASE OPERATIONS GUIDE

## 🗄️ COMPLETE DATABASE IMPLEMENTATION

This guide provides comprehensive information about the relational database implementation for the Quality Assurance Project Management System.

## 📊 DATABASE TABLES OVERVIEW

### Table Structure Summary
```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                          │
├─────────────────────────────────────────────────────────────┤
│  1. USERS                    - User accounts & roles        │
│  2. SUBSYSTEMS              - Available subsystems         │
│  3. PROJECTS                - Project information          │
│  4. ACTIVITIES              - FPGA/Processor activities    │
│  5. PROJECT_PROGRESS        - User progress tracking       │
│  6. PROJECT_SUBSYSTEM_MAP   - Project-subsystem relations  │
└─────────────────────────────────────────────────────────────┘
```

## 🔗 RELATIONAL MAPPINGS

### Primary Relationships
```sql
-- One-to-Many Relationships
users(user_id) ──→ projects(created_by)
users(user_id) ──→ project_progress(user_id)
users(user_id) ──→ project_subsystem_mappings(assigned_by)

projects(project_id) ──→ project_progress(project_id)
projects(project_id) ──→ project_subsystem_mappings(project_id)

subsystems(subsystem_id) ──→ project_progress(subsystem_id)
subsystems(subsystem_id) ──→ project_subsystem_mappings(subsystem_id)

activities(activity_id) ──→ project_progress(activity_id)

-- One-to-One Relationship (Business Rule)
projects(project_id) ←──→ project_subsystem_mappings(project_id) [UNIQUE]
```

## 📋 DETAILED TABLE SPECIFICATIONS

### 1. USERS Table
```sql
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,           -- UUID format
    username VARCHAR(50) NOT NULL UNIQUE,     -- Unique username
    password VARCHAR(255) NOT NULL,           -- Password (should be hashed)
    role ENUM('ADMIN', 'PM', 'DPD', 'ENGINEER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_users_username (username),
    INDEX idx_users_role (role)
);
```

**Sample Data:**
```sql
INSERT INTO users VALUES
('user-1', 'admin', 'admin123', 'ADMIN', NOW(), NOW()),
('user-2', 'pm1', 'pm123', 'PM', NOW(), NOW()),
('user-3', 'dpd1', 'dpd123', 'DPD', NOW(), NOW()),
('user-4', 'eng1', 'eng123', 'ENGINEER', NOW(), NOW());
```

### 2. SUBSYSTEMS Table
```sql
CREATE TABLE subsystems (
    subsystem_id VARCHAR(36) PRIMARY KEY,
    subsystem_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_subsystems_name (subsystem_name)
);
```

**Sample Data:**
```sql
INSERT INTO subsystems VALUES
('sub-1', 'POWER', 'Power Management and Distribution Subsystem', NOW(), NOW()),
('sub-2', 'TM', 'Telemetry Subsystem for Data Transmission', NOW(), NOW()),
('sub-3', 'TC', 'Telecommand Subsystem for Command Reception', NOW(), NOW()),
('sub-4', 'AOCE', 'Attitude and Orbit Control Electronics', NOW(), NOW()),
('sub-5', 'OBC', 'On-Board Computer Subsystem', NOW(), NOW());
```

### 3. PROJECTS Table
```sql
CREATE TABLE projects (
    project_id VARCHAR(36) PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    program_type VARCHAR(50) NOT NULL,        -- Communication, Remote Sensing, etc.
    description TEXT,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_projects_created_by (created_by),
    INDEX idx_projects_program_type (program_type),
    INDEX idx_projects_created_at (created_at)
);
```

**Sample Data:**
```sql
INSERT INTO projects VALUES
('proj-1', 'Satellite Communication System', 'Communication', 'Advanced satellite communication system', 'user-2', NOW(), NOW()),
('proj-2', 'Earth Observation Mission', 'Remote Sensing', 'High-resolution earth observation satellite', 'user-3', NOW(), NOW()),
('proj-3', 'Space Weather Monitoring', 'Scientific', 'Space weather monitoring satellite', 'user-2', NOW(), NOW());
```

### 4. ACTIVITIES Table
```sql
CREATE TABLE activities (
    activity_id VARCHAR(36) PRIMARY KEY,
    activity_name VARCHAR(100) NOT NULL,
    activity_type ENUM('FPGA', 'PROCESSOR') NOT NULL,
    associated_with ENUM('PROJECT', 'SUBSYSTEM') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_activities_type (activity_type),
    INDEX idx_activities_association (associated_with),
    INDEX idx_activities_name (activity_name)
);
```

**Sample Data:**
```sql
-- FPGA Project Activities
INSERT INTO activities VALUES
('fpga-proj-1', 'PDR', 'FPGA', 'PROJECT', 'Preliminary Design Review for FPGA', NOW(), NOW()),
('fpga-proj-2', 'CDR', 'FPGA', 'PROJECT', 'Critical Design Review for FPGA', NOW(), NOW());

-- FPGA Subsystem Activities
INSERT INTO activities VALUES
('fpga-sub-1', 'FRR', 'FPGA', 'SUBSYSTEM', 'Flight Readiness Review', NOW(), NOW()),
('fpga-sub-2', 'SRR', 'FPGA', 'SUBSYSTEM', 'System Requirements Review', NOW(), NOW()),
('fpga-sub-3', 'SDR', 'FPGA', 'SUBSYSTEM', 'System Design Review', NOW(), NOW());

-- Processor Activities (similar pattern)
-- ... (see create_tables.sql for complete list)
```

### 5. PROJECT_PROGRESS Table
```sql
CREATE TABLE project_progress (
    progress_id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    subsystem_id VARCHAR(36) NOT NULL,
    activity_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'NOT_STARTED',
    completion_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (subsystem_id) REFERENCES subsystems(subsystem_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES activities(activity_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint
    UNIQUE KEY unique_progress (project_id, subsystem_id, activity_id, user_id),
    
    -- Indexes
    INDEX idx_progress_project (project_id),
    INDEX idx_progress_subsystem (subsystem_id),
    INDEX idx_progress_activity (activity_id),
    INDEX idx_progress_user (user_id),
    INDEX idx_progress_status (status),
    INDEX idx_progress_completion_date (completion_date)
);
```

### 6. PROJECT_SUBSYSTEM_MAPPINGS Table
```sql
CREATE TABLE project_subsystem_mappings (
    mapping_id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    subsystem_id VARCHAR(36) NOT NULL,
    assigned_by VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (subsystem_id) REFERENCES subsystems(subsystem_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Business Rule: One project = One subsystem
    UNIQUE KEY unique_project_subsystem (project_id),
    
    -- Indexes
    INDEX idx_mappings_project (project_id),
    INDEX idx_mappings_subsystem (subsystem_id),
    INDEX idx_mappings_assigned_by (assigned_by)
);
```

## 🔧 DATABASE OPERATIONS

### CREATE Operations

#### 1. Create New User
```sql
INSERT INTO users (user_id, username, password, role) 
VALUES (UUID(), 'new_user', 'hashed_password', 'ENGINEER');
```

#### 2. Create New Project with Subsystem Assignment
```sql
-- Using stored procedure
CALL sp_create_project_with_subsystem(
    UUID(),                    -- project_id
    'New Satellite Project',   -- project_name
    'Communication',           -- program_type
    'Project description',     -- description
    'user-2',                 -- created_by
    'sub-1'                   -- subsystem_id
);
```

#### 3. Create Progress Entry
```sql
INSERT INTO project_progress (
    progress_id, project_id, subsystem_id, activity_id, user_id, status, notes
) VALUES (
    UUID(), 'proj-1', 'sub-1', 'fpga-proj-1', 'user-4', 'IN_PROGRESS', 'Started working on PDR'
);
```

### READ Operations

#### 1. Get All Projects with Subsystem Info
```sql
SELECT 
    p.project_name,
    p.program_type,
    s.subsystem_name,
    u.username as created_by,
    p.created_at
FROM projects p
LEFT JOIN project_subsystem_mappings psm ON p.project_id = psm.project_id
LEFT JOIN subsystems s ON psm.subsystem_id = s.subsystem_id
LEFT JOIN users u ON p.created_by = u.user_id
ORDER BY p.created_at DESC;
```

#### 2. Get User Progress Summary
```sql
SELECT 
    p.project_name,
    s.subsystem_name,
    COUNT(pp.progress_id) as total_activities,
    SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN pp.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
    ROUND((SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) / COUNT(pp.progress_id)) * 100, 2) as completion_percentage
FROM project_progress pp
JOIN projects p ON pp.project_id = p.project_id
JOIN subsystems s ON pp.subsystem_id = s.subsystem_id
WHERE pp.user_id = 'user-4'
GROUP BY p.project_id, s.subsystem_id;
```

#### 3. Get Activities by Type
```sql
SELECT 
    activity_type,
    associated_with,
    COUNT(*) as activity_count,
    GROUP_CONCAT(activity_name ORDER BY activity_name) as activities
FROM activities
GROUP BY activity_type, associated_with;
```

### UPDATE Operations

#### 1. Update Project Information
```sql
UPDATE projects 
SET project_name = 'Updated Project Name',
    program_type = 'Scientific',
    updated_at = CURRENT_TIMESTAMP
WHERE project_id = 'proj-1';
```

#### 2. Update Progress Status
```sql
-- Using stored procedure
CALL sp_update_progress(
    'proj-1',           -- project_id
    'sub-1',           -- subsystem_id
    'fpga-proj-1',     -- activity_id
    'user-4',          -- user_id
    'COMPLETED',       -- status
    'PDR completed successfully'  -- notes
);
```

#### 3. Reassign Subsystem to Project
```sql
UPDATE project_subsystem_mappings 
SET subsystem_id = 'sub-2',
    assigned_by = 'user-2',
    updated_at = CURRENT_TIMESTAMP
WHERE project_id = 'proj-1';
```

### DELETE Operations

#### 1. Delete Project (Cascades to related records)
```sql
DELETE FROM projects WHERE project_id = 'proj-1';
-- This will automatically delete:
-- - project_subsystem_mappings records
-- - project_progress records
```

#### 2. Delete User (Restricted if referenced)
```sql
-- This will fail if user has created projects or progress records
DELETE FROM users WHERE user_id = 'user-4';
```

#### 3. Delete Activity (Cascades to progress)
```sql
DELETE FROM activities WHERE activity_id = 'fpga-proj-1';
-- This will automatically delete related project_progress records
```

## 📊 COMPLEX QUERIES

### 1. Project Dashboard Query
```sql
SELECT 
    p.project_id,
    p.project_name,
    p.program_type,
    s.subsystem_name,
    creator.username as created_by,
    assigner.username as subsystem_assigned_by,
    COUNT(DISTINCT pp.user_id) as users_assigned,
    COUNT(pp.progress_id) as total_activities,
    SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_activities,
    SUM(CASE WHEN pp.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_activities,
    ROUND((SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) / 
           NULLIF(COUNT(pp.progress_id), 0)) * 100, 2) as completion_percentage,
    MAX(pp.updated_at) as last_activity_update
FROM projects p
LEFT JOIN project_subsystem_mappings psm ON p.project_id = psm.project_id
LEFT JOIN subsystems s ON psm.subsystem_id = s.subsystem_id
LEFT JOIN users creator ON p.created_by = creator.user_id
LEFT JOIN users assigner ON psm.assigned_by = assigner.user_id
LEFT JOIN project_progress pp ON p.project_id = pp.project_id
GROUP BY p.project_id, p.project_name, p.program_type, s.subsystem_name, 
         creator.username, assigner.username
ORDER BY p.created_at DESC;
```

### 2. User Workload Analysis
```sql
SELECT 
    u.username,
    u.role,
    COUNT(DISTINCT pp.project_id) as assigned_projects,
    COUNT(pp.progress_id) as total_activities,
    SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
    SUM(CASE WHEN pp.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN pp.status = 'NOT_STARTED' THEN 1 ELSE 0 END) as not_started,
    ROUND((SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) / 
           NULLIF(COUNT(pp.progress_id), 0)) * 100, 2) as completion_rate,
    AVG(DATEDIFF(COALESCE(pp.completion_date, CURDATE()), pp.created_at)) as avg_completion_days
FROM users u
LEFT JOIN project_progress pp ON u.user_id = pp.user_id
WHERE u.role = 'ENGINEER'
GROUP BY u.user_id, u.username, u.role
ORDER BY completion_rate DESC;
```

### 3. Subsystem Utilization Report
```sql
SELECT 
    s.subsystem_name,
    COUNT(DISTINCT psm.project_id) as assigned_projects,
    COUNT(DISTINCT pp.user_id) as users_working,
    COUNT(pp.progress_id) as total_activities,
    SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_activities,
    ROUND((SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) / 
           NULLIF(COUNT(pp.progress_id), 0)) * 100, 2) as subsystem_completion_rate,
    GROUP_CONCAT(DISTINCT p.project_name ORDER BY p.project_name) as assigned_project_names
FROM subsystems s
LEFT JOIN project_subsystem_mappings psm ON s.subsystem_id = psm.subsystem_id
LEFT JOIN projects p ON psm.project_id = p.project_id
LEFT JOIN project_progress pp ON s.subsystem_id = pp.subsystem_id
GROUP BY s.subsystem_id, s.subsystem_name
ORDER BY assigned_projects DESC, subsystem_completion_rate DESC;
```

## 🔍 DATABASE VIEWS

### 1. Project Details View
```sql
CREATE VIEW v_project_details AS
SELECT 
    p.project_id,
    p.project_name,
    p.program_type,
    p.description as project_description,
    p.created_at as project_created_at,
    u.username as created_by_username,
    u.role as creator_role,
    s.subsystem_id,
    s.subsystem_name,
    s.description as subsystem_description,
    psm.assigned_by as subsystem_assigned_by_id,
    u2.username as subsystem_assigned_by_username,
    psm.assigned_at as subsystem_assigned_at
FROM projects p
LEFT JOIN users u ON p.created_by = u.user_id
LEFT JOIN project_subsystem_mappings psm ON p.project_id = psm.project_id
LEFT JOIN subsystems s ON psm.subsystem_id = s.subsystem_id
LEFT JOIN users u2 ON psm.assigned_by = u2.user_id;
```

### 2. Progress Summary View
```sql
CREATE VIEW v_progress_summary AS
SELECT 
    p.project_id,
    p.project_name,
    s.subsystem_name,
    u.user_id,
    u.username,
    u.role,
    COUNT(pp.progress_id) as total_activities,
    SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_activities,
    SUM(CASE WHEN pp.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_activities,
    SUM(CASE WHEN pp.status = 'NOT_STARTED' THEN 1 ELSE 0 END) as not_started_activities,
    ROUND((SUM(CASE WHEN pp.status = 'COMPLETED' THEN 1 ELSE 0 END) / 
           NULLIF(COUNT(pp.progress_id), 0)) * 100, 2) as completion_percentage
FROM projects p
LEFT JOIN project_subsystem_mappings psm ON p.project_id = psm.project_id
LEFT JOIN subsystems s ON psm.subsystem_id = s.subsystem_id
LEFT JOIN project_progress pp ON p.project_id = pp.project_id AND psm.subsystem_id = pp.subsystem_id
LEFT JOIN users u ON pp.user_id = u.user_id
GROUP BY p.project_id, p.project_name, s.subsystem_name, u.user_id, u.username, u.role;
```

## ⚡ PERFORMANCE OPTIMIZATION

### Index Usage Analysis
```sql
-- Check index usage
SHOW INDEX FROM project_progress;

-- Analyze query performance
EXPLAIN SELECT * FROM project_progress 
WHERE project_id = 'proj-1' AND user_id = 'user-4';
```

### Query Optimization Tips
1. **Use Indexes**: Ensure WHERE clauses use indexed columns
2. **Limit Results**: Use LIMIT for large datasets
3. **Avoid SELECT ***: Select only needed columns
4. **Use JOINs Efficiently**: Proper JOIN order and conditions
5. **Aggregate Wisely**: Use GROUP BY with appropriate indexes

## 🔒 DATA INTEGRITY

### Constraints Summary
```sql
-- Primary Key Constraints
ALTER TABLE users ADD CONSTRAINT pk_users PRIMARY KEY (user_id);
ALTER TABLE projects ADD CONSTRAINT pk_projects PRIMARY KEY (project_id);
-- ... (all tables have PK constraints)

-- Foreign Key Constraints
ALTER TABLE projects ADD CONSTRAINT fk_projects_created_by 
    FOREIGN KEY (created_by) REFERENCES users(user_id);
ALTER TABLE project_progress ADD CONSTRAINT fk_progress_project 
    FOREIGN KEY (project_id) REFERENCES projects(project_id);
-- ... (all FK relationships defined)

-- Unique Constraints
ALTER TABLE users ADD CONSTRAINT uk_users_username UNIQUE (username);
ALTER TABLE project_subsystem_mappings ADD CONSTRAINT uk_project_subsystem 
    UNIQUE (project_id);
-- ... (business rule enforcement)
```

### Data Validation Rules
1. **Username Uniqueness**: No duplicate usernames
2. **Project-Subsystem Mapping**: One-to-one relationship
3. **Progress Uniqueness**: One progress per user-project-activity
4. **Role Validation**: Only valid roles allowed
5. **Status Validation**: Only valid status values allowed

This comprehensive database implementation provides a solid foundation for the Project Management System with proper relationships, constraints, and optimization for performance and data integrity.