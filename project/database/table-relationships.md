# Database Table Relationships

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     USERS       │    │    PROJECTS     │    │   SUBSYSTEMS    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ user_id (PK)    │◄──┐│ project_id (PK) │    │ subsystem_id(PK)│
│ username        │   ││ project_name    │    │ subsystem_name  │
│ password        │   ││ program_type    │    │ created_at      │
│ role            │   ││ created_by (FK) │    │ updated_at      │
│ created_at      │   │└─────────────────┘    └─────────────────┘
│ updated_at      │   │         │                       │
└─────────────────┘   │         │                       │
         │             │         │                       │
         │             │         ▼                       │
         │             │┌─────────────────────────────────┴──┐
         │             ││  PROJECT_SUBSYSTEM_MAPPINGS       │
         │             │├───────────────────────────────────┤
         │             ││ mapping_id (PK)                   │
         │             ││ project_id (FK) ──────────────────┤
         │             ││ subsystem_id (FK) ────────────────┘
         │             ││ assigned_by (FK) ─────────────────┐
         │             ││ created_at                        │
         │             ││ updated_at                        │
         │             │└───────────────────────────────────┘
         │             │                                    │
         │             └────────────────────────────────────┘
         │
         ▼
┌─────────────────┐    ┌─────────────────┐
│   ACTIVITIES    │    │ PROJECT_PROGRESS│
├─────────────────┤    ├─────────────────┤
│ activity_id(PK) │◄───┤ progress_id(PK) │
│ activity_name   │    │ project_id (FK) │──┐
│ activity_type   │    │ subsystem_id(FK)│──┼─┐
│ associated_with │    │ activity_id(FK) │  │ │
│ created_at      │    │ user_id (FK)    │──┘ │
│ updated_at      │    │ status          │    │
└─────────────────┘    │ completion_date │    │
                       │ created_at      │    │
                       │ updated_at      │    │
                       └─────────────────┘    │
                                ▲             │
                                └─────────────┘
```

## Table Relationships

### 1. USERS Table
- **Primary Key**: `user_id`
- **Relationships**:
  - One-to-Many with PROJECTS (via `created_by`)
  - One-to-Many with PROJECT_SUBSYSTEM_MAPPINGS (via `assigned_by`)
  - One-to-Many with PROJECT_PROGRESS (via `user_id`)

### 2. PROJECTS Table
- **Primary Key**: `project_id`
- **Foreign Keys**: 
  - `created_by` → USERS.user_id
- **Relationships**:
  - Many-to-One with USERS (creator)
  - One-to-One with PROJECT_SUBSYSTEM_MAPPINGS
  - One-to-Many with PROJECT_PROGRESS

### 3. SUBSYSTEMS Table
- **Primary Key**: `subsystem_id`
- **Relationships**:
  - One-to-Many with PROJECT_SUBSYSTEM_MAPPINGS
  - One-to-Many with PROJECT_PROGRESS

### 4. PROJECT_SUBSYSTEM_MAPPINGS Table
- **Primary Key**: `mapping_id`
- **Foreign Keys**:
  - `project_id` → PROJECTS.project_id
  - `subsystem_id` → SUBSYSTEMS.subsystem_id
  - `assigned_by` → USERS.user_id
- **Unique Constraint**: `project_id` (ensures 1:1 project-subsystem mapping)
- **Relationships**:
  - Many-to-One with PROJECTS
  - Many-to-One with SUBSYSTEMS
  - Many-to-One with USERS (assigner)

### 5. ACTIVITIES Table
- **Primary Key**: `activity_id`
- **Relationships**:
  - One-to-Many with PROJECT_PROGRESS

### 6. PROJECT_PROGRESS Table
- **Primary Key**: `progress_id`
- **Foreign Keys**:
  - `project_id` → PROJECTS.project_id
  - `subsystem_id` → SUBSYSTEMS.subsystem_id
  - `activity_id` → ACTIVITIES.activity_id
  - `user_id` → USERS.user_id
- **Unique Constraint**: `(project_id, subsystem_id, activity_id, user_id)`
- **Relationships**:
  - Many-to-One with PROJECTS
  - Many-to-One with SUBSYSTEMS
  - Many-to-One with ACTIVITIES
  - Many-to-One with USERS

## Key Business Rules

1. **One Project = One Subsystem**: Each project can only be assigned to exactly one subsystem
2. **Unique Progress Tracking**: Each user can have only one progress record per project-subsystem-activity combination
3. **Role-Based Access**: User roles determine what operations they can perform
4. **Referential Integrity**: All foreign key relationships are enforced
5. **Audit Trail**: All tables include created_at and updated_at timestamps

## Data Flow

1. **Project Creation**: 
   - Project is created in PROJECTS table
   - Subsystem assignment is recorded in PROJECT_SUBSYSTEM_MAPPINGS
   
2. **Progress Tracking**:
   - Users update their progress in PROJECT_PROGRESS table
   - Progress is linked to specific project-subsystem-activity combinations
   
3. **Reporting**:
   - Data is aggregated across all tables for comprehensive reporting
   - Views provide pre-calculated summaries for performance