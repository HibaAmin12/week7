# Notes API
A production-style CRUD REST API for managing user-owned notes with JWT authentication, role-based authorization, ownership-based access control, SQLAlchemy ORM, PostgreSQL, Alembic migrations, and Dockerized deployment.

The main purpose of this project was to practice backend API development and understand how authentication, authorization, database design, migrations, security, and containerization work together in a real application.

---

## 1. Project Objectives

The main objectives of this project were:

- Build a complete REST API using FastAPI.
- Understand how HTTP methods and API endpoints are designed.
- Implement user registration and login.
- Secure protected endpoints using JWT authentication.
- Implement role-based authorization for different types of users.
- Implement ownership-based access control so users can only access their own notes.
- Design relational database models using SQLAlchemy ORM.
- Use PostgreSQL as the application database.
- Manage database schema changes using Alembic migrations.
- Understand and prevent common database security vulnerabilities such as SQL injection.
- Containerize the API and PostgreSQL database using Docker.
- Use Docker Compose to manage multiple services together.
- Practice a professional Git feature-branch workflow.

---

## 2. Features

- User registration and login
- JWT-based authentication
- Password hashing
- Role-based authorization (`user` / `admin`)
- Ownership-based note access control
- CRUD operations for notes
- Category relationship (One-to-Many)
- PostgreSQL database integration
- SQLAlchemy ORM
- Alembic database migrations
- API versioning using `/api/v1`
- Docker and Docker Compose setup
- Interactive Swagger API documentation

---

## 3. Project Structure

```text
Day4project/
│
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── database.py             # Database connection and SQLAlchemy setup
│   ├── dependencies.py         # Reusable FastAPI dependencies
│   ├── models.py               # SQLAlchemy ORM models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── oauth2.py               # JWT creation and verification
│   ├── utils.py                # Password hashing utilities
│   │
│   └── routers/
│       ├── auth.py             # Registration and login routes
│       ├── notes.py            # Notes CRUD routes
│       ├── categories.py       # Category routes
│       └── admin.py            # Admin-only routes
│
├── alembic/
│   └── versions/               # Database migration files
│
├── Dockerfile                  # API container configuration
├── docker-compose.yml          # FastAPI + PostgreSQL services
├── alembic.ini                 # Alembic configuration
├── requirements.txt            # Python dependencies
├── README.md
└── .env.example                # Example environment configuration
```

---

## 4. Application Architecture

The application follows a layered structure where different files are responsible for different concerns.

```
Client
  |
  ↓
FastAPI Router
  |
  ↓
Dependencies / Authentication
  |
  ↓
Pydantic Schema
  |
  ↓
SQLAlchemy ORM Model
  |
  ↓
PostgreSQL
```

I used this structure because putting authentication, validation, database queries, and routing into one file would make the application difficult to understand and maintain.

Separating responsibilities makes it easier to modify one part of the application without unnecessarily changing unrelated code.

---

## 5. FastAPI Application

`main.py` is the entry point of the FastAPI application.

It creates the FastAPI application instance and includes the different routers.

The application is divided into routers such as:

- `/auth`
- `/notes`
- `/categories`
- `/admin`

### Why I Used Routers

I used separate routers because the API contains different functional areas.

For example, authentication logic belongs to the authentication router, while note CRUD operations belong to the notes router.

If all endpoints were written directly inside `main.py`, the file would become large and difficult to maintain.

Therefore, routers provide a cleaner separation of responsibilities.

---

## 6. REST API Design

The API follows REST-style endpoint design.

### Examples:

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login

POST   /api/v1/notes
GET    /api/v1/notes
GET    /api/v1/notes/{id}
PUT    /api/v1/notes/{id}
DELETE /api/v1/notes/{id}
```

I used HTTP methods according to the operation being performed:

| Method | Purpose |
|--------|---------|
| POST | Create data |
| GET | Retrieve data |
| PUT | Update data |
| DELETE | Delete data |

This makes the API predictable for clients consuming it.

---

## 7. API Versioning

The API uses the following prefix:

```
/api/v1
```

### Examples:

```
/api/v1/notes
```

### Why I Used Versioning

API versioning allows future changes to be introduced without immediately breaking existing clients.

For example, a future version could use:

```
/api/v2/notes
```

while the existing `/api/v1/notes` API continues to work.

An alternative would be to build the API without versioning, but that would make future breaking changes harder to manage.

---

## 8. Database Design

The application uses PostgreSQL as its relational database.

The main models are:

```
User
  |
  | 1
  |
  | *
 Note
  |
  | *
  |
  | 1
Category
```

### User

Stores application users.

Fields include:

- `id`
- `username`
- `hashed_password`
- `role`

### Note

Stores user-created notes.

Fields include:

- `id`
- `title`
- `body`
- `owner_id`
- `category_id`
- `created_at`
- `updated_at`

### Category

Stores note categories.

One category can contain multiple notes.

---

## 9. SQLAlchemy ORM

I used SQLAlchemy ORM to represent database tables as Python classes.

### Conceptually:

```
Python Model
     ↓
SQLAlchemy ORM
     ↓
PostgreSQL Table
```

### Why I Used SQLAlchemy ORM

ORM allows the application to work with database records using Python objects instead of writing raw SQL for every operation.

It also makes relationships between entities easier to represent.

For example:

- User → Notes
- Category → Notes

An alternative would be to write raw SQL queries manually.

Raw SQL can provide direct control over queries, but ORM provides a more structured way to work with application models and relationships.

---

## 10. Database Security and SQL Injection

The application uses SQLAlchemy ORM rather than constructing SQL queries by concatenating user input.

This is important because directly inserting user-controlled values into SQL strings can lead to SQL injection vulnerabilities.

### Example of Unsafe Code:

```python
"SELECT * FROM users WHERE username = '" + username + "'"
```

A malicious input could alter the intended query.

Using parameterized queries through the ORM helps separate data from SQL instructions.

### Why This Matters

Database security is not only about hiding the database. The application must also ensure that user input cannot modify the intended database query.

Therefore, I avoided manually constructing SQL statements from untrusted input.

---

## 11. Pydantic Schemas

I used Pydantic schemas for request validation and response structure.

The schemas define what data the API expects and what data it returns.

### Conceptually:

```
Client Request
      ↓
Pydantic Schema
      ↓
Validation
      ↓
Application Logic
```

### Why I Used Pydantic

I used Pydantic because API input should be validated before it reaches the database or application logic.

For example, the API can validate:

- Required fields
- Data types
- Input structure

An alternative would be to manually validate every field inside each endpoint, but that would duplicate validation logic across the application.

---

## 12. Authentication

The application uses JWT-based authentication.

### Authentication Flow:

```
Register
   ↓
Password Hashing
   ↓
Login
   ↓
Verify Credentials
   ↓
Generate JWT
   ↓
Client Sends Token
   ↓
Protected Endpoint
   ↓
Verify JWT
```

### Why I Used JWT

JWT allows the API to verify the identity of a user through a signed token.

The client sends the token using:

```
Authorization: Bearer <token>
```

The API verifies the token before allowing access to protected resources.

An alternative approach would be session-based authentication, where the server stores session information.

I used JWT because it is commonly used for stateless API authentication and fits well with REST-style backend services.

---

## 13. Password Security

Passwords are not stored directly in the database.

Instead, passwords are hashed before storage.

### Process:

```
Plain Password
      ↓
Hashing
      ↓
Hashed Password
      ↓
Database
```

During login, the submitted password is verified against the stored hash.

### Why I Used Password Hashing

Storing plain-text passwords would be a serious security risk.

If the database were compromised, plain-text passwords would immediately be exposed.

Hashing means the original password is not stored directly.

---

## 14. Role-Based Authorization

The application supports different user roles:

- `user`
- `admin`

Some endpoints are restricted to administrators.

### Example:

```
GET /api/v1/admin/notes
```

requires an admin role.

A non-admin user receives:

```
403 Forbidden
```

### Why I Used Role-Based Authorization

- **Authentication** answers: *Who are you?*
- **Authorization** answers: *What are you allowed to do?*

I implemented both because simply knowing the identity of a user does not mean that user should have access to every operation.

---

## 15. Ownership-Based Access Control

Users should not be able to access another user's private notes.

### Example:

```
User A
  └── Note 1

User B
  └── Note 2
```

User A can access Note 1 but should not be allowed to access Note 2.

If User A attempts to access another user's note, the API returns:

```
404 Not Found
```

### Why I Added Ownership Checks

JWT authentication only tells the application who the current user is.

It does not automatically guarantee that the requested resource belongs to that user.

Therefore, the application explicitly checks ownership before returning, updating, or deleting a note.

This provides an additional authorization layer.

---

## 16. CRUD Operations

The Notes API supports the complete CRUD lifecycle.

```
Create
  ↓
Read
  ↓
Update
  ↓
Delete
```

### Create

```
POST /api/v1/notes
```

Creates a new note for the authenticated user.

### Read

```
GET /api/v1/notes
GET /api/v1/notes/{id}
```

Retrieves the user's notes.

### Update

```
PUT /api/v1/notes/{id}
```

Updates an existing note after checking ownership.

### Delete

```
DELETE /api/v1/notes/{id}
```

Deletes an owned note.

Successful deletion returns:

```
204 No Content
```

---

## 17. Alembic Database Migrations

Alembic is used to manage database schema changes.

Migration files are stored inside:

```
alembic/versions/
```

### Example Migration Workflow:

```
Change SQLAlchemy Model
        ↓
Create Migration
        ↓
Review Migration
        ↓
alembic upgrade head
        ↓
Database Updated
```

### Why I Used Alembic

I used Alembic because database structures change as an application develops.

For example, adding:

```
updated_at
```

to the notes table requires a database schema change.

Instead of manually modifying the database, Alembic records the change as a migration.

This makes schema changes reproducible and version-controlled.

An alternative would be to manually modify database tables, but that approach is difficult to track and reproduce across different environments.

---

## 18. Dockerization

The application is containerized using Docker.

The system contains two main services:

```
┌─────────────────────┐
│   FastAPI Container │
│                     │
│   Notes API         │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ PostgreSQL Container│
│                     │
│    Database         │
└─────────────────────┘
```

### Why I Used Docker

Docker packages the application and its environment into a standardized container.

This reduces differences between development environments.

For example, instead of requiring every developer to manually configure PostgreSQL and all application dependencies, Docker Compose can start the required services together.

---

## 19. Docker Compose

Docker Compose is used to manage the API and PostgreSQL services.

```
docker-compose.yml
        |
        ├── API service
        |
        └── PostgreSQL service
```

### Why I Used Docker Compose

The application depends on more than one service.

Running each service manually would require separate commands and configuration.

Docker Compose allows both services to be defined and started together.

```bash
sudo docker-compose up -d --build
```

---

## 20. Database Configuration Inside Docker

Inside Docker, the PostgreSQL service is accessed using its Compose service name.

### Example:

```
DATABASE_URL=postgresql://postgres:123456@db:5432/notesdb
```

Where:

- `postgres` → database username
- `123456` → database password
- `db` → PostgreSQL service name
- `5432` → PostgreSQL port
- `notesdb` → database name

### Why `db` Instead of `localhost`?

Inside the API container, `localhost` refers to the API container itself.

It does not refer to the PostgreSQL container.

Docker Compose provides an internal network where services can communicate using their service names.

Therefore:

```
API container → db:5432 → PostgreSQL container
```

---

## 21. Environment Variables

Sensitive configuration is stored in environment variables.

### Example:

```
DATABASE_URL=...
SECRET_KEY=...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

The actual `.env` file is not committed to GitHub.

Instead, `.env.example` is provided.

### Why I Used Environment Variables

Secrets such as database passwords and JWT secret keys should not be hard-coded inside source code.

Environment variables allow configuration to change between environments without modifying the application code.

### Example:

```
Development
    ↓
.env

GitHub
    ↓
.env.example
```

---

## 22. Local Setup Without Docker

### Create a virtual environment:

```bash
python3 -m venv venv
```

### Activate it:

```bash
source venv/bin/activate
```

### Install dependencies:

```bash
pip install -r requirements.txt
```

### Configure the required environment variables in `.env`.

Then run the application using Uvicorn:

```bash
uvicorn app.main:app --reload
```

---

## 23. Docker Setup

### Build and start the containers:

```bash
sudo docker-compose up -d --build
```

### Check running containers:

```bash
sudo docker ps
```

The API and PostgreSQL containers should be running.

---

## 24. Database Migration

After the PostgreSQL container is running, migrations need to be applied.

### Enter the API container:

```bash
sudo docker exec -it day4project_api_1 bash
```

### Apply migrations:

```bash
alembic upgrade head
```

### Check the current migration:

```bash
alembic current
```

### View migration history:

```bash
alembic history
```

---

## 25. Run and Test the API

After starting the application, open:

```
http://127.0.0.1:8000/docs
```

FastAPI automatically provides Swagger UI.

The Swagger interface can be used to:

- View available endpoints
- Understand request and response schemas
- Authenticate using JWT
- Send API requests
- Inspect response status codes

---

## 26. API Endpoints

### Authentication

#### Register

```
POST /api/v1/auth/register
```

Creates a new user account.

#### Login

```
POST /api/v1/auth/login
```

Authenticates the user and returns a JWT access token.

### Notes

All protected note endpoints require authentication.

Token format:

```
Authorization: Bearer <token>
```

#### Create Note

```
POST /api/v1/notes
```

Creates a note for the authenticated user.

#### Get My Notes

```
GET /api/v1/notes
```

Returns notes owned by the current user.

#### Get Single Note

```
GET /api/v1/notes/{id}
```

Returns a note only if it belongs to the authenticated user.

#### Update Note

```
PUT /api/v1/notes/{id}
```

Updates an owned note.

#### Delete Note

```
DELETE /api/v1/notes/{id}
```

Deletes an owned note.

Successful deletion returns:

```
204 No Content
```

---

## 27. Admin Endpoint

### View All Notes

```
GET /api/v1/admin/notes
```

This endpoint is restricted to users with:

```
role = admin
```

A non-admin user receives:

```
403 Forbidden
```

This demonstrates the difference between authentication and authorization.

---

## 28. HTTP Status Codes

The API uses meaningful HTTP status codes to communicate the result of operations.

| Status Code | Meaning |
|-------------|---------|
| 200 OK | Successful request |
| 201 Created | Resource successfully created |
| 204 No Content | Resource successfully deleted |
| 401 Unauthorized | Authentication is missing or invalid |
| 403 Forbidden | User is authenticated but does not have permission |
| 404 Not Found | Requested resource does not exist or is not accessible |

Using appropriate status codes makes the API easier for clients to understand and consume.

---

## 29. Git Workflow

Development was completed using a feature-branch workflow.

### Example branch:

```
feature/notes-api
```

The work was developed incrementally and included:

- Database models
- Alembic migrations
- CRUD endpoints
- JWT authentication
- Ownership authorization
- Admin authorization
- PostgreSQL integration
- Docker configuration

### Why I Used a Feature Branch

I used a separate feature branch instead of making all changes directly on main.

This keeps the main branch more stable and allows changes to be reviewed before they are merged.

### Workflow:

```
main
  |
  └── feature/notes-api
          |
          ├── Develop
          ├── Test
          ├── Review
          └── Merge
                  ↓
                main
```