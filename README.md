# School Management System API

A RESTful API for managing schools, classrooms, and students with role-based access control (RBAC).

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication Flow](#authentication-flow)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

- JWT-based authentication
- Role-based access control (Superadmin, School Administrator)
- CRUD operations for Schools, Classrooms, and Students
- Student enrollment and transfer capabilities
- Rate limiting and security headers
- Input validation
- MongoDB data persistence

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Helmet for security headers
- express-rate-limit for rate limiting

## Prerequisites

- Node.js v16+
- MongoDB v5+
- Redis (for caching and cortex)

## Installation

```bash
git clone <repository-url>
cd school-management-api
npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
SERVICE_NAME=school-management-api
ENV=development
USER_PORT=5111

REDIS_URI=redis://127.0.0.1:6379
CORTEX_REDIS=redis://127.0.0.1:6379
CORTEX_PREFIX=school_mgmt
CORTEX_TYPE=school-management-api
OYSTER_REDIS=redis://127.0.0.1:6379
OYSTER_PREFIX=school_mgmt_oyster
CACHE_REDIS=redis://127.0.0.1:6379
CACHE_PREFIX=school_mgmt:ch

MONGO_URI=mongodb://localhost:27017/school-management

LONG_TOKEN_SECRET=your_long_token_secret_key_here
SHORT_TOKEN_SECRET=your_short_token_secret_key_here
NACL_SECRET=your_nacl_secret_key_here
```

## Running the Application

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Documentation

### Swagger UI

Interactive API documentation is available at:
```
http://localhost:5111/api-docs
```

### Base URL

```
http://localhost:5111/api
```

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
```

Request Body:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "superadmin"
}
```

For school_admin role:
```json
{
  "username": "admin_user",
  "email": "admin@school.com",
  "password": "securepassword123",
  "role": "school_admin",
  "schoolId": "school_object_id"
}
```

Response:
```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "superadmin",
      "schoolId": null
    },
    "longToken": "jwt_token"
  }
}
```

#### Login
```
POST /api/auth/login
```

Request Body:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "ok": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "superadmin",
      "schoolId": null
    },
    "longToken": "jwt_token"
  }
}
```

### School Endpoints (Superadmin Only)

All school endpoints require:
- Header: `Authorization: Bearer <token>`

#### Create School
```
POST /api/school/createSchool
```

Request Body:
```json
{
  "name": "Springfield Elementary",
  "address": "123 Main St, Springfield",
  "contactEmail": "info@springfield.edu",
  "contactPhone": "+1234567890"
}
```

#### Get School
```
GET /api/school/getSchool?schoolId=<school_id>
```

#### Get All Schools
```
GET /api/school/getAllSchools
```

#### Update School
```
PUT /api/school/updateSchool
```

Request Body:
```json
{
  "schoolId": "school_object_id",
  "name": "Updated School Name",
  "address": "New Address"
}
```

#### Delete School
```
DELETE /api/school/deleteSchool
```

Request Body:
```json
{
  "schoolId": "school_object_id"
}
```

### Classroom Endpoints (School Admin)

All classroom endpoints require:
- Header: `Authorization: Bearer <token>`

#### Create Classroom
```
POST /api/classroom/createClassroom
```

Request Body:
```json
{
  "name": "Class 1A",
  "capacity": 30,
  "resources": ["projector", "whiteboard"],
  "schoolId": "school_object_id"
}
```

Note: `schoolId` is optional for school_admin (uses their assigned school)

#### Get Classroom
```
GET /api/classroom/getClassroom?classroomId=<classroom_id>
```

#### Get Classrooms
```
GET /api/classroom/getClassrooms?schoolId=<school_id>
```

#### Update Classroom
```
PUT /api/classroom/updateClassroom
```

Request Body:
```json
{
  "classroomId": "classroom_object_id",
  "name": "Class 1B",
  "capacity": 35
}
```

#### Delete Classroom
```
DELETE /api/classroom/deleteClassroom
```

Request Body:
```json
{
  "classroomId": "classroom_object_id"
}
```

### Student Endpoints (School Admin)

All student endpoints require:
- Header: `Authorization: Bearer <token>`

#### Enroll Student
```
POST /api/student/enrollStudent
```

Request Body:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@student.com",
  "schoolId": "school_object_id",
  "classroomId": "classroom_object_id"
}
```

#### Get Student
```
GET /api/student/getStudent?studentId=<student_id>
```

#### Get Students
```
GET /api/student/getStudents?schoolId=<school_id>&classroomId=<classroom_id>
```

#### Update Student
```
PUT /api/student/updateStudent
```

Request Body:
```json
{
  "studentId": "student_object_id",
  "firstName": "Janet",
  "classroomId": "new_classroom_id"
}
```

#### Transfer Student
```
PUT /api/student/transferStudent
```

Request Body:
```json
{
  "studentId": "student_object_id",
  "newSchoolId": "new_school_object_id",
  "newClassroomId": "new_classroom_object_id"
}
```

#### Remove Student
```
DELETE /api/student/removeStudent
```

Request Body:
```json
{
  "studentId": "student_object_id"
}
```

## Database Schema

### Entity Relationship Diagram

```
+------------------+       +------------------+       +------------------+
|      USER        |       |      SCHOOL      |       |    CLASSROOM     |
+------------------+       +------------------+       +------------------+
| _id: ObjectId    |       | _id: ObjectId    |       | _id: ObjectId    |
| email: String    |       | name: String     |       | name: String     |
| password: String |       | address: String  |       | capacity: Number |
| username: String |       | contactEmail:    |       | resources: Array |
| role: String     |       |   String         |       | isActive: Boolean|
| schoolId: ObjectId------>| contactPhone:    |<------| schoolId: ObjectId
| isActive: Boolean|       |   String         |       | createdBy: ObjectId
| createdAt: Date  |       | createdBy:       |       | createdAt: Date  |
| updatedAt: Date  |       |   ObjectId       |       | updatedAt: Date  |
+------------------+       | isActive: Boolean|       +------------------+
        |                  | createdAt: Date  |               |
        |                  | updatedAt: Date  |               |
        |                  +------------------+               |
        |                          |                          |
        |                          |                          |
        |                          v                          |
        |                  +------------------+               |
        |                  |     STUDENT      |               |
        |                  +------------------+               |
        |                  | _id: ObjectId    |               |
        |                  | firstName: String|               |
        |                  | lastName: String |               |
        |                  | email: String    |               |
        +----------------->| schoolId: ObjectId               |
                           | classroomId: ObjectId<-----------+
                           | enrollmentDate:  |
                           |   Date           |
                           | isActive: Boolean|
                           | createdAt: Date  |
                           | updatedAt: Date  |
                           +------------------+

Relationships:
- User (school_admin) --> School: Many-to-One (admin belongs to one school)
- School --> User (superadmin): Many-to-One (created by superadmin)
- Classroom --> School: Many-to-One (classroom belongs to one school)
- Student --> School: Many-to-One (student enrolled in one school)
- Student --> Classroom: Many-to-One (student assigned to one classroom)
```

### User
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| email | String | User email (unique) |
| password | String | Hashed password |
| username | String | Display name |
| role | String | 'superadmin' or 'school_admin' |
| schoolId | ObjectId | Reference to School (for school_admin) |
| isActive | Boolean | Soft delete flag |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Update timestamp |

### School
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | School name |
| address | String | School address |
| contactEmail | String | Contact email |
| contactPhone | String | Contact phone |
| createdBy | ObjectId | Reference to User |
| isActive | Boolean | Soft delete flag |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Update timestamp |

### Classroom
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| name | String | Classroom name |
| schoolId | ObjectId | Reference to School |
| capacity | Number | Maximum students |
| resources | Array | List of resources |
| createdBy | ObjectId | Reference to User |
| isActive | Boolean | Soft delete flag |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Update timestamp |

### Student
| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | Unique identifier |
| firstName | String | First name |
| lastName | String | Last name |
| email | String | Student email (unique) |
| schoolId | ObjectId | Reference to School |
| classroomId | ObjectId | Reference to Classroom |
| enrollmentDate | Date | Enrollment date |
| isActive | Boolean | Soft delete flag |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Update timestamp |

## Authentication Flow

1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns a JWT token (longToken)
3. Client includes token in Authorization header: `Bearer <token>`
4. Server validates token and extracts user info (userId, role, schoolId)
5. Middleware checks role permissions for protected routes

### Role Permissions

| Role | Schools | Classrooms | Students |
|------|---------|------------|----------|
| superadmin | Full CRUD | Full CRUD (all schools) | Full CRUD (all schools) |
| school_admin | Read only | CRUD (own school) | CRUD (own school) |

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "ok": false,
  "message": "Error description"
}
```

Or with validation errors:
```json
{
  "ok": false,
  "errors": ["field1 is required", "field2 is invalid"]
}
```

## Testing

Run tests:
```bash
npm test
```

## Deployment

### Docker Deployment

1. Build the image:
```bash
docker build -t school-management-api .
```

2. Run with docker-compose:
```bash
docker-compose up -d
```

### Manual Deployment

1. Set up MongoDB and Redis on your server
2. Clone the repository
3. Install dependencies: `npm install --production`
4. Set environment variables
5. Start with PM2: `pm2 start app.js --name school-api`

### Cloud Deployment (Render/Railway)

1. Connect your repository
2. Set environment variables in the dashboard
3. Deploy

## Assumptions

1. Soft delete is used for all entities (isActive flag)
2. School administrators can only access their assigned school's resources
3. Superadmins have full access to all resources
4. Student transfers require access to both source and destination schools (or superadmin role)
5. Rate limiting is set to 100 requests per 15 minutes per IP
