# Dayflow Frontend

A modern React frontend application for the Dayflow Human Resource Management System (HRMS).

## Features

- **Modern Tech Stack**: Built with Vite + React + TypeScript
- **Theme System**: Light/dark mode support with CSS Variables
- **Responsive Design**: Mobile-first approach with CSS Modules
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Testing**: Unit tests with Vitest and property-based testing with fast-check
- **Code Quality**: ESLint, Prettier, and Husky for consistent code style

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── styles/         # Global styles and CSS variables
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── test/           # Test setup and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Scripts

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

## Theme System

The application uses CSS Variables for theming, supporting both light and dark modes:

- **Light Theme**: Default theme with orange brand color (#ff6b35)
- **Dark Theme**: Dark background with consistent brand colors
- **CSS Variables**: Centralized color, spacing, and typography tokens
- **Responsive**: Adapts to different screen sizes

## Testing Strategy

- **Unit Tests**: Component and utility function testing with Vitest
- **Property-Based Tests**: Universal correctness properties with fast-check
- **Integration Tests**: Critical user flow testing
- **Coverage**: Minimum 80% code coverage target

## Code Quality

- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality
- **TypeScript**: Strict type checking enabled

## API Integration

The frontend uses an abstraction layer (`api.ts`) that supports:

- **Mock Implementation**: For development and testing
- **Production API**: Easy switching to real backend
- **Type Safety**: Full TypeScript support for API responses
- **Error Handling**: Consistent error handling across the application

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new functionality
3. Update type definitions as needed
4. Ensure all tests pass before committing

## Architecture

The application follows a component-based architecture with:

- **Context API**: For global state management
- **Custom Hooks**: For reusable logic
- **TypeScript**: For type safety and better developer experience
- **CSS Modules**: For component-scoped styling
- **Vite**: For fast development and optimized builds