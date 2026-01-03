# Dayflow Backend

A comprehensive HR management API built with Express.js, TypeScript, and Prisma ORM.

## Features

- 🔐 JWT-based authentication and authorization
- 👥 Employee management with role-based access control
- ⏰ Attendance tracking with check-in/check-out functionality
- 🏖️ Leave management system with approval workflows
- 💰 Salary calculation and payroll management
- 📧 Email notifications using Nodemailer
- 🛡️ Security middleware with rate limiting and input validation
- 📊 PostgreSQL database with Prisma ORM
- 🐳 Docker support for easy deployment

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer
- **Validation**: Joi
- **Testing**: Jest with Supertest
- **Code Quality**: ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dayflow-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the database**
   ```bash
   docker-compose up -d postgres
   ```

5. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_REFRESH_SECRET`: Secret key for refresh token signing
- `SMTP_*`: Email configuration for Nodemailer
- `PORT`: Server port (default: 3000)

### Database Setup

The project uses PostgreSQL with Prisma ORM. To set up the database:

1. Start PostgreSQL using Docker Compose:
   ```bash
   docker-compose up -d postgres
   ```

2. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

3. Push the schema to the database:
   ```bash
   npm run db:push
   ```

4. (Optional) Open Prisma Studio to view data:
   ```bash
   npm run db:studio
   ```

## Available Scripts

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

## API Endpoints

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

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── services/        # Business logic services
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── test/           # Test setup and utilities
└── index.ts        # Application entry point
```

## Development Guidelines

### Code Quality

The project uses ESLint and Prettier for code quality and formatting. Husky is configured to run these checks on commit.

### Testing

- Write unit tests for business logic
- Write integration tests for API endpoints
- Use property-based testing for complex algorithms
- Maintain good test coverage

### Git Workflow

1. Create feature branches from `main`
2. Write tests for new features
3. Ensure all tests pass and code is formatted
4. Create pull requests for review

## Docker Support

The project includes Docker Compose configuration for:

- PostgreSQL database
- pgAdmin for database management

To start all services:
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.