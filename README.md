# 🚗 RoadAid — On-Road Emergency Fuel & Vehicle Assistance Platform
 
A full-stack web application for requesting emergency fuel delivery and vehicle repair services.
 
---
 
## Tech Stack
 
- **Frontend**: React.js + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
---
 
## Getting Started
 
### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongod`) OR a MongoDB Atlas URI
---
 
### 1. Clone / Extract the project
 
```
roadaid/
  ├── backend/
  │   ├── server.js
  │   └── package.json
  └── frontend/
      ├── src/
      │   ├── App.jsx
      │   ├── main.jsx
      │   └── index.css
      ├── index.html
      ├── vite.config.js
      └── package.json
```
 
---
 
### 2. Start the Backend
 
```bash
cd backend
npm install
npm start
```
 
Server runs at **http://localhost:5000**
 
Environment variables (optional):
```
MONGO_URI=mongodb://localhost:27017    # default
PORT=5000                              # default
JWT_SECRET=your_secret_key
```
 
---
 
### 3. Start the Frontend
 
```bash
cd frontend
npm install
npm run dev
```
 
App runs at **http://localhost:3000**
 
> The Vite proxy automatically forwards `/api` requests to the backend.
 
---
 
## Demo Credentials
 
| Role     | Email                  | Password  |
|----------|------------------------|-----------|
| Admin    | admin@roadaid.com      | admin123  |
| Provider | john@provider.com      | pass123   |
| Customer | sarah@customer.com     | pass123   |
 
---
 
## API Endpoints
 
| Method | Path             | Auth | Description                         |
|--------|------------------|------|-------------------------------------|
| POST   | /signup          | ✗    | Register a new user                 |
| POST   | /login           | ✗    | Authenticate and receive JWT        |
| POST   | /createRequest   | ✓    | Create a service request (customer) |
| GET    | /requests        | ✓    | List requests (role-filtered)       |
| PUT    | /updateStatus    | ✓    | Update request status               |
| GET    | /users           | ✓    | List all users (admin only)         |
| DELETE | /users/:id       | ✓    | Delete a user (admin only)          |
| GET    | /stats           | ✓    | Platform stats (admin only)         |
 
---
 
## Database Models
 
### User
```json
{
  "name": "string",
  "email": "string",
  "password": "hashed string",
  "role": "customer | provider | admin",
  "createdAt": "Date"
}
```
 
### Request
```json
{
  "type": "fuel | mechanic",
  "description": "string",
  "location": "string",
  "quantity": "string | null",
  "status": "Pending | Accepted | On the Way | Completed",
  "userId": "string",
  "userName": "string",
  "assignedTo": "string | null",
  "assignedName": "string | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
 
---
 
## Features
 
### Customer
- Sign up / log in
- Submit fuel delivery or mechanic requests
- Track request status in real time
- View request history
### Service Provider
- View all pending requests
- Accept a request (status → Accepted)
- Update status: On the Way → Completed
### Admin
- View platform statistics
- Manage all users (view, delete)
- View all service requests
---
 
## Status Flow
 
```
Pending → Accepted → On the Way → Completed
```
 
