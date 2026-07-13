Database Documentation
Overview
This project uses PostgreSQL as the primary relational database. Configuration is managed via environment variables to ensure secure and flexible deployment. The application leverages Django ORM for data abstraction and Django migrations for schema versioning.
Technology Stack
Database: PostgreSQL
ORM: Django ORM
Database Adapter: psycopg2
Migration Tool: Django Migrations
Environment Configuration
Database credentials are managed via a .env file. Never commit this file to version control.
Required Variables

Variable
Description
DATABASE_NAME
Name of the database
DATABASE_USER
Database username
DATABASE_PASSWORD
Database password
DATABASE_HOST
Database host address
DATABASE_PORT
Port number (default: 5432)

Example .env configuration:

DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_HOST=db
DATABASE_PORT=5432
Configuration Setup
The Django application loads credentials from the environment variables defined in backend/config/settings.py. This approach separates sensitive configuration from the source code.
Running Migrations
Before running the application, ensure the database schema is up-to-date:

python manage.py makemigrations
python manage.py migrate
Database Models
Models are organized into modular Django applications:
Accounts
Chat
Notifications
Common
Each application manages its own models and migrations independently.
Best Practices
Security: Never commit database passwords or .env files.
Environment: Use PostgreSQL for all production environments.
Consistency: Always run migrations after pulling new code changes.
Version Control: Ensure migration files are committed to version control.
Backup and Restoration
Regular backups are recommended using standard PostgreSQL utilities:
Backup:

pg_dump [database_name] > backup.sql
Restore:

psql [database_name] < backup.sql
Troubleshooting

Issue
Resolution
Connection Refused
Verify that the PostgreSQL service is active and running.
Authentication Failed
Verify that DATABASE_USER and DATABASE_PASSWORD are correct.
Migration Errors
Run python manage.py migrate after pulling the latest changes.

Future Improvements
Develop a comprehensive ER Diagram.
Implement database indexing strategies.
Optimize complex database queries.
Establish performance monitoring.
Automate database backup workflows.
