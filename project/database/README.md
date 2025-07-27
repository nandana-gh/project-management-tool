# Database Schema

This directory contains the complete database schema and documentation for the Quality Assurance Project Management System.

## Database Structure

The system uses a MySQL/MariaDB relational database with the following core tables:

### Core Tables
1. **users** - User accounts and role-based access control
2. **projects** - Project information and metadata
3. **subsystems** - Available subsystems (POWER, TM, TC, AOCE, OBC)
4. **activities** - FPGA and Processor activities with associations
5. **project_subsystem_mappings** - One-to-one project-subsystem relationships
6. **project_progress** - User progress tracking on activities

### Key Features
- **Role-based access control** (ADMIN, PM, DPD, ENGINEER)
- **Mandatory project-subsystem mapping** (1:1 relationship)
- **Progress tracking** with completion dates
- **Relational integrity** with foreign key constraints
- **Performance optimization** with strategic indexes
- **Business logic enforcement** with triggers
- **Audit trails** with timestamps
- **Pre-built views** for common queries

## Files in this Directory

### Schema Files
- `schema.sql` - Complete database schema with tables, indexes, views, and sample data
- `table-relationships.md` - Detailed ERD and relationship documentation

### Documentation
- `README.md` - This file with overview and usage instructions

## Database Setup

### Prerequisites
- MySQL 8.0+ or MariaDB 10.5+
- Database user with CREATE, INSERT, UPDATE, DELETE privileges

### Installation Steps

1. **Create Database**:
   ```sql
   CREATE DATABASE project_management_system;
   USE project_management_system;
   ```

2. **Import Schema**:
   ```bash
   mysql -u username -p project_management_system < database/schema.sql
   ```

3. **Verify Installation**:
   ```sql
   SHOW TABLES;
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM subsystems;
   ```

## Table Structure Overview

### Primary Relationships
```
USERS (1) ──── (M) PROJECTS
PROJECTS (1) ──── (1) PROJECT_SUBSYSTEM_MAPPINGS ──── (1) SUBSYSTEMS
PROJECTS (1) ──── (M) PROJECT_PROGRESS ──── (1) ACTIVITIES
USERS (1) ──── (M) PROJECT_PROGRESS
```

### Business Logic
- **Project Creation**: Must assign exactly one subsystem
- **Progress Tracking**: Users track progress on project-subsystem-activity combinations
- **Role Permissions**: Different roles have different access levels
- **Data Integrity**: Foreign keys prevent orphaned records

## Sample Queries

### Get Project Details with Subsystem
```sql
SELECT * FROM project_details WHERE project_id = 'your-project-id';
```

### Get Progress Summary
```sql
SELECT * FROM project_progress_summary WHERE project_id = 'your-project-id';
```

### Create Project with Subsystem
```sql
CALL CreateProjectWithSubsystem(
    'new-project-id',
    'Project Name',
    'Remote Sensing',
    'user-id',
    'subsystem-id'
);
```

## Performance Considerations

- **Indexes**: Strategic indexes on frequently queried columns
- **Views**: Pre-calculated views for complex reporting queries
- **Constraints**: Unique constraints prevent duplicate data
- **Triggers**: Automatic timestamp updates and data validation

## Usage

This schema is designed to be imported into any MySQL/MariaDB database. The structure supports:

- **Multi-user environments** with role-based access
- **Scalable project management** with proper relationships
- **Comprehensive progress tracking** with audit trails
- **Flexible reporting** with pre-built views and indexes

## Maintenance

### Regular Tasks
- Monitor table sizes and optimize indexes as needed
- Archive completed projects periodically
- Backup database regularly
- Update user passwords and roles as required

### Troubleshooting
- Check foreign key constraints if inserts fail
- Verify unique constraints for duplicate data issues
- Review trigger logs for automatic data validation