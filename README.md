# Dayflow - HR Management System

A comprehensive Human Resource Management System (HRMS) with a modern React frontend and robust Node.js backend.

## 🏗️ Project Structure

```
Day-Flow/
├── frontend/           # React + TypeScript frontend
├── src/               # Node.js + Express backend
├── prisma/            # Database schema and migrations
├── .kiro/             # Project specifications and tasks
└── docker-compose.yml # Docker configuration
```

## 🚀 Features

### Frontend (React + TypeScript)
- 🎨 Modern UI with light/dark theme support
- 📱 Responsive design for all devices
- 🔐 Role-based authentication and routing
- 👥 Employee dashboard and management
- ⏰ Attendance tracking with real-time status
- 🏖️ Leave management system
- 💰 Salary information display
- 🧪 Comprehensive testing with Vitest and property-based tests

### Backend (Node.js + Express)
- 🔐 JWT-based authentication and authorization
- 👥 Employee management with role-based access control
- ⏰ Attendance tracking with check-in/check-out functionality
- 🏖️ Leave management system with approval workflows
- 💰 Salary calculation and payroll management
- 📧 Email notifications using Nodemailer
- 🛡️ Security middleware with rate limiting and input validation
- 📊 PostgreSQL database with Prisma ORM
- 🐳 Docker support for easy deployment

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: CSS Modules with CSS Variables
- **HTTP Client**: Axios
- **Testing**: Vitest, React Testing Library, fast-check
- **Code Quality**: ESLint, Prettier, Husky

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer
- **Validation**: Joi
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint, Prettier, Husky

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Backend Setup

1. **Install backend dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the database**
   ```bash
   docker-compose up -d postgres
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 📚 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start the production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔗 API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Authentication (Coming Soon)
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Employee Management (Coming Soon)
- `GET /api/employees` - List employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee details
- `PUT /api/employees/:id` - Update employee
- `GET /api/employees/me` - Get current user profile

### Attendance (Coming Soon)
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out

### Leave Management (Coming Soon)
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Apply for leave
- `PUT /api/leaves/:id/approve` - Approve leave
- `PUT /api/leaves/:id/reject` - Reject leave

### Salary (Coming Soon)
- `GET /api/salary/structure` - Get salary structure
- `PUT /api/salary/structure` - Update salary structure

## 🏗️ Development Guidelines

### Code Quality

Both frontend and backend use ESLint and Prettier for code quality and formatting. Husky is configured to run these checks on commit.

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint testing
- **Property-Based Tests**: Universal correctness properties
- **E2E Tests**: Critical user journey testing

### Git Workflow

1. Create feature branches from `main`
2. Write tests for new features
3. Ensure all tests pass and code is formatted
4. Create pull requests for review

## 🐳 Docker Support

The project includes Docker Compose configuration for:

- PostgreSQL database
- pgAdmin for database management

To start all services:
```bash
docker-compose up -d
```

## 📋 Environment Variables

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_REFRESH_SECRET`: Secret key for refresh token signing
- `SMTP_*`: Email configuration for Nodemailer
- `PORT`: Server port (default: 3000)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Project Status

This project is currently in active development. The frontend infrastructure is complete and ready for feature implementation. The backend infrastructure is also set up with database schema and basic middleware.

### Completed ✅
- Frontend project setup with Vite + React + TypeScript
- Theme system with light/dark mode support
- CSS Variables and responsive design foundation
- TypeScript type definitions
- Testing infrastructure with Vitest and fast-check
- Backend project setup with Express + TypeScript
- Database schema with Prisma ORM
- Authentication middleware and utilities
- Code quality tools (ESLint, Prettier, Husky)

### In Progress 🚧
- Authentication system implementation
- Dashboard components
- API endpoints development
- Integration between frontend and backend

### Planned 📋
- Employee management features
- Attendance tracking system
- Leave management workflows
- Salary calculation system
- Email notifications
- Deployment configuration