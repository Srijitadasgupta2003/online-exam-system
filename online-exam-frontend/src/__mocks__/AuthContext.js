import React from 'react';

const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  const mockValue = {
    user: { id: 1, fullName: 'Test User', email: 'test@test.com', role: 'STUDENT' },
    token: 'mock-jwt-token',
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: true,
    isAdmin: false
  };

  return (
    <AuthContext.Provider value={mockValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export { AuthContext };
