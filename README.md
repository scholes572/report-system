# Leave Management System

A simple web application for managing employee leave requests.

## Features

- User registration and authentication
- JWT-based authorization
- Role-based access (Admin and Employee)
- Leave request creation and management
- Admin approval/rejection of leave requests

## Tech Stack

- **Backend**: Flask, SQLAlchemy, JWT
- **Frontend**: React, Tailwind CSS
- **Database**: SQLite

## Setup

### Backend

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   pip install flask flask-sqlalchemy flask-jwt-extended flask-cors werkzeug
   ```

3. Run the backend:
   ```
   python app.py
   ```
   The backend will run on `http://localhost:5000`.

### Frontend

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   The frontend will run on `http://localhost:3000`.

## Default Admin Account

- Email: admin@company.com
- Password: admin123   


## API Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /leaves` - Get leave requests (filtered by role)
- `POST /leaves` - Create a new leave request
- `PATCH /leaves/<id>/status` - Update leave request status (admin only)