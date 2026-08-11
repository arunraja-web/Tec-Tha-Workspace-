import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
