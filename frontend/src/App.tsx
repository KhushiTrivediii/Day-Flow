import { ThemeProvider } from './contexts/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Dayflow HRMS</h1>
              <p>Human Resource Management System</p>
            </div>
            <ThemeToggle size="md" showLabel />
          </div>
        </header>
        <main className="app-main">
          <div className="welcome-card">
            <h2>Welcome to Dayflow</h2>
            <p>Your comprehensive HR management solution</p>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Employee Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Attendance Tracking</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✈️</span>
                <span>Leave Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💰</span>
                <span>Salary Management</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
