# TodoApp

A full-stack web application for managing tasks with secure authentication, built with modern technologies and following best practices.

##  Features

- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Complete CRUD Operations**: Create, read, update, and delete tasks
- **User Isolation**: Each user can only access their own tasks
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Mode**: Toggle between light and dark themes with localStorage persistence
- **Real-time Notifications**: Toast notifications for user feedback
- **Search & Filter**: Find tasks quickly with search and filter functionality
- **Comprehensive Testing**: Jest tests with >70% coverage
- **Modern UI Components**: Skeleton loading, form validation, and smooth animations

##  Tech Stack

### Backend
- **Node.js** (v20 LTS) + **Express.js** (v4)
- **SQLite3** with better-sqlite3 for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Jest** + **Supertest** for testing
- **CORS** for cross-origin requests

### Frontend
- **React** (v19) with **Vite** for fast development
- **Tailwind CSS** (v3) for styling
- **React Router** for navigation
- **Axios** for API calls
- **Lucide React** for icons

##  Project Structure

```
mohamed-todo-exam/
├── server/
│   ├── app.js                 # Express app configuration
│   ├── db.js                  # Database setup and connection
│   ├── package.json           # Server dependencies
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   └── tasks.js          # Task CRUD routes
│   ├── middleware/
│   │   └── requireAuth.js    # JWT authentication middleware
│   └── tests/
│       ├── auth.test.js      # Authentication tests
│       └── tasks.test.js     # Task CRUD tests
├── client/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── AuthCard.jsx
│   │   │   ├── TodoCard.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── contexts/         # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/            # Utility functions
│   │   │   └── api.js        # API client configuration
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # App entry point
│   │   └── style.css         # Global styles with Tailwind
│   ├── package.json          # Client dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   ├── vite.config.js        # Vite configuration
│   └── index.html            # HTML template
├── env.example               # Environment variables template
└── README.md                 # This file
```

##  Quick Start

### Prerequisites
- Node.js (v20 LTS or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mohamed-todo-exam
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cd ../server
   cp ../env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-jwt-key
   CLIENT_URL=http://localhost:5173
   DB_PATH=./database.sqlite
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Open your browser**
   Navigate to http://localhost:5173

##  Testing

### Run Backend Tests
```bash
cd server
npm test
```

### Run Tests with Coverage
```bash
cd server
npm run test:coverage
```

The tests cover:
- User registration and login
- Task CRUD operations
- Authentication middleware
- User isolation (users can only access their own tasks)
- Input validation
- Error handling

##  API Documentation

### Authentication Endpoints

#### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/login
Login user (returns JWT token valid for 15 minutes)
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Task Endpoints

All task endpoints require authentication (Bearer token in Authorization header).

#### GET /tasks
Get all tasks for the authenticated user

#### GET /tasks/:id
Get a specific task by ID

#### POST /tasks
Create a new task
```json
{
  "title": "Task title",
  "description": "Task description (optional)",
  "completed": false
}
```

#### PUT /tasks/:id
Update a task
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

#### DELETE /tasks/:id
Delete a task

##  Design System

### Color Palette
- **Indigo**: Primary actions and branding
- **Emerald**: Success states and completed tasks
- **Slate**: Text and neutral elements

### Responsive Breakpoints
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px - 1440px+

### Dark Mode
- Automatic system preference detection
- Manual toggle with localStorage persistence
- Smooth transitions between themes

##  Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 15-minute expiration
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin setup
- **User Isolation**: Database-level user separation

##  Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Use a production-ready JWT secret
3. Configure proper CORS origins
4. Use a production database (PostgreSQL recommended)

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve the `dist` folder with a web server
3. Configure environment variables for API URL

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request


##  Future Enhancements

- [ ] Task categories and tags
- [ ] Due dates and reminders
- [ ] File attachments
- [ ] Team collaboration
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSocket)
- [ ] Advanced filtering and sorting
- [ ] Export/import functionality
- [ ] Offline support (PWA)

---

#  Security Configuration

## JWT Secret Key

##  Security Features

### **JWT Token Security**
- **Key Length**: 128 characters (512 bits)
- **Generation Method**: Cryptographically secure random bytes
- **Algorithm**: HMAC SHA-256
- **Expiration**: 15 minutes (automatic logout)

### **Password Security**
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Salt**: Unique random salt per password
- **One-way Encryption**: Passwords cannot be reversed

### **Database Security**
- **User Isolation**: Each user can only access their own tasks
- **Foreign Key Constraints**: Data integrity enforcement
- **SQL Injection Protection**: Parameterized queries

##  Important Security Notes

### **For Development**
-  Current JWT secret is secure and randomly generated
-  Passwords are properly hashed with bcrypt
-  All API endpoints are protected with authentication

### **For Production Deployment**
-  **CHANGE JWT_SECRET**: Generate a new secret for production
-  **Use HTTPS**: JWT tokens must be transmitted over secure connections
-  **Environment Variables**: Never commit real secrets to version control
-  **Database**: Consider upgrading to PostgreSQL for production

##  Security Best Practices Implemented

1. **Input Validation**: Server-side validation for all inputs
2. **Error Handling**: Graceful error responses without exposing internals
3. **CORS Configuration**: Proper cross-origin request handling
4. **Token Expiration**: Automatic session timeout
5. **User Isolation**: Database-level user separation
6. **Password Requirements**: Minimum 8 characters enforced

##  How to Generate a New JWT Secret

If you need to generate a new JWT secret for production:

```bash
# Using Node.js crypto module
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64

# Using online generator (less secure)
# Visit: https://generate-secret.vercel.app/64
```

##  Security Checklist

-  Secure JWT secret implemented
-  Password hashing with bcrypt
-  Input validation on all endpoints
-  User authentication middleware
-  User data isolation
-  Token expiration handling
-  Error handling without information leakage
-  CORS properly configured
-  SQL injection protection
-  Comprehensive test coverage (79%)

---



